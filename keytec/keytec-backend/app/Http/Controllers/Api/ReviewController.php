<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/products/{slug}/reviews
     * Resenas aprobadas de un producto.
     */
    public function index(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $reviews = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    /**
     * POST /api/v1/products/{slug}/reviews
     * Crea una resena (autenticado). Las resenas se aprueban
     * automaticamente para esta demo (no hay moderacion).
     */
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'title'   => ['nullable', 'string', 'max:120'],
            'body'    => ['nullable', 'string', 'max:1000'],
            'comment' => ['nullable', 'string', 'max:1000'], // alias por compatibilidad
        ]);

        // El frontend manda 'comment' pero la tabla usa 'body' - normalizamos
        $body = $data['body'] ?? $data['comment'] ?? null;

        $review = Review::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id'    => $request->user()->id,
            ],
            [
                'rating'      => $data['rating'],
                'title'       => $data['title'] ?? null,
                'body'        => $body,
                'is_approved' => true, // auto-aprobar para la demo
            ]
        );

        return response()->json($review->load('user:id,name'), 201);
    }
}
