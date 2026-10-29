<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherStudent extends Model
{
    protected $fillable = [
        'student_id',
        'teacher_id'
    ];

    public function user() { return $this->belongsTo(User::class, 'student_id'); }
}
