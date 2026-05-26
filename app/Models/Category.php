<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'slug', 'image', 'parent_id'])]
class Category extends Model
{
    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Category, $this> */
    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /** @return \Illuminate\Database\Eloquent\Relations\HasMany<Category, $this> */
    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /** @return \Illuminate\Database\Eloquent\Relations\HasMany<Product, $this> */
    public function products(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Product::class);
    }
}
