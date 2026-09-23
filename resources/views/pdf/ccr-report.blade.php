<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Conditions Component Report - {{ $report->report_no }}</title>
    <style>
        @page {
            margin: 8mm 10mm;
            size: a4 landscape;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 8.5pt;
            line-height: 1.25;
            margin: 0;
            padding: 0;
        }
        .header-banner {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            background-color: #a8d08d;
            border: 1.5px solid #2e7d32;
        }
        .header-banner td {
            vertical-align: middle;
            padding: 4px 8px;
        }
        .logo-img {
            max-height: 38px;
            max-width: 140px;
        }
        .report-title {
            font-size: 15pt;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.5px;
            color: #000;
            text-transform: uppercase;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .meta-table td {
            vertical-align: top;
            padding: 2px 4px;
            font-size: 8pt;
        }
        .field-label {
            font-weight: bold;
            font-size: 8pt;
            color: #000;
        }
        .field-sublabel {
            font-style: italic;
            font-size: 7pt;
            color: #333;
        }
        .field-val-line {
            border-bottom: 1px solid #444;
            padding-bottom: 1px;
            min-height: 14px;
            font-weight: bold;
            color: #111;
        }

        .yellow-box {
            background-color: #ffff00;
            font-weight: bold;
            padding: 3px 6px;
            border: 1px solid #c9c900;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            margin-bottom: 12px;
        }
        .data-table th, .data-table td {
            border: 1px solid #555;
            padding: 6px;
        }
        .data-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8.5pt;
            text-align: center;
        }

        .sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .sign-table td {
            width: 33.33%;
            text-align: center;
            vertical-align: top;
            padding: 2px 8px;
        }
        .sign-role {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 40px;
        }
        .sign-name {
            font-weight: bold;
            font-size: 8.5pt;
            border-bottom: 1px dotted #333;
            display: inline-block;
            min-width: 140px;
            padding: 0 10px;
        }
        .sign-title {
            font-size: 8pt;
            color: #444;
            margin-top: 2px;
        }
    </style>
