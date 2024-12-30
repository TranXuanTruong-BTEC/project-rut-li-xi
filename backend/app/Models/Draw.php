<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Draw extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'is_paid',
        'paid_at'
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'paid_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 