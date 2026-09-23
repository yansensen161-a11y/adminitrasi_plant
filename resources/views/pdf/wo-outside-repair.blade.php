<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>WO External Repair - {{ $wo->wo_no }}</title>
    <style>
        @page {
            margin: 10mm 15mm;
            size: a4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #000;
            font-size: 9px;
            line-height: 1.3;
        }
        .outer-frame {
            border: 2px solid #000;
            padding: 10px 14px;
            min-height: 980px;
            position: relative;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .company-name {
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .company-address {
            font-size: 8px;
            color: #222;
            font-style: italic;
        }
        .doc-title-box {
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            text-align: center;
            padding: 5px 0;
            margin-bottom: 6px;
        }
        .doc-title {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .main-info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 6px;
        }
        .main-info-table td {
            border: 1px solid #000;
            padding: 3px 6px;
            font-size: 8.5px;
            vertical-align: middle;
        }
        .label-col {
            font-weight: bold;
            text-transform: uppercase;
        }
        .colon {
            width: 8px;
            text-align: center;
        }
        .val-col {
            font-weight: bold;
            text-transform: uppercase;
        }
        .section-box {
            border: 1px solid #000;
            margin-bottom: 6px;
        }
        .section-header {
            font-weight: bold;
            font-size: 9px;
            padding: 3px 6px;
            border-bottom: 1px solid #000;
            text-transform: uppercase;
            background-color: #fafafa;
        }
        .section-body {
            padding: 5px 8px;
            font-weight: bold;
            font-size: 9px;
            min-height: 24px;
            text-transform: uppercase;
        }
        .photo-box {
            border: 1px solid #000;
            text-align: center;
            padding: 8px;
            margin-bottom: 10px;
            min-height: 260px;
            max-height: 380px;
            vertical-align: middle;
        }
        .photo-box img {
            max-width: 90%;
            max-height: 340px;
            object-fit: contain;
            border: 1px solid #ddd;
        }
        .photo-placeholder {
            padding-top: 120px;
            color: #777;
            font-style: italic;
            font-size: 10px;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .signature-table td {
            width: 20%;
            text-align: center;
            vertical-align: bottom;
            font-size: 8px;
            padding: 0 4px;
        }
        .sig-title {
            font-weight: normal;
            font-size: 8.5px;
            margin-bottom: 45px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 8.5px;
            border-bottom: 1px solid #000;
            display: inline-block;
            padding-bottom: 1px;
            min-width: 80px;
        }
        .sig-role {
            font-size: 8px;
            font-weight: bold;
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <div class="outer-frame">
        <!-- HEADER -->
        <table class="header-table">
            <tr>
                <td style="width: 55px; vertical-align: middle;">
                    @if(file_exists(public_path('images/logo.png')))
                        <img src="{{ public_path('images/logo.png') }}" style="height: 38px; width: auto;" alt="Logo">
                    @endif
                </td>
                <td style="vertical-align: middle; padding-left: 6px;">
                    <div class="company-name">PT. MITRA ABADI MAHAKAM</div>
                    <div class="company-address">Jln. A.W. Syahranie No. 40 Samarinda</div>
                </td>
            </tr>
        </table>

        <!-- DOCUMENT TITLE -->
        <div class="doc-title-box">
            <span class="doc-title">WORK ORDER EXTERNAL REPAIR SHOP</span>
        </div>

        <!-- 2 COLUMNS METADATA TABLE -->
        <table class="main-info-table">
            <tr>
                <!-- LEFT COLUMN -->
                <td style="width: 110px;" class="label-col">WO. NO.</td>
                <td class="colon">:</td>
                <td style="width: 180px;" class="val-col">{{ $wo->wo_no }}</td>
                <!-- RIGHT COLUMN -->
                <td style="width: 110px;" class="label-col">MODEL MESIN</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->model_mesin ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label-col">DATE</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->date ? \Carbon\Carbon::parse($wo->date)->format('d-M-y') : '-' }}</td>
                <td class="label-col">SERIAL NO.</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->serial_no_unit ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label-col">NAMA BENGKEL</td>
                <td class="colon">:</td>
                <td class="val-col">{{ strtoupper($wo->nama_bengkel) }}</td>
                <td class="label-col">KODE UNIT</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->kode_unit ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label-col">TANGGAL KIRIM</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->tanggal_kirim ? \Carbon\Carbon::parse($wo->tanggal_kirim)->format('d-M-y') : '-' }}</td>
                <td class="label-col">NAMA KOMPONEN</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->nama_komponen }}</td>
            </tr>
            <tr>
                <td class="label-col">ESTIMASI FINISH</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->estimasi_finish ? \Carbon\Carbon::parse($wo->estimasi_finish)->format('d-M-y') : '-' }}</td>
                <td class="label-col">COMPONENT GROUP</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->model_komponen ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label-col">PIC</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->pic ?: 'AMBO MAI' }}</td>
                <td class="label-col">S/N. KOMPONEN</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->sn_komponen ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label-col">EKS. LOKASI</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->lokasi ?: 'HW' }}</td>
                <td class="label-col">SMR / HRS</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->smr_hours ? number_format((float)$wo->smr_hours, 0, ',', '.') : '0' }}</td>
            </tr>
            <tr>
                <td class="label-col">TANGGAL KERUSAKAN</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->tanggal_kerusakan ? \Carbon\Carbon::parse($wo->tanggal_kerusakan)->format('d-M-y') : '-' }}</td>
                <td class="label-col">Qty</td>
                <td class="colon">:</td>
                <td class="val-col">{{ $wo->qty ?: 1 }}</td>
            </tr>
        </table>

        <!-- PROBLEM -->
        <div class="section-box">
            <div class="section-header">PROBLEM :</div>
            <div class="section-body">{{ $wo->problem ?: '-' }}</div>
        </div>

        <!-- JOB INSTRUCTION -->
        <div class="section-box">
            <div class="section-header">JOB INSTRUCTION :</div>
            <div class="section-body">{{ $wo->job_instruction ?: '-' }}</div>
        </div>

        <!-- FOTO KOMPONEN -->
        <div class="photo-box">
            @if($wo->photo_path && file_exists(public_path('storage/' . $wo->photo_path)))
                <img src="{{ public_path('storage/' . $wo->photo_path) }}" alt="Foto Komponen">
            @elseif($wo->photo_path && file_exists(public_path($wo->photo_path)))
                <img src="{{ public_path($wo->photo_path) }}" alt="Foto Komponen">
            @else
                <div class="photo-placeholder">
                    [ FOTO KOMPONEN DILAMPIRKAN DI SINI ]<br>
                    <small style="color: #999;">Tag: {{ $wo->kode_unit }} - {{ $wo->nama_komponen }}</small>
                </div>
            @endif
        </div>

        <!-- 5 COLUMNS SIGNATURES -->
        <table class="signature-table">
            <tr>
                <td>
                    <div class="sig-title">Dibuat Oleh,</div>
                    <div class="sig-name">{{ $wo->dibuat_oleh ?: 'Admin Plant' }}</div>
                    <div class="sig-role">Admin Plant</div>
                </td>
                <td>
                    <div class="sig-title">Diketahui Oleh,</div>
                    <div class="sig-name">{{ $wo->diketahui_oleh ?: 'Planner' }}</div>
                    <div class="sig-role">Planner</div>
                </td>
                <td>
                    <div class="sig-title">Disetujui Oleh,</div>
                    <div class="sig-name">{{ $wo->disetujui_oleh ?: 'Ambo Mai' }}</div>
                    <div class="sig-role">Superintendent Plant</div>
                </td>
                <td>
                    <div class="sig-title">Dikirim Oleh,</div>
                    <div class="sig-name">{{ $wo->dikirim_oleh ?: 'DANI' }}</div>
                    <div class="sig-role">Logistic</div>
                </td>
                <td>
                    <div class="sig-title">Diterima Oleh,</div>
                    <div class="sig-name">( {{ $wo->diterima_oleh ?: '               ' }} )</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
