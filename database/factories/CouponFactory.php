<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('????##')),
            'type' => fake()->randomElement(['percent', 'fixed']),
            'value' => fake()->randomFloat(2, 5, 50),
            'max_discount' => null,
            'min_order' => 0,
            'max_uses' => null,
            'used_count' => 0,
            'once_per_customer' => false,
            'new_customers_only' => false,
            'user_id' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    public function percent(float $value = 10): static
    {
        return $this->state(['type' => 'percent', 'value' => $value]);
    }

    public function fixed(float $value = 10): static
    {
        return $this->state(['type' => 'fixed', 'value' => $value]);
    }

    public function expired(): static
    {
        return $this->state(['expires_at' => now()->subDay()]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function withMinOrder(float $min): static
    {
        return $this->state(['min_order' => $min]);
    }

    public function oncePerCustomer(): static
    {
        return $this->state(['once_per_customer' => true]);
    }

    public function newCustomersOnly(): static
    {
        return $this->state(['new_customers_only' => true]);
    }

    public function forUser(int $userId): static
    {
        return $this->state(['user_id' => $userId]);
    }
}
