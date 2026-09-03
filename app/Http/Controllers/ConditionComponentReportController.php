<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ConditionComponentReportController extends Controller
{
    public function index()
    {
        // As requested by user, the data is left mostly empty/placeholder.
        $data = [
            'informasi_laporan' => [
                'report_by' => '-',
                'section' => '-',
                'jabatan' => '-',
                'telp' => '-',
                'cc' => '-',
                'tanggal_laporan' => '-',
                'dilaporkan_oleh' => '-',
                'jabatan_2' => '-',
                'section_2' => '-',
            ],
            'informasi_dokumen' => [
                'ccr_no' => '-',
                'date' => '-',
                'delivery_date_unit' => '-',
            ],
            'informasi_unit' => [
                'model_make' => '-',
                'serial_no' => '-',
                'component' => '-',
                'model_type' => '-',
                'unit_no' => '-',
                'qty' => '-',
            ],
            'meter_information' => [
                'kilometers' => '-',
                'hour_meters' => '-',
            ],
            'informasi_tambahan' => [
                'created_at' => '-',
                'updated_at' => '-',
                'created_by' => '-',
                'status' => 'Draft',
                'lampiran' => '-',
            ],
            'analysis' => [
                'description' => '-',
                'report' => '-',
            ],
        ];

        return Inertia::render('Component/ConditionReport', [
            'data' => $data,
        ]);
    }
}
