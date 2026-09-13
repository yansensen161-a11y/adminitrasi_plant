import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PartCanibalBoard from './PartCanibalBoard';

export default function PartCanibalTab({ canibals = [], stats = { total: 0, available: 0, used: 0, unavailable: 0 }, units = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    
    // View State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        id: '',
        tanggal: '',
        unit_id: '',
        hm: '',
        dari_unit_id: '',
        remark: '',
        no_order: '',
        pr: '',
        po: '',
        eta_part: '',
        status: 'Waiting part',
        image: null,
        existing_image: null,
        parts: []
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: '',
        unit_id: '',
        hm: '',
        dari_unit_id: '',
        remark: '',
        no_order: '',
        pr: '',
        po: '',
        eta_part: '',
        status: 'Waiting part',
        image: null,
        parts: [
            { part_name: '', description: '', qty: 1, component: '', life_time: '' }
        ]
    });

    const addPart = () => {
        setData('parts', [...data.parts, { part_name: '', qty: 1, component: '', description: '', life_time: '' }]);
    };

    const removePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
    };

    const handlePartChange = (index, field, value) => {
        const newParts = [...data.parts];
        newParts[index][field] = value;
        setData('parts', newParts);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('part-canibals.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const handleNoOrderBlur = async (e) => {
        const noOrder = e.target.value;
        if (!noOrder) return;
        
        try {
            const response = await fetch(`/monitoring-orders/find-by-no?no_order=${encodeURIComponent(noOrder)}`);
            const result = await response.json();
            if (result.found) {
                setData(prev => ({
                    ...prev,
                    pr: result.pr || prev.pr,
                    po: result.po || prev.po,
                    eta_part: result.eta || prev.eta_part
                }));
            }
        } catch (error) {
            console.error("Error fetching order details", error);
        }
    };
    
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('part-canibals.index'), {
            date_from: dateFrom,
            date_to:   dateTo,
            status:    statusFilter,
            unit:      unitFilter,
        }, { preserveState: true });
    };

    const openViewModal = (item) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setEditData({
            id: item.id,
            tanggal: item.tanggal ? item.tanggal.substring(0, 10) : '',
            unit_id: item.unit_id || '',
            hm: item.hm || '',
            dari_unit_id: item.dari_unit_id || '',
            remark: item.remark || '',
            no_order: item.no_order || '',
            pr: item.pr || '',
            po: item.po || '',
            eta_part: item.eta_part ? item.eta_part.substring(0, 10) : '',
            status: item.status || 'AVAILABLE',
            image: null,
            existing_image: item.image || null,
            parts: item.parts && item.parts.length > 0 ? item.parts.map(p => ({
                id: p.id,
                part_name: p.part_name || '',
                description: p.description || '',
                qty: p.qty || 1,
                component: p.component || '',
                life_time: p.life_time || ''
            })) : [{ part_name: '', description: '', qty: 1, component: '', life_time: '' }]
        });
        setShowEditModal(true);
    };

    const handleEditPartChange = (index, field, value) => {
        const newParts = [...editData.parts];
        newParts[index][field] = value;
        setEditData('parts', newParts);
    };

    const addEditPart = () => {
        setEditData('parts', [...editData.parts, { part_name: '', description: '', qty: 1, component: '', life_time: '' }]);
    };

    const removeEditPart = (index) => {
        const newParts = [...editData.parts];
        newParts.splice(index, 1);
        setEditData('parts', newParts);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        postEdit(route('part-canibals.update', editData.id), {
            forceFormData: true,
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
            }
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data Part Canibal ini?')) {
            router.delete(route('part-canibals.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        AVAILABLE
                    </span>
                );
            case 'USED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                        USED
                    </span>
                );
            case 'UNAVAILABLE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                        UNAVAILABLE
                    </span>
                );
            default:
                return <span>{status}</span>;
        }
    };

    const renderProgress = (value, total, color, strokeColor) => {
        const percentage = total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-700" />
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`transition-all duration-1000 ease-in-out ${strokeColor}`} />
                </svg>
                <span className={`absolute text-[8px] font-bold ${color}`}>{percentage}%</span>
            </div>
        );
    };

    return (
        <div className="text-slate-300">
            {/* Header */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">PART CANIBAL LIST</h1>
                    <p className="text-sm text-slate-400 mt-1">Kelola data part yang dapat digunakan kembali (canibal)</p>
                </div>
                
                <button type="button" onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Add Entry
                </button>
            </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 shrink-0">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.19v6.72zm14 0v-6.72l-6 3.39v6.71l6-3.38z"/></svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">TOTAL PART CANIBAL</div>
                                <div className="text-2xl font-black text-white leading-none">{stats.total}</div>
                                <div className="text-xs text-slate-500 mt-1">Semua Data</div>
                            </div>
                        </div>
                    </div>

                    {/* Available */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">AVAILABLE</div>
                                <div className="text-2xl font-black text-white leading-none">{stats.available}</div>
                                <div className="text-xs text-slate-500 mt-1">Siap Digunakan</div>
                            </div>
                        </div>
                        {renderProgress(stats.available, stats.total, 'text-emerald-400', 'text-emerald-500')}
                    </div>

                    {/* Used / Swapped */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">USED / SWAPPED</div>
                                <div className="text-2xl font-black text-white leading-none">{stats.used}</div>
                                <div className="text-xs text-slate-500 mt-1">Telah Digunakan</div>
                            </div>
                        </div>
                        {renderProgress(stats.used, stats.total, 'text-amber-400', 'text-amber-500')}
                    </div>

                    {/* Unavailable */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">UNAVAILABLE</div>
                                <div className="text-2xl font-black text-white leading-none">{stats.unavailable}</div>
                                <div className="text-xs text-slate-500 mt-1">Tidak Tersedia</div>
                            </div>
                        </div>
                        {renderProgress(stats.unavailable, stats.total, 'text-red-400', 'text-red-500')}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/80 shadow-sm sm:rounded-xl mb-6 p-5 border border-slate-700/80">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">FILTER DATA</span>
                    </div>
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-sm font-semibold text-slate-400 mb-1.5">Tanggal Dari</label>
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo || undefined}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-sm font-semibold text-slate-400 mb-1.5">Tanggal Sampai</label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-slate-400 mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="USED">USED / SWAPPED</option>
                                <option value="UNAVAILABLE">UNAVAILABLE</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-slate-400 mb-1.5">Unit</label>
                            <select
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="">Semua Unit</option>
                                {units?.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); setUnitFilter(''); router.get(route('part-canibals.index'), {}, { preserveState: true }); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-700 text-slate-300 border border-slate-600 font-semibold px-5 py-2 rounded-lg text-sm transition-colors h-[42px]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                Reset
                            </button>
                            <button type="submit" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors h-[42px] shadow-lg shadow-emerald-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-slate-800/80 border border-slate-700/80 shadow-sm rounded-xl overflow-hidden">
                    <div className="border-b border-slate-700/80 px-5 py-4 flex justify-between items-center bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/20 rounded border border-emerald-500/20">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            </div>
                            <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">DAFTAR PART CANIBAL</span>
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                            Total Data : {stats.total} Part
                        </div>
                    </div>
                    
                    <div className="custom-scrollbar">
                        <PartCanibalBoard canibals={canibals} openViewModal={openViewModal} openEditModal={openEditModal} />
                    </div>
                    
                    {/* Pagination */}
                    <div className="border-t border-slate-700/80 px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/50">
                        <div className="text-sm text-slate-400">
                            Showing 1 to {Math.min(10, stats.total)} of {stats.total} entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
                            </button>
                            <button className="p-1.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button className="w-7 h-7 rounded border border-emerald-500 bg-emerald-500/10 text-emerald-500 text-sm font-bold transition-colors">1</button>
                            <button className="w-7 h-7 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition-colors">2</button>
                            <button className="w-7 h-7 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition-colors">3</button>
                            <span className="text-slate-500 px-1">...</span>
                            <button className="w-7 h-7 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 text-sm font-bold transition-colors">{Math.ceil(stats.total / 10) || 1}</button>
                            <button className="p-1.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                            <button className="p-1.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="3xl">
                    <div className="bg-slate-900 border border-slate-700 text-slate-200 max-h-[90vh] overflow-y-auto">
                        <form onSubmit={submitAdd} className="p-4 sm:p-5">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3 sticky top-0 bg-slate-900 z-10 pt-1">
                                <h2 className="text-base font-bold text-white tracking-tight">Add Entry Part Canibal</h2>
                                <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Tanggal</label>
                                    <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required style={{colorScheme: 'dark'}} />
                                    {errors.tanggal && <p className="text-red-400 text-xs mt-1">{errors.tanggal}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Unit</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <p className="text-red-400 text-xs mt-1">{errors.unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">HM</label>
                                    <input type="text" value={data.hm} onChange={e => setData('hm', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {errors.hm && <p className="text-red-400 text-xs mt-1">{errors.hm}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Swap To Unit</label>
                                    <select value={data.dari_unit_id} onChange={e => setData('dari_unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={`dari-${unit.id}`} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {errors.dari_unit_id && <p className="text-red-400 text-xs mt-1">{errors.dari_unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="Waiting part">Waiting part</option>
                                        <option value="Part ter supply">Part ter supply</option>
                                        <option value="Done Instal">Done Instal</option>
                                    </select>
                                    {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Upload Gambar</label>
                                    <input type="file" onChange={e => setData('image', e.target.files[0])} className="w-full bg-slate-800 text-slate-400 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors" accept="image/*" />
                                    {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                                </div>
                            </div>

                            {/* Parts Section */}
                            <div className="mb-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-white">Parts Needed</h3>
                                    <button type="button" onClick={addPart} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                        Add Part
                                    </button>
                                </div>
                                {errors.parts && <p className="text-red-400 text-xs mb-2">{errors.parts}</p>}
                                
                                <div className="space-y-2">
                                    {data.parts.map((part, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-slate-900 p-3 rounded border border-slate-700 relative group">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Part Number</label>
                                                <input type="text" value={part.part_name} onChange={e => handlePartChange(index, 'part_name', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" required placeholder="e.g. 123-456-789" />
                                                {errors[`parts.${index}.part_name`] && <p className="text-red-400 text-xs mt-1">{errors[`parts.${index}.part_name`]}</p>}
                                            </div>
                                            <div className="w-20">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Qty</label>
                                                <input type="number" min="1" value={part.qty} onChange={e => handlePartChange(index, 'qty', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" required />
                                                {errors[`parts.${index}.qty`] && <p className="text-red-400 text-xs mt-1">{errors[`parts.${index}.qty`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Component</label>
                                                <input type="text" value={part.component || ''} onChange={e => handlePartChange(index, 'component', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="Component name..." />
                                                {errors[`parts.${index}.component`] && <p className="text-red-400 text-xs mt-1">{errors[`parts.${index}.component`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Description</label>
                                                <input type="text" value={part.description} onChange={e => handlePartChange(index, 'description', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="Part description..." />
                                                {errors[`parts.${index}.description`] && <p className="text-red-400 text-xs mt-1">{errors[`parts.${index}.description`]}</p>}
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Life Time</label>
                                                <input type="text" value={part.life_time || ''} onChange={e => handlePartChange(index, 'life_time', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="e.g. 500" />
                                                {errors[`parts.${index}.life_time`] && <p className="text-red-400 text-xs mt-1">{errors[`parts.${index}.life_time`]}</p>}
                                            </div>
                                            {data.parts.length > 1 && (
                                                <button type="button" onClick={() => removePart(index)} className="mt-5 text-slate-500 hover:text-red-400 px-1 py-1 transition-colors" title="Remove part">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Remark</label>
                                    <input type="text" value={data.remark} onChange={e => setData('remark', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {errors.remark && <p className="text-red-400 text-xs mt-1">{errors.remark}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">No Order</label>
                                    <input type="text" value={data.no_order} onChange={e => setData('no_order', e.target.value)} onBlur={handleNoOrderBlur} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {errors.no_order && <p className="text-red-400 text-xs mt-1">{errors.no_order}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">PR</label>
                                    <input type="text" value={data.pr} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">PO</label>
                                    <input type="text" value={data.po} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">ETA Part</label>
                                    <input type="date" value={data.eta_part} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" style={{colorScheme: 'dark'}} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded text-sm transition-colors disabled:opacity-50">
                                    {processing ? 'Saving...' : 'Save Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
                <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="3xl">
                    <div className="bg-slate-900 border border-slate-700 text-slate-200 max-h-[90vh] overflow-y-auto">
                        <form onSubmit={submitEdit} className="p-4 sm:p-5">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3 sticky top-0 bg-slate-900 z-10 pt-1">
                                <h2 className="text-base font-bold text-white tracking-tight">Edit Entry Part Canibal</h2>
                                <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Tanggal</label>
                                    <input type="date" value={editData.tanggal} onChange={e => setEditData('tanggal', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required style={{colorScheme: 'dark'}} />
                                    {editErrors.tanggal && <p className="text-red-400 text-xs mt-1">{editErrors.tanggal}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Unit</label>
                                    <select value={editData.unit_id} onChange={e => setEditData('unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {editErrors.unit_id && <p className="text-red-400 text-xs mt-1">{editErrors.unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">HM</label>
                                    <input type="text" value={editData.hm} onChange={e => setEditData('hm', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {editErrors.hm && <p className="text-red-400 text-xs mt-1">{editErrors.hm}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Swap To Unit</label>
                                    <select value={editData.dari_unit_id} onChange={e => setEditData('dari_unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={`dari-${unit.id}`} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {editErrors.dari_unit_id && <p className="text-red-400 text-xs mt-1">{editErrors.dari_unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
                                    <select value={editData.status} onChange={e => setEditData('status', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" required>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="USED">USED</option>
                                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                                        <option value="Waiting part">Waiting part</option>
                                        <option value="Part ter supply">Part ter supply</option>
                                        <option value="Done Instal">Done Instal</option>
                                    </select>
                                    {editErrors.status && <p className="text-red-400 text-xs mt-1">{editErrors.status}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Upload Gambar Baru</label>
                                    <input type="file" onChange={e => setEditData('image', e.target.files[0])} className="w-full bg-slate-800 text-slate-400 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors" accept="image/*" />
                                    {editErrors.image && <p className="text-red-400 text-xs mt-1">{editErrors.image}</p>}
                                </div>
                            </div>

                            {/* Parts Section */}
                            <div className="mb-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-white">Parts Needed</h3>
                                    <button type="button" onClick={addEditPart} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                        Add Part
                                    </button>
                                </div>
                                {editErrors.parts && <p className="text-red-400 text-xs mb-2">{editErrors.parts}</p>}
                                
                                <div className="space-y-2">
                                    {editData.parts.map((part, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-slate-900 p-3 rounded border border-slate-700 relative group">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Part Number</label>
                                                <input type="text" value={part.part_name} onChange={e => handleEditPartChange(index, 'part_name', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" required placeholder="e.g. 123-456-789" />
                                                {editErrors[`parts.${index}.part_name`] && <p className="text-red-400 text-xs mt-1">{editErrors[`parts.${index}.part_name`]}</p>}
                                            </div>
                                            <div className="w-20">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Qty</label>
                                                <input type="number" min="1" value={part.qty} onChange={e => handleEditPartChange(index, 'qty', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" required />
                                                {editErrors[`parts.${index}.qty`] && <p className="text-red-400 text-xs mt-1">{editErrors[`parts.${index}.qty`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Component</label>
                                                <input type="text" value={part.component || ''} onChange={e => handleEditPartChange(index, 'component', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="Component name..." />
                                                {editErrors[`parts.${index}.component`] && <p className="text-red-400 text-xs mt-1">{editErrors[`parts.${index}.component`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Description</label>
                                                <input type="text" value={part.description} onChange={e => handleEditPartChange(index, 'description', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="Part description..." />
                                                {editErrors[`parts.${index}.description`] && <p className="text-red-400 text-xs mt-1">{editErrors[`parts.${index}.description`]}</p>}
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Life Time</label>
                                                <input type="text" value={part.life_time || ''} onChange={e => handleEditPartChange(index, 'life_time', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-sm" placeholder="e.g. 500" />
                                                {editErrors[`parts.${index}.life_time`] && <p className="text-red-400 text-xs mt-1">{editErrors[`parts.${index}.life_time`]}</p>}
                                            </div>
                                            {editData.parts.length > 1 && (
                                                <button type="button" onClick={() => removeEditPart(index)} className="mt-5 text-slate-500 hover:text-red-400 px-1 py-1 transition-colors" title="Remove part">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Remark</label>
                                    <input type="text" value={editData.remark} onChange={e => setEditData('remark', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {editErrors.remark && <p className="text-red-400 text-xs mt-1">{editErrors.remark}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">No Order</label>
                                    <input type="text" value={editData.no_order} onChange={e => setEditData('no_order', e.target.value)} onBlur={handleNoOrderBlur} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm shadow-sm" />
                                    {editErrors.no_order && <p className="text-red-400 text-xs mt-1">{editErrors.no_order}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">PR</label>
                                    <input type="text" value={editData.pr} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">PO</label>
                                    <input type="text" value={editData.po} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">ETA Part</label>
                                    <input type="date" value={editData.eta_part} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-sm shadow-sm cursor-not-allowed" style={{colorScheme: 'dark'}} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editProcessing} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded text-sm transition-colors disabled:opacity-50">
                                    {editProcessing ? 'Saving...' : 'Update Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="lg">
                    <div className="bg-slate-900 border border-slate-700 text-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4">Detail Part Canibal</h2>
                        {selectedItem && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">Tanggal</p>
                                        <p className="font-semibold">{selectedItem.tanggal ? new Date(selectedItem.tanggal).toLocaleDateString('id-ID') : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Status</p>
                                        <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Unit</p>
                                        <p className="font-semibold text-blue-400">{selectedItem.unit?.code_unit || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Swap To Unit</p>
                                        <p className="font-semibold">{selectedItem.dari_unit?.code_unit || '-'}</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-700 pt-4">
                                    <p className="text-sm text-slate-400 mb-2">Daftar Parts</p>
                                    {selectedItem.parts && selectedItem.parts.map((p, idx) => (
                                        <div key={idx} className="bg-slate-800 p-2 rounded mb-2 text-sm">
                                            <div className="font-bold">{p.part_name} <span className="text-slate-400 font-normal">({p.qty} pcs)</span></div>
                                            <div className="text-sm text-slate-400">{p.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowViewModal(false)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition-colors">Tutup</button>
                        </div>
                    </div>
                </Modal>
        </div>
    );
}
