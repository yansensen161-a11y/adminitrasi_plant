/**
 * SceneGenerator.js
 * Generates cinematic presentation scenes dynamically from real database schema nodes and edges.
 * Never uses hardcoded or fake tables.
 */

// Contextual narration dictionary for known tables in Plant CMMS
const TABLE_NARRATIONS = {
    units: 'Tabel units merupakan master data populasi alat berat dan armada plant, menjadi rujukan utama bagi seluruh proses perencanaan dan perawatan.',
    hour_meter_logs: 'Tabel hour_meter_logs mencatat pembacaan jam operasi unit secara berkala guna menentukan jadwal periodical service dan memantau utilitas alat.',
    tyres: 'Tabel tyres mengelola data spesifikasi dan nomor seri ban serta penempatannya pada posisi roda armada unit.',
    tyre_histories: 'Tabel tyre_histories mencatat seluruh riwayat mutasi, rotasi, pelepasan, dan penggantian ban unit.',
    magnetic_plugs: 'Tabel magnetic_plugs mencatat hasil inspeksi serpihan gram besi pada komponen transmisi dan differential untuk deteksi dini keausan komponen.',
    
    work_orders: 'Tabel work_orders adalah pusat alur kerja eksekusi perawatan alat berat, mencatat nomor WO, deskripsi pekerjaan, prioritas, status, dan jadwal.',
    work_order_tasks: 'Tabel work_order_tasks merinci setiap langkah tugas spesifik yang wajib diselesaikan teknisi pada suatu perintah kerja.',
    wo_parts: 'Tabel wo_parts mencatat kebutuhan suku cadang, nomor part, dan kuantitas pemakaian material untuk penyelesaian WO.',
    wo_manpowers: 'Tabel wo_manpowers merekam alokasi teknisi dan mekanik beserta jam kerja aktual yang dihabiskan.',
    wo_breakdowns: 'Tabel wo_breakdowns menghubungkan kejadian unit breakdown dengan surat perintah kerja perbaikan.',
    maintenance_orders: 'Tabel maintenance_orders mengelola pemesanan jadwal servis berkala preventif pada armada.',
    breakdowns: 'Tabel breakdowns merekam insiden unit berhenti beroperasi tak terencana beserta rincian gejalanya.',
    backlogs: 'Tabel backlogs mencatat temuan anomali atau kerusakan tertunda yang dijadwalkan untuk perbaikan berikutnya.',
    pm_services: 'Tabel pm_services mengelola standar checklist perawatan berkala PS-250, PS-500, hingga PS-2000 jam.',
    
    abrs: 'Tabel abrs mengelola lembar pemeriksaan dan pelaporan kerusakan komponen unit secara terstruktur.',
    abr_items: 'Tabel abr_items merinci item daftar pemeriksaan komponen alat beserta status temuan lapangannya.',
    pcr_ucs: 'Tabel pcr_ucs mencatat pengukuran persentase keausan komponen undercarriage seperti track link, roller, dan idler.',
    failure_analyses: 'Tabel failure_analyses mencatat investigasi akar penyebab kerusakan komponen kritis.',
    kpis: 'Tabel kpis mengkalkulasi indikator performa utama seperti MTBF, MTTR, dan Physical Availability alat.',
    oil_consumptions: 'Tabel oil_consumptions memantau laju konsumsi pelumas engine, hidrolik, dan transmisi unit.',
    
    tools: 'Tabel tools mencatat inventaris peralatan kerja, special tools, dan kondisi kelayakannya di workshop.',
    tool_loans: 'Tabel tool_loans merekam sirkulasi peminjaman dan pengembalian peralatan oleh teknisi.',
    part_canibals: 'Tabel part_canibals mencatat pemindahan kanibalisasi suku cadang antar unit yang breakdown.',
    monitoring_orderans: 'Tabel monitoring_orderans melacak status pengadaan dan kedatangan spare part dari gudang/vendor.',
    
    users: 'Tabel users mengelola akun identitas seluruh staf teknisi, supervisor, planner, dan manajemen.',
    roles: 'Tabel roles mendefinisikan tingkatan peran wewenang dalam sistem manajemen plant.',
    permissions: 'Tabel permissions mengatur hak akses granular terhadap modul dan fungsionalitas sistem.',
    activity_log: 'Tabel activity_log merekam jejak audit seluruh transaksi dan perubahan data untuk akuntabilitas sistem.'
};

