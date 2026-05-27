<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'upazilla' => ['required', 'string'],
            'village' => ['required', 'string'],
            'zip' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'payment_method' => ['required', 'in:cod,bkash,nagad'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->with('items.product')->firstOrFail();
        abort_if($cart->items->isEmpty(), 422, 'Cart is empty.');

        $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
        $shippingCost = $subtotal >= 2000 ? 0 : ($request->city === 'Dhaka' ? 80 : 130);

        if (! $request->filled('transaction_id') && ($request->payment_method !== 'cod' || $shippingCost > 0)) {
            return back()->withErrors(['transaction_id' => 'Transaction ID is required.'])->withInput();
        }
        $discountAmount = 0;
        $couponCode = null;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
            if ($coupon && $coupon->isValid($subtotal) && ! $coupon->hasBeenUsedByUser($request->user()->id)) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
                $couponCode = $coupon->code;
                $coupon->increment('used_count');
            }
        }

        $total = max(0, $subtotal + $shippingCost - $discountAmount);

        $order = Order::create([
            'user_id' => $request->user()->id,
            'status' => 'pending',
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'discount_amount' => $discountAmount,
            'total' => $total,
            'coupon_code' => $couponCode,
            'shipping_address' => $request->only(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'upazilla', 'village', 'zip', 'country']),
            'payment_method' => $request->payment_method,
            'payment_status' => 'unpaid',
            'transaction_id' => $request->transaction_id,
        ]);

        foreach ($cart->items as $item) {
            $order->items()->create([
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->price,
                'total_price' => $item->price * $item->quantity,
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

    public function show(Order $order): Response
    {
        /** @var User $user */
        $user = Auth::user();
        abort_if($order->user_id !== $user->id, 403);

        $order->load('items.product');

        return Inertia::render('shop/order-detail', [
            'order' => $order,
        ]);
    }

    public function cancel(Order $order): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        abort_if($order->user_id !== $user->id, 403);
        abort_if($order->status !== 'pending', 422, 'Only pending orders can be cancelled.');

        $order->load('items');

        foreach ($order->items as $item) {
            if ($item->product_id) {
                $item->product()->increment('stock_qty', $item->quantity);
            }
        }

        $order->update(['status' => 'cancelled']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order has been cancelled.']);

        return back();
    }
}
