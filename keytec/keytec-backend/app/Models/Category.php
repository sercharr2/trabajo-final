<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
 
class Category extends Model
{
    use HasSlug;
 
    protected $fillable = [
        'name', 'slug', 'description', 'image', 'parent_id', 'order', 'is_active',
    ];
 
    protected $casts = ['is_active' => 'boolean'];
 
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }
 
    // ── Relaciones ───────────────────────────────────────────
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }
 
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
 
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}