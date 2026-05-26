<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('shop/wishlist', [
            'wishlists' => $request->user()->wishlists()->with('product')->get()
        ]);
    }

    public function toggle(Request $request, Product $product)
    {
        $wishlist = $request->user()->wishlists()->where('product_id', $product->id)->first();

        if ($wishlist) {
            $wishlist->delete();
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Removed from wishlist.']);
        } else {
            $request->user()->wishlists()->create(['product_id' => $product->id]);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Added to wishlist!']);
        }

        return back();
    }
}