<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        $validated = $request->validate(['code' => 'required|string']);
        $coupon = Coupon::where('code', $validated['code'])->first();

        if (!$coupon) {
            return response()->json(['valid' => false, 'message' => 'Invalid coupon code'], 422);
        }

        return response()->json([
            'valid' => true, 'code' => $coupon->code, 'type' => $coupon->type, 'value' => $coupon->value
        ]);
    }
}