<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartService
{
    /**
     * Resolve the correct cart for the current request, merging any guest cart
     * into the authenticated user's cart when they are logged in.
     */
    public function resolve(Request $request): Cart
    {
        $user = $request->user();

        if (! $user) {
            return Cart::firstOrCreate(['session_id' => $request->session()->getId()]);
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $guestCart = Cart::where('session_id', $request->session()->getId())->first();

        if ($guestCart && $guestCart->id !== $cart->id) {
            $this->mergeGuestCart($guestCart, $cart);
        }

        return $cart;
    }

    /**
     * Same as resolve() but eager-loads items with product and variant for
     * use-cases that need full cart data immediately (checkout, cart page, AI).
     */
    public function resolveWithItems(Request $request): Cart
    {
        $cart = $this->resolve($request);
        $cart->load(['items.product', 'items.variant']);

        return $cart;
    }

    /**
     * Return summarised cart data used by the AI assistant.
     *
     * @return array<string, mixed>
     */
    public function getSummary(Request $request): array
    {
        $cart = $this->resolveWithItems($request);

        $items = $cart->items->map(function (CartItem $item): array {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'image' => $item->product->images[0] ?? null,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) ($item->price * $item->quantity),
            ];
        });

        $total = (float) $items->sum('subtotal');
        $freeShippingThreshold = 2000.0;

        return [
            'items' => $items->values()->all(),
            'total' => $total,
            'formatted_total' => '৳'.number_format($total, 2),
            'item_count' => (int) $items->sum('quantity'),
            'is_empty' => $items->isEmpty(),
            'free_shipping_threshold' => $freeShippingThreshold,
            'amount_to_free_shipping' => max(0.0, $freeShippingThreshold - $total),
            'has_free_shipping' => $total >= $freeShippingThreshold,
        ];
    }

    /**
     * Add a product (without a variant) to the cart — used by the AI assistant.
     *
     * @return array{success: bool, message: string, product_name?: string}
     */
    public function addProductById(Request $request, int $productId, int $quantity = 1): array
    {
        $product = Product::find($productId);

        if (! $product || ! $product->is_active) {
            return ['success' => false, 'message' => 'Product not found or unavailable.'];
        }

        if ($product->stock_qty < 1) {
            return ['success' => false, 'message' => "{$product->name} is currently out of stock."];
        }

        $cart = $this->resolve($request);
        $item = $cart->items()
            ->where('product_id', $product->id)
            ->whereNull('product_variant_id')
            ->first();

        if ($item) {
            $item->update(['quantity' => min($item->quantity + $quantity, $product->stock_qty)]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => min($quantity, $product->stock_qty),
                'price' => $product->sale_price ?? $product->price,
            ]);
        }

        return [
            'success' => true,
            'message' => "**{$product->name}** has been added to your cart! 🛒",
            'product_name' => $product->name,
        ];
    }

    private function mergeGuestCart(Cart $guestCart, Cart $userCart): void
    {
        $guestCart->load('items');

        foreach ($guestCart->items as $guestItem) {
            $existing = $userCart->items()
                ->where('product_id', $guestItem->product_id)
                ->where('product_variant_id', $guestItem->product_variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $guestItem->quantity);
            } else {
                $guestItem->update(['cart_id' => $userCart->id]);
            }
        }

        $guestCart->delete();
    }
}
