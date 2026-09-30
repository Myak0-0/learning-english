<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\DeskUpdateEvent;
use App\Models\SectionDesk;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class DeskController extends Controller
{
    public function desk_update(Request $request, $topic_id) {
        $isAdmin = Auth::user()->admin();
        
        if ($isAdmin) {
            if (Session::get('active_student_id')) {
                $id_user = Session::get('active_student_id');
            } else {
                return redirect()->route('choose-user');
            }
        } else {
            $id_user = Auth::user()->id;
        }
        
        $snapshot = $request->input('snapshot');
        $desk = SectionDesk::updateOrCreate(
            ['section_id' => $topic_id, 'user_id' => $id_user],
            ['snapshot' => $snapshot]
        );

        broadcast(new DeskUpdateEvent($topic_id, $id_user, $snapshot))->toOthers();

        return response()->json([
            'status' => 'success',
            'last_update' => $desk ? $desk->updated_at->valueOf() : 0
        ]);
    }

    public function desk_check($topic_id) {
        $isAdmin = Auth::user()->admin();
        
        if ($isAdmin) {
            if (Session::get('active_student_id')) {
                $id_user = Session::get('active_student_id');
            } else {
                return redirect()->route('choose-user');
            }
        } else {
            $id_user = Auth::user()->id;
        }

        $desk = SectionDesk::where('section_id', $topic_id)
            ->where('user_id', $id_user)
            ->first(['updated_at', 'snapshot']);

        return response()->json([
            'last_update' => $desk ? $desk->updated_at->valueOf() : 0,
            'snapshot' => $desk ? $desk->snapshot : null
        ]);
    }
}