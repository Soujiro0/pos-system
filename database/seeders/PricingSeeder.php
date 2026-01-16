<?php

namespace Database\Seeders;

use App\Models\Discount;
use App\Models\TaxRate;
use Illuminate\Database\Seeder;

class PricingSeeder extends Seeder
{
    public function run(): void
    {
        // Tax Rates
        TaxRate::create(['name' => 'VAT', 'percentage' => 12.00, 'type' => 'exclusive', 'is_active' => true]);
        // TaxRate::create(['name' => 'Inclusive Tax', 'percentage' => 10.00, 'type' => 'inclusive', 'is_active' => true]);

        // Discounts
        // 1. Coupon
        Discount::create([
            'code' => 'PROMO10',
            'type' => 'percent',
            'value' => 10.00,
            'is_stackable' => true,
            'priority' => 10,
            'is_active' => true,
        ]);
        
        // 2. Bulk (No code, min quantity 5)
        Discount::create([
            'code' => null, // Generic
            'type' => 'fixed',
            'value' => 50.00,
            'min_quantity' => 5,
            'priority' => 5,
            'is_stackable' => true,
            'is_active' => true,
        ]);
    }
}
