<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>Bucket Inspection & Monitoring - {{ $formNumber }}</title>
    <style>
        @page {
            margin: 6mm 8mm;
            size: a4 portrait;
        }
        * {
            box-sizing: border-box;
        }
        body, table, td, th, div, span, p {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            color: #000;
            font-size: 7pt;
            line-height: 1.15;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 0;
        }
        .header-table td {
            padding: 4px 6px;
            vertical-align: middle;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
        }
        .meta-table td {
            vertical-align: middle;
            padding: 2.5px 5px;
            font-size: 6.8pt;
            border-bottom: 0.5px solid #ccc;
        }
        .meta-label {
            font-weight: bold;
            color: #111;
            width: 18%;
        }
        .meta-val {
            font-weight: bold;
            color: #000;
            width: 32%;
        }
        .banner-title {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            background-color: #e5e7eb;
            text-align: center;
            font-weight: bold;
            font-size: 8pt;
            letter-spacing: 0.5px;
            padding: 3px 0;
        }
        .checklist-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
        }
        .checklist-table th {
            background-color: #f3f4f6;
            border: 1px solid #000;
            padding: 2.5px 3px;
            font-size: 6.5pt;
            font-weight: bold;
            text-align: center;
        }
        .checklist-table td {
            border: 0.5px solid #000;
            padding: 1.8px 3px;
            font-size: 6.5pt;
            vertical-align: middle;
        }
        .sub-header-row {
            background-color: #eef2f6;
            font-weight: bold;
            font-size: 6.5pt;
            padding: 1.5px 4px;
        }
        .side-diagram-cell {
            vertical-align: middle;
            text-align: center;
            background-color: #fafafa;
            border-right: 1px solid #000;
            padding: 2px;
        }
        .side-vertical-text {
            font-weight: bold;
            font-size: 7.5pt;
            letter-spacing: 2px;
            writing-mode: vertical-rl;
            text-orientation: upright;
            color: #1f2937;
        }
        .mark-v {
            font-weight: bold;
            color: #047857;
            font-size: 7.5pt;
            text-align: center;
        }
        .mark-x {
            font-weight: bold;
            color: #b91c1c;
            font-size: 7.5pt;
            text-align: center;
        }
        .mark-c {
            font-weight: bold;
            color: #d97706;
            font-size: 7.5pt;
            text-align: center;
        }
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
        }
        .sig-table td {
            vertical-align: top;
            padding: 4px 8px;
            height: 48px;
            font-size: 6.8pt;
        }
        .footer-note {
            width: 100%;
            border-collapse: collapse;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            background-color: #f9fafb;
            padding: 2.5px 6px;
            font-size: 6.2pt;
            font-weight: bold;
            font-style: italic;
        }
        .diagram-svg {
            display: block;
            margin: 0 auto;
            max-width: 120px;
            height: auto;
        }
    </style>
