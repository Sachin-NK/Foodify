<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'name',
        'description',
        'price',
        'price_history',
        'image',
        'category',
        'is_available',
        'is_vegetarian',
        'is_spicy',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_history' => 'array',
        'is_available' => 'boolean',
        'is_vegetarian' => 'boolean',
        'is_spicy' => 'boolean'
    ];

    // Relationships
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    public function scopeSpicy($query)
    {
        return $query->where('is_spicy', true);
    }

    // Price history methods
    public function addPriceToHistory($oldPrice, $newPrice, $userId)
    {
        $history = $this->price_history ?? [];
        $history[] = [
            'old_price' => $oldPrice,
            'new_price' => $newPrice,
            'changed_by' => $userId,
            'changed_at' => now()->toISOString()
        ];
        $this->price_history = $history;
    }

    public function getPriceHistory()
    {
        return $this->price_history ?? [];
    }
}
