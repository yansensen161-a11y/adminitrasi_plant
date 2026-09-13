import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ unit, hourMeters = [], breakdowns = [], services = [], backlogs = [], components = [], cannibals = [], magneticPlugs = [], tyresMap = {}, unitBudget = {} }) {
    const [activeTab, setActiveTab] = useState('info');

    const hasTyres = ['HAULER', 'DUMP TRUCK', 'MOTORGRADER', 'COMPACTOR', 'LUBECAR', 'WATER TRUCK', 'MMH', 'MB001', 'MB002', 'LIGHT VEHICLE', 'LV'].some(t => (unit.type_unit || '').toUpperCase().includes(t));

    const baseTabs = [
        { id: 'info', label: 'Info Utama', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'hm', label: 'Riwayat HM', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'component', label: 'Component', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
        { id: 'breakdown', label: 'Riwayat Breakdown', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { id: 'service', label: 'Riwayat Servis', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { id: 'backlog', label: 'Riwayat Backlog', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'budget', label: 'Budget PA', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'magnetic_plug', label: 'Magnetic Plug', icon: 'M13 10V3L4 14h7v8l9-11h-7z' },
    ];
    
    const tabs = hasTyres 
        ? [...baseTabs, { id: 'tyre', label: 'Tyre & Wheel', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }]
        : baseTabs;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        if (typeof dateString === 'number' || (!isNaN(dateString) && Number(dateString) > 30000 && Number(dateString) < 60000)) {
            const excelDate = new Date((Number(dateString) - 25569) * 86400 * 1000);
            return excelDate.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const isRunning = unit.status === 'Operational' || unit.status === 'Ready' || unit.status === 'Running';

    // Smart Multi-Cycle Replacement History Grouping
    const groupedComponents = React.useMemo(() => {
        const map = new Map();
        (components || []).forEach(comp => {
            const key = (comp.component || comp.part_number || comp.id).trim().toLowerCase();
            
            // Extract cycles from replacement_history or fallback to primary fields
            let itemCycles = [];
            if (Array.isArray(comp.replacement_history) && comp.replacement_history.length > 0) {
                itemCycles = comp.replacement_history.map(h => ({
                    date_replace: h.date_replace,
                    hm_replace: h.hm_replace,
                    next_plant: h.next_plant,
                    brand_produk: h.brand_produk || comp.brand_produk,
                }));
            } else {
                itemCycles = [{
                    date_replace: comp.date_replace,
                    hm_replace: comp.hm_replace,
                    next_plant: comp.next_plant,
                    brand_produk: comp.brand_produk,
                }];
            }

            if (!map.has(key)) {
                map.set(key, {
                    ...comp,
                    cycles: itemCycles,
                });
            } else {
                const existing = map.get(key);
                // Merge cycles avoiding exact duplicates
                itemCycles.forEach(c => {
                    const isDup = existing.cycles.some(ec => 
                        ec.date_replace === c.date_replace && 
                        Number(ec.hm_replace) === Number(c.hm_replace)
                    );
                    if (!isDup && (c.date_replace || c.hm_replace)) {
                        existing.cycles.push(c);
                    }
                });
                if (comp.hm_current) existing.hm_current = comp.hm_current;
                if (comp.target_life_time) existing.target_life_time = comp.target_life_time;
            }
        });

        // Ensure every component has at least 1 cycle item (even if empty)
        return Array.from(map.values()).map(comp => ({
            ...comp,
            cycles: comp.cycles && comp.cycles.length > 0 ? comp.cycles : [{
                date_replace: null,
                hm_replace: null,
                next_plant: comp.target_life_time,
                brand_produk: null,
            }]
        }));
    }, [components]);

    const maxCycles = React.useMemo(() => {
        if (!groupedComponents || groupedComponents.length === 0) return 1;
        const max = Math.max(...groupedComponents.map(c => c.cycles.length));
        return Math.max(1, max);
    }, [groupedComponents]);

    // Component statistics
    const normalCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) < 85).length;
    const warningCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) >= 85 && (Number(c.life_time_pct) || 0) <= 100).length;
    const overdueCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) > 100).length;

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Unit - ${unit.code_unit}`} />

            <div className="bg-[#f4f7f6] dark:bg-transparent min-h-screen pb-10">
                {/* Breadcrumbs */}
                <div className="px-6 py-4 text-sm text-gray-500 font-medium">
                    Master Unit <span className="mx-2">&gt;</span> Historical Unit <span className="mx-2">&gt;</span> <span className="text-gray-900">Detail</span>
                </div>

                <div className="px-6 max-w-7xl mx-auto">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-4">
                        <Link href={route('units.index')} className="flex items-center gap-2 text-gray-700 font-bold hover:text-gray-900 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Kembali
                        </Link>
                        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Cetak
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>

                    {/* Unit Identity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            {/* Icon Box */}
                            <div className="w-24 h-24 bg-[#e8f5e9] text-[#10b981] rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.76,5.59,8.22,5.92,7.73,6.29L5.34,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.83,8.87 C2.71,9.08,2.75,9.34,2.95,9.48l2.03,1.58C4.94,11.36,4.9,11.69,4.9,12c0,0.32,0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                                </svg>
                            </div>
                            
                            <div>
                                <div className="text-gray-500 font-bold uppercase tracking-wide text-sm">{unit.type_unit || 'UNIT'}</div>
                                <div className="flex items-center gap-3 mt-1">
                                    <h2 className="text-3xl font-black text-gray-900">{unit.code_unit}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                                        isRunning ? 'bg-[#e8f5e9] text-[#10b981]' : 
                                        unit.status === 'Standby' ? 'bg-amber-100 text-amber-700' :
                                        unit.status === 'Breakdown' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {isRunning ? 'Running' : unit.status}
                                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#10b981]' : 'bg-current'}`}></div>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 md:gap-12">
                            {/* Chassis */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h2v16H3V4zm4 0h2v16H7V4zm4 0h4v16h-4V4zm6 0h2v16h-2V4zm4 0h2v16h-2V4z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm">S/N Chassis</div>
                                    <div className="text-gray-900 font-bold mt-0.5">{unit.sn_chassis || '-'}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Lokasi */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm">Lokasi</div>
                                    <div className="text-gray-900 font-bold mt-0.5">{unit.location || '-'}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Current HM */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm text-right">Current HM</div>
                                    <div className="text-[#10b981] font-black text-2xl mt-0.5 tracking-tight">{Number(unit.hm).toLocaleString('id-ID')}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Tahun Perakitan */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm text-right">Tahun Perakitan</div>
                                    <div className="text-gray-900 font-black text-xl mt-0.5">{unit.tahun_perakitan || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide py-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-[#10b981] text-white shadow-md' 
                                        : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-800'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d={tab.icon}></path>
                                    </svg>
                                    {tab.label}
                                    {tab.id === 'component' && components.length > 0 && (
                                        <span className={`text-sm px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {components.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Contents */}
                    <div>
                        
                        {/* INFO UTAMA TAB */}
                        {activeTab === 'info' && (
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left Column */}
                                <div className="lg:w-7/12">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Detail Spesifikasi & Pembelian
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Model</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.model || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.76,5.59,8.22,5.92,7.73,6.29L5.34,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.83,8.87 C2.71,9.08,2.75,9.34,2.95,9.48l2.03,1.58C4.94,11.36,4.9,11.69,4.9,12c0,0.32,0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Jenis Equipment</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.type_unit || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Tahun Perakitan</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.tahun_perakitan || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Engine Model</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.engine_model || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Engine Make</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.engine_make || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">S/N Engine</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.sn_engine || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h2v16H3V4zm4 0h2v16H7V4zm4 0h4v16h-4V4zm6 0h2v16h-2V4zm4 0h2v16h-2V4z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">S/N Chassis</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.sn_chassis || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">No. Police</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.no_police || 'N/A'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Received Date</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{formatDate(unit.received_date)}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Vendor / Terima Dari</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.received_from || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Asal Unit</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.before_from || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="lg:w-5/12 flex flex-col gap-6">
                                    {/* Kapasitas & Attachment */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                            Informasi Kapasitas & Attachment
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Kapasitas (HP/KW)</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{(unit.hp || '-') + ' / ' + (unit.kw || '-')}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Kapasitas Equipment</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.equipment_capacity || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Attachment</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.attachments || '-'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informasi Operasional */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Informasi Operasional
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Lokasi</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.location || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Received Date</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{formatDate(unit.received_date)}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Status</div>
                                                <div className="w-1/2 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1 ${
                                                        isRunning ? 'bg-[#e8f5e9] text-[#10b981]' : 
                                                        unit.status === 'Standby' ? 'bg-amber-100 text-amber-700' :
                                                        unit.status === 'Breakdown' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {isRunning ? 'Running' : unit.status}
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#10b981]' : 'bg-current'}`}></div>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div className="bg-[#e8f5e9] rounded-2xl shadow-sm border border-[#c8e6c9] p-6">
                                        <h2 className="text-sm font-bold text-[#10b981] mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Catatan
                                        </h2>
                                        <p className="text-sm text-green-800">{unit.remarks || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* HISTORICAL COMPONENT TAB */}
                            {activeTab === 'component' && (
                                <div className="p-6">
                                    {/* Header & Quick Action */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                                        <div>
                                            <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                                <svg className="w-6 h-6 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                                </svg>
                                                Historical Component & Lifetime Tracker
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Monitoring riwayat penggantian komponen, persentase umur pakai (PCR / UC), dan catatan part kanibal unit {unit.code_unit}.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href="/pcr-uc"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-lg transition shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                Buka Plan Component (PCR)
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Metric Badges */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                                        <div className="bg-[#f9fafa] border border-gray-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-gray-400 uppercase">Total Komponen</div>
                                            <div className="text-2xl font-black text-gray-900 mt-1">{components.length}</div>
                                        </div>
                                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-emerald-700 uppercase">Kondisi Aman (&lt;85%)</div>
                                            <div className="text-2xl font-black text-emerald-800 mt-1">{normalCount}</div>
                                        </div>
                                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-amber-700 uppercase">Perlu Perhatian (85-100%)</div>
                                            <div className="text-2xl font-black text-amber-800 mt-1">{warningCount}</div>
                                        </div>
                                        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-rose-700 uppercase">Overdue Lifetime (&gt;100%)</div>
                                            <div className="text-2xl font-black text-rose-800 mt-1">{overdueCount}</div>
                                        </div>
                                    </div>

                                    {/* Main Table: PCR & Component Lifetime with Multi-Cycle Replacement History */}
                                    <div className="mb-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
                                                    Daftar Komponen &amp; Status Umur Pakai (PCR / UC)
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Riwayat instalasi &amp; penggantian komponen bertahap (otomatis terupdate dari menu Plan Component).
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                                                    Total: {groupedComponents.length} Komponen
                                                </span>
                                                <span className="text-sm font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                                                    {maxCycles} Siklus Pergantian Tercatat
                                                </span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-xs">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-[#f8fafc] text-gray-600 font-bold border-b border-gray-200 text-sm uppercase tracking-wider">
                                                    {/* Tier 1 Header */}
                                                    <tr>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 align-middle bg-gray-50/90 whitespace-nowrap min-w-[140px]">
                                                            Part Number
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 align-middle bg-gray-50/90 whitespace-nowrap min-w-[180px]">
                                                            Component
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap">
                                                            Current HM
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap">
                                                            Target Lifetime
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap min-w-[120px]">
                                                            Remaining
                                                        </th>
                                                        
                                                        {/* Dynamic Cycle Group Headers */}
                                                        {Array.from({ length: maxCycles }).map((_, idx) => (
                                                            <th 
                                                                key={idx} 
                                                                colSpan={3} 
                                                                className={`px-4 py-2.5 text-center border-l border-b font-black tracking-wide ${
                                                                    idx === 0 
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                                        : idx === 1 
                                                                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                                                        : idx === 2 
                                                                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                                                        : 'bg-purple-50 text-purple-800 border-purple-200'
                                                                }`}
                                                            >
                                                                Pergantian Ke-{idx + 1} {idx === 0 ? '(Instalasi Awal)' : ''}
                                                            </th>
                                                        ))}
                                                    </tr>

                                                    {/* Tier 2 Sub-Headers for Date, HM, Next Plan */}
                                                    <tr className="bg-gray-50/90 border-t border-gray-200">
                                                        {Array.from({ length: maxCycles }).map((_, idx) => (
                                                            <React.Fragment key={idx}>
                                                                <th className="px-4 py-2 text-center border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[110px]">
                                                                    Date Instal
                                                                </th>
                                                                <th className="px-4 py-2 text-right border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[110px]">
                                                                    HM Instal
                                                                </th>
                                                                <th className="px-4 py-2 text-right border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[120px]">
                                                                    Next Plan HM
                                                                </th>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {groupedComponents.length > 0 ? (
                                                        groupedComponents.map((comp) => {
                                                            const currentHm = comp.hm_current !== null && comp.hm_current !== undefined ? Number(comp.hm_current) : (Number(unit.hm) || 0);
                                                            
                                                            // Latest cycle info for remaining lifetime calculation
                                                            const latestCycle = comp.cycles && comp.cycles.length > 0 ? comp.cycles[comp.cycles.length - 1] : {};
                                                            const latestHmReplace = latestCycle?.hm_replace !== null && latestCycle?.hm_replace !== undefined && latestCycle?.hm_replace !== '' ? Number(latestCycle.hm_replace) : 0;
                                                            const targetLife = Number(comp.target_life_time) || 6000;
                                                            const usageHm = Math.max(0, currentHm - latestHmReplace);
                                                            const remaining = targetLife - usageHm;
                                                            const isOverdue = remaining < 0;
                                                            const isDueSoon = remaining >= 0 && remaining <= 250;

                                                            return (
                                                                <tr key={comp.id || comp.component} className="hover:bg-gray-50/80 transition group">
                                                                    {/* 1. Part Number */}
                                                                    <td className="px-5 py-3.5 border-r border-gray-100">
                                                                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                                                                            {comp.part_number || '-'}
                                                                        </span>
                                                                        {comp.brand_produk && (
                                                                            <div className="text-sm text-gray-400 mt-1 font-medium">{comp.brand_produk}</div>
                                                                        )}
                                                                    </td>

                                                                    {/* 2. Component */}
                                                                    <td className="px-5 py-3.5 border-r border-gray-100">
                                                                        <div className="font-bold text-gray-900 text-sm">{comp.component || '-'}</div>
                                                                        {comp.description && comp.description !== comp.component && (
                                                                            <div className="text-sm text-gray-400 mt-0.5">{comp.description}</div>
                                                                        )}
                                                                    </td>

                                                                    {/* 3. Current HM */}
                                                                    <td className="px-5 py-3.5 text-right font-bold text-gray-900 font-mono text-sm border-r border-gray-100">
                                                                        {Number(currentHm).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM
                                                                    </td>

                                                                    {/* 4. Target Lifetime */}
                                                                    <td className="px-5 py-3.5 text-right font-medium text-gray-700 font-mono text-sm border-r border-gray-100">
                                                                        {targetLife ? `${Number(targetLife).toLocaleString('id-ID')} Jam` : '-'}
                                                                    </td>

                                                                    {/* 5. Remaining */}
                                                                    <td className="px-5 py-3.5 text-right border-r border-gray-100">
                                                                        <div className={`font-black font-mono text-sm ${
                                                                            isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-emerald-600'
                                                                        }`}>
                                                                            {Number(remaining).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM
                                                                        </div>
                                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                                                                            isOverdue ? 'bg-rose-100 text-rose-700' : isDueSoon ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                                                                        }`}>
                                                                            {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Aman'}
                                                                        </span>
                                                                    </td>

                                                                    {/* Dynamic Columns for each Replacement Cycle */}
                                                                    {Array.from({ length: maxCycles }).map((_, cIdx) => {
                                                                        const cycle = comp.cycles?.[cIdx];
                                                                        const cycleNextPlan = cycle?.next_plant 
                                                                            ? Number(cycle.next_plant) 
                                                                            : (cycle?.hm_replace && targetLife ? Number(cycle.hm_replace) + targetLife : (targetLife || 0));

                                                                        return (
                                                                            <React.Fragment key={cIdx}>
                                                                                {/* Date Instal */}
                                                                                <td className="px-4 py-3.5 text-center font-medium text-gray-800 text-sm border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.date_replace ? formatDate(cycle.date_replace) : '-'}
                                                                                </td>

                                                                                {/* HM Instal */}
                                                                                <td className="px-4 py-3.5 text-right font-mono text-sm text-gray-700 border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.hm_replace !== null && cycle?.hm_replace !== undefined && cycle?.hm_replace !== '' 
                                                                                        ? `${Number(cycle.hm_replace).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM` 
                                                                                        : '-'}
                                                                                </td>

                                                                                {/* Next Plan HM */}
                                                                                <td className="px-4 py-3.5 text-right font-bold text-gray-900 font-mono text-sm border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.next_plant || cycle?.hm_replace
                                                                                        ? `${Number(cycleNextPlan).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM` 
                                                                                        : (cIdx === 0 && targetLife ? `${Number(targetLife).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM` : '-')}
                                                                                </td>
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5 + maxCycles * 3} className="px-6 py-12 text-center text-gray-400 font-medium">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                                                    <span>Belum ada data komponen terdaftar untuk unit ini di Plan Component (PCR / UC).</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Secondary Table: Part Canibal History */}
                                    {cannibals.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    Riwayat Kanibalisasi &amp; Swapping Part Terkait
                                                </h3>
                                                <span className="text-sm text-gray-400 font-medium">Total: {cannibals.length} transaksi</span>
                                            </div>

                                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                        <tr>
                                                            <th className="px-5 py-3.5">Tanggal &amp; No Request</th>
                                                            <th className="px-5 py-3.5">Nama Part / Komponen</th>
                                                            <th className="px-5 py-3.5">Tipe Relasi Unit</th>
                                                            <th className="px-5 py-3.5 text-center">Qty &amp; HM</th>
                                                            <th className="px-5 py-3.5">PO / PR / Dokumen</th>
                                                            <th className="px-5 py-3.5">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {cannibals.map((can) => {
                                                            const isRecipient = can.unit_id === unit.id;
                                                            return (
                                                                <tr key={can.id} className="hover:bg-gray-50 transition">
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-bold text-gray-900">{formatDate(can.tanggal || can.created_at)}</div>
                                                                        <div className="font-mono text-sm text-gray-400 mt-0.5">{can.no_request || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-bold text-gray-800">{can.part_name || '-'}</div>
                                                                        <div className="text-sm text-gray-500 mt-0.5">{can.description || can.remark || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        {isRecipient ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                                                                                    Penerima
                                                                                </span>
                                                                                <span className="text-sm text-gray-600">
                                                                                    dari <strong className="text-gray-900">{can.dari_unit?.code_unit || 'Unit Lain'}</strong>
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                                                                                    Donor Part
                                                                                </span>
                                                                                <span className="text-sm text-gray-600">
                                                                                    ke <strong className="text-gray-900">{can.unit?.code_unit || 'Unit Lain'}</strong>
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-5 py-4 text-center">
                                                                        <div className="font-bold text-gray-900">{can.qty || 1} Pcs</div>
                                                                        <div className="text-sm text-gray-400 font-mono">{can.hm ? `${Number(can.hm).toLocaleString('id-ID')} HM` : '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4 text-sm font-mono text-gray-600">
                                                                        <div>PO: {can.po || '-'}</div>
                                                                        <div>PR: {can.pr || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                                                                            {can.status || 'Tercatat'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* HM TAB */}
                            {activeTab === 'hm' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            20 Pembaruan Hour Meter Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal</th>
                                                    <th className="px-6 py-4">Shift</th>
                                                    <th className="px-6 py-4 text-right">HM Awal</th>
                                                    <th className="px-6 py-4 text-right">HM Akhir</th>
                                                    <th className="px-6 py-4 text-right">Penambahan HM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {hourMeters.length > 0 ? hourMeters.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{formatDate(log.log_date)}</td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{log.shift || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 text-right">{Number(log.hm_start).toLocaleString('id-ID')}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900 text-right">{Number(log.hm_end).toLocaleString('id-ID')}</td>
                                                        <td className="px-6 py-4 font-black text-[#10b981] text-right">+{Number(log.hm_total).toLocaleString('id-ID')}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat pembaruan HM.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* BREAKDOWN TAB */}
                            {activeTab === 'breakdown' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            20 Laporan Breakdown Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">No. WO</th>
                                                    <th className="px-6 py-4">Tanggal BD</th>
                                                    <th className="px-6 py-4">HM Saat BD</th>
                                                    <th className="px-6 py-4">Problem / Keluhan</th>
                                                    <th className="px-6 py-4">Lokasi BD</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {breakdowns.length > 0 ? breakdowns.map((bd) => (
                                                    <tr key={bd.id} className="hover:bg-gray-50 transition cursor-pointer" onDoubleClick={() => window.location.href = `/work-orders?tab=breakdown&search=${bd.no_wo}`}>
                                                        <td className="px-6 py-4 font-mono font-bold text-[#10b981]">{bd.no_wo || '-'}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {formatDate(bd.waktu_breakdown || bd.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{bd.hm_unit ? Number(bd.hm_unit).toLocaleString('id-ID') : '-'}</td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium max-w-sm truncate" title={bd.problem || bd.keterangan}>{bd.problem || bd.keterangan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{bd.location || bd.site || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (bd.status_wo || '').toLowerCase() === 'open' ? 'bg-red-100 text-red-700' : 
                                                                (bd.status_wo || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {bd.status_wo || 'Tercatat'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat breakdown.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SERVIS TAB */}
                            {activeTab === 'service' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                            20 Pekerjaan Servis / Maintenance Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal</th>
                                                    <th className="px-6 py-4">Jenis Maintenance</th>
                                                    <th className="px-6 py-4">Keterangan Pekerjaan</th>
                                                    <th className="px-6 py-4">Status Pekerjaan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {services.length > 0 ? services.map((sv) => (
                                                    <tr key={sv.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{formatDate(sv.date || sv.created_at)}</td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium">{sv.type || sv.maintenance_type || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-sm truncate" title={sv.description || sv.remarks}>{sv.description || sv.remarks || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                                                                {sv.status || 'Tercatat'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat servis atau maintenance order.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* BACKLOG TAB */}
                            {activeTab === 'backlog' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                            20 Temuan Backlog Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal Temuan</th>
                                                    <th className="px-6 py-4">Deskripsi Backlog</th>
                                                    <th className="px-6 py-4">Prioritas</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {backlogs.length > 0 ? backlogs.map((bl) => (
                                                    <tr key={bl.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{formatDate(bl.created_at)}</td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium max-w-sm truncate" title={bl.description || bl.temuan}>{bl.description || bl.temuan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{bl.priority || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                                                                {bl.status || 'Open'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada temuan backlog untuk unit ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {/* BUDGET TAB */}
                            {activeTab === 'budget' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Budget PA &amp; Realisasi
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        {/* Unit Budget Details (Mock) */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-blue-800">Total Forecast</div>
                                                <div className="text-xl font-black text-blue-900 mt-1">Rp {unitBudget.total_forecast?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-blue-700 mt-1">Realisasi: {unitBudget.total_forecast?.vs_realisasi || '0%'}</div>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-emerald-800">Planned Maint.</div>
                                                <div className="text-xl font-black text-emerald-900 mt-1">Rp {unitBudget.planned_maintenance?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-emerald-700 mt-1">{unitBudget.planned_maintenance?.pct || '0%'} dari total</div>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-amber-800">Corrective Maint.</div>
                                                <div className="text-xl font-black text-amber-900 mt-1">Rp {unitBudget.corrective_maintenance?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-amber-700 mt-1">{unitBudget.corrective_maintenance?.pct || '0%'} dari total</div>
                                            </div>
                                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-rose-800">Improvement</div>
                                                <div className="text-xl font-black text-rose-900 mt-1">Rp {unitBudget.project_improvement?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-rose-700 mt-1">{unitBudget.project_improvement?.pct || '0%'} dari total</div>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">Bulan</th>
                                                        <th className="px-6 py-4 text-right">Planned Budget</th>
                                                        <th className="px-6 py-4 text-right">Realisasi</th>
                                                        <th className="px-6 py-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {unitBudget.monthly && unitBudget.monthly.map((m, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 py-4 font-bold text-gray-900">{m.bulan}</td>
                                                            <td className="px-6 py-4 font-mono text-gray-600 text-right">Rp {m.planned}</td>
                                                            <td className="px-6 py-4 font-mono font-bold text-gray-900 text-right">Rp {m.realisasi}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                    m.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                                }`}>
                                                                    {m.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MAGNETIC PLUG TAB */}
                            {activeTab === 'magnetic_plug' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v8l9-11h-7z"></path></svg>
                                            20 Inspeksi Magnetic Plug Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal & HM</th>
                                                    <th className="px-6 py-4">Komponen</th>
                                                    <th className="px-6 py-4">Kondisi / Temuan</th>
                                                    <th className="px-6 py-4">Rekomendasi</th>
                                                    <th className="px-6 py-4">Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {magneticPlugs.length > 0 ? magneticPlugs.map((mp) => (
                                                    <tr key={mp.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{formatDate(mp.date)}</div>
                                                            <div className="text-sm font-mono text-gray-500">{Number(mp.hm).toLocaleString('id-ID')} HM</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium">{mp.component || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs">{mp.condition || mp.temuan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs">{mp.recommendation || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (mp.rating || '').toLowerCase().includes('normal') ? 'bg-emerald-100 text-emerald-700' : 
                                                                (mp.rating || '').toLowerCase().includes('abnormal') ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {mp.rating || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada data inspeksi magnetic plug.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TYRE TAB */}
                            {activeTab === 'tyre' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                Visual Mapping Roda & Ban
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">Status dan layout ban berdasarkan konfigurasi unit {unit.type_unit}</p>
                                        </div>
                                    </div>

                                    {/* Tyre Map Layout Builder */}
                                    <div className="bg-gray-50 p-8 rounded-2xl flex flex-col items-center border border-gray-200">
                                        <div className="relative w-full max-w-3xl flex flex-col gap-12 items-center">
                                            {/* Top Front Indicator */}
                                            <div className="absolute -top-6 text-gray-400 font-bold tracking-widest uppercase text-sm border-b-2 border-gray-300 pb-1 px-4">Bagian Depan</div>
                                            
                                            {/* Helper Function to Render a Tyre Slot */}
                                            {(() => {
                                                const renderTyre = (pos) => {
                                                    const t = tyresMap[pos];
                                                    return (
                                                        <div className="w-24 sm:w-32 bg-white border border-gray-200 rounded-lg p-2 shadow-sm text-center relative hover:shadow-md transition">
                                                            <div className="text-xs font-bold text-gray-500 mb-1">{pos}</div>
                                                            {t ? (
                                                                <>
                                                                    <div className="w-full h-16 sm:h-20 bg-gray-800 rounded-md mb-2 flex items-center justify-center relative overflow-hidden border-2 border-gray-900">
                                                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMmQzNzQ4Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMWEyMDI2IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
                                                                        <span className="relative text-white font-mono text-xs z-10 break-all px-1 leading-tight">{t.serial_number || 'No S/N'}</span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-[#10b981]">{t.current_lifetime} HM</div>
                                                                    <div className="text-[10px] text-gray-400 truncate">{t.brand || 'Unknown'}</div>
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-16 sm:h-20 bg-gray-100 rounded-md mb-2 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-400 font-medium">Kosong</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                const unitType = (unit.type_unit || '').toUpperCase();
                                                
                                                // 10 TYRES: DUMP TRUCK, WATER TRUCK
                                                if (unitType.includes('DUMP') || unitType.includes('WATER')) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-4 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 7')}{renderTyre('Pos 8')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 9')}{renderTyre('Pos 10')}</div>
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 8 TYRES: LUBECAR (Assume dual rear axles)
                                                else if (unitType.includes('LUBE')) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 mt-4 relative">
                                                                {renderTyre('Pos 7')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 8')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 6 TYRES: HAULER, MOTORGRADER, MMH, MB001, MB002
                                                else if (['HAULER', 'MOTORGRADER', 'MMH', 'MB001', 'MB002'].some(t => unitType.includes(t))) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 2 TYRES: COMPACTOR (Drum front, 2 tyres rear)
                                                else if (unitType.includes('COMPACTOR')) {
                                                    return (
                                                        <>
                                                            <div className="w-full max-w-sm px-4 flex justify-center mb-8 relative">
                                                                <div className="w-64 h-24 bg-gray-400 rounded-lg shadow-inner flex items-center justify-center border-4 border-gray-500">
                                                                    <span className="text-white font-bold tracking-widest">DRUM SILINDER</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // Default 4 Tyres (Light Vehicle or Unknown)
                                                else {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('FL')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('FR')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 mt-8 relative">
                                                                {renderTyre('RL')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('RR')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
