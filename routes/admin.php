<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', EnsureUserIsAdmin::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Products & Categories
    Route::middleware(['permission:view products'])->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    });

    Route::middleware(['permission:manage products'])->group(function () {
        Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
        Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::patch('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::post('/products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
        Route::patch('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');
    });

    Route::middleware(['permission:bulk update products'])->group(function () {
        Route::post('/products/bulk-update', [ProductController::class, 'bulkUpdate'])->name('products.bulk-update');
    });

    // Orders
    Route::middleware(['permission:view orders'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    });

    Route::middleware(['permission:manage orders'])->group(function () {
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::post('/orders/bulk-status', [OrderController::class, 'bulkUpdateStatus'])->name('orders.bulk-status');
    });

    Route::middleware(['permission:create manual order'])->group(function () {
        Route::get('/orders/create/manual', [OrderController::class, 'createManual'])->name('orders.create-manual');
        Route::post('/orders/manual', [OrderController::class, 'storeManual'])->name('orders.store-manual');
    });

    // Users
    Route::middleware(['permission:manage users'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
    });

    Route::middleware(['permission:add customer notes'])->group(function () {
        Route::patch('/users/{user}/note', [UserController::class, 'updateNote'])->name('users.note');
    });

    // Coupons
    Route::middleware(['permission:manage coupons'])->group(function () {
        Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::patch('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
    });

    Route::middleware(['permission:bulk generate coupons'])->group(function () {
        Route::post('/coupons/bulk-generate', [CouponController::class, 'bulkGenerate'])->name('coupons.bulk-generate');
    });

    // Reviews
    Route::middleware(['permission:manage products'])->group(function () {
        Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::patch('/reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    });

    // Support Tickets
    Route::get('/tickets', [SupportTicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}', [SupportTicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('tickets.reply');
    Route::patch('/tickets/{ticket}/status', [SupportTicketController::class, 'updateStatus'])->name('tickets.status');

    // Payments
    Route::middleware(['permission:manage payments'])->group(function () {
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::patch('/payments/{order}/approve', [PaymentController::class, 'approve'])->name('payments.approve');
        Route::patch('/payments/{order}/reject', [PaymentController::class, 'reject'])->name('payments.reject');
    });

    Route::middleware(['permission:manage refunds'])->group(function () {
        Route::post('/orders/{order}/refund', [PaymentController::class, 'refund'])->name('orders.refund');
    });

    // Reports
    Route::middleware(['permission:view reports'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });

    Route::middleware(['permission:export reports'])->group(function () {
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // Activity Log
    Route::middleware(['permission:view activity log'])->group(function () {
        Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    });

    // Roles & Permissions
    Route::middleware(['permission:manage roles'])->group(function () {
        Route::resource('roles', RoleController::class)->except(['create', 'edit', 'show']);
        Route::post('/roles/{role}/permissions', [PermissionController::class, 'sync'])->name('roles.permissions.sync');
    });
});
