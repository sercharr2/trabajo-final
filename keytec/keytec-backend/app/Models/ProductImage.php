<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'alt_text', 'is_primary', 'order'];
    protected $casts = ['is_primary' => 'boolean'];
    protected $appends = ['url'];

    /**
     * Si path empieza por http(s)://, devuelve la URL tal cual.
     * Si es un path relativo, lo prefijamos con /storage/.
     */
    public function getUrlAttribute(): string
    {
        if (preg_match('#^https?://#i', $this->path)) {
            return $this->path;
        }
        return asset('storage/' . $this->path);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
