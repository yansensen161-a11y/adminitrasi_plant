<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListPopulasiController extends Controller
{
    public function index(Request $request)
    {
        $locationFilter = $request->input('location', '');

        // Fetch all units matching the filter
        $query = Unit::query();

        if ($locationFilter) {
            $query->where('location', $locationFilter);
        }

        $units = $query->get();

        // Calculate Stats
        $stats = [
            'total' => $units->count(),
            'aktif' => $units->whereIn('status', ['Operational', 'Ready'])->count(),
            'standby' => $units->where('status', 'Standby')->count(),
            'maintenance' => $units->where('status', 'Maintenance')->count(),
            'breakdown' => $units->where('status', 'Breakdown')->count(),
        ];

        // Group by Location for the table
        // We don't have department on Unit, so we just group by location
        $groupedData = [];

        foreach ($units as $unit) {
            $loc = $unit->location ?: 'UNASSIGNED';
            if (! isset($groupedData[$loc])) {
                $groupedData[$loc] = [
                    'lokasi' => $loc,
                    'department' => '-', // Dummy since department isn't available
                    'total' => 0,
                    'aktif' => 0,
                    'standby' => 0,
                    'maintenance' => 0,
                    'breakdown' => 0,
                ];
            }

            $groupedData[$loc]['total']++;

            $status = $unit->status;
            if (in_array($status, ['Operational', 'Ready'])) {
                $groupedData[$loc]['aktif']++;
            } elseif ($status === 'Standby') {
                $groupedData[$loc]['standby']++;
            } elseif ($status === 'Maintenance') {
                $groupedData[$loc]['maintenance']++;
            } elseif ($status === 'Breakdown') {
                $groupedData[$loc]['breakdown']++;
            }
        }

        // Sort by location name
        ksort($groupedData);

        $locationsList = Unit::select('location')->distinct()->whereNotNull('location')->pluck('location');

        return Inertia::render('ListPopulasi/Index', [
            'data' => array_values($groupedData),
            'stats' => $stats,
            'locationsList' => $locationsList,
            'filters' => [
                'location' => $locationFilter,
            ],
        ]);
    }
}
