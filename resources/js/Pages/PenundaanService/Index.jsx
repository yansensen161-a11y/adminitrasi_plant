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
    AlertTriangle, 
    Clock, 
    Calendar, 
    Truck, 
    ShieldAlert, 
    FileText, 
    UserCheck,
    Search,
    X,
    CheckSquare,
    Square
} from 'lucide-react';

export default function Index({
    units = [],
    alasanOptions = [],
    defaultApprovals = [],
    suggestedFormNumber = 'PLT/FRM/PND/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Number
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [serviceType, setServiceType] = useState(selectedForm?.service_type || 'PS 250');
    const [notes, setNotes] = useState(selectedForm?.notes || '');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [status, setStatus] = useState(selectedForm?.status || 'COMPLETED');

    // Section 01: Identitas Unit
    const [identitas, setIdentitas] = useState(() => {
        const initial = selectedForm?.results_data?.identitas || {};
        return {
            kode_unit: initial.kode_unit || '',
            jenis_model: initial.jenis_model || '',
            lokasi_unit: initial.lokasi_unit || '',
            interval_service: initial.interval_service || '250',
            pengaju: initial.pengaju || selectedForm?.mechanic_name || '',
        };
    });

    // Section 02: Detail Penundaan Service
    const [detail, setDetail] = useState(() => {
        const initial = selectedForm?.results_data?.detail_penundaan || {};
        return {
            tgl_service_awal: initial.tgl_service_awal || '',
            tgl_service_pengganti: initial.tgl_service_pengganti || '',
            hm_rencana_service: initial.hm_rencana_service ?? '',
            estimasi_hm_pengganti: initial.estimasi_hm_pengganti ?? '',
            hm_saat_penundaan: initial.hm_saat_penundaan ?? (selectedForm?.smu ?? ''),
            durasi_penundaan: initial.durasi_penundaan ?? '',
            overdue_saat_penundaan: initial.overdue_saat_penundaan ?? '',
            proyeksi_overdue: initial.proyeksi_overdue ?? '',
        };
    });

    // Section 03: Alasan Penundaan (Array of checked reasons)
    const [selectedReasons, setSelectedReasons] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return [];
    });
    const [alasanLainnya, setAlasanLainnya] = useState(selectedForm?.results_data?.alasan_lainnya || '');

    // Section 04: Mitigasi Risiko & Tindak Lanjut
    const [mitigasi, setMitigasi] = useState(() => {
        const initial = selectedForm?.results_data?.mitigasi_risiko || {};
        return {
            batas_toleransi_hm: initial.batas_toleransi_hm || '+50 HM (+10% interval OEM)',
            pemeriksaan_kondisi: initial.pemeriksaan_kondisi || 'P2H harian intensif, cek level fluida dan indikator bypass',
            rencana_monitoring: initial.rencana_monitoring || 'Monitoring harian oleh pengawas & mekanik shift',
            tindak_lanjut_pic: initial.tindak_lanjut_pic || '',
        };
    });

    // Section 05: Persetujuan (Approvals)
    const [approvals, setApprovals] = useState(() => {
        const initial = selectedForm?.results_data?.approvals;
        if (initial && Array.isArray(initial) && initial.length > 0) {
            return initial;
        }
        return defaultApprovals.map(appr => ({
            ...appr,
            nama: appr.nama || '',
            tanggal: appr.tanggal || new Date().toISOString().substring(0, 10),
            tanda_tangan: appr.tanda_tangan || '',
            keputusan: appr.keputusan || 'DISETUJUI',
        }));
    });

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [toastMessage, setToastMessage] = useState(null);

    // Auto-fill unit details
    const selectedUnitObj = useMemo(() => {
        return units.find(u => String(u.id) === String(unitId));
    }, [units, unitId]);

    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found) {
            const currentHm = found.current_hm ?? '';
            if (!smu) setSmu(currentHm);
            setIdentitas(prev => ({
                ...prev,
                kode_unit: found.code_unit || '',
                jenis_model: found.model || '',
                lokasi_unit: found.lokasi || '',
            }));
            setDetail(prev => ({
                ...prev,
                hm_saat_penundaan: prev.hm_saat_penundaan || currentHm,
            }));
        }
    };

    // Auto-calculate Durasi Penundaan (Hari)
    useEffect(() => {
        if (detail.tgl_service_awal && detail.tgl_service_pengganti) {
            const date1 = new Date(detail.tgl_service_awal);
            const date2 = new Date(detail.tgl_service_pengganti);
            const diffTime = date2.getTime() - date1.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (!isNaN(diffDays)) {
                setDetail(prev => ({ ...prev, durasi_penundaan: diffDays >= 0 ? diffDays : 0 }));
            }
        }
    }, [detail.tgl_service_awal, detail.tgl_service_pengganti]);

    // Auto-calculate Overdue Saat Penundaan & Proyeksi Overdue
    useEffect(() => {
        const hmRencana = parseFloat(detail.hm_rencana_service);
        const hmSaat = parseFloat(detail.hm_saat_penundaan);
        const hmPengganti = parseFloat(detail.estimasi_hm_pengganti);

        let overdueSaat = '';
        if (!isNaN(hmSaat) && !isNaN(hmRencana)) {
            overdueSaat = Math.max(0, hmSaat - hmRencana).toFixed(1);
        }

        let proyeksi = '';
        if (!isNaN(hmPengganti) && !isNaN(hmRencana)) {
            proyeksi = Math.max(0, hmPengganti - hmRencana).toFixed(1);
        }

        setDetail(prev => ({
            ...prev,
            overdue_saat_penundaan: overdueSaat,
            proyeksi_overdue: proyeksi,
        }));
    }, [detail.hm_rencana_service, detail.hm_saat_penundaan, detail.estimasi_hm_pengganti]);

    // Toggle Reason
    const toggleReason = (reasonText) => {
        setSelectedReasons(prev => {
            if (prev.includes(reasonText)) {
                return prev.filter(r => r !== reasonText);
            } else {
                return [...prev, reasonText];
            }
        });
    };

    // Handle Approval change
    const handleApprovalChange = (index, field, value) => {
        setApprovals(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Save or Update Form
    const handleSave = () => {
        if (!unitId) {
            alert('Silakan pilih unit terlebih dahulu.');
            return;
        }

        setIsSaving(true);

        const payload = {
            form_type: 'PENUNDAAN-SERVICE',
            form_number: formNumber,
            unit_id: unitId,
            date: date,
            smu: smu !== '' ? parseFloat(smu) : null,
            service_type: serviceType,
            notes: notes,
            mechanic_name: identitas.pengaju || mechanicName,
            status: status,
            items: selectedReasons,
            results_data: {
                identitas: {
                    ...identitas,
                    kode_unit: selectedUnitObj?.code_unit || identitas.kode_unit,
                    jenis_model: selectedUnitObj?.model || identitas.jenis_model,
                    lokasi_unit: selectedUnitObj?.lokasi || identitas.lokasi_unit,
                },
                detail_penundaan: detail,
                alasan_lainnya: alasanLainnya,
                mitigasi_risiko: mitigasi,
                approvals: approvals,
            },
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-penundaan-service/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setToastMessage('Form Penundaan Service berhasil diperbarui.');
                },
                onError: (err) => {
                    setIsSaving(false);
                    console.error(err);
                    alert('Gagal memperbarui formulir. Cek inputan Anda.');
                },
            });
        } else {
            router.post('/form-penundaan-service', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setToastMessage('Form Penundaan Service berhasil disimpan.');
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
            router.get('/form-penundaan-service');
        }
    };

    // Open Web Print
    const handleOpenPrint = () => {
        if (selectedForm?.id) {
            window.open(`/form-penundaan-service/${selectedForm.id}/print`, '_blank');
        } else {
            window.open(`/form-penundaan-service/blank-print?unit_id=${unitId}`, '_blank');
        }
    };

    // Download DomPDF
    const handleDownloadPdf = () => {
        const query = selectedForm?.id ? `id=${selectedForm.id}` : `unit_id=${unitId}&form_number=${encodeURIComponent(formNumber)}&date=${date}&service_type=${encodeURIComponent(serviceType)}&smu=${smu}`;
        window.open(`/form-penundaan-service/download-pdf?${query}`, '_blank');
    };

    const filteredRecent = recentForms.filter(f => {
        if (!historySearch) return true;
        const q = historySearch.toLowerCase();
        return (
            (f.form_number && f.form_number.toLowerCase().includes(q)) ||
            (f.unit?.code_unit && f.unit.code_unit.toLowerCase().includes(q)) ||
            (f.notes && f.notes.toLowerCase().includes(q))
        );
    });

    return (
        <AuthenticatedLayout>
            <Head title="Form Penundaan Service Unit Tambang" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                
                {/* ─── TOAST NOTIFICATION ─── */}
                {toastMessage && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
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
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Form Penundaan Service Unit
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    Service Postponement Form | Maintenance Plant &amp; OEM Risk Mitigation
                                </p>
                            </div>
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
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Menyimpan...' : (selectedForm ? 'Perbarui Form' : 'Simpan Form')}</span>
                        </button>
                    </div>
                </div>

                {/* ─── FORM CONTAINER ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                    
                    {/* Header Info Banner */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nomor Form:</span>
                            <input
                                type="text"
                                value={formNumber}
                                onChange={(e) => setFormNumber(e.target.value)}
                                className="text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-100 w-52"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Form:</span>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-100"
                            >
                                <option value="DRAFT">DRAFT</option>
                                <option value="COMPLETED">SELESAI (COMPLETED)</option>
                                <option value="APPROVED">DISETUJUI (APPROVED)</option>
                            </select>
                        </div>
                    </div>

                    {/* ══════════════════ 01 IDENTITAS UNIT ══════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                01
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                IDENTITAS UNIT
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Tanggal Pengajuan *
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
                                    Pilih Kode Unit *
                                </label>
                                <select
                                    value={unitId}
                                    onChange={handleUnitChange}
                                    className="w-full text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.code_unit} - {u.model || 'Unknown'} ({u.lokasi || 'Site'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Jenis / Model Unit
                                </label>
                                <input
                                    type="text"
                                    value={selectedUnitObj?.model || identitas.jenis_model}
                                    onChange={(e) => setIdentitas({ ...identitas, jenis_model: e.target.value })}
                                    placeholder="Contoh: CAT 773E, DT FM260"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Lokasi Unit
                                </label>
                                <input
                                    type="text"
                                    value={selectedUnitObj?.lokasi || identitas.lokasi_unit}
                                    onChange={(e) => setIdentitas({ ...identitas, lokasi_unit: e.target.value })}
                                    placeholder="Lokasi pit / workshop"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    HM Aktual Saat Ini *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={smu}
                                    onChange={(e) => {
                                        setSmu(e.target.value);
                                        setDetail(prev => ({ ...prev, hm_saat_penundaan: e.target.value }));
                                    }}
                                    placeholder="HM Unit"
                                    className="w-full text-xs font-mono font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Jenis Service Ditunda *
                                </label>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                >
                                    <option value="PS 250">PS 250 (PM A)</option>
                                    <option value="PS 500">PS 500 (PM B)</option>
                                    <option value="PS 1000">PS 1000 (PM C)</option>
                                    <option value="PS 2000">PS 2000 (PM D)</option>
                                    <option value="PS 4000">PS 4000 (PM E)</option>
                                    <option value="General Service">General Service</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Interval Service (HM)
                                </label>
                                <input
                                    type="number"
                                    value={identitas.interval_service}
                                    onChange={(e) => setIdentitas({ ...identitas, interval_service: e.target.value })}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Nama Pengaju *
                                </label>
                                <input
                                    type="text"
                                    value={identitas.pengaju || mechanicName}
                                    onChange={(e) => {
                                        setIdentitas({ ...identitas, pengaju: e.target.value });
                                        setMechanicName(e.target.value);
                                    }}
                                    placeholder="Nama PIC Pengaju"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════ 02 DETAIL PENUNDAAN SERVICE ══════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                02
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                DETAIL PENUNDAAN SERVICE &amp; KALKULASI OVERDUE
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Tanggal Service Awal
                                </label>
                                <input
                                    type="date"
                                    value={detail.tgl_service_awal}
                                    onChange={(e) => setDetail({ ...detail, tgl_service_awal: e.target.value })}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Tanggal Service Pengganti
                                </label>
                                <input
                                    type="date"
                                    value={detail.tgl_service_pengganti}
                                    onChange={(e) => setDetail({ ...detail, tgl_service_pengganti: e.target.value })}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    HM Rencana Service (Target)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={detail.hm_rencana_service}
                                    onChange={(e) => setDetail({ ...detail, hm_rencana_service: e.target.value })}
                                    placeholder="Misal 2500"
                                    className="w-full text-xs font-mono rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Estimasi HM Pengganti
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={detail.estimasi_hm_pengganti}
                                    onChange={(e) => setDetail({ ...detail, estimasi_hm_pengganti: e.target.value })}
                                    placeholder="Misal 2540"
                                    className="w-full text-xs font-mono rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    HM Saat Penundaan
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={detail.hm_saat_penundaan}
                                    onChange={(e) => setDetail({ ...detail, hm_saat_penundaan: e.target.value })}
                                    className="w-full text-xs font-mono rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            {/* Auto-Calculated Durasi */}
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
                                <span className="block text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400">
                                    Durasi Penundaan:
                                </span>
                                <div className="text-lg font-black text-amber-900 dark:text-amber-200">
                                    {detail.durasi_penundaan !== '' ? detail.durasi_penundaan : '0'} Hari
                                </div>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400">Dihitung dari selisih tanggal</span>
                            </div>

                            {/* Auto-Calculated Overdue Saat Penundaan */}
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60">
                                <span className="block text-[11px] font-bold uppercase text-rose-700 dark:text-rose-400">
                                    Overdue Saat Penundaan:
                                </span>
                                <div className="text-lg font-black text-rose-900 dark:text-rose-200">
                                    {detail.overdue_saat_penundaan !== '' ? `${detail.overdue_saat_penundaan} HM` : '0 HM'}
                                </div>
                                <span className="text-[10px] text-rose-600 dark:text-rose-400">HM Saat - HM Rencana</span>
                            </div>

                            {/* Auto-Calculated Proyeksi Overdue */}
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                                <span className="block text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400">
                                    Proyeksi Overdue:
                                </span>
                                <div className="text-lg font-black text-indigo-900 dark:text-indigo-200">
                                    {detail.proyeksi_overdue !== '' ? `${detail.proyeksi_overdue} HM` : '0 HM'}
                                </div>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Estimasi HM - HM Rencana</span>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════ 03 ALASAN PENUNDAAN ══════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                03
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                ALASAN PENUNDAAN (Beri tanda centang ✓)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {alasanOptions.map((reason, idx) => {
                                const isChecked = selectedReasons.includes(reason);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleReason(reason)}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                                            isChecked 
                                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm' 
                                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="mt-0.5">
                                            {isChecked ? (
                                                <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold leading-snug">
                                            {reason}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input custom "Lainnya" jika dicentang atau diisi */}
                        {(selectedReasons.includes('Lainnya') || alasanLainnya) && (
                            <div className="mb-4 animate-in fade-in">
                                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                    Keterangan Alasan Lainnya:
                                </label>
                                <input
                                    type="text"
                                    value={alasanLainnya}
                                    onChange={(e) => setAlasanLainnya(e.target.value)}
                                    placeholder="Tuliskan alasan lainnya..."
                                    className="w-full text-xs rounded-xl border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
                                />
                            </div>
                        )}

                        {/* Keterangan / Justifikasi */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Keterangan / Justifikasi Teknis *
                            </label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Jelaskan secara detail justifikasi penundaan service ini, kondisi unit saat ini, serta kesiapan unit dan part..."
                                className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* ══════════════════ 04 MITIGASI RISIKO DAN TINDAK LANJUT ══════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                04
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                MITIGASI RISIKO DAN TINDAK LANJUT
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Batas Toleransi HM (OEM)
                                </label>
                                <input
                                    type="text"
                                    value={mitigasi.batas_toleransi_hm}
                                    onChange={(e) => setMitigasi({ ...mitigasi, batas_toleransi_hm: e.target.value })}
                                    placeholder="Contoh: Maksimal +50 Jam dari interval"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Pemeriksaan Kondisi Unit
                                </label>
                                <input
                                    type="text"
                                    value={mitigasi.pemeriksaan_kondisi}
                                    onChange={(e) => setMitigasi({ ...mitigasi, pemeriksaan_kondisi: e.target.value })}
                                    placeholder="Kondisi visual, oli, fluida, warning lamp"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Rencana Monitoring Harian
                                </label>
                                <input
                                    type="text"
                                    value={mitigasi.rencana_monitoring}
                                    onChange={(e) => setMitigasi({ ...mitigasi, rencana_monitoring: e.target.value })}
                                    placeholder="Monitoring tiap shift oleh Pengawas / Mekanik"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Tindak Lanjut / PIC
                                </label>
                                <input
                                    type="text"
                                    value={mitigasi.tindak_lanjut_pic}
                                    onChange={(e) => setMitigasi({ ...mitigasi, tindak_lanjut_pic: e.target.value })}
                                    placeholder="Nama PIC Mekanik / Leader pelaksana"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════ 05 PERSETUJUAN ══════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                05
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                PERSETUJUAN (4 JABATAN)
                            </h2>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-200">
                                    <tr>
                                        <th className="py-2.5 px-3 text-left w-1/4">Jabatan</th>
                                        <th className="py-2.5 px-3 text-left w-1/4">Nama Pejabat</th>
                                        <th className="py-2.5 px-3 text-left w-1/6">Tanggal</th>
                                        <th className="py-2.5 px-3 text-left w-1/4">Keputusan / Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {approvals.map((appr, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                                {appr.jabatan}
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="text"
                                                    value={appr.nama || ''}
                                                    onChange={(e) => handleApprovalChange(idx, 'nama', e.target.value)}
                                                    placeholder="Nama lengkap"
                                                    className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="date"
                                                    value={appr.tanggal || ''}
                                                    onChange={(e) => handleApprovalChange(idx, 'tanggal', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <select
                                                    value={appr.keputusan || 'DISETUJUI'}
                                                    onChange={(e) => handleApprovalChange(idx, 'keputusan', e.target.value)}
                                                    className="w-full text-xs font-semibold rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                >
                                                    <option value="DISETUJUI">DISETUJUI (APPROVED)</option>
                                                    <option value="DENGAN CATATAN">DISETUJUI DENGAN CATATAN</option>
                                                    <option value="DITOLAK">DITOLAK (REJECTED)</option>
                                                    <option value="MENUNGGU">MENUNGGU VERIFIKASI</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* SOP Footer Note */}
                        <div className="mt-4 p-3 bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-800 dark:text-amber-300">
                            <strong>Catatan:</strong> Penundaan service wajib mengikuti batas toleransi HM, ketentuan OEM, kondisi unit, dan persetujuan yang berlaku.
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
                                <History className="w-5 h-5 text-amber-600" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                    Riwayat Form Penundaan Service
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
                                    placeholder="Cari nomor form, kode unit, justifikasi..."
                                    className="w-full pl-9 text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                            {filteredRecent.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    Tidak ada data form penundaan service.
                                </div>
                            ) : (
                                filteredRecent.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                                                    {f.form_number}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    Unit: {f.unit?.code_unit || '-'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {f.date ? f.date.substring(0, 10) : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                                                {f.notes || 'Tidak ada catatan justifikasi.'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowHistoryModal(false);
                                                    router.get(`/form-penundaan-service?id=${f.id}`);
                                                }}
                                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition"
                                            >
                                                Buka
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => window.open(`/form-penundaan-service/${f.id}/print`, '_blank')}
                                                className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                                            >
                                                Print
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => window.open(`/form-penundaan-service/download-pdf?id=${f.id}`, '_blank')}
                                                className="px-2 py-1 text-xs rounded-lg border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition"
                                            >
                                                PDF
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`Hapus form ${f.form_number}?`)) {
                                                        router.delete(`/form-penundaan-service/${f.id}`);
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
