<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/menu', [RestaurantController::class, 'menu']);

Route::middleware(['web'])->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{itemId}', [CartController::class, 'update']);
    Route::delete('/cart/{itemId}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::get('/cart/count', [CartController::class, 'count']);
});

Route::middleware(['web'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::get('/orders/{orderNumber}/track', [OrderController::class, 'track']);
    Route::get('/orders', [OrderController::class, 'index']);
});

// Restaurant Owner Management Routes
Route::middleware(['auth:sanctum', 'restaurant.owner'])->group(function () {
    // Restaurant management
    Route::get('/restaurants/owned', [App\Http\Controllers\Api\RestaurantOwnerController::class, 'index']);
    Route::post('/restaurants', [App\Http\Controllers\Api\RestaurantOwnerController::class, 'store']);
    Route::get('/restaurants/{id}/manage', [App\Http\Controllers\Api\RestaurantOwnerController::class, 'show']);
    Route::put('/restaurants/{id}', [App\Http\Controllers\Api\RestaurantOwnerController::class, 'update']);
    Route::delete('/restaurants/{id}', [App\Http\Controllers\Api\RestaurantOwnerController::class, 'destroy']);
    
    // Menu item management
    Route::get('/restaurants/{restaurantId}/menu/manage', [App\Http\Controllers\Api\MenuManagementController::class, 'index']);
    Route::post('/restaurants/{restaurantId}/menu', [App\Http\Controllers\Api\MenuManagementController::class, 'store']);
    Route::get('/restaurants/{restaurantId}/menu/{itemId}', [App\Http\Controllers\Api\MenuManagementController::class, 'show']);
    Route::put('/restaurants/{restaurantId}/menu/{itemId}', [App\Http\Controllers\Api\MenuManagementController::class, 'update']);
    Route::delete('/restaurants/{restaurantId}/menu/{itemId}', [App\Http\Controllers\Api\MenuManagementController::class, 'destroy']);
    Route::patch('/restaurants/{restaurantId}/menu/{itemId}/toggle', [App\Http\Controllers\Api\MenuManagementController::class, 'toggleAvailability']);
    
    // Menu category management
    Route::get('/restaurants/{restaurantId}/categories', [App\Http\Controllers\Api\MenuCategoryController::class, 'index']);
    Route::post('/restaurants/{restaurantId}/categories', [App\Http\Controllers\Api\MenuCategoryController::class, 'store']);
    Route::get('/restaurants/{restaurantId}/categories/{categoryId}', [App\Http\Controllers\Api\MenuCategoryController::class, 'show']);
    Route::put('/restaurants/{restaurantId}/categories/{categoryId}', [App\Http\Controllers\Api\MenuCategoryController::class, 'update']);
    Route::delete('/restaurants/{restaurantId}/categories/{categoryId}', [App\Http\Controllers\Api\MenuCategoryController::class, 'destroy']);
    Route::post('/restaurants/{restaurantId}/categories/sort', [App\Http\Controllers\Api\MenuCategoryController::class, 'updateSortOrder']);
});
