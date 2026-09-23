import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

const COMPONENTS = [
    "AC SYSTEM", "ACCESSORIES", "ACCIDENT", "AIR SYSTEM", "ATTACHMENT", "AUTOLUBE",
    "BATTERY", "BLADE", "BRAKE SYSTEM", "BUCKET", "CABIN", "CLUTCH", "COOLING SYSTEM",
    "DAMPER", "DIFFERENTIAL", "ELECTRIC SYSTEM", "ENGINE", "FINAL DRIVE",
    "FRAME/BODY/GUARD/CHASSIS", "FRONT AXLE", "FUEL SYSTEM", "GET", "GREASING", "HOSES",
    "HYDRAULIC SYSTEM", "INTAKE & EXHAUST SYSTEM", "LEVEL OIL/COOLANT", "MAINTENANCE/SERVICE",
    "PROPELLER SHAFT", "PTO", "RADIATOR", "RADIO", "REAR AXLE", "STEERING SYSTEM", "SUSPENSION",
    "SWING", "TAIL GATE", "TRANSMISSION", "TYRE", "UNDERCARRIAGE", "VESSEL", "WASHING",
    "WATER CANON/SPRAYER", "WHEEL & HUB"
];

// Format datetime to datetime-local input value
const toDatetimeLocal = (val) => {
    if (!val) return '';
    try {
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.includes('T')) {
                return trimmed.slice(0, 16);
            }
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)) {
                return trimmed.replace(' ', 'T').slice(0, 16);
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return `${trimmed}T00:00`;
            }
        }
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
};

const getCurrentDatetimeLocal = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const calculateDowntime = (waktuBd, waktuRfu, hmBd, hmRfu) => {
    if (waktuBd) {
        let bdStr = String(waktuBd).trim();
        if (bdStr.length === 10 && !bdStr.includes('T')) {
            bdStr += 'T00:00';
        }
        const s = new Date(bdStr).getTime();
        let e = Date.now();
        if (waktuRfu) {
            let rfuStr = String(waktuRfu).trim();
            if (rfuStr.length === 10 && !rfuStr.includes('T')) {
                rfuStr += 'T00:00';
            }
            const rfuTime = new Date(rfuStr).getTime();
            if (!isNaN(rfuTime)) {
                e = rfuTime;
            }
        }
        if (!isNaN(s) && !isNaN(e) && e >= s) {
            return Math.round(((e - s) / 3600000) * 100) / 100;
        }
    }
    if (hmBd !== '' && hmRfu !== '' && hmBd !== null && hmRfu !== null) {
        const bd = parseFloat(hmBd);
        const rfu = parseFloat(hmRfu);
        if (!isNaN(bd) && !isNaN(rfu) && rfu >= bd) {
            return Math.round((rfu - bd) * 100) / 100;
        }
    }
    return 0;
};

export const TIPE_WO_OPTIONS = [
    { value: 'PM - PREVENTIVE MAINTENANCE', label: 'PM - PREVENTIVE MAINTENANCE' },
    { value: 'CM - CORRECTIVE MAINTENANCE', label: 'CM - CORRECTIVE MAINTENANCE' },
    { value: 'INS - INSPECTION', label: 'INS - INSPECTION' },
    { value: 'OVH - OVERHAUL', label: 'OVH - OVERHAUL' },
    { value: 'REPL - COMPONENT REPLACEMENT', label: 'REPL - COMPONENT REPLACEMENT' },
    { value: 'UC - UNDERCARRIAGE MAINTENANCE', label: 'UC - UNDERCARRIAGE MAINTENANCE' },
    { value: 'TYRE - Tyre Management', label: 'TYRE - Tyre Management' },
];

export const STATUS_WO_OPTIONS = [
    { value: 'DRAFT', label: 'DRAFT' },
    { value: 'OPEN', label: 'OPEN' },
    { value: 'CLOSED', label: 'CLOSED' },
];

