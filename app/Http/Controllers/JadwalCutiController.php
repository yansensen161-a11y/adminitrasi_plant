<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class JadwalCutiController extends Controller
{
    public function index()
    {
        $kpi = [
            'total_karyawan' => 128,
            'cuti_berjalan' => 5,
            'cuti_akan_datang' => 12,
            'cuti_bulan_ini' => 18,
            'rata_sisa_poh' => 113,
        ];

        $data = [
            [
                'id' => 1, 'nrp' => 'PLN-001', 'nama' => 'YANSEN', 'jabatan' => 'Junior Planner', 'departemen' => 'PLANT',
                'poh' => 'Samarinda', 'doh' => '15 Jan 2021', 'roster' => '84 : 14',
                'mulai' => '30 Mar 2025', 'selesai' => '12 Apr 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 1', 'lanjut_tgl' => '(05 Jan 2025 - 18 Jan 2025)',
                'sisa_poh' => 113, 'status' => 'SELESAI',
            ],
            [
                'id' => 2, 'nrp' => 'MEK-001', 'nama' => 'BUDI SANTOSO', 'jabatan' => 'Mekanik I', 'departemen' => 'MAINTENANCE',
                'poh' => 'Balikpapan', 'doh' => '20 Feb 2020', 'roster' => '70 : 14',
                'mulai' => '10 Jun 2025', 'selesai' => '23 Jun 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 2', 'lanjut_tgl' => '(31 Mar 2025 - 13 Apr 2025)',
                'sisa_poh' => 98, 'status' => 'BERJALAN',
            ],
            [
                'id' => 3, 'nrp' => 'ELC-001', 'nama' => 'GILANG RAMADHAN', 'jabatan' => 'Elektrikal II', 'departemen' => 'ELECTRICAL',
                'poh' => 'Bontang', 'doh' => '05 Jul 2019', 'roster' => '56 : 14',
                'mulai' => '07 Jun 2025', 'selesai' => '20 Jun 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 3', 'lanjut_tgl' => '(12 Apr 2025 - 25 Apr 2025)',
                'sisa_poh' => 84, 'status' => 'AKAN DATANG',
            ],
            [
                'id' => 4, 'nrp' => 'TYR-001', 'nama' => 'RUDI HERMAWAN', 'jabatan' => 'Tyreman I', 'departemen' => 'TYRE',
                'poh' => 'Samarinda', 'doh' => '10 Mar 2022', 'roster' => '84 : 14',
                'mulai' => '19 Jul 2025', 'selesai' => '01 Agu 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 3', 'lanjut_tgl' => '(26 Apr 2025 - 09 Mei 2025)',
                'sisa_poh' => 131, 'status' => 'MENUNGGU',
            ],
            [
                'id' => 5, 'nrp' => 'SUP-001', 'nama' => 'FAJAR NUGROHO', 'jabatan' => 'Supervisor Plant', 'departemen' => 'PLANT',
                'poh' => 'Kutai Kartanegara', 'doh' => '18 Aug 2018', 'roster' => '70 : 14',
                'mulai' => '22 Jun 2025', 'selesai' => '05 Jul 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 3', 'lanjut_tgl' => '(22 Jun 2025 - 05 Jul 2025)',
                'sisa_poh' => 75, 'status' => 'AKAN DATANG',
            ],
            [
                'id' => 6, 'nrp' => 'PLN-002', 'nama' => 'ANDI PRATAMA', 'jabatan' => 'Planner', 'departemen' => 'PLANT',
                'poh' => 'Makassar', 'doh' => '25 May 2021', 'roster' => '84 : 14',
                'mulai' => '07 Agt 2025', 'selesai' => '20 Agt 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 4', 'lanjut_tgl' => '(10 Mei 2025 - 23 Mei 2025)',
                'sisa_poh' => 122, 'status' => 'MENUNGGU',
            ],
            [
                'id' => 7, 'nrp' => 'MEK-002', 'nama' => 'EKO SETIAWAN', 'jabatan' => 'Mekanik II', 'departemen' => 'MAINTENANCE',
                'poh' => 'Sangatta', 'doh' => '02 Feb 2020', 'roster' => '56 : 14',
                'mulai' => '02 Agt 2025', 'selesai' => '15 Agt 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 4', 'lanjut_tgl' => '(20 Jun 2025 - 03 Jul 2025)',
                'sisa_poh' => 88, 'status' => 'MENUNGGU',
            ],
            [
                'id' => 8, 'nrp' => 'ELC-002', 'nama' => 'HERI SUSANTO', 'jabatan' => 'Elektrikal II', 'departemen' => 'ELECTRICAL',
                'poh' => 'Samarinda', 'doh' => '08 Sep 2019', 'roster' => '84 : 14',
                'mulai' => '28 Sep 2025', 'selesai' => '11 Okt 2025', 'durasi' => 14,
                'lanjut_periode' => 'Periode 5', 'lanjut_tgl' => '(23 Agt 2025 - 05 Sep 2025)',
                'sisa_poh' => 95, 'status' => 'MENUNGGU',
            ],
        ];

        return Inertia::render('Cuti/Jadwal', [
            'kpi' => $kpi,
            'data' => $data,
        ]);
    }
}
