<?php

namespace Database\Seeders;
 
use App\Models\Category;
use Illuminate\Database\Seeder;
 
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Categorías principales
        $teclados = Category::create([
            'name' => 'Teclados', 'order' => 1,
            'description' => 'Teclados mecánicos para todos los gustos y presupuestos.',
        ]);
 
        $keycaps = Category::create([
            'name' => 'Keycaps', 'order' => 2,
            'description' => 'Sets de keycaps en PBT y ABS, con y sin personalización.',
        ]);
 
        $switches = Category::create([
            'name' => 'Switches', 'order' => 3,
            'description' => 'Switches mecánicos, de bajo perfil y ópticos.',
        ]);
 
        $accesorios = Category::create([
            'name' => 'Accesorios', 'order' => 4,
            'description' => 'Alfombrillas, lubricantes, keycap pullers y más.',
        ]);
 
        // Subcategorías de Teclados
        Category::create(['name' => 'Full Size (100%)', 'parent_id' => $teclados->id, 'order' => 1]);
        Category::create(['name' => 'TKL (80%)',        'parent_id' => $teclados->id, 'order' => 2]);
        Category::create(['name' => 'Compact (65%)',    'parent_id' => $teclados->id, 'order' => 3]);
        Category::create(['name' => '60%',              'parent_id' => $teclados->id, 'order' => 4]);
 
        // Subcategorías de Keycaps
        Category::create(['name' => 'Sets Completos',      'parent_id' => $keycaps->id, 'order' => 1]);
        Category::create(['name' => 'Keycaps Personalizadas','parent_id' => $keycaps->id, 'order' => 2,
                          'description' => 'Diseña tus propias keycaps con nuestro personalizador.']);
        Category::create(['name' => 'Teclas Individuales', 'parent_id' => $keycaps->id, 'order' => 3]);
 
        // Subcategorías de Switches
        Category::create(['name' => 'Lineales',    'parent_id' => $switches->id, 'order' => 1]);
        Category::create(['name' => 'Táctiles',    'parent_id' => $switches->id, 'order' => 2]);
        Category::create(['name' => 'Clicky',      'parent_id' => $switches->id, 'order' => 3]);
    }
}
