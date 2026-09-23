<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>Form Washing Unit Tambang - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 8mm 10mm;
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
        .page-break {
            page-break-before: always;
        }
        .header-title-box {
            text-align: center;
            margin-bottom: 8px;
        }
        .header-main-title {
            font-size: 13pt;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .header-sub-title {
            font-size: 8pt;
            font-weight: bold;
            color: #333;
            letter-spacing: 0.5px;
            margin-top: 1px;
        }
        .meta-box {
            width: 100%;
            border: 1px solid #777;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .meta-box td {
            padding: 2.5px 6px;
            font-size: 7.2pt;
            vertical-align: middle;
        }
        .petunjuk-text {
            font-size: 6.8pt;
            font-style: italic;
            font-weight: bold;
            color: #222;
            margin-bottom: 4px;
        }
        .checklist-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 6px;
        }
        .checklist-table th {
            background-color: #e5e7eb;
            border: 1px solid #000;
            padding: 3px 2px;
            font-size: 7pt;
            text-align: center;
            font-weight: bold;
        }
        .checklist-table td {
            border: 1px solid #999;
            padding: 2px 4px;
            font-size: 7pt;
            vertical-align: middle;
        }
        .section-header-td {
            background-color: #d1d5db;
            font-weight: bold;
            font-size: 7.2pt;
            padding: 3px 5px !important;
            border: 1px solid #000 !important;
            text-transform: uppercase;
        }
        .col-no {
            width: 22px;
            text-align: center;
            font-weight: bold;
        }
        .col-choice {
            width: 26px;
            text-align: center;
        }
        .choice-box {
            display: inline-block;
            width: 14px;
            height: 12px;
            border: 1px solid #333;
            text-align: center;
            line-height: 12px;
            font-size: 8pt;
            font-family: 'DejaVu Sans', sans-serif;
            font-weight: bold;
        }
        .col-keterangan {
            width: 170px;
            font-size: 6.8pt;
        }
        .findings-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 8px;
        }
        .findings-table th {
            background-color: #e5e7eb;
            border: 1px solid #000;
            padding: 3px 4px;
            font-size: 6.8pt;
            text-align: center;
            font-weight: bold;
        }
        .findings-table td {
            border: 1px solid #999;
            padding: 3px 4px;
            font-size: 6.8pt;
            height: 18px;
            vertical-align: middle;
        }
        .status-akhir-box {
            border: 1px solid #000;
            padding: 4px 8px;
            font-size: 7.2pt;
            font-weight: bold;
            margin-bottom: 8px;
            background-color: #fafafa;
        }
        .status-option {
            display: inline-block;
            margin-right: 20px;
        }
        .status-square {
            display: inline-block;
            width: 13px;
            height: 13px;
            border: 1px solid #000;
            text-align: center;
            line-height: 12px;
            font-size: 8.5pt;
            font-family: 'DejaVu Sans', sans-serif;
            font-weight: bold;
            margin-right: 3px;
            vertical-align: middle;
        }
        .sign-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 6px;
        }
        .sign-table td {
            width: 33.33%;
            border: 1px solid #000;
            padding: 6px 10px;
            vertical-align: top;
            font-size: 7pt;
        }
        .footer-note {
            font-size: 6.5pt;
            font-style: italic;
            color: #333;
            border-top: 1px solid #aaa;
            padding-top: 3px;
            margin-top: 4px;
        }
        .doc-page-footer {
            width: 100%;
            display: flex;
            justify-content: space-between;
            font-size: 6.5pt;
            color: #555;
            margin-top: 4px;
        }
    </style>
