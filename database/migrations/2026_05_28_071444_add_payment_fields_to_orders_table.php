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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_receipt')->nullable()->after('transaction_id');
            $table->string('payment_failure_reason', 500)->nullable()->after('payment_receipt');
            $table->timestamp('payment_verified_at')->nullable()->after('payment_failure_reason');
            $table->foreignId('payment_verified_by')->nullable()->constrained('users')->nullOnDelete()->after('payment_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['payment_verified_by']);
            $table->dropColumn(['payment_receipt', 'payment_failure_reason', 'payment_verified_at', 'payment_verified_by']);
        });
    }
};
