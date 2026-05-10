<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /** GET /api/v1/admin/orders */
    public function index(Request $request)
    {
        $query = Order::with('user:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->latest()->paginate($perPage));
    }

    /** GET /api/v1/admin/orders/{number} */
    public function show(string $number)
    {
        $order = Order::with(['user:id,name,email,phone', 'items.product.images', 'items.design'])
            ->where('order_number', $number)
            ->firstOrFail();
        return response()->json($order);
    }

    /** PATCH /api/v1/admin/orders/{number}/status */
    public function updateStatus(Request $request, string $number)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,processing,shipped,delivered,cancelled'],
        ]);

        $order = Order::where('order_number', $number)->firstOrFail();
        $order->update($data);

        return response()->json($order);
    }

    /** GET /api/v1/admin/stats - usado por el dashboard admin */
    public function stats()
    {
        return response()->json([
            'total_revenue'  => round((float) Order::whereIn('status', ['paid', 'shipped', 'delivered'])->sum('total'), 2),
            'total_orders'   => Order::count(),
            'total_products' => Product::count(),
            'total_users'    => User::where('role', 'customer')->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ]);
    }
}
