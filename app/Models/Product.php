<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'tbl_products';

    protected $fillable = [
        'sku',
        'barcode',
        'name',
        'description',
        'price',
        'category',
        'image_url',
        'attributes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'attributes' => 'array',
    ];

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_id');
    }
}