</head>
<body>

    <!-- Header Banner -->
    <table class="header-banner">
        <tr>
            <td style="width: 15%;">
                <img src="{{ public_path('images/logo.png') }}" class="logo-img" alt="Logo MAM" onerror="this.style.display='none'">
            </td>
            <td class="report-title" style="width: 60%;">
                CONDITIONS COMPONENT REPORT (CCR)
            </td>
            <td style="width: 25%; text-align: right; vertical-align: middle; font-size: 8pt; font-weight: bold; padding-right: 8px;">
                <div style="font-size: 7.5pt; color: #1b5e20;">NO. WO CCR:</div>
                <div style="font-size: 9pt; color: #000; font-family: monospace;">{{ $report->report_no }}</div>
            </td>
        </tr>
    </table>

    <!-- Specification Metadata Table -->
    <table class="meta-table">
        <tr>
            <!-- Left Column -->
            <td style="width: 48%; padding-right: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 30%;">
                            <div class="field-label">PROJECT</div>
                            <div class="field-sublabel">Proyek</div>
                        </td>
                        <td style="width: 4%;">:</td>
                        <td style="width: 66%;">
                            <div class="field-val-line">{{ $report->project ?: '-' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">LOCATION</div>
                            <div class="field-sublabel">Lokasi</div>
                        </td>
                        <td>:</td>
                        <td>
                            <div class="field-val-line">{{ $report->location ?: '-' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">DATE REPORTED</div>
                            <div class="field-sublabel">Tanggal dilaporkan</div>
                        </td>
                        <td>:</td>
                        <td>
                            <div class="field-val-line">{{ $report->date_reported ? \Carbon\Carbon::parse($report->date_reported)->format('d/m/Y') : '-' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">REPORTED BY</div>
                            <div class="field-sublabel">Dilaporkan oleh</div>
                        </td>
                        <td>:</td>
                        <td>
                            <div class="field-val-line">{{ $report->reported_by ?: '-' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">COMPANY NAME</div>
                            <div class="field-sublabel">Nama perusahaan</div>
                        </td>
                        <td>:</td>
                        <td>
                            <div class="field-val-line">{{ $report->company_name ?: 'PT. MITRA ABADI MAHAKAM' }}</div>
                        </td>
                    </tr>
                </table>
            </td>

            <!-- Right Column -->
            <td style="width: 52%; padding-left: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 25%;">
                            <div class="field-label">UNIT ID</div>
                            <div class="field-sublabel">No. Unit</div>
                        </td>
                        <td style="width: 4%;">:</td>
                        <td colspan="3" style="width: 71%;">
                            <div class="field-val-line">{{ $report->unit_code ?: ($report->unit->code_unit ?? '-') }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">MODEL</div>
                            <div class="field-sublabel">Model</div>
                        </td>
                        <td>:</td>
                        <td colspan="3">
                            <div class="field-val-line">{{ $report->model ?: ($report->unit->model ?? '-') }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">SERIAL NO.</div>
                            <div class="field-sublabel">Serial No.</div>
                        </td>
                        <td>:</td>
                        <td colspan="3">
                            <div class="field-val-line">{{ $report->serial_no ?: ($report->unit->sn_chassis ?? '-') }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">DATE INSTALL</div>
                            <div class="field-sublabel">Tanggal saat kejadian</div>
                        </td>
                        <td>:</td>
                        <td style="width: 33%;">
                            <div class="field-val-line">{{ $report->date_install ? \Carbon\Carbon::parse($report->date_install)->format('d/m/Y') : '-' }}</div>
                        </td>
                        <td style="width: 20%; padding-left: 6px;">
                            <div class="field-label" style="font-size: 7.5pt;">HM Install</div>
                            <div class="field-sublabel" style="font-size: 6.5pt;">SMU saat kejadian</div>
                        </td>
                        <td style="width: 18%;">
                            <div class="field-val-line" style="text-align: right;">{{ $report->hm_install !== null ? number_format($report->hm_install, 0) : '-' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field-label">DATE OF FAILURE</div>
                            <div class="field-sublabel">Tanggal saat kejadian</div>
                        </td>
                        <td>:</td>
                        <td>
                            <div class="field-val-line">{{ $report->date_failure ? \Carbon\Carbon::parse($report->date_failure)->format('d/m/Y') : '-' }}</div>
                        </td>
                        <td style="padding-left: 6px;">
                            <div class="field-label" style="font-size: 7.5pt;">Hm Failure</div>
                            <div class="field-sublabel" style="font-size: 6.5pt;">SMU saat kejadian</div>
                        </td>
                        <td>
                            <div class="field-val-line" style="text-align: right;">{{ $report->hm_failure !== null ? number_format($report->hm_failure, 0).' Hrs' : '- Hrs' }}</div>
                        </td>
                    </tr>
                    <tr class="yellow-box">
                        <td style="background-color: #ffff00; padding: 3px;">
                            <div class="field-label">Life time</div>
                            <div class="field-sublabel">Umur parts</div>
                        </td>
                        <td style="background-color: #ffff00;">:</td>
                        <td style="background-color: #ffff00; text-align: center; font-weight: bold; font-size: 9pt;">
                            {{ $report->life_time_days !== null ? $report->life_time_days.' Days' : '0 Days' }}
                        </td>
                        <td style="background-color: #ffff00; padding-left: 6px;">
                            <div class="field-label" style="font-size: 7.5pt;">HM Life</div>
                            <div class="field-sublabel" style="font-size: 6.5pt;">SMU saat kejadian</div>
                        </td>
                        <td style="background-color: #ffff00; text-align: right; font-weight: bold; font-size: 9pt;">
                            {{ $report->hm_life !== null ? number_format($report->hm_life, 0).' Hrs' : '0 Hrs' }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Remarks & Pictures Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">NO</th>
                <th style="width: 45%;">REMARKS</th>
                <th style="width: 50%;">PICTURE</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report->items as $index => $item)
            <tr>
                <td style="text-align: center; vertical-align: top; font-weight: bold;">
                    {{ $item->item_no ?: ($index + 1) }}
                </td>
                <td style="vertical-align: top; padding: 10px; font-size: 8.5pt;">
                    {!! nl2br(e($item->remarks)) !!}
                </td>
                <td style="text-align: center; vertical-align: middle; padding: 8px;">
                    @if($item->picture_path && file_exists(storage_path('app/public/' . $item->picture_path)))
                        <img src="{{ storage_path('app/public/' . $item->picture_path) }}" style="max-height: 140px; max-width: 95%; object-fit: contain; border: 1px solid #ccc;">
                    @elseif($item->picture_path && file_exists(public_path($item->picture_path)))
                        <img src="{{ public_path($item->picture_path) }}" style="max-height: 140px; max-width: 95%; object-fit: contain; border: 1px solid #ccc;">
                    @else
                        <div style="color: #999; font-style: italic; padding: 20px 0;">No picture attached</div>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td style="text-align: center; height: 100px;">1</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; height: 100px;">2</td>
                <td></td>
                <td></td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Signatures Table -->
    <table class="sign-table">
        <tr>
            <td>
                <div class="sign-role">Dibuat Oleh,</div>
                <div class="sign-name">
                    ( &nbsp; {{ $report->dibuat_oleh ?: '____________________' }} &nbsp; )
                </div>
            </td>
            <td>
                <div class="sign-role">Disetujui Oleh,<br><span style="font-size: 7.5pt; font-weight: normal;">Spv/Fm</span></div>
                <div class="sign-name">
                    ( &nbsp; {{ $report->disetujui_oleh ?: '____________________' }} &nbsp; )
                </div>
            </td>
            <td>
                <div class="sign-role">Diketahui Oleh,<br><span style="font-size: 7.5pt; font-weight: normal;">Superintendant</span></div>
                <div class="sign-name">
                    ( &nbsp; {{ $report->diketahui_oleh ?: '____________________' }} &nbsp; )
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
