import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ auth, manpowers }) {
    // Refs for charts
    const chartDistribusi = useRef(null);
    const chartKomposisi = useRef(null);
    const chartPosisi = useRef(null);
    const chartRekapKomposisi = useRef(null);
    
    const chartInstances = useRef({});

    useEffect(() => {
        // Destroy existing
        if (chartInstances.current.dist) chartInstances.current.dist.destroy();
        if (chartInstances.current.komp) chartInstances.current.komp.destroy();
        if (chartInstances.current.pos) chartInstances.current.pos.destroy();
        if (chartInstances.current.rekapKomp) chartInstances.current.rekapKomp.destroy();

        // 1. Distribusi (Bar)
        if (chartDistribusi.current) {
            chartInstances.current.dist = new Chart(chartDistribusi.current, {
                type: 'bar',
                data: {
                    labels: ['Plant', 'Workshop', 'Tyre', 'Electrical', 'Support', 'Others'],
                    datasets: [{
                        label: 'Jumlah',
                        data: [32, 18, 16, 14, 12, 8],
                        backgroundColor: '#00a65a',
                        barPercentage: 0.3,
                        borderRadius: 2
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
                        y: { beginAtZero: true, max: 40, ticks: { stepSize: 10, font: { size: 10 } }, grid: { drawBorder: false } },
                        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
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
                                ctx.font = 'bold 11px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText(data, bar.x, bar.y - 5);
                            });
                        });
                    }
                }]
            });
        }

        // 2. Komposisi (Doughnut)
        const dOpts = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: true }
            }
        };
        const dData = {
            labels: ['Staff', 'Non Staff', 'Kontrak / Outsource'],
            datasets: [{
                data: [28, 88, 12],
                backgroundColor: ['#00a65a', '#0073b7', '#f56954'],
                borderWidth: 0,
            }]
        };

        if (chartKomposisi.current) {
            chartInstances.current.komp = new Chart(chartKomposisi.current, { type: 'doughnut', data: dData, options: dOpts });
        }
        if (chartRekapKomposisi.current) {
            chartInstances.current.rekapKomp = new Chart(chartRekapKomposisi.current, { type: 'doughnut', data: dData, options: dOpts });
        }

        // 3. Posisi Top 5 (Horizontal Bar)
        if (chartPosisi.current) {
            chartInstances.current.pos = new Chart(chartPosisi.current, {
                type: 'bar',
                data: {
                    labels: ['Mekanik', 'Helper', 'Electrical', 'Tyreman', 'Operator Support'],
                    datasets: [{
                        data: [36, 18, 14, 12, 10],
                        backgroundColor: ['#00a65a', '#2196f3', '#f39c12', '#f56954', '#9b59b6'],
                        barPercentage: 0.6,
                        borderRadius: 2
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
                        x: { display: false, beginAtZero: true, max: 40 },
                        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
                    }
                },
                plugins: [{
                    id: 'rightLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        chart.data.datasets.forEach((dataset, i) => {
                            chart.getDatasetMeta(i).data.forEach((bar, index) => {
                                const data = dataset.data[index];
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 11px sans-serif';
                                ctx.textAlign = 'left';
                                ctx.fillText(data, bar.x + 5, bar.y + 4);
                            });
                        });
                    }
                }]
            });
        }

        return () => {
            if (chartInstances.current.dist) chartInstances.current.dist.destroy();
            if (chartInstances.current.komp) chartInstances.current.komp.destroy();
            if (chartInstances.current.pos) chartInstances.current.pos.destroy();
            if (chartInstances.current.rekapKomp) chartInstances.current.rekapKomp.destroy();
        };
    }, []);

    // Filter states
    const [departemen, setDepartemen] = useState('Semua');
    const [status, setStatus] = useState('Semua');
    const [jenis, setJenis] = useState('Semua');
    const [search, setSearch] = useState('');

    return (
        <AuthenticatedLayout>
            <Head title="Data Manpower" />
            
            <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-10">
                {/* Header */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Data Manpower</h1>
                            <p className="text-sm text-gray-500">Pengelolaan data karyawan, mekanik, dan tenaga kerja plant</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Tambah Manpower
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Import Excel
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                            Export Excel
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                            Print
                        </button>
                    </div>
                </div>

                <div className="px-6 mt-6 space-y-4">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Blue */}
                        <div className="bg-[#2196f3] rounded-lg p-4 flex items-center justify-between text-white shadow">
                            <div className="flex items-center gap-3">
                                <svg className="w-10 h-10 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                                <div>
                                    <div className="text-sm opacity-90 uppercase">Total Manpower</div>
                                    <div className="text-2xl font-bold leading-tight">128</div>
                                    <div className="text-xs opacity-80">Orang</div>
                                </div>
                            </div>
                        </div>
                        {/* Green */}
                        <div className="bg-[#00a65a] rounded-lg p-4 flex items-center justify-between text-white shadow">
                            <div className="flex items-center gap-3">
                                <svg className="w-10 h-10 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                <div>
                                    <div className="text-sm opacity-90 uppercase">Staff</div>
                                    <div className="text-2xl font-bold leading-tight">28</div>
                                    <div className="text-xs opacity-80">21.9%</div>
                                </div>
                            </div>
                        </div>
                        {/* Yellow */}
                        <div className="bg-[#f39c12] rounded-lg p-4 flex items-center justify-between text-white shadow">
                            <div className="flex items-center gap-3">
                                <svg className="w-10 h-10 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                <div>
                                    <div className="text-sm opacity-90 uppercase">Non Staff</div>
                                    <div className="text-2xl font-bold leading-tight">100</div>
                                    <div className="text-xs opacity-80">78.1%</div>
                                </div>
                            </div>
                        </div>
                        {/* Red */}
                        <div className="bg-[#f56954] rounded-lg p-4 flex items-center justify-between text-white shadow">
                            <div className="flex items-center gap-3">
                                <svg className="w-10 h-10 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                <div>
                                    <div className="text-sm opacity-90 uppercase">Kontrak / Outsource</div>
                                    <div className="text-2xl font-bold leading-tight">12</div>
                                    <div className="text-xs opacity-80">9.4%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Distribusi Bar */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Distribusi Manpower per Departemen</h3>
                            <div className="h-44 w-full">
                                <canvas ref={chartDistribusi}></canvas>
                            </div>
                        </div>
                        
                        {/* Komposisi Doughnut */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Komposisi Manpower</h3>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="h-36 w-36 relative shrink-0">
                                    <canvas ref={chartKomposisi}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-black text-gray-800">128</span>
                                        <span className="text-[9px] text-gray-500 font-bold">Total</span>
                                    </div>
                                    <div className="absolute top-2 right-4 text-[9px] font-bold text-white z-10">21.9%</div>
                                    <div className="absolute bottom-6 left-2 text-[9px] font-bold text-white z-10">68.8%</div>
                                    <div className="absolute top-2 left-6 text-[9px] font-bold text-white z-10">9.4%</div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#00a65a]"></span>Staff</div>
                                        <div className="font-bold">28 <span className="text-gray-400 font-normal">(21.9%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#0073b7]"></span>Non Staff</div>
                                        <div className="font-bold">88 <span className="text-gray-400 font-normal">(68.8%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#f56954]"></span>Kontrak / Outsource</div>
                                        <div className="font-bold">12 <span className="text-gray-400 font-normal">(9.4%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top 5 Position */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Manpower per Job Position (Top 5)</h3>
                            <div className="h-44 w-full">
                                <canvas ref={chartPosisi}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        {/* Filters */}
                        <div className="p-3 border-b border-gray-100 flex flex-wrap gap-3 items-end">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 mb-1">Departemen</label>
                                <select className="border border-gray-300 rounded text-sm px-2 py-1.5 w-32 focus:outline-none focus:border-gray-400" value={departemen} onChange={e => setDepartemen(e.target.value)}>
                                    <option>Semua</option>
                                    <option>Plant</option>
                                    <option>Workshop</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 mb-1">Status</label>
                                <select className="border border-gray-300 rounded text-sm px-2 py-1.5 w-32 focus:outline-none focus:border-gray-400" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option>Semua</option>
                                    <option>Aktif</option>
                                    <option>Tidak Aktif</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 mb-1">Jenis Karyawan</label>
                                <select className="border border-gray-300 rounded text-sm px-2 py-1.5 w-32 focus:outline-none focus:border-gray-400" value={jenis} onChange={e => setJenis(e.target.value)}>
                                    <option>Semua</option>
                                    <option>Staff</option>
                                    <option>Non Staff</option>
                                </select>
                            </div>
                            
                            <div className="flex-1 min-w-[200px] relative">
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                <input type="text" placeholder="Cari nama, NRP, atau posisi..." className="w-full border border-gray-300 rounded text-sm px-2 py-1.5 pl-8 focus:outline-none focus:border-gray-400" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>

                            <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                Cari
                            </button>
                            <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                                Reset
                            </button>
                        </div>
                        
                        <div className="p-3 border-b border-gray-100 font-bold text-sm text-gray-800">
                            Data Manpower
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left min-w-max">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                    <tr>
                                        <th className="px-3 py-2 font-bold">No</th>
                                        <th className="px-3 py-2 font-bold">NRP</th>
                                        <th className="px-3 py-2 font-bold">Nama</th>
                                        <th className="px-3 py-2 font-bold">Departemen</th>
                                        <th className="px-3 py-2 font-bold">Job Position</th>
                                        <th className="px-3 py-2 font-bold">Jenis Karyawan</th>
                                        <th className="px-3 py-2 font-bold">Tanggal Masuk</th>
                                        <th className="px-3 py-2 font-bold text-center">Status</th>
                                        <th className="px-3 py-2 font-bold">Kontak</th>
                                        <th className="px-3 py-2 font-bold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {manpowers.slice(0, 10).map((item, idx) => (
                                        <tr key={item.id} onDoubleClick={() => router.visit(route('manpowers.edit', item.id))} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-3 py-1.5">{idx + 1}</td>
                                            <td className="px-3 py-1.5">{item.nrp || `10000${idx+1}`}</td>
                                            <td className="px-3 py-1.5 font-semibold">{item.nama}</td>
                                            <td className="px-3 py-1.5">{['Plant', 'Workshop', 'Electrical', 'Tyre', 'Support'][idx % 5]}</td>
                                            <td className="px-3 py-1.5">{item.bagian || 'Mekanik I'}</td>
                                            <td className="px-3 py-1.5">{idx % 3 === 0 ? 'Staff' : 'Non Staff'}</td>
                                            <td className="px-3 py-1.5">{item.doh || `10/01/2018`}</td>
                                            <td className="px-3 py-1.5 text-center">
                                                <span className="inline-block px-3 py-0.5 bg-[#00a65a] text-white rounded font-bold text-[9px]">Aktif</span>
                                            </td>
                                            <td className="px-3 py-1.5 font-mono">{item.kontak}</td>
                                            <td className="px-3 py-1.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="bg-[#2196f3] text-white p-1 rounded" title="Lihat">
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                    </button>
                                                    <button className="bg-[#f39c12] text-white p-1 rounded" title="Edit">
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                    </button>
                                                    <button className="bg-[#f56954] text-white p-1 rounded" title="Hapus">
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
                            <div>Menampilkan 1 - 10 dari 128 data</div>
                            <div className="flex gap-1">
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&laquo;</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&lt;</button>
                                <button className="px-2.5 py-1 rounded border border-[#00a65a] bg-[#00a65a] text-white font-bold">1</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">2</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">3</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">4</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">5</button>
                                <span className="px-1 py-1">...</span>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">13</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&gt;</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&raquo;</button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Rekap Departemen */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Rekap Manpower per Departemen</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b-2 border-gray-200 text-gray-700">
                                        <tr>
                                            <th className="py-1 text-left">No</th>
                                            <th className="py-1 text-left">Departemen</th>
                                            <th className="py-1 text-center">Staff</th>
                                            <th className="py-1 text-center">Non Staff</th>
                                            <th className="py-1 text-center">Kontrak</th>
                                            <th className="py-1 text-center">Total</th>
                                            <th className="py-1 text-center">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {/* Row 1 */}
                                        <tr>
                                            <td className="py-1.5">1</td>
                                            <td className="py-1.5 font-semibold">Plant</td>
                                            <td className="py-1.5 text-center">10</td>
                                            <td className="py-1.5 text-center">18</td>
                                            <td className="py-1.5 text-center">4</td>
                                            <td className="py-1.5 text-center font-bold">32</td>
                                            <td className="py-1.5 text-center text-gray-500">25.0%</td>
                                        </tr>
                                        {/* Row 2 */}
                                        <tr>
                                            <td className="py-1.5">2</td>
                                            <td className="py-1.5 font-semibold">Workshop</td>
                                            <td className="py-1.5 text-center">4</td>
                                            <td className="py-1.5 text-center">12</td>
                                            <td className="py-1.5 text-center">2</td>
                                            <td className="py-1.5 text-center font-bold">18</td>
                                            <td className="py-1.5 text-center text-gray-500">14.1%</td>
                                        </tr>
                                        {/* Row 3 */}
                                        <tr>
                                            <td className="py-1.5">3</td>
                                            <td className="py-1.5 font-semibold">Tyre</td>
                                            <td className="py-1.5 text-center">3</td>
                                            <td className="py-1.5 text-center">11</td>
                                            <td className="py-1.5 text-center">2</td>
                                            <td className="py-1.5 text-center font-bold">16</td>
                                            <td className="py-1.5 text-center text-gray-500">12.5%</td>
                                        </tr>
                                        {/* Row 4 */}
                                        <tr>
                                            <td className="py-1.5">4</td>
                                            <td className="py-1.5 font-semibold">Electrical</td>
                                            <td className="py-1.5 text-center">4</td>
                                            <td className="py-1.5 text-center">8</td>
                                            <td className="py-1.5 text-center">2</td>
                                            <td className="py-1.5 text-center font-bold">14</td>
                                            <td className="py-1.5 text-center text-gray-500">10.9%</td>
                                        </tr>
                                        {/* Row 5 */}
                                        <tr>
                                            <td className="py-1.5">5</td>
                                            <td className="py-1.5 font-semibold">Support</td>
                                            <td className="py-1.5 text-center">6</td>
                                            <td className="py-1.5 text-center">4</td>
                                            <td className="py-1.5 text-center">2</td>
                                            <td className="py-1.5 text-center font-bold">12</td>
                                            <td className="py-1.5 text-center text-gray-500">9.4%</td>
                                        </tr>
                                        {/* Row 6 */}
                                        <tr>
                                            <td className="py-1.5">6</td>
                                            <td className="py-1.5 font-semibold">Others</td>
                                            <td className="py-1.5 text-center">1</td>
                                            <td className="py-1.5 text-center">35</td>
                                            <td className="py-1.5 text-center">0</td>
                                            <td className="py-1.5 text-center font-bold">8</td>
                                            <td className="py-1.5 text-center text-gray-500">6.3%</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="border-t-2 border-gray-200 font-bold">
                                        <tr>
                                            <td colSpan="2" className="py-2">Total</td>
                                            <td className="py-2 text-center">28</td>
                                            <td className="py-2 text-center">88</td>
                                            <td className="py-2 text-center">12</td>
                                            <td className="py-2 text-center">128</td>
                                            <td className="py-2 text-center">100%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Rekap Jenis Karyawan */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Rekap Manpower per Jenis Karyawan</h3>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="h-32 w-32 relative shrink-0 mx-auto lg:mx-0">
                                    <canvas ref={chartRekapKomposisi}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-black text-gray-800">128</span>
                                        <span className="text-[9px] text-gray-500 font-bold">Total</span>
                                    </div>
                                    <div className="absolute top-1 right-2 text-[8px] font-bold text-white z-10">21.9%</div>
                                    <div className="absolute bottom-4 left-1 text-[8px] font-bold text-white z-10">68.8%</div>
                                    <div className="absolute top-2 left-6 text-[8px] font-bold text-white z-10">9.4%</div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#00a65a]"></span>Staff</div>
                                        <div className="font-bold">28 <span className="text-gray-400 font-normal">(21.9%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#0073b7]"></span>Non Staff</div>
                                        <div className="font-bold">88 <span className="text-gray-400 font-normal">(68.8%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#f56954]"></span>Kontrak</div>
                                        <div className="font-bold">12 <span className="text-gray-400 font-normal">(9.4%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informasi */}
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 shadow-sm flex flex-col">
                            <h3 className="text-sm font-bold text-[#166534] mb-3">Informasi</h3>
                            <ul className="space-y-3 text-xs text-gray-700">
                                <li className="flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#16a34a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Data manpower digunakan untuk perhitungan kebutuhan MP
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#16a34a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Pastikan data selalu update dan sesuai kondisi di lapangan
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#16a34a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Gunakan fitur import Excel untuk mempercepat input data
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#16a34a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Data kontrak perlu diperbarui setiap periode
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#16a34a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Hubungi HR untuk perubahan status karyawan
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
