<?php

namespace App\Http\Middleware;

use App\Models\Manpower;
use App\Models\NavigationMenu;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load(['roles', 'permissions']) : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'navigationMenus' => fn () => Schema::hasTable('navigation_menus')
                ? NavigationMenu::active()
                    ->with(['subMenus' => fn ($q) => $q->active()->orderBy('order', 'asc')])
                    ->root()
                    ->orderBy('order', 'asc')
                    ->get()
                : [],
            'branding' => fn () => Schema::hasTable('settings')
                ? [
                    'logo' => ($lVal = Setting::where('key', 'app_logo')->value('value'))
                        ? (str_starts_with($lVal, '/') || str_starts_with($lVal, 'http') ? $lVal : asset('storage/'.$lVal))
                        : '/images/planner_logo.jpg',
                    'favicon' => ($fVal = Setting::where('key', 'app_favicon')->value('value'))
                        ? (str_starts_with($fVal, '/') || str_starts_with($fVal, 'http') ? $fVal : asset('storage/'.$fVal))
                        : '/images/favicon.png',
                    'app_title_main' => Setting::where('key', 'app_title_main')->value('value') ?? 'PLANT MAINTENANCE',
                    'app_title_sub' => Setting::where('key', 'app_title_sub')->value('value') ?? 'SYSTEM',
                    'app_tagline' => Setting::where('key', 'app_tagline')->value('value') ?? 'MINING OPERATION',
                ]
                : [
                    'logo' => '/images/planner_logo.jpg',
                    'favicon' => '/images/favicon.png',
                    'app_title_main' => 'PLANT MAINTENANCE',
                    'app_title_sub' => 'SYSTEM',
                    'app_tagline' => 'MINING OPERATION',
                ],
            'manpowerList' => fn () => Schema::hasTable('manpowers')
                ? Manpower::orderBy('nama', 'asc')->get(['id', 'nama', 'nrp', 'bagian', 'departemen'])
                : [],
        ];
    }
}
