import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ auth, units = [], pivot = {}, dates = [], stats = {}, filters = {}, flash = {}, errors = {} }) {
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.code_unit || '');
    const [shiftFilter, setShiftFilter] = useState(filters.shift || '');
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');
    const [kpiFilter, setKpiFilter] = useState('');

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

    const getUnitFlags = (codeUnit) => {
        const unitPivot = pivot[codeUnit] || {};
        let hasNormal = false;
        let hasSpike = false;
        let hasMinus = false;
        
        dates.forEach(d => {
            const valData = unitPivot[d];
            if (valData && valData.total !== undefined) {
                if (valData.total < 0) hasMinus = true;
                else if (valData.total > 23) hasSpike = true;
                else hasNormal = true;
            }
        });
        return { hasNormal, hasSpike, hasMinus };
    };

    const displayedUnits = units.filter(unit => {
        if (!kpiFilter) return true;
        const flags = getUnitFlags(unit.code_unit);
        if (kpiFilter === 'minus') return flags.hasMinus;
        if (kpiFilter === 'spike') return flags.hasSpike;
        if (kpiFilter === 'normal') return flags.hasNormal;
        return true;
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const scrollRef = useRef(null);
    const scrollTable = (dir) => {
        if (scrollRef.current) { scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' }); }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/hour-meters', {
            code_unit: codeUnitFilter,
            shift: shiftFilter,
            date_from: dateFromFilter,
            date_to: dateToFilter,
        }, { preserveState: true });
    };

    const handleDeleteAll = () => {
        router.delete('/hour-meters-delete-all', {
            onSuccess: () => setIsDeleteAllModalOpen(false),
        });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) { return; }
        postImport('/hour-meters/import', {
            onSuccess: () => { setIsImportModalOpen(false); resetImport(); },
        });
    };

    const totalLogs = stats.total_logs ?? 0;

    const formatDay = (dateStr) => {
        if (!dateStr) { return ''; }
        return dateStr.split('-')[2] || dateStr;
    };

    // Group dates by month
    const monthGroups = [];
    let lastMonth = null;
    dates.forEach((d) => {
        const parts = d.split('-');
        const monthKey = parts[0] + '-' + parts[1];
        if (monthKey !== lastMonth) {
            const dt = new Date(d + 'T00:00:00');
            const label = dt.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            monthGroups.push({ key: monthKey, label, count: 1 });
            lastMonth = monthKey;
        } else {
            monthGroups[monthGroups.length - 1].count++;
        }
    });

    // Determine warning status for a cell based on hm_total
    // negative: hm_total < 0  (HM went backwards / wrong entry)
    // spike: hm_total > 23    (impossible daily hours — more than 23h in a day)
    const getCellStatus = (valData) => {
        if (!valData || valData.total === undefined || valData.total === null) { return 'empty'; }
        if (valData.total < 0) { return 'negative'; }
        if (valData.total > 23) { return 'spike'; }
        if (valData.total === 0) { return 'zero'; }
        return 'normal';
    };

    const cellStyle = (status) => {
        switch (status) {
            case 'negative': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold';
            case 'spike':    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold';
            case 'zero':     return 'text-gray-400 dark:text-gray-600';
            case 'normal':   return 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-900/10';
            default:         return 'text-gray-200 dark:text-gray-800';
        }
    };

    const cellContent = (valData, status) => {
        if (status === 'empty') { return ''; }
        if (status === 'negative') {
            return (
                <span className="flex flex-col items-center leading-none gap-0.5" title={'HM minus: ' + Number(valData.total).toFixed(1) + ' jam'}>
                    <span className="text-[9px]">⚠</span>
                    <span>{Number(valData.end).toFixed(1)}</span>
                </span>
            );
        }
        if (status === 'spike') {
            return (
                <span className="flex flex-col items-center leading-none gap-0.5" title={'Lonjakan besar: ' + Number(valData.total).toFixed(1) + ' jam (>23 jam)'}>
                    <span className="text-[9px]">⚡</span>
                    <span>{Number(valData.end).toFixed(1)}</span>
                </span>
            );
        }
        // For zero operation or normal operation, display the actual end HM
        return Number(valData.end).toFixed(1);
    };

    const FIXED_COLS = 3;

    return (
        <AuthenticatedLayout header="Log Hour Meter (HM) Harian">
            <Head title="Hour Meter Harian" />

            {/* Flash & Errors */}
            {flash && flash.message && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    {flash.message}
                </div>
            )}
            {errors && Object.keys(errors).length > 0 && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                    {Object.values(errors).map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div 
                    onClick={() => setKpiFilter(kpiFilter === 'normal' ? '' : 'normal')}
                    className={`p-4 rounded-xl shadow-sm transition-all cursor-pointer border-l-4 border-l-emerald-500 border ${kpiFilter === 'normal' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-gray-900' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 inline-block"></span>
                            Normal Hm upload
                        </div>
                        {kpiFilter === 'normal' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Aktif</span>}
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.normal_logs ?? 0} <span className="text-xs font-normal text-gray-400">Entri</span></div>
                </div>
                
                <div 
                    onClick={() => setKpiFilter(kpiFilter === 'spike' ? '' : 'spike')}
                    className={`p-4 rounded-xl shadow-sm transition-all cursor-pointer border-l-4 border-l-amber-500 border ${kpiFilter === 'spike' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-gray-900' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 inline-block"></span>
                            ⚡ Lonjakan &gt;23 jam
                        </div>
                        {kpiFilter === 'spike' && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Aktif</span>}
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.spike_logs ?? 0} <span className="text-xs font-normal text-gray-400">Entri</span></div>
                </div>

                <div 
                    onClick={() => setKpiFilter(kpiFilter === 'minus' ? '' : 'minus')}
                    className={`p-4 rounded-xl shadow-sm transition-all cursor-pointer border-l-4 border-l-red-500 border ${kpiFilter === 'minus' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 ring-2 ring-red-500 ring-offset-1 dark:ring-offset-gray-900' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 inline-block"></span>
                            ⚠ HM Minus
                        </div>
                        {kpiFilter === 'minus' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Aktif</span>}
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.minus_logs ?? 0} <span className="text-xs font-normal text-gray-400">Entri</span></div>
                </div>
            </div>

            {/* Filter + Action Bar */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-6 p-4 sm:p-5 border border-gray-100 dark:border-gray-700/60">
                <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2.5 items-center flex-1 w-full">
                        <select
                            value={codeUnitFilter}
                            onChange={(e) => setCodeUnitFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">Semua Unit</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.code_unit}>{u.code_unit}</option>
                            ))}
                        </select>

                        <select
                            value={shiftFilter}
                            onChange={(e) => setShiftFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">Semua Shift</option>
                            <option value="Shift 1">Shift 1 (Day)</option>
                            <option value="Shift 2">Shift 2 (Night)</option>
                        </select>

                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs">
                            <span className="text-gray-400 text-[10px] font-bold">DARI:</span>
                            <input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} className="bg-transparent border-0 p-0 text-xs text-gray-800 dark:text-gray-100 focus:ring-0" />
                            <span className="text-gray-400 mx-1">—</span>
                            <span className="text-gray-400 text-[10px] font-bold">KE:</span>
                            <input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} className="bg-transparent border-0 p-0 text-xs text-gray-800 dark:text-gray-100 focus:ring-0" />
                        </div>

                        <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition">
                            Tampilkan
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setIsImportModalOpen(true)} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V4a1 1 0 00-2 0v8.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" />
                                <path d="M3 16a1 1 0 001 1h12a1 1 0 001-1v-2a1 1 0 10-2 0v1H5v-1a1 1 0 10-2 0v2z" />
                            </svg>
                            Import Excel
                        </button>

                        <a
                            href={'/hour-meters/export/pdf?code_unit=' + codeUnitFilter + '&shift=' + shiftFilter + '&date_from=' + dateFromFilter + '&date_to=' + dateToFilter}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2zm8-14l3 3h-3V4zM6 10h8v2H6v-2zm0 3h8v2H6v-2z" />
                            </svg>
                            Export PDF
                        </a>

                        <Link href="/hour-meters/create" className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                            </svg>
                            Input HM Baru
                        </Link>

                        {totalLogs > 0 && (
                            <button
                                onClick={() => setIsDeleteAllModalOpen(true)}
                                className="group inline-flex items-center gap-1.5 bg-gray-100 hover:bg-rose-600 dark:bg-gray-700/80 dark:hover:bg-rose-600 text-transparent hover:text-white dark:text-transparent dark:hover:text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all border border-gray-200 dark:border-gray-600 hover:border-rose-600"
                                title="Hapus Semua Log HM"
                            >
                                <svg className="w-3.5 h-3.5 fill-gray-500 group-hover:fill-white transition-colors shrink-0" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Hapus Semua
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Pivot Matrix Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60">
                {/* Toolbar: legend + scroll buttons */}
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400">{dates.length} tanggal &bull; {displayedUnits.length} unit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => scrollTable(-1)}
                            className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 transition-colors shadow-sm"
                            title="Scroll Kiri"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scrollTable(1)}
                            className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 transition-colors shadow-sm"
                            title="Scroll Kanan"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto" ref={scrollRef}>
                    <table className="text-xs text-left text-gray-600 dark:text-gray-300 border-collapse min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                            {/* Row 1: Fixed cols + month group headers */}
                            <tr>
                                <th className="px-1 py-1 font-bold text-center border-r border-gray-200 dark:border-gray-700 text-[9px] uppercase w-6" rowSpan={2}>NO</th>
                                <th className="px-1 py-1 font-bold border-r border-gray-200 dark:border-gray-700 text-[9px] uppercase whitespace-nowrap" rowSpan={2}>CODE UNIT</th>
                                <th className="px-1 py-1 font-bold border-r border-gray-200 dark:border-gray-700 text-[9px] uppercase whitespace-nowrap" rowSpan={2}>MODEL</th>
                                {monthGroups.map((mg) => (
                                    <th
                                        key={mg.key}
                                        colSpan={mg.count}
                                        className="px-1 py-1 font-bold text-center text-[9px] text-violet-700 dark:text-violet-400 border-l border-gray-200 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/20 uppercase tracking-wider"
                                    >
                                        {mg.label}
                                    </th>
                                ))}
                                {dates.length === 0 && (
                                    <th className="px-3 py-2 font-bold text-center border-l border-gray-200 dark:border-gray-700 text-[11px] uppercase" rowSpan={2}>DATE</th>
                                )}
                            </tr>
                            {/* Row 2: Day numbers */}
                            <tr>
                                {dates.map((d) => (
                                    <th
                                        key={d}
                                        className="px-0.5 py-1 font-bold text-center border-l border-gray-100 dark:border-gray-700/50 text-[9px] min-w-[24px] text-gray-600 dark:text-gray-400"
                                        title={d}
                                    >
                                        {formatDay(d)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {displayedUnits.length > 0 ? displayedUnits.map((unit, idx) => {
                                const unitPivot = pivot[unit.code_unit] || {};
                                return (
                                    <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-1 py-1 text-center font-mono text-gray-400 border-r border-gray-100 dark:border-gray-700/50 text-[9px]">{idx + 1}</td>
                                        <td className="px-1 py-1 font-bold text-violet-600 dark:text-violet-400 border-r border-gray-100 dark:border-gray-700/50 whitespace-nowrap text-[9px]">{unit.code_unit}</td>
                                        <td className="px-1 py-1 border-r border-gray-100 dark:border-gray-700/50 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-[9px] max-w-[80px] truncate" title={unit.model}>{unit.model || '-'}</td>
                                        {dates.map((d) => {
                                            const valData = unitPivot[d];
                                            const status = getCellStatus(valData);
                                            return (
                                                <td
                                                    key={d}
                                                    className={'px-0.5 py-1 text-center font-mono border-l border-gray-100 dark:border-gray-700/50 text-[9px] transition-colors ' + cellStyle(status)}
                                                    title={
                                                        status === 'negative' ? ('⚠ HM minus: ' + Number(valData?.total).toFixed(1) + ' jam — cek data entri') :
                                                        status === 'spike' ? ('⚡ Lonjakan HM: ' + Number(valData?.total).toFixed(1) + ' jam (melebihi 23 jam)') :
                                                        status === 'normal' ? ('Total Operasi: ' + Number(valData?.total).toFixed(1) + ' jam') : ''
                                                    }
                                                >
                                                    {cellContent(valData, status)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={FIXED_COLS + dates.length} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                                        <p className="font-medium">Belum ada data unit.</p>
                                        <p className="text-xs mt-1">Silakan tambah unit atau ubah range tanggal.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Import */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Import Data Hour Meter (Format Vertikal)</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mendukung susunan baris tanggal vertikal (contoh: 10, 09, 08, dst.)</p>
                                </div>
                                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">&times;</button>
                            </div>
                            <form onSubmit={handleImportSubmit} className="mt-4 space-y-4">
                                <div className="p-3.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30 flex items-center justify-between">
                                    <span className="text-xs text-violet-800 dark:text-violet-300">Unduh template Excel format vertikal:</span>
                                    <a href="/hour-meters/download/template" className="text-xs font-bold text-violet-600 hover:underline ml-2">Unduh Template (.xlsx)</a>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Pilih File Excel / CSV</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700"
                                        required
                                    />
                                    {importErrors && importErrors.file && <p className="text-xs text-red-500 mt-1">{importErrors.file}</p>}
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition">Batal</button>
                                    <button type="submit" disabled={importProcessing || !importData.file} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition">
                                        {importProcessing ? 'Mengimpor...' : 'Mulai Import'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Hapus Semua */}
            <AnimatePresence>
                {isDeleteAllModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900/40"
                        >
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Hapus Semua Data Log Hour Meter?</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6">
                                Apakah Anda yakin ingin menghapus <strong>seluruh {totalLogs} entri log</strong>? Tindakan ini permanen.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsDeleteAllModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition">Batal</button>
                                <button type="button" onClick={handleDeleteAll} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition">Ya, Hapus Semua</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
