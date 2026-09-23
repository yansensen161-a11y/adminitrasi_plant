<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionClass;
use ReflectionMethod;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class DatabaseSchemaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('DatabaseSchema/Index');
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $schemaResponse = $this->getSchema();
        $schemaData = $schemaResponse->getData(true);

        $nodes = $schemaData['nodes'];
        $links = $schemaData['links'];
        $stats = $schemaData['stats'];

        $hideSystem = $request->boolean('hide_system', false);
        $filterCategory = $request->input('category', 'all');

        if ($hideSystem) {
            $nodes = array_values(array_filter($nodes, fn ($n) => ! $n['is_system']));
            $visibleIds = array_flip(array_column($nodes, 'id'));
            $links = array_values(array_filter($links, fn ($l) => isset($visibleIds[$l['source']]) && isset($visibleIds[$l['target']])));
        }

        if ($filterCategory !== 'all') {
            $nodes = array_values(array_filter($nodes, fn ($n) => $n['category'] === $filterCategory));
            $visibleIds = array_flip(array_column($nodes, 'id'));
            $links = array_values(array_filter($links, fn ($l) => isset($visibleIds[$l['source']]) && isset($visibleIds[$l['target']])));
        }

        // Group nodes by category
        $categoryLabels = $stats['categories'];
        $groupedNodes = [];
        $moduleCounts = [];

        foreach ($nodes as $node) {
            $cat = $node['category'];
            if (! isset($groupedNodes[$cat])) {
                $groupedNodes[$cat] = [
                    'label' => $categoryLabels[$cat] ?? ucfirst($cat),
                    'tables' => [],
                ];
            }
            $groupedNodes[$cat]['tables'][] = $node;
            $moduleCounts[$cat] = ($moduleCounts[$cat] ?? 0) + 1;
        }

        $stats['module_counts'] = $moduleCounts;
        $stats['total_tables'] = count($nodes);
        $stats['total_links'] = count($links);

        $data = [
            'title' => 'Laporan Skema Database & Relasi (ERD)',
            'printed_at' => now()->translatedFormat('d F Y, H:i:s').' WIB',
            'user_name' => auth()->user()?->name ?? 'Administrator',
            'stats' => $stats,
            'links' => $links,
            'grouped_nodes' => $groupedNodes,
        ];

        $pdf = Pdf::loadView('pdf.database-schema', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('Laporan_Database_Relasi_Plant_'.date('Ymd_His').'.pdf');
    }

    public function getSchema(): JsonResponse
    {
        $databaseName = DB::connection()->getDatabaseName();

        // 1. Get Tables
        $tablesQuery = DB::select('SHOW TABLES');
        $tables = [];

        foreach ($tablesQuery as $tableObj) {
            $tables[] = array_values((array) $tableObj)[0];
        }

        // Module Category Mapping
        $categoryMapping = [
            'units' => 'fleet',
            'hour_meter_logs' => 'fleet',
            'tyres' => 'fleet',
            'tyre_histories' => 'fleet',
            'magnetic_plugs' => 'fleet',
            'battery_monitorings' => 'fleet',

            'wo_outside_repairs' => 'work_order',

            'work_orders' => 'work_order',
            'work_order_tasks' => 'work_order',
            'wo_breakdowns' => 'work_order',
            'wo_manpowers' => 'work_order',
            'wo_parts' => 'work_order',
            'wo_status_histories' => 'work_order',
            'wo_vendors' => 'work_order',
            'wo_warranties' => 'work_order',
            'maintenance_orders' => 'work_order',
            'maintenance_order_parts' => 'work_order',
            'breakdowns' => 'work_order',
            'breakdown_tasks' => 'work_order',
            'backlogs' => 'work_order',
            'service_orders' => 'work_order',
            'service_logs' => 'work_order',
            'pm_services' => 'work_order',

            'abrs' => 'inspection',
            'abr_items' => 'inspection',
            'abr_images' => 'inspection',
            'failure_analyses' => 'inspection',
            'failure_analysis_photos' => 'inspection',
            'pcr_ucs' => 'inspection',
            'plan_inspections' => 'inspection',
            'plan_inspection_targets' => 'inspection',
            'part_canibals' => 'inspection',
            'part_canibal_parts' => 'inspection',

            'tools' => 'tool',
            'tool_transactions' => 'tool',
            'tool_inspections' => 'tool',
            'tool_gate_passes' => 'tool',
            'tool_orders' => 'tool',

            'users' => 'user',
            'roles' => 'user',
            'permissions' => 'user',
            'model_has_roles' => 'user',
            'model_has_permissions' => 'user',
            'role_has_permissions' => 'user',
            'organization_nodes' => 'user',
            'manpower_budgets' => 'user',
            'activity_log' => 'user',

            'migrations' => 'system',
            'sessions' => 'system',
            'settings' => 'system',
            'cache' => 'system',
            'cache_locks' => 'system',
            'jobs' => 'system',
            'job_batches' => 'system',
            'failed_jobs' => 'system',
            'password_reset_tokens' => 'system',
        ];

        $categoryLabels = [
            'fleet' => 'Fleet & Asset',
            'work_order' => 'Work Order & Perbaikan',
            'inspection' => 'Inspeksi & Kualitas',
            'tool' => 'Tools & Workshop',
            'user' => 'User & Hak Akses',
            'system' => 'Tabel Sistem',
        ];

        // 2. Discover Relationships
        $links = [];
        $seenLinks = [];

        $addLink = function (
            string $source,
            string $target,
            string $sourceCol,
            string $targetCol,
            string $type,
            ?string $description = null
        ) use (&$links, &$seenLinks, $tables): void {
            if (! in_array($source, $tables, true) || ! in_array($target, $tables, true)) {
                return;
            }
            $key = "{$source}->{$target}:{$sourceCol}->{$targetCol}";
            if (isset($seenLinks[$key])) {
                return;
            }
            $seenLinks[$key] = true;

            $typeLabels = [
                'database_fk' => 'Foreign Key Database',
                'eloquent' => 'Relasi Eloquent',
                'logical' => 'Relasi Domain / Logikal',
            ];

            $links[] = [
                'id' => "link-{$source}-{$target}-{$sourceCol}-{$targetCol}",
                'source' => $source,
                'target' => $target,
                'sourceCol' => $sourceCol,
                'targetCol' => $targetCol,
                'type' => $type,
                'type_label' => $typeLabels[$type] ?? 'Relasi',
                'label' => "{$sourceCol} → {$targetCol}",
                'description' => $description ?: "{$source}.{$sourceCol} berelasi ke {$target}.{$targetCol}",
            ];
        };

        // A. Explicit MySQL Foreign Keys
        $fkQuery = DB::select('
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM 
                information_schema.KEY_COLUMN_USAGE
            WHERE 
                REFERENCED_TABLE_SCHEMA = ?
                AND REFERENCED_TABLE_NAME IS NOT NULL
        ', [$databaseName]);

        foreach ($fkQuery as $fk) {
            $addLink(
                $fk->TABLE_NAME,
                $fk->REFERENCED_TABLE_NAME,
                $fk->COLUMN_NAME,
                $fk->REFERENCED_COLUMN_NAME,
                'database_fk'
            );
        }

        // B. Dynamic Eloquent Model Relationships
        $modelsPath = app_path('Models');
        if (is_dir($modelsPath)) {
            $files = scandir($modelsPath);
            foreach ($files as $file) {
                if (! str_ends_with($file, '.php')) {
                    continue;
                }
                $className = 'App\\Models\\'.substr($file, 0, -4);
                if (! class_exists($className)) {
                    continue;
                }

                $ref = new ReflectionClass($className);
                if ($ref->isAbstract()) {
                    continue;
                }

                try {
                    $model = new $className;
                    $table = $model->getTable();

                    $methods = $ref->getMethods(ReflectionMethod::IS_PUBLIC);
                    foreach ($methods as $method) {
                        if ($method->getNumberOfParameters() > 0 || $method->class !== $className) {
                            continue;
                        }

                        try {
                            $return = $method->invoke($model);
                            if ($return instanceof BelongsTo) {
                                $relatedModel = $return->getRelated();
                                $relatedTable = (new $relatedModel)->getTable();
                                $fk = $return->getForeignKeyName();
                                $owner = $return->getOwnerKeyName();
                                $addLink($table, $relatedTable, $fk, $owner, 'eloquent');
                            } elseif ($return instanceof HasOneOrMany) {
                                $relatedModel = $return->getRelated();
                                $relatedTable = (new $relatedModel)->getTable();
                                $fk = $return->getForeignKeyName();
                                $local = $return->getLocalKeyName();
                                $addLink($relatedTable, $table, $fk, $local, 'eloquent');
                            }
                        } catch (\Throwable $e) {
                        }
                    }
                } catch (\Throwable $e) {
                }
            }
        }

        // C. Known Domain & Polymorphic Bridges
        $knownRelations = [
            ['model_has_roles', 'users', 'model_id', 'id', 'User Role Assignment'],
            ['model_has_permissions', 'users', 'model_id', 'id', 'User Direct Permission'],
            ['activity_log', 'users', 'causer_id', 'id', 'Audit Log Pelaku (User)'],
            ['activity_log', 'units', 'subject_id', 'id', 'Audit Log Target (Unit)'],
            ['sessions', 'users', 'user_id', 'id', 'Sesi Pengguna Aktif'],
            ['password_reset_tokens', 'users', 'email', 'email', 'Token Reset Password'],
            ['abrs', 'work_orders', 'no_wo', 'no_wo', 'Koneksi ABR ke Work Order'],
            ['tool_transactions', 'work_orders', 'work_order_no', 'no_wo', 'Peminjaman Tool untuk WO'],
            ['part_canibals', 'maintenance_orders', 'no_order', 'no_order', 'Referensi Order Part Kanibal'],
            ['manpower_budgets', 'organization_nodes', 'job_position', 'jabatan', 'Alokasi Budget Jabatan'],
            ['pm_services', 'service_logs', 'nama_pm', 'service_type', 'Jadwal PM Service'],
            ['pm_services', 'backlogs', 'type_service', 'tipe_service', 'Kategori Tipe Service Backlog'],
            ['tool_orders', 'tools', 'tool_name', 'name', 'Order Pembelian Tool'],
            ['tool_orders', 'users', 'requested_by', 'name', 'Permintaan Tool oleh User'],
            ['backlogs', 'units', 'unit_id', 'id', 'Backlog Unit Plant'],
            ['hour_meter_logs', 'units', 'unit_id', 'id', 'Pencatatan HM Unit'],
            ['maintenance_orders', 'units', 'swap_to_unit_id', 'id', 'Unit Tujuan Swap Komponen'],
            ['jobs', 'job_batches', 'id', 'id', 'Batch Antrean Pekerjaan'],
            ['failed_jobs', 'jobs', 'queue', 'queue', 'Antrean Job Gagal'],
            ['cache_locks', 'cache', 'key', 'key', 'Kunci Cache Atomic'],
            ['settings', 'activity_log', 'id', 'subject_id', 'Audit Log Konfigurasi'],
            ['migrations', 'settings', 'id', 'id', 'Versi Migrasi Skema'],
            ['battery_monitorings', 'units', 'unit_id', 'id', 'Monitoring Replace Battery Unit'],
            ['wo_outside_repairs', 'units', 'unit_id', 'id', 'Work Order External Repair Unit'],
        ];

        foreach ($knownRelations as $rel) {
            $addLink($rel[0], $rel[1], $rel[2], $rel[3], 'logical', $rel[4] ?? null);
        }

        // Map which columns are involved in FKs
        $fkColumnsByTable = [];
        foreach ($links as $link) {
            $fkColumnsByTable[$link['source']][] = $link['sourceCol'];
            $fkColumnsByTable[$link['target']][] = $link['targetCol'];
        }

        // 3. Build Node Metadata
        $nodes = [];
        foreach ($tables as $table) {
            $columnsQuery = DB::select("SHOW COLUMNS FROM `{$table}`");
            $pkColumns = [];
            $fkCols = array_unique($fkColumnsByTable[$table] ?? []);

            $columns = array_map(function ($col) use (&$pkColumns) {
                if ($col->Key === 'PRI') {
                    $pkColumns[] = $col->Field;
                }

                return [
                    'name' => $col->Field,
                    'type' => $col->Type,
                    'key' => $col->Key, // PRI, MUL, UNI
                    'nullable' => $col->Null === 'YES',
                ];
            }, $columnsQuery);

            $category = $categoryMapping[$table] ?? 'system';
            $isSystem = $category === 'system';

            // Safe quick count
            $rowCount = 0;
            try {
                $rowCount = DB::table($table)->count();
            } catch (\Throwable $e) {
            }

            // Connection count
            $connectionCount = 0;
            foreach ($links as $l) {
                if ($l['source'] === $table || $l['target'] === $table) {
                    $connectionCount++;
                }
            }

            $nodes[] = [
                'id' => $table,
                'name' => $table,
                'label' => ucwords(str_replace('_', ' ', $table)),
                'category' => $category,
                'category_label' => $categoryLabels[$category] ?? 'Lainnya',
                'is_system' => $isSystem,
                'row_count' => $rowCount,
                'columns' => $columns,
                'pk_columns' => $pkColumns,
                'fk_columns' => array_values($fkCols),
                'connection_count' => $connectionCount,
            ];
        }

        return response()->json([
            'nodes' => $nodes,
            'links' => $links,
            'stats' => [
                'total_tables' => count($tables),
                'total_links' => count($links),
                'categories' => $categoryLabels,
            ],
        ]);
    }
}
