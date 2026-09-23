<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>PM Service Sheet Generator Set - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 8mm 10mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 8pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-before: always;
        }
        .header-banner {
            width: 100%;
            background-color: #808080;
            color: #ffffff;
            text-align: center;
            padding: 6px 0;
            margin-bottom: 8px;
        }
        .header-title-1 {
            font-size: 13pt;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .header-title-2 {
            font-size: 11pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5pt;
            margin-bottom: 8px;
        }
        .meta-table td {
            padding: 2px 4px;
            vertical-align: middle;
        }
        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .info-grid td {
            vertical-align: top;
            padding: 4px;
        }
        .box-types {
            width: 48%;
            border: 1px solid #000;
            padding: 4px;
        }
        .box-caution {
            width: 48%;
            border: 1px solid #000;
            padding: 4px;
            font-size: 6.8pt;
        }
        .type-item {
            display: flex;
            align-items: center;
            margin-bottom: 3px;
            font-size: 7.5pt;
        }
        .type-box {
            display: inline-block;
            width: 18px;
            height: 14px;
            border: 1px solid #000;
            margin-right: 6px;
            text-align: center;
            line-height: 14px;
            font-weight: bold;
        }
        .checklist-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-top: 4px;
        }
        .checklist-table th {
            background-color: #d1d5db;
            border: 1px solid #000;
            padding: 3px 2px;
            font-size: 7pt;
            text-align: center;
            font-weight: bold;
        }
        .checklist-table td {
            border: 1px solid #777;
            padding: 2px 4px;
            font-size: 6.8pt;
            vertical-align: middle;
        }
        .col-type {
            width: 16px;
            text-align: center;
            font-weight: bold;
            font-size: 7.5pt;
        }
        .col-checkpoint {
            width: 60px;
            text-align: center;
            font-size: 6.5pt;
        }
        .col-remarks {
            width: 180px;
            font-size: 6.5pt;
        }
        .check-box-square {
            display: inline-block;
            width: 28px;
            height: 14px;
            border: 1px solid #000;
            text-align: center;
            line-height: 14px;
            font-weight: bold;
            font-size: 7pt;
        }
        .notes-container {
            width: 100%;
            margin-top: 10px;
            font-size: 7.5pt;
        }
        .notes-line {
            border-bottom: 1px solid #000;
            height: 16px;
            margin-bottom: 4px;
        }
        .sign-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-top: 12px;
        }
        .sign-table td {
            padding: 8px 12px;
            vertical-align: top;
            width: 50%;
            font-size: 7.5pt;
        }
        .doc-footer {
            width: 100%;
            position: absolute;
            bottom: 4mm;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            font-size: 6.5pt;
            color: #444;
        }
    </style>
