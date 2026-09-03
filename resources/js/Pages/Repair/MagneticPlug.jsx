import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function MagneticPlug({ auth, data, filters = {} }) {
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [metodeFilter, setMetodeFilter] = useState(filters.metodeFilter || '');
    const [componentFilter, setComponentFilter] = useState(filters.componentFilter || '');
    const [ratingFilter, setRatingFilter] = useState(filters.ratingFilter || '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleFilterSubmit = () => {
        router.get(route('repair.magnetic-plug'), {
            codeUnitFilter,
            metodeFilter,
            componentFilter,
            ratingFilter,
            dateFrom,
            dateTo
        }, { preserveState: true });
    };

    const handleReset = () => {
        setCodeUnitFilter('');
        setMetodeFilter('');
        setComponentFilter('');
        setRatingFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('repair.magnetic-plug'), {}, { preserveState: true });
    };
    
    // Status Badge Helpers
    const renderMetodeBadge = (metode) => {
        if (metode === 'Magnetic Plug') return <span className="text-green-700 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{metode}</span>;
        if (metode === 'Cutting Filter') return <span className="text-blue-600 bg-blue-50 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{metode}</span>;
        if (metode === 'Check Cylinder') return <span className="text-purple-600 bg-purple-50 border border-purple-200 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{metode}</span>;
        if (metode === 'Check Strainer') return <span className="text-orange-600 bg-orange-50 border border-orange-200 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{metode}</span>;
        return <span className="text-gray-600 bg-gray-50 border border-gray-200 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{metode}</span>;
    };

    const renderRatingBadge = (rating) => {
        if (rating === 'Good') return <span className="text-green-600 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded text-[10px]">{rating}</span>;
        if (rating === 'Fair') return <span className="text-yellow-600 bg-yellow-50 border border-yellow-200 font-bold px-2 py-0.5 rounded text-[10px]">{rating}</span>;
        if (rating === 'Poor') return <span className="text-red-500 bg-red-50 border border-red-200 font-bold px-2 py-0.5 rounded text-[10px]">{rating}</span>;
        return <span className="text-gray-600 font-bold px-2 py-0.5 text-[10px]">{rating}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Magnetic Plug" />

            {/* Header */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0b5c3e] p-2 rounded-lg text-white shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-[#0b132b] tracking-tight uppercase">MONITORING MAGNETIC PLUG</h1>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Monitoring Pemeriksaan Magnetic Plug dan Filter</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Tambah Data
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-[#0a4d3c] font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                
                {/* Filter Box */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                    <h3 className="text-[11px] font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">FILTER PENCARIAN</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Code Unit</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Pilih / Ketik Code Unit</option>
                                <option value="ME052">ME052</option>
                                <option value="ME067">ME067</option>
                                <option value="OHT070">OHT070</option>
                                <option value="OHT072">OHT072</option>
                                <option value="MDT030">MDT030</option>
                                <option value="MD037">MD037</option>
                                <option value="MD048">MD048</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Metode Filter</label>
                            <select value={metodeFilter} onChange={e => setMetodeFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Metode</option>
                                <option value="Magnetic Plug">Magnetic Plug</option>
                                <option value="Cutting Filter">Cutting Filter</option>
                                <option value="Check Cylinder">Check Cylinder</option>
                                <option value="Check Strainer">Check Strainer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Component Filter</label>
                            <select value={componentFilter} onChange={e => setComponentFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Component</option>
                                <option value="Differential">Differential</option>
                                <option value="Final Drive LH">Final Drive LH</option>
                                <option value="Final Drive RH">Final Drive RH</option>
                                <option value="Front Wheel LH">Front Wheel LH</option>
                                <option value="Front Wheel RH">Front Wheel RH</option>
                                <option value="Transmission">Transmission</option>
                                <option value="Hydraulic System">Hydraulic System</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Rating</label>
                            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                                <option value="">Semua Rating</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Date From</label>
                            <div className="relative">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Date To</label>
                            <div className="relative">
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" />
                            </div>
                        </div>
                        <div className="col-span-2 flex items-end justify-end gap-2">
                            <button onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-lg text-xs transition border border-gray-200 flex items-center justify-center gap-1.5 shadow-sm h-[38px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                                Reset
                            </button>
                            <button onClick={handleFilterSubmit} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-5 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm h-[38px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                Cari
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200">
                        <h3 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">DATA MONITORING MAGNETIC PLUG</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-center whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 font-bold">No</th>
                                    <th className="px-3 py-3 font-bold">Code Unit</th>
                                    <th className="px-3 py-3 font-bold">HM</th>
                                    <th className="px-3 py-3 font-bold">Date</th>
                                    <th className="px-3 py-3 font-bold">Metode Filter</th>
                                    <th className="px-3 py-3 font-bold text-left">Component Filter</th>
                                    <th className="px-3 py-3 font-bold">Picture</th>
                                    <th className="px-3 py-3 font-bold">Rating</th>
                                    <th className="px-3 py-3 font-bold text-left">Remarks</th>
                                    <th className="px-3 py-3 font-bold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-800">
                                {data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-2">{row.no}</td>
                                        <td className="px-3 py-2 font-medium">{row.code_unit}</td>
                                        <td className="px-3 py-2">{row.hm}</td>
                                        <td className="px-3 py-2">{row.date}</td>
                                        <td className="px-3 py-2">{renderMetodeBadge(row.metode_filter)}</td>
                                        <td className="px-3 py-2 text-left">{row.component}</td>
                                        <td className="px-3 py-2">
                                            {/* Small image placeholder */}
                                            <div className="w-16 h-10 bg-gray-200 rounded mx-auto overflow-hidden flex items-center justify-center border border-gray-300">
                                                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">{renderRatingBadge(row.rating)}</td>
                                        <td className="px-3 py-2 text-left">{row.remarks}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-center items-center gap-3">
                                                <button className="text-blue-800 hover:text-blue-600" title="View">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                </button>
                                                <button className="text-green-600 hover:text-green-800" title="Edit">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                </button>
                                                <button className="text-red-500 hover:text-red-700" title="Delete">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="px-5 py-3 flex justify-between items-center text-[11px] text-gray-500 border-t border-gray-200">
                        <div>
                            Menampilkan 1 - 10 dari 45 data
                        </div>
                        <div className="flex gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-[#0b5c3e] bg-[#0b5c3e] text-white font-bold">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">3</button>
                            <span className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">5</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
