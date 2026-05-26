<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/coupons', [
            'coupons' => Coupon::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons',
            'type' => 'required|string|in:percent,fixed',
            'value' => 'required|numeric'
        ]);
        Coupon::create($validated);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon created']);
        return back();
    }

    public function update(Request $request, Coupon $coupon)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code,' . $coupon->id,
            'type' => 'required|string|in:percent,fixed',
            'value' => 'required|numeric'
        ]);
        $coupon->update($validated);
        return back();
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return back();
    }
}