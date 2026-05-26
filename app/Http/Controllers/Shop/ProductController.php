<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category')->active();

        if ($request->filled('search')) $query->where('name', 'like', '%' . $request->search . '%');
        if ($request->filled('category')) $query->where('category_id', $request->category);
        if ($request->filled('min_price')) $query->where('price', '>=', $request->min_price);
        if ($request->filled('max_price')) $query->where('price', '<=', $request->max_price);
        
        $query->when($request->sort === 'price_asc', fn($q) => $q->orderBy('price', 'asc'))
              ->when($request->sort === 'price_desc', fn($q) => $q->orderBy('price', 'desc'))
              ->when(!$request->filled('sort'), fn($q) => $q->latest());

        return Inertia::render('shop/products', [
            'products' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'sort']),
            'categories' => Category::all(),
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['category', 'reviews' => fn($q) => $q->where('is_approved', true)->with('user')]);

        return Inertia::render('shop/product-detail', [
            'product' => $product,
            'averageRating' => $product->reviews()->avg('rating') ?? 0,
        ]);
    }
}