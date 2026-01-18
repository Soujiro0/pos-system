<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\InventoryService;
use Exception;

class TransactionService
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Create a new transaction (Checkout).
     */
    public function createTransaction(array $data, ?int $userId = null): Transaction
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Generate ID
            $transactionId = $this->generateTransactionId();

            // 2. Prepare Transaction Record
            $transaction = Transaction::create([
                'id' => $transactionId,
                'user_id' => $userId,
                'total_amount' => $data['total_amount'],
                'tax_amount' => $data['tax_amount'] ?? 0,
                'discount_amount' => $data['discount_amount'] ?? 0,
                'amount_tendered' => $data['amount_tendered'],
                'change' => $data['change'],
                'payment_method' => $data['payment_method'],
                'payment_status' => 'completed', // Assuming immediate payment for POS
            ]);

            // 3. Process Items & Deduct Stock
            foreach ($data['items'] as $item) {
                // Deduct stock (will throw exception if insufficient)
                $this->inventoryService->removeStock(
                    $item['product_id'],
                    $item['quantity'],
                    "Sale: $transactionId",
                    $userId
                );

                // Create Item Record
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'], // Snapshot
                    'sku' => $item['sku'] ?? null,
                    'price' => $item['price'], // Snapshot
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            return $transaction;
        });
    }

    private function generateTransactionId(): string
    {
        // Format: TRX-YYYY-TIMESTAMP-RANDOM
        // Example: TRX-2026-1736123456-A1B2
        return 'TRX-' . date('Y') . '-' . time() . '-' . strtoupper(Str::random(4));
    }
}
