<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tkl     = Category::where('name', 'TKL (80%)')->first();
        $compact = Category::where('name', 'Compact (65%)')->first();
        $sets    = Category::where('name', 'Sets Completos')->first();
        $custom  = Category::where('name', 'Keycaps Personalizadas')->first();
        $lineal  = Category::where('name', 'Lineales')->first();

        // Tags
        $tagGaming = Tag::create(['name' => 'Gaming']);
        $tagPBT    = Tag::create(['name' => 'PBT']);
        $tagRGB    = Tag::create(['name' => 'RGB']);
        $tagCustom = Tag::create(['name' => 'Custom']);
        $tagOferta = Tag::create(['name' => 'Oferta']);

        // ── Producto 1: Teclado TKL ────────────────────────────
        $p1 = Product::create([
            'category_id'       => $tkl->id,
            'name'              => 'KeyTec KT-87 TKL Aluminio',
            'short_description' => 'TKL en aluminio anodizado con hot-swap y RGB per-key.',
            'description'       => 'El KT-87 es el teclado insignia de KeyTec. Carcasa de aluminio anodizado de alta resistencia, placa de brass para mayor sonoridad y estabilizadores pre-lubricados de fábrica. Compatible con la mayoría de switches MX.',
            'price'             => 129.99,
            'sale_price'        => 109.99,
            'stock'             => 25,
            'sku'               => 'KT-87-TKL-BK',
            'weight'            => 1200,
            'is_featured'       => true,
        ]);
        $this->attachImages($p1, [
            'ducky_asset_OK-M_product_1-65.jpg',
            'ducky_asset_OK-M_product_65.jpg',
            'ducky_asset_ONE3_product-1.jpg',
            'ducky_asset_ONE3_product-2.jpg',
        ]);
        $p1->attributes()->createMany([
            ['attribute_name' => 'Layout',          'attribute_value' => 'TKL (80%)',    'order' => 1],
            ['attribute_name' => 'Carcasa',         'attribute_value' => 'Aluminio',     'order' => 2],
            ['attribute_name' => 'Placa',           'attribute_value' => 'Brass',        'order' => 3],
            ['attribute_name' => 'Hot-swap',        'attribute_value' => 'Sí (5-pin)',   'order' => 4],
            ['attribute_name' => 'Iluminación',     'attribute_value' => 'RGB per-key',  'order' => 5],
            ['attribute_name' => 'Conexión',        'attribute_value' => 'USB-C',        'order' => 6],
            ['attribute_name' => 'Compatibilidad',  'attribute_value' => 'MX 3/5-pin',   'order' => 7],
        ]);
        $p1->tags()->attach([$tagGaming->id, $tagRGB->id]);

        // ── Producto 2: Teclado 65% ────────────────────────────
        $p2 = Product::create([
            'category_id'       => $compact->id,
            'name'              => 'KeyTec KT-65 Compact',
            'short_description' => 'El compañero perfecto para cualquier escritorio. 65%, gasket mount.',
            'description'       => 'Diseño compacto con bloque de flechas. Montaje tipo gasket para un perfil de sonido más suave y amortiguado. Ideal para trabajo y gaming.',
            'price'             => 89.99,
            'stock'             => 40,
            'sku'               => 'KT-65-GM-WH',
            'weight'            => 900,
            'is_featured'       => true,
        ]);
        $this->attachImages($p2, [
            'gk61v3_white_0.jpg',
            'gk61v3_black_0.jpg',
            'one3-pro_asset_product_100-1.jpg',
            'one3-pro_asset_product_100-2.jpg',
        ]);
        $p2->attributes()->createMany([
            ['attribute_name' => 'Layout',     'attribute_value' => '65%',          'order' => 1],
            ['attribute_name' => 'Montaje',    'attribute_value' => 'Gasket',       'order' => 2],
            ['attribute_name' => 'Hot-swap',   'attribute_value' => 'Sí (5-pin)',   'order' => 3],
            ['attribute_name' => 'Conexión',   'attribute_value' => 'USB-C + BT5',  'order' => 4],
        ]);
        $p2->tags()->attach([$tagGaming->id]);

        // ── Producto 3: Keycaps set PBT ───────────────────────
        $p3 = Product::create([
            'category_id'       => $sets->id,
            'name'              => 'Set Keycaps PBT DoubleShot "Tokyo Nights"',
            'short_description' => 'Estética cyberpunk inspirada en el Tokyo nocturno. PBT doubleshot, perfil Cherry.',
            'description'       => 'Set completo de 137 keycaps en PBT doubleshot de doble inyección. Las leyendas nunca se desgastan. Compatible con la mayoría de teclados MX TKL y Full.',
            'price'             => 54.99,
            'stock'             => 60,
            'sku'               => 'KC-TKN-PBT-137',
            'weight'            => 250,
            'is_featured'       => true,
        ]);
        $this->attachImages($p3, [
            'hkg_lavender_lite2_1200-1000_e3cd6a8c-f9ec-40c4-9bac-ce430c98b9e0.png',
            'KAPGHOSTKEYCAPS_Base_kitting.jpg',
            'GMK_N16_Kitting_map.jpg',
        ]);
        $p3->attributes()->createMany([
            ['attribute_name' => 'Material',        'attribute_value' => 'PBT',               'order' => 1],
            ['attribute_name' => 'Proceso',         'attribute_value' => 'Doubleshot',        'order' => 2],
            ['attribute_name' => 'Perfil',          'attribute_value' => 'Cherry',            'order' => 3],
            ['attribute_name' => 'Piezas',          'attribute_value' => '137',               'order' => 4],
            ['attribute_name' => 'Compatibilidad',  'attribute_value' => 'MX TKL / Full',     'order' => 5],
        ]);
        $p3->tags()->attach([$tagPBT->id, $tagOferta->id]);

        // ── Producto 4: Keycaps personalizables ───────────────
        $p4 = Product::create([
            'category_id'       => $custom->id,
            'name'              => 'Keycaps Personalizadas PBT — Diseño Propio',
            'short_description' => 'Usa nuestro personalizador y crea el set de tus sueños.',
            'description'       => 'Con nuestra herramienta de personalización puedes elegir el color de cada tecla individualmente, añadir texto personalizado e iconos. Fabricadas en PBT de alta calidad.',
            'price'             => 74.99,
            'stock'             => 999,
            'sku'               => 'KC-CUSTOM-PBT',
            'weight'            => 250,
            'is_customizable'   => true,
            'is_featured'       => true,
        ]);
        $this->attachImages($p4, [
            'ISO_Cherry_Profile_Dye-Sub_PBT_Full_Set_Keycap_Set_-_White_Mint_-_ES.jpg',
            'Keychron_Hacker_Mint_ISO_ES_Custom_PBT_Keycaps_iso_Espanol.png',
            'Keychron-Spanish-ISO-Low_Profile-LSA-Full-Set-Keycap-Set.jpg',
            'Belgian-ISO.jpg',
        ]);
        $p4->attributes()->createMany([
            ['attribute_name' => 'Material',  'attribute_value' => 'PBT',           'order' => 1],
            ['attribute_name' => 'Proceso',   'attribute_value' => 'Dye-Sub',       'order' => 2],
            ['attribute_name' => 'Perfil',    'attribute_value' => 'Cherry / OEM',  'order' => 3],
            ['attribute_name' => 'Piezas',    'attribute_value' => '104 (Full)',    'order' => 4],
        ]);
        $p4->tags()->attach([$tagPBT->id, $tagCustom->id]);

        // ── Producto 5: Switches Gateron ──────────────────────
        $p5 = Product::create([
            'category_id'       => $lineal->id,
            'name'              => 'Gateron Yellow Pro (x35)',
            'short_description' => 'Los lineales más suaves del mercado. Pre-lubricados de fábrica.',
            'description'       => 'Switches Gateron Yellow Pro, reconocidos por su recorrido extremadamente suave y su bajo nivel de ruido. Vienen pre-lubricados directamente desde fábrica.',
            'price'             => 18.99,
            'stock'             => 150,
            'sku'               => 'SW-GAT-YLW-35',
            'weight'            => 80,
        ]);
        $this->attachImages($p5, [
            'Fallout_Nuka_Cola_asset_product_1.jpg',
            'Fallout_Nuka_Cola_asset_product_2.jpg',
        ]);
        $p5->attributes()->createMany([
            ['attribute_name' => 'Tipo',            'attribute_value' => 'Lineal',         'order' => 1],
            ['attribute_name' => 'Actuación',       'attribute_value' => '35g',            'order' => 2],
            ['attribute_name' => 'Fuerza total',    'attribute_value' => '50g',            'order' => 3],
            ['attribute_name' => 'Pre-viaje',       'attribute_value' => '2.0mm',          'order' => 4],
            ['attribute_name' => 'Recorrido total', 'attribute_value' => '4.0mm',          'order' => 5],
            ['attribute_name' => 'Pines',           'attribute_value' => '5-pin',          'order' => 6],
            ['attribute_name' => 'Lubricado',       'attribute_value' => 'Sí (fábrica)',   'order' => 7],
        ]);

        // ── Producto extra 6: Keycaps Fallout ──────────────────
        $p6 = Product::create([
            'category_id'       => $sets->id,
            'name'              => 'Set Keycaps "Nuka Cola Edition"',
            'short_description' => 'Edición especial inspirada en Fallout. PBT, leyendas en español.',
            'description'       => 'Set temático con la estética Nuka Cola. Edición limitada en PBT con leyendas dye-sublimadas en español ISO.',
            'price'             => 64.99,
            'stock'             => 30,
            'sku'               => 'KC-FALLOUT-NK',
            'weight'            => 280,
        ]);
        $this->attachImages($p6, [
            'Fallout_Nuka_Cola_asset_product_2.jpg',
            'Fallout_Nuka_Cola_asset_product_1.jpg',
        ]);
        $p6->attributes()->createMany([
            ['attribute_name' => 'Material', 'attribute_value' => 'PBT',      'order' => 1],
            ['attribute_name' => 'Proceso',  'attribute_value' => 'Dye-Sub',  'order' => 2],
            ['attribute_name' => 'Perfil',   'attribute_value' => 'OEM',      'order' => 3],
            ['attribute_name' => 'Layout',   'attribute_value' => 'ISO ES',   'order' => 4],
        ]);
        $p6->tags()->attach([$tagPBT->id]);

        // ── Producto extra 7: Teclado custom Ducky-style ───────
        $p7 = Product::create([
            'category_id'       => $tkl->id,
            'name'              => 'KeyTec One X TKL',
            'short_description' => 'TKL minimalista con switches lineales y carcasa monobloque.',
            'description'       => 'Inspirado en los modelos premium del mercado, el One X ofrece una experiencia de escritura premium en un formato TKL.',
            'price'             => 99.99,
            'stock'             => 18,
            'sku'               => 'KT-ONEX-TKL',
            'weight'            => 1100,
        ]);
        $this->attachImages($p7, [
            'ducky_onex_product-2.jpg',
            'ducky_onex_product-2_72860a4a-7769-4d51-9f76-3d5415e46aa6.jpg',
        ]);
        $p7->attributes()->createMany([
            ['attribute_name' => 'Layout',    'attribute_value' => 'TKL',     'order' => 1],
            ['attribute_name' => 'Hot-swap',  'attribute_value' => 'No',      'order' => 2],
            ['attribute_name' => 'Conexión',  'attribute_value' => 'USB-C',   'order' => 3],
        ]);
        $p7->tags()->attach([$tagGaming->id]);
    }

    /**
     * Adjunta imágenes al producto. La primera del array se marca como primaria.
     * Asume que las imágenes ya están en storage/app/public/products/.
     */
    private function attachImages(Product $product, array $filenames): void
    {
        foreach ($filenames as $i => $file) {
            $product->images()->create([
                'path'       => 'products/' . $file,
                'alt_text'   => $product->name,
                'is_primary' => $i === 0,
                'order'      => $i,
            ]);
        }
    }
}
