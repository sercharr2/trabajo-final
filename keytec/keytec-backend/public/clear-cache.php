<?php
/* Borra los caches de Laravel. BORRAR despues de usar. */
if (($_GET['token'] ?? '') !== 'keytec-init') {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}
header('Content-Type: text/plain');
foreach ([
    __DIR__.'/../bootstrap/cache/config.php',
    __DIR__.'/../bootstrap/cache/routes-v7.php',
    __DIR__.'/../bootstrap/cache/services.php',
    __DIR__.'/../bootstrap/cache/packages.php',
] as $f) {
    if (file_exists($f)) {
        @unlink($f);
        echo "borrado: " . basename($f) . "\n";
    } else {
        echo "no existia: " . basename($f) . "\n";
    }
}
echo "\nOK. Borra public/clear-cache.php del FTP.\n";
