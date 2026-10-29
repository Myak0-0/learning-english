<?php

namespace App\Http\Controllers;

use App\Models\AnswerOption;
use App\Models\Task;
use App\Models\TimeOfLesson;
use Illuminate\Http\Request;
use App\Models\UserTaskAnswer;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    private function cleanText(?string $text): string {
        if (!$text) {
            return '';
        }

        $str = trim(mb_strtolower($text, 'UTF-8'));

        $str = str_replace(['’', '`', '‘'], "'", $str);

        $patterns = [
            "/n't/" => " not",
            "/'m/"  => " am",
            "/'re/" => " are",
            "/'s/"  => " is",
            "/'ll/" => " will",
            "/'ve/" => " have",
            "/'d/"  => " would"
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

        $startDate = Carbon::now('UTC')->subDay()->startOfDay();
        $endDate = Carbon::now('UTC')->addDays(2)->endOfDay();

        $lessons = TimeOfLesson::where('student_id', $user_id)
            ->whereBetween('date_lesson', [$startDate, $endDate])
            ->get();

        $canSubmit = false;

        foreach ($lessons as $lesson) {
            $lessonStartUTC = Carbon::parse($lesson->date_lesson, $lesson->time_zone)->utc();
            
            $allowedStart = $lessonStartUTC->copy()->subMinutes(15);
            
            list($hours, $minutes, $seconds) = explode(':', $lesson->lesson_duration);
            
            $allowedEnd = $lessonStartUTC->copy()
                ->addHours((int)$hours)
                ->addMinutes((int)$minutes)
                ->addSeconds((int)$seconds)
                ->addMinutes(15);

            $nowUTC = Carbon::now('UTC');

            if ($nowUTC->between($allowedStart, $allowedEnd)) {
                $canSubmit = true;
                break; 
            }
        }

        if (!$canSubmit) {
            return response()->json([
                'message' => 'Access denied. There are no lessons right now'
            ], 403);
        }



        $unpaidLessons = TimeOfLesson::where('student_id', $user_id)
            ->where('is_paid', false)
            ->get();

        $nowInUtc = Carbon::now('UTC');
        $unpaidPastLessonsCount = 0;

        foreach ($unpaidLessons as $lesson) {
            $lessonStartInUtc = Carbon::parse($lesson->date_lesson, $lesson->time_zone)->setTimezone('UTC');

            list($hours, $minutes, $seconds) = explode(':', $lesson->lesson_duration);
            $lessonEndInUtc = $lessonStartInUtc->copy()
                ->addHours((int)$hours)
                ->addMinutes((int)$minutes)
                ->addSeconds((int)$seconds);

            if ($lessonEndInUtc->lessThan($nowInUtc)) {
                $unpaidPastLessonsCount++;
            }
        }

        if ($unpaidPastLessonsCount >= 2) {
            return response()->json([
                'message' => "Student has $unpaidPastLessonsCount unpaid lessons, answering is forbidden"
            ], 403);
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
        $userAnswerCleaned = $this->cleanText($validated['answer']);

        if ($typeOfAnswer == 'choice') {
            $real_answers = AnswerOption::where('task_option_id', $validated['task_option_id'])
                            ->where('option_for_task_option_id', $validated['option_for_task_option_id'])->pluck('answer')->toArray();

            foreach ($real_answers as $answer) {
                if ($userAnswerCleaned === $this->cleanText($answer)) {
                    $is_correct = true;
                    break;
                }
            }
        } elseif ($typeOfAnswer == 'input') {
            $real_answers = AnswerOption::where('task_option_id', $validated['task_option_id'])->pluck('answer')->toArray();

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
