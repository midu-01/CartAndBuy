<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\AdminActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $old = $order->status;
        $order->update(['status' => $request->status]);

        AdminActivityLogger::log(
            'order.status_changed',
            Order::class,
            $order->id,
            "Status changed from {$old} to {$request->status} on Order #{$order->id}.",
            ['from' => $old, 'to' => $request->status]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order status updated.']);

        return back();
    }

    public function bulkUpdateStatus(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:orders,id'],
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        Order::whereIn('id', $request->ids)->update(['status' => $request->status]);

        AdminActivityLogger::log(
            'order.bulk_status_changed',
            null,
            null,
            'Bulk status update to "'.$request->status.'" for '.count($request->ids).' order(s).',
            ['ids' => $request->ids, 'status' => $request->status]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => count($request->ids).' order(s) updated.']);

        return back();
    }

    public function createManual(): Response
    {
        return Inertia::render('admin/order-create', [
            'customers' => User::where('role', 'customer')->orderBy('name')->get(['id', 'name', 'email']),
            'products' => Product::where('is_active', true)->where('status', 'published')->orderBy('name')->get(['id', 'name', 'price', 'stock_qty', 'sku']),
        ]);
    }

    public function storeManual(Request $request): RedirectResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_status' => ['required', 'in:unpaid,paid'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'shipping_address' => ['nullable', 'array'],
        ]);

        $productIds = array_column($request->items, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $subtotal = 0;
        $lineItems = [];

        foreach ($request->items as $item) {
            $product = $products->get($item['product_id']);
            abort_if(! $product, 422, "Product #{$item['product_id']} not found.");
            $price = $product->sale_price ?? $product->price;
            $lineItems[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $price,
                'name' => $product->name,
            ];
            $subtotal += $price * $item['quantity'];
        }

        $order = DB::transaction(function () use ($request, $subtotal, $lineItems): Order {
            $order = Order::create([
                'user_id' => $request->user_id,
                'status' => 'processing',
                'subtotal' => $subtotal,
                'shipping_cost' => 0,
                'tax_rate' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total' => $subtotal,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_status,
                'shipping_address' => $request->shipping_address ?? [],
                'notes' => $request->notes,
            ]);

            $now = now();
            $rows = array_map(fn (array $line) => [
                'order_id' => $order->id,
                'product_id' => $line['product_id'],
                'product_name' => $line['name'],
                'quantity' => $line['quantity'],
                'unit_price' => $line['price'],
                'total_price' => $line['price'] * $line['quantity'],
                'created_at' => $now,
                'updated_at' => $now,
            ], $lineItems);

            OrderItem::insert($rows);

            return $order;
        });

        AdminActivityLogger::log(
            'order.manual_created',
            Order::class,
            $order->id,
            "Manual order #{$order->id} created for user #{$request->user_id}."
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => "Order #{$order->id} created."]);

        return to_route('admin.orders.show', $order);
    }
}
