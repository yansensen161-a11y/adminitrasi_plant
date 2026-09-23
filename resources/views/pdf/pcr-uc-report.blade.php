<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 12px 14px 28px 14px;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 6.8px;
            line-height: 1.25;
            margin: 0;
            padding: 0;
        }
        .header-container {
            border-bottom: 2px solid #0b6e4f;
            padding-bottom: 6px;
            margin-bottom: 6px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .company-name {
            font-size: 13px;
            font-weight: 800;
            color: #0b6e4f;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .dept-title {
            font-size: 7.5px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 1px;
        }
        .doc-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
            letter-spacing: 0.2px;
        }
        .meta-info {
            text-align: right;
            font-size: 6.8px;
            color: #475569;
            line-height: 1.4;
        }
        .meta-tag {
            font-weight: bold;
            color: #0b6e4f;
        }

        /* KPI Stat Cards */
        .summary-bar {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .summary-bar td {
            padding: 0 3px;
        }
        .summary-bar td:first-child { padding-left: 0; }
        .summary-bar td:last-child { padding-right: 0; }
        .stat-card {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 3px 6px;
            text-align: center;
        }
        .stat-val {
            font-size: 11px;
            font-weight: 800;
            line-height: 1;
        }
        .stat-label {
            font-size: 6px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            margin-top: 2px;
        }
        .stat-total .stat-val { color: #0284c7; }
        .stat-good .stat-val { color: #16a34a; }
        .stat-due .stat-val { color: #d97706; }
        .stat-overdue .stat-val { color: #dc2626; }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
        }
        .data-table th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 700;
            font-size: 6px;
            text-transform: uppercase;
            padding: 4px 2px;
            border: 1px solid #0f172a;
            text-align: center;
            vertical-align: middle;
        }
        .data-table td {
            padding: 2.5px 2px;
            border: 1px solid #e2e8f0;
            font-size: 6.2px;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        /* Alignment Utilities */
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Consolas', 'Courier New', Courier, monospace; }
        .font-bold { font-weight: bold; }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 1px 3px;
            border-radius: 2px;
            font-size: 5.5px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }
        .badge-good {
            background-color: #dcfce7;
            color: #15803d;
            border: 0.5px solid #86efac;
        }
        .badge-due {
            background-color: #fef3c7;
            color: #b45309;
            border: 0.5px solid #fde68a;
        }
        .badge-overdue {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 0.5px solid #fca5a5;
        }

        .rem-pos { color: #16a34a; font-weight: bold; }
        .rem-neg { color: #dc2626; font-weight: bold; }

        /* Summary / Footer Row */
        .summary-row td {
            background-color: #e2e8f0 !important;
            font-weight: bold;
            font-size: 6.5px;
            border-top: 1px solid #94a3b8;
            border-bottom: 2px solid #0f172a;
            padding: 3px 2px;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <div class="header-container">
        <table class="header-table">
            <tr>
                <td style="width: 60%; vertical-align: top;">
                    <div class="company-name">{{ $company }}</div>
                    <div class="dept-title">{{ $department }}</div>
                    <div class="doc-title">{{ $title }}</div>
                </td>
                <td style="width: 40%; vertical-align: top;" class="meta-info">
                    <div>Waktu Cetak: <span class="meta-tag">{{ $generatedAt }}</span></div>
                    <div>Filter Aktif: <span class="meta-tag">{{ $filterSummary }}</span></div>
                    <div>Total Komponen: <span class="meta-tag">{{ number_format($stats['total']) }} Unit Data</span></div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary KPI Bar -->
    <table class="summary-bar">
        <tr>
            <td style="width: 25%;">
                <div class="stat-card stat-total">
                    <div class="stat-val">{{ number_format($stats['total']) }}</div>
                    <div class="stat-label">Total Komponen</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="stat-card stat-good">
                    <div class="stat-val">{{ number_format($stats['good']) }}</div>
                    <div class="stat-label">Normal / Good ({{ $stats['total'] > 0 ? round(($stats['good'] / $stats['total']) * 100, 1) : 0 }}%)</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="stat-card stat-due">
                    <div class="stat-val">{{ number_format($stats['due_soon']) }}</div>
                    <div class="stat-label">Due Soon / Fair ({{ $stats['total'] > 0 ? round(($stats['due_soon'] / $stats['total']) * 100, 1) : 0 }}%)</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="stat-card stat-overdue">
                    <div class="stat-val">{{ number_format($stats['overdue']) }}</div>
                    <div class="stat-label">Overdue / Poor ({{ $stats['total'] > 0 ? round(($stats['overdue'] / $stats['total']) * 100, 1) : 0 }}%)</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 7%;">CODE UNIT</th>
                <th style="width: 9%;">MODEL</th>
                <th style="width: 9%;">PART NUMBER</th>
                <th style="width: 12%;">COMPONENT</th>
                <th style="width: 12%;">DESCRIPTION</th>
                <th style="width: 10%;">BRAND / VENDOR</th>
                <th style="width: 6%;">TARGET (HRS)</th>
                <th style="width: 6%;">HM REPLACE</th>
                <th style="width: 6%;">DATE REPLACE</th>
                <th style="width: 6%;">CURRENT HM</th>
                <th style="width: 5%;">REMAINING</th>
                <th style="width: 4%;">LIFE %</th>
                <th style="width: 5%;">STATUS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-bold">{{ $item->code_unit }}</td>
                    <td class="text-left">{{ $item->model }}</td>
                    <td class="text-center font-mono">{{ $item->part_number }}</td>
                    <td class="text-left font-bold">{{ $item->component }}</td>
                    <td class="text-left">{{ $item->description }}</td>
                    <td class="text-center font-bold" style="color: #0f766e;">{{ $item->brand_produk }}</td>
                    <td class="text-right">{{ $item->target_life_time > 0 ? number_format($item->target_life_time, 0, ',', '.') : '-' }}</td>
                    <td class="text-right">{{ $item->hm_replace > 0 ? number_format($item->hm_replace, 1, ',', '.') : '-' }}</td>
                    <td class="text-center font-mono">{{ $item->date_replace }}</td>
                    <td class="text-right font-bold">{{ $item->hm_current > 0 ? number_format($item->hm_current, 1, ',', '.') : '-' }}</td>
                    <td class="text-right {{ $item->remaining < 0 ? 'rem-neg' : 'rem-pos' }}">
                        {{ number_format($item->remaining, 1, ',', '.') }}
                    </td>
                    <td class="text-right font-bold">{{ number_format($item->life_time_pct, 1) }}%</td>
                    <td class="text-center">
                        @php
                            $st = strtoupper($item->status);
                        @endphp
                        @if(in_array($st, ['GOOD', 'ON SCHEDULE', 'AMAN', 'NORMAL']))
                            <span class="badge badge-good">{{ $st }}</span>
                        @elseif(in_array($st, ['FAIR', 'DUE SOON', 'WARNING', 'WASPADA']))
                            <span class="badge badge-due">{{ $st }}</span>
                        @else
                            <span class="badge badge-overdue">{{ $st }}</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="14" class="text-center" style="padding: 12px; color: #94a3b8;">
                        Tidak ada data komponen PCR / UC yang sesuai dengan filter yang dipilih.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if(count($items) > 0)
            <tfoot>
                <tr class="summary-row">
                    <td colspan="7" class="text-right">RATA-RATA / TOTAL ({{ number_format(count($items)) }} KOMPONEN) :</td>
                    <td class="text-right">{{ number_format($items->avg('target_life_time'), 0, ',', '.') }}</td>
                    <td class="text-right">-</td>
                    <td class="text-center">-</td>
                    <td class="text-right">{{ number_format($items->avg('hm_current'), 1, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($items->avg('remaining'), 1, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($items->avg('life_time_pct'), 1) }}%</td>
                    <td class="text-center">{{ count($items) }} Item</td>
                </tr>
            </tfoot>
        @endif
    </table>

    <!-- DomPDF Script for Dynamic Page Numbering -->
    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->getFont("Helvetica", "normal");
            $size = 6.5;
            $pageText = "Halaman {PAGE_NUM} dari {PAGE_COUNT}   |   PT. MITRA ABADI MAHAKAM - Plant Department (PCR & UC Report)   |   Dicetak: " . date('d/m/Y H:i') . " WITA";
            $pdf->page_text(230, 580, $pageText, $font, $size, array(0.4, 0.45, 0.5));
        }
    </script>
</body>
</html>
