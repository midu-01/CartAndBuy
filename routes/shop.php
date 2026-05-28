<?php

use App\Http\Controllers\Customer\ActivityController;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\NotificationPreferenceController;
use App\Http\Controllers\Customer\PersonalDataController;
use App\Http\Controllers\Customer\RewardController;
use App\Http\Controllers\Customer\SupportTicketController;
use App\Http\Controllers\Shop\AddressController;
use App\Http\Controllers\Shop\AiAssistantController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CouponController;
use App\Http\Controllers\Shop\CustomerAddressController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\InvoiceController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\OrderRequestController;
use App\Http\Controllers\Shop\PaymentController;
use App\Http\Controllers\Shop\ProductCompareController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\ProductStockNotificationController;
use App\Http\Controllers\Shop\ProfileController;
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

// Checkout & Orders (public - handles guest vs auth inside controllers)
Route::get('/checkout', [OrderController::class, 'create'])->name('orders.create');
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
Route::post('/orders/{order}/reorder', [OrderController::class, 'reorder'])->name('orders.reorder');
Route::get('/orders/{order}/invoice', [InvoiceController::class, 'download'])->name('orders.invoice');
Route::post('/orders/{order}/requests', [OrderRequestController::class, 'store'])->name('orders.requests.store');
Route::post('/orders/{order}/payment/receipt', [PaymentController::class, 'uploadReceipt'])->name('orders.payment.receipt');
Route::post('/orders/{order}/payment/retry', [PaymentController::class, 'retry'])->name('orders.payment.retry');

Route::middleware('auth')->group(function () {
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::resource('addresses', AddressController::class)->except(['create', 'show', 'edit']);

    // Customer profile
    Route::prefix('profile')->name('customer.profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::post('/update', [ProfileController::class, 'update'])->name('update');
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar'])->name('avatar');
        Route::post('/password', [ProfileController::class, 'changePassword'])->name('password');

        Route::post('/addresses', [CustomerAddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{customerAddress}', [CustomerAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{customerAddress}', [CustomerAddressController::class, 'destroy'])->name('addresses.destroy');
        Route::post('/addresses/{customerAddress}/default', [CustomerAddressController::class, 'setDefault'])->name('addresses.default');
    });

    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // Customer account portal
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('/rewards', RewardController::class)->name('rewards');
        Route::get('/activity', ActivityController::class)->name('activity');
        Route::get('/data/download', [PersonalDataController::class, 'download'])->name('data.download');
        Route::patch('/notifications', [NotificationPreferenceController::class, 'update'])->name('notifications.update');

        Route::get('/support', [SupportTicketController::class, 'index'])->name('support.index');
        Route::post('/support', [SupportTicketController::class, 'store'])->name('support.store');
        Route::get('/support/{ticket}', [SupportTicketController::class, 'show'])->name('support.show');
        Route::post('/support/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('support.reply');
        Route::patch('/support/{ticket}/close', [SupportTicketController::class, 'close'])->name('support.close');
    });
});
