<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TeacherStudent;
use App\Models\TimeOfLesson;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function schedule_show(Request $request)
    {
        $user = Auth::user();
        
        $role = 'student';
        if ($user->admin()) {
            $role = $user->role->type_of_right;
        }

        $startDateInput = $request->input('start_date', Carbon::today()->format('Y-m-d'));
        $endDateInput = $request->input('end_date', Carbon::parse($startDateInput)->addDays(6)->format('Y-m-d'));
        
        $startDate = Carbon::parse($startDateInput)->startOfDay();
        $endDate = Carbon::parse($endDateInput)->endOfDay();

        if ($endDate->lessThan($startDate)) {
            $endDate = $startDate->copy()->endOfDay();
            $endDateInput = $startDateInput;
        }

        $teachersList = [];
        $students = [];
        $lessons = [];

        if ($role === 'admin') {
            $teachersList = User::whereHas('role', function($q) {
                $q->where('type_of_right', 'teacher');
            })->get(['id', 'name']);

            $selectedTeacherId = $request->input('teacher_id', $teachersList->first()?->id);

            if ($selectedTeacherId) {
                $attachedStudentIds = TeacherStudent::where('teacher_id', $selectedTeacherId)->pluck('student_id')->toArray();
                $createdStudentIds = User::where('user_creator', $selectedTeacherId)->pluck('id')->toArray();
                $uniqueStudentIds = array_unique(array_merge($attachedStudentIds, $createdStudentIds));

                $students = User::whereIn('id', $uniqueStudentIds)->get(['id', 'name']);
                $lessons = TimeOfLesson::where('teacher_id', $selectedTeacherId)
                    ->whereBetween('date_lesson', [$startDate, $endDate])
                    ->get();
            }

        } elseif ($role === 'teacher') {
            $attachedStudentIds = TeacherStudent::where('teacher_id', $user->id)->pluck('student_id')->toArray();
            $createdStudentIds = User::where('user_creator', $user->id)->pluck('id')->toArray();
            $uniqueStudentIds = array_unique(array_merge($attachedStudentIds, $createdStudentIds));

            $students = User::whereIn('id', $uniqueStudentIds)->get(['id', 'name']);
            $lessons = TimeOfLesson::where('teacher_id', $user->id)
                ->whereBetween('date_lesson', [$startDate, $endDate])
                ->get();

        } else {
            $students = [ ['id' => $user->id, 'name' => $user->name] ];
            $lessons = TimeOfLesson::where('student_id', $user->id)
                ->whereBetween('date_lesson', [$startDate, $endDate])
                ->get();
        }

        $timelineDays = [];
        $diffInDays = $startDate->diffInDays($endDate);
        
        $maxDays = min($diffInDays, 31); 

        $currentDay = $startDate->copy();
        for ($i = 0; $i <= $maxDays; $i++) {
            $timelineDays[] = [
                'iso' => $currentDay->format('Y-m-d'),
                'label' => $currentDay->isoFormat('dddd (DD.MM)'),
            ];
            $currentDay->addDay();
        }

        return Inertia::render('ScheduleShow', [
            'role'         => $role,
            'students'     => $students,
            'lessons'      => $lessons,
            'teachersList' => $teachersList,
            'timelineDays' => $timelineDays,
            'filters'      => [
                'teacher_id' => $request->input('teacher_id'),
                'start_date' => $startDateInput,
                'end_date'   => $endDateInput
            ]
        ]);
    }

    public function schedule_update(Request $request) {
        $this->check_admin($request, true);

        $userRole = Auth::user()->role->type_of_right;

        $formData = $request->input('formData');

        $lesson = TimeOfLesson::findOrFail($formData['id']);

        if ($userRole === 'teacher') {
            $nowInUtc = Carbon::now('UTC');

            $lessonTimeInUtc = Carbon::parse($lesson->date_lesson, $lesson->time_zone)->setTimezone('UTC');

            $lockTime = $lessonTimeInUtc->copy()->subMinutes(30);

            $lesson->update(['lesson_link' => $formData['lesson_link']]);

            if ($nowInUtc->greaterThanOrEqualTo($lockTime)) {
                return response()->json([
                    'message' => "Teacher can't change past lessons or lessons that start in less than 30 minutes"
                ], 403);
            }
        }

        $lesson->update([
            'date_lesson'     => $formData['date_lesson'],
            'lesson_duration' => $formData['lesson_duration'],
            'is_paid'         => $formData['is_paid'],
            'price'           => $formData['price'],
            'lesson_link'     => $formData['lesson_link'],
            'time_zone'       => $formData['time_zone']
        ]);

        return response()->json(['message' => 'Урок изменен']);
    }

    public function schedule_create(Request $request) {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'teacher_id' => 'nullable|integer|exists:users,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
            'lesson_duration' => 'required|integer|in:15,30,45,60,75,90',
            'price' => 'nullable|decimal:0,10',
            'lesson_link' => 'nullable|string',
            'time_zone' => 'required|string|in:+2,+3,+4,+5,+6,+7,+8,+9,+10,+11,+12'
        ]);

        $this->check_admin($request, true);

        $userRole = Auth::user()->role->type_of_right;

        if ($userRole === 'teacher') {
            $teacher_id = Auth::id();

            $lessonDateTimeLocal = Carbon::parse($validated['date'] . ' ' . $validated['time'], $validated['time_zone']);
            
            $lessonTimeInUtc = $lessonDateTimeLocal->copy()->setTimezone('UTC');

            $nowInUtc = Carbon::now('UTC');

            if ($lessonTimeInUtc->lessThanOrEqualTo($nowInUtc)) {
                return response()->json([
                    'message' => "You can't create lessons for a time in the past"
                ], 403);
            }
        } else {
            $teacher_id = $validated['teacher_id'];
            
            if (!$teacher_id) {
                return response()->json(['message' => 'Teacher is not selected'], 403);
            }
        }

        $dateLesson = Carbon::parse($validated['date'] . ' ' . $validated['time']);

        $duration = CarbonInterval::minutes($validated['lesson_duration'])->cascade()->format('%H:%I:%S');

        TimeOfLesson::create([
            'student_id'      => $validated['student_id'],
            'teacher_id'      => $teacher_id,
            'date_lesson'     => $dateLesson,
            'lesson_duration' => $duration,
            'is_paid'         => false,
            'price'           => $validated['price'],
            'lesson_link'     => $validated['lesson_link'],
            'time_zone'       => $validated['time_zone']
        ]);

        return response()->json(['message' => 'Урок успешно запланирован']);
    }

    public function schedule_delete(Request $request) {
        $validated = $request->validate([
            'id' => 'required|integer|exists:time_of_lessons,id'
        ]);

        $this->check_admin($request, true);

        $userRole = Auth::user()->role->type_of_right;

        $lesson = TimeOfLesson::findOrFail($validated['id']);

        if ($userRole === 'teacher') {
            $nowInUtc = Carbon::now('UTC');

            $lessonTimeInUtc = Carbon::parse($lesson->date_lesson, $lesson->time_zone)->setTimezone('UTC');

            $lockTime = $lessonTimeInUtc->copy()->subMinutes(30);

            if ($nowInUtc->greaterThanOrEqualTo($lockTime)) {
                return response()->json([
                    'message' => "Teacher can't change past lessons or lessons that start in less than 30 minutes"
                ], 403);
            }
        }

        $lesson->delete();

        return response()->json(['success' => true]);
    }

    public function lesson_link() {
        $user = Auth::user();

        $role = $user->role?->type_of_right ?? 'student';

        $userId = Auth::id();

        $nowInUtc = Carbon::now('UTC');

        $startDate = Carbon::now('UTC')->subDay()->startOfDay();
        $endDate = Carbon::now('UTC')->addDays(2)->endOfDay();

        $searchColumn = ($role === 'teacher') ? 'teacher_id' : 'student_id';

        $lessons = TimeOfLesson::where($searchColumn, $userId)
            ->whereBetween('date_lesson', [$startDate, $endDate])
            ->get();

        $lessonLink = null;

        foreach ($lessons as $lesson) {
            $lessonStartInUtc = Carbon::parse($lesson->date_lesson, $lesson->time_zone)->setTimezone('UTC');

            $allowedStart = $lessonStartInUtc->copy()->subMinutes(10);

            list($hours, $minutes, $seconds) = explode(':', $lesson->lesson_duration);
            $allowedEnd = $lessonStartInUtc->copy()
                ->addHours((int)$hours)
                ->addMinutes((int)$minutes)
                ->addSeconds((int)$seconds);

            if ($nowInUtc->between($allowedStart, $allowedEnd)) {
                $lessonLink = $lesson->lesson_link;
                break;
            }
        }

        return response()->json([
            'lesson_link' => $lessonLink ?? ''
        ]);
    }






    protected function check_admin(Request $request, bool $isAjax = false) {
        if (!Auth::user()->admin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            if ($isAjax) {
                response()->json([
                    'redirect' => route('login'),
                    'message' => 'Unauthorized'
                ], 401)->send();
                exit;
            }

            redirect()->route('login')->send();
            exit;
        }
    }
}
