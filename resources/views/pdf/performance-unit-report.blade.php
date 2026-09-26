<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Performance Unit - {{ $periodLabel }}</title>
    <style>
        @page {
            margin: 10px 15px;
            size: a3 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            font-size: 7.5px;
            line-height: 1.2;
        }
        .header-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .header-subtitle {
            text-align: center;
            font-size: 9px;
            color: #475569;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 3px 2px;
            text-align: center;
        }
        th {
            background-color: #000000;
            color: #ffffff;
            font-size: 7px;
            font-weight: bold;
        }
        .th-event {
            background-color: #c2bba8 !important;
            color: #000000 !important;
            font-weight: bold;
        }
        .th-down-status {
            background-color: #525252 !important;
            color: #ffffff !important;
            font-weight: bold;
        }
        .th-sch {
            background-color: #c6d9f1 !important;
            color: #000000 !important;
        }
        .th-uns {
            background-color: #ffff00 !important;
            color: #000000 !important;
        }
        .th-acc-ld {
            background-color: #ffc000 !important;
            color: #000000 !important;
        }
        .th-event-total {
            background-color: #d9ead3 !important;
            color: #000000 !important;
            font-weight: bold;
        }
        .bg-sch {
            background-color: #c6d9f1;
            font-weight: bold;
        }
        .bg-uns {
            background-color: #ffff00;
            font-weight: bold;
        }
        .bg-acc-ld {
            background-color: #ffc000;
            font-weight: bold;
        }
        .bg-event-total {
            background-color: #d9ead3;
            font-weight: bold;
            color: #000000;
        }
        .bg-pink {
            background-color: #fce7f3;
            color: #be185d;
        }
        .text-red {
            color: #dc2626;
            font-weight: bold;
        }
        .total-row {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: bold;
        }
        .total-row td {
            border: 1px solid #0f172a;
        }
    </style>
