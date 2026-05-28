<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        $cart = $this->resolveCart($request);
        $cart->load(['items.product', 'items.variant']);

        return Inertia::render('shop/cart', [
            'cart' => $cart,
        ]);
    }

    public function add(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'product_variant_id' => [
                'nullable',
                Rule::exists('product_variants', 'id')->where('product_id', $request->integer('product_id')),
            ],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($request->product_id);
        abort_if(! $product->is_active, 404);

        $variant = $request->filled('product_variant_id')
            ? ProductVariant::where('product_id', $product->id)->where('is_active', true)->findOrFail($request->integer('product_variant_id'))
            : null;
        $stockAvailable = $variant?->stock_qty ?? $product->stock_qty;

        if ($stockAvailable < 1) {
            return back()->withErrors(['quantity' => "{$product->name} is currently out of stock."]);
        }

        $cart = $this->resolveCart($request);
        $item = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        if ($item) {
            $item->update([
                'quantity' => min($item->quantity + $request->integer('quantity'), $stockAvailable),
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'quantity' => min($request->integer('quantity'), $stockAvailable),
                'price' => $variant?->effective_price ?? ($product->sale_price ?? $product->price),
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} added to cart."]);

        return back();
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $request->validate(['quantity' => ['required', 'integer', 'min:1']]);
        $cartItem->load(['product', 'variant']);

        $cartItem->update([
            'quantity' => min($request->integer('quantity'), $cartItem->stockAvailable()),
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
                    $existing = $cart->items()
                        ->where('product_id', $guestItem->product_id)
                        ->where('product_variant_id', $guestItem->product_variant_id)
                        ->first();
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
