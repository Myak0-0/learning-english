<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Word extends Model
{
    protected $fillable = [
        'name',
        'translation',
        'audio'
    ];

    public function timeOfRepeatings() { return $this->hasMany(UserTimeOfRepeating::class); }
    public function wordCategories() { return $this->hasMany(WordCategory::class, 'category_of_word_id'); }
}
