<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas para el PERSONALIZADOR DE KEYCAPS
     * 
     * Un "keycap_design" es un diseño completo de teclado que un usuario crea.
     * Tiene un layout (60%, TKL, full) y cada tecla individual tiene su propia
     * configuración de color, texto e icono.
     */
    public function up(): void
    {
        Schema::create('keycap_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->nullable()                   // null = diseño de sesión (no logueado)
                  ->constrained()
                  ->nullOnDelete();
            $table->string('name')->default('Mi diseño');
            $table->enum('layout', ['60%', '65%', 'TKL', 'Full'])->default('TKL');
            $table->string('base_color', 7)->default('#FFFFFF'); // Color base de todas las teclas
            $table->string('preview_image')->nullable();         // Imagen PNG generada del diseño
            $table->boolean('is_public')->default(false);        // Compartir en galería pública
            $table->timestamps();
        });

        Schema::create('keycap_design_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_id')
                  ->constrained('keycap_designs')
                  ->cascadeOnDelete();
            $table->string('key_code', 20);      // Ej: "KeyA", "Space", "Enter", "F1"
            $table->string('label')->nullable();  // Texto personalizado en la tecla
            $table->string('color', 7)->default('#FFFFFF');       // Color de fondo de la tecla
            $table->string('text_color', 7)->default('#000000');  // Color del texto
            $table->string('font', 50)->nullable();               // Fuente del texto
            $table->string('icon')->nullable();                   // Nombre del icono (lucide)
            $table->timestamps();

            $table->unique(['design_id', 'key_code']); // Una config por tecla por diseño
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keycap_design_keys');
        Schema::dropIfExists('keycap_designs');
    }
};
