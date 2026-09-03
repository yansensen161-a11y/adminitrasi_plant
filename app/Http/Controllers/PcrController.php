<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PcrController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_uc_component' => 156,
            'good_condition' => 92,
            'good_condition_pct' => '59,0%',
            'need_attention' => 38,
            'need_attention_pct' => '24,4%',
            'need_replacement' => 26,
            'need_replacement_pct' => '16,6%',
            'total_pcr' => 125,
        ];

        // Table Data (PCR U/C Component)
        $data = [
            ['id' => 1, 'unit' => 'EXC-001', 'component' => 'Hydraulic Pump', 'tipe_component' => 'Hydraulic', 'kategori' => 'Hydraulic System', 'serial_number' => 'HP-EXC-001-001', 'lokasi' => 'Pit 1', 'hm_saat_ini' => '12.448', 'hm_install' => '4.000', 'umur_pakai' => '8.000', 'sisa_umur' => '-448', 'kondisi' => 'POOR', 'status' => 'NEED REPLACEMENT', 'keterangan' => 'Bocor pada seal, oil hydraulic kontaminasi'],
            ['id' => 2, 'unit' => 'TRK-015', 'component' => 'Fuel Injection Pump', 'tipe_component' => 'Engine', 'kategori' => 'Fuel System', 'serial_number' => 'FIP-TRK-015-01', 'lokasi' => 'Pit 2', 'hm_saat_ini' => '15.870', 'hm_install' => '9.000', 'umur_pakai' => '10.000', 'sisa_umur' => '-870', 'kondisi' => 'POOR', 'status' => 'NEED REPLACEMENT', 'keterangan' => 'Tenaga mesin turun, asimg'],
            ['id' => 3, 'unit' => 'BDZ-002', 'component' => 'Track Link Assy', 'tipe_component' => 'Undercarriage', 'kategori' => 'Track System', 'serial_number' => 'TL-BDZ-002-02', 'lokasi' => 'Pit 1', 'hm_saat_ini' => '13.950', 'hm_install' => '7.000', 'umur_pakai' => '7.000', 'sisa_umur' => '950', 'kondisi' => 'POOR', 'status' => 'NEED REPLACEMENT', 'keterangan' => 'Aus berlebih'],
            ['id' => 4, 'unit' => 'GRD-007', 'component' => 'Circle Bearing', 'tipe_component' => 'Swing', 'kategori' => 'Swing System', 'serial_number' => 'CB-GRD-007-01', 'lokasi' => 'Mainroad', 'hm_saat_ini' => '10.210', 'hm_install' => '8.000', 'umur_pakai' => '12.000', 'sisa_umur' => '1.790', 'kondisi' => 'GOOD', 'status' => 'GOOD CONDITION', 'keterangan' => '-'],
            ['id' => 5, 'unit' => 'FTR-006', 'component' => 'Water Pump', 'tipe_component' => 'Engine', 'kategori' => 'Cooling System', 'serial_number' => 'WP-FTR-006-01', 'lokasi' => 'Jetty', 'hm_saat_ini' => '6.015', 'hm_install' => '3.000', 'umur_pakai' => '6.000', 'sisa_umur' => '-15', 'kondisi' => 'POOR', 'status' => 'NEED REPLACEMENT', 'keterangan' => 'Kebocoran, bearing aus'],
            ['id' => 6, 'unit' => 'WTR-003', 'component' => 'Final Drive (Left)', 'tipe_component' => 'Drivetrain', 'kategori' => 'Final Drive', 'serial_number' => 'FDL-WTR-003-01', 'lokasi' => 'Pit 3', 'hm_saat_ini' => '6.100', 'hm_install' => '2.000', 'umur_pakai' => '8.000', 'sisa_umur' => '1.900', 'kondisi' => 'GOOD', 'status' => 'GOOD CONDITION', 'keterangan' => '-'],
            ['id' => 7, 'unit' => 'CMP-002', 'component' => 'Air Compressor', 'tipe_component' => 'Pneumatic', 'kategori' => 'Air System', 'serial_number' => 'AC-CMP-002-01', 'lokasi' => 'Pit 2', 'hm_saat_ini' => '2.510', 'hm_install' => '1.000', 'umur_pakai' => '4.000', 'sisa_umur' => '1.490', 'kondisi' => 'GOOD', 'status' => 'GOOD CONDITION', 'keterangan' => '-'],
            ['id' => 8, 'unit' => 'GEN-001', 'component' => 'Alternator', 'tipe_component' => 'Electrical', 'kategori' => 'Charging System', 'serial_number' => 'ALT-GEN-001-01', 'lokasi' => 'Workshop', 'hm_saat_ini' => '3.980', 'hm_install' => '2.500', 'umur_pakai' => '5.000', 'sisa_umur' => '1.020', 'kondisi' => 'FAIR', 'status' => 'NEED ATTENTION', 'keterangan' => 'Tegangan drop saat beban tinggi'],
            ['id' => 9, 'unit' => 'TRK-021', 'component' => 'Brake Chamber', 'tipe_component' => 'Brake', 'kategori' => 'Brake System', 'serial_number' => 'BC-TRK-021-01', 'lokasi' => 'Pit 2', 'hm_saat_ini' => '11.450', 'hm_install' => '7.000', 'umur_pakai' => '10.000', 'sisa_umur' => '-1.450', 'kondisi' => 'POOR', 'status' => 'NEED REPLACEMENT', 'keterangan' => 'Angin bocor'],
            ['id' => 10, 'unit' => 'EXC-003', 'component' => 'Bucket Pin & Bushing', 'tipe_component' => 'Attachment', 'kategori' => 'Working Tool', 'serial_number' => 'BPB-EXC-003-01', 'lokasi' => 'Pit 1', 'hm_saat_ini' => '12.050', 'hm_install' => '6.000', 'umur_pakai' => '6.000', 'sisa_umur' => '50', 'kondisi' => 'FAIR', 'status' => 'NEED ATTENTION', 'keterangan' => 'Keausan mulai terlihat'],
        ];

        // Bottom Categories
        $categories = [
            ['name' => 'Hydraulic System', 'count' => 42, 'pct' => 26.9],
            ['name' => 'Engine System', 'count' => 35, 'pct' => 22.4],
            ['name' => 'Undercarriage', 'count' => 21, 'pct' => 13.5],
            ['name' => 'Drivetrain', 'count' => 18, 'pct' => 11.5],
            ['name' => 'Electrical System', 'count' => 16, 'pct' => 10.3],
            ['name' => 'Lainnya', 'count' => 24, 'pct' => 15.4],
        ];

        return Inertia::render('Pcr/Index', [
            'stats' => $stats,
            'data' => $data,
            'categories' => $categories,
        ]);
    }
}
