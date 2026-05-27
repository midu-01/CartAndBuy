<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $price = fake()->randomFloat(2, 10, 500);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'description' => fake()->paragraph(),
            'price' => $price,
            'sale_price' => null,
            'stock_qty' => fake()->numberBetween(1, 100),
            'category_id' => null,
            'images' => null,
            'is_featured' => false,
            'is_active' => true,
        ];
    }

    public function featured(): static
    {
        return $this->state(['is_featured' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock_qty' => 0]);
    }

    public function onSale(): static
    {
        return $this->state(function (array $attributes) {
            return ['sale_price' => round((float) $attributes['price'] * 0.8, 2)];
        });
    }
}
