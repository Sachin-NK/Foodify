<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $restaurants = [
            [
                'name' => 'Spice Kingdom',
                'logo' => '/images/spice-kingdom-logo.png',
                'cover_image' => '/images/spice-kingdom-cover.jpg',
                'location' => 'Colombo 03',
                'tags' => ['Indian', 'Spicy', 'Curry'],
                'rating' => 4.5,
                'delivery_time' => '25-35 min',
                'description' => 'Authentic Indian cuisine with traditional spices and flavors.',
                'is_active' => true
            ],
            [
                'name' => 'Burger Hub',
                'logo' => '/images/burger-hub-logo.png',
                'cover_image' => '/images/burger-hub-cover.jpg',
                'location' => 'Kandy City',
                'tags' => ['Fast Food', 'Burgers', 'Snacks'],
                'rating' => 4.2,
                'delivery_time' => '15-20 min',
                'description' => 'Juicy burgers and crispy fries made fresh to order.',
                'is_active' => true
            ],
            [
                'name' => 'Green Leaf Cafe',
                'logo' => '/images/green-leaf-logo.png',
                'cover_image' => '/images/green-leaf-cover.jpg',
                'location' => 'Galle Fort',
                'tags' => ['Vegan', 'Healthy', 'Salads'],
                'rating' => 4.8,
                'delivery_time' => '30-40 min',
                'description' => 'Fresh, organic, and healthy meals for conscious eaters.',
                'is_active' => true
            ],
            [
                'name' => 'Pizza Empire',
                'logo' => '/images/pizza-empire-logo.png',
                'cover_image' => '/images/pizza-empire-cover.jpg',
                'location' => 'Negombo',
                'tags' => ['Pizza', 'Italian', 'Cheese'],
                'rating' => 4.6,
                'delivery_time' => '20-30 min',
                'description' => 'Wood-fired pizzas with authentic Italian flavors.',
                'is_active' => true
            ],
            [
                'name' => 'Noodle House',
                'logo' => '/images/noodle-house-logo.png',
                'cover_image' => '/images/noodle-house-cover.jpg',
                'location' => 'Matara',
                'tags' => ['Asian', 'Noodles', 'Wok'],
                'rating' => 4.3,
                'delivery_time' => '25-35 min',
                'description' => 'Delicious Asian noodles and stir-fry dishes.',
                'is_active' => true
            ],
            [
                'name' => 'Dessert Bliss',
                'logo' => '/images/dessert-bliss-logo.png',
                'cover_image' => '/images/dessert-bliss-cover.jpg',
                'location' => 'Kurunegala',
                'tags' => ['Desserts', 'Ice Cream', 'Cakes'],
                'rating' => 4.9,
                'delivery_time' => '20-25 min',
                'description' => 'Sweet treats and desserts to satisfy your cravings.',
                'is_active' => true
            ],
            [
                'name' => 'Taco Town',
                'logo' => '/images/taco-town-logo.png',
                'cover_image' => '/images/taco-town-cover.jpg',
                'location' => 'Nugegoda',
                'tags' => ['Mexican', 'Tacos', 'Spicy'],
                'rating' => 4.4,
                'delivery_time' => '20-30 min',
                'description' => 'Authentic Mexican tacos and burritos with bold flavors.',
                'is_active' => true
            ],
            [
                'name' => 'Kottu Kulture',
                'logo' => '/images/kottu-kulture-logo.png',
                'cover_image' => '/images/kottu-kulture-cover.jpg',
                'location' => 'Jaffna',
                'tags' => ['Sri Lankan', 'Kottu', 'Street Food'],
                'rating' => 4.7,
                'delivery_time' => '15-25 min',
                'description' => 'Traditional Sri Lankan kottu and street food favorites.',
                'is_active' => true
            ],
            [
                'name' => 'Sushi Sensation',
                'logo' => '/images/sushi-sensation-logo.png',
                'cover_image' => '/images/sushi-sensation-cover.jpg',
                'location' => 'Dehiwala',
                'tags' => ['Japanese', 'Sushi', 'Seafood'],
                'rating' => 4.9,
                'delivery_time' => '30-40 min',
                'description' => 'Fresh sushi and Japanese cuisine prepared by expert chefs.',
                'is_active' => true
            ],
            [
                'name' => 'Toast & Brew',
                'logo' => '/images/toast-brew-logo.png',
                'cover_image' => '/images/toast-brew-cover.jpg',
                'location' => 'Battaramulla',
                'tags' => ['Cafe', 'Brunch', 'Coffee'],
                'rating' => 4.3,
                'delivery_time' => '20-30 min',
                'description' => 'Perfect brunch spot with artisan coffee and fresh toasts.',
                'is_active' => true
            ],
            [
                'name' => 'Wrap Republic',
                'logo' => '/images/wrap-republic-logo.png',
                'cover_image' => '/images/wrap-republic-cover.jpg',
                'location' => 'Nawala',
                'tags' => ['Healthy', 'Wraps', 'Fusion'],
                'rating' => 4.6,
                'delivery_time' => '25-35 min',
                'description' => 'Healthy wraps and fusion cuisine for the modern palate.',
                'is_active' => true
            ]
        ];

        foreach ($restaurants as $restaurant) {
            \App\Models\Restaurant::create($restaurant);
        }
    }
}
