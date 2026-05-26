<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    private function resolveCartCount(Request $request): int
    {
        $user = $request->user();
        $cart = $user
            ? Cart::where('user_id', $user->id)->first()
            : Cart::where('session_id', $request->session()->getId())->first();

        return $cart ? $cart->items()->sum('quantity') : 0;
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'cartCount' => fn () => $this->resolveCartCount($request),
            'navCategories' => fn () => Category::whereNull('parent_id')->with('children')->get(),
            'wishlistProductIds' => fn () => $user
                ? Wishlist::where('user_id', $user->id)->pluck('product_id')
                : [],
        ];
    }
}
