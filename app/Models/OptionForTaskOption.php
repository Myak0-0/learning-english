<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OptionForTaskOption extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'task_option_id',
        'option',
        'order'
    ];
    
    public function taskOption() { return $this->belongsTo(TaskOption::class); }
    public function taskAnswers() { return $this->hasMany(UserTaskAnswer::class); }
}
