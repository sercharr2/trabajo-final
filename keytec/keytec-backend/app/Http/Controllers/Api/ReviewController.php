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
     * Crea una resena (autenticado).
     */
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title'  => ['nullable', 'string', 'max:120'],
            'body'   => ['nullable', 'string', 'max:1000'],
        ]);

        // Una resena por usuario por producto (la unique de la tabla evita duplicados)
        $review = Review::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id'    => $request->user()->id,
            ],
            [
                'rating'      => $data['rating'],
                'title'       => $data['title'] ?? null,
                'body'        => $data['body'] ?? null,
                'is_approved' => false, // pendiente de moderacion
            ]
        );

        return response()->json($review->load('user:id,name'), 201);
    }
}
