<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Create a new product.
     *
     * @param array $data
     * @return Product
     */
    public function createProduct(array $data): Product
    {
        if (empty($data['sku'])) {
            $data['sku'] = $this->generateSku($data['name']);
        }

        $product = Product::create($data);

        // Initialize inventory
        \App\Models\Inventory::create([
            'product_id' => $product->id,
        ]);

        return $product;
    }

    /**
     * Update an existing product.
     *
     * @param Product $product
     * @param array $data
     * @return Product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    /**
     * Delete a product.
     *
     * @param Product $product
     * @return bool
     */
    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * Generate a unique SKU based on the product name.
     *
     * @param string $name
     * @return string
     */
    protected function generateSku(string $name): string
    {
        $slug = Str::slug($name);
        $sku = strtoupper(substr($slug, 0, 3) . '-' . Str::random(6));
        
        // Ensure SKU is unique
        while (Product::where('sku', $sku)->exists()) {
            $sku = strtoupper(substr($slug, 0, 3) . '-' . Str::random(6));
        }

        return $sku;
    }
}
