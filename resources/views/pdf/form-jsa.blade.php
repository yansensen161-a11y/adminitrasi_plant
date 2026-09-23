<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>FORM JSEA - {{ $taskName ?? 'JOB SAFETY ANALYSIS' }} - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 6mm 8mm;
            size: a4 landscape;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 7pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
        }
        /* Header Box */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 0px;
        }
        .header-table td {
            border: 1.5px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
        }
        .logo-box {
            width: 25%;
            text-align: center;
        }
        .company-title {
            width: 50%;
            text-align: center;
            font-weight: bold;
            font-size: 8.5pt;
        }
        .no-form-box {
            width: 25%;
            text-align: center;
            font-weight: bold;
            font-size: 8pt;
        }
        .main-title-bar {
            width: 100%;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            background-color: #ffffff;
            text-align: center;
            padding: 4px;
            font-size: 9.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* Info meta table */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            margin-bottom: 4px;
        }
        .info-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: top;
            font-size: 6.8pt;
        }

        /* Main Analysis Table */
        .analysis-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 6px;
        }
        .analysis-table th {
            border: 1px solid #000;
            padding: 4px;
            background-color: #f8fafc;
            font-weight: bold;
            font-size: 6.8pt;
            text-align: center;
            vertical-align: middle;
        }
        .sub-header-desc {
            font-weight: normal;
            font-style: italic;
            font-size: 5.8pt;
            display: block;
            margin-top: 2px;
            color: #222;
        }
        .analysis-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            vertical-align: top;
            font-size: 6.8pt;
            line-height: 1.25;
        }
        .text-center { text-align: center; }
        .text-bold { font-weight: bold; }
        .whitespace-pre {
            white-space: pre-wrap;
        }

        /* Attendance & Signatures */
        .attendance-section {
            width: 100%;
            margin-top: 4px;
        }
        .attendance-title {
            font-size: 7.5pt;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
        }
        .attendance-table th, .attendance-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 6.5pt;
        }
        .attendance-table th {
            background-color: #f8fafc;
            text-align: center;
            font-weight: bold;
        }
        .sig-box {
            text-align: center;
            vertical-align: top;
            width: 18%;
            padding: 4px;
        }
        .sig-header {
            font-weight: bold;
            font-size: 6.5pt;
            margin-bottom: 25px;
        }
        .sig-name {
            font-weight: bold;
            text-decoration: underline;
            font-size: 6.5pt;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 1. Header Box with Logo & Form No -->
        <table class="header-table">
            <tr>
                <td class="logo-box">
                    <span style="font-weight: bold; color: #b91c1c; font-size: 8.5pt;">&#9650;&#9650; PT MITRA ABADI MAHAKAM</span>
                </td>
                <td class="company-title">
                    STANDARD FORM<br>
                    PT MTRA ABADI MAHAKAM
                </td>
                <td class="no-form-box">
                    No Form<br>
                    <span style="font-size: 8pt;">MAM-HSE-FORM-028</span>
                </td>
            </tr>
        </table>

        <!-- Main Banner -->
        <div class="main-title-bar">
            FORM JOB SAFETY ENVIROMENTAL ANALYSIS (JSEA)
        </div>

        <!-- 2. Meta Info Table -->
        <table class="info-table">
            <tr>
                <td style="width: 18%; font-weight: bold;">Tugas pekerjaan</td>
                <td style="width: 32%; font-weight: bold; font-size: 7.2pt;">{{ $taskName ?? 'OVERHAUL STARTING MOTOR' }}</td>
                <td style="width: 25%; font-weight: bold; background-color: #fbfbfb;">Peralatan yang diperlukan</td>
                <td style="width: 25%; font-weight: bold; background-color: #fbfbfb;">APD yang diperlukan</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Departemen / Divisi</td>
                <td>{{ $department ?? 'PLANT' }}</td>
                <td rowspan="3" style="vertical-align: top;">
                    <div class="whitespace-pre">{{ $toolsNeeded ?? '-' }}</div>
                </td>
                <td rowspan="3" style="vertical-align: top;">
                    <div class="whitespace-pre">{{ $apdNeeded ?? '-' }}</div>
                </td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Tanggal</td>
                <td>{{ $date ? \Carbon\Carbon::parse($date)->translatedFormat('d F Y') : date('d F Y') }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; vertical-align: top;">
                    Nama orang<br>yangbekerja
                </td>
                <td style="padding: 2px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 6.5pt;">
                        <tr>
                            <td style="width: 15px; border: none; font-weight: bold;">1</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['1'] ?? '' }}</td>
                            <td style="width: 15px; border: none; font-weight: bold; padding-left: 5px;">3</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['3'] ?? '' }}</td>
                        </tr>
                        <tr>
                            <td style="border: none; font-weight: bold;">2</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['2'] ?? '' }}</td>
                            <td style="border: none; font-weight: bold; padding-left: 5px;">4</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['4'] ?? '' }}</td>
                        </tr>
                        @if(isset($workers['5']) || isset($workers['6']))
                        <tr>
                            <td style="border: none; font-weight: bold;">5</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['5'] ?? '' }}</td>
                            <td style="border: none; font-weight: bold; padding-left: 5px;">6</td>
                            <td style="border: none; border-bottom: 1px dotted #888;">{{ $workers['6'] ?? '' }}</td>
                        </tr>
                        @endif
                    </table>
                </td>
            </tr>
        </table>

        <!-- 3. Main Analysis Table -->
        <table class="analysis-table">
            <thead>
                <tr>
                    <th style="width: 4%;">NO</th>
                    <th style="width: 25%;">
                        Urutan kerja yang mendasar
                        <span class="sub-header-desc">Pecah pekerjaan dalam beberapa langkah tiap langkah nya harus mengakomodasi pekerjaan itu dan masuk akal</span>
                    </th>
                    <th style="width: 32%;">
                        Kondisi bahaya yang potensial
                        <span class="sub-header-desc">Identifikasi bahaya pada tiap langkah,untuk mengetahui potensi bahaya yang dapat berakibat kecelakaan</span>
                    </th>
                    <th style="width: 31%;">
                        Tindakan atau procedure yang direkomendasikan
                        <span class="sub-header-desc">Gunakan dua kolom pertama sebagai panduan,tentukan tindakan apa yang diperlukan untuk menghilangkan atau mengurangi bahaya yang dapat berakibat kecelakaan,cidera atau penyakit akibat kerja</span>
                    </th>
                    <th style="width: 8%;">
                        Oleh siapa
                        <span class="sub-header-desc">Orang yang bertanggung jawab dalam melaksnakan dalam setiap pekerjaan</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                @forelse($steps as $idx => $step)
                    <tr>
                        <td class="text-center text-bold">{{ $step['no'] ?? ($idx + 1) }}</td>
                        <td class="text-bold">{{ $step['step'] ?? '-' }}</td>
                        <td class="whitespace-pre">{{ $step['hazards'] ?? '-' }}</td>
                        <td class="whitespace-pre">{{ $step['controls'] ?? '-' }}</td>
                        <td class="text-center">{{ $step['pic'] ?? 'Mekanik' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center" style="padding: 15px;">Belum ada langkah kerja JSA yang diisi.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- 4. Section 2: Daftar Hadir & Pengesahan -->
        <div class="attendance-section">
            <div class="attendance-title">2. Daftar Hadir :</div>
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th style="width: 4%;">NO</th>
                        <th style="width: 26%;">NAMA</th>
                        <th style="width: 18%;">DEPT/POSISI</th>
                        <th style="width: 16%;">TANDA TANGAN</th>
                        <th style="width: 18%;">DIKETAHUI OLEH<br>PIHAK PT.MAM</th>
                        <th style="width: 18%;">DISETUJUI OLEH<br>PIHAK PT.BBE</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $attendeeList = is_array($attendees) && count($attendees) > 0 ? $attendees : [
                            ['no' => 1, 'name' => '', 'dept_position' => 'PLANT / MEKANIK'],
                            ['no' => 2, 'name' => '', 'dept_position' => 'PLANT / MEKANIK'],
                            ['no' => 3, 'name' => '', 'dept_position' => 'PLANT / HELPER'],
                            ['no' => 4, 'name' => '', 'dept_position' => 'PLANT / WELDER'],
                        ];
                        $totalRows = max(count($attendeeList), 4);
                    @endphp

                    @for($i = 0; $i < $totalRows; $i++)
                        @php
                            $att = $attendeeList[$i] ?? ['no' => $i + 1, 'name' => '', 'dept_position' => ''];
                        @endphp
                        <tr>
                            <td class="text-center">{{ $att['no'] ?? ($i + 1) }}</td>
                            <td>{{ $att['name'] ?? '' }}</td>
                            <td>{{ $att['dept_position'] ?? '' }}</td>
                            <td style="height: 18px;">{{ $att['signature'] ?? '' }}</td>

                            @if($i === 0)
                                <td rowspan="{{ $totalRows }}" class="sig-box">
                                    <div class="sig-header">Superintendent / Safety MAM</div>
                                    <div style="height: 25px;"></div>
                                    <div class="sig-name">{{ $knownByMam ?? 'Ambo Mai' }}</div>
                                    <div style="font-size: 5.5pt; color: #444;">Superintendent Plant</div>
                                </td>
                                <td rowspan="{{ $totalRows }}" class="sig-box">
                                    <div class="sig-header">PJO / Safety BBE</div>
                                    <div style="height: 25px;"></div>
                                    <div class="sig-name">{{ $approvedByBbe ?? 'Subani' }}</div>
                                    <div style="font-size: 5.5pt; color: #444;">PJO PT BBE</div>
                                </td>
                            @endif
                        </tr>
                    @endfor
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
