<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class KeycapDesignKey extends Model
{
    protected $fillable = [
        'design_id', 'key_code', 'label', 'color', 'text_color', 'font', 'icon',
    ];
 
    public function design()
    {
        return $this->belongsTo(KeycapDesign::class);
    }
}