<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>PRE RELEASE CHECK LIST REPORT TRACK UNIT - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 4mm 6mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 6.2pt;
            line-height: 1.1;
            margin: 0;
            padding: 0;
        }
        .header-box {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2px;
        }
        .header-box td {
            padding: 2px 4px;
            vertical-align: middle;
        }
        .title-text {
            font-size: 10pt;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.3px;
        }
        .company-logo {
            font-weight: bold;
            font-size: 8pt;
            color: #b91c1c;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }
        .meta-table td {
            padding: 1.5px 3px;
            font-size: 6.2pt;
            vertical-align: middle;
        }
        .sub-banner {
            width: 100%;
            border: 1px solid #000;
            background-color: #ffffff;
            font-weight: bold;
            font-size: 5.8pt;
            padding: 1.5px 3px;
            margin-bottom: 2px;
        }
        .table-data {
            width: 100%;
            border-collapse: collapse;
            border: 1.2px solid #000;
        }
        .table-data th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 1.5px 2px;
            font-size: 6pt;
            text-align: center;
            font-weight: bold;
        }
        .table-data td {
            border: 1px solid #333;
            padding: 1px 2px;
            font-size: 5.8pt;
            vertical-align: middle;
        }
        .group-header {
            background-color: #fef08a; /* Yellow */
            font-weight: bold;
            font-size: 6.2pt;
            border: 1.2px solid #000;
            padding: 1.5px 3px;
        }
        .center-cell {
            text-align: center;
        }
        .check-box {
            display: inline-block;
            width: 9px;
            height: 9px;
            border: 1px solid #000;
            line-height: 9px;
            text-align: center;
            font-size: 7pt;
            font-weight: bold;
        }
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-top: 3px;
        }
        .sig-table td {
            padding: 3px 6px;
            vertical-align: top;
            font-size: 6.2pt;
            width: 50%;
        }
    </style>
