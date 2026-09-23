<?php

namespace App\Http\Controllers;

use App\Models\Backlog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BacklogController extends Controller
{
    public function index(Request $request)
    {
        $codeUnit = $request->input('code_unit', '');

        $query = Backlog::with('unit')->orderBy('tanggal_temuan', 'desc');

        if ($codeUnit) {
            $query->whereHas('unit', function ($q) use ($codeUnit) {
                $q->where('code_unit', 'like', "%{$codeUnit}%");
            });
        }

        $backlogs = $query->paginate(10)->through(function ($backlog) {
            return [
                'id' => $backlog->id,
                'code_unit' => $backlog->unit->code_unit ?? '-',
                'equipment' => $backlog->unit->model ?? '-',
                'lokasi' => $backlog->lokasi,
                'tipe_service' => $backlog->tipe_service,
                'temuan' => $backlog->temuan,
                'part_diperlukan' => $backlog->part_diperlukan,
                'tindakan_mekanik' => $backlog->tindakan_mekanik,
                'tingkat_backlog' => $backlog->tingkat_backlog,
                'target_pasang' => $backlog->target_pasang,
                'tanggal_temuan' => $backlog->tanggal_temuan ? $backlog->tanggal_temuan->format('d/m/Y') : '-',
                'status' => $backlog->status,
            ];
        });

        // Mock stats matching mockup exactly for now
        $stats = [
            'total' => 23,
            'ringan' => 8,
            'ringan_pct' => 34.78,
            'sedang' => 9,
            'sedang_pct' => 39.13,
            'berat' => 6,
            'berat_pct' => 26.09,
        ];

        // Return dummy data if table is empty just to show the mockup UI perfectly
        if ($backlogs->isEmpty()) {
            $dummyData = [
                ['id' => 1, 'code_unit' => 'BDZ-002', 'equipment' => 'Bulldozer D85ESS-2', 'lokasi' => 'Pit 1', 'tipe_service' => 'PM 2000', 'temuan' => "- Seal hydraulic bocor\n- Pin bucket aus", 'part_diperlukan' => "- Seal Kit Hydraulic\n- Pin & Bushing", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'RINGAN', 'target_pasang' => "PM 2000\n14.000 HM", 'tanggal_temuan' => '25/06/2024', 'status' => 'OPEN'],
                ['id' => 2, 'code_unit' => 'TRK-015', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service' => 'PM 2000', 'temuan' => "- Lampu belakang mati\n- Kabel harness putus", 'part_diperlukan' => "- Lamp Assy Rear\n- Cable Harness", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'RINGAN', 'target_pasang' => "PM 2000\n16.000 HM", 'tanggal_temuan' => '20/06/2024', 'status' => 'OPEN'],
                ['id' => 3, 'code_unit' => 'FTR-006', 'equipment' => 'Fuel Truck FT 2000', 'lokasi' => 'Jetty', 'tipe_service' => 'PM 1000', 'temuan' => "- Filter fuel kotor\n- Selang fuel retak", 'part_diperlukan' => "- Fuel Filter\n- Hose Fuel 1/2\"", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'RINGAN', 'target_pasang' => "PM 1000\n6.000 HM", 'tanggal_temuan' => '10/05/2024', 'status' => 'PROCUREMENT'],
                ['id' => 4, 'code_unit' => 'WTR-003', 'equipment' => 'Water Truck HM 4000', 'lokasi' => 'Pit 3', 'tipe_service' => 'PM 2000', 'temuan' => "- Pompa air rembes\n- Bearing aus", 'part_diperlukan' => "- Water Pump Assy\n- Bearing SKF 6208", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'SEDANG', 'target_pasang' => "PM 2000\n6.000 HM", 'tanggal_temuan' => '15/07/2024', 'status' => 'OPEN'],
                ['id' => 5, 'code_unit' => 'EXC-001', 'equipment' => 'Excavator CAT 320D2', 'lokasi' => 'Pit 1', 'tipe_service' => 'PM 1000', 'temuan' => "- Track link aus\n- Bolt track longgar", 'part_diperlukan' => "- Track Link Assy\n- Bolt & Nut", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'SEDANG', 'target_pasang' => "PM 1000\n9.000 HM", 'tanggal_temuan' => '15/06/2024', 'status' => 'PROCUREMENT'],
                ['id' => 6, 'code_unit' => 'CRN-004', 'equipment' => 'Crane Truck ZOOMLION', 'lokasi' => 'Mainroad', 'tipe_service' => 'PM 1000', 'temuan' => "- Oil rembes di winch\n- Seal winch rusak", 'part_diperlukan' => "- Seal Kit Winch\n- Gear Oil 90", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'SEDANG', 'target_pasang' => "PM 1000\n8.000 HM", 'tanggal_temuan' => '12/05/2024', 'status' => 'OPEN'],
                ['id' => 7, 'code_unit' => 'CMP-002', 'equipment' => 'Compactor CS-563E', 'lokasi' => 'Pit 2', 'tipe_service' => 'PM 250', 'temuan' => "- Belt kipas retak\n- Tensioner longgar", 'part_diperlukan' => "- V-Belt\n- Tensioner Assy", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'SEDANG', 'target_pasang' => "PM 250\n2.500 HM", 'tanggal_temuan' => '02/06/2024', 'status' => 'ORDERED'],
                ['id' => 8, 'code_unit' => 'TRK-021', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service' => 'PM 2000', 'temuan' => "- Radiator bocor\n- Selang radiator retak", 'part_diperlukan' => "- Radiator Assy\n- Hose Radiator", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'BERAT', 'target_pasang' => "PM 4000\n14.000 HM", 'tanggal_temuan' => '01/05/2024', 'status' => 'OPEN'],
                ['id' => 9, 'code_unit' => 'CAT-001', 'equipment' => 'Wheel Loader 988H', 'lokasi' => 'Pit 2', 'tipe_service' => 'PM 4000', 'temuan' => "- Final drive bunyi\n- Seal final drive bocor", 'part_diperlukan' => "- Seal Kit Final Drive\n- Gear Oil 80W-90", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'BERAT', 'target_pasang' => "PM 4000\n20.000 HM", 'tanggal_temuan' => '10/01/2024', 'status' => 'OPEN'],
                ['id' => 10, 'code_unit' => 'DPR-005', 'equipment' => 'Dozer CAT D8T', 'lokasi' => 'Mainroad', 'tipe_service' => 'PM 4000', 'temuan' => "- Undercarriage aus\n- Roller aus", 'part_diperlukan' => "- Roller Bottom\n- Track Link", 'tindakan_mekanik' => "Order part\nAkan dipasang next service", 'tingkat_backlog' => 'BERAT', 'target_pasang' => "PM 4000\n18.000 HM", 'tanggal_temuan' => '15/12/2023', 'status' => 'ORDERED'],
            ];

            $backlogs = [
                'data' => $dummyData,
                'from' => 1,
                'to' => 10,
                'total' => 23,
                'links' => [
                    ['url' => null, 'label' => '&laquo; Previous', 'active' => false],
                    ['url' => '/backlogs', 'label' => '1', 'active' => true],
                    ['url' => '/backlogs?page=2', 'label' => '2', 'active' => false],
                    ['url' => '/backlogs?page=3', 'label' => '3', 'active' => false],
                    ['url' => '/backlogs?page=2', 'label' => 'Next &raquo;', 'active' => false],
                ],
            ];
        }

        return Inertia::render('Backlog/Index', [
            'backlogs' => $backlogs,
            'stats' => $stats,
            'filters' => [
                'code_unit' => $codeUnit,
            ],
        ]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        return Inertia::render('Backlog/Create');
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        return redirect()->route('backlogs.index')->with('success', 'Backlog berhasil ditambahkan.');
    }

    public function show($id)
    {
        $backlog = [
            'id' => $id,
            'no_backlog' => 'BK-2024-00023',
            'code_unit' => 'BDZ-002',
            'equipment' => 'Bulldozer D85ESS-2',
            'lokasi' => 'Pit 1',
            'tipe_service' => 'PM 2000',
            'next_service_target' => 'PM 2000 / 14.000 HM',
            'current_hm' => '12.448 HM',
            'hm_tersisa' => '-1.552 HM',
            'tanggal_temuan' => '25/06/2024',
            'tingkat_backlog' => 'RINGAN',
            'dibuat_oleh' => 'Ahmad Firdaus (Mekanik)',
            'status' => 'OPEN',
            'target_pasang' => 'PM 2000 / 14.000 HM',

            'temuan' => [
                'deskripsi' => "- Seal hydraulic bocor\n- Pin bucket aus",
                'area' => 'Hydraulic System (Bucket)',
                'dampak' => "- Oli hydraulic berkurang\n- Performa kerja bucket menurun",
                'prioritas' => 'MEDIUM',
                'rekomendasi' => 'Ganti seal dan pin bucket',
                'catatan_mekanik' => 'Harap dilakukan penggantian pada next service agar tidak terjadi kerusakan lebih besar.',
            ],

            'parts' => [
                ['id' => 1, 'kode' => '07000-12085', 'nama' => 'Seal Kit Hydraulic', 'spesifikasi' => 'D85ESS-2', 'qty' => 1, 'satuan' => 'Set', 'stok' => 0, 'status_order' => 'PROCUREMENT', 'estimasi' => '05/07/2024', 'keterangan' => '-'],
                ['id' => 2, 'kode' => '17A-70-32120', 'nama' => 'Pin Bucket Atas', 'spesifikasi' => 'D85ESS-2', 'qty' => 2, 'satuan' => 'Pcs', 'stok' => 0, 'status_order' => 'PROCUREMENT', 'estimasi' => '05/07/2024', 'keterangan' => '-'],
                ['id' => 3, 'kode' => '17A-70-32130', 'nama' => 'Pin Bucket Bawah', 'spesifikasi' => 'D85ESS-2', 'qty' => 2, 'satuan' => 'Pcs', 'stok' => 1, 'status_order' => 'PARTIAL', 'estimasi' => '-', 'keterangan' => 'Sisa stok 1 Pcs'],
                ['id' => 4, 'kode' => '07002-12034', 'nama' => 'O-Ring', 'spesifikasi' => 'NBR 90 Shore', 'qty' => 2, 'satuan' => 'Pcs', 'stok' => 5, 'status_order' => 'READY', 'estimasi' => '-', 'keterangan' => '-'],
            ],

            'timeline' => [
                ['waktu' => '25/06/2024 09:15', 'judul' => 'Temuan oleh Mekanik', 'oleh' => 'Ahmad Firdaus', 'status' => 'done'],
                ['waktu' => '25/06/2024 10:30', 'judul' => 'Backlog dibuat', 'oleh' => 'Ahmad Firdaus', 'status' => 'done'],
                ['waktu' => '26/06/2024 08:45', 'judul' => 'Menunggu Approval Planner', 'oleh' => 'Budi Santoso (Planner)', 'status' => 'current'],
                ['waktu' => '-', 'judul' => 'Part Ordered', 'oleh' => '-', 'status' => 'pending'],
                ['waktu' => '-', 'judul' => 'Akan dipasang pada Next Service', 'oleh' => '-', 'status' => 'pending'],
            ],

            'images' => [
                ['id' => 1, 'url' => 'https://via.placeholder.com/150/506b5d/ffffff?text=Kebocoran+Seal', 'caption' => 'Kebocoran Seal'],
                ['id' => 2, 'url' => 'https://via.placeholder.com/150/506b5d/ffffff?text=Pin+Bucket+Aus', 'caption' => 'Pin Bucket Aus'],
                ['id' => 3, 'url' => 'https://via.placeholder.com/150/506b5d/ffffff?text=Oli+Hydraulic', 'caption' => 'Oli Hydraulic'],
                ['id' => 4, 'url' => 'https://via.placeholder.com/150/506b5d/ffffff?text=Lokasi+Bucket', 'caption' => 'Lokasi Bucket'],
            ],

            'catatan' => "26/06/2024 08:45 - Budi Santoso (Planner)\nBacklog telah ditinjau dan disetujui. Silakan lakukan order part yang diperlukan.",
        ];

        return Inertia::render('Backlog/Show', [
            'backlog' => $backlog,
        ]);
    }

    public function edit($id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        return Inertia::render('Backlog/Edit', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, $id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        return redirect()->route('backlogs.index')->with('success', 'Backlog berhasil diperbarui.');
    }

    public function destroy($id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        return redirect()->route('backlogs.index')->with('success', 'Backlog berhasil dihapus.');
    }
}
