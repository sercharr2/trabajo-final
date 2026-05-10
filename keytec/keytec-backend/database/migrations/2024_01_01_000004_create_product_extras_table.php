<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Imágenes de producto (un producto puede tener varias)
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');                   // Ruta del archivo en storage
            $table->string('alt_text')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Atributos flexibles de producto (layout, switch type, material, etc.)
        // En lugar de columnas fijas, usamos clave-valor para flexibilidad
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('attribute_name');   // Ej: "Layout", "Switch Type", "Material"
            $table->string('attribute_value');  // Ej: "TKL", "Cherry MX Red", "PBT"
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('product_id');
        });

        // Tags para búsqueda y filtrado
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Tabla pivote productos-tags
        Schema::create('product_tag', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('product_images');
    }
};
