<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductStockNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductStockNotificationController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        ProductStockNotification::firstOrCreate([
            'product_id' => $product->id,
            'email' => strtolower($data['email']),
        ], [
            'user_id' => $request->user()?->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'We will notify you when this product is back in stock.',
        ]);

        return back();
    }
}