</head>
<body>

    @php
        // Filter items
        // Page 1: Items 1 to 18 (ENGINE)
        // Page 2: Items 19 to 27 (MISCELLANEOUS)
        $p1Items = array_filter($items, fn($it) => ($it['id'] ?? 0) >= 1 && ($it['id'] ?? 0) <= 18);
        $p2Items = array_filter($items, fn($it) => ($it['id'] ?? 0) >= 19 && ($it['id'] ?? 0) <= 27);
    @endphp

    <!-- ════════════════════════════════ PAGE 1 ════════════════════════════════ -->
    <!-- Banner Header -->
    <div class="header-banner">
        <div class="header-title-1">PM SERVICE SHEET</div>
        <div class="header-title-2">GENERATOR SET</div>
    </div>

    <!-- Meta Details -->
    <table class="meta-table">
        <tr>
            <td style="width: 14%; font-weight: bold;">PROJECT ID</td>
            <td style="width: 2%;">:</td>
            <td style="width: 32%;"><strong>{{ $projectId ?: 'PT. MAM' }}</strong></td>
            <td style="width: 10%; font-weight: bold;">DATE</td>
            <td style="width: 2%;">:</td>
            <td style="width: 16%;">{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</td>
            <td style="width: 8%; font-weight: bold;">SHIFT</td>
            <td style="width: 2%;">:</td>
            <td style="width: 14%;"><strong>{{ $shift == 'NS' ? 'NS (Malam)' : 'DS (Siang)' }}</strong></td>
        </tr>
        <tr>
            <td style="font-weight: bold;">UNIT ID</td>
            <td>:</td>
            <td><strong>{{ $unit ? $unit->code_unit : '-' }}</strong> {{ $unit && $unit->model ? '('.$unit->model.')' : '' }}</td>
            <td style="font-weight: bold;">S.M.U / K.M</td>
            <td>:</td>
            <td colspan="4">
                <strong>{{ $smu ? number_format($smu, 0, ',', '.') : '-' }}</strong> HRS
                @if(!empty($km)) / {{ $km }} KM @endif
            </td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Name Inspector</td>
            <td>:</td>
            <td colspan="7">
                {{ $inspectorName ?: ($mechanicName ?: '__________________________________________________________________') }}
            </td>
        </tr>
    </table>

    <!-- Info Grid: Service Types & Caution -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <tr>
            <!-- Left: Tipe PM Service -->
            <td style="width: 45%; vertical-align: top; padding-right: 8px;">
                <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 2px;">
                    Tipe PM Service<br>
                    <span style="font-style: italic; font-weight: normal; font-size: 6.5pt;">PM Services Types</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 7.2pt;">
                    @foreach([
                        'A' => 'A : PM 250 HRS',
                        'B' => 'B : PM 500 HRS',
                        'C' => 'C : PM 1000 HRS',
                        'D' => 'D : PM 2000 HRS',
                    ] as $k => $lbl)
                        <tr>
                            <td style="width: 24px; padding: 1.5px 0;">
                                <div style="width: 18px; height: 13px; border: 1px solid #000; text-align: center; line-height: 13px; font-weight: bold; font-size: 8pt; {{ $serviceType == $k ? 'background-color: #fef08a;' : '' }}">
                                    {{ $serviceType == $k ? '&#10003;' : '' }}
                                </div>
                            </td>
                            <td style="padding: 1.5px 0; {{ $serviceType == $k ? 'font-weight: bold;' : '' }}">
                                {{ $lbl }}
                            </td>
                        </tr>
                    @endforeach
                </table>
            </td>

            <!-- Right: Caution -->
            <td style="width: 55%; vertical-align: top; border-left: 1px solid #ccc; padding-left: 8px;">
                <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 2px;">
                    Perhatian<br>
                    <span style="font-style: italic; font-weight: normal; font-size: 6.5pt;">Caution</span>
                </div>
                <div style="font-size: 6.5pt; line-height: 1.25; color: #222;">
                    <div>* Cuci genset yang bersih sebelum pelaksanaan inspeksi</div>
                    <div style="font-style: italic; color: #555; margin-left: 8px; margin-bottom: 2px;">Clean up the genset before inspection</div>
                    <div>* Tempatkan genset pada tempat rata dengan aman</div>
                    <div style="font-style: italic; color: #555; margin-left: 8px; margin-bottom: 2px;">Place the unit on flat area safely</div>
                    <div>* Yakinkan anda sudah memasang Danger atau Service Tag pada unit</div>
                    <div style="font-style: italic; color: #555; margin-left: 8px;">Make sure you already use Danger or Service Tag on the unit</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Table Header & Items Page 1 (ENGINE) -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="4" style="width: 65px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 6px;">
                    Engine
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D'] as $t)
                    <th style="width: 16px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($p1Items as $item)
                @php
                    $itemTypes = $item['types'] ?? [];
                    $status = $item['status'] ?? '';
                    $remarks = $item['remarks'] ?? '';
                @endphp
                <tr>
                    @foreach(['A', 'B', 'C', 'D'] as $t)
                        <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                            @if(in_array($t, $itemTypes))
                                &#10003;
                            @endif
                        </td>
                    @endforeach
                    <td style="padding: 2px 4px;">
                        <div style="color: #111;">◆ {{ $item['desc_en'] ?? '' }}</div>
                        <div style="font-weight: bold; font-style: italic; color: #222; margin-left: 10px;">{{ $item['desc_id'] ?? '' }}</div>
                    </td>
                    <td class="col-checkpoint">
                        <div class="check-box-square">
                            @if($status == 'OK')
                                &#10003;
                            @elseif($status == 'ADJUST')
                                Adj
                            @elseif($status == 'REPAIR')
                                Rep
                            @elseif($status == 'NA')
                                NA
                            @endif
                        </div>
                    </td>
                    <td class="col-remarks">
                        {{ $remarks }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table style="width: 100%; margin-top: 10px; font-size: 6.5pt; color: #555;">
        <tr>
            <td style="width: 50%;">Page 1 of 2</td>
            <td style="width: 50%; text-align: right;">Dokumen Tidak Terkendali Jika Dicetak</td>
        </tr>
    </table>

    <!-- ════════════════════════════════ PAGE 2 ════════════════════════════════ -->
    <div class="page-break"></div>

    <!-- Banner Header Page 2 -->
    <div class="header-banner">
        <div class="header-title-1">PM SERVICE SHEET</div>
        <div class="header-title-2">GENERATOR SET</div>
    </div>

    <!-- Table Header & Items Page 2 (MISCELLANEOUS) -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="4" style="width: 65px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 6px;">
                    Miscellinuous
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D'] as $t)
                    <th style="width: 16px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($p2Items as $item)
                @php
                    $itemTypes = $item['types'] ?? [];
                    $status = $item['status'] ?? '';
                    $remarks = $item['remarks'] ?? '';
                @endphp
                <tr>
                    @foreach(['A', 'B', 'C', 'D'] as $t)
                        <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                            @if(in_array($t, $itemTypes))
                                &#10003;
                            @endif
                        </td>
                    @endforeach
                    <td style="padding: 2.5px 4px;">
                        <div style="color: #111;">◆ {{ $item['desc_en'] ?? '' }}</div>
                        <div style="font-weight: bold; font-style: italic; color: #222; margin-left: 10px;">{{ $item['desc_id'] ?? '' }}</div>
                    </td>
                    <td class="col-checkpoint">
                        <div class="check-box-square">
                            @if($status == 'OK')
                                &#10003;
                            @elseif($status == 'ADJUST')
                                Adj
                            @elseif($status == 'REPAIR')
                                Rep
                            @elseif($status == 'NA')
                                NA
                            @endif
                        </div>
                    </td>
                    <td class="col-remarks">
                        {{ $remarks }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Notes Section -->
    <div class="notes-container">
        <div style="font-weight: bold; margin-bottom: 2px;">NOTE :</div>
        @if(!empty($notes))
            <div style="font-size: 7pt; line-height: 1.4; min-height: 50px; white-space: pre-line; padding: 2px 0;">
                {{ $notes }}
            </div>
        @else
            <div class="notes-line"></div>
            <div class="notes-line"></div>
            <div class="notes-line"></div>
            <div class="notes-line"></div>
        @endif
    </div>

    <!-- Signatures -->
    <table class="sign-table">
        <tr>
            <td>
                <div style="margin-bottom: 35px;">Inspected by,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $mechanicName ?: '____________________________________' }}
                </div>
                <div style="font-size: 6.8pt; color: #333; margin-top: 2px;">Mechanic/ Serviceman</div>
            </td>
            <td>
                <div style="margin-bottom: 35px;">Aknowledged by,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $supervisorName ?: '____________________________________' }}
                </div>
                <div style="font-size: 6.8pt; color: #333; margin-top: 2px;">Section Head</div>
            </td>
        </tr>
    </table>

    <table style="width: 100%; margin-top: 15px; font-size: 6.5pt; color: #555;">
        <tr>
            <td style="width: 50%;">Page 2 of 2</td>
            <td style="width: 50%; text-align: right;">Dokumen Tidak Terkendali Jika Dicetak</td>
        </tr>
    </table>

</body>
</html>
