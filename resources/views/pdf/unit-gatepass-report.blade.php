<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Despatch Report / Gate Pass - {{ $gatepass->gatepass_no }}</title>
    <style>
        @page {
            margin: 8mm 10mm;
            size: a4 portrait;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 8.5pt;
            line-height: 1.25;
            margin: 0;
            padding: 0;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }

        .main-header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .main-header td {
            vertical-align: top;
            padding: 1px 2px;
        }
        .doc-title {
            font-size: 13pt;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-align: center;
            margin-bottom: 2px;
        }
        .company-header {
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 6px;
        }

        /* Top metadata section */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .meta-table td {
            vertical-align: top;
            padding: 2px 4px;
            font-size: 8.5pt;
        }
        .box-transfer {
            border: 1.5px solid #000;
            padding: 6px 12px;
            text-align: center;
            font-weight: bold;
            font-style: italic;
            font-size: 9pt;
            margin: 0 auto;
            width: 180px;
        }
        .gatepass-box {
            border: 1.5px solid #000;
            padding: 3px 6px;
            font-weight: bold;
            font-size: 9pt;
            display: inline-block;
            margin-top: 2px;
        }

        /* Main Item Table */
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 12px;
        }
        .item-table th, .item-table td {
            border: 1px solid #000;
            padding: 2.5px 4px;
            font-size: 8pt;
        }
        .item-table th {
            background-color: #FFC000;
            font-weight: bold;
            text-align: center;
        }
        .bg-yellow-highlight {
            background-color: #FFFF00 !important;
            font-weight: bold;
        }
        .bg-gray-subtle {
            background-color: #f2f2f2;
        }

        /* Signatures */
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .sig-table td {
            width: 25%;
            vertical-align: top;
            font-size: 8.5pt;
            padding: 2px 4px;
        }
        .sig-space {
            height: 48px;
        }
    </style>
