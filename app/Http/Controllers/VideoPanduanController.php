<?php

namespace App\Http\Controllers;

use App\Models\Manpower;
use App\Models\NavigationMenu;
use App\Models\Setting;
use App\Models\Unit;
use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VideoPanduanController extends Controller
{
    /**
     * Display the Video Panduan & Penjelasan Sistem page.
     */
    public function index(Request $request): Response
    {
        $videoUrl = Setting::where('key', 'video_panduan_url')->value('value') ?? '';

        // System metrics for the overview & official letter
        $stats = [
            'total_units' => Unit::count(),
            'total_work_orders' => WorkOrder::count(),
            'total_manpower' => Manpower::count(),
            'total_menus' => NavigationMenu::where('is_active', true)->count(),
        ];

        // Group active navigation menus for the system catalog tab
        $menuCatalog = NavigationMenu::with(['subMenus' => function ($q) {
            $q->where('is_active', true)->orderBy('order', 'asc');
        }])
            ->root()
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        return Inertia::render('Documentation/VideoPanduan', [
            'customVideoUrl' => $videoUrl,
            'stats' => $stats,
            'menuCatalog' => $menuCatalog,
        ]);
    }

    /**
     * Update custom external video URL if provided.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'video_panduan_url' => ['nullable', 'string', 'max:500'],
        ]);

        Setting::updateOrCreate(
            ['key' => 'video_panduan_url'],
            ['value' => $validated['video_panduan_url'] ?? '']
        );

        return redirect()->back()->with('success', 'URL video panduan berhasil disimpan.');
    }

    /**
     * Download Surat Penjelasan & Berita Acara as official PDF.
     */
    public function downloadSuratPdf(): HttpResponse
    {
        $pdf = Pdf::loadView('pdf.surat-penjelasan-sistem');
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('Surat_Penjelasan_Plant_System_042_2026.pdf');
    }

    /**
     * Download Surat Penjelasan as editable Microsoft Word document (.doc).
     */
    public function downloadSuratDoc(): HttpResponse
    {
        $html = view('pdf.surat-penjelasan-sistem')->render();

        return response($html, 200, [
            'Content-Type' => 'application/msword; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Surat_Penjelasan_Plant_System_042_2026.doc"',
        ]);
    }

    /**
     * Download Buku Panduan & SOP Sistem User Manual as PDF.
     */
    public function downloadPanduanPdf(): HttpResponse
    {
        $pdf = Pdf::loadView('pdf.buku-panduan-sistem');
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('Buku_Panduan_User_Manual_Plant_System.pdf');
    }

    /**
     * Download Direktori Matriks Menu as CSV / Excel format.
     */
    public function downloadKatalogCsv(): StreamedResponse
    {
        $menus = NavigationMenu::with(['subMenus' => function ($q) {
            $q->orderBy('order', 'asc');
        }])
            ->root()
            ->orderBy('order', 'asc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Katalog_Menu_Plant_System_2026.csv"',
        ];

        return response()->stream(function () use ($menus) {
            $handle = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['No', 'Kategori Modul', 'Nama Menu', 'Tipe', 'Rute URL', 'Ikon', 'Badge', 'Status']);

            $no = 1;
            foreach ($menus as $m) {
                if ($m->subMenus && $m->subMenus->count() > 0) {
                    foreach ($m->subMenus as $sub) {
                        fputcsv($handle, [
                            $no++,
                            $m->section_label ?: 'MODUL UMUM',
                            $sub->name,
                            'Sub Menu (Parent: '.$m->name.')',
                            $sub->href,
                            $sub->icon_key ?: '-',
                            $sub->badge ?: '-',
                            $sub->is_active ? 'AKTIF' : 'NON-AKTIF',
                        ]);
                    }
                } else {
                    fputcsv($handle, [
                        $no++,
                        $m->section_label ?: 'MODUL UMUM',
                        $m->name,
                        'Menu Utama',
                        $m->href,
                        $m->icon_key ?: '-',
                        $m->badge ?: '-',
                        $m->is_active ? 'AKTIF' : 'NON-AKTIF',
                    ]);
                }
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Download Transkrip Narasi Video Panduan as plain text.
     */
    public function downloadTranskripTxt(): HttpResponse
    {
        $transcript = "TRANSKRIP LENGKAP NARASI VIDEO PANDUAN SISTEM PLANT MAINTENANCE\n";
        $transcript .= "====================================================================\n";
        $transcript .= "Site Operation Plant & Engineering Division\n";
        $transcript .= "Tanggal Rilis: 26 September 2026\n\n";

        $chapters = [
            'BAB 01: Halaman Login & Keamanan Akses (00:00 - 01:15)' => 'Selamat datang di Sistem Plant Maintenance. Pada modul pertama, proses diawali dari Halaman Login resmi. Sistem menerapkan enkripsi session, proteksi brute-force, CSRF tokens, dan sistem Role-Based Access Control (RBAC). Pengguna memasukkan email dan kata sandi terdaftar untuk diarahkan secara otomatis ke portal kerja sesuai level otoritas masing-masing (Super Admin, Planner, Mekanik, Foreman, Toolkeeper, atau HR).',
            'BAB 02: Maintenance Control & Work Orders (01:15 - 02:45)' => 'Setelah login, pengguna langsung memasuki Work Order Hub. Di sini seluruh tiket perbaikan unit alat berat dimonitor secara real-time. Terdapat tab Monitoring Breakdown harian untuk melacak unit Breakdown, Waiting Part, Waiting Manpower, dan On Progress. Tersedia pula fitur unduh/unggah template Excel massal serta tab Historical WO Closed untuk melihat jejak rekam perbaikan masa lalu.',
            'BAB 03: Monitoring Orderan & Part Order Lifetime (02:45 - 04:10)' => 'Modul Monitoring Orderan dan Part Lifetime berfungsi memantau pengadaan suku cadang secara detail mulai dari PR (Purchase Requisition), PO (Purchase Order), hingga barang diterima di gudang site. Fitur Part Lifetime secara cerdas menghitung sisa umur pakai komponen terpasang dan memberikan indikator peringatan sebelum komponen mengalami keausan batas kritis.',
            'BAB 04: Preventive Maintenance (PM Forecast & P2H) (04:10 - 05:40)' => 'Pada menu Preventive Maintenance, sistem mengotomatiskan jadwal servis rutin berkala (PS 250, 500, 1000, hingga 2000 Jam). Terintegrasi dengan Hour Meter (HM) terkini, sistem memproyeksikan tanggal jatuh tempo servis. Disertai modul Plan Inspeksi Hauler & Dump Truck, serta Inspeksi Harian P2H keliling untuk pencegahan kerusakan dini.',
            'BAB 05: Tire Operations & TyreVault 3D Dashboard (05:40 - 07:15)' => 'Menu TyreVault menyajikan inovasi visual sasis 3D interaktif untuk seluruh armada ban (Dump Truck & Hauler). Pengguna dapat melihat posisi ban (Posisi 1 hingga 6), mengecek riwayat rotasi ban, monitoring tekanan udara (PSI), ketebalan alur tapak (Remaining Tread Depth), serta histori penggantian ban langsung pada model sasis 3D.',
            'BAB 06: Operational Forms & Standar HSE (07:15 - 08:35)' => 'Menu Formulir Operasional memusatkan seluruh form standar tambang sesuai standar keselamatan kerja HSE. Mencakup Portal Form JSA (Job Safety Analysis MAM-HSE-FORM-028), Form Penundaan Service, Form Servis OHT 773, Dump Truck, Dozer, Motorgrader, Genset, Washing Unit, hingga Surat Permintaan Komponen (SPK) dengan kemampuan cetak blanko PDF.',
            'BAB 07: Toolroom & Special Service Tools (SST) (08:35 - 09:50)' => 'Menu Toolroom mengelola inventaris ratusan alat kerja mekanik dan Special Service Tools (SST). Sistem mencatat peminjaman dan pengembalian alat secara real-time berdasarkan NRP mekanik, status kalibrasi alat ukur presisi, laporan alat rusak atau scrap, serta penerbitan Gate Pass Tool untuk alat yang dibawa keluar area workshop.',
            'BAB 08: Master Data, Populasi Unit & Gatepass Unit (09:50 - 11:10)' => 'Modul Populasi Unit dan Master Data merupakan tulang punggung aset operasional. Memuat direktori lengkap armada alat berat, nomor model, serial number mesin, status kepemilikan, dan riwayat HM. Selain itu, fitur Gatepass Unit menerbitkan surat jalan resmi saat unit harus keluar site untuk perbaikan luar atau mobilisasi.',
            'BAB 09: HR, Manpower & Roster Kerja (11:10 - 12:30)' => 'Menu Manpower mengatur seluruh sumber daya manusia divisi plant. Pengguna dapat meninjau bagan Struktur Organisasi dinamis, jadwal Roster Kerja (sistem 6:2, 5:2, 10:2), kalkulasi budget tenaga kerja per unit, serta modul Pengajuan Cuti karyawan lengkap dengan persetujuan cuti dan tiket transportasi.',
            'BAB 10: Web Settings, Menu Builder & Security Administration (12:30 - 14:00)' => 'Modul Administrasi menyajikan kontrol penuh atas konfigurasi web. Melalui Menu Builder, admin dapat menyusun struktur menu, mengubah ikon, dan mengatur urutan navigasi secara visual dengan fitur drag-and-drop. Dilengkapi matriks Role & Permission untuk proteksi hak akses, Activity Logs audit trail, dan visualisasi skema relasi database 3D.',
        ];

        foreach ($chapters as $title => $narration) {
            $transcript .= "--------------------------------------------------------------------\n";
            $transcript .= $title."\n";
            $transcript .= "--------------------------------------------------------------------\n";
            $transcript .= $narration."\n\n";
        }

        return response($transcript, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Transkrip_Narasi_Video_Panduan_Plant_System.txt"',
        ]);
    }

    /**
     * Download Audio Narasi Suara 20 Detik (MP3).
     */
    public function downloadAudio20s(): BinaryFileResponse
    {
        $filePath = public_path('audio/penjelasan_singkat_20detik.mp3');

        return response()->download($filePath, 'Penjelasan_Singkat_Sistem_Plant_20Detik.mp3', [
            'Content-Type' => 'audio/mpeg',
        ]);
    }
}
