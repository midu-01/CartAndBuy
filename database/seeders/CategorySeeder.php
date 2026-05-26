<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'children' => ['Smartphones', 'Laptops', 'Headphones', 'Cameras']],
            ['name' => 'Clothing', 'children' => ['Men\'s Fashion', 'Women\'s Fashion', 'Kids\' Wear', 'Sportswear']],
            ['name' => 'Home & Garden', 'children' => ['Furniture', 'Kitchen', 'Bedding', 'Garden Tools']],
            ['name' => 'Sports', 'children' => ['Fitness Equipment', 'Outdoor Gear', 'Team Sports']],
            ['name' => 'Beauty', 'children' => ['Skincare', 'Makeup', 'Haircare', 'Fragrances']],
        ];

        foreach ($categories as $data) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                ['name' => $data['name']]
            );

            foreach ($data['children'] as $childName) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($childName)],
                    ['name' => $childName, 'parent_id' => $parent->id]
                );
            }
        }
    }
}
