<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // products: compound index for the published() scope (is_active + status + publish_at)
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'status'], 'products_active_status_idx');
            $table->index(['is_active', 'is_featured'], 'products_active_featured_idx');
            $table->index('price', 'products_price_idx');
            $table->index('label', 'products_label_idx');
        });

        // orders: compound index for user order history and coupon validation
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status', 'orders_status_idx');
            $table->index(['coupon_code', 'user_id'], 'orders_coupon_user_idx');
        });

        // reviews: compound for fetching approved reviews per product
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['product_id', 'is_approved'], 'reviews_product_approved_idx');
        });

        // cart_items: compound for the dedup lookup in resolveCart / add to cart
        Schema::table('cart_items', function (Blueprint $table) {
            $table->index(['cart_id', 'product_id', 'product_variant_id'], 'cart_items_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_active_status_idx');
            $table->dropIndex('products_active_featured_idx');
            $table->dropIndex('products_price_idx');
            $table->dropIndex('products_label_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_idx');
            $table->dropIndex('orders_coupon_user_idx');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('reviews_product_approved_idx');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('cart_items_lookup_idx');
        });
    }
};
