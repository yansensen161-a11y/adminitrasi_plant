import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/PM-773E/001',
    selectedForm = null,
    recentForms = [],
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || '');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [shift, setShift] = useState(selectedForm?.shift || 'DS');
    const [smu, setSmu] = useState(selectedForm?.smu || '');
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
            remarks: '',
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

    // Handle remark text
    const handleRemarkChange = (index, value) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], remarks: value };
            return copy;
        });
    };

    // Handle specific result subfields (e.g. rpm, rating_result, rrlh, rrrh, etc.)
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

    // Handle inspector initial/number
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
            form_type: 'PM-773E',
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
            router.put(`/form-plant/${selectedForm.id}`, payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form PM berhasil diperbarui!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        } else {
            router.post('/form-plant', payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form PM berhasil disimpan!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        }
    };

    // Reset to blank sheet
    const handleReset = () => {
        if (window.confirm('Bersihkan formulir dan mulai lembar baru?')) {
            router.get('/form-oht773');
        }
    };

    // Print PM Sheet
    const handlePrint = () => {
        window.print();
    };

    // Download PDF (1:1 format server generated)
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
        window.open(`/form-oht773/download-pdf?${params.toString()}`, '_blank');
    };

    // Group items by section
    const sections = [
        { key: 'ENGINE SYSTEM', label: '1. ENGINE SYSTEM' },
        { key: 'DIFFERENTIAL & FINAL DRIVE', label: '2. DIFFERENTIAL & FINAL DRIVE' },
        { key: 'TRANSMISSION & TORQUE CONVERTER', label: '3. TRANSMISSION & TORQUE CONVERTER' },
        { key: 'HYDRAULIC, STEERING & BRAKE SYSTEM', label: '4. HYDRAULIC, STEERING & BRAKE SYSTEM' },
        { key: 'STEERING SYSTEM & AIR SYSTEM', label: '5. STEERING SYSTEM & AIR SYSTEM' },
        { key: 'LUBRICATION / GREASING', label: '6. LUBRICATION / GREASING' },
        { key: 'GENERAL & SAFETY INSPECTION', label: '7. GENERAL & SAFETY INSPECTION' },
    ];

    // Filter items based on active interval if toggle is on
    const isItemVisible = (item) => {
        if (!filterOnlyActiveType) return true;
        return item.types && item.types.includes(serviceType);
    };

    return (
        <AuthenticatedLayout fullWidth={true}>
            <Head title="Form OHT 773 - PM Service Sheet 773E" />

            {/* Notification Banner */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in print:hidden">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold text-sm">{notification}</span>
                </div>
            )}

            <div className="w-full px-2 sm:px-3 lg:px-4 py-2 space-y-3 print:p-0 print:m-0 print:max-w-full">
                {/* ── Top Action Bar (Fokus Cetak & Download PDF Saja) ── */}
                <div className="bg-white dark:bg-slate-800 rounded-xl py-2 px-3 sm:px-4 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/20">
                            📋
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                    Form OHT 773
                                </h1>
                                {selectedForm && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                        #{selectedForm.form_number}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                PM Service Sheet Off Highway Truck 773E (Digital 1:1)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        {/* Reset / New Sheet */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Bersihkan Form
                        </button>

                        {/* Download PDF Button */}
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-all flex items-center gap-1.5"
                            title="Download PM Service Sheet format PDF"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download PDF</span>
                        </button>

                        {/* Print Button */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center gap-1.5"
                            title="Cetak langsung ke printer / Save as PDF browser"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Cetak PM Sheet</span>
                        </button>
                    </div>
                </div>

                {/* ── MAIN PM SERVICE SHEET (Printed 1:1 like PDF) ── */}
                <div className="bg-white dark:bg-slate-900 border-2 border-gray-900 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-none shadow-xl print:shadow-none print:border-black print:text-black print:bg-white text-xs print:text-[10px]">
                    
                    {/* Header: Title & Document Brand */}
                    <div className="border-b-2 border-gray-900 dark:border-slate-700 print:border-black py-2 px-3 print:py-1.5 print:px-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="font-black text-xl tracking-tighter text-rose-600 print:text-black">
                                MAM
                            </div>
                            <div>
                                <h2 className="text-base sm:text-xl font-black uppercase tracking-wider leading-tight">
                                    PM SERVICE SHEET
                                </h2>
                                <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 print:text-black leading-tight">
                                    OFF HIGHWAY TRUCK 773E
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
                        <div className="md:col-span-5 p-2 space-y-1 print:p-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="w-20 font-bold uppercase text-[10px] shrink-0">PROJECT ID</label>
                                <span className="font-bold">:</span>
                                <input
                                    type="text"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    placeholder="Contoh: PT-MAM / SITE A"
                                    className="flex-1 font-bold text-xs px-1.5 py-0.5 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded uppercase print:border-none print:p-0"
                                />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-20 font-bold uppercase text-[10px] shrink-0">UNIT ID</label>
                                <span className="font-bold">:</span>
                                <div className="flex-1 flex gap-1">
                                    <select
                                        value={unitId}
                                        onChange={handleUnitChange}
                                        className="flex-1 font-bold text-xs px-1.5 py-0.5 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:hidden"
                                    >
                                        <option value="">-- Pilih Unit Operasional --</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.code_unit} {u.model ? `(${u.model})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="hidden print:inline font-bold">
                                        {selectedUnitObj ? selectedUnitObj.code_unit : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-20 font-bold uppercase text-[10px] shrink-0">DATE</label>
                                <span className="font-bold">:</span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="flex-1 font-bold text-xs px-1.5 py-0.5 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:p-0"
                                />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-20 font-bold uppercase text-[10px] shrink-0">S.M.U</label>
                                <span className="font-bold">:</span>
                                <div className="flex-1 flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        value={smu}
                                        onChange={(e) => setSmu(e.target.value)}
                                        placeholder="0"
                                        className="w-24 font-mono font-bold text-xs px-1.5 py-0.5 h-7 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none print:p-0"
                                    />
                                    <span className="font-black text-[11px]">HRS</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="w-20 font-bold uppercase text-[10px] shrink-0">SHIFT</label>
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
                        <div className="md:col-span-4 p-2 print:p-1.5 space-y-1">
                            <div className="font-bold text-[10px] uppercase border-b border-gray-300 dark:border-slate-700 pb-0.5 leading-tight">
                                Pengambilan Sampel Oli Terakhir / Last Oil Sample Taken
                            </div>
                            <div className="space-y-0.5 text-[10px]">
                                <div className="flex items-center justify-between gap-1">
                                    <span>Engine</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.engine || ''}
                                        onChange={(e) => setOilSamples({...oilSamples, engine: e.target.value})}
                                        className="w-24 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span>Transmission</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.transmission || ''}
                                        onChange={(e) => setOilSamples({...oilSamples, transmission: e.target.value})}
                                        className="w-24 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span>Diff & Final Drive</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.differential || ''}
                                        onChange={(e) => setOilSamples({...oilSamples, differential: e.target.value})}
                                        className="w-24 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span>Hydraulic</span>
                                    <span>:</span>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={oilSamples.hydraulic || ''}
                                        onChange={(e) => setOilSamples({...oilSamples, hydraulic: e.target.value})}
                                        className="w-24 font-mono text-center text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Caution Box */}
                        <div className="md:col-span-3 p-2 print:p-1.5 bg-amber-50/50 dark:bg-amber-950/10 print:bg-transparent">
                            <div className="font-bold text-[10px] uppercase text-amber-800 dark:text-amber-400 print:text-black border-b border-amber-300 pb-0.5 mb-1 flex items-center gap-1 leading-tight">
                                <span>⚠️</span>
                                <span>Perhatian / Caution</span>
                            </div>
                            <ul className="space-y-0.5 text-[9.5px] leading-tight text-gray-700 dark:text-slate-300 print:text-black list-disc pl-3">
                                <li>Cuci unit yang bersih sebelum pelaksanaan inspeksi <em>(Clean up unit)</em></li>
                                <li>Parkirkan unit pada tempat rata dengan aman <em>(Park safely)</em></li>
                                <li>Pasang Danger/Service Tag <em>(Use Danger Tag)</em></li>
                            </ul>
                        </div>
                    </div>

                    {/* Service Type Ribbon */}
                    <div className="bg-gray-100 dark:bg-slate-800 print:bg-gray-100 border-b-2 border-gray-900 dark:border-slate-700 print:border-black py-1.5 px-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold uppercase text-[10px] flex items-center gap-1.5">
                            <span>Tipe PM Service:</span>
                            <span className="text-gray-500 font-normal text-[10px]">(Pilih salah satu interval yang dilaksanakan saat ini)</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            {[
                                { key: 'A', label: 'A : PM 250 / PS 1' },
                                { key: 'B', label: 'B : PM 500 / PS 2' },
                                { key: 'C', label: 'C : PM 1000 / PS 3' },
                                { key: 'D', label: 'D : PM 2000 / PS 4' },
                                { key: 'E', label: 'E : PM 4000 / PS 5' },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setServiceType(t.key)}
                                    className={`px-2.5 py-0.5 rounded font-bold border text-xs transition-all ${
                                        serviceType === t.key
                                            ? 'bg-gray-900 text-white border-black dark:bg-white dark:text-black shadow'
                                            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── CHECKLIST TABLE ── */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-left">
                            <colgroup>
                                <col style={{ width: '28px' }} />
                                <col style={{ width: '28px' }} />
                                <col style={{ width: '28px' }} />
                                <col style={{ width: '28px' }} />
                                <col style={{ width: '28px' }} />
                                <col />
                                <col style={{ width: '160px' }} />
                                <col style={{ width: '230px' }} />
                                <col style={{ width: '60px' }} />
                            </colgroup>
                            <thead>
                                {/* Top Header Row */}
                                <tr className="bg-gray-200 dark:bg-slate-800 print:bg-gray-200 border-b border-gray-900 dark:border-slate-700 print:border-black text-[10px] font-black uppercase text-center">
                                    <th colSpan={5} className="py-0.5 px-0 border border-gray-900 dark:border-slate-700 print:border-black bg-gray-600 dark:bg-slate-700 text-white text-center">
                                        <div className="leading-tight text-[10px]">Tipe Servis</div>
                                        <div className="text-[8px] italic font-normal tracking-tight text-gray-200 leading-tight">Service Type</div>
                                    </th>
                                    <th rowSpan={2} className="py-1 px-2 border border-gray-900 dark:border-slate-700 print:border-black text-left text-xs">
                                        Deskripsi Pemeriksaan / Tasks
                                    </th>
                                    <th rowSpan={2} className="py-1.5 px-2 border border-gray-900 dark:border-slate-700 print:border-black text-center text-xs" style={{ width: '160px' }}>
                                        Check Point
                                    </th>
                                    <th rowSpan={2} className="py-1 px-1.5 border border-gray-900 dark:border-slate-700 print:border-black text-left text-xs">
                                        Remarks / Measurement
                                    </th>
                                    <th rowSpan={2} className="py-1 px-1 border border-gray-900 dark:border-slate-700 print:border-black text-center text-xs" style={{ width: '60px' }}>
                                        S/N Inspector
                                    </th>
                                </tr>
                                {/* Sub Header Row: A, B, C, D, E */}
                                <tr className="bg-gray-100 dark:bg-slate-800 print:bg-gray-100 border-b border-gray-900 dark:border-slate-700 print:border-black text-[10px] font-black text-center">
                                    {['A', 'B', 'C', 'D', 'E'].map(t => (
                                        <th
                                            key={t}
                                            className={`py-0.5 px-0 border border-gray-900 dark:border-slate-700 print:border-black ${
                                                serviceType === t ? 'bg-amber-200/90 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200 font-black' : ''
                                            }`}
                                        >
                                            {t}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300 dark:divide-slate-700 print:divide-gray-400">
                                {sections.map((sec) => {
                                    const sectionItems = itemsState.filter(it => it.section === sec.key && isItemVisible(it));
                                    if (sectionItems.length === 0) return null;

                                    return (
                                        <React.Fragment key={sec.key}>
                                            {/* Section Header Row */}
                                            <tr className="bg-gray-200/90 dark:bg-slate-800 print:bg-gray-200 border-t-2 border-b border-gray-900 dark:border-slate-700 print:border-black font-black text-[10px]">
                                                <td colSpan={9} className="py-0.5 px-2 uppercase tracking-wider text-gray-900 dark:text-slate-100 print:text-black">
                                                    {sec.label}
                                                </td>
                                            </tr>

                                            {/* Section Checklist Items */}
                                            {sectionItems.map((item) => {
                                                const globalIndex = itemsState.findIndex(it => it.id === item.id);
                                                const isApplicableToCurrentType = item.types && item.types.includes(serviceType);

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className={`hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                                                            isApplicableToCurrentType ? '' : 'opacity-60 dark:opacity-40 print:opacity-100'
                                                        }`}
                                                    >
                                                        {/* Tipe Servis A, B, C, D, E columns with checkmarks */}
                                                        {['A', 'B', 'C', 'D', 'E'].map(t => {
                                                            const isChecked = item.types && item.types.includes(t);
                                                            const isActiveInterval = serviceType === t;

                                                            return (
                                                                <td
                                                                    key={t}
                                                                    className={`py-0.5 px-0 border border-gray-300 dark:border-slate-700 print:border-black text-center align-middle ${
                                                                        isActiveInterval ? 'bg-amber-100/50 dark:bg-amber-950/20' : ''
                                                                    }`}
                                                                >
                                                                    {isChecked ? (
                                                                        <span
                                                                            className={`inline-flex items-center justify-center font-black text-xs ${
                                                                                isActiveInterval
                                                                                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold scale-110'
                                                                                    : 'text-gray-900 dark:text-white print:text-black'
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
                                                        <td className="py-0.5 px-2 border border-gray-300 dark:border-slate-700 print:border-black align-middle">
                                                            <div className="font-medium text-xs leading-snug text-gray-900 dark:text-white print:text-black">
                                                                {item.desc_id}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 dark:text-slate-400 italic leading-none print:text-gray-700 mt-0.5">
                                                                {item.desc_en}
                                                            </div>
                                                        </td>

                                                        {/* Check Point (OK / Adj / Rep) */}
                                                        <td className="py-1 px-2 border border-gray-300 dark:border-slate-700 print:border-black align-middle text-center">
                                                            <div className="flex items-center justify-center gap-1.5 print:hidden">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCheckPoint(globalIndex, 'OK')}
                                                                    title="OK / Normal"
                                                                    className={`px-3 py-1 rounded text-xs font-black border transition-all ${
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
                                                                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
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
                                                                    title="Repaired / Replace"
                                                                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                                                                        item.status === 'REPAIR'
                                                                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-1 ring-rose-500'
                                                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-rose-50'
                                                                    }`}
                                                                >
                                                                    Rep
                                                                </button>
                                                            </div>

                                                            {/* Print view of status */}
                                                            <div className="hidden print:block font-bold text-center text-sm" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                                                {item.status === 'OK' ? '✓' : item.status || ' '}
                                                            </div>
                                                        </td>

                                                        {/* Remarks & Specific Fields */}
                                                        <td className="py-0.5 px-1.5 border border-gray-300 dark:border-slate-700 print:border-black align-middle">
                                                            {/* Item 1: Logged event */}
                                                            {item.id === 1 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-[10px] text-gray-600 dark:text-slate-400 print:text-black shrink-0">Logged event:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.logged_event || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'logged_event', e.target.value)}
                                                                        className="flex-1 text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 2: Test RPM */}
                                                            {item.id === 2 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-[10px] text-gray-600 dark:text-slate-400 print:text-black shrink-0">Result:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.results?.stall_rpm || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'stall_rpm', e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-16 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">RPM</span>
                                                                </div>
                                                            )}

                                                            {/* Item 29: Differential Capacity */}
                                                            {item.id === 29 && (
                                                                <div className="font-bold text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    DIFFERENTIAL CAPACITIES 120 L
                                                                </div>
                                                            )}

                                                            {/* Item 32: Final Drive Plug RR */}
                                                            {item.id === 32 && (
                                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                                    <span className="font-bold shrink-0">Rating:</span>
                                                                    <span className="font-mono">RRLH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rrlh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rrlh', e.target.value)}
                                                                        className="w-12 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-mono">RRRH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.rrrh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'rrrh', e.target.value)}
                                                                        className="w-12 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 35: Front Wheel Oil Level */}
                                                            {item.id === 35 && (
                                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                                    <span className="font-bold shrink-0">Rating:</span>
                                                                    <span className="font-mono">FRLH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.frlh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'frlh', e.target.value)}
                                                                        className="w-12 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-mono">FRRH:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.frrh || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'frrh', e.target.value)}
                                                                        className="w-12 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Item 37: Wheel Front Capacities */}
                                                            {item.id === 37 && (
                                                                <div className="font-bold text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    WHEEL FRONT CAPACITIES 6.8 L
                                                                </div>
                                                            )}

                                                            {/* Item 43: Trans & TC Capacities */}
                                                            {item.id === 43 && (
                                                                <div className="font-bold text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    Transmission & TC 106 L
                                                                </div>
                                                            )}

                                                            {/* Item 48: Brake Engagement Test */}
                                                            {item.id === 48 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-[10px] shrink-0">Result:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.results?.brake_rpm || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'brake_rpm', e.target.value)}
                                                                        placeholder="1200"
                                                                        className="w-16 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">RPM</span>
                                                                </div>
                                                            )}

                                                            {/* Item 49: Cycle time steering */}
                                                            {item.id === 49 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-[10px] shrink-0">Result:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.steer_sec || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'steer_sec', e.target.value)}
                                                                        placeholder="5-6"
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">SEC</span>
                                                                </div>
                                                            )}

                                                            {/* Item 51: Cycle time hoist */}
                                                            {item.id === 51 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-[10px] shrink-0">Result:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.results?.hoist_sec || ''}
                                                                        onChange={(e) => handleResultFieldChange(globalIndex, 'hoist_sec', e.target.value)}
                                                                        placeholder="15"
                                                                        className="w-14 font-mono text-xs px-1 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                    />
                                                                    <span className="font-bold font-mono text-[10px]">SEC</span>
                                                                </div>
                                                            )}

                                                            {/* Item 57: Hydraulic Capacities */}
                                                            {item.id === 57 && (
                                                                <div className="font-bold text-[10px] text-amber-700 dark:text-amber-400 print:text-black">
                                                                    HYDRAULIC AND BRAKE CAPACITIES 121 L
                                                                </div>
                                                            )}

                                                            {/* Generic Rating Result or General Remarks input */}
                                                            {![1, 2, 32, 35, 48, 49, 51].includes(item.id) && (
                                                                <input
                                                                    type="text"
                                                                    value={item.remarks || ''}
                                                                    onChange={(e) => handleRemarkChange(globalIndex, e.target.value)}
                                                                    placeholder={
                                                                        [26, 28, 40, 41, 46, 47, 54, 60].includes(item.id)
                                                                            ? 'Rating Result...'
                                                                            : ''
                                                                    }
                                                                    className="w-full text-xs px-1.5 py-0.5 h-6 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                                                                />
                                                            )}
                                                        </td>

                                                        {/* S/N Inspector (Dikosongkan sesuai permintaan & dokumen fisik) */}
                                                        <td className="py-0.5 px-1 border border-gray-300 dark:border-slate-700 print:border-black text-center align-middle">
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

                    {/* Footer: Notes & Signatures */}
                    <div className="border-t-2 border-gray-900 dark:border-slate-700 print:border-black p-4 print:p-2 space-y-4">
                        {/* Note Box */}
                        <div>
                            <div className="font-black text-[11px] uppercase mb-1">NOTE :</div>
                            <textarea
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Catatan temuan kerusakan, backlog, atau rekomendasi perbaikan lanjutan..."
                                className="w-full text-xs p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded print:border-none"
                            />
                        </div>

                        {/* Signatures Grid */}
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-300 dark:border-slate-700 print:border-black">
                            {/* Inspected By */}
                            <div className="text-center space-y-12">
                                <div className="font-bold text-[11px] uppercase">Inspected By,</div>
                                <div className="border-b border-gray-900 dark:border-slate-400 print:border-black w-48 mx-auto">
                                    <input
                                        type="text"
                                        value={mechanicName}
                                        onChange={(e) => setMechanicName(e.target.value)}
                                        placeholder="Nama Mekanik / Serviceman"
                                        className="w-full text-center font-bold text-xs py-1 dark:bg-transparent print:border-none"
                                    />
                                </div>
                                <div className="font-semibold text-[10px] text-gray-500 dark:text-slate-400 print:text-black">
                                    Mechanic / Serviceman
                                </div>
                            </div>

                            {/* Acknowledged By */}
                            <div className="text-center space-y-12">
                                <div className="font-bold text-[11px] uppercase">Acknowledged by,</div>
                                <div className="border-b border-gray-900 dark:border-slate-400 print:border-black w-48 mx-auto">
                                    <input
                                        type="text"
                                        value={supervisorName}
                                        onChange={(e) => setSupervisorName(e.target.value)}
                                        placeholder="Nama Maintenance Supervisor"
                                        className="w-full text-center font-bold text-xs py-1 dark:bg-transparent print:border-none"
                                    />
                                </div>
                                <div className="font-semibold text-[10px] text-gray-500 dark:text-slate-400 print:text-black">
                                    Maintenance Supervisor
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Slide-over / Modal: Riwayat Form PM ── */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-slate-700 animate-scale-up">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-lg text-gray-900 dark:text-white">
                                    Riwayat Form OHT 773
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                    Pilih dokumen sebelumnya untuk dilihat, diedit, atau dicetak ulang
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHistoryModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 flex items-center justify-center font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 dark:divide-slate-700">
                            {recentForms.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-xs">
                                    Belum ada riwayat form PM yang tersimpan di sistem.
                                </div>
                            ) : (
                                recentForms.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition-colors">
                                        <div>
                                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                {item.form_number}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-slate-300 font-semibold mt-0.5">
                                                Unit: <span className="font-bold">{item.unit?.code_unit || '-'}</span> | Shift: {item.shift} | Tipe {item.service_type}
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} · Mekanik: {item.mechanic_name || '-'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowHistoryModal(false);
                                                    router.get(`/form-plant?id=${item.id}`);
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                                            >
                                                Buka Form
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-right">
                            <button
                                type="button"
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-slate-300 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print CSS */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        font-family: Arial, sans-serif !important;
                    }
                    header, aside, nav, .print\\:hidden {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: portrait;
                        margin: 8mm;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
