<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('shop/home', [
            'featuredProducts' => Product::active()->featured()->with('category')->take(8)->get(),
            'topCategories' => Category::whereNull('parent_id')->take(6)->get(),
        ]);
    }
}
