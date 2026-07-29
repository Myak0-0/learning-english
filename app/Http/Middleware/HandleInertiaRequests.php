<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $send_user = $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'english_level' => $user->english_level
        ] : null;

        if ($user && $user->admin()) {
            $send_user['is_admin'] = true;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $send_user,
            ],
        ];
    }
}
