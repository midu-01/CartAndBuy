<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'guest_email', 'guest_phone', 'status', 'subtotal', 'shipping_cost', 'total',
    'shipping_address', 'payment_method', 'payment_status', 'coupon_code', 'discount_amount',
    'points_redeemed', 'wallet_used',
    'transaction_id', 'is_gift', 'gift_message', 'notes', 'requested_delivery_date',
    'requested_delivery_time', 'tracking_number', 'courier_name', 'tracking_url', 'order_token',
])]
class Order extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'is_gift' => 'boolean',
            'requested_delivery_date' => 'date',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    /** @return HasMany<OrderRequest, $this> */
    public function requests(): HasMany
    {
        return $this->hasMany(OrderRequest::class);
    }
}
