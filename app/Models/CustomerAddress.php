<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'label', 'recipient_name', 'recipient_phone', 'address_line', 'city', 'area', 'postal_code', 'is_default'])]
class CustomerAddress extends Model
{
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<CustomerAddress> $query */
    public function scopeDefault(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }
}
