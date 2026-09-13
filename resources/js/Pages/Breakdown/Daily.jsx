import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Daily({
    farKpi,
    chartKategori,
    chartPenyebab,
    chartTrend,
    farTable,
    filters = {}
}) {
    const kategoriChartRef = useRef(null);
    const penyebabChartRef = useRef(null);
    const trendChartRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.code_unit || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('breakdown.daily'), {
            date_from: dateFrom,
            date_to: dateTo,
            code_unit: codeUnitFilter,
            status: statusFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setStatusFilter('');
        router.get(route('breakdown.daily'), {}, { preserveState: true });
    };

    useEffect(() => {
        let kategoriInstance = null;
        let penyebabInstance = null;
        let trendInstance = null;

        // --- DOUGHNUT CHART: Kategori Kerusakan ---
        if (kategoriChartRef.current) {
            const ctx = kategoriChartRef.current.getContext('2d');
            kategoriInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartKategori.map(item => item.name),
                    datasets: [{
                        data: chartKategori.map(item => item.value),
                        backgroundColor: chartKategori.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { display: false },
                    }
                },
                plugins: [{
                    id: 'custom_text_kategori',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();
                        
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        ctx.font = "bold 20px Arial";
                        ctx.fillStyle = "#1f2937";
                        ctx.textBaseline = "middle";
                        const textVal = farKpi.total_kasus.count.toString();
                        const textValX = Math.round(centerX - ctx.measureText(textVal).width / 2);
                        ctx.fillText(textVal, textValX, centerY - 8);

                        ctx.font = "12px Arial";
                        ctx.fillStyle = "#6b7280";
                        const textTop = "Kasus";
                        const textTopX = Math.round(centerX - ctx.measureText(textTop).width / 2);
                        ctx.fillText(textTop, textTopX, centerY + 12);
                        
                        ctx.save();
                    }
                }]
            });
        }

        // --- HORIZONTAL BAR CHART: Penyebab Kerusakan ---
        if (penyebabChartRef.current) {
            const ctx = penyebabChartRef.current.getContext('2d');
            penyebabInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartPenyebab.map(item => item.name),
                    datasets: [{
                        data: chartPenyebab.map(item => item.value),
                        backgroundColor: chartPenyebab.map(item => item.color),
                        borderRadius: 4,
                        barThickness: 12
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: {
                            display: false,
                            max: 40
                        },
                        y: {
                            grid: { display: false },
                            ticks: { font: { size: 10 }, color: '#4b5563' },
                            border: { display: false }
                        }
                    },
                    animation: {
                        onComplete: function(animation) {
                            const chartInstance = animation.chart;
                            const ctx = chartInstance.ctx;
                            ctx.font = "bold 10px Arial";
                            ctx.fillStyle = "#1f2937";
                            ctx.textAlign = "left";
                            ctx.textBaseline = "middle";

                            chartInstance.data.datasets.forEach((dataset, i) => {
                                const meta = chartInstance.getDatasetMeta(i);
                                meta.data.forEach((bar, index) => {
                                    const data = dataset.data[index];
                                    const pct = chartPenyebab[index].pct;
                                    ctx.fillText(`${data} (${pct})`, bar.x + 5, bar.y);
                                });
                            });
                        }
                    }
                }
            });
        }

        // --- LINE CHART: Trend Kasus FAR ---
        if (trendChartRef.current) {
            const ctx = trendChartRef.current.getContext('2d');
            trendInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartTrend.labels,
                    datasets: [
                        {
                            label: 'Jumlah Kasus',
                            data: chartTrend.kasus,
                            borderColor: '#10b981', // green
                            backgroundColor: '#10b981',
                            borderWidth: 2,
                            pointRadius: 4,
                            tension: 0.1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Downtime (Jam)',
                            data: chartTrend.downtime,
                            borderColor: '#3b82f6', // blue
                            backgroundColor: '#3b82f6',
                            borderWidth: 2,
                            pointRadius: 4,
                            tension: 0.1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'top',
                            labels: { usePointStyle: true, boxWidth: 6, font: { size: 10 } }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            max: 40,
                            ticks: { font: { size: 9 }, stepSize: 10 },
                            grid: { color: '#f3f4f6' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            max: 800,
                            ticks: { font: { size: 9 }, stepSize: 200 },
                            grid: { drawOnChartArea: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 9 } }
                        }
                    },
                    animation: {
                        onComplete: function(animation) {
                            const chartInstance = animation.chart;
                            const ctx = chartInstance.ctx;
                            ctx.font = "bold 10px Arial";
                            ctx.fillStyle = "#1f2937";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "bottom";

                            chartInstance.data.datasets.forEach((dataset, i) => {
                                const meta = chartInstance.getDatasetMeta(i);
                                meta.data.forEach((point, index) => {
                                    const data = dataset.data[index];
                                    ctx.fillText(data, point.x, point.y - 8);
                                });
                            });
                        }
                    }
                }
            });
        }

        return () => {
            if (kategoriInstance) kategoriInstance.destroy();
            if (penyebabInstance) penyebabInstance.destroy();
            if (trendInstance) trendInstance.destroy();
        };
    }, [chartKategori, chartPenyebab, chartTrend, farKpi]);

    return (
        <AuthenticatedLayout>
            <Head title="Failure Analysis (FAR)" />
            
            <div className="space-y-4">
                
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
                    {/* Decorative Background for Header */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'right center', maskImage: 'linear-gradient(to right, transparent, black)' }}></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/></svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">Failure Analysis (FAR)</h1>
                                <p className="text-sm text-gray-500">Analisa penyebab kerusakan unit untuk mencegah kejadian berulang dan meningkatkan keandalan unit</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>Home</span> › <span>Maintenance Control</span> › <span className="text-gray-600 font-bold">Failure Analysis (FAR)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <span className="text-lg leading-none">+</span> Input FAR
                                </button>
                                <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Export Excel
                                </button>
                                <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Print
                                </button>
                                <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> Laporan FAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
                        <div className="text-[#ef4444]">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Total Kasus</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-gray-900">{farKpi.total_kasus.count}</span>
                                <span className="text-sm font-bold text-[#ef4444]">{farKpi.total_kasus.trend}</span>
                            </div>
                            <div className="text-xs text-gray-400">Periode: Sep 2026</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
                        <div className="text-[#0ea5e9]">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.21,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Unit Terdampak</div>
                            <div className="text-2xl font-black text-gray-900">{farKpi.unit_terdampak.count}</div>
                            <div className="text-xs text-gray-400">({farKpi.unit_terdampak.pct})</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
                        <div className="w-10 h-10 bg-[#3b82f6] text-white rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Total Downtime</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900">{farKpi.total_downtime.count}</span>
                                <span className="text-xs font-bold text-gray-600">Jam</span>
                            </div>
                            <div className="text-xs text-gray-400">Rata-rata {farKpi.total_downtime.rata} jam/kasus</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
                        <div className="text-[#10b981]">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Closed Case</div>
                            <div className="text-2xl font-black text-gray-900">{farKpi.closed_case.count}</div>
                            <div className="text-xs text-gray-400">({farKpi.closed_case.pct})</div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Doughnut Chart */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-4">Kategori Kerusakan</h3>
                        <div className="flex-1 flex items-center">
                            <div className="w-5/12 h-[150px] relative">
                                <canvas ref={kategoriChartRef}></canvas>
                            </div>
                            <div className="w-7/12 pl-2 flex flex-col justify-center gap-1.5 text-xs">
                                {chartKategori.map((item, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <div className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-600 font-medium w-[70px] truncate">{item.name}</span>
                                        <span className="font-bold text-gray-900 ml-auto">{item.value}</span>
                                        <span className="text-gray-400 ml-1 w-[40px] text-right">({item.pct})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Bar Chart */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-4">Penyebab Kerusakan (Top 5)</h3>
                        <div className="flex-1 relative w-full pt-2">
                            <canvas ref={penyebabChartRef}></canvas>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-4">Trend Kasus FAR</h3>
                        <div className="flex-1 relative w-full">
                            <canvas ref={trendChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Filter Row */}
                <form onSubmit={handleFilter} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tanggal Dari</label>
                        <input 
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tanggal Sampai</label>
                        <input 
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8"
                        />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8"
                        >
                            <option value="">Semua</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="relative min-w-[200px]">
                        <input 
                            type="text" 
                            placeholder="Cari kode unit..." 
                            value={codeUnitFilter}
                            onChange={(e) => setCodeUnitFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 pl-7 h-8"
                        />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Cari
                        </button>
                        <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
                        </button>
                    </div>
                </form>

                {/* Main Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 text-[13px] tracking-tight">Daftar Failure Analysis</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2.5 font-bold text-center w-8">No</th>
                                    <th className="px-3 py-2.5 font-bold">Tanggal</th>
                                    <th className="px-3 py-2.5 font-bold">Kode Unit</th>
                                    <th className="px-3 py-2.5 font-bold">Equipment</th>
                                    <th className="px-3 py-2.5 font-bold">Komponen</th>
                                    <th className="px-3 py-2.5 font-bold">Deskripsi Kerusakan</th>
                                    <th className="px-3 py-2.5 font-bold">Penyebab Utama</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Downtime (Jam)</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Biaya (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Status</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {farTable.map((item) => (
                                    <tr key={item.id} 
                                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedRow && selectedRow.id === item.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedRow(item)}>
                                        <td className="px-3 py-2 text-center text-gray-400">{item.id}</td>
                                        <td className="px-3 py-2">{item.tanggal}</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{item.kode_unit}</td>
                                        <td className="px-3 py-2">{item.equipment}</td>
                                        <td className="px-3 py-2 font-bold text-gray-700">{item.komponen}</td>
                                        <td className="px-3 py-2">{item.deskripsi}</td>
                                        <td className="px-3 py-2 text-gray-500">{item.penyebab}</td>
                                        <td className="px-3 py-2 text-center font-mono font-bold text-gray-900">{item.downtime.toFixed(1)}</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-700">{item.biaya}</td>
                                        <td className="px-3 py-2 text-center">
                                            {item.status === 'Closed' && <span className="bg-[#10b981] text-white px-2 py-0.5 rounded text-[9px] font-bold">Closed</span>}
                                            {item.status === 'In Progress' && <span className="bg-[#facc15] text-gray-900 px-2 py-0.5 rounded text-[9px] font-bold">In Progress</span>}
                                            {item.status === 'Open' && <span className="bg-[#ef4444] text-white px-2 py-0.5 rounded text-[9px] font-bold">Open</span>}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button className="bg-[#3b82f6] text-white p-1 rounded shadow-sm hover:bg-blue-600"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                                <button className="bg-[#facc15] text-white p-1 rounded shadow-sm hover:bg-yellow-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                                <button className="bg-[#ef4444] text-white p-1 rounded shadow-sm hover:bg-red-600"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 bg-white text-xs text-gray-500 flex justify-between items-center">
                        <div>Menampilkan 1 - 10 dari 124 data</div>
                        <div className="flex gap-1 items-center">
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">«</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">‹</button>
                            <button className="w-6 h-6 rounded bg-[#10b981] text-white font-bold flex items-center justify-center">1</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">2</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">3</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">4</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">5</button>
                            <span className="px-1 text-gray-400">...</span>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">13</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">›</button>
                            <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">»</button>
                        </div>
                    </div>
                </div>

                {/* Footer Dynamic Details (Only show if a row is selected or show placeholder) */}
                {selectedRow ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Detail Kasus FAR */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[200px]">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-800 text-sm tracking-tight">Detail Kasus FAR</h2>
                            </div>
                            <div className="p-3 flex gap-4 h-full">
                                <div className="w-1/3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="part" />
                                </div>
                                <div className="w-2/3 flex flex-col justify-center text-xs">
                                    <table className="w-full">
                                        <tbody>
                                            <tr><td className="text-gray-500 py-0.5 w-[70px]">Kode Unit</td><td className="font-bold text-gray-900">: {selectedRow.kode_unit}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Komponen</td><td className="text-gray-900">: {selectedRow.komponen}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Tanggal</td><td className="text-gray-900">: {selectedRow.tanggal}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Deskripsi</td><td className="text-gray-900 truncate">: {selectedRow.deskripsi}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Penyebab</td><td className="text-gray-900 truncate">: {selectedRow.penyebab}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Downtime</td><td className="font-bold text-gray-900">: {selectedRow.downtime} Jam</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Biaya</td><td className="text-[#ef4444] font-bold">: Rp {selectedRow.biaya}</td></tr>
                                            <tr><td className="text-gray-500 py-0.5">Status</td><td>: 
                                                {selectedRow.status === 'Closed' && <span className="bg-[#10b981] text-white px-1.5 py-0.5 rounded text-[8px] font-bold ml-1">Closed</span>}
                                                {selectedRow.status === 'In Progress' && <span className="bg-[#facc15] text-gray-900 px-1.5 py-0.5 rounded text-[8px] font-bold ml-1">In Progress</span>}
                                                {selectedRow.status === 'Open' && <span className="bg-[#ef4444] text-white px-1.5 py-0.5 rounded text-[8px] font-bold ml-1">Open</span>}
                                            </td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Foto / Bukti Kerusakan */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[200px]">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-800 text-sm tracking-tight">Foto / Bukti Kerusakan</h2>
                            </div>
                            <div className="p-3 flex justify-between gap-2 h-full items-center">
                                <div className="flex-1 aspect-square rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1616423641405-b010b9c3f05c?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="1" />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1">Kerusakan Pump</div>
                                </div>
                                <div className="flex-1 aspect-square rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1506544777-64cbcf7ce8df?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="2" />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1">Kondisi Filter</div>
                                </div>
                                <div className="flex-1 aspect-square rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="3" />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1">Kotoran pada Oli</div>
                                </div>
                                <div className="flex-1 aspect-square rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1537545938833-289dbbe497cc?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover grayscale" alt="4" />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1">Keausan Komponen</div>
                                </div>
                            </div>
                        </div>

                        {/* Rekomendasi & Tindak Lanjut */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[200px]">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-800 text-sm tracking-tight">Rekomendasi & Tindak Lanjut</h2>
                            </div>
                            <div className="p-3 h-full overflow-y-auto">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-xs text-gray-600">Lakukan flushing system hydraulic</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-xs text-gray-600">Ganti filter hydraulic sesuai interval</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-xs text-gray-600">Gunakan oli sesuai spesifikasi pabrikan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-xs text-gray-600">Tingkatkan kebersihan area kerja saat maintenance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-xs text-gray-600">Monitoring kondisi oli secara berkala melalui Oil Sampling</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-sm text-gray-500 font-medium">Klik pada salah satu baris tabel di atas untuk melihat detail analisis kerusakan</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
