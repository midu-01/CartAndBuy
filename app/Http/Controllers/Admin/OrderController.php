<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return Inertia::render('admin/orders', [
            'orders' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items', 'paymentTransactions.verifiedBy', 'refunds.refundedBy']);

        return Inertia::render('admin/order-detail', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        $order->update(['status' => $request->status]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order status updated.']);

        return back();
    }
}
