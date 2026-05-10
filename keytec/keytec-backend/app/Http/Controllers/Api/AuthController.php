<?php

namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
 
class AuthController extends Controller
{
    /**
     * POST /api/v1/register
     * Registra un nuevo usuario y devuelve token.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);
 
        $user  = User::create($data);
        $token = $user->createToken('api-token')->plainTextToken;
 
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }
 
    /**
     * POST /api/v1/login
     * Devuelve token si las credenciales son correctas.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);
 
        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }
 
        $user  = Auth::user();
        // Elimina tokens anteriores (una sola sesión activa por usuario)
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;
 
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }
 
    /**
     * POST /api/v1/logout
     * Revoca el token actual.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }
 
    /**
     * GET /api/v1/me
     * Devuelve el usuario autenticado.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
 
    /**
     * PUT /api/v1/me
     * Actualiza los datos del perfil.
     */
    public function update(Request $request)
    {
        $user = $request->user();
 
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'phone'       => ['sometimes', 'nullable', 'string', 'max:20'],
            'address'     => ['sometimes', 'nullable', 'string'],
            'city'        => ['sometimes', 'nullable', 'string', 'max:100'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'max:10'],
            'country'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'password'    => ['sometimes', 'confirmed', Password::min(8)],
        ]);
 
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
 
        $user->update($data);
 
        return response()->json($user->fresh());
    }
}