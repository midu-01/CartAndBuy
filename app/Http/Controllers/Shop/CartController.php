<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        $cart = $this->resolveCart($request);
        $cart->load('items.product');

        return Inertia::render('shop/cart', [
            'cart' => $cart,
        ]);
    }

    public function add(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($request->product_id);
        abort_if(! $product->is_active, 404);

        $cart = $this->resolveCart($request);
        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->update([
                'quantity' => min($item->quantity + $request->quantity, $product->stock_qty),
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => min($request->quantity, $product->stock_qty),
                'price' => $product->sale_price ?? $product->price,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} added to cart."]);

        return back();
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $request->validate(['quantity' => ['required', 'integer', 'min:1']]);

        $cartItem->update([
            'quantity' => min($request->quantity, $cartItem->product->stock_qty),
        ]);

        return back();
    }

    public function remove(CartItem $cartItem): RedirectResponse
    {
        $cartItem->delete();

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $this->resolveCart($request)->items()->delete();

        return back();
    }

    private function resolveCart(Request $request): Cart
    {
        $user = $request->user();
        $sessionId = $request->session()->getId();

        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
            $guestCart = Cart::where('session_id', $sessionId)->first();

            if ($guestCart && $guestCart->id !== $cart->id) {
                foreach ($guestCart->items as $guestItem) {
                    $existing = $cart->items()->where('product_id', $guestItem->product_id)->first();
                    if ($existing) {
                        $existing->increment('quantity', $guestItem->quantity);
                    } else {
                        $guestItem->update(['cart_id' => $cart->id]);
                    }
                }
                $guestCart->delete();
            }

            return $cart;
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }
}
