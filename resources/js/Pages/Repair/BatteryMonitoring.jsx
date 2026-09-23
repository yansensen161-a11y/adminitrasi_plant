import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function BatteryMonitoring({
    batteries = [],
    stats = {},
    brandPresets = [],
    specPresets = [],
    units = [],
    filters = {}
}) {
    const { flash, manpowerList = [] } = usePage().props;
    const [currentTab, setCurrentTab] = useState(filters.tab || 'ACTIVE'); // 'ACTIVE', 'HISTORICAL', 'ALL'
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(true);
    const [editingBattery, setEditingBattery] = useState(null);

    // Quick Replace Modal
    const [replaceTargetBattery, setReplaceTargetBattery] = useState(null);

    // Detail Modal
    const [detailBattery, setDetailBattery] = useState(null);

    // Photo preview
    const [photoPreview, setPhotoPreview] = useState(null);

    // Form Hook for Create / Edit
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        unit_id: '',
        code_unit: '',
        brand_battery: 'GS ASTRA',
        part_number: 'N150',
        part_number_description: 'BATTERY 12V 150AH HEAVY DUTY COMMERCIAL',
        qty: 2,
        hm_instal: '0',
        hm_rusak: '',
        lifetime_hours: '0',
        target_lifetime_hours: '4500',
        tanggal_instal: new Date().toISOString().split('T')[0],
        tanggal_rusak: '',
        status: 'TERPASANG',
        posisi: 'SERI 1 & 2',
        voltage: '24V',
        penyebab_rusak: '',
        pic_instal: 'Mekanik Plant',
        pic_rusak: '',
        serial_number_battery: '',
        cost: '',
        notes: '',
        photo: null,
    });

    // Form Hook for Quick Replace
    const replaceForm = useForm({
        hm_rusak: '',
        tanggal_rusak: new Date().toISOString().split('T')[0],
        penyebab_rusak: 'Habis Masa Pakai / Drop Sel',
        pic_rusak: 'Mekanik Plant',
        new_brand_battery: 'GS ASTRA',
        new_part_number: 'N150',
        new_part_number_description: 'BATTERY 12V 150AH HEAVY DUTY COMMERCIAL',
        new_qty: 2,
        new_pic_instal: 'Mekanik Plant',
        new_serial_number: '',
        new_cost: '',
    });

    // Auto-calculate lifetime when HM values change in Form
    const handleHmChange = (val, field) => {
        const hmInstal = field === 'hm_instal' ? parseFloat(val) || 0 : parseFloat(data.hm_instal) || 0;
        const hmRusak = field === 'hm_rusak' ? (val !== '' ? parseFloat(val) : null) : (data.hm_rusak !== '' ? parseFloat(data.hm_rusak) : null);

        let calculatedLife = 0;
        if (hmRusak !== null && hmRusak >= hmInstal) {
            calculatedLife = hmRusak - hmInstal;
        }

        setData(prev => ({
            ...prev,
            [field]: val,
            lifetime_hours: calculatedLife > 0 ? calculatedLife : prev.lifetime_hours
        }));
    };

    // When unit is selected from dropdown, autofill code_unit, current HM as HM instal
    const handleUnitSelect = (unitId) => {
        const found = units.find(u => String(u.id) === String(unitId));
        if (found) {
            setData(prev => ({
                ...prev,
                unit_id: found.id,
                code_unit: found.code_unit,
                hm_instal: found.hm ? String(found.hm) : '0',
            }));
        } else {
            setData(prev => ({ ...prev, unit_id: '', code_unit: '' }));
        }
    };

    // When part number preset is chosen, autofill description, voltage, and target
    const handlePartNumberSelect = (pn) => {
        const found = specPresets.find(s => s.part_number === pn);
        if (found) {
            setData(prev => ({
                ...prev,
                part_number: found.part_number,
                part_number_description: found.description,
                voltage: found.voltage,
                target_lifetime_hours: String(found.target_lifetime),
            }));
        } else {
            setData(prev => ({ ...prev, part_number: pn }));
        }
    };

    const handleReplacePartNumberSelect = (pn) => {
        const found = specPresets.find(s => s.part_number === pn);
        if (found) {
            replaceForm.setData(prev => ({
                ...prev,
                new_part_number: found.part_number,
                new_part_number_description: found.description,
            }));
        } else {
            replaceForm.setData('new_part_number', pn);
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingBattery(null);
        setPhotoPreview(null);
        setData({
            unit_id: '',
            code_unit: '',
            brand_battery: 'GS ASTRA',
            part_number: 'N150',
            part_number_description: 'BATTERY 12V 150AH HEAVY DUTY COMMERCIAL',
            qty: 2,
            hm_instal: '0',
            hm_rusak: '',
            lifetime_hours: '0',
            target_lifetime_hours: '4500',
            tanggal_instal: new Date().toISOString().split('T')[0],
            tanggal_rusak: '',
            status: 'TERPASANG',
            posisi: 'SERI 1 & 2',
            voltage: '24V',
            penyebab_rusak: '',
            pic_instal: 'Mekanik Plant',
            pic_rusak: '',
            serial_number_battery: '',
            cost: '',
            notes: '',
            photo: null,
        });
        setShowFormModal(true);
    };

    const openEditModal = (battery) => {
        clearErrors();
        setEditingBattery(battery);
        setPhotoPreview(battery.photo_url || null);
        setData({
            unit_id: battery.unit_id || '',
            code_unit: battery.code_unit || '',
            brand_battery: battery.brand_battery || 'GS ASTRA',
            part_number: battery.part_number || '',
            part_number_description: battery.part_number_description || '',
            qty: battery.qty || 1,
            hm_instal: battery.hm_instal !== null ? String(battery.hm_instal) : '0',
            hm_rusak: battery.hm_rusak !== null ? String(battery.hm_rusak) : '',
            lifetime_hours: battery.lifetime_hours !== null ? String(battery.lifetime_hours) : '0',
            target_lifetime_hours: battery.target_lifetime_hours !== null ? String(battery.target_lifetime_hours) : '4000',
            tanggal_instal: battery.tanggal_instal || '',
            tanggal_rusak: battery.tanggal_rusak || '',
            status: battery.status || 'TERPASANG',
            posisi: battery.posisi || '',
            voltage: battery.voltage || '12V',
            penyebab_rusak: battery.penyebab_rusak || '',
            pic_instal: battery.pic_instal || '',
            pic_rusak: battery.pic_rusak || '',
            serial_number_battery: battery.serial_number_battery || '',
            cost: battery.cost !== null ? String(battery.cost) : '',
            notes: battery.notes || '',
            photo: null,
        });
        setShowFormModal(true);
    };

    const openReplaceModal = (battery) => {
        setReplaceTargetBattery(battery);
        const currentHm = battery.unit?.hm ? String(battery.unit.hm) : String(battery.hm_instal);
        replaceForm.reset();
        replaceForm.clearErrors();
        replaceForm.setData({
            hm_rusak: currentHm,
            tanggal_rusak: new Date().toISOString().split('T')[0],
            penyebab_rusak: 'Drop Sel / Umur Pakai Tercapai',
            pic_rusak: 'Mekanik Plant',
            new_brand_battery: battery.brand_battery,
            new_part_number: battery.part_number,
            new_part_number_description: battery.part_number_description || '',
            new_qty: battery.qty || 1,
            new_pic_instal: 'Mekanik Plant',
            new_serial_number: '',
            new_cost: battery.cost ? String(battery.cost) : '',
        });
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
        if (editingBattery) {
            post(route('repair.battery.update', editingBattery.id), {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                }
            });
        } else {
            post(route('repair.battery.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                }
            });
        }
    };

    const submitReplace = (e) => {
        e.preventDefault();
        if (!replaceTargetBattery) return;

        replaceForm.post(route('repair.battery.replace', replaceTargetBattery.id), {
            onSuccess: () => {
                setReplaceTargetBattery(null);
            }
        });
    };

    const handleDelete = (battery) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan battery unit ${battery.code_unit} (${battery.brand_battery} ${battery.part_number})?`)) {
            router.delete(route('repair.battery.destroy', battery.id));
        }
    };

    // Filter Apply
    const applyFilters = () => {
        router.get(route('repair.battery.index'), {
            search: searchTerm,
            unit: selectedUnit,
            brand: selectedBrand,
            status: selectedStatus,
            tab: currentTab,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const switchTab = (tab) => {
        setCurrentTab(tab);
        router.get(route('repair.battery.index'), {
            search: searchTerm,
            unit: selectedUnit,
            brand: selectedBrand,
            status: selectedStatus,
            tab: tab,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Replace Battery - PT. Mitra Abadi Mahakam" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-6">

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">✅</span>
                            <p className="text-sm font-bold text-emerald-900">{flash.success}</p>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm font-bold text-red-900">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#0b5c3e] via-[#0f766e] to-[#04432c] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-400/20">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-black tracking-widest uppercase border border-white/15">
                            <span>🔋 Plant Component Monitoring</span>
                            <span>•</span>
                            <span>PT. MITRA ABADI MAHAKAM</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm uppercase">
                            MONITORING REPLACE BATTERY
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl font-medium leading-relaxed">
                            Sistem kendali penggantian baterai/aki armada operasional. Pelacakan terintegrasi HM Instal, HM Rusak, dan kalkulasi running Life Time terhadap target umur pakai.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={route('repair.battery.export', { unit: selectedUnit, brand: selectedBrand, status: selectedStatus })}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-black transition border border-white/20 flex items-center gap-2 shadow-sm"
                        >
                            <span>📥 Unduh CSV / Excel</span>
                        </a>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-950/30 flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                            <span className="text-base font-black">+</span>
                            <span>Pasang Battery Baru</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Card 1: Active Battery */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0 border border-emerald-100">
                            🔋
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Battery Aktif</div>
                            <div className="text-2xl font-black text-gray-900 mt-0.5">
                                {stats.total_installed ?? 0} <span className="text-xs font-bold text-gray-500">Unit</span>
                            </div>
                            <div className="text-[10px] text-emerald-700 font-bold">Status Terpasang</div>
                        </div>
                    </div>

                    {/* Card 2: Replaced Batteries */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl shrink-0 border border-rose-100">
                            🔄
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Total Diganti</div>
                            <div className="text-2xl font-black text-rose-600 mt-0.5">
                                {stats.total_replaced ?? 0} <span className="text-xs font-bold text-gray-500">Aki</span>
                            </div>
                            <div className="text-[10px] text-rose-700 font-bold">Riwayat Kerusakan</div>
                        </div>
                    </div>

                    {/* Card 3: Monitored Units */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0 border border-blue-100">
                            🚜
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Populasi Unit</div>
                            <div className="text-2xl font-black text-blue-900 mt-0.5">
                                {stats.total_monitored_units ?? 0} <span className="text-xs font-bold text-gray-500">Unit</span>
                            </div>
                            <div className="text-[10px] text-blue-700 font-bold">Terpantau Database</div>
                        </div>
                    </div>

                    {/* Card 4: Average Lifetime */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0 border border-amber-100">
                            ⏱️
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Rata-Rata Lifetime</div>
                            <div className="text-2xl font-black text-amber-900 mt-0.5 font-mono">
                                {Number(stats.avg_lifetime_hours || 0).toLocaleString('id-ID')} <span className="text-xs font-bold text-gray-500">Jam</span>
                            </div>
                            <div className="text-[10px] text-amber-700 font-bold">Umur Pakai Aktual</div>
                        </div>
                    </div>

                    {/* Card 5: Alert Reaching Target */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 border border-purple-100">
                            ⚠️
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Perlu Pantauan</div>
                            <div className="text-2xl font-black text-purple-900 mt-0.5">
                                {stats.alert_count ?? 0} <span className="text-xs font-bold text-gray-500">Aki</span>
                            </div>
                            <div className="text-[10px] text-purple-700 font-bold">≥90% Target Lifetime</div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search Filter Bar */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => switchTab('ACTIVE')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                                    currentTab === 'ACTIVE'
                                        ? 'bg-[#0b5c3e] text-white shadow'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                🔋 Battery Aktif (Terpasang)
                            </button>
                            <button
                                type="button"
                                onClick={() => switchTab('HISTORICAL')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                                    currentTab === 'HISTORICAL'
                                        ? 'bg-[#0b5c3e] text-white shadow'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                🔄 Riwayat Penggantian (Rusak)
                            </button>
                            <button
                                type="button"
                                onClick={() => switchTab('ALL')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                                    currentTab === 'ALL'
                                        ? 'bg-[#0b5c3e] text-white shadow'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                📑 Semua Data
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                    placeholder="Cari Code Unit, Brand, Part Number..."
                                    className="w-full text-xs font-bold py-2 pl-9 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                            </div>
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="bg-[#0b5c3e] hover:bg-[#08422c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                            >
                                Cari
                            </button>
                        </div>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">Filter Unit</label>
                            <select
                                value={selectedUnit}
                                onChange={e => setSelectedUnit(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]"
                            >
                                <option value="">-- Semua Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.code_unit}>
                                        {u.code_unit} - {u.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">Filter Brand Battery</label>
                            <select
                                value={selectedBrand}
                                onChange={e => setSelectedBrand(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]"
                            >
                                <option value="">-- Semua Merk / Brand --</option>
                                {brandPresets.map((b, i) => (
                                    <option key={i} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">Filter Status</label>
                            <select
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl border-gray-300 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]"
                            >
                                <option value="">-- Semua Status --</option>
                                <option value="TERPASANG">TERPASANG (Aktif)</option>
                                <option value="RUSAK">RUSAK (Diganti)</option>
                                <option value="SCRAP">SCRAP (Dibuang/Afkir)</option>
                                <option value="CLAIM_GARANSI">CLAIM GARANSI</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="flex-1 bg-gray-800 hover:bg-black text-white py-2 rounded-xl text-xs font-bold transition"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedUnit('');
                                    setSelectedBrand('');
                                    setSelectedStatus('');
                                    router.get(route('repair.battery.index'), { tab: currentTab });
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-xl text-xs font-bold transition"
                                title="Reset Filter"
                            >
                                ↺ Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Battery Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gradient-to-r from-emerald-900 to-[#0b5c3e] text-white font-black uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-3 text-center w-12">No</th>
                                    <th className="py-3.5 px-4">Code Unit</th>
                                    <th className="py-3.5 px-4">Brand Battery</th>
                                    <th className="py-3.5 px-4">Part Number & Description</th>
                                    <th className="py-3.5 px-3 text-center">Qty</th>
                                    <th className="py-3.5 px-4">Posisi & Volt</th>
                                    <th className="py-3.5 px-4">HM Instal</th>
                                    <th className="py-3.5 px-4">HM Rusak</th>
                                    <th className="py-3.5 px-4">Life Time</th>
                                    <th className="py-3.5 px-3 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {batteries.length > 0 ? (
                                    batteries.map((b, idx) => {
                                        const isReplaced = b.status !== 'TERPASANG';
                                        const runningLife = b.current_lifetime;
                                        const targetLife = parseFloat(b.target_lifetime_hours) || 4000;
                                        const pct = Math.min(100, Math.round((runningLife / targetLife) * 100));

                                        return (
                                            <tr key={b.id} className="hover:bg-slate-50/80 transition group">
                                                {/* No */}
                                                <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-500">
                                                    {idx + 1}
                                                </td>

                                                {/* Code Unit */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0b5c3e] flex items-center justify-center font-black text-xs border border-emerald-200 shrink-0">
                                                            🚜
                                                        </div>
                                                        <div>
                                                            <div className="font-mono font-black text-gray-900 text-sm">
                                                                {b.code_unit}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 truncate max-w-[140px]">
                                                                {b.unit?.model || 'Unit Populasi'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Brand Battery */}
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-50 text-purple-900 border border-purple-200 shadow-sm">
                                                        <span>⚡</span>
                                                        <span>{b.brand_battery}</span>
                                                    </span>
                                                </td>

                                                {/* Part Number & Description */}
                                                <td className="py-3.5 px-4 max-w-xs">
                                                    <div className="font-mono font-black text-emerald-950 text-xs">
                                                        {b.part_number}
                                                    </div>
                                                    <div className="text-[11px] text-gray-600 uppercase leading-snug font-medium">
                                                        {b.part_number_description || '-'}
                                                    </div>
                                                    {b.serial_number_battery && (
                                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                            S/N: {b.serial_number_battery}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Qty */}
                                                <td className="py-3.5 px-3 text-center font-mono font-black text-sm text-gray-800">
                                                    {b.qty} <span className="text-[10px] font-normal text-gray-500">Pcs</span>
                                                </td>

                                                {/* Posisi & Voltage */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-800 text-[11px]">
                                                        {b.posisi || 'STANDAR'}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-gray-500">
                                                        {b.voltage || '12V'} System
                                                    </div>
                                                </td>

                                                {/* HM Instal */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-mono font-bold text-gray-900 text-xs">
                                                        {b.hm_instal !== null ? Number(b.hm_instal).toLocaleString('id-ID') : '0'} Jam
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">
                                                        📅 {b.tanggal_instal || '-'}
                                                    </div>
                                                </td>

                                                {/* HM Rusak */}
                                                <td className="py-3.5 px-4">
                                                    {b.hm_rusak !== null ? (
                                                        <>
                                                            <div className="font-mono font-bold text-rose-700 text-xs">
                                                                {Number(b.hm_rusak).toLocaleString('id-ID')} Jam
                                                            </div>
                                                            <div className="text-[10px] text-rose-600">
                                                                📅 {b.tanggal_rusak || '-'}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 font-mono italic">
                                                            [ Masih Terpasang ]
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Life Time */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className={`font-mono font-black text-sm ${
                                                            isReplaced ? 'text-gray-900' : 'text-blue-900'
                                                        }`}>
                                                            {Number(runningLife).toLocaleString('id-ID')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-500">Jam</span>
                                                        {!isReplaced && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                                                                Running
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Progress bar towards target */}
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                pct >= 100
                                                                    ? 'bg-rose-500'
                                                                    : pct >= 80
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-[9.5px] text-gray-400 mt-0.5 flex justify-between">
                                                        <span>Target: {Number(targetLife).toLocaleString('id-ID')}</span>
                                                        <span>{pct}%</span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-3 text-center">
                                                    {b.status === 'TERPASANG' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                                            Terpasang
                                                        </span>
                                                    )}
                                                    {b.status === 'RUSAK' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                                            Rusak / Ganti
                                                        </span>
                                                    )}
                                                    {b.status === 'SCRAP' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-300">
                                                            Scrap
                                                        </span>
                                                    )}
                                                    {b.status === 'CLAIM_GARANSI' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                                            Garansi
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Quick Replace Button (only for active batteries) */}
                                                        {b.status === 'TERPASANG' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openReplaceModal(b)}
                                                                title="Ganti Battery Baru (Replace)"
                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-sm"
                                                            >
                                                                <span>⚡ Ganti</span>
                                                            </button>
                                                        )}

                                                        {/* Detail Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailBattery(b)}
                                                            title="Lihat Rincian Battery"
                                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                                        >
                                                            👁️
                                                        </button>

                                                        {/* Edit Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(b)}
                                                            title="Edit Data"
                                                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                                                        >
                                                            ✏️
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(b)}
                                                            title="Hapus Data"
                                                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
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
                                        <td colSpan="11" className="py-12 text-center text-gray-400">
                                            <div className="text-3xl mb-2">🔋</div>
                                            <div className="text-sm font-bold text-gray-600">Belum ada data monitoring battery</div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Klik tombol "+ Pasang Battery Baru" untuk menambahkan instalasi aki pada unit.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* MODAL 1: FORM CREATE / EDIT BATTERY MONITORING (FULLSCREEN)     */}
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
                            : "bg-slate-100 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-300"
                    }>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#0b5c3e] via-[#0e6d4a] to-[#08422c] text-white px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-md shrink-0">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-2xl shadow-inner">
                                    🔋
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                                            {editingBattery ? `Edit Data Battery: ${editingBattery.code_unit}` : 'Pencatatan Instalasi / Penggantian Battery Baru'}
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-400/25 text-emerald-100 border border-emerald-300/30">
                                            MAM Plant System
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-emerald-100/90 mt-0.5 font-medium">
                                        Monitoring Penggantian Baterai, HM Instalasi, HM Kerusakan, dan Analisa Life Time Operasional
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                                    title={isModalFullscreen ? 'Perkecil' : 'Layar Penuh'}
                                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-2 text-xs font-bold border border-white/15"
                                >
                                    {isModalFullscreen ? '🗗 Kecilkan' : '⛶ Fullscreen'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition text-xl font-black border border-white/15"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                            {/* Section 1: Informasi Unit */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">1</span>
                                    <span>INFORMASI UNIT & PERANGKAT</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Pilih Unit (Populasi)
                                        </label>
                                        <select
                                            value={data.unit_id}
                                            onChange={e => handleUnitSelect(e.target.value)}
                                            className="w-full text-sm font-bold py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-emerald-950 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        >
                                            <option value="">-- Pilih Unit Terdaftar --</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.code_unit} - {u.model} (HM: {u.hm || 0})
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-[10px] text-gray-400 mt-1 block">Otomatis mengisi HM berjalan unit</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Code Unit <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.code_unit}
                                            onChange={e => setData('code_unit', e.target.value.toUpperCase())}
                                            placeholder="Contoh: DT01 / ME068"
                                            className="w-full text-sm font-mono font-black uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        {errors.code_unit && <div className="text-xs text-red-600 mt-1">{errors.code_unit}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Posisi Pemasangan
                                        </label>
                                        <input
                                            type="text"
                                            value={data.posisi}
                                            onChange={e => setData('posisi', e.target.value)}
                                            placeholder="Contoh: SERI 1 & 2 / STARTING"
                                            className="w-full text-sm font-bold py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Sistem Tegangan (Volt)
                                        </label>
                                        <select
                                            value={data.voltage}
                                            onChange={e => setData('voltage', e.target.value)}
                                            className="w-full text-sm font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        >
                                            <option value="12V">12V (Sistem Tunggal)</option>
                                            <option value="24V">24V (Sistem Seri 2 Baterai)</option>
                                            <option value="48V">48V</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Spesifikasi Battery */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">2</span>
                                        <span>SPESIFIKASI BATERAI / AKI</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                                        💡 Pilih part number untuk otomatisasi deskripsi & target lifetime
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Brand Battery <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="brands_list"
                                            value={data.brand_battery}
                                            onChange={e => setData('brand_battery', e.target.value.toUpperCase())}
                                            placeholder="Contoh: GS ASTRA"
                                            className="w-full text-sm font-black uppercase py-2.5 px-3.5 rounded-xl border border-purple-300 text-purple-950 bg-purple-50/40 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        <datalist id="brands_list">
                                            {brandPresets.map((b, i) => (
                                                <option key={i} value={b} />
                                            ))}
                                        </datalist>
                                        {errors.brand_battery && <div className="text-xs text-red-600 mt-1">{errors.brand_battery}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Part Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="specs_list"
                                            value={data.part_number}
                                            onChange={e => handlePartNumberSelect(e.target.value.toUpperCase())}
                                            placeholder="Contoh: N150 / N200 / 115D31R"
                                            className="w-full text-sm font-mono font-black uppercase py-2.5 px-3.5 rounded-xl border border-emerald-300 text-emerald-950 bg-emerald-50/40 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                        <datalist id="specs_list">
                                            {specPresets.map((s, i) => (
                                                <option key={i} value={s.part_number}>{s.description}</option>
                                            ))}
                                        </datalist>
                                        {errors.part_number && <div className="text-xs text-red-600 mt-1">{errors.part_number}</div>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Part Number Description
                                        </label>
                                        <input
                                            type="text"
                                            value={data.part_number_description}
                                            onChange={e => setData('part_number_description', e.target.value.toUpperCase())}
                                            placeholder="Contoh: BATTERY 12V 150AH HEAVY DUTY COMMERCIAL"
                                            className="w-full text-sm font-bold uppercase py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Jumlah (Qty) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.qty}
                                            onChange={e => setData('qty', parseInt(e.target.value) || 1)}
                                            className="w-full text-sm font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Serial Number Battery / Barcode
                                        </label>
                                        <input
                                            type="text"
                                            value={data.serial_number_battery}
                                            onChange={e => setData('serial_number_battery', e.target.value)}
                                            placeholder="Contoh: SNB-2026-99120"
                                            className="w-full text-sm font-mono py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Target Lifetime (Jam)
                                        </label>
                                        <input
                                            type="number"
                                            step="100"
                                            value={data.target_lifetime_hours}
                                            onChange={e => setData('target_lifetime_hours', e.target.value)}
                                            placeholder="4500"
                                            className="w-full text-sm font-mono font-black py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Biaya / Harga Penggantian (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.cost}
                                            onChange={e => setData('cost', e.target.value)}
                                            placeholder="Contoh: 2850000"
                                            className="w-full text-sm font-mono py-2.5 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e] focus:border-[#0b5c3e] shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: HM Instal, HM Rusak & Life Time Calculation */}
                            <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-blue-50/90 p-6 md:p-7 rounded-2xl border border-emerald-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wider mb-5 flex items-center justify-between pb-3 border-b border-emerald-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">3</span>
                                        <span>PEMANTAUAN HOUR METER (HM) & LIFE TIME AKI</span>
                                    </div>
                                    <span className="text-xs text-emerald-900 bg-white/80 px-3 py-1 rounded-full font-bold border border-emerald-300 shadow-sm">
                                        Formula: Life time = HM Rusak - HM Instal
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {/* HM Instal */}
                                    <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                                        <label className="block text-xs font-black uppercase text-emerald-900 tracking-wider mb-1.5">
                                            HM Instal <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.hm_instal}
                                            onChange={e => handleHmChange(e.target.value, 'hm_instal')}
                                            placeholder="0"
                                            className="w-full text-base font-mono font-black py-2 px-3 rounded-lg border border-gray-300 text-emerald-950 focus:ring-2 focus:ring-[#0b5c3e]"
                                            required
                                        />
                                        <div className="mt-2">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Tanggal Pasang</label>
                                            <input
                                                type="date"
                                                value={data.tanggal_instal}
                                                onChange={e => setData('tanggal_instal', e.target.value)}
                                                className="w-full text-xs font-bold py-1 px-2 rounded border-gray-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* HM Rusak */}
                                    <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
                                        <label className="block text-xs font-black uppercase text-rose-900 tracking-wider mb-1.5">
                                            HM Rusak (Bila Sudah Diganti)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.hm_rusak}
                                            onChange={e => handleHmChange(e.target.value, 'hm_rusak')}
                                            placeholder="Kosongkan jika aktif"
                                            className="w-full text-base font-mono font-black py-2 px-3 rounded-lg border border-gray-300 text-rose-900 focus:ring-2 focus:ring-rose-500"
                                        />
                                        <div className="mt-2">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Tanggal Rusak</label>
                                            <input
                                                type="date"
                                                value={data.tanggal_rusak}
                                                onChange={e => setData('tanggal_rusak', e.target.value)}
                                                className="w-full text-xs font-bold py-1 px-2 rounded border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Life Time */}
                                    <div className="bg-blue-50/80 p-4 rounded-xl border-2 border-blue-400 shadow-sm">
                                        <label className="block text-xs font-black uppercase text-blue-900 tracking-wider mb-1.5 flex items-center justify-between">
                                            <span>Life Time (Jam)</span>
                                            <span className="text-[10px] bg-blue-200 text-blue-950 px-2 py-0.5 rounded font-black">Hasil Kalkulasi</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.lifetime_hours}
                                            onChange={e => setData('lifetime_hours', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-xl font-mono font-black py-2 px-3 rounded-lg border-2 border-blue-400 text-blue-950 bg-white shadow-inner"
                                        />
                                        <span className="text-[10px] text-blue-800 font-semibold mt-2 block">
                                            {data.hm_rusak ? 'Kalkulasi: HM Rusak - HM Instal' : 'Jika aktif: berjalan otomatis berdasarkan HM Unit'}
                                        </span>
                                    </div>

                                    {/* Status & PIC */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Status Battery
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full text-xs font-black py-2 px-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#0b5c3e]"
                                        >
                                            <option value="TERPASANG">🔋 TERPASANG (Aktif Beroperasi)</option>
                                            <option value="RUSAK">⚙️ RUSAK (Telah Diganti)</option>
                                            <option value="SCRAP">🗑️ SCRAP (Afkir / Rusak Berat)</option>
                                            <option value="CLAIM_GARANSI">🛡️ CLAIM GARANSI VENDOR</option>
                                        </select>

                                        <div className="mt-2">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">PIC Teknisi / Mekanik</label>
                                            <select
                                                value={data.pic_instal}
                                                onChange={e => setData('pic_instal', e.target.value)}
                                                className="w-full text-xs font-bold py-1 px-2 rounded border-gray-300 bg-white"
                                            >
                                                <option value="">-- Pilih Mekanik --</option>
                                                {manpowerList && manpowerList.length > 0 ? (
                                                    manpowerList.map(mp => (
                                                        <option key={mp.id} value={mp.nama}>
                                                            {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="Mekanik Plant">Mekanik Plant</option>
                                                )}
                                                {data.pic_instal && !manpowerList?.some(mp => mp.nama === data.pic_instal) && (
                                                    <option value={data.pic_instal}>{data.pic_instal}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Penyebab Kerusakan & Foto */}
                            <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm">
                                <h4 className="text-sm font-black text-[#0b5c3e] uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0b5c3e] flex items-center justify-center text-xs font-black">4</span>
                                    <span>ANALISA KERUSAKAN, DOKUMENTASI FOTO & CATATAN</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Penyebab Kerusakan (Bila Rusak)
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.penyebab_rusak}
                                            onChange={e => setData('penyebab_rusak', e.target.value)}
                                            placeholder="Contoh: Drop tegangan dibawah 10.5V, sel ke-3 mati, korslet internal atau fisik pecah terbentur"
                                            className="w-full text-xs font-medium p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e]"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                                            Catatan Tambahan
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            placeholder="Contoh: Penggantian berkala sesuai jadwal maintenance 4000 jam"
                                            className="w-full text-xs font-medium p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0b5c3e]"
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2 pt-1">
                                        <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">
                                            Lampiran Foto Fisik Battery (Opsional)
                                        </label>
                                        <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/70">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0b5c3e] file:text-white hover:file:bg-[#08422c] cursor-pointer"
                                            />
                                            {photoPreview ? (
                                                <div className="relative group">
                                                    <img
                                                        src={photoPreview}
                                                        alt="Preview Battery"
                                                        className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-500 shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPhotoPreview(null);
                                                            setData('photo', null);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400 italic">
                                                    Belum ada foto dipilih. Format: JPG, PNG (Maks 5MB).
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Action Bar */}
                            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border border-gray-200 px-6 py-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 z-20 shadow-xl">
                                <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                                    <span className="font-mono font-black bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200">
                                        Unit: {data.code_unit || '-'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-gray-800">
                                        Brand: {data.brand_battery} ({data.part_number})
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-gray-800">
                                        Qty: {data.qty} Pcs
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0b5c3e] hover:bg-[#08422c] text-white px-8 py-3 rounded-xl text-sm font-black transition flex items-center gap-2 shadow-xl shadow-emerald-950/25 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan Data...' : (editingBattery ? '💾 Simpan Perubahan' : '🚀 Simpan Data Battery')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 2: QUICK REPLACE BATTERY                                 */}
            {/* ============================================================== */}
            {replaceTargetBattery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-300 animate-fadeIn">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-800 to-[#0b5c3e] text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <h3 className="text-lg font-black uppercase">
                                        Ganti Battery Unit: {replaceTargetBattery.code_unit}
                                    </h3>
                                    <p className="text-xs text-emerald-100">
                                        Pencatatan battery lama rusak & pemasangan battery baru secara langsung
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplaceTargetBattery(null)}
                                className="text-white hover:text-red-200 text-xl font-bold w-8 h-8 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Replace Form */}
                        <form onSubmit={submitReplace} className="p-6 space-y-5">
                            {/* Summary Old Battery */}
                            <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200">
                                <div className="text-xs font-black text-rose-900 uppercase mb-2">
                                    1. DATA BATTERY LAMA (YANG DIGANTI)
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Brand & PN:</span>
                                        <span className="font-bold text-gray-900">{replaceTargetBattery.brand_battery} {replaceTargetBattery.part_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">HM Pasang:</span>
                                        <span className="font-mono font-bold text-gray-900">{replaceTargetBattery.hm_instal} Jam</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Tanggal Pasang:</span>
                                        <span className="font-bold text-gray-900">{replaceTargetBattery.tanggal_instal}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Qty:</span>
                                        <span className="font-bold text-gray-900">{replaceTargetBattery.qty} Pcs</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rose-200/60">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-rose-950 mb-1">
                                            HM Saat Rusak / Diganti <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={replaceForm.data.hm_rusak}
                                            onChange={e => replaceForm.setData('hm_rusak', e.target.value)}
                                            className="w-full text-sm font-mono font-black py-2 px-3 rounded-xl border-rose-300 focus:ring-rose-500 bg-white"
                                            required
                                        />
                                        {replaceForm.errors.hm_rusak && <div className="text-xs text-red-600 mt-1">{replaceForm.errors.hm_rusak}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-rose-950 mb-1">
                                            Tanggal Kerusakan / Penggantian <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={replaceForm.data.tanggal_rusak}
                                            onChange={e => replaceForm.setData('tanggal_rusak', e.target.value)}
                                            className="w-full text-xs font-bold py-2 px-3 rounded-xl border-rose-300 focus:ring-rose-500 bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-black uppercase text-rose-950 mb-1">
                                            Penyebab Kerusakan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={replaceForm.data.penyebab_rusak}
                                            onChange={e => replaceForm.setData('penyebab_rusak', e.target.value)}
                                            placeholder="Contoh: Drop sel tegangan, overcharge, atau masa pakai habis"
                                            className="w-full text-xs font-medium py-2 px-3 rounded-xl border-rose-300 bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* New Replacement Battery */}
                            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
                                <div className="text-xs font-black text-emerald-950 uppercase mb-2 flex items-center justify-between">
                                    <span>2. SPESIFIKASI BATTERY PENGGANTI BARU</span>
                                    <span className="text-[10px] text-emerald-800 font-bold">HM Instal = HM Rusak otomatis</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-emerald-950 mb-1">
                                            Brand Battery Baru <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="brands_list_replace"
                                            value={replaceForm.data.new_brand_battery}
                                            onChange={e => replaceForm.setData('new_brand_battery', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-black uppercase py-2 px-3 rounded-xl border-emerald-300 bg-white"
                                            required
                                        />
                                        <datalist id="brands_list_replace">
                                            {brandPresets.map((b, i) => (
                                                <option key={i} value={b} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-emerald-950 mb-1">
                                            Part Number Baru <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="specs_list_replace"
                                            value={replaceForm.data.new_part_number}
                                            onChange={e => handleReplacePartNumberSelect(e.target.value.toUpperCase())}
                                            className="w-full text-xs font-mono font-black uppercase py-2 px-3 rounded-xl border-emerald-300 bg-white"
                                            required
                                        />
                                        <datalist id="specs_list_replace">
                                            {specPresets.map((s, i) => (
                                                <option key={i} value={s.part_number}>{s.description}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-black uppercase text-emerald-950 mb-1">
                                            Deskripsi Part Number
                                        </label>
                                        <input
                                            type="text"
                                            value={replaceForm.data.new_part_number_description}
                                            onChange={e => replaceForm.setData('new_part_number_description', e.target.value.toUpperCase())}
                                            className="w-full text-xs font-bold uppercase py-2 px-3 rounded-xl border-emerald-300 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-emerald-950 mb-1">
                                            Jumlah (Qty)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={replaceForm.data.new_qty}
                                            onChange={e => replaceForm.setData('new_qty', parseInt(e.target.value) || 1)}
                                            className="w-full text-xs font-black py-2 px-3 rounded-xl border-emerald-300 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-emerald-950 mb-1">
                                            PIC Pemasangan
                                        </label>
                                        <select
                                            value={replaceForm.data.new_pic_instal}
                                            onChange={e => replaceForm.setData('new_pic_instal', e.target.value)}
                                            className="w-full text-xs font-bold py-2 px-3 rounded-xl border-emerald-300 bg-white"
                                        >
                                            <option value="">-- Pilih PIC / Mekanik --</option>
                                            {manpowerList && manpowerList.length > 0 ? (
                                                manpowerList.map(mp => (
                                                    <option key={mp.id} value={mp.nama}>
                                                        {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="Mekanik Plant">Mekanik Plant</option>
                                            )}
                                            {replaceForm.data.new_pic_instal && !manpowerList?.some(mp => mp.nama === replaceForm.data.new_pic_instal) && (
                                                <option value={replaceForm.data.new_pic_instal}>{replaceForm.data.new_pic_instal}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReplaceTargetBattery(null)}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={replaceForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-[#0b5c3e] hover:bg-[#08422c] text-white font-black text-xs shadow-lg flex items-center gap-2"
                                >
                                    {replaceForm.processing ? 'Memproses Penggantian...' : '🚀 Simpan Penggantian Battery'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 3: DETAIL BATTERY                                        */}
            {/* ============================================================== */}
            {detailBattery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-300 animate-fadeIn">
                        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🔍</span>
                                <span className="font-bold text-sm">
                                    Detail Battery: {detailBattery.code_unit} ({detailBattery.brand_battery})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailBattery(null)}
                                className="text-gray-400 hover:text-white text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Code Unit</span>
                                    <span className="font-mono font-black text-sm text-gray-900">{detailBattery.code_unit}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Model Unit</span>
                                    <span className="font-bold text-gray-800">{detailBattery.unit?.model || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Brand Battery</span>
                                    <span className="font-black text-purple-900">{detailBattery.brand_battery}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Part Number</span>
                                    <span className="font-mono font-black text-emerald-900">{detailBattery.part_number}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Description</span>
                                    <span className="font-bold text-gray-800">{detailBattery.part_number_description || '-'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-200">
                                <div>
                                    <span className="text-blue-700 block text-[10px] uppercase font-bold">HM Instal</span>
                                    <span className="font-mono font-black text-sm text-blue-950">{detailBattery.hm_instal} Jam</span>
                                    <span className="text-[10px] text-gray-500 block">{detailBattery.tanggal_instal}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700 block text-[10px] uppercase font-bold">HM Rusak</span>
                                    <span className="font-mono font-black text-sm text-rose-800">
                                        {detailBattery.hm_rusak ? `${detailBattery.hm_rusak} Jam` : '-'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">{detailBattery.tanggal_rusak || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700 block text-[10px] uppercase font-bold">Life Time</span>
                                    <span className="font-mono font-black text-sm text-emerald-900">
                                        {detailBattery.current_lifetime} Jam
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">Target: {detailBattery.target_lifetime_hours}</span>
                                </div>
                            </div>

                            {detailBattery.penyebab_rusak && (
                                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                                    <span className="text-rose-900 block text-[10px] uppercase font-black mb-1">Penyebab Kerusakan</span>
                                    <p className="text-gray-800 font-medium">{detailBattery.penyebab_rusak}</p>
                                </div>
                            )}

                            {detailBattery.photo_url && (
                                <div className="text-center pt-2">
                                    <span className="text-gray-500 block text-[10px] uppercase font-bold mb-2">Foto Fisik Battery</span>
                                    <img
                                        src={detailBattery.photo_url}
                                        alt="Foto Battery"
                                        className="max-h-56 mx-auto rounded-xl border border-gray-300 shadow"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDetailBattery(null)}
                                    className="px-5 py-2 rounded-xl bg-gray-800 text-white font-bold text-xs"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
