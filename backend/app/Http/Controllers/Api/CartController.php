<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $request->session()->get('cart', []);
        $cartItems = [];
        $subtotal = 0;

        foreach ($cart as $itemId => $cartItem) {
            $menuItem = MenuItem::with('restaurant')->find($itemId);
            if ($menuItem) {
                $itemTotal = $menuItem->price * $cartItem['quantity'];
                $cartItems[] = [
                    'id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'total' => $itemTotal,
                    'restaurant' => $menuItem->restaurant->name,
                    'restaurant_id' => $menuItem->restaurant_id,
                    'image' => $menuItem->image,
                    'special_instructions' => $cartItem['special_instructions'] ?? ''
                ];
                $subtotal += $itemTotal;
            }
        }

        return response()->json([
            'cart_items' => $cartItems,
            'subtotal' => $subtotal,
            'delivery_fee' => $subtotal > 1500 ? 0 : 200,
            'total' => $subtotal + ($subtotal > 1500 ? 0 : 200)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
            'special_instructions' => 'nullable|string|max:255'
        ]);

        $menuItem = MenuItem::find($request->menu_item_id);
        
        if (!$menuItem->is_available) {
            return response()->json(['message' => 'Item is not available'], 400);
        }

        $cart = $request->session()->get('cart', []);
        $itemId = $request->menu_item_id;

        if (isset($cart[$itemId])) {
            $cart[$itemId]['quantity'] += $request->quantity;
            if ($request->special_instructions) {
                $cart[$itemId]['special_instructions'] = $request->special_instructions;
            }
        } else {
            $cart[$itemId] = [
                'quantity' => $request->quantity,
                'special_instructions' => $request->special_instructions ?? ''
            ];
        }

        $request->session()->put('cart', $cart);

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_count' => array_sum(array_column($cart, 'quantity'))
        ]);
    }

    public function update(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = $request->session()->get('cart', []);

        if (!isset($cart[$itemId])) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $cart[$itemId]['quantity'] = $request->quantity;
        $request->session()->put('cart', $cart);

        return response()->json(['message' => 'Cart updated successfully']);
    }

    public function destroy(Request $request, $itemId)
    {
        $cart = $request->session()->get('cart', []);

        if (!isset($cart[$itemId])) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        unset($cart[$itemId]);
        $request->session()->put('cart', $cart);

        return response()->json(['message' => 'Item removed from cart successfully']);
    }

    public function clear(Request $request)
    {
        $request->session()->forget('cart');
        return response()->json(['message' => 'Cart cleared successfully']);
    }

    public function count(Request $request)
    {
        $cart = $request->session()->get('cart', []);
        $count = array_sum(array_column($cart, 'quantity'));
        
        return response()->json(['count' => $count]);
    }
}
