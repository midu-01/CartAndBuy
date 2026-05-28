<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('phone');
            $table->date('birthday')->nullable()->after('gender');
            $table->string('avatar')->nullable()->after('birthday');
            $table->boolean('marketing_email')->default(false)->after('avatar');
            $table->boolean('marketing_sms')->default(false)->after('marketing_email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'gender', 'birthday', 'avatar', 'marketing_email', 'marketing_sms']);
        });
    }
};
