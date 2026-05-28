<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PersonalDataController extends Controller
{
    public function download(Request $request): Response
    {
        $user = $request->user();

        $data = [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'referral_code' => $user->referral_code,
                'points_balance' => $user->points_balance,
                'wallet_balance' => $user->wallet_balance,
                'member_since' => $user->created_at->toDateString(),
            ],
            'addresses' => $user->addresses()->get(['type', 'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'country'])->toArray(),
            'orders' => $user->orders()->get([
                'id', 'status', 'subtotal', 'shipping_cost', 'total', 'payment_method',
                'payment_status', 'shipping_address', 'created_at',
            ])->toArray(),
            'point_transactions' => $user->pointTransactions()->get(['type', 'amount', 'source', 'description', 'created_at'])->toArray(),
            'wallet_transactions' => $user->walletTransactions()->get(['type', 'amount', 'source', 'description', 'created_at'])->toArray(),
            'support_tickets' => $user->supportTickets()->with('messages:ticket_id,message,is_admin_reply,created_at')->get(['id', 'subject', 'status', 'priority', 'created_at'])->toArray(),
            'activity_logs' => $user->activityLogs()->latest()->get(['action', 'ip_address', 'created_at'])->toArray(),
            'notification_preferences' => $user->notification_preferences ?? [],
            'exported_at' => now()->toIso8601String(),
        ];

        return response(
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            200,
            [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="my-data-'.now()->format('Y-m-d').'.json"',
            ],
        );
    }
}
