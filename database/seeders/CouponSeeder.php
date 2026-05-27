<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            ['code' => 'WELCOME10', 'type' => 'percent', 'value' => 10, 'max_discount' => 500, 'min_order' => 0, 'max_uses' => null, 'expires_at' => null],
            ['code' => 'SAVE20', 'type' => 'percent', 'value' => 20, 'min_order' => 100, 'max_uses' => 500, 'expires_at' => now()->addMonths(3)],
            ['code' => 'FLAT15', 'type' => 'fixed', 'value' => 15, 'min_order' => 50, 'max_uses' => 200, 'expires_at' => now()->addMonths(2)],
            ['code' => 'SUMMER30', 'type' => 'percent', 'value' => 30, 'min_order' => 150, 'max_uses' => 100, 'expires_at' => now()->addMonth()],
        ];

        foreach ($coupons as $data) {
            Coupon::updateOrCreate(
                ['code' => $data['code']],
                array_merge($data, ['is_active' => true, 'used_count' => 0])
            );
        }
    }
}
