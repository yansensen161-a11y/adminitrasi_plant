import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

const COMPONENT_GROUPS = [
    "AC SYSTEM", "ACCESSORIES", "ACCIDENT", "AIR SYSTEM", "ATTACHMENT", "AUTOLUBE",
    "BATTERY", "BLADE", "BRAKE SYSTEM", "BUCKET", "CABIN", "CLUTCH", "COOLING SYSTEM",
    "DAMPER", "DIFFERENTIAL", "ELECTRIC SYSTEM", "ELECTRICAL SYSTEM", "ENGINE", "FINAL DRIVE",
    "FRAME/BODY/GUARD/CHASSIS", "FRONT AXLE", "FUEL SYSTEM", "GET", "GREASING", "HOSES",
    "HYDRAULIC SYSTEM", "INTAKE & EXHAUST SYSTEM", "LEVEL OIL/COOLANT", "MAINTENANCE/SERVICE",
    "PROPELLER SHAFT", "PTO", "RADIATOR", "RADIO", "REAR AXLE", "STEERING SYSTEM", "SUSPENSION",
    "SWING", "TAIL GATE", "TRANSMISSION", "TYRE", "UNDERCARRIAGE", "VESSEL", "WASHING",
    "WATER CANON/SPRAYER", "WHEEL & HUB"
];

