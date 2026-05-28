<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('customer/activity', [
            'logs' => $request->user()
                ->activityLogs()
                ->latest()
                ->paginate(30),
        ]);
    }
}
