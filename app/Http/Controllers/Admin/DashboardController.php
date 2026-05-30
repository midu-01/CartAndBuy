<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'revenue' => Order::whereNotIn('status', ['cancelled'])->sum('total'),
            'orders' => Order::count(),
            'products' => Product::where('is_active', true)->count(),
            'customers' => User::where('role', 'customer')->count(),
        ];

        $topProducts = DB::table('order_items')
            ->select('product_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(total_price) as revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        $monthlyRevenueData = Order::whereNotIn('status', ['cancelled'])
            ->where('created_at', '>=', now()->subMonthsNoOverflow(5)->startOfMonth())
            ->selectRaw(
                DB::connection()->getDriverName() === 'sqlite'
                    ? "strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders"
                    : 'DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as revenue, COUNT(*) as orders'
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlyRevenue = collect(range(5, 0))->map(function ($i) use ($monthlyRevenueData) {
            $month = now()->startOfMonth()->subMonthsNoOverflow($i)->format('Y-m');

            return $monthlyRevenueData->get($month) ?? [
                'month' => $month,
                'revenue' => 0,
                'orders' => 0,
            ];
        })->values();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentOrders' => Order::with('user')->latest()->take(10)->get(),
            'topProducts' => $topProducts,
            'monthlyRevenue' => $monthlyRevenue,
        ]);
    }
}
