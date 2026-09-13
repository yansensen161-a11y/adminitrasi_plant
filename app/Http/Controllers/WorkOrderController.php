<?php

namespace App\Http\Controllers;

use App\Exports\WorkOrderExport;
use App\Imports\WorkOrderImport;
use App\Models\Tool;
use App\Models\Unit;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use App\Services\WorkOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        $breakdowns = WorkOrder::with('unit')->where('tipe_wo', 'BREAKDOWN')->latest()->paginate(10);
        $schedules = WorkOrder::with('unit')->where('tipe_wo', 'SCHEDULE')->latest()->paginate(10);

        $breakdownKpi = [
            'total_wo' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->count(),
            'open' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'OPEN')->count(),
            'process' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'PROCESS')->count(),
            'waiting_part' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'WAITING PART')->count(),
            'completed' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'COMPLETED')->count(),
        ];

        $planServiceKpi = [
            'total_plan_service' => WorkOrder::where('tipe_wo', 'SCHEDULE')->count(),
            'due_service' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where('status_wo', 'DUE SERVICE')->count(),
            'upcoming_service' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where('status_wo', 'UPCOMING SERVICE')->count(),
            'on_schedule' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where('status_wo', 'ON SCHEDULE')->count(),
        ];

        return Inertia::render('WorkOrder/Index', [
            'breakdown' => [
                'kpi' => $breakdownKpi,
                'data' => $breakdowns,
            ],
            'planService' => [
                'kpi' => $planServiceKpi,
                'data' => $schedules,
            ],
            'monitoringPlan' => Unit::with(['lastService', 'nextService'])->get(),
        ]);
    }

    public function create()
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')->get();

        // Fetch manpowers (currently hardcoded based on ManpowerController)
        $manpowers = [
            ['id' => 1, 'nama' => 'YANSEN', 'bagian' => 'PLANNER', 'nrp' => 'PLN-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '01/03/2023', 'kontak' => '0812-3456-7890', 'ktp' => '64710101010001', 'bpjs_kes' => '0002757687085', 'bpjs_ket' => '19012345678', 'rekening' => '7888010123456789', 'alamat' => 'Jl. Poros Samarinda - Bontang KM 12, Samarinda, Kaltim'],
            ['id' => 2, 'nama' => 'BUDI SANTOSO', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '15/02/2021', 'kontak' => '0813-4567-8901', 'ktp' => '6471011502010002', 'bpjs_kes' => '0002757687086', 'bpjs_ket' => '19012345679', 'rekening' => '7888010123456790', 'alamat' => 'Jl. Mulawarman No.45, Samarinda, Kaltim'],
            ['id' => 3, 'nama' => 'ANDI PRATAMA', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '10/07/2021', 'kontak' => '0813-5678-9012', 'ktp' => '6471011007210003', 'bpjs_kes' => '0002757687087', 'bpjs_ket' => '19012345680', 'rekening' => '7888010123456791', 'alamat' => 'Jl. Aw Syahranie No.12, Samarinda, Kaltim'],
            ['id' => 4, 'nama' => 'CANDRA WIJAYA', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-003', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '05/08/2021', 'kontak' => '0813-6789-0123', 'ktp' => '6471010508210004', 'bpjs_kes' => '0002757687088', 'bpjs_ket' => '19012345681', 'rekening' => '7888010123456792', 'alamat' => 'Jl. DI Panjaitan No.8, Samarinda, Kaltim'],
            ['id' => 5, 'nama' => 'DEDI KURNIAWAN', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-004', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '12/09/2021', 'kontak' => '0813-7890-1234', 'ktp' => '6471011209210005', 'bpjs_kes' => '0002757687089', 'bpjs_ket' => '19012345682', 'rekening' => '7888010123456793', 'alamat' => 'Jl. MT Haryono No.77, Samarinda, Kaltim'],
            ['id' => 6, 'nama' => 'EKO SETIAWAN', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-005', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '20/10/2021', 'kontak' => '0813-8901-2345', 'ktp' => '6471012010210006', 'bpjs_kes' => '0002757687090', 'bpjs_ket' => '19012345683', 'rekening' => '7888010123456794', 'alamat' => 'Jl. KH Wahid Hasyim No.23, Samarinda, Kaltim'],
            ['id' => 7, 'nama' => 'GILANG RAMADHAN', 'bagian' => 'ELEKTRIKAL', 'nrp' => 'ELC-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '02/01/2022', 'kontak' => '0812-9012-3456', 'ktp' => '6471010201220007', 'bpjs_kes' => '0002757687091', 'bpjs_ket' => '19012345684', 'rekening' => '7888010123456795', 'alamat' => 'Jl. Imam Bonjol No.15, Samarinda, Kaltim'],
            ['id' => 8, 'nama' => 'HERI SUSANTO', 'bagian' => 'ELEKTRIKAL', 'nrp' => 'ELC-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '18/03/2022', 'kontak' => '0812-0123-4567', 'ktp' => '6471011803220008', 'bpjs_kes' => '0002757687092', 'bpjs_ket' => '19012345685', 'rekening' => '7888010123456796', 'alamat' => 'Jl. Pangeran Suryanata No.21, Samarinda, Kaltim'],
            ['id' => 9, 'nama' => 'RUDI HERMAWAN', 'bagian' => 'TYRE', 'nrp' => 'TYR-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '25/04/2022', 'kontak' => '0812-1234-5678', 'ktp' => '6471012504220009', 'bpjs_kes' => '0002757687093', 'bpjs_ket' => '19012345686', 'rekening' => '7888010123456797', 'alamat' => 'Jl. Sepinggan Baru No.5, Samarinda, Kaltim'],
            ['id' => 10, 'nama' => 'FAJAR NUGROHO', 'bagian' => 'SUPPORT', 'nrp' => 'HLR-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Lokal', 'doh' => '15/05/2022', 'kontak' => '0812-2345-6789', 'ktp' => '6471011505220010', 'bpjs_kes' => '0002757687094', 'bpjs_ket' => '19012345687', 'rekening' => '7888010123456798', 'alamat' => 'Jl. Gerilya No.19, Samarinda, Kaltim'],
            ['id' => 11, 'nama' => 'SITI AISYAH', 'bagian' => 'ADMIN PLANT', 'nrp' => 'ADM-001', 'jenis_kelamin' => 'P', 'lokasi' => 'Lokal', 'doh' => '01/06/2022', 'kontak' => '0812-3456-7891', 'ktp' => '6471010106220011', 'bpjs_kes' => '0002757687095', 'bpjs_ket' => '19012345688', 'rekening' => '7888010123456799', 'alamat' => 'Jl. Siradj Salman No.2, Samarinda, Kaltim'],
            ['id' => 12, 'nama' => 'MUHAMMAD IQBAL', 'bagian' => 'MEKANIK', 'nrp' => 'MEK-006', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '10/06/2022', 'kontak' => '0821-3456-7890', 'ktp' => '6471021006220012', 'bpjs_kes' => '0002037687096', 'bpjs_ket' => '19012345689', 'rekening' => '7888010123456800', 'alamat' => 'Jl. Trans Kalimantan KM 8, Kutai Kartanegara, Kaltim'],
            ['id' => 13, 'nama' => 'SUPRIYANTO', 'bagian' => 'ELEKTRIKAL', 'nrp' => 'ELC-003', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '22/07/2022', 'kontak' => '0821-4567-8901', 'ktp' => '6471022207220013', 'bpjs_kes' => '0002027687097', 'bpjs_ket' => '19012345690', 'rekening' => '7888010123456801', 'alamat' => 'Jl. Poros Bontang - Sangatta KM 15, Kutai Timur, Kaltim'],
            ['id' => 14, 'nama' => 'NURHALIM', 'bagian' => 'TYRE', 'nrp' => 'TYR-002', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '05/09/2022', 'kontak' => '0821-5678-9012', 'ktp' => '6471020509220014', 'bpjs_kes' => '0002027687098', 'bpjs_ket' => '19012345691', 'rekening' => '7888010123456802', 'alamat' => 'Jl. Poros Melak - Long Iram, Kubar, Kaltim'],
            ['id' => 15, 'nama' => 'AGUS SETIAWAN', 'bagian' => 'SUPPORT', 'nrp' => 'SUP-001', 'jenis_kelamin' => 'L', 'lokasi' => 'Non Lokal', 'doh' => '17/10/2022', 'kontak' => '0821-6789-0123', 'ktp' => '6471021710220015', 'bpjs_kes' => '0002027687099', 'bpjs_ket' => '19012345692', 'rekening' => '7888010123456803', 'alamat' => 'Jl. Poros Sendawar KM 6, Kutai Barat, Kaltim'],
        ];

        $tools = Tool::where('status', 'AVAILABLE')->get();

        return Inertia::render('WorkOrder/Create', [
            'units' => $units,
            'manpowers' => $manpowers,
            'tools' => $tools,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tipe_wo' => 'required|in:BREAKDOWN,SCHEDULE,PREVENTIVE,CORRECTIVE',
            'unit_id' => 'required|exists:units,id',
            'status_wo' => 'required|string|max:50',
            'downtime_code' => 'nullable|string|max:50',
            'site' => 'nullable|string|max:100',
            'waktu_breakdown' => 'nullable|date',
            'waktu_rfu' => 'nullable|date|after_or_equal:waktu_breakdown',
            'durasi_hrs' => 'nullable|numeric|min:0|max:9999',
            'hm_unit' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string|max:2000',
            'problem' => 'nullable|string|max:2000',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,CRITICAL',
            'request_date' => 'nullable|date',
            'tasks' => 'nullable|array|max:100',
            'tasks.*.group_component' => 'nullable|string|max:255',
            'tasks.*.component' => 'nullable|string|max:255',
            'tasks.*.task_description' => 'nullable|string|max:1000',
            'tasks.*.mechanic' => 'nullable|string|max:255',
            'tasks.*.tools' => 'nullable',
        ]);

        try {
            $wo = WorkOrderService::createWorkOrder([
                'tipe_wo' => $request->tipe_wo,
                'downtime_code' => $request->downtime_code,
                'site' => $request->site,
                'unit_id' => $request->unit_id,
                'waktu_breakdown' => $request->waktu_breakdown,
                'waktu_rfu' => $request->waktu_rfu,
                'durasi_hrs' => $request->durasi_hrs,
                'hm_unit' => $request->hm_unit,
                'status_wo' => $request->status_wo,
                'keterangan' => $request->keterangan,
                'priority' => $request->priority ?? 'MEDIUM',
                'request_date' => $request->request_date ?? now(),
                'request_by' => auth()->user()->name ?? 'System',
                'problem' => $request->problem,
            ]);

            if ($request->tasks && is_array($request->tasks)) {
                foreach ($request->tasks as $task) {
                    WorkOrderTask::create([
                        'work_order_id' => $wo->id,
                        'group_component' => $task['group_component'] ?? '',
                        'component' => $task['component'] ?? '',
                        'task_description' => $task['task_description'] ?? '',
                        'mechanic' => $task['mechanic'] ?? '',
                        'tools' => isset($task['tools']) ? (is_array($task['tools']) ? implode(', ', $task['tools']) : $task['tools']) : null,
                    ]);
                }
            }

            return redirect()->route('work-orders.index')->with('success', 'Work Order ('.$wo->no_wo.') berhasil dibuat.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal membuat Work Order: '.$e->getMessage());
        }
    }

    public function show($id)
    {
        $wo = WorkOrder::with([
            'unit',
            'breakdownDetails',
            'parts',
            'manpowers',
            'vendors',
            'warranties',
            'statusHistories',
            'tasks',
        ])->findOrFail($id);

        return Inertia::render('WorkOrder/Show', [
            'workOrder' => $wo,
        ]);
    }

    public function exportExcel()
    {
        return Excel::download(new WorkOrderExport, 'work_orders_'.date('Ymd').'.xlsx');
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv',
        ]);

        try {
            Excel::import(new WorkOrderImport, $request->file('file'));

            return back()->with('success', 'Data berhasil diimport.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: '.$e->getMessage());
        }
    }
}
