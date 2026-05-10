<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories
     * Lista todas las categorias con sus subcategorias.
     */
    public function index()
    {
        $categories = Category::orderBy('order')
            ->orderBy('name')
            ->get(['id', 'parent_id', 'name', 'slug', 'order']);

        return response()->json($categories);
    }

    /**
     * GET /api/v1/categories/{slug}
     */
    public function show(string $slug)
    {
        $category = Category::with('children')->where('slug', $slug)->firstOrFail();
        return response()->json($category);
    }
}
