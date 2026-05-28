<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
            'status' => 'published',
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
            'status' => 'published',
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

    public function test_admin_can_export_products_csv(): void
    {
        $product = Product::factory()->create(['name' => 'Exportable Product', 'sku' => 'EXP-001']);
        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'sku' => 'EXP-001-RED',
            'attributes' => ['color' => 'Red'],
            'price_modifier' => 10.00,
            'stock_qty' => 5,
        ]);

        $response = $this->actingAs($this->admin())->get(route('admin.products.export'));
        $content = $response->streamedContent();

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('variant_sku', $content);
        $this->assertStringContainsString('variant_attributes', $content);
        $this->assertStringContainsString('Exportable Product', $content);
        $this->assertStringContainsString('EXP-001-RED', $content);
        $this->assertStringContainsString('"color"', $content);
    }

    public function test_admin_can_import_products_csv(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'products-import');
        file_put_contents($path, implode("\n", [
            'name,sku,description,price,sale_price,stock_qty,status,is_active,is_featured,tags,variant_sku,variant_attributes,variant_price_modifier,variant_stock_qty,variant_is_active',
            'Imported Product,IMP-001,Imported description,199.99,,8,published,1,0,"summer,new",,,,,',
        ]));

        $file = new UploadedFile($path, 'products.csv', 'text/csv', null, true);

        $response = $this->actingAs($this->admin())->post(route('admin.products.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', [
            'name' => 'Imported Product',
            'sku' => 'IMP-001',
            'price' => 199.99,
            'stock_qty' => 8,
        ]);
    }

    public function test_admin_can_import_products_with_variants(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'products-import-variants');
        file_put_contents($path, implode("\n", [
            'name,sku,description,price,sale_price,stock_qty,status,is_active,is_featured,tags,variant_sku,variant_attributes,variant_price_modifier,variant_stock_qty,variant_is_active',
            'Variant Product,VAR-001,A product with variants,500,,0,published,1,0,,VAR-001-S,"{""size"":""S""}",0,10,1',
            'Variant Product,VAR-001,A product with variants,500,,0,published,1,0,,VAR-001-M,"{""size"":""M""}",50,8,1',
        ]));

        $file = new UploadedFile($path, 'products.csv', 'text/csv', null, true);

        $this->actingAs($this->admin())->post(route('admin.products.import'), ['file' => $file]);

        $product = Product::where('sku', 'VAR-001')->first();
        $this->assertNotNull($product);
        $this->assertSame(2, $product->variants()->count());
        $this->assertDatabaseHas('product_variants', ['sku' => 'VAR-001-S', 'stock_qty' => 10]);
        $this->assertDatabaseHas('product_variants', ['sku' => 'VAR-001-M', 'stock_qty' => 8, 'price_modifier' => 50]);
    }

    public function test_import_updates_existing_product_without_changing_slug(): void
    {
        $existing = Product::factory()->create(['name' => 'Old Name', 'sku' => 'UPD-001', 'slug' => 'old-name-abc12']);

        $path = tempnam(sys_get_temp_dir(), 'products-import-update');
        file_put_contents($path, implode("\n", [
            'name,sku,description,price,sale_price,stock_qty,status,is_active,is_featured,tags,variant_sku,variant_attributes,variant_price_modifier,variant_stock_qty,variant_is_active',
            'Updated Name,UPD-001,Updated desc,299,,5,published,1,0,,,,,,',
        ]));

        $file = new UploadedFile($path, 'products.csv', 'text/csv', null, true);

        $this->actingAs($this->admin())->post(route('admin.products.import'), ['file' => $file]);

        $existing->refresh();
        $this->assertSame('Updated Name', $existing->name);
        $this->assertSame('old-name-abc12', $existing->slug);
    }

    public function test_due_scheduled_products_can_be_published_by_command(): void
    {
        $due = Product::factory()->create([
            'status' => 'scheduled',
            'publish_at' => now()->subMinute(),
        ]);
        $future = Product::factory()->create([
            'status' => 'scheduled',
            'publish_at' => now()->addHour(),
        ]);

        $this->artisan('products:publish-scheduled')
            ->expectsOutput('Published 1 scheduled product.')
            ->assertSuccessful();

        $this->assertDatabaseHas('products', [
            'id' => $due->id,
            'status' => 'published',
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $future->id,
            'status' => 'scheduled',
        ]);
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