const MODULE_TITLES = {
    fleet: {
        title: 'MODUL 1: FLEET & ASSET MANAGEMENT',
        subtitle: 'Pondasi Populasi Alat Berat, Pemantauan HM & Komponen Gerak',
        narration: 'Modul Fleet & Asset merupakan pondasi arsitektur data. Seluruh populasi alat berat, pemantauan jam kerja, riwayat ban, dan inspeksi magnetik berpusat di sini.'
    },
    work_order: {
        title: 'MODUL 2: WORK ORDER & PERBAIKAN',
        subtitle: 'Manajemen Perintah Kerja, Servis Berkala & Penanganan Breakdown',
        narration: 'Modul Work Order mengendalikan siklus hidup eksekusi perawatan. Dari pencatatan breakdown, pembagian tugas mekanik, konsumsi spare part, hingga penyelesaian tuntas.'
    },
    inspection: {
        title: 'MODUL 3: INSPEKSI & KONTROL KUALITAS',
        subtitle: 'Pelaporan ABR, Evaluasi Undercarriage & Analisis Kegagalan',
        narration: 'Modul Inspeksi memastikan kesehatan armada melalui pemeriksaan visual ABR berkala, pemantauan keausan komponen undercarriage, dan analisis akar penyebab kegagalan.'
    },
    tool: {
        title: 'MODUL 4: TOOLS & WORKSHOP SUPPORT',
        subtitle: 'Peminjaman Peralatan, Tracking Kanibalisasi & Pengadaan Spare Part',
        narration: 'Modul Tools & Workshop mendukung operasional mekanik dengan pelacakan peminjaman alat kerja, monitoring kanibalisasi part, dan status order suku cadang.'
    },
    user: {
        title: 'MODUL 5: USER & HAK AKSES SISTEM',
        subtitle: 'Keamanan, Autentikasi Pengguna & Role-Based Access Control',
        narration: 'Modul User & Hak Akses mengamankan integritas sistem melalui Role-Based Access Control, memastikan hak otorisasi yang tepat bagi setiap mekanik, planner, dan manajemen.'
    },
    system: {
        title: 'MODUL 6: SISTEM INTI & AUDIT LOG',
        subtitle: 'Jejak Audit Aktivitas, Antrean Background Jobs & Keandalan Database',
        narration: 'Modul Sistem Inti menjamin keandalan data melalui pencatatan audit log lengkap pada setiap perubahan status serta penanganan antrean tugas sistem secara otomatis.'
    }
};

/**
 * Generate an ordered array of presentation scenes based on real nodes and edges.
 * @param {Array} nodes React Flow nodes
 * @param {Array} edges React Flow edges
 * @param {Object} categoryConfig Category styling config
 * @returns {Array} List of scene objects
 */
