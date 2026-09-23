<?php

namespace App\Http\Controllers;

use App\Models\Breakdown;
use App\Models\MaintenanceOrder;
use App\Models\Unit;
use App\Services\WorkOrderService;
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
    public function daily(Request $request)
    {
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $codeUnit = $request->input('code_unit', '');
        $status = $request->input('status', '');

        // Existing data for available units
        $units = Unit::select('id', 'code_unit', 'model')->get();

        // --- MOCK DATA FOR NEW FAR DASHBOARD ---
        $farKpi = [
            'total_kasus' => ['count' => 124, 'trend' => '+12%'],
            'unit_terdampak' => ['count' => 56, 'pct' => '45.2%'],
            'total_downtime' => ['count' => '1,842', 'rata' => '14.9'],
            'closed_case' => ['count' => 98, 'pct' => '79.0%'],
        ];

        $chartKategori = [
            ['name' => 'Engine', 'value' => 28, 'pct' => '22.6%', 'color' => '#3b82f6'],
            ['name' => 'Hydraulic', 'value' => 32, 'pct' => '25.8%', 'color' => '#10b981'],
            ['name' => 'Electrical', 'value' => 18, 'pct' => '14.5%', 'color' => '#facc15'],
            ['name' => 'Undercarriage', 'value' => 20, 'pct' => '16.1%', 'color' => '#ef4444'],
            ['name' => 'Transmission', 'value' => 14, 'pct' => '11.3%', 'color' => '#a855f7'],
            ['name' => 'Others', 'value' => 12, 'pct' => '9.7%', 'color' => '#6b7280'],
        ];

        $chartPenyebab = [
            ['name' => '1. Wear & Tear', 'value' => 32, 'pct' => '25.8%', 'color' => '#0ea5e9'],
            ['name' => '2. Contamination', 'value' => 24, 'pct' => '19.4%', 'color' => '#10b981'],
            ['name' => '3. Overload', 'value' => 18, 'pct' => '14.5%', 'color' => '#facc15'],
            ['name' => '4. Improper Operation', 'value' => 16, 'pct' => '12.9%', 'color' => '#ef4444'],
            ['name' => '5. Poor Maintenance', 'value' => 14, 'pct' => '11.3%', 'color' => '#8b5cf6'],
        ];

        $chartTrend = [
            'labels' => ['Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026', 'Agu 2026', 'Sep 2026'],
            'kasus' => [18, 22, 20, 26, 25, 31],
            'downtime' => [150, 180, 160, 210, 200, 260],
        ];

        $farTable = [
            ['id' => 1, 'tanggal' => '03/09/2026', 'kode_unit' => 'EX-056', 'equipment' => 'Excavator', 'komponen' => 'Hydraulic Pump', 'deskripsi' => 'Pump tidak bekerja normal', 'penyebab' => 'Contamination', 'downtime' => 18.0, 'biaya' => '125,000,000', 'status' => 'Open'],
            ['id' => 2, 'tanggal' => '31/08/2026', 'kode_unit' => 'HD785-12', 'equipment' => 'Hauler', 'komponen' => 'Engine', 'deskripsi' => 'Overheat saat operasi', 'penyebab' => 'Overload', 'downtime' => 26.5, 'biaya' => '480,000,000', 'status' => 'In Progress'],
            ['id' => 3, 'tanggal' => '28/08/2026', 'kode_unit' => 'GD655-01', 'equipment' => 'Motor Grader', 'komponen' => 'Circle Bearing', 'deskripsi' => 'Bunyi abnormal saat jalan', 'penyebab' => 'Wear & Tear', 'downtime' => 12.0, 'biaya' => '95,000,000', 'status' => 'Closed'],
            ['id' => 4, 'tanggal' => '25/08/2026', 'kode_unit' => 'D85-01', 'equipment' => 'Dozer', 'komponen' => 'Final Drive', 'deskripsi' => 'Kebocoran oli seal', 'penyebab' => 'Wear & Tear', 'downtime' => 16.5, 'biaya' => '210,000,000', 'status' => 'Closed'],
            ['id' => 5, 'tanggal' => '21/08/2026', 'kode_unit' => 'TRK-01', 'equipment' => 'Water Truck', 'komponen' => 'Water Pump', 'deskripsi' => 'Pump tidak menghisap', 'penyebab' => 'Contamination', 'downtime' => 8.0, 'biaya' => '48,000,000', 'status' => 'Closed'],
            ['id' => 6, 'tanggal' => '18/08/2026', 'kode_unit' => 'SV-01', 'equipment' => 'Service Truck', 'komponen' => 'Alternator', 'deskripsi' => 'Tidak ada charging', 'penyebab' => 'Electrical Failure', 'downtime' => 6.5, 'biaya' => '32,500,000', 'status' => 'Closed'],
            ['id' => 7, 'tanggal' => '15/08/2026', 'kode_unit' => 'LT-01', 'equipment' => 'Tower Lamp', 'komponen' => 'Generator Set', 'deskripsi' => 'Tidak bisa start', 'penyebab' => 'Fuel System', 'downtime' => 4.0, 'biaya' => '18,000,000', 'status' => 'Closed'],
            ['id' => 8, 'tanggal' => '12/08/2026', 'kode_unit' => 'CM-01', 'equipment' => 'Compactor', 'komponen' => 'Vibration Motor', 'deskripsi' => 'Getaran tidak normal', 'penyebab' => 'Wear & Tear', 'downtime' => 14.0, 'biaya' => '165,000,000', 'status' => 'In Progress'],
            ['id' => 9, 'tanggal' => '10/08/2026', 'kode_unit' => 'MAN-01', 'equipment' => 'Manitou', 'komponen' => 'Boom Cylinder', 'deskripsi' => 'Kebocoran oli seal', 'penyebab' => 'Seal Failure', 'downtime' => 10.5, 'biaya' => '72,000,000', 'status' => 'Closed'],
            ['id' => 10, 'tanggal' => '05/08/2026', 'kode_unit' => 'EX-057', 'equipment' => 'Excavator', 'komponen' => 'Swing Bearing', 'deskripsi' => 'Bunyi kasar saat swing', 'penyebab' => 'Lubrication Failure', 'downtime' => 22.0, 'biaya' => '320,000,000', 'status' => 'Open'],
        ];
        // ---------------------------------------

        return Inertia::render('Breakdown/Daily', [
            'availableUnits' => $units,
            'farKpi' => $farKpi,
            'chartKategori' => $chartKategori,
            'chartPenyebab' => $chartPenyebab,
            'chartTrend' => $chartTrend,
            'farTable' => $farTable,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'code_unit' => $codeUnit,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'equipment_group' => 'required|string',
            'date' => 'nullable|date',
            'loc' => 'nullable|string',
            'hm' => 'nullable|string',
            'est_finish' => 'nullable|date',
            'aging' => 'nullable|integer',
            'status' => 'nullable|string',
            'tasks' => 'nullable|array',
        ]);

        // Auto-generate CMMS Master Work Order
        $wo = WorkOrderService::createWorkOrder([
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $validated['unit_id'],
            'hm_unit' => $validated['hm'],
            'location' => $validated['loc'],
            'priority' => 'HIGH',
            'status_wo' => 'OPEN',
            'failure_description' => isset($validated['tasks'][0]['problem']) ? substr($validated['tasks'][0]['problem'], 0, 255) : null,
            'request_by' => auth()->user()->name ?? 'System',
            'request_date' => $validated['date'] ?? now(),
        ], [
            'trouble_date' => $validated['date'] ?? now(),
            'breakdown_start' => $validated['date'] ?? now(),
        ]);

        // Support existing breakdown table structure
        $validated['maintenance_order_id'] = $wo->id;
        $breakdown = Breakdown::create($validated);

        if (! empty($validated['tasks'])) {
            foreach ($validated['tasks'] as $taskData) {
                $breakdown->tasks()->create($taskData);
            }
        }

        return redirect()->back()->with('success', 'Breakdown and Work Order ('.$wo->no_wo.') created successfully');
    }

    public function update(Request $request, Breakdown $breakdown)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'equipment_group' => 'required|string',
            'date' => 'nullable|date',
            'loc' => 'nullable|string',
            'hm' => 'nullable|string',
            'est_finish' => 'nullable|date',
            'aging' => 'nullable|integer',
            'status' => 'nullable|string',
            'tasks' => 'nullable|array',
        ]);

        if ($breakdown->maintenance_order_id) {
            MaintenanceOrder::where('id', $breakdown->maintenance_order_id)->update([
                'tanggal' => $validated['date'] ?? $breakdown->date,
                'unit_id' => $validated['unit_id'],
                'hm' => $validated['hm'],
                'lokasi' => $validated['loc'],
                'failure_code' => isset($validated['tasks'][0]['problem']) ? substr($validated['tasks'][0]['problem'], 0, 255) : null,
            ]);
        }

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
        $woId = $breakdown->maintenance_order_id;
        $breakdown->delete();

        if ($woId) {
            MaintenanceOrder::where('id', $woId)->delete();
        }

        return redirect()->back()->with('success', 'Breakdown and Work Order deleted successfully');
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
