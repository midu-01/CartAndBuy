<?php

use App\Http\Controllers\Shop\AiAssistantController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CouponController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\ProductCompareController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\ProductStockNotificationController;
use App\Http\Controllers\Shop\ReviewController;
use App\Http\Controllers\Shop\SupportController;
use App\Http\Controllers\Shop\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Support pages
Route::get('/help-center', [SupportController::class, 'helpCenter'])->name('help-center');
Route::get('/contact', [SupportController::class, 'contact'])->name('contact');
Route::get('/returns', [SupportController::class, 'returns'])->name('returns');
Route::get('/shop', [ProductController::class, 'index'])->name('shop.index');
Route::get('/compare', [ProductCompareController::class, 'index'])->name('products.compare');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/stock-notifications', [ProductStockNotificationController::class, 'store'])->name('products.stock-notifications.store');

// Cart (public — guests use session)
Route::get('/cart', [CartController::class, 'show'])->name('cart.show');
Route::post('/cart', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
Route::post('/coupon/validate', [CouponController::class, 'validate'])->name('coupon.validate');
Route::post('/ai-assistant/chat', [AiAssistantController::class, 'chat'])->name('ai-assistant.chat');

Route::middleware('auth')->group(function () {
    Route::get('/checkout', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});
