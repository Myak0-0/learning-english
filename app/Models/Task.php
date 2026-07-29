<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'section_id',
        'type_of_answer_id',
        'description',
        'type_of_media_id',
        'order',
        'page'
    ];

    public function section() { return $this->belongsTo(Section::class); }
    public function typeOfMedia() { return $this->belongsTo(TypeOfMedia::class); }
    public function typeOfAnswer() { return $this->belongsTo(TypeOfAnswer::class); }
    public function taskOptions() { return $this->hasMany(TaskOption::class); }
}
