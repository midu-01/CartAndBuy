<?php

use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

require __DIR__.'/admin.php';

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';

require __DIR__.'/shop.php';

// Payment gateway webhooks — excluded from CSRF via bootstrap/app.php
Route::post('/webhooks/payment/{gateway}', PaymentWebhookController::class)->name('webhooks.payment');
