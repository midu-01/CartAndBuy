<?php

namespace App\Services\AiAssistant;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartActionService
{
    /** @return array<string, mixed> */
    public function getCart(Request $request): array
    {
        $cart = $this->resolveCart($request);
        $cart->load('items.product');

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

        $total = $items->sum('subtotal');
        $freeShippingThreshold = 2000.0;
        $amountToFreeShipping = max(0.0, $freeShippingThreshold - $total);

        return [
            'items' => $items->values()->all(),
            'total' => $total,
            'formatted_total' => '৳'.number_format($total, 2),
            'item_count' => (int) $items->sum('quantity'),
            'is_empty' => $items->isEmpty(),
            'free_shipping_threshold' => $freeShippingThreshold,
            'amount_to_free_shipping' => $amountToFreeShipping,
            'has_free_shipping' => $total >= $freeShippingThreshold,
        ];
    }

    /** @return array{success: bool, message: string, product_name?: string} */
    public function addToCart(Request $request, int $productId, int $quantity = 1): array
    {
        $product = Product::find($productId);

        if (! $product || ! $product->is_active) {
            return ['success' => false, 'message' => 'Product not found or unavailable.'];
        }

        if ($product->stock_qty < 1) {
            return ['success' => false, 'message' => "{$product->name} is currently out of stock."];
        }

        $cart = $this->resolveCart($request);
        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $newQty = min($item->quantity + $quantity, $product->stock_qty);
            $item->update(['quantity' => $newQty]);
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
