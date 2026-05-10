<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with(['product.images', 'design'])
                        ->where('user_id', $request->user()->id)
                        ->get();

        $formatted = $items->map(fn($item) => [
            'id'         => $item->id,
            'quantity'   => $item->quantity,
            'product'    => [
                'id'        => $item->product->id,
                'name'      => $item->product->name,
                'slug'      => $item->product->slug,
                'price'     => $item->product->current_price,
                'stock'     => $item->product->stock,
                'image_url' => $item->product->primary_image_url,
            ],
            'design' => $item->design ? [
                'id'     => $item->design->id,
                'name'   => $item->design->name,
                'layout' => $item->design->layout,
            ] : null,
            'line_total' => $item->line_total,
        ]);

        return response()->json([
            'items'    => $formatted,
            'count'    => $items->sum('quantity'),
            'subtotal' => round($formatted->sum('line_total'), 2),
        ]);
    }

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

        $existing = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->where('design_id', $data['design_id'] ?? null)
            ->first();

        if ($existing) {
            $existing->quantity += ($data['quantity'] ?? 1);
            $existing->save();
            return response()->json($existing, 200);
        }

        $cartItem = CartItem::create([
            'user_id'    => $request->user()->id,
            'product_id' => $data['product_id'],
            'design_id'  => $data['design_id'] ?? null,
            'quantity'   => $data['quantity'] ?? 1,
        ]);

        return response()->json($cartItem, 201);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:10']]);
        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update($data);
        return response()->json($item);
    }

    public function destroy(Request $request, int $id)
    {
        CartItem::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        return response()->json(null, 204);
    }
}
