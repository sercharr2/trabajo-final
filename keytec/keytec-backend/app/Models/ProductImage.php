<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'alt_text', 'is_primary', 'order'];
 
    protected $casts = ['is_primary' => 'boolean'];
 
    protected $appends = ['url'];
 
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
 
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}