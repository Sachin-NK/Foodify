<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Create a new order from cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'delivery_address' => 'required|string|max:500',
            'special_instructions' => 'nullable|string|max:500'
        ]);

        // Get cart items from database for authenticated user
        $cartItems = Cart::with('menuItem')
                        ->where('user_id', auth()->id())
                        ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        DB::beginTransaction();

        try {
            // Calculate totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $cartItem) {
                $menuItem = $cartItem->menuItem;
                if (!$menuItem || !$menuItem->is_available) {
                    throw new \Exception("Item {$menuItem->name} is no longer available");
                }

                $itemTotal = $menuItem->price * $cartItem->quantity;
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'item_price' => $menuItem->price,
                    'quantity' => $cartItem->quantity,
                    'total_price' => $itemTotal,
                    'special_instructions' => $cartItem->special_instructions
                ];
            }

            $deliveryFee = $subtotal > 1500 ? 0 : 200;
            $totalAmount = $subtotal + $deliveryFee;

            // Create order
            $order = Order::create([
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'delivery_address' => $request->delivery_address,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'special_instructions' => $request->special_instructions,
                'estimated_delivery_time' => now()->addMinutes(45) // 45 minutes from now
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $order->orderItems()->create($item);
            }

            // Clear cart from database
            Cart::where('user_id', auth()->id())->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load('orderItems'),
                'order_number' => $order->order_number
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Get order details by order number
     */
    public function show($orderNumber)
    {
        $order = Order::with('orderItems.menuItem.restaurant')
                     ->where('order_number', $orderNumber)
                     ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Track order status
     */
    public function track($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $statusSteps = [
            'pending' => ['label' => 'Order Received', 'completed' => true],
            'confirmed' => ['label' => 'Order Confirmed', 'completed' => in_array($order->status, ['confirmed', 'preparing', 'out_for_delivery', 'delivered'])],
            'preparing' => ['label' => 'Preparing Food', 'completed' => in_array($order->status, ['preparing', 'out_for_delivery', 'delivered'])],
            'out_for_delivery' => ['label' => 'Out for Delivery', 'completed' => in_array($order->status, ['out_for_delivery', 'delivered'])],
            'delivered' => ['label' => 'Delivered', 'completed' => $order->status === 'delivered']
        ];

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'estimated_delivery_time' => $order->estimated_delivery_time,
            'status_steps' => $statusSteps,
            'customer_name' => $order->customer_name,
            'delivery_address' => $order->delivery_address,
            'total_amount' => $order->total_amount
        ]);
    }

    /**
     * Get user's orders
     */
    public function index()
    {
        // For authenticated users, get their orders
        if (auth()->check()) {
            $orders = Order::with(['orderItems.menuItem.restaurant'])
                          ->where('customer_email', auth()->user()->email)
                          ->orderBy('created_at', 'desc')
                          ->get();

            // Transform the data to match frontend expectations
            $transformedOrders = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'delivery_address' => $order->delivery_address,
                    'special_instructions' => $order->special_instructions,
                    'subtotal' => $order->subtotal,
                    'delivery_fee' => $order->delivery_fee,
                    'total' => $order->total_amount,
                    'created_at' => $order->created_at,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'name' => $item->item_name,
                            'price' => $item->item_price,
                            'quantity' => $item->quantity,
                            'special_instructions' => $item->special_instructions,
                            'total' => $item->total_price
                        ];
                    })
                ];
            });

            return response()->json(['orders' => $transformedOrders]);
        }

        // For admin/testing purposes - get all orders
        $orders = Order::with('orderItems')
                      ->orderBy('created_at', 'desc')
                      ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Get orders for a specific restaurant (for restaurant owners)
     */
    public function getRestaurantOrders($restaurantId)
    {
        // Get orders that contain items from this restaurant
        $orders = Order::with(['orderItems.menuItem'])
                      ->whereHas('orderItems.menuItem', function ($query) use ($restaurantId) {
                          $query->where('restaurant_id', $restaurantId);
                      })
                      ->orderBy('created_at', 'desc')
                      ->get();

        // Transform the data and filter items to only show items from this restaurant
        $transformedOrders = $orders->map(function ($order) use ($restaurantId) {
            $restaurantItems = $order->orderItems->filter(function ($item) use ($restaurantId) {
                return $item->menuItem && $item->menuItem->restaurant_id == $restaurantId;
            });

            // Calculate totals for this restaurant's items only
            $restaurantSubtotal = $restaurantItems->sum('total_price');
            
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'delivery_address' => $order->delivery_address,
                'special_instructions' => $order->special_instructions,
                'restaurant_subtotal' => $restaurantSubtotal,
                'created_at' => $order->created_at,
                'estimated_delivery_time' => $order->estimated_delivery_time,
                'items' => $restaurantItems->map(function ($item) {
                    return [
                        'name' => $item->item_name,
                        'price' => $item->item_price,
                        'quantity' => $item->quantity,
                        'special_instructions' => $item->special_instructions,
                        'total' => $item->total_price
                    ];
                })
            ];
        })->filter(function ($order) {
            // Only include orders that have items from this restaurant
            return $order['items']->isNotEmpty();
        });

        return response()->json(['orders' => $transformedOrders]);
    }

    /**
     * Update order status (for restaurant owners)
     */
    public function updateStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'
        ]);

        $order = Order::findOrFail($orderId);
        
        $order->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }
}
