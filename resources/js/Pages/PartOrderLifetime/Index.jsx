import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Index({ records, filters = {}, metrics = {}, statuses = [], units = [] }) {
    const { auth } = usePage().props;

    // Filter states
    const [filterUnit, setFilterUnit] = useState(filters.unit || '');
    const [filterPartNumber, setFilterPartNumber] = useState(filters.part_number || '');
    const [filterNoOrder, setFilterNoOrder] = useState(filters.no_order || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'ALL');
    const [filterIndicator, setFilterIndicator] = useState(filters.indicator || 'ALL');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [installItem, setInstallItem] = useState(null);
    const [replaceItem, setReplaceItem] = useState(null);
    const [timelineItem, setTimelineItem] = useState(null);
    const [timelineData, setTimelineData] = useState(null);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    // Apply filters
    const applyFilters = (newFilters = {}) => {
        const query = {
            unit: filterUnit,
            part_number: filterPartNumber,
            no_order: filterNoOrder,
            status: filterStatus,
            indicator: filterIndicator,
            ...newFilters,
        };

        Object.keys(query).forEach(k => {
            if (!query[k] || query[k] === 'ALL') delete query[k];
        });

        router.get(route('part-order-lifetime.index'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setFilterUnit('');
        setFilterPartNumber('');
        setFilterNoOrder('');
        setFilterStatus('ALL');
        setFilterIndicator('ALL');
        router.get(route('part-order-lifetime.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Load timeline
    const openTimeline = async (record) => {
        setTimelineItem(record);
        setLoadingTimeline(true);
        try {
            const res = await axios.get(route('part-order-lifetime.timeline'), {
                params: {
                    unit_id: record.unit_id,
                    unit_code: record.unit_code,
                    part_number: record.part_number,
                }
            });
            setTimelineData(res.data);
        } catch (e) {
            console.error("Failed to load timeline", e);
        } finally {
            setLoadingTimeline(false);
        }
    };

    // Status quick changer
    const handleQuickStatusChange = (id, newStatus) => {
        router.put(route('part-order-lifetime.update-status', id), { status: newStatus }, {
            preserveScroll: true,
        });
    };

    // Delete record
    const handleDelete = (record) => {
        if (confirm(`Yakin ingin menghapus Part Order ${record.no_order} (${record.part_number})?`)) {
            router.delete(route('part-order-lifetime.destroy', record.id), {
                preserveScroll: true,
            });
        }
    };

    // Status Badge Component
    const renderStatusBadge = (status) => {
        const map = {
            'REQUEST': 'bg-gray-100 text-gray-700 border-gray-300',
            'PR CREATED': 'bg-blue-50 text-blue-700 border-blue-200',
            'PO PROCESS': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'ORDERED': 'bg-cyan-50 text-cyan-700 border-cyan-200',
            'DELIVERY': 'bg-purple-50 text-purple-700 border-purple-200',
            'RECEIVED': 'bg-teal-50 text-teal-700 border-teal-200',
            'INSTALLED': 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
            'CLOSED': 'bg-slate-100 text-slate-600 border-slate-200',
            'CANCELLED': 'bg-red-50 text-red-600 border-red-200',
        };
        const cls = map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
                {status}
            </span>
        );
    };

    // Lifetime Indicator badge
    const renderIndicator = (record) => {
        if (record.status !== 'INSTALLED') {
            return (
                <span className="text-[10px] text-gray-400 italic">
                    {record.is_active_order ? 'Dalam Order' : 'Selesai'}
                </span>
            );
        }

        const status = record.lifetime_status;
        const pct = record.life_used_percentage || 0;

        if (status === 'CRITICAL') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 shadow-xs animate-pulse">
                    <span>🔴</span> Exceeded ({pct}%)
                </span>
            );
        }
        if (status === 'NEAR_LIFETIME') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                    <span>🟡</span> Near ({pct}%)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span>🟢</span> Normal ({pct}%)
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Smart Part Order & Part Lifetime Monitoring" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1680px] mx-auto space-y-6">
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                Smart Maintenance System
                            </span>
                            <span className="text-xs text-gray-500 font-mono">Unit + Part Number + No. Order</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5 tracking-tight flex items-center gap-2.5">
                            <span>Smart Part Order & Part Lifetime Management</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Monitoring siklus hidup order part, status instalasi, kalkulasi jam kerja (lifetime), dan pencegahan double order secara real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0b6e4f] hover:bg-[#08553d] text-white text-sm font-bold rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>+ Tambah Part Order</span>
                        </button>
                    </div>
                </div>

                {/* ── KPI METRICS CARDS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {/* Active Order */}
                    <div 
                        onClick={() => { setFilterStatus('ORDERED'); applyFilters({ status: 'ORDERED' }); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs hover:border-cyan-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span>Active Order</span>
                            <span className="text-cyan-500">📦</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                            {metrics.active_orders ?? 0}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Dalam proses order</div>
                    </div>

                    {/* Waiting Part */}
                    <div 
                        onClick={() => { setFilterStatus('DELIVERY'); applyFilters({ status: 'DELIVERY' }); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span>Waiting Part</span>
                            <span className="text-purple-500">🚚</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                            {metrics.waiting_parts ?? 0}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">PO / Pengiriman</div>
                    </div>

                    {/* Overdue ETA */}
                    <div 
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs hover:border-rose-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-rose-600 font-bold uppercase tracking-wider">
                            <span>Overdue ETA</span>
                            <span className="text-rose-500">⚠️</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            {metrics.overdue_eta ?? 0}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Melewati tanggal ETA</div>
                    </div>

                    {/* Installed Active */}
                    <div 
                        onClick={() => { setFilterStatus('INSTALLED'); applyFilters({ status: 'INSTALLED' }); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span>Terpasang (Live)</span>
                            <span className="text-emerald-500">⚙️</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {metrics.installed_parts ?? 0}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Aktif beroperasi</div>
                    </div>

                    {/* Near Lifetime */}
                    <div 
                        onClick={() => { setFilterIndicator('NEAR_LIFETIME'); applyFilters({ indicator: 'NEAR_LIFETIME' }); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 shadow-xs hover:border-amber-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-amber-700 font-bold uppercase tracking-wider">
                            <span>Near Lifetime</span>
                            <span>🟡</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {metrics.near_lifetime ?? 0}
                        </div>
                        <div className="text-[11px] text-amber-700/80 mt-1">85% - 100% jam kerja</div>
                    </div>

                    {/* Critical Part */}
                    <div 
                        onClick={() => { setFilterIndicator('CRITICAL'); applyFilters({ indicator: 'CRITICAL' }); }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 shadow-xs hover:border-red-400 transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between text-xs text-red-700 font-bold uppercase tracking-wider">
                            <span>Critical Part</span>
                            <span>🔴</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-red-600 dark:text-red-400 font-mono">
                            {metrics.critical_parts ?? 0}
                        </div>
                        <div className="text-[11px] text-red-700/80 mt-1">Melebihi target (&gt;100%)</div>
                    </div>
                </div>

                {/* ── FILTER BAR ── */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Unit Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Unit</label>
                            <input
                                type="text"
                                value={filterUnit}
                                onChange={e => setFilterUnit(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder="Cari Code Unit..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 py-2 text-gray-800 focus:bg-white focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
                            />
                        </div>

                        {/* Part Number Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Part Number</label>
                            <input
                                type="text"
                                value={filterPartNumber}
                                onChange={e => setFilterPartNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder="P/N..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 py-2 text-gray-800 font-mono focus:bg-white focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
                            />
                        </div>

                        {/* No Order Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">No. Order</label>
                            <input
                                type="text"
                                value={filterNoOrder}
                                onChange={e => setFilterNoOrder(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder="No. Order..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 py-2 text-gray-800 font-mono focus:bg-white focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status Order</label>
                            <select
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 py-2 text-gray-800 focus:bg-white focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
                            >
                                <option value="ALL">-- Semua Status --</option>
                                {statuses.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>

                        {/* Indicator Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Indikator Lifetime</label>
                            <select
                                value={filterIndicator}
                                onChange={e => { setFilterIndicator(e.target.value); applyFilters({ indicator: e.target.value }); }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 py-2 text-gray-800 focus:bg-white focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
                            >
                                <option value="ALL">-- Semua Indikator --</option>
                                <option value="NORMAL">🟢 Normal (&lt; 85%)</option>
                                <option value="NEAR_LIFETIME">🟡 Near Lifetime (85-100%)</option>
                                <option value="CRITICAL">🔴 Critical (&gt; 100%)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => applyFilters()}
                                className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition flex items-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Terapkan Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="text-xs text-gray-500">
                            Menampilkan <strong className="text-gray-800 font-mono">{records.total || 0}</strong> part order
                        </div>
                    </div>
                </div>

                {/* ── DATA TABLE ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap text-xs">
                            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="py-3 px-4 text-center w-12">No</th>
                                    <th className="py-3 px-4">Unit</th>
                                    <th className="py-3 px-4">Part Number & Deskripsi</th>
                                    <th className="py-3 px-4">No. Order</th>
                                    <th className="py-3 px-4">Status Order</th>
                                    <th className="py-3 px-4">Order / ETA</th>
                                    <th className="py-3 px-4">Installed HM / Current</th>
                                    <th className="py-3 px-4">Current Life vs Expected</th>
                                    <th className="py-3 px-4">Remaining & Indikator</th>
                                    <th className="py-3 px-4 text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                                {records.data && records.data.length > 0 ? (
                                    records.data.map((item, idx) => {
                                        const expectedLife = parseFloat(item.expected_lifetime || 5000);
                                        const currentLife = parseFloat(item.current_life || 0);
                                        const remainingLife = parseFloat(item.remaining_life || 0);
                                        const usedPct = parseFloat(item.life_used_percentage || 0);
                                        const isOverdue = item.is_overdue_eta;

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition">
                                                {/* No */}
                                                <td className="py-3 px-4 text-center text-gray-400 font-mono">
                                                    {(records.current_page - 1) * records.per_page + idx + 1}
                                                </td>

                                                {/* Unit */}
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                                                        {item.unit_code}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 truncate max-w-[140px]">
                                                        {item.unit?.model || item.unit?.type_unit || '-'}
                                                    </div>
                                                </td>

                                                {/* Part Number & Name */}
                                                <td className="py-3 px-4">
                                                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                                                        {item.part_number}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 truncate max-w-[200px]">
                                                        {item.part_name || '-'}
                                                    </div>
                                                </td>

                                                {/* No Order */}
                                                <td className="py-3 px-4">
                                                    <div className="font-mono font-bold text-gray-800 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                                                        {item.no_order}
                                                    </div>
                                                    {item.qty > 1 && (
                                                        <span className="ml-1.5 text-[10px] text-gray-500 font-bold">×{item.qty}</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {renderStatusBadge(item.status)}
                                                        <select
                                                            value={item.status}
                                                            onChange={e => handleQuickStatusChange(item.id, e.target.value)}
                                                            className="text-[10px] bg-transparent border-none text-gray-400 hover:text-gray-700 cursor-pointer p-0 focus:ring-0"
                                                            title="Ganti Status Cepat"
                                                        >
                                                            {statuses.map(st => (
                                                                <option key={st} value={st}>{st}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>

                                                {/* Order & ETA */}
                                                <td className="py-3 px-4">
                                                    <div className="text-[11px] text-gray-800 font-mono">
                                                        Tgl: {item.order_date || '-'}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className={`text-[11px] font-mono ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                            ETA: {item.eta || '-'}
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="text-[9px] px-1 bg-red-100 text-red-700 rounded font-bold">OVERDUE</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Installed HM & Unit HM */}
                                                <td className="py-3 px-4 font-mono">
                                                    {item.installed_hm !== null && item.installed_hm !== undefined ? (
                                                        <div>
                                                            <span className="text-gray-900 font-bold">{parseFloat(item.installed_hm).toLocaleString()} HM</span>
                                                            <div className="text-[10px] text-gray-400">
                                                                Unit HM: {item.unit?.hm ? parseFloat(item.unit.hm).toLocaleString() : '-'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Belum terpasang</span>
                                                    )}
                                                </td>

                                                {/* Current Life vs Expected */}
                                                <td className="py-3 px-4">
                                                    {item.status === 'INSTALLED' || item.installed_hm !== null ? (
                                                        <div>
                                                            <div className="font-bold text-gray-900 font-mono">
                                                                {currentLife.toLocaleString()} / <span className="text-gray-400 font-normal">{expectedLife.toLocaleString()} HM</span>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="w-28 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div 
                                                                    className={`h-full ${usedPct >= 100 ? 'bg-red-500' : (usedPct >= 85 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                                                                    style={{ width: `${Math.min(100, usedPct)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="font-mono text-gray-500">
                                                            Target: {expectedLife.toLocaleString()} HM
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Remaining & Indicator */}
                                                <td className="py-3 px-4">
                                                    <div>
                                                        {renderIndicator(item)}
                                                    </div>
                                                    {item.status === 'INSTALLED' && (
                                                        <div className="text-[10px] font-mono text-gray-500 mt-1">
                                                            Sisa: <strong className={remainingLife <= 200 ? 'text-amber-700' : 'text-gray-800'}>{remainingLife.toLocaleString()} HM</strong>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Timeline */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openTimeline(item)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                            title="Lihat Histori Timeline"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>

                                                        {/* Install Button */}
                                                        {item.status !== 'INSTALLED' && item.status !== 'CLOSED' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setInstallItem(item)}
                                                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[11px] border border-emerald-200 transition"
                                                                title="Catat Pemasangan Part"
                                                            >
                                                                Pasang
                                                            </button>
                                                        )}

                                                        {/* Replace Button */}
                                                        {item.status === 'INSTALLED' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setReplaceItem(item)}
                                                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[11px] border border-amber-300 transition"
                                                                title="Ganti Part (Catat Lifetime & Arsipkan)"
                                                            >
                                                                Ganti Part
                                                            </button>
                                                        )}

                                                        {/* Edit Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditItem(item)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                            title="Edit Detail"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-gray-400 italic">
                                            Tidak ada data Part Order yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {records.links && records.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Menampilkan {records.from || 0} - {records.to || 0} dari {records.total || 0} data
                            </div>
                            <div className="flex items-center gap-1">
                                {records.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg transition ${link.active ? 'bg-[#0b6e4f] text-white font-bold' : (link.url ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'text-gray-300 cursor-not-allowed')}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL: TIMELINE & HISTORI ── */}
            {timelineItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>Timeline Histori Order & Replacement</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Unit: <span className="font-bold font-mono text-emerald-700">{timelineItem.unit_code}</span> | Part Number: <span className="font-bold font-mono text-gray-800">{timelineItem.part_number}</span> ({timelineItem.part_name || '-'})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setTimelineItem(null); setTimelineData(null); }}
                                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            {loadingTimeline ? (
                                <div className="py-12 text-center text-gray-400">Memuat riwayat timeline...</div>
                            ) : (
                                <>
                                    {timelineData?.average_actual_lifetime && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                                            <span className="font-semibold">Rata-rata Actual Lifetime (Histori Penggantian):</span>
                                            <strong className="text-sm font-mono font-bold">{timelineData.average_actual_lifetime.toLocaleString()} Jam / HM</strong>
                                        </div>
                                    )}

                                    {timelineData?.timeline && timelineData.timeline.length > 0 ? (
                                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                            {timelineData.timeline.map((entry, idx) => (
                                                <div key={idx} className="relative">
                                                    {/* Node dot */}
                                                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-[9px] ${entry.status === 'INSTALLED' ? 'bg-emerald-500 text-white' : (entry.status === 'CLOSED' ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white')}`}>
                                                        {idx + 1}
                                                    </div>

                                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                                                                    {entry.no_order}
                                                                </span>
                                                                {renderStatusBadge(entry.status)}
                                                            </div>
                                                            <span className="text-xs text-gray-400 font-mono">{entry.order_date || entry.created_at?.split('T')[0]}</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-1">
                                                            <div>
                                                                <span className="text-gray-400 block text-[10px] uppercase">Qty</span>
                                                                <span className="font-bold">{entry.qty} Pcs</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400 block text-[10px] uppercase">ETA</span>
                                                                <span className="font-mono">{entry.eta || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400 block text-[10px] uppercase">Installed HM</span>
                                                                <span className="font-mono font-bold text-emerald-700">{entry.installed_hm ? `${entry.installed_hm} HM` : '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400 block text-[10px] uppercase">Removed HM</span>
                                                                <span className="font-mono font-bold text-red-600">{entry.removed_hm ? `${entry.removed_hm} HM` : '-'}</span>
                                                            </div>
                                                        </div>

                                                        {entry.actual_lifetime && (
                                                            <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 text-xs flex items-center justify-between">
                                                                <span className="text-gray-500">Actual Lifetime Tercapai:</span>
                                                                <strong className="font-mono font-bold text-gray-900 dark:text-white">{parseFloat(entry.actual_lifetime).toLocaleString()} Jam / HM</strong>
                                                            </div>
                                                        )}

                                                        {entry.failure_reason && (
                                                            <div className="text-xs text-gray-600 bg-amber-50/50 p-2 rounded border border-amber-200/50">
                                                                <strong className="text-amber-800">Alasan Penggantian:</strong> {entry.failure_reason}
                                                            </div>
                                                        )}

                                                        {entry.remarks && (
                                                            <div className="text-[11px] text-gray-400 italic">
                                                                Catatan: {entry.remarks}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-400 italic py-8">Belum ada riwayat timeline untuk part ini.</p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => { setTimelineItem(null); setTimelineData(null); }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: INSTALL PART ── */}
            {installItem && (
                <InstallModal
                    item={installItem}
                    onClose={() => setInstallItem(null)}
                />
            )}

            {/* ── MODAL: REPLACE PART ── */}
            {replaceItem && (
                <ReplaceModal
                    item={replaceItem}
                    onClose={() => setReplaceItem(null)}
                />
            )}

            {/* ── MODAL: CREATE PART ORDER ── */}
            {showCreateModal && (
                <CreatePartOrderModal
                    units={units}
                    statuses={statuses}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {/* ── MODAL: EDIT PART ORDER ── */}
            {editItem && (
                <EditPartOrderModal
                    item={editItem}
                    units={units}
                    statuses={statuses}
                    onClose={() => setEditItem(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

// ── SUB-COMPONENT: INSTALL MODAL ──
function InstallModal({ item, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        installed_date: new Date().toISOString().split('T')[0],
        installed_hm: item.unit?.hm ?? '',
        expected_lifetime: item.expected_lifetime ?? 5000,
        remarks: item.remarks || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('part-order-lifetime.install', item.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-emerald-900">Catat Pemasangan Part</h3>
                        <p className="text-xs text-emerald-700 font-mono mt-0.5">{item.unit_code} | {item.part_number}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Tanggal Pasang (Installed Date)</label>
                        <input
                            type="date"
                            value={data.installed_date}
                            onChange={e => setData('installed_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            required
                        />
                        {errors.installed_date && <p className="text-red-500 mt-1">{errors.installed_date}</p>}
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">HM Saat Pasang (Installed HM)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.installed_hm}
                            onChange={e => setData('installed_hm', e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono"
                            required
                        />
                        {errors.installed_hm && <p className="text-red-500 mt-1">{errors.installed_hm}</p>}
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Target Lifetime (Expected HM)</label>
                        <input
                            type="number"
                            step="10"
                            value={data.expected_lifetime}
                            onChange={e => setData('expected_lifetime', e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Catatan Pemasangan</label>
                        <textarea
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                            rows={2}
                            placeholder="Catatan mekanik/pemasangan..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-[#0b6e4f] text-white font-bold rounded-lg hover:bg-[#08553d]">
                            Simpan Pemasangan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── SUB-COMPONENT: REPLACE MODAL ──
function ReplaceModal({ item, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        removed_date: new Date().toISOString().split('T')[0],
        removed_hm: item.unit?.hm ?? '',
        failure_reason: '',
        create_replacement: true,
        replacement_no_order: '',
        replacement_expected_lifetime: item.expected_lifetime ?? 5000,
    });

    const installedHm = parseFloat(item.installed_hm || 0);
    const removedHm = parseFloat(data.removed_hm || 0);
    const estimatedActualLife = removedHm > installedHm ? Math.round(removedHm - installedHm) : 0;

    const submit = (e) => {
        e.preventDefault();
        post(route('part-order-lifetime.replace', item.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-amber-900">Ganti Part & Arsipkan Lifetime</h3>
                        <p className="text-xs text-amber-700 font-mono mt-0.5">{item.unit_code} | {item.part_number}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4 text-xs">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Installed HM:</span>
                            <span className="font-mono font-bold">{installedHm.toLocaleString()} HM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Estimasi Actual Lifetime Terhitung:</span>
                            <span className="font-mono font-bold text-emerald-700">{estimatedActualLife.toLocaleString()} HM</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Tanggal Lepas</label>
                            <input
                                type="date"
                                value={data.removed_date}
                                onChange={e => setData('removed_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">HM Saat Lepas (Removed HM)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.removed_hm}
                                onChange={e => setData('removed_hm', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Penyebab Kerusakan / Alasan Ganti</label>
                        <textarea
                            value={data.failure_reason}
                            onChange={e => setData('failure_reason', e.target.value)}
                            rows={2}
                            placeholder="e.g. Aus normal sesuai jam kerja / Kebocoran seal / Pecah bearing..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            required
                        />
                        {errors.failure_reason && <p className="text-red-500 mt-1">{errors.failure_reason}</p>}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                            <input
                                type="checkbox"
                                checked={data.create_replacement}
                                onChange={e => setData('create_replacement', e.target.checked)}
                                className="rounded text-[#0b6e4f] focus:ring-[#0b6e4f]"
                            />
                            <span>Mulai lifetime baru untuk part/order pengganti</span>
                        </label>
                    </div>

                    {data.create_replacement && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                            <div>
                                <label className="block font-bold text-emerald-900 text-[10px] uppercase mb-1">No. Order Pengganti (Opsional)</label>
                                <input
                                    type="text"
                                    value={data.replacement_no_order}
                                    onChange={e => setData('replacement_no_order', e.target.value)}
                                    placeholder={`e.g. ${item.no_order}-REP`}
                                    className="w-full border border-emerald-300 rounded p-1.5 text-xs font-mono"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-emerald-900 text-[10px] uppercase mb-1">Target Lifetime Part Pengganti (HM)</label>
                                <input
                                    type="number"
                                    value={data.replacement_expected_lifetime}
                                    onChange={e => setData('replacement_expected_lifetime', e.target.value)}
                                    className="w-full border border-emerald-300 rounded p-1.5 text-xs font-mono"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">
                            Konfirmasi Penggantian
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── SUB-COMPONENT: CREATE MODAL ──
function CreatePartOrderModal({ units, statuses, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        unit_code: '',
        part_number: '',
        part_name: '',
        no_order: '',
        qty: 1,
        order_date: new Date().toISOString().split('T')[0],
        eta: '',
        status: 'REQUEST',
        expected_lifetime: 5000,
        remarks: '',
    });

    const [activeWarning, setActiveWarning] = useState(null);

    const handlePartBlur = async () => {
        if (data.part_number && data.unit_id) {
            try {
                const res = await axios.get(route('part-order-lifetime.check-active'), {
                    params: { unit_id: data.unit_id, part_number: data.part_number }
                });
                if (res.data?.has_active_order) {
                    setActiveWarning(res.data);
                } else {
                    setActiveWarning(null);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('part-order-lifetime.store'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">+ Tambah Part Order Baru</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                    {activeWarning && (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-2 shadow-xs">
                            <span className="text-base">⚠️</span>
                            <div>
                                <strong className="block font-bold">Perhatian: Masih Ada Order Aktif!</strong>
                                <p className="text-[11px] mt-0.5">
                                    Part ini masih memiliki order berjalan dengan No Order: <span className="font-mono font-bold">{activeWarning.active_orders[0]?.no_order}</span> (Status: {activeWarning.active_orders[0]?.status}). Mohon pastikan bukan double order yang tidak disengaja.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Unit</label>
                            <select
                                value={data.unit_id}
                                onChange={e => {
                                    const u = units.find(x => x.id === e.target.value);
                                    setData(curr => ({ ...curr, unit_id: e.target.value, unit_code: u?.code_unit || '' }));
                                }}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                                required
                            >
                                <option value="">-- Pilih Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.code_unit} - {u.model}</option>
                                ))}
                            </select>
                            {errors.unit_id && <p className="text-red-500 mt-1">{errors.unit_id}</p>}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Part Number</label>
                            <input
                                type="text"
                                value={data.part_number}
                                onChange={e => setData('part_number', e.target.value)}
                                onBlur={handlePartBlur}
                                placeholder="e.g. 14X-27-11531"
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono uppercase"
                                required
                            />
                            {errors.part_number && <p className="text-red-500 mt-1">{errors.part_number}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Part Name / Deskripsi</label>
                            <input
                                type="text"
                                value={data.part_name}
                                onChange={e => setData('part_name', e.target.value)}
                                placeholder="e.g. Bearing Final Drive"
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">No. Order</label>
                            <input
                                type="text"
                                value={data.no_order}
                                onChange={e => setData('no_order', e.target.value)}
                                placeholder="e.g. HW-MOL-01550"
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono uppercase"
                                required
                            />
                            {errors.no_order && <p className="text-red-500 mt-1">{errors.no_order}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Qty</label>
                            <input
                                type="number"
                                min="1"
                                value={data.qty}
                                onChange={e => setData('qty', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Tgl Order</label>
                            <input
                                type="date"
                                value={data.order_date}
                                onChange={e => setData('order_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">ETA</label>
                            <input
                                type="date"
                                value={data.eta}
                                onChange={e => setData('eta', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Status Order</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            >
                                {statuses.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Expected Lifetime (HM)</label>
                            <input
                                type="number"
                                step="10"
                                value={data.expected_lifetime}
                                onChange={e => setData('expected_lifetime', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Catatan / Keterangan</label>
                        <textarea
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                            rows={2}
                            placeholder="Catatan PR/PO atau keperluan perbaikan..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-[#0b6e4f] text-white font-bold rounded-lg hover:bg-[#08553d]">
                            Simpan Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── SUB-COMPONENT: EDIT MODAL ──
function EditPartOrderModal({ item, units, statuses, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        unit_id: item.unit_id || '',
        unit_code: item.unit_code || '',
        part_number: item.part_number || '',
        part_name: item.part_name || '',
        no_order: item.no_order || '',
        qty: item.qty || 1,
        order_date: item.order_date || '',
        eta: item.eta || '',
        received_date: item.received_date || '',
        installed_date: item.installed_date || '',
        installed_hm: item.installed_hm ?? '',
        expected_lifetime: item.expected_lifetime ?? 5000,
        status: item.status || 'REQUEST',
        remarks: item.remarks || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('part-order-lifetime.update', item.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Edit Part Order: {item.no_order}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Unit</label>
                            <select
                                value={data.unit_id}
                                onChange={e => {
                                    const u = units.find(x => x.id === e.target.value);
                                    setData(curr => ({ ...curr, unit_id: e.target.value, unit_code: u?.code_unit || curr.unit_code }));
                                }}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            >
                                <option value="">-- Pilih Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.code_unit} - {u.model}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Part Number</label>
                            <input
                                type="text"
                                value={data.part_number}
                                onChange={e => setData('part_number', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono uppercase"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Part Name</label>
                            <input
                                type="text"
                                value={data.part_name}
                                onChange={e => setData('part_name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">No. Order</label>
                            <input
                                type="text"
                                value={data.no_order}
                                onChange={e => setData('no_order', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Qty</label>
                            <input
                                type="number"
                                min="1"
                                value={data.qty}
                                onChange={e => setData('qty', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Tgl Order</label>
                            <input
                                type="date"
                                value={data.order_date}
                                onChange={e => setData('order_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">ETA</label>
                            <input
                                type="date"
                                value={data.eta}
                                onChange={e => setData('eta', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                            >
                                {statuses.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Installed HM</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.installed_hm}
                                onChange={e => setData('installed_hm', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 uppercase mb-1">Expected Life (HM)</label>
                            <input
                                type="number"
                                value={data.expected_lifetime}
                                onChange={e => setData('expected_lifetime', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Keterangan</label>
                        <textarea
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-[#0b6e4f] text-white font-bold rounded-lg hover:bg-[#08553d]">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
