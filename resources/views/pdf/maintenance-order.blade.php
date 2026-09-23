<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOL - {{ $order->no_order }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 12mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            font-size: 8.5pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
        }

        /* Top Action Bar (Hidden on Print) */
        .no-print-bar {
            background-color: #064e3b;
            color: #ffffff;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .no-print-bar .title {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .btn-group {
            display: flex;
            gap: 10px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            border: none;
            transition: all 0.15s ease-in-out;
        }

        .btn-print {
            background-color: #10b981;
            color: #ffffff;
        }
        .btn-print:hover {
            background-color: #059669;
        }

        .btn-pdf {
            background-color: #3b82f6;
            color: #ffffff;
        }
        .btn-pdf:hover {
            background-color: #2563eb;
        }

        .btn-close {
            background-color: #374151;
            color: #ffffff;
        }
        .btn-close:hover {
            background-color: #1f2937;
        }

        /* Printable Paper Container */
        .page-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 15px auto;
            background: #ffffff;
            padding: 12mm 14mm;
            border: 1px solid #d1d5db;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        /* Header Document */
        .doc-header {
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 10px;
            width: 100%;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: middle;
        }

        .company-name {
            font-size: 14pt;
            font-weight: 900;
            letter-spacing: 0.8px;
            color: #064e3b;
            text-transform: uppercase;
        }

        .company-sub {
            font-size: 8pt;
            font-weight: bold;
            color: #4b5563;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .doc-title-main {
            font-size: 13pt;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #111827;
            text-align: right;
        }

        .mol-badge {
            display: inline-block;
            font-size: 10pt;
            font-family: monospace;
            font-weight: bold;
            background-color: #ecfdf5;
            color: #065f46;
            padding: 2px 8px;
            border: 1.5px solid #059669;
            border-radius: 4px;
            margin-top: 3px;
        }

        /* 3-Column Metadata Grid */
        .grid-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 0;
            margin-bottom: 10px;
        }

        .grid-cell {
            border: 1px solid #9ca3af;
            border-radius: 5px;
            padding: 7px 9px;
            vertical-align: top;
            background-color: #fafafa;
        }

        .box-heading {
            font-size: 8pt;
            font-weight: bold;
            color: #064e3b;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 3px;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }

        .meta-info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }

        .meta-info-table td {
            padding: 2px 0;
            vertical-align: top;
        }

        .lbl {
            width: 75px;
            color: #4b5563;
            font-weight: normal;
        }

        .val {
            font-weight: bold;
            color: #111827;
        }

        /* Badges */
        .prio-badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
            border: 1px solid transparent;
        }
        .prio-p1 { background: #fee2e2; color: #991b1b; border-color: #f87171; }
        .prio-p2 { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
        .prio-p3 { background: #e0e7ff; color: #3730a3; border-color: #a5b4fc; }
        .prio-backlog { background: #f3e8ff; color: #6b21a8; border-color: #d8b4fe; }

        .status-badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
            background-color: #f3f4f6;
            color: #1f2937;
            border: 1px solid #d1d5db;
        }

        /* Problem & Action Container */
        .section-box {
            border: 1px solid #9ca3af;
            border-radius: 5px;
            margin-bottom: 10px;
            overflow: hidden;
        }

        .section-box-header {
            background-color: #e5e7eb;
            color: #1f2937;
            font-weight: bold;
            font-size: 8pt;
            padding: 4px 8px;
            border-bottom: 1px solid #9ca3af;
            text-transform: uppercase;
        }

        .section-box-body {
            padding: 6px 8px;
            font-size: 8pt;
            color: #111827;
            white-space: pre-line;
            background-color: #ffffff;
            min-height: 24px;
        }

        /* Parts Table */
        .parts-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 12px;
        }

        .parts-table th, .parts-table td {
            border: 1px solid #6b7280;
            padding: 4px 6px;
        }

        .parts-table th {
            background-color: #e5e7eb;
            color: #111827;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7.5pt;
            text-align: center;
        }

        .font-mono {
            font-family: monospace;
            font-weight: bold;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* Signatures Section */
        .sig-container {
            margin-top: 15px;
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
        }

        .sig-box {
            width: 25%;
            border: 1px solid #9ca3af;
            text-align: center;
            vertical-align: top;
            padding: 4px;
        }

        .sig-title {
            font-size: 7.5pt;
            font-weight: bold;
            background-color: #f3f4f6;
            padding: 3px 0;
            border-bottom: 1px solid #d1d5db;
            text-transform: uppercase;
            color: #374151;
            margin-bottom: 45px;
        }

        .sig-name {
            font-size: 8pt;
            font-weight: bold;
            border-top: 1px solid #111827;
            display: inline-block;
            min-width: 80%;
            padding-top: 2px;
            margin-top: 4px;
            color: #111827;
        }

        .sig-role {
            font-size: 7pt;
            color: #6b7280;
            font-style: italic;
        }

        /* Print Specific Rules */
        @media print {
            body {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .no-print-bar {
                display: none !important;
            }

            .page-container {
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
            }
        }
    </style>
</head>
<body>

    @if(!empty($isBrowserPrint))
    <!-- Top Action Toolbar (Browser view only, hidden when printing) -->
    <div class="no-print-bar">
        <div class="title">
            📄 PREVIEW CETAK DOKUMEN: {{ $order->no_order }}
        </div>
        <div class="btn-group">
            <button type="button" onclick="window.print()" class="btn btn-print">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                CETAK SEKARANG (PRINT)
            </button>
            <a href="{{ route('monitoring-orderan.pdf', $order->id) }}" target="_blank" class="btn btn-pdf">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                UNDUH PDF
            </a>
            <button type="button" onclick="window.close()" class="btn btn-close">
                TUTUP
            </button>
        </div>
    </div>
    @endif

    <div class="page-container">
        <!-- Header -->
        <div class="doc-header">
            <table class="header-table">
                <tr>
                    <td width="60%">
                        <div class="company-name">PT. MANDIRI ABADI MINERAL</div>
                        <div class="company-sub">PLANT & MAINTENANCE DEPARTMENT</div>
                    </td>
                    <td width="40%" class="text-right">
                        <div class="doc-title-main">MAINTENANCE ORDER LIST</div>
                        <div class="mol-badge">{{ $order->no_order }}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- 3 Info Boxes Grid -->
        <table class="grid-table">
            <tr>
                <!-- Col 1: Informasi Order -->
                <td width="33%" class="grid-cell">
                    <div class="box-heading">1. INFORMASI ORDER</div>
                    <table class="meta-info-table">
                        <tr>
                            <td class="lbl">No. MOL</td>
                            <td>: <span class="val font-mono">{{ $order->no_order }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Tanggal</td>
                            <td>: <span class="val">{{ $order->tanggal ? \Carbon\Carbon::parse($order->tanggal)->format('d/m/Y') : '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Prioritas</td>
                            <td>: 
                                @php
                                    $prioClass = match(strtoupper($order->priority)) {
                                        'P1', 'HIGH', 'EMERGENCY' => 'prio-p1',
                                        'P2', 'MEDIUM' => 'prio-p2',
                                        'P3', 'LOW' => 'prio-p3',
                                        'BACKLOG' => 'prio-backlog',
                                        default => 'prio-p2'
                                    };
                                @endphp
                                <span class="prio-badge {{ $prioClass }}">{{ $order->priority ?: 'NORMAL' }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="lbl">Status</td>
                            <td>: <span class="status-badge">{{ $order->status ?: 'OPEN' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Order By</td>
                            <td>: <span class="val">{{ $order->pic ?: '-' }}</span></td>
                        </tr>
                    </table>
                </td>

                <!-- Col 2: Spesifikasi Unit -->
                <td width="33%" class="grid-cell">
                    <div class="box-heading">2. INFORMASI UNIT</div>
                    <table class="meta-info-table">
                        <tr>
                            <td class="lbl">Code Unit</td>
                            <td>: <span class="val font-mono" style="color: #065f46;">{{ $order->unit->code_unit ?? ($order->lokasi ?: '-') }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Model Unit</td>
                            <td>: <span class="val">{{ $order->unit->model ?? ($order->unit->type_unit ?? '-') }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Serial No.</td>
                            <td>: <span class="val">{{ $order->unit->sn_chassis ?? '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Hour Meter</td>
                            <td>: <span class="val">{{ $order->hm ? number_format((float)$order->hm, 1, ',', '.') . ' HM' : '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Lokasi / Site</td>
                            <td>: <span class="val">{{ $order->lokasi ?: '-' }}</span></td>
                        </tr>
                    </table>
                </td>

                <!-- Col 3: Komponen & Downtime -->
                <td width="34%" class="grid-cell">
                    <div class="box-heading">3. PEKERJAAN & DOWNTIME</div>
                    <table class="meta-info-table">
                        <tr>
                            <td class="lbl">Komponen</td>
                            <td>: <span class="val">{{ $order->component_name ?: ($order->component ?: '-') }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Downtime In</td>
                            <td>: <span class="val">{{ $order->downtime_start ? \Carbon\Carbon::parse($order->downtime_start)->format('d/m/Y H:i') : '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Downtime Out</td>
                            <td>: <span class="val">{{ $order->downtime_end ? \Carbon\Carbon::parse($order->downtime_end)->format('d/m/Y H:i') : '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Actual Start</td>
                            <td>: <span class="val">{{ $order->actual_start ?: '-' }}</span></td>
                        </tr>
                        <tr>
                            <td class="lbl">Actual Finish</td>
                            <td>: <span class="val">{{ $order->actual_end ?: '-' }}</span></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Problem & Action Taken Boxes -->
        <div class="section-box">
            <div class="section-box-header">DESKRIPSI KERUSAKAN / MASALAH (PROBLEM / FINDING)</div>
            <div class="section-box-body">{{ $order->root_cause ?: 'Tidak ada catatan kerusakan khusus.' }}</div>
        </div>

        <div class="section-box">
            <div class="section-box-header">TINDAKAN PERBAIKAN / CATATAN PEKERJAAN (ACTION TAKEN / REMARKS)</div>
            <div class="section-box-body">{{ $order->action_taken ?: 'Tidak ada catatan tindakan khusus.' }}</div>
        </div>

        <!-- Parts Table -->
        <div style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 4px; color: #111827;">
            DAFTAR KEBUTUHAN PART & PENGADAAN (PARTS ORDER LIST)
        </div>

        <table class="parts-table">
            <thead>
                <tr>
                    <th width="4%">NO</th>
                    <th width="18%">PART NUMBER</th>
                    <th width="30%">DESCRIPTION / NAMA PART</th>
                    <th width="8%">QTY</th>
                    <th width="13%">NO PR</th>
                    <th width="13%">NO PO</th>
                    <th width="14%">ETA PART</th>
                </tr>
            </thead>
            <tbody>
                @forelse($order->parts as $idx => $part)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="font-mono">{{ $part->part_number ?: '-' }}</td>
                    <td>
                        {{ $part->department ?: ($part->component ?: '-') }}
                        @if($part->swapToUnit)
                            <div style="color: #2563eb; font-size: 7pt; font-weight: bold; margin-top: 2px;">
                                ⇄ Kanibal ke: {{ $part->swapToUnit->code_unit }}
                            </div>
                        @endif
                    </td>
                    <td class="text-center font-bold">{{ $part->qty ?: 1 }} {{ $part->satuan ?: 'Pcs' }}</td>
                    <td class="font-mono">{{ $part->pr ?: '-' }}</td>
                    <td class="font-mono">{{ $part->po ?: '-' }}</td>
                    <td class="text-center font-bold" style="color: #065f46;">
                        {{ ($part->due_date_part && $part->due_date_part !== '-' && $part->due_date_part !== '1970-01-01') ? \Carbon\Carbon::parse($part->due_date_part)->format('d/m/Y') : '-' }}
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 10px; color: #6b7280;">
                        Tidak ada data part yang terdaftar.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Signatures Box -->
        <table class="sig-container">
            <tr>
                <td class="sig-box">
                    <div class="sig-title">DIBUAT OLEH:</div>
                    <div class="sig-name">{{ $order->pic ?: '........................' }}</div>
                    <div class="sig-role">Requester / PIC</div>
                </td>
                <td class="sig-box">
                    <div class="sig-title">DIPERIKSA OLEH:</div>
                    <div class="sig-name">........................</div>
                    <div class="sig-role">Foreman / Planner</div>
                </td>
                <td class="sig-box">
                    <div class="sig-title">DISETUJUI OLEH:</div>
                    <div class="sig-name">........................</div>
                    <div class="sig-role">Superintendent Plant</div>
                </td>
                <td class="sig-box">
                    <div class="sig-title">DITERIMA OLEH:</div>
                    <div class="sig-name">........................</div>
                    <div class="sig-role">Logistik / Warehouse</div>
                </td>
            </tr>
        </table>
    </div>

    @if(!empty($isBrowserPrint))
    <script>
        // Auto trigger print if autoprint=1 query param is given
        if (new URLSearchParams(window.location.search).get('autoprint') === '1') {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            });
        }
    </script>
    @endif

</body>
</html>
