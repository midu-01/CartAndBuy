<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->with('items.product')->first();

        if (! $cart || $cart->items->isEmpty()) {
            return to_route('cart.show');
        }

        return Inertia::render('shop/checkout', [
            'cart' => $cart,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name'     => ['required', 'string', 'max:100'],
            'last_name'      => ['required', 'string', 'max:100'],
            'email'          => ['required', 'email'],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['required', 'string'],
            'city'           => ['required', 'string'],
            'state'          => ['required', 'string'],
            'zip'            => ['required', 'string'],
            'country'        => ['required', 'string'],
            'payment_method' => ['required', 'in:cod,card'],
            'coupon_code'    => ['nullable', 'string'],
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->with('items.product')->firstOrFail();
        abort_if($cart->items->isEmpty(), 422, 'Cart is empty.');

        $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
        $shippingCost = $subtotal >= 100 ? 0 : 9.99;
        $discountAmount = 0;
        $couponCode = null;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
            if ($coupon && $coupon->isValid($subtotal)) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
                $couponCode = $coupon->code;
                $coupon->increment('used_count');
            }
        }

        $total = max(0, $subtotal + $shippingCost - $discountAmount);

        $order = Order::create([
            'user_id'          => $request->user()->id,
            'status'           => 'pending',
            'subtotal'         => $subtotal,
            'shipping_cost'    => $shippingCost,
            'discount_amount'  => $discountAmount,
            'total'            => $total,
            'coupon_code'      => $couponCode,
            'shipping_address' => $request->only(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country']),
            'payment_method'   => $request->payment_method,
            'payment_status'   => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
        ]);

        foreach ($cart->items as $item) {
            $order->items()->create([
                'product_id'   => $item->product_id,
                'product_name' => $item->product->name,
                'quantity'     => $item->quantity,
                'unit_price'   => $item->price,
                'total_price'  => $item->price * $item->quantity,
            ]);
            $item->product->decrement('stock_qty', $item->quantity);
        }

        $cart->items()->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order placed successfully!']);

        return to_route('orders.show', $order);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('shop/order-history', [
            'orders' => Order::where('user_id', $request->user()->id)
                ->with('items')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_if($order->user_id !== auth()->id(), 403);

        $order->load('items.product');

        return Inertia::render('shop/order-detail', [
            'order' => $order,
        ]);
    }
}
