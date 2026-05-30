<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (! $coupon || ! $coupon->isValid((float) $request->order_total)) {
            return response()->json(['valid' => false, 'message' => 'Invalid or expired coupon code.'], 422);
        }

        $user = $request->user();

        if (! $coupon->meetsUserRestrictions($user)) {
            $message = match (true) {
                $coupon->new_customers_only => 'This coupon is only for new customers.',
                (bool) $coupon->user_id => 'This coupon is not available for your account.',
                $coupon->once_per_customer => 'You have already used this coupon.',
                default => 'This coupon is not available for your account.',
            };

            return response()->json(['valid' => false, 'message' => $message], 422);
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount' => $coupon->calculateDiscount((float) $request->order_total),
        ]);
    }
}
