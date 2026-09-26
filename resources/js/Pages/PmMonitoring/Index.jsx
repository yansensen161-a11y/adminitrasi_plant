import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import MonitoringPlanBoard from '@/Pages/WorkOrder/MonitoringPlanBoard';

export default function Index({ units = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncHm = () => {
        if (confirm('Sinkronkan seluruh Hour Meter (HM) unit dengan data log operasional & service terbaru?')) {
            router.post('/pm-monitoring/sync-hm', {}, {
                preserveScroll: true,
                onStart: () => setIsSyncing(true),
                onFinish: () => setIsSyncing(false),
            });
        }
    };

    const filteredUnits = useMemo(() => {
        if (!search.trim()) return units;
        const q = search.toLowerCase().trim();
        return units.filter(u => 
            (u.code_unit && u.code_unit.toLowerCase().includes(q)) ||
            (u.model && u.model.toLowerCase().includes(q)) ||
            (u.sn_chassis && u.sn_chassis.toLowerCase().includes(q)) ||
            (u.location && u.location.toLowerCase().includes(q))
        );
    }, [units, search]);

    return (
        <AuthenticatedLayout fullWidth>
            <Head title="PM Monitoring - Jatuh Tempo Service Unit" />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-12 w-full">
                {/* Top Header */}
                <div className="bg-white dark:bg-[#060b14] px-4 sm:px-5 py-3 flex items-center justify-between shadow-xs border border-gray-200 dark:border-white/10 rounded-xl mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#012922] to-[#0b6e4f] text-white flex items-center justify-center shadow-sm">
                            <span className="text-xl">⏱️</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight flex items-center gap-2">
                                PM Monitoring
                                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 tracking-wider">
                                    Service Schedule
                                </span>
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                <Link href="/portal" className="hover:text-blue-600 transition-colors">Portal</Link>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-gray-600 dark:text-gray-300">Preventive Maintenance</span>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">PM Monitoring</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Unit */}
                        <div className="relative w-64 md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari Code Unit / Model..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] placeholder-gray-400"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Sinkronkan HM Button */}
                        <button
                            type="button"
                            disabled={isSyncing}
                            onClick={handleSyncHm}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-sm shadow-sm border transition-all cursor-pointer whitespace-nowrap ${
                                isSyncing
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-gray-300 dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-700 active:scale-95'
                            }`}
                            title="Sinkronkan data HM unit dari Hour Meter Log & Service Log terbaru"
                        >
                            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan HM'}</span>
                        </button>

                        <Link
                            href="/work-orders/create?tipe_wo=SCHEDULE&from=pm-monitoring"
                            className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Buat Work Order PM
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full">
                    {/* Flash Success Notification */}
                    {(flash?.success || flash?.message) && (
                        <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 text-emerald-900 dark:text-emerald-100 shadow-md">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="flex-1 text-sm font-bold">
                                {flash.success || flash.message}
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 text-red-900 dark:text-red-100 shadow-md">
                            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <div className="flex-1 text-sm font-bold">
                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Monitoring Board Component */}
                    <MonitoringPlanBoard units={filteredUnits} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
