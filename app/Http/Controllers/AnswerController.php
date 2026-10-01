<?php

namespace App\Http\Controllers;

use App\Models\AnswerOption;
use App\Models\Task;
use Illuminate\Http\Request;
use App\Models\UserTaskAnswer;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    private function cleanText(?string $text): string {
        if (!$text) {
            return '';
        }

        $str = trim(mb_strtolower($text, 'UTF-8'));

        $patterns = [
            "/\bn't\b/i" => " not",
            "/\b'm\b/i"  => " am",
            "/\b're\b/i" => " are",
            "/\b's\b/i"  => " is",
            "/\b'll\b/i" => " will",
            "/\b've\b/i" => " have",
            "/\b'd\b/i"  => " would"
        ];
        $str = preg_replace(array_keys($patterns), array_values($patterns), $str);

        $punctuation = '/[.,\/#!$%\^&\*;:{}=\-_`~()?«»\'"]+/u';
        $str = preg_replace($punctuation, '', $str);

        $str = preg_replace('/\s+/', ' ', $str);

        return trim($str);
    }

    public function remember_answer(Request $request) {
        $validated = $request->validate([
            'user_id'                   => 'required|integer|exists:users,id',
            'task_id'                   => 'required|integer|exists:tasks,id',
            'task_option_id'            => 'required|integer',
            'option_for_task_option_id' => 'nullable|integer',
            'answer'                    => 'required|string|max:255'
        ]);        

        if (Auth::user()->admin()) {
            $user_id = $validated['user_id'];
        } else {
            $user_id = Auth::user()->id;
        }

        $task = Task::findOrFail($validated['task_id']);
        $typeOfAnswer = $task->typeOfAnswer->name;

        if (!$validated['answer']) {
            return response()->json([
                "message" => "You can't send an empty answer."
            ], 403);
        }
        
        if ($typeOfAnswer == 'choice') {
            $hasCorrectAnswer = UserTaskAnswer::where('user_id', $validated['user_id'])
                ->where('task_option_id', $validated['task_option_id'])
                ->where('option_for_task_option_id', $validated['option_for_task_option_id'])
                ->where('user_id', $user_id)
                ->where('is_correct', true)
                ->exists();
        } elseif ($typeOfAnswer == 'input') {
            $hasCorrectAnswer = UserTaskAnswer::where('user_id', $validated['user_id'])
                ->where('task_option_id', $validated['task_option_id'])
                ->where('user_id', $user_id)
                ->where('is_correct', true)
                ->exists();
        } elseif ($typeOfAnswer == 'no-answer') {
            UserTaskAnswer::updateOrCreate([
                'user_id'                   => $validated['user_id'],
                'task_option_id'            => $validated['task_option_id'],
                'option_for_task_option_id' => $validated['option_for_task_option_id'],
            ],
            [
                'answer'                    => $validated['answer'],                
                'is_correct'                => true,
            ]);
            return response()->json([
                'message' => 'Answer saved successfully'
            ]);
        } else {            
            return response()->json([
                "message" => "Unknown type."
            ], 404);
        }
        if ($hasCorrectAnswer) {
            return response()->json([
                'message' => 'You have already answered this question correctly. Changes are not allowed.'
            ], 403);
        }


        if ($typeOfAnswer == 'choice') {
            $alreadyExists = UserTaskAnswer::where('user_id', $validated['user_id'])
                ->where('task_option_id', $validated['task_option_id'])
                ->where('answer', $validated['answer'])
                ->where('option_for_task_option_id', $validated['option_for_task_option_id'])
                ->where('user_id', $user_id)
                ->exists();
        } elseif ($typeOfAnswer == 'input') {
            $alreadyExists = UserTaskAnswer::where('user_id', $validated['user_id'])
                ->where('task_option_id', $validated['task_option_id'])
                ->where('answer', $validated['answer'])                
                ->where('user_id', $user_id)
                ->exists();
        }
        if ($alreadyExists) {
            return response()->json([
                'message' => 'This answer is already recorded'
            ], 403);
        }

        $is_correct = false;
        if ($typeOfAnswer == 'choice') {
            $real_answers = AnswerOption::where('task_option_id', $validated['task_option_id'])
                            ->where('option_for_task_option_id', $validated['option_for_task_option_id'])->pluck('answer')->toArray();
            
            $userAnswerCleaned = $this->cleanText($validated['answer']);

            foreach ($real_answers as $answer) {
                if ($userAnswerCleaned === $this->cleanText($answer)) {
                    $is_correct = true;
                    break;
                }
            }
        } elseif ($typeOfAnswer == 'input') {
            $real_answers = AnswerOption::where('task_option_id', $validated['task_option_id'])->pluck('answer')->toArray();
            
            $userAnswerCleaned = $this->cleanText($validated['answer']);

            foreach ($real_answers as $answer) {
                if ($userAnswerCleaned === $this->cleanText($answer)) {
                    $is_correct = true;
                    break;
                }
            }
        } elseif ($typeOfAnswer == 'no-answer') {
            $is_correct = true;
        }

        UserTaskAnswer::create([
            'user_id'                   => $validated['user_id'],
            'task_option_id'            => $validated['task_option_id'],
            'answer'                    => $validated['answer'],
            'option_for_task_option_id' => $validated['option_for_task_option_id'],
            'is_correct'                => $is_correct,
        ]);

        return response()->json([
            'message' => 'Answer saved successfully',
            'is_correct' => $is_correct
        ]);
    }
}
