<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderRequestController extends Controller
{
    public function store(Request $request, Order $order): RedirectResponse
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:cancel,return,exchange,refund'],
            'reason' => ['required', 'string', 'max:1000'],
            'order_item_id' => ['nullable', 'exists:order_items,id'],
        ]);

        $order->requests()->create([
            'user_id' => $request->user()?->id,
            'order_item_id' => $validated['order_item_id'],
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Request submitted successfully. Our team will review it shortly.']);

        return back();
    }
}
