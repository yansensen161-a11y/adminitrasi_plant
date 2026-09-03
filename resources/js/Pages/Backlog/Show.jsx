import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, backlog }) {
    const [activeTab, setActiveTab] = useState('detail');

    const getTingkatBadge = (tingkat) => {
        if (!tingkat) return '-';
        switch (tingkat.toUpperCase()) {
            case 'RINGAN':
                return <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold text-[9px] uppercase tracking-wide">RINGAN</span>;
            case 'SEDANG':
                return <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-[9px] uppercase tracking-wide">SEDANG</span>;
            case 'BERAT':
                return <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wide">BERAT</span>;
            default:
                return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold text-[9px] uppercase tracking-wide">{tingkat}</span>;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return '-';
        switch (status.toUpperCase()) {
            case 'OPEN':
                return <span className="font-bold text-blue-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-blue-50 rounded border border-blue-100">OPEN</span>;
            case 'PROCUREMENT':
                return <span className="font-bold text-orange-400 text-[9px] uppercase tracking-wide px-2 py-1 bg-orange-50 rounded border border-orange-100">PROCUREMENT</span>;
            case 'ORDERED':
                return <span className="font-bold text-purple-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-purple-50 rounded border border-purple-100">ORDERED</span>;
            case 'PARTIAL':
                return <span className="font-bold text-blue-400 text-[9px] uppercase tracking-wide px-2 py-1 bg-blue-50 rounded border border-blue-100">PARTIAL</span>;
            case 'READY':
                return <span className="font-bold text-green-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-green-50 rounded border border-green-100">READY</span>;
            default:
                return <span className="font-bold text-gray-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-gray-50 rounded border border-gray-100">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Detail Backlog" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Detail Backlog</h1>
                    <p className="text-sm text-gray-500">Informasi detail temuan/pekerjaan yang perlu order part dan akan dipasang pada next service.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Backlog</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Detail Backlog</span>
                    </div>
                </div>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Informasi Unit */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">INFORMASI UNIT</h3>
                    
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Code Unit</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.code_unit}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Equipment</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.equipment}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Lokasi</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.lokasi}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Tipe Service</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.tipe_service}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Next Service (Target)</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.next_service_target}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">Current HM</div>
                                <div>:</div>
                                <div className="font-bold text-gray-900">{backlog.current_hm}</div>
                            </div>
                            <div className="grid grid-cols-[120px_10px_1fr] text-xs">
                                <div className="text-gray-500">HM Tersisa</div>
                                <div>:</div>
                                <div className="font-bold text-red-600">{backlog.hm_tersisa}</div>
                            </div>
                        </div>
                        <div className="w-1/3 flex items-center justify-center">
                            <img src="https://www.komatsu.jp/en/-/media/komatsu/global/products-and-solutions/construction-and-mining-equipment/bulldozer/d155ax_a0.jpg" alt="Equipment" className="w-full h-auto object-contain rounded drop-shadow-md" />
                        </div>
                    </div>
                </div>

                {/* Informasi Backlog */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-4">INFORMASI BACKLOG</h3>
                    
                    <div className="space-y-3">
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs">
                            <div className="text-gray-500">No. Backlog</div>
                            <div>:</div>
                            <div className="font-bold text-gray-900">{backlog.no_backlog}</div>
                        </div>
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs items-center">
                            <div className="text-gray-500">Tanggal Temuan</div>
                            <div>:</div>
                            <div className="font-bold text-gray-900">{backlog.tanggal_temuan}</div>
                        </div>
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs items-center">
                            <div className="text-gray-500">Tingkat Backlog</div>
                            <div>:</div>
                            <div>{getTingkatBadge(backlog.tingkat_backlog)}</div>
                        </div>
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs items-center">
                            <div className="text-gray-500">Dibuat Oleh</div>
                            <div>:</div>
                            <div className="font-bold text-gray-900">{backlog.dibuat_oleh}</div>
                        </div>
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs items-center">
                            <div className="text-gray-500">Status</div>
                            <div>:</div>
                            <div>{getStatusBadge(backlog.status)}</div>
                        </div>
                        <div className="grid grid-cols-[110px_10px_1fr] text-xs mt-2">
                            <div className="text-gray-500">Target Pasang<br/>(Next Service)</div>
                            <div>:</div>
                            <div className="font-bold text-gray-900 pt-1">{backlog.target_pasang}</div>
                        </div>
                    </div>
                </div>

                {/* Alur Proses Backlog */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-extrabold text-[#0b5c3e] uppercase tracking-wider">ALUR PROSES BACKLOG</h3>
                        <Link href="/backlogs" className="text-[10px] font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 flex items-center gap-1 transition-colors">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                            Kembali
                        </Link>
                    </div>
                    
                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-4">
                        {backlog.timeline.map((item, idx) => (
                            <div key={idx} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                                    item.status === 'done' ? 'border-green-500' :
                                    item.status === 'current' ? 'border-blue-500 ring-2 ring-blue-100' :
                                    'border-gray-300'
                                }`}>
                                    {item.status === 'done' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                                    {item.status === 'current' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="text-xs font-mono text-gray-500 w-28 shrink-0 leading-tight">
                                        {item.waktu.split(' ')[0]}<br/>
                                        {item.waktu.split(' ')[1] || ''}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${item.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>{item.judul}</div>
                                        {item.oleh !== '-' && <div className="text-[10px] text-gray-500 mt-0.5">{item.oleh}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 flex gap-6">
                <button 
                    onClick={() => setActiveTab('detail')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'detail' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Detail Temuan
                </button>
                <button 
                    onClick={() => setActiveTab('parts')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'parts' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Part yang Diperlukan
                </button>
                <button 
                    onClick={() => setActiveTab('riwayat')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Riwayat & Catatan
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                
                {/* Detail Temuan */}
                <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">DETAIL TEMUAN / PEKERJAAN</h3>
                <div className="overflow-x-auto mb-8 border border-gray-100 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-semibold border-r border-gray-100">Temuan / Deskripsi</th>
                                <th className="px-4 py-3 font-semibold border-r border-gray-100">Area / Lokasi</th>
                                <th className="px-4 py-3 font-semibold border-r border-gray-100">Dampak / Risiko</th>
                                <th className="px-4 py-3 font-semibold border-r border-gray-100">Prioritas</th>
                                <th className="px-4 py-3 font-semibold border-r border-gray-100">Rekomendasi Tindakan</th>
                                <th className="px-4 py-3 font-semibold">Catatan Mekanik</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            <tr>
                                <td className="px-4 py-4 whitespace-pre-line border-r border-gray-100 align-top leading-relaxed">{backlog.temuan.deskripsi}</td>
                                <td className="px-4 py-4 whitespace-pre-line border-r border-gray-100 align-top">{backlog.temuan.area}</td>
                                <td className="px-4 py-4 whitespace-pre-line border-r border-gray-100 align-top leading-relaxed">{backlog.temuan.dampak}</td>
                                <td className="px-4 py-4 border-r border-gray-100 align-top">
                                    <span className="bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded text-[9px] uppercase">{backlog.temuan.prioritas}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-pre-line border-r border-gray-100 align-top">{backlog.temuan.rekomendasi}</td>
                                <td className="px-4 py-4 whitespace-pre-line align-top leading-relaxed">{backlog.temuan.catatan_mekanik}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Part Yang Diperlukan */}
                <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">PART YANG DIPERLUKAN</h3>
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-[11px] text-left border border-gray-100 rounded-lg">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Kode Part</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Nama Part</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Spesifikasi</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Qty</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Satuan</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Stok Tersedia</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Status Order</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Estimasi Tiba</th>
                                <th className="px-3 py-3 font-semibold text-center">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {backlog.parts.map((part, idx) => (
                                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
                                    <td className="px-3 py-2.5 text-center font-mono">{part.kode}</td>
                                    <td className="px-3 py-2.5 text-center">{part.nama}</td>
                                    <td className="px-3 py-2.5 text-center text-gray-500">{part.spesifikasi}</td>
                                    <td className="px-3 py-2.5 text-center font-bold text-gray-900">{part.qty}</td>
                                    <td className="px-3 py-2.5 text-center text-gray-500">{part.satuan}</td>
                                    <td className="px-3 py-2.5 text-center font-bold">{part.stok}</td>
                                    <td className="px-3 py-2.5 text-center">{getStatusBadge(part.status_order)}</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-gray-500">{part.estimasi}</td>
                                    <td className="px-3 py-2.5 text-center text-gray-500">{part.keterangan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Dokumentasi & Catatan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">DOKUMENTASI TEMUAN</h3>
                        <div className="flex flex-wrap gap-4">
                            {backlog.images.map((img) => (
                                <div key={img.id} className="w-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                    <div className="h-24 w-full bg-gray-200 overflow-hidden">
                                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-2 text-center text-[10px] text-gray-600 font-medium">
                                        {img.caption}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">CATATAN</h3>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 min-h-[135px]">
                            <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                                {backlog.catatan}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="flex justify-end items-center gap-3 mb-10">
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm border border-[#0b5c3e]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    Edit Backlog
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                    Tutup Backlog
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm border border-red-600">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    Hapus Backlog
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
