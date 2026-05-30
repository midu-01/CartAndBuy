<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\User;
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
            'coupons' => Coupon::with('user:id,name,email')->latest()->paginate(20)->withQueryString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Coupon::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon created.']);

        return back();
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $data = $this->validated($request, $coupon->id);

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
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'once_per_customer' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);

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
            'max_discount' => $request->max_discount,
            'min_order' => $request->min_order ?? 0,
            'max_uses' => $request->max_uses,
            'once_per_customer' => (bool) $request->boolean('once_per_customer'),
            'new_customers_only' => false,
            'user_id' => null,
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

    /** @return array<string, mixed> */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $uniqueRule = $ignoreId
            ? "unique:coupons,code,{$ignoreId}"
            : 'unique:coupons';

        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', $uniqueRule],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'once_per_customer' => ['boolean'],
            'new_customers_only' => ['boolean'],
            'user_email' => ['nullable', 'string', 'email', 'exists:users,email'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        // Resolve user_email → user_id
        $data['user_id'] = null;
        if (! empty($data['user_email'])) {
            $data['user_id'] = User::where('email', $data['user_email'])->value('id');
        }
        unset($data['user_email']);

        return $data;
    }
}
