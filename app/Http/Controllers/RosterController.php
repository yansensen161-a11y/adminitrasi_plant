<?php

namespace App\Http\Controllers;

use App\Models\Manpower;
use App\Models\Roster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RosterController extends Controller
{
    /**
     * Display a listing of roster.
     */
    public function index(Request $request): Response
    {
        $query = Roster::query();

        // Search NRP or Nama
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nrp', 'like', "%{$search}%")
                    ->orWhere('posisi', 'like', "%{$search}%")
                    ->orWhere('departemen', 'like', "%{$search}%");
            });
        }

        // Filter Departemen
        if ($request->filled('departemen') && $request->departemen !== 'Semua') {
            $query->where('departemen', $request->departemen);
        }

        // Filter Periode
        if ($request->filled('periode') && $request->periode !== 'Semua') {
            $query->where('periode', $request->periode);
        }

        $allRosters = $query->orderBy('id', 'asc')->get();

        // Calculate KPI totals dynamically
        $totalKaryawan = $allRosters->count();
        $totalS = $allRosters->sum('total_s');
        $totalM = $allRosters->sum('total_m');
        $totalO = $allRosters->sum('total_o');
        $totalC = $allRosters->sum('total_c');

        // Estimate current shift split
        $shiftSiangCount = 0;
        $shiftMalamCount = 0;
        $offDayCount = 0;
        $cutiCount = 0;

        foreach ($allRosters as $r) {
            $firstShift = ($r->shifts && is_array($r->shifts) && count($r->shifts) > 0) ? $r->shifts[0] : null;
            if ($firstShift === 'S') {
                $shiftSiangCount++;
            } elseif ($firstShift === 'M') {
                $shiftMalamCount++;
            } elseif ($firstShift === 'O') {
                $offDayCount++;
            } elseif ($firstShift === 'C') {
                $cutiCount++;
            }
        }

        $stats = [
            'total_karyawan' => $totalKaryawan,
            'shift_siang' => $shiftSiangCount,
            'shift_siang_pct' => $totalKaryawan > 0 ? round(($shiftSiangCount / $totalKaryawan) * 100, 1).'%' : '0%',
            'shift_malam' => $shiftMalamCount,
            'shift_malam_pct' => $totalKaryawan > 0 ? round(($shiftMalamCount / $totalKaryawan) * 100, 1).'%' : '0%',
            'off_day' => $offDayCount,
            'off_day_pct' => $totalKaryawan > 0 ? round(($offDayCount / $totalKaryawan) * 100, 1).'%' : '0%',
            'cuti' => $cutiCount,
            'cuti_pct' => $totalKaryawan > 0 ? round(($cutiCount / $totalKaryawan) * 100, 1).'%' : '0%',
            'total_s' => $totalS,
            'total_m' => $totalM,
            'total_o' => $totalO,
            'total_c' => $totalC,
        ];

        // Format data items for React UI
        $data = $allRosters->map(function ($r) {
            $shifts = is_array($r->shifts) ? $r->shifts : [];

            return [
                'id' => $r->id,
                'nrp' => $r->nrp ?? '-',
                'nama' => $r->nama,
                'posisi' => $r->posisi ?? 'Staff',
                'departemen' => $r->departemen ?? 'Plant',
                'shifts' => $shifts,
                'total_s' => $r->total_s,
                'total_m' => $r->total_m,
                'total_o' => $r->total_o,
                'total_c' => $r->total_c,
            ];
        });

        // Departemen options
        $departments = Roster::select('departemen')->whereNotNull('departemen')->distinct()->pluck('departemen')->toArray();
        if (empty($departments)) {
            $departments = ['Plant', 'Workshop', 'Tyre', 'Electrical', 'Support'];
        }

        return Inertia::render('Roster/Index', [
            'stats' => $stats,
            'data' => $data,
            'departments' => $departments,
            'filters' => [
                'search' => $request->search ?? '',
                'departemen' => $request->departemen ?? 'Semua',
                'periode' => $request->periode ?? 'September 2026',
            ],
            'totalInManpower' => Manpower::count(),
        ]);
    }

    /**
     * Clear all roster records.
     */
    public function clearAll(): RedirectResponse
    {
        Roster::truncate();

        return redirect()->route('roster.index')->with('success', 'Seluruh data tampilan roster berhasil dihapus/dikosongkan.');
    }

    /**
     * Sync and generate roster from Manpower table (Plant employees).
     */
    public function syncManpower(): RedirectResponse
    {
        $manpowers = Manpower::orderBy('id', 'asc')->get();

        if ($manpowers->isEmpty()) {
            return redirect()->route('roster.index')->with('error', 'Data Manpower masih kosong. Silakan tambahkan data di menu Manpower terlebih dahulu.');
        }

        Roster::truncate();

        $patterns = [
            // Pattern 1: Siang heavy (6S 1O 6S 1O 6S 1O 6S 1O 2S = 30 days)
            ['S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S'],
            // Pattern 2: Siang alternate (5S 1O 5S 1O ... = 30 days)
            ['S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O'],
            // Pattern 3: Malam heavy (6M 1O 6M 1O 6M 1O 6M 1O 2M = 30 days)
            ['M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M'],
            // Pattern 4: Malam alternate (1O 6M 1O 6M ... = 30 days)
            ['O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M'],
        ];

        foreach ($manpowers as $idx => $mp) {
            $pattern = $patterns[$idx % count($patterns)];

            $totalS = count(array_filter($pattern, fn ($s) => $s === 'S'));
            $totalM = count(array_filter($pattern, fn ($s) => $s === 'M'));
            $totalO = count(array_filter($pattern, fn ($s) => $s === 'O'));
            $totalC = count(array_filter($pattern, fn ($s) => $s === 'C'));

            Roster::create([
                'nrp' => $mp->nrp,
                'nama' => $mp->nama,
                'posisi' => $mp->bagian ?: 'Mekanik',
                'departemen' => $mp->departemen ?: 'Plant',
                'periode' => 'September 2026',
                'shifts' => $pattern,
                'total_s' => $totalS,
                'total_m' => $totalM,
                'total_o' => $totalO,
                'total_c' => $totalC,
            ]);
        }

        return redirect()->route('roster.index')->with('success', count($manpowers).' karyawan dari Manpower Plant berhasil dimuat ke Roster.');
    }

    /**
     * Download Excel Template for Roster.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Roster');

        // Headers: NRP, Nama, Jabatan, Departemen, 1..30
        $headers = ['NRP', 'Nama Karyawan', 'Jabatan', 'Departemen'];
        for ($i = 1; $i <= 30; $i++) {
            $headers[] = (string) $i;
        }

        $sheet->fromArray($headers, null, 'A1');

        // Sample rows
        $sampleData = [
            array_merge(['10000001', 'BUDI SANTOSO', 'Mekanik I', 'Plant'], ['S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S']),
            array_merge(['10000002', 'ANDI PRATAMA', 'Mekanik I', 'Workshop'], ['S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O']),
            array_merge(['10000003', 'EKO SETIAWAN', 'Mekanik II', 'Workshop'], ['M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M']),
            array_merge(['10000004', 'GILANG RAMADHAN', 'Electrical I', 'Electrical'], ['O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M']),
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Style header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '00A65A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:AH1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(26);

        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        foreach (['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH'] as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Roster_Plant.xlsx');
    }

    /**
     * Import Roster from Excel.
     */
    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:20480',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (count($rows) <= 1) {
                return redirect()->back()->with('error', 'File Excel kosong atau format tidak sesuai.');
            }

            Roster::truncate();

            $imported = 0;
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $nrp = trim((string) ($row[0] ?? ''));
                $nama = trim((string) ($row[1] ?? ''));

                if (empty($nama) && empty($nrp)) {
                    continue;
                }

                $posisi = ! empty($row[2]) ? trim((string) $row[2]) : 'Staff';
                $departemen = ! empty($row[3]) ? trim((string) $row[3]) : 'Plant';

                $shifts = [];
                for ($d = 4; $d < 34; $d++) {
                    $val = strtoupper(trim((string) ($row[$d] ?? '')));
                    $shifts[] = in_array($val, ['S', 'M', 'O', 'C', 'D']) ? $val : 'S';
                }

                $totalS = count(array_filter($shifts, fn ($s) => $s === 'S'));
                $totalM = count(array_filter($shifts, fn ($s) => $s === 'M'));
                $totalO = count(array_filter($shifts, fn ($s) => $s === 'O'));
                $totalC = count(array_filter($shifts, fn ($s) => $s === 'C'));

                Roster::create([
                    'nrp' => $nrp ?: 'EMP-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'nama' => strtoupper($nama),
                    'posisi' => $posisi,
                    'departemen' => $departemen,
                    'periode' => 'September 2026',
                    'shifts' => $shifts,
                    'total_s' => $totalS,
                    'total_m' => $totalM,
                    'total_o' => $totalO,
                    'total_c' => $totalC,
                ]);

                $imported++;
            }

            return redirect()->route('roster.index')->with('success', "Berhasil mengimpor {$imported} data roster karyawan.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimpor file: '.$e->getMessage());
        }
    }

    /**
     * Export Roster to Excel.
     */
    public function exportExcel(): StreamedResponse
    {
        $rosters = Roster::orderBy('id', 'asc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Roster Karyawan');

        $headers = ['No', 'NRP', 'Nama Karyawan', 'Jabatan', 'Departemen'];
        for ($i = 1; $i <= 30; $i++) {
            $headers[] = (string) $i;
        }
        $headers[] = 'S';
        $headers[] = 'M';
        $headers[] = 'O';

        $sheet->fromArray($headers, null, 'A1');

        $rows = [];
        foreach ($rosters as $idx => $r) {
            $row = [
                $idx + 1,
                $r->nrp,
                $r->nama,
                $r->posisi,
                $r->departemen,
            ];
            $shifts = is_array($r->shifts) ? $r->shifts : [];
            for ($d = 0; $d < 30; $d++) {
                $row[] = $shifts[$d] ?? '-';
            }
            $row[] = $r->total_s;
            $row[] = $r->total_m;
            $row[] = $r->total_o;

            $rows[] = $row;
        }

        if (! empty($rows)) {
            $sheet->fromArray($rows, null, 'A2');
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F2937']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:AL1')->applyFromArray($headerStyle);

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Roster_Karyawan_'.date('Y-m-d').'.xlsx');
    }
}
