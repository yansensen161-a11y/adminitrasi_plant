import React, { useState, useRef, useEffect } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Index({ orders, units, filters, nextNoOrder }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('ORDERAN AKTIF');

    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sortBy || 'terbaru');

    // Per-column filters (client-side)
    const [colFilter, setColFilter] = useState({
        no_order: '', code_unit: '', type_unit: '', component: '',
        order_by: '', priority: '', swap_to_unit: '', date: '',
        pr: '', po: '', eta_part: '', progress: ''
    });
    const setCol = (key, val) => setColFilter(prev => ({ ...prev, [key]: val }));
    const resetColFilters = () => setColFilter({ no_order:'', code_unit:'', type_unit:'', component:'', order_by:'', priority:'', swap_to_unit:'', date:'', pr:'', po:'', eta_part:'', progress:'' });

    const handleFilter = (e) => {
        if(e) e.preventDefault();
        router.get(route('monitoring-orderan.index'), {
            dateFrom, dateTo, search, status: statusFilter, sortBy
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom(''); setDateTo(''); setSearch(''); setStatusFilter(''); setSortBy('terbaru');
        router.get(route('monitoring-orderan.index'), {}, { preserveState: true });
    };

    // FORM
    const [editMode, setEditMode] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_order: '',
        tanggal: new Date().toISOString().split('T')[0],
        unit_id: '',
        hm: '',
        component: '',
        lokasi: '',
        priority: 'BACKLOG',
        status: 'WAITING PART',
        pic: '',
        action_taken: '', // Remark / Keterangan
        root_cause: '', // Kondisi / Problem
        parts: [
            { part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }
        ]
    });

    const handleAddPart = () => {
        setData('parts', [...data.parts, { part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }]);
    };

    const handleRemovePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
    };

    const handlePartChange = (index, field, value) => {
        const newParts = [...data.parts];
        newParts[index][field] = value;
        setData('parts', newParts);
    };

    const handlePartNumberBlur = async (index) => {
        const partNumber = data.parts[index].part_number;
        const unitId = data.unit_id;
        const currentHm = data.hm;
        const orderId = selectedOrderId;

        if (partNumber && unitId && !['ATK', 'CONSUMABLE', 'TOOL'].includes(unitId)) {
            try {
                const response = await axios.get(route('monitoring-orderan.part-lifetime'), {
                    params: { unit_id: unitId, part_number: partNumber, current_hm: currentHm, order_id: orderId }
                });
                
                if (response.data.life_time !== null) {
                    const newParts = [...data.parts];
                    newParts[index].life_time = response.data.life_time;
                    setData('parts', newParts);
                }
            } catch (error) {
                console.error("Failed to fetch part lifetime", error);
            }
        }
    };

    useEffect(() => {
        const fetchHm = async () => {
            if (data.unit_id && data.tanggal && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
                try {
                    const response = await axios.get('/api/get-hm', {
                        params: { unit_id: data.unit_id, date: data.tanggal }
                    });
                    if (response.data.hm !== null) {
                        setData('hm', response.data.hm);
                    }
                } catch (error) {
                    console.error("Failed to fetch HM", error);
                }
            }
        };

        if (showCreateModal) {
            fetchHm();
        }
    }, [data.unit_id, data.tanggal, showCreateModal]);

    const handleUnitChange = (e) => {
        const val = e.target.value;
        const selectedUnit = units.find(u => u.id == val);
        
        setData(prev => ({
            ...prev,
            unit_id: val
        }));
    };

    const handleEdit = (order) => {
        setEditMode(true);
        setSelectedOrderId(order.id);
        
        let derivedUnitId = order.unit_id;
        let derivedLokasi = order.lokasi || '';
        if (!derivedUnitId && order.lokasi) {
            const nonUnits = ['ATK', 'CONSUMABLE', 'TOOL'];
            const found = nonUnits.find(v => order.lokasi.toUpperCase().startsWith(v));
            if (found) {
                derivedUnitId = found;
                // Strip the prefix (e.g. "ATK - " or "ATK") so it doesn't duplicate on save
                let prefixRegex = new RegExp(`^${found}\\s*(-\\s*)?`, 'i');
                derivedLokasi = derivedLokasi.replace(prefixRegex, '').trim();
            }
        }

        setData({
            no_order: order.no_order || '',
            tanggal: order.tanggal,
            unit_id: derivedUnitId || '',
            hm: order.hm || '',
            component: order.component || (order.parts && order.parts[0]?.component) || (order.parts && order.parts[0]?.department) || '',
            lokasi: derivedLokasi,
            priority: order.priority || 'BACKLOG',
            status: order.status || 'WAITING PART',
            pic: order.pic || '',
            action_taken: order.action_taken || '',
            root_cause: order.root_cause || '',
            parts: order.parts && order.parts.length > 0 ? order.parts.map(p => ({
                part_number: p.part_number || '',
                description: p.department || '',
                life_time: p.life_time || '',
                qty: p.qty || 1,
                satuan: 'Pcs',
                pr: p.pr || '',
                po: p.po || '',
                due_date_part: p.due_date_part || '',
                swap_to_unit_id: p.swap_to_unit_id || ''
            })) : [{ part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }]
        });
        
        setShowCreateModal(true);
    };

    const handleView = (order) => {
        // We'll reuse the edit form but just as a view mode (could also disable inputs)
        handleEdit(order);
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setSelectedOrderId(null);
        setShowCreateModal(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        if (editMode && selectedOrderId) {
            put(route('monitoring-orderan.update', selectedOrderId), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
                onError: (errs) => {
                    console.error("Update errors:", errs);
                    alert("Gagal menyimpan data. Periksa error: \n" + Object.values(errs).join('\n'));
                }
            });
        } else {
            post(route('monitoring-orderan.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
                onError: (errs) => {
                    console.error("Store errors:", errs);
                    alert("Gagal membuat data. Periksa error: \n" + Object.values(errs).join('\n'));
                }
            });
        }
    };

    const deleteOrder = (id) => {
        if(confirm('Apakah Anda yakin ingin menghapus order ini?')) {
            router.delete(route('monitoring-orderan.destroy', id));
        }
    };

    const deleteAll = () => {
        if (confirm('⚠️ PERINGATAN ⚠️\n\nApakah Anda benar-benar yakin ingin MENGHAPUS SEMUA DATA Work Order? Tindakan ini tidak dapat dikembalikan!')) {
            router.delete(route('monitoring-orderan.destroy-all'));
        }
    };

    const fileInputRef = useRef(null);
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            router.post(route('monitoring-orderan.import'), formData, {
                onSuccess: () => {
                    if(fileInputRef.current) fileInputRef.current.value = '';
                    alert('Proses impor berhasil diproses! Silakan periksa perubahan data Anda.');
                },
                onError: (errs) => {
                    if(fileInputRef.current) fileInputRef.current.value = '';
                    alert('Terdapat masalah saat impor:\n' + Object.values(errs).join('\n'));
                }
            });
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('monitoring-orderan.download-template') + '?t=' + new Date().getTime();
    };

    const tabs = ['ORDERAN AKTIF', 'CANCEL ORDER', 'BACKLOG', 'HISTORICAL ORDER'];

    const getStatusBadge = (status) => {
        if(status === 'WAITING PART') return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">WAITING PART</span>;
        if(status === 'COMPLETED') return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">COMPLETED</span>;
        if(status === 'PARTIAL') return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">PARTIAL</span>;
        if(status === 'CANCEL ORDER') return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">CANCEL ORDER</span>;
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">{status}</span>;
    };

    const getPriorityBadge = (prio) => {
        if(prio === 'HIGH' || prio === 'P1') return <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">P1</span>;
        if(prio === 'MEDIUM' || prio === 'P2') return <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">P2</span>;
        if(prio === 'LOW') return <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">P3</span>;
        if(prio === 'BACKLOG') return <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">BACKLOG</span>;
        return <span>{prio}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Order List" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Monitoring Order List</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="text-green-600">Home</span> &gt; <span>Planner</span> &gt; <span>Monitoring Order List</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={deleteAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition" title="Hapus Semua Data">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls" />
                        
                        <button onClick={handleDownloadTemplate} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition" title="Download Template">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Template
                        </button>

                        <button onClick={handleImportClick} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition" title="Import Data">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Import
                        </button>

                        <Link href={route('monitoring-orderan.create')} className="bg-[#0f5132] hover:bg-[#146c43] text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Create Order
                        </Link>
                        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Export Excel
                        </button>
                        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'ORDERAN AKTIF' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                            {tab === 'CANCEL ORDER' && <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {tab === 'BACKLOG' && <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>}
                            {tab === 'HISTORICAL ORDER' && <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {tab}
                        </button>
                    ))}
                </div>



                <div className="flex flex-wrap items-center gap-4 text-sm mb-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-700 uppercase">PROGRESS ORDER :</span>
                    <div className="flex items-center gap-1.5"><span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded text-xs">WAITING PART</span> = Menunggu Part</div>
                    <div className="flex items-center gap-1.5"><span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-xs">COMPLETED</span> = Selesai (Masuk Historical)</div>
                    <div className="flex items-center gap-1.5"><span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-xs">CANCEL ORDER</span> = Dibatalkan (Masuk Historical)</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3">No Order</th>
                                <th className="px-4 py-3">Code Unit</th>
                                <th className="px-4 py-3">Type Unit</th>
                                <th className="px-4 py-3">Component</th>
                                <th className="px-4 py-3">Order By</th>
                                <th className="px-4 py-3 text-center">Priority</th>
                                <th className="px-4 py-3">Swap To Unit</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">PR</th>
                                <th className="px-4 py-3">PO</th>
                                <th className="px-4 py-3">ETA Part</th>
                                <th className="px-4 py-3 text-center">Progress Order</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-white border-b border-gray-200">
                                <th className="px-2 py-1"></th>
                                <th className="px-2 py-1"><input value={colFilter.no_order} onChange={e=>setCol('no_order',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.code_unit} onChange={e=>setCol('code_unit',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.type_unit} onChange={e=>setCol('type_unit',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.component} onChange={e=>setCol('component',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.order_by} onChange={e=>setCol('order_by',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1">
                                    <select value={colFilter.priority} onChange={e=>setCol('priority',e.target.value)} className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:ring-green-400 focus:border-green-400 font-normal">
                                        <option value="">Semua</option>
                                        <option value="HIGH">P1</option>
                                        <option value="MEDIUM">P2</option>
                                        <option value="LOW">P3</option>
                                        <option value="BACKLOG">BACKLOG</option>
                                    </select>
                                </th>
                                <th className="px-2 py-1"><input value={colFilter.swap_to_unit} onChange={e=>setCol('swap_to_unit',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input type="date" value={colFilter.date} onChange={e=>setCol('date',e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.pr} onChange={e=>setCol('pr',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input value={colFilter.po} onChange={e=>setCol('po',e.target.value)} placeholder="Cari..." className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1"><input type="date" value={colFilter.eta_part} onChange={e=>setCol('eta_part',e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-green-400 focus:border-green-400 font-normal" /></th>
                                <th className="px-2 py-1">
                                    <select value={colFilter.progress} onChange={e=>setCol('progress',e.target.value)} className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:ring-green-400 focus:border-green-400 font-normal">
                                        <option value="">Semua</option>
                                        <option value="WAITING PART">WAITING PART</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCEL ORDER">CANCEL ORDER</option>
                                    </select>
                                </th>
                                <th className="px-2 py-1 text-center">
                                    <button onClick={resetColFilters} title="Reset filter kolom" className="text-red-400 hover:text-red-600 text-[9px] font-bold border border-red-200 rounded px-1 py-0.5">✕</button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {orders.filter(order => {
                                const fp = order.parts && order.parts.length > 0 ? order.parts[0] : {};
                                const cf = colFilter;
                                const matchStr = (val, filter) => !filter || String(val || '').toLowerCase().includes(filter.toLowerCase());
                                return (
                                    matchStr(order.no_order, cf.no_order) &&
                                    matchStr(order.unit?.code_unit, cf.code_unit) &&
                                    matchStr(order.unit?.type_unit, cf.type_unit) &&
                                    matchStr(order.component || fp?.component || fp?.department, cf.component) &&
                                    matchStr(order.pic, cf.order_by) &&
                                    (!cf.priority || order.priority === cf.priority) &&
                                    matchStr(fp.swap_to_unit?.code_unit, cf.swap_to_unit) &&
                                    (!cf.date || order.tanggal === cf.date) &&
                                    matchStr(fp.pr, cf.pr) &&
                                    matchStr(fp.po, cf.po) &&
                                    (!cf.eta_part || fp.due_date_part === cf.eta_part) &&
                                    (!cf.progress || order.status === cf.progress) &&
                                    (
                                        activeTab === 'ORDERAN AKTIF' ? ['WAITING PART', 'IN PROGRESS', 'PARTIAL', 'OPEN'].includes(order.status) :
                                        activeTab === 'CANCEL ORDER' ? order.status === 'CANCEL ORDER' :
                                        activeTab === 'BACKLOG' ? order.status === 'BACKLOG' :
                                        activeTab === 'HISTORICAL ORDER' ? ['COMPLETED', 'CANCEL ORDER'].includes(order.status) : true
                                    )
                                );
                            }).map((order, idx) => {
                                const firstPart = order.parts && order.parts.length > 0 ? order.parts[0] : {};
                                return (
                                    <tr key={order.id} onClick={() => handleView(order)} onDoubleClick={() => router.visit(route('monitoring-orderan.edit', order.id))} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900">{order.no_order}</td>
                                        <td className="px-4 py-3 font-medium text-gray-700">
                                            {order.unit?.code_unit || (['ATK','CONSUMABLE','TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) || '-'}
                                        </td>
                                        <td className="px-4 py-3">{order.unit?.type_unit || '-'}</td>
                                        <td className="px-4 py-3">{order.component || firstPart.component || firstPart.department || '-'}</td>
                                        <td className="px-4 py-3">{order.pic || '-'}</td>
                                        <td className="px-4 py-3 text-center">{getPriorityBadge(order.priority)}</td>
                                        <td className="px-4 py-3 font-medium text-blue-600">{firstPart.swap_to_unit?.code_unit || '-'}</td>
                                        <td className="px-4 py-3">{order.tanggal}</td>
                                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{firstPart.pr || '-'}</td>
                                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{firstPart.po || '-'}</td>
                                        <td className="px-4 py-3">{firstPart.due_date_part || '-'}</td>
                                        <td className="px-4 py-3 text-center">{getStatusBadge(order.status)}</td>
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Link href={route('monitoring-orderan.edit', order.id)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded border border-blue-200 transition block" title="View">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </Link>
                                                <Link href={route('monitoring-orderan.edit', order.id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded border border-green-200 transition block" title="Edit">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>
                                                <button onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-red-200 transition" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
