<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class KeycapDesign extends Model
{
    protected $fillable = [
        'user_id', 'name', 'layout', 'base_color', 'preview_image', 'is_public',
    ];
 
    protected $casts = ['is_public' => 'boolean'];
 
    // ── Relaciones ───────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function keys()
    {
        return $this->hasMany(KeycapDesignKey::class, 'design_id');
    }
 
    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'design_id');
    }
}