<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KeycapDesign;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class KeycapDesignController extends Controller
{
    /** GET /api/v1/designs - Disenos del usuario autenticado */
    public function index(Request $request)
    {
        $designs = KeycapDesign::with('keys')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($designs);
    }

    /** GET /api/v1/designs/gallery - Disenos publicos paginados */
    public function gallery()
    {
        $designs = KeycapDesign::with(['user:id,name', 'keys'])
            ->where('is_public', true)
            ->latest()
            ->paginate(20);
        return response()->json($designs);
    }

    /** POST /api/v1/designs */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                => ['required', 'string', 'max:100'],
            'layout'              => ['required', 'in:60%,65%,TKL,Full'],
            'base_color'          => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_public'           => ['boolean'],
            'keys'                => ['array'],
            'keys.*.key_code'     => ['required', 'string', 'max:20'],
            'keys.*.color'        => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.text_color'   => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.label'        => ['nullable', 'string', 'max:10'],
            'keys.*.font'         => ['nullable', 'string', 'max:50'],
            'keys.*.icon'         => ['nullable', 'string', 'max:50'],
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

    /** GET /api/v1/designs/{id} */
    public function show(Request $request, int $id)
    {
        $design = KeycapDesign::with('keys')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        return response()->json($design);
    }

    /** PUT /api/v1/designs/{id} */
    public function update(Request $request, int $id)
    {
        $design = KeycapDesign::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'name'                => ['sometimes', 'string', 'max:100'],
            'layout'              => ['sometimes', 'in:60%,65%,TKL,Full'],
            'base_color'          => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_public'           => ['sometimes', 'boolean'],
            'keys'                => ['sometimes', 'array'],
            'keys.*.key_code'     => ['required_with:keys', 'string', 'max:20'],
            'keys.*.color'        => ['required_with:keys', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.text_color'   => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'keys.*.label'        => ['nullable', 'string', 'max:10'],
            'keys.*.font'         => ['nullable', 'string', 'max:50'],
        ]);

        $design->update(Arr::except($data, ['keys']));

        if (isset($data['keys'])) {
            $design->keys()->delete();
            $design->keys()->createMany($data['keys']);
        }

        return response()->json($design->load('keys'));
    }

    /** DELETE /api/v1/designs/{id} */
    public function destroy(Request $request, int $id)
    {
        KeycapDesign::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
