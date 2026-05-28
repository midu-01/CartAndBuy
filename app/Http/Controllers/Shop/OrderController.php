<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ShippingRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $cart = $this->resolveCart($request);

        if (! $cart || $cart->items->isEmpty()) {
            return to_route('cart.show');
        }

        $user = $request->user();

        return Inertia::render('shop/checkout', [
            'cart' => $cart,
            'addresses' => $user ? $user->addresses : [],
            'shippingRules' => ShippingRule::where('is_active', true)->get(),
            'walletBalance' => $user ? (float) $user->wallet_balance : 0,
            'pointsBalance' => $user ? (int) $user->points_balance : 0,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'upazilla' => ['nullable', 'string'],
            'village' => ['nullable', 'string'],
            'zip' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'payment_method' => ['required', 'in:cod,bkash,nagad'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
            'is_gift' => ['nullable', 'boolean'],
            'gift_message' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'requested_delivery_date' => ['nullable', 'date'],
            'requested_delivery_time' => ['nullable', 'string'],
            'use_wallet' => ['nullable', 'boolean'],
            'redeem_points' => ['nullable', 'integer', 'min:0'],
        ]);

        $cart = $this->resolveCart($request);
        abort_if(! $cart || $cart->items->isEmpty(), 422, 'Cart is empty.');

        $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);

        // Calculate shipping cost using ShippingRule
        $shippingCost = 130; // default
        $rules = ShippingRule::where('is_active', true)->get();
        foreach ($rules as $rule) {
            if ($rule->type === 'area_based' && is_array($rule->regions)) {
                if (in_array($request->city, $rule->regions) || in_array($request->upazilla, $rule->regions)) {
                    $shippingCost = $rule->cost;
                    if ($rule->min_order_amount_for_free_shipping && $subtotal >= $rule->min_order_amount_for_free_shipping) {
                        $shippingCost = 0;
                    }
                    break;
                }
            } elseif ($rule->type === 'flat') {
                $shippingCost = $rule->cost;
                if ($rule->min_order_amount_for_free_shipping && $subtotal >= $rule->min_order_amount_for_free_shipping) {
                    $shippingCost = 0;
                }
            }
        }

        // Fallback free shipping over 2000 if no rule matches
        if ($shippingCost > 0 && $subtotal >= 2000) {
            $shippingCost = 0;
        }

        if (! $request->filled('transaction_id') && $request->payment_method !== 'cod') {
            return back()->withErrors(['transaction_id' => 'Transaction ID is required.'])->withInput();
        }

        $discountAmount = 0;
        $couponCode = null;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
            $userId = $request->user()?->id;
            if ($coupon && $coupon->isValid($subtotal) && (! $userId || ! $coupon->hasBeenUsedByUser($userId))) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
                $couponCode = $coupon->code;
                $coupon->increment('used_count');
            }
        }

        // Wallet & points redemption (auth users only)
        $walletUsed = 0;
        $pointsRedeemed = 0;
        $user = $request->user();

        if ($user && $request->boolean('use_wallet') && $user->wallet_balance > 0) {
            $walletUsed = min((float) $user->wallet_balance, $subtotal + $shippingCost - $discountAmount);
        }

        if ($user && $request->filled('redeem_points') && $request->integer('redeem_points') > 0) {
            $pointsToRedeem = min($request->integer('redeem_points'), $user->points_balance);
            $pointsValue = $pointsToRedeem / 100; // 100 points = 1 taka
            $remaining = $subtotal + $shippingCost - $discountAmount - $walletUsed;
            $pointsValue = min($pointsValue, $remaining);
            $pointsRedeemed = (int) ($pointsValue * 100);
            $walletUsed += $pointsValue;
        }

        $total = max(0, $subtotal + $shippingCost - $discountAmount - $walletUsed);

        $orderToken = Str::random(32);

        $order = DB::transaction(function () use ($request, $cart, $subtotal, $shippingCost, $discountAmount, $total, $couponCode, $orderToken, $walletUsed, $pointsRedeemed): Order {
            foreach ($cart->items as $item) {
                $stockAvailable = $item->variant?->stock_qty ?? $item->product->stock_qty;
                abort_if($stockAvailable < $item->quantity, 422, "{$item->product->name} does not have enough stock.");
            }

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'guest_email' => $request->user() ? null : $request->email,
                'guest_phone' => $request->user() ? null : $request->phone,
                'order_token' => $orderToken,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount_amount' => $discountAmount,
                'points_redeemed' => $pointsRedeemed,
                'wallet_used' => $walletUsed,
                'total' => $total,
                'coupon_code' => $couponCode,
                'shipping_address' => $request->only(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'upazilla', 'village', 'zip', 'country']),
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
                'transaction_id' => $request->transaction_id,
                'is_gift' => $request->boolean('is_gift'),
                'gift_message' => $request->gift_message,
                'notes' => $request->notes,
                'requested_delivery_date' => $request->requested_delivery_date,
                'requested_delivery_time' => $request->requested_delivery_time,
            ]);

            $order->statusHistories()->create([
                'status' => 'pending',
                'notes' => 'Order placed successfully.',
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'variant_attributes' => $item->variant?->attributes,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price,
                    'total_price' => $item->price * $item->quantity,
                ]);

                if ($item->variant) {
                    $item->variant->decrement('stock_qty', $item->quantity);
                } else {
                    $item->product->decrement('stock_qty', $item->quantity);
                }
            }

            $cart->items()->delete();

            // Deduct wallet balance and points
            $orderUser = $request->user();
            if ($orderUser) {
                if ($walletUsed > 0) {
                    $orderUser->decrement('wallet_balance', $walletUsed);
                    $order->user->walletTransactions()->create([
                        'type' => 'debit',
                        'amount' => $walletUsed,
                        'source' => 'purchase',
                        'description' => "Used for Order #{$order->id}",
                        'order_id' => $order->id,
                    ]);
                }
                if ($pointsRedeemed > 0) {
                    $orderUser->decrement('points_balance', $pointsRedeemed);
                    $order->user->pointTransactions()->create([
                        'type' => 'spend',
                        'amount' => $pointsRedeemed,
                        'source' => 'redemption',
                        'description' => "Redeemed for Order #{$order->id}",
                        'order_id' => $order->id,
                    ]);
                }
            }

            return $order;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order placed successfully!']);

        if (! $request->user()) {
            return to_route('orders.show', ['order' => $order->id, 'token' => $orderToken]);
        }

        return to_route('orders.show', $order);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('shop/order-history', [
            'orders' => Order::where('user_id', $request->user()->id)
                ->with(['items.product', 'items.variant'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }

        $order->load(['items.product', 'items.variant', 'statusHistories', 'requests']);

        return Inertia::render('shop/order-detail', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }

        abort_if($order->status !== 'pending', 422, 'Only pending orders can be cancelled.');

        $order->load(['items.product', 'items.variant']);

        foreach ($order->items as $item) {
            if ($item->variant) {
                $item->variant()->increment('stock_qty', $item->quantity);
            } elseif ($item->product_id) {
                $item->product()->increment('stock_qty', $item->quantity);
            }
        }

        $order->update(['status' => 'cancelled']);

        $order->statusHistories()->create([
            'status' => 'cancelled',
            'notes' => 'Order cancelled by customer.',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order has been cancelled.']);

        return back();
    }

    public function reorder(Request $request, Order $order): RedirectResponse
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }

        $cart = clone $this->resolveCart($request);
        if (! $cart) {
            $sessionId = $request->session()->getId();
            $cart = Cart::firstOrCreate(
                $request->user() ? ['user_id' => $request->user()->id] : ['session_id' => $sessionId]
            );
        }

        foreach ($order->items as $item) {
            $product = $item->product;
            $variant = $item->variant;

            if (! $product || ! $product->is_active) {
                continue;
            }

            if ($item->product_variant_id && (! $variant || ! $variant->is_active)) {
                continue;
            }

            $stockAvailable = $variant?->stock_qty ?? $product->stock_qty;
            if ($stockAvailable < 1) {
                continue;
            }

            $existing = $cart->items()
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variant?->id)
                ->first();

            if ($existing) {
                $existing->update([
                    'quantity' => min($existing->quantity + $item->quantity, $stockAvailable),
                ]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'quantity' => min($item->quantity, $stockAvailable),
                    'price' => $variant?->effective_price ?? ($product->sale_price ?? $product->price),
                ]);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Items added to cart from previous order.']);

        return to_route('cart.show');
    }

    private function resolveCart(Request $request): ?Cart
    {
        $user = $request->user();
        $cartQuery = Cart::with(['items.product', 'items.variant']);

        if ($user) {
            return $cartQuery->where('user_id', $user->id)->first();
        }

        return $cartQuery->where('session_id', $request->session()->getId())->first();
    }
}
