<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryOfWord extends Model
{
    protected $fillable = ['name'];
    
    public function wordCategories() { return $this->hasMany(WordCategory::class, 'category_of_word_id'); }

    public function words() { return $this->belongsToMany(Word::class, 'word_categories', 'category_of_word_id', 'word_id'); }
}
