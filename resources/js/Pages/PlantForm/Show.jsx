import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ form = {} }) {
    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'A': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
            case 'B': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
            case 'C': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
            case 'D': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700';
            case 'E': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const getTypeFullName = (type) => {
        switch (type) {
            case 'A': return 'A : PM 250 / PS 1';
            case 'B': return 'B : PM 500 / PS 2';
            case 'C': return 'C : PM 1000 / PS 3';
            case 'D': return 'D : PM 2000 / PS 4';
            case 'E': return 'E : PM 4000 / PS 5';
            default: return type || '-';
        }
    };

    const items = form.items || [];

    return (
        <AuthenticatedLayout>
            <Head title={`Form PM ${form.form_number} - ${form.unit?.code_unit || ''}`} />

            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 transition-colors">
                {/* Header Navbar */}
                <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-30 shadow-sm backdrop-blur-md">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-0.5">
                                <Link href="/form-plant" className="hover:text-emerald-600">Form OHT 773</Link>
                                <span>/</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Detail Form</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>📋</span>
                                <span>Form PM: {form.form_number}</span>
                            </h1>
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                            <Link
                                href="/form-plant"
                                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                ← Kembali
                            </Link>

                            <Link
                                href={`/form-plant/${form.id}/edit`}
                                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-colors"
                            >
                                ✏️ Edit
                            </Link>

                            <a
                                href={`/form-plant/${form.id}/print`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Cetak PM Sheet (1:1)</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
                    {/* Primary Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700 gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo MAM"
                                    className="h-12 w-auto object-contain"
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                                <div>
                                    <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                                        PM SERVICE SHEET
                                    </div>
                                    <div className="text-sm font-bold text-gray-500 dark:text-slate-400">
                                        OFF HIGHWAY TRUCK 773E
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    form.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                }`}>
                                    {form.status || 'COMPLETED'}
                                </span>
                                <div className="font-mono text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                                    {form.form_number}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">PROJECT ID</div>
                                <div className="text-sm font-bold text-gray-800 dark:text-slate-100 mt-0.5">{form.project_id || '-'}</div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">UNIT ID</div>
                                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                    {form.unit?.code_unit || '-'}
                                </div>
                                <div className="text-[10px] text-gray-400">{form.unit?.model || '773E'}</div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">TANGGAL & SHIFT</div>
                                <div className="text-sm font-bold text-gray-800 dark:text-slate-100 mt-0.5">
                                    {form.date ? new Date(form.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </div>
                                <div className="text-[10px] font-semibold text-gray-500">
                                    {form.shift === 'DS' ? '☀️ DS (Siang)' : '🌙 NS (Malam)'}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">S.M.U (HOUR METER)</div>
                                <div className="text-sm font-mono font-bold text-gray-800 dark:text-slate-100 mt-0.5">
                                    {form.smu ? `${Number(form.smu).toLocaleString()} HRS` : '-'}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase">TIPE PM SERVICE</div>
                                <div className="mt-0.5">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getTypeBadgeClass(form.service_type)}`}>
                                        {getTypeFullName(form.service_type)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Oil samples & Caution row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-xs">
                                <div className="font-bold text-gray-800 dark:text-slate-200 mb-2">
                                    Pengambilan Sampel Oli Terakhir / <span className="italic text-gray-500">Last Oil Sample Taken</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="font-medium text-gray-500">Engine:</span> <span className="font-semibold text-gray-800 dark:text-slate-200">{form.oil_samples?.engine || '-'}</span></div>
                                    <div><span className="font-medium text-gray-500">Transmission:</span> <span className="font-semibold text-gray-800 dark:text-slate-200">{form.oil_samples?.transmission || '-'}</span></div>
                                    <div><span className="font-medium text-gray-500">Diff & Final Drive:</span> <span className="font-semibold text-gray-800 dark:text-slate-200">{form.oil_samples?.differential_final_drive || '-'}</span></div>
                                    <div><span className="font-medium text-gray-500">Hydraulic:</span> <span className="font-semibold text-gray-800 dark:text-slate-200">{form.oil_samples?.hydraulic || '-'}</span></div>
                                </div>
                            </div>

                            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                                    Perhatian / <span className="italic">Caution</span>
                                </div>
                                <div className="text-emerald-900 dark:text-emerald-200">✓ Cuci unit yang bersih sebelum pelaksanaan inspeksi</div>
                                <div className="text-emerald-900 dark:text-emerald-200">✓ Parkirkan unit pada tempat rata dengan aman</div>
                                <div className="text-emerald-900 dark:text-emerald-200">✓ Yakinkan anda sudah memasang Danger atau Service Tag pada unit</div>
                            </div>
                        </div>
                    </div>

                    {/* Inspection Checklist Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide">
                                Lembar Item Pemeriksaan ({items.length} Item)
                            </h2>
                            <div className="text-xs text-gray-500">
                                Tipe Terpilih: <strong className="text-emerald-600">{form.service_type}</strong>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                                        <th className="py-2.5 px-2 w-28 text-center">Tipe Servis</th>
                                        <th className="py-2.5 px-4">Deskripsi Item Pemeriksaan</th>
                                        <th className="py-2.5 px-3 w-28 text-center">Check Point</th>
                                        <th className="py-2.5 px-4 min-w-[220px]">Remarks / Nilai Ukur</th>
                                        <th className="py-2.5 px-3 w-28 text-center">SN Inspect</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                                    {items.map((item, idx) => {
                                        const isApplicable = item.types && item.types.includes(form.service_type);

                                        return (
                                            <tr
                                                key={item.id || idx}
                                                className={isApplicable ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-900/30 opacity-60'}
                                            >
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-400">
                                                    {item.id}
                                                </td>

                                                {/* Type dots */}
                                                <td className="py-2.5 px-2 text-center">
                                                    <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                                                        {['A', 'B', 'C', 'D', 'E'].map((t) => {
                                                            const hasType = item.types && item.types.includes(t);
                                                            const isSelected = form.service_type === t;

                                                            return (
                                                                <span
                                                                    key={t}
                                                                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                                                                        hasType
                                                                            ? isSelected
                                                                                ? 'bg-emerald-600 text-white font-bold'
                                                                                : 'bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 font-semibold'
                                                                            : 'text-gray-300 dark:text-slate-700'
                                                                    }`}
                                                                >
                                                                    {hasType ? '✓' : ''}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Description */}
                                                <td className="py-2.5 px-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {item.desc_id}
                                                    </div>
                                                    <div className="text-[11px] italic text-gray-500 dark:text-slate-400">
                                                        {item.desc_en}
                                                    </div>
                                                    {item.section && (
                                                        <span className="inline-block text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                                            {item.section}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Check Point */}
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                                                        item.check_point === '✓'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : item.check_point === 'X'
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                        {item.check_point || '-'}
                                                    </span>
                                                </td>

                                                {/* Remarks */}
                                                <td className="py-2.5 px-4">
                                                    <div className="text-gray-800 dark:text-slate-200 font-medium">
                                                        {item.remarks || '-'}
                                                    </div>
                                                    {item.special_value && (
                                                        <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                            Result / Rating: {item.special_value}
                                                        </div>
                                                    )}
                                                    {(item.special_rating_lh || item.special_rating_rh) && (
                                                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            LH: {item.special_rating_lh || '-'} | RH: {item.special_rating_rh || '-'}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* SN Inspect */}
                                                <td className="py-2.5 px-3 text-center font-mono text-gray-600 dark:text-slate-400">
                                                    {item.sn_inspect || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes & Signatures */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-6">
                        <div>
                            <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                NOTE :
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 whitespace-pre-line min-h-[60px]">
                                {form.notes || 'Tidak ada catatan tambahan.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">Inspected By,</div>
                                <div className="mt-8 pt-2 border-t border-gray-300 dark:border-slate-600">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {form.mechanic_name || '...........................................'}
                                    </div>
                                    <div className="text-xs text-gray-500">Mechanic / Serviceman</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">Acknowledged by,</div>
                                <div className="mt-8 pt-2 border-t border-gray-300 dark:border-slate-600">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {form.supervisor_name || '...........................................'}
                                    </div>
                                    <div className="text-xs text-gray-500">Maintenance Supervisor</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
