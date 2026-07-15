<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WordCategory extends Model
{
    protected $fillable = [
        'word_id',
        'category_of_word_id'
    ];

    public function word() { return $this->belongsTo(Word::class); }
    public function categoryOfWord() { return $this->belongsTo(CategoryOfWord::class); }
}
