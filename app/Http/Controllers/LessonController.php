<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\TaskOption;
use App\Models\User;
use App\Models\UserRight;
use App\Models\UserTaskAnswer;
use App\Models\UserTimeOfRepeating;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function showFoldel($parentId = null)
    {
        $is_admin = Auth::user()->admin();

        if ($is_admin) {
            $items = Section::where('parent_id', $parentId)
                ->orderBy('is_topic')
                ->orderBy('order')
                ->get();
        } else {
            $currentUser = Auth::user();

            if ($parentId) {
                $isThereRight = UserRight::where('section_id', $parentId)->where('user_id', $currentUser->id)->exists();
                if (!$isThereRight) {
                    return redirect()->route('lessons');
                }
            }

            $items = Section::join('user_rights', 'sections.id', '=', 'user_rights.section_id')
                ->select('sections.*')
                ->where('sections.parent_id', $parentId)
                ->where('user_rights.user_id', $currentUser->id)
                ->orderBy('is_topic')
                ->orderBy('user_rights.created_at', 'desc')
                ->get();
        }

        $currentFolder = $parentId ? Section::find($parentId) : null;        

        return Inertia::render('Lessons', [
            'items' => $items,
            'currentFolder' => $currentFolder,
            'is_admin' => $is_admin
        ]);
    }

    public function showTopic($id, $page = 1)
    {
        $topic = Section::findOrFail($id);
        
        $isAdmin = Auth::user()->admin();
        
        if ($isAdmin) {
            if (Session::get('active_student_id')) {
                $id_user = Session::get('active_student_id');
            } else {
                return redirect()->route('choose-user');
            }
        } else {
            $id_user = Auth::user()->id;
            
            $isThereRight = UserRight::where('section_id', $id)->where('user_id', $id_user)->exists();
            if (!$isThereRight) {
                return redirect()->route('lessons');
            }
        }

        if (!$topic->is_topic) {
            return redirect()->route('lessons', $topic->id);
        }

        $topic->load([
            'theoryBlocks' => function ($query) use ($page) {
                $query->where('page', $page)
                    ->orderBy('order')
                    ->with('typeOfMedia');
            },            
            'tasks' => function ($query) use ($page, $id_user) {
                $query->where('page', $page)
                    ->orderBy('order')
                    ->with([
                        'typeOfMedia', 
                        'typeOfAnswer',                         
                        'taskOptions' => function ($q) use ($id_user) {
                            $q->orderBy('order')
                                ->with(['optionForTaskOptions', 'answerOptions', 'taskAnswers' => function ($q) use ($id_user) {
                                    $q->where('user_id', $id_user);
                                }]);
                        }                        
                    ]);
            }
        ]);

        $listIds = $topic->tasks->flatMap(function ($task) {
            return $task->taskOptions->pluck('id');
        })->toArray();

        $lastUpdated = UserTaskAnswer::where('user_id', $id_user)
                                       ->whereIn('task_option_id', $listIds)
                                       ->max('updated_at');
        
        if (!$lastUpdated) {
            $lastUpdated = UserTaskAnswer::where('user_id', $id_user)->max('updated_at');
        }

        foreach ($topic->theoryBlocks as $block) {
            if ($block->typeOfMedia->name === 'word') {
                                
                $contentData = $block->content;
                
                if (isset($contentData['content']) && is_array($contentData['content'])) {
                    $wordIds = $contentData['content'];
                    
                    $wordsCollection = Word::whereIn('id', $wordIds)->get();

                    $userWords = UserTimeOfRepeating::where('user_id', $id_user)
                                    ->whereIn('word_id', $wordIds)
                                    ->pluck('word_id')
                                    ->toArray();
                    
                    $wordsCollection->map(function ($word) use ($userWords) {
                        $word->isRepeating = in_array($word->id, $userWords);
                        return $word;
                    });

                    $block->word_details = $wordsCollection;
                }
            }
        }

        return Inertia::render('TopicShow', [
            'topic' => $topic,
            'currentPage' => (int)$page,
            'currentUserId' => (int)$id_user,
            'listIds' => $listIds,
            'lastUpdated' => $lastUpdated,
            'isAdmin' => $isAdmin
        ]);
    }

    public function get_new_answers(Request $request)
    {
        $validated = $request->validate([
            'user_id'      => 'required|integer|exists:users,id',
            'list_ids'     => 'required|array',
            'last_updated' => 'required|date'
        ]);
        $listIds = $validated['list_ids'];
        $userId = $validated['user_id'];
        $lastUpdated = $validated['last_updated'];
        
        $newAnswers = UserTaskAnswer::whereIn('task_option_id', $listIds)            
            ->where('user_id', $userId)
            ->where('updated_at', '>', $lastUpdated)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'new_answers' => $newAnswers
        ]);
    }
}
