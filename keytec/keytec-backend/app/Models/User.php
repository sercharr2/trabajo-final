<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
 
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
 
    protected $fillable = [
        'name', 'email', 'password', 'role',
        'phone', 'address', 'city', 'postal_code', 'country', 'avatar',
    ];
 
    protected $hidden = ['password', 'remember_token'];
 
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
 
    // ── Helpers ──────────────────────────────────────────────
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
 
    // ── Relaciones ───────────────────────────────────────────
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
 
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
 
    public function keycapDesigns()
    {
        return $this->hasMany(KeycapDesign::class);
    }
 
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}