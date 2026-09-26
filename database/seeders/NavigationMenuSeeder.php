<?php

namespace Database\Seeders;

use App\Models\NavigationMenu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NavigationMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultMenus = [
            // ─── PANDUAN & DOKUMENTASI SISTEM ────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'PANDUAN & DOKUMENTASI',
                'name' => 'Video Panduan & Tur Sistem',
                'href' => '/video-panduan',
                'icon_key' => 'video',
                'badge' => 'PANDUAN',
                'order' => 1,
            ],

            // ─── MAINTENANCE CONTROL ──────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Work Order',
                'href' => '#',
                'icon_key' => 'mcc',
                'order' => 1,
                'subItems' => [
                    [
                        'name' => 'Monitoring Breakdown',
                        'href' => '/work-orders?tab=breakdown',
                        'icon_key' => 'mcc',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Historical WO Closed',
                        'href' => '/work-orders?tab=historical',
                        'icon_key' => 'perhitungan',
                        'order' => 2,
                    ],
                ],
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Monitoring Order List',
                'href' => '/monitoring-orderan',
                'icon_key' => 'planComp',
                'order' => 2,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Part Order & Lifetime',
                'href' => '/part-order-lifetime',
                'icon_key' => 'planComp',
                'order' => 3,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Oil Consumption',
                'href' => '/oil-consumption',
                'icon_key' => 'oil',
                'order' => 3,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Failure Analysis (FAR)',
                'href' => '/failure-analysis',
                'icon_key' => 'far',
                'order' => 4,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Forecast Budget Monthly',
                'href' => '/forecast-budget-monthly',
                'icon_key' => 'forecast',
                'order' => 5,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'Performance Unit',
                'href' => '/performance-unit',
                'icon_key' => 'performanceUnit',
                'badge' => 'LIVE',
                'order' => 6,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MAINTENANCE CONTROL',
                'name' => 'KPI Dashboard',
                'href' => '/kpi',
                'icon_key' => 'kpi',
                'order' => 7,
            ],

            // ─── PREVENTIVE MAINTENANCE ───────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'PM Monitoring & Forecast',
                'href' => '/pm-monitoring',
                'icon_key' => 'forecast',
                'order' => 8,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Plan Inspeksi Hauler & DT',
                'href' => '/plan-inspections',
                'icon_key' => 'planInspect',
                'order' => 9,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Dashboard Target Inspeksi',
                'href' => '/plan-inspections/dashboard',
                'icon_key' => 'dashboard',
                'order' => 10,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Inspeksi Harian P2H',
                'href' => '/inspection-unit',
                'icon_key' => 'inspectionCheck',
                'order' => 11,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Plan PCR Undercarriage',
                'href' => '/pcr-uc',
                'icon_key' => 'analisa',
                'order' => 12,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Plan PCR Component',
                'href' => '/pcr-component',
                'icon_key' => 'planComp',
                'order' => 13,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'PREVENTIVE MAINTENANCE',
                'name' => 'Analisa Biaya Repair (ABR)',
                'href' => '/abr',
                'icon_key' => 'perhitungan',
                'order' => 14,
            ],

            // ─── COMPONENT & CONDITION ────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'COMPONENT & CONDITION',
                'name' => 'Condition Component Report (CCR)',
                'href' => '/ccr',
                'icon_key' => 'inspectionCheck',
                'order' => 15,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'COMPONENT & CONDITION',
                'name' => 'Monitoring Part Canibal',
                'href' => '/part-canibals',
                'icon_key' => 'canibal',
                'order' => 16,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'COMPONENT & CONDITION',
                'name' => 'Replace Battery',
                'href' => '/repair/battery',
                'icon_key' => 'battery',
                'order' => 17,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'COMPONENT & CONDITION',
                'name' => 'WO Outside Repair',
                'href' => '/repair/job-outside',
                'icon_key' => 'mcc',
                'order' => 18,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'COMPONENT & CONDITION',
                'name' => 'Magnetic Plug',
                'href' => '/repair/magnetic-plug',
                'icon_key' => 'magPlug',
                'order' => 19,
            ],

            // ─── TIRE OPERATIONS & TYREVAULT ──────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'TIRE OPERATIONS & TYREVAULT',
                'name' => 'Dashboard Ban 3D',
                'href' => '/tyres',
                'icon_key' => 'tirevault',
                'badge' => '3D',
                'order' => 20,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TIRE OPERATIONS & TYREVAULT',
                'name' => 'Monitoring Tekanan Ban',
                'href' => '/tyres?tab=pressure',
                'icon_key' => 'pressure',
                'order' => 21,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TIRE OPERATIONS & TYREVAULT',
                'name' => 'Inspeksi Ban Lapangan',
                'href' => '/tyres?tab=inspection',
                'icon_key' => 'inspection',
                'order' => 22,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TIRE OPERATIONS & TYREVAULT',
                'name' => 'Histori & Pergantian Ban',
                'href' => '/historical-tyre',
                'icon_key' => 'perhitungan',
                'order' => 23,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TIRE OPERATIONS & TYREVAULT',
                'name' => 'Visual Wheel Map Sasis (3D)',
                'href' => '/tyres?condition=3D_VIEWER',
                'icon_key' => 'dashboard',
                'order' => 24,
            ],

            // ─── OPERATIONAL FORMS ────────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Portal Form JSA Hub',
                'href' => '/form-jsa/portal',
                'icon_key' => 'jsa',
                'order' => 25,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Form Penundaan Service',
                'href' => '/form-penundaan-service',
                'icon_key' => 'planInspect',
                'order' => 26,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Form Washing Unit',
                'href' => '/form-washing-unit',
                'icon_key' => 'inspectionCheck',
                'order' => 27,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Form Service Genset',
                'href' => '/form-service-genset',
                'icon_key' => 'planComp',
                'order' => 28,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Form Service Dump Truck',
                'href' => '/form-service-dump-truck',
                'icon_key' => 'unit',
                'order' => 29,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Check Sheet Service Hauler',
                'href' => '/form-check-sheet-service',
                'icon_key' => 'planInspect',
                'order' => 30,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Check Sheet Dozer',
                'href' => '/form-check-sheet-dozer',
                'icon_key' => 'planComp',
                'order' => 31,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Check Sheet Motorgrader',
                'href' => '/form-check-sheet-motorgrader',
                'icon_key' => 'planComp',
                'order' => 32,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Pre Release Track Unit',
                'href' => '/form-pre-release-track-unit',
                'icon_key' => 'inspectionCheck',
                'order' => 33,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'OPERATIONAL FORMS',
                'name' => 'Surat Permintaan Part (SPK)',
                'href' => '/form-surat-permintaan-komponen',
                'icon_key' => 'perhitungan',
                'order' => 34,
            ],

            // ─── TOOLROOM & SST ───────────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Inventory Toolroom',
                'href' => '/toolroom',
                'icon_key' => 'mcc',
                'order' => 35,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Peminjaman Tool SST',
                'href' => '/toolroom?tab=borrow',
                'icon_key' => 'planInspect',
                'order' => 36,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Inspection Tool',
                'href' => '/toolroom?tab=inspection',
                'icon_key' => 'inspectionCheck',
                'order' => 37,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Orderan Tool',
                'href' => '/toolroom?tab=order',
                'icon_key' => 'far',
                'order' => 38,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Scrap & Rusak Tool',
                'href' => '/toolroom?tab=scrap',
                'icon_key' => 'canibal',
                'order' => 39,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'TOOLROOM & SST',
                'name' => 'Gate Pass Tool',
                'href' => '/toolroom?tab=gatepass',
                'icon_key' => 'gatepass',
                'order' => 40,
            ],

            // ─── MASTER DATA & ASSETS ─────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'MASTER DATA & ASSETS',
                'name' => 'Populasi Unit',
                'href' => '/units',
                'icon_key' => 'masterData',
                'order' => 41,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MASTER DATA & ASSETS',
                'name' => 'Gatepass Unit',
                'href' => '/gatepass-unit',
                'icon_key' => 'gatepass',
                'order' => 42,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MASTER DATA & ASSETS',
                'name' => 'Hour Meter Unit',
                'href' => '/hour-meters',
                'icon_key' => 'hourMeter',
                'order' => 43,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'MASTER DATA & ASSETS',
                'name' => 'Master Data Hub',
                'href' => '/master-data',
                'icon_key' => 'masterData',
                'order' => 44,
            ],

            // ─── HR & MANPOWER ────────────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'HR & MANPOWER',
                'name' => 'Database Manpower',
                'href' => '/manpower',
                'icon_key' => 'manpower',
                'order' => 45,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'HR & MANPOWER',
                'name' => 'Struktur Organisasi',
                'href' => '/organization',
                'icon_key' => 'org',
                'order' => 46,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'HR & MANPOWER',
                'name' => 'Perhitungan Manpower',
                'href' => '/manpower/perhitungan',
                'icon_key' => 'perhitungan',
                'order' => 47,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'HR & MANPOWER',
                'name' => 'Roster Kerja',
                'href' => '/roster',
                'icon_key' => 'roster',
                'order' => 48,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'HR & MANPOWER',
                'name' => 'Pengajuan Cuti',
                'href' => '/cuti/pengajuan',
                'icon_key' => 'cuti',
                'order' => 49,
            ],

            // ─── WEB SETTINGS & ACCESS ────────────────────────────────────────
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'Menu Builder',
                'href' => '/settings/menus',
                'icon_key' => 'settings',
                'badge' => 'BUILDER',
                'order' => 50,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'Role & Permission',
                'href' => '/settings/roles-permissions',
                'icon_key' => 'users',
                'order' => 51,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'Email & SMTP Settings',
                'href' => '/settings/mail',
                'icon_key' => 'settings',
                'order' => 52,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'Activity Logs',
                'href' => '/activity-logs',
                'icon_key' => 'logs',
                'order' => 53,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'Database Relasi 3D',
                'href' => '/database-schema',
                'icon_key' => 'dashboard',
                'order' => 54,
            ],
            [
                'portal_id' => 'main',
                'section_label' => 'WEB SETTINGS & ACCESS',
                'name' => 'My Profile',
                'href' => '/profile',
                'icon_key' => 'users',
                'order' => 55,
            ],
        ];

        // Safely wipe old duplicates before seeding
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            NavigationMenu::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } else {
            NavigationMenu::whereNotNull('parent_id')->delete();
            NavigationMenu::whereNull('parent_id')->delete();
        }

        foreach ($defaultMenus as $menuData) {
            $subItems = $menuData['subItems'] ?? [];
            unset($menuData['subItems']);

            $menu = NavigationMenu::create($menuData);

            if (! empty($subItems)) {
                foreach ($subItems as $subData) {
                    NavigationMenu::create(array_merge($subData, [
                        'portal_id' => $menuData['portal_id'],
                        'section_label' => $menuData['section_label'],
                        'parent_id' => $menu->id,
                    ]));
                }
            }
        }
    }
}
