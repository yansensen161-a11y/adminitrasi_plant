import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, services, stats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Historical Periodical Service" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Historical Periodical Service</h1>
                    <p className="text-sm text-gray-500">Riwayat unit yang telah selesai dilakukan service periodical. Data ini bersifat historis dan tidak dapat diubah.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Historical Periodical Service</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">TOTAL SERVICE (SELESAI)</div>
                        <div className="text-2xl font-black text-gray-900">{stats.total_service}</div>
                        <div className="text-xs text-gray-500 font-semibold">Pelaksanaan</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">COMPLETED</div>
                        <div className="text-2xl font-black text-gray-900">{stats.completed}</div>
                        <div className="text-xs text-gray-500 font-semibold">({stats.completed_pct.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">OVERDUE SELESAI</div>
                        <div className="text-2xl font-black text-gray-900">{stats.overdue_selesai}</div>
                        <div className="text-xs text-gray-500 font-semibold">({stats.overdue_selesai_pct.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">CANCELLED</div>
                        <div className="text-2xl font-black text-gray-900">{stats.cancelled}</div>
                        <div className="text-xs text-gray-500 font-semibold">({stats.cancelled_pct.toString().replace('.', ',')}%)</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-4 p-4 border border-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Unit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Tipe Service Plan</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="">Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Tahun</label>
                            <select className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none">
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Periode Service</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <input type="text" value="01/01/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500">s/d</span>
                                <div className="relative w-full">
                                    <input type="text" value="31/12/2024" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#0a4d3c]" />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
                        <button className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 h-9">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-sm transition border border-gray-200 flex items-center justify-center gap-2 h-9">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                    i
                </div>
                <p className="text-sm text-gray-700 font-medium">
                    Data pada menu ini hanya menampilkan unit yang telah selesai dilakukan service dengan status <strong>COMPLETED</strong>.
                </p>
            </div>

            {/* Table & Actions */}
            <div className="flex justify-between items-end mb-3">
                <h2 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider">DAFTAR HISTORICAL PERIODICAL SERVICE</h2>
                <div className="flex gap-2">
                    <button className="bg-white hover:bg-gray-50 border border-gray-200 text-green-700 font-bold px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 shadow-sm">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 shadow-sm">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                        Print
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Service</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Code Unit</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service Plan</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">HM Target<br/><span className="text-[9px] font-normal">(Service)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">HM Actual</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Selisih HM</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Type<br/>Service Actual</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Backlog<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Finding Open<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">SOS/PAP Open<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Mekanik</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Status<br/>Service</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Keterangan</th>
                                <th className="px-2 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {services.data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-2.5 text-center text-gray-500 font-medium">{item.id}</td>
                                    <td className="px-2 py-2.5 text-center">{item.tanggal_service}</td>
                                    <td className="px-2 py-2.5 text-center font-bold text-gray-900">{item.code_unit}</td>
                                    <td className="px-2 py-2.5 text-center text-gray-600">{item.equipment}</td>
                                    <td className="px-2 py-2.5 text-center">{item.lokasi}</td>
                                    <td className="px-2 py-2.5 text-center font-bold">{item.tipe_service_plan}</td>
                                    <td className="px-2 py-2.5 text-center font-mono text-[#0b5c3e]">{item.hm_target}</td>
                                    <td className="px-2 py-2.5 text-center font-mono font-bold bg-gray-50/50">{item.hm_actual}</td>
                                    <td className={`px-2 py-2.5 text-center font-mono font-bold ${item.selisih_hm.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                        {item.selisih_hm}
                                    </td>
                                    <td className="px-2 py-2.5 text-center">
                                        <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase text-[8px] tracking-wide">{item.type_service_actual}</span>
                                    </td>
                                    <td className={`px-2 py-2.5 text-center font-bold ${item.backlog > 0 ? 'text-red-500' : 'text-green-500'}`}>{item.backlog}</td>
                                    <td className={`px-2 py-2.5 text-center font-bold ${item.finding_open > 0 ? 'text-red-500' : 'text-green-500'}`}>{item.finding_open}</td>
                                    <td className={`px-2 py-2.5 text-center font-bold ${item.sospap_open > 0 ? 'text-red-500' : 'text-green-500'}`}>{item.sospap_open}</td>
                                    <td className="px-2 py-2.5 text-center text-gray-600">{item.mekanik}</td>
                                    <td className="px-2 py-2.5 text-center">
                                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200 uppercase text-[8px] tracking-wide">{item.status_service}</span>
                                    </td>
                                    <td className="px-2 py-2.5 text-center text-gray-500">{item.keterangan}</td>
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
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                    <div>
                        Menampilkan 1 - 10 dari 248 data
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
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">25</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                        </div>
                        <select className="ml-2 border border-gray-200 text-gray-600 text-sm rounded px-2 py-1 focus:outline-none bg-white">
                            <option>10 / halaman</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-gray-50 rounded-xl border border-gray-100 p-6 mb-10">
                <div className="lg:col-span-3">
                    <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">PENJELASAN KOLOM</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="grid grid-cols-[130px_10px_1fr]">
                                <div className="font-bold text-gray-900">Tipe Service Plan</div>
                                <div>:</div>
                                <div className="text-gray-600">Rencana service berdasarkan interval HM (PM 250, PM 500, PM 1000, dst)</div>
                            </div>
                            <div className="grid grid-cols-[130px_10px_1fr]">
                                <div className="font-bold text-gray-900">Type Service Actual</div>
                                <div>:</div>
                                <div className="text-gray-600">Jenis service yang benar-benar dilakukan (PM, Repair, Overhaul, Inspection, dll)</div>
                            </div>
                            <div className="grid grid-cols-[130px_10px_1fr]">
                                <div className="font-bold text-gray-900">Selisih HM</div>
                                <div>:</div>
                                <div className="text-gray-600">HM Actual - HM Target ( + = lewat dari target, - = sebelum target )</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-[140px_10px_1fr]">
                                <div className="font-bold text-red-500">Backlog (Unit)</div>
                                <div>:</div>
                                <div className="text-gray-600">Temuan yang perlu order part dan akan dipasang di next service</div>
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr]">
                                <div className="font-bold text-red-500">Finding Open (Unit)</div>
                                <div>:</div>
                                <div className="text-gray-600">Temuan yang masih open (belum ditutup)</div>
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr]">
                                <div className="font-bold text-orange-400">SOS/PAP Open (Unit)</div>
                                <div>:</div>
                                <div className="text-gray-600">Temuan kategori SOS/PAP yang masih open</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">ALUR DATA</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>Monitoring Periodical Service</div>
                        <div className="pl-4">↓</div>
                        <div>Mekanik melakukan service</div>
                        <div className="pl-4">↓</div>
                        <div>Status COMPLETED</div>
                        <div className="pl-4">↓</div>
                        <div>Data otomatis masuk ke Historical Periodical Service</div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
