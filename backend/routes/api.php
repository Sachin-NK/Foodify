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
