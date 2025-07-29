<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $cartItems = Cart::with(['menuItem.restaurant'])
            ->where('user_id', $userId)
            ->get();

        $formattedItems = [];
        $subtotal = 0;

        foreach ($cartItems as $cartItem) {
            $menuItem = $cartItem->menuItem;
            if ($menuItem && $menuItem->restaurant) {
                $itemTotal = $menuItem->price * $cartItem->quantity;
                $formattedItems[] = [
                    'id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'price' => $menuItem->price,
                    'quantity' => $cartItem->quantity,
                    'total' => $itemTotal,
                    'restaurant' => $menuItem->restaurant->name,
                    'restaurant_id' => $menuItem->restaurant_id,
                    'image' => $menuItem->image,
                    'special_instructions' => $cartItem->special_instructions ?? ''
                ];
                $subtotal += $itemTotal;
            }
        }

        return response()->json([
            'cart_items' => $formattedItems,
            'subtotal' => $subtotal,
            'delivery_fee' => $subtotal > 1500 ? 0 : 200,
            'total' => $subtotal + ($subtotal > 1500 ? 0 : 200)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1|max:99',
            'special_instructions' => 'nullable|string|max:255'
        ]);

        $menuItem = MenuItem::with('restaurant')->find($request->menu_item_id);
        
        if (!$menuItem) {
            return response()->json(['message' => 'Menu item not found'], 404);
        }
        
        if (!$menuItem->is_available) {
            return response()->json(['message' => 'This item is currently not available'], 400);
        }

        if (!$menuItem->restaurant || !$menuItem->restaurant->is_active) {
            return response()->json(['message' => 'Restaurant is currently not available'], 400);
        }

        $userId = $request->user()->id;
        $itemId = $request->menu_item_id;

        // Check if cart has items from different restaurant
        $existingCartItems = Cart::with('menuItem')->where('user_id', $userId)->get();
        if ($existingCartItems->isNotEmpty()) {
            $existingRestaurantId = $existingCartItems->first()->menuItem->restaurant_id;
            if ($existingRestaurantId !== $menuItem->restaurant_id) {
                return response()->json([
                    'message' => 'Cannot add items from different restaurants to the same cart'
                ], 400);
            }
        }

        // Find existing cart item or create new one
        $cartItem = Cart::where('user_id', $userId)
            ->where('menu_item_id', $itemId)
            ->first();

        if ($cartItem) {
            // Update existing item
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($newQuantity > 99) {
                return response()->json(['message' => 'Maximum 99 items allowed per menu item'], 400);
            }
            $cartItem->quantity = $newQuantity;
            if ($request->special_instructions) {
                $cartItem->special_instructions = $request->special_instructions;
            }
            $cartItem->save();
        } else {
            // Create new cart item
            Cart::create([
                'user_id' => $userId,
                'menu_item_id' => $itemId,
                'quantity' => $request->quantity,
                'special_instructions' => $request->special_instructions ?? ''
            ]);
        }

        $totalItems = Cart::where('user_id', $userId)->sum('quantity');

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_count' => $totalItems
        ]);
    }

    public function update(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:99'
        ]);

        $userId = $request->user()->id;
        $cartItem = Cart::where('user_id', $userId)
            ->where('menu_item_id', $itemId)
            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        // Verify the menu item still exists and is available
        $menuItem = MenuItem::find($itemId);
        if (!$menuItem) {
            // Remove item from cart if it no longer exists
            $cartItem->delete();
            return response()->json(['message' => 'Item no longer available and has been removed from cart'], 404);
        }

        if (!$menuItem->is_available) {
            return response()->json(['message' => 'Item is no longer available'], 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        $totalItems = Cart::where('user_id', $userId)->sum('quantity');

        return response()->json([
            'message' => 'Cart updated successfully',
            'cart_count' => $totalItems
        ]);
    }

    public function destroy(Request $request, $itemId)
    {
        $userId = $request->user()->id;
        $cartItem = Cart::where('user_id', $userId)
            ->where('menu_item_id', $itemId)
            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart successfully']);
    }

    public function clear(Request $request)
    {
        $userId = $request->user()->id;
        Cart::where('user_id', $userId)->delete();
        return response()->json(['message' => 'Cart cleared successfully']);
    }

    public function count(Request $request)
    {
        $userId = $request->user()->id;
        $count = Cart::where('user_id', $userId)->sum('quantity');
        
        return response()->json(['count' => $count]);
    }
}
