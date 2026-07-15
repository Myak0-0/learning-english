<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnswerOption extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'task_option_id',
        'answer'
    ];

    public function taskOption() { return $this->belongsTo(TaskOption::class); }
}
