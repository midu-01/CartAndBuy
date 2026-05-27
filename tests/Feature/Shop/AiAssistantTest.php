<?php

namespace Tests\Feature\Shop;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\Wishlist;
use App\Services\AiAssistant\AiProviderInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AiAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_requires_message(): void
    {
        $response = $this->postJson('/ai-assistant/chat', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }

    public function test_chat_rejects_message_over_500_characters(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => str_repeat('a', 501),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }

    public function test_chat_responds_to_product_search(): void
    {
        Product::factory()->count(3)->create(['name' => 'Blue Shirt', 'is_active' => true]);

        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Show me shirt',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'type'])
            ->assertJsonFragment(['type' => 'products']);
    }

    public function test_chat_shows_text_when_no_products_found(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Show me flying carpets',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);
    }

    public function test_chat_responds_to_empty_cart(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Show my cart',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('empty', $response->json('message'));
    }

    public function test_chat_returns_cart_for_authenticated_user_with_items(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 500, 'is_active' => true, 'stock_qty' => 10]);

        $this->actingAs($user)
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my cart']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'cart']);
    }

    public function test_cart_view_includes_free_shipping_alert(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 500, 'is_active' => true, 'stock_qty' => 10]);

        $this->actingAs($user)
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my cart']);

        $response->assertOk();
        $this->assertStringContainsStringIgnoringCase('shipping', $response->json('message'));
    }

    public function test_cart_shows_free_shipping_qualified_message(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 2500, 'is_active' => true, 'stock_qty' => 10]);

        $this->actingAs($user)
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my cart']);

        $response->assertOk();
        $this->assertStringContainsStringIgnoringCase('free shipping', $response->json('message'));
    }

    public function test_chat_responds_to_delivery_info(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'What is the delivery time?',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('delivery', $response->json('message'));
    }

    public function test_chat_responds_to_checkout_when_cart_empty(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'I want to checkout',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);
    }

    public function test_chat_asks_login_for_checkout_when_unauthenticated(): void
    {
        $product = Product::factory()->create(['price' => 300, 'is_active' => true, 'stock_qty' => 5]);
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'proceed to checkout',
        ]);

        $response->assertOk();
        $message = strtolower($response->json('message'));
        $this->assertTrue(
            str_contains($message, 'log') || str_contains($message, 'sign') || str_contains($message, 'cart'),
        );
    }

    public function test_chat_handles_add_to_cart_without_prior_search(): void
    {
        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Add the first one to cart',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('search', $response->json('message'));
    }

    public function test_chat_context_persists_between_requests(): void
    {
        Product::factory()->count(3)->create(['name' => 'Red Saree', 'is_active' => true, 'price' => 3000]);

        $this->postJson('/ai-assistant/chat', ['message' => 'Show me red sarees']);

        $response = $this->postJson('/ai-assistant/chat', ['message' => 'only under 2000']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'type']);
    }

    public function test_chat_disabled_returns_error_response(): void
    {
        config(['ai.enabled' => false]);

        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Hello',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'error']);
    }

    public function test_general_query_falls_back_gracefully_when_ai_key_missing(): void
    {
        $mock = Mockery::mock(AiProviderInterface::class);
        $mock->shouldReceive('isEnabled')->andReturn(false);
        $this->app->instance(AiProviderInterface::class, $mock);

        $response = $this->postJson('/ai-assistant/chat', [
            'message' => 'Tell me about this shop',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'type', 'actions']);
    }

    // ─── Order Status ──────────────────────────────────────────────────────────

    public function test_order_status_requires_login(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Show my recent orders']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('log', $response->json('message'));
    }

    public function test_order_status_shows_no_orders_message_when_none_placed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my recent orders']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('order', $response->json('message'));
    }

    public function test_order_status_shows_real_order_data(): void
    {
        $user = User::factory()->create();
        Order::factory()->create(['user_id' => $user->id, 'status' => 'shipped', 'total' => 1500]);

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Track my order']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $message = strtolower($response->json('message'));
        $this->assertTrue(str_contains($message, 'order') || str_contains($message, 'shipped'));
    }

    // ─── Wishlist ──────────────────────────────────────────────────────────────

    public function test_wishlist_view_requires_login(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Show my wishlist']);

        $response->assertOk();
        $this->assertStringContainsStringIgnoringCase('log', $response->json('message'));
    }

    public function test_wishlist_view_shows_empty_message(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my wishlist']);

        $response->assertOk();
        $this->assertStringContainsStringIgnoringCase('wishlist', $response->json('message'));
    }

    public function test_wishlist_view_shows_saved_products(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Show my wishlist']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'products']);
    }

    public function test_wishlist_add_requires_prior_search(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/ai-assistant/chat', ['message' => 'Add to wishlist']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('search', $response->json('message'));
    }

    // ─── Reviews ──────────────────────────────────────────────────────────────

    public function test_reviews_asks_to_search_when_no_context(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Show me reviews']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);
    }

    public function test_reviews_shown_for_product_in_context(): void
    {
        $product = Product::factory()->create(['name' => 'Cool Phone', 'is_active' => true]);
        Review::factory()->create(['product_id' => $product->id, 'is_approved' => true, 'rating' => 5, 'comment' => 'Amazing product!']);

        // Set context by searching first
        $this->postJson('/ai-assistant/chat', ['message' => 'Show me phones']);

        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Show me the reviews']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);
    }

    // ─── Coupons ──────────────────────────────────────────────────────────────

    public function test_coupon_info_shows_no_coupons_message(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Do you have any coupons?']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $message = strtolower($response->json('message'));
        $this->assertTrue(str_contains($message, 'coupon') || str_contains($message, 'shipping'));
    }

    public function test_coupon_info_shows_active_coupons(): void
    {
        Coupon::factory()->create([
            'code' => 'SAVE10',
            'type' => 'percent',
            'value' => 10,
            'is_active' => true,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Do you have any discount codes?']);

        $response->assertOk();
        $this->assertStringContainsString('SAVE10', $response->json('message'));
    }

    // ─── Product Comparison ───────────────────────────────────────────────────

    public function test_compare_products_requires_prior_search(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Compare these products']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('search', $response->json('message'));
    }

    public function test_compare_products_after_search(): void
    {
        Product::factory()->count(3)->create(['name' => 'Blue Shirt', 'is_active' => true, 'price' => 1500]);

        $this->postJson('/ai-assistant/chat', ['message' => 'Show me shirt']);

        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Compare the first two']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('comparison', $response->json('message'));
    }

    // ─── Size Guide ───────────────────────────────────────────────────────────

    public function test_size_guide_returns_sizing_info(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'Show me the size guide']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $this->assertStringContainsStringIgnoringCase('size', $response->json('message'));
    }

    // ─── Budget Filter ────────────────────────────────────────────────────────

    public function test_budget_filter_extracts_amount_and_searches(): void
    {
        Product::factory()->count(3)->create(['price' => 800, 'is_active' => true, 'name' => 'Budget Shirt']);

        $response = $this->postJson('/ai-assistant/chat', ['message' => 'I only have 1500']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'type']);
    }

    public function test_budget_filter_asks_for_amount_when_missing(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'something cheaper']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        $message = strtolower($response->json('message'));
        $this->assertTrue(str_contains($message, 'budget') || str_contains($message, 'amount'));
    }

    // ─── Bengali ──────────────────────────────────────────────────────────────

    public function test_bengali_message_is_detected_and_acknowledged(): void
    {
        $response = $this->postJson('/ai-assistant/chat', ['message' => 'আমি একটা শার্ট চাই']);

        $response->assertOk()
            ->assertJsonFragment(['type' => 'text']);

        // Should acknowledge Bengali and guide to use English/Banglish
        $this->assertStringContainsString('বাংলায়', $response->json('message'));
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
