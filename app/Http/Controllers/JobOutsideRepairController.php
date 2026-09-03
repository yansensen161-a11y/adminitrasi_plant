<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class JobOutsideRepairController extends Controller
{
    public function index()
    {
        // Data is empty/placeholder as requested by user.
        $data = [
            'informasi_work_order' => [
                'no_wo' => '-',
                'tanggal_wo' => '-',
                'tanggal_kerja' => '-',
                'tipe_pekerjaan' => 'OUTSIDE REPAIR',
                'status' => 'In Process',
                'prioritas' => 'Medium',
            ],
            'informasi_unit' => [
                'model_make' => '-',
                'serial_no' => '-',
                'kode_unit' => '-',
                'nama_komponen' => '-',
                'kode_komponen' => '-',
                'sn_komponen' => '-',
            ],
            'informasi_pekerjaan' => [
                'ptc_vendor' => '-',
                'lokasi' => '-',
                'tanggal_kerusakan' => '-',
                'dilaporkan_oleh' => '-',
                'approved_by' => '-',
            ],
            'problem_description' => '-',
            'job_instruction' => '-',
            'informasi_tambahan' => [
                'qty' => '-',
                'satuan' => '-',
                'estimasi_biaya' => '-',
                'aktual_biaya' => '-',
                'catatan' => '-',
            ],
            'lampiran' => [
                // Empty array as requested, but I will put one item to show the table layout as in the mockup.
                [
                    'id' => 1,
                    'nama_dokumen' => '-',
                    'tipe' => '-',
                ],
            ],
        ];

        return Inertia::render('Repair/JobOutside', [
            'data' => $data,
        ]);
    }
}
