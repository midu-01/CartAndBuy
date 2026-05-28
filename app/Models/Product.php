<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'slug', 'sku', 'description', 'price', 'sale_price',
    'stock_qty', 'category_id', 'brand_id', 'images', 'tags', 'label',
    'is_featured', 'is_active', 'status', 'publish_at', 'video_url',
    'size_chart', 'faqs', 'low_stock_threshold',
])]
class Product extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'tags' => 'array',
            'size_chart' => 'array',
            'faqs' => 'array',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'publish_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** @return HasMany<CartItem, $this> */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<Wishlist, $this> */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /** @return HasMany<ProductVariant, $this> */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** @return HasMany<ProductStockNotification, $this> */
    public function stockNotifications(): HasMany
    {
        return $this->hasMany(ProductStockNotification::class);
    }

    public function getEffectivePriceAttribute(): string
    {
        return $this->sale_price ?? $this->price;
    }

    public function hasVariants(): bool
    {
        return $this->variants()->exists();
    }

    public function isInStock(): bool
    {
        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            return $this->variants->contains(fn (ProductVariant $v) => $v->stock_qty > 0);
        }

        return $this->stock_qty > 0;
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty > 0 && $this->stock_qty <= $this->low_stock_threshold;
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled' && $this->publish_at && $this->publish_at->isFuture();
    }

    /** @param Builder<Product> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<Product> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_active', true)
            ->where('status', 'published')
            ->where(fn (Builder $q) => $q->whereNull('publish_at')->orWhere('publish_at', '<=', now()));
    }

    /** @param Builder<Product> $query */
    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    /** @param Builder<Product> $query */
    public function scopeLowStock(Builder $query): void
    {
        $query->where('stock_qty', '>', 0)
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold');
    }
}
