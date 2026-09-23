import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/PM-DT/001',
    selectedForm = null,
    recentForms = [],
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || '');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [shift, setShift] = useState(selectedForm?.shift || 'DS');
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [serviceType, setServiceType] = useState(selectedForm?.service_type || 'A');

    // Oil Sampling Dates
    const [oilSamples, setOilSamples] = useState(selectedForm?.oil_samples || {
        engine: '',
        transmission: '',
        differential: '',
        hydraulic: '',
    });

    // Checklist Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.map(item => ({
            ...item,
            checked: false,
            status: '', // 'OK', 'REPAIR', 'ADJUST', 'NA'
            remarks: item.remarks || '',
            inspector: '',
            results: {},
        }));
    });

    // Notes & Signatures
    const [notes, setNotes] = useState(selectedForm?.notes || '');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [supervisorName, setSupervisorName] = useState(selectedForm?.supervisor_name || '');

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [filterOnlyActiveType, setFilterOnlyActiveType] = useState(false);
    const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-fill unit details on select
    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            if (found.current_hm) setSmu(found.current_hm);
            if (!projectId && found.lokasi) setProjectId(found.lokasi);
        }
    };

    const selectedUnitObj = units.find(u => String(u.id) === String(unitId));

    // Handle check point toggle
    const handleCheckPoint = (index, statusValue) => {
        setItemsState(prev => {
            const copy = [...prev];
            const current = copy[index];
            if (current.status === statusValue) {
                // toggle off
                copy[index] = { ...current, status: '', checked: false };
            } else {
                copy[index] = { ...current, status: statusValue, checked: true };
            }
            return copy;
        });
    };

    // Handle custom remark text
    const handleRemarkChange = (index, value) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], remarks: value };
            return copy;
        });
    };

    // Handle specific result subfields (e.g. rpm, sec, rr, rrlh, rrrh, frlh, frrh, rating_result)
    const handleResultFieldChange = (index, field, value) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                results: {
                    ...(copy[index].results || {}),
                    [field]: value,
                },
            };
            return copy;
        });
    };

    // Handle inspector name/badge
    const handleInspectorChange = (index, value) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], inspector: value };
            return copy;
        });
    };

    // Quick set all visible items to OK
    const handleCheckAllVisibleOk = () => {
        setItemsState(prev => {
            return prev.map(item => {
                const isApplicable = item.types && item.types.includes(serviceType);
                if (!filterOnlyActiveType || isApplicable) {
                    return { ...item, status: 'OK', checked: true };
                }
                return item;
            });
        });
        setNotification(`Semua item yang berlaku untuk Tipe PM ${serviceType} telah ditandai OK.`);
        setTimeout(() => setNotification(null), 3500);
    };

    // Reset all check points
    const handleResetAllCheckPoints = () => {
        if (window.confirm('Reset semua centang checklist ke kosong?')) {
            setItemsState(prev => prev.map(item => ({ ...item, status: '', checked: false })));
        }
    };

    // Save Form
    const handleSave = (e) => {
        if (e) e.preventDefault();
        if (!unitId) {
            alert('Mohon pilih Unit ID terlebih dahulu.');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'PM-DUMP-TRUCK',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date: date,
            shift: shift,
            smu: smu ? parseFloat(smu) : null,
            service_type: serviceType,
            oil_samples: oilSamples,
            items: itemsState,
            notes: notes,
            mechanic_name: mechanicName,
            supervisor_name: supervisorName,
            status: 'COMPLETED',
        };

        if (selectedForm?.id) {
            router.put(`/form-service-dump-truck/${selectedForm.id}`, payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form PM Dump Truck berhasil diperbarui!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        } else {
            router.post('/form-service-dump-truck', payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form PM Dump Truck berhasil disimpan!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        }
    };

    // Reset to blank sheet
    const handleReset = () => {
        if (window.confirm('Bersihkan formulir dan mulai lembar baru?')) {
            router.get('/form-service-dump-truck');
        }
    };

    // Download PDF (DomPDF 3-page matching format)
    const handleDownloadPdf = () => {
        const params = new URLSearchParams();
        if (selectedForm?.id) params.append('id', selectedForm.id);
        if (unitId) params.append('unit_id', unitId);
        if (formNumber) params.append('form_number', formNumber);
        if (projectId) params.append('project_id', projectId);
        if (date) params.append('date', date);
        if (shift) params.append('shift', shift);
        if (smu) params.append('smu', smu);
        if (serviceType) params.append('service_type', serviceType);
        if (oilSamples.engine) params.append('oil_engine', oilSamples.engine);
        if (oilSamples.transmission) params.append('oil_transmission', oilSamples.transmission);
        if (oilSamples.differential) params.append('oil_differential', oilSamples.differential);
        if (oilSamples.hydraulic) params.append('oil_hydraulic', oilSamples.hydraulic);
        if (notes) params.append('notes', notes);
        if (mechanicName) params.append('mechanic_name', mechanicName);
        if (supervisorName) params.append('supervisor_name', supervisorName);
        window.open(`/form-service-dump-truck/download-pdf?${params.toString()}`, '_blank');
    };

    // Sections list
    const sections = [
        { key: 'ENGINE', label: '1. ENGINE' },
        { key: 'TRANSMISSION, DIFFERENTIAL & WHEEL', label: '2. TRANSMISSION, DIFFERENTIAL & WHEEL' },
        { key: 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM', label: '3. HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM' },
        { key: 'LUBRICATION (GREASING)', label: '4. LUBRICATION (GREASING)' },
        { key: 'MISCELLANEOUS', label: '5. MISCELLANEOUS' },
    ];

    // Filter items based on active interval and section
    const isItemVisible = (item) => {
        if (activeSectionFilter !== 'ALL' && item.section !== activeSectionFilter) {
            return false;
        }
        if (filterOnlyActiveType && item.types && !item.types.includes(serviceType)) {
            return false;
        }
        return true;
    };

    // Calculate progress stats
    const totalApplicableItems = itemsState.filter(i => i.types && i.types.includes(serviceType)).length;
    const checkedApplicableItems = itemsState.filter(i => i.types && i.types.includes(serviceType) && i.status).length;
    const completionPercent = totalApplicableItems > 0 ? Math.round((checkedApplicableItems / totalApplicableItems) * 100) : 0;

    return (
        <AuthenticatedLayout fullWidth={true}>
            <Head title="Form Service Dump Truck - PM Service Sheet" />

            {/* Toast Notification Banner */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in print:hidden">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold text-sm">{notification}</span>
                </div>
            )}

            <div className="w-full px-2 sm:px-4 lg:px-6 py-3 space-y-4 print:p-0 print:m-0 print:max-w-full">
                {/* ── Top Action Bar ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl py-3 px-4 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/20">
                            🚚
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Form Service Dump Truck
                                </h1>
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    PM Sheet
                                </span>
                                {selectedForm && (
                                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                        ID #{selectedForm.id}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                Digitalisasi Lembar Pemeriksaan Berkala Dump Truck (A / B / C / D / E)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Riwayat Form ({recentForms.length})
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm"
                            title="Mulai lembar pemeriksaan baru"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Form Baru
                        </button>

                        <a
                            href={selectedForm?.id ? `/form-service-dump-truck/${selectedForm.id}/print` : `/form-service-dump-truck/blank-print?unit_id=${unitId || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Cetak Browser
                        </a>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Unduh PDF (3 Hal)
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            {isSaving ? 'Menyimpan...' : selectedForm ? 'Update Form' : 'Simpan Form'}
                        </button>
                    </div>
                </div>

                {/* ── Filter & Quick Control Bar ── */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    {/* PM Service Type Selection Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mr-1">
                            Pilih Tipe PM:
                        </span>
                        {[
                            { key: 'A', title: 'A : PM 250 / PS 1', desc: 'PM 250' },
                            { key: 'B', title: 'B : PM 500 / PS 2', desc: 'PM 500' },
                            { key: 'C', title: 'C : PM 1000 / PS 3', desc: 'PM 1000' },
                            { key: 'D', title: 'D : PM 2000 / PS 4', desc: 'PM 2000' },
                            { key: 'E', title: 'E : PM 4000 / PS 5', desc: 'PM 4000' },
                        ].map((t) => {
                            const isSelected = serviceType === t.key;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setServiceType(t.key)}
                                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                                        {t.key}
                                    </span>
                                    <span>{t.desc}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={filterOnlyActiveType}
                                onChange={(e) => setFilterOnlyActiveType(e.target.checked)}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300 dark:border-slate-600"
                            />
                            <span>Hanya tampilkan item untuk tipe {serviceType}</span>
                        </label>

                        <button
                            type="button"
                            onClick={handleCheckAllVisibleOk}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                        >
                            ✓ Centang Semua Tipe {serviceType} Jadi OK
                        </button>

                        <button
                            type="button"
                            onClick={handleResetAllCheckPoints}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 rounded-lg transition-colors"
                        >
                            Reset Poin
                        </button>
                    </div>
                </div>

                {/* ── Progress Bar ── */}
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-700 dark:text-slate-200">Progress Checklist Tipe {serviceType}:</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">
                            {checkedApplicableItems} / {totalApplicableItems} ({completionPercent}%)
                        </span>
                    </div>
                    <div className="flex-1 max-w-md h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                </div>

                {/* ── Section Filter Pills ── */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
                    <button
                        type="button"
                        onClick={() => setActiveSectionFilter('ALL')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                            activeSectionFilter === 'ALL'
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 border border-gray-200 dark:border-slate-700'
                        }`}
                    >
                        Semua Bagian (77 Item)
                    </button>
                    {sections.map(s => {
                        const isCurrent = activeSectionFilter === s.key;
                        const count = itemsState.filter(i => i.section === s.key).length;
                        return (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => setActiveSectionFilter(s.key)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                    isCurrent
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 border border-gray-200 dark:border-slate-700'
                                }`}
                            >
                                {s.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* ── PM SERVICE SHEET DUMP TRUCK CONTAINER ── */}
                <div className="bg-white dark:bg-slate-900 border-2 border-gray-900 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-none shadow-xl print:shadow-none print:border-black print:text-black print:bg-white text-xs">
                    {/* Header: Title & Document Brand */}
                    <div className="border-b-2 border-gray-900 dark:border-slate-700 print:border-black py-2.5 px-3 print:py-1.5 print:px-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="font-black text-2xl tracking-tighter text-rose-600 print:text-black">
                                MAM
                            </div>
                            <div>
                                <h2 className="text-base sm:text-xl font-black uppercase tracking-wider leading-tight">
                                    PM SERVICE SHEET
                                </h2>
                                <p className="text-xs sm:text-sm font-black text-gray-800 dark:text-slate-200 print:text-black leading-tight">
                                    DUMP TRUCK
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-mono text-[10px] font-bold text-gray-500 dark:text-slate-400 print:text-black">
                                No. Dokumen:
                            </div>
                            <input
                                type="text"
                                value={formNumber}
                                onChange={(e) => setFormNumber(e.target.value)}
                                className="font-mono font-black text-xs px-2 py-0.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 text-right rounded print:border-none print:bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Meta Fields & Box Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 border-b-2 border-gray-900 dark:border-slate-700 print:border-black divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-900 dark:divide-slate-700 print:divide-black">
                        {/* Left Col: Project, Unit, Date, SMU, Shift */}
                        <div className="md:col-span-5 p-2 space-y-1.5 print:p-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="w-24 font-bold uppercase text-[10px] shrink-0">PROJECT ID</label>
                                <span className="font-bold">:</span>
                                <input
                                    type="text"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    placeholder="Contoh: PT-MAM / SITE A"
                                    className="flex-1 font-bold text-xs px-2 py-1 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded uppercase print:border-none print:p-0"
                                />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-24 font-bold uppercase text-[10px] shrink-0">UNIT ID</label>
                                <span className="font-bold">:</span>
                                <div className="flex-1 flex gap-1">
                                    <select
                                        value={unitId}
                                        onChange={handleUnitChange}
                                        className="flex-1 font-bold text-xs px-2 py-1 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:hidden"
                                    >
                                        <option value="">-- Pilih Unit Dump Truck --</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.code_unit} {u.model ? `(${u.model})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="hidden print:inline font-bold">
                                        {selectedUnitObj ? `${selectedUnitObj.code_unit} (${selectedUnitObj.model || ''})` : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-24 font-bold uppercase text-[10px] shrink-0">DATE</label>
                                <span className="font-bold">:</span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="flex-1 font-bold text-xs px-2 py-1 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:p-0"
                                />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-24 font-bold uppercase text-[10px] shrink-0">S.M.U</label>
                                <span className="font-bold">:</span>
                                <div className="flex-1 flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        value={smu}
                                        onChange={(e) => setSmu(e.target.value)}
                                        placeholder="0"
                                        className="w-28 font-mono font-bold text-xs px-2 py-1 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:p-0"
                                    />
                                    <span className="font-black text-[11px]">HRS</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-24 font-bold uppercase text-[10px] shrink-0">SHIFT</label>
                                <span className="font-bold">:</span>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shift"
                                            value="DS"
                                            checked={shift === 'DS'}
                                            onChange={() => setShift('DS')}
                                            className="w-3.5 h-3.5 text-emerald-600"
                                        />
                                        <span className="font-bold text-[11px]">DS (Siang)</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shift"
                                            value="NS"
                                            checked={shift === 'NS'}
                                            onChange={() => setShift('NS')}
                                            className="w-3.5 h-3.5 text-emerald-600"
                                        />
                                        <span className="font-bold text-[11px]">NS (Malam)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Center Col: Oil Sampling */}
                        <div className="md:col-span-4 p-2 space-y-1 print:p-1.5">
                            <div className="font-bold text-[10px] uppercase border-b border-gray-300 dark:border-slate-700 pb-0.5 leading-tight text-gray-800 dark:text-slate-200">
                                Pengambilan Sampel Oli Terakhir / Last Oil Sample Taken
                            </div>
                            <div className="space-y-1 text-[10px]">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-medium">Engine</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.engine || ''}
                                        onChange={(e) => setOilSamples({ ...oilSamples, engine: e.target.value })}
                                        className="w-28 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-medium">Transmission</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.transmission || ''}
                                        onChange={(e) => setOilSamples({ ...oilSamples, transmission: e.target.value })}
                                        className="w-28 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-medium">Differential & Final Drive</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.differential || ''}
                                        onChange={(e) => setOilSamples({ ...oilSamples, differential: e.target.value })}
                                        className="w-28 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-medium">Hydraulic</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.hydraulic || ''}
                                        onChange={(e) => setOilSamples({ ...oilSamples, hydraulic: e.target.value })}
                                        className="w-28 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Caution / Perhatian */}
                        <div className="md:col-span-3 p-2 bg-amber-50/50 dark:bg-amber-950/20 print:bg-transparent print:p-1.5">
                            <div className="font-black text-[10px] text-amber-800 dark:text-amber-400 border-b border-amber-200 dark:border-amber-900 pb-0.5 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>Perhatian / Coution</span>
                            </div>
                            <ul className="mt-1 space-y-1 text-[9.5px] leading-tight text-gray-700 dark:text-slate-300 print:text-black">
                                <li className="flex items-start gap-1">
                                    <span className="font-bold text-emerald-600">✓</span>
                                    <div>
                                        <strong>Cuci unit yang bersih</strong> sebelum pelaksanaan inspeksi
                                        <div className="text-[8.5px] text-gray-500 dark:text-slate-400 italic">Clean up the unit before inspection</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-1">
                                    <span className="font-bold text-emerald-600">✓</span>
                                    <div>
                                        <strong>Parkirkan unit pada tempat rata</strong> dengan aman
                                        <div className="text-[8.5px] text-gray-500 dark:text-slate-400 italic">Park the unit on flat area safely</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-1">
                                    <span className="font-bold text-emerald-600">✓</span>
                                    <div>
                                        <strong>Pasang Danger atau Service Tag</strong> pada unit
                                        <div className="text-[8.5px] text-gray-500 dark:text-slate-400 italic">Make sure you already use Danger or Service Tag</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* PM Service Types Ribbon */}
                    <div className="border-b-2 border-gray-900 dark:border-slate-700 print:border-black p-2 bg-gray-50 dark:bg-slate-800/60 print:bg-transparent flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="font-bold uppercase tracking-wider text-[11px] text-gray-700 dark:text-slate-300">
                            Tipe PM Service / PM Services Types :
                        </div>
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                            {[
                                { k: 'A', label: 'A : PM 250 / PS 1' },
                                { k: 'B', label: 'B : PM 500 / PS 2' },
                                { k: 'C', label: 'C : PM 1000 / PS 3' },
                                { k: 'D', label: 'D : PM 2000 / PS 4' },
                                { k: 'E', label: 'E : PM 4000 / PS 5' },
                            ].map(({ k, label }) => {
                                const isActive = serviceType === k;
                                return (
                                    <label
                                        key={k}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-all ${
                                            isActive
                                                ? 'bg-amber-500 text-white font-black shadow-sm'
                                                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="service_type"
                                            value={k}
                                            checked={isActive}
                                            onChange={() => setServiceType(k)}
                                            className="w-3.5 h-3.5 text-amber-600"
                                        />
                                        <span>{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Checklist Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-slate-800 border-b-2 border-gray-900 dark:border-slate-700 print:border-black text-[10px] uppercase font-bold">
                                    <th colSpan="5" className="py-1 px-1 border-r border-gray-300 dark:border-slate-700 print:border-black text-center w-20">
                                        <div>Tipe Servis</div>
                                        <div className="text-[8px] font-normal italic lowercase">Service Type</div>
                                    </th>
                                    <th className="py-1 px-3 border-r border-gray-300 dark:border-slate-700 print:border-black">
                                        Deskripsi Pekerjaan / Task Description
                                    </th>
                                    <th className="py-1 px-2 border-r border-gray-300 dark:border-slate-700 print:border-black text-center w-36">
                                        Check Point
                                    </th>
                                    <th className="py-1 px-2 border-r border-gray-300 dark:border-slate-700 print:border-black w-60">
                                        Remarks
                                    </th>
                                    <th className="py-1 px-2 text-center w-24">
                                        SN Inspector
                                    </th>
                                </tr>
                                <tr className="bg-gray-200 dark:bg-slate-700/70 border-b border-gray-400 dark:border-slate-600 text-[10px] font-bold text-center">
                                    {['A', 'B', 'C', 'D', 'E'].map(t => (
                                        <th
                                            key={t}
                                            className={`py-0.5 border-r border-gray-300 dark:border-slate-600 last:border-r-2 last:border-gray-900 ${
                                                serviceType === t ? 'bg-amber-300 dark:bg-amber-800/80 font-black' : ''
                                            }`}
                                        >
                                            {t}
                                        </th>
                                    ))}
                                    <th colSpan="4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((sec) => {
                                    const sectionItems = itemsState.filter(item => item.section === sec.key);
                                    if (sectionItems.length === 0) return null;

                                    const visibleSectionItems = sectionItems.filter(isItemVisible);
                                    if (visibleSectionItems.length === 0) return null;

                                    return (
                                        <React.Fragment key={sec.key}>
                                            {/* Section Header */}
                                            <tr className="bg-gray-200 dark:bg-slate-700 border-y-2 border-gray-900 dark:border-slate-600 print:border-black">
                                                <td colSpan="9" className="py-1 px-3 font-black text-xs uppercase tracking-wide text-gray-900 dark:text-white print:text-black">
                                                    {sec.label}
                                                </td>
                                            </tr>

                                            {/* Section Item Rows */}
                                            {visibleSectionItems.map((item) => {
                                                const globalIndex = itemsState.findIndex(i => i.id === item.id);
                                                const isApplicableForCurrentType = item.types && item.types.includes(serviceType);

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className={`border-b border-gray-200 dark:border-slate-800 print:border-gray-400 transition-colors ${
                                                            isApplicableForCurrentType
                                                                ? 'hover:bg-amber-50/40 dark:hover:bg-amber-950/20'
                                                                : 'opacity-60 bg-gray-50/40 dark:bg-slate-900/40'
                                                        }`}
                                                    >
                                                        {/* A, B, C, D, E Interval Columns */}
                                                        {['A', 'B', 'C', 'D', 'E'].map(t => {
                                                            const hasInterval = item.types && item.types.includes(t);
                                                            const isSelectedInterval = serviceType === t;

                                                            return (
                                                                <td
                                                                    key={t}
                                                                    className={`py-1 border-r border-gray-200 dark:border-slate-800 print:border-black text-center align-middle w-4 ${
                                                                        isSelectedInterval ? 'bg-amber-100/50 dark:bg-amber-950/20 font-black' : ''
                                                                    }`}
                                                                >
                                                                    {hasInterval ? (
                                                                        <span
                                                                            className={`inline-block font-black text-xs ${
                                                                                isSelectedInterval
                                                                                    ? 'text-amber-700 dark:text-amber-400 scale-125'
                                                                                    : 'text-gray-900 dark:text-gray-200 print:text-black'
                                                                            }`}
                                                                            style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}
                                                                        >
                                                                            ✓
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-transparent select-none">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Task Description (Bilingual) */}
                                                        <td className="py-1.5 px-3 border-r border-gray-200 dark:border-slate-800 print:border-black align-middle">
                                                            <div className="font-semibold text-xs leading-snug text-gray-900 dark:text-white print:text-black">
                                                                {item.desc_id}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 dark:text-slate-400 italic leading-none print:text-gray-700 mt-0.5">
                                                                {item.desc_en}
                                                            </div>
                                                        </td>

                                                        {/* Check Point Buttons (OK / Adj / Rep / NA) */}
                                                        <td className="py-1 px-2 border-r border-gray-200 dark:border-slate-800 print:border-black align-middle text-center">
                                                            <div className="flex items-center justify-center gap-1 print:hidden">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCheckPoint(globalIndex, 'OK')}
                                                                    title="OK / Normal"
                                                                    className={`px-2.5 py-0.5 rounded text-xs font-black border transition-all ${
                                                                        item.status === 'OK'
                                                                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-1 ring-emerald-500'
                                                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-emerald-50'
                                                                    }`}
                                                                >
                                                                    ✓
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCheckPoint(globalIndex, 'ADJUST')}
                                                                    title="Adjusted / Disetel"
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                                                        item.status === 'ADJUST'
                                                                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-1 ring-amber-400'
                                                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-amber-50'
                                                                    }`}
                                                                >
                                                                    Adj
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCheckPoint(globalIndex, 'REPAIR')}
                                                                    title="Repaired / Ganti"
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                                                        item.status === 'REPAIR'
                                                                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-1 ring-rose-500'
                                                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-rose-50'
                                                                    }`}
                                                                >
                                                                    Rep
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCheckPoint(globalIndex, 'NA')}
                                                                    title="Not Applicable / Tidak Ada"
                                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                                                        item.status === 'NA'
                                                                            ? 'bg-gray-600 text-white border-gray-700 shadow-sm'
                                                                            : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-300 dark:border-slate-600 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    N/A
                                                                </button>
                                                            </div>

                                                            {/* Printable checkpoint view */}
                                                            <div className="hidden print:block font-bold text-center text-xs" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                                                {item.status === 'OK' ? '[✓] OK' : item.status || '[  ]'}
                                                            </div>
                                                        </td>

                                                        {/* Remarks & Dynamic Measurement Fields */}
                                                        <td className="py-1 px-2 border-r border-gray-200 dark:border-slate-800 print:border-black align-middle">
                                                            {/* Item 1: Torque Converter Stall RPM */}
                                                            {item.id === 1 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Result :</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.results?.rpm || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rpm', e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-20 font-mono font-bold text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">RPM</span>
                                                                </div>
                                                            )}

                                                            {/* Item 5: Engine Capacity */}
                                                            {item.id === 5 && (
                                                                <div className="font-black text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    ENGINE CAPACITIES 76 L
                                                                </div>
                                                            )}

                                                            {/* Item 24: Debris Rating */}
                                                            {item.id === 24 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Rating Result :</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rating_result || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rating_result', e.target.value)}
                                                                        className="w-28 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 26: Differentials Magnetic Plug RR */}
                                                            {item.id === 26 && (
                                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                                    <span className="font-bold shrink-0">Rating Result :</span>
                                                                    <span className="font-mono font-bold">RR</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rr || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rr', e.target.value)}
                                                                        className="w-16 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 27: Differential Capacity */}
                                                            {item.id === 27 && (
                                                                <div className="font-black text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    DIFFERENTIAL CAPACITIES 120 L
                                                                </div>
                                                            )}

                                                            {/* Item 29: Final Drives Magnetic Plug RRLH & RRRH */}
                                                            {item.id === 29 && (
                                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                                    <span className="font-bold shrink-0">Rating Result :</span>
                                                                    <span className="font-mono">RRLH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rrlh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rrlh', e.target.value)}
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-mono">RRRH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rrrh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rrrh', e.target.value)}
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 32: Final Drives Oil Level FRLH & FRRH */}
                                                            {item.id === 32 && (
                                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                                    <span className="font-bold shrink-0">Rating Result :</span>
                                                                    <span className="font-mono">FRLH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.frlh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'frlh', e.target.value)}
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-mono">FRRH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.frrh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'frrh', e.target.value)}
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 36: Transmission screen rating */}
                                                            {item.id === 36 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Rating Result :</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rating_result || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rating_result', e.target.value)}
                                                                        className="w-28 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 38: Transmission & TC Capacity */}
                                                            {item.id === 38 && (
                                                                <div className="font-black text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    Transmission &amp; TC 106 L
                                                                </div>
                                                            )}

                                                            {/* Item 41: Debris Trans & TC */}
                                                            {item.id === 41 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Rating Result :</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rating_result || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rating_result', e.target.value)}
                                                                        className="w-28 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 42: Brake system engagement RPM */}
                                                            {item.id === 42 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Result :</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.results?.rpm || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rpm', e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-20 font-mono font-bold text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">RPM</span>
                                                                </div>
                                                            )}

                                                            {/* Item 43: Steering cycle time SEC */}
                                                            {item.id === 43 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Result :</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={item.results?.sec || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'sec', e.target.value)}
                                                                        placeholder="5-6"
                                                                        className="w-16 font-mono font-bold text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">SEC</span>
                                                                </div>
                                                            )}

                                                            {/* Item 45: Hoist cycle time SEC */}
                                                            {item.id === 45 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Result :</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={item.results?.sec || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'sec', e.target.value)}
                                                                        placeholder="15"
                                                                        className="w-16 font-mono font-bold text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">SEC</span>
                                                                </div>
                                                            )}

                                                            {/* Item 47: Screen hydraulic/hoist rating */}
                                                            {item.id === 47 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Rating Result :</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rating_result || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rating_result', e.target.value)}
                                                                        className="w-28 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 51: Hydraulic & Brake Capacity */}
                                                            {item.id === 51 && (
                                                                <div className="font-black text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    HYDRAULIC AND BRAKE CAPACITIES 121 L
                                                                </div>
                                                            )}

                                                            {/* Item 54: Steering System Capacity */}
                                                            {item.id === 54 && (
                                                                <div className="font-black text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    STEERING SYSTEM CAPACITIES 38 L
                                                                </div>
                                                            )}

                                                            {/* Item 58: Used filter debris */}
                                                            {item.id === 58 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-[10px] text-gray-700 dark:text-slate-300 print:text-black shrink-0">Rating Result :</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rating_result || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rating_result', e.target.value)}
                                                                        className="w-28 font-mono text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Fallback default editable remark */}
                                                            {![1, 5, 24, 26, 27, 29, 32, 36, 38, 41, 42, 43, 45, 47, 51, 54, 58].includes(item.id) && (
                                                                <input
                                                                    type="text"
                                                                    value={item.remarks || ''}
                                                                    onChange={(e) => handleRemarkChange(globalIndex, e.target.value)}
                                                                    placeholder="Catatan tambahan..."
                                                                    className="w-full text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:bg-transparent"
                                                                />
                                                            )}
                                                        </td>

                                                        {/* SN Inspector */}
                                                        <td className="py-1 px-1.5 align-middle text-center">
                                                            <input
                                                                type="text"
                                                                value={item.inspector || ''}
                                                                onChange={(e) => handleInspectorChange(globalIndex, e.target.value)}
                                                                placeholder="SN / ID"
                                                                className="w-full font-mono text-xs text-center px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:bg-transparent"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes Box */}
                    <div className="border-t-2 border-gray-900 dark:border-slate-700 print:border-black p-3 space-y-1">
                        <label className="font-bold text-xs uppercase tracking-wider block text-gray-800 dark:text-slate-200">
                            NOTE :
                        </label>
                        <textarea
                            rows="4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tuliskan catatan khusus, temuan kebocoran, atau rekomendasi perbaikan lanjutan..."
                            className="w-full text-xs p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded focus:ring-amber-500 print:border-none print:p-0 print:bg-transparent leading-relaxed"
                        />
                    </div>

                    {/* Signatures Panel */}
                    <div className="grid grid-cols-2 border-t-2 border-gray-900 dark:border-slate-700 print:border-black divide-x-2 divide-gray-900 dark:divide-slate-700 print:divide-black p-3 text-center">
                        <div className="space-y-6">
                            <div className="font-bold text-xs text-gray-800 dark:text-slate-200">
                                Inspected By,
                            </div>
                            <div className="max-w-xs mx-auto">
                                <input
                                    type="text"
                                    value={mechanicName}
                                    onChange={(e) => setMechanicName(e.target.value)}
                                    placeholder="( Nama Mekanik / Serviceman )"
                                    className="w-full text-center font-bold text-xs border-b border-gray-400 dark:border-slate-600 bg-transparent py-1 print:border-none"
                                />
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                                    Mechanic / Serviceman
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="font-bold text-xs text-gray-800 dark:text-slate-200">
                                Aknowledged by,
                            </div>
                            <div className="max-w-xs mx-auto">
                                <input
                                    type="text"
                                    value={supervisorName}
                                    onChange={(e) => setSupervisorName(e.target.value)}
                                    placeholder="( Nama Supervisor Maintenance )"
                                    className="w-full text-center font-bold text-xs border-b border-gray-400 dark:border-slate-600 bg-transparent py-1 print:border-none"
                                />
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                                    Maintenance Supervisor
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal Riwayat Form ── */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-slate-700 animate-scale-up">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                    📜
                                </div>
                                <h3 className="font-black text-base text-gray-900 dark:text-white">
                                    Riwayat Form PM Dump Truck Terakhir
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHistoryModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {recentForms.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    Belum ada rekaman form PM Dump Truck yang tersimpan.
                                </div>
                            ) : (
                                recentForms.map((rf) => (
                                    <div
                                        key={rf.id}
                                        className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-slate-800/40"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                                                    {rf.form_number}
                                                </span>
                                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded">
                                                    Tipe {rf.service_type}
                                                </span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {rf.unit ? rf.unit.code_unit : 'Tanpa Unit'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                                                <span>Tanggal: {rf.date ? rf.date.substring(0, 10) : '-'}</span>
                                                <span>Shift: {rf.shift}</span>
                                                <span>SMU: {rf.smu || '-'} HRS</span>
                                                <span>Oleh: {rf.creator?.name || 'Sistem'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <a
                                                href={`/form-service-dump-truck?id=${rf.id}`}
                                                className="px-3 py-1 text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm"
                                            >
                                                Buka
                                            </a>
                                            <a
                                                href={`/form-service-dump-truck/${rf.id}/print`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                                            >
                                                Cetak
                                            </a>
                                            <a
                                                href={`/form-service-dump-truck/download-pdf?id=${rf.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 rounded-lg"
                                            >
                                                PDF
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
