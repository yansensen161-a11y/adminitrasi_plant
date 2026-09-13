<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\ToolGatePass;
use App\Models\ToolInspection;
use App\Models\ToolOrder;
use App\Models\ToolTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ToolroomController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'total' => Tool::count(),
            'available' => Tool::where('status', 'AVAILABLE')->count(),
            'borrowed' => Tool::where('status', 'BORROWED')->count(),
            'maintenance' => Tool::where('status', 'MAINTENANCE')->count(),
            'scrap' => Tool::where('status', 'SCRAP')->count(),
            'overdue' => ToolTransaction::where('status', 'BORROWED')
                ->whereNotNull('expected_return_date')
                ->where('expected_return_date', '<', now()->toDateString())
                ->count(),
        ];

        $tools = Tool::when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
            ->orWhere('tool_code', 'like', "%{$request->search}%")
            ->orWhere('brand', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->withCount('transactions')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $transactions = ToolTransaction::with('tool')
            ->when($request->trx_status, fn ($q) => $q->where('status', $request->trx_status))
            ->latest()
            ->take(50)
            ->get();

        $inspections = ToolInspection::with('tool')
            ->latest('inspection_date')
            ->take(30)
            ->get();

        $orders = \App\Models\MaintenanceOrder::with('parts')
            ->where('unit_id', 'TOOL')
            ->latest('tanggal')
            ->take(50)
            ->get();

        $gatePasses = ToolGatePass::with('tool')
            ->latest()
            ->take(50)
            ->get();

        $scrapped = Tool::where('status', 'SCRAP')->latest()->get();

        $categories = Tool::distinct()->pluck('category')->filter()->values();

        $lastAsset = Tool::where('tool_code', 'like', 'PLT-ASSET-%')
            ->orderByRaw('CAST(SUBSTRING(tool_code, 11) AS UNSIGNED) DESC')
            ->first();
            
        $nextAssetNumber = 1;
        if ($lastAsset) {
            $lastNumber = (int) str_replace('PLT-ASSET-', '', $lastAsset->tool_code);
            $nextAssetNumber = $lastNumber + 1;
        }
        $nextAssetNo = 'PLT-ASSET-' . str_pad($nextAssetNumber, 2, '0', STR_PAD_LEFT);

        return Inertia::render('Toolroom/Index', [
            'stats' => $stats,
            'tools' => $tools,
            'transactions' => $transactions,
            'inspections' => $inspections,
            'orders' => $orders,
            'gatePasses' => $gatePasses,
            'scrapped' => $scrapped,
            'categories' => $categories,
            'nextAssetNo' => $nextAssetNo,
            'filters' => $request->only(['search', 'status', 'category', 'trx_status', 'order_status']),
        ]);
    }

    // ── INVENTORY (Master Tool) ──
    public function storeTool(Request $request)
    {
        $data = $request->validate([
            'tool_code' => 'required|string|unique:tools,tool_code',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string',
            'category' => 'nullable|string',
            'specifications' => 'nullable|string',
            'location' => 'nullable|string',
            'condition' => 'required|in:GOOD,DAMAGE,SCRAP',
            'qty' => 'required|integer|min:1',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('tools', 'public');
        }

        Tool::create($data);

        return back()->with('success', 'Tool berhasil ditambahkan!');
    }

    public function updateTool(Request $request, Tool $tool)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string',
            'category' => 'nullable|string',
            'specifications' => 'nullable|string',
            'location' => 'nullable|string',
            'condition' => 'required|in:GOOD,DAMAGE,SCRAP',
            'status' => 'required|in:AVAILABLE,BORROWED,MAINTENANCE,SCRAP',
            'qty' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($tool->image) {
                Storage::disk('public')->delete($tool->image);
            }
            $data['image'] = $request->file('image')->store('tools', 'public');
        }

        $tool->update($data);

        return back()->with('success', 'Tool berhasil diupdate!');
    }

    public function scrapTool(Tool $tool)
    {
        $tool->update(['status' => 'SCRAP', 'condition' => 'SCRAP']);

        ToolInspection::create([
            'tool_id' => $tool->id,
            'inspection_date' => now()->toDateString(),
            'inspector_name' => auth()->user()->name ?? 'System',
            'condition' => 'SCRAP',
            'findings' => 'Tool di-scrap melalui sistem.',
        ]);

        return back()->with('success', 'Tool berhasil di-scrap.');
    }

    // ── PEMINJAMAN ──
    public function storeBorrow(Request $request)
    {
        $data = $request->validate([
            'tool_id' => 'required|exists:tools,id',
            'mechanic_name' => 'required|string',
            'mechanic_badge' => 'nullable|string',
            'work_order_no' => 'nullable|string',
            'borrow_date' => 'required|date',
            'expected_return_date' => 'nullable|date',
            'purpose' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $tool = Tool::findOrFail($data['tool_id']);
        if ($tool->status !== 'AVAILABLE') {
            return back()->withErrors(['tool_id' => 'Tool tidak tersedia untuk dipinjam.']);
        }

        $code = 'BRW-'.now()->format('Ymd').'-'.str_pad(ToolTransaction::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        ToolTransaction::create(array_merge($data, [
            'transaction_code' => $code,
            'status' => 'BORROWED',
        ]));

        $tool->update(['status' => 'BORROWED']);

        return back()->with('success', "Tool dipinjam — $code");
    }

    public function returnTool(Request $request, ToolTransaction $transaction)
    {
        $data = $request->validate([
            'return_date' => 'required|date',
            'returned_condition' => 'required|in:GOOD,DAMAGE',
            'notes' => 'nullable|string',
        ]);

        $transaction->update(array_merge($data, ['status' => 'RETURNED']));

        $newCondition = $data['returned_condition'] === 'DAMAGE' ? 'DAMAGE' : 'GOOD';
        $transaction->tool->update([
            'status' => 'AVAILABLE',
            'condition' => $newCondition,
        ]);

        return back()->with('success', 'Tool berhasil dikembalikan.');
    }

    // ── INSPEKSI ──
    public function storeInspection(Request $request)
    {
        $data = $request->validate([
            'tool_id' => 'required|exists:tools,id',
            'inspection_date' => 'required|date',
            'inspector_name' => 'required|string',
            'condition' => 'required|in:GOOD,DAMAGE,SCRAP',
            'calibration_status' => 'nullable|string',
            'calibration_due_date' => 'nullable|date',
            'findings' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('inspections', 'public');
        }

        ToolInspection::create($data);

        $tool = Tool::findOrFail($data['tool_id']);
        $tool->update(['condition' => $data['condition']]);
        if ($data['condition'] === 'SCRAP') {
            $tool->update(['status' => 'SCRAP']);
        }

        return back()->with('success', 'Inspeksi berhasil disimpan.');
    }

    // ── ORDERAN ──
    public function storeOrder(Request $request)
    {
        $data = $request->validate([
            'tool_name' => 'required|string',
            'brand' => 'nullable|string',
            'specifications' => 'nullable|string',
            'qty_requested' => 'required|integer|min:1',
            'unit' => 'nullable|string',
            'estimated_price' => 'nullable|numeric',
            'pr_number' => 'nullable|string',
            'vendor' => 'nullable|string',
            'request_date' => 'required|date',
            'eta_date' => 'nullable|date',
            'requested_by' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $order_number = 'PO-TOOL-'.now()->format('Ymd').'-'.str_pad(ToolOrder::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        ToolOrder::create(array_merge($data, [
            'order_number' => $order_number,
            'status' => 'REQUESTED',
        ]));

        return back()->with('success', "Order tool berhasil dibuat — $order_number");
    }

    public function updateOrderStatus(Request $request, ToolOrder $order)
    {
        $data = $request->validate([
            'status' => 'required|in:DRAFT,REQUESTED,APPROVED,ORDERED,RECEIVED,CANCELLED',
            'po_number' => 'nullable|string',
            'qty_received' => 'nullable|integer',
            'received_date' => 'nullable|date',
            'approved_by' => 'nullable|string',
        ]);

        $order->update($data);

        if ($data['status'] === 'RECEIVED' && ($data['qty_received'] ?? 0) > 0) {
            Tool::create([
                'tool_code' => 'TL-'.now()->format('YmdHis'),
                'name' => $order->tool_name,
                'brand' => $order->brand,
                'specifications' => $order->specifications,
                'qty' => $data['qty_received'],
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'notes' => "Diterima dari order {$order->order_number}",
            ]);
        }

        return back()->with('success', 'Status order diperbarui.');
    }

    // ── GATE PASS ──
    public function storeGatePass(Request $request)
    {
        $data = $request->validate([
            'tool_id' => 'required|exists:tools,id',
            'type' => 'required|in:OUT,IN',
            'date' => 'required|date',
            'pic' => 'required|string',
            'destination' => 'nullable|string',
            'reason' => 'required|string',
            'return_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $pass_number = 'GP-'.now()->format('Ymd').'-'.str_pad(ToolGatePass::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        ToolGatePass::create(array_merge($data, [
            'pass_number' => $pass_number,
            'status' => 'APPROVED',
        ]));

        return back()->with('success', "Gate Pass dibuat — $pass_number");
    }
}
