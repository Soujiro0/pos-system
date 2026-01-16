<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\PriceLog;
use App\Services\ProductService;
use App\Services\PricingService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $productService;

    protected function setUp(): void
    {
        parent::setUp();
        // Manually instantiate dependencies
        $inventoryService = new InventoryService();
        $pricingService = new PricingService($inventoryService);
        $this->productService = new ProductService($pricingService);
    }

    public function test_it_creates_product_with_auto_generated_sku()
    {
        $data = [
            'name' => 'Delicious Apple',
            'price' => 1.50,
            'description' => 'Fresh red apple',
        ];

        $product = $this->productService->createProduct($data);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals('Delicious Apple', $product->name);
        $this->assertNotNull($product->sku);
        $this->assertStringStartsWith('DEL-', $product->sku);
    }

    public function test_it_creates_product_with_custom_sku()
    {
        $data = [
            'name' => 'Banana',
            'sku' => 'BAN-001',
            'price' => 0.80,
        ];

        $product = $this->productService->createProduct($data);

        $this->assertEquals('BAN-001', $product->sku);
    }

    public function test_it_generates_unique_sku()
    {
        $data1 = ['name' => 'Orange', 'price' => 2.00];
        $data2 = ['name' => 'Orange', 'price' => 2.50];

        $product1 = $this->productService->createProduct($data1);
        $product2 = $this->productService->createProduct($data2);

        $this->assertNotEquals($product1->sku, $product2->sku);
        $this->assertStringStartsWith('ORA-', $product1->sku);
        $this->assertStringStartsWith('ORA-', $product2->sku);
    }

    public function test_it_updates_product()
    {
        $product = Product::factory()->create([
            'name' => 'Old Name', 
            'price' => 10.00
        ]);

        $updatedProduct = $this->productService->updateProduct($product, [
            'name' => 'New Name',
            'price' => 12.00
        ]);

        $this->assertEquals('New Name', $updatedProduct->name);
        $this->assertEquals(12.00, $updatedProduct->price);
    }

    public function test_it_logs_price_change_on_update()
    {
        $product = Product::factory()->create(['price' => 100]);
        // Initial log from create? No, factory creates directly. 
        // Service create logs it. But here we use factory.
        // So let's update via Service.

        $this->productService->updateProduct($product, ['price' => 150]);

        // Check Product Table
        $this->assertEquals(150, $product->fresh()->price);

        // Check Price Log
        $log = PriceLog::where('product_id', $product->id)->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals(100, $log->old_amount); // Note: PricingService::getPrice logic reads from Price table or fallback. Factory logic might not set Price table. 
        // Wait, PricingService::getPrice falls back to Product price.
        // So old_amount should be 100.
        $this->assertEquals(150, $log->new_amount);
        $this->assertEquals('Product Update', $log->reason);
    }
}
