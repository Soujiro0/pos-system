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
    Route::get('categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    
    // Pricing Routes
    Route::prefix('pricing')->group(function () {
        Route::post('/calculate', [\App\Http\Controllers\PricingController::class, 'calculate']);
        Route::post('/reserve', [\App\Http\Controllers\PricingController::class, 'reserve']);
        
        // Taxes
        Route::get('/taxes', [\App\Http\Controllers\PricingController::class, 'indexTaxes']);
        Route::post('/taxes', [\App\Http\Controllers\PricingController::class, 'storeTax']);
        
        // Discounts
        Route::get('/discounts', [\App\Http\Controllers\PricingController::class, 'indexDiscounts']);
        Route::post('/discounts', [\App\Http\Controllers\PricingController::class, 'storeDiscount']);

        // Logs
        Route::get('/logs', [\App\Http\Controllers\PricingController::class, 'indexLogs']);
        
        Route::post('/price/{productId}', [\App\Http\Controllers\PricingController::class, 'updatePrice']);
    });

    // Inventory Routes
    Route::prefix('products/{productId}/inventory')->group(function () {
        Route::get('/', [\App\Http\Controllers\InventoryController::class, 'show']);
        Route::post('/add', [\App\Http\Controllers\InventoryController::class, 'add']);
        Route::post('/remove', [\App\Http\Controllers\InventoryController::class, 'remove']);
        Route::post('/adjust', [\App\Http\Controllers\InventoryController::class, 'adjust']);
    });

    // Transactions
    Route::post('/transactions/checkout', [\App\Http\Controllers\TransactionController::class, 'checkout']);
    Route::get('/transactions/{id}', [\App\Http\Controllers\TransactionController::class, 'show']);
});