import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function MagneticPlug({ auth, data, filters = {}, kpi = {} }) {
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [metodeFilter, setMetodeFilter] = useState(filters.metodeFilter || '');
    const [componentFilter, setComponentFilter] = useState(filters.componentFilter || '');
    const [ratingFilter, setRatingFilter] = useState(filters.ratingFilter || '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleFilterSubmit = () => {
        router.get(route('repair.magnetic-plug'), {
            codeUnitFilter,
            metodeFilter,
            componentFilter,
            ratingFilter,
            dateFrom,
            dateTo
        }, { preserveState: true });
    };

    const handleReset = () => {
        setCodeUnitFilter('');
        setMetodeFilter('');
        setComponentFilter('');
        setRatingFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('repair.magnetic-plug'), {}, { preserveState: true });
    };

    // Use KPI from backend
    const totalInspeksi = kpi.totalInspeksi || 0;
    const ratingACount = kpi.ratingACount || 0;
    const ratingBCount = kpi.ratingBCount || 0;
    const ratingCCount = kpi.ratingCCount || 0;
    const ratingXCount = kpi.ratingXCount || 0;

    const ratingAPerc = totalInspeksi ? ((ratingACount / totalInspeksi) * 100).toFixed(1) : 0;
    const ratingBPerc = totalInspeksi ? ((ratingBCount / totalInspeksi) * 100).toFixed(1) : 0;
    const ratingCPerc = totalInspeksi ? ((ratingCCount / totalInspeksi) * 100).toFixed(1) : 0;
    const ratingXPerc = totalInspeksi ? ((ratingXCount / totalInspeksi) * 100).toFixed(1) : 0;

    // Chart Refs
    const trendChartRef = useRef(null);
    const distChartRef = useRef(null);
    const topUnitChartRef = useRef(null);
    const chartInstances = useRef({});

    useEffect(() => {
        // Destroy old charts
        if (chartInstances.current.trend) chartInstances.current.trend.destroy();
        if (chartInstances.current.dist) chartInstances.current.dist.destroy();
        if (chartInstances.current.top) chartInstances.current.top.destroy();

        // 1. Trend Chart
        if (trendChartRef.current) {
            chartInstances.current.trend = new Chart(trendChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    datasets: [
                        { label: 'Rating A', data: [15, 14, 15, 14, 12, 14, 13, 15, 10], backgroundColor: '#22c55e' },
                        { label: 'Rating B', data: [4, 4, 3, 3, 3, 3, 3, 3, 2], backgroundColor: '#eab308' },
                        { label: 'Rating C', data: [1, 1, 1, 1, 1, 1, 1, 1, 0], backgroundColor: '#ef4444' },
                        { label: 'Rating X', data: [0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#374151' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 25 } },
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } }
                }
            });
        }

        // 2. Distribusi Chart
        if (distChartRef.current) {
            chartInstances.current.dist = new Chart(distChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Rating A', 'Rating B', 'Rating C', 'Rating X'],
                    datasets: [{
                        data: [ratingACount, ratingBCount, ratingCCount, ratingXCount],
                        backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#374151'],
                        borderWidth: 0,
                        cutout: '65%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } }
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
                        var text = totalInspeksi.toString(), textX = width / 2, textY = height / 2 - 10;
                        ctx.fillText(text, textX, textY);
                        ctx.font = (fontSize * 0.4) + "em sans-serif";
                        ctx.fillStyle = "#64748b";
                        ctx.fillText("Inspeksi", textX, textY + 20);
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
                    labels: ['EX-056', 'HD785-12', 'TRK-01', 'D85-01', 'GD655-01'],
                    datasets: [{
                        data: [8, 6, 5, 4, 3],
                        backgroundColor: ['#ef4444', '#f97316', '#facc15', '#3b82f6', '#0ea5e9'],
                        barThickness: 16
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        x: { display: false, max: 10 },
                        y: { border: { display: false }, grid: { display: false } }
                    },
                    plugins: { 
                        legend: { display: false },
                        datalabels: { display: false }
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
    
    // Status Badge Helpers
    const renderMetodeBadge = (metode) => {
        if (metode === 'Magnetic Plug') return <span className="text-green-700 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap">{metode}</span>;
        if (metode === 'Cutting Filter') return <span className="text-blue-600 bg-blue-50 border border-blue-200 font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap">{metode}</span>;
        if (metode === 'Check Cylinder') return <span className="text-purple-600 bg-purple-50 border border-purple-200 font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap">{metode}</span>;
        if (metode === 'Check Strainer') return <span className="text-orange-600 bg-orange-50 border border-orange-200 font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap">{metode}</span>;
        return <span className="text-gray-600 bg-gray-50 border border-gray-200 font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap">{metode}</span>;
    };

    const renderRatingBadge = (rating) => {
        if (rating === 'Rating A') return <span className="text-green-700 bg-green-100 border border-green-300 font-bold px-2 py-0.5 rounded text-xs">{rating}</span>;
        if (rating === 'Rating B') return <span className="text-yellow-700 bg-yellow-100 border border-yellow-300 font-bold px-2 py-0.5 rounded text-xs">{rating}</span>;
        if (rating === 'Rating C') return <span className="text-red-700 bg-red-100 border border-red-300 font-bold px-2 py-0.5 rounded text-xs">{rating}</span>;
        if (rating === 'Rating X') return <span className="text-white bg-gray-700 border border-gray-800 font-bold px-2 py-0.5 rounded text-xs">{rating}</span>;
        return <span className="text-gray-600 font-bold px-2 py-0.5 text-xs">{rating}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Magnetic Plug" />

            {/* Header */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0b5c3e] p-2 rounded-lg text-white shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-[#0b132b] tracking-tight uppercase">MONITORING MAGNETIC PLUG</h1>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Monitoring Pemeriksaan Magnetic Plug dan Filter</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link href={route('repair.magnetic-plug.create')} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Input Data
                    </Link>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current text-gray-500" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Import Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current text-gray-500" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                        Print
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Total Inspeksi */}
                    <div className="bg-blue-500 text-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold opacity-90">Total Inspeksi</div>
                            <div className="text-2xl font-black">{totalInspeksi}</div>
                        </div>
                    </div>

                    {/* Rating A */}
                    <div className="bg-green-500 text-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div>
                            <div className="text-xs font-semibold opacity-90">Rating A</div>
                            <div className="text-2xl font-black">{ratingACount}</div>
                            <div className="text-xs opacity-90">({ratingAPerc}%)</div>
                        </div>
                    </div>

                    {/* Rating B */}
                    <div className="bg-yellow-500 text-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div>
                            <div className="text-xs font-semibold opacity-90">Rating B</div>
                            <div className="text-2xl font-black">{ratingBCount}</div>
                            <div className="text-xs opacity-90">({ratingBPerc}%)</div>
                        </div>
                    </div>

                    {/* Rating C */}
                    <div className="bg-red-500 text-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div>
                            <div className="text-xs font-semibold opacity-90">Rating C</div>
                            <div className="text-2xl font-black">{ratingCCount}</div>
                            <div className="text-xs opacity-90">({ratingCPerc}%)</div>
                        </div>
                    </div>

                    {/* Rating X */}
                    <div className="bg-gray-700 text-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                        <div>
                            <div className="text-xs font-semibold opacity-90">Rating X</div>
                            <div className="text-2xl font-black">{ratingXCount}</div>
                            <div className="text-xs opacity-90">({ratingXPerc}%)</div>
                        </div>
                    </div>
                </div>
                
                {/* Filter Box */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                    <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">FILTER PENCARIAN</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Code Unit</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Pilih / Ketik Code Unit</option>
                                <option value="ME052">ME052</option>
                                <option value="ME067">ME067</option>
                                <option value="OHT070">OHT070</option>
                                <option value="OHT072">OHT072</option>
                                <option value="MDT030">MDT030</option>
                                <option value="MD037">MD037</option>
                                <option value="MD048">MD048</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Metode Filter</label>
                            <select value={metodeFilter} onChange={e => setMetodeFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Metode</option>
                                <option value="Magnetic Plug">Magnetic Plug</option>
                                <option value="Cutting Filter">Cutting Filter</option>
                                <option value="Check Cylinder">Check Cylinder</option>
                                <option value="Check Strainer">Check Strainer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Component Filter</label>
                            <select value={componentFilter} onChange={e => setComponentFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Component</option>
                                <option value="Differential">Differential</option>
                                <option value="Final Drive LH">Final Drive LH</option>
                                <option value="Final Drive RH">Final Drive RH</option>
                                <option value="Front Wheel LH">Front Wheel LH</option>
                                <option value="Front Wheel RH">Front Wheel RH</option>
                                <option value="Transmission">Transmission</option>
                                <option value="Hydraulic System">Hydraulic System</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Rating</option>
                                <option value="Rating A">Rating A</option>
                                <option value="Rating B">Rating B</option>
                                <option value="Rating C">Rating C</option>
                                <option value="Rating X">Rating X</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date From</label>
                            <div className="relative">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date To</label>
                            <div className="relative">
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" />
                            </div>
                        </div>
                        <div className="col-span-2 flex items-end justify-end gap-2">
                            <button onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-lg text-sm transition border border-gray-200 flex items-center justify-center gap-1.5 shadow-sm h-[38px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                                Reset
                            </button>
                            <button onClick={handleFilterSubmit} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-sm h-[38px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                Cari
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
                    {/* Trend Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 lg:col-span-1">
                        <h3 className="text-sm font-extrabold text-[#0b132b] mb-4">Trend Hasil Inspeksi Magnetic Plug</h3>
                        <div className="h-48">
                            <canvas ref={trendChartRef}></canvas>
                        </div>
                    </div>

                    {/* Distribusi Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 lg:col-span-1 flex flex-col">
                        <h3 className="text-sm font-extrabold text-[#0b132b] mb-2">Distribusi Kondisi</h3>
                        <div className="h-44 relative flex-1 flex items-center">
                            <div className="w-1/2 h-full flex justify-center">
                                <canvas ref={distChartRef}></canvas>
                            </div>
                            <div className="w-1/2 flex flex-col justify-center gap-3 pl-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="w-3 h-3 rounded-sm bg-green-500 shrink-0"></span>
                                    <span className="flex-1">Rating A</span>
                                    <span>{ratingACount} <span className="text-gray-400 font-medium">({ratingAPerc}%)</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="w-3 h-3 rounded-sm bg-yellow-500 shrink-0"></span>
                                    <span className="flex-1">Rating B</span>
                                    <span>{ratingBCount} <span className="text-gray-400 font-medium">({ratingBPerc}%)</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="w-3 h-3 rounded-sm bg-red-500 shrink-0"></span>
                                    <span className="flex-1">Rating C</span>
                                    <span>{ratingCCount} <span className="text-gray-400 font-medium">({ratingCPerc}%)</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <span className="w-3 h-3 rounded-sm bg-gray-700 shrink-0"></span>
                                    <span className="flex-1">Rating X</span>
                                    <span>{ratingXCount} <span className="text-gray-400 font-medium">({ratingXPerc}%)</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Unit Chart */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 lg:col-span-1">
                        <h3 className="text-sm font-extrabold text-[#0b132b] mb-4">Top 5 Unit dengan Temuan Partikel</h3>
                        <div className="h-48">
                            <canvas ref={topUnitChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200">
                        <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">DATA MONITORING MAGNETIC PLUG</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 font-bold">No</th>
                                    <th className="px-3 py-3 font-bold">Code Unit</th>
                                    <th className="px-3 py-3 font-bold">HM</th>
                                    <th className="px-3 py-3 font-bold">Date</th>
                                    <th className="px-3 py-3 font-bold">Metode Filter</th>
                                    <th className="px-3 py-3 font-bold text-left">Component Filter</th>
                                    <th className="px-3 py-3 font-bold">Picture</th>
                                    <th className="px-3 py-3 font-bold">Rating</th>
                                    <th className="px-3 py-3 font-bold text-left">Remarks</th>
                                    <th className="px-3 py-3 font-bold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-800">
                                {((data && data.data) ? data.data : (Array.isArray(data) ? data : [])).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-2">{(data && data.from) ? data.from + idx : idx + 1}</td>
                                        <td className="px-3 py-2 font-medium">{row.unit?.code_unit || row.code_unit || '-'}</td>
                                        <td className="px-3 py-2">{row.hm}</td>
                                        <td className="px-3 py-2">{row.date}</td>
                                        <td className="px-3 py-2">{renderMetodeBadge(row.metode_filter)}</td>
                                        <td className="px-3 py-2 text-left">{row.component}</td>
                                        <td className="px-3 py-2">
                                            {row.photo_path ? (
                                                <a href={`/storage/${row.photo_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">Lihat Foto</a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">{renderRatingBadge(row.rating)}</td>
                                        <td className="px-3 py-2 text-left">{row.remarks}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-center items-center gap-3">
                                                <button className="text-blue-800 hover:text-blue-600" title="View">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </button>
                                                <button className="text-green-600 hover:text-green-800" title="Edit">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                </button>
                                                <button className="text-red-500 hover:text-red-700" title="Delete">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {data?.links && data.links.length > 3 && (
                        <div className="px-5 py-3 flex justify-between items-center text-sm text-gray-500 border-t border-gray-200">
                            <div>
                                Menampilkan {data.from || 0} - {data.to || 0} dari {data.total || 0} data
                            </div>
                            <div className="flex gap-1">
                                {data.links.map((link, k) => (
                                    <Link
                                        key={k}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`w-7 h-7 flex items-center justify-center rounded border ${
                                            link.active 
                                                ? 'border-[#0b5c3e] bg-[#0b5c3e] text-white font-bold' 
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Gallery & Rekomendasi */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 lg:col-span-3">
                        <h3 className="text-sm font-extrabold text-[#0b132b] mb-4">Contoh Kondisi Magnetic Plug</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <div className="bg-gray-100 rounded-t-lg h-24 flex items-center justify-center p-2">
                                    {/* Placeholder for real image */}
                                    <img src="https://ui-avatars.com/api/?name=Rating+A&background=f3f4f6&color=9ca3af&size=128" alt="Rating A" className="h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="bg-green-600 text-white text-center text-xs font-bold py-1.5 rounded-b-lg">Rating A - Normal</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="bg-gray-100 rounded-t-lg h-24 flex items-center justify-center p-2">
                                    <img src="https://ui-avatars.com/api/?name=Rating+B&background=f3f4f6&color=9ca3af&size=128" alt="Rating B" className="h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="bg-yellow-500 text-white text-center text-xs font-bold py-1.5 rounded-b-lg">Rating B - Average Wear</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="bg-gray-100 rounded-t-lg h-24 flex items-center justify-center p-2">
                                    <img src="https://ui-avatars.com/api/?name=Rating+C&background=f3f4f6&color=9ca3af&size=128" alt="Rating C" className="h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="bg-red-600 text-white text-center text-xs font-bold py-1.5 rounded-b-lg">Rating C</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="bg-gray-100 rounded-t-lg h-24 flex items-center justify-center p-2">
                                    <img src="https://ui-avatars.com/api/?name=Rating+X&background=f3f4f6&color=9ca3af&size=128" alt="Rating X" className="h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="bg-gray-700 text-white text-center text-xs font-bold py-1.5 rounded-b-lg">Rating X - Abnormal</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 col-span-1 lg:col-span-1">
                        <h3 className="text-sm font-extrabold text-[#0b132b] mb-4">Rekomendasi Tindak Lanjut</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 fill-current text-green-600 mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                Lakukan inspeksi magnetic plug secara berkala sesuai interval PM
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 fill-current text-green-600 mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                Analisa jenis dan jumlah partikel yang ditemukan
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 fill-current text-green-600 mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                Jika ditemukan partikel banyak/serpihan, lakukan inspeksi lebih lanjut pada komponen terkait
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 fill-current text-green-600 mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                Lakukan penggantian oli sesuai jadwal
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 fill-current text-green-600 mt-0.5 shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                Catat hasil inspeksi dalam sistem untuk trend monitoring
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
