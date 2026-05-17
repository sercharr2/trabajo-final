<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
 
class Product extends Model
{
    use HasSlug;
 
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'short_description',
        'price', 'sale_price', 'stock', 'sku', 'weight',
        'is_active', 'is_featured', 'is_customizable',
    ];
 
    protected $casts = [
        'price'           => 'float',
        'sale_price'      => 'float',
        'is_active'       => 'boolean',
        'is_featured'     => 'boolean',
        'is_customizable' => 'boolean',
    ];
 
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }
 
    // ── Accessors ────────────────────────────────────────────
    // Devuelve el precio efectivo (oferta si existe, si no el normal)
    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }
 
    // URL de la imagen principal
    public function getPrimaryImageUrlAttribute(): ?string
    {
        $primary = $this->images()->where('is_primary', true)->first();
        return $primary ? $primary->url : null;
    }
 
    // ── Scopes ───────────────────────────────────────────────
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
 
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
 
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }
 
    // ── Relaciones ───────────────────────────────────────────
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
 
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }
 
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class)->orderBy('order');
    }
 
    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
 
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
 
    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }
 
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}