<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceOrderController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $unitId = $request->input('unit_id', '');
        $department = $request->input('department', '');

        $query = ServiceOrder::with('unit')->orderBy('tanggal', 'desc');

        if ($dateFrom) {
            $query->whereDate('tanggal', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('tanggal', '<=', $dateTo);
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($department) {
            $query->where('department', $department);
        }

        $orders = $query->paginate(20)->withQueryString();

        // Ambil semua unit untuk dropdown
        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('ServiceOrder/Index', [
            'orders' => $orders,
            'units' => $units,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'unit_id' => $unitId,
                'department' => $department,
            ],
        ]);
    }

    public function storeBulk(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menyimpan service order.');

        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'orders' => 'required|array|min:1',
            'orders.*.tanggal' => 'required|date',
            'orders.*.lokasi' => 'nullable|string',
            'orders.*.department' => 'nullable|string',
            'orders.*.priority' => 'nullable|string',
            'orders.*.status' => 'nullable|string',
        ]);

        $unitId = $request->unit_id;
        $ordersData = $request->orders;

        DB::beginTransaction();
        try {
            $latestSo = ServiceOrder::orderBy('no_so', 'desc')->first();
            $nextSequence = 1;

            if ($latestSo && preg_match('/SO-\d{4}-\d{4}-(\d{3})/', $latestSo->no_so, $matches)) {
                $nextSequence = (int) $matches[1] + 1;
            }

            foreach ($ordersData as $index => $data) {
                // Generate a unique No SO
                $datePart = date('Y-md', strtotime($data['tanggal']));
                $noSo = 'SO-'.$datePart.'-'.str_pad($nextSequence + $index, 3, '0', STR_PAD_LEFT);

                ServiceOrder::create([
                    'no_so' => $noSo,
                    'tanggal' => $data['tanggal'],
                    'unit_id' => $unitId,
                    'lokasi' => $data['lokasi'] ?? '-',
                    'department' => $data['department'] ?? '-',
                    'priority' => $data['priority'] ?? 'BACKLOG',
                    'status' => $data['status'] ?? 'WAITING PART',
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', count($ordersData).' data historis berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Gagal menyimpan data: '.$e->getMessage());
        }
    }

    public function update(Request $request, ServiceOrder $service_order)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah service order.');

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'required|exists:units,id',
            'lokasi' => 'nullable|string',
            'department' => 'nullable|string',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $service_order->update([
            'tanggal' => $request->tanggal,
            'unit_id' => $request->unit_id,
            'lokasi' => $request->lokasi ?? '-',
            'department' => $request->department ?? '-',
            'priority' => $request->priority ?? 'BACKLOG',
            'status' => $request->status ?? 'WAITING PART',
        ]);

        return redirect()->back()->with('success', 'Data historis berhasil diperbarui.');
    }

    public function destroy(ServiceOrder $service_order)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus service order.');

        $service_order->delete();

        return redirect()->back()->with('success', 'Data historis berhasil dihapus.');
    }
}
