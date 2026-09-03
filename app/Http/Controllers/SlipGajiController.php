<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;

class SlipGajiController extends Controller
{
    public function index()
    {
        // Employee Info
        $employee = [
            'nomor_induk' => 'MAM82007542',
            'nama_karyawan' => 'YANSEN',
            'jabatan' => 'JUNIOR PLANNER',
            'departemen' => 'PLANT',
            'golongan' => 'STAFF',
            'no_rekening' => '0013545968 (KALITDTA)',
            'kewarganegaraan' => '23112710431',
            'kesehatan' => '0002757687085',
            'day_off' => 'Minggu',
            'status' => 'Non Lokal',
            'periode' => '26 Juni 2026 s/d 25 Juli 2026',
        ];

        // Generate Attendance Data (Dummy based on image)
        $attendance = [];
        $startDate = Carbon::create(2026, 6, 26);
        $endDate = Carbon::create(2026, 7, 25);
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $isSunday = $currentDate->isSunday();
            $dayNameIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][$currentDate->dayOfWeek];
            $monthNameIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][$currentDate->month - 1];

            $formattedDate = $dayNameIndo.', '.sprintf('%02d', $currentDate->day).' '.$monthNameIndo.' '.$currentDate->year;

            if ($isSunday) {
                $attendance[] = [
                    'tanggal' => $formattedDate,
                    'is_sunday' => true,
                    'in1' => '-', 'rest' => '-', 'out' => '-', 'in2' => '-', 'reg' => '-',
                    'ot_15' => '', 'ot_20' => '', 'ot_30' => '', 'ot_40' => '', 'ot_total' => '',
                    'hadir' => '-', 'keterangan' => 'OFF',
                ];
            } else {
                $attendance[] = [
                    'tanggal' => $formattedDate,
                    'is_sunday' => false,
                    'in1' => '06:00', 'rest' => '1.0', 'out' => '18:00', 'in2' => '19:00', 'reg' => '11.00',
                    'ot_15' => '', 'ot_20' => '', 'ot_30' => '', 'ot_40' => '', 'ot_total' => '',
                    'hadir' => '1', 'keterangan' => '',
                ];
            }
            $currentDate->addDay();
        }

        // Summary Data
        $summary = [
            'jumlah_hari_kerja' => 26,
            'lembur_bulan_ini' => '0:00',
            'lembur_total' => '0',
            'adjustment' => '-',
            'total' => '26',
        ];

        // Kode Absensi
        $kodeAbsensi = [
            ['kode' => 'OFF', 'desc' => 'Hari Off / Libur (Minggu & Libur)', 'total' => 4],
            ['kode' => 'T', 'desc' => 'Datang Terlambat', 'total' => 0],
            ['kode' => 'C', 'desc' => 'Cuti', 'total' => 0],
            ['kode' => 'S', 'desc' => 'Cuti Sakit', 'total' => 0],
            ['kode' => 'I', 'desc' => 'Izin', 'total' => 0],
            ['kode' => 'K', 'desc' => 'Surat Keterangan Dokter', 'total' => 0],
            ['kode' => 'SS', 'desc' => 'Sakit tanpa surat dokter', 'total' => 0],
            ['kode' => 'IZ', 'desc' => 'Izin Tanpa Surat / Dayoff', 'total' => 0],
            ['kode' => 'M', 'desc' => 'Mangkir', 'total' => 0],
            ['kode' => 'DR', 'desc' => 'Dirumahkan', 'total' => 0],
        ];

        // Payroll Data
        $payroll = [
            'pendapatan' => [
                'gaji_pokok' => '4.500.000',
                'jabatan' => '1.800.000',
                'insentif' => '-',
                'tunj_operasional' => '-',
                'tunj_hadir' => [
                    'label' => 'TUNJ. HADIR (26 Hari x 42.308)',
                    'value' => '1.100.000',
                ],
                'long_shift' => [
                    'label' => 'LONG SHIFT (0 Jam x 26.923)',
                    'value' => '-',
                ],
                'fas_makan' => [
                    'label' => 'FAS MAKAN (26 Hari x 23.077)',
                    'value' => '600.000',
                ],
            ],
            'total_pendapatan' => '8.000.000',
            'potongan' => [
                'bpjs_kesehatan' => '42.336',
                'bpjs_ketenagakerjaan' => '84.652',
                'presensi' => '350.000',
                'profesional' => '-',
                'lain_lain' => '-',
            ],
            'total_potongan' => '476.988',
            'upah_bersih' => '7.523.012',
            'terbilang' => 'TUJUH JUTA LIMA RATUS DUA PULUH TIGA RIBU DUA BELAS RUPIAH',
        ];

        return Inertia::render('Absensi/SlipGaji', [
            'employee' => $employee,
            'attendance' => $attendance,
            'summary' => $summary,
            'kodeAbsensi' => $kodeAbsensi,
            'payroll' => $payroll,
        ]);
    }
}
