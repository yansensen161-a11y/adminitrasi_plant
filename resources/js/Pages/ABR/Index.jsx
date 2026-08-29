import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, abrs }) {

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ABR ini?')) {
            router.delete(route('abr.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">List ABR</h2>
                <div className="text-sm text-gray-500">ABR / List ABR</div>
            </div>}
        >
            <Head title="List ABR" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4">
                        <Link href={route('abr.create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 w-fit">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
                            Tambah ABR
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        
                        {/* Filter Section Placeholder */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dari Tanggal</label>
                                <input type="date" className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
                                <input type="date" className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Code Unit</label>
                                <select className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm w-40">
                                    <option>Semua</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-emerald-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
                                    Filter
                                </button>
                                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold shadow hover:bg-gray-300">
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300 border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">No.</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">No. ABR</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">Tanggal</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">Code Unit</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">HM</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">Grand Total (Rp)</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">Status</th>
                                        <th className="px-4 py-3 border dark:border-gray-600 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abrs.data.map((abr, index) => (
                                        <tr key={abr.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 border dark:border-gray-700 text-center">{index + 1 + (abrs.current_page - 1) * abrs.per_page}</td>
                                            <td className="px-4 py-3 border dark:border-gray-700 font-medium text-center">{abr.no_abr}</td>
                                            <td className="px-4 py-3 border dark:border-gray-700 text-center">{abr.tanggal ? new Date(abr.tanggal).toLocaleDateString('en-GB') : '-'}</td>
                                            <td className="px-4 py-3 border dark:border-gray-700 text-center font-bold">{abr.unit?.code_unit}</td>
                                            <td className="px-4 py-3 border dark:border-gray-700 text-center">{abr.hm}</td>
                                            <td className="px-4 py-3 border dark:border-gray-700 text-right font-medium">
                                                {new Intl.NumberFormat('id-ID').format(abr.grand_total)}
                                            </td>
                                            <td className="px-4 py-3 border dark:border-gray-700 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded ${abr.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
                                                    {abr.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border dark:border-gray-700">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link href={route('abr.show', abr.id)} className="bg-yellow-400 hover:bg-yellow-500 text-white p-1.5 rounded shadow">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                                    </Link>
                                                    <Link href={route('abr.edit', abr.id)} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded shadow">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                                                    </Link>
                                                    <a href={route('abr.show', abr.id)} target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded shadow">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                                                    </a>
                                                    <button onClick={() => handleDelete(abr.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {abrs.data.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                Belum ada data ABR.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
