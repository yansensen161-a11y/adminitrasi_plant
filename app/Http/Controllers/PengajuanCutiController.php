<?php

namespace App\Http\Controllers;

use App\Models\CutiHistorical;
use App\Models\Manpower;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengajuanCutiController extends Controller
{
    /**
     * Show form for creating leave request.
     */
    public function create(Request $request): Response
    {
        $manpowers = Manpower::orderBy('nama', 'asc')->get();

        // Selected manpower ID or NRP
        $selectedId = $request->query('manpower_id');
        $selectedNrp = $request->query('nrp');

        $selectedManpower = null;
        if ($selectedId) {
            $selectedManpower = $manpowers->firstWhere('id', $selectedId);
        } elseif ($selectedNrp) {
            $selectedManpower = $manpowers->firstWhere('nrp', $selectedNrp);
        }

        if (! $selectedManpower) {
            // Default to YANSEN or first available
            $selectedManpower = $manpowers->firstWhere('nama', 'like', '%YANSEN%') ?: $manpowers->first();
        }

        // Format employee info
        $employee = [
            'id' => $selectedManpower?->id ?? 1,
            'nrp' => $selectedManpower?->nrp ?? 'PLN-001',
            'nama' => $selectedManpower?->nama ?? 'YANSEN',
            'jabatan' => $selectedManpower?->bagian ?? 'JUNIOR PLANNER',
            'departemen' => $selectedManpower?->departemen ?? 'PLANT',
            'golongan' => strtoupper($selectedManpower?->jenis_karyawan ?? 'STAFF'),
            'lokasi' => $selectedManpower?->lokasi ?: 'Site Harindo Wahana (Kubar)',
            'status' => $selectedManpower?->status ?: 'Tetap',
            'tgl_masuk' => $selectedManpower?->doh ?: '01 Maret 2023',
            'hp' => $selectedManpower?->kontak ?: '0812-3456-7890',
            'email' => strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $selectedManpower?->nama ?? 'yansen')).'@plant.com',
            'alamat' => $selectedManpower?->alamat ?: 'Jl. Poros Samarinda - Bontang KM 12, Samarinda, Kalimantan Timur',
        ];

        // Fetch or auto-seed historical periodic leaves for this employee
        $historicals = [];
        if ($selectedManpower) {
            $historicals = CutiHistorical::where('nrp', $selectedManpower->nrp)
                ->orWhere('manpower_id', $selectedManpower->id)
                ->orderBy('id', 'asc')
                ->get();

            if ($historicals->isEmpty()) {
                // Auto seed 4 realistic periodic cycles for this person
                $poh = $selectedManpower->lokasi && ! in_array(strtolower($selectedManpower->lokasi), ['lokal', 'non lokal'])
                    ? $selectedManpower->lokasi
                    : ($selectedManpower->alamat ? explode(',', $selectedManpower->alamat)[count(explode(',', $selectedManpower->alamat)) - 1] : 'Samarinda');
                $poh = trim(str_replace(['Kaltim', 'Kalimantan Timur'], '', $poh)) ?: 'Samarinda';

                $defaults = [
                    [
                        'manpower_id' => $selectedManpower->id,
                        'nrp' => $selectedManpower->nrp,
                        'nama' => $selectedManpower->nama,
                        'periode' => 'Periode I - 2026',
                        'tgl_mulai' => '15 Jan 2026',
                        'tgl_selesai' => '28 Jan 2026',
                        'durasi' => 14,
                        'jenis_cuti' => 'Cuti Periodik (Roster 70:14)',
                        'tujuan' => $poh,
                        'transportasi' => 'Travel & Mobil Dinas',
                        'status' => 'SELESAI',
                        'no_dokumen' => 'CT/HRD/2026/01-'.str_pad($selectedManpower->id, 3, '0', STR_PAD_LEFT),
                        'catatan' => 'Cuti periodik awal tahun, tiket kembali aman.',
                    ],
                    [
                        'manpower_id' => $selectedManpower->id,
                        'nrp' => $selectedManpower->nrp,
                        'nama' => $selectedManpower->nama,
                        'periode' => 'Periode II - 2026',
                        'tgl_mulai' => '08 Apr 2026',
                        'tgl_selesai' => '21 Apr 2026',
                        'durasi' => 14,
                        'jenis_cuti' => 'Cuti Periodik (Roster 70:14)',
                        'tujuan' => $poh,
                        'transportasi' => 'Travel Perusahaan',
                        'status' => 'SELESAI',
                        'no_dokumen' => 'CT/HRD/2026/04-'.str_pad($selectedManpower->id, 3, '0', STR_PAD_LEFT),
                        'catatan' => 'Sesuai jadwal rotasi shift plant.',
                    ],
                    [
                        'manpower_id' => $selectedManpower->id,
                        'nrp' => $selectedManpower->nrp,
                        'nama' => $selectedManpower->nama,
                        'periode' => 'Periode III - 2026',
                        'tgl_mulai' => '01 Jul 2026',
                        'tgl_selesai' => '14 Jul 2026',
                        'durasi' => 14,
                        'jenis_cuti' => 'Cuti Periodik (Roster 70:14)',
                        'tujuan' => $poh,
                        'transportasi' => 'Mobil Dinas / Travel',
                        'status' => 'SELESAI',
                        'no_dokumen' => 'CT/HRD/2026/07-'.str_pad($selectedManpower->id, 3, '0', STR_PAD_LEFT),
                        'catatan' => 'Pelaksanaan cuti tepat waktu.',
                    ],
                    [
                        'manpower_id' => $selectedManpower->id,
                        'nrp' => $selectedManpower->nrp,
                        'nama' => $selectedManpower->nama,
                        'periode' => 'Periode IV - 2026 (Mendatang)',
                        'tgl_mulai' => '23 Sep 2026',
                        'tgl_selesai' => '06 Okt 2026',
                        'durasi' => 14,
                        'jenis_cuti' => 'Cuti Periodik (Roster 70:14)',
                        'tujuan' => $poh,
                        'transportasi' => 'Mobil Dinas',
                        'status' => 'DIAJUKAN',
                        'no_dokumen' => 'CT/HRD/2026/09-'.str_pad($selectedManpower->id, 3, '0', STR_PAD_LEFT),
                        'catatan' => 'Pengajuan cuti periode berjalan dalam proses approval.',
                    ],
                ];

                foreach ($defaults as $item) {
                    CutiHistorical::create($item);
                }

                $historicals = CutiHistorical::where('nrp', $selectedManpower->nrp)
                    ->orWhere('manpower_id', $selectedManpower->id)
                    ->orderBy('id', 'asc')
                    ->get();
            }
        }

        // Summary of Periodic Leaves
        $cutiSummary = [
            'pola_roster' => '70 Hari Kerja : 14 Hari Cuti (70:14)',
            'total_diambil' => $historicals->where('status', 'SELESAI')->sum('durasi').' Hari',
            'sisa_hak_cuti' => '14 Hari',
            'jadwal_berikutnya' => '23 Sep 2026',
            'total_periode' => $historicals->count().' Periode',
        ];

        // Approval Workflow Data
        $approvals = [
            [
                'id' => 1, 'level' => 'Diajukan Oleh', 'nama' => $employee['nama'], 'jabatan' => $employee['jabatan'],
                'status' => 'DIAJUKAN', 'tanggal' => '15 Sep 2026', 'catatan' => 'Pengajuan cuti periodik roster',
            ],
            [
                'id' => 2, 'level' => 'Disetujui Oleh', 'nama' => 'ROMI AKBAR', 'jabatan' => 'Supervisor Plant',
                'status' => 'DISETUJUI', 'tanggal' => '16 Sep 2026', 'catatan' => 'Disetujui, pekerjaan didelegasikan dengan baik',
            ],
            [
                'id' => 3, 'level' => 'Diperiksa Oleh', 'nama' => 'YANSEN', 'jabatan' => 'Maintenance Planner',
                'status' => 'DISETUJUI', 'tanggal' => '16 Sep 2026', 'catatan' => 'Jadwal preventive maintenance telah disesuaikan',
            ],
            [
                'id' => 4, 'level' => 'Diketahui Oleh', 'nama' => 'AMBO MAI', 'jabatan' => 'Superintendent Plant',
                'status' => 'DISETUJUI', 'tanggal' => '17 Sep 2026', 'catatan' => 'Approved',
            ],
            [
                'id' => 5, 'level' => 'Disetujui Oleh', 'nama' => 'HERY SUSANTO', 'jabatan' => 'Project Manager',
                'status' => 'MENUNGGU', 'tanggal' => '-', 'catatan' => 'Menunggu Approval Final',
            ],
        ];

        // Form Defaults (for prefill)
        $formDefaults = [
            'jenis_cuti' => 'Cuti Periodik (Roster)',
            'alasan' => 'Cuti Periodik Sesuai Pola Roster 70:14',
            'tgl_mulai' => '23 September 2026',
            'tgl_selesai' => '06 Oktober 2026',
            'total_hari' => '14 Hari',
            'alamat' => $employee['alamat'],
            'telp' => $employee['hp'],
            'darurat' => 'ROMI AKBAR (0812-8899-0011)',
            'delegasi' => 'Pekerjaan harian didelegasikan sementara kepada rekan shift',
            'butuh_transport' => 'Ya',
            'jenis_transport' => 'Mobil Dinas & Travel',
            'tujuan' => 'Site Harindo Wahana (Kubar) - '.$employee['lokasi'],
            'tgl_berangkat' => '23 September 2026',
            'jam_berangkat' => '08:00',
            'tgl_kembali' => '06 Oktober 2026',
            'jam_kembali' => '17:00',
            'penumpang' => '1 Orang',
            'keterangan_tambahan' => 'Mohon disiapkan kendaraan travel / mobil operasional site',
            'lampiran_nama' => 'Surat_Cuti_Periodik_'.$employee['nrp'].'.pdf',
            'lampiran_size' => '210 KB',
        ];

        return Inertia::render('Cuti/Create', [
            'manpowers' => $manpowers->map(fn ($m) => [
                'id' => $m->id,
                'nrp' => $m->nrp,
                'nama' => $m->nama,
                'bagian' => $m->bagian,
                'departemen' => $m->departemen,
                'jenis_karyawan' => $m->jenis_karyawan,
                'lokasi' => $m->lokasi,
                'status' => $m->status,
                'doh' => $m->doh,
                'kontak' => $m->kontak,
                'alamat' => $m->alamat,
            ]),
            'selectedManpowerId' => $selectedManpower?->id,
            'employee' => $employee,
            'historicals' => $historicals,
            'cutiSummary' => $cutiSummary,
            'approvals' => $approvals,
            'formDefaults' => $formDefaults,
        ]);
    }

    /**
     * Store new historical cuti record.
     */
    public function storeHistorical(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'manpower_id' => 'required|exists:manpowers,id',
            'periode' => 'required|string|max:100',
            'tgl_mulai' => 'required|string|max:50',
            'tgl_selesai' => 'required|string|max:50',
            'durasi' => 'required|integer|min:1',
            'jenis_cuti' => 'required|string|max:100',
            'tujuan' => 'nullable|string|max:150',
            'transportasi' => 'nullable|string|max:150',
            'status' => 'required|string|max:50',
            'catatan' => 'nullable|string|max:255',
        ]);

        $mp = Manpower::findOrFail($validated['manpower_id']);

        CutiHistorical::create([
            'manpower_id' => $mp->id,
            'nrp' => $mp->nrp,
            'nama' => $mp->nama,
            'periode' => $validated['periode'],
            'tgl_mulai' => $validated['tgl_mulai'],
            'tgl_selesai' => $validated['tgl_selesai'],
            'durasi' => $validated['durasi'],
            'jenis_cuti' => $validated['jenis_cuti'],
            'tujuan' => $validated['tujuan'] ?: ($mp->lokasi ?: 'Samarinda'),
            'transportasi' => $validated['transportasi'] ?: 'Travel',
            'status' => $validated['status'],
            'no_dokumen' => 'CT/HRD/'.date('Y').'/'.rand(10, 99).'-'.str_pad($mp->id, 3, '0', STR_PAD_LEFT),
            'catatan' => $validated['catatan'] ?? '',
        ]);

        return redirect()->back()->with('success', 'Riwayat cuti periodik berhasil ditambahkan.');
    }

    /**
     * Delete historical cuti record.
     */
    public function destroyHistorical(CutiHistorical $historical): RedirectResponse
    {
        $historical->delete();

        return redirect()->back()->with('success', 'Riwayat cuti periodik berhasil dihapus.');
    }

    /**
     * Handle submission of leave form.
     */
    public function storePengajuan(Request $request): RedirectResponse
    {
        return redirect()->back()->with('success', 'Form Pengajuan Cuti berhasil disimpan dan diteruskan ke alur persetujuan.');
    }
}
