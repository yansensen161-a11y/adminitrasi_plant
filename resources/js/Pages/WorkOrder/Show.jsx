import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

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
    if (!val) return 'B0 - ON PROGRESS';
    const s = String(val).toUpperCase();
    if (s.includes('B10')) return 'B10 - WAITING RAIN / SLIPPERY CONDITION';
    if (s.includes('B9')) return 'B9 - WAITING ACCESS';
    if (s.includes('B0')) return 'B0 - ON PROGRESS';
    if (s.includes('B1')) return 'B1 - WAITING PARTS';
    if (s.includes('B2')) return 'B2 - WAITING SARANA';
    if (s.includes('B3')) return 'B3 - WAITING TOOLS';
    if (s.includes('B4')) return 'B4 - WAITING MAN POWER';
    if (s.includes('B5')) return 'B5 - OUTSIDE / DEALER';
    if (s.includes('B6')) return 'B6 - PRODUCTION / ABUSE';
    if (s.includes('B7')) return 'B7 - WAITING DECISION PLANT';
    if (s.includes('B8')) return 'B8 - WAITING DECISION HO';
    return val;
};

export default function Show({ workOrder, unitOrders = [] }) {
    const [activeTab, setActiveTab] = useState('master');
    const wo = workOrder;

    // Monitoring Orderan Selection State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedParts, setSelectedParts] = useState({}); // { [part_id]: partObject }
    const [updateDownStatus, setUpdateDownStatus] = useState(!wo.downtime_code?.includes('B1'));
    const [searchOrderQuery, setSearchOrderQuery] = useState('');
    const [onlyThisUnit, setOnlyThisUnit] = useState(true);
    const [searchingOrders, setSearchingOrders] = useState(false);
    const [remoteOrders, setRemoteOrders] = useState(null);
    const [submittingParts, setSubmittingParts] = useState(false);

    // Manual Part State
    const [showManualPartModal, setShowManualPartModal] = useState(false);
    const [manualPartData, setManualPartData] = useState({
        part_number: '',
        description: '',
        qty_request: 1,
        qty_used: 0,
        status: 'REQUESTED',
        no_order: '',
        pr: '',
        po: '',
        eta_part: '',
    });
    const [submittingManualPart, setSubmittingManualPart] = useState(false);

    // Debounced search for monitoring orderan
    useEffect(() => {
        if (!showOrderModal) return;

        const timer = setTimeout(async () => {
            if (onlyThisUnit && searchOrderQuery.trim() === '') {
                setRemoteOrders(null);
                return;
            }

            setSearchingOrders(true);
            try {
                const params = new URLSearchParams();
                if (searchOrderQuery.trim()) params.append('q', searchOrderQuery.trim());
                if (onlyThisUnit && wo.unit_id) params.append('unit_id', wo.unit_id);

                const res = await axios.get(`/work-orders/${wo.id}/search-monitoring-orders?${params.toString()}`);
                setRemoteOrders(res.data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setSearchingOrders(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [showOrderModal, searchOrderQuery, onlyThisUnit, wo.id, wo.unit_id]);

    const displayedOrders = useMemo(() => {
        if (remoteOrders !== null) return remoteOrders;
        if (!unitOrders) return [];
        if (!searchOrderQuery.trim()) return unitOrders;

        const q = searchOrderQuery.toLowerCase();
        return unitOrders.filter(o =>
            o.no_order?.toLowerCase().includes(q) ||
            o.component?.toLowerCase().includes(q) ||
            o.component_name?.toLowerCase().includes(q) ||
            o.root_cause?.toLowerCase().includes(q) ||
            o.parts?.some(p =>
                p.part_number?.toLowerCase().includes(q) ||
                p.department?.toLowerCase().includes(q) ||
                p.pr?.toLowerCase().includes(q)
            )
        );
    }, [remoteOrders, unitOrders, searchOrderQuery]);

    const toggleOrderSelection = (order) => {
        if (!order || !order.parts || order.parts.length === 0) return;

        const allSelected = order.parts.every(p => !!selectedParts[p.id]);

        setSelectedParts(prev => {
            const next = { ...prev };
            if (allSelected) {
                order.parts.forEach(p => {
                    delete next[p.id];
                });
            } else {
                order.parts.forEach(p => {
                    next[p.id] = {
                        maintenance_order_part_id: p.id,
                        no_order: order.no_order,
                        part_number: p.part_number || '',
                        description: p.department || p.component || order.component_name || order.component || 'Part Suku Cadang',
                        qty_request: Number(p.qty) || 1,
                        qty_used: 0,
                        pr: p.pr || '',
                        po: p.po || '',
                        eta_part: p.due_date_part || '',
                        status: order.status === 'CLOSED' ? 'RECEIVED' : (order.status || 'ORDERED'),
                    };
                });
                setSelectedOrder(order);
            }
            return next;
        });
    };

    const togglePartSelection = (order, part) => {
        setSelectedParts(prev => {
            const next = { ...prev };
            if (next[part.id]) {
                delete next[part.id];
            } else {
                next[part.id] = {
                    maintenance_order_part_id: part.id,
                    no_order: order.no_order,
                    part_number: part.part_number || '',
                    description: part.department || part.component || order.component_name || order.component || 'Part Suku Cadang',
                    qty_request: Number(part.qty) || 1,
                    qty_used: 0,
                    pr: part.pr || '',
                    po: part.po || '',
                    eta_part: part.due_date_part || '',
                    status: order.status === 'CLOSED' ? 'RECEIVED' : (order.status || 'ORDERED'),
                };
                setSelectedOrder(order);
            }
            return next;
        });
    };

    const handleAttachParts = () => {
        const partsList = Object.values(selectedParts);
        if (partsList.length === 0) {
            alert('Silakan pilih minimal 1 part untuk ditambahkan ke Work Order.');
            return;
        }

        setSubmittingParts(true);
        router.post(
            `/work-orders/${wo.id}/attach-order-parts`,
            {
                order_id: selectedOrder?.id || null,
                no_order: selectedOrder?.no_order || (partsList[0]?.no_order || null),
                parts: partsList,
                update_down_status: updateDownStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowOrderModal(false);
                    setSelectedParts({});
                    setSelectedOrder(null);
                    setSubmittingParts(false);
                },
                onError: (err) => {
                    console.error('Error attaching parts:', err);
                    alert('Gagal menambahkan part: ' + (Object.values(err)[0] || 'Terjadi kesalahan'));
                    setSubmittingParts(false);
                },
            }
        );
    };

    const handleDeletePart = (part) => {
        if (window.confirm(`Hapus part ${part.part_number || part.description || 'ini'} dari Work Order?`)) {
            router.delete(`/work-orders/${wo.id}/parts/${part.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleCreateManualPart = (e) => {
        e.preventDefault();
        if (!manualPartData.description) {
            alert('Deskripsi part wajib diisi.');
            return;
        }

        setSubmittingManualPart(true);
        router.post(
            `/work-orders/${wo.id}/parts`,
            manualPartData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowManualPartModal(false);
                    setManualPartData({
                        part_number: '',
                        description: '',
                        qty_request: 1,
                        qty_used: 0,
                        status: 'REQUESTED',
                        no_order: '',
                        pr: '',
                        po: '',
                        eta_part: '',
                    });
                    setSubmittingManualPart(false);
                },
                onError: (err) => {
                    console.error('Error creating part:', err);
                    setSubmittingManualPart(false);
                },
            }
        );
    };

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

    const totalPekerjaan = useMemo(() => {
        const total = (wo.tasks || []).reduce((sum, t) => {
            const val = parseFloat(t.downtime_hrs);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
        return Math.round(total * 10) / 10;
    }, [wo.tasks]);

    const delayHours = useMemo(() => {
        if (wo.delay != null && parseFloat(wo.delay) > 0) {
            return parseFloat(wo.delay);
        }
        const dt = parseFloat(wo.durasi_hrs) || 0;
        const diff = Math.round((dt - totalPekerjaan) * 10) / 10;
        return diff > 0 ? diff : 0;
    }, [wo.delay, wo.durasi_hrs, totalPekerjaan]);

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

                            {/* Card Integrasi Tyre Management */}
                            {((wo.status_wo && wo.status_wo.toUpperCase().includes('TYRE')) || wo.component === 'TYRE' || (wo.problem && wo.problem.toUpperCase().includes('TYRE'))) && (
                                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border border-emerald-300 dark:border-emerald-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#0b6e4f] text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
                                            🛞
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2 flex-wrap">
                                                <span>Integrasi Tyre Management & Penggantian Ban</span>
                                                {wo.unit?.code_unit && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/90 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-mono text-[11px] font-black">
                                                        {wo.unit.code_unit}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                {wo.problem ? wo.problem : 'Pekerjaan Tyre tercatat pada unit ini dan terhubung ke menu manajemen Tyre.'}
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={wo.unit_id ? `/tyres?unit_id=${wo.unit_id}` : '/tyres'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-[#0b6e4f] hover:bg-[#095940] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                                    >
                                        <span>🛞</span>
                                        <span>Buka Menu /tyres ({wo.unit?.code_unit || 'Unit'}) ↗</span>
                                    </a>
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
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:col-span-2">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">⚡</span>
                                            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Total Downtime</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-300">
                                                {getBreakdownDurationNumber()} Jam
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">🔧</span>
                                            <span className="text-blue-800 dark:text-blue-300 font-bold">Total Pekerjaan</span>
                                        </div>
                                        <span className="font-mono text-base font-black text-blue-700 dark:text-blue-300">
                                            {totalPekerjaan} Jam
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">⏱️</span>
                                            <span className="text-rose-800 dark:text-rose-300 font-bold">Delay</span>
                                        </div>
                                        <span className="font-mono text-base font-black text-rose-700 dark:text-rose-300">
                                            {delayHours} Jam
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
                                             <th className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-48">COMPONENT GROUP</th>
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
                                                         {/* COMPONENT GROUP */}
                                                         <td className="py-3.5 px-3 w-48">
                                                             <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                                 {task.group_component || task.component || '-'}
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
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <span>Kebutuhan Part & Material</span>
                                    {wo.parts && wo.parts.length > 0 && (
                                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                                            {wo.parts.length} item
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-400">Daftar suku cadang yang diminta atau digunakan untuk pengerjaan Work Order ini</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Tombol Pilih Order dari Monitoring Orderan */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOrderModal(true);
                                        setOnlyThisUnit(true);
                                        setSearchOrderQuery('');
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                    title="Pilih dan hubungkan order sparepart dari Monitoring Orderan"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                    <span>Pilih Order dari Monitoring Orderan</span>
                                </button>

                                {/* Tombol Request Part Baru (buka form order baru) */}
                                <a
                                    href={`/monitoring-orderan/create?unit_id=${encodeURIComponent(wo.unit_id || '')}&code_unit=${encodeURIComponent(wo.unit?.code_unit || '')}&hm=${encodeURIComponent(wo.hm_unit || wo.hm_bd || '')}&no_wo=${encodeURIComponent(wo.no_wo || '')}&component=${encodeURIComponent(wo.component || wo.component_group || '')}&finding=${encodeURIComponent(wo.problem || '')}&action=${encodeURIComponent(wo.keterangan || '')}&priority=${encodeURIComponent(wo.priority || 'P2')}&return_to=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                    title="Buat orderan sparepart baru di Monitoring Orderan"
                                >
                                    <span className="text-base leading-none font-bold">+</span>
                                    <span>Request Part Baru</span>
                                </a>

                                {/* Tombol Tambah Manual */}
                                <button
                                    type="button"
                                    onClick={() => setShowManualPartModal(true)}
                                    className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>+ Manual</span>
                                </button>
                            </div>
                        </div>

                        {/* Table Display */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">No Order</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Part Number</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Description</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase text-center">Qty Request</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase text-center">Qty Used</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">PR / PO</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">ETA Part</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {wo.parts && wo.parts.length > 0 ? (
                                            wo.parts.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 px-4 text-xs font-semibold">
                                                        {p.no_order ? (
                                                            <a
                                                                href={`/monitoring-orderan?search=${encodeURIComponent(p.no_order)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                                title="Buka detail di Monitoring Orderan"
                                                            >
                                                                <span>{p.no_order}</span>
                                                                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Manual</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white">
                                                        {p.part_number || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                                        {p.description || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-center font-mono font-bold">
                                                        {p.qty_request}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-center font-mono font-bold">
                                                        {p.qty_used}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                                                        <div className="flex flex-col gap-0.5">
                                                            {p.pr && <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">PR: {p.pr}</span>}
                                                            {p.po && <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">PO: {p.po}</span>}
                                                            {!p.pr && !p.po && <span className="text-slate-400">-</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                                                        {p.eta_part || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs">
                                                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold uppercase whitespace-nowrap">
                                                            {p.status || 'ORDERED'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePart(p)}
                                                            className="text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition cursor-pointer"
                                                            title="Hapus part dari Work Order"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="py-12 text-center text-slate-400 text-xs">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <span className="text-3xl">📦</span>
                                                        <span className="font-semibold text-slate-600 dark:text-slate-300">Belum ada permintaan part untuk Work Order ini.</span>
                                                        <span className="text-slate-400 text-[11px]">Silakan pilih orderan yang sudah ada dari Monitoring Orderan atau buat order baru.</span>
                                                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowOrderModal(true);
                                                                    setOnlyThisUnit(true);
                                                                }}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                                                            >
                                                                Pilih dari Monitoring Orderan
                                                            </button>
                                                            <a
                                                                href={`/monitoring-orderan/create?unit_id=${encodeURIComponent(wo.unit_id || '')}&code_unit=${encodeURIComponent(wo.unit?.code_unit || '')}&hm=${encodeURIComponent(wo.hm_unit || wo.hm_bd || '')}&no_wo=${encodeURIComponent(wo.no_wo || '')}&component=${encodeURIComponent(wo.component || wo.component_group || '')}&finding=${encodeURIComponent(wo.problem || '')}&action=${encodeURIComponent(wo.keterangan || '')}&priority=${encodeURIComponent(wo.priority || 'P2')}&return_to=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                                                            >
                                                                + Request Part Baru
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                                    (wo.status_pengerjaan === 'CLOSED' || wo.status_pengerjaan?.includes('COMPLETED') || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                        : (wo.status_pengerjaan === 'DRAFT' || wo.status_pengerjaan?.includes('PLANNING'))
                                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        (wo.status_pengerjaan === 'CLOSED' || wo.status_pengerjaan?.includes('COMPLETED') || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED') 
                                            ? 'bg-emerald-500' 
                                            : (wo.status_pengerjaan === 'DRAFT' || wo.status_pengerjaan?.includes('PLANNING'))
                                            ? 'bg-slate-400'
                                            : 'bg-blue-500 animate-pulse'
                                    }`} />
                                    <span>{wo.status_pengerjaan || 'PLANNING - PERENCANAAN PEKERJAAN'}</span>
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
                                value={wo.status_pengerjaan || 'PLANNING - PERENCANAAN PEKERJAAN'}
                                onChange={(e) => {
                                    router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: e.target.value }, {
                                        preserveScroll: true,
                                    });
                                }}
                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="PLANNING - PERENCANAAN PEKERJAAN">PLANNING - PERENCANAAN PEKERJAAN</option>
                                <option value="IN PROGRESS - SEDANG DIKERJAKAN">IN PROGRESS - SEDANG DIKERJAKAN</option>
                                <option value="COMPLETED - PEKERJAAN SELESAI">COMPLETED - PEKERJAAN SELESAI</option>
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
                        {(wo.status_pengerjaan === 'CLOSED' || wo.status_pengerjaan?.includes('COMPLETED') || wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED') ? (
                            <button 
                                type="button"
                                onClick={() => router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: 'IN PROGRESS - SEDANG DIKERJAKAN' })}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-xs text-xs font-extrabold tracking-wide transition cursor-pointer flex items-center gap-1.5"
                            >
                                <span>🔄 Reopen WO</span>
                            </button>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => router.patch(`/work-orders/${wo.id}/status`, { status_pengerjaan: 'COMPLETED - PEKERJAAN SELESAI' })}
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

            {/* ── Modal: Pilih Order dari Monitoring Orderan ──────────────── */}
            {showOrderModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        Pilih Order dari Monitoring Orderan
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                                        Pilih pesanan sparepart untuk dihubungkan ke Work Order ini ({wo.no_wo})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOrderModal(false);
                                    setSelectedParts({});
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Search & Unit Filter Controls */}
                        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                            <div className="relative flex-1">
                                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    value={searchOrderQuery}
                                    onChange={(e) => setSearchOrderQuery(e.target.value)}
                                    placeholder="Cari No Order (HW-MOL-...), Part Number, Deskripsi..."
                                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {searchOrderQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchOrderQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setOnlyThisUnit(true)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                                        onlyThisUnit 
                                            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Unit Ini ({wo.unit?.code_unit || 'Unit'})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOnlyThisUnit(false)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                                        !onlyThisUnit 
                                            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Semua Unit
                                </button>
                            </div>
                        </div>

                        {/* Order List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                            {searchingOrders ? (
                                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs">Mencari orderan di Monitoring Orderan...</span>
                                </div>
                            ) : displayedOrders.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada orderan ditemukan.</p>
                                    <p className="text-slate-400 max-w-sm mx-auto">
                                        {onlyThisUnit 
                                            ? `Belum ada pesanan sparepart tercatat untuk unit ${wo.unit?.code_unit || ''}. Coba klik opsi "Semua Unit" atau buat pesanan baru via "Request Part Baru".` 
                                            : 'Tidak ditemukan orderan yang cocok dengan kriteria pencarian.'}
                                    </p>
                                </div>
                            ) : (
                                displayedOrders.map(order => {
                                    const orderParts = order.parts || [];
                                    const isAllSelected = orderParts.length > 0 && orderParts.every(p => !!selectedParts[p.id]);
                                    const someSelected = orderParts.some(p => !!selectedParts[p.id]);

                                    return (
                                        <div
                                            key={order.id}
                                            className={`border rounded-xl transition-all overflow-hidden ${
                                                isAllSelected
                                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                                                    : someSelected
                                                    ? 'border-emerald-400/60 bg-white dark:bg-slate-900'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            {/* Order Card Header */}
                                            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-start sm:items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOrderSelection(order)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition cursor-pointer mt-0.5 sm:mt-0 ${
                                                            isAllSelected
                                                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                : someSelected
                                                                ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                                                                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                                                        }`}
                                                        title={isAllSelected ? 'Batalkan pilihan order ini' : 'Pilih seluruh part di order ini'}
                                                    >
                                                        {isAllSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        {!isAllSelected && someSelected && <span className="block w-2 h-0.5 bg-emerald-700"></span>}
                                                    </button>

                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                                                                {order.no_order}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px]">
                                                                {order.unit?.code_unit || wo.unit?.code_unit || '-'}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">
                                                                📅 {order.tanggal ? new Date(order.tanggal).toLocaleDateString('id-ID') : '-'}
                                                            </span>
                                                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                                {order.status || 'OPEN'}
                                                            </span>
                                                            {order.component && (
                                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium">
                                                                    {order.component}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(order.component_name || order.root_cause || order.action_taken) && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                                {order.component_name ? `${order.component_name} • ` : ''}
                                                                {order.root_cause || order.action_taken}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOrderSelection(order)}
                                                        className={`text-xs px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                                                            isAllSelected
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {isAllSelected ? '✓ Terpilih' : '+ Pilih Semua Part'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Order Parts List */}
                                            <div className="p-3 bg-white dark:bg-slate-900">
                                                {orderParts.length === 0 ? (
                                                    <div className="py-2 text-center text-slate-400 text-xs italic">
                                                        Order ini belum memiliki daftar suku cadang.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {orderParts.map(part => {
                                                            const isPartSelected = !!selectedParts[part.id];
                                                            return (
                                                                <div
                                                                    key={part.id}
                                                                    onClick={() => togglePartSelection(order, part)}
                                                                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                                                                        isPartSelected
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isPartSelected}
                                                                            onChange={() => {}} // handled by parent onClick
                                                                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                                        />
                                                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                                            {part.part_number || '(No Part Number)'}
                                                                        </span>
                                                                        <span className="text-slate-600 dark:text-slate-300 truncate">
                                                                            {part.department || part.component || order.component_name || '-'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[11px]">
                                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                            Qty: {part.qty || 1}
                                                                        </span>
                                                                        {part.pr && <span className="font-mono text-blue-600 dark:text-blue-400">PR: {part.pr}</span>}
                                                                        {part.po && <span className="font-mono text-emerald-600 dark:text-emerald-400">PO: {part.po}</span>}
                                                                        {part.due_date_part && <span>ETA: {part.due_date_part}</span>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {Object.keys(selectedParts).length} part dipilih
                                </span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={updateDownStatus}
                                        onChange={(e) => setUpdateDownStatus(e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>Perbarui status WO ke "B1 - WAITING PARTS"</span>
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setSelectedParts({});
                                    }}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAttachParts}
                                    disabled={submittingParts || Object.keys(selectedParts).length === 0}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {submittingParts ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Hubungkan & Terapkan ke WO</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Tambah Part Manual ──────────────────────────────── */}
            {showManualPartModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Tambah Part Manual
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowManualPartModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateManualPart} className="p-6 space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Part Number
                                </label>
                                <input
                                    type="text"
                                    value={manualPartData.part_number}
                                    onChange={(e) => setManualPartData(prev => ({ ...prev, part_number: e.target.value }))}
                                    placeholder="Contoh: 14X-27-11531"
                                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Nama Part <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={manualPartData.description}
                                    onChange={(e) => setManualPartData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Contoh: BEARING PLANETARY"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Qty Request
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0.01"
                                        value={manualPartData.qty_request}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, qty_request: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        No Order (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={manualPartData.no_order}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, no_order: e.target.value }))}
                                        placeholder="HW-MOL-..."
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        PR
                                    </label>
                                    <input
                                        type="text"
                                        value={manualPartData.pr}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, pr: e.target.value }))}
                                        placeholder="PR.HW..."
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        PO
                                    </label>
                                    <input
                                        type="text"
                                        value={manualPartData.po}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, po: e.target.value }))}
                                        placeholder="PO.HW..."
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        ETA Part
                                    </label>
                                    <input
                                        type="text"
                                        value={manualPartData.eta_part}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, eta_part: e.target.value }))}
                                        placeholder="YYYY-MM-DD"
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={manualPartData.status}
                                        onChange={(e) => setManualPartData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    >
                                        <option value="REQUESTED">REQUESTED</option>
                                        <option value="ORDERED">ORDERED</option>
                                        <option value="WAITING PART">WAITING PART</option>
                                        <option value="RECEIVED">RECEIVED</option>
                                        <option value="USED">USED</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowManualPartModal(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingManualPart}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                                >
                                    {submittingManualPart ? 'Menyimpan...' : 'Simpan Part'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
