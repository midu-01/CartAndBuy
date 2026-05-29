<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/coupons', [
            'coupons' => Coupon::latest()->paginate(20)->withQueryString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        Coupon::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon created.']);

        return back();
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', "unique:coupons,code,{$coupon->id}"],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        $coupon->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon updated.']);

        return back();
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon deleted.']);

        return back();
    }

    public function bulkGenerate(Request $request): RedirectResponse
    {
        $request->validate([
            'prefix' => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9_-]+$/'],
            'count' => ['required', 'integer', 'min:1', 'max:200'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ]);

        // Generate all codes upfront then deduplicate against the database in one query.
        $candidates = [];
        while (count($candidates) < $request->count) {
            $candidates[] = strtoupper($request->prefix.'-'.Str::random(6));
            $candidates = array_unique($candidates);
        }

        $existing = Coupon::whereIn('code', $candidates)->pluck('code')->flip();
        $newCodes = array_filter($candidates, fn (string $c) => ! $existing->has($c));

        $now = now();
        $rows = array_map(fn (string $code) => [
            'code' => $code,
            'type' => $request->type,
            'value' => $request->value,
            'min_order' => $request->min_order,
            'max_uses' => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active' => true,
            'used_count' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ], array_values($newCodes));

        Coupon::insert($rows);
        $created = count($rows);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$created} coupon(s) generated."]);

        return back();
    }
}
