<?php

namespace App\Http\Controllers;

use App\Models\NavigationMenu;
use App\Models\Permission;
use App\Models\Setting;
use Database\Seeders\NavigationMenuSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NavigationMenuController extends Controller
{
    /**
     * Display a listing of navigation menus and builder interface.
     */
    public function index(Request $request): Response
    {
        $menus = NavigationMenu::query()
            ->with(['subMenus' => function ($query) {
                $query->orderBy('order', 'asc');
            }])
            ->root()
            ->orderBy('order', 'asc')
            ->get();

        $permissions = Permission::orderBy('name')->pluck('name');

        $distinctSections = NavigationMenu::distinct()
            ->whereNotNull('section_label')
            ->pluck('section_label');

        $iconKeys = [
            'dashboard', 'kpi', 'masterData', 'unit', 'hourMeter', 'planInspect', 'inspectionCheck',
            'planComp', 'analisa', 'mcc', 'far', 'forecast', 'canibal', 'magPlug', 'battery', 'oil',
            'manpower', 'org', 'perhitungan', 'roster', 'cuti', 'users', 'settings', 'gatepass',
            'logs', 'jsa', 'performanceUnit', 'truck', 'disc', 'wrench', 'clipboard', 'shield',
            'portalDeck', 'tools', 'toolroom', 'washing', 'breakdown', 'spk', 'planService',
            'pm', 'checksheet', 'p2h', 'genset', 'dt', 'dozer', 'grader', 'warranty', 'tyre',
            'tirevault', 'pressure', 'inspection', 'document', 'database', 'calendar', 'analytics',
            'fuel', 'bell', 'check', 'video', 'play',
        ];

        $logoVal = Setting::where('key', 'app_logo')->value('value');
        $favVal = Setting::where('key', 'app_favicon')->value('value');

        $branding = [
            'logo' => $logoVal
                ? (str_starts_with($logoVal, '/') || str_starts_with($logoVal, 'http') ? $logoVal : asset('storage/'.$logoVal))
                : '/images/planner_logo.jpg',
            'favicon' => $favVal
                ? (str_starts_with($favVal, '/') || str_starts_with($favVal, 'http') ? $favVal : asset('storage/'.$favVal))
                : '/images/favicon.png',
            'has_custom_logo' => Setting::where('key', 'app_logo')->exists(),
            'has_custom_favicon' => Setting::where('key', 'app_favicon')->exists(),
            'app_title_main' => Setting::where('key', 'app_title_main')->value('value') ?? 'PLANT MAINTENANCE',
            'app_title_sub' => Setting::where('key', 'app_title_sub')->value('value') ?? 'SYSTEM',
            'app_tagline' => Setting::where('key', 'app_tagline')->value('value') ?? 'MINING OPERATION',
        ];

        return Inertia::render('Settings/MenuBuilder', [
            'menus' => $menus,
            'permissions' => $permissions,
            'distinctSections' => $distinctSections,
            'iconKeys' => $iconKeys,
            'branding' => $branding,
        ]);
    }

    /**
     * Store a newly created menu item.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'portal_id' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'href' => ['required', 'string', 'max:255'],
            'section_label' => ['nullable', 'string', 'max:100'],
            'parent_id' => ['nullable', 'exists:navigation_menus,id'],
            'icon_key' => ['nullable', 'string', 'max:50'],
            'permission' => ['nullable', 'string', 'max:255'],
            'badge' => ['nullable', 'string', 'max:50'],
            'target' => ['nullable', 'string', 'in:_self,_blank'],
            'is_active' => ['boolean'],
        ]);

        $validated['portal_id'] = $validated['portal_id'] ?? 'main';

        $maxOrder = NavigationMenu::where('parent_id', $validated['parent_id'] ?? null)
            ->max('order') ?? 0;

        $validated['order'] = $maxOrder + 1;
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['target'] = $validated['target'] ?? '_self';

        NavigationMenu::create($validated);

        return redirect()->back()->with('success', 'Menu berhasil ditambahkan.');
    }

    /**
     * Update an existing menu item.
     */
    public function update(Request $request, NavigationMenu $menu): RedirectResponse
    {
        $validated = $request->validate([
            'portal_id' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'href' => ['required', 'string', 'max:255'],
            'section_label' => ['nullable', 'string', 'max:100'],
            'parent_id' => ['nullable', 'exists:navigation_menus,id', 'different:id'],
            'icon_key' => ['nullable', 'string', 'max:50'],
            'permission' => ['nullable', 'string', 'max:255'],
            'badge' => ['nullable', 'string', 'max:50'],
            'target' => ['nullable', 'string', 'in:_self,_blank'],
            'is_active' => ['boolean'],
        ]);

        // Prevent setting a child as parent of itself
        if (! empty($validated['parent_id']) && $validated['parent_id'] == $menu->id) {
            return redirect()->back()->withErrors(['parent_id' => 'Menu tidak dapat menjadi sub-menu dari dirinya sendiri.']);
        }

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['target'] = $validated['target'] ?? '_self';

        $menu->update($validated);

        return redirect()->back()->with('success', 'Menu berhasil diperbarui.');
    }

    /**
     * Remove the specified menu item.
     */
    public function destroy(NavigationMenu $menu): RedirectResponse
    {
        // Delete sub-menus first
        $menu->subMenus()->delete();
        $menu->delete();

        return redirect()->back()->with('success', 'Menu berhasil dihapus.');
    }

    /**
     * Batch reorder menus and sub-menus via drag and drop.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:navigation_menus,id'],
            'items.*.order' => ['required', 'integer'],
            'items.*.parent_id' => ['nullable'],
            'items.*.section_label' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                NavigationMenu::where('id', $item['id'])->update([
                    'order' => $item['order'],
                    'parent_id' => ! empty($item['parent_id']) ? $item['parent_id'] : null,
                    'section_label' => $item['section_label'] ?? null,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Urutan menu berhasil disimpan.');
    }

    /**
     * Reset menus to system default seed.
     */
    public function resetDefault(): RedirectResponse
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        NavigationMenu::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $seeder = new NavigationMenuSeeder;
        $seeder->run();

        return redirect()->back()->with('success', 'Menu navigasi berhasil dikembalikan ke pengaturan default.');
    }

    /**
     * Quickly update a menu item's icon.
     */
    public function updateIcon(Request $request, NavigationMenu $menu): RedirectResponse
    {
        $validated = $request->validate([
            'icon_key' => ['required', 'string', 'max:50'],
        ]);

        $menu->update(['icon_key' => $validated['icon_key']]);

        return redirect()->back()->with('success', "Ikon menu \"{$menu->name}\" berhasil diubah menjadi {$validated['icon_key']}.");
    }

    /**
     * Update website branding: favicon, logo, and title identity.
     */
    public function updateBranding(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,jpg,jpeg,svg,webp', 'max:2048'],
            'preset_logo' => ['nullable', 'string'],
            'preset_favicon' => ['nullable', 'string'],
            'app_title_main' => ['nullable', 'string', 'max:100'],
            'app_title_sub' => ['nullable', 'string', 'max:100'],
            'app_tagline' => ['nullable', 'string', 'max:100'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_favicon' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('logo')) {
            $old = Setting::where('key', 'app_logo')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('logo')->store('branding', 'public');
            Setting::updateOrCreate(['key' => 'app_logo'], ['value' => $path, 'type' => 'string']);
        } elseif ($request->filled('preset_logo')) {
            $old = Setting::where('key', 'app_logo')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            Setting::updateOrCreate(['key' => 'app_logo'], ['value' => $request->preset_logo, 'type' => 'string']);
        } elseif ($request->boolean('remove_logo')) {
            $old = Setting::where('key', 'app_logo')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            Setting::where('key', 'app_logo')->delete();
        }

        if ($request->hasFile('favicon')) {
            $old = Setting::where('key', 'app_favicon')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('favicon')->store('branding', 'public');
            Setting::updateOrCreate(['key' => 'app_favicon'], ['value' => $path, 'type' => 'string']);
        } elseif ($request->filled('preset_favicon')) {
            $old = Setting::where('key', 'app_favicon')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            Setting::updateOrCreate(['key' => 'app_favicon'], ['value' => $request->preset_favicon, 'type' => 'string']);
        } elseif ($request->boolean('remove_favicon')) {
            $old = Setting::where('key', 'app_favicon')->value('value');
            if ($old && ! str_starts_with($old, '/') && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
            Setting::where('key', 'app_favicon')->delete();
        }

        if ($request->has('app_title_main')) {
            Setting::updateOrCreate(['key' => 'app_title_main'], ['value' => $request->app_title_main ?? 'PLANT MAINTENANCE', 'type' => 'string']);
        }
        if ($request->has('app_title_sub')) {
            Setting::updateOrCreate(['key' => 'app_title_sub'], ['value' => $request->app_title_sub ?? 'SYSTEM', 'type' => 'string']);
        }
        if ($request->has('app_tagline')) {
            Setting::updateOrCreate(['key' => 'app_tagline'], ['value' => $request->app_tagline ?? 'MINING OPERATION', 'type' => 'string']);
        }

        return redirect()->back()->with('success', 'Pengaturan favicon, logo, dan identitas website berhasil diperbarui.');
    }
}
