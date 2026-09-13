import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Jadwal({ auth, kpi, data }) {
    
    // Helper for Status Badge
    const renderStatusBadge = (status) => {
        if (status === 'SELESAI') return <span className="border border-green-500 text-green-600 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wide">SELESAI</span>;
        if (status === 'BERJALAN') return <span className="bg-blue-50 text-blue-500 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wide">BERJALAN</span>;
        if (status === 'AKAN DATANG') return <span className="bg-orange-50 text-orange-500 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wide">AKAN DATANG</span>;
        if (status === 'MENUNGGU') return <span className="border border-gray-300 text-gray-500 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wide">MENUNGGU</span>;
        return status;
    };

    // Helper for Roster Badge
    const renderRosterBadge = (roster) => {
        if (roster.includes('84')) return <span className="bg-purple-100 text-purple-600 font-bold px-2 py-1 rounded text-xs">{roster}</span>;
        if (roster.includes('70')) return <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">{roster}</span>;
        if (roster.includes('56')) return <span className="bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded text-xs">{roster}</span>;
        return <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded text-xs">{roster}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jadwal Cuti Periodic (Berlanjut)" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-[#0b132b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <h1 className="text-2xl font-extrabold text-[#0b132b] tracking-tight">Jadwal Cuti Periodic (Berlanjut)</h1>
                        </div>
                        <p className="text-sm text-gray-500">Daftar jadwal cuti periodic karyawan yang berlanjut dari periode sebelumnya ke periode selanjutnya.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Leave & Transport</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Jadwal Cuti Periodic (Berlanjut)</span>
                    </div>
                </div>
            </div>

            {/* Top Filter Bar */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Roster Kerja</label>
                    <select className="w-36 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>84 : 14 Hari Kerja</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Departemen</label>
                    <select className="w-40 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Semua Departemen</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Jabatan</label>
                    <select className="w-40 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Semua Jabatan</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                    <select className="w-36 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Semua Status</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Tahun</label>
                    <div className="relative">
                        <input type="text" className="w-28 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" defaultValue="2025" />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                    </div>
                </div>
                
                <div className="flex-1 flex justify-end gap-2">
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Tambah Jadwal
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        Import Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards (5 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs font-bold text-blue-500 mb-1">Total Karyawan</div>
                    <div className="text-3xl font-black text-[#0b132b] mb-1">{kpi.total_karyawan}</div>
                    <div className="text-xs text-blue-500 font-medium">Orang</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs font-bold text-green-600 mb-1">Cuti Berjalan (Saat ini)</div>
                    <div className="text-3xl font-black text-[#0b132b] mb-1">{kpi.cuti_berjalan}</div>
                    <div className="text-xs text-green-600 font-medium">Orang</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs font-bold text-orange-500 mb-1">Cuti Akan Datang (30 Hari)</div>
                    <div className="text-3xl font-black text-[#0b132b] mb-1">{kpi.cuti_akan_datang}</div>
                    <div className="text-xs text-orange-500 font-medium">Orang</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-400"></div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs font-bold text-purple-600 mb-1">Cuti Bulan Ini</div>
                    <div className="text-3xl font-black text-[#0b132b] mb-1">{kpi.cuti_bulan_ini}</div>
                    <div className="text-xs text-purple-600 font-medium">Orang</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs font-bold text-gray-700 mb-1">Rata - Rata Sisa POH</div>
                    <div className="text-3xl font-black text-[#0b132b] mb-1">{kpi.rata_sisa_poh}</div>
                    <div className="text-xs text-gray-700 font-medium">Hari</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800"></div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
                
                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
                    <div className="flex">
                        <div className="px-6 py-4 border-b-2 border-[#0b5c3e] text-[#0b5c3e] font-bold text-sm cursor-pointer">
                            Jadwal Cuti (Berlanjut)
                        </div>
                        <div className="px-6 py-4 text-gray-500 font-medium text-sm cursor-pointer hover:text-gray-700">
                            Kalender Cuti (Timeline)
                        </div>
                    </div>
                    
                    <div className="p-3 flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input type="text" placeholder="Cari NRP, Nama, Jabatan..." className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded px-3 py-2 pl-3 focus:outline-none focus:border-[#0a4d3c] h-8" />
                            <svg className="w-4 h-4 text-gray-400 absolute right-2.5 top-2" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        </div>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-8">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                            Filter
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-8">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="bg-blue-50 border border-blue-100 text-blue-600 rounded p-3 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        <span><span className="font-bold">POH (Point of Hire)</span> adalah titik atau kota asal perekrutan karyawan sesuai perjanjian kerja.</span>
                    </div>
                </div>

                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider">DAFTAR JADWAL CUTI PERIODIC (BERLANJUT)</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-2 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">NO</th>
                                <th className="px-2 py-3 font-bold uppercase border-r border-gray-200 text-left" rowSpan="2">NRP</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200 text-left" rowSpan="2">NAMA KARYAWAN</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200 text-left" rowSpan="2">JABATAN</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200 text-left" rowSpan="2">DEPARTEMEN</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">POH (POINT OF<br/>HIRE)</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">DOH (DATE OF HIRE)</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">ROSTER<br/>KERJA</th>
                                <th className="px-3 py-2 font-bold uppercase border-r border-b border-gray-200" colSpan="3">PERIODE CUTI BERIKUTNYA</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">LANJUT DARI PERIODE</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">SISA POH<br/>(Hari)</th>
                                <th className="px-3 py-3 font-bold uppercase border-r border-gray-200" rowSpan="2">STATUS</th>
                                <th className="px-3 py-3 font-bold uppercase" rowSpan="2">AKSI</th>
                            </tr>
                            <tr>
                                <th className="px-2 py-2 font-bold uppercase border-r border-gray-200">MULAI</th>
                                <th className="px-2 py-2 font-bold uppercase border-r border-gray-200">SELESAI</th>
                                <th className="px-2 py-2 font-bold uppercase border-r border-gray-200">DURASI (Hari)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-800">
                            {data.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-2 py-3 border-r border-gray-100">{idx + 1}</td>
                                    <td className="px-2 py-3 font-medium text-left border-r border-gray-100">{item.nrp}</td>
                                    <td className="px-3 py-3 font-bold text-left border-r border-gray-100">{item.nama}</td>
                                    <td className="px-3 py-3 text-left border-r border-gray-100">{item.jabatan}</td>
                                    <td className="px-3 py-3 text-left border-r border-gray-100">{item.departemen}</td>
                                    <td className="px-3 py-3 border-r border-gray-100">{item.poh}</td>
                                    <td className="px-3 py-3 border-r border-gray-100">{item.doh}</td>
                                    <td className="px-3 py-3 border-r border-gray-100">{renderRosterBadge(item.roster)}</td>
                                    <td className="px-2 py-3 border-r border-gray-100">{item.mulai}</td>
                                    <td className="px-2 py-3 border-r border-gray-100">{item.selesai}</td>
                                    <td className="px-2 py-3 border-r border-gray-100 font-bold">{item.durasi}</td>
                                    <td className="px-3 py-3 border-r border-gray-100 text-[9px]">
                                        <div className="font-bold">{item.lanjut_periode}</div>
                                        <div className="text-gray-500">{item.lanjut_tgl}</div>
                                    </td>
                                    <td className="px-3 py-3 border-r border-gray-100 font-bold text-gray-900">{item.sisa_poh}</td>
                                    <td className="px-3 py-3 border-r border-gray-100">{renderStatusBadge(item.status)}</td>
                                    <td className="px-3 py-3">
                                        <button className="text-gray-400 hover:text-blue-600 p-1 rounded transition-all border border-gray-200 hover:bg-blue-50" title="View">
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-5 py-4 flex justify-between items-center text-sm text-gray-500 border-t border-gray-200">
                    <div>
                        Menampilkan 1 - 8 dari 128 data
                    </div>
                    <div className="flex gap-4 items-center">
                        <select className="border border-gray-300 text-gray-700 text-sm rounded px-2 py-1.5 focus:outline-none bg-white">
                            <option>10 / halaman</option>
                        </select>
                        <div className="flex gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-[#0a4d3c] bg-[#0a4d3c] text-white font-bold">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">3</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">4</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">5</button>
                            <span className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">13</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h4 className="text-[9px] font-bold text-[#0b5c3e] mb-3 uppercase tracking-wider">KETERANGAN ROSTER KERJA</h4>
                    <div className="flex gap-6 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[9px]">56 : 14</span>
                            <span>56 Hari Kerja : 14 Hari Cuti</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded text-[9px]">70 : 14</span>
                            <span>70 Hari Kerja : 14 Hari Cuti</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded text-[9px]">84 : 14</span>
                            <span>84 Hari Kerja : 14 Hari Cuti</span>
                        </div>
                    </div>
                </div>
                
                <div className="text-xs text-gray-500">
                    Catatan: Jadwal cuti berikutnya dihitung otomatis berdasarkan roster kerja dan tanggal DOH.
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
