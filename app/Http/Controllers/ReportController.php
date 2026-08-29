<?php

namespace App\Http\Controllers;

use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function usersPdf()
    {
        $users = User::with('roles')->latest()->get();

        $data = [
            'title' => 'Laporan Pengguna & Hak Akses Sistem Plant',
            'users' => $users,
            'generatedAt' => now()->translatedFormat('d F Y - H:i:s'),
            'totalUsers' => $users->count(),
        ];

        $pdf = Pdf::loadView('pdf.users-report', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->download('Users_Report_'.date('Ymd_His').'.pdf');
    }
}
