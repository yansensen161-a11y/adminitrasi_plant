<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MagneticPlugController extends Controller
{
    public function index(Request $request)
    {
        $data = [
            [
                'no' => 1, 'code_unit' => 'ME052', 'hm' => '12,563.7', 'date' => '30-Jun-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Differential', 'rating' => 'Good', 'remarks' => 'Normal',
            ],
            [
                'no' => 2, 'code_unit' => 'ME052', 'hm' => '12,563.7', 'date' => '30-Jun-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Final Drive LH', 'rating' => 'Fair', 'remarks' => 'Sedikit partikel besi',
            ],
            [
                'no' => 3, 'code_unit' => 'ME052', 'hm' => '12,563.7', 'date' => '30-Jun-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Final Drive RH', 'rating' => 'Good', 'remarks' => 'Normal',
            ],
            [
                'no' => 4, 'code_unit' => 'ME067', 'hm' => '6,477', 'date' => '18-Aug-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Front Wheel LH', 'rating' => 'Fair', 'remarks' => 'Terdapat partikel halus',
            ],
            [
                'no' => 5, 'code_unit' => 'ME067', 'hm' => '6,477', 'date' => '18-Aug-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Front Wheel RH', 'rating' => 'Good', 'remarks' => 'Normal',
            ],
            [
                'no' => 6, 'code_unit' => 'OHT070', 'hm' => '16,796.5', 'date' => '04-Apr-26',
                'metode_filter' => 'Cutting Filter', 'component' => 'Transmission', 'rating' => 'Poor', 'remarks' => 'Filter kotor, ganti filter',
            ],
            [
                'no' => 7, 'code_unit' => 'OHT072', 'hm' => '16,638.4', 'date' => '21-Aug-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Differential', 'rating' => 'Good', 'remarks' => 'Normal',
            ],
            [
                'no' => 8, 'code_unit' => 'MDT030', 'hm' => '10,005', 'date' => '26-Dec-25',
                'metode_filter' => 'Check Cylinder', 'component' => 'Transmission', 'rating' => 'Fair', 'remarks' => 'Keausan ringan',
            ],
            [
                'no' => 9, 'code_unit' => 'MD037', 'hm' => '14,991', 'date' => '29-Jul-26',
                'metode_filter' => 'Check Strainer', 'component' => 'Hydraulic System', 'rating' => 'Poor', 'remarks' => 'Strainer kotor',
            ],
            [
                'no' => 10, 'code_unit' => 'MD048', 'hm' => '7,010.8', 'date' => '26-Aug-26',
                'metode_filter' => 'Magnetic Plug', 'component' => 'Final Drive LH', 'rating' => 'Good', 'remarks' => 'Normal',
            ],
        ];

        $codeUnitFilter = $request->input('codeUnitFilter');
        $metodeFilter = $request->input('metodeFilter');
        $componentFilter = $request->input('componentFilter');
        $ratingFilter = $request->input('ratingFilter');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');

        $filteredData = collect($data)->filter(function ($item) use ($codeUnitFilter, $metodeFilter, $componentFilter, $ratingFilter, $dateFrom, $dateTo) {
            if ($codeUnitFilter && $item['code_unit'] !== $codeUnitFilter) {
                return false;
            }
            if ($metodeFilter && $item['metode_filter'] !== $metodeFilter) {
                return false;
            }
            if ($componentFilter && $item['component'] !== $componentFilter) {
                return false;
            }
            if ($ratingFilter && $item['rating'] !== $ratingFilter) {
                return false;
            }

            if ($dateFrom || $dateTo) {
                try {
                    $date = Carbon::createFromFormat('d-M-y', $item['date']);
                    if ($dateFrom && $date->lt(Carbon::parse($dateFrom))) {
                        return false;
                    }
                    if ($dateTo && $date->gt(Carbon::parse($dateTo))) {
                        return false;
                    }
                } catch (\Exception $e) {
                    // Ignore parsing error for dummy data
                }
            }

            return true;
        })->values()->all();

        return Inertia::render('Repair/MagneticPlug', [
            'data' => $filteredData,
            'filters' => [
                'codeUnitFilter' => $codeUnitFilter,
                'metodeFilter' => $metodeFilter,
                'componentFilter' => $componentFilter,
                'ratingFilter' => $ratingFilter,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
            ],
        ]);
    }
}
