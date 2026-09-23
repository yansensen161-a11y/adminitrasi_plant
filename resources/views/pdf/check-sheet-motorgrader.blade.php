<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>CHECK SHEET SERVICE MOTORGRADER - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 5mm 6mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 6.8pt;
            line-height: 1.12;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-before: always;
        }
        .header-box {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2px;
        }
        .header-box td {
            padding: 3px 5px;
            vertical-align: middle;
        }
        .title-text {
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .company-logo {
            font-weight: bold;
            font-size: 8.5pt;
            color: #b91c1c;
        }
        .company-sub {
            font-size: 6pt;
            color: #333;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 2px;
        }
        .meta-table td {
            padding: 2.5px 4px;
            font-size: 6.5pt;
            border: 1px solid #000;
            vertical-align: middle;
        }
        .safety-banner {
            width: 100%;
            border: 1.2px solid #000;
            background-color: #ffffff;
            text-align: center;
            font-weight: bold;
            font-size: 6.2pt;
            padding: 2px 3px;
            margin-bottom: 2px;
            letter-spacing: 0.2px;
        }
        .table-data {
            width: 100%;
            border-collapse: collapse;
            border: 1.2px solid #000;
            margin-bottom: 2px;
        }
        .table-data th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 2px 2px;
            font-size: 6.2pt;
            text-align: center;
            font-weight: bold;
        }
        .table-data td {
            border: 1px solid #333;
            padding: 1.5px 3px;
            font-size: 6.2pt;
            vertical-align: middle;
        }
        .section-title {
            background-color: #ffffff;
            font-weight: bold;
            font-size: 6.4pt;
            border-top: 1.2px solid #000;
            border-bottom: 1px solid #000;
            padding: 2px 3px;
        }
        .black-cell {
            background-color: #000000;
        }
        .center-cell {
            text-align: center;
        }
        .check-mark {
            font-weight: bold;
            font-size: 7.5pt;
            text-align: center;
        }
        .grid-header {
            background-color: #f9f9f9;
            font-weight: bold;
            text-align: center;
            font-size: 6.2pt;
            padding: 2px;
            border: 1px solid #000;
        }
        .note-ref {
            font-size: 5.5pt;
            font-style: italic;
            color: #2563eb;
            text-align: center;
            padding: 1px;
        }
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-top: 4px;
        }
        .sig-table td {
            padding: 4px 8px;
            vertical-align: top;
            font-size: 6.5pt;
            width: 50%;
        }
    </style>
