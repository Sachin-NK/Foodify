<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
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

        $cart = $request->session()->get('cart', []);

        if (empty($cart)) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        DB::beginTransaction();

        try {
            // Calculate totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($cart as $itemId => $cartItem) {
                $menuItem = MenuItem::find($itemId);
                if (!$menuItem || !$menuItem->is_available) {
                    throw new \Exception("Item {$menuItem->name} is no longer available");
                }

                $itemTotal = $menuItem->price * $cartItem['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'item_price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'total_price' => $itemTotal,
                    'special_instructions' => $cartItem['special_instructions'] ?? null
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

            // Clear cart
            $request->session()->forget('cart');

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
     * Get all orders (for admin/testing purposes)
     */
    public function index()
    {
        $orders = Order::with('orderItems')
                      ->orderBy('created_at', 'desc')
                      ->paginate(20);

        return response()->json($orders);
    }
}
