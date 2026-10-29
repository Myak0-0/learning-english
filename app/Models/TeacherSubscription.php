<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherSubscription extends Model
{
    protected $fillable = [
        'teacher_id',
        'start_date',
        'finish_date',
        'subscription_id'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function subscription() { return $this->belongsTo(Subscription::class); }
}
