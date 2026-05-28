<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function uploadReceipt(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        abort_if(
            ! in_array($order->payment_status, ['pending_verification', 'failed']),
            422,
            'Receipt upload is not allowed for this payment status.'
        );

        $request->validate([
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        if ($order->payment_receipt) {
            Storage::disk('public')->delete($order->payment_receipt);
        }

        $path = $request->file('receipt')->store('payment-receipts', 'public');

        $order->update([
            'payment_receipt' => $path,
            'payment_status' => 'pending_verification',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment receipt uploaded. We will verify it shortly.']);

        return back();
    }

    public function retry(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        abort_if(
            $order->payment_status !== 'failed',
            422,
            'Only failed payments can be retried.'
        );

        abort_if($order->payment_method === 'cod', 422, 'COD orders cannot retry payments.');

        $request->validate([
            'transaction_id' => ['required', 'string', 'max:100'],
        ]);

        $order->update([
            'transaction_id' => $request->transaction_id,
            'payment_status' => 'pending_verification',
            'payment_failure_reason' => null,
        ]);

        $order->paymentTransactions()->create([
            'user_id' => $request->user()?->id,
            'gateway' => $order->payment_method,
            'type' => 'payment',
            'amount' => $order->total,
            'status' => 'pending',
            'gateway_transaction_id' => $request->transaction_id,
            'notes' => 'Retry attempt by customer.',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaction ID updated. Pending verification.']);

        return back();
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }
    }
}
