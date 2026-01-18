<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Inventory;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        // Product templates for each category
        $productTemplates = [
            'beverages' => [
                ['name' => 'Coca Cola 1.5L', 'price' => 85.00, 'cost' => 60.00],
                ['name' => 'Pepsi 1.5L', 'price' => 85.00, 'cost' => 60.00],
                ['name' => 'Mountain Dew 1.5L', 'price' => 85.00, 'cost' => 60.00],
                ['name' => 'Sprite 1.5L', 'price' => 85.00, 'cost' => 60.00],
                ['name' => 'Royal 1.5L', 'price' => 80.00, 'cost' => 55.00],
                ['name' => 'Bottled Water 500ml', 'price' => 20.00, 'cost' => 12.00],
                ['name' => 'Iced Tea 500ml', 'price' => 35.00, 'cost' => 22.00],
                ['name' => 'Energy Drink 250ml', 'price' => 65.00, 'cost' => 45.00],
                ['name' => 'Orange Juice 1L', 'price' => 120.00, 'cost' => 85.00],
                ['name' => 'Coffee Latte 250ml', 'price' => 95.00, 'cost' => 65.00],
            ],
            'snacks' => [
                ['name' => 'Potato Chips BBQ', 'price' => 55.00, 'cost' => 35.00],
                ['name' => 'Potato Chips Sour Cream', 'price' => 55.00, 'cost' => 35.00],
                ['name' => 'Corn Chips', 'price' => 45.00, 'cost' => 28.00],
                ['name' => 'Chocolate Bar', 'price' => 40.00, 'cost' => 25.00],
                ['name' => 'Cookies Pack', 'price' => 65.00, 'cost' => 42.00],
                ['name' => 'Crackers', 'price' => 50.00, 'cost' => 32.00],
                ['name' => 'Peanuts 100g', 'price' => 35.00, 'cost' => 22.00],
                ['name' => 'Popcorn', 'price' => 45.00, 'cost' => 28.00],
                ['name' => 'Candy Pack', 'price' => 30.00, 'cost' => 18.00],
                ['name' => 'Granola Bar', 'price' => 55.00, 'cost' => 35.00],
            ],
            'electronics' => [
                ['name' => 'USB Cable Type-C', 'price' => 250.00, 'cost' => 150.00],
                ['name' => 'Phone Charger 20W', 'price' => 450.00, 'cost' => 280.00],
                ['name' => 'Earphones Wired', 'price' => 350.00, 'cost' => 220.00],
                ['name' => 'Power Bank 10000mAh', 'price' => 850.00, 'cost' => 550.00],
                ['name' => 'Phone Case', 'price' => 200.00, 'cost' => 120.00],
                ['name' => 'Screen Protector', 'price' => 150.00, 'cost' => 90.00],
                ['name' => 'Bluetooth Speaker', 'price' => 1200.00, 'cost' => 750.00],
                ['name' => 'USB Flash Drive 32GB', 'price' => 400.00, 'cost' => 250.00],
                ['name' => 'Mouse Wireless', 'price' => 550.00, 'cost' => 350.00],
                ['name' => 'Keyboard Wired', 'price' => 650.00, 'cost' => 420.00],
            ],
            'apparel' => [
                ['name' => 'T-Shirt Plain White', 'price' => 350.00, 'cost' => 220.00],
                ['name' => 'T-Shirt Plain Black', 'price' => 350.00, 'cost' => 220.00],
                ['name' => 'Polo Shirt', 'price' => 550.00, 'cost' => 350.00],
                ['name' => 'Jeans Denim', 'price' => 1200.00, 'cost' => 750.00],
                ['name' => 'Shorts Cotton', 'price' => 450.00, 'cost' => 280.00],
                ['name' => 'Cap Baseball', 'price' => 250.00, 'cost' => 150.00],
                ['name' => 'Socks Pack of 3', 'price' => 180.00, 'cost' => 110.00],
                ['name' => 'Belt Leather', 'price' => 450.00, 'cost' => 280.00],
                ['name' => 'Jacket Hoodie', 'price' => 850.00, 'cost' => 550.00],
                ['name' => 'Sneakers', 'price' => 1500.00, 'cost' => 950.00],
            ],
            'home-garden' => [
                ['name' => 'Plant Pot Small', 'price' => 120.00, 'cost' => 75.00],
                ['name' => 'Plant Pot Medium', 'price' => 200.00, 'cost' => 125.00],
                ['name' => 'Gardening Gloves', 'price' => 150.00, 'cost' => 95.00],
                ['name' => 'Watering Can', 'price' => 250.00, 'cost' => 160.00],
                ['name' => 'Garden Scissors', 'price' => 180.00, 'cost' => 115.00],
                ['name' => 'Fertilizer 500g', 'price' => 220.00, 'cost' => 140.00],
                ['name' => 'Soil Mix 5kg', 'price' => 180.00, 'cost' => 115.00],
                ['name' => 'Succulent Plant', 'price' => 150.00, 'cost' => 95.00],
                ['name' => 'Hanging Planter', 'price' => 280.00, 'cost' => 180.00],
                ['name' => 'Garden Rake', 'price' => 350.00, 'cost' => 220.00],
            ],
        ];

        foreach ($categories as $category) {
            $products = $productTemplates[$category->slug] ?? [];
            
            foreach ($products as $productData) {
                $product = Product::create([
                    'name' => $productData['name'],
                    'description' => 'High quality ' . strtolower($productData['name']),
                    'sku' => strtoupper(substr($category->slug, 0, 3)) . '-' . rand(1000, 9999),
                    'barcode' => '8' . rand(100000000000, 999999999999),
                    'price' => $productData['price'],
                    'cost' => $productData['cost'],
                    'category' => $category->id,
                ]);

                // Create inventory for each product
                Inventory::create([
                    'product_id' => $product->id,
                    'quantity' => rand(20, 100),
                    'low_stock_threshold' => 10,
                ]);
            }
        }
    }
}
