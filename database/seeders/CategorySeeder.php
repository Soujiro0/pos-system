<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Beverages',
                'slug' => 'beverages',
                'icon' => 'Coffee',
                'color' => 'bg-blue-100 text-blue-600',
            ],
            [
                'name' => 'Snacks',
                'slug' => 'snacks',
                'icon' => 'Cookie',
                'color' => 'bg-orange-100 text-orange-600',
            ],
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'icon' => 'Smartphone',
                'color' => 'bg-purple-100 text-purple-600',
            ],
            [
                'name' => 'Apparel',
                'slug' => 'apparel',
                'icon' => 'Shirt',
                'color' => 'bg-pink-100 text-pink-600',
            ],
            [
                'name' => 'Home & Garden',
                'slug' => 'home-garden',
                'icon' => 'Home',
                'color' => 'bg-green-100 text-green-600',
            ]
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
