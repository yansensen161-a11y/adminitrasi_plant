import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DateRangePicker from '@/Components/DateRangePicker';

export default function Index({ orders, stats, units, currentTab = 'ORDERAN AKTIF', filters = {} }) {
    // Search & Filter state
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [typeUnitFilter, setTypeUnitFilter] = useState(filters.typeUnitFilter || '');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('monitoring-orders.index'), {
            tab: currentTab,
            dateFrom,
            dateTo,
            codeUnitFilter,
            typeUnitFilter
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setTypeUnitFilter('');
        setProgressFilter('');
        router.get(route('monitoring-orders.index'), { tab: currentTab }, { preserveState: true });
    };

    // Form Add Order
    const [showAddModal, setShowAddModal] = useState(false);
    const [partHistories, setPartHistories] = useState({});
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        tanggal: '',
        unit_id: '',
        hm: '',
        lokasi: '',
        priority: 'LOW',
        status: 'OPEN',
        pic: '',
        parts: [
            { part_number: '', department: '', qty: '', satuan: 'PCS', component: '', due_date_part: '', pr: '', po: '', image: null, swap_to_unit_id: '' }
        ]
    });

    const checkPartHistory = async (partNumber, index) => {
        if (!partNumber || !data.unit_id) {
            setPartHistories(prev => ({ ...prev, [index]: null }));
            return;
        }
        
        try {
            const response = await fetch(`/monitoring-orders/check-history?part_number=${encodeURIComponent(partNumber)}&unit_id=${data.unit_id}`);
            const history = await response.json();
            setPartHistories(prev => ({ ...prev, [index]: history.length > 0 ? history : null }));
        } catch (error) {
            console.error("Error checking part history", error);
        }
    };

    const calculateLifeTime = (index, currentHm) => {
        if (!currentHm || isNaN(currentHm)) return '-';
        const history = partHistories[index];
        if (history && history.length > 0) {
            const previousHm = history[0].hm;
            if (previousHm && !isNaN(previousHm)) {
                return (parseInt(currentHm) - parseInt(previousHm)).toLocaleString('id-ID');
            }
        }
        return '-';
    };

    const addPartRow = () => {
        setData('parts', [...data.parts, { department: '', part_number: '', qty: '', satuan: 'PCS', component: '', due_date_part: '', pr: '', po: '', image: null, swap_to_unit_id: '' }]);
    };

    const removePartRow = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
        
        // Remove history for this index and shift others
        const newHistories = { ...partHistories };
        delete newHistories[index];
        // Note: For perfect history state shifting, it's better to just re-fetch or clear.
        setPartHistories({}); 
    };

    const submitWithStatus = (targetStatus) => {
        post(route('monitoring-orders.store'), {
            forceFormData: true,
            data: { ...data, status: targetStatus },
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                clearErrors();
            }
        });
    };

    const submitAdd = (e) => {
        e?.preventDefault?.();
        submitWithStatus('OPEN');
    };

    const submitDraft = (e) => {
        e?.preventDefault?.();
        submitWithStatus('DRAFT');
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        reset();
        clearErrors();
    };

    // Edit Order State & Logic
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: resetEdit, clearErrors: clearEditErrors } = useForm({
        no_order: '',
        tanggal: '',
        unit_id: '',
        hm: '',
        lokasi: '',
        priority: 'LOW',
        status: 'OPEN',
        pic: '',
        parts: [],
    });

    const openEditModal = (order) => {
        setSelectedOrder(order);
        setEditData({
            no_order: order.no_order || '',
            tanggal: order.tanggal ? order.tanggal.substring(0, 10) : '',
            unit_id: order.unit_id || '',
            hm: order.hm || '',
            lokasi: order.lokasi || '',
            priority: order.priority || 'LOW',
            status: order.status || 'OPEN',
            pic: order.pic || '',
            parts: order.parts && order.parts.length > 0 ? order.parts.map(p => ({
                id: p.id,
                department: p.department || '',
                part_number: p.part_number || '',
                qty: p.qty || '',
                component: p.component || '',
                due_date_part: p.due_date_part ? p.due_date_part.substring(0, 10) : '',
                swap_to_unit_id: p.swap_to_unit_id || '',
                pr: p.pr || '',
                po: p.po || '',
                image: null,
            })) : [{ department: '', part_number: '', qty: '', component: '', due_date_part: '', swap_to_unit_id: '', pr: '', po: '', image: null }],
        });
        setShowEditModal(true);
    };

    const addEditPartRow = () => {
        setEditData('parts', [
            ...editData.parts,
            { department: '', part_number: '', qty: '', component: '', due_date_part: '', swap_to_unit_id: '', pr: '', po: '', image: null }
        ]);
    };

    const removeEditPartRow = (index) => {
        const newParts = [...editData.parts];
        newParts.splice(index, 1);
        setEditData('parts', newParts);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        postEdit(route('monitoring-orders.update', selectedOrder.id), {
            forceFormData: true,
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
                clearEditErrors();
            }
        });
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        resetEdit();
        clearEditErrors();
    };

    // View Order State
    const [showViewModal, setShowViewModal] = useState(false);
    
    const openViewModal = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    // Delete Logic
    const handleDelete = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus order ini?')) {
            router.delete(route('monitoring-orders.destroy', id));
        }
    };

    // Form Import Excel
    const [showImportModal, setShowImportModal] = useState(false);
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport, clearErrors: clearImportErrors } = useForm({
        file: null,
    });
    const fileInputRef = useRef(null);

    const submitImport = (e) => {
        e.preventDefault();
        postImport(route('monitoring-orders.import'), {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
                clearImportErrors();
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        });
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        resetImport();
        clearImportErrors();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'HIGH':
                return <span className="text-white bg-red-600 px-2.5 py-1 rounded text-[10px] font-bold">P1</span>;
            case 'MEDIUM':
                return <span className="text-gray-900 bg-yellow-400 px-2.5 py-1 rounded text-[10px] font-bold">P2</span>;
            case 'LOW':
                return <span className="text-white bg-blue-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase">BACKLOG</span>;
            default:
                return <span>{priority}</span>;
        }
    };

    const getProgressBadge = (status) => {
        switch (status) {
            case 'OPEN':
            case 'PROCESS':
                return <span className="text-gray-900 bg-[#ffc107] px-3 py-1 rounded text-[10px] font-bold uppercase">WAITING PART</span>;
            case 'CLOSED':
                return <span className="text-white bg-[#0b5c3e] px-3 py-1 rounded text-[10px] font-bold uppercase">COMPLETED</span>;
            case 'CANCEL':
                return <span className="text-white bg-red-600 px-3 py-1 rounded text-[10px] font-bold uppercase">SUPPLY PARTIAL</span>;
            default:
                return <span className="text-gray-300 bg-gray-600 px-3 py-1 rounded text-[10px] font-bold uppercase">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Order List" />

            <div className="min-h-screen bg-gray-900 text-gray-200 pb-12 font-sans px-3 py-4 md:px-4 rounded-xl border border-gray-800 shadow-xl">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">MONITORING ORDER LIST</h1>
                        <div className="flex items-center gap-2 text-xs font-medium text-green-500">
                            <span className="hover:text-green-400 cursor-pointer transition">Home</span>
                            <span className="text-gray-500">&gt;</span>
                            <span className="hover:text-green-400 cursor-pointer transition">Planner</span>
                            <span className="text-gray-500">&gt;</span>
                            <span className="text-gray-300">Monitoring Order List</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowAddModal(true)} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2 shadow-sm shadow-green-900/20 border border-[#0b5c3e]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                            Create Order
                        </button>
                        <button onClick={() => setShowImportModal(true)} className="bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2 shadow-sm border border-gray-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                            Import Excel
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 text-green-500 font-bold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2 shadow-sm border border-gray-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            Export Excel
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2 shadow-sm border border-gray-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800 mb-6 overflow-x-auto flex flex-nowrap">
                    <button onClick={() => router.get(route('monitoring-orders.index'), { tab: 'ORDERAN AKTIF' }, { preserveState: true })} className={`flex items-center gap-2 px-6 py-3 text-xs font-bold whitespace-nowrap transition-colors ${currentTab === 'ORDERAN AKTIF' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                        ORDERAN AKTIF
                    </button>
                    <button onClick={() => router.get(route('monitoring-orders.index'), { tab: 'SUPPLY PARTIAL' }, { preserveState: true })} className={`flex items-center gap-2 px-6 py-3 text-xs font-bold whitespace-nowrap transition-colors ${currentTab === 'SUPPLY PARTIAL' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-200'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        SUPPLY PARTIAL
                    </button>
                    <button onClick={() => router.get(route('monitoring-orders.index'), { tab: 'BACKLOG' }, { preserveState: true })} className={`flex items-center gap-2 px-6 py-3 text-xs font-bold whitespace-nowrap transition-colors ${currentTab === 'BACKLOG' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        BACKLOG
                    </button>
                    <button onClick={() => router.get(route('monitoring-orders.index'), { tab: 'HISTORICAL ORDER' }, { preserveState: true })} className={`flex items-center gap-2 px-6 py-3 text-xs font-bold whitespace-nowrap transition-colors ${currentTab === 'HISTORICAL ORDER' ? 'text-gray-200 border-b-2 border-gray-200' : 'text-gray-400 hover:text-gray-200'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        HISTORICAL ORDER
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg mb-6 p-5">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end w-full">
                        <div className="flex-1 w-full min-w-[280px]">
                            <label className="block text-xs font-bold text-gray-300 mb-2">Periode Order</label>
                            <DateRangePicker 
                                dateFrom={dateFrom} 
                                dateTo={dateTo} 
                                onDateChange={({ from, to }) => {
                                    setDateFrom(from || '');
                                    setDateTo(to || '');
                                }} 
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-300 mb-2">Code Unit</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2.5 focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e] outline-none transition appearance-none">
                                <option value="">All Unit</option>
                                {units?.map(u => <option key={u.id} value={u.code_unit}>{u.code_unit}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-300 mb-2">Type Unit</label>
                            <select value={typeUnitFilter} onChange={e => setTypeUnitFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2.5 focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e] outline-none transition appearance-none">
                                <option value="">All Type</option>
                                <option>Excavator</option>
                                <option>Dump Truck</option>
                                <option>Wheel Loader</option>
                                <option>Motor Grader</option>
                            </select>
                        </div>
                        <div>
                            <button type="submit" className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-2.5 px-6 rounded-lg text-xs transition shadow-sm h-[38px] flex items-center justify-center border border-[#0b5c3e] w-full md:w-auto">
                                <svg className="w-3.5 h-3.5 mr-1.5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                Filter
                            </button>
                        </div>
                    </form>

                    {/* Legends */}
                    <div className="mt-5 pt-4 border-t border-gray-700 flex items-center gap-4 text-[11px]">
                        <span className="font-extrabold text-gray-300 tracking-wider">PROGRESS ORDER :</span>
                        <div className="flex items-center gap-2"><span className="bg-[#ffc107] text-gray-900 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">WAITING PART</span> <span className="text-gray-400 font-medium">= Menunggu Part</span></div>
                        <div className="flex items-center gap-2"><span className="bg-[#0b5c3e] text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">COMPLETED</span> <span className="text-gray-400 font-medium">= Selesai (Masuk Historical)</span></div>
                        <div className="flex items-center gap-2"><span className="bg-red-600 text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">SUPPLY PARTIAL</span> <span className="text-gray-400 font-medium">= Supply Parsial (Masuk Historical)</span></div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left whitespace-nowrap">
                            <thead className="bg-gray-900/50 text-gray-300 border-b border-gray-700 text-[10px] tracking-tight">
                                <tr>
                                <th className="px-1.5 py-2 font-extrabold text-center">No</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">No Order</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Code Unit</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Type Unit</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Component</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Order By</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Priority</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Remark Order</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Date Order</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">PR</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">PO</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">ETA Part</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Progress Order</th>
                                <th className="px-1.5 py-2 font-extrabold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50 text-gray-300">
                                {orders && orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <tr key={order.id} className="hover:bg-gray-700/30 transition-colors text-[10px]">
                                            <td className="px-1.5 py-2 text-center text-gray-500">{index + 1}</td>
                                            <td className="px-1.5 py-2 text-center text-green-400 font-bold tracking-tight">
                                                <button onClick={() => openViewModal(order)} className="hover:underline hover:text-green-300 transition-colors">
                                                    {order.no_order}
                                                </button>
                                            </td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">{order.unit?.code_unit || 'Consumables'}</td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">{order.unit?.model || 'Excavator'}</td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">
                                                {order.parts && order.parts.length > 0 
                                                    ? [...new Set(order.parts.map(p => p.component).filter(Boolean))].join(', ') || '-'
                                                    : '-'}
                                            </td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">{order.pic || '-'}</td>
                                            <td className="px-1.5 py-2 text-center">{getPriorityBadge(order.priority)}</td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">{order.lokasi || '-'}</td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">{new Date(order.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">
                                                {order.parts && order.parts.length > 0 
                                                    ? [...new Set(order.parts.map(p => p.pr).filter(Boolean))].join(', ') || '-'
                                                    : '-'}
                                            </td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">
                                                {order.parts && order.parts.length > 0 
                                                    ? [...new Set(order.parts.map(p => p.po).filter(Boolean))].join(', ') || '-'
                                                    : '-'}
                                            </td>
                                            <td className="px-1.5 py-2 text-center text-gray-300">
                                                {order.parts && order.parts.length > 0 
                                                    ? [...new Set(order.parts.map(p => p.due_date_part ? new Date(p.due_date_part).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null).filter(Boolean))].join(', ') || '-'
                                                    : '-'}
                                            </td>
                                            <td className="px-1.5 py-2 text-center">{getProgressBadge(order.status)}</td>
                                            <td className="px-1.5 py-2 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {order.image && (
                                                        <a href={`/storage/${order.image}`} target="_blank" rel="noreferrer" className="p-1.5 text-yellow-400 bg-gray-900 border border-gray-700 hover:border-yellow-500 rounded transition-colors" title="View Image">
                                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
                                                        </a>
                                                    )}
                                                    <button onClick={() => openViewModal(order)} className="p-1.5 text-blue-400 bg-gray-900 border border-gray-700 hover:border-blue-500 rounded transition-colors" title="View">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                    </button>
                                                    <button onClick={() => openEditModal(order)} className="p-1.5 text-green-400 bg-gray-900 border border-gray-700 hover:border-green-500 rounded transition-colors" title="Edit">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(order.id)} className="p-1.5 text-red-400 bg-gray-900 border border-gray-700 hover:border-red-500 rounded transition-colors" title="Delete">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="16" className="px-6 py-10 text-center text-gray-500 font-medium">
                                            Tidak ada data Order yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination / Footer */}
                        <div className="px-6 py-4 flex justify-between items-center text-xs text-gray-400 bg-gray-800 border-t border-gray-700">
                            <div className="font-medium">
                                Showing all {orders ? orders.length : 0} entries
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
                    <div className="bg-[#111827] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-gray-700/60 w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all text-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="px-5 py-3.5 flex items-center justify-between bg-[#0f172a] border-b border-gray-700/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-white text-sm tracking-widest uppercase">Create New Order</h3>
                                    <p className="text-[9px] text-gray-500">Buat order permintaan part atau perbaikan unit</p>
                                </div>
                            </div>
                            <button onClick={closeAddModal} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40 rounded-lg transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                            <form onSubmit={submitAdd}>

                                {/* SECTION 1: INFORMASI ORDER */}
                                <div className="bg-[#0f172a] border border-gray-700/60 rounded-xl overflow-hidden mb-3">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/50 bg-gray-800/20">
                                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                        <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest">Informasi Order</span>
                                    </div>
                                    <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                        {/* Tanggal Order */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Order <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} required className="w-full bg-transparent text-white text-xs outline-none [color-scheme:dark]" />
                                            </div>
                                        </div>
                                        {/* Pilih Unit */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pilih Unit <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h2l3-5H4m9 5h2"/></svg>
                                                <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} required className="w-full bg-gray-900 text-white text-xs outline-none">
                                                    <option value="">-- Pilih Unit --</option>
                                                    <option value="CONSUMABLES">Consumables</option>
                                                    <option value="ATK">ATK</option>
                                                    {units?.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {/* Hour Meter */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hour Meter (HM)</label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                <input type="text" value={data.hm} onChange={e => setData('hm', e.target.value)} placeholder="e.g. 15.000" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                            </div>
                                        </div>
                                        {/* Component */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Component <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                                                 <select value={data.parts[0]?.component || ''} onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], component: e.target.value }; setData('parts', p); }} className="w-full bg-gray-900 text-white text-xs outline-none">
                                                    <option value="">-- Pilih Component --</option>
                                                    <option value="AC SYSTEM">AC SYSTEM</option>
                                                    <option value="ACCESSORIES">ACCESSORIES</option>
                                                    <option value="ACCIDENT">ACCIDENT</option>
                                                    <option value="AIR SYSTEM">AIR SYSTEM</option>
                                                    <option value="ATTACHMENT">ATTACHMENT</option>
                                                    <option value="AUTOLUBE">AUTOLUBE</option>
                                                    <option value="BATTERY">BATTERY</option>
                                                    <option value="BLADE">BLADE</option>
                                                    <option value="BRAKE SYSTEM">BRAKE SYSTEM</option>
                                                    <option value="BUCKET">BUCKET</option>
                                                    <option value="CABIN">CABIN</option>
                                                    <option value="CLUTCH">CLUTCH</option>
                                                    <option value="COOLING SYSTEM">COOLING SYSTEM</option>
                                                    <option value="DAMPER">DAMPER</option>
                                                    <option value="DIFFERENTIAL">DIFFERENTIAL</option>
                                                    <option value="ELECTRIC SYSTEM">ELECTRIC SYSTEM</option>
                                                    <option value="ENGINE">ENGINE</option>
                                                    <option value="FINAL DRIVE">FINAL DRIVE</option>
                                                    <option value="FRAME/BODY/GUARD/CHASSIS">FRAME/BODY/GUARD/CHASSIS</option>
                                                    <option value="FRONT AXLE">FRONT AXLE</option>
                                                    <option value="FUEL SYSTEM">FUEL SYSTEM</option>
                                                    <option value="GET">GET</option>
                                                    <option value="GREASING">GREASING</option>
                                                    <option value="HOSES">HOSES</option>
                                                    <option value="HYDRAULIC SYSTEM">HYDRAULIC SYSTEM</option>
                                                    <option value="INTAKE &amp; EXHAUST SYSTEM">INTAKE &amp; EXHAUST SYSTEM</option>
                                                    <option value="LEVEL OIL/COOLANT">LEVEL OIL/COOLANT</option>
                                                    <option value="MAINTENANCE/SERVICE">MAINTENANCE/SERVICE</option>
                                                    <option value="PROPELLER SHAFT">PROPELLER SHAFT</option>
                                                    <option value="PTO">PTO</option>
                                                    <option value="RADIATOR">RADIATOR</option>
                                                    <option value="RADIO">RADIO</option>
                                                    <option value="REAR AXLE">REAR AXLE</option>
                                                    <option value="STEERING SYSTEM">STEERING SYSTEM</option>
                                                    <option value="SUSPENSION">SUSPENSION</option>
                                                    <option value="SWING">SWING</option>
                                                    <option value="TAIL GATE">TAIL GATE</option>
                                                    <option value="TRANSMISSION">TRANSMISSION</option>
                                                    <option value="TYRE">TYRE</option>
                                                    <option value="UNDERCARRIAGE">UNDERCARRIAGE</option>
                                                    <option value="VESSEL">VESSEL</option>
                                                    <option value="WASHING">WASHING</option>
                                                    <option value="WATER CANON/SPRAYER">WATER CANON/SPRAYER</option>
                                                    <option value="WHEEL &amp; HUB">WHEEL &amp; HUB</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Lokasi */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lokasi / Location <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                <input type="text" value={data.lokasi} onChange={e => setData('lokasi', e.target.value)} required placeholder="e.g. Pit 1" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                            </div>
                                        </div>
                                        {/* Priority */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                                                <select value={data.priority} onChange={e => setData('priority', e.target.value)} required className="w-full bg-gray-900 text-white text-xs outline-none">
                                                    <option value="HIGH">P1 (Tinggi)</option>
                                                    <option value="MEDIUM">P2 (Normal)</option>
                                                    <option value="LOW">BACKLOG (Next Service)</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Progress Order */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Progress Order <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                                                 <select value={data.status} onChange={e => setData('status', e.target.value)} required className="w-full bg-gray-900 text-white text-xs outline-none">
                                                    <option value="OPEN">Waiting Part</option>
                                                    <option value="CANCEL">Supply Partial</option>
                                                    <option value="CLOSED">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Order By PIC */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order By (PIC) <span className="text-red-400">*</span></label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                <input type="text" value={data.pic} onChange={e => setData('pic', e.target.value)} placeholder="Nama PIC / Mekanik / Planner" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                            </div>
                                        </div>
                                        {/* No Order */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. Order</label>
                                            <div className="flex items-center gap-1.5 bg-gray-800/30 border border-gray-700/40 rounded-lg px-2.5 py-1.5">
                                                <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                                                <input type="text" readOnly placeholder="Auto Generate" className="w-full bg-transparent text-gray-500 text-xs outline-none cursor-not-allowed placeholder-gray-600" />
                                            </div>
                                        </div>
                                        {/* Remark */}
                                        <div className="col-span-2 md:col-span-3">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remark / Keterangan</label>
                                            <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                                                <input type="text" placeholder="Tuliskan keterangan order (opsional)" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: PARTS INFORMATION */}
                                <div className="bg-[#0f172a] border border-gray-700/60 rounded-xl overflow-hidden mb-3">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 bg-gray-800/20">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                            <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest">Parts Information</span>
                                        </div>
                                        <button type="button" onClick={addPartRow} className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 hover:border-green-500/60 transition-all">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                            Tambah Part
                                        </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-[2fr_2fr_1.2fr_0.8fr_0.8fr_36px] gap-2 px-1">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Part Number <span className="text-red-400">*</span></span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Description <span className="text-red-400">*</span></span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Life Time</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Qty <span className="text-red-400">*</span></span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Satuan</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Act</span>
                                        </div>

                                        {data.parts.map((part, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="grid grid-cols-[2fr_2fr_1.2fr_0.8fr_0.8fr_36px] gap-2 items-center">
                                                    {/* Part Number */}
                                                    <div>
                                                        <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                            <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                                                            <input type="text" value={part.part_number} onChange={e => { const p = [...data.parts]; p[index].part_number = e.target.value; setData('parts', p); }} onBlur={e => checkPartHistory(e.target.value, index)} placeholder="e.g. 14X-27-11110" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                                        </div>
                                                        {/* History warning */}
                                                        {partHistories[index] && partHistories[index].length > 0 && (
                                                            <div className="mt-0.5 p-1 bg-yellow-900/20 border border-yellow-700/40 rounded text-[9px]">
                                                                <div className="text-yellow-500 font-bold flex items-center gap-1">
                                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                                                    Pernah Diorder!
                                                                </div>
                                                                <ul className="text-gray-300 pl-3 list-disc">
                                                                    {partHistories[index].map((h, i) => (
                                                                        <li key={i} className="cursor-pointer hover:text-green-400" onClick={() => openViewModal(h)}>
                                                                            <span className="text-white font-semibold">{h.no_order}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Description */}
                                                    <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                        <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                                                        <input type="text" value={part.department} onChange={e => { const p = [...data.parts]; p[index].department = e.target.value; setData('parts', p); }} required placeholder="e.g. Service 500 Hr" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                                    </div>
                                                    {/* Life Time */}
                                                    <div className="flex items-center gap-1 bg-gray-900/30 border border-gray-600/30 rounded-lg px-2 py-1.5 h-[30px]">
                                                        <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                        <span className="text-green-400 font-bold text-xs">{calculateLifeTime(index, data.hm)}</span>
                                                    </div>
                                                    {/* Qty */}
                                                    <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/20 hover:border-gray-500 transition-all">
                                                        <input type="number" min="1" value={part.qty || ''} onChange={e => { const p = [...data.parts]; p[index].qty = e.target.value; setData('parts', p); }} placeholder="1" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                                    </div>
                                                    {/* Satuan */}
                                                    <div className="flex items-center bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 hover:border-gray-500 transition-all">
                                                        <select value={part.satuan || 'PCS'} onChange={e => { const p = [...data.parts]; p[index].satuan = e.target.value; setData('parts', p); }} className="w-full bg-gray-900 text-white text-xs outline-none">
                                                            <option value="PCS">PCS</option>
                                                            <option value="SET">SET</option>
                                                            <option value="LITER">Liter</option>
                                                            <option value="PACK">PACK</option>
                                                            <option value="METER">METER</option>
                                                            <option value="KG">KG</option>
                                                        </select>
                                                    </div>
                                                    {/* Delete */}
                                                    <button type="button" onClick={() => removePartRow(index)} disabled={data.parts.length === 1} className="flex items-center justify-center w-[30px] h-[30px] bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add more button */}
                                        <button type="button" onClick={addPartRow} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold text-gray-500 border border-dashed border-gray-600/50 rounded-lg hover:border-green-500/40 hover:text-green-400 hover:bg-green-500/5 transition-all">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                            + Tambah Part Lainnya
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION 3: INFORMASI TAMBAHAN */}
                                <div className="bg-[#0f172a] border border-gray-700/60 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/50 bg-gray-800/20">
                                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest">Informasi Tambahan</span>
                                    </div>
                                    <div className="p-3">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-2.5">
                                            {/* Swap To Unit */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Swap To Unit</label>
                                                <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 hover:border-gray-500 transition-all">
                                                    <select value={data.parts[0]?.swap_to_unit_id || ''} onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], swap_to_unit_id: e.target.value }; setData('parts', p); }} className="w-full bg-transparent text-white text-xs outline-none">
                                                        <option value="">-- Pilih Unit Swap --</option>
                                                        {units?.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            {/* PR */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">PR (Purchase Request)</label>
                                                <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 hover:border-gray-500 transition-all">
                                                    <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                    <input type="text" value={data.parts[0]?.pr || ''} onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], pr: e.target.value }; setData('parts', p); }} placeholder="e.g. PR-12345" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                                </div>
                                            </div>
                                            {/* PO */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">PO (Purchase Order)</label>
                                                <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 hover:border-gray-500 transition-all">
                                                    <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                                                    <input type="text" value={data.parts[0]?.po || ''} onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], po: e.target.value }; setData('parts', p); }} placeholder="e.g. PO-67890" className="w-full bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                                                </div>
                                            </div>
                                            {/* ETA Part Date */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">ETA Part Date</label>
                                                <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-2 py-1.5 focus-within:border-green-500 hover:border-gray-500 transition-all">
                                                    <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    <input type="date" value={data.parts[0]?.due_date_part || ''} onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], due_date_part: e.target.value }; setData('parts', p); }} className="w-full bg-transparent text-white text-xs outline-none [color-scheme:dark]" />
                                                </div>
                                            </div>
                                            {/* Upload Gambar - spans 2 rows */}
                                            <div className="row-span-2">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upload Gambar / Foto</label>
                                                <label className="flex flex-col items-center justify-center h-[calc(100%-18px)] min-h-[72px] bg-gray-900/40 border-2 border-dashed border-gray-600/50 rounded-xl cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
                                                    <svg className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    <span className="text-[8px] text-gray-500 group-hover:text-gray-400 text-center px-2">Klik atau drag file kesini<br/><span className="text-gray-600">JPG, PNG max. 5MB</span></span>
                                                    <input type="file" accept="image/*" onChange={e => { const p = [...data.parts]; p[0] = { ...p[0], image: e.target.files[0] }; setData('parts', p); }} className="hidden" />
                                                </label>
                                            </div>
                                            {/* Kondisi / Problem */}
                                            <div className="col-span-2 md:col-span-4">
                                                <label className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    Kondisi / Problem
                                                </label>
                                                <textarea rows={3} placeholder="Jelaskan kondisi / kerusakan unit secara detail..." className="w-full bg-gray-900/60 border border-gray-600/50 text-white text-xs rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all placeholder-gray-600 resize-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-700/60 px-5 py-3 bg-[#0f172a] flex justify-between items-center shrink-0">
                            <button type="button" onClick={closeAddModal} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                Batal
                            </button>
                            <div className="flex items-center gap-2">
                                {/* Simpan Draft */}
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => submitWithStatus('DRAFT')}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/60 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                    Simpan Draft
                                </button>
                                {/* Simpan Order */}
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => submitWithStatus('OPEN')}
                                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-600 to-[#0b5c3e] rounded-lg hover:from-green-500 hover:to-[#0d7a52] shadow-[0_0_20px_rgba(11,92,62,0.4)] hover:shadow-[0_0_30px_rgba(11,92,62,0.6)] transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                                            Simpan Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Modal Import Excel - Dark Theme */}
            {showImportModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
                    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden transform transition-all text-gray-200">
                                <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                        <h3 className="font-bold text-lg text-white">Import Data Excel</h3>
                                    </div>
                                    <button onClick={closeImportModal} className="text-gray-400 hover:text-gray-200 transition-colors bg-gray-800 hover:bg-gray-700 p-1 rounded-full">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <form onSubmit={submitImport} className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-300 mb-2">Pilih File Excel (.xlsx, .xls, .csv)</label>
                                        <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={e => setImportData('file', e.target.files[0])} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-700 file:text-blue-400 hover:file:bg-gray-600 transition-all border border-gray-700 bg-gray-900 rounded-lg cursor-pointer" required />
                                        {importErrors.file && <span className="text-xs text-red-500 mt-2 block">{importErrors.file}</span>}
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-700">
                                        <button type="button" onClick={closeImportModal} className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={importProcessing} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                            {importProcessing ? 'Mengimpor...' : 'Mulai Import'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    , document.body)}

                    {/* Modal Edit Order - Dark Theme */}
                    {showEditModal && createPortal(
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
                            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all text-gray-200">
                                <div className="border-b border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                                    <h3 className="font-bold text-white text-lg">Edit Order</h3>
                                    <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-200 transition-colors bg-gray-900 hover:bg-gray-700 p-1 rounded-full">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <form onSubmit={submitEdit} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2.5 mb-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">No. Order</label>
                                            <input type="text" value={editData.no_order} readOnly className="w-full bg-gray-900 border border-gray-700 text-gray-500 text-sm rounded-lg px-3 py-2.5 outline-none cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tanggal</label>
                                            <input type="date" value={editData.tanggal} onChange={e => setEditData('tanggal', e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner [color-scheme:dark]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Unit</label>
                                            <select value={editData.unit_id} onChange={e => setEditData('unit_id', e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner">
                                                <option value="">-- Pilih Unit --</option>
                                                <option value="CONSUMABLES">Consumables</option>
                                                {units?.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hour Meter (HM)</label>
                                            <input type="text" value={editData.hm} onChange={e => setEditData('hm', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" placeholder="e.g. 15000" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lokasi / Remark</label>
                                            <input type="text" value={editData.lokasi} onChange={e => setEditData('lokasi', e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Priority</label>
                                            <select value={editData.priority} onChange={e => setEditData('priority', e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner">
                                                <option value="HIGH">P1 (Tinggi)</option>
                                                <option value="MEDIUM">P2 (Normal)</option>
                                                <option value="LOW">BACKLOG (Next Service)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order By (PIC)</label>
                                            <input type="text" value={editData.pic} onChange={e => setEditData('pic', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Progress Order</label>
                                            <select value={editData.status} onChange={e => setEditData('status', e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner">
                                                <option value="OPEN">WAITING PART</option>
                                                <option value="PROCESS">WAITING PART</option>
                                                <option value="CLOSED">COMPLETED</option>
                                                <option value="CANCEL">CANCEL ORDER</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-700/80 pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <h4 className="font-extrabold text-white text-sm">Parts Information</h4>
                                            </div>
                                            <button type="button" onClick={addEditPartRow} className="bg-gray-800 text-green-400 border border-green-500/30 text-[10px] px-2 py-1 rounded-lg font-bold hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 flex items-center gap-1 shadow-sm">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                                Tambah Part
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {editData.parts.map((part, index) => (
                                                <div key={index} className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/60 relative group hover:border-gray-600 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                                                    {editData.parts.length > 1 && (
                                                        <button type="button" onClick={() => removeEditPartRow(index)} className="absolute -top-2 -right-2 text-gray-400 hover:text-white bg-gray-900 border border-red-500/30 hover:bg-red-500 hover:border-red-500 rounded-full p-1 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg scale-90 group-hover:scale-100 z-10">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                        </button>
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-2 gap-y-2">
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Part Number</label>
                                                            <input type="text" value={part.part_number || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].part_number = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Qty</label>
                                                            <input type="number" min="1" value={part.qty || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].qty = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Component</label>
                                                            <input type="text" value={part.component || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].component = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Description</label>
                                                            <input type="text" value={part.department || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].department = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                required className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Swap To Unit</label>
                                                            <select value={part.swap_to_unit_id || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].swap_to_unit_id = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner">
                                                                <option value="">-</option>
                                                                {units?.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PR (Opsional)</label>
                                                            <input type="text" value={part.pr || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].pr = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PO (Opsional)</label>
                                                            <input type="text" value={part.po || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].po = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner placeholder-gray-600" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Eta Part date</label>
                                                            <input type="date" value={part.due_date_part || ''} 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].due_date_part = e.target.value;
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                className="w-full bg-gray-900/50 border border-gray-600/50 text-white text-xs rounded-lg px-2.5 py-1.5 focus:bg-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-500 outline-none transition-all duration-300 shadow-inner [color-scheme:dark]" />
                                                        </div>
                                                        <div className="md:col-span-4">
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ganti Gambar (Opsional)</label>
                                                            <input type="file" 
                                                                onChange={e => {
                                                                    const newParts = [...editData.parts];
                                                                    newParts[index].image = e.target.files[0];
                                                                    setEditData('parts', newParts);
                                                                }} 
                                                                accept="image/*" className="block w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gray-700/50 file:text-green-400 hover:file:bg-gray-600/50 transition-all border border-gray-700/50 bg-gray-900/50 rounded-lg cursor-pointer" />
                                                            {editErrors[`parts.${index}.image`] && <span className="text-[10px] text-red-400 mt-1 block">{editErrors[`parts.${index}.image`]}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-700">
                                        <button type="button" onClick={closeEditModal} className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={editProcessing} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                            {editProcessing ? 'Saving...' : 'Update Order'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    , document.body)}

                    {/* Modal View Order - Dark Theme */}
                    {showViewModal && selectedOrder && createPortal(
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
                            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-700/80 w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all text-gray-200 flex flex-col">
                                <div className="border-b border-gray-700/80 px-5 py-2.5 flex justify-between items-center bg-gray-800/50 backdrop-blur-md z-10 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg border border-blue-500/20">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-base tracking-tight">Detail Order</h3>
                                            <p className="text-[9px] text-green-400 font-bold tracking-wider">{selectedOrder.no_order}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white transition-all bg-gray-900/50 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent p-1 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-3 gap-y-2">
                                            <div className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/40 shadow-inner">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">No. Order</label>
                                                <div className="text-xs font-bold text-green-400">{selectedOrder.no_order}</div>
                                            </div>
                                            <div className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/40 shadow-inner">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tanggal</label>
                                                <div className="text-xs font-semibold text-white">{new Date(selectedOrder.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                            </div>
                                            <div className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/40 shadow-inner">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Unit</label>
                                                <div className="text-xs font-semibold text-white">{selectedOrder.unit?.code_unit || 'Consumables'} <span className="text-gray-400 font-normal">({selectedOrder.unit?.model || '-'})</span></div>
                                            </div>
                                            <div className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/40 shadow-inner">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hour Meter (HM)</label>
                                                <div className="text-xs font-semibold text-white">{selectedOrder.hm || '-'}</div>
                                            </div>
                                            
                                            <div className="mt-4 col-span-1 md:col-span-4 bg-gray-800/40 p-3 rounded-lg border border-gray-700/40 shadow-inner overflow-x-auto">
                                                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2 border-b border-gray-700/50 pb-1">Daftar Part yang Diorder</label>
                                                <table className="w-full text-left text-[10px] text-gray-300">
                                                    <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                                                        <tr>
                                                            <th className="px-2 py-1.5 font-bold text-center">No</th>
                                                            <th className="px-2 py-1.5 font-bold">Part Number</th>
                                                            <th className="px-2 py-1.5 font-bold text-center">Qty</th>
                                                            <th className="px-2 py-1.5 font-bold">Component</th>
                                                            <th className="px-2 py-1.5 font-bold">Description</th>
                                                            <th className="px-2 py-1.5 font-bold">Swap To Unit</th>
                                                            <th className="px-2 py-1.5 font-bold">PR</th>
                                                            <th className="px-2 py-1.5 font-bold">PO</th>
                                                            <th className="px-2 py-1.5 font-bold">ETA Part</th>
                                                            <th className="px-2 py-1.5 font-bold text-center">Gambar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700/50">
                                                        {selectedOrder.parts && selectedOrder.parts.length > 0 ? (
                                                            selectedOrder.parts.map((part, index) => (
                                                                <tr key={index} className="hover:bg-gray-700/30">
                                                                    <td className="px-2 py-1.5 text-center">{index + 1}</td>
                                                                    <td className="px-2 py-1.5 font-semibold text-white">{part.part_number || '-'}</td>
                                                                    <td className="px-2 py-1.5 text-center">{part.qty || '-'}</td>
                                                                    <td className="px-2 py-1.5">{part.component || '-'}</td>
                                                                    <td className="px-2 py-1.5">{part.department || '-'}</td>
                                                                    <td className="px-2 py-1.5 text-blue-400">{part.swap_to_unit?.code_unit || part.swap_to_unit_id || '-'}</td>
                                                                    <td className="px-2 py-1.5 text-yellow-400">{part.pr || '-'}</td>
                                                                    <td className="px-2 py-1.5 text-green-400">{part.po || '-'}</td>
                                                                    <td className="px-2 py-1.5">{part.due_date_part ? new Date(part.due_date_part).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
                                                                    <td className="px-2 py-1.5 text-center">
                                                                        {part.image ? (
                                                                            <a href={`/storage/${part.image}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300" title="Lihat Gambar">
                                                                                <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                            </a>
                                                                        ) : '-'}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="10" className="px-2 py-4 text-center text-gray-500 italic">Tidak ada data part.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-700/80 px-5 py-3 bg-gray-800/80 backdrop-blur-md flex justify-end gap-2 shrink-0">
                                    <button type="button" onClick={() => setShowViewModal(false)} className="px-5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2">
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    , document.body)}
        </AuthenticatedLayout>
    );
    }