export function generatePresentationScenes(nodes, edges, categoryConfig = {}) {
    if (!nodes || !nodes.length) {
        return [];
    }

    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const scenes = [];
    let sceneId = 1;

    // 1. Scene: Title Intro
    scenes.push({
        id: sceneId++,
        type: 'intro',
        title: 'DATABASE ARCHITECTURE',
        subtitle: 'Plant Maintenance Management System',
        description: 'Arsitektur Relasional Komprehensif Sistem Manajemen Perawatan Alat Berat',
        meta: `${nodes.length} Tabel Terhubung • ${edges.length} Relasi Aktif • 100% Relasional`,
        narration: 'Selamat datang di presentasi arsitektur database Plant Maintenance Management System. Sistem ini mengintegrasikan seluruh operasional perawatan alat berat ke dalam struktur relasional yang kokoh.',
        duration: 4500,
    });

    // 2. Scene: Global Schema Overview
    scenes.push({
        id: sceneId++,
        type: 'overview',
        title: 'ARSITEKTUR SISTEM MENYELURUH',
        subtitle: 'Gambaran Penuh Seluruh Tabel & Jalur Relasi Database',
        narration: `Sistem ini dibangun di atas ${nodes.length} tabel database yang saling terhubung secara konsisten melalui ${edges.length} jalur relasi foreign key dan model bisnis.`,
        duration: 4200,
    });

    // 3. Group nodes by real category
    const categoryOrder = ['fleet', 'work_order', 'inspection', 'tool', 'user', 'system'];
    const groups = {};

    categoryOrder.forEach((cat) => {
        groups[cat] = nodes.filter((n) => n.data?.category === cat);
    });

    // Also collect any categories not in the standard list
    nodes.forEach((n) => {
        const cat = n.data?.category || 'system';
        if (!groups[cat]) {
            groups[cat] = [n];
        }
    });

    // Key anchor tables to spotlight in each module
    const anchorTablePriority = [
        'units', 'hour_meter_logs', 'tyres', 'magnetic_plugs',
        'work_orders', 'work_order_tasks', 'wo_parts', 'wo_manpowers', 'breakdowns', 'maintenance_orders', 'backlogs',
        'abrs', 'pcr_ucs', 'failure_analyses', 'kpis',
        'tools', 'part_canibals', 'monitoring_orderans',
        'users', 'roles', 'permissions',
        'activity_log'
    ];

    categoryOrder.forEach((catKey) => {
        const catNodes = groups[catKey];
        if (!catNodes || !catNodes.length) {
            return;
        }

        const modInfo = MODULE_TITLES[catKey] || {
            title: `MODUL: ${(categoryConfig[catKey]?.label || catKey).toUpperCase()}`,
            subtitle: `Kumpulan ${catNodes.length} Tabel Relasional Terkait`,
            narration: `Bagian ini menampilkan ${catNodes.length} tabel dalam kategori ${categoryConfig[catKey]?.label || catKey}.`
        };

        // Module Intro Scene
        scenes.push({
            id: sceneId++,
            type: 'module-intro',
            category: catKey,
            categoryLabel: categoryConfig[catKey]?.label || catKey,
            title: modInfo.title,
            subtitle: modInfo.subtitle,
            narration: modInfo.narration,
            tableIds: catNodes.map((n) => n.id),
            duration: 3800,
        });

        // Filter and prioritize spotlight tables in this module
        const moduleAnchors = catNodes
            .filter((n) => anchorTablePriority.includes(n.id))
            .sort((a, b) => anchorTablePriority.indexOf(a.id) - anchorTablePriority.indexOf(b.id));

        // If no explicit anchors, pick up to 3 highest connected tables in module
        const tablesToSpotlight = moduleAnchors.length > 0
            ? moduleAnchors
            : catNodes.slice(0, 3);

        tablesToSpotlight.forEach((node) => {
            const tableName = node.id;
            const nodeData = node.data;

            // Generate narration for table
            const tableNarration = TABLE_NARRATIONS[tableName] ||
                `Tabel ${tableName} menyimpan data ${nodeData.label || tableName} dengan total ${nodeData.columns?.length || 0} kolom dan ${nodeData.connectionCount || 0} relasi aktif.`;

            // Table Focus Scene
            scenes.push({
                id: sceneId++,
                type: 'table-focus',
                category: catKey,
                categoryLabel: categoryConfig[catKey]?.label || catKey,
                tableId: tableName,
                tableName: tableName,
                tableLabel: nodeData.label || tableName,
                pkColumns: nodeData.pkColumns || ['id'],
                fkColumns: nodeData.fkColumns || [],
                rowCount: nodeData.rowCount || 0,
                columnCount: nodeData.columns?.length || 0,
                connectionCount: nodeData.connectionCount || 0,
                columns: nodeData.columns || [],
                position: node.position,
                narration: tableNarration,
                duration: 4000,
            });

            // Find prominent outgoing or incoming relations for this table
            const keyEdges = edges.filter(
                (e) => (e.source === tableName || e.target === tableName) &&
                       anchorTablePriority.includes(e.source === tableName ? e.target : e.source)
            ).slice(0, 1); // limit to 1 best relationship per table to keep presentation tight and cinematic

            keyEdges.forEach((edge) => {
                const isOutgoing = edge.source === tableName;
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);

                if (!sourceNode || !targetNode) {
                    return;
                }

                const relationNarration = `Relasi menghubungkan ${edge.source}.${edge.data?.sourceCol || 'id'} ke ${edge.target}.${edge.data?.targetCol || 'id'}, memastikan integritas data ${edge.data?.typeLabel || 'relasional'}.`;

                scenes.push({
                    id: sceneId++,
                    type: 'relationship',
                    category: catKey,
                    edgeId: edge.id,
                    sourceId: edge.source,
                    targetId: edge.target,
                    sourceCol: edge.data?.sourceCol || 'id',
                    targetCol: edge.data?.targetCol || 'id',
                    relationType: edge.data?.type || 'database_fk',
                    relationTypeLabel: edge.data?.typeLabel || 'Foreign Key',
                    description: edge.data?.description || '',
                    sourceLabel: sourceNode.data?.label || edge.source,
                    targetLabel: targetNode.data?.label || edge.target,
                    sourcePosition: sourceNode.position,
                    targetPosition: targetNode.position,
                    narration: relationNarration,
                    duration: 3200,
                });
            });
        });
    });

    // Final Scene: Outro Summary
    scenes.push({
        id: sceneId++,
        type: 'outro',
        title: 'ARSITEKTUR TERINTEGRASI PENUH',
        subtitle: 'Integritas Referensial 100% • Siap untuk Skalabilitas Operasional CMMS',
        meta: `Total ${nodes.length} Tabel Database • ${edges.length} Relasi Foreign Key & Model Terhubung`,
        narration: 'Seluruh struktur skema database terintegrasi tanpa celah untuk memastikan keandalan pencatatan, pemeliharaan preventif, dan ketersediaan armada alat berat.',
        duration: 5000,
    });

    return scenes;
}
