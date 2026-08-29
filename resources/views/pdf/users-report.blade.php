<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 25px 30px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 11px;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 20px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 10px;
            color: #6b7280;
            margin-top: 2px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 15px;
            background-color: #f9fafb;
            border-radius: 6px;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
        }
        .meta-table td {
            font-size: 10px;
            color: #4b5563;
        }
        .meta-table strong {
            color: #111827;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .data-table th {
            background-color: #7c3aed;
            color: #ffffff;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            padding: 7px 8px;
            text-align: left;
            border: 1px solid #6d28d9;
        }
        .data-table td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            background-color: #ede9fe;
            color: #6d28d9;
        }
        .badge-super {
            background-color: #fef3c7;
            color: #b45309;
        }
        .uuid {
            font-family: monospace;
            font-size: 8px;
            color: #6b7280;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="logo-text">SYSTEM PLANT</div>
                    <div class="subtitle">Platform Manajemen Operasional & Akses Terpadu</div>
                </td>
                <td style="text-align: right;">
                    <div style="font-size: 13px; font-weight: bold; color: #111827;">{{ $title }}</div>
                    <div class="subtitle">Dicetak pada: {{ $generatedAt }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Metadata Summary -->
    <table class="meta-table">
        <tr>
            <td width="33%">Total Pengguna: <strong>{{ $totalUsers }} User</strong></td>
            <td width="33%" style="text-align: center;">Format ID: <strong>UUID (v4)</strong></td>
            <td width="33%" style="text-align: right;">Status: <strong>Dokumen Resmi</strong></td>
        </tr>
    </table>

    <!-- Users Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th width="5%" style="text-align: center;">No</th>
                <th width="25%">Nama Pengguna</th>
                <th width="30%">Email</th>
                <th width="15%">Role / Peran</th>
                <th width="25%">User ID (UUID)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $index => $user)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>
                        <strong style="color: #111827;">{{ $user->name }}</strong>
                    </td>
                    <td>{{ $user->email }}</td>
                    <td>
                        @if($user->roles->count() > 0)
                            @foreach($user->roles as $role)
                                <span class="badge {{ $role->name === 'super-admin' ? 'badge-super' : '' }}">
                                    {{ $role->name }}
                                </span>
                            @endforeach
                        @else
                            <span style="color: #9ca3af; font-style: italic;">No Role</span>
                        @endif
                    </td>
                    <td class="uuid">{{ $user->id }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #9ca3af; padding: 20px;">
                        Tidak ada data pengguna.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        Dokumen ini dibuat otomatis oleh Sistem Plant. Kerahasiaan data dilindungi oleh kebijakan keamanan perusahaan.
    </div>
</body>
</html>
