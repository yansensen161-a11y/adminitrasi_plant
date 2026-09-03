import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ units, stats }) {
    
    // Quick helper to determine if a value should be a green checkmark or red text
    const renderHmValue = (hm, currentHm, requiredHm) => {
        // Dummy logic based on mockup
        // If currentHm is roughly close or past requiredHm, it's either red or a check.
        // For mockup accuracy, we'll just show what the mockup shows via some hardcoded checks or randomized for now since we don't have the real history.
        if (currentHm > requiredHm + 500) return <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>;
        if (currentHm > requiredHm - 500 && currentHm < requiredHm + 500) {
            return <span className="text-red-600 font-bold">{requiredHm.toLocaleString('id-ID')}</span>;
        }
        return <span className="text-gray-300">-</span>;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ON SCHEDULE':
                return <span className="text-green-700 bg-green-100 px-2 py-1 rounded font-bold text-[9px] uppercase">ON SCHEDULE</span>;
            case 'DUE SOON':
                return <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded font-bold text-[9px] uppercase">DUE SOON</span>;
            case 'OVERDUE':
                return <span className="text-red-700 bg-red-100 px-2 py-1 rounded font-bold text-[9px] uppercase">OVERDUE</span>;
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Control PM Service" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Master Control PM Service</h1>
                    <p className="text-sm text-gray-500">Kelola dan monitoring seluruh aktivitas Periodical Maintenance Service unit</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Master Control PM Service</span>
                    </div>
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">UPDATE HM</div>
                        <div className="text-2xl font-black text-gray-900">{stats.update_hm}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Data HM Terakhir</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.4zM10 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 8l-4-4 1.4-1.4 4 4L20 19z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">PERIODICAL SERVICE</div>
                        <div className="text-2xl font-black text-gray-900">{stats.periodical_service}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Service Terjadwal</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">BACKLOG</div>
                        <div className="text-2xl font-black text-gray-900">{stats.backlog}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Service Terlambat</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">SOS/PAP OPEN</div>
                        <div className="text-2xl font-black text-gray-900">{stats.sos_pap_open}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Temuan Open</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">HISTORICAL SERVICE</div>
                        <div className="text-2xl font-black text-gray-900">{stats.historical_service.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">Riwayat Service</div>
                    </div>
                </div>
            </div>

            {/* Menu Cards */}
            <div className="mb-6">
                <h2 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">MENU MASTER CONTROL PM SERVICE</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link href="/hour-meters" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0b5c3e]/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.2-4.5-2.7V7z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#0b5c3e] transition-colors">Update HM</h3>
                                <p className="text-[10px] text-gray-500">Update dan kelola data HM unit alat berat</p>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0b5c3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>

                    <Link href="/plan-service" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Monitoring Periodical Service</h3>
                                <p className="text-[10px] text-gray-500">Monitoring jadwal dan status periodical service unit</p>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>

                    <Link href="#" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm1 4h-2v-2h2v2z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Backlog</h3>
                                <p className="text-[10px] text-gray-500">Monitoring service yang terlambat / overdue</p>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>

                    <Link href="#" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Historical Periodical Service</h3>
                                <p className="text-[10px] text-gray-500">Lihat riwayat periodical service unit</p>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <h2 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">SUMMARY SERVICE UNIT</h2>
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">No</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">Unit</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">Equipment</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">Current HM</th>
                                <th colSpan="6" className="px-3 py-1 font-semibold text-center border-r border-b border-[#0d614b]">Next Service (HM)</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b]">Backlog</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b]">Finding Open</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b]">SOS/PAP Open</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">Status Terakhir</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-r border-b border-[#0d614b]">Next Service</th>
                                <th rowSpan="2" className="px-3 py-2 font-semibold text-center border-b border-[#0d614b]">Status</th>
                            </tr>
                            <tr>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">250</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">500</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">1000</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">2000</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">4000</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] w-12 bg-[#08422c]">8000</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] bg-[#08422c]">(Unit)</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] bg-[#08422c]">(Unit)</th>
                                <th className="px-2 py-1 font-semibold text-center border-r border-b border-[#0d614b] bg-[#08422c]">(Unit)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => {
                                    // Mock data based on mockup values
                                    const hmMock = [8250, 15200, 12450, 9750, 4200, 6100, 3600, 7800, 2350, 1520][index % 10];
                                    const reqMock = [1000, 2000, 2000, 1000, 2000, 1000, 500, 1000, 250, 2000][index % 10];
                                    const nextHm = [1750, 4800, 7550, 250, 1800, 900, 500, 2200, 250, 480][index % 10];
                                    const backlog = [2, 1, 3, 1, 0, 2, 0, 1, 0, 0][index % 10];
                                    const finding = [1, 0, 2, 1, 0, 1, 0, 1, 2, 0][index % 10];
                                    const sospap = [0, 1, 0, 0, 0, 1, 0, 0, 0, 0][index % 10];
                                    const statMock = ['ON SCHEDULE', 'ON SCHEDULE', 'ON SCHEDULE', 'DUE SOON', 'ON SCHEDULE', 'DUE SOON', 'DUE SOON', 'ON SCHEDULE', 'OVERDUE', 'ON SCHEDULE'][index % 10];
                                    const dates = ['22/05/2024', '20/05/2024', '18/05/2024', '21/05/2024', '19/05/2024', '17/05/2024', '16/05/2024', '15/05/2024', '14/05/2024', '13/05/2024'][index % 10];
                                    
                                    return (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 text-center text-gray-500 font-medium">
                                                {units.from + index}
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-900 font-bold">
                                                {unit.code_unit}
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-600 font-medium whitespace-nowrap">
                                                {unit.equipment_capacity}
                                            </td>
                                            <td className="px-3 py-2 text-center font-bold text-gray-900">
                                                {hmMock.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30 border-l border-gray-100">
                                                {reqMock === 250 ? <span className="text-red-600 font-bold">{nextHm}</span> : reqMock > 250 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30">
                                                {reqMock === 500 ? <span className="text-red-600 font-bold">{nextHm}</span> : reqMock > 500 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30">
                                                {reqMock === 1000 ? <span className="text-red-600 font-bold">{nextHm.toLocaleString('id-ID')}</span> : reqMock > 1000 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30">
                                                {reqMock === 2000 ? <span className="text-red-600 font-bold">{nextHm.toLocaleString('id-ID')}</span> : reqMock > 2000 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30">
                                                {reqMock === 4000 ? <span className="text-red-600 font-bold">{nextHm.toLocaleString('id-ID')}</span> : reqMock > 4000 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center bg-gray-50/30 border-r border-gray-100">
                                                {reqMock === 8000 ? <span className="text-red-600 font-bold">{nextHm.toLocaleString('id-ID')}</span> : reqMock > 8000 ? <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center font-bold">
                                                <span className={backlog > 0 ? "text-red-600" : "text-green-600"}>{backlog}</span>
                                            </td>
                                            <td className="px-2 py-2 text-center font-bold">
                                                <span className={finding > 0 ? "text-red-600" : "text-green-600"}>{finding}</span>
                                            </td>
                                            <td className="px-2 py-2 text-center font-bold">
                                                <span className={sospap > 0 ? "text-red-600" : "text-green-600"}>{sospap}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-600">
                                                {dates}
                                            </td>
                                            <td className="px-3 py-2 text-center font-bold text-gray-900">
                                                {reqMock} HM
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {getStatusBadge(statMock)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="16" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data unit yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                    <div>
                        Menampilkan {units.from || 0} - {units.to || 0} dari {units.total || 0} data
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0a4d3c] text-white font-bold">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">3</button>
                            <span className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">13</button>
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
