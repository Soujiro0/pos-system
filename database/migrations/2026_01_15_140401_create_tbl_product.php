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
        Schema::create('tbl_products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->string('name')->index();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('category')->nullable()->index(); // Logical grouping
            $table->string('image_url')->nullable();
            $table->jsonb('attributes')->nullable(); // For dynamic attributes like Color, Flavor
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_products');
    }
};
