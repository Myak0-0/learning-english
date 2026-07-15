<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('theory_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained();
            $table->foreignId('type_of_media_id')->constrained('type_of_media');
            $table->json('content')->nullable();
            $table->integer('order')->default(0);
            $table->integer('page')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theory_blocks');
    }
};
