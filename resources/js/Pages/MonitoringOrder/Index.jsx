import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ 
    mccStats, 
    chartStatusUnit, 
    chartWoStatus, 
    chartTrendStatus, 
    mccUnits, 
    priorityJobs, 
    notifications, 
    upcomingMaintenance, 
    topDowntime,
    filters = {}
}) {
    const statusChartRef = useRef(null);
    const trendChartRef = useRef(null);
    const woStatusChartRef = useRef(null);
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [searchFilter, setSearchFilter] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.progressFilter || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('monitoring-orders.index'), {
            dateFrom, dateTo, search: searchFilter, progressFilter: statusFilter
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom(''); setDateTo(''); setSearchFilter(''); setStatusFilter('');
        router.get(route('monitoring-orders.index'), {}, { preserveState: true });
    };

    useEffect(() => {
        let statusInstance = null;
        let trendInstance = null;
        let woInstance = null;

        // --- STATUS UNIT DOUGHNUT ---
        if (statusChartRef.current) {
            const ctx = statusChartRef.current.getContext('2d');
            statusInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartStatusUnit.map(item => item.name),
                    datasets: [{
                        data: chartStatusUnit.map(item => item.value),
                        backgroundColor: chartStatusUnit.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` ${context.label}: ${context.raw}`
                            }
                        }
                    }
                },
                plugins: [{
                    id: 'custom_text',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();
                        
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        ctx.font = "10px Arial";
                        ctx.fillStyle = "#6b7280";
                        ctx.textBaseline = "middle";
                        const textTop = "Total Unit";
                        const textTopX = Math.round(centerX - ctx.measureText(textTop).width / 2);
                        ctx.fillText(textTop, textTopX, centerY - 8);

                        ctx.font = "bold 20px Arial";
                        ctx.fillStyle = "#1f2937";
                        const textVal = mccStats.total_unit.toString();
                        const textValX = Math.round(centerX - ctx.measureText(textVal).width / 2);
                        ctx.fillText(textVal, textValX, centerY + 10);
                        
                        ctx.save();
                    }
                }]
            });
        }

        // --- TREND LINE CHART ---
        if (trendChartRef.current) {
            const ctx = trendChartRef.current.getContext('2d');
            trendInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartTrendStatus.months,
                    datasets: [
                        {
                            label: 'Running',
                            data: chartTrendStatus.running,
                            borderColor: '#22c55e',
                            backgroundColor: '#22c55e',
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.1
                        },
                        {
                            label: 'Under Repair',
                            data: chartTrendStatus.under_repair,
                            borderColor: '#eab308',
                            backgroundColor: '#eab308',
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.1
                        },
                        {
                            label: 'Breakdown',
                            data: chartTrendStatus.breakdown,
                            borderColor: '#ef4444',
                            backgroundColor: '#ef4444',
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.1
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
                            beginAtZero: true,
                            max: 200,
                            ticks: { font: { size: 9 }, stepSize: 25 },
                            grid: { color: '#f3f4f6' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 9 } }
                        }
                    }
                }
            });
        }

        // --- WO STATUS DOUGHNUT ---
        if (woStatusChartRef.current) {
            const ctx = woStatusChartRef.current.getContext('2d');
            woInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartWoStatus.map(item => item.name),
                    datasets: [{
                        data: chartWoStatus.map(item => item.value),
                        backgroundColor: chartWoStatus.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` ${context.label}: ${context.raw}`
                            }
                        }
                    }
                },
                plugins: [{
                    id: 'custom_text_wo',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();
                        
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        ctx.font = "10px Arial";
                        ctx.fillStyle = "#6b7280";
                        ctx.textBaseline = "middle";
                        const textTop = "Total WO";
                        const textTopX = Math.round(centerX - ctx.measureText(textTop).width / 2);
                        ctx.fillText(textTop, textTopX, centerY - 8);

                        ctx.font = "bold 20px Arial";
                        ctx.fillStyle = "#1f2937";
                        const textVal = mccStats.total_wo.toString();
                        const textValX = Math.round(centerX - ctx.measureText(textVal).width / 2);
                        ctx.fillText(textVal, textValX, centerY + 10);
                        
                        ctx.save();
                    }
                }]
            });
        }

        return () => {
            if (statusInstance) statusInstance.destroy();
            if (trendInstance) trendInstance.destroy();
            if (woInstance) woInstance.destroy();
        };
    }, [chartStatusUnit, chartTrendStatus, chartWoStatus, mccStats]);

    // Helpers
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Running': return <span className="bg-[#10b981] text-white px-3 py-1 rounded text-xs font-bold">Running</span>;
            case 'Breakdown': return <span className="bg-[#ef4444] text-white px-3 py-1 rounded text-xs font-bold">Breakdown</span>;
            case 'Under Repair': return <span className="bg-[#facc15] text-gray-900 px-3 py-1 rounded text-xs font-bold">Under Repair</span>;
            case 'Standby': return <span className="bg-[#6b7280] text-white px-3 py-1 rounded text-xs font-bold">Standby</span>;
            default: return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };
    
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High': return <span className="bg-[#ef4444] text-white px-2 py-0.5 rounded text-[9px] font-bold">High</span>;
            case 'Medium': return <span className="bg-[#facc15] text-gray-900 px-2 py-0.5 rounded text-[9px] font-bold">Medium</span>;
            case 'Low': return <span className="bg-[#3b82f6] text-white px-2 py-0.5 rounded text-[9px] font-bold">Low</span>;
            default: return <span>{priority}</span>;
        }
    };
    
    const getNotifBadge = (tipe) => {
        switch (tipe) {
            case 'Info': return <span className="bg-[#3b82f6] text-white px-2 py-0.5 rounded text-[9px] font-bold">Info</span>;
            case 'Alert': return <span className="bg-[#ef4444] text-white px-2 py-0.5 rounded text-[9px] font-bold">Alert</span>;
            case 'Success': return <span className="bg-[#10b981] text-white px-2 py-0.5 rounded text-[9px] font-bold">Success</span>;
            case 'Warning': return <span className="bg-[#facc15] text-gray-900 px-2 py-0.5 rounded text-[9px] font-bold">Warning</span>;
            default: return <span>{tipe}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Maintenance Control Center" />
            
            <div className="space-y-4">
                {/* Header Graphic Area */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row relative">
                    <div className="p-5 flex-1 z-10 bg-white">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Maintenance Control Center (MCC)</h1>
                        </div>
                        <p className="text-sm text-gray-500 ml-13 pl-1">Monitoring real-time status unit, maintenance activity, dan tindak lanjut pekerjaan</p>
                    </div>
                    {/* Fake Background Image Area */}
                    <div className="hidden md:flex relative flex-1 min-w-[300px] h-24 overflow-hidden bg-gray-800 ml-auto clip-path-slant items-center justify-end pr-8" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)', backgroundImage: 'url("https://images.unsplash.com/photo-1579970923053-1594e9f7cc94?auto=format&fit=crop&q=80&w=1000")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="absolute inset-0 bg-gray-900/60"></div>
                        <div className="relative text-right z-10 text-white font-black text-xl tracking-wider uppercase drop-shadow-md">
                            KEEP EQUIPMENT<br/>RUNNING STRONG
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
                        <div className="text-[#10b981]">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm4 0h-2V7h2v5zm-4 4h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Total Unit</div>
                            <div className="text-2xl font-black text-gray-900">{mccStats.total_unit}</div>
                            <div className="text-xs text-gray-400">Unit</div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center text-white shadow-md shadow-red-500/30">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Unit Breakdown</div>
                            <div className="text-2xl font-black text-gray-900">{mccStats.breakdown.count}</div>
                            <div className="text-xs font-bold text-[#ef4444]">({mccStats.breakdown.pct})</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#facc15] rounded-full flex items-center justify-center text-white shadow-md shadow-yellow-500/30">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Unit Under Repair</div>
                            <div className="text-2xl font-black text-gray-900">{mccStats.under_repair.count}</div>
                            <div className="text-xs font-bold text-[#facc15]">({mccStats.under_repair.pct})</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0ea5e9] rounded-full flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Unit Running</div>
                            <div className="text-2xl font-black text-gray-900">{mccStats.running.count}</div>
                            <div className="text-xs text-gray-400">({mccStats.running.pct})</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white shadow-md shadow-gray-500/30">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500">Total Work Order</div>
                            <div className="text-2xl font-black text-gray-900">{mccStats.total_wo}</div>
                            <div className="text-xs text-gray-400">Bulan Ini</div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Status Unit Doughnut */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-2 text-center uppercase tracking-wider">Status Unit</h3>
                        <div className="h-32 relative w-full flex items-center justify-center">
                            <div className="w-[120px] h-[120px]">
                                <canvas ref={statusChartRef}></canvas>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 px-2">
                            {chartStatusUnit.map(item => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-[9px] text-gray-600 font-medium">{item.name}</span>
                                    <span className="text-[9px] font-bold ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trend Line Chart */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="font-bold text-gray-800 text-sm mb-2 text-center uppercase tracking-wider">Trend Status Unit (6 Bulan Terakhir)</h3>
                        <div className="h-40 relative w-full">
                            <canvas ref={trendChartRef}></canvas>
                        </div>
                    </div>

                    {/* WO Status Doughnut */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-2 text-center uppercase tracking-wider">Work Order Status</h3>
                        <div className="h-32 relative w-full flex items-center justify-center">
                            <div className="w-[120px] h-[120px]">
                                <canvas ref={woStatusChartRef}></canvas>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-1 mt-3 px-6">
                            {chartWoStatus.map(item => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-xs text-gray-600 font-medium">{item.name}</span>
                                    <span className="text-xs font-bold ml-auto">{item.value} {item.name === 'Closed' && '(71.2%)'}{item.name === 'On Process' && '(17.8%)'}{item.name === 'Open' && '(11.0%)'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filter Row */}
                <form onSubmit={handleFilter} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-2">
                    <div>
                        <label className="block text-[9px] font-bold text-gray-600 mb-1">Status</label>
                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-sm border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 h-8 min-w-[140px]"
                        >
                            <option value="">Semua Status</option>
                            <option value="OPEN">Open</option>
                            <option value="ON PROCESS">On Process</option>
                            <option value="CLOSED">Closed</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-gray-600 mb-1">Tanggal Dari</label>
                        <input 
                            type="date" 
                            value={dateFrom} 
                            max={dateTo || undefined}
                            onChange={e => setDateFrom(e.target.value)}
                            className="text-sm border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 h-8 min-w-[130px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-gray-600 mb-1">Tanggal Sampai</label>
                        <input 
                            type="date" 
                            value={dateTo} 
                            min={dateFrom || undefined}
                            onChange={e => setDateTo(e.target.value)}
                            className="text-sm border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 h-8 min-w-[130px]"
                        />
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <label className="block text-[9px] font-bold text-gray-600 mb-1">Cari</label>
                        <input 
                            type="text"
                            value={searchFilter}
                            onChange={e => setSearchFilter(e.target.value)}
                            placeholder="Cari kode unit atau deskripsi..."
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 pl-7 h-8"
                        />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 bottom-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="flex items-end gap-2">
                        <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-sm h-8">
                            Cari
                        </button>
                        <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center justify-center shadow-sm h-8">
                            Reset
                        </button>
                    </div>
                </form>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* LEFT COLUMN */}
                    <div className="xl:col-span-2 space-y-4">
                        {/* List Unit Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[340px]">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="font-bold text-gray-800 text-[13px] tracking-tight">List Unit - Maintenance Control</h2>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-xs text-left whitespace-nowrap">
                                    <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-3 py-2.5 font-bold text-center w-8">No</th>
                                            <th className="px-3 py-2.5 font-bold">Kode Unit</th>
                                            <th className="px-3 py-2.5 font-bold">Equipment</th>
                                            <th className="px-3 py-2.5 font-bold">Lokasi</th>
                                            <th className="px-3 py-2.5 font-bold text-right">HM</th>
                                            <th className="px-3 py-2.5 font-bold text-center">Status</th>
                                            <th className="px-3 py-2.5 font-bold">Pekerjaan Saat Ini</th>
                                            <th className="px-3 py-2.5 font-bold">PIC</th>
                                            <th className="px-3 py-2.5 font-bold">Target Finish</th>
                                            <th className="px-3 py-2.5 font-bold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-600">
                                        {mccUnits.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-3 py-2 text-center text-gray-400">{item.id}</td>
                                                <td className="px-3 py-2 font-bold text-gray-900">{item.code_unit}</td>
                                                <td className="px-3 py-2">{item.equipment}</td>
                                                <td className="px-3 py-2">{item.lokasi}</td>
                                                <td className="px-3 py-2 text-right font-mono">{item.hm}</td>
                                                <td className="px-3 py-2 text-center">{getStatusBadge(item.status)}</td>
                                                <td className="px-3 py-2">{item.pekerjaan}</td>
                                                <td className="px-3 py-2">{item.pic}</td>
                                                <td className="px-3 py-2">{item.target}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button className="bg-[#3b82f6] text-white p-1 rounded shadow-sm hover:bg-blue-600" title="View"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                                        <button className="bg-gray-100 text-gray-600 p-1 rounded shadow-sm border border-gray-200 hover:bg-gray-200" title="Edit"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-2 border-t border-gray-100 bg-white text-xs text-gray-500 flex justify-between items-center">
                                <div>Menampilkan 1 - 10 dari {mccStats.total_unit} data</div>
                                <div className="flex gap-1 items-center">
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">«</button>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">‹</button>
                                    <button className="w-6 h-6 rounded bg-[#10b981] text-white font-bold flex items-center justify-center">1</button>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">2</button>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">3</button>
                                    <span className="px-1">...</span>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">19</button>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">›</button>
                                    <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">»</button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid for Left Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upcoming Maintenance */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[200px]">
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                    <h2 className="font-bold text-gray-800 text-sm tracking-tight">Upcoming Maintenance</h2>
                                    <button className="bg-[#ef4444] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-red-600 transition">Lihat Semua</button>
                                </div>
                                <div className="overflow-x-auto flex-1 p-2">
                                    <table className="w-full text-[9px] text-left">
                                        <thead className="text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="pb-1 font-bold">Tanggal</th>
                                                <th className="pb-1 font-bold">Kode Unit</th>
                                                <th className="pb-1 font-bold">Jenis Pekerjaan</th>
                                                <th className="pb-1 font-bold">Interval (HM)</th>
                                                <th className="pb-1 font-bold text-right">Next HM</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {upcomingMaintenance.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1.5 text-gray-600">{item.tanggal}</td>
                                                    <td className="py-1.5 font-bold text-gray-900">{item.kode_unit}</td>
                                                    <td className="py-1.5 text-gray-600">{item.jenis}</td>
                                                    <td className="py-1.5 text-gray-600">{item.interval}</td>
                                                    <td className="py-1.5 text-right font-mono text-[#ef4444] font-bold">{item.next_hm}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Downtime */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[200px]">
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                    <h2 className="font-bold text-gray-800 text-sm tracking-tight">Unit Downtime (Top 5)</h2>
                                    <button className="bg-[#ef4444] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-red-600 transition">Lihat Semua</button>
                                </div>
                                <div className="overflow-x-auto flex-1 p-2">
                                    <table className="w-full text-[9px] text-left">
                                        <thead className="text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="pb-1 font-bold text-center w-6">No</th>
                                                <th className="pb-1 font-bold">Kode Unit</th>
                                                <th className="pb-1 font-bold text-center">Total Downtime (jam)</th>
                                                <th className="pb-1 font-bold text-center">Jumlah Event</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {topDowntime.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1.5 text-center text-gray-400">{item.no}</td>
                                                    <td className="py-1.5 font-bold text-gray-900">{item.kode_unit}</td>
                                                    <td className="py-1.5 text-center text-[#ef4444] font-bold">{item.downtime}</td>
                                                    <td className="py-1.5 text-center text-gray-600">{item.event}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="xl:col-span-1 space-y-4 flex flex-col">
                        {/* Pekerjaan Prioritas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="font-bold text-gray-800 text-sm tracking-tight">Pekerjaan Prioritas</h2>
                                <button className="bg-[#ef4444] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-red-600 transition">Lihat Semua</button>
                            </div>
                            <div className="overflow-x-auto p-2">
                                <table className="w-full text-[9px] text-left">
                                    <thead className="text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="pb-1 font-bold text-center w-6">No</th>
                                            <th className="pb-1 font-bold">Pekerjaan</th>
                                            <th className="pb-1 font-bold text-center">Prioritas</th>
                                            <th className="pb-1 font-bold">Target</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {priorityJobs.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-2 text-center text-gray-400">{item.id}</td>
                                                <td className="py-2">
                                                    <div className="font-bold text-gray-900">{item.kode_unit}</div>
                                                    <div className="text-gray-500">{item.pekerjaan}</div>
                                                </td>
                                                <td className="py-2 text-center">{getPriorityBadge(item.prioritas)}</td>
                                                <td className="py-2 text-gray-600">{item.target}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notifikasi & Alert */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="font-bold text-gray-800 text-sm tracking-tight flex items-center gap-1.5">
                                    Notifikasi & Alert
                                    <span className="bg-[#ef4444] text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">5</span>
                                </h2>
                                <button className="bg-[#ef4444] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-red-600 transition">Lihat Semua</button>
                            </div>
                            <div className="overflow-x-auto p-2">
                                <table className="w-full text-[9px] text-left">
                                    <thead className="text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="pb-1 font-bold whitespace-nowrap">Waktu</th>
                                            <th className="pb-1 font-bold">Pesan</th>
                                            <th className="pb-1 font-bold text-center">Tipe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {notifications.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-gray-500 whitespace-nowrap">{item.waktu}</td>
                                                <td className="py-2 text-gray-800 pr-2">{item.pesan}</td>
                                                <td className="py-2 text-center">{getNotifBadge(item.tipe)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-3 mt-auto">
                            <h2 className="font-bold text-gray-800 text-sm mb-2 tracking-tight">Quick Action</h2>
                            <div className="grid grid-cols-4 gap-2">
                                <button className="bg-[#10b981] hover:bg-[#059669] text-white rounded-lg flex flex-col items-center justify-center p-2 h-16 shadow-sm transition group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>
                                    <span className="text-[8px] font-bold text-center leading-tight">Buat<br/>Work Order</span>
                                </button>
                                <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg flex flex-col items-center justify-center p-2 h-16 shadow-sm transition group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                    <span className="text-[8px] font-bold text-center leading-tight">Input<br/>HM</span>
                                </button>
                                <button className="bg-[#facc15] hover:bg-[#eab308] text-white rounded-lg flex flex-col items-center justify-center p-2 h-16 shadow-sm transition group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                                    <span className="text-[8px] font-bold text-center leading-tight">Catat<br/>Pekerjaan</span>
                                </button>
                                <button className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex flex-col items-center justify-center p-2 h-16 shadow-sm transition group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                                    <span className="text-[8px] font-bold text-center leading-tight">Laporan<br/>MCC</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
