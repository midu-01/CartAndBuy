<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Electronics
            ['name' => 'iPhone 15 Pro', 'category' => 'smartphones', 'price' => 999.99, 'sale_price' => null, 'stock' => 50, 'featured' => true, 'description' => 'The most advanced iPhone ever with titanium design and A17 Pro chip.'],
            ['name' => 'Samsung Galaxy S24', 'category' => 'smartphones', 'price' => 849.99, 'sale_price' => 799.99, 'stock' => 35, 'featured' => true, 'description' => 'Galaxy AI is here. The new era of mobile intelligence.'],
            ['name' => 'MacBook Pro 14"', 'category' => 'laptops', 'price' => 1999.99, 'sale_price' => null, 'stock' => 20, 'featured' => true, 'description' => 'Supercharged by M3 Pro chip for pro-level performance.'],
            ['name' => 'Dell XPS 15', 'category' => 'laptops', 'price' => 1599.99, 'sale_price' => 1399.99, 'stock' => 15, 'featured' => false, 'description' => 'Premium laptop with OLED display and Intel Core Ultra.'],
            ['name' => 'Sony WH-1000XM5', 'category' => 'headphones', 'price' => 349.99, 'sale_price' => 299.99, 'stock' => 60, 'featured' => true, 'description' => 'Industry-leading noise canceling headphones.'],

            // Clothing
            ['name' => 'Classic Denim Jacket', 'category' => 'mens-fashion', 'price' => 89.99, 'sale_price' => null, 'stock' => 100, 'featured' => false, 'description' => 'Timeless denim jacket with a relaxed fit.'],
            ['name' => 'Floral Summer Dress', 'category' => 'womens-fashion', 'price' => 59.99, 'sale_price' => 44.99, 'stock' => 80, 'featured' => true, 'description' => 'Lightweight floral print dress perfect for summer.'],
            ['name' => 'Kids Dinosaur T-Shirt', 'category' => 'kids-wear', 'price' => 19.99, 'sale_price' => null, 'stock' => 150, 'featured' => false, 'description' => 'Fun dinosaur print t-shirt for kids aged 4-12.'],
            ['name' => 'Performance Running Tights', 'category' => 'sportswear', 'price' => 74.99, 'sale_price' => 59.99, 'stock' => 70, 'featured' => false, 'description' => 'Moisture-wicking compression tights for runners.'],

            // Home & Garden
            ['name' => 'Ergonomic Office Chair', 'category' => 'furniture', 'price' => 449.99, 'sale_price' => 379.99, 'stock' => 25, 'featured' => true, 'description' => 'Fully adjustable ergonomic chair with lumbar support.'],
            ['name' => 'Cast Iron Skillet Set', 'category' => 'kitchen', 'price' => 79.99, 'sale_price' => null, 'stock' => 45, 'featured' => false, 'description' => 'Pre-seasoned cast iron skillet set, 3 pieces.'],
            ['name' => 'Luxury Cotton Duvet', 'category' => 'bedding', 'price' => 129.99, 'sale_price' => 99.99, 'stock' => 40, 'featured' => false, 'description' => '100% Egyptian cotton duvet, 400 thread count.'],
            ['name' => 'Garden Tool Set', 'category' => 'garden-tools', 'price' => 54.99, 'sale_price' => null, 'stock' => 55, 'featured' => false, 'description' => '12-piece stainless steel garden tool set with storage bag.'],

            // Sports
            ['name' => 'Adjustable Dumbbell Set', 'category' => 'fitness-equipment', 'price' => 299.99, 'sale_price' => 249.99, 'stock' => 30, 'featured' => true, 'description' => 'Space-saving adjustable dumbbells from 5–52.5 lbs.'],
            ['name' => 'Hiking Backpack 50L', 'category' => 'outdoor-gear', 'price' => 179.99, 'sale_price' => null, 'stock' => 40, 'featured' => false, 'description' => 'Waterproof 50L backpack with integrated rain cover.'],
            ['name' => 'Yoga Mat Premium', 'category' => 'fitness-equipment', 'price' => 49.99, 'sale_price' => 39.99, 'stock' => 90, 'featured' => false, 'description' => '6mm thick non-slip yoga mat with carrying strap.'],

            // Beauty
            ['name' => 'Vitamin C Serum', 'category' => 'skincare', 'price' => 34.99, 'sale_price' => null, 'stock' => 120, 'featured' => true, 'description' => '20% Vitamin C serum for brightening and anti-aging.'],
            ['name' => 'Matte Lipstick Collection', 'category' => 'makeup', 'price' => 24.99, 'sale_price' => 18.99, 'stock' => 200, 'featured' => false, 'description' => 'Long-lasting matte lipstick in 12 bold shades.'],
            ['name' => 'Argan Oil Hair Mask', 'category' => 'haircare', 'price' => 29.99, 'sale_price' => null, 'stock' => 85, 'featured' => false, 'description' => 'Deep conditioning hair mask with pure Moroccan argan oil.'],
            ['name' => 'Eau de Parfum Rose Gold', 'category' => 'fragrances', 'price' => 89.99, 'sale_price' => 74.99, 'stock' => 60, 'featured' => true, 'description' => 'Floral woody musk fragrance for women, 100ml.'],
        ];

        $placeholderImages = [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
        ];

        foreach ($products as $data) {
            $category = Category::where('slug', $data['category'])->first();

            Product::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'sale_price' => $data['sale_price'],
                    'stock_qty' => $data['stock'],
                    'category_id' => $category?->id,
                    'images' => [fake()->randomElement($placeholderImages)],
                    'is_featured' => $data['featured'],
                    'is_active' => true,
                ]
            );
        }
    }
}
