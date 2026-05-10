<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\KeycapDesignController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;
 
// ── Rutas públicas ────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
 
    // Autenticación
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
 
    // Catálogo (solo lectura)
    Route::get('/products',                [ProductController::class, 'index']);
    Route::get('/products/featured',       [ProductController::class, 'featured']);
    Route::get('/products/{slug}',         [ProductController::class, 'show']);
    Route::get('/products/{slug}/reviews', [ReviewController::class, 'index']);
 
    Route::get('/categories',         [CategoryController::class, 'index']);
    Route::get('/categories/{slug}',  [CategoryController::class, 'show']);
 
    // Diseños públicos del personalizador
    Route::get('/designs/gallery', [KeycapDesignController::class, 'gallery']);
 
 
    // ── Rutas autenticadas (cliente) ──────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
 
        // Usuario
        Route::get('/me',        [AuthController::class, 'me']);
        Route::put('/me',        [AuthController::class, 'update']);
        Route::post('/logout',   [AuthController::class, 'logout']);
 
        // Carrito
        Route::get('/cart',              [CartController::class, 'index']);
        Route::post('/cart',             [CartController::class, 'store']);
        Route::put('/cart/{id}',         [CartController::class, 'update']);
        Route::delete('/cart/{id}',      [CartController::class, 'destroy']);
        Route::delete('/cart',           [CartController::class, 'clear']);
 
        // Pedidos
        Route::get('/orders',            [OrderController::class, 'index']);
        Route::post('/orders',           [OrderController::class, 'store']); // checkout
        Route::get('/orders/{number}',   [OrderController::class, 'show']);
 
        // Personalizador de keycaps
        Route::get('/designs',           [KeycapDesignController::class, 'index']);
        Route::post('/designs',          [KeycapDesignController::class, 'store']);
        Route::get('/designs/{id}',      [KeycapDesignController::class, 'show']);
        Route::put('/designs/{id}',      [KeycapDesignController::class, 'update']);
        Route::delete('/designs/{id}',   [KeycapDesignController::class, 'destroy']);
 
        // Reseñas
        Route::post('/products/{slug}/reviews', [ReviewController::class, 'store']);
    });
 
 
    // ── Rutas de administración ───────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
 
        // Gestión de productos
        Route::apiResource('products', AdminProductController::class);
        Route::post('products/{id}/images',         [AdminProductController::class, 'uploadImage']);
        Route::delete('products/{id}/images/{imgId}',[AdminProductController::class, 'deleteImage']);
 
        // Gestión de pedidos
        Route::get('orders',               [AdminOrderController::class, 'index']);
        Route::get('orders/{number}',      [AdminOrderController::class, 'show']);
        Route::patch('orders/{number}/status', [AdminOrderController::class, 'updateStatus']);
 
        // Gestión de usuarios
        Route::get('users',                [AdminUserController::class, 'index']);
        Route::get('users/{id}',           [AdminUserController::class, 'show']);
 
        // Estadísticas del dashboard
        Route::get('stats',                [AdminOrderController::class, 'stats']);
    });
});
