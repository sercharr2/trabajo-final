<?php
/*
 * Limpia productos/categorias/tags/imagenes y vuelve a sembrarlos.
 * BORRAR DESPUES DE USAR.
 */
if (($_GET['token'] ?? '') !== 'keytec-init') {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(120);
ini_set('memory_limit', '512M');

header('Content-Type: text/plain; charset=utf-8');
while (ob_get_level()) ob_end_flush();
ob_implicit_flush(true);

// Limpiar caches viejas
foreach ([
    __DIR__.'/../bootstrap/cache/config.php',
    __DIR__.'/../bootstrap/cache/routes-v7.php',
    __DIR__.'/../bootstrap/cache/services.php',
    __DIR__.'/../bootstrap/cache/packages.php',
] as $f) {
    if (file_exists($f)) @unlink($f);
}

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Limpiando productos, categorias, tags, imagenes ===\n";
try {
    \DB::statement('SET FOREIGN_KEY_CHECKS=0');
    \DB::table('product_attributes')->truncate();
    \DB::table('product_images')->truncate();
    \DB::table('product_tag')->truncate();
    \DB::table('cart_items')->truncate();
    \DB::table('reviews')->truncate();
    \DB::table('tags')->truncate();
    \DB::table('products')->truncate();
    \DB::table('categories')->truncate();
    \DB::statement('SET FOREIGN_KEY_CHECKS=1');
    echo "OK\n\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit;
}

echo "=== Re-sembrando categorias y productos ===\n";
try {
    $status = $kernel->call('db:seed', [
        '--class' => 'Database\\Seeders\\CategorySeeder',
        '--force' => true,
    ]);
    echo $kernel->output();

    $status = $kernel->call('db:seed', [
        '--class' => 'Database\\Seeders\\ProductSeeder',
        '--force' => true,
    ]);
    echo $kernel->output();
    echo "\nOK\n\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    exit;
}

echo "=== TODO OK ===\n";
echo "BORRA public/reseed.php del FTP ahora.\n";
