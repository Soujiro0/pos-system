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
        // Prices
        Schema::create('tbl_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('tbl_products')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PHP');
            $table->timestamp('effective_date')->useCurrent();
            $table->timestamps();

            $table->index(['product_id', 'effective_date']);
        });

        // Tax Rates
        Schema::create('tbl_tax_rates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('percentage', 5, 2);
            $table->enum('type', ['inclusive', 'exclusive'])->default('exclusive');
            $table->string('category')->nullable(); // e.g., 'essential', 'standard'
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Discounts
        Schema::create('tbl_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable(); // Manual codes, auto-promos might be null? assume code is main identifier for now
            $table->enum('type', ['fixed', 'percent']);
            $table->decimal('value', 10, 2);
            $table->integer('min_quantity')->default(0);
            $table->integer('priority')->default(0);
            $table->boolean('is_stackable')->default(false);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Price Logs
        Schema::create('tbl_price_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('tbl_products')->onDelete('cascade');
            $table->decimal('old_amount', 10, 2)->nullable();
            $table->decimal('new_amount', 10, 2);
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        // Inventory Reservations
        Schema::create('tbl_inventory_reservations', function (Blueprint $table) {
            $table->id();
            $table->uuid('cart_id')->index();
            $table->foreignId('product_id')->constrained('tbl_products')->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_inventory_reservations');
        Schema::dropIfExists('tbl_price_logs');
        Schema::dropIfExists('tbl_discounts');
        Schema::dropIfExists('tbl_tax_rates');
        Schema::dropIfExists('tbl_prices');
    }
};
