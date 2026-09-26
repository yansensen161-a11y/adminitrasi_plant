import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    BarChart2,
    Calendar,
    CalendarDays,
    Clock,
    FileSpreadsheet,
    FileText,
    Filter,
    Gauge,
    Info,
    Maximize2,
    Minimize2,
    RefreshCw,
    Search,
    SlidersHorizontal,
    TrendingDown,
    TrendingUp,
    Wrench,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';

const MONTH_NAMES = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' },
];

const B_CODE_INFO = {
    B0: 'On Progress (Pengerjaan)',
    B1: 'Waiting Parts (Menunggu Suku Cadang)',
    B2: 'Waiting Sarana (Menunggu Sarana Pendukung)',
    B3: 'Waiting Tools (Menunggu Peralatan)',
    B4: 'Waiting Man Power (Menunggu Mekanik)',
    B5: 'Outside / Dealer (Pengerjaan Luar)',
    B6: 'Production / Abuse (Penyebab Operasional)',
    B7: 'Waiting Decision Plant (Keputusan Site)',
    B8: 'Waiting Decision HO (Keputusan Head Office)',
};

export default function PerformanceUnitIndex({ data, filters, unitTypes = [], locations = [] }) {
    const {
        period_mode = 'monthly',
        month = '',
        year = new Date().getFullYear(),
        iso_week = 1,
        days_in_period = 30,
        mohh_per_unit = 720,
        period_label = '',
        target_down_header = 'Monthly',
        iso_weeks = [],
        months = [],
        available_years = [2024, 2025, 2026, 2027],
        presets = {},
        units = [],
        totals = {},
        pareto_data = [],
    } = data;

    // Filter states
    const [periodMode, setPeriodMode] = useState(filters.period_mode || period_mode);
    const [selectedMonth, setSelectedMonth] = useState(filters.month || month);
    const [selectedYear, setSelectedYear] = useState(filters.year || year);
    const [selectedIsoWeek, setSelectedIsoWeek] = useState(filters.iso_week || iso_week);
    const [selectedType, setSelectedType] = useState(filters.type_unit || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // List of months in ISO format: 'Januari (01 Jan - 31 Jan 2026)'
    const monthsList = useMemo(() => {
        if (months && months.length > 0) return months;
        const indonesianMonths = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const mPad = String(m).padStart(2, '0');
            const lastDay = new Date(selectedYear, m, 0).getDate();
            const dateObjStart = new Date(selectedYear, i, 1);
            const dateObjEnd = new Date(selectedYear, i, lastDay);
            const startStr = `01 ${dateObjStart.toLocaleString('en-US', { month: 'short' })}`;
            const endStr = `${String(lastDay).padStart(2, '0')} ${dateObjEnd.toLocaleString('en-US', { month: 'short' })} ${selectedYear}`;
            return {
                month: `${selectedYear}-${mPad}`,
                month_num: m,
                label: `${indonesianMonths[i]} (${startStr} - ${endStr})`,
                short_label: indonesianMonths[i],
            };
        });
    }, [months, selectedYear]);

    // Fullscreen table toggle
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'code_unit', direction: 'asc' });

    // Handle filter submit
    const applyFilter = (params = {}) => {
        const payload = {
            period_mode: params.period_mode !== undefined ? params.period_mode : periodMode,
            month: params.month !== undefined ? params.month : selectedMonth,
            year: params.year !== undefined ? params.year : selectedYear,
            iso_week: params.iso_week !== undefined ? params.iso_week : selectedIsoWeek,
            type_unit: params.type_unit !== undefined ? params.type_unit : selectedType,
            location: params.location !== undefined ? params.location : selectedLocation,
            search: params.search !== undefined ? params.search : searchQuery,
        };

        router.get(route('performance-unit.index'), payload, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Sort units locally for instantaneous response
    const sortedUnits = useMemo(() => {
        if (!units || units.length === 0) return [];
        const sorted = [...units];
        if (!sortConfig.key) return sorted;

        sorted.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [units, sortConfig]);

    const formatNum = (val, decimals = 1) => {
        if (val === null || val === undefined || isNaN(val)) return '-';
        return Number(val).toLocaleString('id-ID', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const formatPct = (val) => {
        if (val === null || val === undefined || isNaN(val)) return '-';
        return `${Number(val).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
    };

    // Export URLs with complete period filters
    const exportParams = {
        period_mode: periodMode,
        month: selectedMonth,
        year: selectedYear,
        iso_week: selectedIsoWeek,
        type_unit: selectedType,
        location: selectedLocation,
        search: searchQuery,
    };

    const excelExportUrl = route('performance-unit.export.excel', exportParams);
    const pdfExportUrl = route('performance-unit.export.pdf', exportParams);

    const SortIcon = ({ colKey }) => {
        if (sortConfig.key !== colKey) {
            return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-40 inline-block ml-1" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-amber-400 inline-block ml-1" />
        ) : (
            <ArrowDown className="w-3 h-3 text-amber-400 inline-block ml-1" />
        );
    };

    // Quick Presets Handlers
    const applyPresetThisWeek = () => {
        const curWeek = presets?.current_iso_week || 39;
        const curYear = presets?.current_iso_year || 2026;
        setPeriodMode('iso_week');
        setSelectedYear(curYear);
        setSelectedIsoWeek(curWeek);
        applyFilter({ period_mode: 'iso_week', year: curYear, iso_week: curWeek });
    };

    const applyPresetLastWeek = () => {
        const prevWeek = presets?.prev_iso_week || 38;
        const prevYear = presets?.prev_iso_year || 2026;
        setPeriodMode('iso_week');
        setSelectedYear(prevYear);
        setSelectedIsoWeek(prevWeek);
        applyFilter({ period_mode: 'iso_week', year: prevYear, iso_week: prevWeek });
    };

    const applyPresetThisMonth = () => {
        const curMonth = presets?.current_month || '2026-09';
        const curYear = Number(curMonth.split('-')[0]) || year;
        setPeriodMode('monthly');
        setSelectedYear(curYear);
        setSelectedMonth(curMonth);
        applyFilter({ period_mode: 'monthly', month: curMonth, year: curYear });
    };

    const applyPresetLastMonth = () => {
        const prevMonth = presets?.prev_month || '2026-08';
        const prevYear = Number(prevMonth.split('-')[0]) || year;
        setPeriodMode('monthly');
        setSelectedYear(prevYear);
        setSelectedMonth(prevMonth);
        applyFilter({ period_mode: 'monthly', month: prevMonth, year: prevYear });
    };

    const applyPresetThisYear = () => {
        const curYear = presets?.current_year || new Date().getFullYear();
        setPeriodMode('yearly');
        setSelectedYear(curYear);
        applyFilter({ period_mode: 'yearly', year: curYear });
    };

    const applyPresetLastYear = () => {
        const prevYear = presets?.prev_year || (new Date().getFullYear() - 1);
        setPeriodMode('yearly');
        setSelectedYear(prevYear);
        applyFilter({ period_mode: 'yearly', year: prevYear });
    };

    return (
        <AuthenticatedLayout fullWidth={true}>
            <Head title={`Performance Unit - ${period_label}`} />

            <div className={`w-full space-y-4 px-1 sm:px-2 md:px-3 pb-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-4' : ''}`}>
                {/* ─── Top Bar / Title & Actions ───────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Performance Unit
                                </h1>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                    {periodMode === 'yearly'
                                        ? 'Mode Tahunan (Yearly)'
                                        : periodMode === 'iso_week'
                                        ? 'Mode ISO Perweek'
                                        : 'Mode Per Bulan'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Matriks Ketersediaan (PA, EU, MA), Breakdown Jam Kerja, & Reliabilitas Armada (MTBF/MTTR)
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Toggle Fullscreen button */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all"
                            title={isFullscreen ? 'Keluar Layar Penuh' : 'Tampilan Penuh'}
                        >
                            {isFullscreen ? (
                                <>
                                    <Minimize2 className="w-4 h-4 text-slate-600" />
                                    <span>Tutup Full</span>
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="w-4 h-4 text-slate-600" />
                                    <span>Full Tampilan</span>
                                </>
                            )}
                        </button>

                        <a
                            href={excelExportUrl}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Export Excel</span>
                        </a>

                        <a
                            href={pdfExportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shadow-sm"
                        >
                            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* ─── Filter Controls with 2 Options (Per Bulan & ISO Perweek) ───── */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
                    {/* Period Mode Selector Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Mode Periode:
                            </span>

                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPeriodMode('monthly');
                                        applyFilter({ period_mode: 'monthly' });
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        periodMode === 'monthly'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Per Bulan (Bulanan)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPeriodMode('iso_week');
                                        applyFilter({ period_mode: 'iso_week' });
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        periodMode === 'iso_week'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>Per Week (Mingguan ISO)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPeriodMode('yearly');
                                        applyFilter({ period_mode: 'yearly' });
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        periodMode === 'yearly'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Per Tahun (Tahunan)</span>
                                </button>
                            </div>
                        </div>

                        {/* Current Period Badge */}
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-900/40 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                                Periode Aktif: <strong>{period_label}</strong> ({days_in_period} Hari • MOHH <strong>{mohh_per_unit} Jam</strong>)
                            </span>
                        </div>
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
                        {/* Dynamic Period Input based on mode */}
                        {periodMode === 'yearly' ? (
                            /* Opsi 3: Per Tahun (Tahunan) */
                            <div className="sm:col-span-1 md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    Pilih Tahun (1 Tahun Penuh)
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        const y = Number(e.target.value);
                                        setSelectedYear(y);
                                        applyFilter({ period_mode: 'yearly', year: y });
                                    }}
                                    className="w-full text-xs font-bold bg-blue-50/70 dark:bg-slate-800 border border-blue-300 dark:border-slate-700 rounded-xl px-3 py-2 text-blue-900 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {available_years.map((y) => (
                                        <option key={y} value={y}>
                                            Tahun {y} (01 Jan - 31 Des {y})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : periodMode === 'monthly' ? (
                            /* Opsi 1: Per Bulan */
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Tahun
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const y = Number(e.target.value);
                                            setSelectedYear(y);
                                            const mParts = (selectedMonth || '').split('-');
                                            const currentM = mParts[1] || '09';
                                            const newMonthStr = `${y}-${currentM}`;
                                            setSelectedMonth(newMonthStr);
                                            applyFilter({ period_mode: 'monthly', year: y, month: newMonthStr });
                                        }}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {available_years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-1 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Pilih Bulan (Per Bulan)
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            const m = e.target.value;
                                            setSelectedMonth(m);
                                            const y = Number(m.split('-')[0]) || selectedYear;
                                            setSelectedYear(y);
                                            applyFilter({ period_mode: 'monthly', year: y, month: m });
                                        }}
                                        className="w-full text-xs font-bold bg-blue-50/70 dark:bg-slate-800 border border-blue-300 dark:border-slate-700 rounded-xl px-3 py-2 text-blue-900 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {monthsList.map((m) => (
                                            <option key={m.month} value={m.month}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            /* Opsi 2: ISO Perweek (Year + ISO Week Dropdown) */
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Tahun
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const y = Number(e.target.value);
                                            setSelectedYear(y);
                                            applyFilter({ period_mode: 'iso_week', year: y });
                                        }}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {available_years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-1 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                        Pilih Minggu (ISO Perweek)
                                    </label>
                                    <select
                                        value={selectedIsoWeek}
                                        onChange={(e) => {
                                            const w = Number(e.target.value);
                                            setSelectedIsoWeek(w);
                                            applyFilter({ period_mode: 'iso_week', iso_week: w });
                                        }}
                                        className="w-full text-xs font-bold bg-blue-50/70 dark:bg-slate-800 border border-blue-300 dark:border-slate-700 rounded-xl px-3 py-2 text-blue-900 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {iso_weeks.map((w) => (
                                            <option key={w.week} value={w.week}>
                                                {w.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Tipe Unit */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Tipe Alat
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    applyFilter({ type_unit: e.target.value });
                                }}
                                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Semua Tipe Alat ({unitTypes.length})</option>
                                {unitTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lokasi / Site */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Lokasi / Site
                            </label>
                            <select
                                value={selectedLocation}
                                onChange={(e) => {
                                    setSelectedLocation(e.target.value);
                                    applyFilter({ location: e.target.value });
                                }}
                                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Semua Site ({locations.length})</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Cari Unit
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari Unit Code / Nama..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilter({ search: searchQuery });
                                        }
                                    }}
                                    className="w-full text-xs font-medium pl-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pr-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Presets Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                                Preset Cepat:
                            </span>

                            <button
                                type="button"
                                onClick={applyPresetThisWeek}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'iso_week' && selectedIsoWeek === presets?.current_iso_week
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Minggu Ini
                            </button>

                            <button
                                type="button"
                                onClick={applyPresetLastWeek}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'iso_week' && selectedIsoWeek === presets?.prev_iso_week
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Minggu Lalu
                            </button>

                            <button
                                type="button"
                                onClick={applyPresetThisMonth}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'monthly' && selectedMonth === presets?.current_month
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Bulan Ini
                            </button>

                            <button
                                type="button"
                                onClick={applyPresetLastMonth}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'monthly' && selectedMonth === presets?.prev_month
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Bulan Lalu
                            </button>

                            <button
                                type="button"
                                onClick={applyPresetThisYear}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'yearly' && selectedYear === presets?.current_year
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Tahun Ini
                            </button>

                            <button
                                type="button"
                                onClick={applyPresetLastYear}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    periodMode === 'yearly' && selectedYear === presets?.prev_year
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                                }`}
                            >
                                Tahun Lalu
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedType('');
                                    setSelectedLocation('');
                                    setSearchQuery('');
                                    applyFilter({
                                        period_mode: 'monthly',
                                        month: presets?.current_month,
                                        type_unit: '',
                                        location: '',
                                        search: '',
                                    });
                                }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => applyFilter({ search: searchQuery })}
                                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-1.5 px-4 transition-colors shadow-sm cursor-pointer"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Fleet Summary Metric Cards ─────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {/* Fleet PA */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                AVG PA
                            </span>
                            <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                    totals.pa >= totals.budget_pa
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                }`}
                            >
                                Target {totals.budget_pa}%
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatPct(totals.pa)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Physical Avail.</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${
                                    totals.pa >= totals.budget_pa ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, totals.pa || 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Fleet EU */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                AVG EU
                            </span>
                            <Gauge className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                {formatPct(totals.eu)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Effective Util.</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${Math.min(100, totals.eu || 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Fleet MA */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                AVG MA
                            </span>
                            <Wrench className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {formatPct(totals.ma)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Target &ge; 85%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(100, totals.ma || 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Fleet MTBF */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                AVG MTBF
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Target 80h</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatNum(totals.mtbf, 1)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Jam</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Reliability Metric</p>
                    </div>

                    {/* Fleet MTTR */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                AVG MTTR
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Target 15h</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                {formatNum(totals.mttr, 1)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Jam</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Repair Metric</p>
                    </div>

                    {/* Total Armada & Operational Hours */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                TOTAL ARMADA
                            </span>
                            <Clock className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {totals.total_units}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Unit</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            WH: <strong className="text-emerald-600">{formatNum(totals.wh, 0)}h</strong> | BD:{' '}
                            <strong className="text-rose-600">{formatNum(totals.total_bd, 0)}h</strong>
                        </p>
                    </div>
                </div>

                {/* ─── Legend & Color Guide ────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Indikator:</span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="w-3.5 h-3.5 rounded bg-[#c6d9f1] border border-blue-400" />
                            <span>SCH</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="w-3.5 h-3.5 rounded bg-[#ffff00] border border-yellow-400" />
                            <span>UNS</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="w-3.5 h-3.5 rounded bg-[#ffc000] border border-amber-400" />
                            <span>ACD & LB</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="w-3.5 h-3.5 rounded bg-[#d9ead3] border border-emerald-400" />
                            <span>TOTAL Event (UNS+ACD+LB)</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 border-l border-slate-300 dark:border-slate-700 pl-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">B0 - B8</span>
                            <span>Down Status Delays</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded bg-pink-200 border border-pink-300" />
                            <span>EU / PA &lt; Budget PA</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="font-bold text-red-600">0</span>
                            <span>Nilai 0 (WH / STB)</span>
                        </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500">
                        Total Menampilkan: <strong>{sortedUnits.length}</strong> dari <strong>{totals.total_units}</strong> Unit
                    </div>
                </div>

                {/* ─── Full-Width Spreadsheet Table ───────────────────────────────── */}
                <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="w-full overflow-x-auto max-h-[820px] relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        <table className="w-full min-w-[1600px] text-[11px] border-collapse select-text">
                            {/* Sticky Header */}
                            <thead className="sticky top-0 z-20 shadow-md">
                                {/* Header Row 1 */}
                                <tr className="bg-black text-white text-center font-bold border-b border-slate-700">
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('code_unit')}
                                        className="py-2.5 px-3 sticky left-0 z-30 bg-black border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap min-w-[120px]"
                                    >
                                        CODE UNIT (NEW)
                                        <SortIcon colKey="code_unit" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('total_unit')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        Total unit
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('budget_pa')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        Budget PA
                                        <SortIcon colKey="budget_pa" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('mohh')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        MOHH
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('target_down')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        Target
                                        <SortIcon colKey="target_down" />
                                    </th>
                                    <th colSpan={2} className="py-1 px-3 border-r border-slate-700 whitespace-nowrap">
                                        HM Reading
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('wh')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        WH
                                        <SortIcon colKey="wh" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('stb_pla')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        STB<br />PLA
                                        <SortIcon colKey="stb_pla" />
                                    </th>

                                    {/* FREKUENSI EVENT master header */}
                                    <th
                                        colSpan={5}
                                        className="py-1 px-2 border-r border-slate-700 bg-[#c2bba8] text-slate-950 font-black tracking-wide whitespace-nowrap text-center text-xs"
                                    >
                                        FREKUENSI EVENT
                                    </th>

                                    {/* DOWN STATUS master header */}
                                    <th
                                        colSpan={10}
                                        className="py-1 px-2 border-r border-slate-700 bg-[#525252] text-white font-black tracking-wide whitespace-nowrap text-center text-xs"
                                    >
                                        DOWN STATUS
                                    </th>

                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('pa')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        PA %
                                        <SortIcon colKey="pa" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('eu')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        EU
                                        <SortIcon colKey="eu" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('ma')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        MA %
                                        <SortIcon colKey="ma" />
                                    </th>
                                    <th className="py-1 px-2 border-r border-slate-700 whitespace-nowrap">
                                        BD Ratio
                                    </th>
                                    <th className="py-1 px-2 border-r border-slate-700 whitespace-nowrap">
                                        BD Ratio
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('mtbf')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        MTBF
                                        <SortIcon colKey="mtbf" />
                                    </th>
                                    <th
                                        rowSpan={2}
                                        onClick={() => handleSort('mttr')}
                                        className="py-2 px-2 border-r border-slate-700 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        MTTR
                                        <SortIcon colKey="mttr" />
                                    </th>
                                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-700 whitespace-nowrap">
                                        Target MTBF
                                    </th>
                                    <th rowSpan={2} className="py-2 px-2 whitespace-nowrap">
                                        Target MTTR
                                    </th>
                                </tr>

                                {/* Header Row 2 (Subheaders) */}
                                <tr className="text-center font-bold text-[10px] border-b border-slate-700 bg-black text-white">
                                    <th className="py-1.5 px-2 border-r border-slate-700 whitespace-nowrap">
                                        Start
                                    </th>
                                    <th className="py-1.5 px-2 border-r border-slate-700 whitespace-nowrap">
                                        End
                                    </th>

                                    {/* Frekuensi Event Subheaders with colors matching image 2 */}
                                    <th
                                        onClick={() => handleSort('sch')}
                                        title="Schedule Breakdown"
                                        className="py-1.5 px-2 border-r border-slate-700 bg-[#c6d9f1] text-blue-950 font-black whitespace-nowrap cursor-pointer hover:brightness-95"
                                    >
                                        SCH
                                        <SortIcon colKey="sch" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('uns')}
                                        title="Unschedule Breakdown"
                                        className="py-1.5 px-2 border-r border-slate-700 bg-[#ffff00] text-yellow-950 font-black whitespace-nowrap cursor-pointer hover:brightness-95"
                                    >
                                        UNS
                                        <SortIcon colKey="uns" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('acc')}
                                        title="Accident"
                                        className="py-1.5 px-2 border-r border-slate-700 bg-[#ffc000] text-amber-950 font-black whitespace-nowrap cursor-pointer hover:brightness-95"
                                    >
                                        ACD
                                        <SortIcon colKey="acc" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('ld')}
                                        title="Lack of Demand / Opportunity / LB"
                                        className="py-1.5 px-2 border-r border-slate-700 bg-[#ffc000] text-amber-950 font-black whitespace-nowrap cursor-pointer hover:brightness-95"
                                    >
                                        LB
                                        <SortIcon colKey="ld" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('total_event_uns')}
                                        title="Total Unplanned Event Hours (UNS + ACD + LB)"
                                        className="py-1.5 px-2 border-r-2 border-slate-700 bg-[#d9ead3] text-emerald-950 font-black whitespace-nowrap cursor-pointer hover:brightness-95"
                                    >
                                        TOTAL
                                        <SortIcon colKey="total_event_uns" />
                                    </th>

                                    {/* Down Status B0 - B8 with Tooltip title */}
                                    {['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'].map((bCode) => (
                                        <th
                                            key={bCode}
                                            onClick={() => handleSort(bCode.toLowerCase())}
                                            title={B_CODE_INFO[bCode]}
                                            className="py-1.5 px-1.5 border-r border-slate-700 bg-black text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
                                        >
                                            {bCode}
                                            <SortIcon colKey={bCode.toLowerCase()} />
                                        </th>
                                    ))}

                                    <th
                                        onClick={() => handleSort('total_bd')}
                                        title="Total Breakdown Down Status (B0 - B8)"
                                        className="py-1.5 px-2 border-r-2 border-slate-700 bg-black text-white font-bold cursor-pointer hover:bg-slate-900 whitespace-nowrap"
                                    >
                                        Total
                                        <SortIcon colKey="total_bd" />
                                    </th>

                                    {/* Post Breakdown Subheaders */}
                                    <th className="py-1.5 px-2 border-r border-slate-700 whitespace-nowrap">
                                        (SCH)
                                    </th>
                                    <th className="py-1.5 px-2 border-r border-slate-700 whitespace-nowrap">
                                        (UNS)
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                                {sortedUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan={33} className="py-12 text-center text-slate-400 font-semibold">
                                            Tidak ada unit yang cocok dengan kriteria filter saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedUnits.map((u, idx) => (
                                        <tr
                                            key={u.id || idx}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-center font-mono text-[11px]"
                                        >
                                            {/* Code Unit - Sticky Left */}
                                            <td className="py-1.5 px-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-left font-sans whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight">{u.code_unit}</span>
                                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-sans">
                                                        {u.type_unit} {u.model && u.model !== '-' ? `• ${u.model}` : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                                                {u.total_unit}
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans">
                                                {formatPct(u.budget_pa)}
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                                                {u.mohh}
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                                                {formatNum(u.target_down, 1)}
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                                {u.hm_start ? Number(u.hm_start).toLocaleString('id-ID') : '-'}
                                            </td>

                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                                {u.hm_end ? Number(u.hm_end).toLocaleString('id-ID') : '-'}
                                            </td>

                                            {/* WH - Red text if 0 */}
                                            <td
                                                className={`py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-bold ${
                                                    u.wh_is_zero ? 'text-rose-600 dark:text-rose-400' : ''
                                                }`}
                                            >
                                                {formatNum(u.wh, 0)}
                                            </td>

                                            {/* STB PLA - Red text if 0 */}
                                            <td
                                                className={`py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-bold ${
                                                    u.stb_is_zero ? 'text-rose-600 dark:text-rose-400' : ''
                                                }`}
                                            >
                                                {formatNum(u.stb_pla, 0)}
                                            </td>

                                            {/* FREKUENSI EVENT Cells */}
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#c6d9f1]/70 dark:bg-blue-950/40 font-bold text-blue-950 dark:text-blue-200">
                                                {formatNum(u.sch, 0)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#ffff00]/60 dark:bg-yellow-950/40 font-bold text-yellow-950 dark:text-yellow-200">
                                                {formatNum(u.uns, 0)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#ffc000]/60 dark:bg-amber-950/40 font-bold text-amber-950 dark:text-amber-200">
                                                {formatNum(u.acc, 0)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#ffc000]/60 dark:bg-amber-950/40 font-bold text-amber-950 dark:text-amber-200">
                                                {formatNum(u.ld, 0)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r-2 border-slate-400 dark:border-slate-700 bg-[#d9ead3]/80 dark:bg-emerald-950/50 font-black text-emerald-950 dark:text-emerald-200">
                                                {formatNum(u.total_event_uns, 0)}
                                            </td>

                                            {/* DOWN STATUS Cells (B0 - B8) */}
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b0, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b1, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b2, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b3, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b4, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b5, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b6, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b7, 0)}
                                            </td>
                                            <td className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                {formatNum(u.b8, 0)}
                                            </td>

                                            {/* Total Breakdown Down Status */}
                                            <td className="py-1.5 px-2 border-r-2 border-slate-400 dark:border-slate-700 font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                                                {formatNum(u.total_bd, 0)}
                                            </td>

                                            {/* PA % - Pink cell if below budget */}
                                            <td
                                                className={`py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans font-bold ${
                                                    u.pa_below_budget
                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black'
                                                        : ''
                                                }`}
                                            >
                                                {formatPct(u.pa)}
                                            </td>

                                            {/* EU - Soft Pink cell as in spreadsheet image */}
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans bg-rose-100/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold">
                                                {formatPct(u.eu)}
                                            </td>

                                            {/* MA % - Pink cell if below budget */}
                                            <td
                                                className={`py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans ${
                                                    u.ma_below_budget
                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                                                        : ''
                                                }`}
                                            >
                                                {formatPct(u.ma)}
                                            </td>

                                            {/* BD Ratio SCH & UNS */}
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans">
                                                {formatPct(u.bd_ratio_sch)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-sans">
                                                {formatPct(u.bd_ratio_uns)}
                                            </td>

                                            {/* MTBF & MTTR */}
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-bold">
                                                {formatNum(u.mtbf, 0)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800">
                                                {formatNum(u.mttr, 0)}
                                            </td>

                                            {/* Target MTBF & Target MTTR */}
                                            <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 text-slate-500">
                                                {u.target_mtbf}
                                            </td>
                                            <td className="py-1.5 px-2 text-slate-500">
                                                {u.target_mttr}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                            {/* Summary / Total Fleet Row at Bottom */}
                            <tfoot className="sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <tr className="bg-slate-900 text-white font-bold text-center text-[11px] border-t-2 border-slate-700 font-mono">
                                    <td className="py-2.5 px-3 sticky left-0 z-30 bg-slate-900 border-r border-slate-700 text-left font-sans font-black tracking-wider whitespace-nowrap">
                                        TOTAL / AVERAGE
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans">
                                        {totals.total_units}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans">
                                        {formatPct(totals.budget_pa)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700">
                                        {Number(totals.mohh || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700">
                                        {formatNum(totals.target_down, 1)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700">-</td>
                                    <td className="py-2 px-2 border-r border-slate-700">-</td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-bold text-emerald-400">
                                        {formatNum(totals.wh, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-bold">
                                        {formatNum(totals.stb_pla, 0)}
                                    </td>

                                    {/* Frekuensi Event Totals */}
                                    <td className="py-2 px-2 border-r border-slate-700 bg-blue-900/60 text-blue-200 font-bold">
                                        {formatNum(totals.sch, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 bg-yellow-900/60 text-yellow-200 font-bold">
                                        {formatNum(totals.uns, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 bg-amber-900/60 text-amber-200 font-bold">
                                        {formatNum(totals.acc, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 bg-amber-900/60 text-amber-200 font-bold">
                                        {formatNum(totals.ld, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r-2 border-slate-600 bg-emerald-900/70 text-emerald-200 font-black">
                                        {formatNum(totals.total_event_uns, 0)}
                                    </td>

                                    {/* Down Status B0 - B8 Totals */}
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b0, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b1, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b2, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b3, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b4, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b5, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b6, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b7, 0)}</td>
                                    <td className="py-2 px-1.5 border-r border-slate-700">{formatNum(totals.b8, 0)}</td>

                                    {/* Total Breakdown All */}
                                    <td className="py-2 px-2 border-r-2 border-slate-600 font-black text-rose-400">
                                        {formatNum(totals.total_bd, 0)}
                                    </td>

                                    {/* Fleet PA, EU, MA */}
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans font-black text-amber-300">
                                        {formatPct(totals.pa)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans bg-rose-950/80 text-rose-300 font-bold">
                                        {formatPct(totals.eu)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans font-bold">
                                        {formatPct(totals.ma)}
                                    </td>

                                    {/* BD Ratios */}
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans">
                                        {formatPct(totals.bd_ratio_sch)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700 font-sans">
                                        {formatPct(totals.bd_ratio_uns)}
                                    </td>

                                    {/* MTBF & MTTR */}
                                    <td className="py-2 px-2 border-r border-slate-700 font-bold">
                                        {formatNum(totals.mtbf, 0)}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-700">
                                        {formatNum(totals.mttr, 0)}
                                    </td>

                                    <td className="py-2 px-2 border-r border-slate-700">{totals.target_mtbf}</td>
                                    <td className="py-2 px-2">{totals.target_mttr}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* ─── Pareto Problem Table ────────────────────────────────────── */}
                {pareto_data && pareto_data.length > 0 && (
                    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a2744] border-b border-[#2a3b66]">
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <BarChart2 className="w-4 h-4 text-blue-300" />
                                </span>
                                <div>
                                    <h2 className="text-sm font-black text-white tracking-wide">
                                        Pareto Problem{' '}
                                        <span className="text-blue-300">
                                            {periodMode === 'iso_week' ? 'Per Week' : periodMode === 'yearly' ? 'Yearly' : 'MTD'}{' '}
                                            {selectedYear}
                                        </span>{' '}
                                        (All)
                                    </h2>
                                    <p className="text-[11px] text-blue-200/60 mt-0.5">
                                        Periode: <strong className="text-blue-200">{period_label}</strong> — Breakdown per komponen sistem
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-blue-200/70 font-semibold">
                                <span>
                                    Total BD:{' '}
                                    <strong className="text-white">
                                        {formatNum(pareto_data.reduce((s, r) => s + r.total_d, 0), 1)} Jam
                                    </strong>
                                </span>
                                <span className="text-blue-400/50">|</span>
                                <span>
                                    Events:{' '}
                                    <strong className="text-white">
                                        {pareto_data.reduce((s, r) => s + r.freq, 0)}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {/* Compact Table */}
                        <div className="p-4">
                            <table className="border-collapse text-[11px]" style={{ width: 'auto' }}>
                                <thead>
                                    <tr className="bg-[#1a2744] text-white">
                                        <th className="py-1.5 px-2 text-center font-bold border border-[#2a3b66]" style={{width:'32px'}}>NO</th>
                                        <th className="py-1.5 px-3 text-left font-bold border border-[#2a3b66]" style={{width:'200px'}}>COMP</th>
                                        <th className="py-1.5 px-2 text-center font-bold border border-[#2a3b66]" style={{width:'56px'}}>Freq</th>
                                        <th className="py-1.5 px-2 text-center font-bold border border-[#2a3b66]" style={{width:'64px'}}>Total D</th>
                                        <th className="py-1.5 px-2 text-center font-bold border border-[#2a3b66]" style={{width:'56px'}}>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pareto_data.map((row, idx) => {
                                        const hasData = row.freq > 0 || row.total_d > 0;
                                        return (
                                            <tr
                                                key={row.comp}
                                                className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                                                    hasData
                                                        ? 'bg-white dark:bg-slate-900 hover:bg-blue-50/40 dark:hover:bg-slate-800/50'
                                                        : 'bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60'
                                                }`}
                                            >
                                                {/* NO */}
                                                <td className="py-1 px-2 text-center font-bold text-slate-400 border border-slate-100 dark:border-slate-800">
                                                    {idx + 1}
                                                </td>
                                                {/* COMP */}
                                                <td className={`py-1 px-3 font-semibold border border-slate-100 dark:border-slate-800 whitespace-nowrap ${hasData ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                                                    {row.comp}
                                                </td>
                                                {/* Freq */}
                                                <td className={`py-1 px-2 text-center font-mono border border-slate-100 dark:border-slate-800 ${hasData ? 'font-bold text-slate-800' : 'text-slate-300'}`}>
                                                    {row.freq}
                                                </td>
                                                {/* Total D */}
                                                <td className={`py-1 px-2 text-center font-mono border border-slate-100 dark:border-slate-800 ${hasData ? 'font-bold text-slate-900' : 'text-slate-300'}`}>
                                                    {row.total_d > 0 ? formatNum(row.total_d, 0) : 0}
                                                </td>
                                                {/* % inline */}
                                                <td className="py-1 px-2 text-center border border-slate-100 dark:border-slate-800">
                                                    <span className={`font-black font-mono text-[10px] ${
                                                        hasData
                                                            ? row.pct > 15 ? 'text-rose-600' : row.pct > 5 ? 'text-amber-600' : 'text-blue-600'
                                                            : 'text-slate-300'
                                                    }`}>
                                                        {hasData ? `${formatNum(row.pct, 1)}%` : '0,0%'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {/* SUM Footer */}
                                <tfoot>
                                    <tr className="bg-[#1a2744] text-white font-black text-[11px] border-t-2 border-[#2a3b66]">
                                        <td className="py-2 px-2 text-center border border-[#2a3b66]" colSpan={2}>
                                            SUM
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono border border-[#2a3b66]">
                                            {pareto_data.reduce((s, r) => s + r.freq, 0)}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono border border-[#2a3b66]">
                                            {formatNum(pareto_data.reduce((s, r) => s + r.total_d, 0), 0)}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono border border-[#2a3b66]">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Bottom Information Note ────────────────────────────────────── */}
                <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-blue-500" />
                        Formula Kinerja & Definisi:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                        <li><strong>MOHH:</strong> Month/Period Operational Hours = Hari dalam periode terpilih &times; 24 jam (misal 7 hari ISO Week = 168 jam, 30 hari = 720 jam).</li>
                        <li><strong>Target down:</strong> (1 &minus; Budget PA / 100) &times; MOHH periode terpilih.</li>
                        <li><strong>WH (Working Hours):</strong> Jam kerja aktual alat (HM Akhir &minus; HM Awal) dalam periode terpilih.</li>
                        <li><strong>STB PLA (Standby Plant):</strong> MOHH &minus; WH &minus; Total Breakdown Hours.</li>
                        <li><strong>PA % (Physical Availability):</strong> ((MOHH &minus; Total BD) / MOHH) &times; 100%.</li>
                        <li><strong>EU % (Effective Utilization):</strong> (WH / MOHH) &times; 100%.</li>
                        <li><strong>MA % (Mechanical Availability):</strong> (WH / (WH + Total BD)) &times; 100%.</li>
                        <li><strong>MTBF (Mean Time Between Failures):</strong> WH / Frekuensi Gangguan Breakdown dalam periode.</li>
                        <li><strong>MTTR (Mean Time To Repair):</strong> Total Jam Breakdown / Frekuensi Gangguan Breakdown dalam periode.</li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
