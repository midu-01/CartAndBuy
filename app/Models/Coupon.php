<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['code', 'type', 'value', 'max_discount', 'min_order', 'max_uses', 'used_count', 'expires_at', 'is_active', 'once_per_customer', 'new_customers_only', 'user_id'])]
class Coupon extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'min_order' => 'decimal:2',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'once_per_customer' => 'boolean',
            'new_customers_only' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(float $orderTotal): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        if ($orderTotal < $this->min_order) {
            return false;
        }

        return true;
    }

    public function meetsUserRestrictions(?User $user): bool
    {
        // Coupons with user restrictions require login
        if (($this->user_id || $this->once_per_customer || $this->new_customers_only) && ! $user) {
            return false;
        }

        // Locked to a specific user
        if ($this->user_id && $this->user_id !== $user?->id) {
            return false;
        }

        // New customers only — user must have no prior orders
        if ($this->new_customers_only && $user && Order::where('user_id', $user->id)->exists()) {
            return false;
        }

        // Once per customer — user cannot have already used it
        if ($this->once_per_customer && $user && $this->hasBeenUsedByUser($user->id)) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $orderTotal): float
    {
        $discount = $this->type === 'percent'
            ? round($orderTotal * ($this->value / 100), 2)
            : min((float) $this->value, $orderTotal);

        if ($this->max_discount) {
            $discount = min($discount, (float) $this->max_discount);
        }

        return $discount;
    }

    public function hasBeenUsedByUser(int $userId): bool
    {
        return Order::where('user_id', $userId)->where('coupon_code', $this->code)->exists();
    }

    /** @param Builder<Coupon> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
