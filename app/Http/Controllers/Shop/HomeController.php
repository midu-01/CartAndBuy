<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isFirstTimeUser = $user && ! Order::where('user_id', $user->id)->exists();

        // Cache plain arrays — never cache Eloquent Collections to avoid
        // serialization edge cases where deserialized keys cause JSON to render
        // as an object {} instead of an array [] on the frontend.
        $featuredProducts = Cache::remember('home_featured_products', 600, function () {
            return Product::active()->featured()->with('category')->take(8)->get()->values()->toArray();
        });

        $topCategories = Cache::remember('home_top_categories', 600, function () {
            return Category::whereNull('parent_id')->with('children')->take(6)->get()->values()->toArray();
        });

        // Hero products rotate hourly so they are not completely static.
        $heroProducts = Cache::remember('home_hero_products', 3600, function () {
            return Product::active()
                ->whereNotNull('images')
                ->inRandomOrder()
                ->take(4)
                ->get(['id', 'name', 'slug', 'images', 'price', 'sale_price'])
                ->values()
                ->toArray();
        });

        return Inertia::render('shop/home', [
            'featuredProducts' => $featuredProducts,
            'heroProducts' => $heroProducts,
            'topCategories' => $topCategories,
            'isFirstTimeUser' => $isFirstTimeUser,
        ]);
    }
}
