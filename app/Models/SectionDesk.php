<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionDesk extends Model
{
    protected $fillable = [
        'section_id',
        'user_id',
        'snapshot'
    ];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function section() { return $this->belongsTo(Section::class); }
}
