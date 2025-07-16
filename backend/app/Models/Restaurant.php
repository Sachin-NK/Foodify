<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'cover_image',
        'location',
        'tags',
        'rating',
        'delivery_time',
        'description',
        'is_active'
    ];

    protected $casts = [
        'tags' => 'array',
        'rating' => 'decimal:1',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function availableMenuItems()
    {
        return $this->hasMany(MenuItem::class)->where('is_available', true);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    public function scopeByRating($query, $minRating)
    {
        return $query->where('rating', '>=', $minRating);
    }
}
