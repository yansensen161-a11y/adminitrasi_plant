import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Create({
    units = [],
    preselectedUnit = null,
    suggestedFormNumber = '',
    defaultItems = [],
    existingForm = null,
}) {
    const isEdit = !!existingForm;
    const [toastMessage, setToastMessage] = useState('');

    // Build initial form state
    const { data, setData, post, put, processing, errors } = useForm({
        form_type: existingForm?.form_type || 'PM-773E',
        form_number: existingForm?.form_number || suggestedFormNumber || '',
        project_id: existingForm?.project_id || 'MAM',
        unit_id: existingForm?.unit_id || preselectedUnit?.id || (units.length > 0 ? units[0].id : ''),
        date: existingForm?.date ? String(existingForm.date).substring(0, 10) : new Date().toISOString().substring(0, 10),
        shift: existingForm?.shift || 'DS',
        smu: existingForm?.smu ?? (preselectedUnit?.current_hm || ''),
        service_type: existingForm?.service_type || 'A',
        oil_samples: existingForm?.oil_samples || {
            engine: '',
            transmission: '',
            differential_final_drive: '',
            hydraulic: '',
        },
        items: existingForm?.items || defaultItems,
        results_data: existingForm?.results_data || {},
        notes: existingForm?.notes || '',
        mechanic_name: existingForm?.mechanic_name || '',
        supervisor_name: existingForm?.supervisor_name || '',
        status: existingForm?.status || 'COMPLETED',
    });

    const [selectedSection, setSelectedSection] = useState('ALL');

    // Selected unit details
    const selectedUnit = useMemo(() => {
        return units.find((u) => String(u.id) === String(data.unit_id)) || null;
    }, [units, data.unit_id]);

    const handleUnitChange = (e) => {
        const uid = e.target.value;
        const u = units.find((item) => String(item.id) === String(uid));
        setData((prev) => ({
            ...prev,
            unit_id: uid,
            smu: u?.current_hm ?? prev.smu,
        }));
    };

    // Update item field (check_point, remarks, sn_inspect)
    const updateItem = (index, field, value) => {
        setData((prev) => {
            const nextItems = [...prev.items];
            nextItems[index] = {
                ...nextItems[index],
                [field]: value,
            };
            return { ...prev, items: nextItems };
        });
    };

    // Quick Action: Mark all items applicable to current service type as 'OK'
    const markAllApplicableOk = () => {
        const currentType = data.service_type;
        setData((prev) => {
            const nextItems = prev.items.map((item) => {
                if (item.types && item.types.includes(currentType)) {
                    return {
                        ...item,
                        check_point: '✓',
                    };
                }
                return item;
            });
            return { ...prev, items: nextItems };
        });

        setToastMessage(`Semua item yang berlaku untuk Tipe PM ${currentType} telah ditandai OK (✓).`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Reset all check points
    const resetAllCheckPoints = () => {
        setData((prev) => {
            const nextItems = prev.items.map((item) => ({
                ...item,
                check_point: '',
            }));
            return { ...prev, items: nextItems };
        });
    };

    // Sections list
    const sections = useMemo(() => {
        const map = [];
        data.items.forEach((item) => {
            if (item.section && !map.includes(item.section)) {
                map.push(item.section);
            }
        });
        return map;
    }, [data.items]);

    // Filtered items by selected section
    const displayedItems = useMemo(() => {
        if (selectedSection === 'ALL') {
            return data.items.map((item, idx) => ({ ...item, originalIndex: idx }));
        }
        return data.items
            .map((item, idx) => ({ ...item, originalIndex: idx }))
            .filter((item) => item.section === selectedSection);
    }, [data.items, selectedSection]);

    const handleSubmit = (e, statusToSet = 'COMPLETED') => {
        if (e) e.preventDefault();

        if (!data.unit_id) {
            alert('Pilih unit alat berat terlebih dahulu.');
            return;
        }

        setData('status', statusToSet);

        if (isEdit) {
            put(`/form-plant/${existingForm.id}`);
        } else {
            post('/form-plant');
        }
    };

    // Render special input in remarks column if required
    const renderSpecialRemarks = (item, origIdx) => {
        const st = item.special_type;
        if (!st) return null;

        if (st === 'logged_event') {
            return (
                <div className="flex items-center gap-1.5 mt-1 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200 dark:border-amber-800/50">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 shrink-0">Logged event :</span>
                    <input
                        type="text"
                        value={item.special_value || ''}
                        onChange={(e) => updateItem(origIdx, 'special_value', e.target.value)}
                        placeholder="Catatan event..."
                        className="w-full text-xs px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                </div>
            );
        }

        if (st === 'result_rpm' || st === 'result_brake_rpm') {
            return (
                <div className="flex items-center gap-1.5 mt-1 bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded border border-blue-200 dark:border-blue-800/50">
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 shrink-0">Result :</span>
                    <input
                        type="text"
                        value={item.special_value || ''}
                        onChange={(e) => updateItem(origIdx, 'special_value', e.target.value)}
                        placeholder="Contoh: 1850"
                        className="w-24 text-xs px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">RPM</span>
                </div>
            );
        }

        if (st === 'result_steer_sec' || st === 'result_hoist_sec') {
            const specLabel = st === 'result_steer_sec' ? '(5-6 sec)' : '(15 sec)';
            return (
                <div className="flex items-center gap-1.5 mt-1 bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded border border-blue-200 dark:border-blue-800/50">
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 shrink-0">Result :</span>
                    <input
                        type="text"
                        value={item.special_value || ''}
                        onChange={(e) => updateItem(origIdx, 'special_value', e.target.value)}
                        placeholder="Contoh: 5.5"
                        className="w-20 text-xs px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">SEC {specLabel}</span>
                </div>
            );
        }

        if (st === 'rating_rr') {
            return (
                <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Rating Result :</span>
                        <input
                            type="text"
                            value={item.special_value || ''}
                            onChange={(e) => updateItem(origIdx, 'special_value', e.target.value)}
                            placeholder="RR"
                            className="w-24 text-xs px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">RR</span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        DIFFERENTIAL CAPACITIES 120 L
                    </div>
                </div>
            );
        }

        if (st === 'rating_frlh_rrrh' || st === 'rating_frlh') {
            const isRear = st === 'rating_frlh_rrrh';
            return (
                <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-200 dark:border-emerald-800/50 text-[10px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Rating Result:</span>
                        <div className="flex items-center gap-1">
                            <span>{isRear ? 'RRLH:' : 'FRLH:'}</span>
                            <input
                                type="text"
                                value={item.special_rating_lh || ''}
                                onChange={(e) => updateItem(origIdx, 'special_rating_lh', e.target.value)}
                                className="w-16 text-xs px-1 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span>{isRear ? 'RRRH:' : 'FRRH:'}</span>
                            <input
                                type="text"
                                value={item.special_rating_rh || ''}
                                onChange={(e) => updateItem(origIdx, 'special_rating_rh', e.target.value)}
                                className="w-16 text-xs px-1 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800"
                            />
                        </div>
                    </div>
                    {!isRear && (
                        <div className="text-[9px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            WHEEL FRONT CAPACITIES 6.8 L
                        </div>
                    )}
                </div>
            );
        }

        if (st === 'capacity_trans') {
            return (
                <div className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded mt-1 border border-indigo-200 dark:border-indigo-800/50">
                    TRANSMISSION & TC CAPACITIES 106 L
                </div>
            );
        }

        if (st === 'capacity_hydraulic') {
            return (
                <div className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded mt-1 border border-indigo-200 dark:border-indigo-800/50">
                    HYDRAULIC AND BRAKE CAPACITIES 121 L
                </div>
            );
        }

        if (st.startsWith('rating_') || st.startsWith('result_')) {
            return (
                <div className="flex items-center gap-1.5 mt-1 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Rating / Result :</span>
                    <input
                        type="text"
                        value={item.special_value || ''}
                        onChange={(e) => updateItem(origIdx, 'special_value', e.target.value)}
                        placeholder="Rating / Hasil..."
                        className="w-full text-xs px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Form PM ${data.form_number}` : 'Input Form OHT 773 - PM Service Sheet 773E'} />

            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 transition-colors">
                {/* Header Navbar */}
                <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-30 shadow-sm backdrop-blur-md">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-0.5">
                                <Link href="/form-plant" className="hover:text-emerald-600">Form OHT 773</Link>
                                <span>/</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {isEdit ? 'Edit Form' : 'Input Baru'}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>📋</span>
                                <span>{isEdit ? `Edit Form: ${data.form_number}` : 'PM SERVICE SHEET OFF HIGHWAY TRUCK 773E'}</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/form-plant"
                                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Batal
                            </Link>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'DRAFT')}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-colors"
                            >
                                Simpan Draft
                            </button>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'COMPLETED')}
                                disabled={processing}
                                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Selesai (✓)'}
                            </button>
                        </div>
                    </div>
                </div>

                {toastMessage && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
                        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <span>✓</span>
                                <span>{toastMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setToastMessage('')}
                                className="text-emerald-100 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
                    {/* SECTION 1: HEADER METADATA (MAM Document Style) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700 gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo MAM"
                                    className="h-10 w-auto object-contain"
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                                <div>
                                    <div className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
                                        PM SERVICE SHEET
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 dark:text-slate-400">
                                        OFF HIGHWAY TRUCK 773E
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400">NO. FORM :</label>
                                <input
                                    type="text"
                                    value={data.form_number}
                                    onChange={(e) => setData('form_number', e.target.value)}
                                    className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white w-48"
                                />
                            </div>
                        </div>

                        {/* Primary Grid Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    PROJECT ID
                                </label>
                                <input
                                    type="text"
                                    value={data.project_id}
                                    onChange={(e) => setData('project_id', e.target.value)}
                                    placeholder="Contoh: MAM / PROJECT 5M"
                                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    UNIT ID <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.unit_id}
                                    onChange={handleUnitChange}
                                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.code_unit} - {u.model || '773E'}
                                        </option>
                                    ))}
                                </select>
                                {selectedUnit && (
                                    <div className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">
                                        Model: {selectedUnit.model || '-'} | S/N: {selectedUnit.serial_number || '-'}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    DATE <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    SHIFT <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('shift', 'DS')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                            data.shift === 'DS'
                                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                                : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        ☀️ DS (Siang)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('shift', 'NS')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                            data.shift === 'NS'
                                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                                : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        🌙 NS (Malam)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* S.M.U Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    S.M.U (SERVICE METER UNIT)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.smu}
                                        onChange={(e) => setData('smu', e.target.value)}
                                        placeholder="Contoh: 14250.5"
                                        className="w-full text-sm font-mono font-bold px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">HRS</span>
                                </div>
                            </div>

                            {/* SELECTOR TIPE PM SERVICE */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    TIPE PM SERVICE / PM SERVICES TYPES <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {[
                                        { key: 'A', label: 'A', sub: '250', full: 'PM 250 / PS 1' },
                                        { key: 'B', label: 'B', sub: '500', full: 'PM 500 / PS 2' },
                                        { key: 'C', label: 'C', sub: '1000', full: 'PM 1000 / PS 3' },
                                        { key: 'D', label: 'D', sub: '2000', full: 'PM 2000 / PS 4' },
                                        { key: 'E', label: 'E', sub: '4000', full: 'PM 4000 / PS 5' },
                                    ].map((t) => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => setData('service_type', t.key)}
                                            title={t.full}
                                            className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                                                data.service_type === t.key
                                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.03]'
                                                    : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="text-sm font-black leading-none">{t.label}</span>
                                            <span className="text-[9px] mt-0.5 opacity-80">{t.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Oil Samples & Caution Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                            {/* Box 1: Oil Samples Taken */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2.5">
                                <div className="text-xs font-bold text-gray-800 dark:text-slate-200">
                                    Pengambilan Sampel Oli Terakhir / <span className="italic text-gray-500">Last Oil Sample Taken</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 dark:text-slate-400">Engine :</label>
                                        <input
                                            type="text"
                                            value={data.oil_samples.engine || ''}
                                            onChange={(e) =>
                                                setData('oil_samples', { ...data.oil_samples, engine: e.target.value })
                                            }
                                            placeholder="Tgl / SMU..."
                                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 dark:text-slate-400">Transmission :</label>
                                        <input
                                            type="text"
                                            value={data.oil_samples.transmission || ''}
                                            onChange={(e) =>
                                                setData('oil_samples', { ...data.oil_samples, transmission: e.target.value })
                                            }
                                            placeholder="Tgl / SMU..."
                                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 dark:text-slate-400">Diff & Final Drive :</label>
                                        <input
                                            type="text"
                                            value={data.oil_samples.differential_final_drive || ''}
                                            onChange={(e) =>
                                                setData('oil_samples', { ...data.oil_samples, differential_final_drive: e.target.value })
                                            }
                                            placeholder="Tgl / SMU..."
                                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 dark:text-slate-400">Hydraulic :</label>
                                        <input
                                            type="text"
                                            value={data.oil_samples.hydraulic || ''}
                                            onChange={(e) =>
                                                setData('oil_samples', { ...data.oil_samples, hydraulic: e.target.value })
                                            }
                                            placeholder="Tgl / SMU..."
                                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Perhatian / Caution */}
                            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-xs">
                                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                                    Perhatian / <span className="italic">Caution</span>
                                </div>
                                <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
                                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                                    <div>
                                        <div className="font-semibold">Cuci unit yang bersih sebelum pelaksanaan inspeksi</div>
                                        <div className="text-[10px] italic opacity-80">Clean up the unit before inspection</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
                                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                                    <div>
                                        <div className="font-semibold">Parkirkan unit pada tempat rata dengan aman</div>
                                        <div className="text-[10px] italic opacity-80">Park the unit on flat area safely</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
                                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                                    <div>
                                        <div className="font-semibold">Yakinkan anda sudah memasang Danger atau Service Tag pada unit</div>
                                        <div className="text-[10px] italic opacity-80">Make sure you already use Danger or Service Tag on the unit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CHECKLIST ITEMS */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
                        {/* Action bar on top of checklist */}
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSection('ALL')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                                        selectedSection === 'ALL'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                                    }`}
                                >
                                    Semua ({data.items.length})
                                </button>
                                {sections.map((sec) => (
                                    <button
                                        key={sec}
                                        type="button"
                                        onClick={() => setSelectedSection(sec)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                                            selectedSection === sec
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {sec}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={markAllApplicableOk}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                                >
                                    ✓ Tandai Semua OK Tipe {data.service_type}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetAllCheckPoints}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Checklist Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                                        <th className="py-2.5 px-2 w-28 text-center">Tipe Servis (A-E)</th>
                                        <th className="py-2.5 px-4 min-w-[320px]">Deskripsi Pemeriksaan</th>
                                        <th className="py-2.5 px-3 w-36 text-center">Check Point</th>
                                        <th className="py-2.5 px-4 min-w-[260px]">Remarks / Catatan</th>
                                        <th className="py-2.5 px-3 w-28 text-center">SN Inspect</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                                    {displayedItems.map((item) => {
                                        const origIdx = item.originalIndex;
                                        const isApplicable = item.types && item.types.includes(data.service_type);

                                        return (
                                            <tr
                                                key={item.id || origIdx}
                                                className={`transition-colors ${
                                                    isApplicable
                                                        ? 'bg-white dark:bg-slate-800 hover:bg-emerald-50/40 dark:hover:bg-slate-750'
                                                        : 'bg-gray-50/60 dark:bg-slate-900/30 opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                {/* No */}
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-500 dark:text-slate-400">
                                                    {item.id}
                                                </td>

                                                {/* Types indicator dots (A, B, C, D, E) */}
                                                <td className="py-2.5 px-2 text-center">
                                                    <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                                                        {['A', 'B', 'C', 'D', 'E'].map((t) => {
                                                            const hasType = item.types && item.types.includes(t);
                                                            const isSelected = data.service_type === t;

                                                            return (
                                                                <span
                                                                    key={t}
                                                                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full font-bold ${
                                                                        hasType
                                                                            ? isSelected
                                                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 font-black scale-110'
                                                                                : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                                                                            : 'text-gray-300 dark:text-slate-700 bg-transparent'
                                                                    }`}
                                                                >
                                                                    {hasType ? '✓' : ''}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Item Description */}
                                                <td className="py-2.5 px-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white leading-snug">
                                                        {item.desc_id}
                                                    </div>
                                                    <div className="text-[11px] italic text-gray-500 dark:text-slate-400 mt-0.5">
                                                        {item.desc_en}
                                                    </div>
                                                    {item.section && (
                                                        <span className="inline-block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                                                            🏷️ {item.section}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Check Point buttons */}
                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(origIdx, 'check_point', '✓')}
                                                            title="OK"
                                                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                                                                item.check_point === '✓'
                                                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(origIdx, 'check_point', 'X')}
                                                            title="Action Required"
                                                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                                                                item.check_point === 'X'
                                                                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-rose-100'
                                                            }`}
                                                        >
                                                            X
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(origIdx, 'check_point', '-')}
                                                            title="Not Applicable"
                                                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                                                                item.check_point === '-'
                                                                    ? 'bg-gray-600 text-white shadow-sm'
                                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Remarks column & inline special measurements */}
                                                <td className="py-2.5 px-4">
                                                    <input
                                                        type="text"
                                                        value={item.remarks || ''}
                                                        onChange={(e) => updateItem(origIdx, 'remarks', e.target.value)}
                                                        placeholder="Catatan hasil inspeksi..."
                                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                                    />
                                                    {renderSpecialRemarks(item, origIdx)}
                                                </td>

                                                {/* SN Inspect */}
                                                <td className="py-2.5 px-3 text-center">
                                                    <input
                                                        type="text"
                                                        value={item.sn_inspect || ''}
                                                        onChange={(e) => updateItem(origIdx, 'sn_inspect', e.target.value)}
                                                        placeholder="SN..."
                                                        className="w-full text-xs text-center px-1.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 3: NOTES & SIGN-OFF */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                NOTE / CATATAN KHUSUS & TEMUAN BACKLOG
                            </label>
                            <textarea
                                rows={4}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Tuliskan catatan tambahan, temuan kerusakan tidak terjadwal, atau rekomendasi perbaikan di sini..."
                                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    INSPECTED BY (MECHANIC / SERVICEMAN)
                                </label>
                                <input
                                    type="text"
                                    value={data.mechanic_name}
                                    onChange={(e) => setData('mechanic_name', e.target.value)}
                                    placeholder="Nama Mekanik / Serviceman..."
                                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
                                />
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                    Penanggung jawab inspeksi lapangan
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    ACKNOWLEDGED BY (MAINTENANCE SUPERVISOR)
                                </label>
                                <input
                                    type="text"
                                    value={data.supervisor_name}
                                    onChange={(e) => setData('supervisor_name', e.target.value)}
                                    placeholder="Nama Supervisor Maintenance..."
                                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
                                />
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                    Pemeriksa dan pengesah lembar servis
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <Link
                                href="/form-plant"
                                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Kembali ke Daftar
                            </Link>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'DRAFT')}
                                disabled={processing}
                                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-colors"
                            >
                                Simpan Draft
                            </button>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'COMPLETED')}
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Selesai (✓)'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
