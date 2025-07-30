<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'message' => 'Foodify API is running!',
        'status' => 'success',
        'timestamp' => now(),
        'app_name' => config('app.name'),
        'environment' => config('app.env')
    ]);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'database' => 'checking...',
        'timestamp' => now()
    ]);
});

// CSRF Cookie route for Sanctum
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware(['web']);
