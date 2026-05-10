<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                  ->constrained()
                  ->restrictOnDelete();    // No se puede borrar categoría con productos
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();  // Precio de oferta
            $table->integer('stock')->default(0);
            $table->string('sku')->unique();                    // Código de producto
            $table->float('weight')->nullable();                // en gramos
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);    // Destacado en portada
            $table->boolean('is_customizable')->default(false); // Solo para keycaps
            $table->integer('views')->default(0);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
