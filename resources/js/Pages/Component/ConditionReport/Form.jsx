import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    FileText,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image,
    Upload,
    Calendar,
    Clock,
    AlertCircle,
    Building,
    MapPin,
    Truck,
    Shield,
    CheckCircle2,
    Eye
} from 'lucide-react';

export default function Form({
    units = [],
    suggestedNo = '',
    report = null,
    isEdit = false
}) {
    // Initial dynamic items setup
    const initialItems = report?.items && report.items.length > 0
        ? report.items.map((item, idx) => ({
            id: item.id,
            item_no: item.item_no || (idx + 1),
            remarks: item.remarks || '',
            picture: null,
            picture_url: item.picture_url || (item.picture_path ? `/storage/${item.picture_path}` : null),
            picture_path: item.picture_path || null
        }))
        : [
            { id: null, item_no: 1, remarks: '', picture: null, picture_url: null, picture_path: null },
            { id: null, item_no: 2, remarks: '', picture: null, picture_url: null, picture_path: null }
        ];

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        report_no: report?.report_no || suggestedNo,
        project: report?.project || 'Mining Project SATUI',
        location: report?.location || 'Workshop Satui',
        date_reported: report?.date_reported ? report.date_reported.substring(0, 10) : new Date().toISOString().substring(0, 10),
        reported_by: report?.reported_by || '',
        company_name: report?.company_name || 'PT. MITRA ABADI MAHAKAM',
        
        unit_id: report?.unit_id || '',
        unit_code: report?.unit_code || '',
        model: report?.model || '',
        serial_no: report?.serial_no || '',
        
        date_install: report?.date_install ? report.date_install.substring(0, 10) : '',
        hm_install: report?.hm_install !== null && report?.hm_install !== undefined ? report.hm_install : '',
        
        date_failure: report?.date_failure ? report.date_failure.substring(0, 10) : '',
        hm_failure: report?.hm_failure !== null && report?.hm_failure !== undefined ? report.hm_failure : '',
        
        dibuat_oleh: report?.dibuat_oleh || '',
        disetujui_oleh: report?.disetujui_oleh || 'Spv/Fm',
        diketahui_oleh: report?.diketahui_oleh || 'Superintendant',
        status: report?.status || 'DRAFT',
        
        items: initialItems
    });

    // Computed Lifetime and HM Life values
    const [computedLifetime, setComputedLifetime] = useState(0);
    const [computedHmLife, setComputedHmLife] = useState(0);

    useEffect(() => {
        if (data.date_install && data.date_failure) {
            const install = new Date(data.date_install);
            const failure = new Date(data.date_failure);
            const diffTime = failure - install;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setComputedLifetime(diffDays >= 0 ? diffDays : 0);
        } else {
            setComputedLifetime(0);
        }
    }, [data.date_install, data.date_failure]);

    useEffect(() => {
        const hmInst = parseFloat(data.hm_install) || 0;
        const hmFail = parseFloat(data.hm_failure) || 0;
        if (hmFail >= hmInst && hmFail > 0) {
            setComputedHmLife(Math.round((hmFail - hmInst) * 100) / 100);
        } else {
            setComputedHmLife(0);
        }
    }, [data.hm_install, data.hm_failure]);

    // Handle Unit selection
    const handleUnitChange = (unitId) => {
        const selected = units.find(u => u.id === unitId);
        if (selected) {
            setData(prev => ({
                ...prev,
                unit_id: selected.id,
                unit_code: selected.code_unit,
                model: selected.model || '',
                serial_no: selected.sn_chassis || '',
                hm_failure: selected.hm || prev.hm_failure
            }));
        } else {
            setData(prev => ({
                ...prev,
                unit_id: '',
                unit_code: '',
                model: '',
                serial_no: ''
            }));
        }
    };

    // Item manipulation
    const handleAddItem = () => {
        const nextNo = data.items.length + 1;
        setData('items', [
            ...data.items,
            { id: null, item_no: nextNo, remarks: '', picture: null, picture_url: null, picture_path: null }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (data.items.length <= 1) {
            alert('Minimal harus memiliki 1 baris item pengamatan.');
            return;
        }
        const updated = data.items.filter((_, idx) => idx !== index)
            .map((item, idx) => ({ ...item, item_no: idx + 1 }));
        setData('items', updated);
    };

    const handleItemRemarksChange = (index, value) => {
        const updated = [...data.items];
        updated[index].remarks = value;
        setData('items', updated);
    };

    const handleItemPictureChange = (index, file) => {
        if (!file) return;
        const updated = [...data.items];
        updated[index].picture = file;
        updated[index].picture_url = URL.createObjectURL(file);
        setData('items', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('ccr.update', report.id), {
                forceFormData: true,
                preserveScroll: true
            });
        } else {
            post(route('ccr.store'), {
                forceFormData: true,
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit CCR - ${data.report_no}` : "Buat Conditions Component Report (CCR)"} />

            <div className="max-w-6xl mx-auto pb-12">
                {/* Header & Back Button */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('ccr.index')}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-100 transition shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {isEdit ? `Edit Laporan: ${data.report_no}` : "Buat Laporan Baru (CCR)"}
                            </h1>
                            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                                CONDITIONS COMPONENT REPORT (CCR)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEdit && report?.id && (
                            <Link
                                href={route('ccr.show', report.id)}
                                className="bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 border border-gray-200 dark:border-slate-700 shadow-sm"
                            >
                                <Eye className="w-4 h-4 text-emerald-600" />
                                Lihat Dokumen (View)
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Laporan')}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Green Banner (Exact mimic of paper header) */}
                    <div className="bg-[#a8d08d] text-emerald-950 p-4 rounded-2xl border-2 border-emerald-600/50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-700/20 shadow-xs">
                                <img src="/images/logo.png" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-wide uppercase">CONDITIONS COMPONENT REPORT (CCR)</h2>
                                <p className="text-xs font-bold text-emerald-900/80">FORMULIR LAPORAN KERUSAKAN DAN KONDISI KOMPONEN</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-emerald-900 uppercase">NO. WO CCR:</span>
                            <div className="text-base font-black text-emerald-950 font-mono">{data.report_no || '-'}</div>
                        </div>
                    </div>

                    {/* Specifications Two-Column Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                            <Building className="w-4 h-4 text-emerald-600" />
                            Informasi Proyek & Spesifikasi Unit
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Project, Location, Reporter */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                        PROJECT / <span className="font-normal italic text-gray-400">Proyek</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.project}
                                        onChange={(e) => setData('project', e.target.value)}
                                        placeholder="Contoh: Mining Project SATUI"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                    {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                        LOCATION / <span className="font-normal italic text-gray-400">Lokasi</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Workshop Satui - Sungai Danau"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            DATE REPORTED / <span className="font-normal italic text-gray-400">Tanggal dilaporkan</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_reported}
                                            onChange={(e) => setData('date_reported', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            REPORTED BY / <span className="font-normal italic text-gray-400">Dilaporkan oleh</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.reported_by}
                                            onChange={(e) => setData('reported_by', e.target.value)}
                                            placeholder="Nama teknisi / pelapor"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                        COMPANY NAME / <span className="font-normal italic text-gray-400">Nama perusahaan</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Unit ID, Model, Serial No, Install, Failure, Lifetime */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1 flex justify-between">
                                        <span>UNIT ID / <span className="font-normal italic text-gray-400">No. Unit</span></span>
                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Pilih unit untuk otomatis mengisi Model & SN</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <select
                                            value={data.unit_id}
                                            onChange={(e) => handleUnitChange(e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        >
                                            <option value="">-- Pilih dari Populasi Unit --</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.code_unit} - {u.model}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={data.unit_code}
                                            onChange={(e) => setData('unit_code', e.target.value)}
                                            placeholder="Kode Unit Manual / Custom"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            MODEL / <span className="font-normal italic text-gray-400">Model</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            placeholder="Contoh: HD785-7"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            SERIAL NO. / <span className="font-normal italic text-gray-400">Serial No.</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.serial_no}
                                            onChange={(e) => setData('serial_no', e.target.value)}
                                            placeholder="Contoh: 10243"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            DATE INSTALL / <span className="font-normal italic text-gray-400">Tgl Pasang</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_install}
                                            onChange={(e) => setData('date_install', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            HM Install / <span className="font-normal italic text-gray-400">SMU saat kejadian</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.hm_install}
                                            onChange={(e) => setData('hm_install', e.target.value)}
                                            placeholder="HM Awal Pasang"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            DATE OF FAILURE / <span className="font-normal italic text-gray-400">Tgl Rusak</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_failure}
                                            onChange={(e) => setData('date_failure', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                            Hm Failure / <span className="font-normal italic text-gray-400">SMU saat kejadian (Hrs)</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.hm_failure}
                                            onChange={(e) => setData('hm_failure', e.target.value)}
                                            placeholder="HM Saat Rusak"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Yellow Highlighted Box (Exact match with Excel template) */}
                                <div className="bg-[#ffff00] text-gray-900 border-2 border-yellow-400 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                                    <div>
                                        <div className="text-xs font-extrabold uppercase tracking-wider">Life time :</div>
                                        <div className="text-[11px] italic font-semibold text-gray-800">Umur parts</div>
                                        <div className="text-lg font-black text-gray-950 mt-0.5">{computedLifetime} Days</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold uppercase tracking-wider">HM Life :</div>
                                        <div className="text-[11px] italic font-semibold text-gray-800">SMU saat kejadian</div>
                                        <div className="text-lg font-black text-gray-950 mt-0.5">{computedHmLife} Hrs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic REMARKS & PICTURE Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Image className="w-4 h-4 text-emerald-600" />
                                    Remarks & Picture Dokumentasi
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                    Tuliskan uraian kondisi / kerusakan serta lampirkan foto dokumentasi pendukung.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Baris
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start"
                                >
                                    {/* Number Badge */}
                                    <div className="w-8 h-8 rounded-lg bg-gray-800 text-white font-black text-sm flex items-center justify-center shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* Remarks Textarea */}
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">
                                            REMARKS (Keterangan / Analisis Kondisi)
                                        </label>
                                        <textarea
                                            rows="4"
                                            value={item.remarks}
                                            onChange={(e) => handleItemRemarksChange(index, e.target.value)}
                                            placeholder="Deskripsikan kondisi komponen, penyebab kegagalan, atau temuan teknisi..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Picture Upload & Preview */}
                                    <div className="w-full md:w-64 shrink-0">
                                        <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 uppercase mb-1">
                                            PICTURE (Foto Dokumentasi)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-center bg-white dark:bg-slate-900 hover:border-emerald-500 transition relative">
                                            {item.picture_url ? (
                                                <div className="relative group/preview">
                                                    <img
                                                        src={item.picture_url}
                                                        alt={`Picture ${index + 1}`}
                                                        className="w-full h-32 object-contain rounded-lg bg-gray-100 dark:bg-slate-800"
                                                    />
                                                    <label
                                                        htmlFor={`pic-${index}`}
                                                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover/preview:opacity-100 transition cursor-pointer"
                                                    >
                                                        Ganti Foto
                                                    </label>
                                                </div>
                                            ) : (
                                                <label htmlFor={`pic-${index}`} className="flex flex-col items-center justify-center py-6 cursor-pointer">
                                                    <Upload className="w-7 h-7 text-gray-400 mb-1" />
                                                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Unggah Foto</span>
                                                    <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                                                </label>
                                            )}
                                            <input
                                                id={`pic-${index}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleItemPictureChange(index, e.target.files[0])}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition self-center md:self-start"
                                        title="Hapus baris"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signatures & Status Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            Otorisasi & Tanda Tangan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                    Dibuat Oleh
                                </label>
                                <input
                                    type="text"
                                    value={data.dibuat_oleh}
                                    onChange={(e) => setData('dibuat_oleh', e.target.value)}
                                    placeholder="Nama Mekanik / Teknisi"
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                    Disetujui Oleh (Spv / Fm)
                                </label>
                                <input
                                    type="text"
                                    value={data.disetujui_oleh}
                                    onChange={(e) => setData('disetujui_oleh', e.target.value)}
                                    placeholder="Nama Supervisor / Foreman"
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-600 dark:text-slate-400 mb-1">
                                    Diketahui Oleh (Superintendant)
                                </label>
                                <input
                                    type="text"
                                    value={data.diketahui_oleh}
                                    onChange={(e) => setData('diketahui_oleh', e.target.value)}
                                    placeholder="Nama Superintendant"
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-black uppercase text-gray-600 dark:text-slate-400">
                                    Status Laporan:
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white"
                                >
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="APPROVED">APPROVED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('ccr.index')}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-7 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Laporan')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
