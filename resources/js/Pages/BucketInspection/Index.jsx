import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/BKT/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || 'Harindo Wahana');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [inspector, setInspector] = useState(selectedForm?.mechanic_name || '');
    const [supervisor, setSupervisor] = useState(selectedForm?.supervisor_name || '');

    // Results Data (Document Control & Header Custom)
    const [resultsData, setResultsData] = useState(selectedForm?.results_data || {
        doc_number: 'FM-PLT-BKT-01',
        effective_date: new Date().toLocaleDateString('id-ID'),
        revision: '1',
        page_info: '1 dari 1',
        inspection_period: 'Weekly',
        brand: 'Caterpillar',
        superintendent_name: '',
    });

    // Checklist Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.map(item => ({
            ...item,
            std: item.std || 'Standar',
            act: item.act || '',
            mark: item.mark || '',
            remark: item.remark || '',
        }));
    });

    // Notes
    const [notes, setNotes] = useState(selectedForm?.notes || '');

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [activeSectionTab, setActiveSectionTab] = useState('ALL');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-fill unit details on change
    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            if (found.current_hm) setSmu(found.current_hm);
            setResultsData(prev => ({
                ...prev,
                brand: found.engine_make || (found.model?.toLowerCase().includes('cat') ? 'Caterpillar' : (found.model?.toLowerCase().includes('pc') ? 'Komatsu' : prev.brand)),
            }));
        }
    };

    const selectedUnitObj = units.find(u => String(u.id) === String(unitId));

    // Handle Mark Click: V (Good), X (Bad), CORRECTIVE (⊗)
    const handleSetMark = (id, markValue) => {
        setItemsState(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const newMark = item.mark === markValue ? '' : markValue;
                    return { ...item, mark: newMark };
                }
                return item;
            });
        });
    };

    // Handle Text Change (act, remark, std)
    const handleItemTextChange = (id, field, value) => {
        setItemsState(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                }
                return item;
            });
        });
    };

    // Quick set all visible to V (Good)
    const handleMarkAllGood = () => {
        setItemsState(prev => {
            return prev.map(item => {
                const matchTab = activeSectionTab === 'ALL' || item.section === activeSectionTab;
                if (matchTab) {
                    return { ...item, mark: 'V', act: item.act || 'Normal / Good' };
                }
                return item;
            });
        });
        setNotification('Semua item terpilih telah ditandai V (Good).');
        setTimeout(() => setNotification(null), 3000);
    };

    // Reset Checklist
    const handleResetChecklist = () => {
        if (window.confirm('Reset status seluruh checklist ke kosong?')) {
            setItemsState(prev => prev.map(item => ({ ...item, mark: '', act: '', remark: '' })));
        }
    };

    // Save Form
    const handleSave = (e) => {
        if (e) e.preventDefault();
        if (!unitId) {
            alert('Silakan pilih unit terlebih dahulu.');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'BUCKET-INSPECTION',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date: date,
            smu: smu ? parseFloat(smu) : null,
            items: itemsState,
            results_data: resultsData,
            notes: notes,
            mechanic_name: inspector,
            supervisor_name: supervisor,
            status: 'COMPLETED',
        };

        if (selectedForm?.id) {
            router.put(`/form-inspection-bucket/${selectedForm.id}`, payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form Bucket Inspection berhasil diperbarui!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        } else {
            router.post('/form-inspection-bucket', payload, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    setNotification('Form Bucket Inspection baru berhasil disimpan!');
                    setTimeout(() => setNotification(null), 4000);
                },
            });
        }
    };

    // Calculation statistics
    const totalItems = itemsState.length;
    const goodCount = itemsState.filter(i => i.mark === 'V').length;
    const badCount = itemsState.filter(i => i.mark === 'X').length;
    const correctiveCount = itemsState.filter(i => i.mark === 'CORRECTIVE').length;
    const checkedCount = goodCount + badCount + correctiveCount;
    const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

    // Filter items based on active tab
    const filteredItems = itemsState.filter(i => {
        if (activeSectionTab === 'ALL') return true;
        return i.section === activeSectionTab;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Form Bucket Inspection & Monitoring" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* ─── TOAST NOTIFICATION ─── */}
                {notification && (
                    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-400/40 animate-bounce">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-sm">{notification}</span>
                    </div>
                )}

                {/* ─── HEADER TITLE & ACTIONS ─── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                                MASTER FORM
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {formNumber}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Bucket Inspection &amp; Monitoring
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Digital Check Sheet: Body, Bushing, Ground Engaging Tools (GET), dan Link Pin Lock.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Riwayat ({recentForms.length})
                        </button>

                        <a
                            href={`/form-inspection-bucket/blank-print${unitId ? `?unit_id=${unitId}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Blank Form
                        </a>

                        {selectedForm?.id && (
                            <>
                                <a
                                    href={`/form-inspection-bucket/${selectedForm.id}/print`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak A4
                                </a>

                                <a
                                    href={`/form-inspection-bucket/download-pdf?id=${selectedForm.id}`}
                                    className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Unduh PDF
                                </a>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {selectedForm?.id ? 'Perbarui Form' : 'Simpan Checklist'}
                        </button>
                    </div>
                </div>

                {/* ─── PROGRESS & METRICS BANNER ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Checkpoint</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalItems} Point</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                            35
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Good (V)</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{goodCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
                            ✓
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Bad (X)</p>
                            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{badCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center font-bold text-lg">
                            ✕
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Corrective Action (⊗)</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{correctiveCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center font-bold text-lg">
                            ⊗
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                        <span>Kelengkapan Inspeksi</span>
                        <span>{progressPercent}% ({checkedCount}/{totalItems} items diperiksa)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* ─── FORM HEADER & EQUIPMENT METADATA ─── */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Informasi Unit &amp; Dokumen Inspeksi
                        </h2>
                        <span className="text-xs text-slate-400">Project: {projectId}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Equipment Code */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Equipment Code *
                            </label>
                            <select
                                value={unitId}
                                onChange={handleUnitChange}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 py-2.5"
                                required
                            >
                                <option value="">-- Pilih Unit Alat Berat --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.code_unit} - {u.model} {u.lokasi ? `(${u.lokasi})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Unit Model */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Unit Model
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={selectedUnitObj?.model || '-'}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm py-2.5"
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Brand / Make
                            </label>
                            <input
                                type="text"
                                value={resultsData.brand || ''}
                                onChange={e => setResultsData({ ...resultsData, brand: e.target.value })}
                                placeholder="e.g. Caterpillar / Komatsu"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Inspection Period */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Inspection Period
                            </label>
                            <select
                                value={resultsData.inspection_period || 'Weekly'}
                                onChange={e => setResultsData({ ...resultsData, inspection_period: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="Weekly">Weekly (Mingguan)</option>
                                <option value="250 Jam">250 Jam PM</option>
                                <option value="500 Jam">500 Jam PM</option>
                                <option value="1000 Jam">1000 Jam PM</option>
                                <option value="Monthly">Monthly (Bulanan)</option>
                                <option value="Ad-hoc">Ad-hoc / Breakdown</option>
                            </select>
                        </div>

                        {/* Date of Inspection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Date of Inspection *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Hour Meter */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Hour Meter (SMU)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={smu}
                                onChange={e => setSmu(e.target.value)}
                                placeholder="Contoh: 12450"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500 font-mono"
                            />
                        </div>

                        {/* Inspector Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Inspector (Mekanik)
                            </label>
                            <input
                                type="text"
                                value={inspector}
                                onChange={e => setInspector(e.target.value)}
                                placeholder="Nama personil pemeriksa"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Supervisor Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Supervisor Name
                            </label>
                            <input
                                type="text"
                                value={supervisor}
                                onChange={e => setSupervisor(e.target.value)}
                                placeholder="Nama supervisor plant"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* ─── SECTION NAVIGATION TABS & QUICK TOOLS ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { id: 'ALL', label: 'Semua Bagian (35)' },
                            { id: 'GET', label: '1. G E T (7)' },
                            { id: 'BODY', label: '2. B O D Y (11)' },
                            { id: 'BRACKET', label: '3. BRACKET (4)' },
                            { id: 'LINK_PIN_LOCK', label: '4. LINK & PIN (13)' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveSectionTab(tab.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    activeSectionTab === tab.id
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleMarkAllGood}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 transition-all flex items-center gap-1.5"
                        >
                            <span>✓</span> Tandai Semua V (Good)
                        </button>
                        <button
                            type="button"
                            onClick={handleResetChecklist}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* ─── CHECKLIST TABLE & SCHEMATICS ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                            BODY - BUSHING - TEETH (Check for : Lost, crack, wear, damage)
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                            Legenda: <strong className="text-emerald-600 font-black">V</strong> = Good | <strong className="text-rose-600 font-black">X</strong> = Bad | <strong className="text-amber-600 font-black">⊗</strong> = Corrective Action
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center">NO</th>
                                    <th className="py-3 px-4 min-w-[220px]">DESCRIPTION</th>
                                    <th className="py-3 px-3 w-40">STANDARD (STD)</th>
                                    <th className="py-3 px-3 w-40">ACTUAL (ACT)</th>
                                    <th className="py-3 px-4 w-44 text-center">CONDITION (MARK)</th>
                                    <th className="py-3 px-4 min-w-[200px]">REMARK / TINDAKAN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filteredItems.map((item, idx) => {
                                    // Check if this row is start of a subsection
                                    const showSubHeader = item.sub_section && (idx === 0 || filteredItems[idx - 1]?.sub_section !== item.sub_section);

                                    return (
                                        <React.Fragment key={item.id}>
                                            {showSubHeader && (
                                                <tr className="bg-emerald-50/60 dark:bg-emerald-950/20 border-y border-emerald-200/60 dark:border-emerald-900/40">
                                                    <td colSpan={6} className="py-2 px-4 font-extrabold text-xs text-emerald-800 dark:text-emerald-300 tracking-wide uppercase">
                                                        {item.sub_section}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                                item.mark === 'X' ? 'bg-rose-50/30 dark:bg-rose-950/10' : (item.mark === 'CORRECTIVE' ? 'bg-amber-50/30 dark:bg-amber-950/10' : '')
                                            }`}>
                                                {/* NO */}
                                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                                                    {item.id}
                                                </td>

                                                {/* DESCRIPTION */}
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100">
                                                        {item.description}
                                                    </span>
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                        Grup: {item.section} {item.sub_section ? `• ${item.sub_section}` : ''}
                                                    </div>
                                                </td>

                                                {/* STD */}
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        value={item.std || ''}
                                                        onChange={e => handleItemTextChange(item.id, 'std', e.target.value)}
                                                        placeholder="Standar kriteria"
                                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                                                    />
                                                </td>

                                                {/* ACT */}
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        value={item.act || ''}
                                                        onChange={e => handleItemTextChange(item.id, 'act', e.target.value)}
                                                        placeholder="Kondisi aktual / mm"
                                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </td>

                                                {/* MARK BUTTONS */}
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Good (V) */}
                                                        <button
                                                            type="button"
                                                            title="Good / Layak Pakai"
                                                            onClick={() => handleSetMark(item.id, 'V')}
                                                            className={`w-9 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                                                                item.mark === 'V'
                                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                                                                    : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            ✓
                                                        </button>

                                                        {/* Bad (X) */}
                                                        <button
                                                            type="button"
                                                            title="Bad / Rusak / Retak"
                                                            onClick={() => handleSetMark(item.id, 'X')}
                                                            className={`w-9 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                                                                item.mark === 'X'
                                                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105'
                                                                    : 'bg-slate-100 hover:bg-rose-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            ✕
                                                        </button>

                                                        {/* Corrective Action (⊗) */}
                                                        <button
                                                            type="button"
                                                            title="Corrective action has been taken"
                                                            onClick={() => handleSetMark(item.id, 'CORRECTIVE')}
                                                            className={`w-9 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                                                                item.mark === 'CORRECTIVE'
                                                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                                                                    : 'bg-slate-100 hover:bg-amber-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            ⊗
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* REMARK */}
                                                <td className="py-2 px-4">
                                                    <input
                                                        type="text"
                                                        value={item.remark || ''}
                                                        onChange={e => handleItemTextChange(item.id, 'remark', e.target.value)}
                                                        placeholder="Keterangan / Part No / Tindakan perbaikan..."
                                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ─── FOOTER SIGNATURES & GENERAL NOTES ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Catatan Umum &amp; Rekomendasi
                        </h3>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Catatan inspeksi, rekomendasi penggantian part bucket, atau penjadwalan rebuild bucket..."
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Otorisasi &amp; Tanda Tangan
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Checked by Supervisor
                                </label>
                                <input
                                    type="text"
                                    value={supervisor}
                                    onChange={e => setSupervisor(e.target.value)}
                                    placeholder="Nama Supervisor"
                                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Acknowledged Superintendent
                                </label>
                                <input
                                    type="text"
                                    value={resultsData.superintendent_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, superintendent_name: e.target.value })}
                                    placeholder="Nama Superintendent"
                                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MODAL RIWAYAT INSPECTION ─── */}
                {showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                    Riwayat Form Bucket Inspection
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                                {recentForms.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm">
                                        Belum ada riwayat form tersimpan.
                                    </div>
                                ) : (
                                    recentForms.map(rf => (
                                        <div 
                                            key={rf.id}
                                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between hover:border-emerald-400 transition-all"
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{rf.form_number}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                                                        {rf.unit?.code_unit || '-'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Tanggal: {rf.date ? rf.date.substring(0, 10) : '-'} • SMU: {rf.smu || '-'} Jam • Oleh: {rf.mechanic_name || '-'}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/form-inspection-bucket?id=${rf.id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                                                >
                                                    Buka
                                                </a>
                                                <a
                                                    href={`/form-inspection-bucket/${rf.id}/print`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100"
                                                >
                                                    Print
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
