<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>Form Penundaan Service Unit Tambang - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 7mm 9mm 6mm 9mm;
            size: a4 landscape;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 7.5pt;
            line-height: 1.25;
            margin: 0;
            padding: 0;
        }
        .header-title-box {
            text-align: center;
            margin-bottom: 7px;
            position: relative;
        }
        .header-main-title {
            font-size: 13pt;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }
        .header-sub-title {
            font-size: 8pt;
            font-weight: bold;
            color: #444;
            letter-spacing: 0.6px;
            margin-top: 1px;
        }
        .form-num-badge {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 7pt;
            font-weight: bold;
            color: #333;
            border: 1px solid #777;
            padding: 2px 6px;
            background: #f9f9f9;
        }
        .section-header {
            font-size: 7.5pt;
            font-weight: bold;
            color: #111;
            background-color: #f1f5f9;
            border: 1px solid #64748b;
            border-bottom: none;
            padding: 2.5px 6px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #64748b;
            margin-bottom: 6px;
        }
        .data-table td {
            padding: 3px 6px;
            font-size: 7.2pt;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
        }
        .data-table .label-col {
            font-weight: bold;
            color: #1e293b;
            background-color: #fafafa;
        }
        .val-underline {
            display: inline-block;
            min-width: 90%;
            border-bottom: 1px dotted #555;
            padding-bottom: 1px;
        }
        .choice-box {
            display: inline-block;
            width: 13px;
            height: 13px;
            border: 1.2px solid #000;
            text-align: center;
            line-height: 12px;
            font-size: 8.5pt;
            font-family: 'DejaVu Sans', sans-serif;
            font-weight: bold;
            margin-right: 4px;
            vertical-align: middle;
        }
        .approval-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #475569;
            margin-bottom: 4px;
        }
        .approval-table th {
            background-color: #e2e8f0;
            border: 1px solid #475569;
            padding: 3px 6px;
            font-size: 7pt;
            font-weight: bold;
            text-align: left;
        }
        .approval-table td {
            border: 1px solid #64748b;
            padding: 3.5px 6px;
            font-size: 7pt;
            vertical-align: middle;
        }
        .catatan-footer {
            font-size: 6.8pt;
            font-style: italic;
            color: #333;
            margin-top: 3px;
            padding-top: 2px;
            border-top: 1px solid #94a3b8;
        }
    </style>
