<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>ABR - {{ $abr->no_abr }}</title>
    <style>
        @page {
            margin: 12mm 15mm;
            size: a4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #111827;
            font-size: 8.5px;
            line-height: 1.25;
        }
        .header {
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }
        .company-title {
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .doc-title {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            letter-spacing: 0.5px;
        }
        .info-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 0;
            margin-bottom: 8px;
        }
        .info-box {
            border: 1px solid #9ca3af;
            border-radius: 4px;
            padding: 6px 8px;
            vertical-align: top;
            font-size: 8px;
        }
        .info-title {
            font-weight: bold;
            font-size: 8px;
            margin-bottom: 4px;
            color: #1f2937;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
        }
        .info-row {
            margin-bottom: 2px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            border: none;
            padding: 1.5px 0;
            font-size: 8px;
        }
        .info-label {
            width: 65px;
            color: #4b5563;
        }
        .info-val {
            font-weight: bold;
            color: #111827;
        }
        .incident-box {
            border: 1px solid #9ca3af;
            border-radius: 4px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        .incident-header {
            background-color: #e5e7eb;
            padding: 3px 8px;
            font-weight: bold;
            font-size: 8.5px;
            color: #1f2937;
            border-bottom: 1px solid #9ca3af;
        }
        .incident-content {
            padding: 5px 8px;
            font-size: 8px;
            color: #111827;
        }
        .section-title {
            font-weight: bold;
            font-size: 9px;
            margin-bottom: 2px;
            margin-top: 6px;
        }
        .abr-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #4b5563;
            font-size: 8px;
            margin-bottom: 6px;
        }
        .abr-table th, .abr-table td {
            border: 1px solid #6b7280;
            padding: 3px 4px;
        }
        .abr-table th {
            background-color: #e5e7eb;
            color: #1f2937;
            font-weight: bold;
            text-align: center;
            border-bottom: 1.5px solid #4b5563;
        }
        .total-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #4b5563;
            margin-top: 8px;
            margin-bottom: 10px;
        }
        .total-table th {
            background-color: #e5e7eb;
            color: #1f2937;
            font-weight: bold;
            text-align: center;
            padding: 5px 4px;
            font-size: 8.5px;
            border: 1px solid #6b7280;
        }
        .total-table td {
            text-align: center;
            font-weight: bold;
            font-size: 10px;
            padding: 6px 4px;
            border: 1px solid #6b7280;
            background-color: #f9fafb;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #9ca3af;
            background-color: #f9fafb;
            margin-top: 8px;
        }
        .signature-table td {
            border: 1px solid #d1d5db;
            padding: 6px;
            vertical-align: top;
            width: 25%;
        }
        .sig-label {
            font-weight: bold;
            font-size: 8.5px;
            color: #374151;
            margin-bottom: 30px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 8px;
            text-decoration: underline;
        }
        .sig-job {
            font-size: 7.5px;
            color: #4b5563;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .images-section {
            margin-top: 8px;
            page-break-inside: avoid;
        }
        .single-image-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
        }
        .single-image-table td {
            text-align: center;
            vertical-align: middle;
            border: 1px solid #9ca3af;
            border-radius: 4px;
            padding: 6px;
            background-color: #f9fafb;
        }
        .single-image {
            max-height: 250px;
            max-width: 480px;
            height: auto;
            width: auto;
            border: 1px solid #d1d5db;
            border-radius: 2px;
        }
        .images-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
        }
        .images-grid td {
            border: 1px solid #9ca3af;
            border-radius: 4px;
            padding: 4px;
            text-align: center;
            vertical-align: middle;
            background-color: #f9fafb;
        }
    </style>
