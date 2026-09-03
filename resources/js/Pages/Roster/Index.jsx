import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data, distribution, activities }) {
    
    // Helper to render shift badges
    const renderShiftBadge = (shift, idx) => {
        if (shift === 'S') return <div key={idx} className="w-5 h-5 mx-auto bg-green-100 text-green-700 font-bold text-[9px] flex items-center justify-center rounded border border-green-200">S</div>;
        if (shift === 'M') return <div key={idx} className="w-5 h-5 mx-auto bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center rounded border border-blue-200">M</div>;
        if (shift === 'O') return <div key={idx} className="w-5 h-5 mx-auto bg-orange-100 text-orange-600 font-bold text-[9px] flex items-center justify-center rounded border border-orange-200">O</div>;
        return <div key={idx} className="w-5 h-5 mx-auto"></div>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roster Manpower" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Roster Manpower</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Perencanaan dan penjadwalan roster kerja mekanik dan manpower plant.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Planner</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Roster</span>
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
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL MEKANIK</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_mekanik}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Orang</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">SHIFT SIANG</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.shift_siang}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.shift_siang_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">SHIFT MALAM</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.shift_malam}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.shift_malam_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">DAY OFF</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.day_off}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">({stats.day_off_pct})</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL HARI</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_hari}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Hari ({stats.bulan_tahun})</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Bulan</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Agustus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tahun</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">2024</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Department</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Department</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Lokasi</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Job Position</label>
                            <div className="relative">
                                <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                    <option value="">Semua Posisi</option>
                                </select>
                                <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
                        <button className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                            Tampilkan
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-xs transition border border-gray-200 flex items-center justify-center gap-2 h-9 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 mb-6">
                
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider">ROSTER AGUSTUS 2024</h3>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 text-white flex items-center justify-center rounded font-bold text-[8px]">S</div>
                                <span className="text-[9px] font-bold text-gray-700">Shift Siang (06:00 - 18:00)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 text-white flex items-center justify-center rounded font-bold text-[8px]">M</div>
                                <span className="text-[9px] font-bold text-gray-700">Shift Malam (18:00 - 06:00)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-400 text-white flex items-center justify-center rounded font-bold text-[8px]">O</div>
                                <span className="text-[9px] font-bold text-gray-700">Day Off</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-0 overflow-x-auto">
                        <table className="w-full text-[9px] text-left whitespace-nowrap min-w-max">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 font-semibold text-center border-r border-gray-200 text-gray-700 w-10">No</th>
                                    <th className="px-3 py-3 font-semibold text-center border-r border-gray-200 text-gray-700 w-20">NRP</th>
                                    <th className="px-3 py-3 font-semibold text-left border-r border-gray-200 text-gray-700 w-32">Nama</th>
                                    <th className="px-3 py-3 font-semibold text-left border-r border-gray-200 text-gray-700 w-24">Job Position</th>
                                    
                                    {/* Dates Headers */}
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">1</span><span className="text-[8px] text-gray-400">Kam</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">2</span><span className="text-[8px] text-gray-400">Jum</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold text-red-500">3</span><span className="text-[8px] text-red-400">Sab</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold text-red-500">4</span><span className="text-[8px] text-red-400">Min</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">5</span><span className="text-[8px] text-gray-400">Sen</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">6</span><span className="text-[8px] text-gray-400">Sel</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">7</span><span className="text-[8px] text-gray-400">Rab</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">8</span><span className="text-[8px] text-gray-400">Kam</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">9</span><span className="text-[8px] text-gray-400">Jum</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold text-red-500">10</span><span className="text-[8px] text-red-400">Sab</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold text-red-500">11</span><span className="text-[8px] text-red-400">Min</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">12</span><span className="text-[8px] text-gray-400">Sen</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">13</span><span className="text-[8px] text-gray-400">Sel</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">14</span><span className="text-[8px] text-gray-400">Rab</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">15</span><span className="text-[8px] text-gray-400">Kam</span></div>
                                    </th>
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">16</span><span className="text-[8px] text-gray-400">Jum</span></div>
                                    </th>
                                    
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">--</th>
                                    
                                    <th className="px-1 py-1 font-semibold text-center border-r border-gray-200 text-gray-700 w-8">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold text-red-500">31</span><span className="text-[8px] text-red-400">Sab</span></div>
                                    </th>

                                    <th className="px-3 py-3 font-semibold text-center text-gray-700 w-16">
                                        <div className="flex flex-col"><span className="text-gray-900 font-bold">Total</span><span className="text-[8px] text-gray-500">Shift</span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {data.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-2 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                                        <td className="px-3 py-2 text-center font-mono font-medium border-r border-gray-100">{item.nrp}</td>
                                        <td className="px-3 py-2 text-left font-bold text-gray-900 border-r border-gray-100">{item.nama}</td>
                                        <td className="px-3 py-2 text-left border-r border-gray-100">{item.posisi}</td>
                                        
                                        {item.shifts.map((shift, i) => (
                                            <td key={i} className="px-1 py-2 text-center border-r border-gray-100 p-0">
                                                {renderShiftBadge(shift, i)}
                                            </td>
                                        ))}
                                        
                                        <td className="px-1 py-2 text-center border-r border-gray-100">...</td>
                                        
                                        <td className="px-1 py-2 text-center border-r border-gray-100 p-0">
                                            {renderShiftBadge(item.shifts[item.shifts.length-1] === 'S' ? 'O' : (item.shifts[item.shifts.length-1] === 'M' ? 'M' : 'S'), 99)}
                                        </td>
                                        
                                        <td className="px-3 py-2 text-center font-bold text-gray-900 bg-gray-50/50">
                                            {item.total_shift}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side Widgets (Ringkasan Roster) */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6">RINGKASAN ROSTER</h3>
                        
                        <div className="flex flex-col items-center flex-1 justify-center gap-8">
                            {/* Donut Chart */}
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Day Off (3.8%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="8" strokeDasharray="3.8 96.2" strokeDashoffset="0"></circle>
                                    
                                    {/* Shift Malam (46.2%) - Blue */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="46.2 53.8" strokeDashoffset="-3.8"></circle>
                                    
                                    {/* Shift Siang (50.0%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="50.0 50.0" strokeDashoffset="-50.0"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Total</span>
                                    <span className="text-2xl font-black text-gray-900 leading-none">156</span>
                                    <span className="text-[9px] text-gray-400 mt-1">Orang</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-4 text-[10px]">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Shift Siang</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">78 Orang <span className="text-gray-400 font-normal ml-0.5">(50,0%)</span></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Shift Malam</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">72 Orang <span className="text-gray-400 font-normal ml-0.5">(46,2%)</span></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Day Off</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">6 Orang <span className="text-gray-400 font-normal ml-0.5">(3,8%)</span></div>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Hari dalam Bulan</span>
                                    <span className="font-bold text-gray-900">31 Hari</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets Row (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Distribusi Job Position */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6">DISTRIBUSI JOB POSITION</h3>
                    
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            {distribution.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[9px] group gap-3">
                                    <div className="w-16 text-gray-700 font-bold">{item.name}</div>
                                    <div className="flex-1">
                                        <div className={`h-2 ${item.color} rounded-r-full transition-all duration-300`} style={{ width: `${(item.count/50)*100}%` }}></div>
                                    </div>
                                    <div className="w-6 text-right font-bold text-gray-900">{item.count}</div>
                                </div>
                            ))}
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="relative mt-4">
                            <div className="absolute top-0 left-20 right-8 border-t border-gray-200"></div>
                            <div className="flex justify-between text-[8px] text-gray-400 pt-1.5 ml-20 mr-8">
                                <span>0</span>
                                <span>10</span>
                                <span>20</span>
                                <span>30</span>
                                <span>40</span>
                                <span>50</span>
                            </div>
                            <div className="text-center text-[9px] text-gray-500 mt-2 font-medium">Jumlah Orang</div>
                        </div>
                    </div>
                </div>

                {/* 2. Pola Roster */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">POLA ROSTER</h3>
                    
                    <div className="space-y-3 flex-1">
                        <div className="border border-gray-100 rounded-lg p-3 flex gap-4 hover:border-green-200 transition-colors">
                            <div className="w-10 h-10 shrink-0 bg-green-50 text-green-600 font-black text-2xl flex items-center justify-center rounded">S</div>
                            <div className="flex-1">
                                <h4 className="text-[11px] font-bold text-gray-900 mb-1">6 Hari Kerja - Siang</h4>
                                <p className="text-[9px] text-gray-500 mb-2 leading-relaxed">Shift Siang (06:00 - 18:00) selama 6 hari kerja, 1 hari Day Off</p>
                                <div className="flex gap-1 mt-1">
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-green-100 text-green-700 font-bold text-[8px] flex items-center justify-center rounded">S</div>
                                    <div className="w-4 h-4 bg-orange-100 text-orange-600 font-bold text-[8px] flex items-center justify-center rounded">O</div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-lg p-3 flex gap-4 hover:border-blue-200 transition-colors">
                            <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 font-black text-2xl flex items-center justify-center rounded">M</div>
                            <div className="flex-1">
                                <h4 className="text-[11px] font-bold text-gray-900 mb-1">6 Hari Kerja - Malam</h4>
                                <p className="text-[9px] text-gray-500 mb-2 leading-relaxed">Shift Malam (18:00 - 06:00) selama 6 hari kerja, 1 hari Day Off</p>
                                <div className="flex gap-1 mt-1">
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center rounded">M</div>
                                    <div className="w-4 h-4 bg-orange-100 text-orange-600 font-bold text-[8px] flex items-center justify-center rounded">O</div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-lg p-3 flex gap-4 hover:border-orange-200 transition-colors">
                            <div className="w-10 h-10 shrink-0 bg-orange-50 text-orange-500 font-black text-2xl flex items-center justify-center rounded">O</div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <h4 className="text-[11px] font-bold text-gray-900 mb-0.5">Day Off</h4>
                                    <p className="text-[9px] text-gray-500">1 hari istirahat setelah 6 hari kerja</p>
                                </div>
                                <div className="w-4 h-4 bg-orange-100 text-orange-600 font-bold text-[8px] flex items-center justify-center rounded">O</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Aktivitas Terakhir */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">AKTIVITAS TERAKHIR</h3>
                    
                    <div className="space-y-4 flex-1">
                        {activities.map((act, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                                    {act.icon === 'calendar' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>}
                                    {act.icon === 'edit' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>}
                                    {act.icon === 'user-plus' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
                                    {act.icon === 'download' && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>}
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start gap-2 mb-0.5">
                                        <div className="text-[10px] font-bold text-gray-800 leading-tight">{act.title}</div>
                                        <div className="text-[8px] text-gray-400 whitespace-nowrap shrink-0">{act.date}</div>
                                    </div>
                                    <div className="text-[9px] text-gray-500">oleh {act.user}</div>
                                </div>
                            </div>
                        ))}
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
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Buat Roster Baru
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
