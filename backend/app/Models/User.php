<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relationships
    public function restaurants()
    {
        return $this->hasMany(Restaurant::class, 'owner_id');
    }

    // Helper methods
    public function isRestaurantOwner()
    {
        return $this->role === 'restaurant_owner';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function ownsRestaurant($restaurantId)
    {
        return $this->restaurants()->where('id', $restaurantId)->exists();
    }
}
