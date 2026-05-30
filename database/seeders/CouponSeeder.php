<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => 'percent',
                'value' => 10,
                'max_discount' => 500,
                'min_order' => 0,
                'max_uses' => null,
                'used_count' => 0,
                'once_per_customer' => false,
                'new_customers_only' => true,
                'user_id' => null,
                'expires_at' => null,
                'is_active' => true,
            ]
        );
    }
}
