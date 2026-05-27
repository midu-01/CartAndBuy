<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function shippingPayload(array $override = []): array
    {
        return array_merge([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '555-1234',
            'address' => '123 Main St',
            'city' => 'Springfield',
            'state' => 'IL',
            'zip' => '62701',
            'country' => 'US',
            'payment_method' => 'cod',
        ], $override);
    }

    private function cartWithItem(User $user, array $productOverride = []): CartItem
    {
        $product = Product::factory()->create(array_merge(['stock_qty' => 10, 'price' => 50], $productOverride));
        $cart = Cart::factory()->create(['user_id' => $user->id]);

        return CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => $product->price,
        ]);
    }

    // --- Checkout page ---

    public function test_checkout_page_requires_authentication(): void
    {
        $response = $this->get(route('orders.create'));

        $response->assertRedirect(route('login'));
    }

    public function test_checkout_page_redirects_to_cart_when_empty(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('orders.create'));

        $response->assertRedirect(route('cart.show'));
    }

    public function test_checkout_page_renders_with_cart_items(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user);

        $response = $this->actingAs($user)->get(route('orders.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('shop/checkout'));
    }

    // --- Place order ---

    public function test_guest_cannot_place_order(): void
    {
        $response = $this->post(route('orders.store'), $this->shippingPayload());

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_place_order(): void
    {
        $user = User::factory()->create();
        $item = $this->cartWithItem($user);

        $response = $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload());

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'pending']);
        $this->assertDatabaseHas('order_items', ['product_id' => $item->product_id]);
    }

    public function test_placing_order_clears_cart(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user);

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload());

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_placing_order_decrements_product_stock(): void
    {
        $user = User::factory()->create();
        $item = $this->cartWithItem($user, ['stock_qty' => 10]);

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload());

        $this->assertDatabaseHas('products', [
            'id' => $item->product_id,
            'stock_qty' => 8, // 10 - 2 (quantity ordered)
        ]);
    }

    public function test_order_with_subtotal_under_100_has_shipping_cost(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user, ['price' => 30]); // 2 * 30 = 60, under $100

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload());

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_cost' => 9.99,
        ]);
    }

    public function test_order_with_subtotal_over_100_has_free_shipping(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user, ['price' => 60]); // 2 * 60 = 120, over $100

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload());

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_cost' => 0,
        ]);
    }

    public function test_order_with_valid_coupon_applies_discount(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user, ['price' => 60]); // subtotal = 120
        $coupon = Coupon::factory()->percent(10)->create(); // 10% off

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload([
            'coupon_code' => $coupon->code,
        ]));

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'coupon_code' => $coupon->code,
            'discount_amount' => 12.00, // 10% of 120
        ]);
    }

    public function test_order_with_expired_coupon_does_not_apply_discount(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user, ['price' => 60]);
        $coupon = Coupon::factory()->percent(10)->expired()->create();

        $this->actingAs($user)->post(route('orders.store'), $this->shippingPayload([
            'coupon_code' => $coupon->code,
        ]));

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'discount_amount' => 0,
        ]);
    }

    public function test_placing_order_requires_shipping_fields(): void
    {
        $user = User::factory()->create();
        $this->cartWithItem($user);

        $response = $this->actingAs($user)->post(route('orders.store'), []);

        $response->assertSessionHasErrors(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'payment_method']);
    }

    // --- Order history ---

    public function test_order_history_requires_authentication(): void
    {
        $response = $this->get(route('orders.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_order_history(): void
    {
        $user = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $user->id]);
        Order::factory()->create(); // another user's order

        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('shop/order-history')
            ->where('orders.total', 3)
        );
    }

    // --- Order detail ---

    public function test_user_can_view_own_order_detail(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('orders.show', $order));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('shop/order-detail')
            ->where('order.id', $order->id)
        );
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(); // different user

        $response = $this->actingAs($user)->get(route('orders.show', $order));

        $response->assertForbidden();
    }

    // --- Cancel order ---

    public function test_user_can_cancel_pending_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->pending()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('orders.cancel', $order));

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_cancelling_order_restores_product_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_qty' => 8]);
        $order = Order::factory()->pending()->create(['user_id' => $user->id]);
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'unit_price' => $product->price,
            'total_price' => $product->price * 2,
        ]);

        $this->actingAs($user)->patch(route('orders.cancel', $order));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_qty' => 10, // 8 + 2 restored
        ]);
    }

    public function test_user_cannot_cancel_non_pending_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->delivered()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('orders.cancel', $order));

        $response->assertStatus(422);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'delivered',
        ]);
    }

    public function test_user_cannot_cancel_another_users_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->pending()->create(); // different user

        $response = $this->actingAs($user)->patch(route('orders.cancel', $order));

        $response->assertForbidden();
    }

    public function test_guest_cannot_cancel_order(): void
    {
        $order = Order::factory()->pending()->create();

        $response = $this->patch(route('orders.cancel', $order));

        $response->assertRedirect(route('login'));
    }
}
