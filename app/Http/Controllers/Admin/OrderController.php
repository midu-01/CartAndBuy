<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('user')->latest();
        
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) $query->where('id', 'like', '%' . $request->search . '%');

        return Inertia::render('admin/orders', [
            'orders' => $query->paginate(15)->withQueryString()
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product']);
        return Inertia::render('admin/order-detail', [
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,completed,cancelled'
        ]);
        $order->update($validated);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status updated']);
        return back();
    }
}