</head>
<body>

    <!-- Document Title -->
    <div class="doc-title">DESPATCH REPORT</div>

    <!-- Top Sub-header -->
    <table class="main-header">
        <tr>
            <td style="width: 28%;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                    <tr><td style="width: 70px;">CST No.</td><td>: {{ $gatepass->cst_no ?? 'N/A' }}</td></tr>
                    <tr><td>LST No.</td><td>: {{ $gatepass->lst_no ?? 'N/A' }}</td></tr>
                    <tr><td>ST FORM No.</td><td>: {{ $gatepass->st_form_no ?? 'N/A' }}</td></tr>
                </table>
            </td>
            <td style="width: 44%; text-align: center; vertical-align: middle;">
                <div class="company-header">{{ $gatepass->company_name ?? 'PT. MITRA ABADI MAHAKAM' }}</div>
            </td>
            <td style="width: 28%; text-align: right; font-size: 8pt;">
                <div>Date: {{ $gatepass->despatch_date ? \Carbon\Carbon::parse($gatepass->despatch_date)->format('d/m/Y') : now()->format('d/m/Y') }}</div>
            </td>
        </tr>
    </table>

    <!-- Middle Info Section -->
    <table class="meta-table">
        <tr>
            <!-- FROM & TO Column -->
            <td style="width: 38%;">
                <div class="font-bold">FROM :</div>
                <div style="font-weight: bold; font-size: 8.5pt; line-height: 1.2;">
                    {{ $gatepass->from_company ?? 'PT. MITRA ABADI MAHAKAM' }}<br>
                    {{ $gatepass->from_location ?? 'HARINDO WAHANA - KUBAR SAMARINDA KALTIM' }}
                </div>
                <div style="margin-top: 6px;" class="font-bold">TO :</div>
                <div style="font-weight: bold; font-size: 8.5pt; line-height: 1.2;">
                    {{ $gatepass->to_company ?? 'PT. MITRA ABADI MAHAKAM' }}<br>
                    {{ $gatepass->to_location ?? 'Mining Project SATUI - SUNGAI DANAU' }}
                </div>
                <div style="margin-top: 6px; font-weight: bold;">
                    Kind Attn &nbsp;: {{ $gatepass->kind_attn ?? 'Mr. Supardi Halim' }}
                </div>
            </td>

            <!-- Stock Transfer Box -->
            <td style="width: 28%; text-align: center; vertical-align: middle;">
                <div class="box-transfer">
                    <div style="font-size: 9.5pt; font-weight: 900;">STOCK TRANSFER</div>
                    <div style="font-size: 7.5pt; margin-top: 2px;">NOT FOR SALE OR RESALE</div>
                </div>
            </td>

            <!-- Person Name & Gate Pass Info -->
            <td style="width: 34%;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                    <tr><td style="width: 110px;">Person name:</td><td class="font-bold">{{ $gatepass->person_name ?? $gatepass->driver_name ?? '-' }}</td></tr>
                    <tr><td>MOB NO:</td><td>{{ $gatepass->mob_no ?? '-' }}</td></tr>
                    <tr><td>Receiver name & Sign:</td><td>{{ $gatepass->receiver_name ?? '-' }}</td></tr>
                    <tr><td>Wt. Of material :</td><td>{{ $gatepass->wt_material ?? '-' }}</td></tr>
                    <tr><td>Aprox value of material :</td><td>{{ $gatepass->approx_value ?? '-' }}</td></tr>
                    <tr><td>Gate:</td><td>{{ $gatepass->gate ?? 'Gate 1' }}</td></tr>
                    <tr>
                        <td colspan="2" style="padding-top: 4px;">
                            <div class="gatepass-box">
                                GATE PASS NO: {{ $gatepass->gatepass_no }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size: 7pt; font-style: italic; color: #444; padding-top: 2px;">
                            Receiving site acknowledgement
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Main Table (Yellow Header) -->
    <table class="item-table">
        <thead>
            <tr>
                <th style="width: 4%;">Sr. No</th>
                <th style="width: 13%;">Item Code</th>
                <th style="width: 39%;">Item Description</th>
                <th style="width: 6%;">Unit</th>
                <th style="width: 8%;">Qty. Despatch</th>
                <th style="width: 6%;">Qty. Recd</th>
                <th style="width: 24%;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            <!-- Line 1: Unit & Engine Make -->
            <tr>
                <td class="text-center font-bold" rowspan="12" style="vertical-align: top;">1</td>
                <td class="text-center font-bold" rowspan="12" style="vertical-align: top; font-size: 9pt;">
                    {{ $gatepass->code_unit }}
                    @if($gatepass->model)
                        <div style="font-size: 7.5pt; font-weight: normal; color: #333; margin-top: 3px;">
                            {{ $gatepass->model }}
                        </div>
                    @endif
                </td>
                <td>Engine make : {{ $gatepass->engine_make ?? 'Mercedes Benz' }}</td>
                <td class="text-center">{{ $gatepass->unit_measure ?? 'Unit' }}</td>
                <td class="text-center font-bold">{{ $gatepass->qty_despatch ?? 1 }}</td>
                <td class="text-center">{{ $gatepass->qty_recd ?? '' }}</td>
                <td>{{ $gatepass->fuel_level ?? 'Diesel Fuul Tank' }}</td>
            </tr>

            <!-- Line 2: Engine Model -->
            <tr>
                <td>Engine Model : {{ $gatepass->engine_model ?? 'KD-MGJ' }}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $gatepass->oil_level ?? 'Oil Level ok' }}</td>
            </tr>

            <!-- Line 3: S/N Engine -->
            <tr>
                <td>S/N Engine : {{ $gatepass->sn_engine ?? '400951D0119589' }}</td>
                <td></td>
                <td></td>
                <td></td>
                <td class="font-bold">Hr Mtr : {{ $gatepass->hr_mtr ?? '23' }}</td>
            </tr>

            <!-- Line 4: Starter & Alternator -->
            <tr>
                <td>{{ $gatepass->starter_alternator ?? 'Alongwith Starter,Alternator' }}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $gatepass->battery_condition ?? 'Condition ok' }}</td>
            </tr>

            <!-- Line 5: Battery Spec -->
            <tr>
                <td>{{ $gatepass->battery_spec ?? 'Battery 12 Volts' }}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>Condition ok</td>
            </tr>

            <!-- Line 6: Battery Model & Qty -->
            <tr>
                <td>{{ $gatepass->battery_model ?? 'Make:-N/Av Model:- AMARON 120AH' }}</td>
                <td class="text-center">pcs</td>
                <td class="text-center font-bold">{{ $gatepass->battery_qty ?? 2 }}</td>
                <td></td>
                <td>{{ $gatepass->battery_performance ?? 'Performance :- Good' }}</td>
            </tr>

            <!-- Line 7: Parts Missing -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>Parts Missing:- {{ $gatepass->parts_missing ?? 'NIL' }}</td>
            </tr>

            <!-- Line 8: Radio Rig (Yellow Highlighted if not available) -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="{{ str_contains(strtolower($gatepass->radio_rig ?? ''), 'not') ? 'bg-yellow-highlight' : '' }}">
                    {{ $gatepass->radio_rig ?? 'Radio Rig not Available' }}
                </td>
            </tr>

            <!-- Line 9: General Condition -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $gatepass->general_condition ?? 'Condition ok' }}</td>
            </tr>

            <!-- Line 10: APAR 1 -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $gatepass->apar_1 ?? 'APAR Available' }}</td>
            </tr>

            <!-- Line 11: APAR 2 -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $gatepass->apar_2 ?? 'APAR Available' }}</td>
            </tr>

            <!-- Line 12: Next Service HM -->
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="font-bold">Nex Service HM : {{ $gatepass->next_service_hm ?? '250' }}</td>
            </tr>
        </tbody>
    </table>

    <!-- 4 Signatures Section -->
    <table class="sig-table">
        <tr>
            <!-- Checked by -->
            <td>
                <div class="font-bold">Checked by,</div>
                <div class="sig-space"></div>
                <div class="font-bold" style="font-size: 9pt;">{{ $gatepass->checked_by_name ?? 'Ambo Mai' }}</div>
                <div style="font-size: 7.5pt; color: #333;">{{ $gatepass->checked_by_title ?? 'Plant Superintendent' }}</div>
            </td>

            <!-- Issued by -->
            <td>
                <div class="font-bold">Issued by,</div>
                <div class="sig-space"></div>
                <div class="font-bold" style="font-size: 9pt;">{{ $gatepass->issued_by_name ?? '____________________' }}</div>
                <div style="font-size: 7.5pt; color: #333;">{{ $gatepass->issued_by_title ?? 'Plant / Logistic' }}</div>
            </td>

            <!-- Approved By -->
            <td>
                <div class="font-bold">Approved By:</div>
                <div class="sig-space"></div>
                <div class="font-bold" style="font-size: 9pt;">{{ $gatepass->approved_by_name ?? 'Supardi Halim' }}</div>
                <div style="font-size: 7.5pt; color: #333;">{{ $gatepass->approved_by_title ?? 'Project Manager' }}</div>
            </td>

            <!-- Received By -->
            <td>
                <div class="font-bold">Received By:</div>
                <div class="sig-space"></div>
                <div class="font-bold" style="font-size: 9pt;">{{ $gatepass->received_by_name ?? '____________________' }}</div>
                <div style="font-size: 7.5pt; color: #333;">{{ $gatepass->received_by_title ?? 'Receiver Site Representative' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
