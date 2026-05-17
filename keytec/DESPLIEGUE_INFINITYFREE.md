# Despliegue de KeyTec en InfinityFree

InfinityFree es un hosting compartido sin acceso por SSH, así que **todo lo
que normalmente harías con `php artisan` o `npm run build` hay que hacerlo
ANTES en tu PC** y subir el resultado por FTP.

## Antes de empezar

En el panel de InfinityFree (VistaPanel) necesitas anotar:
- **Subdominio** que te asignó (ej. `keytec.epizy.com` o `keytec.rf.gd`)
- **MySQL Hostname** (ej. `sql123.epizy.com`)
- **Nombre de la BD** (ej. `if0_12345678_keytec`)
- **Usuario MySQL** (ej. `if0_12345678`)
- **Contraseña** de MySQL (es distinta a la de tu cuenta de hosting)
- **Datos FTP** (host, usuario, contraseña)

---

## A. Backend (Laravel) - Preparación local

Desde la carpeta `keytec-backend`:

### 1. Configura el .env de producción

Copia `.env.production.example` como `.env` y rellena todo con los datos
de InfinityFree. Importante:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=http://TU-DOMINIO.epizy.com
DB_HOST=sql123.epizy.com
DB_DATABASE=if0_12345678_keytec
DB_USERNAME=if0_12345678
DB_PASSWORD=tu_password
```

### 2. Instala dependencias en modo producción
```bash
composer install --optimize-autoloader --no-dev
```
Eso te genera la carpeta `vendor/` (sí, hay que subirla, son ~30 MB).

### 3. Cargar la BD remotamente

InfinityFree NO permite conexiones MySQL externas a su servidor. Hay que
hacerlo en dos pasos:

**Opción A - Generar el SQL localmente y subirlo**
1. En tu `.env`, deja temporalmente `DB_CONNECTION=sqlite` para crear las
   tablas en local con `php artisan migrate:fresh --seed`.
2. Exporta a SQL: `php artisan db:export` (no existe nativo). Más fácil:
   abre `database/database.sqlite` con DB Browser for SQLite y exporta.

**Opción B - Importar via phpMyAdmin (recomendado)**
1. Genera un dump local con SQLite así:
   ```bash
   sqlite3 database/database.sqlite .dump > db_dump.sql
   ```
   o usa DB Browser for SQLite → File → Export → SQL.
2. Adapta el SQL si es necesario (los enums de SQLite son strings).
3. Entra al phpMyAdmin de InfinityFree → Importar → sube el SQL.

**Opción C - Dejar Laravel migrar via web (truco)**
Crea un fichero `migrate.php` en la raíz del backend con:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->call('migrate:fresh', ['--seed' => true, '--force' => true]);
echo $kernel->output();
```
Sube el proyecto (paso 5), abre `http://TU-DOMINIO.epizy.com/migrate.php`
una vez, y BÓRRALO inmediatamente del FTP.

### 4. Cachea config y rutas
```bash
php artisan config:cache
php artisan route:cache
php artisan storage:link
```

### 5. Subir por FTP a `htdocs/`
1. Conéctate con FileZilla a tu cuenta FTP de InfinityFree.
2. Entra en `htdocs/` y borra cualquier `index2.html` o similar de
   bienvenida.
3. Sube TODO el contenido de `keytec-backend/` directamente dentro de
   `htdocs/` (incluido `vendor/`, `.env` y `.htaccess`).
4. Verifica que en la raíz de `htdocs/` queda el `.htaccess` que apunta
   a `public/`.

### 6. Permisos (a veces no hace falta)
Si ves error 500: dale permisos 755 a `storage/` y
`bootstrap/cache/` (con FileZilla → click derecho → permisos → 755 recursivo).

---

## B. Frontend (React) - Preparación local

Desde la carpeta `keytec-frontend`:

### 1. Configura `.env.production`
```
VITE_API_URL=http://TU-DOMINIO.epizy.com/api/v1
```

### 2. Genera el build estático
```bash
npm run build
```
Eso te crea la carpeta `dist/` con `index.html`, `assets/...`, el video
y el GLB del personalizador.

### 3. Subir el frontend
**Opción A - Mismo dominio que el backend** (más fácil pero choca con las rutas)
- No recomendado: las URLs de Laravel y React colisionarían.

**Opción B - Subdominio aparte para el frontend** (recomendado)
1. En InfinityFree → Domains → Subdomains → crea `app.TU-DOMINIO.epizy.com`
2. Esto crea una carpeta nueva en FTP, ej. `htdocs/app/`
3. Sube TODO el contenido de `dist/` ahí, incluido el `.htaccess`
4. En tu `.env.production` del frontend pon antes de `npm run build`:
   ```
   VITE_API_URL=http://TU-DOMINIO.epizy.com/api/v1
   ```
5. En tu `.env` del backend, pon
   ```
   FRONTEND_URL=http://app.TU-DOMINIO.epizy.com
   ```
   (esto importa para CORS)

### 4. Comprobar
Abre `http://app.TU-DOMINIO.epizy.com` — deberías ver tu KeyTec.
Si la consola del navegador muestra 404 al cambiar de página, falta el
`.htaccess` en `htdocs/app/` (paso 3).

---

## Problemas comunes

**500 al abrir la web** → revisa `storage/logs/laravel.log` por FTP.
Suele ser permisos de `storage/` o el `APP_KEY` mal copiado.

**CORS error** → en `keytec-backend/config/cors.php`, `allowed_origins`
debe contener tu URL del frontend (ya lee `FRONTEND_URL` del .env).

**No carga el video o el GLB** → InfinityFree limita el tamaño de
algunos archivos, y bloquea ciertos tipos. Si el `.glb` da 403, añade
en `htdocs/app/.htaccess`:
```
<Files "*.glb">
    AddType model/gltf-binary .glb
</Files>
```

**phpMyAdmin no me deja importar más de 10MB** → divide el SQL en trozos
o usa la opción C (script `migrate.php` temporal).

**Hot-reload del video no funciona** → InfinityFree tiene límites de
ancho de banda diarios, los archivos `.webm` grandes pueden ser
bloqueados. El video que tienes ya está optimizado (123 KB MP4).

---

## Limitaciones de InfinityFree que afectan a este proyecto

1. **Sin terminal SSH** → ya cubierto arriba con cachés pre-generados
2. **PHP máx 30s/petición** → los seeders pesados pueden timeout. Si pasa,
   divide el `migrate:fresh --seed` en varios pasos.
3. **MySQL externo bloqueado** → no puedes conectarte desde tu PC al
   MySQL de InfinityFree para hacer migraciones. Por eso la opción C.
4. **Sin queues / no `php artisan queue:work`** → ya pusimos
   `QUEUE_CONNECTION=sync` para que todo sea síncrono.
5. **Sin scheduler** → si necesitas tareas programadas, no hay cron.
   No las usamos en KeyTec, así que ok.
6. **Sólo HTTP gratis** (HTTPS de pago) → asegúrate de que tu
   `APP_URL` y `VITE_API_URL` empiezan por `http://`, no `https://`.

