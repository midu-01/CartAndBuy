<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStockNotification;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopProductTest extends TestCase
{
    use RefreshDatabase;

    // --- Home page ---

    public function test_home_page_is_accessible(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('shop/home'));
    }

    public function test_home_page_shows_featured_products(): void
    {
        $featured = Product::factory()->featured()->count(3)->create();
        Product::factory()->count(2)->create(); // non-featured

        $response = $this->get(route('home'));

        $response->assertInertia(fn ($page) => $page
            ->component('shop/home')
            ->has('featuredProducts', 3)
        );
    }

    // --- Product listing ---

    public function test_shop_listing_page_is_accessible(): void
    {
        $response = $this->get(route('shop.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('shop/products'));
    }

    public function test_shop_listing_only_shows_active_products(): void
    {
        Product::factory()->count(3)->create();
        Product::factory()->inactive()->count(2)->create();

        $response = $this->get(route('shop.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('shop/products')
            ->where('products.total', 3)
        );
    }

    public function test_shop_listing_can_be_filtered_by_search(): void
    {
        Product::factory()->create(['name' => 'Wireless Headphones']);
        Product::factory()->create(['name' => 'Running Shoes']);

        $response = $this->get(route('shop.index', ['search' => 'Wireless']));

        $response->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
        );
    }

    public function test_shop_listing_can_be_filtered_by_category(): void
    {
        $cat = Category::factory()->create();
        Product::factory()->create(['category_id' => $cat->id]);
        Product::factory()->count(2)->create(); // different category

        $response = $this->get(route('shop.index', ['category' => $cat->id]));

        $response->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
        );
    }

    public function test_shop_listing_can_be_filtered_by_price_range(): void
    {
        Product::factory()->create(['price' => 20]);
        Product::factory()->create(['price' => 150]);

        $response = $this->get(route('shop.index', ['min_price' => 100]));

        $response->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
        );
    }

    // --- Product detail ---

    public function test_product_detail_page_is_accessible(): void
    {
        $product = Product::factory()->create();

        $response = $this->get(route('products.show', $product));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('shop/product-detail')
            ->where('product.id', $product->id)
        );
    }

    public function test_inactive_product_returns_404(): void
    {
        $product = Product::factory()->inactive()->create();

        $response = $this->get(route('products.show', $product));

        $response->assertNotFound();
    }

    public function test_product_detail_shows_approved_reviews_only(): void
    {
        $product = Product::factory()->create();
        Review::factory()->approved()->create(['product_id' => $product->id]);
        Review::factory()->create(['product_id' => $product->id]); // unapproved

        $response = $this->get(route('products.show', $product));

        $response->assertInertia(fn ($page) => $page
            ->has('product.reviews', 1)
        );
    }

    public function test_product_detail_shows_related_products_from_same_category(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->count(2)->create(['category_id' => $category->id]);
        Product::factory()->create(); // different category

        $response = $this->get(route('products.show', $product));

        $response->assertInertia(fn ($page) => $page
            ->has('relatedProducts', 2)
        );
    }

    public function test_product_detail_shows_user_wishlisted_status(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $user->wishlists()->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('products.show', $product));

        $response->assertInertia(fn ($page) => $page
            ->where('userWishlisted', true)
        );
    }

    public function test_product_detail_shows_user_reviewed_status(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Review::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('products.show', $product));

        $response->assertInertia(fn ($page) => $page
            ->where('userReviewed', true)
        );
    }

    public function test_product_detail_tracks_recently_viewed_products(): void
    {
        $first = Product::factory()->create();
        $second = Product::factory()->create();

        $this->get(route('products.show', $first));
        $response = $this->get(route('products.show', $second));

        $response->assertInertia(fn ($page) => $page
            ->has('recentlyViewed', 1)
            ->where('recentlyViewed.0.id', $first->id)
        );
    }

    public function test_compare_page_shows_selected_products(): void
    {
        $products = Product::factory()->count(2)->create();

        $response = $this->get(route('products.compare', [
            'products' => $products->pluck('id')->implode(','),
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('shop/compare')
            ->has('products', 2)
        );
    }

    public function test_customer_can_request_out_of_stock_notification(): void
    {
        $product = Product::factory()->outOfStock()->create();

        $response = $this->post(route('products.stock-notifications.store', $product), [
            'email' => 'buyer@example.com',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('product_stock_notifications', [
            'product_id' => $product->id,
            'email' => 'buyer@example.com',
            'notified_at' => null,
        ]);
    }

    public function test_duplicate_stock_notification_request_is_reused(): void
    {
        $product = Product::factory()->outOfStock()->create();
        ProductStockNotification::create([
            'product_id' => $product->id,
            'email' => 'buyer@example.com',
        ]);

        $this->post(route('products.stock-notifications.store', $product), [
            'email' => 'buyer@example.com',
        ]);

        $this->assertDatabaseCount('product_stock_notifications', 1);
    }

    // --- Reviews ---

    public function test_authenticated_user_can_submit_review(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->post(route('reviews.store', $product), [
            'rating' => 5,
            'comment' => 'Great product!',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 5,
            'is_approved' => false,
        ]);
    }

    public function test_guest_cannot_submit_review(): void
    {
        $product = Product::factory()->create();

        $response = $this->post(route('reviews.store', $product), [
            'rating' => 4,
            'comment' => 'Nice!',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_user_submitting_second_review_updates_existing(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Review::factory()->create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 5]);

        $response = $this->actingAs($user)->post(route('reviews.store', $product), [
            'rating' => 2,
            'comment' => 'Changed my mind',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', ['user_id' => $user->id, 'rating' => 2]);
    }
}
