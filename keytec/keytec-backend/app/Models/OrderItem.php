<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'design_id',
        'product_name', 'unit_price', 'quantity', 'subtotal',
    ];
 
    protected $casts = [
        'unit_price' => 'float',
        'subtotal'   => 'float',
    ];
 
    // ── Relaciones ───────────────────────────────────────────
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
 
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
 
    public function design()
    {
        return $this->belongsTo(KeycapDesign::class, 'design_id');
    }
}