</head>
<body>
    <div class="header-title">Equipment Performance Report (Performance Unit)</div>
    <div class="header-subtitle">Periode: {{ $periodLabel }} | Total Populasi: {{ $data['totals']['total_units'] }} Unit | MOHH: {{ $data['mohh_per_unit'] }} Jam ({{ $data['days_in_period'] }} Hari)</div>

    <table>
        <thead>
            <tr>
                <th rowspan="2">CODE UNIT (NEW)</th>
                <th rowspan="2">Total unit</th>
                <th rowspan="2">Budget PA</th>
                <th rowspan="2">MOHH</th>
                <th rowspan="2">Target</th>
                <th colspan="2">HM Reading</th>
                <th rowspan="2">WH</th>
                <th rowspan="2">STB PLA</th>
                <th colspan="5" class="th-event">FREKUENSI EVENT</th>
                <th colspan="10" class="th-down-status">DOWN STATUS</th>
                <th rowspan="2">PA %</th>
                <th rowspan="2">EU</th>
                <th rowspan="2">MA %</th>
                <th>BD Ratio</th>
                <th>BD Ratio</th>
                <th rowspan="2">MTBF</th>
                <th rowspan="2">MTTR</th>
                <th rowspan="2">Target MTBF</th>
                <th rowspan="2">Target MTTR</th>
            </tr>
            <tr>
                <th>Start</th>
                <th>End</th>
                <th class="th-sch">SCH</th>
                <th class="th-uns">UNS</th>
                <th class="th-acc-ld">ACD</th>
                <th class="th-acc-ld">LB</th>
                <th class="th-event-total">TOTAL</th>
                <th>B0</th>
                <th>B1</th>
                <th>B2</th>
                <th>B3</th>
                <th>B4</th>
                <th>B5</th>
                <th>B6</th>
                <th>B7</th>
                <th>B8</th>
                <th>Total</th>
                <th>(SCH)</th>
                <th>(UNS)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['units'] as $u)
            <tr>
                <td style="font-weight: bold; text-align: left;">
                    {{ $u['code_unit'] }}
                    <div style="font-size: 6.5px; color: #475569; font-weight: normal;">{{ $u['type_unit'] }}</div>
                </td>
                <td>{{ $u['total_unit'] }}</td>
                <td>{{ number_format($u['budget_pa'], 0) }}%</td>
                <td>{{ $u['mohh'] }}</td>
                <td>{{ number_format($u['target_down'], 1, ',', '.') }}</td>
                <td>{{ $u['hm_start'] }}</td>
                <td>{{ $u['hm_end'] }}</td>
                <td class="{{ $u['wh_is_zero'] ? 'text-red' : '' }}">{{ $u['wh'] }}</td>
                <td class="{{ $u['stb_is_zero'] ? 'text-red' : '' }}">{{ $u['stb_pla'] }}</td>
                <td class="bg-sch">{{ $u['sch'] }}</td>
                <td class="bg-uns">{{ $u['uns'] }}</td>
                <td class="bg-acc-ld">{{ $u['acc'] }}</td>
                <td class="bg-acc-ld">{{ $u['ld'] }}</td>
                <td class="bg-event-total">{{ $u['total_event_uns'] }}</td>
                <td>{{ $u['b0'] }}</td>
                <td>{{ $u['b1'] }}</td>
                <td>{{ $u['b2'] }}</td>
                <td>{{ $u['b3'] }}</td>
                <td>{{ $u['b4'] }}</td>
                <td>{{ $u['b5'] }}</td>
                <td>{{ $u['b6'] }}</td>
                <td>{{ $u['b7'] }}</td>
                <td>{{ $u['b8'] }}</td>
                <td style="font-weight: bold;">{{ $u['total_bd'] }}</td>
                <td class="{{ $u['pa_below_budget'] ? 'bg-pink' : '' }}" style="font-weight: bold;">{{ number_format($u['pa'], 0) }}%</td>
                <td class="bg-pink">{{ number_format($u['eu'], 0) }}%</td>
                <td class="{{ $u['ma_below_budget'] ? 'bg-pink' : '' }}">{{ number_format($u['ma'], 0) }}%</td>
                <td>{{ number_format($u['bd_ratio_sch'], 0) }}%</td>
                <td>{{ number_format($u['bd_ratio_uns'], 0) }}%</td>
                <td>{{ $u['mtbf'] }}</td>
                <td>{{ $u['mttr'] }}</td>
                <td>{{ $u['target_mtbf'] }}</td>
                <td>{{ $u['target_mttr'] }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL / AVERAGE</td>
                <td>{{ $data['totals']['total_units'] }}</td>
                <td>{{ number_format($data['totals']['budget_pa'], 1) }}%</td>
                <td>{{ $data['totals']['mohh'] }}</td>
                <td>{{ number_format($data['totals']['target_down'], 1, ',', '.') }}</td>
                <td>-</td>
                <td>-</td>
                <td>{{ $data['totals']['wh'] }}</td>
                <td>{{ $data['totals']['stb_pla'] }}</td>
                <td class="bg-sch">{{ $data['totals']['sch'] }}</td>
                <td class="bg-uns">{{ $data['totals']['uns'] }}</td>
                <td class="bg-acc-ld">{{ $data['totals']['acc'] }}</td>
                <td class="bg-acc-ld">{{ $data['totals']['ld'] }}</td>
                <td class="bg-event-total">{{ $data['totals']['total_event_uns'] }}</td>
                <td>{{ $data['totals']['b0'] }}</td>
                <td>{{ $data['totals']['b1'] }}</td>
                <td>{{ $data['totals']['b2'] }}</td>
                <td>{{ $data['totals']['b3'] }}</td>
                <td>{{ $data['totals']['b4'] }}</td>
                <td>{{ $data['totals']['b5'] }}</td>
                <td>{{ $data['totals']['b6'] }}</td>
                <td>{{ $data['totals']['b7'] }}</td>
                <td>{{ $data['totals']['b8'] }}</td>
                <td style="font-weight: bold;">{{ $data['totals']['total_bd'] }}</td>
                <td>{{ number_format($data['totals']['pa'], 1) }}%</td>
                <td>{{ number_format($data['totals']['eu'], 1) }}%</td>
                <td>{{ number_format($data['totals']['ma'], 1) }}%</td>
                <td>{{ number_format($data['totals']['bd_ratio_sch'], 1) }}%</td>
                <td>{{ number_format($data['totals']['bd_ratio_uns'], 1) }}%</td>
                <td>{{ $data['totals']['mtbf'] }}</td>
                <td>{{ $data['totals']['mttr'] }}</td>
                <td>{{ $data['totals']['target_mtbf'] }}</td>
                <td>{{ $data['totals']['target_mttr'] }}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
