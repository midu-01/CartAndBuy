<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return $this->createSuperAdmin();
    }

    private function orderWithDigitalPayment(array $overrides = []): Order
    {
        return Order::factory()->create(array_merge([
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
            'transaction_id' => 'TXN123456',
            'total' => 500.00,
        ], $overrides));
    }

    // ─── Admin: Approve Payment ───────────────────────────────────────────────

    public function test_admin_can_approve_pending_verification_payment(): void
    {
        $admin = $this->adminUser();
        $order = $this->orderWithDigitalPayment();

        $this->actingAs($admin)
            ->patch("/admin/payments/{$order->id}/approve")
            ->assertRedirect();

        $order->refresh();
        $this->assertEquals('paid', $order->payment_status);
        $this->assertNotNull($order->payment_verified_at);
        $this->assertEquals($admin->id, $order->payment_verified_by);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'status' => 'completed',
            'gateway' => 'bkash',
        ]);
    }

    public function test_admin_cannot_approve_already_paid_order(): void
    {
        $admin = $this->adminUser();
        $order = $this->orderWithDigitalPayment(['payment_status' => 'paid']);

        $this->actingAs($admin)
            ->patch("/admin/payments/{$order->id}/approve")
            ->assertStatus(422);
    }

    // ─── Admin: Reject Payment ────────────────────────────────────────────────

    public function test_admin_can_reject_pending_payment_with_reason(): void
    {
        $admin = $this->adminUser();
        $order = $this->orderWithDigitalPayment();

        $this->actingAs($admin)
            ->patch("/admin/payments/{$order->id}/reject", ['reason' => 'Transaction ID not found.'])
            ->assertRedirect();

        $order->refresh();
        $this->assertEquals('failed', $order->payment_status);
        $this->assertEquals('Transaction ID not found.', $order->payment_failure_reason);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'status' => 'failed',
            'failure_reason' => 'Transaction ID not found.',
        ]);
    }

    public function test_admin_reject_requires_reason(): void
    {
        $admin = $this->adminUser();
        $order = $this->orderWithDigitalPayment();

        $this->actingAs($admin)
            ->patch("/admin/payments/{$order->id}/reject", [])
            ->assertSessionHasErrors('reason');
    }

    // ─── Admin: Refund ────────────────────────────────────────────────────────

    public function test_admin_can_issue_full_wallet_refund(): void
    {
        $admin = $this->adminUser();
        $customer = User::factory()->create(['wallet_balance' => 0]);
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'paid',
            'total' => 300.00,
        ]);

        $this->actingAs($admin)
            ->post("/admin/orders/{$order->id}/refund", [
                'amount' => 300.00,
                'reason' => 'Customer requested full refund.',
                'refund_method' => 'wallet',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('refunds', [
            'order_id' => $order->id,
            'amount' => 300.00,
            'type' => 'full',
            'status' => 'completed',
            'refund_method' => 'wallet',
        ]);

        $customer->refresh();
        $this->assertEquals(300.00, (float) $customer->wallet_balance);
    }

    public function test_admin_can_issue_partial_refund(): void
    {
        $admin = $this->adminUser();
        $customer = User::factory()->create(['wallet_balance' => 0]);
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_status' => 'paid',
            'total' => 500.00,
        ]);

        $this->actingAs($admin)
            ->post("/admin/orders/{$order->id}/refund", [
                'amount' => 150.00,
                'reason' => 'Partial refund for returned item.',
                'refund_method' => 'wallet',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('refunds', [
            'order_id' => $order->id,
            'amount' => 150.00,
            'type' => 'partial',
        ]);

        $customer->refresh();
        $this->assertEquals(150.00, (float) $customer->wallet_balance);
    }

    public function test_refund_amount_cannot_exceed_order_total(): void
    {
        $admin = $this->adminUser();
        $order = Order::factory()->create([
            'payment_status' => 'paid',
            'total' => 100.00,
        ]);

        $this->actingAs($admin)
            ->post("/admin/orders/{$order->id}/refund", [
                'amount' => 200.00,
                'reason' => 'Test',
                'refund_method' => 'wallet',
            ])
            ->assertSessionHasErrors('amount');
    }

    // ─── Shop: Upload Receipt ─────────────────────────────────────────────────

    public function test_customer_can_upload_payment_receipt(): void
    {
        Storage::fake('public');

        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$order->id}/payment/receipt", [
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ])
            ->assertRedirect();

        $order->refresh();
        $this->assertNotNull($order->payment_receipt);
        $this->assertEquals('pending_verification', $order->payment_status);
        Storage::disk('public')->assertExists($order->payment_receipt);
    }

    public function test_customer_cannot_upload_receipt_for_paid_order(): void
    {
        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'paid',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$order->id}/payment/receipt", [
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ])
            ->assertStatus(422);
    }

    public function test_customer_cannot_upload_receipt_for_another_users_order(): void
    {
        Storage::fake('public');

        $customer = User::factory()->create();
        $otherOrder = Order::factory()->create([
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$otherOrder->id}/payment/receipt", [
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ])
            ->assertStatus(403);
    }

    // ─── Shop: Retry Payment ──────────────────────────────────────────────────

    public function test_customer_can_retry_failed_payment(): void
    {
        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'failed',
            'transaction_id' => 'OLD_TXN',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$order->id}/payment/retry", [
                'transaction_id' => 'NEW_TXN_789',
            ])
            ->assertRedirect();

        $order->refresh();
        $this->assertEquals('NEW_TXN_789', $order->transaction_id);
        $this->assertEquals('pending_verification', $order->payment_status);
        $this->assertNull($order->payment_failure_reason);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'gateway_transaction_id' => 'NEW_TXN_789',
            'status' => 'pending',
        ]);
    }

    public function test_customer_cannot_retry_non_failed_payment(): void
    {
        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$order->id}/payment/retry", [
                'transaction_id' => 'SOME_TXN',
            ])
            ->assertStatus(422);
    }

    public function test_retry_requires_transaction_id(): void
    {
        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'payment_method' => 'bkash',
            'payment_status' => 'failed',
        ]);

        $this->actingAs($customer)
            ->post("/orders/{$order->id}/payment/retry", [])
            ->assertSessionHasErrors('transaction_id');
    }

    // ─── Webhook ──────────────────────────────────────────────────────────────

    public function test_bkash_webhook_marks_order_as_paid(): void
    {
        $order = Order::factory()->create([
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
            'transaction_id' => 'BKSH_TXN_001',
            'total' => 400.00,
        ]);

        $this->postJson('/webhooks/payment/bkash', [
            'trxID' => 'BKSH_TXN_001',
            'transactionStatus' => 'Completed',
            'amount' => '400.00',
        ])->assertJson(['status' => 'processed']);

        $order->refresh();
        $this->assertEquals('paid', $order->payment_status);
        $this->assertNotNull($order->payment_verified_at);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'status' => 'completed',
            'gateway' => 'bkash',
        ]);
    }

    public function test_bkash_webhook_marks_order_as_failed(): void
    {
        $order = Order::factory()->create([
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
            'transaction_id' => 'BKSH_TXN_002',
        ]);

        $this->postJson('/webhooks/payment/bkash', [
            'trxID' => 'BKSH_TXN_002',
            'transactionStatus' => 'Failed',
        ])->assertJson(['status' => 'processed']);

        $order->refresh();
        $this->assertEquals('failed', $order->payment_status);
    }

    public function test_webhook_ignores_unknown_transaction_id(): void
    {
        $this->postJson('/webhooks/payment/bkash', [
            'trxID' => 'UNKNOWN_TXN',
            'transactionStatus' => 'Completed',
        ])->assertJson(['status' => 'not_found']);
    }

    public function test_webhook_does_not_re_process_already_paid_order(): void
    {
        Order::factory()->create([
            'payment_method' => 'bkash',
            'payment_status' => 'paid',
            'transaction_id' => 'BKSH_TXN_003',
        ]);

        $this->postJson('/webhooks/payment/bkash', [
            'trxID' => 'BKSH_TXN_003',
            'transactionStatus' => 'Completed',
        ])->assertJson(['status' => 'processed']);

        // No duplicate payment_transactions added
        $this->assertDatabaseCount('payment_transactions', 0);
    }

    // ─── Admin Payments Index ─────────────────────────────────────────────────

    public function test_admin_payments_index_is_accessible(): void
    {
        $admin = $this->adminUser();

        Order::factory()->count(3)->create([
            'payment_method' => 'bkash',
            'payment_status' => 'pending_verification',
        ]);

        $this->actingAs($admin)
            ->get('/admin/payments')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/payments')
                ->has('orders')
                ->has('counts')
            );
    }

    public function test_non_admin_cannot_access_payments_index(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user)
            ->get('/admin/payments')
            ->assertStatus(403);
    }
}