</head>
<body>

    <!-- PAGE 1 -->
    <!-- Header Box -->
    <table class="header-box">
        <tr>
            <td style="width: 25%;">
                <div class="company-logo">&#9650;&#9650; PT Mitra Abadi Mahakam</div>
                <div class="company-sub">Mining & Heavy Equipment Contractor</div>
            </td>
            <td style="width: 50%;" class="title-text">
                CHECK SHEET SERVICE MOTORGRADER
            </td>
            <td style="width: 25%; text-align: right; font-size: 6pt;">
                <div>No: <strong>{{ $formNumber }}</strong></div>
                <div>Hal: 1 dari 2</div>
            </td>
        </tr>
    </table>

    <!-- Meta Info -->
    <table class="meta-table">
        <tr>
            <td style="width: 14%; font-weight: bold;">NOMER UNIT :</td>
            <td style="width: 36%;"><strong>{{ $unit?->code_unit ?? '-' }}</strong> {{ $unit ? "({$unit->type_unit})" : '' }}</td>
            <td style="width: 14%; font-weight: bold;">HOURS METER :</td>
            <td style="width: 36%;"><strong>{{ $smu ? number_format($smu, 0, ',', '.') : '-' }}</strong> Hours</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">MODEL :</td>
            <td>{{ $unit?->model ?? '-' }}</td>
            <td style="font-weight: bold;">TANGGAL :</td>
            <td>{{ $date ? \Carbon\Carbon::parse($date)->translatedFormat('d F Y') : '-' }}</td>
        </tr>
    </table>

    <div class="safety-banner">
        PASANG 'OUT OF SERVICE TAG' , 'DANGER TAG' & 'GANJAL BAN'(INSTALL OUT OF SERVICE TAG , DANGER TAGS & WHEEL CHOCKS)
    </div>

    <!-- Main Table Page 1 (Items 1 to 30) -->
    <table class="table-data">
        <thead>
            <tr>
                <th style="width: 18px;" rowspan="2">No</th>
                <th style="width: 155px;" rowspan="2">Kompartemen / Deskripsi</th>
                <th style="width: 165px;" rowspan="2">Tindakan / Action</th>
                <th colspan="4">SERVICE TYPE</th>
                <th style="width: 45px;" rowspan="2">NAMA</th>
            </tr>
            <tr>
                <th style="width: 28px;">250/750</th>
                <th style="width: 28px;">500</th>
                <th style="width: 28px;">1000</th>
                <th style="width: 28px;">2000</th>
            </tr>
        </thead>
        <tbody>
            @php $currentSection = ''; @endphp
            @foreach($items as $idx => $item)
                @php
                    $sec = $item['section'] ?? '';
                    $intervals = $item['intervals'] ?? ['250/750', '500', '1000', '2000'];
                    $itemStatus = $item['status'] ?? '';
                    $inspectorName = $item['name'] ?? '';
                @endphp

                @if($item['id'] <= 30)
                    @if($sec !== $currentSection)
                        @php $currentSection = $sec; @endphp
                        <tr class="section-title">
                            <td colspan="8" style="background-color: #f0f0f0; font-weight: bold;">
                                {{ strtoupper($sec) }}
                            </td>
                        </tr>
                    @endif
                    <tr>
                        <td class="center-cell">{{ $item['id'] }}</td>
                        <td>{{ $item['description'] ?? '' }}</td>
                        <td>{{ $item['action'] ?? '' }}</td>

                        @foreach(['250/750', '500', '1000', '2000'] as $intv)
                            @php
                                $isApplicable = in_array($intv, $intervals);
                                $isSelectedService = ($serviceType === $intv);
                                $isMarked = ($itemStatus === 'OK' || $itemStatus === 'V' || $itemStatus === 'CHECKED');
                            @endphp
                            @if(!$isApplicable)
                                <td class="black-cell"></td>
                            @else
                                <td class="center-cell check-mark">&#10003;</td>
                            @endif
                        @endforeach

                        <td class="center-cell" style="font-size: 5.5pt;">{{ $inspectorName ?: ($form?->mechanic_name ? substr($form->mechanic_name, 0, 8) : '') }}</td>
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Plug Magnet Bottom of Page 1 -->
    <table class="table-data" style="margin-top: 2px;">
        <tr>
            <td colspan="3" class="grid-header">
                Plug Magnet & Catat (Magnetic Plug for Particles & Record ) *
            </td>
        </tr>
        <tr>
            <td style="width: 33%;">Engine: <strong>{{ $results['mag_engine'] ?? '' }}</strong></td>
            <td style="width: 33%;">Transmission: <strong>{{ $results['mag_trans'] ?? '' }}</strong></td>
            <td style="width: 34%;">Differential: <strong>{{ $results['mag_diff'] ?? '' }}</strong></td>
        </tr>
        <tr>
            <td colspan="3" class="note-ref">*) Merujuk ke STP Magnetic Plug Rating</td>
        </tr>
    </table>

    <!-- PAGE BREAK -->
    <div class="page-break"></div>

    <!-- PAGE 2 HEADER -->
    <table class="header-box">
        <tr>
            <td style="width: 25%;">
                <div class="company-logo">&#9650;&#9650; PT Mitra Abadi Mahakam</div>
            </td>
            <td style="width: 50%;" class="title-text">
                CHECK SHEET SERVICE MOTORGRADER (Lanjutan)
            </td>
            <td style="width: 25%; text-align: right; font-size: 6pt;">
                <div>Unit: <strong>{{ $unit?->code_unit ?? '-' }}</strong> | Hal: 2 dari 2</div>
            </td>
        </tr>
    </table>

    <!-- Specialized Table Page 2: Cut Filter, Cylinder, ET -->
    <table class="table-data" style="margin-top: 2px;">
        <!-- Potong/Periksa Saringan -->
        <tr>
            <td colspan="3" class="grid-header">
                Potong/ Periksa Saringan2 bermasalah & Catat (Cut Filter/ Inspect if Indicated failure & Record ) *
            </td>
        </tr>
        <tr>
            <td style="width: 33%;">Engine: <strong>{{ $results['cut_engine'] ?? '' }}</strong></td>
            <td style="width: 33%;">Hydraulic: <strong>{{ $results['cut_hydraulic'] ?? '' }}</strong></td>
            <td style="width: 34%;">Transmission: <strong>{{ $results['cut_trans'] ?? '' }}</strong></td>
        </tr>
        <tr>
            <td colspan="3" class="note-ref">*) Merujuk ke STP Filter Cut Rating</td>
        </tr>

        <!-- Periksa & Catat Cylinder -->
        <tr>
            <td colspan="3" class="grid-header">
                Periksa & Catat Cylinder-Cylinder *
            </td>
        </tr>
        <tr>
            <td>Cyl Artic RH / LH: <strong>{{ $results['cyl_artic'] ?? '' }}</strong></td>
            <td>Steering RH / LH: <strong>{{ $results['cyl_steering'] ?? '' }}</strong></td>
            <td>Blade Lift RH & LH: <strong>{{ $results['cyl_blade_lift'] ?? '' }}</strong></td>
        </tr>
        <tr>
            <td>Blade Tilt: <strong>{{ $results['cyl_blade_tilt'] ?? '' }}</strong></td>
            <td>Cyl Wheel Lean: <strong>{{ $results['cyl_wheel_lean'] ?? '' }}</strong></td>
            <td>Cyl Center Shift & Ripper: <strong>{{ $results['cyl_center_ripper'] ?? '' }}</strong></td>
        </tr>
        <tr>
            <td colspan="3" class="note-ref">*) Merujuk ke STP Cylinder Inspection Rating</td>
        </tr>

        <!-- Pengambilan Data ET -->
        <tr>
            <td colspan="3" class="grid-header">
                Pengambilan Data Modul Elektronik
            </td>
        </tr>
        <tr>
            <td colspan="3" class="center-cell">
                Download ET: <strong>{{ $results['et_download'] ?? '' }}</strong>
                <span class="note-ref" style="margin-left: 20px;">*) Merujuk ke STP On Board Electronic Download</span>
            </td>
        </tr>
    </table>

    <!-- Pelumasan (Grease) & Pengecekan Akhir (Page 2) -->
    <table class="table-data" style="margin-top: 2px;">
        <thead>
            <tr>
                <th style="width: 18px;" rowspan="2">No</th>
                <th style="width: 155px;" rowspan="2">Deskripsi Pelumasan / Pengecekan</th>
                <th style="width: 165px;" rowspan="2">Tindakan / Action</th>
                <th colspan="4">SERVICE TYPE</th>
                <th style="width: 45px;" rowspan="2">NAMA</th>
            </tr>
            <tr>
                <th style="width: 28px;">250/750</th>
                <th style="width: 28px;">500</th>
                <th style="width: 28px;">1000</th>
                <th style="width: 28px;">2000</th>
            </tr>
        </thead>
        <tbody>
            @php $currentSection = ''; @endphp
            @foreach($items as $idx => $item)
                @php
                    $sec = $item['section'] ?? '';
                    $intervals = $item['intervals'] ?? ['250/750', '500', '1000', '2000'];
                    $itemStatus = $item['status'] ?? '';
                    $inspectorName = $item['name'] ?? '';
                @endphp

                @if(in_array($sec, ['Pelumasan Grease', 'Pengecekan Akhir']))
                    @if($sec !== $currentSection)
                        @php $currentSection = $sec; @endphp
                        <tr class="section-title">
                            <td colspan="8" style="background-color: #f0f0f0; font-weight: bold;">
                                {{ strtoupper($sec) }}
                            </td>
                        </tr>
                    @endif
                    <tr>
                        <td class="center-cell">{{ $item['id'] }}</td>
                        <td>{{ $item['description'] ?? '' }}</td>
                        <td>{{ $item['action'] ?? '' }}</td>

                        @foreach(['250/750', '500', '1000', '2000'] as $intv)
                            @php
                                $isApplicable = in_array($intv, $intervals);
                                $isSelectedService = ($serviceType === $intv);
                                $isMarked = ($itemStatus === 'OK' || $itemStatus === 'V' || $itemStatus === 'CHECKED');
                            @endphp
                            @if(!$isApplicable)
                                <td class="black-cell"></td>
                            @else
                                <td class="center-cell check-mark">&#10003;</td>
                            @endif
                        @endforeach

                        <td class="center-cell" style="font-size: 5.5pt;">{{ $inspectorName ?: ($form?->mechanic_name ? substr($form->mechanic_name, 0, 8) : '') }}</td>
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Signatures -->
    <table class="sig-table">
        <tr>
            <td>
                <div><strong>Mech Name / Signature:</strong></div>
                <div style="margin-top: 15px; font-weight: bold; border-bottom: 1px dotted #000; width: 80%;">
                    {{ $mechanicName ?: '____________________________' }}
                </div>
                <div style="margin-top: 3px;">Date: {{ $date ? \Carbon\Carbon::parse($date)->format('d/m/Y') : '____/____/________' }}</div>
            </td>
            <td>
                <div><strong>Mech. Sup'v:</strong></div>
                <div style="margin-top: 15px; font-weight: bold; border-bottom: 1px dotted #000; width: 80%;">
                    {{ $supervisorName ?: '____________________________' }}
                </div>
                <div style="margin-top: 3px;">Date: {{ $date ? \Carbon\Carbon::parse($date)->format('d/m/Y') : '____/____/________' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
