<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>REQUEST ASSET DISPOSED FORM - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 4mm 6mm;
            size: a4 portrait;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', sans-serif;
            color: #000;
            font-size: 6.2pt;
            line-height: 1.15;
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
            padding: 3px 5px;
            vertical-align: middle;
        }
        .company-logo {
            font-weight: bold;
            font-size: 8.5pt;
            color: #b91c1c;
        }
        .company-sub {
            font-size: 6.5pt;
            font-weight: bold;
            color: #000;
            letter-spacing: 0.5px;
        }
        .title-text {
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5px;
            text-decoration: underline;
        }
        .top-grid {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2px;
        }
        .top-grid th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 2px 3px;
            font-size: 6.2pt;
            text-align: center;
            font-weight: bold;
        }
        .top-grid td {
            border: 1px solid #000;
            padding: 2px 3px;
            font-size: 6pt;
            vertical-align: top;
        }
        .check-box {
            display: inline-block;
            width: 8px;
            height: 8px;
            border: 1px solid #000;
            line-height: 8px;
            text-align: center;
            font-size: 6.5pt;
            font-weight: bold;
            margin-right: 2px;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2px;
        }
        .main-table th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 2px 2px;
            font-size: 6pt;
            text-align: center;
            font-weight: bold;
        }
        .main-table td {
            border: 1px solid #000;
            padding: 2.5px 3px;
            font-size: 6pt;
            vertical-align: middle;
            min-height: 14px;
        }
        .center-cell {
            text-align: center;
        }
        .approval-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2px;
        }
        .approval-table th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 1.5px 3px;
            font-size: 6.2pt;
            text-align: left;
            font-weight: bold;
        }
        .approval-table td {
            border: 1px solid #000;
            padding: 1.5px 3px;
            font-size: 6pt;
            vertical-align: middle;
        }
        .photo-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
        }
        .photo-table th {
            background-color: #f2f2f2;
            border: 1px solid #000;
            padding: 1.5px 3px;
            font-size: 6.2pt;
            text-align: left;
            font-weight: bold;
        }
        .photo-table td {
            border: 1px solid #000;
            padding: 2px;
            vertical-align: middle;
            text-align: center;
            height: 85px;
        }
        .photo-box {
            width: 100%;
            height: 82px;
            border: 1px dashed #777;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 6pt;
            font-style: italic;
        }
        .photo-img {
            max-height: 80px;
            max-width: 100%;
            object-fit: contain;
        }
        .doc-footer {
            width: 100%;
            margin-top: 2px;
            font-size: 5.5pt;
            font-style: italic;
            text-align: right;
        }
    </style>
