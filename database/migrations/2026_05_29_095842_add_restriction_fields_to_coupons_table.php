<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->boolean('once_per_customer')->default(false)->after('max_uses');
            $table->boolean('new_customers_only')->default(false)->after('once_per_customer');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->after('new_customers_only');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['once_per_customer', 'new_customers_only', 'user_id']);
        });
    }
};
