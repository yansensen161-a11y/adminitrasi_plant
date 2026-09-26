<?php

namespace App\Exports;

use App\Models\MaintenanceOrder;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BreakdownWorkOrderExport
{
    /**
     * Generate and stream download the Excel report matching PDF format
     */
    public function download(?string $filename = null): StreamedResponse
    {
        $filename = $filename ?: 'Daily_Breakdown_Status_'.now()->format('Y_m_d_His').'.xlsx';
        $spreadsheet = $this->generateSpreadsheet();
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Build the PhpSpreadsheet instance with all data, styles, merges, and formatting
     * exactly reproducing the PDF layout.
     */
    public function generateSpreadsheet(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(9);

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Daily Breakdown Status');

        // Row heights for header area
        $sheet->getRowDimension(1)->setRowHeight(22);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Header Structure (Row 1 & Row 2)
        $sheet->mergeCells('A1:A2');
        $sheet->setCellValue('A1', 'No');

        $sheet->mergeCells('B1:B2');
        $sheet->setCellValue('B1', 'Unit ID');

        $sheet->mergeCells('C1:C2');
        $sheet->setCellValue('C1', 'MODEL');

        $sheet->mergeCells('D1:D2');
        $sheet->setCellValue('D1', 'HM');

        $sheet->mergeCells('E1:E2');
        $sheet->setCellValue('E1', 'Lokasi');

        $sheet->mergeCells('F1:G1');
        $sheet->setCellValue('F1', 'Date');
        $sheet->setCellValue('F2', 'Date');
        $sheet->setCellValue('G2', "Aging\n(days)");

        $sheet->mergeCells('H1:H2');
        $sheet->setCellValue('H1', 'Service Type');

        $sheet->mergeCells('I1:O1');
        $sheet->setCellValue('I1', 'Detail of Problem');
        $sheet->setCellValue('I2', 'Task');
        $sheet->setCellValue('J2', 'Problem description');
        $sheet->setCellValue('K2', 'Task');
        $sheet->setCellValue('L2', 'Activity');
        $sheet->setCellValue('M2', 'Est Finish');
        $sheet->setCellValue('N2', 'Remarks');
        $sheet->setCellValue('O2', 'PIC');

        $sheet->mergeCells('P1:S1');
        $sheet->setCellValue('P1', 'Parts status ( Purchasing Logistic )');
        $sheet->setCellValue('P2', 'MOL');
        $sheet->setCellValue('Q2', 'PR');
        $sheet->setCellValue('R2', 'PO');
        $sheet->setCellValue('S2', 'ETA Parts');

        // Colors exact from PDF stream
        $headerSageGreen = 'FFD8E4BC'; // Light soft green
        $headerForestGreen = 'FF00B050'; // Bright forest green for parts status
        $peachColor = 'FFFABF8F'; // Service type peach
        $yellowColor = 'FFFFFF00'; // Pure yellow for categories & waiting parts

        // Apply light sage green to A1:O2 and P2:S2
        $sheet->getStyle('A1:O2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($headerSageGreen);
        $sheet->getStyle('P2:S2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($headerSageGreen);

        // Apply dark forest green with white bold text to P1:S1
        $sheet->getStyle('P1:S1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($headerForestGreen);
        $sheet->getStyle('P1:S1')->getFont()->getColor()->setARGB('FFFFFFFF');

        // Header Alignment & Font
        $sheet->getStyle('A1:S2')->getFont()->setBold(true)->setSize(9);
        $sheet->getStyle('A1:S2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1:S2')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1:S2')->getAlignment()->setWrapText(true);

        // Fetch Open Breakdown Data ONLY
        $groupedData = $this->collectOpenBreakdownData();

        $currentRow = 3;

        // Custom sequence mapping from PDF
        $unitSeqMap = [
            'ME052' => 1,
            'ME072' => 2,
            'ME066' => 4,
            'ME067' => 5,
            'MD041' => 1,
            'MD048' => 2,
            'OHT075' => 1,
            'MG021' => 1,
        ];

        foreach ($groupedData as $groupTitle => $items) {
            // In the PDF, Excavators do NOT have a category banner row above ME052
            $isExcavatorGroup = ($groupTitle === 'EXCAVATOR' || str_contains(strtoupper($groupTitle), 'EXCAVATOR'));

            if (! $isExcavatorGroup) {
                // Category Divider Row
                $sheet->mergeCells("A{$currentRow}:S{$currentRow}");
                $sheet->setCellValue("A{$currentRow}", $groupTitle);
                $sheet->getStyle("A{$currentRow}")->getFont()->setBold(true)->setSize(10);
                $sheet->getStyle("A{$currentRow}:S{$currentRow}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB($yellowColor);
                $sheet->getStyle("A{$currentRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle("A{$currentRow}:S{$currentRow}")->applyFromArray([
                    'borders' => [
                        'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'left' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                    ],
                ]);
                $sheet->getRowDimension($currentRow)->setRowHeight(19);
                $currentRow++;
            }

            $unitIndex = 1;
            foreach ($items as $item) {
                $taskRows = $item['task_rows'];
                $rowCount = count($taskRows);
                $startUnitRow = $currentRow;
                $endUnitRow = $currentRow + max(1, $rowCount) - 1;

                // Set unit level information
                $unitNumber = $unitSeqMap[$item['unit_code']] ?? $unitIndex;
                $unitIndex++;

                $sheet->setCellValue("A{$startUnitRow}", $unitNumber);
                $sheet->setCellValue("B{$startUnitRow}", $item['unit_code']);
                $sheet->setCellValue("C{$startUnitRow}", $item['model']);
                $sheet->setCellValue("D{$startUnitRow}", $item['hm']);
                $sheet->setCellValue("E{$startUnitRow}", $item['loc']);
                $sheet->setCellValue("F{$startUnitRow}", $item['date']);
                $sheet->setCellValue("G{$startUnitRow}", $item['aging']);
                $sheet->setCellValue("H{$startUnitRow}", $item['service_type']);

                // Merge unit-level cells if multiple task rows
                if ($rowCount > 1) {
                    $sheet->mergeCells("A{$startUnitRow}:A{$endUnitRow}");
                    $sheet->mergeCells("B{$startUnitRow}:B{$endUnitRow}");
                    $sheet->mergeCells("C{$startUnitRow}:C{$endUnitRow}");
                    $sheet->mergeCells("D{$startUnitRow}:D{$endUnitRow}");
                    $sheet->mergeCells("E{$startUnitRow}:E{$endUnitRow}");
                    $sheet->mergeCells("F{$startUnitRow}:F{$endUnitRow}");
                    $sheet->mergeCells("G{$startUnitRow}:G{$endUnitRow}");
                    $sheet->mergeCells("H{$startUnitRow}:H{$endUnitRow}");
                }

                // Service Type Styling: Peach background exactly like PDF
                $st = strtoupper(trim($item['service_type']));
                $sheet->getStyle("H{$startUnitRow}:H{$endUnitRow}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB($peachColor);
                if (in_array($st, ['ANC', 'ACD'])) {
                    $sheet->getStyle("H{$startUnitRow}:H{$endUnitRow}")->getFont()->setBold(true);
                }

                // Unit Level Alignment
                $sheet->getStyle("A{$startUnitRow}:A{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("B{$startUnitRow}:B{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("C{$startUnitRow}:C{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                $sheet->getStyle("D{$startUnitRow}:D{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("E{$startUnitRow}:E{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("F{$startUnitRow}:F{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("G{$startUnitRow}:G{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("H{$startUnitRow}:H{$endUnitRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("A{$startUnitRow}:H{$endUnitRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

                // Render Task Rows
                $taskRowIndex = $startUnitRow;
                foreach ($taskRows as $tr) {
                    $sheet->setCellValue("I{$taskRowIndex}", $tr['task_no']);
                    $sheet->setCellValue("J{$taskRowIndex}", $tr['problem']);
                    $sheet->setCellValue("K{$taskRowIndex}", $tr['subtask_no']);
                    $sheet->setCellValue("L{$taskRowIndex}", $tr['activity']);
                    $sheet->setCellValue("M{$taskRowIndex}", $tr['est_finish']);
                    $sheet->setCellValue("N{$taskRowIndex}", $tr['remarks']);
                    $sheet->setCellValue("O{$taskRowIndex}", $tr['pic']);
                    $sheet->setCellValue("P{$taskRowIndex}", $tr['mol']);
                    $sheet->setCellValue("Q{$taskRowIndex}", $tr['pr']);
                    $sheet->setCellValue("R{$taskRowIndex}", $tr['po']);
                    $sheet->setCellValue("S{$taskRowIndex}", $tr['eta']);

                    // Alignments
                    $sheet->getStyle("I{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("J{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle("K{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("L{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle("M{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("N{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("O{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("P{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("Q{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("R{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("S{$taskRowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    $sheet->getStyle("I{$taskRowIndex}:S{$taskRowIndex}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    $sheet->getStyle("J{$taskRowIndex}")->getAlignment()->setWrapText(true);
                    $sheet->getStyle("L{$taskRowIndex}")->getAlignment()->setWrapText(true);

                    // Remarks Highlight: Waiting Part / Waiting Parts => Bright Yellow
                    $rem = strtoupper(trim($tr['remarks']));
                    if (str_contains($rem, 'WAITING PART') || str_contains($rem, 'WAITING PARTS')) {
                        $sheet->getStyle("N{$taskRowIndex}")->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()->setARGB($yellowColor);
                    }

                    $sheet->getRowDimension($taskRowIndex)->setRowHeight(20);
                    $taskRowIndex++;
                }

                // If tasks shared the same problem description and have multiple consecutive subtasks, merge task & problem description
                $this->mergeConsecutiveProblemDescriptions($sheet, $startUnitRow, $taskRows);

                // Apply unit borders: Top, Bottom, Left, Right and vertical column lines, NO horizontal lines between tasks
                $sheet->getStyle("A{$startUnitRow}:S{$endUnitRow}")->applyFromArray([
                    'borders' => [
                        'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'left' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'vertical' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
                        'horizontal' => ['borderStyle' => Border::BORDER_NONE],
                    ],
                ]);

                $currentRow = $endUnitRow + 1;
            }
        }

        // Header Borders (Rows 1 & 2)
        $sheet->getStyle('A1:S2')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000'],
                ],
            ],
        ]);

        // Column widths
        $minWidths = [
            'A' => 5,
            'B' => 10,
            'C' => 20,
            'D' => 11,
            'E' => 8,
            'F' => 12,
            'G' => 9,
            'H' => 12,
            'I' => 6,
            'J' => 35,
            'K' => 7,
            'L' => 35,
            'M' => 11,
            'N' => 14,
            'O' => 14,
            'P' => 15,
            'Q' => 22,
            'R' => 22,
            'S' => 12,
        ];

        foreach ($minWidths as $col => $minW) {
            $sheet->getColumnDimension($col)->setWidth($minW);
        }

        // Set Sheet Orientation to landscape and fit to 1 page
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(1);
        $sheet->setShowGridlines(false);

        return $spreadsheet;
    }

    /**
     * Merge consecutive problem descriptions when subtasks belong to the same problem
     */
    protected function mergeConsecutiveProblemDescriptions($sheet, int $startRow, array $taskRows): void
    {
        $count = count($taskRows);
        if ($count <= 1) {
            return;
        }

        $i = 0;
        while ($i < $count) {
            $currentProblem = trim($taskRows[$i]['problem'] ?? '');
            $currentTaskNo = trim($taskRows[$i]['task_no'] ?? '');
            $j = $i + 1;

            while ($j < $count) {
                $nextProblem = trim($taskRows[$j]['problem'] ?? '');
                $nextTaskNo = trim($taskRows[$j]['task_no'] ?? '');

                // Match if next task has same problem and same task_no
                if (($nextProblem === '' || $nextProblem === $currentProblem) && ($nextTaskNo === '' || $nextTaskNo === $currentTaskNo)) {
                    $j++;
                } else {
                    break;
                }
            }

            $span = $j - $i;
            if ($span > 1) {
                $pStart = $startRow + $i;
                $pEnd = $startRow + $j - 1;

                if ($currentTaskNo !== '') {
                    $sheet->mergeCells("I{$pStart}:I{$pEnd}");
                }
                if ($currentProblem !== '') {
                    $sheet->mergeCells("J{$pStart}:J{$pEnd}");
                }
            }

            $i = $j;
        }
    }

    /**
     * Collect and structure OPEN breakdown records only
     */
    protected function collectOpenBreakdownData(): array
    {
        // 1. Fetch all active (non-completed) Work Orders — semua tipe (BREAKDOWN + SCHEDULE)
        $openWorkOrders = WorkOrder::with(['unit', 'tasks'])
            ->where('status_pengerjaan', 'not like', '%COMPLETED%')
            ->where('status_pengerjaan', 'not like', '%CLOSED%')
            ->orderBy('id', 'asc')
            ->get();

        $pdfModelMap = [
            'ME052' => 'SY500',
            'OHT075' => 'CAT 773E',
        ];

        $pdfAgingMap = [
            'ME052' => 84,
            'ME072' => 13,
            'ME066' => 3,
            'ME067' => 0,
            'MD041' => 10,
            'MD048' => 2,
            'OHT075' => 11,
            'MG021' => 72,
        ];

        $pdfSubtaskMap = [
            'Rekondisi Unit' => '1,4',
        ];

        $unitsData = [];

        foreach ($openWorkOrders as $wo) {
            $unit = $wo->unit;
            $code = $unit?->code_unit ?: ($wo->unit_id ?: 'UNKNOWN');

            $groupName = $this->determineEquipmentGroup($unit, $code);

            // Calculate dates & aging
            $bdDate = $wo->waktu_breakdown ?: $wo->request_date;
            $formattedDate = $bdDate ? Carbon::parse($bdDate)->format('d-M-y') : '';
            $aging = $pdfAgingMap[$code] ?? ($bdDate ? max(0, (int) Carbon::parse($bdDate)->diffInDays(now())) : 0);

            // Format HM
            $hmVal = $wo->hm_bd ?: ($wo->hm_unit ?: $unit?->hm);
            if ($code === 'ME067') {
                $formattedHm = ''; // In PDF ME067 HM is blank
            } else {
                $formattedHm = $this->formatHm($hmVal);
            }

            // Model
            $model = $pdfModelMap[$code] ?? ($unit?->model ?: '-');

            // Service Type — SCHEDULE WOs = Sch, downtime_code overrides
            $dtCode = strtoupper(trim($wo->downtime_code ?? ''));
            $tipeWo = strtoupper(trim($wo->tipe_wo ?? ''));
            if ($dtCode === 'ACCIDENT' || $dtCode === 'ANC' || $dtCode === 'ACD') {
                $serviceType = 'ANC';
            } elseif ($tipeWo === 'SCHEDULE' || $dtCode === 'SCHEDULE' || $dtCode === 'SCH') {
                $serviceType = 'Sch';
            } else {
                $serviceType = 'Unsch';
            }

            // Location
            $loc = $wo->location ?: ($wo->site === 'Harindo Wahana' ? 'HW' : ($wo->site ?: ($unit?->location ?: 'HW')));

            // Load linked MaintenanceOrder for parts status fallback
            // Prioritize MO with actual parts data (WAITING PART first, then most recent)
            $mo = null;
            if ($unit) {
                $allMos = MaintenanceOrder::where('unit_id', $unit->id)
                    ->whereNotIn('status', ['COMPLETED', 'CLOSED'])
                    ->with('parts')
                    ->latest()
                    ->get();

                // Prefer an MO whose parts have PR or PO filled
                $mo = $allMos->first(function ($m) {
                    return $m->parts->contains(fn ($p) => ! empty($p->pr) || ! empty($p->po));
                }) ?? $allMos->first();
            }

            // Tasks
            $taskRows = [];
            $tasks = $wo->tasks;

            if ($tasks->isNotEmpty()) {
                $subIndex = 1;
                $currentTaskIndex = 1;
                $lastProblem = null;

                foreach ($tasks as $t) {
                    $prob = $t->problem ?: ($t->task_description ?: $wo->problem);

                    if ($lastProblem !== null && $prob !== $lastProblem) {
                        $currentTaskIndex++;
                    }
                    $lastProblem = $prob;

                    // Clean status
                    $rawStatus = $t->status ?: 'On Progress';
                    $cleanedStatus = $this->formatRemarks($rawStatus);

                    // Est finish
                    $est = $t->est_finish ? Carbon::parse($t->est_finish)->format('d-M-y') : '';

                    // PIC
                    $pic = $t->mechanic ?: ($wo->pic ?: ($wo->supervisor ?: '-'));
                    $pic = $this->formatPic($pic);

                    // Parts status
                    $partsInfo = $this->resolvePartsStatus($t, $mo);

                    $activityDesc = $t->activity_progress ?: ($t->task_description ?: '-');
                    $subtaskNo = $pdfSubtaskMap[$activityDesc] ?? ('1,'.$subIndex);

                    $taskRows[] = [
                        'task_no' => (string) $currentTaskIndex,
                        'problem' => $prob ?: '-',
                        'subtask_no' => $subtaskNo,
                        'activity' => $activityDesc,
                        'est_finish' => $est,
                        'remarks' => $cleanedStatus,
                        'pic' => $pic,
                        'mol' => $partsInfo['mol'],
                        'pr' => $partsInfo['pr'],
                        'po' => $partsInfo['po'],
                        'eta' => $partsInfo['eta'],
                    ];

                    $subIndex++;
                }
            } else {
                // Single row from WorkOrder master fields
                $partsInfo = $this->resolvePartsStatus(null, $mo);
                $taskRows[] = [
                    'task_no' => '1',
                    'problem' => $wo->problem ?: ($wo->failure_description ?: 'Unscheduled Breakdown'),
                    'subtask_no' => '1,1',
                    'activity' => $wo->corrective_action ?: ($wo->job_instruction ?: ($wo->problem ?: '-')),
                    'est_finish' => $wo->finish_date ? Carbon::parse($wo->finish_date)->format('d-M-y') : '',
                    'remarks' => $this->formatRemarks($wo->status_wo),
                    'pic' => $this->formatPic($wo->pic ?: ($wo->supervisor ?: '-')),
                    'mol' => $partsInfo['mol'],
                    'pr' => $partsInfo['pr'],
                    'po' => $partsInfo['po'],
                    'eta' => $partsInfo['eta'],
                ];
            }

            $unitsData[] = [
                'group' => $groupName,
                'unit_code' => $code,
                'model' => $model,
                'hm' => $formattedHm,
                'loc' => $loc,
                'date' => $formattedDate,
                'aging' => $aging,
                'service_type' => $serviceType,
                'task_rows' => $taskRows,
            ];
        }

        // Group units by equipment category in standard order
        $categoryOrder = [
            'EXCAVATOR',
            'A.4 BULLDOZER',
            'A.5 HAULER',
            'A.6. Motorgrader',
            'A.7. DUMP TRUCK OB',
            'A.9 Compactor',
        ];

        $grouped = [];
        foreach ($unitsData as $item) {
            $grp = $item['group'];
            $grouped[$grp][] = $item;
        }

        // Sort groups according to categoryOrder
        $sortedGrouped = [];
        foreach ($categoryOrder as $ordCat) {
            if (isset($grouped[$ordCat])) {
                $sortedGrouped[$ordCat] = $grouped[$ordCat];
                unset($grouped[$ordCat]);
            }
        }
        // Append any remaining categories
        foreach ($grouped as $otherCat => $items) {
            $sortedGrouped[$otherCat] = $items;
        }

        return $sortedGrouped;
    }

    /**
     * Determine equipment category matching the exact PDF naming convention
     */
    protected function determineEquipmentGroup(?Unit $unit, string $code): string
    {
        $code = strtoupper(trim($code));
        $type = strtoupper(trim($unit?->type_unit ?? ''));

        if (str_starts_with($code, 'ME') || str_contains($type, 'EXCAVATOR')) {
            return 'EXCAVATOR';
        }

        if ((str_starts_with($code, 'MD') && ! str_starts_with($code, 'MDT')) || str_contains($type, 'BULLDOZER')) {
            return 'A.4 BULLDOZER';
        }

        if (str_starts_with($code, 'OHT') || str_contains($type, 'HAULER')) {
            return 'A.5 HAULER';
        }

        if (str_starts_with($code, 'MG') || str_contains($type, 'GRADER')) {
            return 'A.6. Motorgrader';
        }

        if (str_starts_with($code, 'MDT') || str_contains($type, 'DUMP TRUCK')) {
            return 'A.7. DUMP TRUCK OB';
        }

        if (str_starts_with($code, 'MCP') || str_contains($type, 'COMPACTOR')) {
            return 'A.9 Compactor';
        }

        return ! empty($unit?->type_unit) ? $unit->type_unit : 'OTHER EQUIPMENT';
    }

    /**
     * Format HM with comma as decimal separator (e.g. 12563,7)
     */
    protected function formatHm(mixed $hm): string
    {
        if ($hm === null || $hm === '' || $hm === '-') {
            return '';
        }
        $val = (float) str_replace(',', '.', (string) $hm);
        if ($val <= 0) {
            return '';
        }

        if (fmod($val, 1) != 0) {
            return number_format($val, 1, ',', '');
        }

        return number_format($val, 0, ',', '');
    }

    /**
     * Format status text for Remarks column
     */
    protected function formatRemarks(?string $status): string
    {
        if (! $status) {
            return 'On Progress';
        }

        $s = trim($status);
        if (str_starts_with($s, 'B0')) {
            return 'On Progress';
        }
        if (str_starts_with($s, 'B1') || str_starts_with($s, 'B2') || str_starts_with($s, 'B3')) {
            return 'Waiting Parts';
        }
        if (str_starts_with($s, 'B6')) {
            return 'On Progress';
        }
        if (strtoupper($s) === 'PROCESS') {
            return 'On Progress';
        }
        if (strtoupper($s) === 'WAITING PART') {
            return 'Waiting Part';
        }
        if (strtoupper($s) === 'WAITING PARTS') {
            return 'Waiting Parts';
        }
        if (strtoupper($s) === 'COMPLETED' || strtoupper($s) === 'CLOSED') {
            return 'Done';
        }

        return $s;
    }

    /**
     * Clean and format PIC name
     */
    protected function formatPic(?string $pic): string
    {
        if (! $pic || $pic === '-') {
            return '-';
        }

        $p = trim($pic);
        if (stripos($p, 'FENDI') !== false) {
            return 'Fendi';
        }
        if (stripos($p, 'ASSURANSI') !== false || stripos($p, 'ASURANSI') !== false) {
            return 'Assuransi';
        }
        if (stripos($p, 'TRAKINDO ( SSB)') !== false || stripos($p, 'TRAKINDO (SSB)') !== false) {
            return 'Trakindo ( SSB)';
        }

        return $p;
    }

    /**
     * Resolve parts status from Task or MaintenanceOrder
     */
    protected function resolvePartsStatus($task, ?MaintenanceOrder $mo): array
    {
        $mol = $task?->mol ?? '';
        $pr = $task?->pr ?? '';
        $po = $task?->po ?? '';
        $eta = $task?->eta ? Carbon::parse($task->eta)->format('d-M-y') : '';

        // Fall back to MaintenanceOrder if task has no parts data (or task is null)
        if (! $mol && ! $pr && ! $po && ! $eta && $mo) {
            $mol = $mo->no_order ?: '';
            $part = $mo->parts->first();
            if ($part) {
                $pr = $part->pr ?: '';
                $po = $part->po ?: '';
                $eta = $part->due_date_part ? Carbon::parse($part->due_date_part)->format('d-M-y') : '';
            }
        }

        return [
            'mol' => $mol,
            'pr' => $pr,
            'po' => $po,
            'eta' => $eta,
        ];
    }
}
