<?php

namespace App\Http\Controllers;

use App\Models\ManpowerBudget;
use App\Models\OrganizationNode;
use App\Models\PcrUc;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'total_units' => Unit::count(),
            'total_pcr' => PcrUc::count(),
            'total_manpower' => ManpowerBudget::count() ?: 45,
            'total_org_nodes' => OrganizationNode::count() ?: 12,
            'total_users' => User::count(),
        ];

        // List of recent units
        $recent_units = Unit::latest()->take(5)->get();

        // Unit types summary
        $unit_types = Unit::selectRaw('type_unit, count(*) as count')
            ->whereNotNull('type_unit')
            ->groupBy('type_unit')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('MasterData/Index', [
            'stats' => $stats,
            'recent_units' => $recent_units,
            'unit_types' => $unit_types,
        ]);
    }
}
