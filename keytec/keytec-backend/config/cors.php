<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    | Como usamos autenticacion por Bearer token (Sanctum personal access
    | tokens), no necesitamos cookies. Por eso supports_credentials esta a
    | false, lo que nos permite usar allowed_origins: ['*'] sin restricciones.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Permite cualquier origen. Si quieres restringir, cambia '*' por la URL
    // exacta del frontend (sin barra final): 'http://keytec-app.42web.io'
    'allowed_origins' => ['*'],

    // Tambien aceptamos cualquier subdominio de 42web.io por si acaso
    'allowed_origins_patterns' => ['#^https?://.*\.42web\.io$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,
];
