import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Click for error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Index({ stats, chartBiayaPerUnit, chartBiayaPerKategori, chartTrendBiaya, items, filters = {} }) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.code_unit || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('abr.index'), {
            date_from: dateFrom,
            date_to: dateTo,
            code_unit: codeUnitFilter,
            kategori: kategoriFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setKategoriFilter('');
        router.get(route('abr.index'), {}, { preserveState: true });
    };
    const barChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const lineChartRef = useRef(null);

    useEffect(() => {
        let barChartInstance = null;
        let doughnutChartInstance = null;
        let lineChartInstance = null;

        // --- BAR CHART ---
        if (barChartRef.current) {
            const ctx = barChartRef.current.getContext('2d');
            
            barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartBiayaPerUnit.map(item => item.name),
                    datasets: [{
                        label: 'Biaya Repair',
                        data: chartBiayaPerUnit.map(item => item.value),
                        backgroundColor: chartBiayaPerUnit.map(item => item.color),
                        borderRadius: 4,
                        barThickness: 30,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.raw);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: function(value) {
                                    if (value >= 1000000) return value / 1000000 + 'M';
                                    return value;
                                },
                                font: { size: 11 }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10 } }
                        }
                    },
                    animation: {
                        onComplete: function() {
                            try {
                                const chartInstance = this;
                                const ctx = chartInstance.ctx;
                                ctx.font = 'bold 10px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                
                                chartInstance.data.datasets.forEach(function (dataset, i) {
                                    const meta = chartInstance.getDatasetMeta(i);
                                    meta.data.forEach(function (bar, index) {
                                        const labelStr = chartBiayaPerUnit[index] ? chartBiayaPerUnit[index].label : '';
                                        ctx.fillStyle = '#1f2937';
                                        ctx.fillText(labelStr, bar.x, bar.y - 5);
                                    });
                                });
                            } catch (e) {
                                console.error('Bar chart animation error', e);
                            }
                        }
                    }
                }
            });
        }

        // --- DOUGHNUT CHART ---
        if (doughnutChartRef.current) {
            const ctx = doughnutChartRef.current.getContext('2d');
            
            // Custom text plugin
            const centerTextPlugin = {
                id: 'centerText',
                beforeDraw: function(chart) {
                    try {
                        if (chart.config.type === 'doughnut') {
                            const width = chart.width,
                                height = chart.height,
                                ctx = chart.ctx;
                                
                            const chartArea = chart.chartArea;
                            const centerX = (chartArea.left + chartArea.right) / 2;
                            const centerY = (chartArea.top + chartArea.bottom) / 2;
                                
                            ctx.restore();
                            ctx.font = "bold 14px Arial";
                            ctx.textBaseline = "middle";
                            ctx.fillStyle = "#1f2937";
                            const text = "Rp " + new Intl.NumberFormat('id-ID').format(stats.total_biaya);
                            const textX = Math.round(centerX - ctx.measureText(text).width / 2);
                            const textY = centerY - 5;
                            ctx.fillText(text, textX, textY);
                            
                            ctx.font = "12px Arial";
                            ctx.fillStyle = "#6b7280";
                            const text2 = "Total Biaya Repair";
                            const text2X = Math.round(centerX - ctx.measureText(text2).width / 2);
                            const text2Y = centerY + 15;
                            ctx.fillText(text2, text2X, text2Y);
                            ctx.save();
                        }
                    } catch (e) {
                        console.error('Doughnut chart beforeDraw error', e);
                    }
                }
            };
            
            doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartBiayaPerKategori.map(item => item.name),
                    datasets: [{
                        data: chartBiayaPerKategori.map(item => item.value),
                        backgroundColor: chartBiayaPerKategori.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: { size: 12, weight: 'bold' },
                                color: '#374151',
                                generateLabels: (chart) => {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const meta = chart.getDatasetMeta(0);
                                            const ds = data.datasets[0];
                                            const value = ds.data[i];
                                            return {
                                                text: `${label} \u200B\u200B\u200B\u200B\u200B ${value}%`,
                                                fillStyle: ds.backgroundColor[i],
                                                hidden: isNaN(ds.data[i]) || (meta.data[i] ? meta.data[i].hidden : false),
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ' ' + context.label + ': ' + context.raw + '%';
                                }
                            }
                        }
                    },
                    layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } }
                },
                plugins: [centerTextPlugin]
            });
        }

        // --- LINE CHART ---
        if (lineChartRef.current) {
            const ctx = lineChartRef.current.getContext('2d');
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

            lineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartTrendBiaya.map(item => item.month),
                    datasets: [{
                        label: 'Trend Biaya',
                        data: chartTrendBiaya.map(item => item.value),
                        borderColor: '#22c55e',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#22c55e',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.raw);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f3f4f6',
                                drawBorder: false,
                            },
                            ticks: {
                                callback: function(value) {
                                    if (value >= 1000000) return value / 1000000 + 'M';
                                    return value;
                                },
                                font: { size: 11 },
                                maxTicksLimit: 6
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 11 } }
                        }
                    },
                    animation: {
                        onComplete: function() {
                            try {
                                const chartInstance = this;
                                const ctx = chartInstance.ctx;
                                ctx.font = 'bold 10px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                
                                chartInstance.data.datasets.forEach(function (dataset, i) {
                                    const meta = chartInstance.getDatasetMeta(i);
                                    meta.data.forEach(function (point, index) {
                                        const labelStr = chartTrendBiaya[index] ? chartTrendBiaya[index].label : '';
                                        ctx.fillStyle = '#1f2937';
                                        ctx.fillText(labelStr, point.x, point.y - 8);
                                    });
                                });
                            } catch (e) {
                                console.error('Line chart animation error', e);
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (barChartInstance) barChartInstance.destroy();
            if (doughnutChartInstance) doughnutChartInstance.destroy();
            if (lineChartInstance) lineChartInstance.destroy();
        };
    }, [chartBiayaPerUnit, chartBiayaPerKategori, chartTrendBiaya]);

    return (
        <ErrorBoundary>
        <AuthenticatedLayout>
            <Head title="Analisa Biaya Repair" />


            {/* Header & Buttons */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <svg className="w-7 h-7 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        Analisa Biaya Repair
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Analisa dan monitoring biaya perbaikan unit berdasarkan pekerjaan, komponen, dan periode</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={route('abr.create')} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Input Data
                    </Link>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Import Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <form onSubmit={handleFilter} className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Dari</label>
                    <input 
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                    />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Sampai</label>
                    <input 
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kode Unit</label>
                    <input 
                        type="text"
                        placeholder="Cari unit..."
                        value={codeUnitFilter}
                        onChange={(e) => setCodeUnitFilter(e.target.value)}
                        className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                    <select 
                        value={kategoriFilter}
                        onChange={(e) => setKategoriFilter(e.target.value)}
                        className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                    >
                        <option value="">Semua</option>
                        <option value="Engine">Engine</option>
                        <option value="Transmission">Transmission</option>
                        <option value="Hydraulic">Hydraulic</option>
                        <option value="Undercarriage">Undercarriage</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Cari
                    </button>
                    <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Reset
                    </button>
                </div>
            </form>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0ea5e9] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Total Biaya Repair</div>
                    <div className="text-3xl font-black mt-1 z-10">Rp {stats.total_biaya.toLocaleString('id-ID')}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">Periode: {stats.periode}</div>
                </div>

                <div className="bg-[#10b981] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Jumlah Repair</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.jumlah_repair}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">Pekerjaan</div>
                </div>

                <div className="bg-[#facc15] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Rata-rata Biaya per Repair</div>
                    <div className="text-3xl font-black mt-1 z-10">Rp {stats.rata_rata_biaya.toLocaleString('id-ID')}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10 opacity-0">...</div>
                </div>

                <div className="bg-[#ef4444] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Naik/Turun</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.trend_pct}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">Dibanding periode sebelumnya</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-sm mb-4">Biaya Repair per Jenis Unit</h3>
                    <div className="h-48 relative w-full">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-sm mb-4">Biaya Repair per Kategori</h3>
                    <div className="h-48 relative w-full flex items-center justify-center">
                        <div className="w-[90%] h-[90%]">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-sm mb-4">Trend Biaya Repair (6 Bulan Terakhir)</h3>
                    <div className="h-48 relative w-full">
                        <canvas ref={lineChartRef}></canvas>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-4">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="font-bold text-gray-800 text-base">Daftar Biaya Repair</h2>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Cari data..."
                            className="w-64 text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-1.5 pl-8"
                        />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[50px]">No</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[80px]">Tanggal</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Kode Unit</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Equipment</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Model</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[200px]">Deskripsi Pekerjaan</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[150px]">Kategori</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[150px]">Part Number</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[50px]">Qty</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Biaya Part (Rp)</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Biaya Jasa (Rp)</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[100px]">Total Biaya (Rp)</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center border-r border-gray-200">
                                    <div className="resize-x overflow-hidden px-3 py-3 min-w-[80px]">Status</div>
                                </th>
                                <th className="px-0 py-0 font-bold text-center">
                                    <div className="px-3 py-3 min-w-[100px]">Aksi</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {items.map((item, index) => (
                                <tr key={item.id} onDoubleClick={() => router.visit(route('abr.edit', item.id))} className="hover:bg-gray-100 transition-colors cursor-pointer group">
                                    <td className="px-3 py-2.5 text-center text-gray-500">{index + 1}</td>
                                    <td className="px-3 py-2.5 text-center">{item.tanggal}</td>
                                    <td className="px-3 py-2.5 text-center text-gray-900 font-bold group-hover:text-blue-600">{item.code_unit}</td>
                                    <td className="px-3 py-2.5 text-center">{item.equipment}</td>
                                    <td className="px-3 py-2.5 text-center">{item.model}</td>
                                    <td className="px-3 py-2.5">{item.deskripsi}</td>
                                    <td className="px-3 py-2.5 text-center">{item.kategori}</td>
                                    <td className="px-3 py-2.5 text-center font-mono">{item.part_number}</td>
                                    <td className="px-3 py-2.5 text-center">{item.qty}</td>
                                    <td className="px-3 py-2.5 text-right font-mono">{item.biaya_part.toLocaleString('id-ID')}</td>
                                    <td className="px-3 py-2.5 text-right font-mono">{item.biaya_jasa.toLocaleString('id-ID')}</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold">{item.total_biaya.toLocaleString('id-ID')}</td>
                                    <td className="px-3 py-2.5 text-center">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Link href={route('abr.show', item.id)} className="bg-[#3b82f6] hover:bg-blue-600 text-white p-1 rounded shadow-sm" title="Detail">
                                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                            </Link>
                                            <Link href={route('abr.edit', item.id)} className="bg-[#facc15] hover:bg-yellow-500 text-white p-1 rounded shadow-sm" title="Edit">
                                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                            </Link>
                                            <button onClick={() => { if(confirm('Yakin ingin menghapus data ini?')) router.delete(route('abr.destroy', item.id)) }} className="bg-[#ef4444] hover:bg-red-600 text-white p-1 rounded shadow-sm" title="Delete">
                                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan="9" className="px-3 py-3 text-right font-bold text-gray-900">Total</td>
                                <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono">
                                    {items.reduce((sum, item) => sum + item.biaya_part, 0).toLocaleString('id-ID')}
                                </td>
                                <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono">
                                    {items.reduce((sum, item) => sum + item.biaya_jasa, 0).toLocaleString('id-ID')}
                                </td>
                                <td className="px-3 py-3 text-right font-bold text-gray-900 font-mono">
                                    {items.reduce((sum, item) => sum + item.total_biaya, 0).toLocaleString('id-ID')}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-white text-sm">
                    <div className="text-gray-500">
                        Menampilkan 1 - 10 dari {stats.jumlah_repair} data
                    </div>
                    <div className="flex gap-1 items-center">
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 cursor-not-allowed">«</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 cursor-not-allowed">‹</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded bg-[#10b981] text-white font-bold">1</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">2</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">3</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">›</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">»</button>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
        </ErrorBoundary>
    );
}
