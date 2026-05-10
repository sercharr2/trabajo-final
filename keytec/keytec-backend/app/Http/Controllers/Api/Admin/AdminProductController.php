<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    /** GET /api/v1/admin/products */
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%$term%")
                                      ->orWhere('sku', 'like', "%$term%"));
        }

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->latest()->paginate($perPage));
    }

    /** GET /api/v1/admin/products/{id} */
    public function show(int $id)
    {
        $product = Product::with(['category', 'images', 'attributes'])->findOrFail($id);
        return response()->json($product);
    }

    /** POST /api/v1/admin/products */
    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $product = Product::create($data);
        return response()->json($product->load('category'), 201);
    }

    /** PUT /api/v1/admin/products/{id} */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $data = $this->validateData($request, $id);
        $product->update($data);
        return response()->json($product->fresh('category'));
    }

    /** DELETE /api/v1/admin/products/{id} */
    public function destroy(int $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    /** POST /api/v1/admin/products/{id}/images */
    public function uploadImage(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $request->validate([
            'image'      => ['required', 'image', 'max:4096'],
            'is_primary' => ['boolean'],
        ]);

        $path = $request->file('image')->store('products', 'public');

        // Si es primary, quita la primary anterior
        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $img = $product->images()->create([
            'path'       => $path,
            'is_primary' => $request->boolean('is_primary'),
            'order'      => $product->images()->count(),
        ]);

        return response()->json($img, 201);
    }

    /** DELETE /api/v1/admin/products/{id}/images/{imgId} */
    public function deleteImage(int $id, int $imgId)
    {
        $img = ProductImage::where('product_id', $id)->findOrFail($imgId);
        Storage::disk('public')->delete($img->path);
        $img->delete();
        return response()->json(null, 204);
    }

    private function validateData(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'category_id'        => ['required', 'exists:categories,id'],
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'short_description'  => ['nullable', 'string', 'max:500'],
            'price'              => ['required', 'numeric', 'min:0'],
            'sale_price'         => ['nullable', 'numeric', 'min:0'],
            'stock'              => ['required', 'integer', 'min:0'],
            'sku'                => ['required', 'string', "unique:products,sku" . ($id ? ",$id" : '')],
            'weight'             => ['nullable', 'numeric'],
            'is_active'          => ['boolean'],
            'is_featured'        => ['boolean'],
            'is_customizable'    => ['boolean'],
        ]);
    }
}
