<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function customer(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    // --- Access control ---

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $this->get('/admin/dashboard')->assertRedirect(route('login'));
    }

    public function test_customer_cannot_access_admin_dashboard(): void
    {
        $this->actingAs($this->customer())->get('/admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->admin())->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('admin/dashboard'));
    }

    // --- Products ---

    public function test_admin_can_view_products_list(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->actingAs($this->admin())->get(route('admin.products.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/products'));
    }

    public function test_admin_can_create_product(): void
    {
        $category = Category::factory()->create();
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post(route('admin.products.store'), [
            'name' => 'New Product',
            'price' => 29.99,
            'stock_qty' => 50,
            'category_id' => $category->id,
            'is_featured' => false,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', ['name' => 'New Product', 'price' => 29.99]);
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::factory()->create(['name' => 'Old Name']);
        $admin = $this->admin();

        $response = $this->actingAs($admin)->patch(route('admin.products.update', $product), [
            'name' => 'Updated Name',
            'price' => 39.99,
            'stock_qty' => 20,
            'is_featured' => false,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::factory()->create();
        $admin = $this->admin();

        $response = $this->actingAs($admin)->delete(route('admin.products.destroy', $product));

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_creation_requires_name_and_price(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.products.store'), []);

        $response->assertSessionHasErrors(['name', 'price', 'stock_qty']);
    }

    // --- Categories ---

    public function test_admin_can_view_categories(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.categories.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/categories'));
    }

    public function test_admin_can_create_category(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.categories.store'), [
            'name' => 'Electronics',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', ['name' => 'Electronics']);
    }

    public function test_admin_can_create_child_category(): void
    {
        $parent = Category::factory()->create();

        $response = $this->actingAs($this->admin())->post(route('admin.categories.store'), [
            'name' => 'Smartphones',
            'parent_id' => $parent->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', ['name' => 'Smartphones', 'parent_id' => $parent->id]);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::factory()->create(['name' => 'Old Cat']);

        $this->actingAs($this->admin())->patch(route('admin.categories.update', $category), [
            'name' => 'New Cat',
        ]);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Cat']);
    }

    public function test_admin_can_delete_category(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin())->delete(route('admin.categories.destroy', $category));

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    // --- Orders ---

    public function test_admin_can_view_orders_list(): void
    {
        Order::factory()->count(3)->create();

        $response = $this->actingAs($this->admin())->get(route('admin.orders.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/orders'));
    }

    public function test_admin_can_view_order_detail(): void
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin())->get(route('admin.orders.show', $order));

        $response->assertOk()->assertInertia(fn ($page) => $page
            ->component('admin/order-detail')
            ->where('order.id', $order->id)
        );
    }

    public function test_admin_can_update_order_status(): void
    {
        $order = Order::factory()->pending()->create();

        $response = $this->actingAs($this->admin())->patch(route('admin.orders.update-status', $order), [
            'status' => 'shipped',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'shipped']);
    }

    public function test_order_status_must_be_valid_value(): void
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin())->patch(route('admin.orders.update-status', $order), [
            'status' => 'invalid-status',
        ]);

        $response->assertSessionHasErrors('status');
    }

    // --- Users ---

    public function test_admin_can_view_users_list(): void
    {
        User::factory()->count(3)->create();

        $response = $this->actingAs($this->admin())->get(route('admin.users.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/users'));
    }

    // --- Coupons ---

    public function test_admin_can_view_coupons(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.coupons.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/coupons'));
    }

    public function test_admin_can_create_coupon(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.coupons.store'), [
            'code' => 'SAVE20',
            'type' => 'percent',
            'value' => 20,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('coupons', ['code' => 'SAVE20', 'type' => 'percent']);
    }

    public function test_admin_can_update_coupon(): void
    {
        $coupon = Coupon::factory()->create(['value' => 10]);

        $this->actingAs($this->admin())->patch(route('admin.coupons.update', $coupon), [
            'code' => $coupon->code,
            'type' => 'percent',
            'value' => 25,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'value' => 25]);
    }

    public function test_admin_can_delete_coupon(): void
    {
        $coupon = Coupon::factory()->create();

        $this->actingAs($this->admin())->delete(route('admin.coupons.destroy', $coupon));

        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
    }

    public function test_duplicate_coupon_code_is_rejected(): void
    {
        Coupon::factory()->create(['code' => 'EXISTING']);

        $response = $this->actingAs($this->admin())->post(route('admin.coupons.store'), [
            'code' => 'EXISTING',
            'type' => 'fixed',
            'value' => 10,
        ]);

        $response->assertSessionHasErrors('code');
    }

    // --- Reviews ---

    public function test_admin_can_view_reviews(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.reviews.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page->component('admin/reviews'));
    }

    public function test_admin_can_approve_review(): void
    {
        $review = Review::factory()->create(['is_approved' => false]);

        $this->actingAs($this->admin())->patch(route('admin.reviews.approve', $review));

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'is_approved' => true]);
    }

    public function test_admin_can_unapprove_review(): void
    {
        $review = Review::factory()->approved()->create();

        $this->actingAs($this->admin())->patch(route('admin.reviews.approve', $review));

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'is_approved' => false]);
    }

    public function test_admin_can_delete_review(): void
    {
        $review = Review::factory()->create();

        $this->actingAs($this->admin())->delete(route('admin.reviews.destroy', $review));

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }
}
