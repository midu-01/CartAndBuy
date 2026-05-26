<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['code', 'type', 'value', 'min_order', 'max_uses', 'used_count', 'expires_at', 'is_active'])]
class Coupon extends Model
{
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
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
        if ($this->type === 'percent') {
            return round($orderTotal * ($this->value / 100), 2);
        }

        return min((float) $this->value, $orderTotal);
    }

    /** @param Builder<Coupon> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
