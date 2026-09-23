<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class InspectMenusCommand extends Command
{
    protected $signature = 'app:inspect-menus';

    protected $description = 'Melakukan inspeksi otomatis pada seluruh menu, routing, controller, dan view Inertia';

    public function handle(): int
    {
        $this->info('===============================================================');
        $this->info('   INSPEKSI MENYELURUH MENU SISTEM PLANT (AUTOMATED AUDIT)');
        $this->info('===============================================================');
        $this->newLine();

        $user = User::first();
        if (! $user) {
            $this->error('Tidak ditemukan user di database untuk pengujian autentikasi.');

            return Command::FAILURE;
        }

        $this->comment("Menggunakan user testing: {$user->name} (ID: {$user->id}, Email: {$user->email})");
        auth()->login($user);

        // Daftar semua menu yang ada di Sidebar.jsx
        $menuTargets = [
            ['name' => 'Dashboard', 'path' => '/dashboard', 'category' => 'CORE'],
            ['name' => 'Key Performance Index', 'path' => '/kpi', 'category' => 'CORE'],
            ['name' => 'Hour Meter', 'path' => '/hour-meters', 'category' => 'CORE'],
            ['name' => 'Populasi Unit', 'path' => '/units', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Gatepass Unit', 'path' => '/gatepass-unit', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Inventory Toolroom', 'path' => '/toolroom', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Peminjaman Tool', 'path' => '/toolroom?tab=borrow', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Inspection Tool', 'path' => '/toolroom?tab=inspection', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Orderan Tool', 'path' => '/toolroom?tab=order', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Scrap Tool', 'path' => '/toolroom?tab=scrap', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Gate Pass Tool', 'path' => '/toolroom?tab=gatepass', 'category' => 'ASSET MANAGEMENT'],
            ['name' => 'Master Data Hub', 'path' => '/master-data', 'category' => 'MASTER DATA'],
            ['name' => 'Form Inspection Bucket', 'path' => '/form-inspection-bucket', 'category' => 'MASTER DATA'],
            ['name' => 'Check Sheet Service', 'path' => '/form-check-sheet-service', 'category' => 'MASTER DATA'],
            ['name' => 'Check Sheet Service Dozer', 'path' => '/form-check-sheet-dozer', 'category' => 'MASTER DATA'],
            ['name' => 'Check Sheet Service Motorgrader', 'path' => '/form-check-sheet-motorgrader', 'category' => 'MASTER DATA'],
            ['name' => 'Pre Release Check List Track Unit', 'path' => '/form-pre-release-track-unit', 'category' => 'MASTER DATA'],
            ['name' => 'Request Asset Disposed Form', 'path' => '/form-request-asset-disposed', 'category' => 'MASTER DATA'],
            ['name' => 'Surat Permintaan Komponen', 'path' => '/form-surat-permintaan-komponen', 'category' => 'MASTER DATA'],
            ['name' => 'Form JSA', 'path' => '/form-jsa', 'category' => 'MASTER DATA'],
            ['name' => 'JSA Overhaul Starting Motor', 'path' => '/form-jsa/overhaul-starting-motor', 'category' => 'MASTER DATA'],
            ['name' => 'JSA Maintenance AC System DT', 'path' => '/form-jsa/maintenance-ac-dump-truck', 'category' => 'MASTER DATA'],
            ['name' => 'JSA Radiator Medium Truck', 'path' => '/form-jsa/radiator-medium-truck', 'category' => 'MASTER DATA'],
            ['name' => 'JSA Welding Chasis Medium Truck', 'path' => '/form-jsa/welding-chasis-medium-truck', 'category' => 'MASTER DATA'],
            ['name' => 'Form Plant', 'path' => '/form-plant', 'category' => 'MASTER DATA'],
            ['name' => 'PM Monitoring', 'path' => '/pm-monitoring', 'category' => 'PREVENTIVE'],
            ['name' => 'Inspection Unit', 'path' => '/inspection-unit', 'category' => 'PREVENTIVE'],
            ['name' => 'Daily Maint Achievement', 'path' => '/plan-inspections', 'category' => 'PREVENTIVE'],
            ['name' => 'Plan PCR Undercarriage', 'path' => '/pcr-uc', 'category' => 'PREVENTIVE'],
            ['name' => 'Plan PCR Component', 'path' => '/pcr-component', 'category' => 'PREVENTIVE'],
            ['name' => 'Analisa Biaya Repair (ABR)', 'path' => '/abr', 'category' => 'PREVENTIVE'],
            ['name' => 'Work Order - Breakdown', 'path' => '/work-orders?tab=breakdown', 'category' => 'MAINT CONTROL'],
            ['name' => 'Work Order - Historical Schedule', 'path' => '/work-orders?tab=schedule', 'category' => 'MAINT CONTROL'],
            ['name' => 'Work Order - Historical', 'path' => '/work-orders?tab=historical', 'category' => 'MAINT CONTROL'],
            ['name' => 'Work Order - Index', 'path' => '/work-orders', 'category' => 'MAINT CONTROL'],
            ['name' => 'Monitoring Orderan List', 'path' => '/monitoring-orderan', 'category' => 'MAINT CONTROL'],
            ['name' => 'Failure Analysis (FAR)', 'path' => '/failure-analysis', 'category' => 'MAINT CONTROL'],
            ['name' => 'Forecast Budget Monthly', 'path' => '/forecast-budget-monthly', 'category' => 'MAINT CONTROL'],
            ['name' => 'CCR (Condition Component)', 'path' => '/ccr', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Monitoring Part Canibal', 'path' => '/part-canibals', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Monitoring Replace Battery', 'path' => '/repair/battery', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Tyre Management', 'path' => '/tyres', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'WO Outside Repair', 'path' => '/repair/job-outside', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Magnetic Plug', 'path' => '/repair/magnetic-plug', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Oil Consumption', 'path' => '/oil-consumption', 'category' => 'COMPONENT & MONITORING'],
            ['name' => 'Data Manpower Plant', 'path' => '/manpower', 'category' => 'MANPOWER'],
            ['name' => 'Struktur Organisasi', 'path' => '/organization', 'category' => 'MANPOWER'],
            ['name' => 'Perhitungan Manpower', 'path' => '/manpower/perhitungan', 'category' => 'MANPOWER'],
            ['name' => 'Roster Plant', 'path' => '/roster', 'category' => 'MANPOWER'],
            ['name' => 'Pengajuan Cuti', 'path' => '/cuti/pengajuan', 'category' => 'MANPOWER'],
            ['name' => 'User Management', 'path' => '/users', 'category' => 'SYSTEM'],
            ['name' => 'Roles Management', 'path' => '/roles', 'category' => 'SYSTEM'],
            ['name' => 'Permissions Management', 'path' => '/permissions', 'category' => 'SYSTEM'],
            ['name' => 'Pengaturan Mail', 'path' => '/settings/mail', 'category' => 'SYSTEM'],
            ['name' => 'Activity Logs', 'path' => '/activity-logs', 'category' => 'SYSTEM'],
            ['name' => 'Database Relasi 3D', 'path' => '/database-schema', 'category' => 'SYSTEM'],
            ['name' => 'Profile User', 'path' => '/profile', 'category' => 'SYSTEM'],
        ];

        // Tambahan pemeriksaan route CREATE & SHOW (Sample parameterised routes)
        $extraRoutes = [
            ['name' => 'Create Unit', 'path' => '/units/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Tyre', 'path' => '/tyres/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Work Order', 'path' => '/work-orders/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create User', 'path' => '/users/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Role', 'path' => '/roles/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Permission', 'path' => '/permissions/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Monitoring Order', 'path' => '/monitoring-orderan/create', 'category' => 'SUB-MENU'],
            ['name' => 'Create Magnetic Plug', 'path' => '/repair/magnetic-plug/create', 'category' => 'SUB-MENU'],
        ];

        $menuTargets = array_merge($menuTargets, $extraRoutes);

        $results = [];
        $passed = 0;
        $failed = 0;
        $warnings = 0;

        foreach ($menuTargets as $target) {
            $parsedUrl = parse_url($target['path']);
            $uri = $parsedUrl['path'];
            $queryParams = [];
            if (! empty($parsedUrl['query'])) {
                parse_str($parsedUrl['query'], $queryParams);
            }

            $req = Request::create($uri, 'GET', $queryParams);
            $req->headers->set('Accept', 'text/html, application/xhtml+xml');
            $req->setUserResolver(fn () => $user);

            $status = 0;
            $errorMsg = null;
            $component = null;

            try {
                $response = app()->handle($req);
                $status = $response->getStatusCode();

                // Periksa apakah response Inertia
                $content = $response->getContent();
                if ($response instanceof JsonResponse) {
                    $json = $response->getData(true);
                    $component = $json['component'] ?? null;
                } elseif (is_string($content) && preg_match('/data-page="([^"]+)"/', $content, $matches)) {
                    $dataPage = json_decode(htmlspecialchars_decode($matches[1]), true);
                    $component = $dataPage['component'] ?? null;
                }

                // Cek apakah file komponen JSX ada di disk
                $componentExists = true;
                if ($component) {
                    $jsxPath = resource_path("js/Pages/{$component}.jsx");
                    $tsxPath = resource_path("js/Pages/{$component}.tsx");
                    $vuePath = resource_path("js/Pages/{$component}.vue");
                    $componentExists = File::exists($jsxPath) || File::exists($tsxPath) || File::exists($vuePath);
                    if (! $componentExists) {
                        $errorMsg = "Komponen Inertia '{$component}' tidak ditemukan di disk!";
                    }
                }

                if ($status >= 200 && $status < 400 && $componentExists) {
                    $passed++;
                    $resultType = 'OK';
                } elseif ($status >= 300 && $status < 400) {
                    $warnings++;
                    $resultType = 'REDIRECT';
                    $errorMsg = 'Redirects to: '.($response->headers->get('Location') ?? 'unknown');
                } else {
                    $failed++;
                    $resultType = 'FAIL';
                    if (! $errorMsg) {
                        $errorMsg = "HTTP Status {$status}";
                    }
                }
            } catch (\Throwable $e) {
                $status = 500;
                $failed++;
                $resultType = 'EXCEPTION';
                $errorMsg = $e->getMessage().' in '.basename($e->getFile()).':'.$e->getLine();
            }

            $results[] = [
                'category' => $target['category'],
                'name' => $target['name'],
                'path' => $target['path'],
                'status' => $status,
                'type' => $resultType,
                'component' => $component ?: '-',
                'error' => $errorMsg,
            ];
        }

        // Tampilkan tabel hasil
        $this->table(
            ['Kategori', 'Menu', 'Path', 'Status', 'Hasil', 'Komponen View', 'Catatan/Error'],
            array_map(function ($r) {
                $coloredType = match ($r['type']) {
                    'OK' => '<info>OK (200)</info>',
                    'REDIRECT' => "<comment>REDIRECT ({$r['status']})</comment>",
                    default => "<error>{$r['type']} ({$r['status']})</error>",
                };

                return [
                    $r['category'],
                    $r['name'],
                    $r['path'],
                    $r['status'],
                    $coloredType,
                    $r['component'],
                    $r['error'] ?: 'Aman',
                ];
            }, $results)
        );

        $this->newLine();
        $this->info('=== RINGKASAN INSPEKSI ===');
        $this->info('Total Menu Diperiksa: '.count($menuTargets));
        $this->info("Berhasil (OK): {$passed}");
        if ($warnings > 0) {
            $this->comment("Peringatan/Redirect: {$warnings}");
        }
        if ($failed > 0) {
            $this->error("Gagal/Temuan Error: {$failed}");
        }

        return $failed === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}
