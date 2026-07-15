<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeOfMedia extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function tasks() { return $this->hasMany(Task::class); }
    public function theoryBlocks() { return $this->hasMany(TheoryBlock::class); }
}
