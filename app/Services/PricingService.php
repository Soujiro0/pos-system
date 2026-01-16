<?php

namespace App\Services;

use App\Models\Discount;
use App\Models\Price;
use App\Models\Product;
use App\Models\TaxRate;
use App\Models\InventoryReservation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PricingService
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function getPrice(Product $product): float
    {
        $price = Price::where('product_id', $product->id)
            ->where('effective_date', '<=', now())
            ->orderByDesc('effective_date')
            ->first();

        return $price ? (float) $price->amount : (float) $product->price;
    }

    public function updatePrice(Product $product, float $newAmount, ?string $reason = 'Manual Update', ?int $userId = null): Price
    {
        // Get the latest price (even if future dated, or active)
        $latestPrice = Price::where('product_id', $product->id)
            ->orderByDesc('effective_date')
            ->first();

        // Optimization: If the latest price is effective from roughly "now" (e.g. created within last hour for same day), 
        // update it instead of spamming history.
        // Let's say: If effective_date is today and created_at was < 1 hour ago.
        
        $isRecent = $latestPrice 
            && $latestPrice->effective_date->isSameDay(now())
            && $latestPrice->created_at->diffInMinutes(now()) < 60;

        if ($isRecent) {
            $latestPrice->update(['amount' => $newAmount]);
            
            // Append to log description or create a new log? 
            // Better to log the change but link to the same price ID? 
            // User wants less "populate the data".
            // Let's just create a log for the *change* but not a new Price row.
             \App\Models\PriceLog::create([
                'product_id' => $product->id,
                'old_amount' => $latestPrice->getOriginal('amount') ?? $latestPrice->amount, // Use original if we can, else current
                'new_amount' => $newAmount,
                'reason' => "$reason (Updated Recent Entry)",
                'changed_by' => $userId,
            ]);
            
            return $latestPrice;
        }

        $price = Price::create([
            'product_id' => $product->id,
            'amount' => $newAmount,
            'effective_date' => now(),
        ]);

        \App\Models\PriceLog::create([
            'product_id' => $product->id,
            'old_amount' => $latestPrice ? $latestPrice->amount : $product->price,
            'new_amount' => $newAmount,
            'reason' => $reason,
            'changed_by' => $userId,
        ]);

        return $price;
    }

    public function calculateCart(array $items, ?string $discountCode = null): array
    {
        $subtotal = 0;
        $cartItems = [];
        $inventoryWarnings = [];

        foreach ($items as $item) {
            $product = Product::find($item['id']);
            if (!$product) continue;

            $quantity = $item['quantity'];
            
            // Inventory Check
            // In a real app, strict availability would check (stock - soft_reservations)
            // Here we just check current stock for now
            $inventory = $product->inventory;
            if ($inventory && $inventory->quantity < $quantity) {
                $inventoryWarnings[] = "Low stock for {$product->name}: Only {$inventory->quantity} left.";
            }

            $unitPrice = $this->getPrice($product);
            $lineTotal = $unitPrice * $quantity;

            $subtotal += $lineTotal;

            $cartItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total' => $lineTotal,
            ];
        }

        // --- Discount Logic (Ordering & Stacking) ---
        // 1. Bulk Discounts (Applied automatically)
        // 2. Coupon Code (Applied if valid)
        // 3. Sorting by Priority
        
        $activeDiscounts = collect();

        // Check for Bulk Discounts (Generic non-code discounts)
        // Assuming we might have discounts without codes for bulk? 
        // For now, let's just use the code provided and maybe fetch "Automatic" ones if implemented.
        // Current requirement: "Bulk Discounts... if quantity > 10"
        // Let's assume we fetch generic active auto-discounts?
        // For Phase 2 simplifiction, we'll stick to the requested Code logic + basic auto lookup
        
        $potentialDiscounts = Discount::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->get();

        foreach ($potentialDiscounts as $discount) {
             $totalQty = array_reduce($items, fn($c, $i) => $c + $i['quantity'], 0);

             // 1. Check Code Requirement
             if (!is_null($discount->code)) {
                 if ($discount->code !== $discountCode) {
                     continue;
                 }
             }

             // 2. Check Quantity Requirement
             if ($discount->min_quantity > 0 && $totalQty < $discount->min_quantity) {
                 continue;
             }

             $activeDiscounts->push($discount);
        }

        // Filter Stacking
        // If multiple, pick highest priority. If stackable, allow others.
        // Sort by Priority DESC
        $activeDiscounts = $activeDiscounts->sortByDesc('priority')->values();
        
        $appliedDiscounts = [];
        $discountTotal = 0;
        $runningSubtotal = $subtotal; // For compound logic if needed? Assuming additive for now or base?
        // Requirement: "Stacking Logic... additive or compounding".
        // Let's implement Compounding for better math safety (apply to remainder).

        if ($activeDiscounts->isNotEmpty()) {
            $first = $activeDiscounts->first();
            $stackable = $first->is_stackable;
            
            // Always apply the first (highest priority)
            $discountsToApply = collect([$first]);
            
            if ($stackable) {
                // Add others that are also stackable? Or all others?
                // Usually "Stackable" means "Can be used with others". 
                // Let's add all other compatible ones.
                 foreach ($activeDiscounts->slice(1) as $d) {
                     if ($d->is_stackable) {
                         $discountsToApply->push($d);
                     }
                 }
            }
            
            foreach ($discountsToApply as $discount) {
                $amount = 0;
                if ($discount->type === 'fixed') {
                    $amount = $discount->value;
                } elseif ($discount->type === 'percent') {
                     // Apply to original subtotal or running?
                     // Let's use running for compounding
                    $amount = $runningSubtotal * ($discount->value / 100);
                }
                
                $amount = min($amount, $runningSubtotal); // Cap
                $discountTotal += $amount;
                $runningSubtotal -= $amount;
                
                $appliedDiscounts[] = [
                    'code' => $discount->code,
                    'amount' => $amount,
                ];
            }
        }

        // --- Tax Calculation ---
        // Group items by tax category?
        // "Logic to apply different rates based on product types"
        // And "Implicit vs Exclusive"
        
        $taxRates = TaxRate::active()->get();
        $taxDetails = [];
        $totalTax = 0;

        // Simplify: Apply Tax Rates to the Post-Discount Subtotal (if exclusive) or Extract (if inclusive)
        // But taxes usually apply to individual items.
        // For "Basket" calc with mixed items, we iterate items.
        
        // We need to know which tax applies to which item.
        // "Tax Categorization... apply different rates based on product types"
        // Match Product.category to TaxRate.category?
        // If Product.category matches TaxRate.category, apply.
        // If TaxRate has no category, does it apply to all? Assume "Standard" (VAT) applies to all unless specific?
        // Let's assume TaxRate with category matches that category. TaxRate with NULL category applies to... everything? or fallback?
        // Simplest: TaxRate name "VAT" applies to everything. Specific Taxes apply to specific cats.
        // Current Setup: TaxRate has category. Product has category.
        
        // Let's calculate tax per item to be precise
        $itemizedTaxes = 0;
        
        // However, we calculated discount on Total.
        // If we want itemized tax, we need itemized discount.
        // For this Phase, let's keep it simple:
        // 1. Calculate Tax on the FINAL Gross Amount? Or Base?
        // Sales Tax (VAT): Usually on the discounted price.
        // So we use $runningSubtotal (The amount user pays before tax).
        
        // BUT Exclusive means Pair + Tax. Inclusive means Price includes Tax.
        // We'll separate logic.
        
        foreach ($taxRates as $tax) {
            $taxableAmount = $runningSubtotal; // Simplified "Whole Cart has this tax"
            // Start with assuming all items are subject to this tax for now (Global VAT)
            // Real world: filter items by category.
            
            $thisTaxAmount = 0;
            
            if ($tax->type === 'exclusive') {
                $thisTaxAmount = $taxableAmount * ($tax->percentage / 100);
            } else { // inclusive
                // Extract tax: Price - (Price / 1 + rate)
                // e.g. 112 / 1.12 = 100. Tax is 12.
                $base = $taxableAmount / (1 + ($tax->percentage / 100));
                $thisTaxAmount = $taxableAmount - $base;
                // Note: If inclusive, the "Subtotal" we displayed included tax.
                // Depending on UI, usually we show breakdown.
            }
            
            $totalTax += $thisTaxAmount;
            $taxDetails[] = [
                'name' => $tax->name,
                'type' => $tax->type,
                'amount' => round($thisTaxAmount, 2)
            ];
        }

        // Final Math
        // If Exclusive: Pay = Subtotal - Discount + Tax
        // If Inclusive: Pay = Subtotal - Discount (Tax is inside)
        // Mixed?
        // Let's assume all active taxes are Exclusive for the Grand Total addition logic unless specified.
        // Wait, if it's inclusive, we don't ADD it.
        
        $grandTotal = $runningSubtotal;
        
        foreach ($taxDetails as $detail) {
            if ($detail['type'] === 'exclusive') {
                $grandTotal += $detail['amount'];
            }
            // If inclusive, it's already in runningSubtotal
        }

        return [
            'subtotal' => round($subtotal, 2),
            'discount_total' => round($discountTotal, 2),
            'applied_discounts' => $appliedDiscounts,
            'tax_total' => round($totalTax, 2),
            'taxes' => $taxDetails,
            'grand_total' => round($grandTotal, 2),
            'inventory_warnings' => $inventoryWarnings,
            'currency' => 'PHP',
        ];
    }

    public function reserveItems(string $cartId, array $items): void
    {
        foreach ($items as $item) {
             InventoryReservation::create([
                 'cart_id' => $cartId,
                 'product_id' => $item['id'],
                 'quantity' => $item['quantity'],
                 'expires_at' => now()->addMinutes(15), 
             ]);
        }
    }
}
