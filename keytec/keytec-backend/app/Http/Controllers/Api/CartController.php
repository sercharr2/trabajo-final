<?php

namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
 
class CartController extends Controller
{
    /**
     * GET /api/v1/cart
     * Devuelve el carrito del usuario con totales.
     */
    public function index(Request $request)
    {
        $items = CartItem::with(['product.images', 'design'])
                        ->where('user_id', $request->user()->id)
                        ->get();
 
        $formatted = $items->map(fn($item) => [
            'id'          => $item->id,
            'quantity'    => $item->quantity,
            'product'     => [
                'id'           => $item->product->id,
                'name'         => $item->product->name,
                'slug'         => $item->product->slug,
                'price'        => $item->product->current_price,
                'stock'        => $item->product->stock,
                'image_url'    => $item->product->primary_image_url,
            ],
            'design'      => $item->design ? [
                'id'     => $item->design->id,
                'name'   => $item->design->name,
                'layout' => $item->design->layout,
            ] : null,
            'line_total'  => $item->line_total,
        ]);
 
        return response()->json([
            'items'    => $formatted,
            'count'    => $items->sum('quantity'),
            'subtotal' => round($formatted->sum('line_total'), 2),
        ]);
    }
 
    /**
     * POST /api/v1/cart
     * Añade un ítem al carrito (o incrementa cantidad si ya existe).
     *
     * Body: { product_id, quantity, design_id? }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity'   => ['integer', 'min:1', 'max:10'],
            'design_id'  => ['nullable', 'exists:keycap_designs,id'],
        ]);
 
        $product = Product::findOrFail($data['product_id']);
 
        if (! $product->is_active || $product->stock < 1) {
            return response()->json(['message' => 'Producto no disponible.'], 422);
        }
 
        $cartItem = CartItem::updateOrCreate(
            [
                'user_id'    => $request->user()->id,
                'product_id' => $data['product_id'],
                'design_id'  => $data['design_id'] ?? null,
            ],
            ['quantity' => \DB::raw('quantity + ' . ($data['quantity'] ?? 1))]
        );
 
        return response()->json($cartItem, 201);
    }
 
    /**
     * PUT /api/v1/cart/{id}
     * Actualiza la cantidad de un ítem.
     */
    public function update(Request $request, int $id)
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:10']]);
 
        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update($data);
 
        return response()->json($item);
    }
 
    /**
     * DELETE /api/v1/cart/{id}
     * Elimina un ítem del carrito.
     */
    public function destroy(Request $request, int $id)
    {
        CartItem::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
 
    /**
     * DELETE /api/v1/cart
     * Vacía el carrito completo.
     */
    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        return response()->json(null, 204);
    }
}
 
 
// ============================================================
// app/Http/Controllers/Api/KeycapDesignController.php
// ============================================================
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\KeycapDesign;
use App\Models\KeycapDesignKey;
use Illuminate\Http\Request;
 
class KeycapDesignController extends Controller
{
    /**
     * GET /api/v1/designs
     * Lista los diseños del usuario autenticado.
     */
    public function index(Request $request)
    {
        $designs = KeycapDesign::with('keys')
                              ->where('user_id', $request->user()->id)
                              ->latest()
                              ->get();
        return response()->json($designs);
    }
 
    /**
     * GET /api/v1/designs/gallery
     * Diseños públicos de todos los usuarios (galería comunitaria).
     */
    public function gallery()
    {
        $designs = KeycapDesign::with(['user:id,name', 'keys'])
                              ->where('is_public', true)
                              ->latest()
                              ->paginate(20);
        return response()->json($designs);
    }
 
    /**
     * POST /api/v1/designs
     * Crea un nuevo diseño personalizado.
     *
     * Body:
     * {
     *   "name": "Mi diseño retro",
     *   "layout": "TKL",
     *   "base_color": "#1a1a2e",
     *   "is_public": false,
     *   "keys": [
     *     { "key_code": "KeyA", "color": "#e94560", "text_color": "#fff", "label": "A" },
     *     { "key_code": "Space", "color": "#16213e", "text_color": "#fff" },
     *     ...
     *   ]
     * }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:100'],
            'layout'     => ['required', 'in:60%,65%,TKL,Full'],
            'base_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_public'  => ['boolean'],
            'keys'       => ['array'],
            'keys.*.key_code'   => ['required', 'string', 'max:20'],
            'keys.*.color'      => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.text_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.label'      => ['nullable', 'string', 'max:10'],
            'keys.*.font'       => ['nullable', 'string', 'max:50'],
            'keys.*.icon'       => ['nullable', 'string', 'max:50'],
        ]);
 
        $design = KeycapDesign::create([
            'user_id'    => $request->user()->id,
            'name'       => $data['name'],
            'layout'     => $data['layout'],
            'base_color' => $data['base_color'],
            'is_public'  => $data['is_public'] ?? false,
        ]);
 
        if (! empty($data['keys'])) {
            $design->keys()->createMany($data['keys']);
        }
 
        return response()->json($design->load('keys'), 201);
    }
 
    /**
     * GET /api/v1/designs/{id}
     */
    public function show(Request $request, int $id)
    {
        $design = KeycapDesign::with('keys')
                             ->where('user_id', $request->user()->id)
                             ->findOrFail($id);
        return response()->json($design);
    }
 
    /**
     * PUT /api/v1/designs/{id}
     * Actualiza nombre, colores y teclas del diseño.
     */
    public function update(Request $request, int $id)
    {
        $design = KeycapDesign::where('user_id', $request->user()->id)->findOrFail($id);
 
        $data = $request->validate([
            'name'       => ['sometimes', 'string', 'max:100'],
            'layout'     => ['sometimes', 'in:60%,65%,TKL,Full'],
            'base_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_public'  => ['sometimes', 'boolean'],
            'keys'       => ['sometimes', 'array'],
            'keys.*.key_code'   => ['required_with:keys', 'string', 'max:20'],
            'keys.*.color'      => ['required_with:keys', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.text_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.label'      => ['nullable', 'string', 'max:10'],
        ]);
 
        $design->update(\Arr::except($data, ['keys']));
 
        // Si se envían teclas, reemplaza todo el diseño de teclas
        if (isset($data['keys'])) {
            $design->keys()->delete();
            $design->keys()->createMany($data['keys']);
        }
 
        return response()->json($design->load('keys'));
    }
 
    /**
     * DELETE /api/v1/designs/{id}
     */
    public function destroy(Request $request, int $id)
    {
        KeycapDesign::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}