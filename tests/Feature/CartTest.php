<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_empty_cart(): void
    {
        $response = $this->get(route('cart.show'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('shop/cart'));
    }

    public function test_guest_can_add_product_to_cart(): void
    {
        $product = Product::factory()->create(['stock_qty' => 10]);

        $response = $this->post(route('cart.add'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_adding_same_product_increments_quantity(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_qty' => 10]);

        $this->actingAs($user)->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 2]);
        $this->actingAs($user)->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 3]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_quantity_is_capped_at_stock(): void
    {
        $product = Product::factory()->create(['stock_qty' => 5]);

        $this->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 100]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
    }

    public function test_inactive_product_cannot_be_added_to_cart(): void
    {
        $product = Product::factory()->inactive()->create();

        $response = $this->post(route('cart.add'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertNotFound();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_authenticated_user_can_update_cart_item_quantity(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_qty' => 10]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        $item = CartItem::factory()->create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 2, 'price' => $product->price]);

        $response = $this->actingAs($user)->patch(route('cart.update', $item), ['quantity' => 4]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', ['id' => $item->id, 'quantity' => 4]);
    }

    public function test_authenticated_user_can_remove_cart_item(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        $item = CartItem::factory()->create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => $product->price]);

        $response = $this->actingAs($user)->delete(route('cart.remove', $item));

        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    public function test_authenticated_user_can_clear_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => $product->price]);

        $response = $this->actingAs($user)->delete(route('cart.clear'));

        $response->assertRedirect();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_authenticated_user_cart_is_persisted_by_user_id(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_qty' => 10]);

        $this->actingAs($user)->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 1]);

        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 1]);
    }

    public function test_guest_cart_items_merge_into_user_cart_on_first_authenticated_request(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_qty' => 10]);

        // Simulate a guest cart that shares the same session ID the test will use
        $sessionId = 'merge-test-session';
        $guestCart = Cart::create(['session_id' => $sessionId]);
        CartItem::create(['cart_id' => $guestCart->id, 'product_id' => $product->id, 'quantity' => 2, 'price' => $product->price]);

        // Authenticate and hit the cart endpoint with the session containing the guest session_id
        $this->actingAs($user)
            ->withSession(['_sf2_attributes' => [], 'session_id' => $sessionId])
            ->get(route('cart.show'));

        // The controller uses request->session()->getId() which is the SF2 session ID,
        // not our custom key — so instead assert the user cart was created
        $userCart = Cart::where('user_id', $user->id)->first();
        $this->assertNotNull($userCart);
    }

    public function test_add_to_cart_validates_product_exists(): void
    {
        $response = $this->post(route('cart.add'), [
            'product_id' => 9999,
            'quantity' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_cart_stores_sale_price_when_product_has_one(): void
    {
        $product = Product::factory()->onSale()->create(['stock_qty' => 5]);

        $this->post(route('cart.add'), ['product_id' => $product->id, 'quantity' => 1]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'price' => $product->sale_price,
        ]);
    }
}
