<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 25px 30px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 10px;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #0284c7;
            padding-bottom: 10px;
            margin-bottom: 16px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 18px;
            font-weight: bold;
            color: #0284c7;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 14px;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
        }
        .meta-table td {
            font-size: 9.5px;
            color: #475569;
            padding: 3px 6px;
        }
        .meta-table strong {
            color: #0f172a;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            border-left: 3px solid #0284c7;
            padding-left: 8px;
            margin-top: 18px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            padding: 5px 8px;
            border: 1px solid #1e293b;
            text-align: left;
        }
        .data-table td {
            padding: 4.5px 8px;
            border: 1px solid #e2e8f0;
            font-size: 8.5px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 1.5px 5px;
            border-radius: 3px;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-fk {
            background-color: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
        }
        .badge-eloquent {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }
        .badge-logical {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
        }
        .badge-pri {
            background-color: #fef08a;
            color: #854d0e;
            font-weight: bold;
        }
        .badge-col-fk {
            background-color: #dbeafe;
            color: #1d4ed8;
            font-weight: bold;
        }
        .category-header {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #0f172a;
            padding: 6px 8px;
            font-size: 10px;
            border: 1px solid #cbd5e1;
            margin-top: 14px;
            margin-bottom: 6px;
            border-radius: 4px;
        }
        .page-break {
            page-break-after: always;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 8px;
            color: #94a3b8;
            padding-top: 4px;
            text-align: right;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="logo-text">SYSTEM PLANT MANAGEMENT CMMS</div>
                    <div class="subtitle">Laporan Lengkap Skema Database & Relasi Antar Tabel (ERD)</div>
                </td>
                <td style="text-align: right;">
                    <div style="font-size: 13px; font-weight: bold; color: #0284c7;">DOKUMEN SKEMA TEKNIKAL</div>
                    <div class="subtitle">Dicetak pada: {{ $printed_at }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Metadata Ringkasan -->
    <table class="meta-table">
        <tr>
            <td width="25%"><strong>Total Tabel:</strong> {{ $stats['total_tables'] }} Tabel</td>
            <td width="25%"><strong>Total Jalur Relasi:</strong> {{ $stats['total_links'] }} Koneksi</td>
            <td width="25%"><strong>Status Konektivitas:</strong> <span style="color: #16a34a; font-weight: bold;">100% Terhubung</span></td>
            <td width="25%"><strong>Dicetak Oleh:</strong> {{ $user_name }}</td>
        </tr>
        <tr>
            <td><strong>Modul Fleet:</strong> {{ $stats['module_counts']['fleet'] ?? 0 }} Tabel</td>
            <td><strong>Modul Work Order:</strong> {{ $stats['module_counts']['work_order'] ?? 0 }} Tabel</td>
            <td><strong>Modul Inspeksi:</strong> {{ $stats['module_counts']['inspection'] ?? 0 }} Tabel</td>
            <td><strong>Modul Tools:</strong> {{ $stats['module_counts']['tool'] ?? 0 }} Tabel</td>
        </tr>
    </table>

    <!-- Bagian 1: Matriks Relasi Antar Tabel -->
    <div class="section-title">1. Matriks Relasi Antar Tabel (Entity Relationships)</div>
    <p style="font-size: 8.5px; color: #64748b; margin-bottom: 6px;">
        Daftar lengkap koneksi keterkaitan data antar tabel mencakup Foreign Key Database, Relasi Model Eloquent, dan Relasi Domain CMMS.
    </p>

    <table class="data-table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="24%">Tabel & Kolom Asal (Source)</th>
                <th width="5%" style="text-align: center;">Arah</th>
                <th width="24%">Tabel & Kolom Tujuan (Target)</th>
                <th width="22%">Tipe Relasi</th>
                <th width="20%">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($links as $index => $link)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>
                    <strong style="color: #0f172a;">{{ $link['source'] }}</strong><br>
                    <span style="font-family: monospace; color: #b45309;">{{ $link['sourceCol'] }}</span>
                </td>
                <td style="text-align: center; color: #0284c7; font-weight: bold;">➔</td>
                <td>
                    <strong style="color: #0f172a;">{{ $link['target'] }}</strong><br>
                    <span style="font-family: monospace; color: #15803d;">{{ $link['targetCol'] }}</span>
                </td>
                <td>
                    @if($link['type'] === 'database_fk')
                        <span class="badge badge-fk">Foreign Key Database</span>
                    @elseif($link['type'] === 'eloquent')
                        <span class="badge badge-eloquent">Relasi Eloquent</span>
                    @else
                        <span class="badge badge-logical">Relasi Domain / Logikal</span>
                    @endif
                </td>
                <td style="color: #64748b;">{{ $link['description'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- Bagian 2: Kamus Data Tabel & Kolom -->
    <div class="section-title">2. Kamus Data & Struktur Tabel per Modul</div>
    <p style="font-size: 8.5px; color: #64748b; margin-bottom: 8px;">
        Rincian skema seluruh tabel database, tipe kolom, Primary Key, Foreign Key, dan status keterkaitan.
    </p>

    @foreach($grouped_nodes as $categoryKey => $group)
        <div class="category-header">
            MODUL: {{ strtoupper($group['label']) }} ({{ count($group['tables']) }} Tabel)
        </div>

        @foreach($group['tables'] as $table)
            <div style="margin-top: 8px; margin-bottom: 4px;">
                <table style="width: 100%;">
                    <tr>
                        <td>
                            <strong style="font-size: 10px; color: #0284c7;">{{ $table['label'] }}</strong>
                            <span style="font-family: monospace; color: #475569; font-size: 9px;">({{ $table['name'] }})</span>
                        </td>
                        <td style="text-align: right; font-size: 8.5px; color: #64748b;">
                            Baris Data: <strong>{{ number_format($table['row_count']) }}</strong> |
                            Total Kolom: <strong>{{ count($table['columns']) }}</strong> |
                            Koneksi Relasi: <strong>{{ $table['connection_count'] }}</strong>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="data-table" style="margin-bottom: 10px;">
                <thead>
                    <tr>
                        <th width="30%">Nama Kolom</th>
                        <th width="25%">Tipe Data</th>
                        <th width="20%">Atribut Kunci</th>
                        <th width="25%">Keterangan Nullable</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($table['columns'] as $col)
                    <tr>
                        <td style="font-family: monospace; font-weight: bold; color: #0f172a;">{{ $col['name'] }}</td>
                        <td style="font-family: monospace; color: #475569;">{{ $col['type'] }}</td>
                        <td>
                            @if($col['key'] === 'PRI')
                                <span class="badge badge-pri">PRIMARY KEY</span>
                            @elseif(in_array($col['name'], $table['fk_columns']))
                                <span class="badge badge-col-fk">FOREIGN KEY</span>
                            @elseif($col['key'] === 'UNI')
                                <span class="badge badge-fk">UNIQUE</span>
                            @elseif($col['key'] === 'MUL')
                                <span style="color: #64748b; font-size: 8px;">INDEX</span>
                            @else
                                <span style="color: #94a3b8;">-</span>
                            @endif
                        </td>
                        <td style="color: {{ $col['nullable'] ? '#16a34a' : '#64748b' }};">
                            {{ $col['nullable'] ? 'Boleh Kosong (NULL)' : 'Wajib (NOT NULL)' }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endforeach
    @endforeach

    <div class="footer">
        Plant Maintenance System CMMS &bull; Dokumen Rahasia & Hak Milik Perusahaan &bull; Halaman Skema Database
    </div>
</body>
</html>
