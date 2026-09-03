import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ orders, stats }) {
    const [tanggal, setTanggal] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        // Implement filter logic when backend supports it
    };

    const handleReset = () => {
        setTanggal('');
        setStatusFilter('');
        setDepartmentFilter('');
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'HIGH':
                return <span className="text-red-600 bg-red-50 px-2 py-1 rounded font-bold text-[10px] uppercase">HIGH</span>;
            case 'MEDIUM':
                return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded font-bold text-[10px] uppercase">MEDIUM</span>;
            case 'LOW':
                return <span className="text-green-600 bg-green-50 px-2 py-1 rounded font-bold text-[10px] uppercase">LOW</span>;
            default:
                return <span>{priority}</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded font-bold text-[10px] uppercase border border-blue-200">OPEN</span>;
            case 'PROCESS':
                return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded font-bold text-[10px] uppercase border border-yellow-200">PROCESS</span>;
            case 'CLOSED':
                return <span className="text-green-600 bg-green-50 px-3 py-1 rounded font-bold text-[10px] uppercase border border-green-200">CLOSED</span>;
            case 'CANCEL':
                return <span className="text-red-600 bg-red-50 px-3 py-1 rounded font-bold text-[10px] uppercase border border-red-200">CANCEL</span>;
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="SO Plant" />

            {/* Header */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">SO Plant</h1>
                    <p className="text-sm text-gray-500">Service Order Plant</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Planner</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">SO Plant</span>
                    </div>
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-2 px-4 rounded-lg text-sm transition flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
                        Buat SO
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">TOTAL SO</div>
                        <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Order</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">OPEN</div>
                        <div className="text-2xl font-black text-gray-900">{stats.open}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Order</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">PROCESS</div>
                        <div className="text-2xl font-black text-gray-900">{stats.process}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Order</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">CLOSED</div>
                        <div className="text-2xl font-black text-gray-900">{stats.closed}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Order</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">CANCEL</div>
                        <div className="text-2xl font-black text-gray-900">{stats.cancel}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Order</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-5 border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-[11px] font-bold text-gray-800 mb-1">Tanggal</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="01/05/2024 - 31/05/2024"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-[#0a4d3c]"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-64">
                        <label className="block text-[11px] font-bold text-gray-800 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#0a4d3c]"
                        >
                            <option value="">Semua Status</option>
                            <option value="OPEN">Open</option>
                            <option value="PROCESS">Process</option>
                            <option value="CLOSED">Closed</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                    </div>

                    <div className="w-full md:w-64">
                        <label className="block text-[11px] font-bold text-gray-800 mb-1">Department</label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#0a4d3c]"
                        >
                            <option value="">Semua Department</option>
                            <option value="Mining">Mining</option>
                            <option value="Logistic">Logistic</option>
                            <option value="Utility">Utility</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto ml-auto">
                        <button type="submit" className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-sm transition flex items-center gap-2">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-sm transition border border-gray-200 flex items-center gap-2">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-extrabold text-[11px] text-[#0b5c3e] uppercase tracking-wider">DAFTAR SO PLANT</h2>
                    <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-1.5 px-3 rounded-lg text-[11px] uppercase tracking-wide transition flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        Export Excel
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#0a4d3c] text-white text-[10px] uppercase">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">No. SO</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Unit</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Department</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Priority</th>
                                <th className="px-4 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                <th className="px-4 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {orders.data && orders.data.length > 0 ? (
                                orders.data.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors font-medium">
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {orders.from + index}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-900 font-bold">
                                            {order.no_so}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {new Date(order.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.unit?.code_unit || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {order.unit?.equipment_capacity || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {order.lokasi}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {order.department}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getPriorityBadge(order.priority)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center items-center gap-1">
                                                <button className="p-1.5 text-gray-400 hover:text-[#0b5c3e] border border-transparent hover:border-gray-200 rounded transition-colors" title="View">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-blue-500 border border-transparent hover:border-gray-200 rounded transition-colors" title="Edit">
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-700 border border-transparent hover:border-gray-200 rounded transition-colors" title="Print">
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data SO Plant yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Mocked visual layout) */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                    <div>
                        Menampilkan {orders.from || 0} - {orders.to || 0} dari {orders.total || 0} data
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0a4d3c] text-white font-bold">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">3</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">4</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">5</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>
                        </div>
                        <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none">
                            <option>10 / halaman</option>
                            <option>25 / halaman</option>
                            <option>50 / halaman</option>
                        </select>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
