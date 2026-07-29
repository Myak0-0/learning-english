<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TheoryBlock extends Model
{
    protected $fillable = [
        'section_id',
        'type_of_media_id',
        'content',
        'order',
        'page'
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'order' => 'integer',
            'page' => 'integer',
        ];
    }

    public function section() { return $this->belongsTo(Section::class); }
    public function typeOfMedia() { return $this->belongsTo(TypeOfMedia::class); }
}
