<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => $name,
            'sku' => strtoupper(substr(Str::slug($name), 0, 3) . '-' . Str::random(6)),
            'barcode' => $this->faker->unique()->ean13(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 1, 100),
            'category' => $this->faker->word,
            'image_url' => $this->faker->imageUrl(),
            'attributes' => ['color' => $this->faker->colorName],
        ];
    }
}
