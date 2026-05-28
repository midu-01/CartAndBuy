<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductStockNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductStockNotification>
 */
class ProductStockNotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id' => null,
            'email' => fake()->unique()->safeEmail(),
            'notified_at' => null,
        ];
    }

    public function forUser(): static
    {
        return $this->state(['user_id' => User::factory()]);
    }
}
