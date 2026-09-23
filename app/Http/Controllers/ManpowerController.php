<?php

namespace App\Http\Controllers;

use App\Models\Manpower;
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

class ManpowerController extends Controller
{
    /** Initial default manpower data */
    public const DEFAULT_MANPOWERS = [
        ['nama' => 'YANSEN', 'bagian' => 'PLANNER', 'departemen' => 'Plant', 'jenis_karyawan' => 'Staff', 'nrp' => 'PLN-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2023-03-01', 'kontak' => '0812-3456-7890', 'ktp' => '64710101010001', 'bpjs_kes' => '0002757687085', 'bpjs_ket' => '19012345678', 'rekening' => '7888010123456789', 'alamat' => 'Jl. Poros Samarinda - Bontang KM 12, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'BUDI SANTOSO', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2021-02-15', 'kontak' => '0813-4567-8901', 'ktp' => '6471011502010002', 'bpjs_kes' => '0002757687086', 'bpjs_ket' => '19012345679', 'rekening' => '7888010123456790', 'alamat' => 'Jl. Mulawarman No.45, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'ANDI PRATAMA', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2021-07-10', 'kontak' => '0813-5678-9012', 'ktp' => '6471011007210003', 'bpjs_kes' => '0002757687087', 'bpjs_ket' => '19012345680', 'rekening' => '7888010123456791', 'alamat' => 'Jl. Aw Syahranie No.12, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'CANDRA WIJAYA', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-003', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2021-08-05', 'kontak' => '0813-6789-0123', 'ktp' => '6471010508210004', 'bpjs_kes' => '0002757687088', 'bpjs_ket' => '19012345681', 'rekening' => '7888010123456792', 'alamat' => 'Jl. DI Panjaitan No.8, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'DEDI KURNIAWAN', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-004', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2021-09-12', 'kontak' => '0813-7890-1234', 'ktp' => '6471011209210005', 'bpjs_kes' => '0002757687089', 'bpjs_ket' => '19012345682', 'rekening' => '7888010123456793', 'alamat' => 'Jl. MT Haryono No.77, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'EKO SETIAWAN', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-005', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2021-10-20', 'kontak' => '0813-8901-2345', 'ktp' => '6471012010210006', 'bpjs_kes' => '0002757687090', 'bpjs_ket' => '19012345683', 'rekening' => '7888010123456794', 'alamat' => 'Jl. KH Wahid Hasyim No.23, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'GILANG RAMADHAN', 'bagian' => 'ELEKTRIKAL', 'departemen' => 'Electrical', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'ELC-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2022-01-02', 'kontak' => '0812-9012-3456', 'ktp' => '6471010201220007', 'bpjs_kes' => '0002757687091', 'bpjs_ket' => '19012345684', 'rekening' => '7888010123456795', 'alamat' => 'Jl. Imam Bonjol No.15, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'HERI SUSANTO', 'bagian' => 'ELEKTRIKAL', 'departemen' => 'Electrical', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'ELC-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2022-03-18', 'kontak' => '0812-0123-4567', 'ktp' => '6471011803220008', 'bpjs_kes' => '0002757687092', 'bpjs_ket' => '19012345685', 'rekening' => '7888010123456796', 'alamat' => 'Jl. Pangeran Suryanata No.21, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'RUDI HERMAWAN', 'bagian' => 'TYRE', 'departemen' => 'Tyre', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'TYR-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2022-04-25', 'kontak' => '0812-1234-5678', 'ktp' => '6471012504220009', 'bpjs_kes' => '0002757687093', 'bpjs_ket' => '19012345686', 'rekening' => '7888010123456797', 'alamat' => 'Jl. Sepinggan Baru No.5, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'FAJAR NUGROHO', 'bagian' => 'SUPPORT', 'departemen' => 'Support', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'HLR-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '2022-05-15', 'kontak' => '0812-2345-6789', 'ktp' => '647101150522010', 'bpjs_kes' => '0002757687094', 'bpjs_ket' => '19012345687', 'rekening' => '7888010123456798', 'alamat' => 'Jl. Gerilya No.19, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'SITI AISYAH', 'bagian' => 'ADMIN PLANT', 'departemen' => 'Plant', 'jenis_karyawan' => 'Staff', 'nrp' => 'ADM-001', 'jenis_kelamin' => 'P', 'lokasi' => 'Lokal', 'doh' => '2022-06-01', 'kontak' => '0812-3456-7891', 'ktp' => '6471010106220011', 'bpjs_kes' => '0002757687095', 'bpjs_ket' => '19012345688', 'rekening' => '7888010123456799', 'alamat' => 'Jl. Siradj Salman No.2, Samarinda, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'MUHAMMAD IQBAL', 'bagian' => 'MEKANIK', 'departemen' => 'Workshop', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'MEK-006', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '2022-06-10', 'kontak' => '0821-3456-7890', 'ktp' => '6471021006220012', 'bpjs_kes' => '0002037687096', 'bpjs_ket' => '19012345689', 'rekening' => '7888010123456800', 'alamat' => 'Jl. Trans Kalimantan KM 8, Kutai Kartanegara, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'SUPRIYANTO', 'bagian' => 'ELEKTRIKAL', 'departemen' => 'Electrical', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'ELC-003', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '2022-07-22', 'kontak' => '0821-4567-8901', 'ktp' => '6471022207220013', 'bpjs_kes' => '0002027687097', 'bpjs_ket' => '19012345690', 'rekening' => '7888010123456801', 'alamat' => 'Jl. Poros Bontang - Sangatta KM 15, Kutai Timur, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'NURHALIM', 'bagian' => 'TYRE', 'departemen' => 'Tyre', 'jenis_karyawan' => 'Non Staff', 'nrp' => 'TYR-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '2022-09-05', 'kontak' => '0821-5678-9012', 'ktp' => '6471020509220014', 'bpjs_kes' => '0002027687098', 'bpjs_ket' => '19012345691', 'rekening' => '7888010123456802', 'alamat' => 'Jl. Poros Melak - Long Iram, Kubar, Kaltim', 'status' => 'Aktif'],
        ['nama' => 'AGUS SETIAWAN', 'bagian' => 'SUPPORT', 'departemen' => 'Support', 'jenis_karyawan' => 'Kontrak', 'nrp' => 'SUP-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '2022-10-17', 'kontak' => '0821-6789-0123', 'ktp' => '6471021710220015', 'bpjs_kes' => '0002027687099', 'bpjs_ket' => '19012345692', 'rekening' => '7888010123456803', 'alamat' => 'Jl. Poros Sendawar KM 6, Kutai Barat, Kaltim', 'status' => 'Aktif'],
    ];

    /**
     * Display a listing of manpower.
     */
    public function index(Request $request): Response
    {
        $query = Manpower::query();

        // Search
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nrp', 'like', "%{$search}%")
                    ->orWhere('bagian', 'like', "%{$search}%")
                    ->orWhere('departemen', 'like', "%{$search}%")
                    ->orWhere('kontak', 'like', "%{$search}%")
                    ->orWhere('ktp', 'like', "%{$search}%");
            });
        }

