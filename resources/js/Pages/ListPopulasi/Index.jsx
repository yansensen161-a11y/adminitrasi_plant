import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ data, stats, locationsList, filters }) {
    const [locationFilter, setLocationFilter] = useState(filters.location || '');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('list-populasi.index'), {
            location: locationFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setLocationFilter('');
        router.get(route('list-populasi.index'), {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="List Populasi Unit" />

            <div className="mb-4">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">List Populasi Unit</h1>
                <p className="text-sm text-gray-500">Daftar populasi unit berdasarkan lokasi dan departemen</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-gray-400 uppercase mb-1">AKTIF</div>
                        <div className="text-3xl font-black text-gray-900">{stats.aktif}</div>
                        <div className="text-sm text-gray-500 font-medium">Unit</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-gray-400 uppercase mb-1">STANDBY</div>
                        <div className="text-3xl font-black text-gray-900">{stats.standby}</div>
                        <div className="text-sm text-gray-500 font-medium">Unit</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-gray-400 uppercase mb-1">MAINTENANCE</div>
                        <div className="text-3xl font-black text-gray-900">{stats.maintenance}</div>
                        <div className="text-sm text-gray-500 font-medium">Unit</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-gray-400 uppercase mb-1">BREAKDOWN</div>
                        <div className="text-3xl font-black text-gray-900">{stats.breakdown}</div>
                        <div className="text-sm text-gray-500 font-medium">Unit</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#0a4d3c]"
                        >
                            <option value="">Semua Lokasi</option>
                            {locationsList.map((loc, idx) => (
                                <option key={idx} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-bold text-gray-800 mb-1">Department</label>
                        <select
                            disabled
                            className="w-full bg-gray-50 border border-gray-200 text-gray-400 text-sm rounded-lg px-3 py-2 cursor-not-allowed"
                        >
                            <option value="">Semua Department</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            type="submit"
                            className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-5 py-2 rounded-lg text-sm transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-5 py-2 rounded-lg text-sm transition border border-gray-200"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Main Table */}
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-4 py-3 font-semibold border-r border-[#0d614b]">Lokasi</th>
                                <th className="px-4 py-3 font-semibold border-r border-[#0d614b]">Department</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Total Unit</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Aktif</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Standby</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Maintenance</th>
                                <th className="px-4 py-3 font-semibold text-center">Breakdown</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors font-medium">
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 font-bold">
                                            {item.lokasi}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {item.department}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-gray-900 bg-gray-50">
                                            {item.total}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-green-600 bg-green-50/50">
                                            {item.aktif}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-blue-600 bg-blue-50/50">
                                            {item.standby}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-yellow-600 bg-yellow-50/50">
                                            {item.maintenance}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-red-600 bg-red-50/50">
                                            {item.breakdown}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data populasi unit.
                                    </td>
                                </tr>
                            )}
                            
                            {/* Totals Row */}
                            {data.length > 0 && (
                                <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-200">
                                    <td colSpan="3" className="px-4 py-3 text-right">TOTAL KESELURUHAN</td>
                                    <td className="px-4 py-3 text-center">{stats.total}</td>
                                    <td className="px-4 py-3 text-center text-green-700">{stats.aktif}</td>
                                    <td className="px-4 py-3 text-center text-blue-700">{stats.standby}</td>
                                    <td className="px-4 py-3 text-center text-yellow-700">{stats.maintenance}</td>
                                    <td className="px-4 py-3 text-center text-red-700">{stats.breakdown}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
