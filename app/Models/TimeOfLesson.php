<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeOfLesson extends Model
{
    protected $fillable = [
        'student_id',
        'teacher_id',
        'date_lesson',
        'lesson_duration',
        'time_zone',
        'price',
        'lesson_link',
        'is_paid'
    ];

    public function user() { return $this->belongsTo(User::class); }
}
