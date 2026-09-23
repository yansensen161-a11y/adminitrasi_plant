<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>INTERNAL MEMORANDUM / SURAT PERMINTAAN KOMPONEN - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 15mm 20mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 9pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .company-logo {
            font-size: 11pt;
            font-weight: bold;
            color: #b91c1c;
        }
        .title-text {
            font-size: 10.5pt;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5px;
            margin-top: 15px;
            margin-bottom: 25px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .meta-table td {
            padding: 2px 0;
            font-size: 9pt;
            vertical-align: top;
        }
        .recipient-box {
            margin-bottom: 20px;
            font-size: 9pt;
            line-height: 1.4;
        }
        .body-paragraph {
            text-align: justify;
            margin-bottom: 15px;
            font-size: 9pt;
            line-height: 1.5;
        }
        .component-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        .component-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            font-size: 9pt;
        }
        .component-table th {
            border: 1px solid #000;
            padding: 5px 8px;
            background-color: #f2f2f2;
            font-size: 8.5pt;
            font-weight: bold;
            text-align: center;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-top: 30px;
        }
        .signature-table td {
            border: 1px solid #000;
            padding: 6px 10px;
            vertical-align: top;
            text-align: center;
            font-size: 8.5pt;
        }
        .sig-spacer {
            height: 45px;
        }
        .sig-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .sig-role {
            font-size: 8pt;
            color: #111;
        }
    </style>
