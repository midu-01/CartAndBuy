<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_wishlist_page_requires_authentication(): void
    {
        $response = $this->get(route('wishlist.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $user->wishlists()->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('wishlist.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('shop/wishlist'));
    }

    public function test_guest_is_redirected_to_login_when_toggling_wishlist(): void
    {
        $product = Product::factory()->create();

        $response = $this->post(route('wishlist.toggle', $product));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_add_product_to_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->post(route('wishlist.toggle', $product));

        $response->assertRedirect();
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_toggling_existing_wishlist_item_removes_it(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $user->wishlists()->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->post(route('wishlist.toggle', $product));

        $response->assertRedirect();
        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_wishlist_only_shows_current_users_items(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create();

        $user->wishlists()->create(['product_id' => $product->id]);
        $otherUser->wishlists()->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('wishlist.index'));

        $response->assertInertia(fn ($page) => $page->has('wishlists', 1));
    }
}
