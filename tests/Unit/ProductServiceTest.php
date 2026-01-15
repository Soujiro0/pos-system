<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $productService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->productService = new ProductService();
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
}
