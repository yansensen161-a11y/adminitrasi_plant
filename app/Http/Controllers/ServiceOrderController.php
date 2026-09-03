<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceOrder::with('unit')->latest('tanggal');

        // Stats
        $stats = [
            'total' => ServiceOrder::count(),
            'open' => ServiceOrder::where('status', 'OPEN')->count(),
            'process' => ServiceOrder::where('status', 'PROCESS')->count(),
            'closed' => ServiceOrder::where('status', 'CLOSED')->count(),
            'cancel' => ServiceOrder::where('status', 'CANCEL')->count(),
        ];

        // Pagination
        $orders = $query->paginate(10);

        return Inertia::render('ServiceOrder/Index', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }
}
