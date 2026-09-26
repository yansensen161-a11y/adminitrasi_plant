import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import { 
    Gauge, 
    Clock, 
    Wrench, 
    BarChart3, 
    TrendingUp, 
    PieChart as PieChartIcon, 
    Layers, 
    ChevronDown, 
    Calendar,
    Table,
    FileSpreadsheet,
    ListFilter,
    Plus,
    Search,
    CheckCircle2
} from 'lucide-react';

// Plugin untuk menampilkan angka di atas setiap bar chart
const barValueLabelsPlugin = {
    id: 'kpiBarValueLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            if (dataset.type === 'line' || dataset.hideLabels) return;
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar, dataIndex) => {
                const val = dataset.data[dataIndex];
                if (val !== undefined && val !== null) {
                    ctx.save();
                    const isDark = document.documentElement.classList.contains('dark');
                    ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
                    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(String(val), bar.x, Math.max(12, bar.y - 3));
                    ctx.restore();
                }
            });
        });
    }
};

export default function Index({
    month: initialMonth = '2026-09',
    targetPa: initialTargetPa = 92,
    paUnitMatrix,
    breakdownSummary,
    mtbfBulldozer,
    mttrBulldozer,
    paretoDuration,
    paretoEvent,
    klasifikasiBreakdown
}) {
    const [fMonth, setFMonth] = useState(initialMonth);
    const [fTargetPa, setFTargetPa] = useState(initialTargetPa);
    const [activeTab, setActiveTab] = useState('all'); 
    const [paretoDurationSort, setParetoDurationSort] = useState('original');
    const [paretoEventSort, setParetoEventSort] = useState('original');
    
    // State for Klasifikasi Unit Breakdown
    const [klasifikasiRows, setKlasifikasiRows] = useState(klasifikasiBreakdown?.items || []);
    const [searchKlasifikasi, setSearchKlasifikasi] = useState('');
    const [filterUnit, setFilterUnit] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRow, setNewRow] = useState({ unit: 'ME049', problem: '', action: '', downtime: '', status: 'COMPLETED' });

    const applyFilter = () => {
        router.get('/kpi', { month: fMonth, target_pa: fTargetPa }, { preserveState: true });
    };

    const handleAddKlasifikasi = (e) => {
        e.preventDefault();
        if (!newRow.problem) return;
        const newEntry = {
            no: klasifikasiRows.length + 1,
            unit: newRow.unit,
            problem: newRow.problem,
            action: newRow.action || '-',
            downtime: newRow.downtime ? `${newRow.downtime} Jam` : '-',
            status: newRow.status || 'COMPLETED'
        };
        setKlasifikasiRows(prev => [...prev, newEntry]);
        setNewRow({ unit: 'ME049', problem: '', action: '', downtime: '', status: 'COMPLETED' });
        setShowAddModal(false);
    };

    const filteredKlasifikasi = useMemo(() => {
        return klasifikasiRows.filter(row => {
            const matchesSearch = !searchKlasifikasi.trim() || 
                row.problem.toLowerCase().includes(searchKlasifikasi.toLowerCase()) ||
                row.action.toLowerCase().includes(searchKlasifikasi.toLowerCase()) ||
                row.unit.toLowerCase().includes(searchKlasifikasi.toLowerCase());
            const matchesUnit = filterUnit === 'ALL' || row.unit === filterUnit;
            return matchesSearch && matchesUnit;
        });
    }, [klasifikasiRows, searchKlasifikasi, filterUnit]);

    // Helper pewarnaan cell Achv / Actual
    const getCellColor = (val, type = 'achv') => {
        if (val === '#DIV/0!' || val === null || val === undefined) {
            return 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
        }
        const num = parseFloat(val);
        if (isNaN(num)) return '';

        if (type === 'achv') {
            if (num === 0) return 'bg-[#ffc7ce] text-[#9c0006] font-bold'; 
            if (num < 80) return 'bg-[#ffeb9c] text-[#9c6500] font-bold';  
            return 'bg-[#c6efce] text-[#006100] font-bold';               
        }

        if (type === 'actual') {
            if (num === 0) return 'bg-[#ffc7ce] text-[#9c0006] font-bold';
            if (num <= 65) return 'bg-[#ffc7ce] text-[#9c0006] font-bold';
            if (num <= 75) return 'bg-[#ffeb9c] text-[#9c6500] font-bold';
            return 'text-slate-800 dark:text-slate-100';
        }

        return 'text-slate-800 dark:text-slate-100';
    };

    return (
        <AuthenticatedLayout>
            <Head title="KPI Plant Management" />

            <div className="space-y-6 pb-12">
                {/* ── Top Header & Filter Toolbar ── */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
                                    <Gauge className="w-6 h-6" />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                        KPI PLANT MANAGEMENT
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/50">
                                            PERFORMANCE DASHBOARD
                                        </span>
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Physical Availability (PA), Breakdown B0–B8, Keandalan (MTBF/MTTR), Pareto Durasi & Event, serta Klasifikasi Unit Breakdown
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold text-slate-600 dark:text-slate-300">Periode:</span>
                                <input
                                    type="month"
                                    value={fMonth}
                                    onChange={(e) => setFMonth(e.target.value)}
                                    className="bg-transparent border-0 p-0 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                <span className="font-bold text-slate-600 dark:text-slate-300">Target PA:</span>
                                <input
                                    type="number"
                                    min="50"
                                    max="100"
                                    value={fTargetPa}
                                    onChange={(e) => setFTargetPa(e.target.value)}
                                    className="w-12 bg-transparent border-0 p-0 text-xs font-black text-emerald-600 dark:text-emerald-400 text-right focus:ring-0"
                                />
                                <span className="font-bold text-slate-400">%</span>
                            </div>

                            <button
                                onClick={applyFilter}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                            >
                                Tampilkan
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: 'Tampilkan Semua (Executive Report)', icon: Layers },
                            { id: 'pa_matrix', label: '1. Matriks PA Unit (Weekly & Monthly)', icon: Table },
                            { id: 'breakdown', label: '2. Type BD & Down Status B0-B8', icon: PieChartIcon },
                            { id: 'mtbf_mttr', label: '3. Keandalan MTBF & MTTR Bulldozer', icon: TrendingUp },
                            { id: 'pareto_duration', label: '4. Pareto Durasi Komponen', icon: BarChart3 },
                            { id: 'pareto_event', label: '5. Pareto Event Komponen', icon: BarChart3 },
                            { id: 'klasifikasi', label: '6. Klasifikasi Breakdown Unit', icon: FileSpreadsheet },
                        ].map((t) => {
                            const Icon = t.icon;
                            const isActive = activeTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                                        isActive
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 1: MATRIKS PA UNIT WEEKLY & MONTHLY REVIEW (Gambar 1)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'pa_matrix') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {/* Section Header */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-[#3e3d24] via-[#48462a] to-[#3e3d24] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-6 bg-[#fff200] rounded-full"></span>
                                <div>
                                    <h2 className="text-sm font-black tracking-wider uppercase">
                                        PHYSICAL AVAILABILITY (PA) UNIT - WEEKLY TO MONTHLY REVIEW
                                    </h2>
                                    <p className="text-[11px] text-amber-200/90 font-medium">
                                        Evaluasi performa kesiapan fisik unit per minggu (W1 - W5) beserta deviasi & review bulanan
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#c6efce] text-[#006100]">
                                    ■ Achv ≥ 80%
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffeb9c] text-[#9c6500]">
                                    ■ Deviasi Sedang
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffc7ce] text-[#9c0006]">
                                    ■ Kritis / Off
                                </span>
                            </div>
                        </div>

                        {/* Excel-Style Table View */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse text-xs select-none">
                                <thead>
                                    <tr className="bg-[#3e3d24] text-white font-black text-[11px] uppercase tracking-wider divide-x divide-[#5a5735]">
                                        <th rowSpan="2" className="py-2.5 px-3 text-left w-56 sticky left-0 z-20 bg-[#3e3d24] border-b border-[#5a5735]">
                                            <div className="flex items-center justify-between">
                                                <span>KATEGORI</span>
                                                <ChevronDown className="w-3.5 h-3.5 text-amber-200" />
                                            </div>
                                        </th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735]">WEEK 1</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735]">WEEK 2</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735]">WEEK 3</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735]">WEEK 4</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735]">WEEK 5</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 border-b border-[#5a5735] text-[#fff200]">TREND WEEK TO WEEK</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735] text-[#fff200]">DEVIASI</th>
                                        <th colSpan="2" className="py-2 px-2 bg-[#fff200] text-slate-900 border-b border-amber-400 font-black">MONTHLY REVIEW</th>
                                        <th className="py-2 px-2 border-b border-[#5a5735]">DEVIASI</th>
                                    </tr>

                                    <tr className="bg-[#48462a] text-white font-bold text-[10px] divide-x divide-[#5a5735] border-b border-slate-300 dark:border-slate-700">
                                        <th className="py-1.5 px-2 w-14">PLAN</th>
                                        <th className="py-1.5 px-2 w-14">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                        <th className="py-1.5 px-2 w-14">PLAN</th>
                                        <th className="py-1.5 px-2 w-14">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                        <th className="py-1.5 px-2 w-14">PLAN</th>
                                        <th className="py-1.5 px-2 w-14">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                        <th className="py-1.5 px-2 w-14">PLAN</th>
                                        <th className="py-1.5 px-2 w-14">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                        <th className="py-1.5 px-2 w-14">PLAN</th>
                                        <th className="py-1.5 px-2 w-14">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                        <th className="py-1.5 px-2 w-16 text-[#fff200]">PLAN MTD</th>
                                        <th className="py-1.5 px-2 w-14 text-[#fff200]">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14 text-[#fff200]">ACHV</th>
                                        <th className="py-1.5 px-2 w-20 bg-[#fff200] text-slate-900 font-black">BUDGET RUNNING</th>
                                        <th className="py-1.5 px-2 w-16 bg-[#fff200] text-slate-900 font-black">ACTUAL</th>
                                        <th className="py-1.5 px-2 w-14">ACHV</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono text-[11px]">
                                    {paUnitMatrix?.summary && (
                                        <tr className="bg-[#e6f2f8] dark:bg-sky-950/60 font-black text-slate-900 dark:text-sky-100 border-b-2 border-sky-300 dark:border-sky-700 divide-x divide-sky-200 dark:divide-sky-800">
                                            <td className="py-2.5 px-3 text-left sticky left-0 z-10 bg-[#e6f2f8] dark:bg-sky-950 font-black flex items-center justify-between">
                                                <span>{paUnitMatrix.summary.category}</span>
                                                <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
                                            </td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w1.plan}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w1.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.w1.achv, 'achv')}`}>{paUnitMatrix.summary.w1.achv}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w2.plan}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w2.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.w2.achv, 'achv')}`}>{paUnitMatrix.summary.w2.achv}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w3.plan}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w3.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.w3.achv, 'achv')}`}>{paUnitMatrix.summary.w3.achv}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w4.plan}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w4.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.w4.achv, 'achv')}`}>{paUnitMatrix.summary.w4.achv}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w5.plan}%</td>
                                            <td className="py-2 px-2">{paUnitMatrix.summary.w5.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.w5.achv, 'achv')}`}>{paUnitMatrix.summary.w5.achv}%</td>
                                            <td className="py-2 px-2 font-bold">{paUnitMatrix.summary.trend.plan_mtd}%</td>
                                            <td className="py-2 px-2 font-bold">{paUnitMatrix.summary.trend.actual}%</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.trend.achv, 'achv')}`}>{paUnitMatrix.summary.trend.achv}%</td>
                                            <td className="py-2 px-2 font-black">{paUnitMatrix.summary.monthly.budget_running}%</td>
                                            <td className="py-2 px-2 font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">{paUnitMatrix.summary.monthly.actual}</td>
                                            <td className={`py-2 px-2 ${getCellColor(paUnitMatrix.summary.monthly.achv, 'achv')}`}>{paUnitMatrix.summary.monthly.achv}%</td>
                                        </tr>
                                    )}

                                    {paUnitMatrix?.categories?.map((row, idx) => (
                                        <tr 
                                            key={row.category || idx} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors divide-x divide-slate-100 dark:divide-slate-800"
                                        >
                                            <td className="py-2 px-3 text-left font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                {row.category}
                                            </td>
                                            <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">{row.w1.plan}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w1.actual, 'actual')}`}>{row.w1.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w1.achv, 'achv')}`}>{row.w1.achv}%</td>
                                            <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">{row.w2.plan}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w2.actual, 'actual')}`}>{row.w2.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w2.achv, 'achv')}`}>{row.w2.achv}%</td>
                                            <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">{row.w3.plan}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w3.actual, 'actual')}`}>{row.w3.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w3.achv, 'achv')}`}>{row.w3.achv}%</td>
                                            <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">{row.w4.plan}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w4.actual, 'actual')}`}>{row.w4.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w4.achv, 'achv')}`}>{row.w4.achv}%</td>
                                            <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400">{row.w5.plan}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w5.actual, 'actual')}`}>{row.w5.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.w5.achv, 'achv')}`}>{row.w5.achv}%</td>
                                            <td className="py-1.5 px-2 font-semibold text-slate-700 dark:text-slate-300">{row.trend.plan_mtd}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.trend.actual, 'actual')}`}>{row.trend.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.trend.achv, 'achv')}`}>{row.trend.achv}%</td>
                                            <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-slate-200">{row.monthly.budget_running}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.monthly.actual, 'actual')}`}>{row.monthly.actual}%</td>
                                            <td className={`py-1.5 px-2 ${getCellColor(row.monthly.achv, 'achv')}`}>{row.monthly.achv}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 2: BREAKDOWN TYPE BD & DOWN STATUS (Gambar 2)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'breakdown') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="bg-[#ff0000] text-white px-5 py-2.5 font-black text-sm tracking-wider uppercase flex items-center justify-between shadow-sm">
                            <span className="flex items-center gap-2">
                                <span className="text-lg">🚜</span>
                                <span>{breakdownSummary?.equipment_title || 'EXCAVATOR'}</span>
                            </span>
                            <span className="text-xs text-red-100 font-bold">
                                TOTAL DOWNTIME: {breakdownSummary?.type_bd?.total_hrs || 337} HRS
                            </span>
                        </div>

                        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
                            {/* Left: TYPE BD Table + Pie Chart */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    RINCIAN TYPE BD (BREAKDOWN SCHEDULE & UNSCHEDULE)
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-[#8cb4d2] text-slate-900 font-black border-b border-slate-300">
                                                    <th className="py-2 px-3 text-left">{breakdownSummary?.equipment_title || 'EXCAVATOR'}</th>
                                                    <th className="py-2 px-3 text-center w-20">HRS</th>
                                                    <th className="py-2 px-3 text-center w-20">PERSEN</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                                                {breakdownSummary?.type_bd?.items?.map((item) => (
                                                    <tr key={item.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="py-2 px-3">{item.label}</td>
                                                        <td className="py-2 px-3 text-center font-bold font-mono">{item.hrs}</td>
                                                        <td className="py-2 px-3 text-center font-bold font-mono">{item.pct}%</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                                    <td className="py-2 px-3">Total down</td>
                                                    <td className="py-2 px-3 text-center font-mono">{breakdownSummary?.type_bd?.total_hrs}</td>
                                                    <td className="py-2 px-3 text-center font-mono">{breakdownSummary?.type_bd?.total_pct}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-2">
                                        <div className="text-center font-black text-xs text-slate-700 dark:text-slate-300 mb-1">
                                            TYPE BD
                                        </div>
                                        <div className="w-full h-48 relative">
                                            <TypeBdPieChart items={breakdownSummary?.type_bd?.items} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: DOWN STATUS Table + Pie Chart */}
                            <div className="space-y-4 pt-6 lg:pt-0 lg:pl-8">
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    RINCIAN DOWN STATUS (B0 - B8 STATUS KERUSAKAN)
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-[#8cb4d2] text-slate-900 font-black border-b border-slate-300">
                                                    <th className="py-2 px-3 text-left" colSpan="2">DOWN STATUS</th>
                                                    <th className="py-2 px-2 text-center w-14">HRS</th>
                                                    <th className="py-2 px-2 text-center w-14">PERSEN</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                                                {breakdownSummary?.down_status?.items?.map((item) => (
                                                    <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="py-1.5 px-2 font-mono font-bold text-slate-900 dark:text-white w-8">{item.code}</td>
                                                        <td className="py-1.5 px-1 truncate">{item.label}</td>
                                                        <td className="py-1.5 px-2 text-center font-mono font-bold">{item.hrs}</td>
                                                        <td className="py-1.5 px-2 text-center font-mono font-bold">{item.pct}%</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                                    <td className="py-2 px-3" colSpan="2">Total down time</td>
                                                    <td className="py-2 px-2 text-center font-mono">{breakdownSummary?.down_status?.total_hrs}</td>
                                                    <td className="py-2 px-2 text-center font-mono">{breakdownSummary?.down_status?.total_pct}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-2">
                                        <div className="text-center font-black text-xs text-slate-700 dark:text-slate-300 mb-1">
                                            DOWN STATUS
                                        </div>
                                        <div className="w-full h-48 relative">
                                            <DownStatusPieChart items={breakdownSummary?.down_status?.items} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 3: GRAFIK MTBF BULLDOZER (Gambar 3)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'mtbf_mttr') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="p-1 rounded bg-amber-500 text-white"><TrendingUp className="w-3.5 h-3.5" /></span>
                                    {mtbfBulldozer?.title || 'MTBF BULLDOZER'}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Mean Time Between Failures per Unit Bulldozer dengan Garis Batas Target (80 Jam)
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-xs bg-[#eab308]"></span>
                                    <span className="text-slate-700 dark:text-slate-300">ACTUAL</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                                    <span className="text-rose-600 dark:text-rose-400">TARGET (80)</span>
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-72">
                            <MtbfBulldozerChart data={mtbfBulldozer} />
                        </div>

                        <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-center border-collapse text-xs font-mono select-none">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700">
                                        <th className="py-1.5 px-3 text-left w-24 sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700">UNIT</th>
                                        {mtbfBulldozer?.items?.map(it => (
                                            <th key={it.unit} className="py-1.5 px-2 min-w-[58px] border-r border-slate-200 dark:border-slate-700 text-[11px]">
                                                {it.unit}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-bold">
                                    <tr className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20">
                                        <td className="py-1.5 px-3 text-left font-black text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                                            ACTUAL
                                        </td>
                                        {mtbfBulldozer?.items?.map(it => (
                                            <td key={it.unit} className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                                                {it.actual}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="bg-rose-50/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400">
                                        <td className="py-1.5 px-3 text-left font-black sticky left-0 z-10 bg-rose-50/50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                                            TARGET
                                        </td>
                                        {mtbfBulldozer?.items?.map(it => (
                                            <td key={it.unit} className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 font-black">
                                                {it.target}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 4: GRAFIK MTTR BULLDOZER (Gambar 4)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'mtbf_mttr') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="p-1 rounded bg-amber-500 text-white"><Wrench className="w-3.5 h-3.5" /></span>
                                    {mttrBulldozer?.title || 'MTTR BULLDOZER'}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Mean Time To Repair per Unit Bulldozer dengan Garis Batas Target Maksimum (15 Jam)
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-xs bg-[#eab308]"></span>
                                    <span className="text-slate-700 dark:text-slate-300">ACTUAL</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                                    <span className="text-rose-600 dark:text-rose-400">TARGET (15)</span>
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-72">
                            <MttrBulldozerChart data={mttrBulldozer} />
                        </div>

                        <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-center border-collapse text-xs font-mono select-none">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700">
                                        <th className="py-1.5 px-3 text-left w-24 sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700">UNIT</th>
                                        {mttrBulldozer?.items?.map(it => (
                                            <th key={it.unit} className="py-1.5 px-1.5 min-w-[50px] border-r border-slate-200 dark:border-slate-700 text-[10px]">
                                                {it.unit}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-bold text-[11px]">
                                    <tr className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20">
                                        <td className="py-1.5 px-3 text-left font-black text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                                            ACTUAL
                                        </td>
                                        {mttrBulldozer?.items?.map(it => (
                                            <td key={it.unit} className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                                                {it.actual}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="bg-rose-50/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400">
                                        <td className="py-1.5 px-3 text-left font-black sticky left-0 z-10 bg-rose-50/50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                                            TARGET
                                        </td>
                                        {mttrBulldozer?.items?.map(it => (
                                            <td key={it.unit} className="py-1.5 px-1.5 border-r border-slate-200 dark:border-slate-700 font-black">
                                                {it.target}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 5: GRAFIK PARETO DURASI KOMPONEN EXCAVATOR (Gambar 5 Awal)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'pareto_duration') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="p-1 rounded bg-[#eab308] text-slate-950"><BarChart3 className="w-3.5 h-3.5" /></span>
                                    {paretoDuration?.title || 'Pareto Excavator Big Digger Pareto berdasarkan duration'}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Analisis durasi downtime breakdown berdasarkan 39 kelompok komponen unit Excavator Big Digger (Satuan: Jam)
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Urutan:</span>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                                    <button
                                        onClick={() => setParetoDurationSort('original')}
                                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                            paretoDurationSort === 'original'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Sesuai Gambar
                                    </button>
                                    <button
                                        onClick={() => setParetoDurationSort('desc')}
                                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                            paretoDurationSort === 'desc'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Durasi Terbesar (Pareto)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Total Komponen</div>
                                <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">39 Komponen</div>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Top 1: Undercarriage</div>
                                <div className="text-lg font-black text-rose-900 dark:text-rose-200 mt-0.5">1,833 Jam (33.8%)</div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Top 2: Electric System</div>
                                <div className="text-lg font-black text-blue-900 dark:text-blue-200 mt-0.5">596 Jam (11.0%)</div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Top 3: Tyre</div>
                                <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-0.5">439 Jam (8.1%)</div>
                            </div>
                        </div>

                        <div className="w-full h-80 pt-2">
                            <ParetoComponentChart 
                                items={paretoDuration?.items} 
                                sortMode={paretoDurationSort} 
                                valueKey="duration"
                                legendLabel="Pareto Excavator Big Digger Pareto berdasarkan duration"
                                yMax={2000}
                                stepSize={200}
                                unitLabel="Jam"
                            />
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 6: GRAFIK PARETO BERDASARKAN EVENT (Gambar Tambahan 1)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'pareto_event') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="p-1 rounded bg-[#eab308] text-slate-950"><BarChart3 className="w-3.5 h-3.5" /></span>
                                    {paretoEvent?.title || 'Pareto berdasarkan Event Excavator Big Digger'}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Frekuensi kejadian kerusakan (Event) breakdown per komponen Excavator Big Digger (44 Komponen)
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Urutan:</span>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                                    <button
                                        onClick={() => setParetoEventSort('original')}
                                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                            paretoEventSort === 'original'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Sesuai Gambar
                                    </button>
                                    <button
                                        onClick={() => setParetoEventSort('desc')}
                                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                            paretoEventSort === 'desc'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Event Terbanyak (Pareto)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Event Stats Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Top 1: Greasing</div>
                                <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">314 Events</div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Top 2: Hoses</div>
                                <div className="text-lg font-black text-blue-900 dark:text-blue-200 mt-0.5">106 Events</div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Top 3: Level Oil/Coolant</div>
                                <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-0.5">106 Events</div>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase">Top 4: Maintenance/Service</div>
                                <div className="text-lg font-black text-purple-900 dark:text-purple-200 mt-0.5">74 Events</div>
                            </div>
                        </div>

                        {/* Event Bar Chart (44 Categories, Max 350) */}
                        <div className="w-full h-80 pt-2">
                            <ParetoComponentChart 
                                items={paretoEvent?.items} 
                                sortMode={paretoEventSort} 
                                valueKey="events"
                                legendLabel="Pareto berdasarkan Event Excavator Big Digger"
                                yMax={350}
                                stepSize={50}
                                unitLabel="Event"
                            />
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════════
                    MODUL 7: KLASIFIKASI UNIT BREAKDOWN EXCAVATOR (Gambar Tambahan 2)
                ══════════════════════════════════════════════════════════════════════ */}
                {(activeTab === 'all' || activeTab === 'klasifikasi') && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                        {/* Title Banner Matching Image 2 */}
                        <div className="border border-slate-900 dark:border-slate-300 py-2.5 px-4 text-center bg-white dark:bg-slate-900 shadow-xs">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                {klasifikasiBreakdown?.title || 'Klasifikasi Unit Breakdown Excavator Big Digger'}
                            </h2>
                        </div>

                        {/* Toolbar Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari problem / tindakan..."
                                        value={searchKlasifikasi}
                                        onChange={(e) => setSearchKlasifikasi(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-56 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs">
                                    <span className="font-bold text-slate-500 dark:text-slate-400">Unit:</span>
                                    <select
                                        value={filterUnit}
                                        onChange={(e) => setFilterUnit(e.target.value)}
                                        className="bg-transparent border-0 p-0 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="ALL">Semua Unit (ME)</option>
                                        <option value="ME049">ME049 (CAT 374)</option>
                                        <option value="ME055">ME055 (CAT 374)</option>
                                        <option value="ME056">ME056 (CAT 374)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Baris Breakdown</span>
                            </button>
                        </div>

                        {/* Excel-Style Table Matching Image 2 */}
                        <div className="overflow-x-auto border-2 border-slate-900 dark:border-slate-600">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    {/* Header Sage / Light Olive Green */}
                                    <tr className="bg-[#b6caa0] dark:bg-[#3d4b31] text-slate-950 dark:text-slate-100 font-black border-b-2 border-slate-900 dark:border-slate-600 divide-x-2 divide-slate-900 dark:divide-slate-600 uppercase text-center tracking-wider">
                                        <th className="py-2.5 px-3 w-16">NO</th>
                                        <th className="py-2.5 px-4 w-28">UNIT</th>
                                        <th className="py-2.5 px-5 min-w-[240px]">PROBLEM</th>
                                        <th className="py-2.5 px-5 min-w-[240px]">ACTION</th>
                                        <th className="py-2.5 px-4 w-32">DOWNTIME</th>
                                        <th className="py-2.5 px-4 w-36">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900 dark:divide-slate-600 font-medium">
                                    {filteredKlasifikasi.length > 0 ? (
                                        filteredKlasifikasi.map((row, idx) => (
                                            <tr 
                                                key={row.no || idx} 
                                                className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 transition-colors divide-x divide-slate-900 dark:divide-slate-600 align-top"
                                            >
                                                <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-black font-mono text-slate-900 dark:text-white">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                                                        {row.unit}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-5 text-slate-800 dark:text-slate-200">
                                                    {row.problem}
                                                </td>
                                                <td className="py-2.5 px-5 text-slate-700 dark:text-slate-300">
                                                    {row.action}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-bold font-mono text-rose-600 dark:text-rose-400">
                                                    {row.downtime}
                                                </td>
                                                <td className="py-2.5 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                        row.status === 'COMPLETED'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                                Tidak ada data breakdown yang cocok dengan pencarian / filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <span>Menampilkan <strong>{filteredKlasifikasi.length}</strong> catatan unit breakdown</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Format: Klasifikasi Excavator Big Digger</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah Baris Breakdown */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                Tambah Baris Klasifikasi Breakdown
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddKlasifikasi} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    No Unit
                                </label>
                                <select
                                    value={newRow.unit}
                                    onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                                >
                                    <option value="ME049">ME049 (CAT 374)</option>
                                    <option value="ME055">ME055 (CAT 374)</option>
                                    <option value="ME056">ME056 (CAT 374)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Problem / Kerusakan *
                                </label>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder="Uraikan problem kerusakan..."
                                    value={newRow.problem}
                                    onChange={(e) => setNewRow({ ...newRow, problem: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Action / Tindakan Perbaikan
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Uraikan tindakan perbaikan mekanik..."
                                    value={newRow.action}
                                    onChange={(e) => setNewRow({ ...newRow, action: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Downtime (Jam)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Contoh: 3.5"
                                        value={newRow.downtime}
                                        onChange={(e) => setNewRow({ ...newRow, downtime: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={newRow.status}
                                        onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                                    >
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="ON PROGRESS">ON PROGRESS</option>
                                        <option value="WAITING PARTS">WAITING PARTS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                >
                                    Simpan Baris
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. Type BD Pie Chart
function TypeBdPieChart({ items = [] }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || items.length === 0) return;
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) chartInstance.destroy();

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const colors = [
            '#2b7bb9', // B/D schedule: blue
            '#b83c2a', // B/D unschedule: reddish brown
            '#34a853', // Accident: green
        ];

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: items.map(i => `${i.label} (${i.pct}%)`),
                datasets: [{
                    data: items.map(i => i.hrs),
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 1.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { size: 10, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.label}: ${c.raw} Jam`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [items]);

    return <canvas ref={canvasRef} />;
}

// 2. Down Status Pie Chart
function DownStatusPieChart({ items = [] }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || items.length === 0) return;
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) chartInstance.destroy();

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const palette = [
            '#2563eb', // B0 On progress: blue
            '#b91c1c', // B1 Waiting parts: red/brown
            '#16a34a', // B2 Waiting sarana
            '#7c3aed', // B3 Waiting tools
            '#0891b2', // B4 Waiting Man power
            '#d97706', // B5 Outside /Dealler: amber
            '#64748b', // B6 Production/ abuse
            '#4b5563', // B7 W/decision Plant
            '#1f2937', // B8 W/decision HO
        ];

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: items.map(i => `${i.code} ${i.label} (${i.pct}%)`),
                datasets: [{
                    data: items.map(i => i.hrs),
                    backgroundColor: palette,
                    borderColor: '#ffffff',
                    borderWidth: 1.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 9,
                            font: { size: 9 },
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.label}: ${c.raw} Jam`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [items]);

    return <canvas ref={canvasRef} />;
}

// 3. MTBF Bulldozer Chart (Bar + Line)
function MtbfBulldozerChart({ data }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data?.items) return;
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) chartInstance.destroy();

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = data.items.map(i => i.unit);
        const actuals = data.items.map(i => i.actual);
        const targets = data.items.map(i => i.target);

        const chart = new Chart(ctx, {
            data: {
                labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'TARGET',
                        data: targets,
                        borderColor: '#dc2626',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        fill: false,
                        order: 1,
                    },
                    {
                        type: 'bar',
                        label: 'ACTUAL',
                        data: actuals,
                        backgroundColor: '#eab308',
                        borderColor: '#ca8a04',
                        borderWidth: 1,
                        borderRadius: 3,
                        order: 2,
                    }
                ]
            },
            plugins: [barValueLabelsPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 25, bottom: 5, left: 10, right: 10 }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 500,
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        },
                        ticks: {
                            stepSize: 100,
                            font: { size: 10 },
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ${c.raw}`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [data]);

    return <canvas ref={canvasRef} />;
}

// 4. MTTR Bulldozer Chart (Bar + Line)
function MttrBulldozerChart({ data }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data?.items) return;
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) chartInstance.destroy();

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = data.items.map(i => i.unit);
        const actuals = data.items.map(i => i.actual);
        const targets = data.items.map(i => i.target);

        const chart = new Chart(ctx, {
            data: {
                labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'TARGET',
                        data: targets,
                        borderColor: '#dc2626',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        fill: false,
                        order: 1,
                    },
                    {
                        type: 'bar',
                        label: 'ACTUAL',
                        data: actuals,
                        backgroundColor: '#eab308',
                        borderColor: '#ca8a04',
                        borderWidth: 1,
                        borderRadius: 3,
                        order: 2,
                    }
                ]
            },
            plugins: [barValueLabelsPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 25, bottom: 5, left: 5, right: 5 }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 9, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 800,
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        },
                        ticks: {
                            stepSize: 100,
                            font: { size: 10 },
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ${c.raw}`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [data]);

    return <canvas ref={canvasRef} />;
}

// 5 & 6. Reusable Pareto Component Chart (Duration / Event)
function ParetoComponentChart({ 
    items = [], 
    sortMode = 'original', 
    valueKey = 'duration',
    legendLabel = '',
    yMax = 2000,
    stepSize = 200,
    unitLabel = 'Jam'
}) {
    const canvasRef = useRef(null);

    const sortedItems = useMemo(() => {
        if (!items) return [];
        const copy = [...items];
        if (sortMode === 'desc') {
            copy.sort((a, b) => b[valueKey] - a[valueKey]);
        }
        return copy;
    }, [items, sortMode, valueKey]);

    useEffect(() => {
        if (!canvasRef.current || sortedItems.length === 0) return;
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) chartInstance.destroy();

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = sortedItems.map(i => i.component);
        const values = sortedItems.map(i => i[valueKey]);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: legendLabel,
                        data: values,
                        backgroundColor: '#eab308',
                        borderColor: '#ca8a04',
                        borderWidth: 1,
                        borderRadius: 3,
                    }
                ]
            },
            plugins: [barValueLabelsPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 25, bottom: 20, left: 10, right: 10 }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 9, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#1e293b',
                            maxRotation: 55,
                            minRotation: 45,
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: yMax,
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        },
                        ticks: {
                            stepSize: stepSize,
                            font: { size: 10 },
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: { size: 11, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#1e293b'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ${c.raw} ${unitLabel}`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [sortedItems, legendLabel, yMax, stepSize, unitLabel, valueKey]);

    return <canvas ref={canvasRef} />;
}
