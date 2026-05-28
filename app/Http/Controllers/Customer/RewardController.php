<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RewardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $pointTransactions = $user->pointTransactions()
            ->latest()
            ->paginate(20, pageName: 'pointsPage');

        $walletTransactions = $user->walletTransactions()
            ->latest()
            ->paginate(20, pageName: 'walletPage');

        $referrals = $user->referralsMade()
            ->with('referredUser:id,name,email,created_at')
            ->latest()
            ->get();

        return Inertia::render('customer/rewards', [
            'stats' => [
                'points_balance' => $user->points_balance,
                'wallet_balance' => $user->wallet_balance,
                'referral_code' => $user->referral_code,
                'total_referrals' => $referrals->count(),
                'rewarded_referrals' => $referrals->where('status', 'rewarded')->count(),
            ],
            'pointTransactions' => $pointTransactions,
            'walletTransactions' => $walletTransactions,
            'referrals' => $referrals,
        ]);
    }
}
