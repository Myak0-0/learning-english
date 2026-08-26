<?php

namespace App\Http\Controllers;

use App\Models\CategoryOfWord;
use App\Models\UserAdmin;
use App\Models\UserTimeOfRepeating;
use App\Models\Word;
use App\Models\WordCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WordController extends Controller
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

    public function show_words() {
        $currentUser = Auth::user();
        $isAdmin = $currentUser->admin();
        $words = null;

        if ($isAdmin) {
            $categories = CategoryOfWord::with('words')->get(); 
            
            $uncategorizedWords = Word::whereNotIn('id', function($query) {
                $query->select('word_id')->from('word_categories');
            })->get();

            if ($uncategorizedWords->isNotEmpty()) {
                $uncategorizedCategory = (object)[
                    'id' => 0,
                    'name' => 'Без категории',
                    'words' => $uncategorizedWords,
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                $categoriesArray = $categories->all();
                array_unshift($categoriesArray, $uncategorizedCategory);
                
                $categories = collect($categoriesArray);
            }

            $words = Word::select('*')->orderBy('created_at', 'desc')->get();
        } else {
            $categories = CategoryOfWord::whereHas('words', function ($query) use ($currentUser) {
                $query->whereIn('words.id', function ($subQuery) use ($currentUser) {
                    $subQuery->select('word_id')
                        ->from('user_time_of_repeatings')
                        ->where('user_id', $currentUser->id);
                });
            })->with(['words' => function ($query) use ($currentUser) {
                $query->whereIn('words.id', function ($subQuery) use ($currentUser) {
                    $subQuery->select('word_id')
                        ->from('user_time_of_repeatings')
                        ->where('user_id', $currentUser->id);
                });
            }])->get();
        }

        return Inertia::render('Words', [
            'is_admin' => $isAdmin,
            'initialCategories' => $categories,
            'currentUserId' => $currentUser->id,
            'words' => $words
        ]);
    }

    public function add_word_category(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:category_of_words,name'
        ]);

        $id = CategoryOfWord::insertGetId([
            'name' => $validated['name'],
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'id' => $id,
            'name' => $validated['name']
        ]);
    }

    public function delete_category(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'category_id' => 'required|integer|exists:category_of_words,id'
        ]);

        CategoryOfWord::find($validated['category_id'])->delete();

        return response()->json(['success' => true]);
    }

    public function add_new_word(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'translation' => 'required|string|max:255',
            'audio' => 'nullable|file|mimes:mp3,mpeg|max:5000'
        ]);

        $fileName = null;

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $fileName = time() . '_' . rand(0000, 9999) . '.' . $file->getClientOriginalExtension();

            $file->move(public_path('word-audios'), $fileName);
        }

        $id = Word::create([
            'name' => $validated['name'],
            'translation' => $validated['translation'],
            'audio' => $fileName,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['success' => true]);
    }

    public function translate_word(Request $request) {
        $word = $request->input('word');

        if (empty($word)) {
            return response()->json(['error' => $word], 400);
        }

        $response = Http::get('https://api.mymemory.translated.net', [
            'q' => $word,
            'langpair' => 'en|ru',
        ]);

        if ($response->successful()) {
            $translatedText = $response->json('responseData.translatedText');
            return response()->json(['translation' => mb_strtolower($translatedText)]);
        }

        return response()->json(['error' => 'Ошибка переводчика'], 500);
    }

    public function exist_word(Request $request) {
        $word = $request->input('word');
        
        $words = Word::where('name', $word)->get();

        return response()->json(['words' => $words]);
    }

    public function bring_word_to_category(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'word_id' => 'required|integer|exists:words,id',
            'category_id' => 'required|integer|exists:category_of_words,id'
        ]);

        $exists = WordCategory::where('word_id', $validated['word_id'])
            ->where('category_of_word_id', $validated['category_id'])
            ->exists();

        if (!$exists) {
            WordCategory::insert([
                'word_id' => $validated['word_id'],
                'category_of_word_id' => $validated['category_id']
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function delete_word_from_category(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'word_id' => 'required|integer',
            'category_id' => 'required|integer'
        ]);

        WordCategory::where('word_id', $validated['word_id'])
            ->where('category_of_word_id', $validated['category_id'])
            ->delete();

        return response()->json(['success' => true]);
    }

    public function delete_word(Request $request)
    {
        $this->check_admin($request);

        $validated = $request->validate([
            'word_id' => 'required|integer|exists:words,id'
        ]);

        $word = Word::find($validated['word_id']);

        if ($word) {
            if ($word->audio) {
                $absolutePath = public_path('word-audios/' . $word->audio);
                
                if (file_exists($absolutePath)) {
                    unlink($absolutePath);
                }
            }
            $word->delete(); 
        }

        return response()->json(['success' => true]);
    }

    public function search_word(Request $request)
    {
        $query = $request->input('query');

        if (empty($query)) {
            return response()->json([]);
        }

        $words = Word::where('name', 'LIKE', "%{$query}%")
                       ->orWhere('translation', 'LIKE', "%{$query}%")
                       ->limit(10)->get();

        return response()->json([
            'status' => 'success',
            'words' => $words
        ]);
    }

    public function add_word_to_learning(Request $request) {
        $validated = $request->validate([
            'word_ids' => 'required|array',
            'word_ids.*' => 'integer|exists:words,id',
            'currentUserId' => 'integer|exists:users,id'
        ]);

        $currentUser = Auth::user();

        if ($currentUser->admin()) {
            $userId = $validated['currentUserId'];

            if (UserAdmin::where('user_id', $userId)->exists()) {
                return response()->json(['success' => false]);
            }
        } else {
            $userId = $currentUser->id;
        }

        $wordIds = $validated['word_ids'];
        $now = now();
        
        $existingWordIds = UserTimeOfRepeating::where('user_id', $userId)
            ->whereIn('word_id', $wordIds)
            ->pluck('word_id')
            ->toArray();

        $newWordIds = array_diff($wordIds, $existingWordIds);

        $WordInsert = [];
        foreach ($newWordIds as $wordId) {
            $WordInsert[] = [
                'user_id'    => $userId,
                'word_id'    => $wordId,
                'repeating'  => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        UserTimeOfRepeating::insert($WordInsert);

        return response()->json(['success' => true]);
    }

    public function delete_word_from_learning(Request $request) {
        $validated = $request->validate([
            'word_id' => 'required|integer|exists:words,id',
            'currentUserId' => 'integer|exists:users,id'
        ]);

        $currentUser = Auth::user();

        if ($currentUser->admin()) {
            $userId = $validated['currentUserId'];

            if (UserAdmin::where('user_id', $userId)->exists()) {
                return response()->json(['success' => false]);
            }
        } else {
            $userId = $currentUser->id;
        }

        UserTimeOfRepeating::where('word_id', $validated['word_id'])->where('user_id', $userId)->delete();

        return response()->json(['success' => true]);
    }

    public function update_translation(Request $request) {
        $this->check_admin($request);

        $validated = $request->validate([
            'word_id' => 'required|integer|exists:words,id',
            'word_name' => 'required|string',
            'translation' => 'required|string'
        ]);

        $word = Word::findOrFail($validated['word_id']);
        $word->update([
            'name' => $validated['word_name'],
            'translation' => $validated['translation']
        ]);

        return response()->json(['success' => true]); 
    }
}