</head>
<body>

    {{-- HEADER TABLE --}}
    <table class="header-table">
        <tr>
            <td style="width: 20%; border-right: 1px solid #000; text-align: center;">
                <div style="font-size: 13pt; font-weight: 900; letter-spacing: 1px; color: #b91c1c; line-height: 1;">
                    HW
                </div>
                <div style="font-size: 7pt; font-weight: 900; letter-spacing: 0.5px; color: #111;">
                    HARINDO WAHANA
                </div>
            </td>
            <td style="width: 50%; text-align: center; border-right: 1px solid #000;">
                <div style="font-size: 7pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">
                    FORMULIR
                </div>
                <div style="font-size: 10.5pt; font-weight: 900; letter-spacing: 0.5px;">
                    BUCKET INSPECTION &amp; MONITORING
                </div>
            </td>
            <td style="width: 30%; padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt; width: 45%;">Nomor Dokumen</td>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt; font-weight: bold;">: {{ $results['doc_number'] ?? 'FM-PLT-BKT-01' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt;">Tanggal Efektif</td>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt; font-weight: bold;">: {{ $results['effective_date'] ?? date('d/m/Y', strtotime($date)) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt;">Revisi</td>
                        <td style="padding: 2px 4px; border-bottom: 0.5px solid #000; font-size: 6.5pt; font-weight: bold;">: {{ $results['revision'] ?? '1' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 4px; font-size: 6.5pt;">Halaman</td>
                        <td style="padding: 2px 4px; font-size: 6.5pt; font-weight: bold;">: {{ $results['page_info'] ?? '1 dari 1' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- META GRID --}}
    <table class="meta-table">
        <tr>
            <td class="meta-label">Equipment Code :</td>
            <td class="meta-val">{{ $unit?->code_unit ?? '-' }}</td>
            <td class="meta-label">Project :</td>
            <td class="meta-val">{{ $project ?? 'Harindo Wahana' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Unit Model :</td>
            <td class="meta-val">{{ $unit?->model ?? '-' }}</td>
            <td class="meta-label">Inspection Period :</td>
            <td class="meta-val">{{ $results['inspection_period'] ?? 'Weekly' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Brand :</td>
            <td class="meta-val">{{ $results['brand'] ?? ($unit?->engine_make ?? 'Caterpillar') }}</td>
            <td class="meta-label">Date of Inspection :</td>
            <td class="meta-val">{{ $date ? date('d/m/Y', strtotime($date)) : date('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="meta-label">Hour meter :</td>
            <td class="meta-val">{{ $smu ? number_format($smu, 0, ',', '.') . ' Jam' : ($unit?->current_hm ? number_format($unit->current_hm, 0, ',', '.') . ' Jam' : '-') }}</td>
            <td class="meta-label">Inspector :</td>
            <td class="meta-val">{{ $inspector ?? '-' }}</td>
        </tr>
    </table>

    {{-- SECTION BANNER --}}
    <div class="banner-title">
        BODY - BUSHING - TEETH (Check for : Lost, crack, wear, damage)
    </div>

    {{-- CHECKLIST TABLE --}}
    <table class="checklist-table">
        <thead>
            <tr>
                <th style="width: 14%;">DIAGRAM / SECTION</th>
                <th style="width: 4%;">NO</th>
                <th style="width: 38%;">DESCRIPTION</th>
                <th style="width: 12%;">STD</th>
                <th style="width: 10%;">ACT</th>
                <th style="width: 6%;">MARK</th>
                <th style="width: 16%;">REMARK</th>
            </tr>
        </thead>
        <tbody>
            @php
                $itemMap = [];
                foreach ($items as $itm) {
                    $itemMap[$itm['id']] = $itm;
                }
            @endphp

            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- SECTION 1: G E T (Items 1 - 7)                        --}}
            {{-- ═════════════════════════════════════════════════════ --}}
            @for ($id = 1; $id <= 7; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    @if ($id === 1)
                        <td rowspan="7" class="side-diagram-cell">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 20px; text-align: center; vertical-align: middle; border: none;">
                                        <div style="font-weight: 900; font-size: 8pt; line-height: 1.4;">G<br>E<br>T</div>
                                    </td>
                                    <td style="border: none; vertical-align: middle; text-align: center;">
                                        <svg viewBox="0 0 160 95" style="width: 110px; height: 65px;">
                                            <!-- Tooth Adapter & Teeth Schematic -->
                                            <polygon points="15,65 145,65 135,35 25,35" fill="#e5e7eb" stroke="#1f2937" stroke-width="1.2"/>
                                            <polygon points="25,35 40,15 55,35" fill="#f3f4f6" stroke="#1f2937" stroke-width="1"/>
                                            <polygon points="65,35 80,15 95,35" fill="#f3f4f6" stroke="#1f2937" stroke-width="1"/>
                                            <polygon points="105,35 120,15 135,35" fill="#f3f4f6" stroke="#1f2937" stroke-width="1"/>
                                            <line x1="15" y1="65" x2="5" y2="78" stroke="#1f2937" stroke-width="1.2"/>
                                            <line x1="145" y1="65" x2="155" y2="78" stroke="#1f2937" stroke-width="1.2"/>
                                            <circle cx="40" cy="28" r="2.5" fill="#9ca3af" stroke="#111" stroke-width="0.8"/>
                                            <circle cx="80" cy="28" r="2.5" fill="#9ca3af" stroke="#111" stroke-width="0.8"/>
                                            <circle cx="120" cy="28" r="2.5" fill="#9ca3af" stroke="#111" stroke-width="0.8"/>
                                            <text x="80" y="86" font-size="7" text-anchor="middle" font-weight="bold" fill="#374151">TEETH &amp; ADAPTERS</text>
                                        </svg>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    @endif
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- SECTION 2: B O D Y (Items 8 - 18)                     --}}
            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- Sub-header A. Bucket Skin --}}
            <tr>
                <td rowspan="14" class="side-diagram-cell">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 20px; text-align: center; vertical-align: middle; border: none;">
                                <div style="font-weight: 900; font-size: 8pt; line-height: 1.4;">B<br>O<br>D<br>Y</div>
                            </td>
                            <td style="border: none; vertical-align: middle; text-align: center;">
                                <svg viewBox="0 0 160 120" style="width: 110px; height: 80px;">
                                    <!-- Bucket Shell Isometric -->
                                    <path d="M 20 80 Q 25 15, 80 15 Q 135 15, 140 80 L 125 105 L 35 105 Z" fill="#e5e7eb" stroke="#1f2937" stroke-width="1.2"/>
                                    <!-- Inner Wear Plates Ribs -->
                                    <line x1="38" y1="35" x2="122" y2="35" stroke="#9ca3af" stroke-dasharray="2,2" stroke-width="1"/>
                                    <line x1="35" y1="55" x2="125" y2="55" stroke="#9ca3af" stroke-dasharray="2,2" stroke-width="1"/>
                                    <line x1="32" y1="75" x2="128" y2="75" stroke="#9ca3af" stroke-dasharray="2,2" stroke-width="1"/>
                                    <!-- Side Cutters -->
                                    <polygon points="18,75 14,95 24,95 26,75" fill="#d1d5db" stroke="#111" stroke-width="0.8"/>
                                    <polygon points="142,75 136,75 138,95 146,95" fill="#d1d5db" stroke="#111" stroke-width="0.8"/>
                                    <text x="80" y="115" font-size="7" text-anchor="middle" font-weight="bold" fill="#374151">BUCKET BODY &amp; SKIN</text>
                                </svg>
                            </td>
                        </tr>
                    </table>
                </td>
                <td colspan="6" class="sub-header-row">A. Bucket Skin</td>
            </tr>
            @for ($id = 8; $id <= 10; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header B. Right Section --}}
            <tr>
                <td colspan="6" class="sub-header-row">B. Right Section</td>
            </tr>
            @for ($id = 11; $id <= 14; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header C. Left Section --}}
            <tr>
                <td colspan="6" class="sub-header-row">C. Left Section</td>
            </tr>
            @for ($id = 15; $id <= 18; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- SECTION 3: B R A C K E T (Items 19 - 22)              --}}
            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- Sub-header D. Bracket Structure --}}
            <tr>
                <td rowspan="6" class="side-diagram-cell">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 20px; text-align: center; vertical-align: middle; border: none;">
                                <div style="font-weight: 900; font-size: 7pt; line-height: 1.3;">B<br>R<br>A<br>C<br>K<br>E<br>T</div>
                            </td>
                            <td style="border: none; vertical-align: middle; text-align: center;">
                                <svg viewBox="0 0 160 85" style="width: 110px; height: 55px;">
                                    <!-- Top Box & Bracket Mounts -->
                                    <rect x="25" y="15" width="110" height="30" rx="3" fill="#e5e7eb" stroke="#1f2937" stroke-width="1.2"/>
                                    <!-- Ear Mounting Lugs -->
                                    <circle cx="50" cy="30" r="9" fill="#fff" stroke="#111" stroke-width="1.2"/>
                                    <circle cx="50" cy="30" r="4.5" fill="#9ca3af" stroke="#111" stroke-width="0.8"/>
                                    <circle cx="110" cy="30" r="9" fill="#fff" stroke="#111" stroke-width="1.2"/>
                                    <circle cx="110" cy="30" r="4.5" fill="#9ca3af" stroke="#111" stroke-width="0.8"/>
                                    <path d="M 25 45 L 15 65 L 145 65 L 135 45 Z" fill="#d1d5db" stroke="#1f2937" stroke-width="1"/>
                                    <text x="80" y="78" font-size="7" text-anchor="middle" font-weight="bold" fill="#374151">BRACKET &amp; TOP BOX</text>
                                </svg>
                            </td>
                        </tr>
                    </table>
                </td>
                <td colspan="6" class="sub-header-row">D. Bracket Structure</td>
            </tr>
            @for ($id = 19; $id <= 20; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header E. Bracket --}}
            <tr>
                <td colspan="6" class="sub-header-row">E. Bracket</td>
            </tr>
            @for ($id = 21; $id <= 22; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- SECTION 4: LINK, PIN, LOCK (Items 23 - 35)           --}}
            {{-- ═════════════════════════════════════════════════════ --}}
            {{-- Sub-header F. Bucket Mounting Pin --}}
            <tr>
                <td rowspan="17" class="side-diagram-cell">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 20px; text-align: center; vertical-align: middle; border: none;">
                                <div style="font-weight: 900; font-size: 6.5pt; line-height: 1.2;">L<br>I<br>N<br>K<br>,<br>P<br>I<br>N<br>,<br>L<br>O<br>C<br>K</div>
                            </td>
                            <td style="border: none; vertical-align: middle; text-align: center;">
                                <svg viewBox="0 0 160 140" style="width: 110px; height: 95px;">
                                    <!-- Bucket Linkage Assembly (Dogbone & Pins) -->
                                    <path d="M 35 30 L 75 80 L 125 35" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round"/>
                                    <!-- Pin Cylinders -->
                                    <circle cx="35" cy="30" r="10" fill="#fff" stroke="#111" stroke-width="1.2"/>
                                    <circle cx="35" cy="30" r="5" fill="#4b5563"/>
                                    <circle cx="75" cy="80" r="10" fill="#fff" stroke="#111" stroke-width="1.2"/>
                                    <circle cx="75" cy="80" r="5" fill="#4b5563"/>
                                    <circle cx="125" cy="35" r="10" fill="#fff" stroke="#111" stroke-width="1.2"/>
                                    <circle cx="125" cy="35" r="5" fill="#4b5563"/>
                                    <!-- Retainer Plate & Bolt -->
                                    <rect x="25" y="98" width="110" height="14" rx="2" fill="#e5e7eb" stroke="#111" stroke-width="1"/>
                                    <circle cx="45" cy="105" r="3" fill="#111"/>
                                    <circle cx="115" cy="105" r="3" fill="#111"/>
                                    <text x="80" y="128" font-size="7" text-anchor="middle" font-weight="bold" fill="#374151">LINK, PINS &amp; BUSHINGS</text>
                                </svg>
                            </td>
                        </tr>
                    </table>
                </td>
                <td colspan="6" class="sub-header-row">F. Bucket Mounting Pin</td>
            </tr>
            @for ($id = 23; $id <= 25; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header G. Bucket Link --}}
            <tr>
                <td colspan="6" class="sub-header-row">G. Bucket Link</td>
            </tr>
            @for ($id = 26; $id <= 29; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header H. Bucket Cyl Pin --}}
            <tr>
                <td colspan="6" class="sub-header-row">H. Bucket Cyl Pin</td>
            </tr>
            @for ($id = 30; $id <= 32; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

            {{-- Sub-header I. Bucket Link Pin --}}
            <tr>
                <td colspan="6" class="sub-header-row">I. Bucket Link Pin</td>
            </tr>
            @for ($id = 33; $id <= 35; $id++)
                @php $cur = $itemMap[$id] ?? null; @endphp
                <tr>
                    <td style="text-align: center; font-weight: bold;">{{ $id }}</td>
                    <td style="font-weight: 600;">{{ $cur['description'] ?? '' }}</td>
                    <td style="font-size: 6pt; color: #374151;">{{ $cur['std'] ?? '-' }}</td>
                    <td style="font-size: 6.2pt; text-align: center;">{{ $cur['act'] ?? '' }}</td>
                    <td style="text-align: center;">
                        @if (($cur['mark'] ?? '') === 'V')
                            <span class="mark-v">&#10003;</span>
                        @elseif (($cur['mark'] ?? '') === 'X')
                            <span class="mark-x">&#10005;</span>
                        @elseif (($cur['mark'] ?? '') === 'CORRECTIVE')
                            <span class="mark-c">&#8855;</span>
                        @else
                            &nbsp;
                        @endif
                    </td>
                    <td style="font-size: 6pt;">{{ $cur['remark'] ?? '' }}</td>
                </tr>
            @endfor

        </tbody>
    </table>

    {{-- SIGNATURES TABLE --}}
    <table class="sig-table">
        <tr>
            <td style="width: 50%; border-right: 1px solid #000;">
                <div style="font-weight: bold; margin-bottom: 25px;">Checked by Supervisors &amp; Signature :</div>
                <div style="border-top: 1px dashed #000; width: 65%; padding-top: 2px;">
                    <strong>{{ $supervisor ?? 'Supervisor Maintenance' }}</strong>
                </div>
            </td>
            <td style="width: 50%;">
                <div style="font-weight: bold; margin-bottom: 25px;">Acknowledged by Superintendent &amp; Signature :</div>
                <div style="border-top: 1px dashed #000; width: 65%; padding-top: 2px;">
                    <strong>{{ $results['superintendent_name'] ?? 'Superintendent Maintenance' }}</strong>
                </div>
            </td>
        </tr>
    </table>

    {{-- FOOTER NOTE --}}
    <div class="footer-note">
        Note : Mark the shape on the check sheet below --&gt; <strong>V</strong> = Good, &nbsp; <strong>X</strong> = Bad, &nbsp; <strong>&#8855;</strong> = Corrective Action has been taken
    </div>

</body>
</html>
