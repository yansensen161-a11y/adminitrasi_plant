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
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            // Destroy previous chart instance if exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 31}, (_, i) => i + 1),
                    datasets: [
                        {
                            label: 'Rata-rata (L/1000 HM)',
                            data: chartData,
                            borderColor: '#10b981', // emerald-500
                            backgroundColor: '#10b981',
                            tension: 0.3,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: '#10b981'
                        },
                        {
                            label: 'Batas Peringatan (6 L/1000 HM)',
                            data: Array(31).fill(6),
                            borderColor: '#f59e0b', // amber-500
                            borderWidth: 1.5,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            fill: false
                        },
                        {
                            label: 'Batas Maksimum (10 L/1000 HM)',
                            data: Array(31).fill(10),
                            borderColor: '#ef4444', // red-500
                            borderWidth: 1.5,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6,
                                font: {
                                    size: 11,
                                    family: "'Inter', sans-serif",
                                    weight: '600'
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            titleFont: { size: 11 },
                            bodyFont: { size: 11 },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 12,
                            grid: {
                                color: 'rgba(156, 163, 175, 0.1)',
                                drawBorder: false,
                            },
                            ticks: {
                                font: { size: 10 },
                                color: '#6b7280'
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false,
                            },
                            ticks: {
                                font: { size: 10 },
                                color: '#6b7280'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    // Helper function for coloring L/1000 HM values
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
                        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white shadow-sm shadow-amber-400/40">
                            <Droplet size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                                OIL CONSUMPTION
                            </h2>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                                Home <span className="mx-1">&gt;</span> <span className="text-[#0b5c3e]">Oil Consumption</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b5c3e] hover:bg-[#0a4d3c] text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Plus size={16} />
                            <span>Tambah Data</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-[#0b5c3e] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Download size={16} />
                            <span>Export Excel</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Printer size={16} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Oil Consumption" />

            <div className="space-y-6">
                
                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-xs font-bold text-[#0b5c3e] mb-4 uppercase tracking-wider">Filter Pencarian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code Unit</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Pilih Code Unit</option>
                                <option value="ME052">ME052</option>
                                <option value="ME067">ME067</option>
                                <option value="OHT070">OHT070</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Model</label>
                            <select value={modelFilter} onChange={e => setModelFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Pilih Model</option>
                                <option value="Mitsubishi Triton">Mitsubishi Triton</option>
                                <option value="Hitachi ZX470">Hitachi ZX470</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type Oli</label>
                            <select value={typeOliFilter} onChange={e => setTypeOliFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Pilih Type Oli</option>
                                <option value="Shell Rimula R4 15W-40">Shell Rimula R4 15W-40</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Semua Department</option>
                                <option value="Mining">Mining</option>
                                <option value="Overburden">Overburden</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">HM From</label>
                            <input type="text" value={hmFromFilter} onChange={e => setHmFromFilter(e.target.value)} placeholder="Contoh: 1000" className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">HM To</label>
                            <input type="text" value={hmToFilter} onChange={e => setHmToFilter(e.target.value)} placeholder="Contoh: 5000" className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                        </div>
                        <div className="col-span-1 md:col-span-4 lg:col-span-2 flex justify-end gap-2">
                            <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors">
                                <RefreshCw size={14} />
                                <span>Reset</span>
                            </button>
                            <button onClick={handleFilterSubmit} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b5c3e] hover:bg-[#0a4d3c] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full md:w-auto justify-center">
                                <Search size={14} />
                                <span>Cari Data</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                            <Droplet size={24} className="fill-blue-500 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Konsumsi</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{summary.total_konsumsi}</div>
                                <div className="text-[11px] text-gray-500 font-medium">Liter</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <ClipboardList size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Rata-rata / 1000 HM</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{summary.rata_rata}</div>
                                <div className="text-[11px] text-gray-500 font-medium">Liter / 1000 HM</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Shield size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">Total Unit</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{summary.total_unit}</div>
                                <div className="text-[11px] text-gray-500 font-medium">Unit</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <Receipt size={24} className="text-orange-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">Total Pengisian</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{summary.total_pengisian}</div>
                                <div className="text-[11px] text-gray-500 font-medium">Transaksi</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <Calendar size={24} className="text-rose-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-rose-600 uppercase tracking-wide">Periode</div>
                            <div className="flex flex-col">
                                <div className="text-xs font-black text-gray-800 dark:text-gray-100 leading-tight mt-1">{summary.periode.range}</div>
                                <div className="text-[11px] text-gray-500 font-medium mt-1">{summary.periode.days} Hari</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                            TREND OIL CONSUMPTION (LITER / 1000 HM)
                        </h3>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
                            <Filter size={14} />
                        </button>
                    </div>
                    <div className="p-5 h-[300px] w-full relative">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                            DATA OIL CONSUMPTION
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">Total Data : {summary.total_pengisian}</span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">No</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Date</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Code Unit</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Model</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Department</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">HM</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">HM Prev.</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">HM Diff.</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Type Oli</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Pengisian (Liter)</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Konsumsi (Liter)</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">L/1000 HM</th>
                                    <th className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">Remarks</th>
                                    <th className="px-3 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/20">
                                {tableData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-3 py-3.5 text-gray-500 font-medium">{idx + 1}</td>
                                        <td className="px-3 py-3.5 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">{row.date}</td>
                                        <td className="px-3 py-3.5 font-bold text-gray-800 dark:text-gray-200">{row.code_unit}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.model}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.department}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.hm}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.hm_prev}</td>
                                        <td className="px-3 py-3.5 font-medium text-gray-800 dark:text-gray-200">{row.hm_diff}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400 text-left whitespace-nowrap">{row.type_oli}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.pengisian}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.konsumsi}</td>
                                        
                                        {/* Colored L/1000 HM */}
                                        <td className={`px-3 py-3.5 font-bold ${getColorForHM(row.l_per_1000)}`}>
                                            {row.l_per_1000}
                                        </td>
                                        
                                        <td className="px-3 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{row.remarks}</td>
                                        
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="text-gray-500 hover:text-gray-700 p-1">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-emerald-500 hover:text-emerald-700 p-1">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500 font-medium">
                            Menampilkan 1 - {tableData.length} dari {summary.total_pengisian} data
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b5c3e] text-white font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">4</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">5</button>
                            <span className="text-gray-400 px-1">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">9</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&gt;</button>
                            <select className="ml-2 text-xs border-gray-200 rounded py-1.5 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]">
                                <option>10 / halaman</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
