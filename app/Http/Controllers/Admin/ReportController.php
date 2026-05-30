<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $tab = $request->input('tab', 'sales');

        $data = match ($tab) {
            'product' => $this->salesByProduct($from, $to),
            'category' => $this->salesByCategory($from, $to),
            'customer' => $this->salesByCustomer($from, $to),
            'coupon' => $this->couponPerformance($from, $to),
            'clv' => $this->customerLifetimeValue(),
            'abandoned' => $this->abandonedCarts(),
            'inventory' => $this->inventoryReport(),
            'profit' => $this->profitReport($from, $to),
            'tax' => $this->taxReport($from, $to),
            default => $this->salesByDateRange($from, $to),
        };

        return Inertia::render('admin/reports', array_merge([
            'tab' => $tab,
            'from' => $from,
            'to' => $to,
        ], $data));
    }

    public function export(Request $request): StreamedResponse
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $tab = $request->input('tab', 'sales');

        [$headers, $rows] = match ($tab) {
            'product' => $this->exportSalesByProduct($from, $to),
            'category' => $this->exportSalesByCategory($from, $to),
            'customer' => $this->exportSalesByCustomer($from, $to),
            'coupon' => $this->exportCouponPerformance($from, $to),
            'clv' => $this->exportCustomerLifetimeValue(),
            'abandoned' => $this->exportAbandonedCarts(),
            'inventory' => $this->exportInventory(),
            'profit' => $this->exportProfit($from, $to),
            'tax' => $this->exportTax($from, $to),
            default => $this->exportSalesByDate($from, $to),
        };

        $filename = "report-{$tab}-{$from}-{$to}.csv";

        return response()->streamDownload(function () use ($headers, $rows): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // ── Sales by date range ──────────────────────────────────────────────────

    private function salesByDateRange(string $from, string $to): array
    {
        $rows = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue, SUM(discount_amount) as discounts')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            'sales' => $rows,
            'summary' => [
                'total_orders' => $rows->sum('orders'),
                'total_revenue' => $rows->sum('revenue'),
                'total_discount' => $rows->sum('discounts'),
            ],
        ];
    }

    private function exportSalesByDate(string $from, string $to): array
    {
        $rows = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue, SUM(discount_amount) as discounts')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            ['Date', 'Orders', 'Revenue', 'Discounts'],
            $rows->map(fn ($r) => [$r->date, $r->orders, $r->revenue, $r->discounts])->toArray(),
        ];
    }

    // ── Sales by product ─────────────────────────────────────────────────────

    private function salesByProduct(string $from, string $to): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->select('products.id', 'products.name', DB::raw('SUM(order_items.quantity) as qty_sold'), DB::raw('SUM(order_items.total_price) as revenue'))
            ->whereBetween('orders.created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->limit(100)
            ->get();

        return ['products' => $rows];
    }

    private function exportSalesByProduct(string $from, string $to): array
    {
        $rows = $this->salesByProduct($from, $to)['products'];

        return [
            ['Product', 'Qty Sold', 'Revenue'],
            $rows->map(fn ($r) => [$r->name, $r->qty_sold, $r->revenue])->toArray(),
        ];
    }

    // ── Sales by category ────────────────────────────────────────────────────

    private function salesByCategory(string $from, string $to): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->select('categories.name as category', DB::raw('SUM(order_items.quantity) as qty_sold'), DB::raw('SUM(order_items.total_price) as revenue'))
            ->whereBetween('orders.created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->groupBy('categories.name')
            ->orderByDesc('revenue')
            ->get();

        return ['categories' => $rows];
    }

    private function exportSalesByCategory(string $from, string $to): array
    {
        $rows = $this->salesByCategory($from, $to)['categories'];

        return [
            ['Category', 'Qty Sold', 'Revenue'],
            $rows->map(fn ($r) => [$r->category ?? 'Uncategorised', $r->qty_sold, $r->revenue])->toArray(),
        ];
    }

    // ── Sales by customer ────────────────────────────────────────────────────

    private function salesByCustomer(string $from, string $to): array
    {
        $rows = DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.user_id')
            ->select('users.id', 'users.name', 'users.email', DB::raw('COUNT(orders.id) as order_count'), DB::raw('SUM(orders.total) as revenue'))
            ->whereBetween('orders.created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('revenue')
            ->limit(100)
            ->get();

        return ['customers' => $rows];
    }

    private function exportSalesByCustomer(string $from, string $to): array
    {
        $rows = $this->salesByCustomer($from, $to)['customers'];

        return [
            ['Name', 'Email', 'Orders', 'Revenue'],
            $rows->map(fn ($r) => [$r->name, $r->email, $r->order_count, $r->revenue])->toArray(),
        ];
    }

    // ── Coupon performance ───────────────────────────────────────────────────

    private function couponPerformance(string $from, string $to): array
    {
        $rows = DB::table('orders')
            ->select('coupon_code', DB::raw('COUNT(*) as usage_count'), DB::raw('SUM(discount_amount) as total_discount'), DB::raw('SUM(total) as revenue'))
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotNull('coupon_code')
            ->whereNotIn('status', ['cancelled'])
            ->groupBy('coupon_code')
            ->orderByDesc('usage_count')
            ->get();

        $coupons = Coupon::all()->keyBy('code');

        $rows = $rows->map(function ($row) use ($coupons) {
            $coupon = $coupons->get($row->coupon_code);
            $row->type = $coupon?->type;
            $row->value = $coupon?->value;
            $row->max_uses = $coupon?->max_uses;

            return $row;
        });

        return ['coupons' => $rows];
    }

    private function exportCouponPerformance(string $from, string $to): array
    {
        $rows = $this->couponPerformance($from, $to)['coupons'];

        return [
            ['Coupon Code', 'Type', 'Value', 'Usage Count', 'Total Discount', 'Revenue'],
            $rows->map(fn ($r) => [$r->coupon_code, $r->type, $r->value, $r->usage_count, $r->total_discount, $r->revenue])->toArray(),
        ];
    }

    // ── Customer lifetime value ──────────────────────────────────────────────

    private function customerLifetimeValue(): array
    {
        $rows = DB::table('users')
            ->leftJoin('orders', function ($join) {
                $join->on('orders.user_id', '=', 'users.id')
                    ->whereNotIn('orders.status', ['cancelled']);
            })
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.created_at',
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('COALESCE(SUM(orders.total), 0) as lifetime_value'),
                DB::raw('COALESCE(AVG(orders.total), 0) as avg_order_value')
            )
            ->where('users.role', 'customer')
            ->groupBy('users.id', 'users.name', 'users.email', 'users.created_at')
            ->orderByDesc('lifetime_value')
            ->limit(100)
            ->get();

        return ['clv' => $rows];
    }

    private function exportCustomerLifetimeValue(): array
    {
        $rows = $this->customerLifetimeValue()['clv'];

        return [
            ['Name', 'Email', 'Orders', 'Lifetime Value', 'Avg Order Value', 'Joined'],
            $rows->map(fn ($r) => [$r->name, $r->email, $r->order_count, $r->lifetime_value, $r->avg_order_value, $r->created_at])->toArray(),
        ];
    }

    // ── Abandoned carts ──────────────────────────────────────────────────────

    private function abandonedCarts(): array
    {
        $rows = DB::table('carts')
            ->join('cart_items', 'cart_items.cart_id', '=', 'carts.id')
            ->leftJoin('users', 'users.id', '=', 'carts.user_id')
            ->join('products', 'products.id', '=', 'cart_items.product_id')
            ->select(
                'carts.id as cart_id',
                'users.name as user_name',
                'users.email as user_email',
                'carts.session_id',
                DB::raw('SUM(cart_items.quantity * products.price) as cart_value'),
                DB::raw('COUNT(cart_items.id) as item_count'),
                'carts.updated_at'
            )
            ->where('carts.updated_at', '<', now()->subHours(2))
            ->groupBy('carts.id', 'users.name', 'users.email', 'carts.session_id', 'carts.updated_at')
            ->orderByDesc('cart_value')
            ->limit(100)
            ->get();

        $totalValue = $rows->sum('cart_value');

        return [
            'abandoned' => $rows,
            'abandoned_summary' => [
                'count' => $rows->count(),
                'total_value' => $totalValue,
            ],
        ];
    }

    private function exportAbandonedCarts(): array
    {
        $rows = $this->abandonedCarts()['abandoned'];

        return [
            ['Cart ID', 'User', 'Email', 'Items', 'Cart Value', 'Last Updated'],
            $rows->map(fn ($r) => [$r->cart_id, $r->user_name ?? 'Guest', $r->user_email ?? $r->session_id, $r->item_count, $r->cart_value, $r->updated_at])->toArray(),
        ];
    }

    // ── Inventory ────────────────────────────────────────────────────────────

    private function inventoryReport(): array
    {
        $products = Product::with(['category', 'brand', 'variants'])
            ->orderBy('stock_qty')
            ->limit(200)
            ->get()
            ->map(function (Product $p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->category?->name,
                    'brand' => $p->brand?->name,
                    'stock_qty' => $p->stock_qty,
                    'threshold' => $p->low_stock_threshold ?? 5,
                    'is_low' => $p->stock_qty <= ($p->low_stock_threshold ?? 5),
                    'price' => $p->price,
                    'cost_price' => $p->cost_price,
                    'status' => $p->status,
                ];
            });

        return [
            'inventory' => $products,
            'inventory_summary' => [
                'total_products' => $products->count(),
                'low_stock' => $products->where('is_low', true)->count(),
                'out_of_stock' => $products->where('stock_qty', 0)->count(),
            ],
        ];
    }

    private function exportInventory(): array
    {
        $rows = $this->inventoryReport()['inventory'];

        return [
            ['Name', 'SKU', 'Category', 'Brand', 'Stock', 'Low Stock Threshold', 'Price', 'Cost Price', 'Status'],
            $rows->map(fn ($r) => [$r['name'], $r['sku'], $r['category'], $r['brand'], $r['stock_qty'], $r['threshold'], $r['price'], $r['cost_price'], $r['status']])->toArray(),
        ];
    }

    // ── Profit / margin ──────────────────────────────────────────────────────

    private function profitReport(string $from, string $to): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as qty_sold'),
                DB::raw('SUM(order_items.total_price) as revenue'),
                DB::raw('SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as cost'),
                DB::raw('SUM(order_items.total_price) - SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as profit')
            )
            ->whereBetween('orders.created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('profit')
            ->limit(100)
            ->get()
            ->map(function ($r) {
                $r->margin = $r->revenue > 0 ? round(($r->profit / $r->revenue) * 100, 2) : 0;

                return $r;
            });

        return [
            'profit' => $rows,
            'profit_summary' => [
                'total_revenue' => $rows->sum('revenue'),
                'total_cost' => $rows->sum('cost'),
                'total_profit' => $rows->sum('profit'),
                'avg_margin' => $rows->avg('margin'),
            ],
        ];
    }

    private function exportProfit(string $from, string $to): array
    {
        $rows = $this->profitReport($from, $to)['profit'];

        return [
            ['Product', 'Qty Sold', 'Revenue', 'Cost', 'Profit', 'Margin %'],
            $rows->map(fn ($r) => [$r->name, $r->qty_sold, $r->revenue, $r->cost, $r->profit, $r->margin])->toArray(),
        ];
    }

    // ── Tax ──────────────────────────────────────────────────────────────────

    private function taxReport(string $from, string $to): array
    {
        $rows = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(tax_rate) as rate_sum, SUM(tax_amount) as tax_collected, SUM(total) as revenue')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            'tax' => $rows,
            'tax_summary' => [
                'total_tax' => $rows->sum('tax_collected'),
                'total_revenue' => $rows->sum('revenue'),
                'total_orders' => $rows->sum('orders'),
            ],
        ];
    }

    private function exportTax(string $from, string $to): array
    {
        $rows = $this->taxReport($from, $to)['tax'];

        return [
            ['Date', 'Orders', 'Tax Collected', 'Revenue'],
            $rows->map(fn ($r) => [$r->date, $r->orders, $r->tax_collected, $r->revenue])->toArray(),
        ];
    }
}
