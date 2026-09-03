import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data, topParts }) {
    return (
        <AuthenticatedLayout>
            <Head title="Claim Warranty Report" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Claim Warranty Report</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Laporan klaim warranty untuk part / component yang masih dalam masa garansi.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Claim Warranty Report</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL CLAIM</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_claim}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Klaim</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CLAIM APPROVED</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.approved}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.approved_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CLAIM PENDING</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.pending}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.pending_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm4 11.59L14.59 14 12 11.41 9.41 14 8 12.59 10.59 10 8 7.41 9.41 6 12 8.59 14.59 6 16 7.41 13.41 10 16 12.59z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CLAIM REJECTED</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.rejected}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.rejected_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL CLAIM VALUE</div>
                        <div className="text-xl font-black text-gray-900 leading-none">Rp {stats.total_value}</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Periode Claim</label>
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
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Unit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Kategori Part</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Supplier / Vendor</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Status Claim</label>
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

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6">
                
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider">DAFTAR CLAIM WARRANTY</h3>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-5 pb-0">
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="w-full text-[9px] text-left whitespace-nowrap">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Claim</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No. Claim</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Unit / Equipment</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Part / Component</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Serial Number</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Supplier</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Kerusakan</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Status Claim</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Claim Value (IDR)</th>
                                        <th className="px-2 py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {data.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2.5 text-center text-gray-500">{idx + 1}</td>
                                            <td className="px-2 py-2.5 text-center">{item.tanggal}</td>
                                            <td className="px-2 py-2.5 text-center font-mono font-bold text-gray-700">{item.no_claim}</td>
                                            <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.unit}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-900">{item.part}</td>
                                            <td className="px-2 py-2.5 text-center font-mono text-gray-500">{item.serial}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-700">{item.supplier}</td>
                                            <td className="px-2 py-2.5 text-center">{item.kerusakan}</td>
                                            <td className="px-2 py-2.5 text-center">
                                                {item.status === 'APPROVED' && <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded border border-green-200 text-[8px] uppercase tracking-wide">APPROVED</span>}
                                                {item.status === 'PENDING' && <span className="bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded border border-orange-200 text-[8px] uppercase tracking-wide">PENDING</span>}
                                                {item.status === 'REJECTED' && <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded border border-red-200 text-[8px] uppercase tracking-wide">REJECTED</span>}
                                            </td>
                                            <td className="px-2 py-2.5 text-right font-mono font-bold bg-gray-50/50">{item.value}</td>
                                            <td className="px-2 py-2.5 text-center">
                                                <div className="flex justify-center gap-0.5">
                                                    <button className="text-gray-400 hover:text-blue-600 p-1 rounded transition-all" title="View">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                    </button>
                                                    <button className="text-gray-400 hover:text-blue-600 p-1 rounded transition-all" title="Edit">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
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
                    </div>
                </div>

                {/* Right Side Widgets */}
                <div className="space-y-6">
                    {/* Ringkasan Status Claim */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN STATUS CLAIM</h3>
                        
                        <div className="flex items-center gap-6">
                            {/* Donut Chart */}
                            <div className="relative w-28 h-28 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Rejected (14.0%) - Red */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="14.0 86.0" strokeDashoffset="0"></circle>
                                    
                                    {/* Pending (20.9%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="6" strokeDasharray="20.9 79.1" strokeDashoffset="-14.0"></circle>
                                    
                                    {/* Approved (65.1%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="6" strokeDasharray="65.1 34.9" strokeDashoffset="-34.9"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[9px] font-bold text-gray-500 mb-0.5">Total</span>
                                    <span className="text-xl font-black text-gray-900 leading-none">86</span>
                                    <span className="text-[9px] text-gray-400 mt-0.5">Claim</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                <div className="text-[10px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Approved</span>
                                    </div>
                                    <div className="text-gray-900 font-medium pl-4">56 <span className="text-gray-400 font-normal ml-0.5">(65,1%)</span></div>
                                </div>
                                <div className="text-[10px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Pending</span>
                                    </div>
                                    <div className="text-gray-900 font-medium pl-4">18 <span className="text-gray-400 font-normal ml-0.5">(20,9%)</span></div>
                                </div>
                                <div className="text-[10px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Rejected</span>
                                    </div>
                                    <div className="text-gray-900 font-medium pl-4">12 <span className="text-gray-400 font-normal ml-0.5">(14,0%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Nilai Claim (IDR) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN NILAI CLAIM (IDR)</h3>
                        
                        <div className="space-y-4 relative pb-6">
                            <div className="flex justify-between items-center text-[9px] group gap-3">
                                <div className="w-16 text-gray-700 font-bold">Approved</div>
                                <div className="flex-1 relative h-2">
                                    <div className="absolute left-0 top-0 bottom-0 bg-green-600 rounded-r-full" style={{ width: '85%' }}></div>
                                </div>
                                <div className="w-[100px] text-right font-mono text-gray-600">897.850.000 <span className="text-gray-400 text-[8px] ml-0.5">(72,1%)</span></div>
                            </div>

                            <div className="flex justify-between items-center text-[9px] group gap-3">
                                <div className="w-16 text-gray-700 font-bold">Pending</div>
                                <div className="flex-1 relative h-2">
                                    <div className="absolute left-0 top-0 bottom-0 bg-orange-500 rounded-r-full" style={{ width: '25%' }}></div>
                                </div>
                                <div className="w-[100px] text-right font-mono text-gray-600">231.850.000 <span className="text-gray-400 text-[8px] ml-0.5">(18,6%)</span></div>
                            </div>

                            <div className="flex justify-between items-center text-[9px] group gap-3">
                                <div className="w-16 text-gray-700 font-bold">Rejected</div>
                                <div className="flex-1 relative h-2">
                                    <div className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-r-full" style={{ width: '12%' }}></div>
                                </div>
                                <div className="w-[100px] text-right font-mono text-gray-600">115.730.000 <span className="text-gray-400 text-[8px] ml-0.5">(9,3%)</span></div>
                            </div>
                            
                            {/* X-axis labels */}
                            <div className="absolute bottom-0 left-[76px] right-[112px] flex justify-between text-[8px] text-gray-400">
                                <span>0</span>
                                <span>250M</span>
                                <span>500M</span>
                                <span>750M</span>
                                <span>1.000M</span>
                            </div>
                        </div>
                        <div className="text-center text-[9px] text-gray-400 font-medium mt-1">Nilai Claim (IDR)</div>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets Row (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Nilai Claim Per Bulan (IDR) */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-2">NILAI CLAIM PER BULAN (IDR)</h3>
                    
                    {/* Legend */}
                    <div className="flex justify-center gap-4 mb-4 text-[9px]">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 bg-green-600"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                            <span className="font-bold text-gray-700">Approved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 bg-orange-500"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                            <span className="font-bold text-gray-700">Pending</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 bg-red-600"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                            <span className="font-bold text-gray-700">Rejected</span>
                        </div>
                    </div>

                    {/* Multi-line Chart Area */}
                    <div className="relative flex-1 min-h-[140px] px-2">
                        {/* Y-axis labels */}
                        <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[8px] text-gray-400 pb-5 pt-0 pr-1 text-right w-6">
                            <span className="text-[7px] text-left absolute -top-3 -left-1">Juta Rupiah</span>
                            <span>500</span>
                            <span>400</span>
                            <span>300</span>
                            <span>200</span>
                            <span>100</span>
                            <span>0</span>
                        </div>
                        
                        <div className="absolute inset-0 ml-6 pb-5">
                            {/* Grid lines */}
                            <div className="h-full w-full flex flex-col justify-between">
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-200 w-full h-0"></div>
                            </div>
                            
                            {/* Lines */}
                            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                                {/* Approved (Green) */}
                                <path d="M 10 90 L 70 70 L 130 55 L 190 20 L 250 25 L 310 5" fill="none" stroke="#16a34a" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                                {/* Points */}
                                <circle cx="10" cy="90" r="3" fill="#16a34a"/>
                                <circle cx="70" cy="70" r="3" fill="#16a34a"/>
                                <circle cx="130" cy="55" r="3" fill="#16a34a"/>
                                <circle cx="190" cy="20" r="3" fill="#16a34a"/>
                                <circle cx="250" cy="25" r="3" fill="#16a34a"/>
                                <circle cx="310" cy="5" r="3" fill="#16a34a"/>

                                {/* Pending (Orange) */}
                                <path d="M 10 105 L 70 95 L 130 90 L 190 70 L 250 75 L 310 60" fill="none" stroke="#f97316" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                                {/* Points */}
                                <circle cx="10" cy="105" r="3" fill="#f97316"/>
                                <circle cx="70" cy="95" r="3" fill="#f97316"/>
                                <circle cx="130" cy="90" r="3" fill="#f97316"/>
                                <circle cx="190" cy="70" r="3" fill="#f97316"/>
                                <circle cx="250" cy="75" r="3" fill="#f97316"/>
                                <circle cx="310" cy="60" r="3" fill="#f97316"/>

                                {/* Rejected (Red) */}
                                <path d="M 10 115 L 70 110 L 130 110 L 190 108 L 250 108 L 310 105" fill="none" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                                {/* Points */}
                                <circle cx="10" cy="115" r="3" fill="#ef4444"/>
                                <circle cx="70" cy="110" r="3" fill="#ef4444"/>
                                <circle cx="130" cy="110" r="3" fill="#ef4444"/>
                                <circle cx="190" cy="108" r="3" fill="#ef4444"/>
                                <circle cx="250" cy="108" r="3" fill="#ef4444"/>
                                <circle cx="310" cy="105" r="3" fill="#ef4444"/>
                            </svg>
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[8px] text-gray-500 font-medium px-2">
                            <span>Mar 2024</span>
                            <span>Apr 2024</span>
                            <span>Mei 2024</span>
                            <span>Jun 2024</span>
                            <span>Jul 2024</span>
                            <span>Agu 2024</span>
                        </div>
                    </div>
                </div>

                {/* 2. Top 5 Part */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">TOP 5 PART DENGAN NILAI CLAIM TERTINGGI</h3>
                    
                    <div className="overflow-x-auto flex-1 flex flex-col justify-between">
                        <table className="w-full text-[9px] text-left">
                            <thead className="bg-[#0a4d3c] text-white">
                                <tr>
                                    <th className="px-2 py-2 font-semibold">No</th>
                                    <th className="px-2 py-2 font-semibold">Part / Component</th>
                                    <th className="px-2 py-2 font-semibold text-right">Total Claim</th>
                                    <th className="px-2 py-2 font-semibold text-right">Persentase</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topParts.map((part, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-2 py-2 text-center text-gray-500">{idx + 1}</td>
                                        <td className="px-2 py-2 font-medium text-gray-800">{part.name}</td>
                                        <td className="px-2 py-2 text-right text-gray-900 font-mono">{part.value}</td>
                                        <td className="px-2 py-2 text-right text-gray-900 font-bold">{part.pct}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between items-center text-[10px] pt-3 border-t-2 border-gray-200 font-bold text-gray-900 mt-2 px-2 uppercase tracking-wider">
                            <span>TOTAL TOP 5</span>
                            <span className="font-mono">Rp 946.600.000 <span className="ml-4 font-sans">76,0%</span></span>
                        </div>
                    </div>
                </div>

                {/* 3. Informasi */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">INFORMASI</h3>
                    
                    <ul className="text-[10px] text-gray-600 space-y-2.5 list-disc pl-4 mb-4 leading-relaxed flex-1">
                        <li>Data diambil berdasarkan tanggal pengajuan claim warranty.</li>
                        <li><strong>Claim Approved:</strong> Claim disetujui oleh Principal/Supplier.</li>
                        <li><strong>Claim Pending:</strong> Menunggu hasil inspeksi/keputusan.</li>
                        <li><strong>Claim Rejected:</strong> Claim ditolak oleh Principal/Supplier.</li>
                    </ul>
                    
                    <div className="bg-green-50/80 border border-green-200 text-green-800 text-[10px] font-medium py-3 px-4 rounded-lg mt-auto space-y-1">
                        <div>Terakhir update: 30/08/2024 10:30 WIB</div>
                        <div className="text-gray-500">Oleh: Planner (PLN-001)</div>
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
                    Print Report
                </button>
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    New Claim
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
