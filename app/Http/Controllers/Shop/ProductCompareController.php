<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCompareController extends Controller
{
    public function index(Request $request): Response
    {
        $ids = collect(explode(',', (string) $request->query('products')))
            ->map(fn (string $id) => (int) trim($id))
            ->filter()
            ->unique()
            ->take(4)
            ->values();

        $products = Product::with(['category', 'brand', 'variants'])
            ->published()
            ->whereIn('id', $ids)
            ->get()
            ->sortBy(fn (Product $product) => $ids->search($product->id))
            ->values();

        return Inertia::render('shop/compare', [
            'products' => $products,
        ]);
    }
}
