import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    Gauge, 
    Clock, 
    Wrench, 
    ShieldAlert, 
    Award, 
    SlidersHorizontal, 
    ArrowUpDown, 
    Search, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    Layers, 
    Info,
    ChevronDown,
    Activity
} from 'lucide-react';

// --- Chart Hook for Pie Chart ---
function usePieChart(canvasRef, data) {
    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;
        
        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        const colors = {
            'B0': '#a16207', // darker amber
            'B1': '#dc2626', // red
            'B2': '#2563eb', // blue
            'B3': '#16a34a', // green
            'B4': '#d946ef', // fuchsia
            'B5': '#eab308', // yellow
            'B6': '#7c3aed', // violet
            'B7': '#0891b2', // cyan
            'B8': '#ec4899', // pink
        };
        
        const chartData = {
            labels: data.map(d => `${d.type_bd} - ${d.description}`),
            datasets: [{
                data: data.map(d => d.pct),
                backgroundColor: data.map(d => colors[d.type_bd] || '#94a3b8'),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6,
            }]
        };

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        callbacks: {
                            label: (c) => ` ${c.label}: ${c.parsed}%`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [data]);
}

// --- Cell Components ---
const ValueCell = ({ value, isPercent = false, className = "" }) => (
    <td className={`px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right ${className}`}>
        {value === 0 || value === '0.0' ? '' : (isPercent ? `${value}%` : value)}
    </td>
);

const TargetCell = ({ value, target, isGreaterBetter = true, isPercent = false }) => {
    if (value === 0 || value === '0.0') return <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right"></td>;
    
    let isGood = false;
    if (isGreaterBetter) {
        isGood = Number(value) >= Number(target);
    } else {
        isGood = Number(value) <= Number(target);
    }
    
    const bgColor = isGood ? 'bg-emerald-200 dark:bg-emerald-900/50' : 'bg-red-200 dark:bg-red-900/50';
    const textColor = isGood ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200';
    
    return (
        <td className={`px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right ${bgColor} ${textColor} font-semibold`}>
            {isPercent ? `${value}%` : value}
        </td>
    );
};

// --- Top Fleet Highlights Strip ---
function KpiFleetHighlights({ highlights, typeTitle }) {
    if (!highlights || highlights.total_units === 0) return null;

    const isPaAchieved = highlights.avg_pa >= highlights.target_pa;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* 1. Rata-Rata PA Armada */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Rata-Rata PA Armada
                    </span>
                    <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {highlights.avg_pa}%
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isPaAchieved 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}>
                        {isPaAchieved ? '✓ Target Tercapai' : '▼ Di Bawah Target'}
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Target Plan PA: <strong className="text-gray-700 dark:text-gray-300">{highlights.target_pa}%</strong> ({highlights.total_units} Unit)
                </p>
            </div>

            {/* 2. Unit Performa Terbaik */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        Unit Terbaik (Top PA)
                    </span>
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {highlights.best_unit?.unit || '-'}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {highlights.best_unit?.pa}% PA
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Kesiapan fisik tertinggi pada kelompok ini
                </p>
            </div>

            {/* 3. Unit Perlu Perhatian */}
            <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                        Perlu Perhatian (Lowest PA)
                    </span>
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {highlights.worst_unit?.unit || '-'}
                    </span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {highlights.worst_unit?.pa}% PA
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Downtime: <strong className="text-rose-600 dark:text-rose-400">{highlights.worst_unit?.bd_hrs} Jam BD</strong>
                </p>
            </div>

            {/* 4. Akumulasi Downtime & MTBF */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        Akumulasi Downtime & MTBF
                    </span>
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {highlights.total_bd_hours} Jam
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total BD</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    MTBF: <strong className="text-gray-700 dark:text-gray-300">{highlights.avg_mtbf}h</strong>
                </p>
            </div>

            {/* 5. MTTR */}
            <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                        Rata-rata MTTR
                    </span>
                    <Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {highlights.avg_mttr}h
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Avg MTTR</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Mean Time To Repair
                </p>
            </div>
        </div>
    );
}

