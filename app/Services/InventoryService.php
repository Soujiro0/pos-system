<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Add stock to a product.
     */
    public function addStock(int $productId, int $quantity, ?string $reason = null, ?int $userId = null): Inventory
    {
        return DB::transaction(function () use ($productId, $quantity, $reason, $userId) {
            $inventory = Inventory::firstOrCreate(['product_id' => $productId]);

            $inventory->increment('quantity', $quantity);

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'type' => 'in',
                'quantity' => $quantity,
                'reason' => $reason ?? 'Stock In',
                'user_id' => $userId,
            ]);

            return $inventory->fresh();
        });
    }

    /**
     * Remove stock from a product.
     */
    public function removeStock(int $productId, int $quantity, ?string $reason = null, ?int $userId = null): Inventory
    {
        return DB::transaction(function () use ($productId, $quantity, $reason, $userId) {
            $inventory = Inventory::where('product_id', $productId)->lockForUpdate()->firstOrFail();

            if ($inventory->quantity < $quantity) {
                throw new Exception("Insufficient stock. Available: {$inventory->quantity}");
            }

            $inventory->decrement('quantity', $quantity);

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'type' => 'out',
                'quantity' => $quantity,
                'reason' => $reason ?? 'Stock Out',
                'user_id' => $userId,
            ]);

            return $inventory->fresh();
        });
    }

    /**
     * Adjust stock to a specific value.
     */
    public function adjustStock(int $productId, int $newQuantity, ?string $reason = null, ?int $userId = null): Inventory
    {
        return DB::transaction(function () use ($productId, $newQuantity, $reason, $userId) {
            $inventory = Inventory::firstOrCreate(['product_id' => $productId]);
            
            $currentQuantity = $inventory->quantity;
            $diff = $newQuantity - $currentQuantity;

            if ($diff === 0) {
                return $inventory;
            }

            $inventory->update(['quantity' => $newQuantity]);

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'type' => 'adjustment',
                'quantity' => abs($diff),
                'reason' => $reason ?? 'Manual Adjustment',
                'user_id' => $userId,
            ]);

            return $inventory->fresh();
        });
    }

    /**
     * Get inventory with low stock status.
     */
    public function getInventory(int $productId): array
    {
        $inventory = Inventory::firstOrCreate(['product_id' => $productId]);
        
        return [
            'quantity' => $inventory->quantity,
            'low_stock_threshold' => $inventory->low_stock_threshold,
            'is_low_stock' => $inventory->quantity <= $inventory->low_stock_threshold,
            'transactions' => $inventory->transactions()->latest()->take(10)->get(),
        ];
    }
}
