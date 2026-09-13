import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import MonitoringPlanBoard from './MonitoringPlanBoard';

// Icons
const WrenchIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    </svg>
);

const CalendarCheckIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM11 16.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
);

const HourglassIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

export default function Index({ breakdown, planService, monitoringPlan }) {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('tab') || 'breakdown';
        }
        return 'breakdown';
    }); 
    
    // Status Badge Helpers
    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN':
                return 'bg-red-100 text-red-600 font-bold';
            case 'PROCESS':
                return 'bg-blue-100 text-blue-600 font-bold';
            case 'WAITING PART':
                return 'bg-purple-100 text-purple-600 font-bold';
            case 'COMPLETED':
            case 'ON SCHEDULE':
                return 'bg-green-100 text-green-600 font-bold';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const isBreakdown = activeTab === 'breakdown';
    const currentData = isBreakdown ? breakdown : planService;
    const { kpi, data: paginatedData } = currentData;

    return (
        <AuthenticatedLayout>
            <Head title="Work Order" />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-10">
                {/* Top Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="text-gray-500 cursor-pointer lg:hidden">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] tracking-tight">Work Order</h1>
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                <span>Home</span>
                                <span className="mx-1.5">&gt;</span>
                                <span>Work Order</span>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-blue-600">{isBreakdown ? 'Monitoring Breakdown' : 'Plan Schedule Unit'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                            <CalendarIcon />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium leading-none">Selasa, 09 September 2026</span>
                                <span className="text-sm font-bold text-gray-800 leading-none mt-1">21:05:12</span>
                            </div>
                        </div>
                        
                        <div className="relative cursor-pointer">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">5</span>
                        </div>

                        <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                            <div className="w-8 h-8 bg-[#012922] rounded-full flex items-center justify-center text-white">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 leading-none">YANSEN</span>
                                <span className="text-xs text-gray-500 font-medium leading-none mt-1">Planner</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="py-2 w-full max-w-[100%] mx-auto">
                    {/* Tab & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded shadow-sm text-sm font-bold transition-colors bg-[#0b6e4f] text-white">
                                {isBreakdown ? <><WrenchIcon /> Monitoring Breakdown</> : <><CalendarIcon /> Plan Schedule Unit</>}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <a 
                                href="/work-orders/export"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                            </a>
                            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import
                                <input type="file" className="hidden" accept=".xlsx,.csv" onChange={(e) => {
                                    if(e.target.files.length > 0) {
                                        const formData = new FormData();
                                        formData.append('file', e.target.files[0]);
                                        router.post('/work-orders/import', formData, {
                                            onSuccess: () => alert('Import berhasil!'),
                                        });
                                    }
                                }} />
                            </label>
                            <Link 
                                href="/work-orders/create"
                                className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors"
                            >
                                <span className="text-lg leading-none">+</span> Buat Work Order
                            </Link>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    {isBreakdown && (
                        <div className="grid gap-4 mb-6 grid-cols-5">
                            {/* Total WO */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-500 shrink-0">
                                    <WrenchIcon />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-red-600 uppercase tracking-wide">TOTAL WO</div>
                                    <div className="text-3xl font-black text-[#012922] leading-none mt-1">{kpi.total_wo}</div>
                                </div>
                            </div>

                            {/* OPEN */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-500 shrink-0">
                                    <AlertIcon />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-red-600 uppercase tracking-wide">OPEN</div>
                                    <div className="text-3xl font-black text-[#012922] leading-none mt-1">{kpi.open}</div>
                                </div>
                            </div>

                            {/* PROCESS */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-500 shrink-0">
                                    <SettingsIcon />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-blue-600 uppercase tracking-wide">PROCESS</div>
                                    <div className="text-3xl font-black text-[#012922] leading-none mt-1">{kpi.process}</div>
                                </div>
                            </div>

                            {/* WAITING PART */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center text-orange-500 shrink-0">
                                    <HourglassIcon />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">WAITING PART</div>
                                    <div className="text-3xl font-black text-[#012922] leading-none mt-1">{kpi.waiting_part}</div>
                                </div>
                            </div>

                            {/* COMPLETED */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center text-green-500 shrink-0">
                                    <CheckCircleIcon />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-green-600 uppercase tracking-wide">COMPLETED</div>
                                    <div className="text-3xl font-black text-[#012922] leading-none mt-1">{kpi.completed}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters & Table Section */}
                    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        
                        {/* Filter Section - Only for Breakdown */}
                        {isBreakdown ? (
                            <>
                                <div className="bg-gray-50/50 border-y border-gray-100 p-4 flex gap-4 items-end flex-wrap">
                                    <div className="w-48">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Type WO</label>
                                        <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]">
                                            <option>Breakdown</option>
                                        </select>
                                    </div>

                                    <div className="w-40">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Status WO</label>
                                        <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]">
                                            <option>Semua</option>
                                            <option>OPEN</option>
                                            <option>PROCESS</option>
                                        </select>
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <CalendarIcon />
                                            </div>
                                            <input type="text" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" defaultValue="01/09/2026 - 30/09/2026" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Unit</label>
                                        <input type="text" placeholder="Cari code unit ..." className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" />
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="bg-[#0b6e4f] hover:bg-[#095940] text-white px-5 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                            Filter
                                        </button>
                                        <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#0b6e4f] text-white">
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap text-center w-12 border-r border-[#095940]">No</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap border-r border-[#095940]">No WO</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap border-r border-[#095940]">Tanggal WO</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap border-r border-[#095940]">Code Unit</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap border-r border-[#095940]">Model</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap border-r border-[#095940]">Problem</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap text-center border-r border-[#095940]">Status WO</th>
                                                <th className="py-3 px-4 text-sm font-bold whitespace-nowrap text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.data.map((item, index) => (
                                                <tr key={item.no_wo} onDoubleClick={() => router.visit(`/work-orders/${item.id}`)} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer">
                                                    <td className="py-2.5 px-4 text-[13px] text-gray-500 text-center border-r border-gray-100">{index + 1}</td>
                                                    <td className="py-2.5 px-4 text-[13px] font-bold text-gray-800 border-r border-gray-100">{item.no_wo}</td>
                                                    <td className="py-2.5 px-4 text-[13px] text-gray-600 border-r border-gray-100">{item.request_date ? new Date(item.request_date).toLocaleDateString('id-ID') : '-'}</td>
                                                    <td className="py-2.5 px-4 text-[13px] font-bold text-[#012922] border-r border-gray-100">{item.unit?.code_unit || '-'}</td>
                                                    <td className="py-2.5 px-4 text-[13px] text-gray-600 border-r border-gray-100">{item.unit?.model || '-'}</td>
                                                    <td className="py-2.5 px-4 text-[13px] text-gray-600 border-r border-gray-100">{item.problem || item.failure_description || '-'}</td>
                                                    <td className="py-2.5 px-4 text-center border-r border-gray-100">
                                                        <span className={`inline-block px-3 py-1 rounded text-xs uppercase font-bold tracking-wide w-28 ${getStatusStyle(item.status_wo)}`}>
                                                            {item.status_wo || 'OPEN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <Link href={`/work-orders/${item.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#0b6e4f] rounded text-sm font-bold transition-colors">
                                                            <EyeIcon /> Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Bar */}
                                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                                    <div className="text-sm text-gray-500 font-medium">
                                        Menampilkan 1 - 10 dari {paginatedData.total} data
                                    </div>
                                    <div className="flex gap-1 items-center">
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b6e4f] text-white font-bold text-sm">
                                            1
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm transition-colors">
                                            2
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm transition-colors">
                                            3
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <MonitoringPlanBoard units={monitoringPlan || []} />
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
