<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MenuManagementController extends Controller
{
    /**
     * Get all menu items for owned restaurant
     */
    public function index(Request $request, $restaurantId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $menuItems = $restaurant->menuItems()
            ->with(['creator', 'updater'])
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menuItems
        ]);
    }

    /**
     * Create new menu item
     */
    public function store(Request $request, $restaurantId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_vegetarian' => 'boolean',
            'is_spicy' => 'boolean',
            'is_available' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $menuItemData = [
            'restaurant_id' => $restaurantId,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'is_vegetarian' => $request->boolean('is_vegetarian', false),
            'is_spicy' => $request->boolean('is_spicy', false),
            'is_available' => $request->boolean('is_available', true),
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'price_history' => []
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menu-items', 'public');
            $menuItemData['image'] = $imagePath;
        }

        $menuItem = MenuItem::create($menuItemData);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully',
            'data' => $menuItem->load(['creator', 'updater'])
        ], 201);
    }

    /**
     * Get specific menu item
     */
    public function show(Request $request, $restaurantId, $itemId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $menuItem = $restaurant->menuItems()
            ->with(['creator', 'updater'])
            ->find($itemId);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menuItem
        ]);
    }

    /**
     * Update menu item
     */
    public function update(Request $request, $restaurantId, $itemId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $menuItem = $restaurant->menuItems()->find($itemId);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_vegetarian' => 'boolean',
            'is_spicy' => 'boolean',
            'is_available' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'name', 'description', 'category', 'is_vegetarian', 'is_spicy', 'is_available'
        ]);

        // Handle price change and history tracking
        if ($request->has('price')) {
            $newPrice = $request->price;
            $oldPrice = $menuItem->price;

            if ($newPrice != $oldPrice) {
                $menuItem->addPriceToHistory($oldPrice, $newPrice, $user->id);
                $updateData['price'] = $newPrice;
                $updateData['price_history'] = $menuItem->price_history;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $imagePath = $request->file('image')->store('menu-items', 'public');
            $updateData['image'] = $imagePath;
        }

        $updateData['updated_by'] = $user->id;
        $menuItem->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $menuItem->fresh(['creator', 'updater'])
        ]);
    }

    /**
     * Delete menu item
     */
    public function destroy(Request $request, $restaurantId, $itemId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $menuItem = $restaurant->menuItems()->find($itemId);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        // Delete image if exists
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully'
        ]);
    }

    /**
     * Toggle menu item availability
     */
    public function toggleAvailability(Request $request, $restaurantId, $itemId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $menuItem = $restaurant->menuItems()->find($itemId);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $menuItem->update([
            'is_available' => !$menuItem->is_available,
            'updated_by' => $user->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu item availability updated successfully',
            'data' => [
                'id' => $menuItem->id,
                'is_available' => $menuItem->is_available
            ]
        ]);
    }
}