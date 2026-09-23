<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>PM Service Sheet Dump Truck - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 5mm 7mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 7.2pt;
            line-height: 1.15;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-before: always;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 0;
        }
        .header-table td {
            padding: 3px 6px;
            vertical-align: middle;
        }
        .meta-grid {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
        }
        .meta-grid td {
            vertical-align: top;
            padding: 3px 5px;
            font-size: 7pt;
        }
        .service-ribbon {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            background-color: #f2f2f2;
        }
        .service-ribbon td {
            padding: 2px 6px;
            font-size: 7.2pt;
        }
        .checklist-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-top: 0;
        }
        .checklist-table th {
            background-color: #e5e5e5;
            border: 1px solid #000;
            padding: 2px 2px;
            font-size: 6.8pt;
            text-align: center;
            font-weight: bold;
        }
        .checklist-table td {
            border: 1px solid #666;
            padding: 1.5px 3px;
            font-size: 6.5pt;
            vertical-align: middle;
        }
        .section-header td {
            background-color: #dcdcdc;
            font-weight: bold;
            font-size: 6.8pt;
            border-top: 1.5px solid #000;
            border-bottom: 1px solid #000;
            padding: 2px 4px;
        }
        .col-type {
            width: 14px;
            text-align: center;
            font-weight: bold;
            font-size: 7pt;
        }
        .col-checkpoint {
            width: 65px;
            text-align: center;
            font-size: 6.2pt;
        }
        .col-remarks {
            width: 140px;
            font-size: 6.2pt;
        }
        .col-inspect {
            width: 45px;
            text-align: center;
        }
        .notes-container {
            border: 1.5px solid #000;
            border-top: none;
            padding: 4px 6px;
        }
        .notes-title {
            font-weight: bold;
            font-size: 7pt;
            margin-bottom: 3px;
        }
        .note-line {
            border-bottom: 1px solid #999;
            height: 12px;
            margin-bottom: 3px;
        }
        .sign-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            border-top: none;
        }
        .sign-table td {
            text-align: center;
            vertical-align: top;
            font-size: 7pt;
            padding: 6px;
            width: 50%;
        }
        .mini-page-header {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            border-bottom: none;
            margin-bottom: 0;
            background-color: #fafafa;
        }
        .mini-page-header td {
            padding: 2px 6px;
            font-size: 6.8pt;
        }
    </style>
