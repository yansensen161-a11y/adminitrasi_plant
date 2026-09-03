import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, bottomStats, data, reasons }) {
    const [activeTab, setActiveTab] = useState('daftar');

    return (
        <AuthenticatedLayout>
            <Head title="Historical Tyre" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Historical Tyre</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Riwayat penggunaan ban (tyre) yang telah selesai digunakan/diganti pada unit.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Historical Tyre</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL TYRE</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_tyre}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Ban</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TYRE COMPLETED</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.completed}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.completed_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL USAGE (KM)</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_usage_km}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Kilometer</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL USAGE (HOUR)</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_usage_hour}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Jam</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL COST</div>
                        <div className="text-xl font-black text-gray-900 leading-none">Rp {stats.total_cost}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Biaya</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Lokasi</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Unit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tipe Tyre</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Merk / Brand</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Ukuran Tyre</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Periode Diganti</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <input type="text" value="01/06/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">s/d</span>
                                <div className="relative w-full">
                                    <input type="text" value="31/08/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
                        <button className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-xs transition border border-gray-200 flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6">
                
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="flex px-6 pt-4 border-b border-gray-200 gap-6">
                        <button 
                            onClick={() => setActiveTab('daftar')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'daftar' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            DAFTAR HISTORICAL TYRE
                        </button>
                        <button 
                            onClick={() => setActiveTab('summary')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'summary' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            SUMMARY ANALISA
                        </button>
                        <button 
                            onClick={() => setActiveTab('grafik')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'grafik' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            GRAFIK & ANALISA
                        </button>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-5 pb-0">
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="w-full text-[9px] text-left whitespace-nowrap">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Diganti</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Unit / Equipment</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Posisi</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Serial Number</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Tyre</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Merk / Brand</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Ukuran</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Usage (KM)</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Usage (Jam)</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Alasan Penggantian</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Biaya (IDR)</th>
                                        <th className="px-2 py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {data.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2.5 text-center text-gray-500">{idx + 1}</td>
                                            <td className="px-2 py-2.5 text-center">{item.tanggal}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.unit}</td>
                                            <td className="px-2 py-2.5 text-center">{item.lokasi}</td>
                                            <td className="px-2 py-2.5 text-center">{item.posisi}</td>
                                            <td className="px-2 py-2.5 text-center font-mono text-gray-500">{item.serial}</td>
                                            <td className="px-2 py-2.5 text-center">{item.tipe}</td>
                                            <td className="px-2 py-2.5 text-center">{item.merk}</td>
                                            <td className="px-2 py-2.5 text-center font-mono">{item.ukuran}</td>
                                            <td className="px-2 py-2.5 text-center font-mono font-bold bg-gray-50/50">{item.usage_km}</td>
                                            <td className="px-2 py-2.5 text-center font-mono font-bold bg-gray-50/50">{item.usage_jam}</td>
                                            <td className="px-2 py-2.5 text-center">{item.alasan}</td>
                                            <td className="px-2 py-2.5 text-right font-mono font-bold text-gray-900">{item.biaya}</td>
                                            <td className="px-2 py-2.5 text-center">
                                                <button className="text-gray-400 hover:text-blue-600 p-1 rounded transition-all" title="View">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="pt-3 pb-4 flex justify-between items-center text-xs text-gray-500 mt-2">
                            <div>
                                Menampilkan 1 - 10 dari 487 data
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-1">
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0a4d3c] text-white font-bold">1</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">2</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">3</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">4</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">5</button>
                                    <span className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">49</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                                </div>
                                <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none bg-white">
                                    <option>10 / halaman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Widgets (Ringkasan Status Tyre & Alasan Penggantian) */}
                <div className="space-y-6">
                    {/* Ringkasan Status Tyre */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN STATUS TYRE</h3>
                        
                        <div className="flex flex-col items-center">
                            {/* Donut Chart */}
                            <div className="relative w-36 h-36 mb-6">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Scrap (1.9%) - Red */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="1.9 98.1" strokeDashoffset="0"></circle>
                                    
                                    {/* In Use (8.3%) - Blue */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="8.3 91.7" strokeDashoffset="-1.9"></circle>
                                    
                                    {/* Completed (89.8%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="89.8 10.2" strokeDashoffset="-10.2"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Total</span>
                                    <span className="text-xl font-black text-gray-900 leading-none">542</span>
                                    <span className="text-[9px] text-gray-400 mt-0.5">Ban</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Completed</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">487 <span className="text-gray-400 font-normal ml-0.5">(89,8%)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">In Use</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">45 <span className="text-gray-400 font-normal ml-0.5">(8,3%)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Scrap</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">10 <span className="text-gray-400 font-normal ml-0.5">(1,9%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alasan Penggantian (Top 5) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between flex-1">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">ALASAN PENGGANTIAN (TOP 5)</h3>
                        
                        <div className="space-y-4 mb-4">
                            {/* Colors array for progress bars */}
                            {(() => {
                                const colors = ['bg-green-700', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                                return reasons.map((reason, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[9px] group gap-3">
                                        <div className="w-24 truncate text-gray-700 font-medium" title={reason.name}>{reason.name}</div>
                                        <div className="flex-1">
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-300`} style={{ width: `${reason.pct}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="font-bold text-gray-900">{reason.count}</span> <span className="text-gray-400">({reason.pct.toString().replace('.', ',')}%)</span>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        
                        <div className="flex justify-between items-center text-[11px] pt-3 border-t border-gray-100 font-bold text-gray-900 mt-auto">
                            <span>Total</span>
                            <span>542 (100%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets Row (4 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 1. Usage Rata-Rata Tyre */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">USAGE RATA-RATA TYRE</h3>
                    
                    <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                        <div className="bg-gray-50/50 p-4 rounded-lg text-center border border-gray-100">
                            <div className="text-[9px] font-bold text-gray-500 mb-1">Rata-rata Usage (KM)</div>
                            <div className="text-2xl font-black text-gray-900">{bottomStats.rata_usage_km}</div>
                            <div className="text-[9px] text-gray-400 mt-1">Kilometer</div>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg text-center border border-gray-100">
                            <div className="text-[9px] font-bold text-gray-500 mb-1">Rata-rata Usage (Jam)</div>
                            <div className="text-2xl font-black text-gray-900">{bottomStats.rata_usage_hour}</div>
                            <div className="text-[9px] text-gray-400 mt-1">Jam</div>
                        </div>
                    </div>
                </div>

                {/* 2. Ringkasan Biaya */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN BIAYA</h3>
                    
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-gray-500 mb-0.5">Total Biaya</div>
                                <div className="text-lg font-black text-gray-900 leading-none">Rp {bottomStats.total_biaya}</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-gray-500 mb-0.5">Rata-rata Biaya per Tyre</div>
                                <div className="text-lg font-black text-gray-900 leading-none">Rp {bottomStats.rata_biaya_per_tyre}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Usage Distribution (KM) */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">USAGE DISTRIBUTION (KM)</h3>
                    
                    <div className="flex items-center justify-between flex-1 gap-2">
                        {/* Donut Chart */}
                        <div className="relative w-28 h-28 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                {/* > 15.000 KM (15.8%) - Purple */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#a855f7" strokeWidth="8" strokeDasharray="15.8 84.2" strokeDashoffset="0"></circle>
                                
                                {/* 10.001 - 15.000 KM (26.9%) - Orange */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="26.9 73.1" strokeDashoffset="-15.8"></circle>
                                
                                {/* 5.001 - 10.000 KM (36.5%) - Blue */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="36.5 63.5" strokeDashoffset="-42.7"></circle>
                                
                                {/* 0 - 5.000 KM (20.6%) - Green */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="20.6 79.4" strokeDashoffset="-79.2"></circle>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Tire Icon inside donut */}
                                <div className="w-8 h-8 rounded-full border-4 border-gray-800 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-800"></div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2.5 w-full">
                            <div className="flex justify-between items-center text-[9px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">0 - 5.000 KM</span>
                                </div>
                                <div className="text-gray-900 font-medium">112 <span className="text-gray-400 font-normal ml-0.5">(20,6%)</span></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">5.001 - 10.000 KM</span>
                                </div>
                                <div className="text-gray-900 font-medium">198 <span className="text-gray-400 font-normal ml-0.5">(36,5%)</span></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">10.001 - 15.000 KM</span>
                                </div>
                                <div className="text-gray-900 font-medium">146 <span className="text-gray-400 font-normal ml-0.5">(26,9%)</span></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">&gt; 15.000 KM</span>
                                </div>
                                <div className="text-gray-900 font-medium">86 <span className="text-gray-400 font-normal ml-0.5">(15,8%)</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Informasi */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">INFORMASI</h3>
                    
                    <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">
                        Data pada menu ini merupakan riwayat ban yang telah selesai digunakan dan diganti pada unit/equipment.
                    </p>
                    
                    <ul className="text-[10px] text-gray-600 space-y-1 list-disc pl-4 mb-4 leading-relaxed flex-1">
                        <li>Pastikan data penggunaan ban diinput dengan benar.</li>
                        <li>Data biaya adalah total biaya pembelian ban.</li>
                        <li>Data usage diambil saat ban dilepas.</li>
                    </ul>
                    
                    <div className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-medium py-2 px-3 rounded-lg mt-auto">
                        Terakhir update: 30/08/2024 10:30 WIB
                    </div>
                </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 mb-10">
                <button className="bg-white hover:bg-gray-50 border border-[#0a4d3c] text-[#0a4d3c] font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    Export Excel
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                    Print
                </button>
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Download Report
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
