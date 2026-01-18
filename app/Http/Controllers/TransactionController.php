<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * Process a checkout transaction.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:tbl_products,id',
            'items.*.product_name' => 'required|string',
            'items.*.sku' => 'nullable|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.subtotal' => 'required|numeric|min:0',
            
            'total_amount' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'amount_tendered' => 'required|numeric|min:0',
            'change' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,digital_wallet',
        ]);

        // Additional validation: Tendered amount >= Total (unless partial payment logic exists, but let's be strict for now or allow negative change? No, change >= 0)
        if ($validated['amount_tendered'] < $validated['total_amount']) {
             return response()->json(['message' => 'Insufficient payment amount.'], 422);
        }

        try {
            $transaction = $this->transactionService->createTransaction($validated, $request->user()?->id);
            return response()->json($transaction->load('items'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Get transaction details (Receipt).
     */
    public function show(string $id): JsonResponse
    {
        $transaction = Transaction::with(['items', 'items.product'])->findOrFail($id);
        return response()->json($transaction);
    }
}
