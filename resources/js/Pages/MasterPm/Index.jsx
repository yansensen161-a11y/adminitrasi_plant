import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ units, kpi, charts }) {
    const statusChartRef = useRef(null);
    const sumberChartRef = useRef(null);
    const chartInstances = useRef({});
    
    const [activeTab, setActiveTab] = useState('SEMUA UNIT');

    useEffect(() => {
        if (chartInstances.current.status) chartInstances.current.status.destroy();
        if (chartInstances.current.sumber) chartInstances.current.sumber.destroy();

        // 1. Status Plan Service (Bar)
        if (statusChartRef.current) {
            chartInstances.current.status = new Chart(statusChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['On Schedule', 'Due Soon', 'Overdue'],
                    datasets: [{
                        data: [charts.status_plan.on_schedule, charts.status_plan.due_soon, charts.status_plan.overdue],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        barThickness: 24,
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false } }
                    },
                    animation: {
                        onComplete: function() {
                            const ctx = this.ctx;
                            ctx.font = "bold 11px sans-serif";
                            ctx.fillStyle = "#1e293b";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "bottom";
                            this.data.datasets.forEach((dataset, i) => {
                                const meta = this.getDatasetMeta(i);
                                meta.data.forEach((bar, index) => {
                                    const data = dataset.data[index];
                                    ctx.fillText(data, bar.x, bar.y - 5);
                                });
                            });
                        }
                    }
                }
            });
        }

        // 2. Sumber Pekerjaan (Doughnut)
        if (sumberChartRef.current) {
            const total = charts.sumber_pekerjaan.temuan + charts.sumber_pekerjaan.backlog + charts.sumber_pekerjaan.sos_pap;
            chartInstances.current.sumber = new Chart(sumberChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Temuan', 'Backlog', 'Report SOS/PAP'],
                    datasets: [{
                        data: [charts.sumber_pekerjaan.temuan, charts.sumber_pekerjaan.backlog, charts.sumber_pekerjaan.sos_pap],
                        backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6'],
                        borderWidth: 0,
                        cutout: '75%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                },
                plugins: [{
                    id: 'textCenter',
                    beforeDraw: function(chart) {
                        var width = chart.width, height = chart.height, ctx = chart.ctx;
                        ctx.restore();
                        ctx.font = "bold 1.5em sans-serif";
                        ctx.textBaseline = "middle";
                        ctx.textAlign = "center";
                        ctx.fillStyle = "#1e293b";
                        ctx.fillText(total.toString(), width / 2, height / 2 - 10);
                        ctx.font = "0.7em sans-serif";
                        ctx.fillStyle = "#64748b";
                        ctx.fillText("Total", width / 2, height / 2 + 10);
                        ctx.save();
                    }
                }]
            });
        }
    }, [charts]);

    const getStatusBadge = (status) => {
        if (status === 'ON SCHEDULE') return <span className="bg-green-100 border border-green-200 text-green-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">{status}</span>;
        if (status === 'DUE SOON') return <span className="bg-orange-100 border border-orange-200 text-orange-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">{status}</span>;
        if (status === 'OVERDUE') return <span className="bg-red-100 border border-red-200 text-red-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">{status}</span>;
        return <span>{status}</span>;
    };

    // Calculate max value for progress bars
    const maxProgress = Math.max(charts.progress.open, charts.progress.plan, charts.progress.waiting_part, charts.progress.on_progress, charts.progress.completed);

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Plan Service Unit" />

            {/* Header */}
            <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0a4d3c] p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#0b132b] tracking-tight uppercase">MONITORING PLAN SERVICE UNIT</h1>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Monitoring jadwal service, temuan, backlog dan report SOS/PAP</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-sm font-semibold text-gray-700">Selasa, 09 September 2026<br/><span className="text-gray-400">21:05:12</span></span>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-gray-600">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white text-white text-[8px] font-bold flex items-center justify-center rounded-full">5</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-50">
                        <div className="w-7 h-7 bg-[#0b132b] rounded-full flex items-center justify-center text-white font-bold text-xs">
                            Y
                        </div>
                        <div className="flex flex-col pr-2">
                            <span className="text-xs font-extrabold text-gray-800 uppercase tracking-tight">YANSEN</span>
                            <span className="text-[9px] text-gray-500">Planner</span>
                        </div>
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Departemen</label>
                    <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#0a4d3c] focus:border-[#0a4d3c]">
                        <option>Semua</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Lokasi</label>
                    <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#0a4d3c] focus:border-[#0a4d3c]">
                        <option>Semua</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Jenis Equipment</label>
                    <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#0a4d3c] focus:border-[#0a4d3c]">
                        <option>Semua</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Status Unit</label>
                    <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#0a4d3c] focus:border-[#0a4d3c]">
                        <option>Aktif</option>
                        <option>Standby</option>
                        <option>Breakdown</option>
                    </select>
                </div>
                <div className="flex-[2] min-w-[200px] relative">
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Cari unit, model, serial, HM ..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-[#0a4d3c] focus:border-[#0a4d3c]" />
                </div>
                <div className="flex gap-2">
                    <button className="bg-[#0a4d3c] hover:bg-[#07362a] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Cari
                    </button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Reset
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0b132b] uppercase">Total Unit</div>
                        <div className="text-xl font-black text-gray-900">{kpi.total_unit.total}</div>
                        <div className="text-[9px] text-gray-500 font-medium mt-0.5">Aktif {kpi.total_unit.aktif} | Standby {kpi.total_unit.standby} | BD {kpi.total_unit.bd}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0b132b] uppercase">Plan Service Due</div>
                        <div className="text-xl font-black text-gray-900">{kpi.plan_service_due.total}</div>
                        <div className="text-[9px] text-gray-500 font-medium mt-0.5">Due Soon {kpi.plan_service_due.due_soon} | Overdue {kpi.plan_service_due.overdue}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0b132b] uppercase">Temuan</div>
                        <div className="text-xl font-black text-gray-900">{kpi.temuan.total}</div>
                        <div className="text-[9px] text-gray-500 font-medium mt-0.5">Open {kpi.temuan.open} | Process {kpi.temuan.process} | Closed {kpi.temuan.closed}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0b132b] uppercase">Backlog</div>
                        <div className="text-xl font-black text-gray-900">{kpi.backlog.total}</div>
                        <div className="text-[9px] text-gray-500 font-medium mt-0.5">Overdue {kpi.backlog.overdue} | On Schedule {kpi.backlog.on_schedule}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0b132b] uppercase">Report SOS/PAP</div>
                        <div className="text-xl font-black text-gray-900">{kpi.sos_pap.total}</div>
                        <div className="text-[9px] text-gray-500 font-medium mt-0.5">Open {kpi.sos_pap.open} | Process {kpi.sos_pap.process} | Closed {kpi.sos_pap.closed}</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 col-span-1">
                    <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">Status Plan Service</h3>
                    <div className="h-40">
                        <canvas ref={statusChartRef}></canvas>
                    </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 col-span-1 flex flex-col">
                    <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-2">Sumber Pekerjaan</h3>
                    <div className="flex-1 flex items-center justify-between">
                        <div className="w-1/2 h-36">
                            <canvas ref={sumberChartRef}></canvas>
                        </div>
                        <div className="w-1/2 pl-4 flex flex-col gap-2 justify-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-xs font-bold text-gray-600 flex-1">Temuan</span>
                                <span className="text-sm font-black">{charts.sumber_pekerjaan.temuan}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                <span className="text-xs font-bold text-gray-600 flex-1">Backlog</span>
                                <span className="text-sm font-black">{charts.sumber_pekerjaan.backlog}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-xs font-bold text-gray-600 flex-1">Report SOS/PAP</span>
                                <span className="text-sm font-black">{charts.sumber_pekerjaan.sos_pap}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 col-span-1">
                    <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">Progress Pekerjaan</h3>
                    <div className="flex flex-col gap-2">
                        {[
                            { label: 'Open', value: charts.progress.open, color: 'bg-blue-500' },
                            { label: 'Plan', value: charts.progress.plan, color: 'bg-teal-500' },
                            { label: 'Waiting Part', value: charts.progress.waiting_part, color: 'bg-yellow-400' },
                            { label: 'On Progress', value: charts.progress.on_progress, color: 'bg-blue-400' },
                            { label: 'Completed', value: charts.progress.completed, color: 'bg-green-500' }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs font-bold">
                                <span className="w-20 text-gray-600">{item.label}</span>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / maxProgress) * 100}%` }}></div>
                                </div>
                                <span className="w-4 text-right text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 col-span-1">
                    <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-3">Top 5 Unit Overdue</h3>
                    <div className="flex flex-col gap-2.5">
                        {charts.top_5_overdue.map((unit, index) => (
                            <div key={index} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-400 w-3">{index + 1}</span>
                                    <span className="font-black text-gray-800">{unit.unit}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-bold text-gray-600 w-12 text-right">{unit.current_hm.toLocaleString('id-ID')} HM</span>
                                    <span className="font-bold text-red-600 w-12 text-right">{unit.overdue_hm.toLocaleString('id-ID')} HM</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <div className="flex justify-between items-center bg-white border-b border-gray-200 px-4 py-2">
                    <div className="flex gap-1 overflow-x-auto">
                        {['SEMUA UNIT', 'DUE SOON', 'OVERDUE', 'TEMUAN', 'BACKLOG', 'SOS/PAP', 'SELESAI'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 text-xs font-bold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                                    activeTab === tab 
                                    ? 'bg-[#0a4d3c] text-white' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {tab === 'SEMUA UNIT' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>}
                                {tab === 'DUE SOON' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>}
                                {tab === 'OVERDUE' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>}
                                {tab === 'TEMUAN' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"/></svg>}
                                {tab === 'BACKLOG' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>}
                                {tab === 'SOS/PAP' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>}
                                {tab === 'SELESAI' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>}
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white border border-[#0a4d3c] text-[#0a4d3c] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Export
                        </button>
                        <button className="bg-[#0a4d3c] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#07362a] flex items-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Input Manual
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#08422c] text-white">
                            <tr>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-[#0d614b]">Unit</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-[#0d614b]">Current HM</th>
                                <th colSpan="3" className="px-3 py-1.5 font-semibold text-center border-r border-b border-[#0d614b]">Next Service 1</th>
                                <th colSpan="3" className="px-3 py-1.5 font-semibold text-center border-r border-b border-[#0d614b]">Next Service 2</th>
                                <th rowSpan="2" className="px-2 py-2 font-semibold text-center border-r border-[#0d614b]">Temuan</th>
                                <th rowSpan="2" className="px-2 py-2 font-semibold text-center border-r border-[#0d614b]">Backlog</th>
                                <th rowSpan="2" className="px-2 py-2 font-semibold text-center border-r border-[#0d614b]">SOS/PAP</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-[#0d614b]">Status Terakhir</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center">Action</th>
                            </tr>
                            <tr className="bg-[#0a4d3c]">
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">HM</th>
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">Sisa HM</th>
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">HM</th>
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">Sisa HM</th>
                                <th className="px-2 py-1.5 font-semibold text-center border-r border-[#0d614b]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => (
                                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-center text-gray-500 font-medium">{units.from + index}</td>
                                        <td className="px-3 py-2.5 text-center text-gray-900 font-black">{unit.code_unit}</td>
                                        <td className="px-3 py-2.5 text-center text-gray-600 font-medium whitespace-nowrap">{unit.equipment}</td>
                                        <td className="px-3 py-2.5 text-center font-bold text-gray-900">{unit.current_hm.toLocaleString('id-ID')}</td>
                                        
                                        {/* Next Service 1 */}
                                        <td className="px-2 py-2.5 text-center font-bold text-gray-700 bg-green-50/20 border-l border-green-50">{unit.next_service_1.hm.toLocaleString('id-ID')}</td>
                                        <td className="px-2 py-2.5 text-center font-bold text-red-600 bg-green-50/20">{unit.next_service_1.sisa_hm.toLocaleString('id-ID')}</td>
                                        <td className="px-2 py-2.5 text-center bg-green-50/20 border-r border-green-50">{getStatusBadge(unit.next_service_1.status)}</td>
                                        
                                        {/* Next Service 2 */}
                                        <td className="px-2 py-2.5 text-center font-bold text-gray-700 bg-green-50/10">{unit.next_service_2.hm.toLocaleString('id-ID')}</td>
                                        <td className="px-2 py-2.5 text-center font-bold text-gray-600 bg-green-50/10">{unit.next_service_2.sisa_hm.toLocaleString('id-ID')}</td>
                                        <td className="px-2 py-2.5 text-center bg-green-50/10 border-r border-gray-100">{getStatusBadge(unit.next_service_2.status)}</td>

                                        {/* Temuan */}
                                        <td className="px-2 py-2.5 text-center">
                                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white font-bold text-[9px] ${unit.temuan > 0 ? 'bg-red-500' : 'bg-green-500'}`}>{unit.temuan}</span>
                                        </td>
                                        {/* Backlog */}
                                        <td className="px-2 py-2.5 text-center">
                                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white font-bold text-[9px] ${unit.backlog > 0 ? 'bg-orange-500' : 'bg-green-500'}`}>{unit.backlog}</span>
                                        </td>
                                        {/* SOS/PAP */}
                                        <td className="px-2 py-2.5 text-center">
                                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white font-bold text-[9px] ${unit.sos_pap > 0 ? 'bg-purple-500' : 'bg-green-500'}`}>{unit.sos_pap}</span>
                                        </td>

                                        <td className="px-3 py-2.5 text-center text-gray-600 font-medium">{unit.status_terakhir}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            <button className="flex items-center justify-center gap-1 text-gray-500 hover:text-[#0a4d3c] mx-auto border border-gray-200 hover:border-[#0a4d3c] hover:bg-[#0a4d3c]/5 px-2 py-1 rounded transition-colors">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                <span>Detail</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="14" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data unit yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                    <div>Menampilkan {units.from || 0} - {units.to || 0} dari {units.total || 0} data</div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0a4d3c] text-white font-bold">1</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">3</button>
                            <span className="w-6 h-6 flex items-center justify-center text-gray-400">...</span>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">13</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                        <select className="border border-gray-200 text-gray-600 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#0a4d3c]">
                            <option>10 / halaman</option>
                            <option>25 / halaman</option>
                            <option>50 / halaman</option>
                        </select>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
