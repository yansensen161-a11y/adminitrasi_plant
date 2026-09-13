import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, units, stats, filters }) {
    // Form filters
    const [unitFilter, setUnitFilter] = useState(filters?.code_unit || '');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [jenisUnitFilter, setJenisUnitFilter] = useState('');
    const [lokasiFilter, setLokasiFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [periodeFilter, setPeriodeFilter] = useState('');

    // State for selected unit detail
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Auto-select first unit if available
    useEffect(() => {
        if (units.data && units.data.length > 0 && !selectedUnit) {
            setSelectedUnit(units.data[0]);
        }
    }, [units]);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/plan-service', {
            code_unit: unitFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setUnitFilter('');
        setDepartmentFilter('');
        setJenisUnitFilter('');
        setLokasiFilter('');
        setStatusFilter('');
        setPeriodeFilter('');
        router.get('/plan-service', {}, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ON SCHEDULE':
                return (
                    <span className="px-3 py-1 rounded bg-[#10b981] text-white font-bold text-xs uppercase tracking-wide">
                        On Schedule
                    </span>
                );
            case 'DUE SOON':
                return (
                    <span className="px-3 py-1 rounded bg-[#facc15] text-white font-bold text-xs uppercase tracking-wide">
                        Due Soon
                    </span>
                );
            case 'OVERDUE':
                return (
                    <span className="px-3 py-1 rounded bg-[#ef4444] text-white font-bold text-xs uppercase tracking-wide">
                        Overdue
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded bg-gray-500 text-white font-bold text-xs uppercase tracking-wide">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Plan Inspection Unit" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Plan Inspection Unit
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Jadwal inspeksi unit berdasarkan interval hour meter dan kalender</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <button className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Plan
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Import Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0ea5e9] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Total Unit</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.total}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">Unit</div>
                </div>

                <div className="bg-[#10b981] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">On Schedule</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.on_schedule}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">({stats.on_schedule_pct}%)</div>
                </div>

                <div className="bg-[#facc15] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Due Soon</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.due_soon}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">({stats.due_soon_pct}%)</div>
                </div>

                <div className="bg-[#ef4444] p-5 rounded-xl shadow-md text-white flex flex-col justify-center items-center text-center relative overflow-hidden h-28">
                    <svg className="w-24 h-24 absolute -left-4 -bottom-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    <div className="text-sm font-bold opacity-90 z-10">Overdue</div>
                    <div className="text-4xl font-black mt-1 z-10">{stats.overdue}</div>
                    <div className="text-sm font-semibold opacity-80 mt-1 z-10">({stats.overdue_pct}%)</div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="mb-4">
                <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                        <select 
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                        >
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Unit</label>
                        <select 
                            value={jenisUnitFilter}
                            onChange={(e) => setJenisUnitFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                        >
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Lokasi</label>
                        <select 
                            value={lokasiFilter}
                            onChange={(e) => setLokasiFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                        >
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2"
                        >
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Periode</label>
                        <div className="relative">
                            <input 
                                type="month" 
                                value={periodeFilter}
                                onChange={(e) => setPeriodeFilter(e.target.value)}
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 pl-9"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                    <div className="flex-[2] min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-700 mb-1 opacity-0">Search</label>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Cari kode unit, model, atau SN..."
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 pl-9"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 opacity-0">Action</label>
                        <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1">
                            Cari
                        </button>
                        <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-center w-10">No</th>
                                <th className="px-4 py-3 font-semibold text-center">Kode Unit</th>
                                <th className="px-4 py-3 font-semibold text-center">Equipment</th>
                                <th className="px-4 py-3 font-semibold text-center">Model</th>
                                <th className="px-4 py-3 font-semibold text-center">Lokasi</th>
                                <th className="px-4 py-3 font-semibold text-center">HM Terakhir</th>
                                <th className="px-4 py-3 font-semibold text-center">Next Inspection</th>
                                <th className="px-4 py-3 font-semibold text-center">Sisa HM</th>
                                <th className="px-4 py-3 font-semibold text-center">Due Date</th>
                                <th className="px-4 py-3 font-semibold text-center">Status</th>
                                <th className="px-4 py-3 font-semibold text-center">PIC</th>
                                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => {
                                    const isSelected = selectedUnit?.id === unit.id;
                                    return (
                                        <tr 
                                            key={unit.id} 
                                            onClick={() => setSelectedUnit(unit)}
                                            className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/80'}`}
                                        >
                                            <td className="px-4 py-3 text-center text-gray-500">{units.from + index}</td>
                                            <td className="px-4 py-3 text-center text-gray-900">{unit.code_unit}</td>
                                            <td className="px-4 py-3 text-center">{unit.equipment_type || '-'}</td>
                                            <td className="px-4 py-3 text-center">{unit.model || '-'}</td>
                                            <td className="px-4 py-3 text-center">{unit.lokasi || '-'}</td>
                                            <td className="px-4 py-3 text-center">{Number(unit.current_hm).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-center">{unit.next_inspection}</td>
                                            <td className={`px-4 py-3 text-center font-bold ${unit.sisa_hm < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {unit.sisa_hm}
                                            </td>
                                            <td className={`px-4 py-3 text-center ${unit.service_reminder === 'OVERDUE' ? 'text-red-600 font-bold' : ''}`}>
                                                {unit.due_date}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(unit.service_reminder)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {unit.pic}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button className="bg-[#3b82f6] hover:bg-blue-600 text-white p-1.5 rounded transition shadow-sm" title="Detail" onClick={(e) => { e.stopPropagation(); setSelectedUnit(unit); }}>
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                    </button>
                                                    <button className="bg-[#10b981] hover:bg-[#059669] text-white p-1.5 rounded transition shadow-sm" title="Edit" onClick={(e) => { e.stopPropagation(); }}>
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                    </button>
                                                    <button className="bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded transition shadow-sm" title="Jadwal" onClick={(e) => { e.stopPropagation(); }}>
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data jadwal service.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {units.links && units.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-white text-sm">
                        <div className="text-gray-500">
                            Menampilkan {units.from || 0} - {units.to || 0} dari {stats?.total || 0} data
                        </div>
                        <div className="flex gap-1">
                            {units.links.map((link, idx) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = '«';
                                if (label.includes('Next')) label = '»';
                                
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition ${
                                            link.active
                                                ? 'bg-[#10b981] text-white font-bold'
                                                : link.url
                                                ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                : 'text-gray-400 cursor-not-allowed border border-gray-100 bg-white'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panels (Detail, Riwayat, Next Schedule) */}
            {selectedUnit && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Detail Inspection */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Detail Inspection</h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-1/3 bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-center items-center h-32">
                                {/* SVG Placeholder for Heavy Equipment since image path isn't guaranteed */}
                                <svg className="w-20 h-20 text-yellow-500" fill="currentColor" viewBox="0 0 64 64">
                                    <path d="M54 36c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-42 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm36-8H16v-8l6-6h18v14zm-22-6v-6h-4l-4 4v2h8zm12 0v-6h-4v6h4z" />
                                    <path d="M58 20H42v-2c0-1.1-.9-2-2-2H20.8L12 24.8V28H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h2c0 3.3 2.7 6 6 6s6-2.7 6-6h24c0 3.3 2.7 6 6 6s6-2.7 6-6h2c1.1 0 2-.9 2-2V22c0-1.1-.9-2-2-2z" opacity="0.3"/>
                                </svg>
                            </div>
                            <div className="w-full sm:w-2/3">
                                <table className="w-full text-sm text-gray-600">
                                    <tbody>
                                        <tr><td className="py-1 w-24">Kode Unit</td><td className="py-1 font-bold text-gray-900">: {selectedUnit.code_unit}</td></tr>
                                        <tr><td className="py-1">Equipment</td><td className="py-1">: {selectedUnit.equipment_type || '-'}</td></tr>
                                        <tr><td className="py-1">Model</td><td className="py-1">: {selectedUnit.model || '-'}</td></tr>
                                        <tr><td className="py-1">Lokasi</td><td className="py-1">: {selectedUnit.lokasi}</td></tr>
                                        <tr><td className="py-1">HM Terakhir</td><td className="py-1">: {Number(selectedUnit.current_hm).toLocaleString('id-ID')}</td></tr>
                                        <tr><td className="py-1">Next Inspection</td><td className="py-1">: {selectedUnit.next_inspection}</td></tr>
                                        <tr><td className="py-1">Sisa HM</td><td className="py-1">: {selectedUnit.sisa_hm}</td></tr>
                                        <tr><td className="py-1">Due Date</td><td className="py-1">: {selectedUnit.due_date}</td></tr>
                                        <tr><td className="py-1">Status</td><td className="py-1 flex items-center gap-1">: {getStatusBadge(selectedUnit.service_reminder)}</td></tr>
                                        <tr><td className="py-1">PIC</td><td className="py-1">: {selectedUnit.pic}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Inspection Unit */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Riwayat Inspection Unit</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Tanggal</th>
                                        <th className="px-2 py-2 font-semibold">HM</th>
                                        <th className="px-2 py-2 font-semibold">Jenis Inspection</th>
                                        <th className="px-2 py-2 font-semibold">Hasil</th>
                                        <th className="px-2 py-2 font-semibold">PIC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {/* Mock historical data based on current HM */}
                                    {[
                                        { tgl: '01 Aug 2026', hm: (selectedUnit.current_hm - 240), jenis: 'P2H', hasil: 'OK', pic: 'Andi' },
                                        { tgl: '15 Jul 2026', hm: (selectedUnit.current_hm - 610), jenis: '250 HM', hasil: 'OK', pic: 'Budi' },
                                        { tgl: '01 Jun 2026', hm: (selectedUnit.current_hm - 880), jenis: 'P2H', hasil: 'OK', pic: 'Andi' },
                                        { tgl: '15 May 2026', hm: (selectedUnit.current_hm - 1360), jenis: '500 HM', hasil: 'OK', pic: 'Rudi' },
                                        { tgl: '01 May 2026', hm: (selectedUnit.current_hm - 1740), jenis: 'P2H', hasil: 'OK', pic: 'Andi' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5">{row.tgl}</td>
                                            <td className="px-2 py-1.5">{Math.max(0, row.hm).toLocaleString('id-ID')}</td>
                                            <td className="px-2 py-1.5">{row.jenis}</td>
                                            <td className="px-2 py-1.5">{row.hasil}</td>
                                            <td className="px-2 py-1.5">{row.pic}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Next Inspection Schedule */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Next Inspection Schedule</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Jenis Inspection</th>
                                        <th className="px-2 py-2 font-semibold">Interval (HM)</th>
                                        <th className="px-2 py-2 font-semibold">Next HM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {/* Mock future data based on current HM */}
                                    {[
                                        { jenis: 'P2H', interval: 'Daily', next: '-' },
                                        { jenis: '250 HM', interval: '250', next: (Math.floor(selectedUnit.current_hm/250)*250 + 250) },
                                        { jenis: '500 HM', interval: '500', next: (Math.floor(selectedUnit.current_hm/500)*500 + 500) },
                                        { jenis: '1,000 HM', interval: '1,000', next: (Math.floor(selectedUnit.current_hm/1000)*1000 + 1000) },
                                        { jenis: '2,000 HM', interval: '2,000', next: (Math.floor(selectedUnit.current_hm/2000)*2000 + 2000) },
                                        { jenis: '4,000 HM', interval: '4,000', next: (Math.floor(selectedUnit.current_hm/4000)*4000 + 4000) },
                                        { jenis: '8,000 HM', interval: '8,000', next: (Math.floor(selectedUnit.current_hm/8000)*8000 + 8000) },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5">{row.jenis}</td>
                                            <td className="px-2 py-1.5">{row.interval}</td>
                                            <td className="px-2 py-1.5">{row.next !== '-' ? row.next.toLocaleString('id-ID') : row.next}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