</head>
<body>

    @php
        $secA = array_filter($items, fn($it) => str_starts_with($it['section'] ?? '', 'A.'));
        $secB = array_filter($items, fn($it) => str_starts_with($it['section'] ?? '', 'B.'));
        $secC = array_filter($items, fn($it) => str_starts_with($it['section'] ?? '', 'C.'));

        $startTime = $results['start_time'] ?? '';
        $endTime = $results['end_time'] ?? '';
        $durHours = $results['duration_hours'] ?? '';
        $durMins = $results['duration_minutes'] ?? '';
        $washLoc = $results['washing_location'] ?? ($unit?->lokasi ?? '');
        $petugas = $results['petugas_name'] ?? ($mechanicName ?: '');

        $findings = $results['findings'] ?? [];
        while (count($findings) < 5) {
            $findings[] = ['deskripsi' => '', 'lokasi' => '', 'tindakan' => '', 'no_wo_pr' => '', 'pic_target' => ''];
        }

        $finalStatus = $results['final_status'] ?? 'SELESAI / BERSIH';
    @endphp

    <!-- ════════════════════════════════ PAGE 1 ════════════════════════════════ -->
    <!-- Document Header -->
    <div class="header-title-box">
        <div class="header-main-title">FORM WASHING UNIT TAMBANG</div>
        <div class="header-sub-title">MAINTENANCE PLANT | HEAVY EQUIPMENT CLEANING CHECK SHEET</div>
    </div>

    <!-- Meta Details Box -->
    <table class="meta-box">
        <tr>
            <td style="width: 15%; font-weight: bold;">Kode Unit</td>
            <td style="width: 2%;">:</td>
            <td style="width: 33%;"><strong>{{ $unit ? $unit->code_unit : '__________________________' }}</strong></td>
            <td style="width: 15%; font-weight: bold;">Tanggal</td>
            <td style="width: 2%;">:</td>
            <td style="width: 33%;">{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Jenis Unit</td>
            <td>:</td>
            <td>{{ $unit && $unit->model ? $unit->model : '__________________________' }}</td>
            <td style="font-weight: bold;">Lokasi Washing</td>
            <td>:</td>
            <td>{{ $washLoc ?: '__________________________' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">HM / KM</td>
            <td>:</td>
            <td><strong>{{ $smu ?: '__________________________' }}</strong></td>
            <td style="font-weight: bold;">Shift</td>
            <td>:</td>
            <td><strong>{{ $shift == 'NS' ? 'NS (Malam)' : 'DS (Siang)' }}</strong></td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Nama Petugas</td>
            <td>:</td>
            <td>{{ $petugas ?: '__________________________' }}</td>
            <td style="font-weight: bold;">Jam Selesai</td>
            <td>:</td>
            <td>{{ $endTime ?: '__________________________' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Jam Mulai</td>
            <td>:</td>
            <td>{{ $startTime ?: '__________________________' }}</td>
            <td style="font-weight: bold;">Durasi Washing</td>
            <td>:</td>
            <td>
                {{ $durHours !== '' ? $durHours : '___' }} Jam &nbsp;
                {{ $durMins !== '' ? $durMins : '___' }} Menit
            </td>
        </tr>
    </table>

    <div class="petunjuk-text">
        PETUNJUK: Beri tanda centang pada YA / TIDAK / N/A. Catat temuan pada kolom keterangan.
    </div>

    <!-- Section A & Section B Table (Page 1) -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th class="col-no">NO</th>
                <th style="text-align: left; padding-left: 6px;">ITEM PEMERIKSAAN / PEKERJAAN</th>
                <th class="col-choice">YA</th>
                <th class="col-choice">TIDAK</th>
                <th class="col-choice">N/A</th>
                <th class="col-keterangan">KETERANGAN / TEMUAN</th>
            </tr>
        </thead>
        <tbody>
            <!-- Header A -->
            <tr>
                <td colspan="6" class="section-header-td">A. PEMERIKSAAN SEBELUM WASHING</td>
            </tr>
            @foreach($secA as $item)
                @php $st = strtoupper($item['status'] ?? ''); @endphp
                <tr>
                    <td class="col-no">{{ $item['item_no'] ?? $loop->iteration }}</td>
                    <td>{{ $item['task'] ?? '' }}</td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'YA' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'TIDAK' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'NA' || $st === 'N/A' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-keterangan">{{ $item['keterangan'] ?? '' }}</td>
                </tr>
            @endforeach

            <!-- Header B -->
            <tr>
                <td colspan="6" class="section-header-td">B. PELAKSANAAN WASHING</td>
            </tr>
            @foreach($secB as $item)
                @php $st = strtoupper($item['status'] ?? ''); @endphp
                <tr>
                    <td class="col-no">{{ $item['item_no'] ?? $loop->iteration }}</td>
                    <td>{{ $item['task'] ?? '' }}</td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'YA' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'TIDAK' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'NA' || $st === 'N/A' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-keterangan">{{ $item['keterangan'] ?? '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table style="width: 100%; font-size: 6.5pt; color: #555; margin-top: 4px;">
        <tr>
            <td style="width: 50%;">Form No: {{ $formNumber }}</td>
            <td style="width: 50%; text-align: right;">Halaman 1</td>
        </tr>
    </table>

    <!-- ════════════════════════════════ PAGE 2 ════════════════════════════════ -->
    <div class="page-break"></div>

    <div class="header-title-box">
        <div class="header-main-title" style="font-size: 11pt;">FORM WASHING UNIT TAMBANG (LANJUTAN)</div>
        <div class="header-sub-title">UNIT: <strong>{{ $unit ? $unit->code_unit : '-' }}</strong> | TANGGAL: {{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }} | SHIFT: {{ $shift }}</div>
    </div>

    <!-- Section C Table -->
    <table class="checklist-table">
        <thead>
            <tr>
                <th class="col-no">NO</th>
                <th style="text-align: left; padding-left: 6px;">ITEM PEMERIKSAAN / PEKERJAAN</th>
                <th class="col-choice">YA</th>
                <th class="col-choice">TIDAK</th>
                <th class="col-choice">N/A</th>
                <th class="col-keterangan">KETERANGAN / TEMUAN</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="6" class="section-header-td">C. INSPEKSI SETELAH WASHING</td>
            </tr>
            @foreach($secC as $item)
                @php $st = strtoupper($item['status'] ?? ''); @endphp
                <tr>
                    <td class="col-no">{{ $item['item_no'] ?? $loop->iteration }}</td>
                    <td>{{ $item['task'] ?? '' }}</td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'YA' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'TIDAK' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-choice">
                        <div class="choice-box">{{ $st === 'NA' || $st === 'N/A' ? '&#10003;' : '' }}</div>
                    </td>
                    <td class="col-keterangan">{{ $item['keterangan'] ?? '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Section D: Temuan / Tindak Lanjut -->
    <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 2px; text-transform: uppercase;">
        D. TEMUAN / TINDAK LANJUT
    </div>
    <table class="findings-table">
        <thead>
            <tr>
                <th style="width: 25px;">NO</th>
                <th style="width: 28%;">DESKRIPSI TEMUAN</th>
                <th style="width: 22%;">LOKASI / KOMPONEN</th>
                <th style="width: 22%;">TINDAKAN</th>
                <th style="width: 15%;">NO. WO / PR TINDAK LANJUT</th>
                <th style="width: 13%;">PIC / TARGET</th>
            </tr>
        </thead>
        <tbody>
            @foreach($findings as $idx => $f)
                @if($idx < 5)
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                        <td>{{ $f['deskripsi'] ?? '' }}</td>
                        <td>{{ $f['lokasi'] ?? '' }}</td>
                        <td>{{ $f['tindakan'] ?? '' }}</td>
                        <td>{{ $f['no_wo_pr'] ?? '' }}</td>
                        <td>{{ $f['pic_target'] ?? '' }}</td>
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Status Akhir -->
    <div class="status-akhir-box">
        <span style="margin-right: 15px;">STATUS AKHIR:</span>
        <div class="status-option">
            <span class="status-square">{{ $finalStatus === 'SELESAI / BERSIH' ? '&#10003;' : '' }}</span>
            SELESAI / BERSIH
        </div>
        <div class="status-option">
            <span class="status-square">{{ $finalStatus === 'PERLU WASHING ULANG' ? '&#10003;' : '' }}</span>
            PERLU WASHING ULANG
        </div>
        <div class="status-option">
            <span class="status-square">{{ $finalStatus === 'PERLU TINDAK LANJUT' ? '&#10003;' : '' }}</span>
            PERLU TINDAK LANJUT
        </div>
    </div>

    <!-- Signatures -->
    <table class="sign-table">
        <tr>
            <td>
                <div style="margin-bottom: 30px;">Dikerjakan oleh</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $results['dikerjakan_oleh'] ?? ($petugas ?: '( Nama / TTD )') }}
                </div>
                <div style="font-size: 6.5pt; color: #444; margin-top: 2px;">Washingman / Petugas</div>
            </td>
            <td>
                <div style="margin-bottom: 30px;">Diperiksa oleh</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $results['diperiksa_oleh'] ?? ($supervisorName ?: '( Nama / TTD )') }}
                </div>
                <div style="font-size: 6.5pt; color: #444; margin-top: 2px;">Inspector / Foreman</div>
            </td>
            <td>
                <div style="margin-bottom: 30px;">Diserahkan kepada</div>
                <div style="font-weight: bold; text-decoration: underline;">
                    {{ $results['diserahkan_kepada'] ?? '( Nama / TTD )' }}
                </div>
                <div style="font-size: 6.5pt; color: #444; margin-top: 2px;">Mekanik / User Plant</div>
            </td>
        </tr>
    </table>

    <!-- SOP Safety Note -->
    <div class="footer-note">
        <strong>CATATAN:</strong> Ikuti SOP site dan manual OEM; hindari semprotan bertekanan tinggi ke konektor listrik, intake, breather, dan seal.
    </div>

    <table style="width: 100%; font-size: 6.5pt; color: #555; margin-top: 4px;">
        <tr>
            <td style="width: 50%;">Form No: {{ $formNumber }}</td>
            <td style="width: 50%; text-align: right;">Halaman 2</td>
        </tr>
    </table>

</body>
</html>
