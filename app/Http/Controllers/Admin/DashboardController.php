<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = Cache::remember('admin_dashboard_stats', 300, function (): array {
            return [
                'revenue' => Order::whereNotIn('status', ['cancelled'])->sum('total'),
                'orders' => Order::count(),
                'products' => Product::where('is_active', true)->count(),
                'customers' => User::where('role', 'customer')->count(),
            ];
        });

        $topProducts = Cache::remember('admin_dashboard_top_products', 300, function () {
            return DB::table('order_items')
                ->select('product_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(total_price) as revenue'))
                ->groupBy('product_name')
                ->orderByDesc('total_sold')
                ->take(5)
                ->get();
        });

        $monthlyRevenue = Cache::remember('admin_dashboard_monthly_revenue', 300, function () {
            return Order::whereNotIn('status', ['cancelled'])
                ->where('created_at', '>=', now()->subMonths(6))
                ->selectRaw(
                    DB::connection()->getDriverName() === 'sqlite'
                        ? "strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders"
                        : 'DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as revenue, COUNT(*) as orders'
                )
                ->groupBy('month')
                ->orderBy('month')
                ->get();
        });

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentOrders' => Order::with('user')->latest()->take(10)->get(),
            'topProducts' => $topProducts,
            'monthlyRevenue' => $monthlyRevenue,
        ]);
    }
}
