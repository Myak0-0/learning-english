<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryOfWord extends Model
{
    protected $fillable = ['name'];
    
    public function wordCategories() { return $this->hasMany(WordCategory::class, 'category_of_word_id'); }
}
