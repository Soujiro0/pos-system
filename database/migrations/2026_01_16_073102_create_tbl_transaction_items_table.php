<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id');
            $table->foreign('transaction_id')->references('id')->on('tbl_transactions')->cascadeOnDelete();
            
            $table->foreignId('product_id')->nullable()->constrained('tbl_products')->nullOnDelete();
            
            // Snapshots (in case product details change later)
            $table->string('product_name');
            $table->string('sku')->nullable();
            $table->decimal('price', 10, 2);
            
            $table->integer('quantity');
            $table->decimal('subtotal', 10, 2);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_transaction_items');
    }
};
