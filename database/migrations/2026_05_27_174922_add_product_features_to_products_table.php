<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku', 100)->nullable()->unique()->after('slug');
            $table->foreignId('brand_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->json('tags')->nullable()->after('images');
            $table->string('label')->nullable()->after('tags');
            $table->string('status')->default('published')->after('is_active');
            $table->timestamp('publish_at')->nullable()->after('status');
            $table->string('video_url')->nullable()->after('publish_at');
            $table->json('size_chart')->nullable()->after('video_url');
            $table->json('faqs')->nullable()->after('size_chart');
            $table->unsignedInteger('low_stock_threshold')->default(5)->after('faqs');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn([
                'sku', 'brand_id', 'tags', 'label', 'status',
                'publish_at', 'video_url', 'size_chart', 'faqs', 'low_stock_threshold',
            ]);
        });
    }
};
