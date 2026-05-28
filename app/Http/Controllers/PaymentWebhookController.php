<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    /**
     * Handle incoming webhook from a payment gateway.
     *
     * Gateway-specific verification logic can be added per case.
     * Currently supports: bkash, nagad
     */
    public function __invoke(string $gateway, Request $request): JsonResponse
    {
        Log::info('Payment webhook received', [
            'gateway' => $gateway,
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        $payload = $request->all();

        return match ($gateway) {
            'bkash' => $this->handleBkash($payload),
            'nagad' => $this->handleNagad($payload),
            default => response()->json(['status' => 'ignored', 'reason' => 'Unknown gateway'], 200),
        };
    }

    private function handleBkash(array $payload): JsonResponse
    {
        // bKash sends trxID, amount, msisdn, transactionStatus in callback
        $trxId = $payload['trxID'] ?? $payload['transactionID'] ?? null;
        $status = $payload['transactionStatus'] ?? null;
        $amount = isset($payload['amount']) ? (float) $payload['amount'] : null;

        if (! $trxId || ! $status) {
            return response()->json(['status' => 'ignored', 'reason' => 'Missing required fields']);
        }

        $order = Order::where('transaction_id', $trxId)->first();

        if (! $order) {
            Log::warning('bKash webhook: order not found for trxID', ['trxID' => $trxId]);

            return response()->json(['status' => 'not_found']);
        }

        if ($status === 'Completed') {
            $this->markOrderPaid($order, 'bkash', $trxId, $amount, $payload);
        } elseif (in_array($status, ['Failed', 'Cancelled', 'Expired'])) {
            $this->markOrderFailed($order, 'bkash', $trxId, $status, $payload);
        }

        return response()->json(['status' => 'processed']);
    }

    private function handleNagad(array $payload): JsonResponse
    {
        $trxId = $payload['merchantOrderId'] ?? $payload['orderId'] ?? null;
        $status = $payload['status'] ?? null;
        $amount = isset($payload['amount']) ? (float) $payload['amount'] : null;

        if (! $trxId || ! $status) {
            return response()->json(['status' => 'ignored', 'reason' => 'Missing required fields']);
        }

        $order = Order::where('transaction_id', $trxId)->first();

        if (! $order) {
            Log::warning('Nagad webhook: order not found', ['orderId' => $trxId]);

            return response()->json(['status' => 'not_found']);
        }

        if ($status === 'Success') {
            $this->markOrderPaid($order, 'nagad', $trxId, $amount, $payload);
        } elseif (in_array($status, ['Aborted', 'Cancelled'])) {
            $this->markOrderFailed($order, 'nagad', $trxId, $status, $payload);
        }

        return response()->json(['status' => 'processed']);
    }

    private function markOrderPaid(Order $order, string $gateway, string $trxId, ?float $amount, array $payload): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        $order->update([
            'payment_status' => 'paid',
            'payment_verified_at' => now(),
            'payment_failure_reason' => null,
        ]);

        $order->paymentTransactions()->create([
            'user_id' => $order->user_id,
            'gateway' => $gateway,
            'type' => 'payment',
            'amount' => $amount ?? $order->total,
            'status' => 'completed',
            'gateway_transaction_id' => $trxId,
            'gateway_response' => $payload,
            'verified_at' => now(),
        ]);

        Log::info("Order #{$order->id} marked as paid via {$gateway} webhook.");
    }

    private function markOrderFailed(Order $order, string $gateway, string $trxId, string $failStatus, array $payload): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        $order->update([
            'payment_status' => 'failed',
            'payment_failure_reason' => "Payment {$failStatus} via {$gateway}.",
        ]);

        $order->paymentTransactions()->create([
            'user_id' => $order->user_id,
            'gateway' => $gateway,
            'type' => 'payment',
            'amount' => $order->total,
            'status' => 'failed',
            'gateway_transaction_id' => $trxId,
            'gateway_response' => $payload,
            'failure_reason' => "Gateway status: {$failStatus}",
        ]);

        Log::info("Order #{$order->id} payment failed via {$gateway} webhook. Status: {$failStatus}");
    }
}