</head>
<body>

    @php
        // Helper to check whether item has result subfield
        $renderRemarks = function($item) {
            $id = $item['id'] ?? 0;
            $res = $item['results'] ?? [];
            $defRemarks = $item['remarks'] ?? '';

            if ($id == 1 && !empty($res['rpm'])) {
                return 'Result : ' . $res['rpm'] . ' RPM';
            }
            if ($id == 24 && !empty($res['rating_result'])) {
                return 'Rating Result : ' . $res['rating_result'];
            }
            if ($id == 26 && !empty($res['rr'])) {
                return 'Rating Result : RR ' . $res['rr'];
            }
            if ($id == 29 && (!empty($res['rrlh']) || !empty($res['rrrh']))) {
                return 'Rating Result : RRLH ' . ($res['rrlh'] ?? '') . ' RRRH ' . ($res['rrrh'] ?? '');
            }
            if ($id == 32 && (!empty($res['frlh']) || !empty($res['frrh']))) {
                return 'Rating Result : FRLH ' . ($res['frlh'] ?? '') . ' FRRH ' . ($res['frrh'] ?? '');
            }
            if (in_array($id, [36, 41, 47, 58]) && !empty($res['rating_result'])) {
                return 'Rating Result : ' . $res['rating_result'];
            }
            if ($id == 42 && !empty($res['rpm'])) {
                return 'Result : ' . $res['rpm'] . ' RPM';
            }
            if ($id == 43 && !empty($res['sec'])) {
                return 'Result : ' . $res['sec'] . ' SEC';
            }
            if ($id == 45 && !empty($res['sec'])) {
                return 'Result : ' . $res['sec'] . ' SEC';
            }

            return $defRemarks;
        };

        // Split items by page matching the uploaded sheet
        // Page 1: Items 1 to 29 (Engine 1-24 + Transmission & Diff part 1 25-29)
        // Page 2: Items 30 to 61 (Transmission & Diff part 2 30-41 + Hydraulic 42-58 + Lubrication part 1 59-61)
        // Page 3: Items 62 to 77 (Lubrication part 2 62-69 + Miscellaneous 70-77)
        $p1Items = array_filter($items, fn($it) => ($it['id'] ?? 0) >= 1 && ($it['id'] ?? 0) <= 29);
        $p2Items = array_filter($items, fn($it) => ($it['id'] ?? 0) >= 30 && ($it['id'] ?? 0) <= 61);
        $p3Items = array_filter($items, fn($it) => ($it['id'] ?? 0) >= 62 && ($it['id'] ?? 0) <= 77);
    @endphp

    <!-- ════════════════════════════════════════════════════════════════ PAGE 1 ════════════════════════════════════════════════════════════════ -->
    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="width: 15%; font-size: 16pt; font-weight: 900; color: #b91c1c; font-family: Impact, sans-serif;">
                MAM
            </td>
            <td style="width: 55%; text-align: left;">
                <div style="font-size: 11pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">PM SERVICE SHEET</div>
                <div style="font-size: 9pt; font-weight: bold; color: #111;">DUMP TRUCK</div>
            </td>
            <td style="width: 30%; text-align: right; font-size: 7pt;">
                <div><strong>No. Dokumen:</strong></div>
                <div style="font-family: monospace; font-size: 8pt; font-weight: bold;">{{ $formNumber }}</div>
            </td>
        </tr>
    </table>

    <!-- Meta Grid -->
    <table class="meta-grid">
        <tr>
            <!-- Left Info -->
            <td style="width: 40%; border-right: 1px solid #000; padding: 2px 4px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 6.8pt;">
                    <tr>
                        <td style="width: 70px; font-weight: bold;">PROJECT ID</td>
                        <td style="width: 5px;">:</td>
                        <td><strong>{{ $projectId ?: 'PT. MAM' }}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">UNIT ID</td>
                        <td>:</td>
                        <td><strong>{{ $unit ? $unit->code_unit : '-' }}</strong> {{ $unit && $unit->model ? '('.$unit->model.')' : '' }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">DATE</td>
                        <td>:</td>
                        <td>{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">S.M.U</td>
                        <td>:</td>
                        <td><strong>{{ $smu ? number_format($smu, 0, ',', '.') : '-' }}</strong> HRS</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">SHIFT</td>
                        <td>:</td>
                        <td><strong>{{ $shift == 'NS' ? 'NS (Malam)' : 'DS (Siang)' }}</strong></td>
                    </tr>
                </table>
            </td>

            <!-- Center Info: Oil Sampling -->
            <td style="width: 35%; border-right: 1px solid #000; padding: 2px 4px;">
                <div style="font-weight: bold; font-size: 6.2pt; text-transform: uppercase; border-bottom: 1px solid #ccc; margin-bottom: 2px;">
                    Pengambilan Sampel Oli Terakhir / Last Oil Sample Taken
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 6.2pt;">
                    <tr>
                        <td style="width: 80px;">Engine</td>
                        <td style="width: 5px;">:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['engine'] ?? '_____ / _____ / _____' }}</td>
                    </tr>
                    <tr>
                        <td>Transmission</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['transmission'] ?? '_____ / _____ / _____' }}</td>
                    </tr>
                    <tr>
                        <td>Differential & Final Drive</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['differential'] ?? '_____ / _____ / _____' }}</td>
                    </tr>
                    <tr>
                        <td>Hydraulic</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['hydraulic'] ?? '_____ / _____ / _____' }}</td>
                    </tr>
                </table>
            </td>

            <!-- Right Info: Caution -->
            <td style="width: 25%; padding: 2px 4px; background-color: #fffbeb;">
                <div style="font-weight: bold; font-size: 6.2pt; color: #92400e; border-bottom: 1px solid #fde68a; margin-bottom: 2px;">
                    ⚠️ Perhatian / Coution
                </div>
                <ul style="margin: 0; padding-left: 10px; font-size: 5.5pt; line-height: 1.1;">
                    <li>Cuci unit yang bersih sebelum pelaksanaan inspeksi<br><em>Clean up the unit before inspection</em></li>
                    <li>Parkirkan unit pada tempat rata dengan aman<br><em>Park the unit on flat area safely</em></li>
                    <li>Yakinkan anda sudah memasang Danger atau Service Tag pada unit<br><em>Make sure you already use Danger or Service Tag on the unit</em></li>
                </ul>
            </td>
        </tr>
    </table>

    <!-- Service Type Ribbon -->
    <table class="service-ribbon">
        <tr>
            <td style="width: 22%; font-weight: bold;">
                Tipe PM Service / PM Services Types:
            </td>
            <td style="width: 78%; font-family: 'DejaVu Sans', sans-serif; font-size: 7pt;">
                @foreach(['A' => 'A : PM 250 / PS 1', 'B' => 'B : PM 500 / PS 2', 'C' => 'C : PM 1000 / PS 3', 'D' => 'D : PM 2000 / PS 4', 'E' => 'E : PM 4000 / PS 5'] as $k => $lbl)
                    <span style="display: inline-block; margin-right: 8px; {{ $serviceType == $k ? 'font-weight: bold; text-decoration: underline; background-color: #fef08a; padding: 1px 3px;' : 'color: #333;' }}">
                        [{{ $serviceType == $k ? '&#10003;' : ' ' }}] {{ $lbl }}
                    </span>
                @endforeach
            </td>
        </tr>
    </table>

    <!-- Table Header & Items Page 1 -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="5" style="width: 70px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 4px;">
                    Deskripsi Pekerjaan / Task Description
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks
                </th>
                <th rowspan="2" class="col-inspect">
                    SN Inspector
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                    <th style="width: 14px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @php $currentSec = ''; @endphp
            @foreach($p1Items as $item)
                @if(($item['section'] ?? '') !== $currentSec)
                    @php $currentSec = $item['section'] ?? ''; @endphp
                    <tr class="section-header">
                        <td colspan="9">
                            <strong>{{ $currentSec }}</strong>
                        </td>
                    </tr>
                @endif
                @php
                    $itemTypes = $item['types'] ?? [];
                    $status = $item['status'] ?? '';
                    $remarksText = $renderRemarks($item);
                @endphp
                <tr>
                    @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                        <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                            @if(in_array($t, $itemTypes))
                                &#10003;
                            @endif
                        </td>
                    @endforeach
                    <td style="padding: 1px 3px;">
                        <div style="font-weight: bold; color: #111;">{{ $item['desc_id'] ?? '' }}</div>
                        <div style="font-size: 5.5pt; font-style: italic; color: #444;">{{ $item['desc_en'] ?? '' }}</div>
                    </td>
                    <td class="col-checkpoint">
                        @if($status == 'OK')
                            <strong>[&#10003;] OK</strong>
                        @elseif($status == 'ADJUST')
                            <strong>[Adj] Adjusted</strong>
                        @elseif($status == 'REPAIR')
                            <strong>[Rep] Repaired</strong>
                        @elseif($status == 'NA')
                            <span style="color: #666;">N/A</span>
                        @else
                            <span style="color: #bbb;">[ &nbsp; ]</span>
                        @endif
                    </td>
                    <td class="col-remarks">
                        {{ $remarksText }}
                    </td>
                    <td class="col-inspect">
                        {{ $item['inspector'] ?? '' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- ════════════════════════════════════════════════════════════════ PAGE 2 ════════════════════════════════════════════════════════════════ -->
    <div class="page-break"></div>

    <table class="mini-page-header">
        <tr>
            <td style="font-weight: bold; color: #b91c1c; width: 12%;">MAM</td>
            <td style="font-weight: bold; width: 45%;">PM SERVICE SHEET DUMP TRUCK - PAGE 2</td>
            <td style="text-align: right; width: 43%;">
                UNIT: <strong>{{ $unit ? $unit->code_unit : '-' }}</strong> | 
                S.M.U: <strong>{{ $smu ?: '-' }}</strong> | 
                DATE: <strong>{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</strong> | 
                SHIFT: <strong>{{ $shift }}</strong> |
                TYPE: <strong>{{ $serviceType }}</strong>
            </td>
        </tr>
    </table>

    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="5" style="width: 70px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 4px;">
                    Deskripsi Pekerjaan / Task Description
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks
                </th>
                <th rowspan="2" class="col-inspect">
                    SN Inspector
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                    <th style="width: 14px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @php $currentSec = ''; @endphp
            @foreach($p2Items as $item)
                @if(($item['section'] ?? '') !== $currentSec)
                    @php $currentSec = $item['section'] ?? ''; @endphp
                    <tr class="section-header">
                        <td colspan="9">
                            <strong>{{ $currentSec }}</strong>
                        </td>
                    </tr>
                @endif
                @php
                    $itemTypes = $item['types'] ?? [];
                    $status = $item['status'] ?? '';
                    $remarksText = $renderRemarks($item);
                @endphp
                <tr>
                    @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                        <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                            @if(in_array($t, $itemTypes))
                                &#10003;
                            @endif
                        </td>
                    @endforeach
                    <td style="padding: 1px 3px;">
                        <div style="font-weight: bold; color: #111;">{{ $item['desc_id'] ?? '' }}</div>
                        <div style="font-size: 5.5pt; font-style: italic; color: #444;">{{ $item['desc_en'] ?? '' }}</div>
                    </td>
                    <td class="col-checkpoint">
                        @if($status == 'OK')
                            <strong>[&#10003;] OK</strong>
                        @elseif($status == 'ADJUST')
                            <strong>[Adj] Adjusted</strong>
                        @elseif($status == 'REPAIR')
                            <strong>[Rep] Repaired</strong>
                        @elseif($status == 'NA')
                            <span style="color: #666;">N/A</span>
                        @else
                            <span style="color: #bbb;">[ &nbsp; ]</span>
                        @endif
                    </td>
                    <td class="col-remarks">
                        {{ $remarksText }}
                    </td>
                    <td class="col-inspect">
                        {{ $item['inspector'] ?? '' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- ════════════════════════════════════════════════════════════════ PAGE 3 ════════════════════════════════════════════════════════════════ -->
    <div class="page-break"></div>

    <table class="mini-page-header">
        <tr>
            <td style="font-weight: bold; color: #b91c1c; width: 12%;">MAM</td>
            <td style="font-weight: bold; width: 45%;">PM SERVICE SHEET DUMP TRUCK - PAGE 3</td>
            <td style="text-align: right; width: 43%;">
                UNIT: <strong>{{ $unit ? $unit->code_unit : '-' }}</strong> | 
                S.M.U: <strong>{{ $smu ?: '-' }}</strong> | 
                DATE: <strong>{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</strong> | 
                SHIFT: <strong>{{ $shift }}</strong> |
                TYPE: <strong>{{ $serviceType }}</strong>
            </td>
        </tr>
    </table>

    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="5" style="width: 70px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 4px;">
                    Deskripsi Pekerjaan / Task Description
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks
                </th>
                <th rowspan="2" class="col-inspect">
                    SN Inspector
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                    <th style="width: 14px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @php $currentSec = ''; @endphp
            @foreach($p3Items as $item)
                @if(($item['section'] ?? '') !== $currentSec)
                    @php $currentSec = $item['section'] ?? ''; @endphp
                    <tr class="section-header">
                        <td colspan="9">
                            <strong>{{ $currentSec }}</strong>
                        </td>
                    </tr>
                @endif
                @php
                    $itemTypes = $item['types'] ?? [];
                    $status = $item['status'] ?? '';
                    $remarksText = $renderRemarks($item);
                @endphp
                <tr>
                    @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                        <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                            @if(in_array($t, $itemTypes))
                                &#10003;
                            @endif
                        </td>
                    @endforeach
                    <td style="padding: 1px 3px;">
                        <div style="font-weight: bold; color: #111;">{{ $item['desc_id'] ?? '' }}</div>
                        <div style="font-size: 5.5pt; font-style: italic; color: #444;">{{ $item['desc_en'] ?? '' }}</div>
                    </td>
                    <td class="col-checkpoint">
                        @if($status == 'OK')
                            <strong>[&#10003;] OK</strong>
                        @elseif($status == 'ADJUST')
                            <strong>[Adj] Adjusted</strong>
                        @elseif($status == 'REPAIR')
                            <strong>[Rep] Repaired</strong>
                        @elseif($status == 'NA')
                            <span style="color: #666;">N/A</span>
                        @else
                            <span style="color: #bbb;">[ &nbsp; ]</span>
                        @endif
                    </td>
                    <td class="col-remarks">
                        {{ $remarksText }}
                    </td>
                    <td class="col-inspect">
                        {{ $item['inspector'] ?? '' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Notes Container matching physical sheet with lines -->
    <div class="notes-container">
        <div class="notes-title">NOTE :</div>
        @if(!empty($notes))
            <div style="font-size: 6.8pt; line-height: 1.3; min-height: 50px; white-space: pre-line; color: #111;">
                {{ $notes }}
            </div>
        @else
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
        @endif
    </div>

    <!-- Signatures -->
    <table class="sign-table">
        <tr>
            <td>
                <div style="font-weight: bold; margin-bottom: 35px;">Inspected By,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $mechanicName ?: '( .................................................... )' }}
                </div>
                <div style="font-size: 6.5pt; color: #444; margin-top: 2px;">Mechanic/ Serviceman</div>
            </td>
            <td>
                <div style="font-weight: bold; margin-bottom: 35px;">Aknowledged by,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $supervisorName ?: '( .................................................... )' }}
                </div>
                <div style="font-size: 6.5pt; color: #444; margin-top: 2px;">Maintenance Supervisor</div>
            </td>
        </tr>
    </table>

</body>
</html>
