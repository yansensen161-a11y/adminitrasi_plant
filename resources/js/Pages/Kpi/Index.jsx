import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n) => Number(n || 0).toLocaleString('en-US');
const pct  = (part, total) => Number(total) > 0 ? ((Number(part || 0) / Number(total)) * 100).toFixed(1) : '0.0';

// ── Small sparkline-style trend badge ────────────────────────────────────────
function Trend({ value = 0, label = 'vs Last Month' }) {
    const num   = Number(value) || 0;
    const isUp  = num > 0;
    const isNeg = num < 0;
    const color = isUp ? 'text-red-500' : isNeg ? 'text-emerald-500' : 'text-gray-400';
    const arrow = isUp ? '▲' : isNeg ? '▼' : '─';
    return (
        <div className={`flex items-center gap-1 text-sm font-bold mt-1 ${color}`}>
            <span>{arrow}</span>
            <span>{Math.abs(num)}%</span>
            <span className="text-gray-400 font-normal text-xs">{label}</span>
        </div>
    );
}

// ── Donut chart hook ──────────────────────────────────────────────────────────
function useDonut(canvasRef, data) {
    useEffect(() => {
        if (!canvasRef.current || !data) return;
        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        let chart;
        try {
            chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Running', 'Standby', 'Breakdown', 'Maintenance'],
                    datasets: [{
                        data: [
                            Number(data?.running) || 0,
                            Number(data?.standby) || 0,
                            Number(data?.breakdown) || 0,
                            Number(data?.maintenance) || 0,
                        ],
                        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#a855f7'],
                        borderWidth: 0,
                        hoverOffset: 6,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}` } },
                    },
                },
            });
        } catch (e) {
            console.error('Error creating Donut chart:', e);
        }
        return () => {
            if (chart) chart.destroy();
        };
    }, [data?.running, data?.standby, data?.breakdown, data?.maintenance]);
}

function useBarChart(canvasRef, labels = [], datasets = []) {
    useEffect(() => {
        if (!canvasRef.current) return;
        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        let chart;
        try {
            chart = new Chart(ctx, {
                type: 'bar',
                data: { labels: labels || [], datasets: datasets || [] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 9 } } },
                    },
                },
            });
        } catch (e) {
            console.error('Error creating Bar chart:', e);
        }
        return () => {
            if (chart) chart.destroy();
        };
    }, [JSON.stringify(labels), JSON.stringify(datasets)]);
}

function useLineChart(canvasRef, labels = [], datasets = []) {
    useEffect(() => {
        if (!canvasRef.current) return;
        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        let chart;
        try {
            chart = new Chart(ctx, {
                type: 'bar',
                data: { labels: labels || [], datasets: datasets || [] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 9 } } },
                    },
                },
            });
        } catch (e) {
            console.error('Error creating Line chart:', e);
        }
        return () => {
            if (chart) chart.destroy();
        };
    }, [JSON.stringify(labels), JSON.stringify(datasets)]);
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('KPI Page Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-700 rounded-xl m-6 border border-red-200">
                    <h2 className="text-lg font-bold mb-2">Terjadi Kesalahan di Halaman KPI:</h2>
                    <pre className="text-sm bg-white p-4 rounded border border-red-100 overflow-auto whitespace-pre-wrap">
                        {this.state.error?.toString()}
                        {'\n\n'}
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
function KpiContent({
    dateFrom = '',
    dateTo = '',
    site = 'all',
    unitType = 'all',
    unitStatus = { total: 0, running: 0, standby: 0, breakdown: 0, maintenance: 0 },
    metrics = { pa: 0, mttr: 0, mtbf: 0, woCompletionRate: 0, totalWo: 0, unplannedWoCount: 0, plannedWoCount: 0 },
    woChart = { labels: [], data: [] },
    downtimeChart = { labels: [], breakdown: [], maintenance: [] },
    breakdownByComponent = [],
}) {
    const safeUnitStatus = unitStatus || { total: 0, running: 0, standby: 0, breakdown: 0, maintenance: 0 };
    const safeMetrics = metrics || { pa: 0, mttr: 0, mtbf: 0, woCompletionRate: 0, totalWo: 0, unplannedWoCount: 0, plannedWoCount: 0 };
    const safeWoChart = woChart || { labels: [], data: [] };
    const safeDowntimeChart = downtimeChart || { labels: [], breakdown: [], maintenance: [] };
    const safeBreakdownByComponent = Array.isArray(breakdownByComponent) ? breakdownByComponent : [];

    // ── Filter state ──────────────────────────────────────────────────────
    const [fDateFrom, setFDateFrom] = useState(dateFrom || '');
    const [fDateTo,   setFDateTo]   = useState(dateTo || '');
    const [fSite,     setFSite]     = useState(site || 'all');
    const [fUnitType, setFUnitType] = useState(unitType || 'all');

    const applyFilter = () => {
        router.get('/kpi', { date_from: fDateFrom, date_to: fDateTo, site: fSite, unit_type: fUnitType }, { preserveState: true });
    };

    // ── Chart refs ────────────────────────────────────────────────────────
    const donutRef   = useRef(null);
    const woRef      = useRef(null);
    const dtRef      = useRef(null);
    const costRef    = useRef(null);

    const total = safeUnitStatus.total || 0;

    useDonut(donutRef, safeUnitStatus);

    const woDatasets = useMemo(() => [{
        label: 'WO Count',
        data: safeWoChart.data || [],
        backgroundColor: ['#3b82f6','#ef4444','#f59e0b','#6366f1','#10b981','#8b5cf6','#6b7280'],
        borderRadius: 3,
        barPercentage: 0.7,
    }], [safeWoChart.data]);
    useBarChart(woRef, safeWoChart.labels || [], woDatasets);

    const dtDatasets = useMemo(() => [
        { label: 'Breakdown',    data: safeDowntimeChart.breakdown || [],   backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 2, barPercentage: 0.4 },
        { label: 'Maintenance',  data: safeDowntimeChart.maintenance || [], backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 2, barPercentage: 0.4 },
    ], [safeDowntimeChart.breakdown, safeDowntimeChart.maintenance]);
    useLineChart(dtRef, safeDowntimeChart.labels || [], dtDatasets);

    useLineChart(dtRef, safeDowntimeChart.labels || [], dtDatasets);

    // ── Format date display ───────────────────────────────────────────────
    const fmtDisplayDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Key Performance Index" />

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-800">Key Performance Index</h1>
                        <nav className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                            <Link href="/dashboard" className="hover:text-gray-600">Home</Link>
                            <span>›</span>
                            <span className="text-gray-600">Key Performance Index</span>
                        </nav>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                        <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} className="border-none outline-none text-sm bg-transparent w-28" style={{colorScheme:'light'}} />
                        <span className="text-gray-400">-</span>
                        <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} className="border-none outline-none text-sm bg-transparent w-28" style={{colorScheme:'light'}} />
                    </div>
                    <select value={fSite} onChange={e => setFSite(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none">
                        <option value="all">All Site</option>
                        <option value="pit1">Pit 1</option>
                        <option value="pit2">Pit 2</option>
                    </select>
                    <select value={fUnitType} onChange={e => setFUnitType(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none">
                        <option value="all">All Unit Type</option>
                        <option value="excavator">Excavator</option>
                        <option value="hauler">Hauler</option>
                        <option value="dozer">Dozer</option>
                    </select>
                    <button onClick={applyFilter} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                        Apply
                    </button>
                </div>
            </div>

            {/* ── ROW 1: Fleet Status Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {/* Total Unit */}
                <div className="col-span-2 sm:col-span-1 rounded-xl p-4 flex items-center gap-3 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d6bdc 0%, #1a56c4 100%)' }}>
                    <div className="absolute -right-3 -bottom-4 opacity-20">
                        <svg className="w-20 h-20 fill-white" viewBox="0 0 24 24"><path d="M18 4h-2.18C15.4 1.84 14.3 1 13 1H11C9.7 1 8.6 1.84 8.18 4H6C4.9 4 4 4.9 4 6v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M20.93 12.64C21 12.11 21 11.56 21 11c0-5.52-4.48-10-10-10S1 5.48 1 11c0 2.13.67 4.09 1.8 5.71L2 22l5.45-.55C8.73 21.79 10 22 11 22c5.52 0 10-4.48 10-10 0-.46-.02-.91-.07-1.36z"/></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Total Unit</div>
                        <div className="text-4xl font-black leading-none">{safeUnitStatus.total}</div>
                        <div className="text-sm text-blue-200 mt-0.5">Unit</div>
                    </div>
                </div>

                {/* Running */}
                <div className="rounded-xl p-4 flex items-center gap-3 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                    <div className="absolute -right-2 -bottom-3 opacity-20">
                        <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-green-100 uppercase">Running</div>
                        <div className="text-3xl font-black leading-none">{safeUnitStatus.running}</div>
                        <div className="text-sm text-green-200">Unit ({pct(safeUnitStatus.running, total)}%)</div>
                    </div>
                </div>

                {/* Standby */}
                <div className="rounded-xl p-4 flex items-center gap-3 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
                    <div className="absolute -right-2 -bottom-3 opacity-20">
                        <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-amber-100 uppercase">Standby</div>
                        <div className="text-3xl font-black leading-none">{safeUnitStatus.standby}</div>
                        <div className="text-sm text-amber-200">Unit ({pct(safeUnitStatus.standby, total)}%)</div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="rounded-xl p-4 flex items-center gap-3 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
                    <div className="absolute -right-2 -bottom-3 opacity-20">
                        <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-red-100 uppercase">Breakdown</div>
                        <div className="text-3xl font-black leading-none">{safeUnitStatus.breakdown}</div>
                        <div className="text-sm text-red-200">Unit ({pct(safeUnitStatus.breakdown, total)}%)</div>
                    </div>
                </div>

                {/* Under Maintenance */}
                <div className="rounded-xl p-4 flex items-center gap-3 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                    <div className="absolute -right-2 -bottom-3 opacity-20">
                        <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-purple-100 uppercase">Under Maintenance</div>
                        <div className="text-3xl font-black leading-none">{safeUnitStatus.maintenance}</div>
                        <div className="text-sm text-purple-200">Unit ({pct(safeUnitStatus.maintenance, total)}%)</div>
                    </div>
                </div>
            </div>

            {/* ── ROW 2: KPI Metrics ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {/* Physical Availability (PA) */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50/80 flex items-center justify-center shrink-0 border border-blue-100">
                            <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.28-10.43zM10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Physical Avail.</div>
                            <div className="text-2xl font-black text-gray-800 leading-tight">{safeMetrics.pa}%</div>
                            <div className="text-xs text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Target ≥ 85%</div>
                        </div>
                    </div>
                </div>

                {/* Unplanned vs Total WO */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50/80 flex items-center justify-center shrink-0 border border-orange-100">
                            <svg className="w-5 h-5 fill-orange-500" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Unplanned WO</div>
                            <div className="text-2xl font-black text-gray-800 leading-tight">{safeMetrics.unplannedWoCount} <span className="text-sm font-semibold text-gray-400">/ {safeMetrics.totalWo}</span></div>
                            <div className="text-xs text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-0.5 rounded-full inline-block">BD & CM</div>
                        </div>
                    </div>
                </div>

                {/* MTTR */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-50/80 flex items-center justify-center shrink-0 border border-sky-100">
                            <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">MTTR</div>
                            <div className="text-2xl font-black text-gray-800 leading-tight">{safeMetrics.mttr} <span className="text-sm font-semibold text-gray-400">Hrs</span></div>
                            <div className="text-xs text-sky-600 font-bold mt-1 bg-sky-50 px-2 py-0.5 rounded-full inline-block">Avg Repair Time</div>
                        </div>
                    </div>
                </div>

                {/* MTBF */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50/80 flex items-center justify-center shrink-0 border border-emerald-100">
                            <svg className="w-5 h-5 fill-emerald-500" viewBox="0 0 24 24"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">MTBF</div>
                            <div className="text-2xl font-black text-gray-800 leading-tight">{safeMetrics.mtbf} <span className="text-sm font-semibold text-gray-400">Hrs</span></div>
                            <div className="text-xs text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Avg Time Btw Fails</div>
                        </div>
                    </div>
                </div>

                {/* WO Completion Rate */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50/80 flex items-center justify-center shrink-0 border border-purple-100">
                            <svg className="w-5 h-5 fill-purple-500" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">WO Completion</div>
                            <div className="text-2xl font-black text-gray-800 leading-tight">{safeMetrics.woCompletionRate}%</div>
                            <div className="text-xs text-purple-600 font-bold mt-1 bg-purple-50 px-2 py-0.5 rounded-full inline-block">Closed WOs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 3: Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Unit Status Donut */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-extrabold text-gray-700 mb-4 tracking-wide">UNIT STATUS</h2>
                    <div className="flex items-center gap-4">
                        {/* Donut */}
                        <div className="relative" style={{ width: 160, height: 160, flexShrink: 0 }}>
                            <canvas ref={donutRef} width={160} height={160} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-gray-800">{safeUnitStatus.total}</span>
                                <span className="text-xs font-bold text-gray-400">Total Unit</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-col gap-2 text-sm w-full">
                            {[
                                { label: 'Running',     val: safeUnitStatus.running,     color: '#22c55e' },
                                { label: 'Standby',     val: safeUnitStatus.standby,     color: '#f59e0b' },
                                { label: 'Breakdown',   val: safeUnitStatus.breakdown,   color: '#ef4444' },
                                { label: 'Maintenance', val: safeUnitStatus.maintenance, color: '#a855f7' },
                            ].map(({ label, val, color }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
                                    <span className="text-gray-600 font-semibold">{label}</span>
                                    <span className="ml-auto text-gray-800 font-black">{val} <span className="text-xs font-medium text-gray-400">({pct(val, total)}%)</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* WO by Type */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-extrabold text-gray-700 mb-4 tracking-wide">WORK ORDER BY TYPE</h2>
                    <div style={{ height: 170 }}>
                        <canvas ref={woRef} />
                    </div>
                </div>

                {/* Downtime Hours */}
                <div className="glass-panel rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-extrabold text-gray-700 mb-4 tracking-wide">DOWNTIME TREND (HOURS)</h2>
                    <div style={{ height: 170 }}>
                        <canvas ref={dtRef} />
                    </div>
                </div>
            </div>

            {/* ── ROW 4: Tables ── */}
            <div className="grid grid-cols-1 gap-4">
                {/* Top 5 Breakdown by Component */}
                <div className="glass-panel rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-sm font-extrabold text-gray-700 mb-4 tracking-wide">TOP 5 BREAKDOWN COMPONENT</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-2 text-gray-400 font-bold uppercase w-12">No</th>
                                    <th className="text-left py-2 text-gray-400 font-bold uppercase">Component</th>
                                    <th className="text-center py-2 text-gray-400 font-bold uppercase">Breakdown Count</th>
                                    <th className="text-center py-2 text-gray-400 font-bold uppercase">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeBreakdownByComponent.map((row, idx) => (
                                    <tr key={idx} className={`border-b border-gray-50/50 hover:bg-white/40 transition-colors ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                                        <td className="py-3 text-gray-400 font-bold">{row.no}</td>
                                        <td className="py-3 text-gray-800 font-extrabold">{row.component}</td>
                                        <td className="py-3 text-center">
                                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-black">{row.jumlah}</span>
                                        </td>
                                        <td className="py-3 text-center text-blue-600 font-black">{row.pct}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default function KpiIndex(props) {
    return (
        <ErrorBoundary>
            <KpiContent {...props} />
        </ErrorBoundary>
    );
}
