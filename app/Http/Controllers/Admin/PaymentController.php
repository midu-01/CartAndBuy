<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Refund;
use App\Services\AdminActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('user')
            ->whereIn('payment_status', ['pending_verification', 'failed', 'paid'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('payment_status', $request->status);
        }

        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('transaction_id', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $counts = [
            'all' => Order::whereIn('payment_status', ['pending_verification', 'failed', 'paid'])->count(),
            'pending_verification' => Order::where('payment_status', 'pending_verification')->count(),
            'paid' => Order::where('payment_status', 'paid')->count(),
            'failed' => Order::where('payment_status', 'failed')->count(),
        ];

        return Inertia::render('admin/payments', [
            'orders' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'method', 'search']),
            'counts' => $counts,
        ]);
    }

    public function approve(Request $request, Order $order): RedirectResponse
    {
        abort_if(
            ! in_array($order->payment_status, ['pending_verification', 'unpaid', 'failed']),
            422,
            'This payment cannot be approved in its current state.'
        );

        DB::transaction(function () use ($request, $order) {
            $order->update([
                'payment_status' => 'paid',
                'payment_verified_at' => now(),
                'payment_verified_by' => $request->user()->id,
                'payment_failure_reason' => null,
            ]);

            $order->paymentTransactions()->create([
                'user_id' => $order->user_id,
                'gateway' => $order->payment_method,
                'type' => 'payment',
                'amount' => $order->total,
                'status' => 'completed',
                'gateway_transaction_id' => $order->transaction_id,
                'verified_at' => now(),
                'verified_by' => $request->user()->id,
                'notes' => 'Manually approved by admin.',
            ]);
        });

        AdminActivityLogger::log('payment.approved', Order::class, $order->id, "Payment approved for Order #{$order->id}.");

        Inertia::flash('toast', ['type' => 'success', 'message' => "Payment for Order #{$order->id} approved."]);

        return back();
    }

    public function reject(Request $request, Order $order): RedirectResponse
    {
        abort_if(
            ! in_array($order->payment_status, ['pending_verification', 'unpaid']),
            422,
            'This payment cannot be rejected in its current state.'
        );

        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($request, $order) {
            $order->update([
                'payment_status' => 'failed',
                'payment_failure_reason' => $request->reason,
            ]);

            $order->paymentTransactions()->create([
                'user_id' => $order->user_id,
                'gateway' => $order->payment_method,
                'type' => 'payment',
                'amount' => $order->total,
                'status' => 'failed',
                'gateway_transaction_id' => $order->transaction_id,
                'failure_reason' => $request->reason,
                'verified_by' => $request->user()->id,
                'notes' => 'Rejected by admin.',
            ]);
        });

        AdminActivityLogger::log('payment.rejected', Order::class, $order->id, "Payment rejected for Order #{$order->id}: {$request->reason}.");

        Inertia::flash('toast', ['type' => 'error', 'message' => "Payment for Order #{$order->id} rejected."]);

        return back();
    }

    public function refund(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$order->total],
            'reason' => ['required', 'string', 'max:1000'],
            'refund_method' => ['required', 'in:wallet,original_method,bank_transfer'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $type = (float) $request->amount >= (float) $order->total ? 'full' : 'partial';

        $latestTransaction = $order->paymentTransactions()
            ->where('status', 'completed')
            ->latest()
            ->first();

        DB::transaction(function () use ($request, $order, $type, $latestTransaction) {
            $refund = Refund::create([
                'order_id' => $order->id,
                'payment_transaction_id' => $latestTransaction?->id,
                'refunded_by' => $request->user()->id,
                'amount' => $request->amount,
                'type' => $type,
                'reason' => $request->reason,
                'status' => 'approved',
                'refund_method' => $request->refund_method,
                'notes' => $request->notes,
                'processed_at' => now(),
            ]);

            // If refunding to wallet, credit immediately
            if ($request->refund_method === 'wallet' && $order->user_id) {
                $order->user->increment('wallet_balance', $request->amount);

                $order->user->walletTransactions()->create([
                    'type' => 'credit',
                    'amount' => $request->amount,
                    'source' => 'refund',
                    'description' => "Refund for Order #{$order->id} (Refund #{$refund->id})",
                    'order_id' => $order->id,
                ]);

                $refund->update(['status' => 'completed']);
            }

            // Create a refund payment transaction record
            $order->paymentTransactions()->create([
                'user_id' => $order->user_id,
                'gateway' => $request->refund_method,
                'type' => 'refund',
                'amount' => $request->amount,
                'status' => 'completed',
                'notes' => "Refund #{$refund->id}: {$request->reason}",
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);
        });

        AdminActivityLogger::log('refund.issued', Order::class, $order->id, "Refund of ৳{$request->amount} issued for Order #{$order->id} via {$request->refund_method}.");

        Inertia::flash('toast', ['type' => 'success', 'message' => "Refund of ৳{$request->amount} issued for Order #{$order->id}."]);

        return back();
    }
}
