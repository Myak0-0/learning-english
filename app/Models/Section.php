<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'title',
        'parent_id',
        'is_topic',
        'order',
        'link_id'
    ];

    public function parent() { return $this->belongsTo(Section::class, 'parent_id'); }
    public function children() { return $this->hasMany(Section::class, 'parent_id')->orderBy('order'); }

    public function rights() { return $this->hasMany(UserRight::class); }
    public function tasks() { return $this->hasMany(Task::class); }
    public function theoryBlocks() { return $this->hasMany(TheoryBlock::class); }
}
