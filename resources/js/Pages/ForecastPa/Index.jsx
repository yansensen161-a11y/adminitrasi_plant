import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data, categories }) {
    const [activeTab, setActiveTab] = useState('daftar');

    return (
        <AuthenticatedLayout>
            <Head title="Forecast PA Unit" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Forecast PA Unit</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Perkiraan kebutuhan part (PA) berdasarkan planning next service unit dan backlog/open temuan.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Planner</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Forecast PA Unit</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL KEBUTUHAN PA (QTY)</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_qty}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Item</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6h-2zm0-8h-2V7h2v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ESTIMASI NILAI (IDR)</div>
                        <div className="text-xl font-black text-gray-900 leading-none">Rp {stats.estimasi_nilai}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Total Estimasi</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">UNIT AKAN SERVICE <span className="lowercase normal-case font-normal">(NEXT 3 BULAN)</span></div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.unit_akan_service}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">BACKLOG / OPEN TEMUAN</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.backlog_open}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Item</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">URGENT <span className="lowercase normal-case font-normal">(≤ 30 HARI)</span></div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.urgent}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Item</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
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
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tipe Service</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Periode Service (Next)</label>
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
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Sumber</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
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

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
                
                {/* Main Content Area (Left Column) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="flex px-6 pt-4 border-b border-gray-200 gap-6">
                        <button 
                            onClick={() => setActiveTab('daftar')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'daftar' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Daftar Forecast PA
                        </button>
                        <button 
                            onClick={() => setActiveTab('tipe')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tipe' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Ringkasan per Tipe Service
                        </button>
                        <button 
                            onClick={() => setActiveTab('lokasi')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'lokasi' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Ringkasan per Lokasi
                        </button>
                        <button 
                            onClick={() => setActiveTab('grafik')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'grafik' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Grafik & Analisa
                        </button>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-6">
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="w-full text-[10px] text-left">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Code Unit</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service (Next)</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">HM Target</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Estimasi</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Sumber</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Item PA</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Total Qty</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Estimasi Nilai (IDR)</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Urgent</th>
                                        <th className="px-2 py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {data.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.code_unit}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{item.equipment}</td>
                                            <td className="px-2 py-2.5 text-center">{item.lokasi}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.tipe_service_next}</td>
                                            <td className="px-2 py-2.5 text-center font-mono text-gray-600">{item.hm_target}</td>
                                            <td className="px-2 py-2.5 text-center">{item.tanggal_estimasi}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{item.sumber}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.item_pa}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900 bg-gray-50/50">{item.total_qty}</td>
                                            <td className="px-2 py-2.5 text-right font-mono font-bold text-[#0b5c3e]">{item.estimasi_nilai}</td>
                                            <td className="px-2 py-2.5 text-center">
                                                {item.urgent ? (
                                                    <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded border border-red-200 text-[9px] uppercase tracking-wide">Ya</span>
                                                ) : (
                                                    <span className="text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-200 text-[9px] uppercase tracking-wide">Tidak</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <button className="text-gray-400 hover:text-blue-600 p-1 border border-transparent hover:border-blue-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="pt-3 flex justify-between items-center text-xs text-gray-500 mb-8 border-t border-gray-100 mt-2">
                            <div>
                                Menampilkan 1 - 10 dari 86 data
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
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">9</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                                </div>
                                <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none bg-white">
                                    <option>10 / halaman</option>
                                </select>
                            </div>
                        </div>

                        {/* Bottom Section (Table & Notes) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top 5 Categories */}
                            <div>
                                <h3 className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider mb-3">TOP 5 KATEGORI COMPONENT</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[10px] text-left border border-gray-100 rounded">
                                        <thead className="bg-[#0a4d3c] text-white">
                                            <tr>
                                                <th className="px-2 py-2 font-semibold">No.</th>
                                                <th className="px-2 py-2 font-semibold">Kategori Component</th>
                                                <th className="px-2 py-2 font-semibold text-center">Total Item</th>
                                                <th className="px-2 py-2 font-semibold text-center">Total Qty</th>
                                                <th className="px-2 py-2 font-semibold text-right">Estimasi Nilai (IDR)</th>
                                                <th className="px-2 py-2 font-semibold text-right">% Nilai</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {categories.map((cat, idx) => (
                                                <tr key={cat.id}>
                                                    <td className="px-2 py-1.5">{idx + 1}.</td>
                                                    <td className="px-2 py-1.5 font-medium">{cat.name}</td>
                                                    <td className="px-2 py-1.5 text-center">{cat.total_item}</td>
                                                    <td className="px-2 py-1.5 text-center">{cat.total_qty}</td>
                                                    <td className="px-2 py-1.5 text-right font-mono">{cat.estimasi_nilai}</td>
                                                    <td className="px-2 py-1.5 text-right font-bold text-gray-900">{cat.persen}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                                <td colSpan="2" className="px-2 py-1.5">Total</td>
                                                <td className="px-2 py-1.5 text-center">100</td>
                                                <td className="px-2 py-1.5 text-center">774</td>
                                                <td className="px-2 py-1.5 text-right font-mono">2.127.400.000</td>
                                                <td className="px-2 py-1.5 text-right">77,4%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h3 className="text-[11px] font-extrabold text-green-700 uppercase tracking-wider mb-3">CATATAN</h3>
                                <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                                    <li>Forecast ini berdasarkan planning next service dan backlog/open temuan.</li>
                                    <li>Estimasi nilai menggunakan harga standard part terbaru.</li>
                                    <li>Periode forecast: Next 3 Bulan (01/06/2024 - 31/08/2024).</li>
                                    <li>Data dapat berubah mengikuti update HM dan temuan terbaru.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="space-y-6">
                    {/* Ringkasan Sumber Kebutuhan */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN SUMBER KEBUTUHAN</h3>
                        
                        <div className="flex flex-col items-center">
                            {/* CSS-based Donut Chart Mock */}
                            <div className="relative w-36 h-36 mb-6">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Inspection / Lainnya (8.1%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="8 92" strokeDashoffset="-92"></circle>
                                    
                                    {/* Backlog / Open Temuan (35.2%) - Blue */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="-57"></circle>
                                    
                                    {/* Next Service (56.7%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="57 43" strokeDashoffset="0"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                                    <span className="text-xl font-black text-gray-900 leading-none">1.256</span>
                                    <span className="text-[9px] text-gray-400">Item</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                <div className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                        <span className="text-gray-700 font-medium">Next Service</span>
                                    </div>
                                    <div className="text-gray-500 font-medium">712 Item <span className="text-gray-400">(56,7%)</span></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="text-gray-700 font-medium">Backlog / Open Temuan</span>
                                    </div>
                                    <div className="text-gray-500 font-medium">442 Item <span className="text-gray-400">(35,2%)</span></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                                        <span className="text-gray-700 font-medium">Inspection / Lainnya</span>
                                    </div>
                                    <div className="text-gray-500 font-medium">102 Item <span className="text-gray-400">(8,1%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Urgency */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN URGENCY</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-bold text-gray-700">≤ 30 Hari (Urgent)</span>
                                    <span className="text-gray-500 font-medium">37 Item <span className="text-gray-400 ml-1">(29,6%)</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: '29.6%' }}></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-bold text-gray-700">31 - 60 Hari</span>
                                    <span className="text-gray-500 font-medium">58 Item <span className="text-gray-400 ml-1">(46,4%)</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 rounded-full" style={{ width: '46.4%' }}></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-bold text-gray-700">&gt; 60 Hari</span>
                                    <span className="text-gray-500 font-medium">30 Item <span className="text-gray-400 ml-1">(24,0%)</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0a4d3c] rounded-full" style={{ width: '24.0%' }}></div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between text-[11px] pt-3 border-t border-gray-100 font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>125 Item</span>
                            </div>
                        </div>
                    </div>

                    {/* Estimasi Nilai Kebutuhan (IDR) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-2">ESTIMASI NILAI KEBUTUHAN (IDR)</h3>
                        <div className="text-[9px] text-gray-400 mb-4">Juta Rupiah</div>
                        
                        {/* Mock Line Chart */}
                        <div className="relative h-32 w-full">
                            {/* Y-Axis labels */}
                            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[9px] text-gray-400 pb-5 pt-1 pr-2 w-8 text-right">
                                <span>1.000</span>
                                <span>750</span>
                                <span>500</span>
                                <span>250</span>
                                <span>0</span>
                            </div>
                            
                            <div className="absolute inset-0 ml-8 pb-5">
                                {/* Grid lines */}
                                <div className="h-full w-full flex flex-col justify-between">
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-200 w-full h-0"></div>
                                </div>
                                
                                {/* SVG Line */}
                                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                                    <path 
                                        d="M 15 65 L 120 10 L 230 65" 
                                        fill="none" 
                                        stroke="#10b981" 
                                        strokeWidth="2" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Points */}
                                    <circle cx="15" cy="65" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                    <circle cx="120" cy="10" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                    <circle cx="230" cy="65" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                </svg>
                                
                                {/* Value Labels */}
                                <div className="absolute top-[48px] left-[5px] text-[9px] font-bold text-gray-600">820 Jt</div>
                                <div className="absolute top-[-5px] left-[105px] text-[9px] font-bold text-gray-600">1.120 Jt</div>
                                <div className="absolute top-[48px] left-[215px] text-[9px] font-bold text-gray-600">806 Jt</div>
                            </div>
                            
                            {/* X-Axis labels */}
                            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[9px] text-gray-500 font-medium px-2">
                                <span>Jun 2024</span>
                                <span>Jul 2024</span>
                                <span>Aug 2024</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 mb-10">
                <button className="bg-white hover:bg-gray-50 border border-[#0a4d3c] text-[#0a4d3c] font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    Export Excel
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                    Print
                </button>
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Buat Forecast Baru
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
