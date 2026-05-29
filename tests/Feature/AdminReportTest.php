<?php

namespace Tests\Feature;

use App\Models\AdminActivityLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return $this->createSuperAdmin();
    }

    // ── Reports ──────────────────────────────────────────────────────────────

    public function test_admin_can_view_reports_page(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/reports')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/reports'));
    }

    public function test_reports_sales_tab_returns_data(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/reports?tab=sales')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('sales')->has('summary'));
    }

    public function test_reports_inventory_tab_returns_data(): void
    {
        Product::factory()->count(3)->create();

        $this->actingAs($this->admin())
            ->get('/admin/reports?tab=inventory')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('inventory')->has('inventory_summary'));
    }

    public function test_reports_export_returns_csv(): void
    {
        $response = $this->actingAs($this->admin())
            ->get('/admin/reports/export?tab=sales');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    // ── Activity Log ─────────────────────────────────────────────────────────

    public function test_admin_can_view_activity_log(): void
    {
        $admin = $this->admin();
        AdminActivityLog::create([
            'admin_id' => $admin->id,
            'action' => 'order.status_changed',
            'description' => 'Test log',
            'ip_address' => '127.0.0.1',
        ]);

        $this->actingAs($admin)
            ->get('/admin/activity-log')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/activity-log')->has('logs'));
    }

    // ── Bulk Order Status ─────────────────────────────────────────────────────

    public function test_admin_can_bulk_update_order_status(): void
    {
        $admin = $this->admin();
        $customer = User::factory()->create(['role' => 'customer']);

        $orders = Order::factory()->count(3)->for($customer)->create(['status' => 'pending']);

        $this->actingAs($admin)
            ->post('/admin/orders/bulk-status', [
                'ids' => $orders->pluck('id')->toArray(),
                'status' => 'processing',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('orders', ['status' => 'pending']);
    }

    // ── Bulk Product Update ──────────────────────────────────────────────────

    public function test_admin_can_bulk_update_products(): void
    {
        $products = Product::factory()->count(3)->create(['status' => 'published']);

        $this->actingAs($this->admin())
            ->post('/admin/products/bulk-update', [
                'ids' => $products->pluck('id')->toArray(),
                'field' => 'status',
                'value' => 'draft',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('products', ['status' => 'published']);
    }

    // ── Bulk Coupon Generation ───────────────────────────────────────────────

    public function test_admin_can_bulk_generate_coupons(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/coupons/bulk-generate', [
                'prefix' => 'TEST',
                'count' => 5,
                'type' => 'percent',
                'value' => 10,
                'min_order' => 0,
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('coupons', 5);
    }

    // ── Manual Order Creation ────────────────────────────────────────────────

    public function test_admin_can_view_manual_order_create_page(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/orders/create/manual')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/order-create'));
    }

    public function test_admin_can_create_manual_order(): void
    {
        $admin = $this->admin();
        $customer = User::factory()->create(['role' => 'customer']);
        $product = Product::factory()->create(['price' => 100, 'is_active' => true, 'status' => 'published']);

        $this->actingAs($admin)
            ->post('/admin/orders/manual', [
                'user_id' => $customer->id,
                'items' => [['product_id' => $product->id, 'quantity' => 2]],
                'payment_method' => 'cash',
                'payment_status' => 'paid',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['user_id' => $customer->id, 'total' => 200]);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'quantity' => 2]);
    }

    // ── Customer Note ────────────────────────────────────────────────────────

    public function test_admin_can_add_customer_note(): void
    {
        $admin = $this->admin();
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($admin)
            ->patch("/admin/users/{$customer->id}/note", ['admin_notes' => 'VIP customer'])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $customer->id, 'admin_notes' => 'VIP customer']);
    }
}
