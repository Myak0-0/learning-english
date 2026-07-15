<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/lessons', function () {
    return Inertia::render('Lessons');
})->middleware(['auth', 'verified'])->name('lessons');

Route::get('/words', function () {
    return Inertia::render('Words');
})->middleware(['auth', 'verified'])->name('words');

require __DIR__.'/auth.php';