        // Filter Departemen
        if ($request->filled('departemen') && $request->departemen !== 'Semua') {
            $query->where('departemen', $request->departemen);
        }

        // Filter Jenis Karyawan
        if ($request->filled('jenis_karyawan') && $request->jenis_karyawan !== 'Semua') {
            $query->where('jenis_karyawan', $request->jenis_karyawan);
        }

        // Filter Status
        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $allManpowers = $query->orderBy('id', 'asc')->get();

        // Total Counts & KPI
        $totalCount = Manpower::count();
        $staffCount = Manpower::where('jenis_karyawan', 'Staff')->count();
        $nonStaffCount = Manpower::where('jenis_karyawan', 'Non Staff')->count();
        $kontrakCount = Manpower::whereIn('jenis_karyawan', ['Kontrak', 'Outsource'])->count();

        // Rekap Departemen
        $departments = ['Plant', 'Workshop', 'Tyre', 'Electrical', 'Support', 'Others'];
        $distData = [];
        foreach ($departments as $dept) {
            $distData[$dept] = Manpower::where('departemen', 'like', "%{$dept}%")->count();
        }

        return Inertia::render('Manpower/Index', [
            'manpowers' => $allManpowers,
            'summary' => [
                'total' => $totalCount,
                'staff' => $staffCount,
                'staff_pct' => $totalCount > 0 ? round(($staffCount / $totalCount) * 100, 1) : 0,
                'non_staff' => $nonStaffCount,
                'non_staff_pct' => $totalCount > 0 ? round(($nonStaffCount / $totalCount) * 100, 1) : 0,
                'kontrak' => $kontrakCount,
                'kontrak_pct' => $totalCount > 0 ? round(($kontrakCount / $totalCount) * 100, 1) : 0,
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'departemen' => $request->departemen ?? '',
                'jenis_karyawan' => $request->jenis_karyawan ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    /**
     * Download Excel template for importing Manpower.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Manpower');

        // Headers
        $headers = [
            'NRP',
            'Nama Lengkap',
            'Departemen',
            'Job Position (Bagian)',
            'Jenis Karyawan',
            'Jenis Kelamin',
            'Lokasi',
            'Tanggal Masuk (YYYY-MM-DD)',
            'No Kontak / HP',
            'No KTP',
            'No BPJS Kesehatan',
            'No BPJS Ketenagakerjaan',
            'No Rekening',
            'Alamat Lengkap',
            'Status',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Sample data rows
        $sampleData = [
            [
                'PLN-001',
                'YANSEN',
                'Plant',
                'PLANNER',
                'Staff',
                'L',
                'Lokal',
                '2023-03-01',
                '0812-3456-7890',
                '64710101010001',
                '0002757687085',
                '19012345678',
                '7888010123456789',
                'Jl. Poros Samarinda - Bontang KM 12, Samarinda',
                'Aktif',
            ],
            [
                'MEK-001',
                'BUDI SANTOSO',
                'Workshop',
                'MEKANIK',
                'Non Staff',
                'L',
                'Lokal',
                '2021-02-15',
                '0813-4567-8901',
                '6471011502010002',
                '0002757687086',
                '19012345679',
                '7888010123456790',
                'Jl. Mulawarman No.45, Samarinda',
                'Aktif',
            ],
            [
                'ELC-001',
                'GILANG RAMADHAN',
                'Electrical',
                'ELEKTRIKAL',
                'Non Staff',
                'L',
                'Lokal',
                '2022-01-02',
                '0812-9012-3456',
                '6471010201220007',
                '0002757687091',
                '19012345684',
                '7888010123456795',
                'Jl. Imam Bonjol No.15, Samarinda',
                'Aktif',
            ],
            [
                'TYR-001',
                'RUDI HERMAWAN',
                'Tyre',
                'TYRE',
                'Non Staff',
                'L',
                'Lokal',
                '2022-04-25',
                '0812-1234-5678',
                '6471012504220009',
                '0002757687093',
                '19012345686',
                '7888010123456797',
                'Jl. Sepinggan Baru No.5, Balikpapan',
                'Aktif',
            ],
            [
                'ADM-001',
                'SITI AISYAH',
                'Plant',
                'ADMIN PLANT',
                'Staff',
                'P',
                'Lokal',
                '2022-06-01',
                '0812-3456-7891',
                '6471010106220011',
                '0002757687095',
                '19012345688',
                '7888010123456799',
                'Jl. Siradj Salman No.2, Samarinda',
                'Aktif',
            ],
            [
                'SUP-001',
                'AGUS SETIAWAN',
                'Support',
                'SUPPORT',
                'Kontrak',
                'L',
                'Non Lokal',
                '2022-10-17',
                '0821-6789-0123',
                '6471021710220015',
                '0002027687099',
                '19012345692',
                '7888010123456803',
                'Jl. Poros Sendawar KM 6, Kubar',
                'Aktif',
            ],
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Styling header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '00A65A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:O1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // Auto size columns
        foreach (range('A', 'O') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Manpower_Plant.xlsx');
    }

    /**
     * Import Manpower from Excel file.
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

            $imported = 0;
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $nrp = trim((string) ($row[0] ?? ''));
                $nama = trim((string) ($row[1] ?? ''));

                if (empty($nama) && empty($nrp)) {
                    continue;
                }

                $departemen = ! empty($row[2]) ? trim((string) $row[2]) : 'Plant';
                $bagian = ! empty($row[3]) ? trim((string) $row[3]) : 'Mekanik';
                $jenisKaryawan = ! empty($row[4]) ? trim((string) $row[4]) : 'Non Staff';
                $jenisKelamin = ! empty($row[5]) ? strtoupper(trim((string) $row[5])) : 'L';
                $lokasi = ! empty($row[6]) ? trim((string) $row[6]) : 'Lokal';
                $doh = ! empty($row[7]) ? trim((string) $row[7]) : date('Y-m-d');
                $kontak = ! empty($row[8]) ? trim((string) $row[8]) : null;
                $ktp = ! empty($row[9]) ? trim((string) $row[9]) : null;
                $bpjsKes = ! empty($row[10]) ? trim((string) $row[10]) : null;
                $bpjsKet = ! empty($row[11]) ? trim((string) $row[11]) : null;
                $rekening = ! empty($row[12]) ? trim((string) $row[12]) : null;
                $alamat = ! empty($row[13]) ? trim((string) $row[13]) : null;
                $status = ! empty($row[14]) ? trim((string) $row[14]) : 'Aktif';

                $payload = [
                    'nrp' => $nrp ?: 'EMP-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'nama' => strtoupper($nama),
                    'departemen' => $departemen,
                    'bagian' => strtoupper($bagian),
                    'jenis_karyawan' => $jenisKaryawan,
                    'jenis_kelamin' => $jenisKelamin === 'P' ? 'P' : 'L',
                    'lokasi' => $lokasi,
                    'doh' => $doh,
                    'kontak' => $kontak,
                    'ktp' => $ktp,
                    'bpjs_kes' => $bpjsKes,
                    'bpjs_ket' => $bpjsKet,
                    'rekening' => $rekening,
                    'alamat' => $alamat,
                    'status' => $status,
                ];

                if (! empty($nrp)) {
                    Manpower::updateOrCreate(['nrp' => $nrp], $payload);
                } else {
                    Manpower::updateOrCreate(['nama' => strtoupper($nama)], $payload);
                }

                $imported++;
            }

            return redirect()->back()->with('success', "Berhasil mengimpor {$imported} data manpower.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }

    /**
     * Export all Manpower records to Excel.
     */
    public function exportExcel(): StreamedResponse
    {
        $manpowers = Manpower::orderBy('id', 'asc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Manpower Plant');

        $headers = [
            'No',
            'NRP',
            'Nama Lengkap',
            'Departemen',
            'Job Position',
            'Jenis Karyawan',
            'L/P',
            'Lokasi',
            'Tanggal Masuk',
            'Kontak',
            'No KTP',
            'BPJS Kesehatan',
            'BPJS Ketenagakerjaan',
            'No Rekening',
            'Alamat',
            'Status',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '00A65A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:P1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(26);

        $rowNum = 2;
        foreach ($manpowers as $idx => $m) {
            $sheet->fromArray([
                $idx + 1,
                $m->nrp,
                $m->nama,
                $m->departemen,
                $m->bagian,
                $m->jenis_karyawan,
                $m->jenis_kelamin,
                $m->lokasi,
                $m->doh,
                $m->kontak,
                $m->ktp,
                $m->bpjs_kes,
                $m->bpjs_ket,
                $m->rekening,
                $m->alamat,
                $m->status,
            ], null, "A{$rowNum}");

            $rowNum++;
        }

        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Data_Manpower_Plant_'.date('Ymd_His').'.xlsx');
    }

    /**
     * Clear all manpower records from database.
     */
    public function clearAll(): RedirectResponse
    {
        Manpower::truncate();

        return redirect()->route('manpower.index')->with('success', 'Semua data Manpower berhasil dihapus. Silakan unggah file Excel baru.');
    }
}
