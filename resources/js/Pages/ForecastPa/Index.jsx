import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function ForecastPaIndex({
    kpiBudget,
    chartForecastRealisasi,
    chartDistribusiKategori,
    chartTopUnit,
    tableDetailForecast,
    rekapDepartment,
    rekapKategori
}) {
    const forecastChartRef = useRef(null);
    const distribusiChartRef = useRef(null);
    const topUnitChartRef = useRef(null);

    useEffect(() => {
        let forecastInstance = null;
        let distribusiInstance = null;
        let topUnitInstance = null;

        // --- BAR CHART: Forecast vs Realisasi ---
        if (forecastChartRef.current) {
            const ctx = forecastChartRef.current.getContext('2d');
            forecastInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartForecastRealisasi.labels,
                    datasets: [
                        {
                            label: 'Forecast 2026',
                            data: chartForecastRealisasi.forecast,
                            backgroundColor: '#10b981', // green
                            borderRadius: 2,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Realisasi 2025',
                            data: chartForecastRealisasi.realisasi,
                            backgroundColor: '#0ea5e9', // blue
                            borderRadius: 2,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
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
                            labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 2000,
                            ticks: { 
                                font: { size: 9 },
                                callback: function(value) {
                                    return value + 'M';
                                }
                            },
                            grid: { color: '#f3f4f6' },
                            title: {
                                display: true,
                                text: 'Biaya (Rp)',
                                font: { size: 9, weight: 'bold' }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 9 } }
                        }
                    }
                }
            });
        }

        // --- DOUGHNUT CHART: Distribusi Budget per Kategori ---
        if (distribusiChartRef.current) {
            const ctx = distribusiChartRef.current.getContext('2d');
            distribusiInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartDistribusiKategori.map(item => item.name),
                    datasets: [{
                        data: chartDistribusiKategori.map(item => item.value),
                        backgroundColor: chartDistribusiKategori.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false },
                    }
                },
                plugins: [{
                    id: 'custom_text_dist',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();
                        
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        ctx.font = "bold 14px Arial";
                        ctx.fillStyle = "#1f2937";
                        ctx.textBaseline = "middle";
                        const textVal = "Rp 12.65 M";
                        const textValX = Math.round(centerX - ctx.measureText(textVal).width / 2);
                        ctx.fillText(textVal, textValX, centerY - 6);

                        ctx.font = "10px Arial";
                        ctx.fillStyle = "#6b7280";
                        const textTop = "Total Budget";
                        const textTopX = Math.round(centerX - ctx.measureText(textTop).width / 2);
                        ctx.fillText(textTop, textTopX, centerY + 10);
                        
                        ctx.save();
                    }
                }]
            });
        }

        // --- HORIZONTAL BAR CHART: Top 5 Budget per Jenis Unit ---
        if (topUnitChartRef.current) {
            const ctx = topUnitChartRef.current.getContext('2d');
            topUnitInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartTopUnit.map(item => item.name),
                    datasets: [{
                        data: chartTopUnit.map(item => item.value),
                        backgroundColor: chartTopUnit.map(item => item.color),
                        borderRadius: 4,
                        barThickness: 14
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            display: false,
                            max: 4000
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
                                    ctx.fillText(`${data}M`, bar.x + 5, bar.y);
                                });
                            });
                        }
                    }
                }
            });
        }

        return () => {
            if (forecastInstance) forecastInstance.destroy();
            if (distribusiInstance) distribusiInstance.destroy();
            if (topUnitInstance) topUnitInstance.destroy();
        };
    }, [chartForecastRealisasi, chartDistribusiKategori, chartTopUnit]);

    return (
        <AuthenticatedLayout>
            <Head title="Forecast Budget Monthly" />
            
            <div className="space-y-4">
                
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/></svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">Forecast Budget Monthly</h1>
                                <p className="text-sm text-gray-500">Perkiraan anggaran biaya maintenance berdasarkan historis, plan dan kebutuhan komponen</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>Home</span> › <span>Budget</span> › <span className="text-gray-600 font-bold">Forecast Budget Monthly</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mr-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Tahun</span>
                                    <select className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1 h-8 font-bold">
                                        <option>2026</option>
                                        <option>2025</option>
                                    </select>
                                </div>
                                <button className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 
                                    Generate Forecast
                                </button>
                                <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Export Excel
                                </button>
                                <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Forecast */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#0ea5e9] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="w-14 h-14 bg-[#0ea5e9] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3V7m-4-4v4H8V3M4 11h16M4 15h16"></path></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm font-bold text-gray-500">Total Forecast Budget</div>
                            <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.total_forecast.amount}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="text-[#f97316] font-bold">↗ {kpiBudget.total_forecast.vs_realisasi}</span> vs Realisasi 2025
                            </div>
                        </div>
                    </div>

                    {/* Planned Maintenance */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#10b981] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="w-14 h-14 bg-[#10b981] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm font-bold text-gray-500">Planned Maintenance</div>
                            <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.planned_maintenance.amount}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="text-[#10b981] font-bold">{kpiBudget.planned_maintenance.pct}</span> dari total budget
                            </div>
                        </div>
                    </div>

                    {/* Corrective Maintenance */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#facc15] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="w-14 h-14 bg-[#facc15] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm font-bold text-gray-500">Corrective Maintenance</div>
                            <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.corrective_maintenance.amount}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="text-[#f97316] font-bold">↗ {kpiBudget.corrective_maintenance.pct}</span> dari total budget
                            </div>
                        </div>
                    </div>

                    {/* Project / Improvement */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#ef4444] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="w-14 h-14 bg-[#ef4444] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm font-bold text-gray-500">Project / Improvement</div>
                            <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.project_improvement.amount}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="text-[#ef4444] font-bold">{kpiBudget.project_improvement.pct}</span> dari total budget
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Bar Chart: Forecast vs Realisasi */}
                    <div className="lg:col-span-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-2">Forecast vs Realisasi (Per Bulan)</h3>
                        <div className="flex-1 relative w-full pt-2">
                            <canvas ref={forecastChartRef}></canvas>
                        </div>
                    </div>

                    {/* Doughnut Chart: Distribusi Budget */}
                    <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-4">Distribusi Budget per Kategori</h3>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-full h-[140px] relative mb-4">
                                <canvas ref={distribusiChartRef}></canvas>
                            </div>
                            <div className="w-full flex flex-col justify-center gap-1.5 text-xs">
                                {chartDistribusiKategori.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-2.5 h-2.5 rounded-sm mr-1.5 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold truncate">{item.name}</span>
                                                <span className="text-gray-500 font-bold">Rp {Number(item.value).toLocaleString('id-ID')}0,000</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Bar Chart: Top 5 */}
                    <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-800 text-[12px] mb-4">Top 5 Budget per Jenis Unit</h3>
                        <div className="flex-1 relative w-full pt-2">
                            <canvas ref={topUnitChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Filter Row */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Department</label>
                        <select className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8">
                            <option>Semua</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Jenis Unit</label>
                        <select className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8">
                            <option>Semua</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                        <select className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8">
                            <option>Semua</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[100px] max-w-[120px]">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tahun</label>
                        <select className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8">
                            <option>2026</option>
                        </select>
                    </div>
                    <div className="relative min-w-[200px] flex-1">
                        <input type="text" placeholder="Cari deskripsi, komponen, atau kode unit..." className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 pl-7 h-8"/>
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Cari
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
                        </button>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 text-[13px] tracking-tight">Detail Forecast Budget Monthly</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2.5 font-bold text-center w-8">No</th>
                                    <th className="px-3 py-2.5 font-bold">Bulan</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Planned Maintenance (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Corrective Maintenance (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Project / Improvement (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Total Forecast (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-right">Realisasi 2025 (Rp)</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Selisih (%)</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Status</th>
                                    <th className="px-3 py-2.5 font-bold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {tableDetailForecast.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-3 py-2 text-center text-gray-400">{item.no}</td>
                                        <td className="px-3 py-2 font-bold text-gray-900">{item.bulan}</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-700">{item.planned}</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-700">{item.corrective}</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-700">{item.project}</td>
                                        <td className="px-3 py-2 text-right font-mono font-bold text-gray-900">{item.total}</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-600">{item.realisasi}</td>
                                        <td className={`px-3 py-2 text-center font-bold ${item.selisih.startsWith('+') ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>{item.selisih}</td>
                                        <td className="px-3 py-2 text-center">
                                            {item.status === 'On Track' && <span className="bg-[#10b981] text-white px-2 py-0.5 rounded text-[9px] font-bold">On Track</span>}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button className="bg-[#3b82f6] text-white p-1 rounded shadow-sm hover:bg-blue-600"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                                <button className="bg-[#facc15] text-white p-1 rounded shadow-sm hover:bg-yellow-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-gray-900 font-bold">
                                <tr>
                                    <td colSpan="2" className="px-3 py-2 text-center">Total</td>
                                    <td className="px-3 py-2 text-right font-mono">7,820,000,000</td>
                                    <td className="px-3 py-2 text-right font-mono">3,950,000,000</td>
                                    <td className="px-3 py-2 text-right font-mono">880,000,000</td>
                                    <td className="px-3 py-2 text-right font-mono">12,650,000,000</td>
                                    <td className="px-3 py-2 text-right font-mono">11,270,000,000</td>
                                    <td className="px-3 py-2 text-center text-[#ef4444]">+12.2%</td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer 3 Panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rekap Budget per Department */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800 text-sm tracking-tight">Rekap Budget per Department</h2>
                        </div>
                        <div className="p-3">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                                    <tr>
                                        <th className="py-1 font-bold">No</th>
                                        <th className="py-1 font-bold">Department</th>
                                        <th className="py-1 font-bold text-right">Forecast (Rp)</th>
                                        <th className="py-1 font-bold text-center">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-600">
                                    {rekapDepartment.map((item) => (
                                        <tr key={item.no}>
                                            <td className="py-1">{item.no}</td>
                                            <td className="py-1">{item.dept}</td>
                                            <td className="py-1 text-right font-mono">{item.forecast}</td>
                                            <td className="py-1 text-center">{item.pct}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-gray-200 font-bold text-gray-900">
                                    <tr>
                                        <td colSpan="2" className="py-1">Total</td>
                                        <td className="py-1 text-right font-mono">12,650,000,000</td>
                                        <td className="py-1 text-center">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Rekap Budget per Kategori */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800 text-sm tracking-tight">Rekap Budget per Kategori</h2>
                        </div>
                        <div className="p-3">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                                    <tr>
                                        <th className="py-1 font-bold">No</th>
                                        <th className="py-1 font-bold">Kategori</th>
                                        <th className="py-1 font-bold text-right">Forecast (Rp)</th>
                                        <th className="py-1 font-bold text-center">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-600">
                                    {rekapKategori.map((item) => (
                                        <tr key={item.no}>
                                            <td className="py-1">{item.no}</td>
                                            <td className="py-1">{item.kategori}</td>
                                            <td className="py-1 text-right font-mono">{item.forecast}</td>
                                            <td className="py-1 text-center">{item.pct}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-gray-200 font-bold text-gray-900">
                                    <tr>
                                        <td colSpan="2" className="py-1">Total</td>
                                        <td className="py-1 text-right font-mono">12,650,000,000</td>
                                        <td className="py-1 text-center">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Catatan & Rekomendasi */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800 text-sm tracking-tight">Catatan & Rekomendasi</h2>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                    <span className="text-xs text-gray-700">Forecast disusun berdasarkan historis 3 tahun terakhir</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                    <span className="text-xs text-gray-700">Pertimbangkan kenaikan harga sparepart ±5-10%</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                    <span className="text-xs text-gray-700">Monitor realisasi setiap bulan untuk penyesuaian</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                    <span className="text-xs text-gray-700">Fokus pada peningkatan PM untuk menurunkan biaya corrective</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                    <span className="text-xs text-gray-700">Review forecast setiap quarter</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
