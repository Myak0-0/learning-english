<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'task_id',
        'content',
        'order'
    ];

    public function task() { return $this->belongsTo(Task::class); }
    public function optionForTaskOptions() { return $this->hasMany(OptionForTaskOption::class); }
    public function answerOptions() { return $this->hasMany(AnswersOption::class); }
    public function taskAnswers() { return $this->hasMany(UserTaskAnswer::class); }
}
