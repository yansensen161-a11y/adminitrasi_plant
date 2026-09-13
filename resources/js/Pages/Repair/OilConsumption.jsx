import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Droplet, 
    ClipboardList,
    Shield,
    Receipt,
    Calendar,
    Download,
    Printer,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit3,
    Trash2,
    Filter
} from 'lucide-react';
import Chart from 'chart.js/auto';

export default function OilConsumption({ tableData, chartData, summary }) {
    // FIX: Define all missing state variables that caused the white screen crash
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [codeUnitFilter, setCodeUnitFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');
    const [typeOliFilter, setTypeOliFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [hmFromFilter, setHmFromFilter] = useState('');
    const [hmToFilter, setHmToFilter] = useState('');

    const trendChartRef = useRef(null);
    const distChartRef = useRef(null);
    const topUnitChartRef = useRef(null);
    const chartInstances = useRef({});

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setModelFilter('');
        setTypeOliFilter('');
        setDepartmentFilter('');
        setHmFromFilter('');
        setHmToFilter('');
        router.get(route('repair.oil-consumption'));
    };

    const handleFilterSubmit = () => {
        router.get(route('repair.oil-consumption'), {
            dateFrom, dateTo, codeUnitFilter, modelFilter, typeOliFilter, departmentFilter, hmFromFilter, hmToFilter
        }, { preserveState: true });
    };

    useEffect(() => {
        if (chartInstances.current.trend) chartInstances.current.trend.destroy();
        if (chartInstances.current.dist) chartInstances.current.dist.destroy();
        if (chartInstances.current.top) chartInstances.current.top.destroy();

        // 1. Trend Chart (Mixed: Bar + Line)
        if (trendChartRef.current) {
            chartInstances.current.trend = new Chart(trendChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'],
                    datasets: [
                        {
                            type: 'line',
                            label: 'Rata-rata (L/100 HM)',
                            data: [0.26, 0.25, 0.24, 0.23, 0.22, 0.20, 0.21, 0.23, 0.22],
                            borderColor: '#3b82f6', // blue-500
                            backgroundColor: '#3b82f6',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointBackgroundColor: '#3b82f6',
                            yAxisID: 'y1'
                        },
                        {
                            type: 'bar',
                            label: 'Total Konsumsi (Liter)',
                            data: [620, 580, 710, 650, 520, 480, 510, 560, 520],
                            backgroundColor: '#10b981', // emerald-500
                            barThickness: 16,
                            yAxisID: 'y'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Konsumsi (Liter)', font: { size: 10 } },
                            min: 0, max: 1000
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'L/1000 HM', font: { size: 10 } },
                            min: 0, max: 1.0,
                            grid: { drawOnChartArea: false }
                        }
                    },
                    plugins: {
                        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } }
                    }
                }
            });
        }

        // 2. Distribusi Chart
        if (distChartRef.current) {
            chartInstances.current.dist = new Chart(distChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Excavator', 'Hauler', 'Dozer', 'Motor Grader', 'Truck', 'Lainnya'],
                    datasets: [{
                        data: [1620, 980, 620, 480, 460, 360],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
                        borderWidth: 0,
                        cutout: '65%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false }
                    }
                },
                plugins: [{
                    id: 'textCenter',
                    beforeDraw: function(chart) {
                        var width = chart.width, height = chart.height, ctx = chart.ctx;
                        ctx.restore();
                        var fontSize = (height / 100).toFixed(2);
                        ctx.font = "bold " + fontSize + "em sans-serif";
                        ctx.textBaseline = "middle";
                        ctx.textAlign = "center";
                        ctx.fillStyle = "#1e293b";
                        var text = "4,520", textX = width / 2, textY = height / 2 - 10;
                        ctx.fillText(text, textX, textY);
                        ctx.font = (fontSize * 0.4) + "em sans-serif";
                        ctx.fillStyle = "#64748b";
                        ctx.fillText("Liter", textX, textY + 20);
                        ctx.save();
                    }
                }]
            });
        }

        // 3. Top 5 Unit Chart
        if (topUnitChartRef.current) {
            chartInstances.current.top = new Chart(topUnitChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['EX-057', 'HD785-12', 'TRK-03', 'D85-01', 'GD655-01'],
                    datasets: [{
                        data: [0.92, 0.88, 0.76, 0.65, 0.62],
                        backgroundColor: ['#ef4444', '#f97316', '#facc15', '#3b82f6', '#0ea5e9'],
                        barThickness: 16
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        x: { display: false, max: 1.0 },
                        y: { border: { display: false }, grid: { display: false } }
                    },
                    plugins: { 
                        legend: { display: false }
                    },
                    animation: {
                        onComplete: function() {
                            const ctx = this.ctx;
                            ctx.font = "bold 11px sans-serif";
                            ctx.fillStyle = "#1e293b";
                            ctx.textAlign = "left";
                            ctx.textBaseline = "middle";
                            this.data.datasets.forEach((dataset, i) => {
                                const meta = this.getDatasetMeta(i);
                                meta.data.forEach((bar, index) => {
                                    const data = dataset.data[index];
                                    ctx.fillText(data, bar.x + 5, bar.y);
                                });
                            });
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstances.current.trend) chartInstances.current.trend.destroy();
            if (chartInstances.current.dist) chartInstances.current.dist.destroy();
            if (chartInstances.current.top) chartInstances.current.top.destroy();
        };
    }, []);

    const getColorForHM = (val) => {
        const num = parseFloat(val);
        if (num <= 6) return 'text-emerald-600';
        if (num <= 10) return 'text-amber-500';
        return 'text-red-600';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white shadow-sm">
                            <Droplet size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                                OIL CONSUMPTION
                            </h2>
                            <div className="text-sm text-gray-500 font-medium mt-0.5">
                                Home <span className="mx-1">&gt;</span> Component & Condition Monitoring <span className="mx-1">&gt;</span> <span className="text-gray-800 font-bold">Oil Consumption</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Plus size={16} />
                            <span>Input Data</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Download size={16} />
                            <span>Import Excel</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Download size={16} />
                            <span>Export Excel</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Printer size={16} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Oil Consumption" />

            <div className="space-y-6">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Unit */}
                    <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 flex items-center gap-4">
                        <div className="text-blue-500 flex items-center justify-center shrink-0">
                            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">Total Unit</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800">86</div>
                                <div className="text-sm text-gray-600 font-medium">Unit</div>
                            </div>
                        </div>
                    </div>

                    {/* Total Konsumsi Oli */}
                    <div className="bg-emerald-50/80 rounded-xl border border-emerald-100 p-4 flex items-center gap-4">
                        <div className="text-emerald-600 flex items-center justify-center shrink-0">
                            <Droplet size={40} className="fill-emerald-600 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">Total Konsumsi Oli</div>
                            <div className="flex items-end gap-3">
                                <div className="flex flex-col">
                                    <div className="text-2xl font-black text-gray-800">4,520</div>
                                    <div className="text-sm text-gray-600 font-medium">Liter</div>
                                </div>
                                <div className="flex flex-col pb-1">
                                    <span className="text-emerald-600 flex items-center text-xs font-bold"><svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg> -12%</span>
                                    <span className="text-gray-500 text-[9px]">dari bulan lalu</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rata-rata Konsumsi */}
                    <div className="bg-amber-50/80 rounded-xl border border-amber-100 p-4 flex items-center gap-4">
                        <div className="text-amber-500 flex items-center justify-center shrink-0">
                            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">Rata-rata Konsumsi</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800">0.38</div>
                                <div className="text-sm text-gray-600 font-medium">Liter / 100 HM</div>
                            </div>
                        </div>
                    </div>

                    {/* Unit Over Limit */}
                    <div className="bg-rose-50/80 rounded-xl border border-rose-100 p-4 flex items-center gap-4">
                        <div className="text-rose-600 flex items-center justify-center shrink-0">
                            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">Unit Over Limit</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-rose-600">12</div>
                                <div className="text-sm text-rose-600 font-medium">Unit (14.0%)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Periode</label>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <div className="pl-3 pr-2 text-gray-400">
                                    <Calendar size={14} />
                                </div>
                                <input type="text" placeholder="01/09/2026 - 30/09/2026" className="w-full text-sm border-0 py-1.5 focus:ring-0 text-gray-600" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Jenis Unit</label>
                            <select value={modelFilter} onChange={e => setModelFilter(e.target.value)} className="w-full text-sm border-gray-200 py-1.5 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] text-gray-600">
                                <option value="">Semua</option>
                                <option value="Excavator">Excavator</option>
                                <option value="Hauler">Hauler</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Model</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full text-sm border-gray-200 py-1.5 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] text-gray-600">
                                <option value="">Semua</option>
                                <option value="EX-057">EX-057</option>
                                <option value="HD785-12">HD785-12</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Department</label>
                            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full text-sm border-gray-200 py-1.5 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] text-gray-600">
                                <option value="">Semua</option>
                                <option value="Mining">Mining</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                            <select className="w-full text-sm border-gray-200 py-1.5 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] text-gray-600">
                                <option value="">Semua</option>
                                <option value="Over Limit">Over Limit</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>
                        
                        <div className="col-span-1 lg:col-span-3"></div>

                        <div className="col-span-1 lg:col-span-2 flex justify-end gap-2">
                            <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                <div className="pl-3 pr-2 text-gray-400">
                                    <Search size={14} />
                                </div>
                                <input type="text" placeholder="Cari kode unit atau deskripsi..." className="w-full text-sm border-0 py-1.5 focus:ring-0 text-gray-600" />
                            </div>
                            <button onClick={handleFilterSubmit} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shrink-0">
                                <Search size={14} />
                                <span>Cari</span>
                            </button>
                            <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-colors shrink-0">
                                <RefreshCw size={14} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Trend Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-4">Trend Konsumsi Oli</h3>
                        <div className="h-48">
                            <canvas ref={trendChartRef}></canvas>
                        </div>
                    </div>

                    {/* Distribusi Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 flex flex-col">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-2">Distribusi Konsumsi per Jenis Unit</h3>
                        <div className="h-48 relative flex-1 flex items-center">
                            <div className="w-1/2 h-full flex justify-center">
                                <canvas ref={distChartRef}></canvas>
                            </div>
                            <div className="w-1/2 flex flex-col justify-center gap-1.5 pl-2">
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0"></span> Excavator</div>
                                    <div className="text-right">1,620 <span className="text-gray-400 font-medium">(35.8%)</span></div>
                                </div>
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0"></span> Hauler</div>
                                    <div className="text-right">980 <span className="text-gray-400 font-medium">(21.7%)</span></div>
                                </div>
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0"></span> Dozer</div>
                                    <div className="text-right">620 <span className="text-gray-400 font-medium">(13.7%)</span></div>
                                </div>
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 shrink-0"></span> Motor Grader</div>
                                    <div className="text-right">480 <span className="text-gray-400 font-medium">(10.6%)</span></div>
                                </div>
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0"></span> Truck</div>
                                    <div className="text-right">460 <span className="text-gray-400 font-medium">(10.2%)</span></div>
                                </div>
                                <div className="flex items-center text-xs font-bold text-gray-700 w-full justify-between">
                                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-500 shrink-0"></span> Lainnya</div>
                                    <div className="text-right">360 <span className="text-gray-400 font-medium">(8.0%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Unit Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-4">Top 5 Unit dengan Konsumsi Tertinggi <span className="text-gray-500 font-medium text-sm">(L/100 HM)</span></h3>
                        <div className="h-44">
                            <canvas ref={topUnitChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 flex justify-between items-center bg-white">
                        <h3 className="text-sm font-extrabold text-gray-800">Data Oil Consumption</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="text-sm font-bold text-gray-600 bg-gray-50 border-y border-gray-200">
                                    <th className="px-3 py-3 border-r border-gray-200">No</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Tanggal</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Kode Unit</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Equipment</th>
                                    <th className="px-3 py-3 border-r border-gray-200">HM Awal</th>
                                    <th className="px-3 py-3 border-r border-gray-200">HM Akhir</th>
                                    <th className="px-3 py-3 border-r border-gray-200">HM Jalan</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Oil Refill (Liter)</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Konsumsi (L/100 HM)</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Batas Normal</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Status</th>
                                    <th className="px-3 py-3 border-r border-gray-200">Keterangan</th>
                                    <th className="px-3 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {tableData && tableData.length > 0 ? tableData.map((row, idx) => {
                                    const batasNormal = row.department?.toLowerCase().includes('hauler') || row.model?.toLowerCase().includes('hauler') ? 0.60 : 0.50;
                                    const val = parseFloat(row.l_per_1000 || 0);
                                    const isOverLimit = val > batasNormal;
                                    
                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="px-3 py-3 text-gray-500 font-medium text-sm">{idx + 1}</td>
                                            <td className="px-3 py-3 text-gray-800 font-medium text-sm whitespace-nowrap">{row.date}</td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{row.code_unit}</td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{row.model}</td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{row.hm_prev}</td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{row.hm}</td>
                                            <td className="px-3 py-3 text-gray-800 text-sm">{row.hm_diff}</td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{row.pengisian}</td>
                                            
                                            <td className={`px-3 py-3 font-bold text-sm ${isOverLimit ? 'text-red-600' : 'text-gray-800'}`}>
                                                {row.l_per_1000}
                                            </td>
                                            <td className="px-3 py-3 text-gray-600 text-sm">{batasNormal.toFixed(2)}</td>
                                            
                                            <td className="px-3 py-3">
                                                {isOverLimit ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                                                        Over Limit
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider">
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                            
                                            <td className="px-3 py-3 text-gray-600 text-xs text-left">{row.remarks || 'Normal'}</td>
                                            
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded flex items-center justify-center transition-colors">
                                                        <Eye size={12} />
                                                    </button>
                                                    <button className="bg-amber-500 hover:bg-amber-600 text-white p-1 rounded flex items-center justify-center transition-colors">
                                                        <Edit3 size={12} />
                                                    </button>
                                                    <button className="bg-red-500 hover:bg-red-600 text-white p-1 rounded flex items-center justify-center transition-colors">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="13" className="px-3 py-6 text-center text-gray-500 text-sm">Tidak ada data</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500 font-medium">
                            Menampilkan 1 - {tableData ? tableData.length : 0} dari {summary?.total_pengisian || 0} data
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded bg-emerald-600 text-white font-bold">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">3</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">4</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">5</button>
                            <span className="text-gray-400 px-1 text-sm">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">9</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&gt;</button>
                            <select className="ml-2 text-sm border-gray-200 rounded py-1 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]">
                                <option>10 / halaman</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Standar Batas Konsumsi Oli */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-4 border-b pb-2">Standar Batas Konsumsi Oli <span className="text-gray-500 font-medium text-sm">(L/100 HM)</span></h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="font-bold text-gray-700">Jenis Unit</span>
                                <span className="font-bold text-gray-700">Batas Normal</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Excavator</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Hauler</span><span className="font-medium text-gray-800">0.60</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Dozer</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Motor Grader</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Truck</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-600">Compactor</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Lainnya</span><span className="font-medium text-gray-800">0.50</span>
                            </div>
                        </div>
                    </div>

                    {/* Analisa & Rekomendasi */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-4 border-b pb-2">Analisa & Rekomendasi</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-amber-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    <span className="font-bold text-gray-800">12 unit (14.0%)</span> melebihi batas konsumsi normal
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    Rata-rata konsumsi oli bulan ini 0.38 L/100 HM (turun 12%)
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    Lakukan inspeksi pada unit dengan konsumsi tinggi
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    Periksa kemungkinan kebocoran pada seal, gasket, dan filter oli
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    Gunakan oli sesuai spesifikasi pabrikan
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    Monitor tren konsumsi secara berkala
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Foto / Bukti */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-4 border-b pb-2">Foto / Bukti</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center">
                                <div className="aspect-[4/3] bg-gray-100 rounded-lg w-full mb-2 overflow-hidden flex items-center justify-center">
                                    <img src="https://images.unsplash.com/photo-1635889396347-1065ea0e9cc0?w=200&h=150&fit=crop" alt="Kebocoran" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">Kebocoran Seal</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="aspect-[4/3] bg-gray-100 rounded-lg w-full mb-2 overflow-hidden flex items-center justify-center">
                                    <img src="https://images.unsplash.com/photo-1621516087532-61d02c65aeb0?w=200&h=150&fit=crop" alt="Kondisi Oli" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">Kondisi Oli</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="aspect-[4/3] bg-gray-100 rounded-lg w-full mb-2 overflow-hidden flex items-center justify-center">
                                    <img src="https://images.unsplash.com/photo-1600705680196-857e43486337?w=200&h=150&fit=crop" alt="Filter Oli" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">Filter Oli</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
