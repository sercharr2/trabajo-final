<?php

namespace Database\Seeders;
 
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
 
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Admin KeyTec',
            'email'    => 'admin@keytec.es',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'phone'    => '985000001',
            'city'     => 'Avilés',
            'postal_code' => '33400',
        ]);
 
        // Cliente de prueba
        User::create([
            'name'     => 'Sergio Charro',
            'email'    => 'sergio@keytec.es',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'phone'    => '985000002',
            'address'  => 'Calle Galiana, 5',
            'city'     => 'Avilés',
            'postal_code' => '33400',
        ]);
    }
}