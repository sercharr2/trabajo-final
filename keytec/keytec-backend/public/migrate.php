<?php
/*
 * Migracion via web - version 3 (limpia caches y bootstrappea correctamente)
 * Borrar tras usarlo
 */
if (($_GET['token'] ?? '') !== 'keytec-init') {
    http_response_code(403);
    echo 'Forbidden. Usa ?token=keytec-init';
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
set_time_limit(300);
ini_set('memory_limit', '512M');

header('Content-Type: text/plain; charset=utf-8');
while (ob_get_level()) ob_end_flush();
ob_implicit_flush(true);

echo "=== KeyTec - migrate via web (v3) ===\n\n";
echo "PHP: " . phpversion() . "\n\n";

// 0) Borrar caches viejas que pudieran estar interfiriendo
echo "[0/6] Borrando caches...\n";
foreach ([
    __DIR__.'/../bootstrap/cache/config.php',
    __DIR__.'/../bootstrap/cache/routes-v7.php',
    __DIR__.'/../bootstrap/cache/services.php',
    __DIR__.'/../bootstrap/cache/packages.php',
] as $f) {
    if (file_exists($f)) {
        @unlink($f);
        echo "    borrado: " . basename($f) . "\n";
    }
}
echo "    OK\n\n";

// 1) Verificar que existe .env
echo "[1/6] Verificando .env...\n";
$envPath = __DIR__.'/../.env';
if (!file_exists($envPath)) {
    echo "    FALLO: NO existe " . realpath(__DIR__.'/..') . "/.env\n";
    echo "    Sube el .env a htdocs/.env\n";
    exit;
}
echo "    OK: " . filesize($envPath) . " bytes\n\n";

// 2) Autoload
echo "[2/6] Cargando autoload...\n";
require __DIR__.'/../vendor/autoload.php';
echo "    OK\n\n";

// 3) Bootstrap completo
echo "[3/6] Bootstrap Laravel...\n";
try {
    $app = require_once __DIR__.'/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    // bootstrap() carga el .env, registra providers, etc.
    $kernel->bootstrap();
    echo "    OK\n\n";
} catch (Throwable $e) {
    echo "    FALLO: " . $e->getMessage() . "\n";
    echo "    " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit;
}

// 4) Mostrar config de BD desde config() (no env(), que solo va en config:cache)
echo "[4/6] Conectando a la BD...\n";
$conn = config('database.default');
$cfg  = config("database.connections.$conn");
echo "    Driver: " . ($cfg['driver'] ?? '?') . "\n";
echo "    Host:   " . ($cfg['host'] ?? '?') . "\n";
echo "    BD:     " . ($cfg['database'] ?? '?') . "\n";
echo "    User:   " . ($cfg['username'] ?? '?') . "\n";

try {
    $pdo = \DB::connection()->getPdo();
    echo "    Conexion: OK - " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n\n";
} catch (Throwable $e) {
    echo "    FALLO conexion: " . $e->getMessage() . "\n";
    exit;
}

// 5) Migrate fresh
echo "[5/6] php artisan migrate:fresh --force...\n";
try {
    $status = $kernel->call('migrate:fresh', ['--force' => true]);
    echo $kernel->output();
    echo "    Status: $status\n\n";
    if ($status !== 0) { exit; }
} catch (Throwable $e) {
    echo "    FALLO: " . $e->getMessage() . "\n";
    echo "    " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit;
}

// 6) Seeders
echo "[6/6] php artisan db:seed --force...\n";
try {
    $status = $kernel->call('db:seed', ['--force' => true]);
    echo $kernel->output();
    echo "    Status: $status\n\n";
} catch (Throwable $e) {
    echo "    FALLO en seeders: " . $e->getMessage() . "\n";
    echo "    " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nTraza:\n" . $e->getTraceAsString() . "\n";
    exit;
}

echo "\n=== TODO OK ===\n";
echo "BORRA public/migrate.php del FTP ahora.\n";
