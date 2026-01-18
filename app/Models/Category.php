<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'tbl_categories';

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'color',
    ];
}
