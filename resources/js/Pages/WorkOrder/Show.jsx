import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

// Common SVG Icons
const BackIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const PrinterIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const CheckCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const WrenchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('B0')) return { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' };
    if (s.includes('B1')) return { bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' };
    if (s.includes('B2')) return { bg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800', dot: 'bg-orange-500' };
    if (s.includes('B3')) return { bg: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800', dot: 'bg-cyan-500' };
    if (s.includes('B4')) return { bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800', dot: 'bg-purple-500' };
    if (s.includes('B5')) return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500' };
    if (s.includes('B6')) return { bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', dot: 'bg-rose-500' };
    if (s.includes('B7')) return { bg: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800', dot: 'bg-fuchsia-500' };
    if (s.includes('B8')) return { bg: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800', dot: 'bg-teal-500' };
    return { bg: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700', dot: 'bg-gray-400' };
};

const formatDownStatus = (val) => {
    if (!val) return 'B0 - On Progress';
    const s = String(val).toUpperCase();
    if (s.includes('B0')) return 'B0 - On Progress';
    if (s.includes('B1')) return 'B1 - Waiting Parts';
    if (s.includes('B2')) return 'B2 - Waiting Sarana';
    if (s.includes('B3')) return 'B3 - Waiting Tools';
    if (s.includes('B4')) return 'B4 - Waiting Man Power';
    if (s.includes('B5')) return 'B5 - Outside / Dealer';
    if (s.includes('B6')) return 'B6 - Production / Abuse';
    if (s.includes('B7')) return 'B7 - Waiting Decision Plant';
    if (s.includes('B8')) return 'B8 - Waiting Decision HO';
    return val;
};

export default function Show({ workOrder }) {
    const [activeTab, setActiveTab] = useState('master');
    const wo = workOrder;

    const handleDelete = () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus Work Order ${wo.no_wo || ''}? Semua data task dan detail terkait akan dihapus secara permanen.`)) {
            router.delete(`/work-orders/${wo.id}`);
        }
    };

    const tabs = [
        { id: 'master', label: 'WO Master & Detail', icon: '📋' },
        { id: 'parts', label: 'Parts / Material', icon: '🔩', count: wo.parts?.length },
        { id: 'manpower', label: 'Manpower', icon: '👷', count: wo.manpowers?.length },
        { id: 'vendor', label: 'External / Vendor', icon: '🏢', count: wo.vendors?.length },
        { id: 'warranty', label: 'Warranty Claim', icon: '🛡️', count: wo.warranties?.length },
        { id: 'history', label: 'Status History', icon: '📜', count: wo.statusHistories?.length },
    ];

    const getBreakdownDurationNumber = () => {
        if (!wo.waktu_breakdown) {
            return wo.durasi_hrs ? Number(wo.durasi_hrs).toFixed(2) : '0.00';
        }
        const start = new Date(wo.waktu_breakdown).getTime();
        if (isNaN(start)) {
            return wo.durasi_hrs ? Number(wo.durasi_hrs).toFixed(2) : '0.00';
        }
        const end = wo.waktu_rfu ? new Date(wo.waktu_rfu).getTime() : Date.now();
        const diffHrs = Math.max(0, (end - start) / (1000 * 60 * 60));
        return diffHrs.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'master':
                return (
                    <div className="space-y-6">
                        {/* ── Card 1: Rincian Spesifikasi & Administrasi (Style matching Gambar 2) ── */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                                        ⚙️
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                                            Rincian Spesifikasi & Administrasi
                                        </h3>
                                        <p className="text-[11px] text-slate-400">Parameter operasional unit, nomor registrasi, dan lokasi breakdown</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                                    wo.tipe_wo === 'BREAKDOWN' 
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' 
                                        : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                }`}>
                                    {wo.tipe_wo || 'BREAKDOWN'}
                                </span>
                            </div>

                            {/* Structured 2-Column Specs Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Nomor Work Order</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate">{wo.no_wo || '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Tipe Work Order</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{wo.tipe_wo || 'BREAKDOWN'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Kode Unit</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 truncate">{wo.unit?.code_unit || '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Model Unit</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{wo.unit?.model || '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Current HM Unit</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{wo.hm_unit != null ? `${wo.hm_unit} H` : '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">HM Saat Breakdown</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{wo.hm_bd != null ? `${wo.hm_bd} H` : '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Site / Lokasi</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{wo.site || 'Harindo Wahana'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Downtime Code</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{wo.downtime_code || 'Opportunity'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Dibuat Oleh</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate">{wo.created_by || wo.request_by || wo.planner || '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Tanggal Breakdown</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {wo.waktu_breakdown 
                                            ? new Date(wo.waktu_breakdown).toLocaleDateString('id-ID') 
                                            : (wo.request_date ? new Date(wo.request_date).toLocaleDateString('id-ID') : '-')}
                                    </span>
                                </div>
                            </div>

                            {/* Component & System Ribbon Badge */}
                            {(wo.component || wo.component_model || wo.component_sn) && (
                                <div className="mt-4 p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-lg">⚙️</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">KOMPONEN & SISTEM =</span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{wo.component || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        {wo.component_model && (
                                            <div>
                                                <span className="text-slate-400 mr-1 text-[11px]">Model:</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{wo.component_model}</span>
                                            </div>
                                        )}
                                        {wo.component_sn && (
                                            <div>
                                                <span className="text-slate-400 mr-1 text-[11px]">SN:</span>
                                                <span className="font-semibold font-mono text-slate-700 dark:text-slate-200">{wo.component_sn}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Card 2: Waktu Breakdown & Durasi Downtime (Polosan seperti Card 1) ── */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                                        ⏱️
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                                            Waktu Breakdown & Durasi Downtime
                                        </h3>
                                        <p className="text-[11px] text-slate-400">Pencatatan waktu kejadian breakdown, jam ready (RFU), dan total downtime unit</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                                    wo.waktu_rfu 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {wo.waktu_rfu ? 'RFU SELESAI' : 'BREAKDOWN AKTIF'}
                                </span>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Jam Breakdown</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {wo.waktu_breakdown ? new Date(wo.waktu_breakdown).toLocaleString('id-ID') : '-'}
                                    </span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">HM Saat Breakdown</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{wo.hm_bd != null ? `${wo.hm_bd} H` : '-'}</span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">Jam Ready (RFU)</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className={`font-bold truncate ${wo.waktu_rfu ? 'text-slate-800 dark:text-slate-200' : 'text-amber-600 dark:text-amber-400 italic'}`}>
                                        {wo.waktu_rfu ? new Date(wo.waktu_rfu).toLocaleString('id-ID') : 'Belum Selesai (Sedang Dikerjakan)'}
                                    </span>
                                </div>
                                <div className="flex items-center p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-40 sm:w-48 shrink-0">HM Saat Ready (RFU)</span>
                                    <span className="text-slate-400 font-bold mx-2">=</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{wo.hm_rfu != null ? `${wo.hm_rfu} H` : '-'}</span>
                                </div>
                                <div className="flex items-center p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 sm:col-span-2">
                                    <div className="flex items-center gap-2 w-40 sm:w-48 shrink-0">
                                        <span className="text-sm">⚡</span>
                                        <span className="text-emerald-800 dark:text-emerald-300 font-bold">Total Durasi Breakdown</span>
                                    </div>
                                    <span className="text-emerald-600 font-bold mx-2">=</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-300">
                                            {getBreakdownDurationNumber()} Jam
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                            wo.waktu_rfu ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                        }`}>
                                            {wo.waktu_rfu ? 'Selesai' : 'Berjalan'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Problem Description Card ───────────────────────────── */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5">
                            <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                Problem Description / Gejala Kerusakan
                            </div>
                            <div className="w-full bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl text-sm text-slate-800 dark:text-slate-100 p-4 font-bold whitespace-pre-wrap leading-relaxed shadow-inner">
                                {wo.problem || wo.failure_description || <span className="text-slate-400 font-normal italic">Tidak ada deskripsi kerusakan yang dicatat.</span>}
                            </div>
                        </div>

                        {/* ── Task List Enterprise Table Card ────────────────────── */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                            {/* Table Header Bar */}
                            <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">📋</span>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                                        Daftar Task & Tindakan Mekanik
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                                        {wo.tasks?.length || 0} Task
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                    Rincian pekerjaan mekanik, waktu kerja, dan status progres
                                </span>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                     <thead className="bg-slate-100/75 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
                                         <tr>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-14 text-center">TASK</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase min-w-[260px]">PROBLEM</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-16 text-center">SUB TASK</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase min-w-[260px]">ACTIVITY PROGRESS</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-48">DATE</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-56">DOWN STATUS</th>
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-36">PIC</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                         {wo.tasks && wo.tasks.length > 0 ? (
                                             wo.tasks.map((task, i) => {
                                                 const badge = getStatusBadge(task.status);
                                                 return (
                                                     <tr key={task.id || i} className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/40 transition-colors align-top">
                                                         {/* TASK - auto badge */}
                                                         <td className="py-3.5 px-3 text-center w-16">
                                                             <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-base font-black border-2 border-emerald-300 dark:border-emerald-700">
                                                                 {i + 1}
                                                             </span>
                                                         </td>
                                                         {/* PROBLEM */}
                                                         <td className="py-3.5 px-4 min-w-[240px]">
                                                             <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                                                                 {task.problem || <span className="text-slate-400 italic text-xs">-</span>}
                                                             </p>
                                                         </td>
                                                         {/* SUB TASK - auto badge (moved between PROBLEM and ACTIVITY PROGRESS) */}
                                                         <td className="py-3.5 px-4 text-center w-20">
                                                             <span className="inline-flex items-center justify-center w-10 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-black border border-slate-300 dark:border-slate-600">
                                                                 {i + 1}.{i + 1}
                                                             </span>
                                                         </td>
                                                         {/* ACTIVITY PROGRESS */}
                                                         <td className="py-3 px-3 min-w-[260px]">
                                                             <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                                 {task.activity_progress || <span className="text-slate-400 italic text-xs">-</span>}
                                                             </p>
                                                         </td>
                                                         {/* DATE */}
                                                         <td className="py-3.5 px-4 text-xs">
                                                             {(task.start_date || task.end_date || (task.downtime_hrs && parseFloat(task.downtime_hrs) > 0)) ? (
                                                                 <div className="space-y-1">
                                                                     {task.start_date && (
                                                                         <div className="flex items-center gap-1.5">
                                                                             <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] shrink-0">Awal</span>
                                                                             <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                                                 {new Date(task.start_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                                             </span>
                                                                         </div>
                                                                     )}
                                                                     {task.end_date && (
                                                                         <div className="flex items-center gap-1.5">
                                                                             <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] shrink-0">Akhir</span>
                                                                             <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                                                 {new Date(task.end_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                                             </span>
                                                                         </div>
                                                                     )}
                                                                     {task.downtime_hrs && parseFloat(task.downtime_hrs) > 0 && (
                                                                         <div className="flex items-center gap-1.5">
                                                                             <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] shrink-0">Downtime</span>
                                                                             <span className="font-black text-amber-900 dark:text-amber-300 font-mono">
                                                                                 {parseFloat(task.downtime_hrs)} Jam
                                                                             </span>
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                             ) : (
                                                                 task.target_date ? new Date(task.target_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'
                                                             )}
                                                         </td>
                                                         {/* Down Status */}
                                                         <td className="py-3.5 px-4 text-xs font-semibold">
                                                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                                                 <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                                 <span>{formatDownStatus(task.status)}</span>
                                                             </span>
                                                         </td>
                                                         {/* PIC */}
                                                         <td className="py-3.5 px-4">
                                                             <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                 <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-bold border border-slate-200">
                                                                     👷
                                                                 </span>
                                                                 <span className="truncate">{task.mechanic || '-'}</span>
                                                             </div>
                                                         </td>
                                                     </tr>
                                                 );
                                             })
                                         ) : (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                                                    Belum ada task pekerjaan yang dicatat untuk Work Order ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'parts':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Kebutuhan Part & Material</h3>
                                <p className="text-xs text-slate-400">Daftar suku cadang yang diminta atau digunakan untuk pengerjaan WO ini</p>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                                <span>+</span> Request Part Baru
                            </button>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Part Number</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Description</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase text-center">Qty Request</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase text-center">Qty Used</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {wo.parts && wo.parts.length > 0 ? (
                                        wo.parts.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white">{p.part_number}</td>
                                                <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">{p.description}</td>
                                                <td className="py-3 px-4 text-xs text-center font-mono font-bold">{p.qty_request}</td>
                                                <td className="py-3 px-4 text-xs text-center font-mono font-bold">{p.qty_used}</td>
                                                <td className="py-3 px-4 text-xs">
                                                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                                                        {p.status || 'ORDERED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-xs italic">Belum ada permintaan part untuk Work Order ini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'manpower':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Penugasan Manpower / Mekanik</h3>
                                <p className="text-xs text-slate-400">Daftar mekanik dan pencatatan man-hours pekerjaan</p>
                            </div>
                            <button className="bg-[#0b6e4f] hover:bg-[#095940] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                                <span>+</span> Tugaskan Mekanik
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {wo.manpowers && wo.manpowers.length > 0 ? (
                                wo.manpowers.map(m => (
                                    <div key={m.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/50 transition">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-bold">
                                            <UserIcon />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{m.mechanic}</div>
                                            <div className="text-xs text-slate-500 mt-1">Start: {m.start ? new Date(m.start).toLocaleString('id-ID') : '-'}</div>
                                            <div className="text-xs text-slate-500">Finish: {m.finish ? new Date(m.finish).toLocaleString('id-ID') : '-'}</div>
                                            <div className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold">
                                                Total: {m.man_hours || 0} Man-Hrs
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                                    Belum ada mekanik yang ditugaskan secara terpisah.
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'vendor':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Pekerjaan External / Vendor</h3>
                                <p className="text-xs text-slate-400">Pekerjaan yang dikerjakan oleh pihak ketiga atau bengkel luar</p>
                            </div>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Vendor Name</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Date Send</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">JWO Number</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Vendor Cost</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Warranty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {wo.vendors && wo.vendors.length > 0 ? (
                                        wo.vendors.map(v => (
                                            <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3 px-4 text-xs font-bold text-slate-900 dark:text-white">{v.vendor_name || '-'}</td>
                                                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">{v.date_send ? new Date(v.date_send).toLocaleDateString('id-ID') : '-'}</td>
                                                <td className="py-3 px-4 text-xs font-mono">{v.jwo || '-'}</td>
                                                <td className="py-3 px-4 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {v.vendor_cost ? `Rp ${Number(v.vendor_cost).toLocaleString('id-ID')}` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-xs">{v.warranty || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-xs italic">Tidak ada pekerjaan vendor untuk Work Order ini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'warranty':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Klaim Garansi / Warranty Claim</h3>
                            <p className="text-xs text-slate-400">Pencatatan klaim garansi terkait kerusakan unit ini</p>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">WC Number</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Problem</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Vendor</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {wo.warranties && wo.warranties.length > 0 ? (
                                        wo.warranties.map(w => (
                                            <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white">{w.wc_number}</td>
                                                <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">{w.problem}</td>
                                                <td className="py-3 px-4 text-xs">{w.vendor || '-'}</td>
                                                <td className="py-3 px-4 text-xs">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-bold uppercase">{w.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-xs italic">Tidak ada data klaim garansi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Riwayat Perubahan Status</h3>
                            <p className="text-xs text-slate-400">Catatan audit jejak status Work Order dari awal hingga selesai</p>
                        </div>
                        <div className="space-y-3">
                            {wo.statusHistories && wo.statusHistories.length > 0 ? (
                                wo.statusHistories.map(h => (
                                    <div key={h.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                📜
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{h.status_from || 'START'}</span>
                                                    <span>➔</span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-black">{h.status_to}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Oleh: {h.changed_by || 'System'}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-slate-500">
                                            {new Date(h.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                                    Belum ada catatan riwayat perubahan status.
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div className="py-6 text-center text-slate-400 italic">This module is currently under development.</div>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Work Order ${wo.no_wo}`} />

            <div className="bg-slate-50/70 dark:bg-slate-950 min-h-screen pb-12 flex flex-col font-sans">
                
                {/* ── Executive Command Header Bar ────────────────────────────── */}
                <div className="bg-white dark:bg-[#060b14] px-4 lg:px-8 py-4 shadow-xs border-b border-slate-200/90 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3.5">
                        <Link 
                            href="/work-orders" 
                            className="w-9 h-9 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                        </Link>
                        <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{wo.no_wo}</h1>
                                

                                {/* Status WO Badge */}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                    (wo.status_pengerjaan === 'CLOSED' || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                        : wo.status_pengerjaan === 'DRAFT'
                                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        (wo.status_pengerjaan === 'CLOSED' || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED') 
                                            ? 'bg-emerald-500' 
                                            : wo.status_pengerjaan === 'DRAFT'
                                            ? 'bg-slate-400'
                                            : 'bg-blue-500 animate-pulse'
                                    }`} />
                                    <span>{wo.status_pengerjaan || 'DRAFT'}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {wo.unit?.code_unit && <><span className="font-bold text-slate-700 dark:text-slate-200">{wo.unit.code_unit}</span> &bull; </>}
                                <span>{wo.tipe_wo}</span>
                                <span>&bull;</span>
                                <span>Dibuat {new Date(wo.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                    </div>

                    {/* Quick Action Button Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Select Dropdown */}
                        <div className="relative">
                            <select
                                value={wo.status_pengerjaan || 'DRAFT'}
                                onChange={(e) => {
                                    router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: e.target.value }, {
                                        preserveScroll: true,
                                    });
                                }}
                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="DRAFT">Status: DRAFT</option>
                                <option value="OPEN">Status: OPEN</option>
                                <option value="CLOSED">Status: CLOSED</option>
                            </select>
                        </div>

                        {/* Print Button */}
                        <button 
                            type="button"
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-lg shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                            <PrinterIcon /> Print WO
                        </button>

                        {/* Edit Button */}
                        <button 
                            type="button"
                            onClick={() => router.visit(`/work-orders/${wo.id}/edit`)}
                            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3.5 py-2 rounded-lg shadow-xs text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition cursor-pointer"
                        >
                            <EditIcon /> Edit WO
                        </button>

                        {/* Delete Button */}
                        <button 
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 px-3.5 py-2 rounded-lg shadow-xs text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition cursor-pointer"
                        >
                            <TrashIcon /> Hapus WO
                        </button>

                        {/* Close or Reopen WO button */}
                        {(wo.status_pengerjaan === 'CLOSED' || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED') ? (
                            <button 
                                type="button"
                                onClick={() => router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: 'OPEN' })}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-xs text-xs font-extrabold tracking-wide transition cursor-pointer flex items-center gap-1.5"
                            >
                                <span>🔄 Reopen WO</span>
                            </button>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: 'CLOSED' })}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-xs text-xs font-extrabold tracking-wide transition cursor-pointer flex items-center gap-1.5"
                            >
                                <CheckCircleIcon /> Close WO
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Main Content Area ──────────────────────────────────────── */}
                <div
                    className="px-4 lg:px-8 py-6 w-full flex-1"
                    onDoubleClick={() => router.visit(`/work-orders/${wo.id}/edit`)}
                    title="Double klik untuk edit WO"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        
                        {/* Executive Pill Tabs Navbar */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 px-4 pt-2.5 gap-1.5 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        activeTab === tab.id 
                                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border-t-2 border-emerald-600' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                            activeTab === tab.id
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Display */}
                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
