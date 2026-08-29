<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 15px 20px;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 8.5px;
            line-height: 1.3;
        }
        .header {
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 8px;
            margin-bottom: 8px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 16px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 8px;
            color: #6b7280;
            margin-top: 2px;
        }
        .summary-bar {
            width: 100%;
            margin-bottom: 8px;
        }
        .stat-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 5px 8px;
            text-align: center;
        }
        .stat-val {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
        }
        .stat-label {
            font-size: 7px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .data-table th {
            background-color: #7c3aed;
            color: #ffffff;
            font-weight: bold;
            font-size: 7.5px;
            text-transform: uppercase;
            padding: 5px 4px;
            text-align: left;
            border: 1px solid #6d28d9;
        }
        .data-table td {
            padding: 4.5px 4px;
            border: 1px solid #e5e7eb;
            font-size: 7.5px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 4px;
            text-align: center;
            font-size: 7px;
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
                    <div class="subtitle">Divisi Plant & Pemeliharaan Alat Berat • Log Hour Meter (HM)</div>
                </td>
                <td style="text-align: right;">
                    <div style="font-size: 11px; font-weight: bold; color: #111827;">{{ $title }}</div>
                    <div class="subtitle">Periode: {{ $dateRange }} | Dicetak: {{ $generatedAt }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary KPI Cards -->
    <table class="summary-bar" cellspacing="6">
        <tr>
            <td width="33.3%">
                <div class="stat-card">
                    <div class="stat-val">{{ $stats['total_logs'] }}</div>
                    <div class="stat-label">Total Log Catatan</div>
                </div>
            </td>
            <td width="33.3%">
                <div class="stat-card" style="border-left: 3px solid #7c3aed;">
                    <div class="stat-val" style="color: #7c3aed;">{{ number_format($stats['total_hours'], 1) }} Jam</div>
                    <div class="stat-label">Total Jam Operasi (HM)</div>
                </div>
            </td>
            <td width="33.3%">
                <div class="stat-card" style="border-left: 3px solid #10b981;">
                    <div class="stat-val" style="color: #059669;">{{ $stats['active_units'] }} Unit</div>
                    <div class="stat-label">Unit Beroperasi</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th width="4%" style="text-align: center;">No</th>
                <th width="10%">Tanggal</th>
                <th width="11%">CODE UNIT</th>
                <th width="9%" style="text-align: right;">HM Awal</th>
                <th width="9%" style="text-align: right;">HM Akhir</th>
                <th width="9%" style="text-align: right;">HM Operasi</th>
                <th width="8%">Shift</th>
                <th width="13%">Operator</th>
                <th width="12%">Lokasi</th>
                <th width="15%">Catatan / Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $index => $log)
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                    <td style="font-weight: bold; color: #4b5563;">{{ \Carbon\Carbon::parse($log->log_date)->translatedFormat('d/m/Y') }}</td>
                    <td><strong style="color: #7c3aed;">{{ $log->code_unit }}</strong></td>
                    <td style="text-align: right; font-family: monospace;">{{ number_format($log->hm_start, 1) }}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">{{ number_format($log->hm_end, 1) }}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold; color: #059669;">
                        +{{ number_format($log->hm_total, 1) }} H
                    </td>
                    <td>{{ $log->shift ?: '-' }}</td>
                    <td>{{ $log->operator_name ?: '-' }}</td>
                    <td>{{ $log->location ?: '-' }}</td>
                    <td>{{ $log->remarks ?: '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align: center; color: #9ca3af; padding: 20px;">
                        Tidak ada data log Hour Meter yang ditemukan untuk periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        Dokumen resmi pemantauan jam operasional alat berat. Laporan ini digenerate secara otomatis oleh Plant Operations Management System.
    </div>
</body>
</html>
