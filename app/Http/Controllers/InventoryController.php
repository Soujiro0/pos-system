<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get inventory details for a product.
     */
    public function show(int $productId): JsonResponse
    {
        $inventory = $this->inventoryService->getInventory($productId);
        return response()->json($inventory);
    }

    /**
     * Add stock to a product.
     */
    public function add(Request $request, int $productId): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->addStock(
            $productId,
            $request->input('quantity'),
            $request->input('reason'),
            // $request->user()->id // Assuming auth is set up, otherwise null
        );

        return response()->json($inventory);
    }

    /**
     * Remove stock from a product.
     */
    public function remove(Request $request, int $productId): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
        ]);

        try {
            $inventory = $this->inventoryService->removeStock(
                $productId,
                $request->input('quantity'),
                $request->input('reason'),
                // $request->user()->id
            );
            return response()->json($inventory);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Adjust stock.
     */
    public function adjust(Request $request, int $productId): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:0', // New absolute quantity
            'reason' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->adjustStock(
            $productId,
            $request->input('quantity'),
            $request->input('reason'),
            // $request->user()->id
        );

        return response()->json($inventory);
    }
}
