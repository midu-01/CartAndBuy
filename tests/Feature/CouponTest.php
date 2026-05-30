<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    private function postValidate(array $data): TestResponse
    {
        return $this->postJson(route('coupon.validate'), $data);
    }

    public function test_valid_percent_coupon_returns_discount(): void
    {
        $coupon = Coupon::factory()->percent(10)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson([
            'valid' => true,
            'code' => $coupon->code,
            'discount' => 10.0,
        ]);
    }

    public function test_valid_fixed_coupon_returns_discount(): void
    {
        $coupon = Coupon::factory()->fixed(15)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson([
            'valid' => true,
            'discount' => 15.0,
        ]);
    }

    public function test_fixed_coupon_discount_capped_at_order_total(): void
    {
        $coupon = Coupon::factory()->fixed(200)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 50]);

        $response->assertOk()->assertJson([
            'valid' => true,
            'discount' => 50.0,
        ]);
    }

    public function test_nonexistent_coupon_returns_invalid(): void
    {
        $response = $this->postValidate(['code' => 'FAKECODE', 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_inactive_coupon_returns_invalid(): void
    {
        $coupon = Coupon::factory()->inactive()->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_expired_coupon_returns_invalid(): void
    {
        $coupon = Coupon::factory()->expired()->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_coupon_with_min_order_not_met_returns_invalid(): void
    {
        $coupon = Coupon::factory()->percent(10)->withMinOrder(200)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 50]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_coupon_with_min_order_met_returns_valid(): void
    {
        $coupon = Coupon::factory()->percent(10)->withMinOrder(50)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson(['valid' => true]);
    }

    public function test_coupon_code_is_case_insensitive(): void
    {
        $coupon = Coupon::factory()->percent(10)->create(['code' => 'SAVE10']);

        $response = $this->postValidate(['code' => 'save10', 'order_total' => 100]);

        $response->assertOk()->assertJson(['valid' => true]);
    }

    public function test_coupon_at_max_uses_returns_invalid(): void
    {
        $coupon = Coupon::factory()->create(['max_uses' => 5, 'used_count' => 5]);

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_validate_requires_code_and_order_total(): void
    {
        $response = $this->postValidate([]);

        $response->assertStatus(422)->assertJsonValidationErrors(['code', 'order_total']);
    }

    // ─── Once per customer ────────────────────────────────────────────────────

    public function test_once_per_customer_coupon_rejected_for_returning_user(): void
    {
        $user = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->oncePerCustomer()->create(['code' => 'ONCE10']);
        Order::factory()->create(['user_id' => $user->id, 'coupon_code' => 'ONCE10']);

        $response = $this->actingAs($user)
            ->postValidate(['code' => 'ONCE10', 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
        $this->assertStringContainsStringIgnoringCase('already used', $response->json('message'));
    }

    public function test_once_per_customer_coupon_valid_for_first_use(): void
    {
        $user = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->oncePerCustomer()->create();

        $response = $this->actingAs($user)
            ->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson(['valid' => true]);
    }

    // ─── New customers only ───────────────────────────────────────────────────

    public function test_new_customers_only_coupon_rejected_for_returning_customer(): void
    {
        $user = User::factory()->create();
        Order::factory()->create(['user_id' => $user->id]);
        $coupon = Coupon::factory()->percent(10)->newCustomersOnly()->create();

        $response = $this->actingAs($user)
            ->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
        $this->assertStringContainsStringIgnoringCase('new customers', $response->json('message'));
    }

    public function test_new_customers_only_coupon_valid_for_user_with_no_orders(): void
    {
        $user = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->newCustomersOnly()->create();

        $response = $this->actingAs($user)
            ->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson(['valid' => true]);
    }

    // ─── Specific user ────────────────────────────────────────────────────────

    public function test_specific_user_coupon_rejected_for_wrong_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->forUser($owner->id)->create();

        $response = $this->actingAs($other)
            ->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }

    public function test_specific_user_coupon_valid_for_correct_user(): void
    {
        $user = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->forUser($user->id)->create();

        $response = $this->actingAs($user)
            ->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertOk()->assertJson(['valid' => true]);
    }

    public function test_specific_user_coupon_rejected_when_unauthenticated(): void
    {
        $user = User::factory()->create();
        $coupon = Coupon::factory()->percent(10)->forUser($user->id)->create();

        $response = $this->postValidate(['code' => $coupon->code, 'order_total' => 100]);

        $response->assertStatus(422)->assertJson(['valid' => false]);
    }
}
