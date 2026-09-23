<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckWriteAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Jika request hanya membaca data (GET, HEAD, OPTIONS), izinkan.
        if ($request->isMethod('GET') || $request->isMethod('HEAD') || $request->isMethod('OPTIONS')) {
            return $next($request);
        }

        // Jika user belum login, biarkan auth middleware yang menangani.
        if (! auth()->check()) {
            return $next($request);
        }

        // Daftar role yang memiliki hak write (CRUD) ke semua modul master/transaksi
        $allowedRoles = ['super-admin', 'admin', 'planner'];

        $user = auth()->user();

        // Modul-modul tertentu mungkin memiliki role khusus (contoh: mekanik hanya boleh mengedit tiket mekanik)
        // Tetapi untuk saat ini kita kunci semuanya jika bukan admin/planner.
        if (! $user->hasAnyRole($allowedRoles)) {
            // Daftar pengecualian rute yang boleh POST/PUT oleh user biasa
            $excepts = [
                'logout',
                'profile.update',
                'profile.destroy',
                'password.update',
            ];

            foreach ($excepts as $route) {
                if ($request->routeIs($route)) {
                    return $next($request);
                }
            }

            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk melakukan aksi ini (Hanya Super-Admin, Admin, atau Planner yang diizinkan).');
        }

        return $next($request);
    }
}
