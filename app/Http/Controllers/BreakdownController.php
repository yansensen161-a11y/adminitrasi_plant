<?php

namespace App\Http\Controllers;

use App\Models\Breakdown;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class BreakdownController extends Controller
{
    public function daily()
    {
        $predefinedGroups = [
            'A.1. EXCAVATOR CRUSHER',
            'A.2. EXCAVATOR BIGMALL',
            'A.3. EXCAVATOR SMALL',
            'A.4. BULLDOZER',
            'A.5. HAULER',
            'A.6. MOTORGRADER',
            'A.7. DUMP TRUCK',
            'A.8. Compactor',
            'A.09. MAINHAUL',
            'A.10. GENERAL',
        ];

        $breakdowns = Breakdown::with(['unit', 'tasks'])->get();
        $grouped = $breakdowns->groupBy('equipment_group');

        $mapUnits = function ($items) {
            return collect($items)->map(function ($item, $index) {
                return [
                    'id' => $item->id,
                    'no' => $index + 1,
                    'unit_id' => $item->unit_id,
                    'unit_no' => $item->unit ? $item->unit->code_unit : '-',
                    'model' => $item->unit ? $item->unit->model : '-',
                    'sn' => $item->unit ? $item->unit->sn_chassis : '-',
                    'loc' => $item->loc,
                    'hm' => $item->hm,
                    'est_finish' => $item->est_finish ? Carbon::parse($item->est_finish)->format('d-M-y') : '-',
                    'raw_est_finish' => $item->est_finish,
                    'aging' => $item->aging,
                    'status' => $item->status,
                    'equipment_group' => $item->equipment_group,
                    'tasks' => $item->tasks->map(function ($task) {
                        return [
                            'id' => $task->id,
                            'task_no' => $task->task_no,
                            'problem' => $task->problem,
                            'activity' => $task->activity,
                            'status' => $task->status,
                            'remarks' => $task->remarks,
                            'mol' => $task->mol,
                            'pr' => $task->pr,
                            'po' => $task->po,
                            'eta' => $task->eta ? Carbon::parse($task->eta)->format('d-M-y') : '-',
                            'raw_eta' => $task->eta,
                        ];
                    }),
                ];
            })->values()->all();
        };

        $categories = collect();

        foreach ($predefinedGroups as $groupName) {
            $items = $grouped->get($groupName, collect([]));

            // Tampilkan A.1 selalu, dan tampilkan yang lain jika ada data ATAU kita paksa semua tampil
            // Berhubung user minta urutkan A1 - A10, kita akan tampilkan semuanya.
            // Jika user sebelumnya minta hapus 2-10 (karena bug duplicate), sekarang bug sudah diperbaiki di DB.
            // Agar aman, kita hanya render jika ada isinya ATAU jika itu A.1.
            // Tunggu, mari kita tampilkan semua saja karena "urutkan semua dari A1 sampai A10".
            // Revisi: user sebelumnya tidak suka 2-10 kosong.
            // Jadi: Tampilkan jika count > 0 atau jika A.1.
            if ($items->count() > 0 || $groupName === 'A.1. EXCAVATOR CRUSHER') {
                $categories->push([
                    'name' => $groupName,
                    'units' => $mapUnits($items),
                ]);
            }
        }

        // Tambahkan grup lain yang tidak ada di predefined (berjaga-jaga)
        foreach ($grouped as $groupName => $items) {
            if (! in_array($groupName, $predefinedGroups)) {
                $categories->push([
                    'name' => $groupName ?: 'UNSPECIFIED GROUP',
                    'units' => $mapUnits($items),
                ]);
            }
        }

        $categories = $categories->all();

        $units = Unit::select('id', 'code_unit', 'model')->get();

        return Inertia::render('Breakdown/Daily', [
            'categories' => $categories,
            'availableUnits' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'equipment_group' => 'required|string',
            'loc' => 'nullable|string',
            'hm' => 'nullable|string',
            'est_finish' => 'nullable|date',
            'aging' => 'nullable|integer',
            'status' => 'nullable|string',
            'tasks' => 'nullable|array',
        ]);

        $breakdown = Breakdown::create($validated);

        if (! empty($validated['tasks'])) {
            foreach ($validated['tasks'] as $taskData) {
                $breakdown->tasks()->create($taskData);
            }
        }

        return redirect()->back()->with('success', 'Breakdown created successfully');
    }

    public function update(Request $request, Breakdown $breakdown)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'equipment_group' => 'required|string',
            'loc' => 'nullable|string',
            'hm' => 'nullable|string',
            'est_finish' => 'nullable|date',
            'aging' => 'nullable|integer',
            'status' => 'nullable|string',
            'tasks' => 'nullable|array',
        ]);

        $breakdown->update($validated);

        // Update tasks: simple approach is to delete and recreate or sync
        if (isset($validated['tasks'])) {
            $breakdown->tasks()->delete();
            foreach ($validated['tasks'] as $taskData) {
                $breakdown->tasks()->create($taskData);
            }
        }

        return redirect()->back()->with('success', 'Breakdown updated successfully');
    }

    public function destroy(Breakdown $breakdown)
    {
        $breakdown->delete();

        return redirect()->back()->with('success', 'Breakdown deleted successfully');
    }

    public function exportExcel()
    {
        $breakdowns = Breakdown::with(['unit', 'tasks'])->get();
        $grouped = $breakdowns->groupBy('equipment_group');

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Title
        $sheet->setCellValue('A1', 'Date : '.now()->format('d/m/Y'));
        $sheet->mergeCells('G1:J1');
        $sheet->setCellValue('G1', 'DAILY BREAKDOWN STATUS');
        $sheet->getStyle('G1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('G1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->mergeCells('G2:J2');
        $sheet->setCellValue('G2', 'PT.MITRA ABADI MAHAKAM');
        $sheet->getStyle('G2')->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('G2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Headers
        $row = 4;
        $headers = [
            'A' => 'No', 'B' => 'Unit ID', 'C' => 'MODEL', 'D' => 'HM', 'E' => 'Lokasi',
            'F' => 'Date', 'G' => "Aging\n(days)", 'H' => 'Service Type',
            'I' => 'Task', 'J' => 'Problem description', 'K' => 'Task', 'L' => 'Activity',
            'M' => 'Est Finish', 'N' => 'Remarks', 'O' => 'PIC',
            'P' => 'MOL', 'Q' => 'PR', 'R' => 'PO', 'S' => 'ETA Parts',
        ];

        // Top Merged headers
        $sheet->mergeCells('I3:L3');
        $sheet->setCellValue('I3', 'Detail of Problem');
        $sheet->getStyle('I3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFB4C6E7');

        $sheet->mergeCells('P3:S3');
        $sheet->setCellValue('P3', 'Parts status ( Purchasing Logistic )');
        $sheet->getStyle('P3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('P3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFA9D08E');

        // Apply Headers
        foreach ($headers as $col => $text) {
            $sheet->setCellValue($col.$row, $text);
            $sheet->getStyle($col.$row)->getAlignment()->setWrapText(true);
            $sheet->getStyle($col.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle($col.$row)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getStyle($col.$row)->getFont()->setBold(true);
            $sheet->getStyle($col.$row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFD9E1F2');
        }
        $sheet->getRowDimension($row)->setRowHeight(30);

        // Group rows
        $row++;
        foreach ($grouped as $groupName => $items) {
            $groupName = $groupName ?: 'UNSPECIFIED GROUP';
            $sheet->mergeCells("A{$row}:S{$row}");
            $sheet->setCellValue("A{$row}", $groupName);
            $sheet->getStyle("A{$row}")->getFont()->setBold(true);
            $sheet->getStyle("A{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFF00'); // Yellow
            $row++;

            $no = 1;
            foreach ($items as $item) {
                $taskCount = $item->tasks->count();
                $rowsToMerge = max(1, $taskCount);
                $endRow = $row + $rowsToMerge - 1;

                // Merge unit-level info
                if ($rowsToMerge > 1) {
                    $sheet->mergeCells("A{$row}:A{$endRow}");
                    $sheet->mergeCells("B{$row}:B{$endRow}");
                    $sheet->mergeCells("C{$row}:C{$endRow}");
                    $sheet->mergeCells("D{$row}:D{$endRow}");
                    $sheet->mergeCells("E{$row}:E{$endRow}");
                    $sheet->mergeCells("F{$row}:F{$endRow}");
                    $sheet->mergeCells("G{$row}:G{$endRow}");
                    $sheet->mergeCells("H{$row}:H{$endRow}");
                }

                $sheet->setCellValue("A{$row}", $no++);
                $sheet->setCellValue("B{$row}", $item->unit ? $item->unit->code_unit : '-');
                $sheet->setCellValue("C{$row}", $item->unit ? $item->unit->model : '-');
                $sheet->setCellValue("D{$row}", $item->hm);
                $sheet->setCellValue("E{$row}", $item->loc);
                $sheet->setCellValue("F{$row}", $item->date ? Carbon::parse($item->date)->format('d-M-y') : '');
                $sheet->setCellValue("G{$row}", $item->aging);
                $sheet->setCellValue("H{$row}", $item->status);

                // Color service type (Unsch -> Orange, ACD/ANC -> Red)
                if ($item->status === 'Unsch') {
                    $sheet->getStyle("H{$row}:H{$endRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF4B084');
                } elseif (in_array($item->status, ['ANC', 'ACD'])) {
                    $sheet->getStyle("H{$row}:H{$endRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFF0000');
                    $sheet->getStyle("H{$row}:H{$endRow}")->getFont()->getColor()->setARGB('FFFFFFFF');
                }

                // Apply alignment
                $sheet->getStyle("A{$row}:H{$endRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}:H{$endRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

                // Print Tasks
                if ($taskCount > 0) {
                    $taskRow = $row;
                    foreach ($item->tasks as $task) {
                        $sheet->setCellValue("I{$taskRow}", $task->task_no);
                        $sheet->setCellValue("J{$taskRow}", $task->problem);
                        $sheet->setCellValue("K{$taskRow}", $task->task_no); // Usually repeats task no or activity prefix
                        $sheet->setCellValue("L{$taskRow}", $task->activity);
                        $sheet->setCellValue("M{$taskRow}", $item->est_finish ? Carbon::parse($item->est_finish)->format('d-M-y') : '');

                        // Remarks status coloring (Done -> white, Waiting Part -> yellow)
                        $sheet->setCellValue("N{$taskRow}", $task->status);
                        if ($task->status === 'Waiting Part' || $task->status === 'Waiting Parts') {
                            $sheet->getStyle("N{$taskRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFF00');
                        }

                        $sheet->setCellValue("O{$taskRow}", $task->remarks);
                        $sheet->setCellValue("P{$taskRow}", $task->mol);
                        $sheet->setCellValue("Q{$taskRow}", $task->pr);
                        $sheet->setCellValue("R{$taskRow}", $task->po);
                        $sheet->setCellValue("S{$taskRow}", $task->eta ? Carbon::parse($task->eta)->format('d-M-y') : '');

                        $sheet->getStyle("I{$taskRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("N{$taskRow}:O{$taskRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $taskRow++;
                    }
                }

                $row = $endRow + 1;
            }
        }

        // Add Borders
        $styleArray = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000'],
                ],
            ],
        ];
        $sheet->getStyle('A3:S'.($row - 1))->applyFromArray($styleArray);

        // Auto-size columns
        foreach (range('A', 'S') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $fileName = 'Daily_Breakdown_Status_'.now()->format('Y_m_d_His').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="'.$fileName.'"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function renameCategory(Request $request)
    {
        $request->validate([
            'old_name' => 'required|string',
            'new_name' => 'required|string',
        ]);

        $oldName = $request->old_name === 'UNSPECIFIED GROUP' ? '' : $request->old_name;

        Breakdown::where('equipment_group', $oldName)
            ->update(['equipment_group' => $request->new_name]);

        return redirect()->back()->with('success', 'Category renamed successfully');
    }
}
