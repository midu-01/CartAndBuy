<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'total_amount', 'order_status', 
        'payment_status', 'tracking_number', 'shipping_address'
    ];

    // Prevents N+1 by eager loading order items by default when calling orders
    protected $with = ['items']; 

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
    public function items(): HasMany {
        return $this->hasMany(OrderItem::class);
    }
}