<?php

namespace App\Http\Controllers;

use App\Models\AnswerOption;
use App\Models\OptionForTaskOption;
use App\Models\Section;
use App\Models\Task;
use App\Models\TaskOption;
use App\Models\TheoryBlock;
use App\Models\TypeOfAnswer;
use App\Models\TypeOfMedia;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AddTopicController extends Controller
{
    protected function check_admin(Request $request, bool $isAjax = false) {
        if (!Auth::user()->admin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            if ($isAjax) {                
                response()->json([
                    'redirect' => route('login'),
                    'message' => 'Unauthorized'
                ], 403)->send();
                exit;
            }

            redirect()->route('login')->send();
            exit;
        }
    }



    public function open_page(Request $request)
    {
        $this->check_admin($request);

        $section_id = $request->query('section_id');
        $page = $request->query('page', 1);

        if (!$section_id) {
            abort(404, 'Не указан ID темы для редактирования');
        }

        $topic = Section::findOrFail($section_id);

        $existingBlocks = TheoryBlock::where('section_id', $section_id)
            ->where('page', $page)
            ->orderBy('order')
            ->with('typeOfMedia')
            ->get();

        $mediaTypes = TypeOfMedia::all();
        $allWords = Word::orderBy('name')->get(['id', 'name', 'translation']);

        $existingTasks = Task::where('section_id', $section_id)
            ->where('page', $page)
            ->orderBy('order')
            ->with([
                'typeOfAnswer',
                'typeOfMedia',
                'taskOptions' => function($q) {
                    $q->orderBy('order')->with(['optionForTaskOptions', 'answerOptions']);
                }
            ])
            ->get();

        $answerTypes = TypeOfAnswer::all();

        return Inertia::render('AddTopic', [
            'topic'          => $topic,
            'currentPage'    => (int)$page,

            'existingBlocks' => $existingBlocks,
            'mediaTypes'     => $mediaTypes,
            'allWords'       => $allWords,

            'existingTasks'  => $existingTasks,
            'answerTypes'    => $answerTypes
        ]);
    }



    public function add_section(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'is_topic'  => 'required|boolean',
            'parent_id' => 'nullable|integer|exists:sections,id',
            'link'      => 'required|string'
        ]);

        $link = null;
        if ($validated['link'] != 'NEW_LESSON' && $validated['is_topic']) {
            $link = $validated['link'];
        }

        $title_exists = Section::where('parent_id', $validated['parent_id'])
                 ->where('title', $validated['title'])->exists();

        if ($title_exists) {
            throw ValidationException::withMessages([
                'title' => 'Секция с таким названием уже существует в этой папке.'
            ]);
        }

        do {
            $id_section = rand(1000000, 9999999);            
            $idExists = Section::where('id', $id_section)->exists();            
        } while ($idExists);
        
        $maxOrder = Section::where('parent_id', $validated['parent_id'])->max('order');
        
        $nextOrder = is_null($maxOrder) ? 0 : $maxOrder + 1;
        
        Section::create([
            'id'        => $id_section,
            'title'     => $validated['title'],
            'is_topic'  => $validated['is_topic'],
            'parent_id' => $validated['parent_id'],
            'order'     => $nextOrder,
            'link_id'   => $link
        ]);
        return redirect()->back();
    }

    public function delete_section(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate(['section_id' => 'integer|exists:sections,id']);

        $child = Section::where('parent_id', $validated['section_id'])->exists();

        if ($child) {
            return response()->json([
                'message' => 'Нельзя удалить эту папку! Сначала удалите все вложенные папки и занятия внутри неё.'
            ], 400);
        } else {
            $section = Section::findOrFail($validated['section_id']);
            $section->delete();

            return response()->json([
                'message' => 'Секция успешно удалена'
            ], 200);
        }
    }




    public function topic_move(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'block_id'  => 'required|integer',
            'direction' => 'required|string|in:up,down',
            'object'    => 'required|string'
        ]);

        if ($validated['object'] == 'theory') {
            $currentBlock = TheoryBlock::findOrFail($validated['block_id']);

            $query = TheoryBlock::where('section_id', $currentBlock->section_id)
                ->where('page', $currentBlock->page);
        } else if ($validated['object'] == 'task') {
            $currentBlock = Task::findOrFail($validated['block_id']);

            $query = Task::where('section_id', $currentBlock->section_id)
                ->where('page', $currentBlock->page);            
        } else if ($validated['object'] == 'task-option') {
            $currentBlock = TaskOption::findOrFail($validated['block_id']);

            $query = TaskOption::where('task_id', $currentBlock->task_id);
        }

        if ($validated['direction'] === 'up') {            
            $adjacentBlock = $query->where('order', '<', $currentBlock->order)
                ->orderBy('order', 'desc')
                ->first();
        } else {
            $adjacentBlock = $query->where('order', '>', $currentBlock->order)
                ->orderBy('order', 'asc')
                ->first();
        }

        if ($adjacentBlock) {
            $oldCurrentOrder = $currentBlock->order;
            
            $currentBlock->update(['order' => $adjacentBlock->order]);
            $adjacentBlock->update(['order' => $oldCurrentOrder]);
        }        

        return response()->json(['success' => true]);        
    }

    

    public function theory_block_add(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'section_id' => 'required|integer|exists:sections,id',
            'page'       => 'required|integer',
            'type'       => 'required|string|exists:type_of_media,name',
        ]);

        $mediaTypeObj = TypeOfMedia::where('name', $validated['type'])->firstOrFail();
        
        $maxOrder = TheoryBlock::where('section_id', $validated['section_id'])
            ->where('page', $validated['page'])
            ->max('order');
        $nextOrder = is_null($maxOrder) ? 0 : $maxOrder + 1;

        $contentData = null;

        if (in_array($validated['type'], ['text', 'title', 'video', 'word', 'table'])) {
            $contentData = json_decode($request->input('content'), true);
        } 
        elseif ($validated['type'] === 'image' && $request->hasFile('file')) {            
            $file = $request->file('file');
            $fileName = $this->processAndConvertImage($file, time() . '_' . rand(1000, 9999) . '.', 'theory');
            
            if (!$fileName) {
                return response()->json([
                    'success' => false, 
                    'message' => 'No file'
                ], 500);
            }
            
            $contentData = ['content' => $fileName];
        } 
        elseif ($validated['type'] === 'audio' && $request->hasFile('file')) {            
            $file = $request->file('file');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('audios/'), $fileName);
            
            $contentData = ['content' => $fileName];
        }

        TheoryBlock::create([
            'section_id'         => $validated['section_id'],
            'type_of_media_id'   => $mediaTypeObj->id,
            'content'            => $contentData,
            'page'               => $validated['page'],
            'order'              => $nextOrder,
        ]);

        return response()->json(['success' => true]);
    }

    public function theory_block_delete(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'block_id' => 'required|integer|exists:theory_blocks,id'
        ]);

        $block = TheoryBlock::with('typeOfMedia')->findOrFail($validated['block_id']);

        if ($block->typeOfMedia->name === 'image' && !empty($block->content['content'])) {
            $filePath = public_path('images/theory/' . $block->content['content']);
            if (file_exists($filePath)) @unlink($filePath);
        } 
        elseif ($block->typeOfMedia->name === 'audio' && !empty($block->content['content'])) {
            $filePath = public_path('audios/' . $block->content['content']);
            if (file_exists($filePath)) @unlink($filePath);
        }

        $block->delete();

        return response()->json(['success' => true]);
    }



    public function task_block_add(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'section_id'      => 'required|integer|exists:sections,id',
            'page'            => 'required|integer',
            'description'     => 'required|string|max:255',
            'task_numeration' => 'required|string',
            'answer_type'     => 'required|string|exists:type_of_answers,name',
            'media_type'      => 'required|string|exists:type_of_media,name',            
            'questions'       => 'required|array|min:1',
        ]);

        $answerTypeObj = TypeOfAnswer::where('name', $validated['answer_type'])->firstOrFail();
        $mediaTypeObj = TypeOfMedia::where('name', $validated['media_type'])->firstOrFail();
        $task_numeration = $validated['task_numeration'] === 'true' ? true : false;

        DB::beginTransaction();

        try {
            $maxTaskOrder = Task::where('section_id', $validated['section_id'])
                ->where('page', $validated['page'])
                ->max('order');
            $nextTaskOrder = is_null($maxTaskOrder) ? 0 : $maxTaskOrder + 1;

            $taskCreate = Task::create([
                'section_id'         => $validated['section_id'],
                'type_of_media_id'   => $mediaTypeObj->id,
                'type_of_answer_id'  => $answerTypeObj->id,
                'description'        => $validated['description'],                
                'page'               => $validated['page'],
                'order'              => $nextTaskOrder,
                'numeric'            => $task_numeration
            ]);

            $taskId = $taskCreate->id;

            foreach ($request->input('questions') as $qIndex => $qData) {
                
                $task_option_numeration = $qData['numeration'] === 'true' ? true : false;
                $finalContent = $qData['content'];

                if ($validated['media_type'] === 'image' || $validated['media_type'] === 'audio') {
                    
                    if (!$request->hasFile("questions.{$qIndex}.file")) {
                        return response()->json([
                            'success' => $qData, 
                            'message' => 'No file'
                        ], 500);
                    }

                    $file = $request->file("questions.{$qIndex}.file");                                        
                    
                    if ($validated['media_type'] === 'image') {
                        $fileName = $this->processAndConvertImage($file, time() . '_' . rand(1000, 9999) . '.', 'task');
                        
                        if (!$fileName) {
                            return response()->json([
                                'success' => $qData, 
                                'message' => 'No file'
                            ], 500);
                        }
                    } else {
                        $fileName = time() . '_' . rand(1000, 9999) . '.' . $file->getClientOriginalExtension();
                        $file->move(public_path('audios'), $fileName);
                    }
                    
                    $finalContent = $qData['has_gap'] === 'true' && $validated['media_type'] === 'image' ? $fileName . " (___)" : $fileName;
                }

                $TaskOptionCreate = TaskOption::create([
                    'task_id'    => $taskId,
                    'content'    => $finalContent,
                    'order'      => $qIndex,
                    'numeric'    => $task_option_numeration
                ]);

                $questionId = $TaskOptionCreate->id;

                if (isset($qData['gaps']) && is_array($qData['gaps'])) {
                    
                    foreach ($qData['gaps'] as $gapIndex => $gapData) {
                        
                        $savedOptionId = null;

                        if ($validated['answer_type'] === 'choice' && isset($gapData['options'])) {                                                        

                            $optionForTaskOptionCreate = OptionForTaskOption::create([
                                'task_option_id' => $questionId,
                                'option'         => $gapData['options'],
                                'order'          => $gapIndex,
                            ]);

                            $savedOptionId = $optionForTaskOptionCreate->id;
                        }

                        if ($validated['answer_type'] !== 'no-answer' && isset($gapData['answers']) && is_array($gapData['answers'])) {
                            
                            foreach ($gapData['answers'] as $ansText) {
                                if (is_null($ansText) || trim($ansText) === '') continue;                                

                                AnswerOption::create([
                                    'task_option_id'            => $questionId,
                                    'option_for_task_option_id' => $savedOptionId,
                                    'answer'                    => trim($ansText),
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true, 
                'message' => 'Каскадная структура задания успешно сохранена!'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false, 
                'message' => 'Ошибка при сохранении: ' . $e->getMessage()
            ], 500);
        }
    }

    private function processAndConvertImage($sourceFile, $prefix, $folder)
    {
        if ($folder === 'task')
            $destinationDir = public_path('images/task');
        else if ($folder === 'theory')
            $destinationDir = public_path('images/theory');
        else {
            return null;
        }

        if (!file_exists($destinationDir)) {
            mkdir($destinationDir, 0777, true);
        }

        $originalExtension = strtolower($sourceFile->getClientOriginalExtension());
        
        $tempName = $prefix . $originalExtension;
        $sourceFile->move($destinationDir, $tempName);
        
        $fullSourcePath = $destinationDir . '/' . $tempName;

        if (function_exists('imagecreatefromjpeg') && function_exists('imagewebp')) {
            try {
                if ($originalExtension === 'jpeg' || $originalExtension === 'jpg') {
                    $image = @imagecreatefromjpeg($fullSourcePath);
                } elseif ($originalExtension === 'png') {
                    $image = @imagecreatefrompng($fullSourcePath);
                    if ($image) {
                        imagepalettetotruecolor($image);
                        imagealphablending($image, true);
                        imagesavealpha($image, true);
                    }
                } else {
                    $image = false;
                }

                if ($image !== false) {
                    $webpName = str_replace('.' . $originalExtension, '.webp', $tempName);
                    $fullWebpPath = $destinationDir . '/' . $webpName;

                    $result = imagewebp($image, $fullWebpPath, 80);
                    imagedestroy($image);

                    if ($result && file_exists($fullWebpPath)) {
                        unlink($fullSourcePath);
                        return $webpName; 
                    }
                }
            } catch (\Exception $e) {

            }
        }

        return $tempName;
    }

    public function task_block_delete(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'task_id' => 'required|integer|exists:tasks,id'
        ]);

        $block = Task::with('typeOfMedia')->findOrFail($validated['task_id']);

        if (in_array($block->typeOfMedia->name, ['image', 'audio'])) {
        
            $options = TaskOption::where('task_id', $block->id)->get();

            foreach ($options as $option) {
                if (empty($option->content)) continue;

                $cleanFileName = str_replace(' (___)', '', $option->content);

                if ($block->typeOfMedia->name === 'image') {
                    $filePath = public_path('images/task/' . $cleanFileName);
                } else {
                    $filePath = public_path('audios/' . $cleanFileName);
                }

                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $block->delete();

        return response()->json(['success' => true]);        
    }

    public function task_option_block_delete(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'question_id' => 'required|integer|exists:task_options,id'
        ]);        

        $taskOption = TaskOption::findOrFail($validated['question_id']);

        $block = Task::with('typeOfMedia')->findOrFail($taskOption->task_id);

        if ($block->typeOfMedia->name === 'image' && !empty($block->content['content'])) {
            $cleanFileName = str_replace(' (___)', '', $taskOption->content);
            $filePath = public_path('images/task/' . $cleanFileName);
            if (file_exists($filePath)) @unlink($filePath);
        } 
        elseif ($block->typeOfMedia->name === 'audio' && !empty($block->content['content'])) {
            $cleanFileName = str_replace(' (___)', '', $taskOption->content);
            $filePath = public_path('audios/' . $cleanFileName);
            if (file_exists($filePath)) @unlink($filePath);
        }

        $taskOption->delete();

        return response()->json(['success' => true]);        
    }

    public function update_task(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'task_id'        => 'required|integer|exists:tasks,id',
            'description'    => 'required|string|max:255',
            'media_content'  => 'nullable|string',
            'taskNumeration' => 'required',
            'questions'      => 'required|array',
        ]);

        $task_numeration = $validated['taskNumeration'];

        DB::beginTransaction();

        try {
            $task = Task::findOrFail($validated['task_id']);
            
            $task->update([
                'description' => $validated['description'],
                'numeric'     => $task_numeration
            ]);

            foreach ($validated['questions'] as $qIndex => $qData) {
                if (!$qData['content']) return;
                
                $questionId = $qData['id'] ?? null;
                $option_numeration = $qData['numeration'];

                if (is_null($questionId)) {
                    $question = TaskOption::create([
                        'task_id' => $task->id,
                        'content' => $qData['content'],
                        'order'   => $qIndex,
                        'numeric' => $option_numeration
                    ]);
                } else {
                    $question = TaskOption::findOrFail($questionId);
                    
                    $question->update([
                        'content' => $qData['content'],
                        'order'   => $qIndex,
                        'numeric' => $option_numeration
                    ]);
                }

                OptionForTaskOption::where('task_option_id', $question->id)->delete();
                AnswerOption::where('task_option_id', $question->id)->delete();

                if (isset($qData['gaps']) && is_array($qData['gaps'])) {
                    foreach ($qData['gaps'] as $gapIndex => $gapData) {
                        
                        $savedOptionId = null;

                        if ($task->typeOfAnswer->name === 'choice' && isset($gapData['options'])) {                            

                            $savedOption = OptionForTaskOption::create([
                                'task_option_id' => $question->id,
                                'option'         => $gapData['options'],
                                'order'          => $gapIndex,
                            ]);

                            $savedOptionId = $savedOption->id;
                        }

                        if ($task->typeOfAnswer->name !== 'no-answer' && isset($gapData['answers']) && is_array($gapData['answers'])) {
                            foreach ($gapData['answers'] as $ansText) {
                                if (is_null($ansText) || trim($ansText) === '') continue;

                                AnswerOption::create([
                                    'task_option_id'            => $question->id,
                                    'option_for_task_option_id' => $savedOptionId,
                                    'answer'                    => trim($ansText),
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
