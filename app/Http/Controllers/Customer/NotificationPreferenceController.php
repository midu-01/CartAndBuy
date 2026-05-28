<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationPreferenceController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_updates' => ['boolean'],
            'promotions' => ['boolean'],
            'ticket_replies' => ['boolean'],
            'newsletter' => ['boolean'],
        ]);

        $request->user()->update([
            'notification_preferences' => $validated,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Notification preferences saved.']);

        return back();
    }
}
