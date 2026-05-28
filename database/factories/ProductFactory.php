<?php

namespace Database\Factories;

use App\Models\Brand;
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
            'sku' => strtoupper(Str::random(3)).'-'.fake()->unique()->randomNumber(5),
            'description' => fake()->paragraph(),
            'price' => $price,
            'sale_price' => null,
            'stock_qty' => fake()->numberBetween(1, 100),
            'category_id' => null,
            'brand_id' => null,
            'images' => null,
            'tags' => null,
            'label' => null,
            'is_featured' => false,
            'is_active' => true,
            'status' => 'published',
            'publish_at' => null,
            'video_url' => null,
            'size_chart' => null,
            'faqs' => null,
            'low_stock_threshold' => 5,
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

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }

    public function scheduled(): static
    {
        return $this->state([
            'status' => 'scheduled',
            'publish_at' => now()->addDays(3),
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(['stock_qty' => 3, 'low_stock_threshold' => 5]);
    }

    public function withBrand(): static
    {
        return $this->state(['brand_id' => Brand::factory()]);
    }

    public function newArrival(): static
    {
        return $this->state(['label' => 'new_arrival']);
    }

    public function bestSeller(): static
    {
        return $this->state(['label' => 'best_seller']);
    }

    public function trending(): static
    {
        return $this->state(['label' => 'trending']);
    }

    public function withTags(): static
    {
        return $this->state(['tags' => fake()->words(3)]);
    }

    public function withSizeChart(): static
    {
        return $this->state([
            'size_chart' => [
                ['size' => 'S', 'chest' => '34', 'waist' => '28', 'hip' => '36'],
                ['size' => 'M', 'chest' => '38', 'waist' => '32', 'hip' => '40'],
                ['size' => 'L', 'chest' => '42', 'waist' => '36', 'hip' => '44'],
                ['size' => 'XL', 'chest' => '46', 'waist' => '40', 'hip' => '48'],
            ],
        ]);
    }

    public function withFaqs(): static
    {
        return $this->state([
            'faqs' => [
                ['question' => 'What is the return policy?', 'answer' => '7-day easy return policy.'],
                ['question' => 'Is this product genuine?', 'answer' => '100% authentic product guaranteed.'],
            ],
        ]);
    }
}