</head>
<body>

    <div class="header">
        <table width="100%">
            <tr>
                <td width="60%">
                    <div class="company-title">PT. MITRA ABADI MAHAKAM</div>
                    <div class="doc-title">ANALISA BIAYA REPAIR (ABR)</div>
                </td>
                <td width="40%" class="text-right">
                    <div style="font-size: 9px; font-weight: bold;">NO ABR : {{ $abr->no_abr }}</div>
                    <div style="font-size: 9px; font-weight: bold;">NO WO : {{ $abr->no_wo }}</div>
                    <div style="font-size: 8px; color: #4b5563;">Tanggal: {{ \Carbon\Carbon::parse($abr->tanggal)->format('d/m/Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Info Boxes -->
    <table class="info-grid">
        <tr>
            <td width="33%" class="info-box">
                <div class="info-title">INFORMASI DOKUMEN</div>
                <table class="info-table">
                    <tr><td class="info-label">NO ABR</td><td>: <span class="info-val">{{ $abr->no_abr }}</span></td></tr>
                    <tr><td class="info-label">NO WO</td><td>: <span class="info-val">{{ $abr->no_wo }}</span></td></tr>
                    <tr><td class="info-label">Tanggal</td><td>: <span class="info-val">{{ \Carbon\Carbon::parse($abr->tanggal)->format('d/m/Y') }}</span></td></tr>
                    <tr><td class="info-label">Code Unit</td><td>: <span class="info-val">{{ $abr->unit ? $abr->unit->code_unit : ($abr->manual_unit_code ?: '-') }}</span></td></tr>
                </table>
            </td>
            <td width="33%" class="info-box">
                <div class="info-title">SPESIFIKASI UNIT</div>
                <table class="info-table">
                    <tr><td class="info-label">Unit Type</td><td>: <span class="info-val">{{ $abr->unit ? $abr->unit->model : ($abr->manual_unit_model ?: '-') }}</span></td></tr>
                    <tr><td class="info-label">Serial No.</td><td>: <span class="info-val">{{ $abr->unit ? $abr->unit->sn_chassis : ($abr->manual_sn_chassis ?: '-') }}</span></td></tr>
                    <tr><td class="info-label">Model Engine</td><td>: <span class="info-val">{{ $abr->unit ? $abr->unit->engine_model : ($abr->manual_engine_model ?: '-') }}</span></td></tr>
                    <tr><td class="info-label">Engine No.</td><td>: <span class="info-val">{{ $abr->unit ? $abr->unit->sn_engine : ($abr->manual_sn_engine ?: '-') }}</span></td></tr>
                </table>
            </td>
            <td width="34%" class="info-box">
                <div class="info-title">LOKASI & INSPEKSI</div>
                <table class="info-table">
                    <tr><td class="info-label">Lokasi / Site</td><td>: <span class="info-val">{{ $abr->lokasi_site ?: '-' }}</span></td></tr>
                    <tr><td class="info-label">Lokasi Repair</td><td>: <span class="info-val">{{ $abr->lokasi_perbaikan ?: '-' }}</span></td></tr>
                    <tr><td class="info-label">HM</td><td>: <span class="info-val">{{ $abr->hm ?: '-' }}</span></td></tr>
                    <tr><td class="info-label">Inspected By</td><td>: <span class="info-val">{{ $abr->inspected_by ?: '-' }}</span></td></tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Incident Description -->
    <div class="incident-box">
        <div class="incident-header">INCIDENT DESCRIPTION</div>
        <div class="incident-content">{{ $abr->incident_description ?: '-' }}</div>
    </div>

    <!-- 1. List Cost Repair -->
    <div class="section-title">1. List Cost Repair (Property Damage)</div>
    <table class="abr-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="20%">Part Number</th>
                <th width="36%">Description</th>
                <th width="14%">Price (Rp)</th>
                <th width="6%">Qty</th>
                <th width="6%">Sat</th>
                <th width="14%">Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($repairItems as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-center font-mono">{{ $item->part_number ?: '-' }}</td>
                    <td>{{ $item->description ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->price ? number_format($item->price, 0, ',', '.') : '0' }}</td>
                    <td class="text-center">{{ $item->qty ?: '-' }}</td>
                    <td class="text-center">{{ $item->satuan ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->amount ? number_format($item->amount, 0, ',', '.') : '0' }}</td>
                </tr>
            @empty
                <tr><td colspan="7" class="text-center" style="color:#9ca3af;">- Tidak ada data -</td></tr>
            @endforelse
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="6" class="text-right font-bold">Total (1) : </td>
                <td class="text-right font-mono">{{ number_format($repairItems->sum('amount'), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- 2. Manpower Cost -->
    <div class="section-title">2. Manpower Cost</div>
    <table class="abr-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="56%">Description</th>
                <th width="14%">Price (Rp)</th>
                <th width="6%">Qty</th>
                <th width="6%">Sat</th>
                <th width="14%">Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($manpowerItems as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $item->description ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->price ? number_format($item->price, 0, ',', '.') : '0' }}</td>
                    <td class="text-center">{{ $item->qty ?: '-' }}</td>
                    <td class="text-center">{{ $item->satuan ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->amount ? number_format($item->amount, 0, ',', '.') : '0' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="text-center" style="color:#9ca3af;">- Tidak ada data -</td></tr>
            @endforelse
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="5" class="text-right font-bold">Total (2) : </td>
                <td class="text-right font-mono">{{ number_format($manpowerItems->sum('amount'), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- 3. List Cost Spare Part -->
    <div class="section-title">3. List Cost Spare Part</div>
    <table class="abr-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="20%">Part Number</th>
                <th width="36%">Description</th>
                <th width="14%">Price (Rp)</th>
                <th width="6%">Qty</th>
                <th width="6%">MR</th>
                <th width="14%">Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sparepartItems as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-center font-mono">{{ $item->part_number ?: '-' }}</td>
                    <td>{{ $item->description ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->price ? number_format($item->price, 0, ',', '.') : '0' }}</td>
                    <td class="text-center">{{ $item->qty ?: '-' }}</td>
                    <td class="text-center">{{ $item->satuan ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->amount ? number_format($item->amount, 0, ',', '.') : '0' }}</td>
                </tr>
            @empty
                <tr><td colspan="7" class="text-center" style="color:#9ca3af;">- Tidak ada data -</td></tr>
            @endforelse
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="6" class="text-right font-bold">Total (3) : </td>
                <td class="text-right font-mono">{{ number_format($sparepartItems->sum('amount'), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- 4. List Biaya Evakuasi Unit -->
    <div class="section-title">4. List Biaya Evakuasi Unit</div>
    <table class="abr-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="56%">Description</th>
                <th width="14%">Price (Rp)</th>
                <th width="6%">Qty</th>
                <th width="6%">Sat</th>
                <th width="14%">Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($evakuasiItems as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $item->description ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->price ? number_format($item->price, 0, ',', '.') : '0' }}</td>
                    <td class="text-center">{{ $item->qty ?: '-' }}</td>
                    <td class="text-center">{{ $item->satuan ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->amount ? number_format($item->amount, 0, ',', '.') : '0' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="text-center" style="color:#9ca3af;">- Tidak ada data -</td></tr>
            @endforelse
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="5" class="text-right font-bold">Total (4) : </td>
                <td class="text-right font-mono">{{ number_format($evakuasiItems->sum('amount'), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- 5. List Cost Disassembly, Assembly & Akomodasi -->
    <div class="section-title">5. List Cost Disassembly, Assembly & Akomodasi</div>
    <table class="abr-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="56%">Description</th>
                <th width="14%">Price (Rp)</th>
                <th width="6%">Qty</th>
                <th width="6%">Sat</th>
                <th width="14%">Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($disassemblyItems as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $item->description ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->price ? number_format($item->price, 0, ',', '.') : '0' }}</td>
                    <td class="text-center">{{ $item->qty ?: '-' }}</td>
                    <td class="text-center">{{ $item->satuan ?: '-' }}</td>
                    <td class="text-right font-mono">{{ $item->amount ? number_format($item->amount, 0, ',', '.') : '0' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="text-center" style="color:#9ca3af;">- Tidak ada data -</td></tr>
            @endforelse
            <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="5" class="text-right font-bold">Total (5) : </td>
                <td class="text-right font-mono">{{ number_format($disassemblyItems->sum('amount'), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Grand Total Table -->
    <table class="total-table">
        <thead>
            <tr>
                <th width="33%">TOTAL BIAYA (1+2+3+4+5)</th>
                <th width="33%">- PPN (11%) -</th>
                <th width="34%">GRAND TOTAL (TERMASUK PAJAK)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Rp {{ number_format($abr->total_biaya, 0, ',', '.') }}</td>
                <td>Rp {{ number_format($abr->tax_amount, 0, ',', '.') }}</td>
                <td>Rp {{ number_format($abr->grand_total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Signatures -->
    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-label">Dibuat Oleh:</div>
                <div class="sig-name">{{ $abr->dibuat_oleh ?: 'Yansen' }}</div>
                <div class="sig-job">{{ $abr->dibuat_jabatan ?: 'Planner' }}</div>
            </td>
            <td>
                <div class="sig-label">Checked By:</div>
                <div class="sig-name">{{ $abr->checked_by ?: 'Mukti Alie' }}</div>
                <div class="sig-job">{{ $abr->checked_jabatan ?: 'Sr. Planner' }}</div>
            </td>
            <td>
                <div class="sig-label">Disetujui Oleh:</div>
                <div class="sig-name">{{ $abr->disetujui_oleh ?: 'Ambo Mai' }}</div>
                <div class="sig-job">{{ $abr->disetujui_jabatan ?: 'Plant Suptend' }}</div>
            </td>
            <td>
                <div class="sig-label">Diketahui Oleh:</div>
                <div class="sig-name">{{ $abr->diketahui_oleh ?: 'Supardi Halim' }}</div>
                <div class="sig-job">{{ $abr->diketahui_jabatan ?: 'Project Manager' }}</div>
            </td>
        </tr>
    </table>

    @if($abr->images && $abr->images->count() > 0)
        @php
            $imgCount = $abr->images->count();
            $unitCode = $abr->unit ? $abr->unit->code_unit : ($abr->manual_unit_code ?: '-');
        @endphp
        <div style="page-break-before: always;"></div>
        <div class="header">
            <table width="100%">
                <tr>
                    <td width="65%">
                        <div class="company-title">PT. MITRA ABADI MAHAKAM</div>
                        <div class="doc-title">LAMPIRAN DOKUMENTASI - ANALISA BIAYA REPAIR (ABR)</div>
                    </td>
                    <td width="35%" class="text-right">
                        <div style="font-size: 9px; font-weight: bold;">NO ABR : {{ $abr->no_abr }}</div>
                        <div style="font-size: 9px; font-weight: bold;">UNIT : {{ $unitCode }}</div>
                        <div style="font-size: 8px; color: #4b5563;">Tanggal: {{ \Carbon\Carbon::parse($abr->tanggal)->format('d/m/Y') }}</div>
                    </td>
                </tr>
            </table>
        </div>

        @if($imgCount === 1)
            @php
                $img = $abr->images->first();
                $localPath = public_path(ltrim($img->file_path, '/'));
            @endphp
            <div style="text-align: center; margin-top: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="text-align: center; border: 1px solid #9ca3af; border-radius: 4px; padding: 10px; background-color: #f9fafb;">
                            @if(file_exists($localPath))
                                <img src="{{ $localPath }}" style="max-height: 720px; max-width: 100%; width: auto; height: auto; border: 1px solid #d1d5db; border-radius: 3px;">
                            @else
                                <span style="color:#9ca3af; font-size:9px;">Gambar Lampiran</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        @else
            @php
                $chunked = $abr->images->chunk(2);
                $maxH = $imgCount === 2 ? '380px' : '320px';
            @endphp
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                @foreach($chunked as $row)
                    <tr>
                        @foreach($row as $img)
                            @php
                                $localPath = public_path(ltrim($img->file_path, '/'));
                            @endphp
                            <td width="50%" align="center" style="padding: 6px; vertical-align: middle; text-align: center;">
                                <div style="border: 1px solid #9ca3af; border-radius: 4px; padding: 6px; background-color: #f9fafb;">
                                    @if(file_exists($localPath))
                                        <img src="{{ $localPath }}" style="max-height: {{ $maxH }}; max-width: 100%; width: auto; height: auto; border: 1px solid #d1d5db; border-radius: 2px;">
                                    @else
                                        <span style="color:#9ca3af; font-size:8px;">Gambar Lampiran</span>
                                    @endif
                                </div>
                            </td>
                        @endforeach
                        @if(count($row) === 1)
                            <td width="50%"></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        @endif
    @endif

</body>
</html>
