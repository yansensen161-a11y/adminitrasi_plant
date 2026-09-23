<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>PM Service Sheet Off Highway Truck 773E - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 6mm 8mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 7.5pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
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
            font-size: 7.5pt;
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
            font-size: 7pt;
            text-align: center;
            font-weight: bold;
        }
        .checklist-table td {
            border: 1px solid #777;
            padding: 1.5px 3px;
            font-size: 6.8pt;
            vertical-align: middle;
        }
        .section-header td {
            background-color: #dcdcdc;
            font-weight: bold;
            font-size: 7pt;
            border-top: 1.5px solid #000;
            border-bottom: 1px solid #000;
            padding: 2px 4px;
        }
        .col-type {
            width: 16px;
            text-align: center;
            font-weight: bold;
            font-size: 7.5pt;
        }
        .col-checkpoint {
            width: 70px;
            text-align: center;
            font-size: 6.5pt;
        }
        .col-remarks {
            width: 130px;
            font-size: 6.5pt;
        }
        .col-inspect {
            width: 35px;
            text-align: center;
        }
        .notes-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            border-top: none;
        }
        .notes-table td {
            padding: 3px 6px;
            vertical-align: top;
            font-size: 7pt;
        }
        .sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .sign-table td {
            text-align: center;
            vertical-align: top;
            font-size: 7pt;
            width: 50%;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="width: 15%; font-size: 16pt; font-weight: 900; color: #b91c1c; font-family: Impact, sans-serif;">
                MAM
            </td>
            <td style="width: 55%; text-align: left;">
                <div style="font-size: 11pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">PM SERVICE SHEET</div>
                <div style="font-size: 8.5pt; font-weight: bold;">OFF HIGHWAY TRUCK 773E</div>
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
            <td style="width: 42%; border-right: 1px solid #000; padding: 2px 4px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 7pt;">
                    <tr>
                        <td style="width: 75px; font-weight: bold;">PROJECT ID</td>
                        <td style="width: 5px;">:</td>
                        <td>{{ $projectId ?: 'PT. MAM' }}</td>
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
            <td style="width: 33%; border-right: 1px solid #000; padding: 2px 4px;">
                <div style="font-weight: bold; font-size: 6.5pt; text-transform: uppercase; border-bottom: 1px solid #ccc; margin-bottom: 2px;">
                    PENGAMBILAN SAMPEL OLI TERAKHIR / LAST OIL SAMPLE
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 6.5pt;">
                    <tr>
                        <td>Engine</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['engine'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Transmission</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['transmission'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Diff & Final Drive</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['differential'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Hydraulic</td>
                        <td>:</td>
                        <td style="font-family: monospace;">{{ $oilSamples['hydraulic'] ?? '-' }}</td>
                    </tr>
                </table>
            </td>

            <!-- Right Info: Caution -->
            <td style="width: 25%; padding: 2px 4px; background-color: #fffbeb;">
                <div style="font-weight: bold; font-size: 6.5pt; color: #92400e; border-bottom: 1px solid #fde68a; margin-bottom: 2px;">
                    ⚠️ PERHATIAN / CAUTION
                </div>
                <ul style="margin: 0; padding-left: 10px; font-size: 5.8pt; line-height: 1.1;">
                    <li>Cuci unit bersih sebelum inspeksi <em>(Clean up unit)</em></li>
                    <li>Parkir di tempat rata dengan aman <em>(Park safely)</em></li>
                    <li>Pasang Danger/Service Tag <em>(Use Danger Tag)</em></li>
                </ul>
            </td>
        </tr>
    </table>

    <!-- Service Type Ribbon -->
    <table class="service-ribbon">
        <tr>
            <td style="width: 25%; font-weight: bold;">
                TIPE PM SERVICE:
            </td>
            <td style="width: 75%; font-family: 'DejaVu Sans', sans-serif; font-size: 7.5pt;">
                @foreach(['A' => 'A : PM 250 / PS 1', 'B' => 'B : PM 500 / PS 2', 'C' => 'C : PM 1000 / PS 3', 'D' => 'D : PM 2000 / PS 4', 'E' => 'E : PM 4000 / PS 5'] as $k => $lbl)
                    <span style="display: inline-block; margin-right: 8px; {{ $serviceType == $k ? 'font-weight: bold; text-decoration: underline; background-color: #fef08a; padding: 1px 3px;' : 'color: #555;' }}">
                        [{{ $serviceType == $k ? '&#10003;' : ' ' }}] {{ $lbl }}
                    </span>
                @endforeach
            </td>
        </tr>
    </table>

    <!-- Checklist Table -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th colspan="5" style="width: 80px; padding: 1px;">
                    <div>Tipe Servis</div>
                    <div style="font-size: 5.5pt; font-style: italic; font-weight: normal;">Service Type</div>
                </th>
                <th rowspan="2" style="text-align: left; padding: 2px 4px;">
                    Deskripsi Pemeriksaan / Tasks
                </th>
                <th rowspan="2" class="col-checkpoint">
                    Check Point
                </th>
                <th rowspan="2" class="col-remarks">
                    Remarks / Measurement
                </th>
                <th rowspan="2" class="col-inspect">
                    S/N Inspect
                </th>
            </tr>
            <tr>
                @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                    <th style="width: 16px; font-family: 'DejaVu Sans', sans-serif; {{ $serviceType == $t ? 'background-color: #fef08a;' : '' }}">
                        {{ $t }}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($sections as $secKey => $secLabel)
                @php
                    $sectionItems = array_filter($items, function($it) use ($secKey) {
                        return ($it['section'] ?? '') === $secKey;
                    });
                @endphp
                @if(count($sectionItems) > 0)
                    <tr class="section-header">
                        <td colspan="9">
                            {{ $secLabel }}
                        </td>
                    </tr>
                    @foreach($sectionItems as $item)
                        @php
                            $itemTypes = $item['types'] ?? [];
                            $isApplicable = in_array($serviceType, $itemTypes);
                            $status = $item['status'] ?? '';
                            $remarks = $item['remarks'] ?? '';
                            $res = $item['results'] ?? [];
                        @endphp
                        <tr>
                            <!-- A, B, C, D, E columns -->
                            @foreach(['A', 'B', 'C', 'D', 'E'] as $t)
                                <td class="col-type" style="{{ $serviceType == $t ? 'background-color: #fef9c3;' : '' }}">
                                    @if(in_array($t, $itemTypes))
                                        &#10003;
                                    @endif
                                </td>
                            @endforeach

                            <!-- Task description -->
                            <td style="padding: 1px 3px;">
                                <div style="font-weight: bold; color: #111;">{{ $item['desc_id'] ?? '' }}</div>
                                <div style="font-size: 5.8pt; font-style: italic; color: #555;">{{ $item['desc_en'] ?? '' }}</div>
                            </td>

                            <!-- Check point -->
                            <td class="col-checkpoint">
                                @if($status == 'OK')
                                    <strong>[&#10003;] OK</strong>
                                @elseif($status == 'ADJUST')
                                    <strong>[Adj] Adjusted</strong>
                                @elseif($status == 'REPAIR')
                                    <strong>[Rep] Repaired</strong>
                                @else
                                    <span style="color: #999;">[ &nbsp; ]</span>
                                @endif
                            </td>

                            <!-- Remarks -->
                            <td class="col-remarks">
                                @if(isset($item['id']) && $item['id'] == 1 && !empty($res['logged_event']))
                                    Logged event: {{ $res['logged_event'] }}
                                @elseif(isset($item['id']) && $item['id'] == 2 && !empty($res['stall_rpm']))
                                    Result: {{ $res['stall_rpm'] }} RPM
                                @elseif(isset($item['id']) && $item['id'] == 29)
                                    DIFFERENTIAL CAPACITIES 120 L
                                @elseif(isset($item['id']) && $item['id'] == 32)
                                    Rating RRLH: {{ $res['rrlh'] ?? '' }} RRRH: {{ $res['rrrh'] ?? '' }}
                                @elseif(isset($item['id']) && $item['id'] == 35)
                                    Rating FRLH: {{ $res['frlh'] ?? '' }} FRRH: {{ $res['frrh'] ?? '' }}
                                @elseif(isset($item['id']) && $item['id'] == 37)
                                    WHEEL FRONT CAPACITIES 6.8 L
                                @elseif(isset($item['id']) && $item['id'] == 43)
                                    Transmission & TC 106 L
                                @elseif(isset($item['id']) && $item['id'] == 48 && !empty($res['brake_rpm']))
                                    Result: {{ $res['brake_rpm'] }} RPM
                                @elseif(isset($item['id']) && $item['id'] == 49 && !empty($res['steer_sec']))
                                    Result: {{ $res['steer_sec'] }} SEC
                                @elseif(isset($item['id']) && $item['id'] == 51 && !empty($res['hoist_sec']))
                                    Result: {{ $res['hoist_sec'] }} SEC
                                @elseif(isset($item['id']) && $item['id'] == 57)
                                    HYDRAULIC AND BRAKE CAPACITIES 121 L
                                @else
                                    {{ $remarks }}
                                @endif
                            </td>

                            <!-- S/N Inspector (Dikosongkan) -->
                            <td class="col-inspect">
                                <!-- Kosong untuk paraf/stempel fisik -->
                            </td>
                        </tr>
                    @endforeach
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Notes & Signatures -->
    <table class="notes-table">
        <tr>
            <td>
                <strong>NOTE :</strong>
                <div style="min-height: 24px; padding-top: 2px;">
                    {{ $notes ?: '-' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="sign-table">
        <tr>
            <td>
                <div style="font-weight: bold; margin-bottom: 28px;">Inspected By,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $mechanicName ?: '( .................................................... )' }}
                </div>
                <div style="font-size: 6.5pt; color: #555;">Mechanic / Serviceman</div>
            </td>
            <td>
                <div style="font-weight: bold; margin-bottom: 28px;">Acknowledged by,</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $supervisorName ?: '( .................................................... )' }}
                </div>
                <div style="font-size: 6.5pt; color: #555;">Maintenance Supervisor</div>
            </td>
        </tr>
    </table>

</body>
</html>
