<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('points_balance')->default(0)->after('password');
            $table->decimal('wallet_balance', 10, 2)->default(0.00)->after('points_balance');
            $table->string('referral_code')->unique()->nullable()->after('wallet_balance');
            $table->json('notification_preferences')->nullable()->after('referral_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['points_balance', 'wallet_balance', 'referral_code', 'notification_preferences']);
        });
    }
};
