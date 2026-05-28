<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'type', 'regions', 'cost', 'min_order_amount_for_free_shipping', 'is_active'])]
class ShippingRule extends Model
{
    protected function casts(): array
    {
        return [
            'regions' => 'array',
            'cost' => 'decimal:2',
            'min_order_amount_for_free_shipping' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
