<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RestaurantOwnerController extends Controller
{
    /**
     * Get all restaurants owned by the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $restaurants = $user->restaurants()->with('menuCategories')->get();

        return response()->json([
            'success' => true,
            'data' => $restaurants
        ]);
    }

    /**
     * Create a new restaurant
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'delivery_time' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate restaurant name and address combination
        $existingRestaurant = Restaurant::where('name', $request->name)
            ->where('address', $request->address)
            ->first();

        if ($existingRestaurant) {
            return response()->json([
                'success' => false,
                'message' => 'A restaurant with this name and address already exists',
                'errors' => [
                    'name' => ['Restaurant with this name and address combination already exists']
                ]
            ], 422);
        }

        $restaurantData = [
            'name' => $request->name,
            'location' => $request->location,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'description' => $request->description,
            'tags' => $request->tags ?? [],
            'delivery_time' => $request->delivery_time ?? '30-45 min',
            'owner_id' => $request->user()->id,
            'is_active' => true,
            'rating' => 0.0
        ];

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('restaurants/logos', 'public');
            $restaurantData['logo'] = $logoPath;
        }

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('restaurants/covers', 'public');
            $restaurantData['cover_image'] = $coverPath;
        }

        $restaurant = Restaurant::create($restaurantData);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant created successfully',
            'data' => $restaurant
        ], 201);
    }

    /**
     * Get a specific restaurant for management
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->with(['menuCategories', 'menuItems'])->find($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $restaurant
        ]);
    }

    /**
     * Update restaurant information
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'delivery_time' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate restaurant name and address combination (excluding current restaurant)
        if ($request->has('name') && $request->has('address')) {
            $existingRestaurant = Restaurant::where('name', $request->name)
                ->where('address', $request->address)
                ->where('id', '!=', $id)
                ->first();

            if ($existingRestaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'A restaurant with this name and address already exists',
                    'errors' => [
                        'name' => ['Restaurant with this name and address combination already exists']
                    ]
                ], 422);
            }
        }

        $updateData = $request->only([
            'name', 'location', 'phone', 'email', 'address', 
            'description', 'tags', 'delivery_time', 'is_active'
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($restaurant->logo) {
                Storage::disk('public')->delete($restaurant->logo);
            }
            $logoPath = $request->file('logo')->store('restaurants/logos', 'public');
            $updateData['logo'] = $logoPath;
        }

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            // Delete old cover image if exists
            if ($restaurant->cover_image) {
                Storage::disk('public')->delete($restaurant->cover_image);
            }
            $coverPath = $request->file('cover_image')->store('restaurants/covers', 'public');
            $updateData['cover_image'] = $coverPath;
        }

        $restaurant->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant updated successfully',
            'data' => $restaurant->fresh()
        ]);
    }

    /**
     * Soft delete restaurant
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        // Soft delete by setting is_active to false
        $restaurant->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant deactivated successfully'
        ]);
    }
}