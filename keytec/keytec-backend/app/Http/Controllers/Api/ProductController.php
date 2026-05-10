<?php

namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
 
class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     * Lista productos con filtros, búsqueda y paginación.
     *
     * Query params:
     *   ?category=teclados        → Filtra por slug de categoría
     *   ?search=gateron           → Búsqueda por nombre o descripción
     *   ?min_price=50             → Precio mínimo
     *   ?max_price=200            → Precio máximo
     *   ?in_stock=1               → Solo con stock
     *   ?featured=1               → Solo destacados
     *   ?sort=price_asc           → Ordenación (price_asc, price_desc, newest, popular)
     *   ?per_page=12              → Resultados por página (default 12)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'approvedReviews'])
                        ->active();
 
        // ── Filtros ──────────────────────────────────────────
        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) =>
                $q->where('slug', $request->category)
                  ->orWhereHas('parent', fn($q2) =>
                      $q2->where('slug', $request->category)
                  )
            );
        }
 
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn($q) =>
                $q->where('name', 'like', "%$term%")
                  ->orWhere('description', 'like', "%$term%")
                  ->orWhere('short_description', 'like', "%$term%")
            );
        }
 
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
 
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
 
        if ($request->boolean('in_stock')) {
            $query->inStock();
        }
 
        if ($request->boolean('featured')) {
            $query->featured();
        }
 
        // ── Ordenación ───────────────────────────────────────
        match ($request->sort) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'newest'     => $query->latest(),
            'popular'    => $query->orderByDesc('views'),
            default      => $query->orderByDesc('is_featured')->latest(),
        };
 
        $perPage = min($request->integer('per_page', 12), 50); // Máximo 50 por página
 
        $products = $query->paginate($perPage)->through(function ($product) {
            return [
                'id'                => $product->id,
                'name'              => $product->name,
                'slug'              => $product->slug,
                'short_description' => $product->short_description,
                'price'             => $product->price,
                'sale_price'        => $product->sale_price,
                'current_price'     => $product->current_price,
                'stock'             => $product->stock,
                'is_customizable'   => $product->is_customizable,
                'primary_image_url' => $product->primary_image_url,
                'category'          => $product->category?->only(['id', 'name', 'slug']),
                'avg_rating'        => round($product->approvedReviews->avg('rating'), 1),
                'review_count'      => $product->approvedReviews->count(),
            ];
        });
 
        return response()->json($products);
    }
 
    /**
     * GET /api/v1/products/featured
     * Devuelve los productos destacados para la portada.
     */
    public function featured()
    {
        $products = Product::with(['images', 'approvedReviews'])
                           ->active()
                           ->featured()
                           ->inStock()
                           ->take(8)
                           ->get()
                           ->map(fn($p) => [
                               'id'              => $p->id,
                               'name'            => $p->name,
                               'slug'            => $p->slug,
                               'price'           => $p->price,
                               'sale_price'      => $p->sale_price,
                               'current_price'   => $p->current_price,
                               'is_customizable' => $p->is_customizable,
                               'primary_image_url' => $p->primary_image_url,
                               'avg_rating'      => round($p->approvedReviews->avg('rating'), 1),
                           ]);
 
        return response()->json($products);
    }
 
    /**
     * GET /api/v1/products/{slug}
     * Detalle completo de un producto.
     */
    public function show(string $slug)
    {
        $product = Product::with([
                       'category.parent',
                       'images',
                       'attributes',
                       'tags',
                       'approvedReviews.user',
                   ])
                   ->where('slug', $slug)
                   ->active()
                   ->firstOrFail();
 
        // Incrementa el contador de vistas
        $product->increment('views');
 
        return response()->json([
            'id'                => $product->id,
            'name'              => $product->name,
            'slug'              => $product->slug,
            'description'       => $product->description,
            'short_description' => $product->short_description,
            'price'             => $product->price,
            'sale_price'        => $product->sale_price,
            'current_price'     => $product->current_price,
            'stock'             => $product->stock,
            'sku'               => $product->sku,
            'weight'            => $product->weight,
            'is_customizable'   => $product->is_customizable,
            'is_featured'       => $product->is_featured,
            'category'          => $product->category,
            'images'            => $product->images->map(fn($i) => [
                'id'         => $i->id,
                'url'        => $i->url,
                'alt_text'   => $i->alt_text,
                'is_primary' => $i->is_primary,
            ]),
            'attributes'        => $product->attributes->map(fn($a) => [
                'name'  => $a->attribute_name,
                'value' => $a->attribute_value,
            ]),
            'tags'              => $product->tags->pluck('name'),
            'avg_rating'        => round($product->approvedReviews->avg('rating'), 1),
            'review_count'      => $product->approvedReviews->count(),
            'reviews'           => $product->approvedReviews->take(5)->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'title'      => $r->title,
                'body'       => $r->body,
                'user_name'  => $r->user->name,
                'created_at' => $r->created_at->diffForHumans(),
            ]),
        ]);
    }
}