import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'MEMO/PLT/2026/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || 'PT Mitra Abadi Mahakam');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));

    // Specialized Results Data (Letter Text, Recipients, Purpose, Signatures)
    const [resultsData, setResultsData] = useState(selectedForm?.results_data || {
        perihal: 'Permohonan Permintaan Parts / Komponen',
        recipient_name: 'Bpk. Slamet / Bpk. Subani',
        recipient_company: 'PT MAM Site BBE',
        site_pemohon: 'Site Harindo wahana',
        site_tujuan: 'Site BBE',
        kerusakan_komponen: 'Cyl Arm',
        purpose_reason: 'Part bekas tersebut akan digunakan untuk mendukung operasional unit ME056 yang saat ini mengalami kerusakan pada Cyl Arm',
        
        // Approval Signatures
        sig_maker_name: 'Yansen',
        sig_maker_role: 'Planner',
        sig_supt_mam_name: 'Ambo Mai',
        sig_supt_mam_role: 'Superintendent Plant',
        sig_pm_name: 'Supardi Halim',
        sig_pm_role: 'Project Manager',
        sig_supt_source_name: 'Slamet Nur arif',
        sig_supt_source_role: 'Superintendent Plant',
        sig_pjo_source_name: 'Subani',
        sig_pjo_source_role: 'PJO',
        sig_mgr_plant_name: 'Dadang Prayogo',
        sig_mgr_plant_role: 'Manager Plant & Asset',
        sig_mgr_ops_name: 'Lili Romli',
        sig_mgr_ops_role: 'Operation Manager',
    });

    // Component Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.length > 0 ? defaultItems : [
            {
                id: 1,
                component_name: 'GAUGE PRESSURE SENSOR',
                part_number: '661-9873',
                unit_request: 'CAT 374 – ME056',
                unit_source: '395 -',
                qty: 1,
                condition: 'Part Bekas',
                remarks: '',
            },
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
            const unitLabel = `${found.model || ''} – ${found.code_unit || ''}`.trim();
            // Update unit_request on the first item if not set
            setItemsState(prev => prev.map((item, idx) => (idx === 0 && !item.unit_request) ? { ...item, unit_request: unitLabel } : item));
            setResultsData(prev => ({
                ...prev,
                purpose_reason: `Part bekas tersebut akan digunakan untuk mendukung operasional unit ${found.code_unit} yang saat ini mengalami kerusakan pada ${prev.kerusakan_komponen || 'Cyl Arm'}`,
            }));
        }
    };

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
            {
                id: prev.length + 1,
                component_name: '',
                part_number: '',
                unit_request: '',
                unit_source: '',
                qty: 1,
                condition: 'Part Bekas',
                remarks: '',
            },
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
            alert('Silakan pilih unit pemohon terlebih dahulu.');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'SURAT-PERMINTAAN-KOMPONEN',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date,
            smu: 0,
            service_type: 'INTERNAL-MEMO',
            items: itemsState,
            results_data: resultsData,
            mechanic_name: resultsData.sig_maker_name || 'Yansen',
            supervisor_name: resultsData.sig_supt_mam_name || 'Ambo Mai',
            status: selectedForm?.status || 'COMPLETED',
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-surat-permintaan-komponen/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Surat Permintaan Komponen berhasil diperbarui.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/form-surat-permintaan-komponen', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Surat Permintaan Komponen berhasil disimpan.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    // Download PDF with current form data
    const handleDownloadPdf = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/form-surat-permintaan-komponen/download-pdf';
        form.target = '_blank';

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const fields = {
            _token: csrfToken || '',
            id: selectedForm?.id || '',
            unit_id: unitId || '',
            form_number: formNumber || '',
            date: date || '',
            smu: 0,
            mechanic_name: resultsData.sig_maker_name || '',
            supervisor_name: resultsData.sig_supt_mam_name || '',
            items: JSON.stringify(itemsState),
            results_data: JSON.stringify(resultsData),
        };

        for (const [key, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Surat Permintaan Komponen" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
                
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
                            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xl font-bold">✉️</span>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    INTERNAL MEMORANDUM / SURAT PERMINTAAN KOMPONEN
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Permohonan &amp; Transfer Parts/Komponen Bekas Antar Site Operasional
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
                            href={`/form-surat-permintaan-komponen/blank-print${unitId ? `?unit_id=${unitId}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>📄</span> Blank Print
                        </a>

                        {selectedForm && (
                            <a
                                href={`/form-surat-permintaan-komponen/${selectedForm.id}/print`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                            >
                                <span>🖨️</span> Cetak Memo
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                        >
                            <span>📥</span> Unduh PDF
                        </button>

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
                                    <span>💾</span> {selectedForm ? 'Perbarui Memo' : 'Simpan Memo'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Surat Information Card */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span>📋</span> DATA SURAT &amp; PIHAK TERKAIT
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Tanggal Surat</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Perihal</label>
                            <input
                                type="text"
                                value={resultsData.perihal || ''}
                                onChange={e => setResultsData({ ...resultsData, perihal: e.target.value })}
                                placeholder="Permohonan Permintaan Parts / Komponen"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Unit Pemohon (Target Perbaikan) *</label>
                            <select
                                value={unitId}
                                onChange={handleUnitChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            >
                                <option value="">-- Pilih Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.code_unit} - {u.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Kepada Yth. (Nama Penerima)</label>
                            <input
                                type="text"
                                value={resultsData.recipient_name || ''}
                                onChange={e => setResultsData({ ...resultsData, recipient_name: e.target.value })}
                                placeholder="Bpk. Slamet / Bpk. Subani"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Site / Instansi Penerima</label>
                            <input
                                type="text"
                                value={resultsData.recipient_company || ''}
                                onChange={e => setResultsData({ ...resultsData, recipient_company: e.target.value })}
                                placeholder="PT MAM Site BBE"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1">Lokasi Kerja / Site Pemohon</label>
                            <input
                                type="text"
                                value={resultsData.site_pemohon || ''}
                                onChange={e => setResultsData({ ...resultsData, site_pemohon: e.target.value })}
                                placeholder="Site Harindo wahana"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Component Items Card */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>🔩</span> RINCIAN KOMPONEN YANG DIMINTA
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                            <span>+</span> Tambah Komponen
                        </button>
                    </div>

                    <div className="space-y-3">
                        {itemsState.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                    <span>Komponen #{idx + 1}</span>
                                    {itemsState.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(idx)}
                                            className="text-rose-400 hover:text-rose-300 text-xs"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                    <div className="md:col-span-2">
                                        <label className="block text-slate-400 text-[11px] mb-1">Nama Komponen</label>
                                        <input
                                            type="text"
                                            value={item.component_name || ''}
                                            onChange={e => handleItemChange(idx, 'component_name', e.target.value)}
                                            placeholder="GAUGE PRESSURE SENSOR"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">Part Number</label>
                                        <input
                                            type="text"
                                            value={item.part_number || ''}
                                            onChange={e => handleItemChange(idx, 'part_number', e.target.value)}
                                            placeholder="661-9873"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">Jumlah (QTY)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.qty ?? 1}
                                            onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">Unit Request</label>
                                        <select
                                            value={item.unit_request || ''}
                                            onChange={e => handleItemChange(idx, 'unit_request', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                        >
                                            <option value="">-- Pilih Unit --</option>
                                            {item.unit_request && !units.some(u => `${u.model || ''} – ${u.code_unit || ''}`.trim() === item.unit_request || u.code_unit === item.unit_request) && (
                                                <option value={item.unit_request}>{item.unit_request}</option>
                                            )}
                                            {units.map(u => (
                                                <option key={u.id} value={`${u.model || ''} – ${u.code_unit || ''}`.trim()}>
                                                    {u.code_unit} - {u.model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">Unit Sumber</label>
                                        <input
                                            type="text"
                                            value={item.unit_source || ''}
                                            onChange={e => handleItemChange(idx, 'unit_source', e.target.value)}
                                            placeholder="395 -"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-slate-400 text-[11px] mb-1">Kondisi / Tipe Permintaan</label>
                                        <input
                                            type="text"
                                            value={item.condition || 'Part Bekas'}
                                            onChange={e => handleItemChange(idx, 'condition', e.target.value)}
                                            placeholder="Part Bekas / Kanibal / Baru"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Purpose & Breakdown Information */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span>⚠️</span> TUJUAN &amp; KERUSAKAN OPERASIONAL
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block text-slate-400 text-[11px] mb-1">Komponen yang Rusak pada Unit</label>
                            <input
                                type="text"
                                value={resultsData.kerusakan_komponen || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setResultsData({
                                        ...resultsData,
                                        kerusakan_komponen: val,
                                        purpose_reason: `Part bekas tersebut akan digunakan untuk mendukung operasional unit ${selectedUnitObj?.code_unit || 'ME056'} yang saat ini mengalami kerusakan pada ${val}`,
                                    });
                                }}
                                placeholder="Cyl Arm"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-[11px] mb-1">Teks Kalimat Tujuan (Tampil pada Surat)</label>
                            <textarea
                                rows="2"
                                value={resultsData.purpose_reason || ''}
                                onChange={e => setResultsData({ ...resultsData, purpose_reason: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Signatures / Approval Hierarchy (3 Rows) */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span>✍️</span> LEMBAR PERSETUJUAN (3 TINGKAT)
                    </h3>

                    {/* Row 1: Site Pemohon */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide block">
                            Tingkat 1: Tim Site Pemohon
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                                <label className="text-slate-400 text-[10px] block">Dibuat Oleh (Planner)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_maker_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_maker_name: e.target.value })}
                                    placeholder="Yansen"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[10px] block">Disetujui Oleh (Superintendent Plant)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_supt_mam_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_supt_mam_name: e.target.value })}
                                    placeholder="Ambo Mai"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[10px] block">Diketahui Oleh (Project Manager)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_pm_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_pm_name: e.target.value })}
                                    placeholder="Supardi Halim"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Site Sumber */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                            Tingkat 2: Tim Site Sumber (Penyedia Komponen)
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="text-slate-400 text-[10px] block">Disetujui Oleh (Superintendent Plant Sumber)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_supt_source_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_supt_source_name: e.target.value })}
                                    placeholder="Slamet Nur arif"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[10px] block">Disetujui Oleh (PJO Site Sumber)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_pjo_source_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_pjo_source_name: e.target.value })}
                                    placeholder="Subani"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Management Pusat */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                            Tingkat 3: Manajemen Kantor Pusat / Aset
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="text-slate-400 text-[10px] block">Disetujui Oleh (Manager Plant &amp; Asset)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_mgr_plant_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_mgr_plant_name: e.target.value })}
                                    placeholder="Dadang Prayogo"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[10px] block">Disetujui Oleh (Operation Manager)</label>
                                <input
                                    type="text"
                                    value={resultsData.sig_mgr_ops_name || ''}
                                    onChange={e => setResultsData({ ...resultsData, sig_mgr_ops_name: e.target.value })}
                                    placeholder="Lili Romli"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Modal */}
                {showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>🕒</span> Riwayat Surat Permintaan Komponen
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
                                        Belum ada memo permintaan komponen yang tersimpan.
                                    </div>
                                ) : (
                                    recentForms.map(rf => (
                                        <div key={rf.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-white">
                                                    {rf.form_number} - {rf.unit?.code_unit || 'Tanpa Unit'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {rf.date} • {rf.items?.[0]?.component_name || 'Komponen'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/form-surat-permintaan-komponen?id=${rf.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold"
                                                >
                                                    Buka
                                                </Link>
                                                <a
                                                    href={`/form-surat-permintaan-komponen/${rf.id}/print`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                                >
                                                    Cetak
                                                </a>
                                                <a
                                                    href={`/form-surat-permintaan-komponen/download-pdf?id=${rf.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1"
                                                >
                                                    <span>📥</span> PDF
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
