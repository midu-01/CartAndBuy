<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isFirstTimeUser = ! $user || ! Order::where('user_id', $user->id)->exists();

        return Inertia::render('shop/home', [
            'featuredProducts' => Product::active()->featured()->with('category')->take(8)->get(),
            'heroProducts' => Product::active()->whereNotNull('images')->inRandomOrder()->take(4)->get(['id', 'name', 'slug', 'images', 'price', 'sale_price']),
            'topCategories' => Category::whereNull('parent_id')->with('children')->take(6)->get(),
            'isFirstTimeUser' => $isFirstTimeUser,
        ]);
    }
}
