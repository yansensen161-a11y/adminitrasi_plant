<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\UnitGet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UnitGetController extends Controller
{
    /**
     * Clamp price rate / amount to safe values for DECIMAL(15,2).
     */
    private function clampPrice(float $val): float
    {
        if (is_nan($val) || is_infinite($val) || $val < 0) {
            return 0.0;
        }

        // Max safe value for DECIMAL(15,2) without IEEE 754 float rounding overflow: 999,999,999,999.99
        if ($val > 999999999999.99) {
            return 999999999999.99;
        }

        return round($val, 2);
    }

    /**
     * Parse Price Rate intelligently.
     * Handles inputs like:
     * - "330.00" or 330 => 330000 (tiga ratus tiga puluh ribu)
     * - "330.000" or "1.350.000" => 330000 or 1350000
     * - "1.35006526041E+8" (scientific notation) => 135006526.04
     * - 1350000 => 1350000
     */
    private function parsePriceRate(mixed $priceRate): float
    {
        if (empty($priceRate)) {
            return 0.0;
        }

        if (is_int($priceRate) || is_float($priceRate)) {
            $val = (float) $priceRate;
            if ($val > 0 && $val < 10000) {
                $val = $val * 1000;
            }

            return $this->clampPrice($val);
        }

        $clean = trim((string) $priceRate);
        if ($clean === '') {
            return 0.0;
        }

        // Remove currency prefix and whitespace
        $clean = preg_replace('/^(rp\.?|idr)\s*/i', '', $clean);
        $clean = trim($clean);

        // 1. Scientific notation (e.g. "1.35006526041E+8")
        if (preg_match('/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/', $clean)) {
            $val = (float) $clean;
            if ($val > 0 && $val < 10000) {
                $val = $val * 1000;
            }

            return $this->clampPrice($val);
        }

        // 2. Standard Indonesian thousand separator: e.g. "1.350.000" or "330.000"
        if (preg_match('/^\d{1,3}(\.\d{3})+$/', $clean)) {
            return $this->clampPrice((float) str_replace('.', '', $clean));
        }

        // 3. Indonesian thousand separator with comma decimal: e.g. "1.350.000,50"
        if (preg_match('/^\d{1,3}(\.\d{3})+,\d+$/', $clean)) {
            $clean = str_replace('.', '', $clean);
            $clean = str_replace(',', '.', $clean);

            return $this->clampPrice((float) $clean);
        }

        // 4. English thousand separator with dot decimal: e.g. "1,350,000.00" or "1,350,000"
        if (preg_match('/^\d{1,3}(,\d{3})+(\.\d+)?$/', $clean)) {
            return $this->clampPrice((float) str_replace(',', '', $clean));
        }

        // 5. Format like "330.00" or "330,00" (two decimals)
        if (preg_match('/^(\d+)[.,](\d{1,2})$/', $clean, $matches)) {
            $val = (float) ($matches[1].'.'.$matches[2]);
            if ($val > 0 && $val < 10000) {
                return $this->clampPrice($val * 1000);
            }

            return $this->clampPrice($val);
        }

        // 6. Generic cleaning if both dot and comma exist
        if (strpos($clean, '.') !== false && strpos($clean, ',') !== false) {
            if (strrpos($clean, ',') > strrpos($clean, '.')) {
                $clean = str_replace('.', '', $clean);
                $clean = str_replace(',', '.', $clean);
            } else {
                $clean = str_replace(',', '', $clean);
            }
        } elseif (strpos($clean, ',') !== false) {
            $clean = str_replace(',', '.', $clean);
        }

        $val = (float) preg_replace('/[^\d.]/', '', $clean);
        if ($val > 0 && $val < 10000) {
            $val = $val * 1000;
        }

        return $this->clampPrice($val);
    }

    /**
     * Store a newly created GET record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => ['nullable', 'exists:units,id'],
            'part_number' => ['required', 'string', 'max:255'],
            'depart' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'qty' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'ps_250' => ['nullable', 'string', 'max:50'],
            'ps_500' => ['nullable', 'string', 'max:50'],
            'ps_1000' => ['nullable', 'string', 'max:50'],
            'ps_2000' => ['nullable', 'string', 'max:50'],
            'price_rate' => ['nullable'],
            'is_global' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $qty = (float) ($validated['qty'] ?? 1);
        $priceRate = $this->parsePriceRate($request->input('price_rate'));
        $amount = $qty * $priceRate;

        $codeUnit = null;
        $modelUnit = null;
        $typeUnit = null;

        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
            if ($unit) {
                $codeUnit = $unit->code_unit;
                $modelUnit = $unit->model_unit ?? null;
                $typeUnit = $unit->type_unit ?? null;
            }
        }

        $isGlobal = (bool) ($validated['is_global'] ?? false);

        UnitGet::create([
            'unit_id' => $isGlobal ? null : ($validated['unit_id'] ?? null),
            'code_unit' => $isGlobal ? null : $codeUnit,
            'model_unit' => $modelUnit,
            'type_unit' => $typeUnit,
            'part_number' => trim($validated['part_number']),
            'depart' => ! empty($validated['depart']) ? trim($validated['depart']) : null,
            'description' => ! empty($validated['description']) ? trim($validated['description']) : null,
            'qty' => $qty,
            'satuan' => strtoupper(trim($validated['satuan'])),
            'ps_250' => $validated['ps_250'] ?? null,
            'ps_500' => $validated['ps_500'] ?? null,
            'ps_1000' => $validated['ps_1000'] ?? null,
            'ps_2000' => $validated['ps_2000'] ?? null,
            'price_rate' => $priceRate,
            'amount' => $amount,
            'is_global' => $isGlobal,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Data GET berhasil ditambahkan.');
    }

    /**
     * Update the specified GET record.
     */
    public function update(Request $request, UnitGet $unitGet): RedirectResponse
    {
        $validated = $request->validate([
            'part_number' => ['required', 'string', 'max:255'],
            'depart' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'qty' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'ps_250' => ['nullable', 'string', 'max:50'],
            'ps_500' => ['nullable', 'string', 'max:50'],
            'ps_1000' => ['nullable', 'string', 'max:50'],
            'ps_2000' => ['nullable', 'string', 'max:50'],
            'price_rate' => ['nullable'],
            'is_global' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $qty = (float) ($validated['qty'] ?? 1);
        $priceRate = $this->parsePriceRate($request->input('price_rate'));
        $amount = $qty * $priceRate;

        $unitGet->update([
            'part_number' => trim($validated['part_number']),
            'depart' => ! empty($validated['depart']) ? trim($validated['depart']) : null,
            'description' => ! empty($validated['description']) ? trim($validated['description']) : null,
            'qty' => $qty,
            'satuan' => strtoupper(trim($validated['satuan'])),
            'ps_250' => $validated['ps_250'] ?? null,
            'ps_500' => $validated['ps_500'] ?? null,
            'ps_1000' => $validated['ps_1000'] ?? null,
            'ps_2000' => $validated['ps_2000'] ?? null,
            'price_rate' => $priceRate,
            'amount' => $amount,
            'is_global' => isset($validated['is_global']) ? (bool) $validated['is_global'] : $unitGet->is_global,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Data GET berhasil diperbarui.');
    }

    /**
     * Remove the specified GET record.
     */
    public function destroy(UnitGet $unitGet): RedirectResponse
    {
        $unitGet->delete();

        return back()->with('success', 'Data GET berhasil dihapus.');
    }

    /**
     * Download Excel template for GET.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import GET');

        $headers = [
            'Part Number',
            'Depart',
            'Description',
            'QTY',
            'Satuan',
            'PS 250',
            'PS 500',
            'PS 1000',
            'PS 2000',
            'Price Rate',
            'Global',
            'Keterangan',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        $samples = [
            ['207-70-14151', 'BUCKET', 'Tooth Tiger PC300', 5, 'PCS', '✓', '✓', '✓', '✓', '280.00', 'TIDAK', 'Contoh 280.00 = Rp 280.000'],
            ['207-70-14160', 'BUCKET', 'Adapter Bucket PC300', 5, 'PCS', '', '✓', '✓', '✓', '450.00', 'TIDAK', 'Contoh 450.00 = Rp 450.000'],
            ['09244-02496', 'BUCKET', 'Pin Tooth PC300', 5, 'PCS', '✓', '✓', '✓', '✓', '45.00', 'TIDAK', 'Contoh 45.00 = Rp 45.000'],
            ['175-71-22272', 'BLADE', 'End Bit LH D85ESS-2', 1, 'PCS', '✓', '✓', '✓', '✓', '550.00', 'TIDAK', 'Bulldozer Blade'],
            ['175-71-22282', 'BLADE', 'End Bit RH D85ESS-2', 1, 'PCS', '✓', '✓', '✓', '✓', '550.00', 'TIDAK', 'Bulldozer Blade'],
            ['14X-71-11310', 'BLADE', 'Cutting Edge Center D85ESS-2', 2, 'PCS', '✓', '✓', '✓', '✓', '780.00', 'TIDAK', 'Bulldozer Cutting Edge'],
        ];

        $sheet->fromArray($samples, null, 'A2');

        // Style header row
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'], // indigo-600
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];
        $sheet->getStyle('A1:L1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(26);

        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_GET.xlsx');
    }

    /**
     * Import GET items from Excel or CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'replace_existing' => ['nullable', 'boolean'],
        ]);

        $file = $request->file('file');
        $unit = ! empty($request->unit_id) ? Unit::find($request->unit_id) : null;
        $replaceExisting = filter_var($request->input('replace_existing'), FILTER_VALIDATE_BOOLEAN);

        try {
            $reader = IOFactory::createReaderForFile($file->getRealPath());
            $reader->setReadDataOnly(true);
            $spreadsheet = $reader->load($file->getRealPath());
            // Pass $formatData = false to preserve exact numeric values instead of converting to scientific strings
            $sheet = $spreadsheet->getActiveSheet()->toArray(null, true, false, false);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membaca file: '.$e->getMessage());
        }

        if (empty($sheet)) {
            return back()->with('error', 'File Excel kosong atau format tidak didukung.');
        }
        $sheet = array_values(array_filter($sheet, function ($row) {
            return count(array_filter($row, fn ($val) => ! is_null($val) && trim((string) $val) !== '')) > 0;
        }));

        if (count($sheet) < 2) {
            return back()->with('error', 'File Excel hanya berisi header atau tidak memiliki baris data.');
        }

        // Scan first 5 rows to locate the header row (supporting files with title rows)
        $headerRowIdx = null;
        $colMap = [];
        $headerCandidates = array_slice($sheet, 0, 5, true);

        foreach ($headerCandidates as $rIdx => $rawRow) {
            $normalized = array_map(function ($h) {
                $clean = strtolower(trim((string) $h));

                return str_replace([' ', '_', '-', '/', '.'], '', $clean);
            }, $rawRow);

            $partIdx = null;
            foreach ($normalized as $idx => $h) {
                if (in_array($h, ['partnumber', 'partno', 'nopart', 'kodepart', 'part', 'nomorpart', 'pn'])) {
                    $partIdx = $idx;
                    break;
                }
            }

            if ($partIdx !== null) {
                $headerRowIdx = $rIdx;
                foreach ($normalized as $idx => $h) {
                    if (in_array($h, ['partnumber', 'partno', 'nopart', 'kodepart', 'part', 'nomorpart', 'pn'])) {
                        $colMap['part_number'] = $idx;
                    } elseif (in_array($h, ['depart', 'kompartemen', 'department', 'bagian', 'posisi', 'dept', 'kategori'])) {
                        $colMap['depart'] = $idx;
                    } elseif (in_array($h, ['description', 'deskripsi', 'namapart', 'itemname', 'keteranganpart', 'partdescription', 'namaget', 'namaitem', 'item'])) {
                        $colMap['description'] = $idx;
                    } elseif (in_array($h, ['qty', 'jumlah', 'kuantitas', 'quantity', 'jml'])) {
                        $colMap['qty'] = $idx;
                    } elseif (in_array($h, ['satuan', 'uom', 'unit', 'sat'])) {
                        $colMap['satuan'] = $idx;
                    } elseif (in_array($h, ['ps250', '250', 'ps250h', '250hm', 'pm250'])) {
                        $colMap['ps_250'] = $idx;
                    } elseif (in_array($h, ['ps500', '500', 'ps500h', '500hm', 'pm500'])) {
                        $colMap['ps_500'] = $idx;
                    } elseif (in_array($h, ['ps1000', '1000', 'ps1000h', '1000hm', 'pm1000'])) {
                        $colMap['ps_1000'] = $idx;
                    } elseif (in_array($h, ['ps2000', '2000', 'ps2000h', '2000hm', 'pm2000'])) {
                        $colMap['ps_2000'] = $idx;
                    } elseif (in_array($h, ['pricerate', 'hargasatuan', 'unitprice', 'tarifdasar', 'rateprice'])) {
                        $colMap['price_rate'] = $idx;
                    } elseif (! isset($colMap['price_rate']) && in_array($h, ['harga', 'rate', 'price', 'tarif']) && ! in_array($h, ['totalprice', 'total', 'amount', 'hargatotal', 'subtotal'])) {
                        $colMap['price_rate'] = $idx;
                    } elseif (in_array($h, ['global', 'isglobal', 'semuaunit', 'allunit'])) {
                        $colMap['is_global'] = $idx;
                    } elseif (in_array($h, ['keterangan', 'notes', 'catatan', 'remark', 'remarks'])) {
                        $colMap['notes'] = $idx;
                    } elseif (in_array($h, ['codeunit', 'kodeunit', 'unitcode', 'unit', 'nomorunit'])) {
                        $colMap['code_unit'] = $idx;
                    }
                }
                break;
            }
        }

        if ($headerRowIdx === null || ! isset($colMap['part_number'])) {
            return back()->with('error', 'Kolom "Part Number" tidak ditemukan pada header file Excel.');
        }

        $dataRows = array_slice($sheet, $headerRowIdx + 1);

        DB::beginTransaction();
        try {
            if ($replaceExisting && $unit) {
                UnitGet::where('unit_id', $unit->id)->delete();
            }

            $importedCount = 0;
            foreach ($dataRows as $row) {
                $partNumber = trim((string) ($row[$colMap['part_number']] ?? ''));
                if ($partNumber === '' || strtolower($partNumber) === 'total' || strtolower($partNumber) === 'total price') {
                    continue;
                }

                $depart = isset($colMap['depart']) ? trim((string) ($row[$colMap['depart']] ?? '')) : null;
                $description = isset($colMap['description']) ? trim((string) ($row[$colMap['description']] ?? '')) : null;
                $qtyRaw = isset($colMap['qty']) ? $row[$colMap['qty']] : 1;
                $qty = is_numeric($qtyRaw) ? (float) $qtyRaw : 1;
                if ($qty <= 0) {
                    $qty = 1;
                }

                $satuan = isset($colMap['satuan']) ? strtoupper(trim((string) ($row[$colMap['satuan']] ?? 'PCS'))) : 'PCS';
                if (empty($satuan)) {
                    $satuan = 'PCS';
                }

                $ps250 = isset($colMap['ps_250']) ? trim((string) ($row[$colMap['ps_250']] ?? '')) : null;
                $ps500 = isset($colMap['ps_500']) ? trim((string) ($row[$colMap['ps_500']] ?? '')) : null;
                $ps1000 = isset($colMap['ps_1000']) ? trim((string) ($row[$colMap['ps_1000']] ?? '')) : null;
                $ps2000 = isset($colMap['ps_2000']) ? trim((string) ($row[$colMap['ps_2000']] ?? '')) : null;

                $priceRateRaw = isset($colMap['price_rate']) ? $row[$colMap['price_rate']] : 0;
                $priceRate = $this->parsePriceRate($priceRateRaw);
                $amount = $this->clampPrice($qty * $priceRate);

                $isGlobalRaw = isset($colMap['is_global']) ? strtolower(trim((string) $row[$colMap['is_global']])) : '';
                $isGlobal = in_array($isGlobalRaw, ['ya', 'yes', 'true', '1', 'y', 'global']);

                $rowUnit = $unit;
                if (isset($colMap['code_unit']) && ! empty($row[$colMap['code_unit']])) {
                    $matchedUnit = Unit::where('code_unit', trim((string) $row[$colMap['code_unit']]))->first();
                    if ($matchedUnit) {
                        $rowUnit = $matchedUnit;
                    }
                }

                $notes = isset($colMap['notes']) ? trim((string) ($row[$colMap['notes']] ?? '')) : null;

                UnitGet::create([
                    'unit_id' => $isGlobal ? null : ($rowUnit?->id ?? null),
                    'code_unit' => $isGlobal ? null : ($rowUnit?->code_unit ?? null),
                    'model_unit' => $rowUnit?->model_unit ?? null,
                    'type_unit' => $rowUnit?->type_unit ?? null,
                    'part_number' => $partNumber,
                    'depart' => $depart ?: null,
                    'description' => $description ?: null,
                    'qty' => $qty,
                    'satuan' => $satuan,
                    'ps_250' => $ps250 ?: null,
                    'ps_500' => $ps500 ?: null,
                    'ps_1000' => $ps1000 ?: null,
                    'ps_2000' => $ps2000 ?: null,
                    'price_rate' => $priceRate,
                    'amount' => $amount,
                    'is_global' => $isGlobal,
                    'notes' => $notes ?: null,
                ]);

                $importedCount++;
            }

            DB::commit();

            return back()->with('success', "Berhasil mengimpor {$importedCount} data GET.");
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal mengimpor data GET: '.$e->getMessage());
        }
    }
}
