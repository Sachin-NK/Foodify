<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuCategoryController extends Controller
{
    /**
     * Get all menu categories for a restaurant
     */
    public function index(Request $request, $restaurantId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found or you do not have permission to access it'
            ], 404);
        }

        $categories = $restaurant->menuCategories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Create new menu category
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
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate category name in this restaurant
        $existingCategory = $restaurant->menuCategories()->where('name', $request->name)->first();
        if ($existingCategory) {
            return response()->json([
                'success' => false,
                'message' => 'A category with this name already exists for this restaurant',
                'errors' => [
                    'name' => ['Category name already exists']
                ]
            ], 422);
        }

        $categoryData = [
            'restaurant_id' => $restaurantId,
            'name' => $request->name,
            'description' => $request->description,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true)
        ];

        $category = MenuCategory::create($categoryData);

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully',
            'data' => $category
        ], 201);
    }

    /**
     * Get specific menu category
     */
    public function show(Request $request, $restaurantId, $categoryId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $category = $restaurant->menuCategories()->find($categoryId);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        // Get menu items in this category
        $menuItems = $restaurant->menuItems()
            ->where('category', $category->name)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'menu_items' => $menuItems
            ]
        ]);
    }

    /**
     * Update menu category
     */
    public function update(Request $request, $restaurantId, $categoryId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $category = $restaurant->menuCategories()->find($categoryId);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate category name in this restaurant (excluding current category)
        if ($request->has('name') && $request->name !== $category->name) {
            $existingCategory = $restaurant->menuCategories()
                ->where('name', $request->name)
                ->where('id', '!=', $categoryId)
                ->first();
                
            if ($existingCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'A category with this name already exists for this restaurant',
                    'errors' => [
                        'name' => ['Category name already exists']
                    ]
                ], 422);
            }

            // If name is changing, update all menu items with this category
            $oldName = $category->name;
            $newName = $request->name;
            
            // Update menu items with this category
            $restaurant->menuItems()
                ->where('category', $oldName)
                ->update(['category' => $newName]);
        }

        $updateData = $request->only([
            'name', 'description', 'sort_order', 'is_active'
        ]);

        $category->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Menu category updated successfully',
            'data' => $category->fresh()
        ]);
    }

    /**
     * Delete menu category
     */
    public function destroy(Request $request, $restaurantId, $categoryId)
    {
        $user = $request->user();
        $restaurant = $user->restaurants()->find($restaurantId);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        $category = $restaurant->menuCategories()->find($categoryId);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        // Check if there are menu items in this category
        $menuItemsCount = $restaurant->menuItems()
            ->where('category', $category->name)
            ->count();

        if ($menuItemsCount > 0 && !$request->has('force')) {
            return response()->json([
                'success' => false,
                'message' => 'This category contains menu items. Please reassign or confirm deletion.',
                'data' => [
                    'items_count' => $menuItemsCount,
                    'requires_confirmation' => true
                ]
            ], 422);
        }

        // If force is true, reassign menu items to "Uncategorized" or delete based on request
        if ($menuItemsCount > 0 && $request->boolean('force')) {
            if ($request->has('reassign_to')) {
                // Reassign to another category
                $newCategory = $request->reassign_to;
                $restaurant->menuItems()
                    ->where('category', $category->name)
                    ->update(['category' => $newCategory]);
            } else {
                // Set to "Uncategorized"
                $restaurant->menuItems()
                    ->where('category', $category->name)
                    ->update(['category' => 'Uncategorized']);
            }
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu category deleted successfully'
        ]);
    }

    /**
     * Update category sort order
     */
    public function updateSortOrder(Request $request, $restaurantId)
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
            'categories' => 'required|array',
            'categories.*.id' => 'required|integer|exists:menu_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $categories = $request->categories;

        foreach ($categories as $categoryData) {
            $category = $restaurant->menuCategories()->find($categoryData['id']);
            if ($category) {
                $category->update(['sort_order' => $categoryData['sort_order']]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Category sort order updated successfully'
        ]);
    }
}