// --- Komponen Grafik Komparasi Per No Unit (Bar Chart Interaktif) ---
function UnitComparisonChart({ kpiTable, typeUnit }) {
    const canvasRef = useRef(null);
    const [selectedMetric, setSelectedMetric] = useState('pa'); // 'pa', 'mtbf', 'breakdown', 'ma', 'utilization'
    const [sortBy, setSortBy] = useState('default'); // 'default', 'pa_asc', 'pa_desc', 'bd_desc'
    const [searchQuery, setSearchQuery] = useState('');

    // Filter and sort units
    const processedUnits = useMemo(() => {
        if (!kpiTable) return [];
        let list = [...kpiTable];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(u => u.unit.toLowerCase().includes(q) || (u.model && u.model.toLowerCase().includes(q)));
        }

        if (sortBy === 'pa_asc') {
            list.sort((a, b) => a.pa_actual - b.pa_actual);
        } else if (sortBy === 'pa_desc') {
            list.sort((a, b) => b.pa_actual - a.pa_actual);
        } else if (sortBy === 'bd_desc') {
            list.sort((a, b) => b.bd_hrs - a.bd_hrs);
        }

        return list;
    }, [kpiTable, sortBy, searchQuery]);

    useEffect(() => {
        if (!canvasRef.current || processedUnits.length === 0) return;

        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = processedUnits.map(u => u.unit);
        let datasets = [];
        let yAxisLabel = '%';
        let yMax = 100;
        let showTargetLine = false;
        let targetLineVal = 90;

        if (selectedMetric === 'pa') {
            yAxisLabel = 'Persentase (%)';
            yMax = 105;
            showTargetLine = true;
            targetLineVal = 90;

            datasets = [
                {
                    label: 'PA Actual (%)',
                    data: processedUnits.map(u => u.pa_actual),
                    backgroundColor: processedUnits.map(u => {
                        if (u.pa_actual >= 90) return 'rgba(16, 185, 129, 0.85)';
                        if (u.pa_actual >= 80) return 'rgba(245, 158, 11, 0.85)';
                        return 'rgba(239, 68, 68, 0.85)';
                    }),
                    borderColor: processedUnits.map(u => {
                        if (u.pa_actual >= 90) return '#059669';
                        if (u.pa_actual >= 80) return '#d97706';
                        return '#dc2626';
                    }),
                    borderWidth: 1.5,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.55,
                    categoryPercentage: 0.85,
                    valueSuffix: '%',
                    yAxisID: 'y',
                },
                {
                    label: 'Target PA (%)',
                    data: processedUnits.map(u => u.plan_pa),
                    backgroundColor: 'rgba(99, 102, 241, 0.75)',
                    borderColor: '#4f46e5',
                    borderWidth: 1.5,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.55,
                    categoryPercentage: 0.85,
                    valueSuffix: '%',
                    yAxisID: 'y',
                },
                {
                    label: 'MTBF (Jam)',
                    data: processedUnits.map(u => u.mtbf),
                    backgroundColor: 'rgba(16, 185, 129, 0.60)',
                    borderColor: '#059669',
                    borderWidth: 1,
                    borderRadius: { topLeft: 4, topRight: 4 },
                    barPercentage: 0.55,
                    categoryPercentage: 0.85,
                    valueSuffix: 'h',
                    yAxisID: 'y2',
                },
                {
                    label: 'MTTR (Jam)',
                    data: processedUnits.map(u => u.mttr),
                    backgroundColor: 'rgba(244, 63, 94, 0.75)',
                    borderColor: '#e11d48',
                    borderWidth: 1,
                    borderRadius: { topLeft: 4, topRight: 4 },
                    barPercentage: 0.55,
                    categoryPercentage: 0.85,
                    valueSuffix: 'h',
                    yAxisID: 'y2',
                },
            ];
            yMax = 105;
        } else if (selectedMetric === 'mtbf') {
            yAxisLabel = 'Jam (Hours)';
            const maxMtbf = Math.max(...processedUnits.map(u => u.mtbf), 50);
            yMax = Math.ceil(maxMtbf * 1.15);

            datasets = [
                {
                    label: 'MTBF (Jam)',
                    data: processedUnits.map(u => u.mtbf),
                    backgroundColor: 'rgba(99, 102, 241, 0.85)',
                    borderColor: '#4f46e5',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    valueSuffix: 'h',
                }
            ];
        } else if (selectedMetric === 'mttr') {
            yAxisLabel = 'Jam (Hours)';
            const maxMttr = Math.max(...processedUnits.map(u => u.mttr), 10);
            yMax = Math.ceil(maxMttr * 1.25);

            datasets = [
                {
                    label: 'MTTR (Jam)',
                    data: processedUnits.map(u => u.mttr),
                    backgroundColor: 'rgba(244, 63, 94, 0.85)',
                    borderColor: '#e11d48',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    valueSuffix: 'h',
                }
            ];
        } else if (selectedMetric === 'breakdown') {
            yAxisLabel = 'Durasi BD (Jam)';
            const maxBd = Math.max(...processedUnits.map(u => u.bd_hrs), 10);
            yMax = Math.ceil(maxBd * 1.2);

            datasets = [
                {
                    label: 'Jam Breakdown (BD)',
                    data: processedUnits.map(u => u.bd_hrs),
                    backgroundColor: processedUnits.map(u => u.bd_hrs > 50 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.85)'),
                    borderColor: processedUnits.map(u => u.bd_hrs > 50 ? '#dc2626' : '#d97706'),
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    valueSuffix: ' Jam',
                }
            ];
        } else if (selectedMetric === 'ma') {
            yAxisLabel = 'Mechanical Availability (%)';
            yMax = 105;

            datasets = [
                {
                    label: 'MA Actual (%)',
                    data: processedUnits.map(u => u.ma),
                    backgroundColor: 'rgba(139, 92, 246, 0.85)',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    valueSuffix: '%',
                }
            ];
        } else if (selectedMetric === 'utilization') {
            yAxisLabel = 'Persentase (%)';
            yMax = 105;

            datasets = [
                {
                    label: 'UA (%) - Utilization of Availability',
                    data: processedUnits.map(u => u.ua),
                    backgroundColor: 'rgba(6, 182, 212, 0.85)',
                    borderColor: '#0891b2',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.7,
                    categoryPercentage: 0.75,
                    valueSuffix: '%',
                },
                {
                    label: 'EU (%) - Effective Utilization',
                    data: processedUnits.map(u => u.eu),
                    backgroundColor: 'rgba(236, 72, 153, 0.85)',
                    borderColor: '#db2777',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.7,
                    categoryPercentage: 0.75,
                    valueSuffix: '%',
                }
            ];
        }

        // Custom Plugin for drawing numerical values right on top of each bar
        const barValueLabelsPlugin = {
            id: 'barValueLabelsPlugin',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    if (dataset.skipDataLabels) return;
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (meta.hidden) return;

                    meta.data.forEach((bar, index) => {
                        const val = dataset.data[index];
                        if (val !== undefined && val !== null && val > 0) {
                            ctx.save();
                            ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155';
                            ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            const suffix = dataset.valueSuffix || '';
                            ctx.fillText(`${val}${suffix}`, bar.x, bar.y - 3);
                            ctx.restore();
                        }
                    });
                });
            }
        };

        // Custom Plugin for dashed Target line
        const targetLinePlugin = {
            id: 'targetLinePlugin',
            afterDraw(chart) {
                if (!showTargetLine) return;
                const yScale = chart.scales.y;
                const yPos = yScale.getPixelForValue(targetLineVal);
                if (yPos === undefined || isNaN(yPos)) return;

                const { ctx, chartArea: { left, right } } = chart;
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([6, 6]);
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.moveTo(left, yPos);
                ctx.lineTo(right, yPos);
                ctx.stroke();

                ctx.fillStyle = '#6366f1';
                ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`Target Benchmark: ${targetLineVal}%`, right - 4, yPos - 6);
                ctx.restore();
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets,
            },
            plugins: [barValueLabelsPlugin, targetLinePlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 25, bottom: 5, left: 10, right: 15 }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 11, weight: 'bold' },
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#1e293b',
                            maxRotation: 45,
                            minRotation: 0,
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: selectedMetric === 'pa' ? 105 : yMax,
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        },
                        ticks: {
                            font: { size: 10 },
                            color: '#94a3b8',
                            callback: (v) => `${v}${selectedMetric === 'pa' || selectedMetric === 'ma' || selectedMetric === 'utilization' ? '%' : 'h'}`
                        },
                        title: {
                            display: true,
                            text: selectedMetric === 'pa' ? 'Physical Availability (%)' : yAxisLabel,
                            font: { size: 11, weight: '600' },
                            color: '#94a3b8'
                        }
                    },
                    ...(selectedMetric === 'pa' ? {
                        y2: {
                            beginAtZero: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: {
                                font: { size: 10 },
                                color: '#10b981',
                                callback: (v) => `${v}h`
                            },
                            title: {
                                display: true,
                                text: 'MTBF / MTTR (Jam)',
                                font: { size: 11, weight: '600' },
                                color: '#10b981'
                            }
                        }
                    } : {})
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            font: { size: 11, weight: '600' },
                            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#475569'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        cornerRadius: 10,
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 11 },
                        callbacks: {
                            title: (items) => {
                                const idx = items[0].dataIndex;
                                const u = processedUnits[idx];
                                return `🚜 No Unit: ${u.unit} (${u.model || 'Equipment'})`;
                            },
                            afterBody: (items) => {
                                const idx = items[0].dataIndex;
                                const u = processedUnits[idx];
                                return [
                                    `━━━━━━━━━━━━━━━━━━━━`,
                                    `• PA Actual: ${u.pa_actual}% (Target: ${u.plan_pa}%)`,
                                    `• Jam Breakdown: ${u.bd_hrs} jam (${u.event_bd} kejadian)`,
                                    `• MTBF: ${u.mtbf} jam | MTTR: ${u.mttr} jam`,
                                    `• Jam Operasi: ${u.op_hrs} jam`,
                                    `• Mechanical Availability: ${u.ma}%`,
                                    `• Status Target: ${u.pa_actual >= u.plan_pa ? 'Tercapai ✅' : 'Di Bawah Target ⚠️'}`
                                ];
                            }
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [processedUnits, selectedMetric]);

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            {/* Header & Controls Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Grafik Perbandingan Per No Unit ({typeUnit})
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Menampilkan perbandingan performa langsung pada setiap <strong>No Unit ({processedUnits.length} Unit)</strong>
                    </p>
                </div>

                {/* Filter and Sort options */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Search Unit Input */}
                    <div className="relative flex-1 sm:w-44">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari No Unit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-xs bg-transparent border-0 py-0.5 pl-1 pr-6 focus:ring-0 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                        >
                            <option value="default">Urut: Kode Unit</option>
                            <option value="pa_asc">PA Terendah (Prioritas Perbaikan)</option>
                            <option value="pa_desc">PA Tertinggi (Best First)</option>
                            <option value="bd_desc">Jam BD Terbesar</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-900/60 rounded-xl w-fit">
                <button
                    onClick={() => setSelectedMetric('pa')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'pa'
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Gauge className="w-3.5 h-3.5" />
                    Achivement PA
                </button>
                <button
                    onClick={() => setSelectedMetric('mtbf')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'mtbf'
                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Wrench className="w-3.5 h-3.5" />
                    Achivement MTBF
                </button>
                <button
                    onClick={() => setSelectedMetric('mttr')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'mttr'
                            ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    Achivement MTTR
                </button>
                <button
                    onClick={() => setSelectedMetric('breakdown')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'breakdown'
                            ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    Jam Breakdown (BD Hours)
                </button>
                <button
                    onClick={() => setSelectedMetric('ma')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'ma'
                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Activity className="w-3.5 h-3.5" />
                    Mechanical Availability (MA %)
                </button>
                <button
                    onClick={() => setSelectedMetric('utilization')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMetric === 'utilization'
                            ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Utilisasi (UA & EU %)
                </button>
            </div>

            {/* Scrollable Chart Canvas Container */}
            <div className="overflow-x-auto pb-2">
                <div 
                    style={{ 
                        height: 350, 
                        minWidth: processedUnits.length > 8 ? `${Math.max(650, processedUnits.length * 48)}px` : '100%' 
                    }}
                >
                    <canvas ref={canvasRef} />
                </div>
            </div>

            {/* Visual Color Legend Guide for PA */}
            {selectedMetric === 'pa' && (
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Status PA Unit:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                            <span>≥ 90% (Target Tercapai)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                            <span>80% - 89.9% (Mendekati)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                            <span>&lt; 80% (Kritis / Prioritas Perbaikan)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span className="w-4 h-0.5 border-t-2 border-dashed border-indigo-500 inline-block"></span>
                        <span>Benchmark Plan PA Target: 90%</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Grafik MTTR Per No Unit (Terpisah) ---
function MttrBarChart({ kpiTable, typeUnit }) {
    const canvasRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const processedUnits = useMemo(() => {
        if (!kpiTable) return [];
        let list = [...kpiTable];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(u => u.unit.toLowerCase().includes(q) || (u.model && u.model.toLowerCase().includes(q)));
        }
        return list;
    }, [kpiTable, searchQuery]);

    useEffect(() => {
        if (!canvasRef.current || processedUnits.length === 0) return;
        const existing = Chart.getChart(canvasRef.current);
        if (existing) existing.destroy();
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = processedUnits.map(u => u.unit);
        const maxMttr = Math.max(...processedUnits.map(u => u.mttr), 10);
        const yMax = Math.ceil(maxMttr * 1.25);

        const barValueLabelsPlugin = {
            id: 'mttrBarValueLabels',
            afterDatasetsDraw(chart) {
                const { ctx: c } = chart;
                chart.data.datasets.forEach((dataset, di) => {
                    const meta = chart.getDatasetMeta(di);
                    if (meta.hidden) return;
                    meta.data.forEach((bar, i) => {
                        const val = dataset.data[i];
                        if (val !== undefined && val !== null && val > 0) {
                            c.save();
                            c.fillStyle = document.documentElement.classList.contains('dark') ? '#fda4af' : '#be123c';
                            c.font = 'bold 10px Inter, system-ui, sans-serif';
                            c.textAlign = 'center';
                            c.textBaseline = 'bottom';
                            c.fillText(`${val}h`, bar.x, bar.y - 3);
                            c.restore();
                        }
                    });
                });
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'MTTR (Jam)',
                    data: processedUnits.map(u => u.mttr),
                    backgroundColor: 'rgba(244, 63, 94, 0.80)',
                    borderColor: '#e11d48',
                    borderWidth: 1,
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,23,42,0.92)',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => ` MTTR: ${ctx.raw}h`,
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11, weight: 'bold' }, color: '#64748b' }
                    },
                    y: {
                        min: 0,
                        max: yMax,
                        title: { display: true, text: 'Jam (Hours)', font: { size: 11 }, color: '#94a3b8' },
                        grid: { color: 'rgba(100,116,139,0.1)' },
                        ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => `${v}h` }
                    }
                }
            },
            plugins: [barValueLabelsPlugin]
        });

        return () => chart.destroy();
    }, [processedUnits]);

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-rose-200 dark:border-rose-800/50 p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-rose-100 dark:border-rose-800/40">
                <div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Achivement MTTR Per No Unit ({typeUnit})
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold">
                            Mean Time To Repair
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Rata-rata durasi perbaikan per unit — semakin kecil semakin baik
                    </p>
                </div>
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari unit..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-rose-400 focus:border-rose-400 w-36"
                    />
                    <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Chart Canvas */}
            <div className="overflow-x-auto pb-2">
                <div style={{ height: 320, minWidth: processedUnits.length > 8 ? `${Math.max(650, processedUnits.length * 48)}px` : '100%' }}>
                    <canvas ref={canvasRef} />
                </div>
            </div>

            {/* Legend note */}
            <div className="flex items-center gap-2 pt-2 border-t border-rose-100 dark:border-rose-800/40 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block shrink-0"></span>
                <span>MTTR (Mean Time To Repair) — durasi rata-rata perbaikan dari breakdown hingga RFU. Target: serendah mungkin.</span>
            </div>
        </div>
    );
}