</head>
<body>

    <!-- Header Box -->
    <table class="header-box">
        <tr>
            <td style="width: 32%;">
                <div class="company-logo">&#9650;&#9650; PT. MITRA ABADI MAHAKAM</div>
                <div class="company-sub">PLANT DEPARTMENT</div>
            </td>
            <td style="width: 44%;" class="title-text">
                REQUEST ASSET DISPOSED FORM
            </td>
            <td style="width: 24%; text-align: left; font-size: 6pt;">
                <div>DOCUMENT NO :</div>
                <div style="font-weight: bold; font-size: 6.5pt;">{{ $formNumber }}</div>
            </td>
        </tr>
    </table>

    <!-- Top 3-Column Meta Grid -->
    <table class="top-grid">
        <thead>
            <tr>
                <th style="width: 27%;">REASON OF DISPOSE</th>
                <th style="width: 42%;">TRANSFERRING OF DISPOSE DIVISION</th>
                <th style="width: 31%;">RECOMMENDED DISPOSE METHOD</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <!-- Reason of Dispose -->
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['reason_stolen']) ? '✓' : '' }}</span> Stolen</td>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['reason_obsolete']) ? '✓' : '' }}</span> Obsolete</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['reason_damaged']) ? '✓' : '' }}</span> Damaged</td>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['reason_missing']) ? '✓' : '' }}</span> Missing</td>
                        </tr>
                    </table>
                    <div style="margin-top: 3px;">
                        Other (specify) : <strong>{{ $results['reason_other'] ?? '........................' }}</strong>
                    </div>
                    <div style="margin-top: 2px;">
                        Impairment (Specify) : <strong>{{ $results['impairment_specify'] ?? '........................' }}</strong>
                    </div>
                </td>

                <!-- Transferring of Dispose Division -->
                <td>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
                        <tr>
                            <td style="border: none; width: 18%; padding: 1px;">Name</td>
                            <td style="border: none; padding: 1px;">: <strong>{{ $results['transfer_name'] ?? '........................................' }}</strong></td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 1px;">Division</td>
                            <td style="border: none; padding: 1px;">: <strong>{{ $results['transfer_division'] ?? 'Plant Department' }}</strong></td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 1px;">Date</td>
                            <td style="border: none; padding: 1px;">: <strong>{{ $date ? \Carbon\Carbon::parse($date)->translatedFormat('d F Y') : '........................................' }}</strong></td>
                        </tr>
                    </table>
                    <!-- Signature Sub-table -->
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 2px;">
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; background-color: #fafafa; padding: 1px;">Signature</td>
                        </tr>
                        <tr>
                            <td style="width: 50%; border: 1px solid #000; text-align: center; padding: 1px; font-weight: bold;">Inspector</td>
                            <td style="width: 50%; border: 1px solid #000; text-align: center; padding: 1px; font-weight: bold;">Dept. Head Rebuild</td>
                        </tr>
                        <tr style="height: 22px;">
                            <td style="border: 1px solid #000; text-align: center; vertical-align: bottom; padding: 1px;">
                                <div style="font-weight: bold;">{{ $results['inspector_name'] ?? $mechanicName ?? '' }}</div>
                            </td>
                            <td style="border: 1px solid #000; text-align: center; vertical-align: bottom; padding: 1px;">
                                <div style="font-weight: bold;">{{ $results['dept_head_rebuild'] ?? $supervisorName ?? '' }}</div>
                            </td>
                        </tr>
                    </table>
                </td>

                <!-- Recommended Dispose Method -->
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_auction']) ? '✓' : '' }}</span> Auction</td>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_tender']) ? '✓' : '' }}</span> Tender</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_traded']) ? '✓' : '' }}</span> Traded</td>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_missing']) ? '✓' : '' }}</span> Missing</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_donated']) ? '✓' : '' }}</span> Donated</td>
                            <td style="border: none; padding: 1px;"><span class="check-box">{{ !empty($results['method_destroyed']) ? '✓' : '' }}</span> Destroyed</td>
                        </tr>
                    </table>
                    <div style="margin-top: 3px;">
                        Others : <strong>{{ $results['method_others'] ?? '........................' }}</strong>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Main Component/Asset Disposed Table -->
    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 55px;">Type unit</th>
                <th style="width: 150px;">Description of<br/>component/asset</th>
                <th style="width: 65px;">Manufacture</th>
                <th style="width: 80px;">Serial number</th>
                <th style="width: 80px;">Part Number</th>
                <th style="width: 25px;">QTY</th>
                <th style="width: 55px;">Condition</th>
                <th style="width: 50px;">Status</th>
                <th style="width: 95px;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td class="center-cell">{{ $item['type_unit'] ?? '' }}</td>
                <td>{{ $item['description'] ?? '' }}</td>
                <td class="center-cell">{{ $item['manufacture'] ?? '' }}</td>
                <td class="center-cell">{{ $item['serial_number'] ?? '' }}</td>
                <td class="center-cell">{{ $item['part_number'] ?? '' }}</td>
                <td class="center-cell">{{ $item['qty'] ?? '' }}</td>
                <td class="center-cell">{{ $item['condition'] ?? '' }}</td>
                <td class="center-cell">{{ $item['status'] ?? '' }}</td>
                <td>{{ $item['remarks'] ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Approval Lines Table -->
    <table class="approval-table">
        <thead>
            <tr>
                <th colspan="3" style="text-align: center; letter-spacing: 0.5px;">APPROVAL LINES</th>
            </tr>
        </thead>
        <tbody>
            <!-- Plant Department Header -->
            <tr style="background-color: #fafafa; font-weight: bold;">
                <td colspan="3">PLANT DEPARTMENT</td>
            </tr>
            <tr>
                <td style="width: 22%;">Superintendent</td>
                <td style="width: 48%;"><strong>{{ $results['approval_superintendent'] ?? '' }}</strong></td>
                <td style="width: 30%;">Date : {{ $results['approval_superintendent_date'] ?? '' }}</td>
            </tr>
            <tr>
                <td>Plant Manager</td>
                <td><strong>{{ $results['approval_plant_manager'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_plant_manager_date'] ?? '' }}</td>
            </tr>
            <tr>
                <td>Project Manager</td>
                <td><strong>{{ $results['approval_project_manager'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_project_manager_date'] ?? '' }}</td>
            </tr>

            <!-- Logistic Department Header -->
            <tr style="background-color: #fafafa; font-weight: bold;">
                <td colspan="3">LOGISTIC DEPARTMENT</td>
            </tr>
            <tr>
                <td>Department Head</td>
                <td><strong>{{ $results['approval_logistic_dept_head'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_logistic_dept_head_date'] ?? '' }}</td>
            </tr>
            <tr>
                <td>Manager</td>
                <td><strong>{{ $results['approval_logistic_manager'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_logistic_manager_date'] ?? '' }}</td>
            </tr>

            <!-- Executive Approvals -->
            <tr>
                <td style="font-weight: bold;">General Manager</td>
                <td><strong>{{ $results['approval_general_manager'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_general_manager_date'] ?? '' }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">President Director</td>
                <td><strong>{{ $results['approval_president_director'] ?? '' }}</strong></td>
                <td>Date : {{ $results['approval_president_director_date'] ?? '' }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Photo Evidence Table -->
    <table class="photo-table">
        <thead>
            <tr>
                <th colspan="3">PHOTO OF DISPOSE COMPONENT/ASSET (*colour)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 33.3%;">
                    @if(!empty($results['photo_front']))
                        <img src="{{ $results['photo_front'] }}" class="photo-img" alt="Depan"/>
                    @else
                        <div class="photo-box">*photo posisi depan</div>
                    @endif
                </td>
                <td style="width: 33.3%;">
                    @if(!empty($results['photo_back']))
                        <img src="{{ $results['photo_back'] }}" class="photo-img" alt="Belakang"/>
                    @else
                        <div class="photo-box">*photo posisi belakang</div>
                    @endif
                </td>
                <td style="width: 33.3%;">
                    @if(!empty($results['photo_side_1']))
                        <img src="{{ $results['photo_side_1'] }}" class="photo-img" alt="Samping 1"/>
                    @else
                        <div class="photo-box">*photo posisi samping</div>
                    @endif
                </td>
            </tr>
            <tr>
                <td>
                    @if(!empty($results['photo_side_2']))
                        <img src="{{ $results['photo_side_2'] }}" class="photo-img" alt="Samping 2"/>
                    @else
                        <div class="photo-box">*photo posisi samping</div>
                    @endif
                </td>
                <td colspan="2" style="vertical-align: middle; text-align: left; padding: 6px; font-size: 6pt; color: #444;">
                    <div><strong>Catatan Bukti Fisik:</strong></div>
                    <div>1. Foto wajib berwarna dan memperlihatkan kondisi fisik komponen yang diajukan dispose secara jelas.</div>
                    <div>2. Pastikan nomor seri / tag komponen terlihat pada salah satu foto jika memungkinkan.</div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Footer Ref -->
    <div class="doc-footer">
        FRM11-001A/KAI/PLT/2023 Rev 03
    </div>

</body>
</html>
