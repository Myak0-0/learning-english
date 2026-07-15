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
        Schema::create('option_for_task_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_option_id')->constrained('task_options')->cascadeOnDelete();    
            $table->string('option');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('option_for_task_options');
    }
};