// --- Card Komponen untuk Tren Mingguan Modern ---
function WeeklyTrendCard({ title, icon: Icon, unitLabel, labels, data, color, bgGradient, unitSuffix = '', targetVal = null }) {
    const canvasRef = useRef(null);

    const latestValue = data && data.length > 0 ? data[data.length - 1] : 0;
    const firstValue = data && data.length > 0 ? data[0] : 0;
    const delta = (latestValue - firstValue).toFixed(1);
    const isPositive = Number(delta) >= 0;

    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;

        const existing = Chart.getChart(canvasRef.current);
        if (existing) {
            existing.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Create gradient fill below curve
        const gradient = ctx.createLinearGradient(0, 0, 0, 130);
        gradient.addColorStop(0, bgGradient || 'rgba(59, 130, 246, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        const datasets = [
            {
                data: data,
                borderColor: color,
                borderWidth: 2.5,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1.5,
                fill: true,
                backgroundColor: gradient,
            }
        ];

        // Target Line if supplied
        if (targetVal !== null) {
            datasets.push({
                data: Array(labels.length).fill(targetVal),
                borderColor: '#ef4444',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
            });
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 8, bottom: 4, left: 4, right: 8 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        padding: 8,
                        cornerRadius: 6,
                        titleFont: { size: 11, weight: 'bold' },
                        bodyFont: { size: 11 },
                        callbacks: {
                            title: (items) => `${items[0].label} (${unitLabel})`,
                            label: (c) => ` ${title}: ${c.parsed.y}${unitSuffix}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10, weight: 'bold' },
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        },
                        ticks: {
                            font: { size: 9 },
                            color: '#9ca3af',
                            callback: (v) => `${v}${unitSuffix}`
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [labels, data, color, bgGradient, targetVal, unitLabel]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/80 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        {title}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isPositive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                        {isPositive ? `▲ +${delta}` : `▼ ${delta}`}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {latestValue}{unitSuffix}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                        (W4)
                    </span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="mt-3" style={{ height: 130 }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}

// --- Komponen Modul Tren Mingguan dengan Filter No Unit ---
function WeeklyTrendSection({ trends, kpiTable, typeTitle }) {
    const [selectedUnitCode, setSelectedUnitCode] = useState('ALL');

    // Determine current trend data: either fleet aggregate or selected single unit
    const activeData = useMemo(() => {
        if (selectedUnitCode === 'ALL') {
            return {
                unitLabel: 'Rata-Rata Armada',
                selectedUnitObj: null,
                trends: trends || {
                    labels: ['W1', 'W2', 'W3', 'W4'],
                    pa: [80, 82, 85, 87],
                    dev_pa: [-10, -8, -5, -3],
                    mtbf: [40, 45, 42, 48],
                    mttr: [12, 10, 8, 6],
                    ma: [75, 78, 80, 82],
                }
            };
        }

        const foundUnit = kpiTable?.find(u => u.unit === selectedUnitCode);
        return {
            unitLabel: `Unit: ${selectedUnitCode}`,
            selectedUnitObj: foundUnit,
            trends: foundUnit?.trends || trends,
        };
    }, [selectedUnitCode, trends, kpiTable]);

    return (
        <div className="space-y-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Header with Unit Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/80 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/60">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            Tren Mingguan (W1 - W4)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Pilih No Unit untuk memantau tren mingguan secara spesifik
                        </p>
                    </div>
                </div>

                {/* Dropdown Filter No Unit */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        Pilih No Unit:
                    </span>
                    <select
                        value={selectedUnitCode}
                        onChange={(e) => setSelectedUnitCode(e.target.value)}
                        className="text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-blue-500 text-gray-800 dark:text-gray-200 shadow-sm w-full sm:w-64 cursor-pointer"
                    >
                        <option value="ALL">🌟 Rata-Rata Seluruh Unit (Fleet Average)</option>
                        {kpiTable?.map(u => (
                            <option key={u.unit} value={u.unit}>
                                🚜 {u.unit} - PA: {u.pa_actual}% (BD: {u.bd_hrs}h)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* If a single unit is selected, show its summary banner */}
            {activeData.selectedUnitObj && (
                <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                            {activeData.selectedUnitObj.unit}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            Model: <strong>{activeData.selectedUnitObj.model}</strong>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            PA Actual: <strong className="text-emerald-600 dark:text-emerald-400">{activeData.selectedUnitObj.pa_actual}%</strong>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            Jam BD: <strong className="text-rose-600 dark:text-rose-400">{activeData.selectedUnitObj.bd_hrs} Jam</strong>
                        </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        activeData.selectedUnitObj.pa_actual >= activeData.selectedUnitObj.plan_pa
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                    }`}>
                        {activeData.selectedUnitObj.pa_actual >= activeData.selectedUnitObj.plan_pa ? '✓ Target Tercapai' : '⚠️ Perlu Perhatian'}
                    </span>
                </div>
            )}

            {/* 5 Modern Redesigned Trend Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <WeeklyTrendCard
                    title="Trend PA Actual"
                    icon={Gauge}
                    unitLabel={activeData.unitLabel}
                    labels={activeData.trends.labels}
                    data={activeData.trends.pa}
                    color="#3b82f6"
                    bgGradient="rgba(59, 130, 246, 0.25)"
                    unitSuffix="%"
                    targetVal={90}
                />
                <WeeklyTrendCard
                    title="Trend Deviasi PA"
                    icon={Activity}
                    unitLabel={activeData.unitLabel}
                    labels={activeData.trends.labels}
                    data={activeData.trends.dev_pa}
                    color="#06b6d4"
                    bgGradient="rgba(6, 182, 212, 0.25)"
                    unitSuffix="%"
                />
                <WeeklyTrendCard
                    title="Trend MTBF"
                    icon={Wrench}
                    unitLabel={activeData.unitLabel}
                    labels={activeData.trends.labels}
                    data={activeData.trends.mtbf}
                    color="#10b981"
                    bgGradient="rgba(16, 185, 129, 0.25)"
                    unitSuffix="h"
                />
                <WeeklyTrendCard
                    title="Trend MTTR"
                    icon={Clock}
                    unitLabel={activeData.unitLabel}
                    labels={activeData.trends.labels}
                    data={activeData.trends.mttr}
                    color="#f43f5e"
                    bgGradient="rgba(244, 63, 94, 0.25)"
                    unitSuffix="h"
                />
                <WeeklyTrendCard
                    title="Trend MA"
                    icon={Sparkles}
                    unitLabel={activeData.unitLabel}
                    labels={activeData.trends.labels}
                    data={activeData.trends.ma}
                    color="#8b5cf6"
                    bgGradient="rgba(139, 92, 246, 0.25)"
                    unitSuffix="%"
                />
            </div>
        </div>
    );
}

export default function KpiIndex({ month, targetPa: initialTargetPa, kpiData }) {
    const [fMonth, setFMonth] = useState(month || '');
    const [fTargetPa, setFTargetPa] = useState(initialTargetPa ?? 90);
    const [chartViews, setChartViews] = useState({}); // Stores per-typeGroup view toggle: 'both', 'unit', 'trend'

    const applyFilter = () => {
        router.get('/kpi', { month: fMonth, target_pa: fTargetPa }, { preserveState: true });
    };

    const toggleView = (groupId, view) => {
        setChartViews(prev => ({
            ...prev,
            [groupId]: view
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="KPI Plant" />

            {/* Header & Date Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wider drop-shadow-sm flex items-center gap-3">
                        <Gauge className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        KPI PLANT
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Monitoring Kesiapan Fisik (PA), Mechanical Availability (MA), Downtime B0-B8, dan Keandalan (MTBF/MTTR) Armada
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 px-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Periode:
                    </span>
                    <input 
                        type="month" 
                        value={fMonth}
                        onChange={(e) => setFMonth(e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg text-xs px-3 py-1.5 focus:ring-blue-500 font-semibold"
                    />
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-indigo-500" />
                        Target PA:
                    </span>
                    <div className="relative flex items-center">
                        <input
                            type="number"
                            min="50"
                            max="100"
                            step="0.5"
                            value={fTargetPa}
                            onChange={(e) => setFTargetPa(Number(e.target.value))}
                            className="bg-white dark:bg-gray-900 border-indigo-300 dark:border-indigo-700 rounded-lg text-xs px-3 py-1.5 focus:ring-indigo-500 font-black text-indigo-700 dark:text-indigo-300 w-20 text-center"
                        />
                        <span className="absolute right-2 text-[10px] font-bold text-indigo-400 pointer-events-none">%</span>
                    </div>
                    <button 
                        onClick={applyFilter}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        Tampilkan
                    </button>
                </div>
            </div>

            {kpiData && kpiData.length > 0 ? (
                <div className="space-y-12">
                    {kpiData.map((typeGroup) => {
                        const currentView = chartViews[typeGroup.id] || 'unit'; // default to 'unit' comparison view

                        return (
                            <div key={typeGroup.id} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                                
                                {/* Section Header */}
                                <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-4 border-b border-gray-300 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-6 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-wide">
                                            {typeGroup.title}
                                        </h2>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold ml-2">
                                            {typeGroup.kpi_table?.length || 0} Unit
                                        </span>
                                    </div>

                                    {/* View Toggle Buttons */}
                                    <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700/60 p-1 rounded-xl text-xs font-bold">
                                        <button
                                            onClick={() => toggleView(typeGroup.id, 'unit')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                                currentView === 'unit'
                                                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                            }`}
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            Grafik Per No Unit
                                        </button>
                                        <button
                                            onClick={() => toggleView(typeGroup.id, 'trend')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                                currentView === 'trend'
                                                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                            }`}
                                        >
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            Tren Mingguan (W1-W4)
                                        </button>
                                        <button
                                            onClick={() => toggleView(typeGroup.id, 'both')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                                currentView === 'both'
                                                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                            }`}
                                        >
                                            <Layers className="w-3.5 h-3.5" />
                                            Semua Grafik
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-6">
                                    
                                    {/* Fleet Highlights Strip */}
                                    <KpiFleetHighlights 
                                        highlights={typeGroup.highlights} 
                                        typeTitle={typeGroup.title} 
                                    />

                                    {/* --- DYNAMIC GRAPHICS MODULE (Per No Unit & Trend) --- */}
                                    <div className="space-y-6">
                                        {(currentView === 'unit' || currentView === 'both') && (
                                            <UnitComparisonChart 
                                                kpiTable={typeGroup.kpi_table} 
                                                typeUnit={typeGroup.type_unit} 
                                            />
                                        )}

                                        {(currentView === 'trend' || currentView === 'both') && (
                                            <WeeklyTrendSection 
                                                trends={typeGroup.trends} 
                                                kpiTable={typeGroup.kpi_table}
                                                typeTitle={typeGroup.title} 
                                            />
                                        )}
                                    </div>

                                    {/* --- TOP TABLES ROW (Breakdown Table & Summary BD) --- */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        
                                        {/* Table Breakdown B0-B8 */}
                                        <div className="xl:col-span-2 overflow-x-auto">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    Tabel Breakdown B0 - B8 per Unit (Jam)
                                                </h3>
                                            </div>
                                            <table className="w-full text-xs whitespace-nowrap border-collapse">
                                                <thead>
                                                    <tr className="bg-amber-700 text-white uppercase text-center font-bold">
                                                        <th className="px-3 py-2 border border-amber-800">TYPE</th>
                                                        <th className="px-3 py-2 border border-amber-800">UNIT</th>
                                                        {['B0','B1','B2','B3','B4','B5','B6','B7','B8'].map(b => (
                                                            <th key={b} className="px-2 py-2 border border-amber-800 w-10">{b}</th>
                                                        ))}
                                                        <th className="px-3 py-2 border border-amber-800 w-16">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                                    {typeGroup.breakdown_table.map((group, idx) => (
                                                        <React.Fragment key={idx}>
                                                            {group.units.map((u, uIdx) => (
                                                                <tr key={u.code_unit} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    {uIdx === 0 && (
                                                                        <td rowSpan={group.units.length + 1} className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 align-top font-bold bg-gray-50 dark:bg-gray-900">
                                                                            <div className="flex items-center gap-1">
                                                                                <span>⊟</span> {group.group_name}
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    <td className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 font-bold text-blue-600 dark:text-blue-400">{u.code_unit}</td>
                                                                    {['B0','B1','B2','B3','B4','B5','B6','B7','B8'].map(b => (
                                                                        <ValueCell key={b} value={u.b_codes[b]} />
                                                                    ))}
                                                                    <td className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-right font-bold bg-gray-50 dark:bg-gray-700/50">
                                                                        {u.total > 0 ? u.total : ''}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {/* Group Total Row */}
                                                            <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                                                <td className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-gray-700 dark:text-gray-300">Total</td>
                                                                {['B0','B1','B2','B3','B4','B5','B6','B7','B8'].map(b => (
                                                                    <ValueCell key={b} value={group.group_totals[b]} className="text-gray-900 dark:text-white" />
                                                                ))}
                                                                <td className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-gray-900 dark:text-white">
                                                                    {group.group_total_all > 0 ? group.group_total_all : ''}
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                                    {/* Grand Total Breakdown */}
                                                    <tr className="bg-amber-100 dark:bg-amber-900/30 font-bold text-gray-900 dark:text-white border-t-2 border-amber-700">
                                                        <td colSpan="2" className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-right">Total</td>
                                                        {['B0','B1','B2','B3','B4','B5','B6','B7','B8'].map(b => (
                                                            <ValueCell key={b} value={typeGroup.breakdown_totals[b]} />
                                                        ))}
                                                        <td className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-right">
                                                            {typeGroup.breakdown_total_all > 0 ? typeGroup.breakdown_total_all : ''}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Table Summary BD & Pie Chart */}
                                        <div className="xl:col-span-1 space-y-4">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs whitespace-nowrap border-collapse">
                                                    <thead>
                                                        <tr className="bg-amber-700 text-white uppercase text-center font-bold">
                                                            <th className="px-2 py-2 border border-amber-800 text-left">TYPE BD</th>
                                                            <th className="px-2 py-2 border border-amber-800 text-left">DESCRIPTION</th>
                                                            <th className="px-2 py-2 border border-amber-800">Total Jam BD</th>
                                                            <th className="px-2 py-2 border border-amber-800">% BD</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                                        {typeGroup.summary_bd.map((row) => (
                                                            <tr key={row.type_bd} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 font-bold">{row.type_bd}</td>
                                                                <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700">{row.description}</td>
                                                                <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.total_jam}</td>
                                                                <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right font-bold">{row.pct}%</td>
                                                            </tr>
                                                        ))}
                                                        {typeGroup.summary_bd.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="px-2 py-4 border border-gray-300 dark:border-gray-700 text-center text-gray-400 italic">No breakdown data</td>
                                                            </tr>
                                                        )}
                                                        <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                                            <td colSpan="2" className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-left">Total</td>
                                                            <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-gray-900 dark:text-white">{typeGroup.breakdown_total_all}</td>
                                                            <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-gray-900 dark:text-white">100.0%</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Donut Chart Card */}
                                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col items-center">
                                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Proporsi Breakdown (Type BD)</h3>
                                                <div style={{ height: 160, width: '100%' }}>
                                                    <PieChart data={typeGroup.summary_bd} />
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* --- BOTTOM MAIN KPI TABLE --- */}
                                    <div className="overflow-x-auto mt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                                                Tabel Lengkap Parameter KPI Per Unit
                                            </h3>
                                        </div>
                                        <table className="w-full text-xs whitespace-nowrap border-collapse">
                                            <thead>
                                                <tr className="bg-amber-600 dark:bg-amber-700 text-white uppercase text-center font-bold">
                                                    <th className="px-2 py-2 border border-amber-800 bg-amber-700 text-left">UNIT</th>
                                                    <th className="px-2 py-2 border border-amber-800">Start HM</th>
                                                    <th className="px-2 py-2 border border-amber-800">Max HM</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">OP (hrs)</th>
                                                    <th className="px-2 py-2 border border-amber-800">EWH</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">BD (hrs)</th>
                                                    <th className="px-2 py-2 border border-amber-800">Event BD</th>
                                                    <th className="px-2 py-2 border border-amber-800">STB</th>
                                                    <th className="px-2 py-2 border border-amber-800 bg-amber-700">PA Actual</th>
                                                    <th className="px-2 py-2 border border-amber-800 bg-amber-700 text-amber-200">Plan PA</th>
                                                    <th className="px-2 py-2 border border-amber-800 bg-amber-700">PA Achv</th>
                                                    <th className="px-2 py-2 border border-amber-800 bg-amber-700">MA</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">MTBF</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">MTBF Achv</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">MTTR</th>
                                                    <th className="px-2 py-2 border border-amber-800 text-amber-100">MTTR Achv</th>
                                                    <th className="px-2 py-2 border border-amber-800">UA %</th>
                                                    <th className="px-2 py-2 border border-amber-800">EU (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                                {typeGroup.kpi_table?.map((row) => (
                                                    <tr key={row.unit} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 font-bold bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400">
                                                            {row.unit}
                                                        </td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.start_hm}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.max_hm}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right font-semibold">{row.op_hrs}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.ewh}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right font-semibold text-rose-600 dark:text-rose-400">{row.bd_hrs}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.event_bd}</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right">{row.stb}</td>
                                                        
                                                        {/* Targets and Achvs */}
                                                        <TargetCell value={row.pa_actual} target={row.plan_pa} isGreaterBetter={true} isPercent={true} />
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">{row.plan_pa}%</td>
                                                        <TargetCell value={row.pa_achv} target={100} isGreaterBetter={true} isPercent={true} />
                                                        <TargetCell value={row.ma} target={row.plan_pa} isGreaterBetter={true} isPercent={true} />
                                                        
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-indigo-600 dark:text-indigo-400 font-bold">{row.mtbf}</td>
                                                        <TargetCell value={row.mtbf_achv} target={100} isGreaterBetter={true} isPercent={true} />
                                                        
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right text-indigo-600 dark:text-indigo-400 font-bold">{row.mttr}</td>
                                                        <TargetCell value={row.mttr_achv} target={100} isGreaterBetter={true} isPercent={true} />
                                                        
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200">{row.ua}%</td>
                                                        <td className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 text-right bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200">{row.eu}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v5H7zm4-3h2v8h-2zm4-4h2v12h-2z"/></svg>
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Tidak ada data KPI untuk periode ini.</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Coba ubah filter periode atau pastikan data unit tersedia.</p>
                </div>
            )}

        </AuthenticatedLayout>
    );
}

// Wrapper component for PieChart
function PieChart({ data }) {
    const canvasRef = useRef(null);
    usePieChart(canvasRef, data);
    return <canvas ref={canvasRef} />;
}
