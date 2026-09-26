import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

// Fast date and number formatting helpers
const fastFormatHm = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return Number(val).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const getPrevDateString = (dateString) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const day = parts[2];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} ${MONTH_NAMES_ID[monthIdx] || parts[1]} ${year}`;
};

const formatHeaderDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const day = parts[2];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day}-${MONTH_NAMES_EN[monthIdx] || parts[1]}`;
};

const isLightVehicle = (typeUnit) => {
    if (!typeUnit) return false;
    const t = String(typeUnit).trim().toUpperCase();
    return t === 'LIGHT VEHICLE' || t === 'LV' || t.includes('LIGHT VEHICLE');
};

export default function Index({ units, groupedLogs, dates, dropdowns, filters, flash, errors }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some(r => ['super-admin', 'admin', 'planner'].includes(r.name));

    // State for filters
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters?.code_unit || '');
    const [hmErrorFilter, setHmErrorFilter] = useState(filters?.hm_error || '');

    const [legendFilter, setLegendFilter] = useState({
        normal: true,
        stagnant: true,
        over24: true,
        minus: true,
        blank: true,
    });

    const handleLegendToggle = (key) => {
        setLegendFilter(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Quick Edit Active Modal Data (isolated from input typing)
    const [activeModalData, setActiveModalData] = useState(null);

    // File input ref for import
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportDropdownRef = useRef(null);

    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getExportUrl = (scope = 'all') => {
        const params = new URLSearchParams();
        params.append('scope', scope);
        if (scope === 'filtered') {
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (codeUnitFilter) params.append('code_unit', codeUnitFilter);
            if (hmErrorFilter) params.append('hm_error', hmErrorFilter);
            if (filters?.type_unit) params.append('type_unit', filters.type_unit);
            if (filters?.location) params.append('location', filters.location);
            if (filters?.status) params.append('status', filters.status);
        }
        return route('hour-meters.export.excel') + '?' + params.toString();
    };

    const handleExportExcelClick = () => {
        setIsExportingExcel(true);
        setTimeout(() => setIsExportingExcel(false), 3000);
        setShowExportMenu(false);
    };

    const handleDownloadTemplateClick = () => {
        setIsDownloadingTemplate(true);
        setTimeout(() => setIsDownloadingTemplate(false), 2000);
    };

    const handleExportPdfClick = () => {
        setIsExportingPdf(true);
        setTimeout(() => setIsExportingPdf(false), 3000);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAll = () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA data Hour Meter? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('hour-meters.delete.all'));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        router.post(route('hour-meters.import'), {
            file: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        router.get(route('hour-meters.index'), {
            code_unit: codeUnitFilter,
            date_from: dateFrom,
            date_to: dateTo,
            hm_error: hmErrorFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setCodeUnitFilter('');
        setDateFrom('');
        setDateTo('');
        setHmErrorFilter('');
        setLegendFilter({ normal: true, stagnant: true, over24: true, minus: true, blank: true });
        router.get(route('hour-meters.index'));
    };

    // Precompute full matrix, cell states, unit stats, and KPI in a single pass
    const matrixData = useMemo(() => {
        const cellMap = {};
        const unitStatsMap = {};
        let over24Units = 0;
        let minusUnits = 0;
        let stagnantUnits = 0;
        let normalUnits = 0;
        let blankUnits = 0;

        const dateDisplayMap = {};
        dates.forEach(d => {
            dateDisplayMap[d] = formatDisplayDate(d);
        });

        units.forEach(u => {
            const uId = u.id;
            const isLv = isLightVehicle(u.type_unit);
            cellMap[uId] = {};

            let over24Count = 0;
            let minusCount = 0;
            let stagnantCount = 0;
            let normalCount = 0;
            let blankCount = 0;
            const over24Dates = [];
            const minusDates = [];

            dates.forEach(date => {
                const log = groupedLogs[uId]?.[date];
                if (!log) {
                    cellMap[uId][date] = {
                        log: null,
                        hmVal: '-',
                        diff: null,
                        isOver24: false,
                        isMinus: false,
                        isStagnant: false,
                        isBlank: true,
                        isNormal: false,
                        isLv,
                        tooltip: `Tanggal: ${dateDisplayMap[date]}\nStatus: Belum ada input data HM${isLv ? ' (Light Vehicle - KM)' : ''}\n\n⚡ Double-klik (klik 2x) untuk langsung mengedit HM tanggal ini.`,
                    };
                    blankCount++;
                    return;
                }

                const currentHm = Number(log.hm_end);
                const prevDate = getPrevDateString(date);
                const prevLog = groupedLogs[uId]?.[prevDate];

                let diff = null;
                let prevSource = '';

                if (prevLog && prevLog.hm_end !== undefined && prevLog.hm_end !== null) {
                    const prevHm = Number(prevLog.hm_end);
                    diff = Math.round((currentHm - prevHm) * 10) / 10;
                    prevSource = `HM Kemarin (${dateDisplayMap[prevDate] || prevDate}): ${fastFormatHm(prevHm)}`;
                } else if (log.hm_start !== undefined && log.hm_start !== null && Number(log.hm_start) > 0) {
                    const startHm = Number(log.hm_start);
                    diff = Math.round((currentHm - startHm) * 10) / 10;
                    prevSource = `HM Awal Hari Ini: ${fastFormatHm(startHm)}`;
                } else if (log.hm_total !== undefined && log.hm_total !== null) {
                    diff = Math.round(Number(log.hm_total) * 10) / 10;
                    prevSource = `HM Total Input: ${fastFormatHm(diff)}`;
                }

                const isOver24 = !isLv && ((diff !== null && diff > 24) || (log.hm_total !== null && Number(log.hm_total) > 24));
                const isMinus = !isLv && ((diff !== null && diff < 0) || (log.hm_total !== null && Number(log.hm_total) < 0));
                const isStagnant = !isOver24 && !isMinus && (diff === 0 || Number(log.hm_total) === 0);
                const isNormal = !isOver24 && !isMinus && !isStagnant;

                let tooltip = `Tanggal: ${dateDisplayMap[date]}\nHM Hari Ini: ${fastFormatHm(currentHm)}`;
                if (prevSource) {
                    tooltip += `\n${prevSource}`;
                }
                if (diff !== null) {
                    tooltip += `\nSelisih dari Kemarin: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${isLv ? 'KM' : 'Jam'}`;
                }
                if (isLv) {
                    tooltip += `\n\n🚗 Unit Light Vehicle (KM): Pengecualian batas 24 jam & minus normal.`;
                } else if (isOver24) {
                    tooltip += `\n\n⚠️ PERINGATAN: LEBIH DARI 24 JAM DARI KEMARIN! (Over 24 Jam)`;
                } else if (isMinus) {
                    tooltip += `\n\n❌ PERINGATAN: HM MENURUN DARI KEMARIN! (Minus 24 Hour)`;
                }
                tooltip += `\n\n⚡ Double-klik (klik 2x) untuk langsung mengedit HM tanggal ini.`;

                const formattedVal = fastFormatHm(currentHm);
                const cellData = {
                    log,
                    hmVal: formattedVal,
                    diff,
                    isOver24,
                    isMinus,
                    isStagnant,
                    isBlank: false,
                    isNormal,
                    isLv,
                    tooltip,
                };

                cellMap[uId][date] = cellData;

                if (isOver24) {
                    over24Count++;
                    over24Dates.push({ date, diff, hmVal: formattedVal });
                } else if (isMinus) {
                    minusCount++;
                    minusDates.push({ date, diff, hmVal: formattedVal });
                } else if (isStagnant) {
                    stagnantCount++;
                } else if (isNormal) {
                    normalCount++;
                }
            });

            const hasOver24 = over24Count > 0;
            const hasMinus = minusCount > 0;
            const hasError = hasOver24 || hasMinus;

            unitStatsMap[uId] = {
                over24Count,
                minusCount,
                stagnantCount,
                normalCount,
                blankCount,
                over24Dates,
                minusDates,
                hasOver24,
                hasMinus,
                hasError,
            };

            if (hasOver24) over24Units++;
            if (hasMinus) minusUnits++;
            if (stagnantCount > 0 && !hasError) stagnantUnits++;
            if (normalCount > 0 && !hasError) normalUnits++;
            if (blankCount === dates.length) blankUnits++;
        });

        return {
            cellMap,
            unitStatsMap,
            kpiMetrics: {
                total: units.length,
                over24Units,
                minusUnits,
                stagnantUnits,
                normalUnits,
                blankUnits,
            },
        };
    }, [units, dates, groupedLogs]);

    const { cellMap, unitStatsMap, kpiMetrics } = matrixData;

    // Filter displayed units based on quick filter and legend checkboxes
    const displayedUnits = useMemo(() => {
        return units.filter((u) => {
            const st = unitStatsMap[u.id];
            if (!st) return true;

            if (hmErrorFilter === 'over_24' && !st.hasOver24) return false;
            if (hmErrorFilter === 'minus' && !st.hasMinus) return false;
            if (hmErrorFilter === 'all_errors' && !st.hasError) return false;
            if (hmErrorFilter === 'stagnant' && st.stagnantCount === 0) return false;
            if (hmErrorFilter === 'belum_terisi' && st.blankCount === 0) return false;

            if (legendFilter.normal && legendFilter.stagnant && legendFilter.over24 && legendFilter.minus && legendFilter.blank) {
                return true;
            }

            if (st.hasOver24 && legendFilter.over24) return true;
            if (st.hasMinus && legendFilter.minus) return true;
            if (st.stagnantCount > 0 && legendFilter.stagnant) return true;
            if (st.normalCount > 0 && legendFilter.normal) return true;
            if (st.blankCount > 0 && legendFilter.blank) return true;

            return false;
        });
    }, [units, unitStatsMap, hmErrorFilter, legendFilter]);

    const handleKpiCardClick = (filterType) => {
        if (hmErrorFilter === filterType) {
            setHmErrorFilter('');
        } else {
            setHmErrorFilter(filterType);
        }
    };

    // Open Quick Edit Modal on Double Click
    const handleOpenQuickEdit = (unit, date) => {
        const cell = cellMap[unit.id]?.[date];
        const prevDate = getPrevDateString(date);
        const prevLog = groupedLogs[unit.id]?.[prevDate];
        const prevHm = (prevLog && prevLog.hm_end !== undefined && prevLog.hm_end !== null) ? Number(prevLog.hm_end) : null;

        setActiveModalData({
            unit,
            date,
            cell,
            prevDate,
            prevHm,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Hour Meter" />

            {/* Flash Message */}
            {flash?.message && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold flex items-center gap-3 shadow-xs">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    <span>{flash.message}</span>
                </div>
            )}

            {errors?.file && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-bold flex items-center gap-3 shadow-xs">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                    <span>{errors.file}</span>
                </div>
            )}

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-7 h-7 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Hour Meter Monitoring
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Monitoring pemakaian HM alat berat harian dengan deteksi otomatis Over 24 Jam &amp; Minus</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={route('hour-meters.create')} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Input HM
                    </Link>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={handleFileChange} 
                    />
                    
                    {isAdmin && (
                        <button 
                            onClick={handleDeleteAll} 
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Kosongkan Data
                        </button>
                    )}

                    <button 
                        onClick={handleImportClick} 
                        disabled={isImporting} 
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                    >
                        {isImporting ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        )}
                        {isImporting ? 'Mengimpor...' : 'Import Excel'}
                    </button>

                    {/* Download Excel Dropdown Button */}
                    <div className="relative" ref={exportDropdownRef}>
                        <div className="inline-flex rounded-lg shadow-xs">
                            <a 
                                href={getExportUrl('all')} 
                                onClick={handleExportExcelClick} 
                                className={`bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-l-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-xs ${isExportingExcel ? 'opacity-75 pointer-events-none' : ''}`}
                                title="Download Semua Data Hour Meter (Excel)"
                            >
                                {isExportingExcel ? (
                                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-emerald-100" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                                        <path d="M8.5 12l2 3.5-2 3.5h1.7l1.1-2.2 1.1 2.2h1.7l-2-3.5 2-3.5h-1.7l-1.1 2.2-1.1-2.2H8.5z"/>
                                    </svg>
                                )}
                                {isExportingExcel ? 'Mengunduh...' : 'Download Excel'}
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-2 rounded-r-lg border-l border-emerald-500 transition flex items-center justify-center"
                                title="Pilihan Opsi Download"
                            >
                                <svg className={`w-4 h-4 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="px-3 py-1.5 border-b border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pilihan Download Excel</p>
                                </div>
                                <a
                                    href={getExportUrl('all')}
                                    onClick={handleExportExcelClick}
                                    className="flex items-start gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                                >
                                    <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    <div>
                                        <div className="font-bold text-gray-900">Download Semua Data</div>
                                        <div className="text-gray-500 text-[10px] mt-0.5">Semua rekaman log historis &amp; seluruh armada (3 Sheet Lengkap)</div>
                                    </div>
                                </a>
                                <a
                                    href={getExportUrl('filtered')}
                                    onClick={handleExportExcelClick}
                                    className="flex items-start gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                                >
                                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                                    </svg>
                                    <div>
                                        <div className="font-bold text-gray-900">Download Sesuai Filter</div>
                                        <div className="text-gray-500 text-[10px] mt-0.5">Sesuai rentang tanggal dan pencarian aktif</div>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>

                    <a 
                        href={route('hour-meters.download.template')} 
                        onClick={handleDownloadTemplateClick} 
                        className={`bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-xs ${isDownloadingTemplate ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                        {isDownloadingTemplate ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        )}
                        {isDownloadingTemplate ? 'Mengunduh...' : 'Download Template'}
                    </a>
                    
                    <a 
                        href={route('hour-meters.export.pdf')} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={handleExportPdfClick} 
                        className={`bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-xs ${isExportingPdf ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                        {isExportingPdf ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        )}
                        {isExportingPdf ? 'Mengekspor...' : 'Cetak PDF'}
                    </a>
                </div>
            </div>

            {/* KPI Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                {/* Total Unit */}
                <div 
                    onClick={() => handleKpiCardClick('')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        hmErrorFilter === '' 
                            ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-400/30' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Unit</span>
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    </div>
                    <div className="text-2xl font-black text-gray-800 mt-1">{kpiMetrics.total}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Unit terpantau</div>
                </div>

                {/* Normal */}
                <div 
                    onClick={() => handleKpiCardClick('normal')}
                    className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 transition cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Normal</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{kpiMetrics.normalUnits}</div>
                    <div className="text-[11px] text-emerald-600/80 mt-0.5">Pemakaian 1 - 24 Jam</div>
                </div>

                {/* Stagnant (0 Jam) */}
                <div 
                    onClick={() => handleKpiCardClick('stagnant')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        hmErrorFilter === 'stagnant' 
                            ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-400/30' 
                            : 'bg-white border-gray-200 hover:border-yellow-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">0 Jam (Stagnant)</span>
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    </div>
                    <div className="text-2xl font-black text-yellow-700 mt-1">{kpiMetrics.stagnantUnits}</div>
                    <div className="text-[11px] text-yellow-600/80 mt-0.5">Tidak beroperasi</div>
                </div>

                {/* OVER 24 JAM (HIGHLIGHTED RED) */}
                <div 
                    onClick={() => handleKpiCardClick('over_24')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        hmErrorFilter === 'over_24' 
                            ? 'bg-red-50 border-red-500 ring-2 ring-red-500/30' 
                            : 'bg-white border-red-200 hover:border-red-400 hover:bg-red-50/40'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1">
                            <span>OVER 24 JAM</span>
                            <span>⚠️</span>
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    </div>
                    <div className="text-2xl font-black text-red-600 mt-1">{kpiMetrics.over24Units} <span className="text-sm font-semibold">Unit</span></div>
                    <div className="text-[11px] text-red-500 font-semibold mt-0.5">Lebih dari 24 jam dari kemarin</div>
                </div>

                {/* MINUS 24 HOUR (HIGHLIGHTED ROSE) */}
                <div 
                    onClick={() => handleKpiCardClick('minus')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        hmErrorFilter === 'minus' 
                            ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30' 
                            : 'bg-white border-rose-200 hover:border-rose-400 hover:bg-rose-50/40'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1">
                            <span>MINUS 24 HOUR</span>
                            <span>❌</span>
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    </div>
                    <div className="text-2xl font-black text-rose-700 mt-1">{kpiMetrics.minusUnits} <span className="text-sm font-semibold">Unit</span></div>
                    <div className="text-[11px] text-rose-600 font-semibold mt-0.5">HM menurun dari kemarin</div>
                </div>
            </div>

            {/* Filter & Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cari Unit (Kode)</label>
                            <input 
                                type="text" 
                                value={codeUnitFilter} 
                                onChange={(e) => setCodeUnitFilter(e.target.value)} 
                                placeholder="Contoh: EX-201, MTL023" 
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 min-w-[150px]" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tanggal Dari</label>
                            <input 
                                type="date" 
                                value={dateFrom} 
                                max={dateTo || undefined} 
                                onChange={(e) => setDateFrom(e.target.value)} 
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg px-3 py-2 min-w-[130px]" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tanggal Sampai</label>
                            <input 
                                type="date" 
                                value={dateTo} 
                                min={dateFrom || undefined} 
                                onChange={(e) => setDateTo(e.target.value)} 
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg px-3 py-2 min-w-[130px]" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Filter Status / Anomali</label>
                            <select 
                                value={hmErrorFilter} 
                                onChange={(e) => setHmErrorFilter(e.target.value)} 
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 min-w-[170px]"
                            >
                                <option value="">Semua Status Unit</option>
                                <option value="over_24">⚠️ Over 24 Jam Saja</option>
                                <option value="minus">❌ Minus 24 Hour Saja</option>
                                <option value="all_errors">⚠️❌ Semua Anomali (Over &amp; Minus)</option>
                                <option value="stagnant">⏸️ Stagnant (0 Jam)</option>
                                <option value="belum_terisi">❓ Belum Terisi (Ada Kosong)</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 pb-0">
                            <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                Cari
                            </button>
                            <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Reset
                            </button>
                        </div>
                    </form>

                    {/* Color Legend Checkboxes */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-bold">
                        <span className="text-gray-500 uppercase tracking-wider">KETERANGAN WARNA:</span>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.normal} onChange={() => handleLegendToggle('normal')} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300"></span>
                            <span className="text-emerald-800">Normal (1-24 Jam)</span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.stagnant} onChange={() => handleLegendToggle('stagnant')} className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-yellow-100 border border-yellow-300"></span>
                            <span className="text-yellow-800">Tidak Operasi (Stagnant / 0 Jam)</span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-red-50/50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.over24} onChange={() => handleLegendToggle('over24')} className="rounded border-red-400 text-red-600 focus:ring-red-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-700"></span>
                            <span className="text-red-700 font-extrabold flex items-center gap-1">
                                <span>Over 24 Jam (&gt;24 Jam dari Kemarin)</span>
                                <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[10px] font-black">Warna Merah</span>
                            </span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-rose-50/50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.minus} onChange={() => handleLegendToggle('minus')} className="rounded border-rose-400 text-rose-700 focus:ring-rose-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-rose-700 border border-rose-800"></span>
                            <span className="text-rose-800 font-extrabold flex items-center gap-1">
                                <span>Minus 24 Hour (&lt;0 Jam / Menurun)</span>
                            </span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.blank} onChange={() => handleLegendToggle('blank')} className="rounded border-gray-300 text-gray-500 focus:ring-gray-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-300"></span>
                            <span className="text-gray-500">Belum Terisi (Kosong)</span>
                        </label>
                    </div>
                </div>

                {/* Double-Click Instruction Banner */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-b border-emerald-100 text-xs text-emerald-900 font-semibold select-none">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                            ⚡
                        </span>
                        <span>
                            <strong>FITUR QUICK EDIT:</strong> Double-klik (klik 2x) pada sel tanggal mana saja di tabel untuk langsung mengedit nilai Hour Meter!
                        </span>
                    </div>
                    <span className="hidden sm:inline-block text-[11px] text-emerald-700/80 italic font-medium">
                        (Mendukung edit angka, auto-hitung selisih kemarin, &amp; shortcut Enter)
                    </span>
                </div>

                {/* Table with High Performance CSS Rendering */}
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-b-xl pb-2 custom-scrollbar">
                    <table className="w-full text-sm text-center whitespace-nowrap border-collapse">
                        <thead className="bg-[#0f2e26] text-white sticky top-0 z-10 shadow-sm text-sm select-none">
                            <tr>
                                <th className="px-2 py-2.5 font-semibold border-r border-[#1a4a3c] min-w-[35px] text-center">NO</th>
                                <th className="px-3 py-2.5 font-semibold border-r border-[#1a4a3c] min-w-[95px] text-left">KODE UNIT</th>
                                <th className="px-3 py-2.5 font-semibold border-r border-[#1a4a3c] min-w-[95px] text-left">TYPE UNIT</th>
                                
                                {/* OVER 24 HOUR & MINUS 24 HOUR COLUMNS */}
                                <th className="px-2.5 py-2.5 font-bold border-r border-red-900/60 min-w-[95px] text-center bg-red-900/70 text-red-200">
                                    <div className="flex items-center justify-center gap-1">
                                        <span>OVER 24H</span>
                                        <span className="text-xs">⚠️</span>
                                    </div>
                                </th>
                                <th className="px-2.5 py-2.5 font-bold border-r border-rose-950/60 min-w-[95px] text-center bg-rose-950/80 text-rose-200">
                                    <div className="flex items-center justify-center gap-1">
                                        <span>MINUS 24H</span>
                                        <span className="text-xs">❌</span>
                                    </div>
                                </th>

                                {/* DATES COLUMNS */}
                                {dates.map((date, idx) => (
                                    <th key={idx} className="px-2 py-2.5 font-semibold border-r border-[#1a4a3c] min-w-[70px] text-center">
                                        {formatHeaderDate(date)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 bg-white text-sm">
                            {displayedUnits && displayedUnits.length > 0 ? (
                                displayedUnits.map((u, index) => {
                                    const st = unitStatsMap[u.id] || {};
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/90 transition-colors">
                                            <td className="px-2 py-1.5 border-r border-gray-100 font-medium text-gray-500 text-center">{index + 1}</td>
                                            <td className="px-3 py-1.5 border-r border-gray-100 font-bold text-gray-900 text-left">
                                                <Link href={route('units.show', u.id)} className="hover:text-[#10b981] hover:underline">
                                                    {u.code_unit}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-1.5 border-r border-gray-100 text-left text-gray-600 font-medium">{u.type_unit || '-'}</td>
                                            
                                            {/* KOLOM OVER 24 HOUR */}
                                            <td className="px-2 py-1.5 border-r border-gray-100 text-center font-bold">
                                                {st.hasOver24 ? (
                                                    <span 
                                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white cursor-help"
                                                        title={`Unit ${u.code_unit} memiliki ${st.over24Count} hari dengan pemakaian > 24 jam:\n` + st.over24Dates.map(d => `• ${d.date}: ${d.diff > 0 ? '+' : ''}${d.diff} Jam (${d.hmVal})`).join('\n')}
                                                    >
                                                        <span>⚠️</span>
                                                        <span>{st.over24Count} Hari</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 font-normal text-xs">-</span>
                                                )}
                                            </td>

                                            {/* KOLOM MINUS 24 HOUR */}
                                            <td className="px-2 py-1.5 border-r border-gray-100 text-center font-bold">
                                                {st.hasMinus ? (
                                                    <span 
                                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-700 text-white cursor-help"
                                                        title={`Unit ${u.code_unit} memiliki ${st.minusCount} hari dengan HM minus / menurun:\n` + st.minusDates.map(d => `• ${d.date}: ${d.diff} Jam (${d.hmVal})`).join('\n')}
                                                    >
                                                        <span>❌</span>
                                                        <span>{st.minusCount} Hari</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 font-normal text-xs">-</span>
                                                )}
                                            </td>

                                            {/* MATRIX DATES CELLS */}
                                            {dates.map((date, idx) => {
                                                const cell = cellMap[u.id]?.[date];
                                                if (!cell || cell.isBlank) {
                                                    return (
                                                        <td 
                                                            key={idx} 
                                                            onDoubleClick={() => handleOpenQuickEdit(u, date)}
                                                            className="px-1.5 py-1.5 border-r border-gray-100 bg-gray-50/70 text-gray-400 font-normal text-center cursor-pointer select-none hover:bg-emerald-50 hover:text-emerald-700"
                                                            title={cell?.tooltip}
                                                        >
                                                            -
                                                        </td>
                                                    );
                                                }

                                                // 1. OVER 24 JAM
                                                if (cell.isOver24) {
                                                    return (
                                                        <td 
                                                            key={idx} 
                                                            onDoubleClick={() => handleOpenQuickEdit(u, date)}
                                                            className="px-1 py-1 border-r border-red-500 bg-red-600 text-white font-bold text-center cursor-pointer select-none hover:bg-red-700"
                                                            title={cell.tooltip}
                                                        >
                                                            <div className="flex flex-col items-center justify-center leading-tight">
                                                                <span className="text-xs font-black">{cell.hmVal}</span>
                                                                <span className="text-[9.5px] bg-red-950/90 text-white font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap inline-flex items-center gap-0.5">
                                                                    <span>+{cell.diff !== null ? cell.diff.toFixed(1) : '>24'}h</span>
                                                                    <span>⚠️</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                // 2. MINUS 24 HOUR
                                                if (cell.isMinus) {
                                                    return (
                                                        <td 
                                                            key={idx} 
                                                            onDoubleClick={() => handleOpenQuickEdit(u, date)}
                                                            className="px-1 py-1 border-r border-rose-500 bg-rose-700 text-white font-bold text-center cursor-pointer select-none hover:bg-rose-800"
                                                            title={cell.tooltip}
                                                        >
                                                            <div className="flex flex-col items-center justify-center leading-tight">
                                                                <span className="text-xs font-black">{cell.hmVal}</span>
                                                                <span className="text-[9.5px] bg-rose-950/90 text-white font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap inline-flex items-center gap-0.5">
                                                                    <span>{cell.diff !== null ? cell.diff.toFixed(1) : '<0'}h</span>
                                                                    <span>❌</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                // 3. STAGNANT (0 JAM)
                                                if (cell.isStagnant) {
                                                    return (
                                                        <td 
                                                            key={idx} 
                                                            onDoubleClick={() => handleOpenQuickEdit(u, date)}
                                                            className="px-1.5 py-1.5 border-r border-gray-100 bg-amber-50 text-amber-900 font-medium text-center cursor-pointer select-none hover:bg-amber-100"
                                                            title={cell.tooltip}
                                                        >
                                                            <div className="flex flex-col items-center justify-center leading-tight">
                                                                <span className="text-xs">{cell.hmVal}</span>
                                                                <span className="text-[9.5px] text-amber-700 font-medium">0.0h</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                // 4. NORMAL (1-24 JAM)
                                                return (
                                                    <td 
                                                        key={idx} 
                                                        onDoubleClick={() => handleOpenQuickEdit(u, date)}
                                                        className="px-1.5 py-1.5 border-r border-gray-100 bg-emerald-50 text-emerald-900 font-medium text-center cursor-pointer select-none hover:bg-emerald-100"
                                                        title={cell.tooltip}
                                                    >
                                                        <div className="flex flex-col items-center justify-center leading-tight">
                                                            <span className="text-xs font-semibold">{cell.hmVal}</span>
                                                            {cell.diff !== null && cell.diff !== 0 && (
                                                                <span className="text-[9.5px] text-emerald-700">
                                                                    {cell.diff > 0 ? `+${cell.diff.toFixed(1)}` : cell.diff.toFixed(1)}{cell.isLv ? 'km' : 'h'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5 + dates.length} className="px-6 py-12 text-center text-gray-400">
                                        Tidak ada data unit yang sesuai dengan filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QUICK EDIT MODAL (ISOLATED COMPONENT - TYPING DOES NOT RE-RENDER TABLE) */}
            {activeModalData && (
                <QuickEditModal
                    unit={activeModalData.unit}
                    date={activeModalData.date}
                    cell={activeModalData.cell}
                    prevDate={activeModalData.prevDate}
                    prevHm={activeModalData.prevHm}
                    onClose={() => setActiveModalData(null)}
                />
            )}

        </AuthenticatedLayout>
    );
}

// Subcomponent QuickEditModal: Has isolated local state so typing is super fast and does not trigger table re-render
function QuickEditModal({ unit, date, cell, prevDate, prevHm, onClose }) {
    let initStart = '';
    if (cell?.log?.hm_start !== null && cell?.log?.hm_start !== undefined) {
        initStart = cell.log.hm_start;
    } else if (prevHm !== null) {
        initStart = prevHm;
    } else if (unit?.hm) {
        initStart = unit.hm;
    } else {
        initStart = 0;
    }

    let initEnd = '';
    if (cell?.log?.hm_end !== null && cell?.log?.hm_end !== undefined) {
        initEnd = cell.log.hm_end;
    } else if (initStart) {
        initEnd = initStart;
    }

    const [hmStart, setHmStart] = useState(initStart);
    const [hmEnd, setHmEnd] = useState(initEnd);
    const [shift, setShift] = useState(cell?.log?.shift || 'DS');
    const [remarks, setRemarks] = useState(cell?.log?.remarks || '');
    const [operator, setOperator] = useState(cell?.log?.operator_name || '');
    const [location, setLocation] = useState(cell?.log?.location || unit?.location || '');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const hmEndInputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (hmEndInputRef.current) {
                hmEndInputRef.current.focus();
                hmEndInputRef.current.select();
            }
        }, 50);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (hmEnd === '' || isNaN(Number(hmEnd))) {
            alert('Mohon masukkan angka Hour Meter Akhir yang valid.');
            return;
        }

        setIsSaving(true);
        router.post(route('hour-meters.quick-save'), {
            log_id: cell?.log?.id || null,
            unit_id: unit.id,
            code_unit: unit.code_unit,
            log_date: date,
            hm_start: Number(hmStart) || 0,
            hm_end: Number(hmEnd),
            shift: shift || 'DS',
            remarks: remarks || '',
            operator_name: operator || '',
            location: location || unit.location || '',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                onClose();
            },
            onError: () => {
                setIsSaving(false);
            },
        });
    };

    const handleDelete = () => {
        if (!cell?.log?.id) return;
        if (confirm(`Apakah Anda yakin ingin menghapus data HM unit [${unit.code_unit}] tanggal ${formatDisplayDate(date)}?`)) {
            setIsDeleting(true);
            router.delete(route('hour-meters.destroy', cell.log.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleting(false);
                    onClose();
                },
                onError: () => {
                    setIsDeleting(false);
                },
            });
        }
    };

    const modalEndNum = Number(hmEnd);
    const modalBaseNum = prevHm !== null ? prevHm : Number(hmStart);
    const modalLiveDiff = (!isNaN(modalEndNum) && !isNaN(modalBaseNum) && hmEnd !== '')
        ? Math.round((modalEndNum - modalBaseNum) * 10) / 10
        : null;

    const isLv = isLightVehicle(unit?.type_unit);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
                {/* Modal Header */}
                <div className="bg-[#0f2e26] text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">
                                ⚡
                            </span>
                            <h2 className="text-lg font-bold">Quick Edit Hour Meter</h2>
                        </div>
                        <div className="text-xs text-emerald-200 mt-1 flex items-center gap-2">
                            <span className="font-bold text-white bg-emerald-800/80 px-2 py-0.5 rounded">
                                {unit?.code_unit}
                            </span>
                            <span>{unit?.type_unit || 'Unit'}</span>
                            <span>•</span>
                            <span className="font-semibold">{formatDisplayDate(date)}</span>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-gray-300 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Reference Card (HM Kemarin) */}
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                        <div>
                            <div className="text-gray-500 font-medium">HM Hari Kemarin ({formatDisplayDate(prevDate)}):</div>
                            <div className="text-sm font-bold text-gray-800 mt-0.5">
                                {prevHm !== null 
                                    ? fastFormatHm(prevHm) 
                                    : '(Tidak ada catatan HM kemarin)'}
                            </div>
                        </div>
                        {prevHm !== null && (
                            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold text-[11px]">
                                Nilai Acuan Kemarin
                            </span>
                        )}
                    </div>

                    {/* Inputs: HM Awal & HM Akhir */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                HM Awal
                            </label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                value={hmStart} 
                                onChange={(e) => setHmStart(e.target.value)} 
                                className="w-full text-sm font-semibold rounded-lg border-gray-300 focus:border-[#10b981] focus:ring-[#10b981] px-3 py-2" 
                                placeholder="0.0" 
                            />
                            <span className="text-[10px] text-gray-400">Start hari ini</span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center justify-between">
                                <span>HM Akhir (Closing) *</span>
                                <span className="text-[10px] text-emerald-600 font-normal">Auto-focus</span>
                            </label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                ref={hmEndInputRef} 
                                required 
                                value={hmEnd} 
                                onChange={(e) => setHmEnd(e.target.value)} 
                                className="w-full text-base font-black text-gray-900 rounded-lg border-2 border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500 px-3 py-1.5 shadow-xs bg-emerald-50/20" 
                                placeholder="0.0" 
                            />
                            <span className="text-[10px] text-gray-500">Nilai yang tercatat di tabel</span>
                        </div>
                    </div>

                    {/* Live Delta & Status Warning Banner */}
                    {modalLiveDiff !== null && (
                        <div>
                            {isLv ? (
                                <div className="p-3.5 rounded-xl bg-blue-50 border-2 border-blue-300 text-blue-800 text-xs font-bold flex items-center gap-3">
                                    <span className="text-xl">🚗</span>
                                    <div>
                                        <div className="text-blue-900 font-black">UNIT LIGHT VEHICLE (KM)</div>
                                        <div className="font-medium text-[11px] text-blue-700 mt-0.5">
                                            Selisih: {modalLiveDiff > 0 ? `+${modalLiveDiff.toFixed(1)}` : modalLiveDiff.toFixed(1)} KM dari kemarin ({modalBaseNum}). Unit Light Vehicle menggunakan KM dan dikecualikan dari batas over/minus 24 jam.
                                        </div>
                                    </div>
                                </div>
                            ) : modalLiveDiff > 24 ? (
                                <div className="p-3 rounded-xl bg-red-50 border-2 border-red-400 text-red-700 text-xs font-bold flex items-center gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <div className="text-red-800 font-black">PERINGATAN: OVER 24 JAM (+{modalLiveDiff.toFixed(1)} Jam)!</div>
                                        <div className="font-medium text-[11px] text-red-600 mt-0.5">
                                            HM naik lebih dari 24 jam dalam 1 hari dari kemarin ({modalBaseNum}). Sel di tabel akan otomatis berwarna MERAH.
                                        </div>
                                    </div>
                                </div>
                            ) : modalLiveDiff < 0 ? (
                                <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold flex items-center gap-3">
                                    <span className="text-xl">❌</span>
                                    <div>
                                        <div className="text-rose-900 font-black">PERINGATAN: MINUS 24 HOUR ({modalLiveDiff.toFixed(1)} Jam)!</div>
                                        <div className="font-medium text-[11px] text-rose-700 mt-0.5">
                                            HM turun / lebih kecil dari hari kemarin ({modalBaseNum}). Sel di tabel akan berwarna Rose/Minus.
                                        </div>
                                    </div>
                                </div>
                            ) : modalLiveDiff === 0 ? (
                                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs font-bold flex items-center gap-3">
                                    <span className="text-xl">⏸️</span>
                                    <div>
                                        <div className="text-yellow-900 font-black">0 JAM (STAGNANT)</div>
                                        <div className="font-medium text-[11px] text-yellow-700 mt-0.5">
                                            Unit tidak beroperasi (HM sama dengan kemarin: {modalBaseNum}).
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-3">
                                    <span className="text-xl">✅</span>
                                    <div>
                                        <div className="text-emerald-900 font-black">NORMAL (+{modalLiveDiff.toFixed(1)} Jam)</div>
                                        <div className="font-medium text-[11px] text-emerald-700 mt-0.5">
                                            Pemakaian valid dalam batas wajar 1-24 jam.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shift & Remarks */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Shift
                            </label>
                            <select 
                                value={shift} 
                                onChange={(e) => setShift(e.target.value)} 
                                className="w-full text-xs font-semibold rounded-lg border-gray-300 focus:border-[#10b981] focus:ring-[#10b981] px-3 py-2"
                            >
                                <option value="DS">DS (Day Shift)</option>
                                <option value="NS">NS (Night Shift)</option>
                                <option value="Shift 1">Shift 1</option>
                                <option value="Shift 2">Shift 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Catatan / Remarks
                            </label>
                            <input 
                                type="text" 
                                value={remarks} 
                                onChange={(e) => setRemarks(e.target.value)} 
                                placeholder="Koreksi input, dll" 
                                className="w-full text-xs rounded-lg border-gray-300 focus:border-[#10b981] focus:ring-[#10b981] px-3 py-2" 
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        {cell?.log?.id ? (
                            <button 
                                type="button" 
                                onClick={handleDelete} 
                                disabled={isDeleting || isSaving} 
                                className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                {isDeleting ? 'Menghapus...' : 'Hapus Log'}
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSaving || isDeleting} 
                                className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-300"
                            >
                                Batal (Esc)
                            </button>

                            <button 
                                type="submit" 
                                disabled={isSaving || isDeleting} 
                                className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                )}
                                {isSaving ? 'Menyimpan...' : 'Simpan HM (Enter)'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
