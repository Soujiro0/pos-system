<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Discount;
use App\Models\Price;
use App\Models\Product;
use App\Models\TaxRate;
use App\Models\Inventory;
use App\Services\PricingService;
use App\Services\ProductService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PricingService $pricingService;
    protected ProductService $productService;
    protected InventoryService $inventoryService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->inventoryService = new InventoryService();
        $this->pricingService = new PricingService($this->inventoryService);
        $this->productService = new ProductService();
    }

    public function test_it_calculates_exclusive_tax()
    {
        TaxRate::create(['name' => 'VAT', 'percentage' => 12, 'type' => 'exclusive', 'is_active' => true]);
        $product = $this->productService->createProduct(['name' => 'P1', 'price' => 100]);

        $result = $this->pricingService->calculateCart([
            ['id' => $product->id, 'quantity' => 1]
        ]);

        $this->assertEquals(100, $result['subtotal']);
        $this->assertEquals(12, $result['tax_total']);
        $this->assertEquals(112, $result['grand_total']);
    }

    public function test_it_calculates_inclusive_tax()
    {
        TaxRate::create(['name' => 'Inc', 'percentage' => 10, 'type' => 'inclusive', 'is_active' => true]);
        $product = $this->productService->createProduct(['name' => 'P1', 'price' => 110]);

        // Price 110 Inclusive.
        // Base = 110 / 1.1 = 100.
        // Tax = 10.
        // Grand Total = 110. (Because tax is inside).

        $result = $this->pricingService->calculateCart([
            ['id' => $product->id, 'quantity' => 1]
        ]);

        $this->assertEquals(110, $result['subtotal']);
        $this->assertEquals(10, $result['tax_total']);
        $this->assertEquals(110, $result['grand_total']);
    }

    public function test_it_applies_bulk_discount()
    {
        // Bulk: 50 off if qty >= 5
        Discount::create(['type' => 'fixed', 'value' => 50, 'min_quantity' => 5, 'is_active' => true]);
        $product = $this->productService->createProduct(['name' => 'P1', 'price' => 100]);

        // Case 1: Qty 4 (No Discount)
        $result = $this->pricingService->calculateCart([
             ['id' => $product->id, 'quantity' => 4]
        ]);
        $this->assertEquals(400, $result['grand_total']);

        // Case 2: Qty 5 (Discount Applied)
        $result = $this->pricingService->calculateCart([
             ['id' => $product->id, 'quantity' => 5]
        ]);
        // 500 - 50 = 450
        $this->assertEquals(450, $result['grand_total']);
    }

    public function test_it_stacks_discounts_by_priority()
    {
        // 1. Coupon (Priority 10) - 10%
        Discount::create(['code' => 'CODE10', 'type' => 'percent', 'value' => 10, 'priority' => 10, 'is_stackable' => true, 'is_active' => true]);
        // 2. Bulk (Priority 5) - Fixed 20
        Discount::create(['type' => 'fixed', 'value' => 20, 'min_quantity' => 0, 'priority' => 5, 'is_stackable' => true, 'is_active' => true]);
        
        $product = $this->productService->createProduct(['name' => 'P1', 'price' => 200]);

        // Without Code (Only Bulk)
        // 200 - 20 = 180
        $result = $this->pricingService->calculateCart([['id' => $product->id, 'quantity' => 1]]);
        $this->assertEquals(180, $result['grand_total']);

        // With Code
        // Priority 10 (Code) runs first: 200 * 10% = 20. Remaining: 180.
        // Priority 5 (Bulk) runs next: 20 fixed. Remaining: 160.
        $result = $this->pricingService->calculateCart([['id' => $product->id, 'quantity' => 1]], 'CODE10');
        
        $this->assertEquals(200, $result['subtotal']);
        // Total Discount: 20 + 20 = 40
        $this->assertEquals(40, $result['discount_total']);
        $this->assertEquals(160, $result['grand_total']);
    }
    
    public function test_it_warns_low_stock()
    {
        $product = $this->productService->createProduct(['name' => 'P1', 'price' => 100]);
        // Stock defaults to 0 from Seeder/Creation usually, let's explicit adjust
        $this->inventoryService->adjustStock($product->id, 5, 'Set Stock');
        
        // Request 6
        $result = $this->pricingService->calculateCart([['id' => $product->id, 'quantity' => 6]]);
        
        $this->assertNotEmpty($result['inventory_warnings']);
        $this->assertStringContainsString('Low stock', $result['inventory_warnings'][0]);
    }
}
