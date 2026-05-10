<?php

use Illuminate\Database\Migrations\Migration;

// Migracion no-op: la tabla users la crea 2024_01_01_000001_create_users_table.php
// (con campos role, address, city, etc. para la tienda).
return new class extends Migration
{
    public function up(): void {}
    public function down(): void {}
};
