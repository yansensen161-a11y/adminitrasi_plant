import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

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

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function Index({ breakdown = {}, historical = {} }) {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            const tab = queryParams.get('tab');
            if (tab === 'historical') return 'historical';
            return 'breakdown';
        }
        return 'breakdown';
    });

    const [statusFilter, setStatusFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('status') || 'Semua';
        }
        return 'Semua';
    });

    const [typeFilter, setTypeFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('type') || 'Semua';
        }
        return 'Semua';
    });

    const [unitFilter, setUnitFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('unit') || '';
        }
        return '';
    });

    const [orderFilter, setOrderFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('order') || 'desc';
        }
        return 'desc';
    });

    const [perPage, setPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('per_page') || '25';
        }
        return '25';
    });

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            const tab = queryParams.get('tab');
            const currentTab = tab === 'historical' ? 'historical' : 'breakdown';
            if (currentTab !== activeTab) {
                setActiveTab(currentTab);
            }
            setStatusFilter(queryParams.get('status') || 'Semua');
            setTypeFilter(queryParams.get('type') || 'Semua');
            setUnitFilter(queryParams.get('unit') || '');
            setOrderFilter(queryParams.get('order') || 'desc');
            setPerPage(queryParams.get('per_page') || '25');
        }
    }, [breakdown, historical]);

    const handlePerPageChange = (val) => {
        setPerPage(val);
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('tab', activeTab);
        queryParams.set('per_page', val);
        queryParams.delete('page');
        router.visit(`/work-orders?${queryParams.toString()}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = () => {
        const params = { tab: activeTab };
        if (perPage && perPage !== '25') {
            params.per_page = perPage;
        }
        if (activeTab === 'breakdown' && statusFilter && statusFilter !== 'Semua') {
            params.status = statusFilter;
        }
        if (activeTab === 'historical') {
            if (typeFilter && typeFilter !== 'Semua') {
                params.type = typeFilter;
            }
            if (orderFilter) {
                params.order = orderFilter;
            }
        }
        if (unitFilter.trim()) {
            params.unit = unitFilter.trim();
        }
        router.get('/work-orders', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setStatusFilter('Semua');
        setTypeFilter('Semua');
        setUnitFilter('');
        setOrderFilter('desc');
        const params = { tab: activeTab };
        if (perPage && perPage !== '25') {
            params.per_page = perPage;
        }
        router.get('/work-orders', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteWo = (item) => {
        const noWo = item.no_wo || 'ini';
        if (window.confirm(`Apakah Anda yakin ingin menghapus Work Order ${noWo}? Semua data task dan detail terkait akan dihapus secara permanen.`)) {
            router.delete(`/work-orders/${item.id}`, {
                preserveScroll: true,
            });
        }
    }; 
    
    const getStatusStyle = (status) => {
        const s = String(status || '').toUpperCase();
        if (s.includes('COMPLETED') || s === 'CLOSED' || s === 'ON SCHEDULE') {
            return 'bg-green-100 text-green-700 font-bold border border-green-200';
        }
        if (s.includes('PROGRESS') || s === 'PROCESS' || s === 'OPEN') {
            return 'bg-blue-100 text-blue-600 font-bold border border-blue-200';
        }
        if (s.includes('PLANNING') || s === 'DRAFT') {
            return 'bg-amber-100 text-amber-700 font-bold border border-amber-200';
        }
        if (s.includes('WAITING PART')) {
            return 'bg-purple-100 text-purple-600 font-bold border border-purple-200';
        }
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    };

    const isBreakdown = activeTab === 'breakdown';
    const isHistorical = activeTab === 'historical';

    const currentData = isHistorical ? historical : breakdown;
    const { kpi = {}, data: paginatedData = {} } = currentData || {};

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
                                <span className="text-blue-600 font-bold">
                                    {isBreakdown ? 'Monitoring Breakdown' : 'Historical WO Closed'}
                                </span>
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

                <div className="py-2 w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6">
                    {/* Submenu Header & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-black text-[#012922] dark:text-white uppercase tracking-tight flex items-center gap-2">
                                {isBreakdown ? (
                                    <>
                                        <WrenchIcon />
                                        <span>Monitoring Breakdown</span>
                                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-0.5 rounded-full font-bold">
                                            {breakdown?.kpi?.total_wo ?? 0} Unit
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon />
                                        <span>Historical WO Closed</span>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                                            {historical?.kpi?.total_closed ?? 0} Closed
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Full Screen Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 px-3.5 py-2.5 rounded shadow-xs text-sm font-bold transition-colors cursor-pointer border border-gray-200 dark:border-white/10"
                                title={isFullscreen ? "Keluar Layar Penuh" : "Tampilan Layar Penuh (Full Screen)"}
                            >
                                {isFullscreen ? (
                                    <>
                                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        <span>Exit Fullscreen</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                        <span>Full Screen</span>
                                    </>
                                )}
                            </button>

                            <a 
                                href={isBreakdown ? "/work-orders/export-breakdown" : "/work-orders/export?tab=historical"}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors"
                                title={isBreakdown ? "Export Excel Breakdown (Hanya Data Open Sesuai Format PDF)" : "Export Excel Work Order"}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                            </a>

                            <a 
                                href={isBreakdown ? "/work-orders/download-template-breakdown" : "/work-orders/download-template"}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2.5 rounded text-sm font-bold transition-colors cursor-pointer"
                                title={isBreakdown ? "Download Template Excel untuk Import Breakdown" : "Download Template Excel untuk Import Work Order"}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Template
                            </a>

                            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors cursor-pointer" title={isBreakdown ? "Import Excel Breakdown" : "Import Excel Work Order"}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import
                                <input type="file" className="hidden" accept=".xlsx,.csv" onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        const formData = new FormData();
                                        formData.append('file', e.target.files[0]);
                                        const importUrl = isBreakdown ? '/work-orders/import-breakdown' : '/work-orders/import';
                                        router.post(importUrl, formData, {
                                            onSuccess: (page) => {
                                                if (page?.props?.flash?.error) {
                                                    alert(`Gagal import ${isBreakdown ? 'Breakdown' : 'Work Order'}: ` + page.props.flash.error);
                                                } else if (page?.props?.flash?.success) {
                                                    alert(page.props.flash.success);
                                                } else {
                                                    alert(`Import ${isBreakdown ? 'Breakdown' : 'Work Order'} berhasil!`);
                                                }
                                                e.target.value = '';
                                            },
                                            onError: (errors) => {
                                                alert(`Gagal import ${isBreakdown ? 'Breakdown' : 'Work Order'}: ` + Object.values(errors).join('\n'));
                                                e.target.value = '';
                                            },
                                        });
                                    }
                                }} />
                            </label>

                            <Link 
                                href="/work-orders/create"
                                className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-4 py-2.5 rounded shadow text-sm font-bold transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Buat Work Order
                            </Link>
                        </div>
                    </div>

                    {/* KPI Cards: Breakdown Tab */}
                    {isBreakdown && (
                        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Total WO */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-500 shrink-0">
                                    <WrenchIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-red-600 uppercase tracking-wide">TOTAL WO</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.total_wo || 0}</div>
                                </div>
                            </div>

                            {/* OPEN */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-500 shrink-0">
                                    <AlertIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-red-600 uppercase tracking-wide">OPEN</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.open || 0}</div>
                                </div>
                            </div>

                            {/* PROCESS */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-500 shrink-0">
                                    <SettingsIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-blue-600 uppercase tracking-wide">PROCESS</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.process || 0}</div>
                                </div>
                            </div>

                            {/* WAITING PART */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center text-orange-500 shrink-0">
                                    <HourglassIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-orange-600 uppercase tracking-wide">WAITING PART</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.waiting_part || 0}</div>
                                </div>
                            </div>

                            {/* COMPLETED */}
                            <Link 
                                href="/work-orders?tab=historical&type=BREAKDOWN"
                                className="bg-white hover:bg-green-50/60 transition-all rounded border border-gray-200 hover:border-green-300 p-4 shadow-sm flex items-center gap-4 cursor-pointer group"
                                title="Klik untuk melihat riwayat Work Order Breakdown yang sudah Selesai (Historical)"
                            >
                                <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded flex items-center justify-center text-green-500 shrink-0 transition-colors">
                                    <CheckCircleIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-green-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <span>COMPLETED</span>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-green-700 bg-gray-100 group-hover:bg-green-100 px-1.5 py-0.5 rounded transition-colors">Historical &rarr;</span>
                                    </div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.completed || 0}</div>
                                </div>
                            </Link>
                        </div>
                    )}



                    {/* KPI Cards: Historical Tab */}
                    {isHistorical && (
                        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Total Closed */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 shrink-0">
                                    <CheckCircleIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-emerald-600 uppercase tracking-wide">TOTAL WO CLOSED</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.total_closed || 0}</div>
                                </div>
                            </div>

                            {/* Schedule Closed */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-600 shrink-0">
                                    <CalendarIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-blue-600 uppercase tracking-wide">SCHEDULE CLOSED</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.schedule_closed || 0}</div>
                                </div>
                            </div>

                            {/* Breakdown Closed */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-100 rounded flex items-center justify-center text-rose-600 shrink-0">
                                    <WrenchIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-rose-600 uppercase tracking-wide">BREAKDOWN CLOSED</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{kpi.breakdown_closed || 0}</div>
                                </div>
                            </div>

                            {/* Total Durasi */}
                            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded flex items-center justify-center text-amber-600 shrink-0">
                                    <HourglassIcon />
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-amber-600 uppercase tracking-wide">TOTAL JAM DOWNTIME</div>
                                    <div className="text-4xl font-black text-[#012922] leading-none mt-1">{Number(kpi.total_hours || 0).toLocaleString('id-ID')} <span className="text-lg font-bold text-gray-500">hrs</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        
                        {/* BREAKDOWN TAB CONTENT */}
                        {isBreakdown && (
                            <>
                                <div className="bg-gray-50/50 border-y border-gray-100 p-4 flex gap-4 items-end flex-wrap">
                                    <div className="w-48">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Type WO</label>
                                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm font-bold text-gray-800">
                                            BREAKDOWN (CM)
                                        </div>
                                    </div>

                                    <div className="w-48">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Status WO</label>
                                        <select 
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            <option value="Semua">Semua (Aktif)</option>
                                            <option value="OPEN">OPEN</option>
                                            <option value="PROCESS">PROCESS</option>
                                            <option value="WAITING PART">WAITING PART</option>
                                            <option value="COMPLETED">COMPLETED (Closed)</option>
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
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Unit / No WO</label>
                                        <input 
                                            type="text" 
                                            value={unitFilter}
                                            onChange={e => setUnitFilter(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                            placeholder="Cari code unit / No WO ..." 
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={handleFilter}
                                            className="bg-[#0b6e4f] hover:bg-[#095940] text-white px-5 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                            Filter
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleReset}
                                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                        >
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
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center w-12 border-r border-[#095940]">No</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">No WO</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Tanggal Breakdown</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Date RFU</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Code Unit</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Model</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Component Group</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Problem</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center border-r border-[#095940]">Status WO</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.data && paginatedData.data.length > 0 ? (
                                                paginatedData.data.map((item, index) => (
                                                    <tr key={item.id || item.no_wo} onDoubleClick={() => router.visit(`/work-orders/${item.id}`)} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer">
                                                        <td className="py-3 px-4 text-[15px] text-gray-500 text-center border-r border-gray-100">
                                                            {(paginatedData.from || 1) + index}
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] font-bold text-gray-800 border-r border-gray-100 font-mono">{item.no_wo}</td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-600 border-r border-gray-100">
                                                            <div className="font-semibold text-gray-800 text-[15px]">
                                                                {item.waktu_breakdown ? new Date(item.waktu_breakdown).toLocaleDateString('id-ID') : (item.request_date ? new Date(item.request_date).toLocaleDateString('id-ID') : '-')}
                                                            </div>
                                                            {item.waktu_breakdown && (
                                                                <div className="text-[13px] text-gray-500 font-mono mt-0.5 whitespace-nowrap font-medium">
                                                                    Jam: {new Date(item.waktu_breakdown).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    {item.durasi_hrs && ` (${item.durasi_hrs}h)`}
                                                                </div>
                                                            )}
                                                            {item.hm_bd && (
                                                                <div className="text-[12px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 whitespace-nowrap font-bold">
                                                                    HM BD: {item.hm_bd}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-600 border-r border-gray-100">
                                                            {item.waktu_rfu ? (
                                                                <>
                                                                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[15px]">
                                                                        {new Date(item.waktu_rfu).toLocaleDateString('id-ID')}
                                                                    </div>
                                                                    <div className="text-[13px] text-gray-500 font-mono mt-0.5 whitespace-nowrap font-medium">
                                                                        Jam: {new Date(item.waktu_rfu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    {item.hm_rfu && (
                                                                        <div className="text-[12px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 whitespace-nowrap font-bold">
                                                                            HM RFU: {item.hm_rfu}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                                                                    On Progress
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-[16px] font-black text-[#012922] border-r border-gray-100">{item.unit?.code_unit || '-'}</td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-700 border-r border-gray-100">{item.unit?.model || '-'}</td>
                                                        <td className="py-3 px-4 text-[14px] text-gray-700 border-r border-gray-100">
                                                            <span className="inline-block px-2.5 py-1 rounded text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 tracking-wide whitespace-nowrap">
                                                                {item.component_group || item.component || item.tasks?.[0]?.group_component || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-700 border-r border-gray-100">{item.problem || item.failure_description || '-'}</td>
                                                        <td className="py-3 px-4 text-center border-r border-gray-100" onClick={e => e.stopPropagation()}>
                                                            <select
                                                                value={item.status_pengerjaan || (item.status_wo === 'COMPLETED' ? 'COMPLETED - PEKERJAAN SELESAI' : 'PLANNING - PERENCANAAN PEKERJAAN')}
                                                                onChange={(e) => {
                                                                    router.patch(`/work-orders/${item.id}/status`, { status_pengerjaan: e.target.value }, {
                                                                        preserveScroll: true,
                                                                        preserveState: true,
                                                                    });
                                                                }}
                                                                className={`px-3 py-1.5 rounded text-[13px] uppercase font-bold tracking-wide cursor-pointer text-center border ${getStatusStyle(item.status_pengerjaan || item.status_wo)}`}
                                                            >
                                                                <option value="PLANNING - PERENCANAAN PEKERJAAN">PLANNING</option>
                                                                <option value="IN PROGRESS - SEDANG DIKERJAKAN">IN PROGRESS</option>
                                                                <option value="COMPLETED - PEKERJAAN SELESAI">COMPLETED</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Link 
                                                                    href={`/work-orders/${item.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#0b6e4f] rounded text-[13px] font-bold transition-colors"
                                                                >
                                                                    <EyeIcon />
                                                                    Detail
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteWo(item)}
                                                                    title="Hapus Work Order"
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-[13px] font-bold transition-colors cursor-pointer"
                                                                >
                                                                    <TrashIcon />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="py-12 text-center text-gray-400 font-medium">
                                                        Tidak ada data Work Order Breakdown.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Bar */}
                                {paginatedData && (
                                    <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="text-[15px] text-gray-600 font-semibold">
                                                Menampilkan {paginatedData.from || 0} - {paginatedData.to || 0} dari {paginatedData.total || 0} data
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                                                <span>Tampilkan:</span>
                                                <select
                                                    value={perPage}
                                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                                    className="border-0 bg-transparent text-xs font-bold text-[#0b6e4f] p-0 focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="10">10 / hal</option>
                                                    <option value="25">25 / hal</option>
                                                    <option value="50">50 / hal</option>
                                                    <option value="100">100 / hal</option>
                                                    <option value="all">Semua</option>
                                                </select>
                                            </div>
                                        </div>
                                        {paginatedData.links && paginatedData.links.length > 3 && (
                                            <div className="flex gap-1.5 items-center flex-wrap">
                                                {paginatedData.links.map((link, idx) => {
                                                    let label = link.label;
                                                    if (label.includes('Previous') || label.includes('&laquo;')) label = '«';
                                                    if (label.includes('Next') || label.includes('&raquo;')) label = '»';

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            disabled={!link.url || link.active}
                                                            onClick={() => {
                                                                if (link.url) {
                                                                    router.visit(link.url, {
                                                                        preserveScroll: true,
                                                                        preserveState: true,
                                                                    });
                                                                }
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: label }}
                                                            className={`min-w-[36px] h-9 px-3 flex items-center justify-center rounded text-[15px] font-bold transition-colors ${
                                                                link.active
                                                                    ? 'bg-[#0b6e4f] text-white font-bold shadow-sm'
                                                                    : link.url
                                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold cursor-pointer'
                                                                    : 'text-gray-300 cursor-not-allowed border border-gray-100 bg-gray-50/50'
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* HISTORICAL TAB CONTENT */}
                        {isHistorical && (
                            <>
                                <div className="bg-gray-50/50 border-y border-gray-100 p-4 flex gap-4 items-end flex-wrap">
                                    <div className="w-48">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipe WO</label>
                                        <select 
                                            value={typeFilter}
                                            onChange={e => setTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            <option value="Semua">Semua Tipe</option>
                                            <option value="SCHEDULE">SCHEDULE</option>
                                            <option value="BREAKDOWN">BREAKDOWN</option>
                                        </select>
                                    </div>

                                    <div className="w-56">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Urutan No WO</label>
                                        <select 
                                            value={orderFilter}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setOrderFilter(val);
                                                const params = { tab: 'historical', order: val };
                                                if (typeFilter && typeFilter !== 'Semua') params.type = typeFilter;
                                                if (unitFilter.trim()) params.unit = unitFilter.trim();
                                                router.get('/work-orders', params, { preserveState: true, preserveScroll: true });
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            <option value="desc">No WO Tertinggi di Atas</option>
                                            <option value="asc">No WO Terendah di Atas</option>
                                        </select>
                                    </div>

                                    <div className="flex-1 min-w-[240px]">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Pencarian Unit / No WO</label>
                                        <input 
                                            type="text" 
                                            value={unitFilter}
                                            onChange={e => setUnitFilter(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                            placeholder="Ketik kode unit, model, atau nomor WO ..." 
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={handleFilter}
                                            className="bg-[#0b6e4f] hover:bg-[#095940] text-white px-5 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                            Filter
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleReset}
                                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                        >
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
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center w-12 border-r border-[#095940]">No</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">No WO</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Tanggal Selesai</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Code Unit</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Model</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center border-r border-[#095940]">Tipe WO</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center border-r border-[#095940]">Downtime Code</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap border-r border-[#095940]">Deskripsi Pekerjaan</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center border-r border-[#095940]">Status WO</th>
                                                <th className="py-3.5 px-4 text-[15px] font-bold whitespace-nowrap text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.data && paginatedData.data.length > 0 ? (
                                                paginatedData.data.map((item, index) => (
                                                    <tr key={item.id || item.no_wo} onDoubleClick={() => router.visit(`/work-orders/${item.id}`)} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer">
                                                        <td className="py-3 px-4 text-[15px] text-gray-500 text-center border-r border-gray-100">
                                                            {(paginatedData.from || 1) + index}
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] font-bold text-[#0b6e4f] border-r border-gray-100 font-mono">
                                                            {item.no_wo}
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-600 border-r border-gray-100">
                                                            <div className="font-semibold text-gray-800 text-[15px]">
                                                                {item.close_date ? new Date(item.close_date).toLocaleDateString('id-ID') : (item.waktu_breakdown ? new Date(item.waktu_breakdown).toLocaleDateString('id-ID') : (item.request_date ? new Date(item.request_date).toLocaleDateString('id-ID') : '-'))}
                                                            </div>
                                                            {item.waktu_breakdown && (
                                                                <div className="text-[13px] text-gray-500 font-mono mt-0.5 whitespace-nowrap font-medium">
                                                                    BD: {new Date(item.waktu_breakdown).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    {item.waktu_rfu && ` | RFU: ${new Date(item.waktu_rfu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                                                                    {item.durasi_hrs && ` (${item.durasi_hrs}h)`}
                                                                </div>
                                                            )}
                                                            {(item.hm_bd || item.hm_rfu) && (
                                                                <div className="text-[12px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 whitespace-nowrap font-bold">
                                                                    HM BD: {item.hm_bd ?? '-'} {item.hm_rfu && `| RFU: ${item.hm_rfu}`}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-[16px] font-black text-[#012922] border-r border-gray-100">{item.unit?.code_unit || '-'}</td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-700 border-r border-gray-100">{item.unit?.model || '-'}</td>
                                                        <td className="py-3 px-4 text-center border-r border-gray-100">
                                                            <span className={`inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (item.status_wo?.includes('PM') || item.tipe_wo === 'SCHEDULE')
                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                                                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                            }`}>
                                                                {item.status_wo || item.tipe_wo || 'SCHEDULE'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] font-semibold text-center text-gray-800 border-r border-gray-100">
                                                            {item.downtime_code || 'Schedule'}
                                                        </td>
                                                        <td className="py-3 px-4 text-[15px] text-gray-800 border-r border-gray-100 font-medium">
                                                            {item.problem || item.job_instruction || item.keterangan || 'Periodical service'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center border-r border-gray-100">
                                                            <span className="inline-block px-3.5 py-1.5 rounded text-[12px] uppercase font-black tracking-wide w-auto min-w-[120px] bg-green-100 text-green-700 border border-green-200">
                                                                {item.status_pengerjaan || 'COMPLETED - PEKERJAAN SELESAI'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Link 
                                                                    href={`/work-orders/${item.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#0b6e4f] rounded text-[13px] font-bold transition-colors"
                                                                >
                                                                    <EyeIcon />
                                                                    Detail
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteWo(item)}
                                                                    title="Hapus Work Order"
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-[13px] font-bold transition-colors cursor-pointer"
                                                                >
                                                                    <TrashIcon />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="py-12 text-center text-gray-400 font-medium">
                                                        Tidak ada data Historical Work Order Closed.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Bar */}
                                {paginatedData && (
                                    <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="text-[15px] text-gray-600 font-semibold">
                                                Menampilkan {paginatedData.from || 0} - {paginatedData.to || 0} dari {paginatedData.total || 0} data
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                                                <span>Tampilkan:</span>
                                                <select
                                                    value={perPage}
                                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                                    className="border-0 bg-transparent text-xs font-bold text-[#0b6e4f] p-0 focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="10">10 / hal</option>
                                                    <option value="25">25 / hal</option>
                                                    <option value="50">50 / hal</option>
                                                    <option value="100">100 / hal</option>
                                                    <option value="all">Semua</option>
                                                </select>
                                            </div>
                                        </div>
                                        {paginatedData.links && paginatedData.links.length > 3 && (
                                            <div className="flex gap-1.5 items-center flex-wrap">
                                                {paginatedData.links.map((link, idx) => {
                                                    let label = link.label;
                                                    if (label.includes('Previous') || label.includes('&laquo;')) label = '«';
                                                    if (label.includes('Next') || label.includes('&raquo;')) label = '»';

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            disabled={!link.url || link.active}
                                                            onClick={() => {
                                                                if (link.url) {
                                                                    router.visit(link.url, {
                                                                        preserveScroll: true,
                                                                        preserveState: true,
                                                                    });
                                                                }
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: label }}
                                                            className={`min-w-[36px] h-9 px-3 flex items-center justify-center rounded text-[15px] font-bold transition-colors ${
                                                                link.active
                                                                    ? 'bg-[#0b6e4f] text-white font-bold shadow-sm'
                                                                    : link.url
                                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold cursor-pointer'
                                                                    : 'text-gray-300 cursor-not-allowed border border-gray-100 bg-gray-50/50'
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
