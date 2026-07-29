<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTaskAnswer extends Model
{
    protected $fillable = [
        'user_id',
        'task_option_id',
        'answer',
        'is_correct',
        'option_for_task_option_id'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function taskOption() { return $this->belongsTo(TaskOption::class); }    
    public function optionForTaskOption() { return $this->belongsTo(OptionForTaskOption::class); }    
}