</head>
<body>

    <!-- Header Logo & Name -->
    <div style="text-align: center; margin-bottom: 10px;">
        <span class="company-logo">&#9650;&#9650; PT MITRA ABADI MAHAKAM</span>
    </div>

    <!-- Title -->
    <div class="title-text">
        INTERNAL MEMORANDUM / SURAT PERMINTAAN KOMPONEN
    </div>

    <!-- Meta Details (Tanggal & Perihal) -->
    <table class="meta-table">
        <tr>
            <td style="width: 120px;">Tanggal</td>
            <td style="width: 20px;">:</td>
            <td><strong>{{ $date ? \Carbon\Carbon::parse($date)->translatedFormat('d F Y') : '-' }}</strong></td>
        </tr>
        <tr>
            <td>Perihal</td>
            <td>:</td>
            <td><strong>{{ $results['perihal'] ?? 'Permohonan Permintaan Parts / Komponen' }}</strong></td>
        </tr>
    </table>

    <!-- Recipient Info -->
    <div class="recipient-box">
        <div>Kepada Yth,</div>
        <div style="margin-top: 4px; font-weight: bold;">
            {{ $results['recipient_name'] ?? 'Bpk. Slamet / Bpk. Subani' }}
        </div>
        <div>
            {{ $results['recipient_company'] ?? 'PT MAM Site BBE' }}
        </div>
    </div>

    <div style="margin-bottom: 12px;">
        Dengan hormat,
    </div>

    <!-- Opening Statement -->
    <div class="body-paragraph">
        {{ $results['opening_text'] ?? "Sehubungan dengan diperlukannya perbaikan unit di lokasi kerja Site " . ($results['site_pemohon'] ?? 'Harindo wahana') . ", dengan ini kami mengajukan permohonan permintaan/transfer part bekas dari " . ($results['site_tujuan'] ?? 'Site BBE') . " dengan rincian sebagai berikut:" }}
    </div>

    <!-- Component Details Table -->
    @if(count($items) === 1)
        @php $item = $items[0]; @endphp
        <table class="component-table">
            <tr>
                <td style="width: 32%; background-color: #fafafa;">Nama Komponen</td>
                <td style="width: 68%; font-weight: bold;">{{ $item['component_name'] ?? ($item['description'] ?? '-') }}</td>
            </tr>
            <tr>
                <td style="background-color: #fafafa;">Part Number</td>
                <td style="font-weight: bold;">{{ $item['part_number'] ?? '-' }}</td>
            </tr>
            <tr>
                <td style="background-color: #fafafa;">Unit Request</td>
                <td><strong>{{ $item['unit_request'] ?? ($unit ? "{$unit->model} – {$unit->code_unit}" : '-') }}</strong></td>
            </tr>
            <tr>
                <td style="background-color: #fafafa;">Unit Sumber</td>
                <td>{{ $item['unit_source'] ?? '-' }}</td>
            </tr>
            @if(!empty($item['qty']) && $item['qty'] > 1)
            <tr>
                <td style="background-color: #fafafa;">Jumlah / QTY</td>
                <td>{{ $item['qty'] }}</td>
            </tr>
            @endif
        </table>
    @else
        <table class="component-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th>Nama Komponen</th>
                    <th style="width: 90px;">Part Number</th>
                    <th style="width: 120px;">Unit Request</th>
                    <th style="width: 90px;">Unit Sumber</th>
                    <th style="width: 40px;">QTY</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $idx => $it)
                <tr>
                    <td style="text-align: center;">{{ $idx + 1 }}</td>
                    <td><strong>{{ $it['component_name'] ?? ($it['description'] ?? '-') }}</strong></td>
                    <td style="text-align: center;">{{ $it['part_number'] ?? '-' }}</td>
                    <td>{{ $it['unit_request'] ?? '-' }}</td>
                    <td>{{ $it['unit_source'] ?? '-' }}</td>
                    <td style="text-align: center;">{{ $it['qty'] ?? 1 }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- Reasoning / Purpose Paragraph -->
    <div class="body-paragraph">
        {{ $results['purpose_reason'] ?? "Part bekas tersebut akan digunakan untuk mendukung operasional unit " . ($unit?->code_unit ?? 'ME056') . " yang saat ini mengalami kerusakan pada " . ($results['kerusakan_komponen'] ?? 'Cyl Arm') . "." }}
    </div>

    <!-- Closing -->
    <div class="body-paragraph" style="margin-top: 15px;">
        Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
    </div>

    <!-- Approval Signatures Table (3 Rows) -->
    <table class="signature-table">
        <!-- Row 1: Dibuat Oleh (Planner), Disetujui (Supt), Diketahui (PM) -->
        <tr>
            <td style="width: 33.3%;">
                <div>Dibuat Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_maker_name'] ?? 'Yansen' }}</div>
                <div class="sig-role">{{ $results['sig_maker_role'] ?? 'Planner' }}</div>
            </td>
            <td style="width: 33.3%;">
                <div>Disetujui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_supt_mam_name'] ?? 'Ambo Mai' }}</div>
                <div class="sig-role">{{ $results['sig_supt_mam_role'] ?? 'Superintendent Plant' }}</div>
            </td>
            <td style="width: 33.4%;">
                <div>Diketahui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_pm_name'] ?? 'Supardi Halim' }}</div>
                <div class="sig-role">{{ $results['sig_pm_role'] ?? 'Project Manager' }}</div>
            </td>
        </tr>

        <!-- Row 2: Disetujui (Supt Site Sumber), Disetujui (PJO Site Sumber) -->
        <tr>
            <td colspan="2" style="width: 50%;">
                <div>Disetujui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_supt_source_name'] ?? 'Slamet Nur arif' }}</div>
                <div class="sig-role">{{ $results['sig_supt_source_role'] ?? 'Superintendent Plant' }}</div>
            </td>
            <td style="width: 50%;">
                <div>Disetujui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_pjo_source_name'] ?? 'Subani' }}</div>
                <div class="sig-role">{{ $results['sig_pjo_source_role'] ?? 'PJO' }}</div>
            </td>
        </tr>

        <!-- Row 3: Disetujui (Manager Plant & Asset), Disetujui (Operation Manager) -->
        <tr>
            <td colspan="2" style="width: 50%;">
                <div>Disetujui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_mgr_plant_name'] ?? 'Dadang Prayogo' }}</div>
                <div class="sig-role">{{ $results['sig_mgr_plant_role'] ?? 'Manager Plant & Asset' }}</div>
            </td>
            <td style="width: 50%;">
                <div>Disetujui Oleh</div>
                <div class="sig-spacer"></div>
                <div class="sig-name">{{ $results['sig_mgr_ops_name'] ?? 'Lili Romli' }}</div>
                <div class="sig-role">{{ $results['sig_mgr_ops_role'] ?? 'Operation Manager' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
