import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data, bulanIni, topTelat, activities }) {
    
    // Helper for Status Badges
    const renderStatusBadge = (status) => {
        if (status === 'HADIR') return <span className="bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded border border-green-200 text-[9px] uppercase tracking-wide">HADIR</span>;
        if (status === 'TELAT') return <span className="bg-orange-50 text-orange-500 font-bold px-2.5 py-1 rounded border border-orange-200 text-[9px] uppercase tracking-wide">TELAT</span>;
        if (status === 'TIDAK HADIR') return <span className="bg-red-50 text-red-500 font-bold px-2.5 py-1 rounded border border-red-200 text-[9px] uppercase tracking-wide">TIDAK HADIR</span>;
        if (status === 'IZIN') return <span className="bg-blue-50 text-blue-500 font-bold px-2.5 py-1 rounded border border-blue-200 text-[9px] uppercase tracking-wide">IZIN</span>;
        return status;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Absensi Harian Karyawan" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Absensi Harian Karyawan</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Kelola dan pantau absensi harian karyawan plant.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Absensi</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Absensi Harian Karyawan</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TOTAL KARYAWAN</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.total_karyawan}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Orang</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">HADIR</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.hadir}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">{stats.hadir_pct}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TELAT</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.telat}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">{stats.telat_pct}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">TIDAK HADIR</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.tidak_hadir}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">{stats.tidak_hadir_pct}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-[#0a4d3c] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">IZIN / SAKIT</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{stats.izin_sakit}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">{stats.izin_sakit_pct}</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tanggal</label>
                            <div className="relative">
                                <input type="text" value="30/08/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Departement</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Departement</option>
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
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Posisi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Status</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Status</option>
                            </select>
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
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6">
                
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider">DATA ABSENSI - 30 AGUSTUS 2024</h3>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 p-5 pb-0">
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="w-full text-[9px] text-left whitespace-nowrap">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">NRP</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Nama</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Departement</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Job Position</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Jam Masuk</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Jam Pulang</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Keterangan</th>
                                        <th className="px-3 py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {data.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
                                            <td className="px-3 py-2.5 text-center font-mono font-medium">{item.nrp}</td>
                                            <td className="px-3 py-2.5 text-left font-bold text-gray-900">{item.nama}</td>
                                            <td className="px-3 py-2.5 text-center">{item.departement}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-900">{item.posisi}</td>
                                            <td className="px-3 py-2.5 text-center font-mono font-bold bg-gray-50/50">{item.jam_masuk}</td>
                                            <td className="px-3 py-2.5 text-center font-mono font-bold bg-gray-50/50">{item.jam_pulang}</td>
                                            <td className="px-3 py-2.5 text-center">
                                                {renderStatusBadge(item.status)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">{item.keterangan}</td>
                                            <td className="px-3 py-2.5 text-center">
                                                <button className="text-gray-400 hover:text-[#0a4d3c] p-1 rounded transition-all" title="View">
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
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

                {/* Right Side Widgets */}
                <div className="space-y-6">
                    {/* Ringkasan Absensi Hari Ini */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6">RINGKASAN ABSENSI HARI INI</h3>
                        
                        <div className="flex flex-col items-center">
                            {/* Donut Chart */}
                            <div className="relative w-32 h-32 mb-6">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Izin/Sakit (1.28%) - Blue */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="1.28 98.72" strokeDashoffset="0"></circle>
                                    
                                    {/* Tidak Hadir (8.97%) - Red */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="8.97 91.03" strokeDashoffset="-1.28"></circle>
                                    
                                    {/* Telat (7.69%) - Orange */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="7.69 92.31" strokeDashoffset="-10.25"></circle>
                                    
                                    {/* Hadir (82.05%) - Green */}
                                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="8" strokeDasharray="82.05 17.95" strokeDashoffset="-17.94"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Total</span>
                                    <span className="text-xl font-black text-gray-900 leading-none">156</span>
                                    <span className="text-[9px] text-gray-400 mt-1">Orang</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Hadir</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">128 <span className="text-gray-400 font-normal ml-0.5">(82,05%)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Telat</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">12 <span className="text-gray-400 font-normal ml-0.5">(7,69%)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Tidak Hadir</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">14 <span className="text-gray-400 font-normal ml-0.5">(8,97%)</span></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                                        <span className="font-bold text-gray-700">Izin / Sakit</span>
                                    </div>
                                    <div className="text-gray-900 font-medium">2 <span className="text-gray-400 font-normal ml-0.5">(1,28%)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Absensi 7 Hari Terakhir */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">ABSENSI 7 HARI TERAKHIR</h3>
                        
                        <div className="relative h-32 px-2 mt-2 mb-2">
                            {/* Y-axis */}
                            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[8px] text-gray-400 text-right w-5 pb-5">
                                <span>160</span>
                                <span>120</span>
                                <span>80</span>
                                <span>40</span>
                                <span>0</span>
                            </div>
                            
                            <div className="absolute inset-0 ml-5 pb-5">
                                {/* Grid lines */}
                                <div className="h-full w-full flex flex-col justify-between">
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-100 w-full h-0"></div>
                                    <div className="border-t border-gray-200 w-full h-0"></div>
                                </div>
                                
                                {/* Lines */}
                                <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                                    {/* Hadir (Green) ~120-130 range */}
                                    <path d="M 5 25 L 45 20 L 85 22 L 125 24 L 165 20 L 205 15 L 245 22" fill="none" stroke="#16a34a" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                                    <circle cx="5" cy="25" r="2.5" fill="#16a34a"/>
                                    <circle cx="45" cy="20" r="2.5" fill="#16a34a"/>
                                    <circle cx="85" cy="22" r="2.5" fill="#16a34a"/>
                                    <circle cx="125" cy="24" r="2.5" fill="#16a34a"/>
                                    <circle cx="165" cy="20" r="2.5" fill="#16a34a"/>
                                    <circle cx="205" cy="15" r="2.5" fill="#16a34a"/>
                                    <circle cx="245" cy="22" r="2.5" fill="#16a34a"/>

                                    {/* Others (Close to 0) */}
                                    <path d="M 5 95 L 45 95 L 85 95 L 125 95 L 165 95 L 205 95 L 245 95" fill="none" stroke="#f97316" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                                    <circle cx="5" cy="95" r="2" fill="#f97316"/>
                                    <circle cx="45" cy="95" r="2" fill="#f97316"/>
                                    
                                    <path d="M 5 97 L 45 97 L 85 97 L 125 97 L 165 97 L 205 97 L 245 97" fill="none" stroke="#ef4444" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                                    <circle cx="85" cy="97" r="2" fill="#ef4444"/>
                                    <circle cx="125" cy="97" r="2" fill="#ef4444"/>
                                    
                                    <path d="M 5 99 L 45 99 L 85 99 L 125 99 L 165 99 L 205 99 L 245 99" fill="none" stroke="#3b82f6" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                                </svg>
                            </div>
                            
                            {/* X-axis labels */}
                            <div className="absolute bottom-0 left-5 right-0 flex justify-between text-[7px] text-gray-500">
                                <span>24/08</span>
                                <span>25/08</span>
                                <span>26/08</span>
                                <span>27/08</span>
                                <span>28/08</span>
                                <span>29/08</span>
                                <span>30/08</span>
                            </div>
                        </div>

                        {/* Legend Multi-line */}
                        <div className="flex justify-center gap-3 text-[7px] mt-2 font-bold text-gray-600">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-0.5 bg-green-600 relative"><div className="w-1 h-1 rounded-full bg-green-600 absolute -top-0.5 left-0.5"></div></div>
                                <span>Hadir</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-0.5 bg-orange-500 relative"><div className="w-1 h-1 rounded-full bg-orange-500 absolute -top-0.5 left-0.5"></div></div>
                                <span>Telat</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-0.5 bg-red-600 relative"><div className="w-1 h-1 rounded-full bg-red-600 absolute -top-0.5 left-0.5"></div></div>
                                <span>Tidak Hadir</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-0.5 bg-blue-500 relative"><div className="w-1 h-1 rounded-full bg-blue-500 absolute -top-0.5 left-0.5"></div></div>
                                <span>Izin / Sakit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets Row (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Persentase Kehadiran Bulan Ini */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6">PERSENTASE KEHADIRAN BULAN INI</h3>
                    
                    <div className="flex items-center justify-between flex-1 gap-2">
                        {/* Big Donut Chart */}
                        <div className="relative w-36 h-36 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="5"></circle>
                                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="5" strokeDasharray="82.05 17.95" strokeDashoffset="0" strokeLinecap="round"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-black text-gray-900 leading-none">82,05%</span>
                                <span className="text-[9px] font-bold text-gray-500 mt-1">Tingkat Kehadiran</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 w-full text-[9px]">
                            <div className="font-bold text-gray-900 mb-1">Keterangan:</div>
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Hadir</span>
                                </div>
                                <div className="text-gray-900 font-bold">: {bulanIni.hadir} Hari <span className="text-gray-400 font-normal">({bulanIni.hadir_pct})</span></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Telat</span>
                                </div>
                                <div className="text-gray-900 font-bold">: {bulanIni.telat} Hari <span className="text-gray-400 font-normal">({bulanIni.telat_pct})</span></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Tidak Hadir</span>
                                </div>
                                <div className="text-gray-900 font-bold">: {bulanIni.tidak_hadir} Hari <span className="text-gray-400 font-normal">({bulanIni.tidak_hadir_pct})</span></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                                    <span className="font-bold text-gray-700">Izin / Sakit</span>
                                </div>
                                <div className="text-gray-900 font-bold">: {bulanIni.izin_sakit} Hari <span className="text-gray-400 font-normal">({bulanIni.izin_sakit_pct})</span></div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total Hari Kerja</span>
                                <span className="font-bold text-gray-900">: {bulanIni.total_hari} Hari</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Top 5 Karyawan Telat */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">5 KARYAWAN TELAT TERBANYAK (BULAN INI)</h3>
                    
                    <div className="overflow-x-auto flex-1 flex flex-col">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-[#0a4d3c] text-white">
                                <tr>
                                    <th className="px-2 py-2 font-semibold text-center rounded-tl">No</th>
                                    <th className="px-2 py-2 font-semibold">NRP</th>
                                    <th className="px-2 py-2 font-semibold">Nama</th>
                                    <th className="px-2 py-2 font-semibold text-right rounded-tr">Total Telat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topTelat.map((karyawan, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-2 py-2.5 text-center text-gray-500">{idx + 1}</td>
                                        <td className="px-2 py-2.5 font-mono font-medium text-gray-700">{karyawan.nrp}</td>
                                        <td className="px-2 py-2.5 font-bold text-gray-900">{karyawan.nama}</td>
                                        <td className="px-2 py-2.5 text-right font-bold text-orange-600">{karyawan.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Aktivitas Terakhir */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">AKTIVITAS TERAKHIR</h3>
                    
                    <div className="space-y-4 flex-1">
                        {activities.map((act, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-600">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start gap-2 mb-0.5">
                                        <div className="text-[10px] font-bold text-gray-800 leading-tight">{act.title}</div>
                                        <div className="text-[8px] text-gray-400 whitespace-nowrap shrink-0">{act.time}</div>
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
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Import Excel
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
