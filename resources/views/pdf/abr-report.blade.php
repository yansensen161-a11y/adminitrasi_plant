<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 15px 18px;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 8px;
            line-height: 1.25;
        }
        .header {
            border-bottom: 2px solid #374151;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 15px;
            font-weight: bold;
            color: #111827;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 8.5px;
            color: #4b5563;
            margin-top: 1px;
            font-weight: 600;
        }
        .meta-text {
            font-size: 7.5px;
            color: #6b7280;
            text-align: right;
        }
        .summary-bar {
            width: 100%;
            margin-bottom: 8px;
        }
        .stat-card {
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px 6px;
            text-align: center;
        }
        .stat-val {
            font-size: 11px;
            font-weight: bold;
            color: #111827;
        }
        .stat-label {
            font-size: 7px;
            text-transform: uppercase;
            color: #4b5563;
            font-weight: bold;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        .data-table th {
            background-color: #e5e7eb;
            color: #1f2937;
            font-weight: bold;
            font-size: 7.5px;
            text-transform: uppercase;
            padding: 4px 3px;
            text-align: left;
            border: 1px solid #9ca3af;
        }
        .data-table td {
            padding: 3px 3px;
            border: 1px solid #d1d5db;
            font-size: 7.5px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .footer {
            margin-top: 8px;
            font-size: 7px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td style="vertical-align: middle;">
                    <div class="logo-text">PT. MITRA ABADI MAHAKAM</div>
                    <div class="subtitle">LAPORAN ANALISA BIAYA REPAIR (ABR)</div>
                </td>
                <td style="vertical-align: middle; text-align: right;">
                    <div class="meta-text">
                        Dicetak: {{ $generatedAt }}<br>
                        @if(!empty($filters['date_from']) || !empty($filters['date_to']))
                            Periode: {{ $filters['date_from'] ?: '-' }} s/d {{ $filters['date_to'] ?: '-' }}<br>
                        @endif
                        @if(!empty($filters['code_unit']))
                            Unit: {{ $filters['code_unit'] }} |
                        @endif
                        @if(!empty($filters['kategori']))
                            Kategori: {{ $filters['kategori'] }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Stats -->
    <table class="summary-bar" cellspacing="6">
        <tr>
            <td width="33%">
                <div class="stat-card">
                    <div class="stat-val">Rp {{ number_format($stats['total_biaya'], 0, ',', '.') }}</div>
                    <div class="stat-label">Total Biaya Repair</div>
                </div>
            </td>
            <td width="33%">
                <div class="stat-card">
                    <div class="stat-val">{{ $stats['jumlah_repair'] }}</div>
                    <div class="stat-label">Jumlah Pekerjaan Repair</div>
                </div>
            </td>
            <td width="34%">
                <div class="stat-card">
                    <div class="stat-val">Rp {{ number_format($stats['rata_rata_biaya'], 0, ',', '.') }}</div>
                    <div class="stat-label">Rata-rata Biaya per Repair</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th width="3%" class="text-center">No</th>
                <th width="7%" class="text-center">No ABR</th>
                <th width="6%" class="text-center">Tanggal</th>
                <th width="6%" class="text-center">Kode Unit</th>
                <th width="7%" class="text-center">Equipment</th>
                <th width="7%" class="text-center">Model</th>
                <th width="20%">Deskripsi Pekerjaan</th>
                <th width="8%" class="text-center">Kategori</th>
                <th width="8%" class="text-center">No WO</th>
                <th width="4%" class="text-center">Qty</th>
                <th width="8%" class="text-right">Biaya Part</th>
                <th width="8%" class="text-right">Biaya Jasa</th>
                <th width="8%" class="text-right">Total Biaya</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-bold">{{ $item['no_abr'] }}</td>
                    <td class="text-center">{{ $item['tanggal'] }}</td>
                    <td class="text-center font-bold">{{ $item['code_unit'] }}</td>
                    <td class="text-center">{{ $item['equipment'] }}</td>
                    <td class="text-center">{{ $item['model'] }}</td>
                    <td>{{ $item['deskripsi'] }}</td>
                    <td class="text-center">{{ $item['kategori'] }}</td>
                    <td class="text-center" style="font-family: monospace;">{{ $item['no_wo'] }}</td>
                    <td class="text-center">{{ $item['qty'] }}</td>
                    <td class="text-right" style="font-family: monospace;">{{ number_format($item['biaya_part'], 0, ',', '.') }}</td>
                    <td class="text-right" style="font-family: monospace;">{{ number_format($item['biaya_jasa'], 0, ',', '.') }}</td>
                    <td class="text-right font-bold" style="font-family: monospace;">{{ number_format($item['total_biaya'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="13" class="text-center" style="padding: 15px; color: #9ca3af;">
                        Tidak ada data analisa biaya repair yang sesuai kriteria.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if(count($items) > 0)
            <tfoot>
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                    <td colspan="10" class="text-right font-bold">TOTAL :</td>
                    <td class="text-right font-bold" style="font-family: monospace;">
                        {{ number_format(collect($items)->sum('biaya_part'), 0, ',', '.') }}
                    </td>
                    <td class="text-right font-bold" style="font-family: monospace;">
                        {{ number_format(collect($items)->sum('biaya_jasa'), 0, ',', '.') }}
                    </td>
                    <td class="text-right font-bold" style="font-family: monospace;">
                        {{ number_format(collect($items)->sum('total_biaya'), 0, ',', '.') }}
                    </td>
                </tr>
            </tfoot>
        @endif
    </table>

</body>
</html>
