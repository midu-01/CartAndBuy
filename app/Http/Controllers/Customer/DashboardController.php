<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = $user->orders()
            ->with('items')
            ->latest()
            ->take(5)
            ->get();

        $activeOrdersCount = $user->orders()
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->count();

        $recentTickets = $user->supportTickets()
            ->latest()
            ->take(3)
            ->get();

        $openTicketsCount = $user->supportTickets()
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        $recentlyViewedIds = collect(request()->session()->get('recently_viewed_products', []))->take(6);
        $recentlyViewed = Product::published()
            ->whereIn('id', $recentlyViewedIds)
            ->get()
            ->sortBy(fn (Product $p) => $recentlyViewedIds->search($p->id))
            ->values();

        return Inertia::render('customer/dashboard', [
            'stats' => [
                'points_balance' => $user->points_balance,
                'wallet_balance' => $user->wallet_balance,
                'total_orders' => $user->orders()->count(),
                'active_orders' => $activeOrdersCount,
                'open_tickets' => $openTicketsCount,
            ],
            'recentOrders' => $recentOrders,
            'recentTickets' => $recentTickets,
            'recentlyViewed' => $recentlyViewed,
        ]);
    }
}
