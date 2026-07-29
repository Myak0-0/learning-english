<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\User;
use App\Models\UserAdmin;
use App\Models\UserRight;
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
        
        $adminIds = UserAdmin::pluck('user_id');

        $users = User::whereNotIn('id', $adminIds)
            ->with('rights')
            ->get();

        $sections = Section::orderBy('order')->get();

        $active_Id = Session::get('active_student_id');                

        return Inertia::render('ChooseUser', [
            'users'    => $users,
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
            'login'    => 'required|string|unique:users,name',
            'name' => 'required|string',
            'password'     => 'required|string|min:5',
            'english_level'     => 'nullable|string'
        ]);

        $user_id = rand(1000000, 9999999);

        User::create([
            'id' => $user_id,
            'login' => $validated['login'],
            'name' => $validated['name'],
            'password' => Hash::make($validated['password']),
            'english_level' => $validated['english_level'] ?? null
        ]);

        return response()->json(['status' => 'success']);
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
                ], 403)->send();
                exit;
            }

            redirect()->route('login')->send();
            exit;
        }
    }
}
