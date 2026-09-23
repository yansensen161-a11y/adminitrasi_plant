import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/PRT/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || 'PT Mitra Abadi Mahakam');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [supervisorName, setSupervisorName] = useState(selectedForm?.supervisor_name || '');

    // Specialized Results Data (Task, MC, Others)
    const [resultsData, setResultsData] = useState(selectedForm?.results_data || {
        task: 'Perform Maintenance On',
        mc: '10 Hr PM Service',
        other_1: '',
        other_1_cond: '',
        other_1_remark: '',
        other_2: '',
        other_2_cond: '',
        other_2_remark: '',
        other_3: '',
        other_3_cond: '',
        other_3_remark: '',
        other_4: '',
        other_4_cond: '',
        other_4_remark: '',
    });

    // Checklist Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.map(item => ({
            ...item,
            status: item.status || '', // 'GOOD', 'REPAIR', 'B.LOG'
            remarks: item.remarks || '',
        }));
    });

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');
    const [unitFilterType, setUnitFilterType] = useState('ALL'); // 'ALL', 'DZR', 'HEX'
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-fill unit details
    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            if (found.current_hm) setSmu(found.current_hm);
            if (found.model?.toLowerCase().includes('d') || found.type_unit?.toLowerCase().includes('dozer')) {
                setUnitFilterType('DZR');
            } else if (found.model?.toLowerCase().includes('pc') || found.model?.toLowerCase().includes('ex') || found.type_unit?.toLowerCase().includes('excavator')) {
                setUnitFilterType('HEX');
            }
        }
    };

    const selectedUnitObj = units.find(u => String(u.id) === String(unitId));

    // Handle Item Condition Toggle
    const handleSetCondition = (id, cond) => {
        setItemsState(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const status = item.status === cond ? '' : cond;
                    return { ...item, status };
                }
                return item;
            });
        });
    };

    // Quick set all visible items to GOOD
    const handleSetAllGood = () => {
        setItemsState(prev => {
            return prev.map(item => {
                const matchSec = activeSectionFilter === 'ALL' || item.section === activeSectionFilter;
                const matchType = unitFilterType === 'ALL' || (unitFilterType === 'DZR' && item.dzr !== null) || (unitFilterType === 'HEX' && item.hex !== null);
                if (matchSec && matchType) {
                    return { ...item, status: 'GOOD' };
                }
                return item;
            });
        });
        setNotification('Semua item checklist yang tampil ditandai GOOD.');
        setTimeout(() => setNotification(null), 3000);
    };

    const handleResetAll = () => {
        if (window.confirm('Reset semua status checklist Pre Release Track Unit ini?')) {
            setItemsState(prev => prev.map(item => ({ ...item, status: '', remarks: '' })));
        }
    };

    // Save Form
    const handleSave = (e) => {
        if (e) e.preventDefault();
        if (!unitId) {
            alert('Pilih unit Track (Dozer / Excavator) terlebih dahulu!');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'PRE-RELEASE-TRACK-UNIT',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date,
            smu: smu ? parseFloat(smu) : 0,
            service_type: '10 Hr PM Service',
            items: itemsState,
            results_data: resultsData,
            mechanic_name: mechanicName,
            supervisor_name: supervisorName,
            status: selectedForm?.status || 'COMPLETED',
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-pre-release-track-unit/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Pre Release Check List Track Unit berhasil diperbarui.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/form-pre-release-track-unit', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Pre Release Check List Track Unit berhasil disimpan.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pre Release Check List Track Unit" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                
                {/* Notification */}
                {notification && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{notification}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Subtitle Banner */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-semibold text-center tracking-wide shadow-md">
                    Check all below components for leaks, loosen, cracks, damage, bent, part &amp; missing (DZR = Dozer, HEX = Hydraulic Excavator)
                </div>

                {/* Top Action Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xl font-bold">📑</span>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    PRE RELEASE CHECK LIST REPORT TRACK UNIT
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Checklist Standar Pra-Rilis Komponen Dozer &amp; Hydraulic Excavator
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>🕒</span> Riwayat ({recentForms.length})
                        </button>

                        <a
                            href={`/form-pre-release-track-unit/blank-print${unitId ? `?unit_id=${unitId}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>📄</span> Blank Print
                        </a>

                        {selectedForm && (
                            <>
                                <a
                                    href={`/form-pre-release-track-unit/${selectedForm.id}/print`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                                >
                                    <span>🖨️</span> Cetak Lembar
                                </a>
                                <a
                                    href={`/form-pre-release-track-unit/download-pdf?id=${selectedForm.id}`}
                                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                                >
                                    <span>📥</span> Unduh PDF
                                </a>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin text-sm">⏳</span> Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span>💾</span> {selectedForm ? 'Perbarui Form' : 'Simpan Form'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Metadata Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor Form</label>
                        <input
                            type="text"
                            value={formNumber}
                            onChange={e => setFormNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Equipment No. (Unit Track) *</label>
                        <select
                            value={unitId}
                            onChange={handleUnitChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="">-- Pilih Unit Track --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.code_unit} - {u.model} ({u.type_unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date (Tanggal)</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hours Meter (SMU)</label>
                        <input
                            type="number"
                            step="any"
                            value={smu}
                            onChange={e => setSmu(e.target.value)}
                            placeholder="e.g. 5420"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task</label>
                        <input
                            type="text"
                            value={resultsData.task || ''}
                            onChange={e => setResultsData({ ...resultsData, task: e.target.value })}
                            placeholder="Perform Maintenance On"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">MC</label>
                        <input
                            type="text"
                            value={resultsData.mc || ''}
                            onChange={e => setResultsData({ ...resultsData, mc: e.target.value })}
                            placeholder="10 Hr PM Service"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Technician</label>
                        <input
                            type="text"
                            value={mechanicName}
                            onChange={e => setMechanicName(e.target.value)}
                            placeholder="Nama Teknisi"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Maint. Coordinator</label>
                        <input
                            type="text"
                            value={supervisorName}
                            onChange={e => setSupervisorName(e.target.value)}
                            placeholder="Nama Coordinator"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500"
                        />
                    </div>
                </div>

                {/* Filter and Mode Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Tampilan Unit:</span>
                        {[
                            { key: 'ALL', label: 'Semua (DZR & HEX)' },
                            { key: 'DZR', label: 'Dozer (DZR)' },
                            { key: 'HEX', label: 'Excavator (HEX)' },
                        ].map(t => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setUnitFilterType(t.key)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                    unitFilterType === t.key
                                        ? 'bg-teal-600 text-white border-teal-500'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSetAllGood}
                            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                        >
                            <span>✓</span> Tandai Semua = GOOD
                        </button>
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-2.5">DESCRIPTION</th>
                                    <th className="px-2 py-2.5 text-center w-12">DZR</th>
                                    <th className="px-2 py-2.5 text-center w-12">HEX</th>
                                    <th className="px-2 py-2.5 text-center w-20">GOOD</th>
                                    <th className="px-2 py-2.5 text-center w-20">REPAIR</th>
                                    <th className="px-2 py-2.5 text-center w-20">B.LOG</th>
                                    <th className="px-4 py-2.5 w-64">REMARKS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {itemsState.map((item, idx) => {
                                    const matchType = unitFilterType === 'ALL' || (unitFilterType === 'DZR' && item.dzr !== null) || (unitFilterType === 'HEX' && item.hex !== null);
                                    if (!matchType) return null;

                                    const showGroupHeader = idx === 0 || itemsState[idx - 1]?.section !== item.section;

                                    return (
                                        <React.Fragment key={item.id}>
                                            {showGroupHeader && (
                                                <tr className="bg-amber-500/10 border-y border-amber-500/30 font-bold text-amber-300 text-xs">
                                                    <td colSpan="7" className="px-4 py-2 uppercase tracking-wide">
                                                        {item.section.includes('Operator')
                                                            ? '1. OPERATOR COMPARTMENT , ELECTRIC , COOLING & AIR CONDITIONER'
                                                            : '2. FROM : FRONT ---> RIGHT ---> REAR ---> LEFT & UNDER UNIT'}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="hover:bg-slate-800/40 transition">
                                                <td className="px-4 py-2 font-medium text-white">
                                                    {item.description}
                                                </td>
                                                <td className="px-2 py-2 text-center font-bold text-amber-400">
                                                    {item.dzr ?? '-'}
                                                </td>
                                                <td className="px-2 py-2 text-center font-bold text-cyan-400">
                                                    {item.hex ?? '-'}
                                                </td>

                                                {/* GOOD Checkbox */}
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetCondition(item.id, 'GOOD')}
                                                        className={`w-6 h-6 rounded-md border text-xs font-bold transition inline-flex items-center justify-center ${
                                                            item.status === 'GOOD'
                                                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                                                                : 'bg-slate-950 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {item.status === 'GOOD' ? '✓' : ''}
                                                    </button>
                                                </td>

                                                {/* REPAIR Checkbox */}
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetCondition(item.id, 'REPAIR')}
                                                        className={`w-6 h-6 rounded-md border text-xs font-bold transition inline-flex items-center justify-center ${
                                                            item.status === 'REPAIR'
                                                                ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                                                                : 'bg-slate-950 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {item.status === 'REPAIR' ? '✓' : ''}
                                                    </button>
                                                </td>

                                                {/* B.LOG Checkbox */}
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetCondition(item.id, 'B.LOG')}
                                                        className={`w-6 h-6 rounded-md border text-xs font-bold transition inline-flex items-center justify-center ${
                                                            item.status === 'B.LOG'
                                                                ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                                                                : 'bg-slate-950 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {item.status === 'B.LOG' ? '✓' : ''}
                                                    </button>
                                                </td>

                                                {/* REMARKS input */}
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={item.remarks || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setItemsState(prev => prev.map(i => i.id === item.id ? { ...i, remarks: val } : i));
                                                        }}
                                                        placeholder="Catatan temuan..."
                                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
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

                {/* Others Additional Findings */}
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span>📝</span> Others / Temuan Tambahan (Item 1-4)
                    </h3>
                    <div className="space-y-3">
                        {[1, 2].map(num => (
                            <div key={num} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-xs">
                                <div>
                                    <label className="text-slate-400 text-[11px] block">Others #{num} Deskripsi</label>
                                    <input
                                        type="text"
                                        value={resultsData[`other_${num}`] || ''}
                                        onChange={e => setResultsData({ ...resultsData, [`other_${num}`]: e.target.value })}
                                        placeholder={`Temuan item lain ${num}...`}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-[11px] block">Kondisi</label>
                                    <select
                                        value={resultsData[`other_${num}_cond`] || ''}
                                        onChange={e => setResultsData({ ...resultsData, [`other_${num}_cond`]: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                    >
                                        <option value="">- Pilih Kondisi -</option>
                                        <option value="GOOD">GOOD</option>
                                        <option value="REPAIR">REPAIR</option>
                                        <option value="B.LOG">B.LOG</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-slate-400 text-[11px] block">Remarks</label>
                                    <input
                                        type="text"
                                        value={resultsData[`other_${num}_remark`] || ''}
                                        onChange={e => setResultsData({ ...resultsData, [`other_${num}_remark`]: e.target.value })}
                                        placeholder="Keterangan tindakan..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History Modal */}
                {showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>🕒</span> Riwayat Pre Release Track Unit
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-slate-400 hover:text-white text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto mt-3">
                                {recentForms.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-500">
                                        Belum ada data pre release track unit yang tersimpan.
                                    </div>
                                ) : (
                                    recentForms.map(rf => (
                                        <div key={rf.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-white">
                                                    {rf.form_number} - {rf.unit?.code_unit || 'Tanpa Unit'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {rf.date} • {rf.smu ? `${rf.smu} HM` : '-'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/form-pre-release-track-unit?id=${rf.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-semibold"
                                                >
                                                    Buka
                                                </Link>
                                                <a
                                                    href={`/form-pre-release-track-unit/${rf.id}/print`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                                >
                                                    Cetak
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
