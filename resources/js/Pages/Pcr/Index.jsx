import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data, categories }) {
    const [activeTab, setActiveTab] = useState('daftar');

    return (
        <AuthenticatedLayout>
            <Head title="PCR U/C & Component" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">PCR U/C & Component</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Monitoring penggantian / repair component (PCR - Parts Change & Repair) serta status Unit Component (U/C).</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">PCR U/C & Component</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL U/C COMPONENT</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_uc_component}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Komponen</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">GOOD CONDITION</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.good_condition}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.good_condition_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.05-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.19-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.19.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">NEED ATTENTION</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.need_attention}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.need_attention_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">NEED REPLACEMENT</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.need_replacement}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.need_replacement_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL PCR DILAKUKAN</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_pcr}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Penggantian / Repair</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tipe Component</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Kategori Component</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Unit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Lokasi</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Status</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Periode PCR</label>
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

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-6">
                {/* Tabs */}
                <div className="flex px-6 pt-4 border-b border-gray-200 gap-6">
                    <button 
                        onClick={() => setActiveTab('daftar')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'daftar' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        DAFTAR U/C COMPONENT
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        HISTORICAL PCR (PENGGANTIAN / REPAIR)
                    </button>
                </div>

                {/* Table Area */}
                <div className="flex-1 p-6 pb-0">
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-[#0a4d3c] text-white">
                                <tr>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Unit / Equipment</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Component</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Component</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Kategori</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Serial Number</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">HM Saat Ini</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">HM Install</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Umur Pakai<br/>(HM)</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Sisa Umur<br/>(HM)</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Kondisi</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                    <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Keterangan</th>
                                    <th className="px-2 py-3 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {data.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-2.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                                        <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.unit}</td>
                                        <td className="px-2 py-2.5 text-center text-gray-900 font-medium">{item.component}</td>
                                        <td className="px-2 py-2.5 text-center">{item.tipe_component}</td>
                                        <td className="px-2 py-2.5 text-center">{item.kategori}</td>
                                        <td className="px-2 py-2.5 text-center font-mono text-gray-500">{item.serial_number}</td>
                                        <td className="px-2 py-2.5 text-center">{item.lokasi}</td>
                                        <td className="px-2 py-2.5 text-center font-mono bg-gray-50/50">{item.hm_saat_ini}</td>
                                        <td className="px-2 py-2.5 text-center font-mono bg-gray-50/50">{item.hm_install}</td>
                                        <td className="px-2 py-2.5 text-center font-mono font-bold">{item.umur_pakai}</td>
                                        <td className={`px-2 py-2.5 text-center font-mono font-bold ${
                                            parseInt(item.sisa_umur.replace('.', '')) <= 0 || parseInt(item.sisa_umur.replace('.', '')) < 500 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {item.sisa_umur}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {item.kondisi === 'POOR' && <span className="text-red-600 font-bold text-[9px] uppercase tracking-wide">POOR</span>}
                                            {item.kondisi === 'GOOD' && <span className="text-green-600 font-bold text-[9px] uppercase tracking-wide">GOOD</span>}
                                            {item.kondisi === 'FAIR' && <span className="text-orange-500 font-bold text-[9px] uppercase tracking-wide">FAIR</span>}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {item.status === 'NEED REPLACEMENT' && <span className="bg-red-50 text-red-600 font-bold px-2 py-1 rounded border border-red-200 text-[8px] uppercase tracking-wide">NEED REPLACEMENT</span>}
                                            {item.status === 'GOOD CONDITION' && <span className="bg-green-50 text-green-600 font-bold px-2 py-1 rounded border border-green-200 text-[8px] uppercase tracking-wide">GOOD CONDITION</span>}
                                            {item.status === 'NEED ATTENTION' && <span className="bg-orange-50 text-orange-500 font-bold px-2 py-1 rounded border border-orange-200 text-[8px] uppercase tracking-wide">NEED ATTENTION</span>}
                                        </td>
                                        <td className="px-2 py-2.5 text-left text-gray-500">{item.keterangan}</td>
                                        <td className="px-2 py-2.5 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button className="text-gray-400 hover:text-blue-600 p-1 border border-transparent hover:border-blue-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </button>
                                                <button className="text-gray-400 hover:text-blue-600 p-1 border border-transparent hover:border-blue-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="pt-3 pb-4 flex justify-between items-center text-xs text-gray-500 mt-2">
                        <div>
                            Menampilkan 1 - 10 dari 156 data
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
                                <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">16</button>
                                <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                            </div>
                            <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none bg-white">
                                <option>10 / halaman</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Ringkasan Kondisi Component */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN KONDISI COMPONENT</h3>
                    <div className="flex items-center gap-6 justify-center flex-1">
                        {/* SVG Donut Chart Mockup */}
                        <div className="relative w-32 h-32 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                {/* Need Replacement 16.6% - Red */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="16.6 83.4" strokeDashoffset="0"></circle>
                                
                                {/* Need Attention 24.4% - Orange */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="8" strokeDasharray="24.4 75.6" strokeDashoffset="-16.6"></circle>
                                
                                {/* Good Condition 59% - Green */}
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="59 41" strokeDashoffset="-41"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {/* Labels inside chart */}
                                <span className="absolute top-[3px] left-[18px] text-[8px] font-bold text-white transform -rotate-12">17%</span>
                                <span className="absolute bottom-[30px] left-[6px] text-[8px] font-bold text-white">24%</span>
                                <span className="absolute bottom-[20px] right-[10px] text-[10px] font-bold text-white">59%</span>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Good Condition</span>
                                </div>
                                <span className="text-gray-500">92 Komponen <span className="text-gray-400">(59,0%)</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Need Attention</span>
                                </div>
                                <span className="text-gray-500">38 Komponen <span className="text-gray-400">(24,4%)</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Need Replacement</span>
                                </div>
                                <span className="text-gray-500">26 Komponen <span className="text-gray-400">(16,6%)</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] pt-3 border-t border-gray-100 font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>156 Komponen</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Kategori Component */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN KATEGORI COMPONENT</h3>
                    <div className="space-y-3 flex-1">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] group">
                                <div className="w-32 truncate text-gray-700 font-medium">{cat.name}</div>
                                <div className="flex-1 px-4">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors" style={{ width: `${cat.pct}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-20 text-right text-gray-500">
                                    {cat.count} <span className="text-gray-400">({cat.pct.toString().replace('.', ',')}%)</span>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center text-[11px] pt-3 border-t border-gray-100 font-bold text-gray-900 mt-2">
                            <span>Total</span>
                            <span>156 Komponen</span>
                        </div>
                    </div>
                </div>

                {/* Informasi */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">INFORMASI</h3>
                    <div className="text-[11px] text-gray-600 space-y-2 mb-4">
                        <p><strong>U/C</strong> (Unit Component) adalah daftar component pada unit dan status kondisinya.</p>
                        <p><strong>PCR</strong> (Parts Change & Repair) adalah aktivitas penggantian/repair component.</p>
                    </div>
                    
                    <div className="mt-auto bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex gap-2 items-start">
                            <svg className="w-4 h-4 fill-current text-orange-500 shrink-0 mt-0.5" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                            <div>
                                <div className="text-[10px] font-extrabold text-orange-700 mb-1">PERHATIAN</div>
                                <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                                    26 component berstatus NEED REPLACEMENT.<br/>
                                    Segera lakukan penggantian untuk menghindari breakdown unit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Add Button */}
            <div className="flex justify-end mb-10">
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm border border-[#0b5c3e]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Tambah PCR Baru
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