export default function JobOutside({
    allRepairs = [],
    activeRepairs = [],
    historicalRepairs = [],
    stats = {},
    suggestedWoNo = '',
    units = [],
    workshops = [],
    componentPresets = [],
    filters = {}
}) {
    const { flash, manpowerList = [] } = usePage().props;
    const [currentTab, setCurrentTab] = useState(filters.tab || 'ACTIVE'); // 'ACTIVE', 'HISTORICAL', 'SUMMARY'
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedBengkel, setSelectedBengkel] = useState(filters.bengkel || '');
    const [selectedUnitFilter, setSelectedUnitFilter] = useState(filters.unit || '');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState(filters.status || '');

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [previewRecord, setPreviewRecord] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isModalFullscreen, setIsModalFullscreen] = useState(true);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
    const [isOutsideUnit, setIsOutsideUnit] = useState(false);

    // Form Hook
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        wo_no: suggestedWoNo || '',
        date: new Date().toISOString().split('T')[0],
        nama_bengkel: 'AREMA DINAMO',
        tanggal_kirim: new Date().toISOString().split('T')[0],
        estimasi_finish: '',
        tanggal_kembali: '',
        pic: 'AMBO MAI',
        lokasi: 'HW',
        tanggal_kerusakan: new Date().toISOString().split('T')[0],
        unit_id: '',
        kode_unit: '',
        model_mesin: '',
        serial_no_unit: '',
        nama_komponen: 'ALTERNATOR',
        model_komponen: 'ELECTRIC SYSTEM',
        sn_komponen: '',
        smr_hours: '0',
        prev_smr_hours: '0',
        lifetime_hours: '0',
        target_lifetime: '5000',
        qty: 1,
        problem: '',
        job_instruction: '',
        status: 'DIKIRIM',
        estimasi_biaya: '',
        aktual_biaya: '',
        garansi_bulan: 3,
        dibuat_oleh: 'Admin Plant',
        diketahui_oleh: 'Planner',
        disetujui_oleh: 'Ambo Mai',
        dikirim_oleh: 'DANI',
        diterima_oleh: '',
        notes: '',
        photo: null,
    });

    // Auto calculation of Lifetime when SMR or Prev SMR changes
    const handleSmrChange = (val, field) => {
        const smr = field === 'smr_hours' ? parseFloat(val) || 0 : parseFloat(data.smr_hours) || 0;
        const prev = field === 'prev_smr_hours' ? parseFloat(val) || 0 : parseFloat(data.prev_smr_hours) || 0;
        const calculatedLife = Math.max(0, smr - prev);

        setData(prevData => ({
            ...prevData,
            [field]: val,
            lifetime_hours: calculatedLife > 0 ? calculatedLife : prevData.lifetime_hours
        }));
    };

    // Auto fill unit details on selection
    const handleUnitSelect = (unitId) => {
        if (unitId === 'OUTSIDE') {
            setIsOutsideUnit(true);
            setData(prev => ({
                ...prev,
                unit_id: '',
            }));
            return;
        }

        setIsOutsideUnit(false);
        const selected = units.find(u => String(u.id) === String(unitId));
        if (selected) {
            setData(prev => ({
                ...prev,
                unit_id: selected.id,
                kode_unit: selected.code_unit,
                model_mesin: selected.model || '',
                serial_no_unit: selected.sn_chassis || '',
                smr_hours: selected.hm ? String(selected.hm) : '0',
                lifetime_hours: selected.hm ? String(selected.hm) : prev.lifetime_hours,
                lokasi: selected.location || prev.lokasi
            }));
        } else {
            setData(prev => ({ ...prev, unit_id: '' }));
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingRecord(null);
        setPhotoPreview(null);
        setIsOutsideUnit(false);
        setData({
            wo_no: suggestedWoNo || '',
            date: new Date().toISOString().split('T')[0],
            nama_bengkel: 'AREMA DINAMO',
            tanggal_kirim: new Date().toISOString().split('T')[0],
            estimasi_finish: '',
            tanggal_kembali: '',
            pic: 'AMBO MAI',
            lokasi: 'HW',
            tanggal_kerusakan: new Date().toISOString().split('T')[0],
            unit_id: '',
            kode_unit: '',
            model_mesin: '',
            serial_no_unit: '',
            nama_komponen: 'ALTERNATOR',
            model_komponen: 'ELECTRIC SYSTEM',
            sn_komponen: '',
            smr_hours: '0',
            prev_smr_hours: '0',
            lifetime_hours: '0',
            target_lifetime: '5000',
            qty: 1,
            problem: '',
            job_instruction: '',
            status: 'DIKIRIM',
            estimasi_biaya: '',
            aktual_biaya: '',
            garansi_bulan: 3,
            dibuat_oleh: 'Admin Plant',
            diketahui_oleh: 'Planner',
            disetujui_oleh: 'Ambo Mai',
            dikirim_oleh: 'DANI',
            diterima_oleh: '',
            notes: '',
            photo: null,
        });
        setShowFormModal(true);
    };

    const openEditModal = (record) => {
        clearErrors();
        setEditingRecord(record);
        setPhotoPreview(record.photo_url || null);
        setIsOutsideUnit(!record.unit_id && Boolean(record.kode_unit));
        setData({
            wo_no: record.wo_no,
            date: record.date || '',
            nama_bengkel: record.nama_bengkel || '',
            tanggal_kirim: record.tanggal_kirim || '',
            estimasi_finish: record.estimasi_finish || '',
            tanggal_kembali: record.tanggal_kembali || '',
            pic: record.pic || '',
            lokasi: record.lokasi || '',
            tanggal_kerusakan: record.tanggal_kerusakan || '',
            unit_id: record.unit_id || '',
            kode_unit: record.kode_unit || '',
            model_mesin: record.model_mesin || '',
            serial_no_unit: record.serial_no_unit || '',
            nama_komponen: record.nama_komponen || '',
            model_komponen: record.model_komponen || '',
            sn_komponen: record.sn_komponen || '',
            smr_hours: record.smr_hours ? String(record.smr_hours) : '0',
            prev_smr_hours: record.prev_smr_hours ? String(record.prev_smr_hours) : '0',
            lifetime_hours: record.lifetime_hours ? String(record.lifetime_hours) : '0',
            target_lifetime: record.target_lifetime ? String(record.target_lifetime) : '5000',
            qty: record.qty || 1,
            problem: record.problem || '',
            job_instruction: record.job_instruction || '',
            status: record.status || 'DIKIRIM',
            estimasi_biaya: record.estimasi_biaya ? String(record.estimasi_biaya) : '',
            aktual_biaya: record.aktual_biaya ? String(record.aktual_biaya) : '',
            garansi_bulan: record.garansi_bulan || 1,
            dibuat_oleh: record.dibuat_oleh || 'Admin Plant',
            diketahui_oleh: record.diketahui_oleh || 'Planner',
            disetujui_oleh: record.disetujui_oleh || 'Ambo Mai',
            dikirim_oleh: record.dikirim_oleh || 'DANI',
            diterima_oleh: record.diterima_oleh || '',
            notes: record.notes || '',
            photo: null,
        });
        setShowFormModal(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingRecord) {
            post(route('repair.job-outside.update', editingRecord.id), {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                    setEditingRecord(null);
                }
            });
        } else {
            post(route('repair.job-outside.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                }
            });
        }
    };

    const handleDelete = (id, woNo) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Work Order Outside Repair [${woNo}]? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('repair.job-outside.destroy', id));
        }
    };

    // Filter logic
    const displayedData = useMemo(() => {
        let list = currentTab === 'HISTORICAL' ? historicalRepairs : activeRepairs;
        if (currentTab === 'SUMMARY') list = allRepairs;

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => 
                (r.wo_no && r.wo_no.toLowerCase().includes(q)) ||
                (r.kode_unit && r.kode_unit.toLowerCase().includes(q)) ||
                (r.nama_komponen && r.nama_komponen.toLowerCase().includes(q)) ||
                (r.sn_komponen && r.sn_komponen.toLowerCase().includes(q)) ||
                (r.nama_bengkel && r.nama_bengkel.toLowerCase().includes(q)) ||
                (r.problem && r.problem.toLowerCase().includes(q))
            );
        }

        if (selectedBengkel) {
            list = list.filter(r => r.nama_bengkel === selectedBengkel);
        }

        if (selectedUnitFilter) {
            list = list.filter(r => r.kode_unit === selectedUnitFilter);
        }

        if (selectedStatusFilter) {
            list = list.filter(r => r.status === selectedStatusFilter);
        }

        return list;
    }, [currentTab, activeRepairs, historicalRepairs, allRepairs, searchTerm, selectedBengkel, selectedUnitFilter, selectedStatusFilter]);

    // Helpers
    const formatRp = (val) => {
        if (!val) return 'Rp 0';
        return 'Rp ' + Math.round(val).toLocaleString('id-ID');
    };

    const formatHours = (val) => {
        if (val === null || val === undefined || val === '') return '-';
        const num = parseFloat(val);
        return num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Jam';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DIKIRIM':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">🚀 DIKIRIM</span>;
            case 'PROSES REPAIR':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">⚙️ PROSES REPAIR</span>;
            case 'SELESAI':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✅ SELESAI</span>;
            case 'TERPASANG':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">🔧 TERPASANG</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">DRAFT</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="WO Outside Repair - External Repair Shop" />

            {/* Flash notification */}
            {flash?.success && (
                <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex flex-wrap justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0b5c3e] p-2.5 rounded-xl text-white shadow-md">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                            WO OUTSIDE REPAIR
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">
                            Work Order External Repair Shop &bull; PT. MITRA ABADI MAHAKAM
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="bg-[#0b5c3e] hover:bg-[#08422c] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition transform active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        + Buat WO Outside Repair
                    </button>
                </div>
            </div>

            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total WO Outside</div>
                    <div className="text-2xl font-black text-gray-900">{stats.total || 0}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Seluruh tiket tercatat</div>
                </div>

                <div className="bg-yellow-50/70 p-4 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden">
                    <div className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Sedang di Bengkel
                    </div>
                    <div className="text-2xl font-black text-yellow-900">{stats.in_shop || 0}</div>
                    <div className="text-[10px] text-yellow-700 mt-1">Dalam proses repair</div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm relative overflow-hidden">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Selesai / Terpasang</div>
                    <div className="text-2xl font-black text-emerald-900">{stats.completed || 0}</div>
                    <div className="text-[10px] text-emerald-700 mt-1">Unit siap beroperasi</div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Rata-rata Life Time</div>
                    <div className="text-2xl font-black text-blue-900 font-mono">{formatHours(stats.avg_lifetime)}</div>
                    <div className="text-[10px] text-blue-700 mt-1">Ketahanan komponen</div>
                </div>

                <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
                    <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Total Biaya Repair</div>
                    <div className="text-xl font-black text-purple-900 truncate">{formatRp(stats.total_cost)}</div>
                    <div className="text-[10px] text-purple-700 mt-1">Realisasi perbaikan luar</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="flex border-b border-gray-200 bg-gray-50/60 p-2 gap-2 flex-wrap">
                    <button
                        onClick={() => setCurrentTab('ACTIVE')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            currentTab === 'ACTIVE'
                                ? 'bg-[#0b5c3e] text-white shadow'
                                : 'text-gray-600 hover:bg-gray-200/70'
                        }`}
                    >
                        <span>📋 Work Order Aktif</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentTab === 'ACTIVE' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}>
                            {activeRepairs.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('HISTORICAL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            currentTab === 'HISTORICAL'
                                ? 'bg-blue-700 text-white shadow'
                                : 'text-gray-600 hover:bg-gray-200/70'
                        }`}
                    >
                        <span>📜 Tab Historical & Life Time</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentTab === 'HISTORICAL' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}>
                            {historicalRepairs.length}
                        </span>
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari WO, Unit, Komponen, Bengkel..."
                                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] w-64"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            value={selectedBengkel}
                            onChange={(e) => setSelectedBengkel(e.target.value)}
                            className="text-xs rounded-lg border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] py-1.5 font-medium"
                        >
                            <option value="">Semua Bengkel Luar</option>
                            {workshops.map((w, idx) => (
                                <option key={idx} value={w}>{w}</option>
                            ))}
                        </select>

                        <select
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            className="text-xs rounded-lg border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] py-1.5 font-medium"
                        >
                            <option value="">Semua Status</option>
                            <option value="DIKIRIM">DIKIRIM</option>
                            <option value="PROSES REPAIR">PROSES REPAIR</option>
                            <option value="SELESAI">SELESAI</option>
                            <option value="TERPASANG">TERPASANG</option>
                        </select>

                        {(searchTerm || selectedBengkel || selectedStatusFilter || selectedUnitFilter) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedBengkel('');
                                    setSelectedStatusFilter('');
                                    setSelectedUnitFilter('');
                                }}
                                className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 font-medium flex items-center gap-3">
                        <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium hidden sm:inline-flex items-center gap-1 shadow-xs">
                            <span>⚡</span> Double-klik <strong>Kode Unit</strong> untuk langsung edit
                        </span>
                        <span>Menampilkan <span className="font-bold text-gray-800">{displayedData.length}</span> record</span>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: WORK ORDER AKTIF                                        */}
                {/* ============================================================== */}
                {currentTab === 'ACTIVE' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#0f2e26] text-white uppercase text-[10.5px] tracking-wider">
                                    <th className="px-3 py-3 font-semibold text-center w-12 border-r border-[#1a4a3c]">NO</th>
                                    <th className="px-3 py-3 font-semibold border-r border-[#1a4a3c]">NO. WO & TANGGAL</th>
                                    <th className="px-3 py-3 font-semibold border-r border-[#1a4a3c]">KODE UNIT / MODEL</th>
                                    <th className="px-3 py-3 font-semibold border-r border-[#1a4a3c]">KOMPONEN & S/N</th>
                                    <th className="px-3 py-3 font-semibold border-r border-[#1a4a3c]">NAMA BENGKEL LUAR</th>
                                    <th className="px-3 py-3 font-semibold border-r border-[#1a4a3c]">PROBLEM & INSTRUKSI</th>
                                    <th className="px-3 py-3 font-semibold text-center border-r border-[#1a4a3c]">FOTO</th>
                                    <th className="px-3 py-3 font-semibold text-center border-r border-[#1a4a3c]">STATUS</th>
                                    <th className="px-3 py-3 font-semibold text-center w-36">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {displayedData.length > 0 ? (
                                    displayedData.map((item, idx) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50/50 transition cursor-pointer group/row"
                                            onDoubleClick={() => openEditModal(item)}
                                            title="Double-klik untuk edit Work Order"
                                        >
                                            <td className="px-3 py-3 text-center font-bold text-gray-500">{idx + 1}</td>
                                            <td className="px-3 py-3">
                                                <div className="font-mono font-bold text-blue-900">{item.wo_no}</div>
                                                <div className="text-[11px] text-gray-500 font-medium">Tgl: {item.date}</div>
                                                <div className="text-[10px] text-gray-400">Lokasi: {item.lokasi || 'HW'}</div>
                                            </td>
                                            <td
                                                className="px-3 py-3 cursor-pointer"
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(item);
                                                }}
                                                title="Double-klik di Code Unit untuk langsung edit"
                                            >
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded text-xs inline-flex items-center gap-1.5 border border-gray-200 group-hover/row:bg-amber-100 group-hover/row:text-amber-900 group-hover/row:border-amber-400 group-hover/row:shadow-sm hover:scale-105 transition transform select-none cursor-pointer">
                                                        <span>{item.kode_unit || '-'}</span>
                                                        <span className="text-[11px] text-amber-700 opacity-60 hover:opacity-100" title="Double klik untuk edit">✏️</span>
                                                    </span>
                                                    {!item.unit_id && item.kode_unit && (
                                                        <span className="text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                                            Di Luar Unit
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-gray-600 font-medium mt-1">{item.model_mesin || '-'}</div>
                                                <div className="text-[10px] font-mono text-gray-400">SN: {item.serial_no_unit || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-bold text-gray-900 uppercase">{item.nama_komponen}</div>
                                                <div className="text-[11px] text-gray-500">{item.model_komponen || '-'}</div>
                                                <div className="text-[10px] font-mono text-gray-400">SN: {item.sn_komponen || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-bold text-purple-950">{item.nama_bengkel}</div>
                                                <div className="text-[11px] text-gray-500">Kirim: {item.tanggal_kirim || '-'}</div>
                                                <div className="text-[10px] text-gray-400">Est. Selesai: {item.estimasi_finish || '-'}</div>
                                            </td>
                                            <td className="px-3 py-3 max-w-xs">
                                                <div className="text-red-700 font-bold text-[11px] line-clamp-2" title={item.problem}>
                                                    ⚠️ {item.problem || '-'}
                                                </div>
                                                <div className="text-gray-600 text-[10.5px] mt-0.5 line-clamp-1 italic" title={item.job_instruction}>
                                                    🔧 {item.job_instruction || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center" onDoubleClick={(e) => e.stopPropagation()}>
                                                {item.photo_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewRecord(item);
                                                        }}
                                                        className="group relative inline-block cursor-pointer"
                                                    >
                                                        <img
                                                            src={item.photo_url}
                                                            alt="Foto Komponen"
                                                            className="w-10 h-10 object-cover rounded border border-gray-300 shadow-sm group-hover:scale-110 transition"
                                                        />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 italic text-[10px]">Tidak ada</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap" onDoubleClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* View Official Document */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewRecord(item);
                                                        }}
                                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 p-1.5 rounded transition border border-blue-200"
                                                        title="Lihat Format Dokumen Resmi"
                                                    >
                                                        📄 Preview
                                                    </button>
                                                    {/* Print / Download PDF */}
                                                    <a
                                                        href={route('repair.job-outside.pdf', item.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1.5 rounded transition border border-emerald-200 font-bold"
                                                        title="Cetak / Export PDF"
                                                    >
                                                        🖨️ PDF
                                                    </a>
                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(item);
                                                        }}
                                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-1.5 rounded transition border border-gray-300"
                                                        title="Edit Work Order"
                                                    >
                                                        ✏️
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id, item.wo_no);
                                                        }}
                                                        className="bg-red-50 text-red-700 hover:bg-red-100 p-1.5 rounded transition border border-red-200"
                                                        title="Hapus"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-gray-400">
                                            Tidak ada data Work Order Outside Repair aktif. Silakan klik <strong>+ Buat WO Outside Repair</strong>.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 2: HISTORICAL & LIFE TIME ANALYSIS                        */}
                {/* ============================================================== */}
                {currentTab === 'HISTORICAL' && (
                    <div className="overflow-x-auto">
                        <div className="bg-blue-50/50 p-3 border-b border-blue-100 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold uppercase tracking-wider">💡 Analisis Life Time Komponen:</span>
                                <span>Menampilkan jam kerja operasional (SMR) komponen sebelum perbaikan dan perbandingannya terhadap target ketahanan.</span>
                            </div>
                            <div className="text-[11px] text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded border border-amber-300 font-semibold flex items-center gap-1.5 shadow-xs">
                                <span>⚡</span> <span>Double-klik <strong>Kode Unit</strong> untuk langsung edit</span>
                            </div>
                        </div>

                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#1e293b] text-white uppercase text-[10.5px] tracking-wider">
                                    <th className="px-3 py-3 font-semibold text-center w-12 border-r border-slate-700">NO</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700">KODE UNIT & MESIN</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700">KOMPONEN & SERIAL</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700">BENGKEL REPAIR</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700 text-center">SMR RUSAK</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700 text-center bg-blue-900/60">
                                        RUNNING LIFE TIME
                                    </th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700 text-center">TARGET LIFE</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700 text-center">STATUS KETAHANAN</th>
                                    <th className="px-3 py-3 font-semibold border-r border-slate-700">PERIODE & BIAYA</th>
                                    <th className="px-3 py-3 font-semibold text-center w-36">DOKUMEN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {displayedData.length > 0 ? (
                                    displayedData.map((item, idx) => {
                                        const life = parseFloat(item.lifetime_hours) || 0;
                                        const target = parseFloat(item.target_lifetime) || 5000;
                                        const pct = target > 0 ? Math.min(150, Math.round((life / target) * 100)) : 0;
                                        const isPremature = life > 0 && life < (target * 0.7);
                                        const isOverTarget = life >= target;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-blue-50/50 transition cursor-pointer group/row"
                                                onDoubleClick={() => openEditModal(item)}
                                                title="Double-klik untuk edit Work Order"
                                            >
                                                <td className="px-3 py-3 text-center font-bold text-gray-500">{idx + 1}</td>
                                                <td
                                                    className="px-3 py-3 cursor-pointer"
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(item);
                                                    }}
                                                    title="Double-klik di Code Unit untuk langsung edit"
                                                >
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <div className="font-mono font-bold text-gray-900 bg-gray-100 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-gray-200 group-hover/row:bg-amber-100 group-hover/row:text-amber-900 group-hover/row:border-amber-400 group-hover/row:shadow-sm hover:scale-105 transition transform select-none cursor-pointer">
                                                            <span>{item.kode_unit || '-'}</span>
                                                            <span className="text-[11px] text-amber-700 opacity-60 hover:opacity-100" title="Double klik untuk edit">✏️</span>
                                                        </div>
                                                        {!item.unit_id && item.kode_unit && (
                                                            <span className="text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                                                Di Luar Unit
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-600 font-medium text-[11px] mt-0.5">{item.model_mesin || '-'}</div>
                                                    <div className="text-blue-700 font-mono text-[10px] mt-0.5">WO: {item.wo_no}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-bold text-gray-900 uppercase">{item.nama_komponen}</div>
                                                    <div className="text-gray-500 text-[10.5px] font-mono">SN: {item.sn_komponen || '-'}</div>
                                                    <div className="text-[10px] text-gray-400">{item.model_komponen || '-'}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-bold text-purple-950">{item.nama_bengkel}</div>
                                                    <div className="text-[10px] text-gray-500">PIC: {item.pic || 'AMBO MAI'}</div>
                                                    <div className="text-[10px] text-emerald-700 font-medium">Garansi: {item.garansi_bulan || 1} Bulan</div>
                                                </td>
                                                <td className="px-3 py-3 text-center font-mono font-bold text-gray-800">
                                                    {item.smr_hours ? parseFloat(item.smr_hours).toLocaleString('id-ID') : '0'}
                                                </td>
                                                <td className="px-3 py-3 text-center bg-blue-50/60">
                                                    <div className="text-sm font-black font-mono text-blue-900">
                                                        {formatHours(item.lifetime_hours)}
                                                    </div>
                                                    {/* Visual percentage bar */}
                                                    <div className="w-24 bg-gray-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full ${isPremature ? 'bg-red-500' : isOverTarget ? 'bg-emerald-600' : 'bg-blue-600'}`}
                                                            style={{ width: `${Math.min(100, pct)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-[9.5px] font-semibold text-gray-500 mt-0.5 font-mono">
                                                        {pct}% dari target
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center font-mono font-bold text-gray-600">
                                                    {formatHours(item.target_lifetime)}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {isPremature ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10.5px] font-bold bg-red-100 text-red-800 border border-red-300">
                                                            ⚠️ Premature Fail
                                                        </span>
                                                    ) : isOverTarget ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            ⭐ High Reliability
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                            ✅ Normal Life
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-[11px] font-medium text-gray-700">
                                                        {item.tanggal_kirim || '-'} s/d {item.tanggal_kembali || item.estimasi_finish || '-'}
                                                    </div>
                                                    <div className="font-bold text-emerald-800 text-[11px] mt-0.5">
                                                        {item.aktual_biaya > 0 ? formatRp(item.aktual_biaya) : (item.estimasi_biaya > 0 ? formatRp(item.estimasi_biaya) + ' (Est)' : '-')}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap" onDoubleClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewRecord(item);
                                                            }}
                                                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded text-xs font-bold transition border border-blue-200"
                                                            title="Lihat Format Dokumen Resmi"
                                                        >
                                                            📄 View
                                                        </button>
                                                        <a
                                                            href={route('repair.job-outside.pdf', item.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-bold transition border border-emerald-200"
                                                            title="Download PDF"
                                                        >
                                                            🖨️ PDF
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(item);
                                                            }}
                                                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-xs font-bold transition border border-gray-300"
                                                            title="Edit Work Order"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(item.id, item.wo_no);
                                                            }}
                                                            className="bg-red-50 text-red-700 hover:bg-red-100 px-1.5 py-1 rounded text-xs transition border border-red-200"
                                                            title="Hapus"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-gray-400">
                                            Belum ada riwayat perbaikan selesai dalam tab Historical.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* MODAL 1: FORM CREATE / EDIT WO OUTSIDE REPAIR (FULLSCREEN)     */}
            {/* ============================================================== */}
            {showFormModal && (
                <div className={
                    isModalFullscreen
                        ? "fixed inset-0 z-50 flex flex-col bg-slate-100 overflow-hidden"
                        : "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto"
                }>
                    <div className={
                        isModalFullscreen
                            ? "w-full h-full flex flex-col bg-slate-100 overflow-hidden"
                            : "bg-slate-100 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-300"
                    }>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#0b5c3e] via-[#0e6d4a] to-[#08422c] text-white px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-md shrink-0">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-2xl shadow-inner">
                                    🛠️
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                                            {editingRecord ? `Edit Work Order: ${editingRecord.wo_no}` : 'Buat Work Order External Repair Shop Baru'}
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-400/25 text-emerald-100 border border-emerald-300/30 shadow-sm">
                                            PT. MAM Plant Standard
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-emerald-100/90 mt-0.5 font-medium">
                                        Formulir Pengiriman Komponen ke Bengkel Luar / Vendor Rekanan & Pemantauan Lifetime SMR
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Toggle Fullscreen / Windowed button */}
                                <button
                                    type="button"
                                    onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                                    title={isModalFullscreen ? 'Perkecil Tampilan (Windowed)' : 'Layar Penuh (Fullscreen)'}
                                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-2 text-xs font-bold border border-white/15 shadow-sm"
                                >
                                    {isModalFullscreen ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5m11 0l5 5m0 0l-5 0m5 0l0-5" />
                                            </svg>
                                            <span className="hidden sm:inline">Kecilkan</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            <span className="hidden sm:inline">Fullscreen</span>
                                        </>
                                    )}
                                </button>
                                {/* Close button */}
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition text-xl font-black border border-white/15 shadow-sm"
                                    title="Tutup (Esc)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                            {/* Section 1: WO & Vendor Info */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">1</span>
                                    <span>INFORMASI WORK ORDER & BENGKEL LUAR</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            No. WO <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.wo_no}
                                            onChange={e => setData('wo_no', e.target.value)}
                                            placeholder="Contoh: 0390/WO/HW/IX/2026"
                                            className="w-full text-sm font-mono font-black py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        {errors.wo_no && <div className="text-xs text-red-600 mt-1 font-semibold">{errors.wo_no}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Tanggal WO <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                            className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Nama Bengkel Luar / Vendor <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="workshops_list"
                                            value={data.nama_bengkel}
                                            onChange={e => setData('nama_bengkel', e.target.value.toUpperCase())}
                                            placeholder="Contoh: AREMA DINAMO"
                                            className="w-full text-sm font-black uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 text-purple-900 bg-purple-50/30 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        <datalist id="workshops_list">
                                            {workshops.map((w, i) => (
                                                <option key={i} value={w} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Tanggal Kirim</label>
                                        <input
                                            type="date"
                                            value={data.tanggal_kirim}
                                            onChange={e => setData('tanggal_kirim', e.target.value)}
                                            className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Estimasi Selesai</label>
                                        <input
                                            type="date"
                                            value={data.estimasi_finish}
                                            onChange={e => setData('estimasi_finish', e.target.value)}
                                            className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">PIC (Penanggung Jawab)</label>
                                        <select
                                            value={data.pic}
                                            onChange={e => setData('pic', e.target.value.toUpperCase())}
                                            className="w-full text-sm font-bold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm bg-white"
                                        >
                                            <option value="">-- PILIH PIC MANPOWER --</option>
                                            {manpowerList && manpowerList.length > 0 ? (
                                                manpowerList.map(mp => (
                                                    <option key={mp.id} value={mp.nama}>
                                                        {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="AMBO MAI">AMBO MAI</option>
                                            )}
                                            {data.pic && !manpowerList?.some(mp => mp.nama.toUpperCase() === data.pic.toUpperCase()) && (
                                                <option value={data.pic}>{data.pic}</option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Eks. Lokasi Unit</label>
                                        <input
                                            type="text"
                                            value={data.lokasi}
                                            onChange={e => setData('lokasi', e.target.value.toUpperCase())}
                                            placeholder="Contoh: HW / PIT"
                                            className="w-full text-sm font-bold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Unit & Component Data */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100 mb-5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">2</span>
                                        <span className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider">INFORMASI UNIT & KOMPONEN</span>
                                    </div>
                                    
                                    {/* Mode Selector Toggle */}
                                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setIsOutsideUnit(false)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                                                !isOutsideUnit
                                                    ? 'bg-[#0b5c3e] text-white shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                                            }`}
                                        >
                                            <span>🚜</span>
                                            <span>Unit Populasi Armada</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOutsideUnit(true);
                                                setData(prev => ({ ...prev, unit_id: '' }));
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                                                isOutsideUnit
                                                    ? 'bg-amber-600 text-white shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                                            }`}
                                        >
                                            <span>✍️</span>
                                            <span>Di Luar Unit (Ketik Sendiri)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Banner & Presets for Di Luar Unit */}
                                {isOutsideUnit ? (
                                    <div className="mb-5 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/40 border border-amber-300 rounded-xl p-3.5 shadow-xs">
                                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                                                <span className="text-base">✍️</span>
                                                <span>Mode <strong>Di Luar Unit</strong> aktif: Anda dapat mengetik sendiri identitas unit/alat non-armada (Genset, Pompa, Tower Lamp, Workshop, Buffer Stock, dll).</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsOutsideUnit(false)}
                                                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                                            >
                                                Kembali ke Unit Populasi
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/70">
                                            <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider mr-1">Preset Cepat:</span>
                                            {[
                                                { label: '⚡ GENSET', code: 'GENSET-01', model: 'GENSET DIESEL' },
                                                { label: '💧 POMPA / DEWATERING', code: 'PUMP-01', model: 'DEWATERING PUMP' },
                                                { label: '💡 TOWER LAMP', code: 'TL-01', model: 'LIGHTING TOWER' },
                                                { label: '🏭 WORKSHOP', code: 'WS-EQUIP', model: 'FASILITAS WORKSHOP' },
                                                { label: '📦 BUFFER STOCK', code: 'BUFFER-01', model: 'SPARE STOCK' },
                                            ].map((preset, pIdx) => (
                                                <button
                                                    key={pIdx}
                                                    type="button"
                                                    onClick={() => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            kode_unit: preset.code,
                                                            model_mesin: prev.model_mesin || preset.model,
                                                        }));
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-white hover:bg-amber-200/70 text-amber-950 border border-amber-300 shadow-2xs transition"
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 text-xs text-gray-500 font-medium flex items-center justify-between">
                                        <span>💡 Pilih unit dari daftar untuk otomatisasi model mesin & serial, atau ganti ke mode <strong>Di Luar Unit</strong> untuk mengetik manual.</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {isOutsideUnit ? (
                                        <div>
                                            <label className="block text-xs font-black uppercase text-amber-900 tracking-wider mb-1.5 flex items-center justify-between">
                                                <span>Sumber Unit</span>
                                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                                    Non-Populasi
                                                </span>
                                            </label>
                                            <div className="w-full py-2 px-3 rounded-xl border border-amber-300 bg-amber-50/60 text-amber-950 font-bold text-xs flex items-center justify-between min-h-[42px]">
                                                <span className="flex items-center gap-1.5 font-black text-amber-900">
                                                    <span>✍️</span> Di Luar Unit (Ketik Manual)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsOutsideUnit(false)}
                                                    className="text-[10.5px] font-black uppercase px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                                                >
                                                    Pilih Populasi
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Pilih Unit (Populasi)</label>
                                            <select
                                                value={data.unit_id}
                                                onChange={e => handleUnitSelect(e.target.value)}
                                                className="w-full text-sm font-bold py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-emerald-950 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            >
                                                <option value="">-- Pilih Unit Terdaftar --</option>
                                                <option value="OUTSIDE">✍️ Di Luar Unit / Ketik Sendiri (Non-Armada)</option>
                                                {units.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.code_unit} - {u.model} (HM: {u.hm || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5 flex items-center justify-between">
                                            <span>Kode Unit / Identitas <span className="text-red-500">*</span></span>
                                            {isOutsideUnit && (
                                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                                    Ketik Bebas
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.kode_unit}
                                            onChange={e => setData('kode_unit', e.target.value.toUpperCase())}
                                            placeholder={isOutsideUnit ? "Contoh: GENSET-01 / PUMP-HW" : "Contoh: ME068"}
                                            className={`w-full text-sm font-mono font-black uppercase py-2.5 px-3.5 rounded-xl border focus:ring-2 focus:border-[#0b5c3e] shadow-sm ${
                                                isOutsideUnit
                                                    ? 'border-amber-400 bg-amber-50/40 text-amber-950 focus:ring-amber-500'
                                                    : 'border-gray-300 text-gray-900 focus:ring-[#0b5c3e]'
                                            }`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Model Mesin / Unit / Alat</label>
                                        <input
                                            type="text"
                                            value={data.model_mesin}
                                            onChange={e => setData('model_mesin', e.target.value.toUpperCase())}
                                            placeholder={isOutsideUnit ? "Contoh: DENYO 150 KVA / SYKES CP150" : "Contoh: DEVELON DX530LC 7M"}
                                            className={`w-full text-sm font-semibold uppercase py-2.5 px-3.5 rounded-xl border focus:ring-2 focus:border-[#0b5c3e] shadow-sm ${
                                                isOutsideUnit
                                                    ? 'border-amber-300 bg-amber-50/20 text-gray-900 focus:ring-amber-500'
                                                    : 'border-gray-300 focus:ring-[#0b5c3e]'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Serial No. Unit / Rangka</label>
                                        <input
                                            type="text"
                                            value={data.serial_no_unit}
                                            onChange={e => setData('serial_no_unit', e.target.value.toUpperCase())}
                                            placeholder="Contoh: DWGCECFXLP1010597 (Boleh kosong)"
                                            className="w-full text-sm font-mono font-semibold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Nama Komponen <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="components_list"
                                            value={data.nama_komponen}
                                            onChange={e => setData('nama_komponen', e.target.value.toUpperCase())}
                                            placeholder="Contoh: ALTERNATOR"
                                            className="w-full text-sm font-black uppercase py-2.5 px-3.5 rounded-xl border border-emerald-300 text-emerald-950 bg-emerald-50/30 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        <datalist id="components_list">
                                            {componentPresets.map((c, i) => (
                                                <option key={i} value={c} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Component Group</label>
                                        <select
                                            value={data.model_komponen || ''}
                                            onChange={e => setData('model_komponen', e.target.value)}
                                            className="w-full text-sm font-semibold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm bg-white"
                                        >
                                            <option value="">-- PILIH COMPONENT GROUP --</option>
                                            {COMPONENT_GROUPS.map((comp) => (
                                                <option key={comp} value={comp}>
                                                    {comp}
                                                </option>
                                            ))}
                                            {data.model_komponen && !COMPONENT_GROUPS.includes(data.model_komponen) && (
                                                <option value={data.model_komponen}>
                                                    {data.model_komponen}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">S/N Komponen</label>
                                        <input
                                            type="text"
                                            value={data.sn_komponen}
                                            onChange={e => setData('sn_komponen', e.target.value.toUpperCase())}
                                            placeholder="Contoh: DWGCECFXLP1010597"
                                            className="w-full text-sm font-mono font-semibold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Jumlah (Qty)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.qty}
                                            onChange={e => setData('qty', parseInt(e.target.value) || 1)}
                                            className="w-full text-sm font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* SMR & Lifetime Calculation Subpanel */}
                                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-blue-50/90 p-5 rounded-2xl border border-emerald-200 mt-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <div className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                                            <span className="text-base">⏱️</span>
                                            <span>PEMANTAUAN JAM OPERASI (SMR) & ESTIMASI LIFETIME KOMPONEN</span>
                                        </div>
                                        <span className="text-xs text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full font-bold border border-emerald-200">
                                            Rumus Otomatis: SMR Rusak - SMR Pasang
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                                SMR / HM Saat Rusak
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.smr_hours}
                                                onChange={e => handleSmrChange(e.target.value, 'smr_hours')}
                                                placeholder="0"
                                                className="w-full text-sm font-mono font-black py-2.5 px-3.5 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] bg-white shadow-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                                SMR Pemasangan Awal
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.prev_smr_hours}
                                                onChange={e => handleSmrChange(e.target.value, 'prev_smr_hours')}
                                                placeholder="0"
                                                className="w-full text-sm font-mono font-semibold py-2.5 px-3.5 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] bg-white shadow-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-blue-900 tracking-wider mb-1.5 flex items-center justify-between">
                                                <span>Running Life Time (Jam)</span>
                                                <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-black">Hasil Hitung</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.lifetime_hours}
                                                onChange={e => setData('lifetime_hours', e.target.value)}
                                                placeholder="0"
                                                className="w-full text-base font-mono font-black text-blue-900 bg-blue-100/60 py-2.5 px-3.5 rounded-xl border-2 border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                                Target Lifetime (Jam)
                                            </label>
                                            <input
                                                type="number"
                                                step="100"
                                                value={data.target_lifetime}
                                                onChange={e => setData('target_lifetime', e.target.value)}
                                                placeholder="5000"
                                                className="w-full text-sm font-mono font-semibold py-2.5 px-3.5 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] bg-white shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Problem, Instruction & Photo */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">3</span>
                                    <span>KELUHAN (PROBLEM) & INSTRUKSI PERBAIKAN BENGKEL</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            PROBLEM (Kerusakan) <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.problem}
                                            onChange={e => setData('problem', e.target.value.toUpperCase())}
                                            placeholder="Contoh: ALTERNATOR CAN'T CHARGING / BEARING PECAH"
                                            className="w-full text-sm font-bold uppercase p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm leading-relaxed"
                                            required
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            JOB INSTRUCTION (Instruksi ke Bengkel) <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.job_instruction}
                                            onChange={e => setData('job_instruction', e.target.value.toUpperCase())}
                                            placeholder="Contoh: REPAIR ALTERNATOR, GANTI BEARING & DIODA, LAKUKAN TEST BENCH"
                                            className="w-full text-sm font-bold uppercase p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm leading-relaxed"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2 pt-2">
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">
                                            Lampiran Foto Komponen (Dicetak pada Dokumen WO Resmi)
                                        </label>
                                        <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/70 hover:bg-gray-50 transition">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0b5c3e] file:text-white hover:file:bg-[#08422c] file:cursor-pointer file:shadow-md cursor-pointer"
                                            />
                                            {photoPreview ? (
                                                <div className="relative group">
                                                    <img
                                                        src={photoPreview}
                                                        alt="Preview"
                                                        className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-500 shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPhotoPreview(null);
                                                            setData('photo', null);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow hover:bg-red-700"
                                                        title="Hapus Foto"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400 italic">
                                                    Belum ada foto dipilih. Format: JPG, PNG (Maks 4MB).
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Workflow Status, Biaya & Tanda Tangan */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">4</span>
                                    <span>STATUS WORK ORDER, BIAYA & PENANDATANGAN DOKUMEN</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Status Work Order</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full text-sm font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        >
                                            <option value="DIKIRIM">🚀 DIKIRIM (Dalam Pengiriman/Vendor)</option>
                                            <option value="PROSES REPAIR">⚙️ PROSES REPAIR (Sedang Dikerjakan)</option>
                                            <option value="SELESAI">✅ SELESAI (Sudah Diterima Kembali)</option>
                                            <option value="TERPASANG">🔧 TERPASANG (Sudah Dipasang ke Unit)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Estimasi Biaya (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.estimasi_biaya}
                                            onChange={e => setData('estimasi_biaya', e.target.value)}
                                            placeholder="Contoh: 4500000"
                                            className="w-full text-sm font-mono font-semibold py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Aktual Biaya (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.aktual_biaya}
                                            onChange={e => setData('aktual_biaya', e.target.value)}
                                            placeholder="Contoh: 4250000"
                                            className="w-full text-sm font-mono font-black text-emerald-950 py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">Garansi Vendor (Bulan)</label>
                                        <input
                                            type="number"
                                            value={data.garansi_bulan}
                                            onChange={e => setData('garansi_bulan', parseInt(e.target.value) || 0)}
                                            className="w-full text-sm font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-5 border-t border-gray-100">
                                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                                        <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">Dibuat Oleh</label>
                                        <input
                                            type="text"
                                            value={data.dibuat_oleh}
                                            onChange={e => setData('dibuat_oleh', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-bold rounded-lg border-gray-300 bg-white uppercase"
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">Admin Plant</span>
                                    </div>

                                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                                        <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">Diketahui Oleh</label>
                                        <input
                                            type="text"
                                            value={data.diketahui_oleh}
                                            onChange={e => setData('diketahui_oleh', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-bold rounded-lg border-gray-300 bg-white uppercase"
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">Planner</span>
                                    </div>

                                    <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                                        <label className="block text-[11px] font-black uppercase text-[#0b5c3e] mb-1">Disetujui Oleh</label>
                                        <input
                                            type="text"
                                            value={data.disetujui_oleh}
                                            onChange={e => setData('disetujui_oleh', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-black rounded-lg border-emerald-300 bg-white text-emerald-950 uppercase"
                                        />
                                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Superintendent Plant</span>
                                    </div>

                                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                                        <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">Dikirim Oleh</label>
                                        <input
                                            type="text"
                                            value={data.dikirim_oleh}
                                            onChange={e => setData('dikirim_oleh', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-bold rounded-lg border-gray-300 bg-white uppercase"
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">Logistic</span>
                                    </div>

                                    <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
                                        <label className="block text-[11px] font-black uppercase text-purple-900 mb-1">Diterima Oleh</label>
                                        <input
                                            type="text"
                                            value={data.diterima_oleh}
                                            onChange={e => setData('diterima_oleh', e.target.value.toUpperCase())}
                                            placeholder="Nama Bengkel"
                                            className="w-full text-xs font-bold rounded-lg border-purple-300 bg-white text-purple-900 uppercase"
                                        />
                                        <span className="text-[10px] text-purple-700 font-semibold mt-1 block">Bengkel Luar / Rekanan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Modal Action Bar */}
                            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border border-gray-200 px-6 py-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 z-20 shadow-xl">
                                <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                                    <span className="font-mono font-black bg-emerald-100/90 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                                        WO: {data.wo_no || '-'}
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        Unit: {data.kode_unit || 'Belum dipilih'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-gray-800">
                                        Komponen: {data.nama_komponen || '-'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-purple-900">
                                        Vendor: {data.nama_bengkel || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0b5c3e] hover:bg-[#08422c] text-white px-8 py-3 rounded-xl text-sm font-black transition flex items-center gap-2 shadow-xl shadow-emerald-950/25 disabled:opacity-50 transform hover:-translate-y-0.5"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Menyimpan Data...
                                            </>
                                        ) : (
                                            editingRecord ? '💾 Simpan Perubahan Work Order' : '🚀 Terbitkan Work Order'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 2: OFFICIAL DOCUMENT PREVIEW (EXACT SCAN REPLICA)        */}
            {/* ============================================================== */}
            {previewRecord && (
                <div className={
                    isPreviewFullscreen
                        ? "fixed inset-0 z-50 flex flex-col bg-slate-900 overflow-hidden"
                        : "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto"
                }>
                    <div className={
                        isPreviewFullscreen
                            ? "w-full h-full flex flex-col bg-slate-900 overflow-hidden"
                            : "bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden border border-gray-700"
                    }>
                        {/* Top Bar with actions */}
                        <div className="bg-gray-950 text-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-800">
                            <div className="text-sm font-bold flex items-center gap-2.5">
                                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">📄</span>
                                <span className="font-mono text-emerald-400 font-black">{previewRecord.wo_no}</span>
                                <span className="text-gray-400 hidden sm:inline">• Preview Dokumen Resmi PT. MAM</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={route('repair.job-outside.pdf', previewRecord.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg"
                                >
                                    <span>🖨️ Cetak / Unduh PDF</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                                    title={isPreviewFullscreen ? 'Kecilkan Tampilan' : 'Tampilan Layar Penuh'}
                                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold"
                                >
                                    {isPreviewFullscreen ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5m11 0l5 5m0 0l-5 0m5 0l0-5" />
                                            </svg>
                                            <span className="hidden sm:inline">Kecilkan</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            <span className="hidden sm:inline">Fullscreen</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewRecord(null)}
                                    className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Paper Sheet Preview (Exact A4 Form) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/80 flex justify-center items-start">
                            <div className="bg-white p-8 md:p-10 shadow-2xl border border-gray-400 w-full max-w-[760px] text-black font-sans text-xs leading-normal select-none my-auto rounded-sm">
                                {/* Letterhead */}
                                <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-2">
                                    <img src="/images/logo.png" alt="PT. MAM" className="h-10 w-auto object-contain" />
                                    <div>
                                        <div className="font-black text-sm tracking-wide uppercase">PT. MITRA ABADI MAHAKAM</div>
                                        <div className="text-[10px] text-gray-700 italic">Jln. A.W. Syahranie No. 40 Samarinda</div>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="border-t border-b-2 border-black text-center py-1.5 my-2">
                                    <span className="font-black text-xs uppercase tracking-wider">
                                        WORK ORDER EXTERNAL REPAIR SHOP
                                    </span>
                                </div>

                                {/* 2 Columns Metadata Table */}
                                <table className="w-full border-collapse border border-black mb-3 text-[10px]">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold w-28 bg-gray-50">WO. NO.</td>
                                            <td className="border border-black p-1.5 w-2 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold font-mono">{previewRecord.wo_no}</td>
                                            <td className="border border-black p-1.5 font-bold w-28 bg-gray-50">MODEL MESIN</td>
                                            <td className="border border-black p-1.5 w-2 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.model_mesin || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">DATE</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.date}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">SERIAL NO.</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold font-mono">{previewRecord.serial_no_unit || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">NAMA BENGKEL</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-black text-purple-900">{previewRecord.nama_bengkel}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">KODE UNIT</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-black font-mono">{previewRecord.kode_unit || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">TANGGAL KIRIM</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.tanggal_kirim || '-'}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">NAMA KOMPONEN</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-black uppercase">{previewRecord.nama_komponen}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">ESTIMASI FINISH</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.estimasi_finish || '-'}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">COMPONENT GROUP</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.model_komponen || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">PIC</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.pic || 'AMBO MAI'}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">S/N. KOMPONEN</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-mono">{previewRecord.sn_komponen || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">EKS. LOKASI</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.lokasi || 'HW'}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">SMR / HRS</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-mono font-bold">
                                                {previewRecord.smr_hours ? parseFloat(previewRecord.smr_hours).toLocaleString('id-ID') : '0'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">TANGGAL KERUSAKAN</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.tanggal_kerusakan || '-'}</td>
                                            <td className="border border-black p-1.5 font-bold bg-gray-50">Qty</td>
                                            <td className="border border-black p-1.5 text-center">:</td>
                                            <td className="border border-black p-1.5 font-bold">{previewRecord.qty || 1}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Problem */}
                                <div className="border border-black mb-2">
                                    <div className="bg-gray-100 p-1 font-bold text-[9.5px] border-b border-black">PROBLEM :</div>
                                    <div className="p-2 font-bold uppercase text-[10.5px] text-red-900 min-h-[28px]">
                                        {previewRecord.problem || '-'}
                                    </div>
                                </div>

                                {/* Job Instruction */}
                                <div className="border border-black mb-3">
                                    <div className="bg-gray-100 p-1 font-bold text-[9.5px] border-b border-black">JOB INSTRUCTION :</div>
                                    <div className="p-2 font-bold uppercase text-[10.5px] min-h-[28px]">
                                        {previewRecord.job_instruction || '-'}
                                    </div>
                                </div>

                                {/* Photo Frame */}
                                <div className="border border-black p-2 mb-4 text-center min-h-[220px] flex items-center justify-center bg-gray-50">
                                    {previewRecord.photo_url ? (
                                        <img
                                            src={previewRecord.photo_url}
                                            alt="Foto Komponen"
                                            className="max-h-[250px] max-w-full object-contain border border-gray-300 shadow"
                                        />
                                    ) : (
                                        <div className="text-gray-400 italic text-[11px] py-12">
                                            [ FOTO KOMPONEN DILAMPIRKAN DI SINI ]<br/>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                Tag Unit: {previewRecord.kode_unit} - {previewRecord.nama_komponen}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Signatures 5 Columns */}
                                <div className="grid grid-cols-5 text-center text-[9.5px] pt-4">
                                    <div>
                                        <div className="text-gray-600 mb-10">Dibuat Oleh,</div>
                                        <div className="font-bold underline uppercase">{previewRecord.dibuat_oleh || 'Admin Plant'}</div>
                                        <div className="text-[8.5px] text-gray-500">Admin Plant</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 mb-10">Diketahui Oleh,</div>
                                        <div className="font-bold underline uppercase">{previewRecord.diketahui_oleh || 'Planner'}</div>
                                        <div className="text-[8.5px] text-gray-500">Planner</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 mb-10">Disetujui Oleh,</div>
                                        <div className="font-bold underline uppercase">{previewRecord.disetujui_oleh || 'Ambo Mai'}</div>
                                        <div className="text-[8.5px] text-gray-500">Superintendent Plant</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 mb-10">Dikirim Oleh,</div>
                                        <div className="font-bold underline uppercase">{previewRecord.dikirim_oleh || 'DANI'}</div>
                                        <div className="text-[8.5px] text-gray-500">Logistic</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 mb-10">Diterima Oleh,</div>
                                        <div className="font-bold underline uppercase">( {previewRecord.diterima_oleh || '                '} )</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