export const DOWN_STATUS_OPTIONS = [
    { value: 'B0 - On Progress', label: 'B0 - On Progress' },
    { value: 'B1 - Waiting Parts', label: 'B1 - Waiting Parts' },
    { value: 'B2 - Waiting Sarana', label: 'B2 - Waiting Sarana' },
    { value: 'B3 - Waiting Tools', label: 'B3 - Waiting Tools' },
    { value: 'B4 - Waiting Man Power', label: 'B4 - Waiting Man Power' },
    { value: 'B5 - Outside / Dealer', label: 'B5 - Outside / Dealer' },
    { value: 'B6 - Production / Abuse', label: 'B6 - Production / Abuse' },
    { value: 'B7 - Waiting Decision Plant', label: 'B7 - Waiting Decision Plant' },
    { value: 'B8 - Waiting Decision HO', label: 'B8 - Waiting Decision HO' },
];

export const formatDownStatus = (val) => {
    if (!val) return 'B0 - On Progress';
    const s = String(val).toUpperCase();
    if (s.includes('B0')) return 'B0 - On Progress';
    if (s.includes('B1')) return 'B1 - Waiting Parts';
    if (s.includes('B2')) return 'B2 - Waiting Sarana';
    if (s.includes('B3')) return 'B3 - Waiting Tools';
    if (s.includes('B4')) return 'B4 - Waiting Man Power';
    if (s.includes('B5')) return 'B5 - Outside / Dealer';
    if (s.includes('B6')) return 'B6 - Production / Abuse';
    if (s.includes('B7')) return 'B7 - Waiting Decision Plant';
    if (s.includes('B8')) return 'B8 - Waiting Decision HO';
    return val;
};

const normalizeStatusWo = (status, tipeWo = 'BREAKDOWN') => {
    if (!status || status === 'OPEN' || status === 'CLOSED' || status === 'DRAFT' || status === 'PROCESS' || status === 'WAITING PART' || status === 'COMPLETED') {
        return tipeWo === 'SCHEDULE' ? 'PM - PREVENTIVE MAINTENANCE' : 'CM - CORRECTIVE MAINTENANCE';
    }
    const found = TIPE_WO_OPTIONS.find(opt => opt.value === status || opt.value.startsWith(status + ' -') || opt.value.startsWith(status));
    return found ? found.value : status;
};

