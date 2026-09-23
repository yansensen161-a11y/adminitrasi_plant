import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Printer,
    Download,
    Save,
    PlusCircle,
    History,
    CheckCircle2,
    Clock,
    Calendar,
    Sparkles,
    Check,
    X,
    Search,
    AlertCircle,
} from 'lucide-react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/WASH/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Meta
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [shift, setShift] = useState(selectedForm?.shift || 'DS');
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [supervisorName, setSupervisorName] = useState(selectedForm?.supervisor_name || '');
    const [status, setStatus] = useState(selectedForm?.status || 'COMPLETED');

    // Washing Timing & Location
    const [startTime, setStartTime] = useState(selectedForm?.results_data?.start_time || '08:00');
    const [endTime, setEndTime] = useState(selectedForm?.results_data?.end_time || '10:00');
    const [durationHours, setDurationHours] = useState(selectedForm?.results_data?.duration_hours ?? '2');
    const [durationMinutes, setDurationMinutes] = useState(selectedForm?.results_data?.duration_minutes ?? '0');
    const [washingLocation, setWashingLocation] = useState(selectedForm?.results_data?.washing_location || 'Washing Pad Site');
    const [petugasName, setPetugasName] = useState(selectedForm?.results_data?.petugas_name || selectedForm?.mechanic_name || '');

    // 25 Checklist Items
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items) && selectedForm.items.length > 0) {
            return selectedForm.items;
        }
        return defaultItems.map(item => ({
            ...item,
            status: item.status || '', // 'YA', 'TIDAK', 'NA'
            keterangan: item.keterangan || '',
        }));
    });

    // Section D: 5 Findings Rows
    const [findings, setFindings] = useState(() => {
        const saved = selectedForm?.results_data?.findings;
        if (Array.isArray(saved) && saved.length > 0) {
            const list = [...saved];
            while (list.length < 5) {
                list.push({ deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' });
            }
            return list;
        }
        return [
            { deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' },
            { deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' },
            { deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' },
            { deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' },
            { deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' },
        ];
    });

    // Final Status & Signatures
    const [finalStatus, setFinalStatus] = useState(selectedForm?.results_data?.final_status || 'SELESAI / BERSIH');
    const [dikerjakanOleh, setDikerjakanOleh] = useState(selectedForm?.results_data?.dikerjakan_oleh || petugasName);
    const [diperiksaOleh, setDiperiksaOleh] = useState(selectedForm?.results_data?.diperiksa_oleh || supervisorName);
    const [diserahkanKepada, setDiserahkanKepada] = useState(selectedForm?.results_data?.diserahkan_kepada || '');

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [toastMessage, setToastMessage] = useState(null);

    // Auto calculate duration in hours & minutes from startTime & endTime
    useEffect(() => {
        if (startTime && endTime) {
            const [h1, m1] = startTime.split(':').map(Number);
            const [h2, m2] = endTime.split(':').map(Number);
            if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
                let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diffMins < 0) diffMins += 24 * 60; // Crosses midnight
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                setDurationHours(hours.toString());
                setDurationMinutes(mins.toString());
            }
        }
    }, [startTime, endTime]);

    const selectedUnitObj = useMemo(() => {
        return units.find(u => String(u.id) === String(unitId));
    }, [units, unitId]);

    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            if (!smu && found.current_hm) setSmu(found.current_hm);
            if (found.lokasi && (!washingLocation || washingLocation === 'Washing Pad Site')) {
                setWashingLocation(`Washing Pad - ${found.lokasi}`);
            }
        }
    };

    // Toggle Checklist Status
    const handleStatusChange = (index, newStatus) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                status: copy[index].status === newStatus ? '' : newStatus,
            };
            return copy;
        });
    };

    const handleKeteranganChange = (index, val) => {
        setItemsState(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], keterangan: val };
            return copy;
        });
    };

    // Quick Action: Set all items to 'YA'
    const handleMarkAllYes = () => {
        setItemsState(prev => prev.map(it => ({ ...it, status: 'YA' })));
    };

    // Handle Findings Row Change
    const handleFindingChange = (index, field, value) => {
        setFindings(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    // Group items by Section
    const sectionA = itemsState.filter(i => (i.section || '').startsWith('A.'));
    const sectionB = itemsState.filter(i => (i.section || '').startsWith('B.'));
    const sectionC = itemsState.filter(i => (i.section || '').startsWith('C.'));

    // Save or Update Form
    const handleSave = () => {
        if (!unitId) {
            alert('Silakan pilih unit terlebih dahulu.');
            return;
        }

        setIsSaving(true);

        const payload = {
            form_type: 'WASHING-UNIT',
            form_number: formNumber,
            unit_id: unitId,
            date: date,
            shift: shift,
            smu: smu !== '' ? parseFloat(smu) : null,
            mechanic_name: petugasName || mechanicName,
            supervisor_name: diperiksaOleh || supervisorName,
            status: status,
            items: itemsState,
            results_data: {
                start_time: startTime,
                end_time: endTime,
                duration_hours: durationHours,
                duration_minutes: durationMinutes,
                washing_location: washingLocation,
                petugas_name: petugasName,
                findings: findings,
                final_status: finalStatus,
                dikerjakan_oleh: dikerjakanOleh || petugasName,
                diperiksa_oleh: diperiksaOleh || supervisorName,
                diserahkan_kepada: diserahkanKepada,
            },
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-washing-unit/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setToastMessage('Form Washing Unit berhasil diperbarui.');
                },
                onError: (err) => {
                    setIsSaving(false);
                    console.error(err);
                    alert('Gagal memperbarui formulir. Cek inputan Anda.');
                },
            });
        } else {
            router.post('/form-washing-unit', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setToastMessage('Form Washing Unit berhasil disimpan.');
                },
                onError: (err) => {
                    setIsSaving(false);
                    console.error(err);
                    alert('Gagal menyimpan formulir. Cek inputan Anda.');
                },
            });
        }
    };

    // Reset Form
    const handleReset = () => {
        if (confirm('Buka formulir kosong baru? Data yang belum disimpan akan hilang.')) {
            router.get('/form-washing-unit');
        }
    };

    // Web Print
    const handleOpenPrint = () => {
        if (selectedForm?.id) {
            window.open(`/form-washing-unit/${selectedForm.id}/print`, '_blank');
        } else {
            window.open(`/form-washing-unit/blank-print?unit_id=${unitId}`, '_blank');
        }
    };

    // DomPDF Download
    const handleDownloadPdf = () => {
        const query = selectedForm?.id 
            ? `id=${selectedForm.id}` 
            : `unit_id=${unitId}&form_number=${encodeURIComponent(formNumber)}&date=${date}&shift=${shift}&smu=${smu}`;
        window.open(`/form-washing-unit/download-pdf?${query}`, '_blank');
    };

    const filteredRecent = recentForms.filter(f => {
        if (!historySearch) return true;
        const q = historySearch.toLowerCase();
        return (
            (f.form_number && f.form_number.toLowerCase().includes(q)) ||
            (f.unit?.code_unit && f.unit.code_unit.toLowerCase().includes(q))
        );
    });

    return (
        <AuthenticatedLayout>
            <Head title="Form Washing Unit Tambang" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                {/* ─── TOAST NOTIFICATION ─── */}
                {toastMessage && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl shadow-lg animate-in fade-in">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-sm">{toastMessage}</span>
                        </div>
                        <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ─── TOP ACTION BAR ─── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-500/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Form Washing Unit Tambang
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Maintenance Plant | Heavy Equipment Cleaning Check Sheet
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            <History className="w-4 h-4 text-slate-500" />
                            <span>Riwayat ({recentForms.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            <PlusCircle className="w-4 h-4 text-emerald-500" />
                            <span>Form Baru</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleMarkAllYes}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                            title="Tandai semua item YA (Normal)"
                        >
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Semua YA</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenPrint}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Browser</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh PDF</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Menyimpan...' : (selectedForm ? 'Perbarui Form' : 'Simpan Form')}</span>
                        </button>
                    </div>
                </div>

                {/* ─── FORM CONTAINER ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">

                    {/* Metadata Header Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Kode Unit *
                            </label>
                            <select
                                value={unitId}
                                onChange={handleUnitChange}
                                className="w-full text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="">-- Pilih Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.code_unit} - {u.model || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Tanggal Washing *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Jenis / Model Unit
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={selectedUnitObj?.model || '-'}
                                className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Lokasi Washing
                            </label>
                            <input
                                type="text"
                                value={washingLocation}
                                onChange={(e) => setWashingLocation(e.target.value)}
                                placeholder="Washing Pad Pit A / Workshop"
                                className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                HM / KM *
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={smu}
                                onChange={(e) => setSmu(e.target.value)}
                                placeholder="HM Unit"
                                className="w-full text-xs font-mono font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Shift *
                            </label>
                            <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                                <option value="DS">DS (Day Shift / Siang)</option>
                                <option value="NS">NS (Night Shift / Malam)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Nama Petugas Washing *
                            </label>
                            <input
                                type="text"
                                value={petugasName}
                                onChange={(e) => {
                                    setPetugasName(e.target.value);
                                    setDikerjakanOleh(e.target.value);
                                }}
                                placeholder="Nama Washingman"
                                className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>

                        {/* Timing & Durasi Box */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Jam Selesai
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auto-Calculated Duration Banner */}
                    <div className="flex items-center justify-between px-4 py-2 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800 text-xs">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-600" />
                            <span className="font-bold text-cyan-900 dark:text-cyan-200">
                                Durasi Washing Terhitung:
                            </span>
                            <span className="font-black text-cyan-700 dark:text-cyan-300 text-sm">
                                {durationHours} Jam {durationMinutes} Menit
                            </span>
                        </div>
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 italic">
                            PETUNJUK: Beri tanda centang pada YA / TIDAK / N/A. Catat temuan pada kolom keterangan.
                        </span>
                    </div>

                    {/* ══════════════════ CHECKLIST SECTIONS (A, B, C) ══════════════════ */}
                    {[
                        { title: 'A. PEMERIKSAAN SEBELUM WASHING', items: sectionA },
                        { title: 'B. PELAKSANAAN WASHING', items: sectionB },
                        { title: 'C. INSPEKSI SETELAH WASHING', items: sectionC },
                    ].map((secGroup, gIdx) => (
                        <div key={gIdx} className="space-y-2">
                            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                {secGroup.title}
                            </div>

                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th className="py-2 px-2 text-center w-10">NO</th>
                                            <th className="py-2 px-3 text-left">ITEM PEMERIKSAAN / PEKERJAAN</th>
                                            <th className="py-2 px-2 text-center w-14">YA</th>
                                            <th className="py-2 px-2 text-center w-14">TIDAK</th>
                                            <th className="py-2 px-2 text-center w-14">N/A</th>
                                            <th className="py-2 px-3 text-left w-64">KETERANGAN / TEMUAN</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                        {secGroup.items.map((item) => {
                                            const itemGlobalIndex = itemsState.findIndex(it => it.id === item.id);
                                            const st = item.status ? item.status.toUpperCase() : '';
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                                    <td className="py-2 px-2 text-center font-bold text-slate-500">
                                                        {item.item_no}
                                                    </td>
                                                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                                                        {item.task}
                                                    </td>
                                                    <td className="py-1 px-1 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(itemGlobalIndex, 'YA')}
                                                            className={`w-7 h-7 rounded border font-bold flex items-center justify-center mx-auto transition ${
                                                                st === 'YA'
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-400'
                                                            }`}
                                                        >
                                                            {st === 'YA' ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                    <td className="py-1 px-1 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(itemGlobalIndex, 'TIDAK')}
                                                            className={`w-7 h-7 rounded border font-bold flex items-center justify-center mx-auto transition ${
                                                                st === 'TIDAK'
                                                                    ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                                                                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-400'
                                                            }`}
                                                        >
                                                            {st === 'TIDAK' ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                    <td className="py-1 px-1 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(itemGlobalIndex, 'NA')}
                                                            className={`w-7 h-7 rounded border font-bold flex items-center justify-center mx-auto transition ${
                                                                st === 'NA' || st === 'N/A'
                                                                    ? 'bg-slate-600 border-slate-600 text-white shadow-sm'
                                                                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-400'
                                                            }`}
                                                        >
                                                            {st === 'NA' || st === 'N/A' ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                    <td className="py-1 px-2">
                                                        <input
                                                            type="text"
                                                            value={item.keterangan || ''}
                                                            onChange={(e) => handleKeteranganChange(itemGlobalIndex, e.target.value)}
                                                            placeholder="Catatan temuan bila ada..."
                                                            className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {/* ══════════════════ D. TEMUAN / TINDAK LANJUT ══════════════════ */}
                    <div className="space-y-2">
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            D. TEMUAN / TINDAK LANJUT
                        </div>

                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="py-2 px-2 text-center w-10">NO</th>
                                        <th className="py-2 px-3 text-left w-1/4">DESKRIPSI TEMUAN</th>
                                        <th className="py-2 px-3 text-left w-1/5">LOKASI / KOMPONEN</th>
                                        <th className="py-2 px-3 text-left w-1/5">TINDAKAN</th>
                                        <th className="py-2 px-3 text-left w-1/6">NO. WO / PR TINDAK LANJUT</th>
                                        <th className="py-2 px-3 text-left w-1/6">PIC / TARGET</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {findings.map((f, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="text"
                                                    value={f.deskripsi}
                                                    onChange={(e) => handleFindingChange(idx, 'deskripsi', e.target.value)}
                                                    placeholder="Deskripsi..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="text"
                                                    value={f.lokasi}
                                                    onChange={(e) => handleFindingChange(idx, 'lokasi', e.target.value)}
                                                    placeholder="Area / part..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="text"
                                                    value={f.tindakan}
                                                    onChange={(e) => handleFindingChange(idx, 'tindakan', e.target.value)}
                                                    placeholder="Tindakan..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="text"
                                                    value={f.no_wo_pr}
                                                    onChange={(e) => handleFindingChange(idx, 'no_wo_pr', e.target.value)}
                                                    placeholder="WO/PR #..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="text"
                                                    value={f.pic_target}
                                                    onChange={(e) => handleFindingChange(idx, 'pic_target', e.target.value)}
                                                    placeholder="PIC / Tgl..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ══════════════════ STATUS AKHIR & SIGNATURES ══════════════════ */}
                    <div className="space-y-4 pt-2">
                        {/* Status Akhir Box */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                STATUS AKHIR:
                            </span>
                            <div className="flex flex-wrap items-center gap-4">
                                {[
                                    'SELESAI / BERSIH',
                                    'PERLU WASHING ULANG',
                                    'PERLU TINDAK LANJUT'
                                ].map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none text-xs font-bold transition ${
                                            finalStatus === opt
                                                ? 'bg-cyan-600 border-cyan-600 text-white'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="final_status"
                                            value={opt}
                                            checked={finalStatus === opt}
                                            onChange={(e) => setFinalStatus(e.target.value)}
                                            className="hidden"
                                        />
                                        <span>{finalStatus === opt ? '✓' : '☐'}</span>
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Signatures Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    Dikerjakan oleh (Washingman):
                                </label>
                                <input
                                    type="text"
                                    value={dikerjakanOleh}
                                    onChange={(e) => setDikerjakanOleh(e.target.value)}
                                    placeholder="Nama Washingman"
                                    className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                />
                                <div className="text-[10px] text-slate-400">( Nama / TTD )</div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    Diperiksa oleh (Inspector / Foreman):
                                </label>
                                <input
                                    type="text"
                                    value={diperiksaOleh}
                                    onChange={(e) => setDiperiksaOleh(e.target.value)}
                                    placeholder="Nama Foreman / Inspector"
                                    className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                />
                                <div className="text-[10px] text-slate-400">( Nama / TTD )</div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    Diserahkan kepada (Mekanik / User):
                                </label>
                                <input
                                    type="text"
                                    value={diserahkanKepada}
                                    onChange={(e) => setDiserahkanKepada(e.target.value)}
                                    placeholder="Nama Mekanik / User Plant"
                                    className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                />
                                <div className="text-[10px] text-slate-400">( Nama / TTD )</div>
                            </div>
                        </div>

                        {/* SOP Safety Note */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-800 dark:text-amber-300">
                            <strong>CATATAN:</strong> Ikuti SOP site dan manual OEM; hindari semprotan bertekanan tinggi ke konektor listrik, intake, breather, dan seal.
                        </div>
                    </div>

                </div>

            </div>

            {/* ─── RIWAYAT MODAL ─── */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[85vh] flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-cyan-600" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                    Riwayat Form Washing Unit
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    placeholder="Cari nomor form atau kode unit..."
                                    className="w-full pl-9 text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                            {filteredRecent.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    Tidak ada data form washing unit.
                                </div>
                            ) : (
                                filteredRecent.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 transition gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                                                    {f.form_number}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    Unit: {f.unit?.code_unit || '-'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {f.date ? f.date.substring(0, 10) : ''}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500">
                                                    Shift: {f.shift}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Status: <span className="font-bold text-slate-700 dark:text-slate-200">{f.results_data?.final_status || 'SELESAI / BERSIH'}</span> | Petugas: {f.mechanic_name || '-'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowHistoryModal(false);
                                                    router.get(`/form-washing-unit?id=${f.id}`);
                                                }}
                                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition"
                                            >
                                                Buka
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => window.open(`/form-washing-unit/${f.id}/print`, '_blank')}
                                                className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                                            >
                                                Print
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => window.open(`/form-washing-unit/download-pdf?id=${f.id}`, '_blank')}
                                                className="px-2 py-1 text-xs rounded-lg border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition"
                                            >
                                                PDF
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`Hapus form ${f.form_number}?`)) {
                                                        router.delete(`/form-washing-unit/${f.id}`);
                                                    }
                                                }}
                                                className="px-2 py-1 text-xs rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                            >
                                                Hapus
                                            </button>
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
