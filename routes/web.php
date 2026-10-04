<?php

use App\Http\Controllers\AddTopicController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\AudioController;
use App\Http\Controllers\DeskController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\UserSelectController;
use App\Http\Controllers\WordController;
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

Route::post('/user/create', [UserSelectController::class, 'user_create'])
    ->middleware(['auth', 'verified']);



Route::get('/lessons/{parentId?}', [LessonController::class, 'showFolder'])
    ->middleware(['auth', 'verified'])
    ->name('lessons');

Route::get('/lessons/topic/{id}/{page}', [LessonController::class, 'showTopic'])
    ->middleware(['auth', 'verified'])
    ->name('topic');

Route::post('/save-task-answer', [AnswerController::class, 'remember_answer'])
    ->middleware(['auth', 'verified']);

Route::post('/get-new-answers', [LessonController::class, 'get_new_answers'])
    ->middleware(['auth', 'verified']);

Route::post('/topic/{topic_id}/desk-update', [DeskController::class, 'desk_update'])
    ->middleware(['auth', 'verified']);

Route::post('/topic/{topic_id}/desk-check', [DeskController::class, 'desk_check'])
    ->middleware(['auth', 'verified']);



Route::post('/check-user-right', [UserSelectController::class, 'check_user_right'])
    ->middleware(['auth', 'verified']);

Route::get('/choose-user', [UserSelectController::class, 'choose_user'])
    ->middleware(['auth', 'verified'])
    ->name('choose-user');

Route::post('/set-active-student', [UserSelectController::class, 'set_active_student'])
    ->middleware(['auth', 'verified']);

Route::post('/save-user-right', [UserSelectController::class, 'save_user_right'])
    ->middleware(['auth', 'verified']);



Route::get('/add-topic', [AddTopicController::class, 'open_page'])
    ->middleware(['auth', 'verified'])->name('add-topic');

Route::post('/section/add', [AddTopicController::class, 'add_section'])
    ->middleware(['auth', 'verified']);

Route::post('/section/delete', [AddTopicController::class, 'delete_section'])
    ->middleware(['auth', 'verified']);

Route::post('/section/topic/move', [AddTopicController::class, 'topic_move'])
    ->middleware(['auth', 'verified']);

Route::post('/section/theory-block/add', [AddTopicController::class, 'theory_block_add'])
    ->middleware(['auth', 'verified']);

Route::post('/section/theory-block/update', [AddTopicController::class, 'theory_block_update'])
    ->middleware(['auth', 'verified']);

Route::post('/section/theory-block/delete', [AddTopicController::class, 'theory_block_delete'])
    ->middleware(['auth', 'verified']);

Route::post('/section/task-block/add', [AddTopicController::class, 'task_block_add'])
    ->middleware(['auth', 'verified']);

Route::post('/section/task-block/delete', [AddTopicController::class, 'task_block_delete'])
    ->middleware(['auth', 'verified']);

Route::post('/section/task-block/update', [AddTopicController::class, 'update_task'])
    ->middleware(['auth', 'verified']);

Route::post('/section/task-option/delete', [AddTopicController::class, 'task_option_block_delete'])
    ->middleware(['auth', 'verified']);



Route::get('/words/get-exist-words', [WordController::class, 'exist_word'])
    ->middleware(['auth', 'verified']);

Route::get('/words/get-auto-translation', [WordController::class, 'translate_word'])
    ->middleware(['auth', 'verified']);

Route::get('/words', [WordController::class, 'show_words'])
    ->middleware(['auth', 'verified'])->name('words');

Route::post('/user/add-word', [WordController::class, 'add_word_to_learning'])
    ->middleware(['auth', 'verified']);

Route::post('/user/delete-word', [WordController::class, 'delete_word_from_learning'])
    ->middleware(['auth', 'verified']);

Route::post('/words/add-category', [WordController::class, 'add_word_category'])
    ->middleware(['auth', 'verified']);

Route::post('/words/delete-category', [WordController::class, 'delete_category'])
    ->middleware(['auth', 'verified']);

Route::post('/words/add-word', [WordController::class, 'add_new_word'])
    ->middleware(['auth', 'verified']);

Route::post('/words/delete-word', [WordController::class, 'delete_word'])
    ->middleware(['auth', 'verified']);    

Route::post('/words/bind-category-word', [WordController::class, 'bring_word_to_category'])
    ->middleware(['auth', 'verified']);  
    
Route::post('/words/delete-word-from-category', [WordController::class, 'delete_word_from_category'])
    ->middleware(['auth', 'verified']);      
    
Route::post('/words/search', [WordController::class, 'search_word'])
    ->middleware(['auth', 'verified']);

Route::post('/words/update-translation', [WordController::class, 'update_translation'])
    ->middleware(['auth', 'verified']);    




Route::get('/stream-audio/{filename}', [AudioController::class, 'streamAudio']);


require __DIR__.'/auth.php';
