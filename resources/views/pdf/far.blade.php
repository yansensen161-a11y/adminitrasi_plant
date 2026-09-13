<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>FAR - {{ $far->no_far }}</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; margin: -10px; }
        .header { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
        .sub-header { text-align: center; font-size: 12px; margin-bottom: 20px; }
        .section-title { background: #f0f0f0; padding: 4px; font-weight: bold; border: 1px solid #000; margin-top: 10px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { border: 1px solid #000; padding: 4px; vertical-align: top; }
        .label { font-weight: bold; width: 30%; background: #fafafa; }
        .page-break { page-break-after: always; }
        .signature-box { height: 60px; }
        .center { text-align: center; }
        
        /* Layout Grid for Top Sections */
        .grid-container { width: 100%; margin-bottom: 10px; }
        .grid-container td { border: none; padding: 0 5px 0 0; }
        .box { border: 1px solid #000; height: 100%; }
        .box-title { background: #f0f0f0; padding: 3px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; font-size: 9px; }
        .box-content { padding: 5px; }
        .data-table { border: none; margin-bottom: 0; }
        .data-table td { border: none; padding: 2px 0; }
        .data-table .label { width: 45%; font-weight: normal; background: none; }
        
        .analysis-table td { border: 1px solid #000; }
        .analysis-header { background: #f0f0f0; font-weight: bold; font-size: 9px; }
    </style>
</head>
<body>

    <div class="header">FAILURE ANALYSIS REPORT (FAR)</div>
    <div class="sub-header">No: {{ $far->no_far }}</div>

    <table class="grid-container">
        <tr>
            <!-- Col 1 -->
            <td width="23%">
                <div class="box">
                    <div class="box-title">1. IDENTITAS FAR</div>
                    <div class="box-content">
                        <table class="data-table">
                            <tr><td class="label">Status:</td><td class="value">{{ $far->status }}</td></tr>
                            <tr><td class="label">Tgl Kejadian:</td><td class="value">{{ \Carbon\Carbon::parse($far->tgl_kejadian)->format('d/m/Y') }}</td></tr>
                            <tr><td class="label">Tgl Lapor:</td><td class="value">{{ \Carbon\Carbon::parse($far->tgl_lapor)->format('d/m/Y') }}</td></tr>
                            <tr><td class="label">Pelapor:</td><td class="value">{{ $far->pelapor->name ?? '-' }}</td></tr>
                        </table>
                    </div>
                </div>
            </td>
            <!-- Col 2 -->
            <td width="25%">
                <div class="box">
                    <div class="box-title">2. IDENTITAS UNIT</div>
                    <div class="box-content">
                        <table class="data-table">
                            <tr><td class="label">No Unit:</td><td class="value" style="color:#1a73e8">{{ $far->unit->code_unit ?? '-' }}</td></tr>
                            <tr><td class="label">Site / Project:</td><td class="value">{{ $far->site_project ?: '-' }}</td></tr>
                            <tr><td class="label">Model:</td><td class="value">{{ $far->unit->type_unit ?? '-' }}</td></tr>
                            <tr><td class="label">SN Chassis:</td><td class="value">{{ $far->unit->chasis_sn ?? '-' }}</td></tr>
                            <tr><td class="label">SMU Failure:</td><td class="value">{{ $far->smu_failure ?: '-' }}</td></tr>
                        </table>
                    </div>
                </div>
            </td>
            <!-- Col 3 -->
            <td width="27%">
                <div class="box">
                    <div class="box-title">3. COMPONENT FAILURE</div>
                    <div class="box-content">
                        <table class="data-table">
                            <tr><td class="label">Part No:</td><td class="value" style="color:#d32f2f">{{ $far->part_no ?: '-' }}</td></tr>
                            <tr><td class="label">Nama Komp:</td><td class="value">{{ $far->nama_komp ?: '-' }}</td></tr>
                            <tr><td class="label">P/N:</td><td class="value">{{ $far->pn ?: '-' }}</td></tr>
                            <tr><td class="label">Penyebab:</td><td class="value">{{ $far->penyebab ?: '-' }}</td></tr>
                            <tr><td class="label">Engine Model:</td><td class="value">{{ $far->engine_model ?: '-' }}</td></tr>
                            <tr><td class="label">Engine SN:</td><td class="value">{{ $far->engine_sn ?: '-' }}</td></tr>
                        </table>
                    </div>
                </div>
            </td>
            <!-- Col 4 -->
            <td width="25%" style="padding-right: 0;">
                <div class="box">
                    <div class="box-title">4. LAST COMP & OIL</div>
                    <div class="box-content">
                        <table class="data-table">
                            <tr><td class="label">Comp Installed:</td><td class="value">{{ $far->comp_installed ?: '-' }}</td></tr>
                            <tr><td class="label">Comp Hours:</td><td class="value">{{ $far->comp_hours ?: '-' }}</td></tr>
                            <tr><td class="label">Oil Sampled:</td><td class="value">{{ $far->oil_sampled ?: '-' }}</td></tr>
                            <tr><td class="label">Oil Eval:</td><td class="value">{{ $far->oil_eval ?: '-' }}</td></tr>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">5. URAIAN HASIL ANALISA KERUSAKAN</div>
    <table class="analysis-table">
        <tr><td class="analysis-header">A. FAILURE OUTLINE (Ringkasan Kerusakan)</td></tr>
        <tr><td>{!! nl2br(e($far->failure_outline ?: '-')) !!}</td></tr>
        <tr><td class="analysis-header">B. BACKGROUND (Latar Belakang & Kronologi)</td></tr>
        <tr><td>{!! nl2br(e($far->background ?: '-')) !!}</td></tr>
        <tr><td class="analysis-header">C. FAILURE ANALYSIS (Analisa Penyebab Teknis)</td></tr>
        <tr><td>{!! nl2br(e($far->failure_analysis ?: '-')) !!}</td></tr>
        <tr><td class="analysis-header">D. CONCLUSION (Kesimpulan)</td></tr>
        <tr><td>{!! nl2br(e($far->conclusion ?: '-')) !!}</td></tr>
    </table>

    <table style="margin-top: 10px; text-align: center;">
        <tr>
            <td width="33%">
                <strong>Prepared By</strong><br><br><br><br>
                <u>{{ $far->prepared_by ?: '________________________' }}</u><br>
                Pembuat Laporan
            </td>
            <td width="33%">
                <strong>Reviewed By</strong><br><br><br><br>
                <u>{{ $far->reviewed_by ?: '________________________' }}</u><br>
                Supervisor
            </td>
            <td width="34%">
                <strong>Approved By</strong><br><br><br><br>
                <u>{{ $far->approved_by ?: '________________________' }}</u><br>
                Plant Superintendent
            </td>
        </tr>
    </table>

    @if(count($far->photos) > 0)
        <div class="page-break"></div>
        <div class="section-title">6. DOKUMENTASI FOTO OBSERVASI</div>
        
        <table style="border: none;">
            @foreach($far->photos->chunk(2) as $chunk)
            <tr>
                @foreach($chunk as $photo)
                <td style="width: 50%; padding: 5px; border: none; text-align: center;">
                    @php
                        $path = storage_path('app/public/' . $photo->foto_path);
                        $type = pathinfo($path, PATHINFO_EXTENSION);
                        if(file_exists($path)) {
                            $data = file_get_contents($path);
                            $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                            echo '<img src="'.$base64.'" style="max-width: 100%; max-height: 250px; border: 1px solid #ccc;"/>';
                        }
                    @endphp
                    <div style="font-weight: bold; margin-top: 5px; font-size: 11px;">{{ $photo->komponen_bagian }}</div>
                    <div style="font-size: 10px;">{{ $photo->observasi }}</div>
                </td>
                @endforeach
            </tr>
            @endforeach
        </table>
    @endif

</body>
</html>
