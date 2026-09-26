<?php

namespace App\Http\Controllers;

use App\Models\MagneticPlug;
use App\Models\Unit;
use App\Services\ImageCompressionService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MagneticPlugController extends Controller
{
    public function index(Request $request): Response
    {
        $codeUnitFilter = $request->input('codeUnitFilter');
        $metodeFilter = $request->input('metodeFilter');
        $componentFilter = $request->input('componentFilter');
        $ratingFilter = $request->input('ratingFilter');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');

        $query = MagneticPlug::with('unit')->orderBy('date', 'desc');

        if ($codeUnitFilter) {
            $query->whereHas('unit', function ($q) use ($codeUnitFilter) {
                $q->where('code_unit', $codeUnitFilter);
            });
        }
        if ($metodeFilter) {
            $query->where('metode_filter', $metodeFilter);
        }
        if ($componentFilter) {
            $query->where('component', $componentFilter);
        }
        if ($ratingFilter) {
            $query->where('rating', $ratingFilter);
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $data = $query->paginate(15)->withQueryString();

        // Calculate KPI stats
        $totalInspeksi = MagneticPlug::count();
        $ratingACount = MagneticPlug::whereIn('rating', ['Rating A', 'A'])->count();
        $ratingBCount = MagneticPlug::whereIn('rating', ['Rating B', 'B'])->count();
        $ratingCCount = MagneticPlug::whereIn('rating', ['Rating C', 'C'])->count();
        $ratingXCount = MagneticPlug::whereIn('rating', ['Rating X', 'X'])->count();

        // Distinct units for filter dropdown
        $units = Unit::orderBy('code_unit', 'asc')->pluck('code_unit')->unique()->values();

        return Inertia::render('Repair/MagneticPlug', [
            'data' => $data,
            'units' => $units,
            'filters' => [
                'codeUnitFilter' => $codeUnitFilter,
                'metodeFilter' => $metodeFilter,
                'componentFilter' => $componentFilter,
                'ratingFilter' => $ratingFilter,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
            ],
            'kpi' => [
                'totalInspeksi' => $totalInspeksi,
                'ratingACount' => $ratingACount,
                'ratingBCount' => $ratingBCount,
                'ratingCCount' => $ratingCCount,
                'ratingXCount' => $ratingXCount,
            ],
        ]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('Repair/CreateMagneticPlug', [
            'units' => $units,
        ]);
    }

    public function store(Request $request, ImageCompressionService $imageService): RedirectResponse
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'hm' => 'required|numeric',
            'date' => 'required|date',
            'metode_filter' => 'required|string',
            'component' => 'required|string',
            'rating' => 'required|string',
            'remarks' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:15360',
            'return_to' => 'nullable|string',
        ]);

        $returnTo = $request->input('return_to');
        unset($validated['return_to']);

        // Normalize rating name if needed
        $validated['rating'] = $this->normalizeRating($validated['rating']);

        // Compress and store photo if uploaded
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $imageService->compressAndStore(
                $request->file('photo'),
                'magnetic_plugs',
                1400,
                75,
                'webp'
            ) ?: $request->file('photo')->store('magnetic_plugs', 'public');
        }

        MagneticPlug::create($validated);

        if ($returnTo) {
            return redirect($returnTo)->with('success', 'Data Magnetic Plug berhasil ditambahkan untuk Work Order.');
        }

        return redirect()->route('repair.magnetic-plug')->with('success', 'Data Magnetic Plug berhasil ditambahkan.');
    }

    /**
     * Download Excel template matching exact client visual specification.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Magnetic Plug Log');

        // Headers matching image
        $headers = ['Code Unit', 'HM', 'Date', 'Metode', 'Component', 'Picture', 'RATING', 'Remarks'];
        $sheet->fromArray([$headers], null, 'A1');

        // Styling Header (Light Green #C6E0B4 like screenshot)
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '1E293B'],
                'size' => 11,
                'name' => 'Calibri',
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'C6E0B4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '7F7F7F'],
                ],
            ],
        ];
        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // AutoFilter dropdown arrows on headers
        $sheet->setAutoFilter('A1:H1');

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(16);
        $sheet->getColumnDimension('B')->setWidth(13);
        $sheet->getColumnDimension('C')->setWidth(16);
        $sheet->getColumnDimension('D')->setWidth(24);
        $sheet->getColumnDimension('E')->setWidth(28);
        $sheet->getColumnDimension('F')->setWidth(38);
        $sheet->getColumnDimension('G')->setWidth(16);
        $sheet->getColumnDimension('H')->setWidth(32);

        // Sample Rows — Row 2 matches the user's screenshot exactly
        $sampleRows = [
            ['OHT120', 4995, '30-Mar-26', 'MAGNETIC PLUG', 'FRONT WHEEL RH', '[Tempel / Sisipkan Foto di sel ini]', 'A', ''],
            ['HD785-12', 6200, '28-Mar-26', 'MAGNETIC PLUG', 'DIFFERENTIAL', '[Tempel / Sisipkan Foto di sel ini]', 'B', 'Serpihan halus normal'],
            ['EX-056', 8140, '25-Mar-26', 'CUTTING FILTER', 'HYDRAULIC PUMP', '[Tempel / Sisipkan Foto di sel ini]', 'C', 'Partikel besi ukuran sedang'],
            ['D85-01', 5420, '20-Mar-26', 'MAGNETIC PLUG', 'TRANSMISSION', '[Tempel / Sisipkan Foto di sel ini]', 'X', 'Kontaminasi berat butuh overhaul'],
        ];
        $sheet->fromArray($sampleRows, null, 'A2');

        // Row Heights
        $sheet->getRowDimension(2)->setRowHeight(95); // Tall row for Picture preview
        $sheet->getRowDimension(3)->setRowHeight(40);
        $sheet->getRowDimension(4)->setRowHeight(40);
        $sheet->getRowDimension(5)->setRowHeight(40);

        // Style data cells
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'font' => ['size' => 11, 'name' => 'Calibri'],
        ];
        $sheet->getStyle('A2:H5')->applyFromArray($dataStyle);

        // Left align Component and Remarks
        $sheet->getStyle('E2:E5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle('H2:H5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        // Picture column helper text style
        $sheet->getStyle('F2:F5')->getFont()->setItalic(true)->getColor()->setRGB('6B7280');

        // Rating A (Green background like screenshot)
        $sheet->getStyle('G2')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '92D050']],
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
        ]);

        // Rating B (Yellow background)
        $sheet->getStyle('G3')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFE699']],
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
        ]);

        // Rating C (Red/Orange background)
        $sheet->getStyle('G4')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8CBAD']],
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
        ]);

        // Rating X (Dark gray background)
        $sheet->getStyle('G5')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1D5DB']],
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
        ]);

        // Dropdown Data Validations
        for ($r = 2; $r <= 200; $r++) {
            $validationD = $sheet->getCell("D{$r}")->getDataValidation();
            $validationD->setType(DataValidation::TYPE_LIST);
            $validationD->setErrorStyle(DataValidation::STYLE_INFORMATION);
            $validationD->setAllowBlank(false);
            $validationD->setShowDropDown(true);
            $validationD->setFormula1('"MAGNETIC PLUG,CUTTING FILTER,CHECK CYLINDER,CHECK STRAINER"');

            $validationG = $sheet->getCell("G{$r}")->getDataValidation();
            $validationG->setType(DataValidation::TYPE_LIST);
            $validationG->setErrorStyle(DataValidation::STYLE_INFORMATION);
            $validationG->setAllowBlank(false);
            $validationG->setShowDropDown(true);
            $validationG->setFormula1('"A,B,C,X"');
        }

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template_magnetic_plug.xlsx"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Import Excel data to server with automatic image extraction and compression.
     */
    public function import(Request $request, ImageCompressionService $imageService): RedirectResponse
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor data.');

        // Prevent memory exhaustion on large files with embedded high-res photos
        @ini_set('memory_limit', '1024M');
        @set_time_limit(300);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:40960',
            'photos.*' => 'nullable|image|max:15360',
        ]);

        try {
            $file = $request->file('file');
            $filePath = $file->getRealPath();

            // Sanitize XLSX to remove bloated hyperlinks or unbounded ranges that cause PhpSpreadsheet memory crash
            $this->sanitizeXlsxZip($filePath);

            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();

            // Extract all embedded drawings (images pasted directly into Excel cells)
            $drawingsByRow = [];
            foreach ($sheet->getDrawingCollection() as $drawing) {
                $coord = $drawing->getCoordinates();
                if (preg_match('/^([A-Z]+)(\d+)$/', $coord, $matches)) {
                    $col = $matches[1];
                    $rowNum = (int) $matches[2];

                    // Picture is in column F
                    if ($col === 'F') {
                        if ($drawing instanceof Drawing) {
                            $tempPath = $drawing->getPath();
                            if ($tempPath && file_exists($tempPath)) {
                                $compressedPath = $imageService->compressAndStore(
                                    $tempPath,
                                    'magnetic_plugs',
                                    1400,
                                    75,
                                    'webp'
                                );
                                if ($compressedPath) {
                                    $drawingsByRow[$rowNum] = $compressedPath;
                                }
                            }
                        } elseif ($drawing instanceof MemoryDrawing) {
                            $gdResource = $drawing->getImageResource();
                            if ($gdResource) {
                                $compressedPath = $imageService->compressGdResource(
                                    $gdResource,
                                    'magnetic_plugs',
                                    1400,
                                    75,
                                    'webp'
                                );
                                if ($compressedPath) {
                                    $drawingsByRow[$rowNum] = $compressedPath;
                                }
                            }
                        }
                    }
                }
            }

            // Check if loose photos were uploaded via form
            $uploadedPhotos = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $idx => $photoFile) {
                    $compressed = $imageService->compressAndStore($photoFile, 'magnetic_plugs', 1400, 75, 'webp');
                    if ($compressed) {
                        $originalName = pathinfo($photoFile->getClientOriginalName(), PATHINFO_FILENAME);
                        $uploadedPhotos[strtolower(trim($originalName))] = $compressed;
                        $uploadedPhotos['idx_'.$idx] = $compressed;
                    }
                }
            }

            $highestRow = $sheet->getHighestRow();
            $importedCount = 0;
            $photoCount = 0;
            $skippedUnits = [];
            $emptyConsecutive = 0;

            for ($row = 2; $row <= $highestRow; $row++) {
                try {
                    $codeUnitVal = $sheet->getCell("A{$row}")->getCalculatedValue();
                } catch (\Throwable) {
                    $codeUnitVal = $sheet->getCell("A{$row}")->getValue();
                }

                $codeUnit = trim((string) $codeUnitVal);
                if (empty($codeUnit) || str_starts_with($codeUnit, '=')) {
                    $emptyConsecutive++;
                    if ($emptyConsecutive > 50) {
                        break;
                    }

                    continue;
                }
                $emptyConsecutive = 0;

                $hmRaw = $sheet->getCell("B{$row}")->getValue();
                $dateRaw = $sheet->getCell("C{$row}")->getValue();
                $metodeRaw = trim((string) $sheet->getCell("D{$row}")->getValue());
                $component = trim((string) $sheet->getCell("E{$row}")->getValue());
                $pictureCellText = trim((string) $sheet->getCell("F{$row}")->getValue());
                $ratingRaw = trim((string) $sheet->getCell("G{$row}")->getValue());
                $remarks = trim((string) $sheet->getCell("H{$row}")->getValue());

                // Find existing Unit from master population
                $unit = Unit::whereRaw('LOWER(TRIM(code_unit)) = ?', [strtolower($codeUnit)])->first();
                if (! $unit) {
                    $skippedUnits[] = $codeUnit;

                    continue;
                }

                // Parse HM
                $hm = is_numeric($hmRaw) ? (float) $hmRaw : 0.0;

                // Parse Date
                $date = $this->parseDateValue($dateRaw);

                // Parse Metode
                $metode = $this->normalizeMetode($metodeRaw);

                // Parse Rating
                $rating = $this->normalizeRating($ratingRaw);

                // Resolve photo path: 1. From embedded drawing, 2. From uploaded loose files
                $photoPath = $drawingsByRow[$row] ?? null;

                if (! $photoPath && ! empty($uploadedPhotos)) {
                    // Try match by unit code e.g. "OHT120"
                    $key = strtolower($codeUnit);
                    if (isset($uploadedPhotos[$key])) {
                        $photoPath = $uploadedPhotos[$key];
                    } elseif (isset($uploadedPhotos['idx_'.($importedCount)])) {
                        $photoPath = $uploadedPhotos['idx_'.($importedCount)];
                    }
                }

                if ($photoPath) {
                    $photoCount++;
                }

                MagneticPlug::create([
                    'unit_id' => $unit->id,
                    'hm' => $hm,
                    'date' => $date,
                    'metode_filter' => $metode,
                    'component' => $component ?: 'GENERAL',
                    'rating' => $rating,
                    'remarks' => $remarks ?: null,
                    'photo_path' => $photoPath,
                ]);

                $importedCount++;
            }

            if ($importedCount === 0) {
                $errDetail = ! empty($skippedUnits)
                    ? ' Unit dalam file tidak ditemukan di database unit populasi ('.count(array_unique($skippedUnits)).' unit tidak terdaftar).'
                    : '';

                return redirect()->back()->with('error', 'Tidak ada data valid yang dapat diimpor dari file Excel tersebut.'.$errDetail);
            }

            $photoMsg = $photoCount > 0
                ? " {$photoCount} gambar berhasil diekstrak, dikompresi, dan disimpan."
                : '';

            $skippedCount = count($skippedUnits);
            $skippedMsg = $skippedCount > 0
                ? " ({$skippedCount} baris dilewati karena kode unit tidak terdaftar di sistem)."
                : '';

            return redirect()->route('repair.magnetic-plug')->with(
                'success',
                "Berhasil mengimpor {$importedCount} data Magnetic Plug ke sistem.{$photoMsg}{$skippedMsg}"
            );
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }

    /**
     * Export all or filtered Magnetic Plug records to Excel with embedded images.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $codeUnitFilter = $request->input('codeUnitFilter');
        $metodeFilter = $request->input('metodeFilter');
        $componentFilter = $request->input('componentFilter');
        $ratingFilter = $request->input('ratingFilter');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');

        $query = MagneticPlug::with('unit')->orderBy('date', 'desc');

        if ($codeUnitFilter) {
            $query->whereHas('unit', function ($q) use ($codeUnitFilter) {
                $q->where('code_unit', $codeUnitFilter);
            });
        }
        if ($metodeFilter) {
            $query->where('metode_filter', $metodeFilter);
        }
        if ($componentFilter) {
            $query->where('component', $componentFilter);
        }
        if ($ratingFilter) {
            $query->where('rating', $ratingFilter);
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $records = $query->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Magnetic Plug Data');

        // Headers
        $headers = ['Code Unit', 'HM', 'Date', 'Metode', 'Component', 'Picture', 'RATING', 'Remarks'];
        $sheet->fromArray([$headers], null, 'A1');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '1E293B'], 'size' => 11, 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C6E0B4']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '7F7F7F']]],
        ];
        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(28);
        $sheet->setAutoFilter('A1:H1');

        $sheet->getColumnDimension('A')->setWidth(16);
        $sheet->getColumnDimension('B')->setWidth(13);
        $sheet->getColumnDimension('C')->setWidth(16);
        $sheet->getColumnDimension('D')->setWidth(24);
        $sheet->getColumnDimension('E')->setWidth(28);
        $sheet->getColumnDimension('F')->setWidth(38);
        $sheet->getColumnDimension('G')->setWidth(16);
        $sheet->getColumnDimension('H')->setWidth(32);

        $rowIdx = 2;
        foreach ($records as $item) {
            $ratingShort = str_replace('Rating ', '', $item->rating);
            $dateStr = $item->date ? Carbon::parse($item->date)->format('d-M-y') : '-';

            $sheet->setCellValue("A{$rowIdx}", $item->unit?->code_unit ?? '-');
            $sheet->setCellValue("B{$rowIdx}", $item->hm);
            $sheet->setCellValue("C{$rowIdx}", $dateStr);
            $sheet->setCellValue("D{$rowIdx}", strtoupper($item->metode_filter));
            $sheet->setCellValue("E{$rowIdx}", $item->component);
            $sheet->setCellValue("G{$rowIdx}", $ratingShort);
            $sheet->setCellValue("H{$rowIdx}", $item->remarks ?? '');

            // Embed Picture if exists in storage
            if ($item->photo_path) {
                $fullPath = Storage::disk('public')->path($item->photo_path);
                if (file_exists($fullPath)) {
                    $drawing = new Drawing;
                    $drawing->setName('Magnetic Plug Image');
                    $drawing->setDescription('Inspection Photo');
                    $drawing->setPath($fullPath);
                    $drawing->setCoordinates("F{$rowIdx}");
                    $drawing->setHeight(75);
                    $drawing->setOffsetX(15);
                    $drawing->setOffsetY(8);
                    $drawing->setWorksheet($sheet);
                    $sheet->getRowDimension($rowIdx)->setRowHeight(80);
                } else {
                    $sheet->setCellValue("F{$rowIdx}", '[Foto tidak ditemukan]');
                    $sheet->getRowDimension($rowIdx)->setRowHeight(30);
                }
            } else {
                $sheet->setCellValue("F{$rowIdx}", '-');
                $sheet->getRowDimension($rowIdx)->setRowHeight(30);
            }

            // Cell border & alignment
            $sheet->getStyle("A{$rowIdx}:H{$rowIdx}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('E5E7EB');
            $sheet->getStyle("A{$rowIdx}:D{$rowIdx}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$rowIdx}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $sheet->getStyle("G{$rowIdx}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$rowIdx}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_LEFT);

            // Rating color
            $ratingColor = match (strtoupper($ratingShort)) {
                'A' => '92D050',
                'B' => 'FFE699',
                'C' => 'F8CBAD',
                'X' => 'D1D5DB',
                default => 'FFFFFF',
            };
            $sheet->getStyle("G{$rowIdx}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $ratingColor]],
                'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
            ]);

            $rowIdx++;
        }

        $filename = 'magnetic_plug_export_'.now()->format('Ymd_His').'.xlsx';

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Parse date value supporting Excel serial dates, dd-Mmm-yy, dd/mm/yyyy, and yyyy-mm-dd.
     */
    protected function parseDateValue($raw): string
    {
        if (empty($raw)) {
            return now()->format('Y-m-d');
        }

        if (is_numeric($raw)) {
            try {
                return ExcelDate::excelToDateTimeObject($raw)->format('Y-m-d');
            } catch (\Throwable $e) {
                // proceed
            }
        }

        $rawStr = trim((string) $raw);

        // Try standard Carbon formats
        try {
            return Carbon::parse($rawStr)->format('Y-m-d');
        } catch (\Throwable $e) {
            return now()->format('Y-m-d');
        }
    }

    /**
     * Normalize rating to standard system format 'Rating A', 'Rating B', etc.
     */
    protected function normalizeRating(string $raw): string
    {
        $clean = strtoupper(trim($raw));

        return match ($clean) {
            'A', 'RATING A' => 'Rating A',
            'B', 'RATING B' => 'Rating B',
            'C', 'RATING C' => 'Rating C',
            'X', 'RATING X' => 'Rating X',
            default => 'Rating A',
        };
    }

    /**
     * Normalize metode to standard title format.
     */
    protected function normalizeMetode(string $raw): string
    {
        $clean = strtoupper(trim($raw));

        return match ($clean) {
            'MAGNETIC PLUG' => 'Magnetic Plug',
            'CUTTING FILTER' => 'Cutting Filter',
            'CHECK CYLINDER' => 'Check Cylinder',
            'CHECK STRAINER' => 'Check Strainer',
            default => ! empty($raw) ? ucwords(strtolower($raw)) : 'Magnetic Plug',
        };
    }

    /**
     * Sanitize XLSX zip archive to strip bloated <hyperlinks> or unbounded ranges
     * that trigger PhpSpreadsheet Coordinate::extractAllCellReferencesInRange memory exhaustion.
     */
    private function sanitizeXlsxZip(string $filePath): void
    {
        if (! class_exists(\ZipArchive::class) || ! file_exists($filePath)) {
            return;
        }

        $zip = new \ZipArchive;
        if ($zip->open($filePath) !== true) {
            return;
        }

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_starts_with($name, 'xl/worksheets/sheet') && str_ends_with($name, '.xml')) {
                $xml = $zip->getFromIndex($i);
                if (! $xml) {
                    continue;
                }

                $sheetModified = false;

                // 1. Remove <hyperlinks> block entirely. Hyperlinks can have whole-column ranges
                // (e.g. A1:A1048576) which causes PhpSpreadsheet to allocate 1,000,000+ coordinates in RAM.
                if (str_contains($xml, '<hyperlinks')) {
                    $xml = preg_replace('/<hyperlinks[^>]*>.*?<\/hyperlinks>/s', '', $xml);
                    $sheetModified = true;
                }

                // 2. Remove any loose self-closing <hyperlink ... /> tags
                if (str_contains($xml, '<hyperlink')) {
                    $xml = preg_replace('/<hyperlink[^>]*\/>/s', '', $xml);
                    $sheetModified = true;
                }

                // 3. Remove conditionalFormatting spanning full sheet (1048576)
                if (str_contains($xml, '1048576')) {
                    $xml = preg_replace('/<conditionalFormatting[^>]*>.*?<\/conditionalFormatting>/s', '', $xml);
                    $sheetModified = true;
                }

                if ($sheetModified) {
                    $zip->deleteName($name);
                    $zip->addFromString($name, $xml);
                }
            }
        }

        $zip->close();
    }
}
