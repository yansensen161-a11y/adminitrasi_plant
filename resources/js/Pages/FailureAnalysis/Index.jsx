import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ fars, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('failure-analysis.index'), { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get(route('failure-analysis.index'), {}, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus FAR ini? Semua foto akan ikut terhapus.')) {
            router.delete(route('failure-analysis.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Failure Analysis (FAR)" />

            <div className="space-y-4">
                <div className="bg-gradient-to-r from-white to-red-50/30 rounded-xl shadow-sm border border-red-100 p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100/50 rounded-xl flex items-center justify-center border border-red-200/50 backdrop-blur-sm">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">Failure Analysis Report (FAR)</h1>
                                <p className="text-[12px] text-gray-500 font-medium">Evaluasi & Laporan Analisa Kerusakan</p>
                            </div>
                        </div>
                        <div>
                            <Link 
                                href={route('failure-analysis.create')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all shadow-red-500/30 hover:shadow-red-500/50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Buat FAR Baru
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-3">
                        <div className="flex flex-col gap-1 w-[200px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cari No FAR / Unit</label>
                            <input type="text" placeholder="Ketik kata kunci..." value={search} onChange={e => setSearch(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 px-2 py-1.5 h-9"/>
                        </div>
                        <div className="flex flex-col gap-1 w-[150px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 px-2 py-1.5 h-9">
                                <option value="">Semua Status</option>
                                <option value="Draft">Draft</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 h-full">
                            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-9 flex items-center gap-1.5 mt-[22px]">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Cari
                            </button>
                            <button type="button" onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-9 flex items-center gap-1.5 mt-[22px]">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-center w-12">No</th>
                                    <th className="px-4 py-3 font-bold">No FAR</th>
                                    <th className="px-4 py-3 font-bold">Unit / Model</th>
                                    <th className="px-4 py-3 font-bold">Tgl Kejadian</th>
                                    <th className="px-4 py-3 font-bold">Pelapor</th>
                                    <th className="px-4 py-3 font-bold text-center">Status</th>
                                    <th className="px-4 py-3 font-bold text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {fars.data.length > 0 ? fars.data.map((item, index) => (
                                    <tr key={item.id} onDoubleClick={() => router.visit(route('failure-analysis.edit', item.id))} className="hover:bg-red-50/30 transition-colors cursor-pointer">
                                        <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-400">
                                            {fars.from + index}
                                        </td>
                                        <td className="px-4 py-2.5 font-bold text-gray-900">{item.no_far}</td>
                                        <td className="px-4 py-2.5 text-blue-700 font-bold">
                                            {item.unit?.code_unit}
                                            <div className="text-xs text-gray-500 font-normal">{item.unit?.type_unit}</div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-700">{item.tgl_kejadian}</td>
                                        <td className="px-4 py-2.5 text-gray-700">{item.pelapor?.name || '-'}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                item.status === 'Final' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Link href={route('failure-analysis.show', item.id)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded transition" title="Lihat">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </Link>
                                                <a href={route('failure-analysis.export-pdf', item.id)} target="_blank" className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded transition" title="Cetak PDF">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                                </a>
                                                <Link href={route('failure-analysis.edit', item.id)} className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded transition" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded transition" title="Hapus">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                <p className="font-bold text-gray-500">Belum ada dokumen FAR</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {fars.links && fars.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="text-sm text-gray-500 font-medium">
                                Menampilkan <span className="font-bold text-gray-900">{fars.from || 0}</span> - <span className="font-bold text-gray-900">{fars.to || 0}</span> dari <span className="font-bold text-gray-900">{fars.total}</span> data
                            </div>
                            <div className="flex gap-1">
                                {fars.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                                            link.active 
                                                ? 'bg-red-600 text-white shadow-sm' 
                                                : link.url 
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' 
                                                    : 'bg-transparent text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
