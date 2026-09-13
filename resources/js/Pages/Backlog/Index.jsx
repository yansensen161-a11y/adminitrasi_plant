import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, backlogs, stats, filters }) {
    const [unitFilter, setUnitFilter] = useState(filters?.code_unit || '');
    const [lokasiFilter, setLokasiFilter] = useState('');
    const [tipeServiceFilter, setTipeServiceFilter] = useState('');
    const [tingkatFilter, setTingkatFilter] = useState('');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/backlogs', {
            code_unit: unitFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setUnitFilter('');
        setLokasiFilter('');
        setTipeServiceFilter('');
        setTingkatFilter('');
        router.get('/backlogs', {}, { preserveState: true });
    };

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
                return <span className="font-bold text-blue-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-blue-50 rounded">OPEN</span>;
            case 'PROCUREMENT':
                return <span className="font-bold text-orange-400 text-[9px] uppercase tracking-wide px-2 py-1 bg-orange-50 rounded">PROCUREMENT</span>;
            case 'ORDERED':
                return <span className="font-bold text-purple-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-purple-50 rounded">ORDERED</span>;
            default:
                return <span className="font-bold text-gray-500 text-[9px] uppercase tracking-wide px-2 py-1 bg-gray-50 rounded">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Backlog" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Backlog</h1>
                    <p className="text-sm text-gray-500">Daftar temuan/pekerjaan perbaikan yang perlu order part dan akan dipasang pada next service</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Backlog</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15c-1.1 0-2-.9-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.1-.89 2-2 2zm1-4h-2V7h2v7z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">TOTAL BACKLOG</div>
                        <div className="text-2xl font-black text-gray-900">{stats?.total || 23}</div>
                        <div className="text-xs text-gray-500 font-semibold">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">BACKLOG RINGAN (1-2 SERVICE)</div>
                        <div className="text-2xl font-black text-gray-900">{stats?.ringan || 8}</div>
                        <div className="text-xs text-gray-500 font-semibold">Unit ({stats?.ringan_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14v-2h6v2h-6zm0-4V7h2v6h-2z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">BACKLOG SEDANG (3-4 SERVICE)</div>
                        <div className="text-2xl font-black text-gray-900">{stats?.sedang || 9}</div>
                        <div className="text-xs text-gray-500 font-semibold">Unit ({stats?.sedang_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">BACKLOG BERAT (+4 SERVICE)</div>
                        <div className="text-2xl font-black text-gray-900">{stats?.berat || 6}</div>
                        <div className="text-xs text-gray-500 font-semibold">Unit ({stats?.berat_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-4 p-4 border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua Unit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
                            <select
                                value={lokasiFilter}
                                onChange={(e) => setLokasiFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Tipe Service</label>
                            <select
                                value={tipeServiceFilter}
                                onChange={(e) => setTipeServiceFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Tingkat Backlog</label>
                            <select
                                value={tingkatFilter}
                                onChange={(e) => setTingkatFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                            type="submit"
                            className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 h-9"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-sm transition border border-gray-200 flex items-center justify-center gap-2 h-9"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 text-sm">
                    i
                </div>
                <p className="text-sm text-gray-700 font-medium">
                    <span className="font-bold uppercase mr-1">BACKLOG</span> 
                    adalah temuan/pekerjaan dari mekanik yang memerlukan order part. Pemasangan akan dilakukan pada next service.
                </p>
            </div>

            {/* Table */}
            <h2 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">DAFTAR BACKLOG</h2>
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Code Unit</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b]">Temuan / Deskripsi</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b]">Part yang Diperlukan</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b]">Tindakan Mekanik</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tingkat Backlog</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b]">Target Pasang<br/><span className="text-[9px] font-normal">(Next Service)</span></th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal Temuan</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                <th className="px-3 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {backlogs.data && backlogs.data.length > 0 ? (
                                backlogs.data.map((item, index) => (
                                    <tr key={item.id} onDoubleClick={() => router.visit(`/backlogs/${item.id}/edit`)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-3 py-2 text-center text-gray-500 font-medium">
                                            {backlogs.from + index}
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-gray-900">
                                            {item.code_unit}
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-600">
                                            {item.equipment}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {item.lokasi}
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold">
                                            {item.tipe_service}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700 whitespace-pre-line">
                                            {item.temuan}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700 whitespace-pre-line">
                                            {item.part_diperlukan}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 whitespace-pre-line text-xs">
                                            {item.tindakan_mekanik}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {getTingkatBadge(item.tingkat_backlog)}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700 whitespace-pre-line font-medium text-xs">
                                            {item.target_pasang}
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-600">
                                            {item.tanggal_temuan}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={`/backlogs/${item.id}`} className="text-gray-400 hover:text-blue-600 p-1 border border-transparent hover:border-blue-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </Link>
                                                <Link href={`/backlogs/${item.id}/edit`} className="text-gray-400 hover:text-green-600 p-1 border border-transparent hover:border-green-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                </Link>
                                                <button className="text-gray-400 hover:text-red-600 p-1 border border-transparent hover:border-red-200 rounded transition-all">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data backlog.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {backlogs.links && (
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
                        <div>
                            Menampilkan {backlogs.from || 0} - {backlogs.to || 0} dari {stats?.total || 0} data
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1">
                                {backlogs.links.map((link, idx) => {
                                    if(link.label.includes('Previous')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>;
                                    if(link.label.includes('Next')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>;
                                    if(link.label === '...') return <span key={idx} className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>;
                                    
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!link.url || link.active}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`w-7 h-7 flex items-center justify-center rounded text-sm ${
                                                link.active
                                                    ? 'bg-[#0a4d3c] text-white font-bold'
                                                    : link.url
                                                    ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    : 'text-gray-400 cursor-not-allowed border border-gray-100'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                            <select className="ml-2 border border-gray-200 text-gray-600 text-sm rounded px-2 py-1 focus:outline-none bg-white">
                                <option>10 / halaman</option>
                                <option>25 / halaman</option>
                                <option>50 / halaman</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
