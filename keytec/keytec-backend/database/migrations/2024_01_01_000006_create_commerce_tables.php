<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── CARRITO ──────────────────────────────────────────────────────────────
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('design_id')             // Si es un keycap personalizado
                  ->nullable()
                  ->constrained('keycap_designs')
                  ->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // Un usuario no puede tener el mismo producto+diseño dos veces en el carrito
            $table->unique(['user_id', 'product_id', 'design_id']);
        });

        // ─── PEDIDOS ──────────────────────────────────────────────────────────────
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('order_number')->unique();  // Ej: KT-2025-00042
            $table->enum('status', [
                'pending',      // Pendiente de pago
                'paid',         // Pagado, esperando procesamiento
                'processing',   // Preparando pedido
                'shipped',      // Enviado
                'delivered',    // Entregado
                'cancelled',    // Cancelado
                'refunded',     // Reembolsado
            ])->default('pending');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            // Dirección de envío guardada como JSON (snapshot en el momento del pedido)
            $table->json('shipping_address');
            $table->string('payment_method')->nullable();  // stripe, paypal, etc.
            $table->string('payment_id')->nullable();      // ID de transacción del proveedor
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])
                  ->default('pending');
            $table->text('notes')->nullable();             // Notas del cliente
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('design_id')
                  ->nullable()
                  ->constrained('keycap_designs')
                  ->nullOnDelete();
            $table->string('product_name');     // Snapshot del nombre (el producto puede cambiar)
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 10, 2); // unit_price * quantity
            $table->timestamps();
        });

        // ─── VALORACIONES ─────────────────────────────────────────────────────────
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('rating');      // 1-5 estrellas
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(false); // Moderación admin
            $table->timestamps();

            $table->unique(['product_id', 'user_id']); // Una reseña por usuario por producto
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
    }
};
