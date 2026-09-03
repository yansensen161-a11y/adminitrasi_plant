<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PengajuanCutiController extends Controller
{
    public function create()
    {
        // Employee Info Pre-filled
        $employee = [
            'nrp' => 'PLN-001',
            'nama' => 'YANSEN',
            'jabatan' => 'JUNIOR PLANNER',
            'departemen' => 'PLANT',
            'golongan' => 'STAFF',
            'lokasi' => 'Site Harindo Wahana (Kubar)',
            'status' => 'Tetap',
            'tgl_masuk' => '01 Maret 2023',
            'hp' => '0812-3456-7890',
            'email' => 'yansen@plant.com',
        ];

        // Approval Workflow Data
        $approvals = [
            [
                'id' => 1, 'level' => 'Diajukan Oleh', 'nama' => 'YANSEN', 'jabatan' => 'Junior Planner',
                'status' => 'DIAJUKAN', 'tanggal' => '25 Mei 2026', 'catatan' => '-',
            ],
            [
                'id' => 2, 'level' => 'Disetujui Oleh', 'nama' => 'BUDI SANTOSO', 'jabatan' => 'Supervisor Plant',
                'status' => 'DISETUJUI', 'tanggal' => '25 Mei 2026', 'catatan' => 'Disetujui',
            ],
            [
                'id' => 3, 'level' => 'Diperiksa Oleh', 'nama' => 'EKO SETIAWAN', 'jabatan' => 'Planner',
                'status' => 'DISETUJUI', 'tanggal' => '25 Mei 2026', 'catatan' => 'OK',
            ],
            [
                'id' => 4, 'level' => 'Diketahui Oleh', 'nama' => 'CANDRA WIJAYA', 'jabatan' => 'Manager Plant',
                'status' => 'DISETUJUI', 'tanggal' => '26 Mei 2026', 'catatan' => '-',
            ],
            [
                'id' => 5, 'level' => 'Disetujui Oleh', 'nama' => 'HERY SUSANTO', 'jabatan' => 'Project Manager',
                'status' => 'MENUNGGU', 'tanggal' => '-', 'catatan' => 'Menunggu Approval',
            ],
        ];

        // Form Defaults (for mockup view purposes)
        $formDefaults = [
            'jenis_cuti' => 'Cuti Tahunan',
            'alasan' => 'Liburan Keluarga',
            'tgl_mulai' => '10 Juni 2026',
            'tgl_selesai' => '14 Juni 2026',
            'total_hari' => '5 Hari',
            'alamat' => 'Jl. Poros Samarinda - Bontang KM 12, Samarinda, Kalimantan Timur',
            'telp' => '0812-9876-5432',
            'darurat' => 'BUDI SANTOSO (0813-4567-8901)',
            'delegasi' => 'Monitoring daily report & data planning diserahkan ke Budi Santoso',
            'butuh_transport' => 'Ya',
            'jenis_transport' => 'Mobil Dinas',
            'tujuan' => 'Samarinda - Balikpapan - Samarinda',
            'tgl_berangkat' => '10 Juni 2026',
            'jam_berangkat' => '08:00',
            'tgl_kembali' => '14 Juni 2026',
            'jam_kembali' => '17:00',
            'penumpang' => '2 Orang (Saya & Keluarga)',
            'keterangan_tambahan' => 'Mohon disiapkan mobil Avanza / Innova',
            'lampiran_nama' => 'Surat_Keterangan_Cuti.pdf',
            'lampiran_size' => '254 KB',
        ];

        return Inertia::render('Cuti/Create', [
            'employee' => $employee,
            'approvals' => $approvals,
            'formDefaults' => $formDefaults,
        ]);
    }
}
