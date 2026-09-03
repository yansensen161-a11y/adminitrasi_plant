import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, units, stats, filters }) {
    // Form filters
    const [unitFilter, setUnitFilter] = useState(filters?.code_unit || '');
    const [lokasiFilter, setLokasiFilter] = useState('');
    const [tipeServiceFilter, setTipeServiceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [nextServiceDari, setNextServiceDari] = useState('');
    const [nextServiceSampai, setNextServiceSampai] = useState('');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/plan-service', {
            code_unit: unitFilter,
            // other filters are placeholders for UI mockup
        }, { preserveState: true });
    };

    const handleReset = () => {
        setUnitFilter('');
        setLokasiFilter('');
        setTipeServiceFilter('');
        setStatusFilter('');
        setNextServiceDari('');
        setNextServiceSampai('');
        router.get('/plan-service', {}, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ON SCHEDULE':
                return (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold text-[9px] uppercase tracking-wide">
                        ON SCHEDULE
                    </span>
                );
            case 'DUE SOON':
                return (
                    <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-[9px] uppercase tracking-wide">
                        DUE SOON
                    </span>
                );
            case 'OVERDUE':
                return (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wide">
                        OVERDUE
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold text-[9px] uppercase tracking-wide">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Periodical Service" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Monitoring Periodical Service</h1>
                    <p className="text-sm text-gray-500">Monitoring jadwal dan status periodical service unit</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Monitoring Periodical Service</span>
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
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">TOTAL UNIT</div>
                        <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">ON SCHEDULE</div>
                        <div className="text-2xl font-black text-gray-900">{stats.on_schedule}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Unit ({stats.on_schedule_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">DUE SOON</div>
                        <div className="text-2xl font-black text-gray-900">{stats.due_soon}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Unit ({stats.due_soon_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">OVERDUE</div>
                        <div className="text-2xl font-black text-gray-900">{stats.overdue}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Unit ({stats.overdue_pct?.toString().replace('.', ',')}%)</div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white shadow-sm sm:rounded-xl mb-6 p-4 border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-col xl:flex-row gap-4 items-end">
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Unit / Equipment</label>
                            <select
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua Unit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Lokasi</label>
                            <select
                                value={lokasiFilter}
                                onChange={(e) => setLokasiFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua Lokasi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Tipe Service</label>
                            <select
                                value={tipeServiceFilter}
                                onChange={(e) => setTipeServiceFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] appearance-none"
                            >
                                <option value="">Semua</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">Next Service (HM)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Dari"
                                    value={nextServiceDari}
                                    onChange={(e) => setNextServiceDari(e.target.value)}
                                    className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]"
                                />
                                <input
                                    type="text"
                                    placeholder="Sampai"
                                    value={nextServiceSampai}
                                    onChange={(e) => setNextServiceSampai(e.target.value)}
                                    className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full xl:w-auto">
                        <button
                            type="submit"
                            className="bg-[#0a4d3c] hover:bg-[#08422c] text-white font-bold px-6 py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2 rounded-lg text-xs transition border border-gray-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.75a9.25 9.25 0 1 0 4.737 17.197l-1.366-1.503A7.25 7.25 0 1 1 12 4.75v3.5L16.5 4.5 12 .75v2z"/></svg>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <h2 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">DAFTAR PERIODICAL SERVICE</h2>
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Code Unit</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Lokasi</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Current HM</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Next Service<br/><span className="text-[9px] font-normal">(HM)</span></th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">HM Tersisa</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">HM<br/>Service Date</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Next Service<br/>Type</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Status</th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Backlog<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">Finding Open<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-2 py-3 font-semibold text-center border-r border-[#0d614b]">SOS/PAP<br/><span className="text-[9px] font-normal">(Unit)</span></th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Keterangan</th>
                                <th className="px-3 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => {
                                    // Mock data based on mockup
                                    const hmMock = [8248, 15205, 12448, 9760, 4198, 6105, 3598, 7795, 2351, 1518][index % 10];
                                    const nextMock = [9000, 16000, 14000, 10000, 6000, 6000, 4000, 8000, 2500, 2000][index % 10];
                                    const tipeMock = ['PM 1000', 'PM 2000', 'PM 2000', 'PM 1000', 'PM 2000', 'PM 1000', 'PM 500', 'PM 1000', 'PM 250', 'PM 500'][index % 10];
                                    const lokMock = ['Pit 1', 'Pit 2', 'Pit 1', 'Mainroad', 'Pit 3', 'Jetty', 'Workshop', 'Mainroad', 'Pit 2', 'Site Office'][index % 10];
                                    const tersisaMock = [752, 795, 1552, 240, 1802, -105, 402, 205, 149, 482][index % 10];
                                    const dateMock = ['15/06/2024', '20/06/2024', '25/06/2024', '28/06/2024', '15/07/2024', '10/05/2024', '05/06/2024', '12/06/2024', '02/06/2024', '18/06/2024'][index % 10];
                                    const statMock = ['ON SCHEDULE', 'ON SCHEDULE', 'DUE SOON', 'DUE SOON', 'ON SCHEDULE', 'OVERDUE', 'DUE SOON', 'DUE SOON', 'ON SCHEDULE', 'ON SCHEDULE'][index % 10];
                                    
                                    const backlog = [2, 1, 3, 1, 0, 2, 0, 1, 0, 0][index % 10];
                                    const finding = [1, 0, 2, 1, 0, 1, 0, 1, 2, 0][index % 10];
                                    const sospap = [0, 1, 0, 0, 0, 1, 0, 0, 0, 0][index % 10];
                                    const ket = statMock === 'OVERDUE' ? 'Terlambat 5 HM' : '-';
                                    
                                    return (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                                                {units.from + index}
                                            </td>
                                            <td className="px-3 py-2.5 font-bold text-center text-gray-900">
                                                {unit.code_unit}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-gray-600">
                                                {unit.equipment_type}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                {lokMock}
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-bold">
                                                {tipeMock}
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-mono">
                                                {hmMock.toLocaleString('id-ID', { minimumFractionDigits: 3 })}
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-mono font-bold text-[#0b5c3e] bg-green-50/30">
                                                {nextMock.toLocaleString('id-ID', { minimumFractionDigits: 3 })}
                                            </td>
                                            <td className={`px-3 py-2.5 text-center font-mono font-bold ${tersisaMock < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {tersisaMock.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-gray-600">
                                                {dateMock}
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-medium">
                                                {tipeMock}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                {getStatusBadge(statMock)}
                                            </td>
                                            <td className="px-2 py-2.5 text-center font-bold">
                                                <span className={backlog > 0 ? "text-red-600" : "text-green-600"}>{backlog}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center font-bold">
                                                <span className={finding > 0 ? "text-red-600" : "text-green-600"}>{finding}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center font-bold">
                                                <span className={sospap > 0 ? "text-red-600" : "text-green-600"}>{sospap}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-gray-500">
                                                {ket}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="text-gray-400 hover:text-blue-600 p-1 border border-transparent hover:border-blue-200 rounded transition-all">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                    </button>
                                                    <button className="text-gray-400 hover:text-gray-700 p-1 border border-transparent hover:border-gray-200 rounded transition-all">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
                                                    </button>
                                                    <button className="text-gray-400 hover:text-gray-700 p-1 border border-transparent hover:border-gray-200 rounded transition-all">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="16" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data jadwal service.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {units.links && (
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                        <div>
                            Menampilkan {units.from || 0} - {units.to || 0} dari {stats?.total || 0} data
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1">
                                {units.links.map((link, idx) => {
                                    if(link.label.includes('Previous')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>;
                                    if(link.label.includes('Next')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>;
                                    if(link.label === '...') return <span key={idx} className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>;
                                    
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!link.url || link.active}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
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
                            <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none bg-white">
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
