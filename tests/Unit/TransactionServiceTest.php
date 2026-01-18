<?php

namespace Tests\Unit;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\InventoryService;
use App\Services\TransactionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class TransactionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $transactionService;
    protected $inventoryServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Use real InventoryService for integration-like test, or mock for strict unit test?
        // Let's use real service to test actual DB rollback, but we can verify removeStock call.
        // Actually, to test Atomic Rollback, rely on real DB Transaction.
        
        // We will use the REAL InventoryService for this test to ensure DB interactions work under transaction.
        // But if we want to force a failure, we can mock it or just create a condition that fails.
        // Let's use the real one first.
        $this->transactionService = new TransactionService(new InventoryService());
    }

    public function test_create_transaction_success()
    {
        $product = Product::factory()->create(['price' => 100]);
        // Add stock
        (new InventoryService())->addStock($product->id, 10, 'Initial');

        $data = [
            'total_amount' => 200,
            'amount_tendered' => 200,
            'change' => 0,
            'payment_method' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => 100,
                    'quantity' => 2,
                    'subtotal' => 200,
                ]
            ]
        ];

        $transaction = $this->transactionService->createTransaction($data);

        $this->assertDatabaseHas('tbl_transactions', ['id' => $transaction->id]);
        $this->assertDatabaseHas('tbl_transaction_items', ['transaction_id' => $transaction->id, 'product_id' => $product->id]);
        
        // Verify stock deducted
        $this->assertDatabaseHas('tbl_inventories', ['product_id' => $product->id, 'quantity' => 8]);
    }

    public function test_transaction_rolls_back_on_insufficient_stock()
    {
        $product = Product::factory()->create(['price' => 100]);
        (new InventoryService())->addStock($product->id, 1, 'Initial'); // Only 1 in stock

        $data = [
            'total_amount' => 200,
            'amount_tendered' => 200,
            'change' => 0,
            'payment_method' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => 100,
                    'quantity' => 2, // Creating order for 2
                    'subtotal' => 200,
                ]
            ]
        ];

        try {
            $this->transactionService->createTransaction($data);
            $this->fail('Expected exception was not thrown.');
        } catch (\Exception $e) {
            $this->assertStringContainsString('Insufficient stock', $e->getMessage());
        }

        // Verify NO transaction created
        $this->assertEquals(0, Transaction::count());
        $this->assertEquals(0, \App\Models\TransactionItem::count());
        
        // Verify stock unchanged
        $this->assertDatabaseHas('tbl_inventories', ['product_id' => $product->id, 'quantity' => 1]);
    }
}
