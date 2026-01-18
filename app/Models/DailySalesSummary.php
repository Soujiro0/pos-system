<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailySalesSummary extends Model
{
    use HasFactory;

    protected $table = 'tbl_daily_sales_summaries';

    protected $fillable = [
        'date',
        'total_sales',
        'total_tax',
        'total_discount',
        'total_profit',
        'transaction_count',
    ];

    protected $casts = [
        'date' => 'date',
        'total_sales' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_profit' => 'decimal:2',
    ];
}