</head>
<body>

    @php
        $identitas = $results['identitas'] ?? [];
        $detail = $results['detail_penundaan'] ?? [];
        $mitigasi = $results['mitigasi_risiko'] ?? [];
        $approvals = $results['approvals'] ?? [];
        $selectedReasons = is_array($reasons) ? $reasons : [];
        $alasanLainnya = $results['alasan_lainnya'] ?? '';

        // Overdue calculations
        $hmRencana = isset($detail['hm_rencana_service']) && $detail['hm_rencana_service'] !== '' ? (float)$detail['hm_rencana_service'] : null;
        $hmSaat = isset($detail['hm_saat_penundaan']) && $detail['hm_saat_penundaan'] !== '' ? (float)$detail['hm_saat_penundaan'] : null;
        $hmPengganti = isset($detail['estimasi_hm_pengganti']) && $detail['estimasi_hm_pengganti'] !== '' ? (float)$detail['estimasi_hm_pengganti'] : null;

        $overdueSaat = $detail['overdue_saat_penundaan'] ?? '';
        if ($overdueSaat === '' && $hmSaat !== null && $hmRencana !== null) {
            $overdueSaat = max(0, $hmSaat - $hmRencana);
        }

        $proyeksiOverdue = $detail['proyeksi_overdue'] ?? '';
        if ($proyeksiOverdue === '' && $hmPengganti !== null && $hmRencana !== null) {
            $proyeksiOverdue = max(0, $hmPengganti - $hmRencana);
        }

        $durasiHari = $detail['durasi_penundaan'] ?? '';
    @endphp

    <!-- Document Header -->
    <div class="header-title-box">
        <div class="header-main-title">FORM PENUNDAAN SERVICE UNIT TAMBANG</div>
        <div class="header-sub-title">SERVICE POSTPONEMENT FORM | MAINTENANCE PLANT</div>
        <div class="form-num-badge">No. Form: {{ $formNumber }}</div>
    </div>

    <!-- 01 IDENTITAS UNIT -->
    <div class="section-header">01 IDENTITAS UNIT</div>
    <table class="data-table">
        <tr>
            <td class="label-col" style="width: 17%;">Tanggal Pengajuan</td>
            <td style="width: 2%;">:</td>
            <td style="width: 31%;">{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</td>
            <td class="label-col" style="width: 17%;">Kode Unit</td>
            <td style="width: 2%;">:</td>
            <td style="width: 31%;"><strong>{{ $unit ? $unit->code_unit : ($identitas['kode_unit'] ?? '__________________') }}</strong></td>
        </tr>
        <tr>
            <td class="label-col">Jenis / Model Unit</td>
            <td>:</td>
            <td>{{ $unit && $unit->model ? $unit->model : ($identitas['jenis_model'] ?? '__________________') }}</td>
            <td class="label-col">Lokasi Unit</td>
            <td>:</td>
            <td>{{ $unit && $unit->lokasi ? $unit->lokasi : ($identitas['lokasi_unit'] ?? '__________________') }}</td>
        </tr>
        <tr>
            <td class="label-col">HM Aktual</td>
            <td>:</td>
            <td><strong>{{ $smu !== '' ? number_format((float)$smu, 1, '.', '') : ($unit?->current_hm ? number_format((float)$unit->current_hm, 1, '.', '') : '__________________') }}</strong></td>
            <td class="label-col">Jenis Service</td>
            <td>:</td>
            <td><strong>{{ $serviceType ?: ($identitas['jenis_service'] ?? 'PS 250') }}</strong></td>
        </tr>
        <tr>
            <td class="label-col">Interval Service (HM)</td>
            <td>:</td>
            <td>{{ $identitas['interval_service'] ?? '250' }} HM</td>
            <td class="label-col">Pengaju</td>
            <td>:</td>
            <td>{{ $mechanicName ?: ($identitas['pengaju'] ?? '__________________') }}</td>
        </tr>
    </table>

    <!-- 02 DETAIL PENUNDAAN SERVICE -->
    <div class="section-header">02 DETAIL PENUNDAAN SERVICE</div>
    <table class="data-table">
        <tr>
            <td class="label-col" style="width: 17%;">Tanggal Service Awal</td>
            <td style="width: 2%;">:</td>
            <td style="width: 31%;">{{ !empty($detail['tgl_service_awal']) ? date('d/m/Y', strtotime($detail['tgl_service_awal'])) : '__________________' }}</td>
            <td class="label-col" style="width: 17%;">Tanggal Service Pengganti</td>
            <td style="width: 2%;">:</td>
            <td style="width: 31%;">{{ !empty($detail['tgl_service_pengganti']) ? date('d/m/Y', strtotime($detail['tgl_service_pengganti'])) : '__________________' }}</td>
        </tr>
        <tr>
            <td class="label-col">HM Rencana Service</td>
            <td>:</td>
            <td>{{ $detail['hm_rencana_service'] ?? '__________________' }}</td>
            <td class="label-col">Estimasi HM Pengganti</td>
            <td>:</td>
            <td>{{ $detail['estimasi_hm_pengganti'] ?? '__________________' }}</td>
        </tr>
        <tr>
            <td class="label-col">HM Saat Penundaan</td>
            <td>:</td>
            <td>{{ $detail['hm_saat_penundaan'] ?? ($smu ?: '__________________') }}</td>
            <td class="label-col">Durasi Penundaan</td>
            <td>:</td>
            <td><strong>{{ $durasiHari !== '' ? $durasiHari : '__________' }} Hari</strong></td>
        </tr>
        <tr>
            <td class="label-col">Overdue Saat Penundaan</td>
            <td>:</td>
            <td><strong>{{ $overdueSaat !== '' ? $overdueSaat : '__________' }} HM</strong></td>
            <td class="label-col">Proyeksi Overdue</td>
            <td>:</td>
            <td><strong>{{ $proyeksiOverdue !== '' ? $proyeksiOverdue : '__________' }} HM</strong></td>
        </tr>
    </table>

    <!-- 03 ALASAN PENUNDAAN -->
    <div class="section-header">03 ALASAN PENUNDAAN</div>
    <table class="data-table">
        <tr>
            <td style="width: 25%; padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Unit masih dibutuhkan untuk produksi', $selectedReasons) ? '&#10003;' : '' }}</span>
                Unit masih dibutuhkan untuk produksi
            </td>
            <td style="width: 25%; padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Spare part belum tersedia', $selectedReasons) ? '&#10003;' : '' }}</span>
                Spare part belum tersedia
            </td>
            <td style="width: 25%; padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Mekanik belum tersedia', $selectedReasons) ? '&#10003;' : '' }}</span>
                Mekanik belum tersedia
            </td>
            <td style="width: 25%; padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Service bay belum tersedia', $selectedReasons) ? '&#10003;' : '' }}</span>
                Service bay belum tersedia
            </td>
        </tr>
        <tr>
            <td style="padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Unit sulit dijangkau', $selectedReasons) ? '&#10003;' : '' }}</span>
                Unit sulit dijangkau
            </td>
            <td style="padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Kondisi cuaca', $selectedReasons) ? '&#10003;' : '' }}</span>
                Kondisi cuaca
            </td>
            <td style="padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Menunggu persetujuan Operations', $selectedReasons) ? '&#10003;' : '' }}</span>
                Menunggu persetujuan Operations
            </td>
            <td style="padding: 4px 6px;">
                <span class="choice-box">{{ in_array('Lainnya', $selectedReasons) || !empty($alasanLainnya) ? '&#10003;' : '' }}</span>
                Lainnya: {{ $alasanLainnya ?: '__________' }}
            </td>
        </tr>
        <tr>
            <td colspan="4" style="padding: 4px 6px; background-color: #fafafa;">
                <strong>Keterangan / justifikasi:</strong><br>
                <div style="min-height: 22px; padding-top: 2px;">
                    {{ $notes ?: '____________________________________________________________________________________________________________________________________________________' }}
                </div>
            </td>
        </tr>
    </table>

    <!-- 04 MITIGASI RISIKO DAN TINDAK LANJUT -->
    <div class="section-header">04 MITIGASI RISIKO DAN TINDAK LANJUT</div>
    <table class="data-table">
        <tr>
            <td class="label-col" style="width: 22%;">Batas toleransi HM (OEM)</td>
            <td style="width: 2%;">:</td>
            <td style="width: 26%;">{{ $mitigasi['batas_toleransi_hm'] ?? '__________________' }}</td>
            <td class="label-col" style="width: 22%;">Pemeriksaan kondisi unit</td>
            <td style="width: 2%;">:</td>
            <td style="width: 26%;">{{ $mitigasi['pemeriksaan_kondisi'] ?? '__________________' }}</td>
        </tr>
        <tr>
            <td class="label-col">Rencana monitoring</td>
            <td>:</td>
            <td>{{ $mitigasi['rencana_monitoring'] ?? '__________________' }}</td>
            <td class="label-col">Tindak lanjut / PIC</td>
            <td>:</td>
            <td>{{ $mitigasi['tindak_lanjut_pic'] ?? '__________________' }}</td>
        </tr>
    </table>

    <!-- 05 PERSETUJUAN -->
    <div class="section-header">05 PERSETUJUAN</div>
    <table class="approval-table">
        <thead>
            <tr>
                <th style="width: 28%;">Jabatan</th>
                <th style="width: 22%;">Nama</th>
                <th style="width: 13%;">Tanggal</th>
                <th style="width: 17%; text-align: center;">Tanda Tangan</th>
                <th style="width: 20%;">Keputusan / Catatan</th>
            </tr>
        </thead>
        <tbody>
            @php
                $roles = [
                    'Operations Supervisor / Superintendent',
                    'Maintenance Planner',
                    'Maintenance Supervisor',
                    'Maintenance Superintendent'
                ];
            @endphp
            @foreach($roles as $idx => $roleName)
                @php
                    $appr = null;
                    if (is_array($approvals)) {
                        foreach ($approvals as $a) {
                            if (isset($a['jabatan']) && trim($a['jabatan']) === $roleName) {
                                $appr = $a;
                                break;
                            }
                        }
                        if (!$appr && isset($approvals[$idx])) {
                            $appr = $approvals[$idx];
                        }
                    }
                @endphp
                <tr>
                    <td style="font-weight: bold; background-color: #fafafa;">{{ $roleName }}</td>
                    <td>{{ $appr['nama'] ?? '' }}</td>
                    <td>{{ !empty($appr['tanggal']) ? date('d/m/Y', strtotime($appr['tanggal'])) : '' }}</td>
                    <td style="text-align: center; height: 26px; vertical-align: bottom;">
                        @if(!empty($appr['nama']))
                            <div style="font-size: 6pt; color: #555;">( Signed )</div>
                        @else
                            <div style="font-size: 6.5pt; color: #aaa;">( TTD )</div>
                        @endif
                    </td>
                    <td>{{ $appr['keputusan'] ?? ($appr['catatan'] ?? '') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer Catatan SOP -->
    <div class="catatan-footer">
        <strong>Catatan:</strong> Penundaan service wajib mengikuti batas toleransi HM, ketentuan OEM, kondisi unit, dan persetujuan yang berlaku.
    </div>

</body>
</html>
