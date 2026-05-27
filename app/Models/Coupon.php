<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['code', 'type', 'value', 'max_discount', 'min_order', 'max_uses', 'used_count', 'expires_at', 'is_active'])]
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
        ];
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
