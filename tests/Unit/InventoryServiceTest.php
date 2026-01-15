<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Product;
use App\Services\InventoryService;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InventoryService $inventoryService;
    protected ProductService $productService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->inventoryService = new InventoryService();
        $this->productService = new ProductService();
    }

    public function test_it_creates_inventory_on_product_creation()
    {
        $data = [
            'name' => 'Test Product',
            'price' => 10,
        ];

        $product = $this->productService->createProduct($data);

        $this->assertDatabaseHas('tbl_inventories', [
            'product_id' => $product->id,
            'quantity' => 0,
        ]);
    }

    public function test_it_can_add_stock()
    {
        $product = $this->productService->createProduct(['name' => 'Item', 'price' => 10]);

        $this->inventoryService->addStock($product->id, 50, 'Initial Stock');

        $this->assertDatabaseHas('tbl_inventories', [
            'product_id' => $product->id,
            'quantity' => 50,
        ]);

        $this->assertDatabaseHas('tbl_inventory_transactions', [
            'type' => 'in',
            'quantity' => 50,
            'reason' => 'Initial Stock',
        ]);
    }

    public function test_it_can_remove_stock()
    {
        $product = $this->productService->createProduct(['name' => 'Item', 'price' => 10]);
        $this->inventoryService->addStock($product->id, 50);

        $this->inventoryService->removeStock($product->id, 20, 'Sale');

        $this->assertDatabaseHas('tbl_inventories', [
            'product_id' => $product->id,
            'quantity' => 30,
        ]);

        $this->assertDatabaseHas('tbl_inventory_transactions', [
            'type' => 'out',
            'quantity' => 20,
            'reason' => 'Sale',
        ]);
    }

    public function test_it_prevents_removing_more_than_available_stock()
    {
        $product = $this->productService->createProduct(['name' => 'Item', 'price' => 10]);
        $this->inventoryService->addStock($product->id, 10);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Insufficient stock');

        $this->inventoryService->removeStock($product->id, 15);
    }

    public function test_it_can_adjust_stock()
    {
        $product = $this->productService->createProduct(['name' => 'Item', 'price' => 10]);
        $this->inventoryService->addStock($product->id, 50);

        $this->inventoryService->adjustStock($product->id, 45, 'Correction'); // -5

        $this->assertDatabaseHas('tbl_inventories', [
            'product_id' => $product->id,
            'quantity' => 45,
        ]);

        $this->assertDatabaseHas('tbl_inventory_transactions', [
            'type' => 'adjustment',
            'quantity' => 5, // diff
            'reason' => 'Correction',
        ]);
    }
}
