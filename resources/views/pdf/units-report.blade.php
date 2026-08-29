<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 12px 15px;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 7px;
            line-height: 1.2;
        }
        .header {
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 6px;
            margin-bottom: 6px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 15px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 7.5px;
            color: #6b7280;
            margin-top: 1px;
        }
        .summary-bar {
            width: 100%;
            margin-bottom: 6px;
        }
        .stat-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 3px 5px;
            text-align: center;
        }
        .stat-val {
            font-size: 11px;
            font-weight: bold;
            color: #111827;
        }
        .stat-label {
            font-size: 6.5px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        .data-table th {
            background-color: #7c3aed;
            color: #ffffff;
            font-weight: bold;
            font-size: 6.5px;
            text-transform: uppercase;
            padding: 4px 2.5px;
            text-align: left;
            border: 1px solid #6d28d9;
        }
        .data-table td {
            padding: 3px 2.5px;
            border: 1px solid #e5e7eb;
            font-size: 6.5px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 1px 3px;
            border-radius: 3px;
            font-size: 6px;
            font-weight: bold;
            text-align: center;
        }
        .badge-operational { background-color: #d1fae5; color: #065f46; }
        .badge-breakdown { background-color: #fee2e2; color: #991b1b; }
        .badge-maintenance { background-color: #fef3c7; color: #92400e; }
        .badge-standby { background-color: #e0f2fe; color: #075985; }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 4px;
            text-align: center;
            font-size: 6.5px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="logo-text">SYSTEM PLANT</div>
                    <div class="subtitle">Divisi Plant & Manajemen Populasi Alat Berat</div>
                </td>
                <td style="text-align: right;">
                    <div style="font-size: 10px; font-weight: bold; color: #111827;">{{ $title }}</div>
                    <div class="subtitle">Tanggal Cetak: {{ $generatedAt }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary KPI Cards -->
    <table class="summary-bar" cellspacing="4">
        <tr>
            <td width="20%">
                <div class="stat-card">
                    <div class="stat-val">{{ $stats['total'] }}</div>
                    <div class="stat-label">Total Populasi Unit</div>
                </div>
            </td>
            <td width="20%">
                <div class="stat-card" style="border-left: 2px solid #10b981;">
                    <div class="stat-val" style="color: #059669;">{{ $stats['operational'] }}</div>
                    <div class="stat-label">Operational (Ready)</div>
                </div>
            </td>
            <td width="20%">
                <div class="stat-card" style="border-left: 2px solid #ef4444;">
                    <div class="stat-val" style="color: #dc2626;">{{ $stats['breakdown'] }}</div>
                    <div class="stat-label">Breakdown (BD)</div>
                </div>
            </td>
            <td width="20%">
                <div class="stat-card" style="border-left: 2px solid #f59e0b;">
                    <div class="stat-val" style="color: #d97706;">{{ $stats['maintenance'] }}</div>
                    <div class="stat-label">Maintenance (PM)</div>
                </div>
            </td>
            <td width="20%">
                <div class="stat-card" style="border-left: 2px solid #0ea5e9;">
                    <div class="stat-val" style="color: #0284c7;">{{ $stats['standby'] }}</div>
                    <div class="stat-label">Standby</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Data Table matching exact columns including separate Remarks & Status -->
    <table class="data-table">
        <thead>
            <tr>
                <th width="2.5%" style="text-align: center;">No</th>
                <th width="6%">CODE UNIT</th>
                <th width="4%" style="text-align: right;">HM</th>
                <th width="5.5%">Model</th>
                <th width="6.5%">S/N CHASSIS</th>
                <th width="5.5%">ENGINE MODEL</th>
                <th width="5.5%">S/N ENGINE</th>
                <th width="5%">ENGINE MAKE</th>
                <th width="5%">CAPACITY</th>
                <th width="4.5%">NO.POLICE</th>
                <th width="6.5%">ATTACHMENTS</th>
                <th width="3.5%">HP</th>
                <th width="3.5%">KW</th>
                <th width="3%" style="text-align: center;">TAHUN</th>
                <th width="5%">REC. DATE</th>
                <th width="5.5%">REC. FROM</th>
                <th width="5.5%">LOCATION</th>
                <th width="5.5%">BEFORE FROM</th>
                <th width="7.5%">REMARKS</th>
                <th width="4.5%" style="text-align: center;">STATUS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($units as $index => $unit)
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $unit->no_urut ?: ($index + 1) }}</td>
                    <td><strong style="color: #7c3aed;">{{ $unit->code_unit }}</strong></td>
                    <td style="text-align: right; font-weight: bold;">{{ number_format($unit->hm, 1) }}</td>
                    <td>{{ $unit->model ?: '-' }}</td>
                    <td style="font-family: monospace; font-size: 6px;">{{ $unit->sn_chassis ?: '-' }}</td>
                    <td>{{ $unit->engine_model ?: '-' }}</td>
                    <td style="font-family: monospace; font-size: 6px;">{{ $unit->sn_engine ?: '-' }}</td>
                    <td>{{ $unit->engine_make ?: '-' }}</td>
                    <td>{{ $unit->equipment_capacity ?: '-' }}</td>
                    <td>{{ $unit->no_police ?: '-' }}</td>
                    <td>{{ $unit->attachments ?: '-' }}</td>
                    <td>{{ $unit->hp ?: '-' }}</td>
                    <td>{{ $unit->kw ?: '-' }}</td>
                    <td style="text-align: center;">{{ $unit->tahun_perakitan ?: '-' }}</td>
                    <td>{{ $unit->received_date ?: '-' }}</td>
                    <td>{{ $unit->received_from ?: '-' }}</td>
                    <td>{{ $unit->location ?: '-' }}</td>
                    <td>{{ $unit->before_from ?: '-' }}</td>
                    <td>{{ $unit->remarks ?: '-' }}</td>
                    <td style="text-align: center;">
                        <span class="badge badge-{{ strtolower($unit->status) }}">
                            {{ $unit->status }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="20" style="text-align: center; color: #9ca3af; padding: 15px;">
                        Tidak ada data populasi unit yang ditemukan.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        Dokumen resmi inventaris alat plant. Laporan ini digenerate secara otomatis oleh Plant Operations Management System.
    </div>
</body>
</html>
