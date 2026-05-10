<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status',
        'subtotal', 'shipping_cost', 'total',
        'shipping_address', 'payment_method', 'payment_id', 'payment_status',
        'notes', 'paid_at', 'shipped_at',
    ];
 
    protected $casts = [
        'shipping_address' => 'array',   // JSON → array automáticamente
        'paid_at'          => 'datetime',
        'shipped_at'       => 'datetime',
        'subtotal'         => 'float',
        'shipping_cost'    => 'float',
        'total'            => 'float',
    ];
 
    // Genera número de pedido único al crear
    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->order_number = 'KT-' . date('Y') . '-' . str_pad(
                (Order::whereYear('created_at', date('Y'))->count() + 1),
                5, '0', STR_PAD_LEFT
            );
        });
    }
 
    // ── Relaciones ───────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}