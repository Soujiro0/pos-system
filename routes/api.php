<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
        ]);
    });

    Route::apiResource('products', \App\Http\Controllers\ProductController::class);
    
    // Inventory Routes
    Route::prefix('products/{productId}/inventory')->group(function () {
        Route::get('/', [\App\Http\Controllers\InventoryController::class, 'show']);
        Route::post('/add', [\App\Http\Controllers\InventoryController::class, 'add']);
        Route::post('/remove', [\App\Http\Controllers\InventoryController::class, 'remove']);
        Route::post('/adjust', [\App\Http\Controllers\InventoryController::class, 'adjust']);
    });
});