export default function Edit({ workOrder: wo, units = [], manpowers = [], tools = [] }) {
    const initialStatusWo = normalizeStatusWo(wo.status_wo, wo.tipe_wo);
    const initialStatusPengerjaan = wo.status_pengerjaan || (wo.status_wo === 'COMPLETED' || wo.status_wo === 'CLOSED' ? 'CLOSED' : 'OPEN');

    const { data, setData, put, processing, errors } = useForm({
        no_wo: wo.no_wo || '',
        tipe_wo: wo.tipe_wo || 'BREAKDOWN',
        downtime_code: wo.downtime_code || 'Unschedule',
        site: wo.site || '',
        unit_id: wo.unit_id ? wo.unit_id.toString() : '',
        waktu_breakdown: toDatetimeLocal(wo.waktu_breakdown),
        waktu_rfu: toDatetimeLocal(wo.waktu_rfu),
        durasi_hrs: (() => {
            if (wo.waktu_breakdown) {
                const s = new Date(wo.waktu_breakdown).getTime();
                const e = wo.waktu_rfu ? new Date(wo.waktu_rfu).getTime() : Date.now();
                if (!isNaN(s) && !isNaN(e) && e >= s) {
                    return Math.round(((e - s) / 3600000) * 100) / 100;
                }
            }
            return wo.durasi_hrs ?? 0;
        })(),
        hm_unit: wo.hm_unit ?? '',
        hm_bd: wo.hm_bd ?? '',
        hm_rfu: wo.hm_rfu ?? '',
        status_wo: initialStatusWo,
        status_pengerjaan: initialStatusPengerjaan,
        keterangan: wo.keterangan || '',
        problem: wo.problem || '',
        root_cause: wo.root_cause || '',
        corrective_action: wo.corrective_action || '',
        component_group: wo.component || '',
        model_system: wo.component_model || '',
        component_sn: wo.component_sn || '',
        priority: wo.priority || 'MEDIUM',
        request_date: wo.request_date ? wo.request_date.split('T')[0] : '',
        tasks: wo.tasks && wo.tasks.length > 0
            ? wo.tasks.map(t => ({
                id: t.id,
                group_component: t.group_component || '',
                component: t.component || '',
                task_description: t.task_description || '',
                problem: t.problem || '',
                activity_progress: t.activity_progress || '',
                est_finish: toDatetimeLocal(t.est_finish),
                mechanic: t.mechanic || '',
                is_manual_pic: !!(t.mechanic && !(manpowers || []).some(mp => mp?.nama === t.mechanic)),
                tools: typeof t.tools === 'string' ? t.tools.split(', ').filter(Boolean) : (Array.isArray(t.tools) ? t.tools : []),
                start_date: toDatetimeLocal(t.start_date || t.target_date),
                end_date: toDatetimeLocal(t.end_date),
                downtime_hrs: t.downtime_hrs ?? 0,
                target_date: toDatetimeLocal(t.target_date || t.start_date),
                status: t.status || 'B0 - On Progress',
            }))
            : [{ id: null, group_component: '', component: '', task_description: '', problem: '', activity_progress: '', est_finish: '', mechanic: '', is_manual_pic: false, tools: [], start_date: '', end_date: '', downtime_hrs: 0, target_date: '', status: 'B0 - On Progress' }],
    });

    // Auto-calculate downtime when breakdown/rfu times change (dari awal breakdown sampai hari ini / rfu)
    useEffect(() => {
        const updateDowntime = () => {
            const dur = calculateDowntime(data.waktu_breakdown, data.waktu_rfu, data.hm_bd, data.hm_rfu);
            setData(prev => (prev.durasi_hrs !== dur ? { ...prev, durasi_hrs: dur } : prev));
        };

        updateDowntime();

        // Jika unit masih breakdown (belum RFU), auto-update setiap 30 detik
        if (data.waktu_breakdown && !data.waktu_rfu) {
            const interval = setInterval(updateDowntime, 30000);
            return () => clearInterval(interval);
        }
    }, [data.waktu_breakdown, data.waktu_rfu, data.hm_bd, data.hm_rfu]);

    const handleAddTask = () => {
        setData('tasks', [...data.tasks, { id: null, group_component: '', component: '', task_description: '', problem: '', activity_progress: '', est_finish: '', mechanic: '', is_manual_pic: false, tools: [], start_date: '', end_date: '', downtime_hrs: 0, target_date: '', status: 'B0 - On Progress' }]);
    };

    const handleRemoveTask = (index) => {
        setData('tasks', data.tasks.filter((_, i) => i !== index));
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...data.tasks];
        newTasks[index][field] = value;
        setData('tasks', newTasks);
    };

    const handleTaskDateChange = (index, field, value) => {
        const newTasks = [...data.tasks];
        newTasks[index][field] = value;
        
        const start = field === 'start_date' ? value : newTasks[index].start_date;
        const end = field === 'end_date' ? value : newTasks[index].end_date;
        
        if (start && end) {
            const sTime = new Date(start).getTime();
            const eTime = new Date(end).getTime();
            if (!isNaN(sTime) && !isNaN(eTime)) {
                if (eTime >= sTime) {
                    const diffHours = Math.round(((eTime - sTime) / (1000 * 60 * 60)) * 10) / 10;
                    newTasks[index].downtime_hrs = diffHours;
                } else {
                    newTasks[index].downtime_hrs = 0;
                }
            }
        }
        newTasks[index].target_date = start || end || '';
        setData('tasks', newTasks);
    };

    const selectedUnit = (units || []).find(u => String(u?.id) === String(data.unit_id)) || null;

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/work-orders/${wo.id}`, { preserveScroll: true });
    };

    const handleDeleteWo = () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus Work Order ${wo.no_wo || ''}? Semua data task dan detail terkait akan dihapus secara permanen.`)) {
            router.delete(`/work-orders/${wo.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Work Order ${wo.no_wo}`} />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-10">
                {/* Header */}
                <div className="bg-white dark:bg-[#060b14] px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/work-orders/${wo.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight">
                                Edit Work Order
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 font-medium gap-1">
                                <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Order</Link>
                                <span>›</span>
                                <Link href={`/work-orders/${wo.id}`} className="hover:text-blue-600 transition-colors">{wo.no_wo}</Link>
                                <span>›</span>
                                <span className="text-orange-600 font-bold">Edit</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-full">
                            ✏️ Mode Edit — {wo.no_wo}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 w-full max-w-none flex flex-col gap-6">

                    {/* Section 1: 2 Balanced Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        
                        {/* Card 1: Informasi Work Order & Unit */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="w-7 h-7 rounded-lg bg-[#0b6e4f] text-white flex items-center justify-center text-xs font-bold shadow-xs">1</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-[#012922] dark:text-white uppercase tracking-tight">Informasi Work Order & Unit</h3>
                                        <p className="text-[11px] text-slate-400">Nomor referensi WO, tipe pekerjaan, dan data unit</p>
                                    </div>
                                </div>

                                {/* No WO */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Nomor Work Order</label>
                                    <input 
                                        type="text" 
                                        value={data.no_wo} 
                                        readOnly
                                        tabIndex="-1"
                                        className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono font-bold cursor-not-allowed select-none focus:outline-none" 
                                    />
                                </div>

                                {/* Tipe WO */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Tipe Work Order</label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button 
                                            type="button"
                                            onClick={() => setData('tipe_wo', 'BREAKDOWN')}
                                            className={`py-2 px-3 rounded-lg text-xs font-extrabold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                data.tipe_wo === 'BREAKDOWN' 
                                                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700 shadow-xs' 
                                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="text-sm">⚠️</span>
                                            <span>BREAKDOWN</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setData('tipe_wo', 'SCHEDULE')}
                                            className={`py-2 px-3 rounded-lg text-xs font-extrabold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                data.tipe_wo === 'SCHEDULE' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 shadow-xs' 
                                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>📅</span>
                                            <span>SCHEDULE</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Downtime Code, Status WO, Status Pengerjaan in 3-Col row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Downtime Code</label>
                                        <select 
                                            value={data.downtime_code} 
                                            onChange={e => setData('downtime_code', e.target.value)} 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            <option value="Unschedule">Unschedule</option>
                                            <option value="Schedule">Schedule</option>
                                            <option value="Accident">Accident</option>
                                            <option value="Opportunity">Opportunity</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                            Tipe Work Order
                                        </label>
                                        <select 
                                            value={data.status_wo} 
                                            onChange={e => setData('status_wo', e.target.value)} 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            {TIPE_WO_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
                                            <span>Status WO</span>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                                                data.status_pengerjaan === 'CLOSED'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                    : data.status_pengerjaan === 'DRAFT'
                                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                            }`}>
                                                {data.status_pengerjaan || 'DRAFT'}
                                            </span>
                                        </label>
                                        <select 
                                            value={data.status_pengerjaan || 'DRAFT'} 
                                            onChange={e => setData('status_pengerjaan', e.target.value)} 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            <option value="DRAFT">DRAFT</option>
                                            <option value="OPEN">OPEN</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Site & Unit Selection in 2-Col row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Site / Lokasi <span className="text-red-500">*</span></label>
                                        <select 
                                            value={data.site} 
                                            onChange={e => setData('site', e.target.value)} 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                            required
                                        >
                                            <option value="">-- Pilih Site --</option>
                                            <option value="Harindo Wahana">Harindo Wahana</option>
                                            <option value="Bukit Baiduri Energy">Bukit Baiduri Energy</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Kode Unit <span className="text-red-500">*</span></label>
                                        <select 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-black font-mono dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                            value={data.unit_id}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const selected = units.find(u => u.id.toString() === val);
                                                setData(prev => ({
                                                    ...prev,
                                                    unit_id: val,
                                                    hm_unit: selected ? (selected.current_hm || prev.hm_unit) : prev.hm_unit,
                                                }));
                                            }}
                                            required
                                        >
                                            <option value="">-- Pilih Unit --</option>
                                            {units.map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                            ))}
                                        </select>
                                        {errors.unit_id && <p className="text-xs text-red-500 mt-1">{errors.unit_id}</p>}
                                    </div>
                                </div>

                                {/* Unit Preview Info Box */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3.5">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5"><span className="text-slate-400 font-medium w-24 shrink-0">Model:</span> <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{selectedUnit?.model || '-'}</span></div>
                                        <div className="flex items-center gap-1.5"><span className="text-slate-400 font-medium w-24 shrink-0">Serial No:</span> <span className="font-bold font-mono text-slate-800 dark:text-slate-100 truncate">{selectedUnit?.serial_number || '-'}</span></div>
                                        <div className="flex items-center gap-1.5"><span className="text-slate-400 font-medium w-24 shrink-0">Engine Model:</span> <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{selectedUnit?.engine_model || '-'}</span></div>
                                        <div className="flex items-center gap-1.5"><span className="text-slate-400 font-medium w-24 shrink-0">Current HM:</span> <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{selectedUnit?.current_hm ? `${selectedUnit.current_hm} H` : '-'}</span></div>
                                        <div className="flex items-center gap-1.5 col-span-2"><span className="text-slate-400 font-medium w-24 shrink-0">Lokasi:</span> <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{selectedUnit?.lokasi || '-'}</span></div>
                                    </div>
                                    {selectedUnit && (
                                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                            <Link 
                                                href={`/units/${selectedUnit.id}`} 
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                <EyeIcon /> <span>Lihat Detail Unit Lengkap ↗</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {data.status_wo === 'REPL - COMPONENT REPLACEMENT' && selectedUnit && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                                                REPL
                                            </div>
                                            <div>
                                                <div className="text-xs font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                                                    Plan PCR Component Replacement
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/90 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-mono text-[11px] font-black">
                                                        {selectedUnit.code_unit}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                                    Buka dan buat perubahan komponen unit {selectedUnit.code_unit} di Plan Component (PCR).
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`/pcr-component?code_unit=${encodeURIComponent(selectedUnit.code_unit)}&tab=${(selectedUnit.type_unit === 'BULLDOZER' || selectedUnit.type_unit === 'EXCAVATOR' || selectedUnit.code_unit?.startsWith('MD') || selectedUnit.code_unit?.startsWith('ME')) ? 'track' : 'wheel'}&open_modal=1${data.component_group ? `&component=${encodeURIComponent(data.component_group)}` : ''}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            Buka PCR Component ({selectedUnit.code_unit})
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 2: Waktu & Deskripsi Kerusakan */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">2</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-[#012922] dark:text-white uppercase tracking-tight">Waktu & Downtime</h3>
                                        <p className="text-[11px] text-slate-400">Pencatatan waktu kejadian, durasi downtime, dan jam kerja unit</p>
                                    </div>
                                </div>

                                {/* Waktu Breakdown & HM BD in 2-Col row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                Waktu Breakdown <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nowStr = getCurrentDatetimeLocal();
                                                    const dur = calculateDowntime(nowStr, data.waktu_rfu, data.hm_bd, data.hm_rfu);
                                                    setData(prev => ({
                                                        ...prev,
                                                        waktu_breakdown: nowStr,
                                                        durasi_hrs: dur,
                                                    }));
                                                }}
                                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition"
                                                title="Isi dengan tanggal dan jam saat ini"
                                            >
                                                <span>⚡ Waktu Sekarang</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            <input 
                                                type="date" 
                                                value={data.waktu_breakdown ? data.waktu_breakdown.split('T')[0] : ''}
                                                onChange={e => {
                                                    const dateVal = e.target.value;
                                                    const timeVal = data.waktu_breakdown && data.waktu_breakdown.includes('T') 
                                                        ? data.waktu_breakdown.split('T')[1] 
                                                        : '00:00';
                                                    const combined = dateVal ? `${dateVal}T${timeVal || '00:00'}` : '';
                                                    const dur = calculateDowntime(combined, data.waktu_rfu, data.hm_bd, data.hm_rfu);
                                                    setData(prev => ({
                                                        ...prev,
                                                        waktu_breakdown: combined,
                                                        durasi_hrs: dur,
                                                    }));
                                                }}
                                                className="col-span-3 px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                            />
                                            <input 
                                                type="time" 
                                                value={data.waktu_breakdown && data.waktu_breakdown.includes('T') ? data.waktu_breakdown.split('T')[1] : '00:00'}
                                                onChange={e => {
                                                    const timeVal = e.target.value;
                                                    const dateVal = data.waktu_breakdown ? data.waktu_breakdown.split('T')[0] : new Date().toISOString().slice(0, 10);
                                                    const combined = `${dateVal}T${timeVal || '00:00'}`;
                                                    const dur = calculateDowntime(combined, data.waktu_rfu, data.hm_bd, data.hm_rfu);
                                                    setData(prev => ({
                                                        ...prev,
                                                        waktu_breakdown: combined,
                                                        durasi_hrs: dur,
                                                    }));
                                                }}
                                                className="col-span-2 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
                                            <span>HM Saat Breakdown</span>
                                            <span className="text-[10px] text-slate-400 lowercase font-normal">hours</span>
                                        </label>
                                        <input 
                                            type="number"
                                            step="any"
                                            placeholder="0.0"
                                            value={data.hm_bd ?? ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const dur = calculateDowntime(data.waktu_breakdown, data.waktu_rfu, val, data.hm_rfu);
                                                setData(prev => ({ ...prev, hm_bd: val, durasi_hrs: dur }));
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        />
                                    </div>
                                </div>

                                {/* Waktu RFU & HM RFU in 2-Col row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Waktu Ready For Use (RFU)</label>
                                            {data.waktu_rfu ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const dur = calculateDowntime(data.waktu_breakdown, '', data.hm_bd, data.hm_rfu);
                                                        setData(prev => ({
                                                            ...prev,
                                                            waktu_rfu: '',
                                                            durasi_hrs: dur,
                                                            status_pengerjaan: 'OPEN',
                                                        }));
                                                    }}
                                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer transition"
                                                    title="Klik jika unit masih breakdown hari ini (belum ready) agar downtime auto-update sampai saat ini"
                                                >
                                                    <span>🔄 Unit Belum Ready</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const nowStr = getCurrentDatetimeLocal();
                                                        const dur = calculateDowntime(data.waktu_breakdown, nowStr, data.hm_bd, data.hm_rfu);
                                                        setData(prev => ({
                                                            ...prev,
                                                            waktu_rfu: nowStr,
                                                            durasi_hrs: dur,
                                                            status_pengerjaan: 'CLOSED',
                                                        }));
                                                    }}
                                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition"
                                                    title="Klik untuk mengisi waktu RFU saat unit sudah siap operasi"
                                                >
                                                    <span>⚡ Set RFU Sekarang</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            <input 
                                                type="date" 
                                                value={data.waktu_rfu ? data.waktu_rfu.split('T')[0] : ''} 
                                                onChange={e => {
                                                    const dateVal = e.target.value;
                                                    const timeVal = data.waktu_rfu && data.waktu_rfu.includes('T') ? data.waktu_rfu.split('T')[1] : '00:00';
                                                    const combined = dateVal ? `${dateVal}T${timeVal || '00:00'}` : '';
                                                    const dur = calculateDowntime(data.waktu_breakdown, combined, data.hm_bd, data.hm_rfu);
                                                    setData(prev => ({
                                                        ...prev,
                                                        waktu_rfu: combined,
                                                        durasi_hrs: dur,
                                                        status_pengerjaan: combined ? 'CLOSED' : prev.status_pengerjaan,
                                                    }));
                                                }}
                                                className="col-span-3 px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                            />
                                            <input 
                                                type="time" 
                                                value={data.waktu_rfu && data.waktu_rfu.includes('T') ? data.waktu_rfu.split('T')[1] : ''} 
                                                onChange={e => {
                                                    const timeVal = e.target.value;
                                                    const dateVal = data.waktu_rfu ? data.waktu_rfu.split('T')[0] : new Date().toISOString().slice(0, 10);
                                                    const combined = `${dateVal}T${timeVal || '00:00'}`;
                                                    const dur = calculateDowntime(data.waktu_breakdown, combined, data.hm_bd, data.hm_rfu);
                                                    setData(prev => ({
                                                        ...prev,
                                                        waktu_rfu: combined,
                                                        durasi_hrs: dur,
                                                        status_pengerjaan: 'CLOSED',
                                                    }));
                                                }}
                                                className="col-span-2 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                            />
                                        </div>
                                        {data.waktu_breakdown && !data.waktu_rfu && (
                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                                                <span>⏳</span>
                                                <span>Unit belum ready: Downtime otomatis terhitung berjalan sampai saat ini.</span>
                                            </p>
                                        )}
                                        {data.waktu_breakdown && data.waktu_rfu && (
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                                                <span>✓</span>
                                                <span>Unit sudah ready: Downtime selesai terhitung.</span>
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
                                            <span>HM Saat RFU</span>
                                            <span className="text-[10px] text-slate-400 lowercase font-normal">hours</span>
                                        </label>
                                        <input 
                                            type="number"
                                            step="any"
                                            placeholder="0.0"
                                            value={data.hm_rfu ?? ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const dur = calculateDowntime(data.waktu_breakdown, data.waktu_rfu, data.hm_bd, val);
                                                setData(prev => ({ ...prev, hm_rfu: val, durasi_hrs: dur }));
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        />
                                    </div>
                                </div>

                                {/* Downtime & Component Group in 2-Col row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Downtime</label>
                                            {data.waktu_breakdown && (
                                                !data.waktu_rfu ? (
                                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                                                        ⚡ Berjalan Otomatis (Live)
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                        ✓ Selesai Terhitung
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly
                                                tabIndex="-1"
                                                className="w-full px-3 py-2 pr-14 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-black font-mono cursor-not-allowed select-none focus:outline-none" 
                                                value={data.durasi_hrs} 
                                            />
                                            <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">Hours</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Component Group</label>
                                        <select 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                            value={data.component_group}
                                            onChange={e => setData('component_group', e.target.value)}
                                        >
                                            <option value="">-- Pilih Component Group --</option>
                                            {COMPONENTS.map(comp => (
                                                <option key={comp} value={comp}>{comp}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Section 2: Task List */}
                    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#0b6e4f] text-white p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">Daftar Task & Tindakan</h3>
                                <p className="text-xs text-[#86c4a6] mt-0.5">Edit, tambah, atau hapus task yang ada</p>
                            </div>
                            <button type="button" onClick={handleAddTask}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-1.5 transition"
                            >
                                <span className="text-lg leading-none">+</span> Tambah Task
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <datalist id="edit-manpower-list-options">
                                {(manpowers || []).map(mp => (
                                    <option key={mp.id} value={mp.nama}>{mp.bagian ? `${mp.nama} (${mp.bagian})` : mp.nama}</option>
                                ))}
                            </datalist>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-14 text-center">TASK</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 min-w-[300px]">PROBLEM</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-16 text-center">SUB TASK</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 min-w-[300px]">ACTIVITY PROGRESS</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-52">DATE</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-60 min-w-[210px]">DOWN STATUS</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-44">PIC</th>
                                        <th className="py-3 px-3 text-sm font-bold text-gray-700 w-12 text-center">Act</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tasks.map((t, i) => (
                                        <tr key={i} className="border-b border-gray-100 align-top">
                                            {/* TASK - auto number */}
                                            <td className="py-3 px-3 text-center w-14">
                                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 text-base font-black border-2 border-emerald-300 select-none">
                                                    {i + 1}
                                                </span>
                                            </td>
                                            {/* PROBLEM - large textarea */}
                                            <td className="py-3 px-3 min-w-[300px]">
                                                <textarea
                                                    rows={5}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-orange-300 rounded-xl text-sm focus:ring-orange-400 focus:border-orange-400 resize-none placeholder-orange-300 font-medium leading-relaxed shadow-sm"
                                                    placeholder="Deskripsi problem / kerusakan..."
                                                    value={t.problem || ''}
                                                    onChange={e => handleTaskChange(i, 'problem', e.target.value)}
                                                />
                                            </td>
                                            {/* SUB TASK - auto number (moved between PROBLEM and ACTIVITY PROGRESS) */}
                                            <td className="py-3 px-3 text-center w-16">
                                                <span className="inline-flex items-center justify-center w-10 h-9 rounded-lg bg-slate-100 text-slate-700 text-sm font-black border border-slate-300 select-none">
                                                    {i + 1}.{i + 1}
                                                </span>
                                            </td>
                                            {/* ACTIVITY PROGRESS - large textarea */}
                                            <td className="py-3 px-3 min-w-[300px]">
                                                <textarea
                                                    rows={5}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-blue-300 rounded-xl text-sm focus:ring-blue-400 focus:border-blue-400 resize-none placeholder-blue-300 font-medium leading-relaxed shadow-sm"
                                                    placeholder="Uraikan progress activity / tindakan yang dilakukan..."
                                                    value={t.activity_progress || ''}
                                                    onChange={e => handleTaskChange(i, 'activity_progress', e.target.value)}
                                                />
                                            </td>
                                            {/* DATE - compact */}
                                            <td className="py-2 px-2 w-52">
                                                <div className="space-y-1 bg-slate-50 p-1.5 rounded-md border border-gray-200">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-emerald-700 w-12 shrink-0">Awal:</span>
                                                        <input type="datetime-local"
                                                            value={t.start_date || ''}
                                                            onChange={e => handleTaskDateChange(i, 'start_date', e.target.value)}
                                                            className="w-full px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-medium focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-blue-700 w-12 shrink-0">Akhir:</span>
                                                        <input type="datetime-local"
                                                            value={t.end_date || ''}
                                                            onChange={e => handleTaskDateChange(i, 'end_date', e.target.value)}
                                                            className="w-full px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-medium focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-indigo-700 w-12 shrink-0">Est:</span>
                                                        <input type="datetime-local"
                                                            value={t.est_finish || ''}
                                                            onChange={e => handleTaskChange(i, 'est_finish', e.target.value)}
                                                            className="w-full px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-medium focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                            title="Estimasi Selesai (Est. Finish)"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-amber-700 w-12 shrink-0">DT:</span>
                                                        <div className="relative w-full">
                                                            <input type="number" step="0.1" min="0"
                                                                value={t.downtime_hrs ?? ''}
                                                                onChange={e => handleTaskChange(i, 'downtime_hrs', e.target.value)}
                                                                placeholder="0.0"
                                                                className="w-full px-1.5 py-0.5 pr-8 bg-white border border-gray-300 rounded text-[10px] font-bold text-amber-900 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                            />
                                                            <span className="absolute right-1.5 top-0.5 text-[9px] font-semibold text-gray-400 pointer-events-none">Hrs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Down Status - full non-abbreviated */}
                                            <td className="py-3 px-2 w-60 min-w-[210px]">
                                                <select
                                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                    value={formatDownStatus(t.status)}
                                                    onChange={e => handleTaskChange(i, 'status', e.target.value)}
                                                >
                                                    {DOWN_STATUS_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            {/* PIC - compact */}
                                            <td className="py-3 px-2 w-44">
                                                {t.is_manual_pic ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input 
                                                            type="text" 
                                                            list="edit-manpower-list-options"
                                                            className="w-full px-2.5 py-1.5 bg-white border border-emerald-500 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                                            placeholder="Ketik manual nama PIC..." 
                                                            value={t.mechanic || ''} 
                                                            onChange={e => handleTaskChange(i, 'mechanic', e.target.value)} 
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTaskChange(i, 'is_manual_pic', false)}
                                                            title="Kembali pilih dari daftar manpower"
                                                            className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 shrink-0 font-medium"
                                                        >
                                                            List
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <select 
                                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                                            value={t.mechanic || ''} 
                                                            onChange={e => {
                                                                if (e.target.value === '__MANUAL__') {
                                                                    const newTasks = [...data.tasks];
                                                                    newTasks[i].is_manual_pic = true;
                                                                    newTasks[i].mechanic = '';
                                                                    setData('tasks', newTasks);
                                                                } else {
                                                                    handleTaskChange(i, 'mechanic', e.target.value);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">-- PIC / Mekanik --</option>
                                                            {(manpowers || []).map(mp => (
                                                                <option key={mp.id} value={mp.nama}>{mp.nama}{mp.bagian ? ` (${mp.bagian})` : ''}</option>
                                                            ))}
                                                            <option value="__MANUAL__">✍️ Input Manual Lainnya...</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newTasks = [...data.tasks];
                                                                newTasks[i].is_manual_pic = true;
                                                                setData('tasks', newTasks);
                                                            }}
                                                            title="Ketik manual nama PIC"
                                                            className="p-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] rounded border border-emerald-300 shrink-0"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button type="button" onClick={() => handleRemoveTask(i)}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <Link href={`/work-orders/${wo.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded font-bold text-sm hover:bg-gray-50 transition shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Batal
                            </Link>

                            <button
                                type="button"
                                onClick={handleDeleteWo}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-300 text-red-600 rounded font-bold text-sm hover:bg-red-100 transition shadow-sm cursor-pointer"
                            >
                                <TrashIcon />
                                Hapus WO
                            </button>
                        </div>

                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#0b6e4f] text-white rounded font-bold text-sm hover:bg-[#095940] transition shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
