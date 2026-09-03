<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterPmController extends Controller
{
    public function index(Request $request)
    {
        // For the dashboard, we need a list of units with their HM and service info.
        // We'll mock the specific PM intervals (250, 500, 1000, 2000, 4000, 8000), backlog, finding open, etc.
        // for now as they require complex relationships to tables that don't fully exist yet.

        $units = Unit::paginate(10);

        // Dummy stats for the top cards
        $stats = [
            'update_hm' => 126,
            'periodical_service' => 98,
            'backlog' => 23,
            'sos_pap_open' => 17,
            'historical_service' => 1245,
        ];

        return Inertia::render('MasterPm/Index', [
            'units' => $units,
            'stats' => $stats,
        ]);
    }
}
