<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class CartItem extends Model
{
    protected $fillable = ['user_id', 'product_id', 'design_id', 'quantity'];
 
    // ── Relaciones ───────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
 
    public function design()
    {
        return $this->belongsTo(KeycapDesign::class, 'design_id');
    }
 
    // ── Accessors ────────────────────────────────────────────
    public function getLineTotalAttribute(): float
    {
        return $this->product->current_price * $this->quantity;
    }
}