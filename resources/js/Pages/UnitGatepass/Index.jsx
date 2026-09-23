import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Truck,
    FileText,
    Plus,
    Search,
    Printer,
    CheckCircle2,
    Clock,
    Edit3,
    Trash2,
    Calendar,
    MapPin,
    Shield,
    X,
    Download,
    Eye,
    AlertTriangle,
    ArrowRight,
    ExternalLink,
    Maximize2,
    Minimize2
} from 'lucide-react';

export default function Index({
    gatepasses = { data: [] },
    stats = { total: 0, active: 0, returned: 0, today: 0 },
    units = [],
    suggestedNo = '01',
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'ALL');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedGatepass, setSelectedGatepass] = useState(null);

    // Modal Fullscreen Controls
    const [isFormFullscreen, setIsFormFullscreen] = useState(false);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

    // Form Hook
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        gatepass_no: suggestedNo || '01',
        company_name: 'PT. MITRA ABADI MAHAKAM',
        transfer_type: 'STOCK TRANSFER - NOT FOR SALE OR RESALE',
        cst_no: 'N/A',
        lst_no: 'N/A',
        st_form_no: 'N/A',

        // FROM & TO
        from_company: 'PT. MITRA ABADI MAHAKAM',
        from_location: 'HARINDO WAHANA - KUBAR SAMARINDA KALTIM',
        to_company: 'PT. MITRA ABADI MAHAKAM',
        to_location: 'Mining Project SATUI - SUNGAI DANAU',
        kind_attn: 'Mr. Supardi Halim',

        // Courier & Receiver
        person_name: '',
        mob_no: '',
        receiver_name: '',
        wt_material: '-',
        approx_value: '-',
        gate: 'Gate 1',

        // Unit Details
        unit_id: '',
        code_unit: '',
        model: '',
        type_unit: 'DUMP TRUCK',
        no_police: '',
        unit_measure: 'Unit',
        qty_despatch: 1,
        qty_recd: '',
        engine_make: 'Mercedes Benz',
        engine_model: 'KD-MGJ',
        sn_engine: '',
        starter_alternator: 'Alongwith Starter,Alternator',
        battery_spec: 'Battery 12 Volts',
        battery_model: 'Make:-N/Av Model:- AMARON 120AH',
        battery_qty: 2,

        // Condition & Remarks Checklist
        fuel_level: 'Diesel Fuul Tank',
        oil_level: 'Oil Level ok',
        hr_mtr: '23',
        battery_condition: 'Condition ok',
        battery_performance: 'Performance :- Good',
        parts_missing: 'NIL',
        radio_rig: 'Radio Rig not Available',
        general_condition: 'Condition ok',
        apar_1: 'APAR Available',
        apar_2: 'APAR Available',
        next_service_hm: '250',

        // Signatures
        approved_by_name: 'Supardi Halim',
        approved_by_title: 'Project Manager',
        issued_by_name: '',
        issued_by_title: 'Plant / Logistic',
        checked_by_name: 'Ambo Mai',
        checked_by_title: 'Plant Superintendent',
        received_by_name: '',
        received_by_title: 'Receiver Site Representative',

        // Dates & Status
        despatch_date: new Date().toISOString().split('T')[0],
        status: 'DESPATCHED',
    });

    // Apply Filters
    const applyFilters = (newStatus = selectedStatus) => {
        router.get(route('gatepass-unit.index'), {
            search: searchTerm,
            status: newStatus,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        applyFilters(status);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('ALL');
        setDateFrom('');
        setDateTo('');
        router.get(route('gatepass-unit.index'));
    };

    // Open Create Modal
    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        clearErrors();
        reset();
        setData({
            gatepass_no: suggestedNo,
            company_name: 'PT. MITRA ABADI MAHAKAM',
            transfer_type: 'STOCK TRANSFER - NOT FOR SALE OR RESALE',
            cst_no: 'N/A',
            lst_no: 'N/A',
            st_form_no: 'N/A',
            from_company: 'PT. MITRA ABADI MAHAKAM',
            from_location: 'HARINDO WAHANA - KUBAR SAMARINDA KALTIM',
            to_company: 'PT. MITRA ABADI MAHAKAM',
            to_location: 'Mining Project SATUI - SUNGAI DANAU',
            kind_attn: 'Mr. Supardi Halim',
            person_name: '',
            mob_no: '',
            receiver_name: '',
            wt_material: '-',
            approx_value: '-',
            gate: 'Gate 1',
            unit_id: '',
            code_unit: '',
            model: '',
            type_unit: 'DUMP TRUCK',
            no_police: '',
            unit_measure: 'Unit',
            qty_despatch: 1,
            qty_recd: '',
            engine_make: 'Mercedes Benz',
            engine_model: 'KD-MGJ',
            sn_engine: '',
            starter_alternator: 'Alongwith Starter,Alternator',
            battery_spec: 'Battery 12 Volts',
            battery_model: 'Make:-N/Av Model:- AMARON 120AH',
            battery_qty: 2,
            fuel_level: 'Diesel Fuul Tank',
            oil_level: 'Oil Level ok',
            hr_mtr: '23',
            battery_condition: 'Condition ok',
            battery_performance: 'Performance :- Good',
            parts_missing: 'NIL',
            radio_rig: 'Radio Rig not Available',
            general_condition: 'Condition ok',
            apar_1: 'APAR Available',
            apar_2: 'APAR Available',
            next_service_hm: '250',
            approved_by_name: 'Supardi Halim',
            approved_by_title: 'Project Manager',
            issued_by_name: '',
            issued_by_title: 'Plant / Logistic',
            checked_by_name: 'Ambo Mai',
            checked_by_title: 'Plant Superintendent',
            received_by_name: '',
            received_by_title: 'Receiver Site Representative',
            despatch_date: new Date().toISOString().split('T')[0],
            status: 'DESPATCHED',
        });
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (gp) => {
        setModalMode('edit');
        setEditingId(gp.id);
        clearErrors();
        setData({
            gatepass_no: gp.gatepass_no || '',
            company_name: gp.company_name || 'PT. MITRA ABADI MAHAKAM',
            transfer_type: gp.transfer_type || 'STOCK TRANSFER - NOT FOR SALE OR RESALE',
            cst_no: gp.cst_no || 'N/A',
            lst_no: gp.lst_no || 'N/A',
            st_form_no: gp.st_form_no || 'N/A',
            from_company: gp.from_company || 'PT. MITRA ABADI MAHAKAM',
            from_location: gp.from_location || 'HARINDO WAHANA - KUBAR SAMARINDA KALTIM',
            to_company: gp.to_company || 'PT. MITRA ABADI MAHAKAM',
            to_location: gp.to_location || 'Mining Project SATUI - SUNGAI DANAU',
            kind_attn: gp.kind_attn || 'Mr. Supardi Halim',
            person_name: gp.person_name || gp.driver_name || '',
            mob_no: gp.mob_no || '',
            receiver_name: gp.receiver_name || '',
            wt_material: gp.wt_material || '-',
            approx_value: gp.approx_value || '-',
            gate: gp.gate || 'Gate 1',
            unit_id: gp.unit_id || '',
            code_unit: gp.code_unit || '',
            model: gp.model || '',
            type_unit: gp.type_unit || '',
            no_police: gp.no_police || '',
            unit_measure: gp.unit_measure || 'Unit',
            qty_despatch: gp.qty_despatch ?? 1,
            qty_recd: gp.qty_recd ?? '',
            engine_make: gp.engine_make || '',
            engine_model: gp.engine_model || '',
            sn_engine: gp.sn_engine || '',
            starter_alternator: gp.starter_alternator || 'Alongwith Starter,Alternator',
            battery_spec: gp.battery_spec || 'Battery 12 Volts',
            battery_model: gp.battery_model || 'Make:-N/Av Model:- AMARON 120AH',
            battery_qty: gp.battery_qty ?? 2,
            fuel_level: gp.fuel_level || 'Diesel Fuul Tank',
            oil_level: gp.oil_level || 'Oil Level ok',
            hr_mtr: gp.hr_mtr || '',
            battery_condition: gp.battery_condition || 'Condition ok',
            battery_performance: gp.battery_performance || 'Performance :- Good',
            parts_missing: gp.parts_missing || 'NIL',
            radio_rig: gp.radio_rig || 'Radio Rig not Available',
            general_condition: gp.general_condition || 'Condition ok',
            apar_1: gp.apar_1 || 'APAR Available',
            apar_2: gp.apar_2 || 'APAR Available',
            next_service_hm: gp.next_service_hm || '250',
            approved_by_name: gp.approved_by_name || 'Supardi Halim',
            approved_by_title: gp.approved_by_title || 'Project Manager',
            issued_by_name: gp.issued_by_name || '',
            issued_by_title: gp.issued_by_title || 'Plant / Logistic',
            checked_by_name: gp.checked_by_name || 'Ambo Mai',
            checked_by_title: gp.checked_by_title || 'Plant Superintendent',
            received_by_name: gp.received_by_name || '',
            received_by_title: gp.received_by_title || 'Receiver Site Representative',
            despatch_date: gp.despatch_date ? new Date(gp.despatch_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: gp.status || 'DESPATCHED',
        });
        setShowModal(true);
    };

    // Open Print Preview Modal
    const openPrintPreview = (gp) => {
        setSelectedGatepass(gp);
        setShowPrintModal(true);
    };

    // Auto fill unit details when selected from Populasi Unit
    const handleUnitSelect = (e) => {
        const uId = e.target.value;
        const selected = units.find(u => String(u.id) === String(uId));
        if (selected) {
            setData(prev => ({
                ...prev,
                unit_id: selected.id,
                code_unit: selected.code_unit,
                model: selected.model || prev.model,
                type_unit: selected.type_unit || prev.type_unit,
                engine_make: selected.engine_make || prev.engine_make,
                engine_model: selected.engine_model || prev.engine_model,
                sn_engine: selected.sn_engine || prev.sn_engine,
                hr_mtr: selected.hm ? String(selected.hm) : prev.hr_mtr,
                no_police: selected.no_police || prev.no_police,
            }));
        } else {
            setData(prev => ({
                ...prev,
                unit_id: '',
            }));
        }
    };

    // Submit Form
    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('gatepass-unit.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            put(route('gatepass-unit.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    // Mark unit received / returned
    const handleMarkReturned = (gp) => {
        if (confirm(`Konfirmasi bahwa Unit ${gp.code_unit} telah DITERIMA (RECEIVED) di site tujuan?`)) {
            router.post(route('gatepass-unit.return', gp.id), {}, {
                preserveScroll: true,
            });
        }
    };

    // Delete
    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data Despatch Report / Gatepass Unit ini?')) {
            router.delete(route('gatepass-unit.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gatepass Unit - Despatch Report" />

            <div className="w-full space-y-6">
                
                {/* ─── BANNER HEADER ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                                <Truck className="w-6 h-6 text-emerald-300" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    GATEPASS UNIT / DESPATCH REPORT
                                    <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                                        STOCK TRANSFER
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                                    Format Resmi Surat Jalan & Izin Keluar Masuk Unit (PT. MITRA ABADI MAHAKAM)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black px-4 py-2.5 rounded-xl shadow-lg hover:shadow-amber-400/25 transition-all text-xs cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-gray-950 stroke-[3]" />
                            + Buat Despatch Report / Gatepass
                        </button>
                    </div>

                    {/* Background silhouette */}
                    <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none">
                        <Truck className="w-72 h-72 text-white" />
                    </div>
                </div>

                {/* ─── STAT CARDS ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Gatepass</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</p>
                            <span className="text-[11px] text-gray-400">Penerbitan surat jalan</span>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800/60 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sedang Despatch (Aktif)</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1">{stats.active}</p>
                            <span className="text-[11px] text-amber-600/70 font-medium">Dalam perjalanan / di luar</span>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-700">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sudah Diterima (Received)</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.returned}</p>
                            <span className="text-[11px] text-emerald-600/70 font-medium">Tiba di site tujuan</span>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800/60 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Hari Ini</p>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-300 mt-1">{stats.today}</p>
                            <span className="text-[11px] text-blue-600/70 font-medium">Despatch per hari ini</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-700">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* ─── FILTERS & SEARCH ─── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                            {[
                                { id: 'ALL', label: 'Semua Status' },
                                { id: 'DESPATCHED', label: `Sedang Despatch (${stats.active})` },
                                { id: 'RECEIVED', label: `Diterima (${stats.returned})` },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleStatusFilter(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        selectedStatus === tab.id
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Reset */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari No Gatepass, Unit, Driver, Tujuan..."
                                    className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                                Cari
                            </button>
                            {(searchTerm || selectedStatus !== 'ALL' || dateFrom || dateTo) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                    title="Reset filter"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* ─── DATA TABLE ─── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">No.</th>
                                    <th className="px-4 py-3">Gate Pass No</th>
                                    <th className="px-4 py-3">Kode & Model Unit</th>
                                    <th className="px-4 py-3">Spesifikasi Engine</th>
                                    <th className="px-4 py-3">Rute (From &rarr; To)</th>
                                    <th className="px-4 py-3">Penerima & Pic</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center w-40">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {gatepasses.data && gatepasses.data.length > 0 ? (
                                    gatepasses.data.map((gp, index) => {
                                        const isReceived = gp.status === 'RECEIVED' || gp.status === 'RETURNED';
                                        return (
                                            <tr key={gp.id} className="hover:bg-emerald-50/40 dark:hover:bg-gray-700/40 transition">
                                                {/* No */}
                                                <td className="px-4 py-3 text-center font-bold text-gray-400">
                                                    {(gatepasses.current_page - 1) * gatepasses.per_page + index + 1}
                                                </td>

                                                {/* Gate Pass No */}
                                                <td className="px-4 py-3">
                                                    <span className="font-mono font-bold text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                                        GATE PASS NO: {gp.gatepass_no}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        Tgl: {gp.despatch_date ? new Date(gp.despatch_date).toLocaleDateString('id-ID') : '-'}
                                                    </div>
                                                </td>

                                                {/* Kode & Model Unit */}
                                                <td className="px-4 py-3">
                                                    <div className="font-black text-sm text-gray-900 dark:text-white">
                                                        {gp.code_unit}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {gp.model || gp.type_unit || 'HEAVY DUMP TRUCK'}
                                                    </div>
                                                </td>

                                                {/* Specs */}
                                                <td className="px-4 py-3 text-[11px]">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                        {gp.engine_make || 'Mercedes Benz'} - {gp.engine_model || 'KD-MGJ'}
                                                    </div>
                                                    <div className="text-gray-500 font-mono text-[10px] mt-0.5">
                                                        SN: {gp.sn_engine || '-'} | HM: {gp.hr_mtr || '-'}
                                                    </div>
                                                </td>

                                                {/* Rute (From -> To) */}
                                                <td className="px-4 py-3">
                                                    <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span>{gp.to_location || 'Mining Project SATUI'}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        Dari: {gp.from_location || 'HARINDO WAHANA - KUBAR'}
                                                    </div>
                                                </td>

                                                {/* Penerima / Attn */}
                                                <td className="px-4 py-3 text-[11px]">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {gp.kind_attn || 'Mr. Supardi Halim'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                                        PIC: {gp.person_name || gp.driver_name || '-'}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        isReceived
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                                                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                                    }`}>
                                                        {isReceived ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                RECEIVED
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3 text-amber-600" />
                                                                DESPATCHED
                                                            </>
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Preview Format Exact */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openPrintPreview(gp)}
                                                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                                                            title="Lihat Format Despatch Report (Exact Match)"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* Download PDF */}
                                                        <a
                                                            href={route('gatepass-unit.pdf', gp.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                                                            title="Cetak / Download PDF Resmi"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>

                                                        {/* Mark Received */}
                                                        {!isReceived && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMarkReturned(gp)}
                                                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                                                                title="Tandai Telah Diterima (Received)"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(gp)}
                                                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                                                            title="Edit Despatch Report"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(gp.id)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Truck className="w-12 h-12 text-gray-300 stroke-[1.5]" />
                                                <p className="font-semibold text-sm">Belum ada data Despatch Report / Gatepass Unit</p>
                                                <p className="text-xs text-gray-400 max-w-sm">
                                                    Tekan tombol "+ Buat Despatch Report / Gatepass" untuk membuat laporan izin transfer unit baru.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ─── MODAL: CREATE / EDIT DESPATCH REPORT ─── */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
                            isFormFullscreen
                                ? 'fixed inset-0 z-50 w-full h-full max-w-none max-h-none rounded-none my-0'
                                : 'rounded-2xl max-w-5xl w-full my-8 max-h-[92vh]'
                        }`}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <Truck className="w-5 h-5 text-amber-300" />
                                    <h3 className="font-extrabold text-base tracking-tight">
                                        {modalMode === 'create' ? 'Buat Despatch Report / Gate Pass Unit Baru' : 'Edit Despatch Report'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormFullscreen(!isFormFullscreen)}
                                        className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                        title={isFormFullscreen ? 'Kecilkan Tampilan (Windowed)' : 'Layar Penuh (Fullscreen)'}
                                    >
                                        {isFormFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Form Scrollable */}
                            <form onSubmit={submitForm} className="p-6 space-y-6 overflow-y-auto flex-1">
                                
                                {/* Section 1: Header & Company Details */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" />
                                        1. Informasi Surat & Nomor Gatepass
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Gate Pass No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.gatepass_no}
                                                onChange={(e) => setData('gatepass_no', e.target.value)}
                                                className="w-full text-xs font-mono font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Contoh: 01, 02, GP-01"
                                            />
                                            {errors.gatepass_no && <span className="text-[10px] text-red-500">{errors.gatepass_no}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Tanggal Despatch
                                            </label>
                                            <input
                                                type="date"
                                                value={data.despatch_date}
                                                onChange={(e) => setData('despatch_date', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Transfer Type
                                            </label>
                                            <input
                                                type="text"
                                                value={data.transfer_type}
                                                onChange={(e) => setData('transfer_type', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full text-xs font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                            >
                                                <option value="DESPATCHED">DESPATCHED (AKTIF)</option>
                                                <option value="RECEIVED">RECEIVED (SELESAI)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: FROM & TO / Penerima */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        2. Rute Pengiriman (FROM & TO) & Penerima
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                FROM (Lokasi Asal)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.from_location}
                                                onChange={(e) => setData('from_location', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="HARINDO WAHANA - KUBAR SAMARINDA KALTIM"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                TO (Lokasi Tujuan)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.to_location}
                                                onChange={(e) => setData('to_location', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Mining Project SATUI - SUNGAI DANAU"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Kind Attn (Nama Penerima Tujuan)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.kind_attn}
                                                onChange={(e) => setData('kind_attn', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Mr. Supardi Halim"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Person Name (Pengantar / Driver) & No HP
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={data.person_name}
                                                    onChange={(e) => setData('person_name', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Nama Driver / PIC"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.mob_no}
                                                    onChange={(e) => setData('mob_no', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="No. HP"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Detail Unit & Engine Specs */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" />
                                            3. Unit Yang Ditransfer & Spesifikasi Engine
                                        </h4>
                                        <span className="text-[10px] text-gray-400">Pilih dari Populasi Unit untuk auto-fill spesifikasi</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* Pilih Unit */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Pilih dari Populasi Unit
                                            </label>
                                            <select
                                                value={data.unit_id}
                                                onChange={handleUnitSelect}
                                                className="w-full text-xs font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 cursor-pointer"
                                            >
                                                <option value="">-- Pilih Unit (Otomatis Isi Engine, SN, HM) --</option>
                                                {units.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.code_unit} - {u.model || u.type_unit} (SN: {u.sn_engine || u.sn_chassis || '-'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Item Code (Kode Unit) */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Item Code (Kode Unit) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.code_unit}
                                                onChange={(e) => setData('code_unit', e.target.value.toUpperCase())}
                                                className="w-full text-xs font-black uppercase rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Contoh: MDT022"
                                            />
                                        </div>

                                        {/* Engine Make */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Engine Make
                                            </label>
                                            <input
                                                type="text"
                                                value={data.engine_make}
                                                onChange={(e) => setData('engine_make', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Contoh: Mercedes Benz"
                                            />
                                        </div>

                                        {/* Engine Model */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Engine Model
                                            </label>
                                            <input
                                                type="text"
                                                value={data.engine_model}
                                                onChange={(e) => setData('engine_model', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Contoh: KD-MGJ"
                                            />
                                        </div>

                                        {/* S/N Engine */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                S/N Engine
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sn_engine}
                                                onChange={(e) => setData('sn_engine', e.target.value)}
                                                className="w-full text-xs font-mono rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Contoh: 400951D0119589"
                                            />
                                        </div>

                                        {/* Starter Alternator */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Starter & Alternator
                                            </label>
                                            <input
                                                type="text"
                                                value={data.starter_alternator}
                                                onChange={(e) => setData('starter_alternator', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Alongwith Starter,Alternator"
                                            />
                                        </div>

                                        {/* Battery Spec & Model */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Battery Model & Qty
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={data.battery_model}
                                                    onChange={(e) => setData('battery_model', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Make:-N/Av Model:- AMARON 120AH"
                                                />
                                                <input
                                                    type="number"
                                                    value={data.battery_qty}
                                                    onChange={(e) => setData('battery_qty', e.target.value)}
                                                    className="w-16 text-xs text-center rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5"
                                                    title="Qty Battery"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Remarks & Condition Checklist (Matching Excel format) */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        4. Checklist Kondisi & Remarks (Sesuai Kolom Remarks Laporan)
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Fuel Level (Bahan Bakar)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.fuel_level}
                                                onChange={(e) => setData('fuel_level', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Diesel Fuul Tank"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Oil Level
                                            </label>
                                            <input
                                                type="text"
                                                value={data.oil_level}
                                                onChange={(e) => setData('oil_level', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Oil Level ok"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Hour Meter (Hr Mtr)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.hr_mtr}
                                                onChange={(e) => setData('hr_mtr', e.target.value)}
                                                className="w-full text-xs font-mono font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="23"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Parts Missing
                                            </label>
                                            <input
                                                type="text"
                                                value={data.parts_missing}
                                                onChange={(e) => setData('parts_missing', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="NIL"
                                            />
                                        </div>

                                        {/* Radio Rig with warning / highlight note */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Radio Rig <span className="text-amber-500 font-normal">(Disorot kuning jika tidak ada)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.radio_rig}
                                                onChange={(e) => setData('radio_rig', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="Radio Rig not Available"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Next Service HM
                                            </label>
                                            <input
                                                type="text"
                                                value={data.next_service_hm}
                                                onChange={(e) => setData('next_service_hm', e.target.value)}
                                                className="w-full text-xs font-mono font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                placeholder="250"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Signatures / Penandatangan */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Shield className="w-4 h-4" />
                                        5. Blok Tanda Tangan (Checked By & Approved By)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Checked By (Nama & Jabatan)
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={data.checked_by_name}
                                                    onChange={(e) => setData('checked_by_name', e.target.value)}
                                                    className="w-full text-xs font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Ambo Mai"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.checked_by_title}
                                                    onChange={(e) => setData('checked_by_title', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Plant Superintendent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Approved By (Nama & Jabatan)
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={data.approved_by_name}
                                                    onChange={(e) => setData('approved_by_name', e.target.value)}
                                                    className="w-full text-xs font-bold rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Supardi Halim"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.approved_by_title}
                                                    onChange={(e) => setData('approved_by_title', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
                                                    placeholder="Project Manager"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-md transition"
                                    >
                                        {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Terbitkan Despatch Report' : 'Simpan Perubahan')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: EXACT DESPATCH REPORT PRINT PREVIEW ─── */}
                {showPrintModal && selectedGatepass && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
                        <div className={`bg-white text-gray-900 border border-gray-300 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
                            isPreviewFullscreen
                                ? 'fixed inset-0 z-50 w-full h-full max-w-none max-h-none rounded-none my-0'
                                : 'rounded-2xl max-w-5xl w-full my-6 max-h-[95vh]'
                        }`}>
                            
                            {/* Toolbar */}
                            <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between no-print shrink-0">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Format Dokumen Resmi: DESPATCH REPORT / GATE PASS
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={route('gatepass-unit.pdf', selectedGatepass.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download PDF
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        Print Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                        title={isPreviewFullscreen ? 'Kecilkan Tampilan (Windowed)' : 'Layar Penuh (Fullscreen)'}
                                    >
                                        {isPreviewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPrintModal(false)}
                                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* EXACT PREVIEW AS PER USER SCREENSHOT */}
                            <div className="p-8 bg-white text-black font-sans text-xs overflow-x-auto" id="printable-despatch">
                                
                                {/* Title Top Center */}
                                <div className="text-center font-black text-base uppercase tracking-wider mb-2">
                                    DESPATCH REPORT
                                </div>

                                {/* CST, LST, Company */}
                                <div className="flex justify-between items-start mb-3 text-[11px]">
                                    <div className="space-y-0.5">
                                        <div>CST No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {selectedGatepass.cst_no || 'N/A'}</div>
                                        <div>LST No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {selectedGatepass.lst_no || 'N/A'}</div>
                                        <div>ST FORM No. &nbsp;: {selectedGatepass.st_form_no || 'N/A'}</div>
                                    </div>
                                    <div className="text-center font-bold text-sm uppercase">
                                        {selectedGatepass.company_name || 'PT. MITRA ABADI MAHAKAM'}
                                    </div>
                                    <div className="text-right text-[10px] text-gray-500">
                                        Date: {selectedGatepass.despatch_date ? new Date(selectedGatepass.despatch_date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
                                    </div>
                                </div>

                                {/* Middle Section: FROM, STOCK TRANSFER BOX, RIGHT INFO */}
                                <div className="grid grid-cols-12 gap-3 mb-4 items-start text-xs border border-gray-300 p-3 rounded">
                                    {/* Left: FROM & TO */}
                                    <div className="col-span-5 space-y-2">
                                        <div>
                                            <span className="font-bold block">FROM :</span>
                                            <div className="font-bold text-[11px] leading-tight text-gray-800">
                                                {selectedGatepass.from_company || 'PT.MITRA ABADI MAHAKAM'}<br />
                                                {selectedGatepass.from_location || 'HARINDO WAHANA - KUBAR SAMARINDA KALTIM'}
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <span className="font-bold block">TO :</span>
                                            <div className="font-bold text-[11px] leading-tight text-gray-800">
                                                {selectedGatepass.to_company || 'PT.MITRA ABADI MAHAKAM'}<br />
                                                {selectedGatepass.to_location || 'Mining Project SATUI - SUNGAI DANAU'}
                                            </div>
                                        </div>

                                        <div className="pt-1 font-bold">
                                            Kind Attn &nbsp;: {selectedGatepass.kind_attn || 'Mr. Supardi Halim'}
                                        </div>
                                    </div>

                                    {/* Center: Stock Transfer Box */}
                                    <div className="col-span-3 text-center flex flex-col items-center justify-center pt-4">
                                        <div className="border-2 border-black px-4 py-2 text-center font-bold italic">
                                            <div className="text-xs font-black">STOCK TRANSFER</div>
                                            <div className="text-[9px] font-bold">NOT FOR SALE OR RESALE</div>
                                        </div>
                                    </div>

                                    {/* Right: Meta details */}
                                    <div className="col-span-4 text-[11px] space-y-1">
                                        <div><span className="font-semibold">Person name:</span> {selectedGatepass.person_name || selectedGatepass.driver_name || '-'}</div>
                                        <div><span className="font-semibold">MOB NO:</span> {selectedGatepass.mob_no || '-'}</div>
                                        <div><span className="font-semibold">Receiver name & Sign:</span> {selectedGatepass.receiver_name || '-'}</div>
                                        <div><span className="font-semibold">Wt. Of material :</span> {selectedGatepass.wt_material || '-'}</div>
                                        <div><span className="font-semibold">Aprox value of material :</span> {selectedGatepass.approx_value || '-'}</div>
                                        <div><span className="font-semibold">Gate:</span> {selectedGatepass.gate || 'Gate 1'}</div>
                                        <div className="pt-1">
                                            <span className="border border-black px-2 py-0.5 font-bold inline-block text-xs">
                                                GATE PASS NO: {selectedGatepass.gatepass_no}
                                            </span>
                                        </div>
                                        <div className="text-[9px] italic text-gray-500">Receiving site acknowledgement</div>
                                    </div>
                                </div>

                                {/* Main Exact Table with Yellow Header */}
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full border-collapse border border-black text-xs">
                                        <thead>
                                            <tr className="bg-[#FFC000] text-black font-bold text-center border-b border-black">
                                                <th className="border border-black px-2 py-1.5 w-10">Sr. No</th>
                                                <th className="border border-black px-2 py-1.5 w-28">Item Code</th>
                                                <th className="border border-black px-3 py-1.5">Item Description</th>
                                                <th className="border border-black px-2 py-1.5 w-16">Unit</th>
                                                <th className="border border-black px-2 py-1.5 w-24">Qty. Despatch</th>
                                                <th className="border border-black px-2 py-1.5 w-20">Qty. Recd</th>
                                                <th className="border border-black px-3 py-1.5 w-56">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Row 1 */}
                                            <tr>
                                                <td rowSpan={12} className="border border-black text-center font-bold align-top py-2">1</td>
                                                <td rowSpan={12} className="border border-black text-center font-bold align-top py-2">
                                                    {selectedGatepass.code_unit}
                                                    {selectedGatepass.model && (
                                                        <div className="text-[10px] font-normal text-gray-700 mt-1">
                                                            {selectedGatepass.model}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border border-black px-2 py-1">Engine make :{selectedGatepass.engine_make || 'Mercedes Benz'}</td>
                                                <td className="border border-black text-center px-1 py-1">{selectedGatepass.unit_measure || 'Unit'}</td>
                                                <td className="border border-black text-center font-bold px-1 py-1">{selectedGatepass.qty_despatch ?? 1}</td>
                                                <td className="border border-black text-center px-1 py-1">{selectedGatepass.qty_recd || ''}</td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60 font-medium">{selectedGatepass.fuel_level || 'Diesel Fuul Tank'}</td>
                                            </tr>

                                            {/* Row 2 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1">Engine Model : {selectedGatepass.engine_model || 'KD-MGJ'}</td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60 font-medium">{selectedGatepass.oil_level || 'Oil Level ok'}</td>
                                            </tr>

                                            {/* Row 3 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1">S/N Engine : {selectedGatepass.sn_engine || '400951D0119589'}</td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60 font-bold">Hr Mtr : {selectedGatepass.hr_mtr || '23'}</td>
                                            </tr>

                                            {/* Row 4 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1">{selectedGatepass.starter_alternator || 'Alongwith Starter,Alternator'}</td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60">{selectedGatepass.battery_condition || 'Condition ok'}</td>
                                            </tr>

                                            {/* Row 5 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1">{selectedGatepass.battery_spec || 'Battery 12 Volts'}</td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60">Condition ok</td>
                                            </tr>

                                            {/* Row 6 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1">{selectedGatepass.battery_model || 'Make:-N/Av Model:- AMARON 120AH'}</td>
                                                <td className="border border-black text-center">pcs</td>
                                                <td className="border border-black text-center font-bold">{selectedGatepass.battery_qty ?? 2}</td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60">{selectedGatepass.battery_performance || 'Performance :- Good'}</td>
                                            </tr>

                                            {/* Row 7 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1">Parts Missing:- {selectedGatepass.parts_missing || 'NIL'}</td>
                                            </tr>

                                            {/* Row 8: Radio Rig with Yellow Highlight */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className={`border border-black px-2 py-1 font-bold ${
                                                    String(selectedGatepass.radio_rig || '').toLowerCase().includes('not')
                                                        ? 'bg-[#FFFF00] text-black'
                                                        : 'bg-emerald-100 text-emerald-900'
                                                }`}>
                                                    {selectedGatepass.radio_rig || 'Radio Rig not Available'}
                                                </td>
                                            </tr>

                                            {/* Row 9 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60">{selectedGatepass.general_condition || 'Condition ok'}</td>
                                            </tr>

                                            {/* Row 10 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1">{selectedGatepass.apar_1 || 'APAR Available'}</td>
                                            </tr>

                                            {/* Row 11 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1">{selectedGatepass.apar_2 || 'APAR Available'}</td>
                                            </tr>

                                            {/* Row 12 */}
                                            <tr>
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black"></td>
                                                <td className="border border-black px-2 py-1 bg-gray-100/60 font-bold">Nex Service HM : {selectedGatepass.next_service_hm || '250'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* 4 Signatures Section */}
                                <div className="grid grid-cols-4 gap-4 text-xs pt-4">
                                    <div>
                                        <div className="font-bold">Checked by,</div>
                                        <div className="h-16"></div>
                                        <div className="font-bold text-sm">{selectedGatepass.checked_by_name || 'Ambo Mai'}</div>
                                        <div className="text-[10px] text-gray-600">{selectedGatepass.checked_by_title || 'Plant Superintendent'}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Issued by,</div>
                                        <div className="h-16"></div>
                                        <div className="font-bold text-sm">{selectedGatepass.issued_by_name || '____________________'}</div>
                                        <div className="text-[10px] text-gray-600">{selectedGatepass.issued_by_title || 'Plant / Logistic'}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Approved By:</div>
                                        <div className="h-16"></div>
                                        <div className="font-bold text-sm">{selectedGatepass.approved_by_name || 'Supardi Halim'}</div>
                                        <div className="text-[10px] text-gray-600">{selectedGatepass.approved_by_title || 'Project Manager'}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Received By:</div>
                                        <div className="h-16"></div>
                                        <div className="font-bold text-sm">{selectedGatepass.received_by_name || '____________________'}</div>
                                        <div className="text-[10px] text-gray-600">{selectedGatepass.received_by_title || 'Receiver Site Representative'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
