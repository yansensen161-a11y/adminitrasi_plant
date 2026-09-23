import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'DISPOSE/PLT/2026/01',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || 'PT Mitra Abadi Mahakam');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || (units[0]?.id || ''));
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [supervisorName, setSupervisorName] = useState(selectedForm?.supervisor_name || '');

    // Specialized Results Data (Reasons, Transfer, Method, Approvals, Photos)
    const [resultsData, setResultsData] = useState(selectedForm?.results_data || {
        // Reason of Dispose
        reason_stolen: false,
        reason_obsolete: false,
        reason_damaged: false,
        reason_missing: false,
        reason_other: '',
        impairment_specify: '',

        // Transferring Division
        transfer_name: '',
        transfer_division: 'Plant Department',
        transfer_date: new Date().toISOString().substring(0, 10),
        inspector_name: '',
        dept_head_rebuild: '',

        // Dispose Method
        method_auction: false,
        method_tender: false,
        method_traded: false,
        method_missing: false,
        method_donated: false,
        method_destroyed: false,
        method_others: '',

        // Approvals
        approval_superintendent: '',
        approval_superintendent_date: '',
        approval_plant_manager: '',
        approval_plant_manager_date: '',
        approval_project_manager: '',
        approval_project_manager_date: '',
        approval_logistic_dept_head: '',
        approval_logistic_dept_head_date: '',
        approval_logistic_manager: '',
        approval_logistic_manager_date: '',
        approval_general_manager: '',
        approval_general_manager_date: '',
        approval_president_director: '',
        approval_president_director_date: '',

        // Photos
        photo_front: '',
        photo_back: '',
        photo_side_1: '',
        photo_side_2: '',
    });

    // Asset Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.length > 0 ? defaultItems : [
            { id: 1, type_unit: '', description: '', manufacture: '', serial_number: '', part_number: '', qty: 1, condition: '', status: '', remarks: '' },
            { id: 2, type_unit: '', description: '', manufacture: '', serial_number: '', part_number: '', qty: 1, condition: '', status: '', remarks: '' },
            { id: 3, type_unit: '', description: '', manufacture: '', serial_number: '', part_number: '', qty: 1, condition: '', status: '', remarks: '' },
            { id: 4, type_unit: '', description: '', manufacture: '', serial_number: '', part_number: '', qty: 1, condition: '', status: '', remarks: '' },
        ];
    });

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-fill unit details
    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            if (found.current_hm) setSmu(found.current_hm);
            // Pre-fill type unit for empty rows
            setItemsState(prev => prev.map(item => ({
                ...item,
                type_unit: item.type_unit || found.code_unit || found.model || '',
            })));
        }
    };

    // Item row update
    const handleItemChange = (index, field, value) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleAddRow = () => {
        setItemsState(prev => [
            ...prev,
            { id: prev.length + 1, type_unit: '', description: '', manufacture: '', serial_number: '', part_number: '', qty: 1, condition: '', status: '', remarks: '' },
        ]);
    };

    const handleRemoveRow = (index) => {
        if (itemsState.length <= 1) return;
        setItemsState(prev => prev.filter((_, idx) => idx !== index));
    };

    // Save Form
    const handleSave = (e) => {
        if (e) e.preventDefault();
        if (!unitId) {
            alert('Silakan pilih unit referensi terlebih dahulu.');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'REQUEST-ASSET-DISPOSED',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date,
            smu: smu ? parseFloat(smu) : 0,
            service_type: 'DISPOSE',
            items: itemsState,
            results_data: resultsData,
            mechanic_name: resultsData.inspector_name || mechanicName,
            supervisor_name: resultsData.dept_head_rebuild || supervisorName,
            status: selectedForm?.status || 'COMPLETED',
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-request-asset-disposed/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Request Asset Disposed Form berhasil diperbarui.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/form-request-asset-disposed', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Request Asset Disposed Form berhasil disimpan.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Request Asset Disposed Form" />

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

                {/* Top Action Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xl font-bold">🗑️</span>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    REQUEST ASSET DISPOSED FORM
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Pengajuan Penghapusan / Disposal Komponen dan Aset Alat Berat Tambang
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
                            href={`/form-request-asset-disposed/blank-print${unitId ? `?unit_id=${unitId}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>📄</span> Blank Print
                        </a>

                        {selectedForm && (
                            <>
                                <a
                                    href={`/form-request-asset-disposed/${selectedForm.id}/print`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                                >
                                    <span>🖨️</span> Cetak Lembar
                                </a>
                                <a
                                    href={`/form-request-asset-disposed/download-pdf?id=${selectedForm.id}`}
                                    className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-700/20"
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
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document No *</label>
                        <input
                            type="text"
                            value={formNumber}
                            onChange={e => setFormNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Unit Referensi / Populasi *</label>
                        <select
                            value={unitId}
                            onChange={handleUnitChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500"
                        >
                            <option value="">-- Pilih Unit --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.code_unit} - {u.model} ({u.type_unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tanggal Pengajuan</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current SMU / HM</label>
                        <input
                            type="number"
                            step="any"
                            value={smu}
                            onChange={e => setSmu(e.target.value)}
                            placeholder="e.g. 12500"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500"
                        />
                    </div>
                </div>

                {/* Top 3-Section Grid: Reason of Dispose, Transferring Division, Recommended Method */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Reason of Dispose */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                            REASON OF DISPOSE
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { key: 'reason_stolen', label: 'Stolen' },
                                { key: 'reason_obsolete', label: 'Obsolete' },
                                { key: 'reason_damaged', label: 'Damaged' },
                                { key: 'reason_missing', label: 'Missing' },
                            ].map(item => (
                                <label key={item.key} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(resultsData[item.key])}
                                        onChange={e => setResultsData({ ...resultsData, [item.key]: e.target.checked })}
                                        className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="text-slate-400 text-[11px] block mb-1">Other (specify) :</label>
                            <input
                                type="text"
                                value={resultsData.reason_other || ''}
                                onChange={e => setResultsData({ ...resultsData, reason_other: e.target.value })}
                                placeholder="Alasan lainnya..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 text-[11px] block mb-1">Impairment (Specify) :</label>
                            <input
                                type="text"
                                value={resultsData.impairment_specify || ''}
                                onChange={e => setResultsData({ ...resultsData, impairment_specify: e.target.value })}
                                placeholder="Penurunan nilai fungsi / kerusakan..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                        </div>
                    </div>

                    {/* Transferring of Dispose Division */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                            TRANSFERRING OF DISPOSE DIVISION
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="text-slate-400 text-[11px] block mb-1">Name</label>
                                <input
                                    type="text"
                                    value={resultsData.transfer_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, transfer_name: e.target.value })}
                                    placeholder="Nama Pengaju"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block mb-1">Division</label>
                                <input
                                    type="text"
                                    value={resultsData.transfer_division || 'Plant Department'}
                                    onChange={e => setResultsData({ ...resultsData, transfer_division: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                            </div>
                        </div>
                        <div className="border border-slate-800 rounded-xl p-2.5 bg-slate-950/60 space-y-2 text-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Tanda Tangan Pengaju / Divisi</span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-500 text-[10px] block">Inspector</label>
                                    <input
                                        type="text"
                                        value={resultsData.inspector_name || ''}
                                        onChange={e => setResultsData({ ...resultsData, inspector_name: e.target.value })}
                                        placeholder="Nama Inspector"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-500 text-[10px] block">Dept. Head Rebuild</label>
                                    <input
                                        type="text"
                                        value={resultsData.dept_head_rebuild || ''}
                                        onChange={e => setResultsData({ ...resultsData, dept_head_rebuild: e.target.value })}
                                        placeholder="Dept Head Rebuild"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Dispose Method */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                            RECOMMENDED DISPOSE METHOD
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { key: 'method_auction', label: 'Auction' },
                                { key: 'method_tender', label: 'Tender' },
                                { key: 'method_traded', label: 'Traded' },
                                { key: 'method_missing', label: 'Missing' },
                                { key: 'method_donated', label: 'Donated' },
                                { key: 'method_destroyed', label: 'Destroyed' },
                            ].map(item => (
                                <label key={item.key} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(resultsData[item.key])}
                                        onChange={e => setResultsData({ ...resultsData, [item.key]: e.target.checked })}
                                        className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="pt-2">
                            <label className="text-slate-400 text-[11px] block mb-1">Others :</label>
                            <input
                                type="text"
                                value={resultsData.method_others || ''}
                                onChange={e => setResultsData({ ...resultsData, method_others: e.target.value })}
                                placeholder="Metode disposal lainnya..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Table: Component / Asset to Dispose */}
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>📦</span> DAFTAR KOMPONEN / ASET YANG DIAJUKAN DISPOSE
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                            <span>+</span> Tambah Baris
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-2 py-2 text-center w-10">No</th>
                                    <th className="px-2 py-2 w-28">Type unit</th>
                                    <th className="px-3 py-2 w-52">Description of component/asset</th>
                                    <th className="px-2 py-2 w-28">Manufacture</th>
                                    <th className="px-2 py-2 w-32">Serial number</th>
                                    <th className="px-2 py-2 w-32">Part Number</th>
                                    <th className="px-2 py-2 text-center w-14">QTY</th>
                                    <th className="px-2 py-2 w-24">Condition</th>
                                    <th className="px-2 py-2 w-24">Status</th>
                                    <th className="px-3 py-2">Remarks</th>
                                    <th className="px-2 py-2 text-center w-10">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {itemsState.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                                        <td className="px-2 py-1.5 text-center text-slate-500 font-bold">{idx + 1}</td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.type_unit || ''}
                                                onChange={e => handleItemChange(idx, 'type_unit', e.target.value)}
                                                placeholder="e.g. DT01"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <input
                                                type="text"
                                                value={item.description || ''}
                                                onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                                placeholder="Nama / Komponen Aset"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.manufacture || ''}
                                                onChange={e => handleItemChange(idx, 'manufacture', e.target.value)}
                                                placeholder="CAT / Komatsu"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.serial_number || ''}
                                                onChange={e => handleItemChange(idx, 'serial_number', e.target.value)}
                                                placeholder="S/N"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.part_number || ''}
                                                onChange={e => handleItemChange(idx, 'part_number', e.target.value)}
                                                placeholder="P/N"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.qty ?? 1}
                                                onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-xs text-center text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.condition || ''}
                                                onChange={e => handleItemChange(idx, 'condition', e.target.value)}
                                                placeholder="Scrap / Rusak"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="text"
                                                value={item.status || ''}
                                                onChange={e => handleItemChange(idx, 'status', e.target.value)}
                                                placeholder="Disposed"
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <input
                                                type="text"
                                                value={item.remarks || ''}
                                                onChange={e => handleItemChange(idx, 'remarks', e.target.value)}
                                                placeholder="Keterangan..."
                                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRow(idx)}
                                                className="text-slate-500 hover:text-rose-400 transition"
                                                title="Hapus baris"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Approval Lines Card */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <span>✍️</span> APPROVAL LINES (PERSETUJUAN BERJENJANG)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Plant Department */}
                        <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60 space-y-2.5">
                            <span className="font-bold text-indigo-400 block border-b border-slate-800 pb-1">PLANT DEPARTMENT</span>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Superintendent</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_superintendent || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_superintendent: e.target.value })}
                                        placeholder="Nama & Gelar"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_superintendent_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_superintendent_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Plant Manager</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_plant_manager || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_plant_manager: e.target.value })}
                                        placeholder="Nama & Gelar"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_plant_manager_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_plant_manager_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Project Manager</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_project_manager || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_project_manager: e.target.value })}
                                        placeholder="Nama & Gelar"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_project_manager_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_project_manager_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logistic & Executive */}
                        <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60 space-y-2.5">
                            <span className="font-bold text-amber-400 block border-b border-slate-800 pb-1">LOGISTIC DEPARTMENT &amp; EXECUTIVE</span>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Department Head (Logistic)</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_logistic_dept_head || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_logistic_dept_head: e.target.value })}
                                        placeholder="Nama Dept Head"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_logistic_dept_head_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_logistic_dept_head_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">General Manager</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_general_manager || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_general_manager: e.target.value })}
                                        placeholder="Nama GM"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_general_manager_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_general_manager_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block font-bold text-white">President Director</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={resultsData.approval_president_director || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_president_director: e.target.value })}
                                        placeholder="Nama Direktur Utama"
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="date"
                                        value={resultsData.approval_president_director_date || ''}
                                        onChange={e => setResultsData({ ...resultsData, approval_president_director_date: e.target.value })}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photo Evidence Card */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>📷</span> PHOTO OF DISPOSE COMPONENT / ASSET (*colour)
                        </h3>
                        <span className="text-[11px] text-slate-400">Tempelkan link foto atau unggah dokumentasi berwarna</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        {[
                            { key: 'photo_front', label: '*photo posisi depan' },
                            { key: 'photo_back', label: '*photo posisi belakang' },
                            { key: 'photo_side_1', label: '*photo posisi samping 1' },
                            { key: 'photo_side_2', label: '*photo posisi samping 2' },
                        ].map(ph => (
                            <div key={ph.key} className="space-y-1.5 border border-slate-800 rounded-xl p-3 bg-slate-950/60 text-center">
                                <span className="text-[11px] font-semibold text-slate-400 block">{ph.label}</span>
                                {resultsData[ph.key] ? (
                                    <div className="relative group">
                                        <img
                                            src={resultsData[ph.key]}
                                            alt={ph.label}
                                            className="w-full h-28 object-contain rounded-lg bg-black border border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setResultsData({ ...resultsData, [ph.key]: '' })}
                                            className="absolute top-1 right-1 bg-rose-600 text-white rounded p-1 text-[10px] opacity-0 group-hover:opacity-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-28 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-[11px]">
                                        Belum ada foto
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={resultsData[ph.key] || ''}
                                    onChange={e => setResultsData({ ...resultsData, [ph.key]: e.target.value })}
                                    placeholder="URL / Path Foto..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                />
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
                                    <span>🕒</span> Riwayat Request Asset Disposed
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
                                        Belum ada data pengajuan disposal aset yang tersimpan.
                                    </div>
                                ) : (
                                    recentForms.map(rf => (
                                        <div key={rf.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-white">
                                                    {rf.form_number} - {rf.unit?.code_unit || 'Tanpa Unit'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {rf.date} • {rf.items?.length || 0} Aset Diajukan
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/form-request-asset-disposed?id=${rf.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                                                >
                                                    Buka
                                                </Link>
                                                <a
                                                    href={`/form-request-asset-disposed/${rf.id}/print`}
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
