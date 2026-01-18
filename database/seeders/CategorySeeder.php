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
            ],
            [
                'name' => 'Snacks',
                'slug' => 'snacks',
            ],
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
            ],
            [
                'name' => 'Apparel',
                'slug' => 'apparel',
            ],
            [
                'name' => 'Home & Garden',
                'slug' => 'home-garden',
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
