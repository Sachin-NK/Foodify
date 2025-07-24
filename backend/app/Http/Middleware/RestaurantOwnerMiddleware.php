<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RestaurantOwnerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check if user has restaurant_owner role
        if (!$user->isRestaurantOwner() && !$user->isAdmin()) {
            return response()->json(['message' => 'Access denied. Restaurant owner role required.'], 403);
        }

        // If there's a restaurant ID in the route, verify ownership
        $restaurantId = $request->route('restaurant') ?? $request->route('id');
        if ($restaurantId && !$user->isAdmin()) {
            if (!$user->ownsRestaurant($restaurantId)) {
                return response()->json(['message' => 'Access denied. You can only manage your own restaurants.'], 403);
            }
        }

        return $next($request);
    }
}
