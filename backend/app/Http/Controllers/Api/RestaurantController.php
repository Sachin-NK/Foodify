<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    /**
     * Get all restaurants with filtering options
     */
    public function index(Request $request)
    {
        $query = Restaurant::active();

        // Filter by search term
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Filter by tag/category
        if ($request->has('category') && $request->category !== 'all') {
            $query->byTag($request->category);
        }

        // Filter by minimum rating
        if ($request->has('rating') && $request->rating !== 'all') {
            $minRating = floatval($request->rating);
            $query->byRating($minRating);
        }

        // Filter by delivery time (simplified)
        if ($request->has('delivery_time') && $request->delivery_time !== 'all') {
            $maxTime = intval($request->delivery_time);
            // This is a simplified filter - in real app you'd parse the delivery_time string
            $query->where('delivery_time', 'LIKE', "%{$maxTime}%");
        }

        // Sort by rating (default) or other criteria
        $sortBy = $request->get('sort_by', 'rating');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $restaurants = $query->get();

        return response()->json($restaurants);
    }

    /**
     * Get a specific restaurant with its menu items
     */
    public function show($id)
    {
        $restaurant = Restaurant::with('availableMenuItems')->find($id);

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        return response()->json($restaurant);
    }

    /**
     * Get restaurant menu items
     */
    public function menu($id, Request $request)
    {
        $restaurant = Restaurant::find($id);

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $query = $restaurant->availableMenuItems();

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }

        // Filter by dietary preferences
        if ($request->has('vegetarian') && $request->vegetarian === 'true') {
            $query->vegetarian();
        }

        if ($request->has('spicy') && $request->spicy === 'true') {
            $query->spicy();
        }

        // Sort by price or name
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $menuItems = $query->get();

        return response()->json([
            'restaurant' => $restaurant,
            'menu_items' => $menuItems
        ]);
    }
}
