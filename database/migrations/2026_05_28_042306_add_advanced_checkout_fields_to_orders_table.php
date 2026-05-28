<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Nullable user for guests
            $table->foreignId('user_id')->nullable()->change();

            // Guest data
            $table->string('guest_email')->nullable()->after('user_id');
            $table->string('guest_phone')->nullable()->after('guest_email');

            // Checkout options
            $table->boolean('is_gift')->default(false)->after('shipping_address');
            $table->text('gift_message')->nullable()->after('is_gift');
            $table->text('notes')->nullable()->after('gift_message');

            // Delivery date/time
            $table->date('requested_delivery_date')->nullable()->after('notes');
            $table->string('requested_delivery_time')->nullable()->after('requested_delivery_date');

            // Tracking info
            $table->string('tracking_number')->nullable()->after('payment_status');
            $table->string('courier_name')->nullable()->after('tracking_number');
            $table->string('tracking_url')->nullable()->after('courier_name');

            // Security token for guest tracking
            $table->string('order_token')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Cannot reliably reverse nullable change without data loss risks, but we can drop columns
            $table->dropColumn([
                'guest_email', 'guest_phone', 'is_gift', 'gift_message',
                'notes', 'requested_delivery_date', 'requested_delivery_time',
                'tracking_number', 'courier_name', 'tracking_url', 'order_token',
            ]);
        });
    }
};