</head>
<body>

    <!-- Header Box -->
    <table class="header-box">
        <tr>
            <td style="width: 25%;">
                <div class="company-logo">&#9650;&#9650; PT Mitra Abadi Mahakam</div>
            </td>
            <td style="width: 50%;" class="title-text">
                PRE RELEASE CHECK LIST REPORT<br>TRACK UNIT
            </td>
            <td style="width: 25%; text-align: right; font-size: 5.5pt;">
                <div>No: <strong>{{ $formNumber }}</strong></div>
                <div>Status: {{ $form?->status ?? 'ACTIVE' }}</div>
            </td>
        </tr>
    </table>

    <!-- Meta Details -->
    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">Date :</td>
            <td style="width: 35%;">{{ $date ? \Carbon\Carbon::parse($date)->translatedFormat('d/m/Y') : '-' }}</td>
            <td style="width: 15%; font-weight: bold;">Task :</td>
            <td style="width: 35%;">{{ $results['task'] ?? 'Perform Maintenance On' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Equipment No. :</td>
            <td><strong>{{ $unit?->code_unit ?? '-' }}</strong> {{ $unit ? "({$unit->model})" : '' }}</td>
            <td style="font-weight: bold;">MC :</td>
            <td>{{ $results['mc'] ?? '10 Hr PM Service' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">SMU :</td>
            <td><strong>{{ $smu ? number_format($smu, 0, ',', '.') : '-' }}</strong></td>
            <td></td>
            <td></td>
        </tr>
    </table>

    <div class="sub-banner">
        Check all below components for leaks ,loosen ,cracks ,damage ,bent ,part & missing
    </div>

    <!-- Main Checklist Table -->
    <table class="table-data">
        <thead>
            <tr>
                <th style="width: 200px;" rowspan="2">DESCRIPTION</th>
                <th colspan="2" style="width: 36px;">NO</th>
                <th colspan="3" style="width: 72px;">CONDITION</th>
                <th style="width: 150px;" rowspan="2">REMARKS</th>
            </tr>
            <tr>
                <th style="width: 18px;">DZR</th>
                <th style="width: 18px;">HEX</th>
                <th style="width: 24px;">GOOD</th>
                <th style="width: 24px;">REPAIR</th>
                <th style="width: 24px;">B.LOG</th>
            </tr>
        </thead>
        <tbody>
            @php $currentSection = ''; @endphp
            @foreach($items as $idx => $item)
                @php
                    $sec = $item['section'] ?? '';
                    $itemStatus = strtoupper($item['status'] ?? '');
                    $remarks = $item['remarks'] ?? '';
                @endphp

                @if($sec !== $currentSection)
                    @php $currentSection = $sec; @endphp
                    <tr>
                        <td colspan="7" class="group-header">
                            @if(str_contains(strtolower($sec), 'operator'))
                                1. OPERATOR COMPARTMENT , ELECTRIC , COOLING & AIR CONDITIONER
                            @else
                                2. FROM : FRONT ---&gt; RIGHT ---&gt; REAR ---&gt; LEFT &amp; UNDER UNIT
                            @endif
                        </td>
                    </tr>
                @endif

                <tr>
                    <td>{{ $item['description'] ?? '' }}</td>
                    <td class="center-cell">{{ $item['dzr'] ?? '' }}</td>
                    <td class="center-cell">{{ $item['hex'] ?? '' }}</td>
                    <td class="center-cell">
                        <span class="check-box">{{ ($itemStatus === 'GOOD' || $itemStatus === 'V' || $itemStatus === 'OK') ? '&#10003;' : '' }}</span>
                    </td>
                    <td class="center-cell">
                        <span class="check-box">{{ ($itemStatus === 'REPAIR' || $itemStatus === 'X') ? '&#10003;' : '' }}</span>
                    </td>
                    <td class="center-cell">
                        <span class="check-box">{{ ($itemStatus === 'B.LOG' || $itemStatus === 'BLOG' || $itemStatus === 'BACKLOG') ? '&#10003;' : '' }}</span>
                    </td>
                    <td>{{ $remarks }}</td>
                </tr>
            @endforeach

            <!-- Others rows if empty or recorded -->
            <tr>
                <td colspan="7" style="background-color: #f9f9f9; font-style: italic; padding: 1px 2px;">Others / Catatan Tambahan:</td>
            </tr>
            <tr>
                <td>1. {{ $results['other_1'] ?? '' }}</td>
                <td class="center-cell">-</td>
                <td class="center-cell">-</td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_1_cond'] ?? '') === 'GOOD' ? '&#10003;' : '' }}</span></td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_1_cond'] ?? '') === 'REPAIR' ? '&#10003;' : '' }}</span></td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_1_cond'] ?? '') === 'B.LOG' ? '&#10003;' : '' }}</span></td>
                <td>{{ $results['other_1_remark'] ?? '' }}</td>
            </tr>
            <tr>
                <td>2. {{ $results['other_2'] ?? '' }}</td>
                <td class="center-cell">-</td>
                <td class="center-cell">-</td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_2_cond'] ?? '') === 'GOOD' ? '&#10003;' : '' }}</span></td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_2_cond'] ?? '') === 'REPAIR' ? '&#10003;' : '' }}</span></td>
                <td class="center-cell"><span class="check-box">{{ ($results['other_2_cond'] ?? '') === 'B.LOG' ? '&#10003;' : '' }}</span></td>
                <td>{{ $results['other_2_remark'] ?? '' }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Signatures -->
    <table class="sig-table">
        <tr>
            <td>
                <div><strong>Technician :</strong></div>
                <div style="margin-top: 14px; font-weight: bold; border-bottom: 1px dotted #000; width: 75%;">
                    {{ $mechanicName ?: '____________________________' }}
                </div>
                <div style="margin-top: 2px;">Date: {{ $date ? \Carbon\Carbon::parse($date)->format('d/m/Y') : '____/____/________' }}</div>
            </td>
            <td>
                <div><strong>Maint. Coordinator :</strong></div>
                <div style="margin-top: 14px; font-weight: bold; border-bottom: 1px dotted #000; width: 75%;">
                    {{ $supervisorName ?: '____________________________' }}
                </div>
                <div style="margin-top: 2px;">Date: {{ $date ? \Carbon\Carbon::parse($date)->format('d/m/Y') : '____/____/________' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
