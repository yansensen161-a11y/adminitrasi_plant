import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, sumberTemuan, kategoriTemuan, data }) {
    return (
        <AuthenticatedLayout>
            <Head title="Report SOS / PAP Result" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Report SOS / PAP Result</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Laporan hasil temuan SOS / PAP dari setiap service (PM/Repair/Breakdown) dan status penyelesaiannya.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Report SOS/PAP Result</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL TEMUAN</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_temuan}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">Temuan</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CLOSED</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.closed}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">({stats.closed_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">OPEN / IN PROGRESS</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.open_in_progress}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">({stats.open_in_progress_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">OVER DUE</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.over_due}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">({stats.over_due_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ESTIMASI BIAYA</div>
                        <div className="text-xl font-black text-gray-900 leading-none">Rp {stats.estimasi_biaya}</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Unit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Tipe Service</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Sumber Temuan</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Status Temuan</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Periode Temuan</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <input type="text" value="01/06/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500">s/d</span>
                                <div className="relative w-full">
                                    <input type="text" value="31/08/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
                        <button className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-sm transition border border-gray-200 flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Widgets Row (Ringkasan Sumber Temuan & Status Temuan) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Ringkasan Berdasarkan Sumber Temuan */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN BERDASARKAN SUMBER TEMUAN</h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between flex-1">
                        {/* Table */}
                        <div className="w-full md:w-3/5 overflow-x-auto">
                            <table className="w-full text-[9px] text-left border border-gray-100 rounded">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">No</th>
                                        <th className="px-2 py-2 font-semibold">Sumber Temuan</th>
                                        <th className="px-2 py-2 font-semibold text-center">Total Temuan</th>
                                        <th className="px-2 py-2 font-semibold text-center">Closed</th>
                                        <th className="px-2 py-2 font-semibold text-center">Open / In Progress</th>
                                        <th className="px-2 py-2 font-semibold text-center">Over Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {sumberTemuan.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2 text-center text-gray-500">{idx + 1}</td>
                                            <td className="px-2 py-2 font-medium">{item.sumber}</td>
                                            <td className="px-2 py-2 text-center font-bold">{item.total}</td>
                                            <td className="px-2 py-2 text-center">{item.closed}</td>
                                            <td className="px-2 py-2 text-center">{item.open}</td>
                                            <td className="px-2 py-2 text-center">{item.overdue}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                        <td colSpan="2" className="px-2 py-2 text-center">TOTAL</td>
                                        <td className="px-2 py-2 text-center">356</td>
                                        <td className="px-2 py-2 text-center">214 (60,1%)</td>
                                        <td className="px-2 py-2 text-center">102 (28,7%)</td>
                                        <td className="px-2 py-2 text-center">40 (11,2%)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Donut Chart and Legend */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-28 h-28 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Overdue (11.2%) - Red */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="11.2 88.8" strokeDashoffset="0"></circle>
                                    
                                    {/* Open (28.7%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="6" strokeDasharray="28.7 71.3" strokeDashoffset="-11.2"></circle>
                                    
                                    {/* Closed (60.1%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="6" strokeDasharray="60.1 39.9" strokeDashoffset="-39.9"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-gray-900 leading-none">356</span>
                                    <span className="text-[8px] font-bold text-gray-500 mt-1 text-center leading-tight uppercase">Total<br/>Temuan</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="space-y-3">
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Closed</span>
                                    </div>
                                    <div className="text-gray-500 pl-4">214 (60,1%)</div>
                                </div>
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Open / In Progress</span>
                                    </div>
                                    <div className="text-gray-500 pl-4">102 (28,7%)</div>
                                </div>
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Over Due</span>
                                    </div>
                                    <div className="text-gray-500 pl-4">40 (11,2%)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Status Temuan (Vertical Bar Chart) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN STATUS TEMUAN</h3>
                    
                    <div className="relative flex-1 flex flex-col justify-end mt-2 h-32 px-4 pb-6">
                        {/* Y-axis labels */}
                        <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[9px] text-gray-400 pb-5 pt-0 pr-1 text-right w-10">
                            <span className="text-[8px] mb-1 text-left text-gray-500 uppercase tracking-tighter">Jumlah Temuan</span>
                            <span>250</span>
                            <span>200</span>
                            <span>150</span>
                            <span>100</span>
                            <span>50</span>
                            <span>0</span>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="absolute inset-0 ml-10 pb-5">
                            {/* Grid lines */}
                            <div className="h-full w-full flex flex-col justify-between pt-4">
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-100 w-full h-0"></div>
                                <div className="border-t border-gray-200 w-full h-0"></div>
                            </div>
                            
                            {/* Bars */}
                            <div className="absolute inset-0 pt-4 flex justify-around items-end px-4">
                                {/* Closed Bar */}
                                <div className="flex flex-col items-center group w-12">
                                    <div className="text-[9px] font-bold text-gray-700 mb-0.5 text-center leading-tight">214<br/><span className="text-gray-400 font-normal">(60,1%)</span></div>
                                    <div className="w-10 bg-green-600 rounded-t-sm shadow-sm transition-all group-hover:bg-green-500" style={{ height: '85%' }}></div>
                                    <div className="absolute bottom-[-18px] text-[9px] font-medium text-gray-600 text-center w-20 transform -translate-x-1/2 left-1/2">Closed</div>
                                </div>
                                
                                {/* Open Bar */}
                                <div className="flex flex-col items-center group w-12">
                                    <div className="text-[9px] font-bold text-gray-700 mb-0.5 text-center leading-tight">102<br/><span className="text-gray-400 font-normal">(28,7%)</span></div>
                                    <div className="w-10 bg-orange-500 rounded-t-sm shadow-sm transition-all group-hover:bg-orange-400" style={{ height: '40%' }}></div>
                                    <div className="absolute bottom-[-18px] text-[9px] font-medium text-gray-600 text-center w-28 transform -translate-x-1/2 left-1/2">Open / In Progress</div>
                                </div>
                                
                                {/* Overdue Bar */}
                                <div className="flex flex-col items-center group w-12">
                                    <div className="text-[9px] font-bold text-gray-700 mb-0.5 text-center leading-tight">40<br/><span className="text-gray-400 font-normal">(11,2%)</span></div>
                                    <div className="w-10 bg-red-600 rounded-t-sm shadow-sm transition-all group-hover:bg-red-500" style={{ height: '16%' }}></div>
                                    <div className="absolute bottom-[-18px] text-[9px] font-medium text-gray-600 text-center w-20 transform -translate-x-1/2 left-1/2">Over Due</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Content Layout (Table on left, Widgets on right) */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6">
                
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider">DAFTAR TEMUAN SOS / PAP RESULT</h3>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-5 pb-0">
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="w-full text-[9px] text-left whitespace-nowrap">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Temuan</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Unit / Equipment</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Sumber Temuan</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Kategori Temuan</th>
                                        <th className="px-2 py-3 font-semibold text-left border-r border-[#0d614b]">Deskripsi Temuan</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Prioritas</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Target Close</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Closed</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Est. Biaya (IDR)</th>
                                        <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">PIC</th>
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
                                            <td className="px-2 py-2.5 text-center">{item.tipe_service}</td>
                                            <td className="px-2 py-2.5 text-center">{item.sumber}</td>
                                            <td className="px-2 py-2.5 text-center">{item.kategori}</td>
                                            <td className="px-2 py-2.5 text-left truncate max-w-[150px]" title={item.deskripsi}>{item.deskripsi}</td>
                                            <td className="px-2 py-2.5 text-center">
                                                {item.prioritas === 'High' && <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-200 text-[8px] uppercase tracking-wide">High</span>}
                                                {item.prioritas === 'Medium' && <span className="bg-orange-50 text-orange-500 font-bold px-1.5 py-0.5 rounded border border-orange-200 text-[8px] uppercase tracking-wide">Medium</span>}
                                                {item.prioritas === 'Low' && <span className="bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded border border-green-200 text-[8px] uppercase tracking-wide">Low</span>}
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                {item.status === 'OPEN' && <span className="text-orange-500 font-bold px-1.5 py-0.5 rounded border border-orange-200 text-[8px] uppercase tracking-wide">OPEN</span>}
                                                {item.status === 'IN PROGRESS' && <span className="bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-200 text-[8px] uppercase tracking-wide">IN PROGRESS</span>}
                                                {item.status === 'CLOSED' && <span className="text-green-600 font-bold px-1.5 py-0.5 rounded border border-green-200 text-[8px] uppercase tracking-wide">CLOSED</span>}
                                                {item.status === 'OVER DUE' && <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded border border-red-600 text-[8px] uppercase tracking-wide">OVER DUE</span>}
                                            </td>
                                            <td className="px-2 py-2.5 text-center font-mono">{item.target_close}</td>
                                            <td className="px-2 py-2.5 text-center font-mono">{item.tanggal_closed}</td>
                                            <td className="px-2 py-2.5 text-right font-mono font-bold text-gray-900">{item.est_biaya}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-900 font-medium">{item.pic}</td>
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
                        <div className="pt-3 pb-4 flex justify-between items-center text-sm text-gray-500 mt-2">
                            <div>
                                Menampilkan 1 - 10 dari 356 data
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
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">36</button>
                                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                                </div>
                                <select className="ml-2 border border-gray-200 text-gray-600 text-sm rounded px-2 py-1 focus:outline-none bg-white">
                                    <option>10 / halaman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Widgets (Top 5 Kategori & Estimasi Biaya) */}
                <div className="space-y-6">
                    {/* Ringkasan Kategori Temuan (Top 5) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">RINGKASAN KATEGORI TEMUAN (TOP 5)</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-[9px] text-left">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Kategori Temuan</th>
                                        <th className="px-2 py-2 font-semibold text-center">Total Temuan</th>
                                        <th className="px-2 py-2 font-semibold"></th>
                                        <th className="px-2 py-2 font-semibold text-right">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {kategoriTemuan.map((cat, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-2 font-medium text-gray-800">{cat.name}</td>
                                            <td className="px-2 py-2 text-center text-gray-900 font-bold">{cat.total}</td>
                                            <td className="px-2 py-2 w-20">
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.pct}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-right text-gray-600">{cat.pct.toString().replace('.', ',')}%</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                        <td className="px-2 py-2 uppercase text-gray-900">TOTAL</td>
                                        <td className="px-2 py-2 text-center text-gray-900">322</td>
                                        <td className="px-2 py-2"></td>
                                        <td className="px-2 py-2 text-right text-gray-900">90,5%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Estimasi Biaya Per Status */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">ESTIMASI BIAYA PER STATUS</h3>
                        
                        <div className="flex flex-col items-center">
                            {/* Donut Chart */}
                            <div className="relative w-36 h-36 mb-6">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Overdue (16.6%) - Red */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="16.6 83.4" strokeDashoffset="-83.4"></circle>
                                    
                                    {/* Open (27.7%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="8" strokeDasharray="27.7 72.3" strokeDashoffset="-55.7"></circle>
                                    
                                    {/* Closed (55.8%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="55.8 44.2" strokeDashoffset="0"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[8px] font-bold text-gray-500 mb-0.5">Total</span>
                                    <span className="text-xs font-black text-gray-900 leading-tight">Rp 1.856.250.000</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Closed</span>
                                    </div>
                                    <div className="text-gray-500 pl-4 font-mono">Rp 1.034.800.000 <span className="text-gray-400 font-sans ml-1">(55,8%)</span></div>
                                </div>
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Open / In Progress</span>
                                    </div>
                                    <div className="text-gray-500 pl-4 font-mono">Rp 513.650.000 <span className="text-gray-400 font-sans ml-1">(27,7%)</span></div>
                                </div>
                                <div className="text-[9px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2.5 h-2.5 bg-red-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Over Due</span>
                                    </div>
                                    <div className="text-gray-500 pl-4 font-mono">Rp 307.800.000 <span className="text-gray-400 font-sans ml-1">(16,6%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 mb-10">
                <button className="bg-white hover:bg-gray-50 border border-[#0a4d3c] text-[#0a4d3c] font-bold px-6 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    Export Excel
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                    Print
                </button>
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Generate Report
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
