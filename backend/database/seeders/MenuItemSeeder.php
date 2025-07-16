<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $menuItems = [
            // Spice Kingdom (Restaurant ID: 1)
            [
                'restaurant_id' => 1,
                'name' => 'Chicken Biryani',
                'description' => 'Aromatic basmati rice with tender chicken and traditional spices',
                'price' => 1850.00,
                'image' => '/images/chicken-biryani.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => true
            ],
            [
                'restaurant_id' => 1,
                'name' => 'Butter Chicken',
                'description' => 'Creamy tomato-based curry with tender chicken pieces',
                'price' => 1650.00,
                'image' => '/images/butter-chicken.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => false
            ],
            [
                'restaurant_id' => 1,
                'name' => 'Vegetable Samosa',
                'description' => 'Crispy pastry filled with spiced vegetables',
                'price' => 450.00,
                'image' => '/images/samosa.jpg',
                'category' => 'Appetizer',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => true
            ],

            // Burger Hub (Restaurant ID: 2)
            [
                'restaurant_id' => 2,
                'name' => 'Classic Beef Burger',
                'description' => 'Juicy beef patty with lettuce, tomato, and special sauce',
                'price' => 1250.00,
                'image' => '/images/beef-burger.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => false
            ],
            [
                'restaurant_id' => 2,
                'name' => 'Chicken Wings',
                'description' => 'Crispy chicken wings with your choice of sauce',
                'price' => 950.00,
                'image' => '/images/chicken-wings.jpg',
                'category' => 'Appetizer',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => true
            ],
            [
                'restaurant_id' => 2,
                'name' => 'French Fries',
                'description' => 'Golden crispy fries with sea salt',
                'price' => 550.00,
                'image' => '/images/french-fries.jpg',
                'category' => 'Side',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],

            // Green Leaf Cafe (Restaurant ID: 3)
            [
                'restaurant_id' => 3,
                'name' => 'Quinoa Buddha Bowl',
                'description' => 'Nutritious bowl with quinoa, avocado, and fresh vegetables',
                'price' => 1450.00,
                'image' => '/images/buddha-bowl.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],
            [
                'restaurant_id' => 3,
                'name' => 'Green Smoothie',
                'description' => 'Refreshing blend of spinach, apple, and banana',
                'price' => 650.00,
                'image' => '/images/green-smoothie.jpg',
                'category' => 'Beverage',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],

            // Pizza Empire (Restaurant ID: 4)
            [
                'restaurant_id' => 4,
                'name' => 'Margherita Pizza',
                'description' => 'Classic pizza with tomato sauce, mozzarella, and basil',
                'price' => 1750.00,
                'image' => '/images/margherita-pizza.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],
            [
                'restaurant_id' => 4,
                'name' => 'Pepperoni Pizza',
                'description' => 'Spicy pepperoni with mozzarella cheese',
                'price' => 1950.00,
                'image' => '/images/pepperoni-pizza.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => true
            ],

            // Noodle House (Restaurant ID: 5)
            [
                'restaurant_id' => 5,
                'name' => 'Pad Thai',
                'description' => 'Traditional Thai stir-fried noodles with shrimp',
                'price' => 1350.00,
                'image' => '/images/pad-thai.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => false,
                'is_spicy' => true
            ],
            [
                'restaurant_id' => 5,
                'name' => 'Vegetable Fried Rice',
                'description' => 'Wok-fried rice with mixed vegetables',
                'price' => 1150.00,
                'image' => '/images/fried-rice.jpg',
                'category' => 'Main Course',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],

            // Dessert Bliss (Restaurant ID: 6)
            [
                'restaurant_id' => 6,
                'name' => 'Chocolate Lava Cake',
                'description' => 'Warm chocolate cake with molten center',
                'price' => 850.00,
                'image' => '/images/lava-cake.jpg',
                'category' => 'Dessert',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ],
            [
                'restaurant_id' => 6,
                'name' => 'Vanilla Ice Cream',
                'description' => 'Premium vanilla ice cream with toppings',
                'price' => 450.00,
                'image' => '/images/vanilla-ice-cream.jpg',
                'category' => 'Dessert',
                'is_available' => true,
                'is_vegetarian' => true,
                'is_spicy' => false
            ]
        ];

        foreach ($menuItems as $item) {
            \App\Models\MenuItem::create($item);
        }
    }
}
