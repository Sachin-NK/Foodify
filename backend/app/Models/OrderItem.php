<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'item_name',
        'item_price',
        'quantity',
        'total_price',
        'special_instructions'
    ];

    protected $casts = [
        'item_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    // Boot method to calculate total price
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($orderItem) {
            $orderItem->total_price = $orderItem->item_price * $orderItem->quantity;
        });
    }
}
