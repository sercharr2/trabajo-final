<?php

namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
 
class OrderController extends Controller
{
    /**
     * GET /api/v1/orders
     * Historial de pedidos del usuario.
     */
    public function index(Request $request)
    {
        $orders = Order::with('items.product')
                      ->where('user_id', $request->user()->id)
                      ->latest()
                      ->paginate(10);
        return response()->json($orders);
    }
 
    /**
     * GET /api/v1/orders/{number}
     */
    public function show(Request $request, string $number)
    {
        $order = Order::with(['items.product.images', 'items.design'])
                     ->where('user_id', $request->user()->id)
                     ->where('order_number', $number)
                     ->firstOrFail();
        return response()->json($order);
    }
 
    /**
     * POST /api/v1/orders
     * Hace checkout: crea el pedido a partir del carrito.
     *
     * Body:
     * {
     *   "shipping_address": {
     *     "name": "Sergio Charro",
     *     "address": "Calle Galiana, 5",
     *     "city": "Avilés",
     *     "postal_code": "33400",
     *     "country": "España"
     *   },
     *   "payment_method": "stripe"
     * }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'shipping_address'              => ['required', 'array'],
            'shipping_address.name'         => ['required', 'string'],
            'shipping_address.address'      => ['required', 'string'],
            'shipping_address.city'         => ['required', 'string'],
            'shipping_address.postal_code'  => ['required', 'string'],
            'shipping_address.country'      => ['required', 'string'],
            'payment_method'                => ['required', 'string'],
        ]);
 
        $user      = $request->user();
        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();
 
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'El carrito está vacío.'], 422);
        }
 
        // Verifica stock de todos los productos antes de crear el pedido
        foreach ($cartItems as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => "Stock insuficiente para \"{$item->product->name}\".",
                ], 422);
            }
        }
 
        $order = DB::transaction(function () use ($user, $cartItems, $data) {
            $subtotal      = $cartItems->sum('line_total');
            $shippingCost  = $subtotal >= 80 ? 0 : 4.99; // Envío gratis desde 80€
 
            $order = Order::create([
                'user_id'          => $user->id,
                'subtotal'         => $subtotal,
                'shipping_cost'    => $shippingCost,
                'total'            => $subtotal + $shippingCost,
                'shipping_address' => $data['shipping_address'],
                'payment_method'   => $data['payment_method'],
            ]);
 
            // Crea los ítems del pedido y reduce stock
            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id'   => $item->product_id,
                    'design_id'    => $item->design_id,
                    'product_name' => $item->product->name,
                    'unit_price'   => $item->product->current_price,
                    'quantity'     => $item->quantity,
                    'subtotal'     => $item->line_total,
                ]);
 
                // Reduce el stock del producto
                $item->product->decrement('stock', $item->quantity);
            }
 
            // Vacía el carrito
            CartItem::where('user_id', $user->id)->delete();
 
            return $order;
        });
 
        return response()->json($order->load('items'), 201);
    }
}