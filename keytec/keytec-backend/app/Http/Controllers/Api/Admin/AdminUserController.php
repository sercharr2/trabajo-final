<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /** GET /api/v1/admin/users */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%$term%")
                                      ->orWhere('email', 'like', "%$term%"));
        }

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->latest()->paginate($perPage));
    }

    /** GET /api/v1/admin/users/{id} */
    public function show(int $id)
    {
        $user = User::with('orders')->findOrFail($id);
        return response()->json($user);
    }
}
