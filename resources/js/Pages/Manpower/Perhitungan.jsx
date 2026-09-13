import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Perhitungan({ auth, calculations }) {
    const chartKomposisi = useRef(null);
    const chartPerbandingan = useRef(null);
    const chartInstances = useRef({});

    useEffect(() => {
        // Cleanup existing charts
        if (chartInstances.current.komp) chartInstances.current.komp.destroy();
        if (chartInstances.current.perb) chartInstances.current.perb.destroy();

        // 1. Chart Komposisi Kebutuhan Manpower
        if (chartKomposisi.current) {
            chartInstances.current.komp = new Chart(chartKomposisi.current, {
                type: 'doughnut',
                data: {
                    labels: ['Staff', 'Non Staff'],
                    datasets: [{
                        data: [28, 88],
                        backgroundColor: ['#0073b7', '#00a65a'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    }
                }
            });
        }

        // 2. Chart Perbandingan
        if (chartPerbandingan.current) {
            chartInstances.current.perb = new Chart(chartPerbandingan.current, {
                type: 'bar',
                data: {
                    labels: ['Jumlah Manpower'],
                    datasets: [
                        {
                            label: 'MP Dibutuhkan',
                            data: [116],
                            backgroundColor: '#0073b7',
                            barPercentage: 0.4,
                            categoryPercentage: 0.5
                        },
                        {
                            label: 'MP Tersedia (Aktual)',
                            data: [128],
                            backgroundColor: '#00a65a',
                            barPercentage: 0.4,
                            categoryPercentage: 0.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        y: { beginAtZero: true, max: 160, ticks: { stepSize: 20 } },
                        x: { grid: { display: false } }
                    }
                },
                plugins: [{
                    id: 'topLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        chart.data.datasets.forEach((dataset, i) => {
                            chart.getDatasetMeta(i).data.forEach((bar, index) => {
                                const data = dataset.data[index];
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 12px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText(data, bar.x, bar.y - 8);
                            });
                        });
                    }
                }]
            });
        }

        return () => {
            if (chartInstances.current.komp) chartInstances.current.komp.destroy();
            if (chartInstances.current.perb) chartInstances.current.perb.destroy();
        };
    }, []);

    // Helper sums
    const totalUnit = calculations.reduce((sum, item) => sum + (parseInt(item.sub_total) || 0), 0);
    const totalNonStaff = calculations.reduce((sum, item) => sum + (parseInt(item.ratio) || 0), 0);
    const totalStaff = calculations.reduce((sum, item) => sum + (parseInt(item.staff) || 0), 0);
    const totalDibutuhkan = totalNonStaff + totalStaff;
    const mpTersedia = 128; // Hardcoded based on image
    const selisih = mpTersedia - totalDibutuhkan;

    return (
        <AuthenticatedLayout>
            <Head title="Perhitungan Manpower" />

            <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-10">
                {/* Header Area */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Perhitungan Manpower</h1>
                            <p className="text-sm text-gray-500">Menghitung kebutuhan manpower berdasarkan populasi unit dan rasio standart</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-gray-500">
                        Home &gt; Manpower & Organization &gt; <span className="font-bold text-[#00a65a]">Perhitungan Manpower</span>
                    </div>
                </div>

                <div className="px-6 mt-6 space-y-4 max-w-[1400px] mx-auto">
                    
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-end gap-3 mb-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Periode</label>
                            <div className="relative">
                                <svg className="w-4 h-4 absolute left-2 top-2 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                <select className="pl-8 pr-8 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 appearance-none min-w-[140px]">
                                    <option>September 2026</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Area</label>
                            <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 min-w-[120px]">
                                <option>Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Kelompok Unit</label>
                            <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 min-w-[120px]">
                                <option>Semua</option>
                            </select>
                        </div>
                        
                        <div className="flex-1"></div>
                        
                        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
                            Proses Perhitungan
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Export Excel
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                            Print
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                            Reset
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-[#e6f4ea] border border-[#a8dfb9] rounded-lg p-3 flex items-center gap-3">
                            <div className="text-[#00a65a] p-2 bg-[#c2e8ce] rounded-full shrink-0"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></div>
                            <div>
                                <div className="text-xs text-gray-700 font-bold">Total Unit</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{totalUnit}</div>
                                <div className="text-[9px] text-gray-500 font-bold">Unit</div>
                            </div>
                        </div>
                        <div className="bg-[#e8f4fd] border border-[#a2cff0] rounded-lg p-3 flex items-center gap-3">
                            <div className="text-[#0073b7] p-2 bg-[#b8ddf5] rounded-full shrink-0"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                            <div>
                                <div className="text-xs text-gray-700 font-bold">Total MP Non Staff</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{totalNonStaff}</div>
                                <div className="text-[9px] text-gray-500 font-bold">Orang</div>
                            </div>
                        </div>
                        <div className="bg-[#fff7e6] border border-[#ffdb99] rounded-lg p-3 flex items-center gap-3">
                            <div className="text-[#f39c12] p-2 bg-[#fbe3b7] rounded-full shrink-0"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                            <div>
                                <div className="text-xs text-gray-700 font-bold">Total MP Staff (25%)</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{totalStaff}</div>
                                <div className="text-[9px] text-gray-500 font-bold">Orang</div>
                            </div>
                        </div>
                        <div className="bg-[#e6f4ea] border border-[#a8dfb9] rounded-lg p-3 flex items-center gap-3">
                            <div className="text-[#00a65a] p-2 bg-[#c2e8ce] rounded-full shrink-0"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
                            <div>
                                <div className="text-xs text-gray-700 font-bold">Total MP Dibutuhkan</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{totalDibutuhkan}</div>
                                <div className="text-[9px] text-gray-500 font-bold">Orang</div>
                            </div>
                        </div>
                        <div className="bg-[#fcebe8] border border-[#f5b3a9] rounded-lg p-3 flex items-center gap-3">
                            <div className="text-[#f56954] p-2 bg-[#fbd4cf] rounded-full shrink-0"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
                            <div>
                                <div className="text-xs text-gray-700 font-bold">MP Tersedia (Aktual)</div>
                                <div className="text-2xl font-black text-[#f56954] leading-tight">{mpTersedia}</div>
                                <div className="text-[9px] text-gray-500 font-bold">Orang</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mt-4">
                        
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            
                            {/* Main Table */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="p-3 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Data Populasi Unit dan Perhitungan Manpower</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-center">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200" rowSpan="2">No</th>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200 text-left" rowSpan="2">Jenis Unit</th>
                                                <th className="py-1 px-2 font-bold border-r border-gray-200 border-b border-gray-200" colSpan="2">Populasi Unit</th>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200" rowSpan="2">Total</th>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200" rowSpan="2">Rasio<br/>MP/Unit</th>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200" rowSpan="2">Total MP<br/>Non Staff<br/>(70%)</th>
                                                <th className="py-2 px-2 font-bold border-r border-gray-200" rowSpan="2">Total MP<br/>Staff<br/>(25%)</th>
                                                <th className="py-2 px-2 font-bold" rowSpan="2">Total MP<br/>Dibutuhkan</th>
                                            </tr>
                                            <tr>
                                                <th className="py-1 px-2 font-bold border-r border-gray-200 bg-gray-50">6 Fleet</th>
                                                <th className="py-1 px-2 font-bold border-r border-gray-200 bg-gray-50">Mainroad &<br/>Jetty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {calculations.map((row, idx) => {
                                                const ratioCalculated = row.sub_total > 0 && row.ratio !== '-' 
                                                    ? (parseFloat(row.ratio) / parseFloat(row.sub_total)).toFixed(2)
                                                    : '-';
                                                
                                                const ns = parseFloat(row.ratio) || 0;
                                                const st = parseFloat(row.staff) || 0;
                                                const totalMp = ns + st;

                                                return (
                                                <tr key={row.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{idx + 1}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100 text-left font-medium text-gray-700">{row.unit}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{row.fleet}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{row.mainroad}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100 font-bold bg-gray-50/50">{row.sub_total}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{ratioCalculated}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{row.ratio}</td>
                                                    <td className="py-1.5 px-2 border-r border-gray-100">{row.staff}</td>
                                                    <td className="py-1.5 px-2 font-bold bg-gray-50/50">{totalMp > 0 ? totalMp : '-'}</td>
                                                </tr>
                                            )})}
                                        </tbody>
                                        <tfoot className="border-t-2 border-gray-200 font-bold bg-gray-50">
                                            <tr>
                                                <td colSpan="2" className="py-2 px-2 text-right border-r border-gray-200">Total</td>
                                                <td className="py-2 px-2 border-r border-gray-200">{calculations.reduce((s,i) => s + (parseInt(i.fleet)||0), 0)}</td>
                                                <td className="py-2 px-2 border-r border-gray-200">{calculations.reduce((s,i) => s + (parseInt(i.mainroad)||0), 0)}</td>
                                                <td className="py-2 px-2 border-r border-gray-200">{totalUnit}</td>
                                                <td className="py-2 px-2 border-r border-gray-200">-</td>
                                                <td className="py-2 px-2 border-r border-gray-200 text-[#0073b7]">{totalNonStaff}</td>
                                                <td className="py-2 px-2 border-r border-gray-200 text-[#f39c12]">{totalStaff}</td>
                                                <td className="py-2 px-2 text-[#00a65a]">{totalDibutuhkan}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom 2 boxes: Rekap & Analisa */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Rekap */}
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">Rekapitulasi Hasil Perhitungan</h3>
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="py-1.5 px-2 font-bold text-gray-700">Kategori</th>
                                                <th className="py-1.5 px-2 font-bold text-gray-700 text-center">Jumlah (Orang)</th>
                                                <th className="py-1.5 px-2 font-bold text-gray-700 text-center">Persentase</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="py-1.5 px-2 text-gray-700">Non Staff</td>
                                                <td className="py-1.5 px-2 text-center">{totalNonStaff}</td>
                                                <td className="py-1.5 px-2 text-center">75.9%</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 px-2 text-gray-700">Staff</td>
                                                <td className="py-1.5 px-2 text-center">{totalStaff}</td>
                                                <td className="py-1.5 px-2 text-center">24.1%</td>
                                            </tr>
                                            <tr className="bg-gray-50 font-bold border-y border-gray-200">
                                                <td className="py-1.5 px-2">Total Kebutuhan MP</td>
                                                <td className="py-1.5 px-2 text-center text-[#0073b7]">{totalDibutuhkan}</td>
                                                <td className="py-1.5 px-2 text-center">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 px-2 font-bold text-gray-800">MP Tersedia (Aktual)</td>
                                                <td className="py-1.5 px-2 font-bold text-center text-gray-800">{mpTersedia}</td>
                                                <td className="py-1.5 px-2 text-center">-</td>
                                            </tr>
                                            <tr className="border-t border-gray-200 bg-gray-50">
                                                <td className="py-1.5 px-2 font-bold text-[#00a65a]">Selisih (Surplus/Defisit)</td>
                                                <td className="py-1.5 px-2 font-bold text-center text-[#00a65a]">{selisih > 0 ? `+${selisih}` : selisih}</td>
                                                <td className="py-1.5 px-2 text-center">-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Analisa */}
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">Analisa</h3>
                                    <ul className="space-y-2 text-xs text-gray-700 font-medium">
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Total populasi unit: {totalUnit} unit
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Kebutuhan MP: {totalDibutuhkan} orang
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            MP tersedia saat ini: {mpTersedia} orang
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Selisih: {selisih > 0 ? `+${selisih}` : selisih} orang (Surplus)
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Rasio Non Staff: 70%
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Rasio Staff: 25% dari Non Staff
                                        </li>
                                        <li className="flex gap-2">
                                            <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                            Perhitungan berdasarkan data populasi unit terbaru
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4">
                            
                            {/* Chart 1: Komposisi */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Komposisi Kebutuhan Manpower</h3>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="h-28 w-28 relative shrink-0">
                                        <canvas ref={chartKomposisi}></canvas>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xl font-black text-gray-800">{totalDibutuhkan}</span>
                                            <span className="text-[8px] text-gray-500 font-bold">Orang</span>
                                        </div>
                                        <div className="absolute top-2 left-0 text-[8px] font-bold text-white z-10">24.1%</div>
                                        <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white z-10">75.9%</div>
                                    </div>
                                    <div className="flex-1 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <span className="w-3 h-3 bg-[#00a65a] rounded-sm"></span> Non Staff
                                            </div>
                                            <div className="font-bold text-gray-900">{totalNonStaff} <span className="text-gray-400 font-normal">(75.9%)</span></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <span className="w-3 h-3 bg-[#0073b7] rounded-sm"></span> Staff
                                            </div>
                                            <div className="font-bold text-gray-900">{totalStaff} <span className="text-gray-400 font-normal">(24.1%)</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart 2: Perbandingan */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Perbandingan MP Dibutuhkan vs MP Tersedia</h3>
                                <div className="flex items-center justify-center gap-6 mb-3 text-[9px] font-bold text-gray-700">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0073b7] rounded-sm"></span> MP Dibutuhkan</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00a65a] rounded-sm"></span> MP Tersedia (Aktual)</div>
                                </div>
                                <div className="h-40 w-full">
                                    <canvas ref={chartPerbandingan}></canvas>
                                </div>
                            </div>

                            {/* Parameter */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Parameter Perhitungan</h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex">
                                        <div className="w-24 text-gray-500 font-medium">Rasio Non Staff</div>
                                        <div className="text-gray-800">70% dari kebutuhan total</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-24 text-gray-500 font-medium">Rasio Staff</div>
                                        <div className="text-gray-800">25% dari Non Staff</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-24 text-gray-500 font-medium">Rasio Total</div>
                                        <div className="text-gray-800">0.875 x total unit (contoh)</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-24 text-gray-500 font-medium">Sumber Data Unit</div>
                                        <div className="text-gray-800">Master Unit / Populasi Unit</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-24 text-gray-500 font-medium">Area</div>
                                        <div className="text-gray-800">6 Fleet dan Mainroad & Jetty</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rekomendasi */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Rekomendasi</h3>
                                <ol className="list-decimal pl-4 space-y-1 text-xs text-gray-700 font-medium">
                                    <li>Lakukan evaluasi berkala setiap bulan</li>
                                    <li>Sesuaikan rasio berdasarkan kondisi operasional</li>
                                    <li>Monitoring perubahan populasi unit</li>
                                    <li>Perhatikan penambahan unit baru</li>
                                    <li>Evaluasi produktivitas manpower secara periodik</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
