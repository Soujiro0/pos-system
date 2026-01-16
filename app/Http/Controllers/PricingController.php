<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PricingController extends Controller
{
    protected PricingService $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:tbl_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_code' => 'nullable|string',
        ]);

        $result = $this->pricingService->calculateCart(
            $request->input('items'),
            $request->input('discount_code')
        );

        return response()->json($result);
    }

    public function updatePrice(Request $request, int $productId): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $product = Product::findOrFail($productId);
        
        $price = $this->pricingService->updatePrice(
            $product, 
            $request->input('amount'),
            'Manual Update',
            auth()->id()
        );

        return response()->json([
            'message' => 'Price updated successfully',
            'new_price' => $price->amount,
        ]);
    }

    public function reserve(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:tbl_products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);
        
        $cartId = (string) Str::uuid();
        
        $this->pricingService->reserveItems($cartId, $request->input('items'));
        
        return response()->json([
            'message' => 'Items reserved',
            'cart_id' => $cartId,
            'expires_at' => now()->addMinutes(15),
        ]);
    }
    // --- Tax Rates ---
    public function indexTaxes(): JsonResponse
    {
        return response()->json(\App\Models\TaxRate::all());
    }

    public function storeTax(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0',
            'type' => 'required|in:inclusive,exclusive',
            'category' => 'nullable|string',
        ]);

        $tax = \App\Models\TaxRate::create($validated + ['is_active' => true]);
        return response()->json($tax, 201);
    }

    // --- Discounts ---
    public function indexDiscounts(): JsonResponse
    {
        return response()->json(\App\Models\Discount::all());
    }

    public function storeDiscount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'nullable|string|unique:tbl_discounts,code',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_quantity' => 'required|integer|min:0',
            'priority' => 'required|integer|min:0',
            'is_stackable' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $discount = \App\Models\Discount::create($validated + ['is_active' => true]);
        return response()->json($discount, 201);
    }

    // --- Logs ---
    public function indexLogs(): JsonResponse
    {
        // Eager load product to show name
        $logs = \App\Models\PriceLog::with('product')
            ->orderByDesc('created_at')
            ->paginate(20);
            
        return response()->json($logs);
    }
}
