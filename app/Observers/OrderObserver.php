<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\Referral;

class OrderObserver
{
    public function updated(Order $order): void
    {
        if (! $order->user_id || ! $order->wasChanged('status')) {
            return;
        }

        if ($order->status === 'delivered') {
            $this->awardPointsForOrder($order);
            $this->rewardReferrerIfFirstOrder($order);
        }
    }

    private function awardPointsForOrder(Order $order): void
    {
        $pointsAlreadyAwarded = PointTransaction::where('order_id', $order->id)
            ->where('source', 'order')
            ->exists();

        if ($pointsAlreadyAwarded) {
            return;
        }

        $points = (int) floor($order->total / 10);
        if ($points < 1) {
            return;
        }

        PointTransaction::create([
            'user_id' => $order->user_id,
            'type' => 'earn',
            'amount' => $points,
            'source' => 'order',
            'description' => "Earned for Order #{$order->id}",
            'order_id' => $order->id,
        ]);

        $order->user()->increment('points_balance', $points);
    }

    private function rewardReferrerIfFirstOrder(Order $order): void
    {
        $isFirstDeliveredOrder = Order::where('user_id', $order->user_id)
            ->where('status', 'delivered')
            ->count() === 1;

        if (! $isFirstDeliveredOrder) {
            return;
        }

        $referral = Referral::where('referred_user_id', $order->user_id)
            ->where('status', 'pending')
            ->first();

        if (! $referral) {
            return;
        }

        $referral->update(['status' => 'rewarded', 'rewarded_at' => now()]);

        PointTransaction::create([
            'user_id' => $referral->referrer_id,
            'type' => 'earn',
            'amount' => $referral->reward_points,
            'source' => 'referral',
            'description' => "Referral reward for Order #{$order->id}",
            'order_id' => $order->id,
        ]);

        $referral->referrer()->increment('points_balance', $referral->reward_points);
    }
}
