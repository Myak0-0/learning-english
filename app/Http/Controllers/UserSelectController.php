<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\TeacherStudent;
use App\Models\TimeOfLesson;
use App\Models\User;
use App\Models\UserAdmin;
use App\Models\UserRight;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class UserSelectController extends Controller
{
    public function check_user_right(Request $request) 
    {
        $validated = $request->validate(['user_right' => 'boolean']);

        $this->check_admin($request, true);

        return response()->json(['success' => true], 200);
    }

    public function choose_user(Request $request)
    {
        $this->check_admin($request);

        $user = Auth::user();
        $role = $user->role->type_of_right;

        $allowedUserIds = null;

        if ($role == 'teacher') {
            $usersId = TeacherStudent::where('teacher_id', $user->id)->pluck('student_id')->toArray();
            $usersCreatorId = User::where('user_creator', $user->id)->pluck('id')->toArray();

            $allowedUserIds = collect($usersId)
                ->merge($usersCreatorId)
                ->unique()
                ->toArray();
        }

        $today = Carbon::today();
        $endOfWeek = Carbon::today()->addDays(7);
        
        $usersQuery = User::with(['rights', 'role', 'teacherStudents.user', 
        'timeOfLessons' => function ($query) use ($today, $endOfWeek) {
            $query->where('date_lesson', '>=', $today)
                  ->where('date_lesson', '<=', $endOfWeek)
                  ->orderBy('date_lesson', 'asc');}]);

        if ($role == 'teacher') {
            $usersQuery->whereIn('id', $allowedUserIds);
        }

        $users = $usersQuery->get();

        $groupedUsers = $users->groupBy(function ($user) {
            return $user->role ? $user->role->type_of_right : 'student';
        });

        $sections = Section::orderBy('order')->get();

        $active_Id = Session::get('active_student_id');                

        return Inertia::render('ChooseUser', [
            'users'    => $groupedUsers,
            'sections' => $sections,
            'active_Id' => (int)$active_Id
        ]);
    }

    public function set_active_student(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $this->check_admin($request);

        Session::put('active_student_id', $validated['user_id']);

        return response()->json([
            'message' => 'Active student session updated'
        ]);
    }

    public function save_user_right(Request $request)
    {
        $validated = $request->validate([
            'user_id'    => 'required|integer|exists:users,id',
            'section_id' => 'required|integer|exists:sections,id',
            'action'     => 'required|string|in:grant,revoke'
        ]);

        $this->check_admin($request);

        if ($validated['action'] === 'grant') {            
            UserRight::updateOrCreate([
                'user_id'    => $validated['user_id'],
                'section_id' => $validated['section_id']
            ]);
            $message = 'Access granted';
        } else {
            UserRight::where('user_id', $validated['user_id'])
                ->where('section_id', $validated['section_id'])
                ->delete();
            $message = 'Access revoked';
        }

        return response()->json([
            'message' => $message
        ]);
    }

    public function user_create(Request $request) {
        $validated = $request->validate([
            'id' => 'nullable|integer',
            'login' => 'required|string',
            'name' => 'required|string',
            'password' => 'nullable|string|min:5',
            'english_level' => 'nullable|string',
            'user_info' => 'nullable|string',
            'type_of_right' => 'required|string|in:admin,teacher,student'
        ]);

        $this->check_admin($request, true);

        $data = [
            'login'         => $validated['login'],
            'name'          => $validated['name'],
            'english_level' => $validated['english_level'] ?? null,
            'user_info'     => $validated['user_info'] ?? null
        ];

        if ($validated['id']) {
            $user_id = $validated['id'];
        } else {
            if (empty($validated['password'])) {
                return response()->json(['message' => 'Пароль обязателен для нового пользователя'], 422);
            }
            
            $data['user_creator'] = Auth::id();

            $request->validate(['login' => 'unique:users,login']);

            do {
                $user_id = rand(1000000, 9999999);
                $idExists = User::where('id', $user_id)->exists();
            } while ($idExists);
        }

        if (!empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        User::updateOrCreate(
            ['id' => $user_id],
            $data
        );

        $right = $validated['type_of_right'];
        if ($right == 'student') {
            UserAdmin::where('user_id', $user_id)->delete();
        } else {
            UserAdmin::updateOrCreate(
                ['user_id' => $user_id],
                ['type_of_right' => $right]
            );
        }

        return response()->json(['status' => 'success']);
    }

    public function user_delete(Request $request) {
        $validated = $request->validate([
            'id' => 'required|integer|exists:users,id'
        ]);

        $this->check_admin($request, true);

        User::where('id', $validated['id'])->delete();

        return response()->json(['success' => true]);
    }

    public function teacher_student(Request $request) {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'teacher_id' => 'required|integer|exists:users,id'
        ]);

        $this->check_admin($request, true);

        $teacher_exists = UserAdmin::where('user_id', $validated['teacher_id'])->where('type_of_right', 'teacher')->exists();

        if (!$teacher_exists) {
            return response()->json(['message' => 'The user is not a teacher'], 404);
        }
        $user_exists = TeacherStudent::where('student_id', $validated['student_id'])->exists();

        if ($user_exists) {
            TeacherStudent::where('student_id', $validated['student_id'])->delete();
        } else {
            TeacherStudent::create([
                'student_id' => $validated['student_id'],
                'teacher_id' => $validated['teacher_id']
            ]);
        }

        return response()->json(['success' => true]);
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
