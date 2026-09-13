import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

// SVGs
const ArrowLeft = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const SaveIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const LockIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DocumentIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TruckIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>; // Substitute
const WrenchIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BoxIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

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

export default function Form({ units, order, mode }) {
    const isEdit = mode === 'edit';
    
    // Parse order data for edit
    let initialParts = [{ part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }];
    if (isEdit && order.parts && order.parts.length > 0) {
        initialParts = order.parts.map(p => ({
            part_number: p.part_number || '',
            description: p.department || '',
            life_time: p.life_time || '',
            qty: p.qty || 1,
            satuan: 'Pcs',
            pr: p.pr || '',
            po: p.po || '',
            due_date_part: p.due_date_part || '',
            swap_to_unit_id: p.swap_to_unit_id || ''
        }));
    }

    let derivedUnitId = '';
    let derivedLokasi = '';
    if (isEdit) {
        derivedUnitId = order.unit_id || '';
        derivedLokasi = order.lokasi || '';
        if (!derivedUnitId && order.lokasi) {
            const nonUnits = ['ATK', 'CONSUMABLE', 'TOOL'];
            const found = nonUnits.find(v => order.lokasi.toUpperCase().startsWith(v));
            if (found) {
                derivedUnitId = found;
                let prefixRegex = new RegExp(`^${found}\\s*(-\\s*)?`, 'i');
                derivedLokasi = derivedLokasi.replace(prefixRegex, '').trim();
            }
        }
    }

    const { data, setData, post, put, processing, errors } = useForm({
        no_order: isEdit ? order.no_order : 'AUTO GENERATED',
        tanggal: isEdit ? order.tanggal : new Date().toISOString().split('T')[0],
        unit_id: derivedUnitId,
        hm: isEdit ? order.hm : '',
        component: isEdit ? order.component || (order.parts && order.parts[0]?.component) || (order.parts && order.parts[0]?.department) || '' : '',
        lokasi: derivedLokasi,
        priority: isEdit ? order.priority : 'MEDIUM',
        status: isEdit ? order.status : 'OPEN',
        pic: isEdit ? order.pic : '',
        root_cause: isEdit ? order.root_cause : '',
        component_name: isEdit ? order.component_name : '',
        action_taken: isEdit ? order.action_taken : '', // Job Instruction
        parts: initialParts,
        
        // UI Only - Doesn't map exactly to backend right now, but structured here
        wo_type: 'SCHEDULE',
        breakdown_start: '',
        breakdown_stop: '',
    });

    const [selectedUnitModel, setSelectedUnitModel] = useState('');
    const [selectedUnitType, setSelectedUnitType] = useState('');

    useEffect(() => {
        if (data.unit_id && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
            const unit = units.find(u => u.id == data.unit_id);
            if (unit) {
                setSelectedUnitModel(unit.code_unit || '');
                setSelectedUnitType(unit.type_unit || '');
                
                // Fetch HM automatically
                if (data.tanggal) {
                    axios.get('/api/get-hm', { params: { unit_id: data.unit_id, date: data.tanggal } })
                        .then(res => {
                            if (res.data.hm !== null) {
                                setData('hm', res.data.hm);
                            }
                        }).catch(e => console.error("HM Fetch error", e));
                }
            }
        } else {
            setSelectedUnitModel('');
            setSelectedUnitType('');
        }
    }, [data.unit_id, data.tanggal]);

    const handlePartNumberBlur = async (index) => {
        const partNumber = data.parts[index].part_number;
        if (partNumber && data.unit_id && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
            try {
                const response = await axios.get(route('monitoring-orderan.part-lifetime'), {
                    params: { unit_id: data.unit_id, part_number: partNumber, current_hm: data.hm, order_id: isEdit ? order.id : null }
                });
                
                if (response.data.life_time !== null) {
                    // Gunakan callback form setData agar tidak ada masalah closure ketika dipanggil berurutan
                    setData(currentData => {
                        const newParts = [...currentData.parts];
                        newParts[index].life_time = response.data.life_time;
                        return { ...currentData, parts: newParts };
                    });
                }
            } catch (error) {
                console.error("Failed to fetch part lifetime", error);
            }
        }
    };

    const recalculateLifetimes = () => {
        data.parts.forEach((part, index) => {
            if (part.part_number) {
                handlePartNumberBlur(index);
            }
        });
    };

    const addPart = () => setData('parts', [...data.parts, { part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }]);
    const removePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('monitoring-orderan.update', order.id));
        } else {
            post(route('monitoring-orderan.store'));
        }
    };

    // UI Styles
    const inputClass = "w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-800 h-11 px-3 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20 transition-all shadow-sm";
    const readonlyClass = "w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 h-11 px-3 flex items-center cursor-not-allowed shadow-inner";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";
    const cardClass = "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6";
    const cardHeaderClass = "bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2";
    const cardTitleClass = "text-sm font-bold text-[#012922] uppercase tracking-wide";

    const workflowSteps = ["OPEN", "PLANNED", "ASSIGNED", "IN PROGRESS", "WAITING PART", "COMPLETED", "CLOSED"];
    const currentStepIndex = workflowSteps.indexOf(data.status.toUpperCase());

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit WO ${order.no_order}` : 'Create Work Order'} />

            {/* Breadcrumb & Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/monitoring-orderan" className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                            <Link href="/monitoring-orderan" className="hover:text-[#0b6e4f]">Monitoring Order</Link> 
                            <span>/</span> 
                            <span>{isEdit ? 'Edit Work Order' : 'Create Work Order'}</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#012922] tracking-tight">
                            {isEdit ? data.no_order : 'New Work Order'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={submit} disabled={processing} className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all">
                        <SaveIcon /> {isEdit ? 'UPDATE WORK ORDER' : 'SAVE WORK ORDER'}
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-8 py-8">
                <form onSubmit={submit}>

                    {/* WORKFLOW TRACKER */}
                    <div className="mb-8 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded-full"></div>
                            {workflowSteps.map((step, idx) => {
                                const isCompleted = idx < currentStepIndex;
                                const isActive = idx === currentStepIndex;
                                const isPending = idx > currentStepIndex;
                                
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                            isActive ? 'bg-[#0b6e4f] text-white border-[#0b6e4f] shadow-md shadow-[#0b6e4f]/30 scale-110' :
                                            isCompleted ? 'bg-[#0b6e4f] text-white border-[#0b6e4f]' :
                                            'bg-white text-gray-400 border-gray-300'
                                        }`}>
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-[#0b6e4f]' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* WO HEADER CARD */}
                    <div className="bg-gradient-to-br from-[#012922] to-[#0b6e4f] rounded-xl p-6 mb-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10 grid grid-cols-5 gap-8 w-full">
                            <div>
                                <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">WO Number</div>
                                <div className="text-2xl font-black">{data.no_order}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">WO Type</div>
                                <select 
                                    value={data.wo_type}
                                    onChange={e => setData('wo_type', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white rounded text-sm h-8 px-2 focus:ring-white/30 font-bold uppercase w-full"
                                >
                                    <option className="text-gray-800" value="BREAKDOWN">BREAKDOWN</option>
                                    <option className="text-gray-800" value="SCHEDULE">SCHEDULE</option>
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Status</div>
                                <select 
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white rounded text-sm h-8 px-2 focus:ring-white/30 font-bold uppercase w-full"
                                >
                                    {workflowSteps.map(s => <option key={s} className="text-gray-800" value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Priority</div>
                                <select 
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white rounded text-sm h-8 px-2 focus:ring-white/30 font-bold uppercase w-full"
                                >
                                    <option className="text-gray-800" value="LOW">LOW</option>
                                    <option className="text-gray-800" value="MEDIUM">MEDIUM</option>
                                    <option className="text-gray-800" value="HIGH">HIGH</option>
                                    <option className="text-gray-800" value="CRITICAL">CRITICAL</option>
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Request Date</div>
                                <input 
                                    type="date" 
                                    value={data.tanggal}
                                    onChange={e => setData('tanggal', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white rounded text-sm h-8 px-2 focus:ring-white/30 font-bold w-full"
                                />
                                {errors.tanggal && <p className="text-red-300 text-sm mt-1">{errors.tanggal}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* ASSET INFORMATION */}
                        <div className={cardClass}>
                            <div className={cardHeaderClass}>
                                <TruckIcon />
                                <h2 className={cardTitleClass}>Asset Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={labelClass}>Unit Code <span className="text-red-500">*</span></label>
                                    <select 
                                        className={`${inputClass} font-bold text-[#012922]`} 
                                        value={data.unit_id} 
                                        onChange={e => setData('unit_id', e.target.value)}
                                    >
                                        <option value="">-- SELECT UNIT --</option>
                                        <option value="ATK">ATK</option>
                                        <option value="CONSUMABLE">CONSUMABLE</option>
                                        <option value="TOOL">TOOL</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.unit_id}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Equipment / Model</label>
                                        <div className={readonlyClass}>
                                            <LockIcon className="mr-2" />
                                            {selectedUnitType || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Current HM/KM</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                className={`${inputClass} pr-10`} 
                                                value={data.hm} 
                                                onChange={e => setData('hm', e.target.value)}
                                                onBlur={recalculateLifetimes}
                                                placeholder="Auto-fetch or Type..."
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">HM</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Location / Site</label>
                                    <input 
                                        type="text" 
                                        className={inputClass} 
                                        value={data.lokasi} 
                                        onChange={e => setData('lokasi', e.target.value)}
                                        placeholder="e.g. Pit 1 / Workshop"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MAINTENANCE REQUEST */}
                        <div className={cardClass}>
                            <div className={cardHeaderClass}>
                                <WrenchIcon />
                                <h2 className={cardTitleClass}>Maintenance Request</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={labelClass}>Problem / Failure Description <span className="text-red-500">*</span></label>
                                    <textarea 
                                        className={`${inputClass} h-[116px] py-3 resize-none`} 
                                        value={data.root_cause} 
                                        onChange={e => setData('root_cause', e.target.value)}
                                        placeholder="Describe the issue reported..."
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Component</label>
                                        <select 
                                            className={inputClass} 
                                            value={data.component} 
                                            onChange={e => setData('component', e.target.value)}
                                        >
                                            <option value="">-- Pilih Component --</option>
                                            {COMPONENTS.map(comp => (
                                                <option key={comp} value={comp}>{comp}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Component Name</label>
                                        <input 
                                            type="text" 
                                            className={inputClass} 
                                            value={data.component_name} 
                                            onChange={e => setData('component_name', e.target.value)}
                                            placeholder="Contoh: Engine, Hydraulic..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Request By</label>
                                        <input 
                                            type="text" 
                                            className={inputClass} 
                                            value={data.pic} 
                                            onChange={e => setData('pic', e.target.value)}
                                            placeholder="Reporter Name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JOB INFORMATION */}
                    <div className={cardClass}>
                        <div className={cardHeaderClass}>
                            <DocumentIcon />
                            <h2 className={cardTitleClass}>Job Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-12 gap-6">
                            <div className="col-span-8">
                                <label className={labelClass}>Job Instruction / Action Taken</label>
                                <textarea 
                                    className={`${inputClass} h-[116px] py-3 resize-none`} 
                                    value={data.action_taken} 
                                    onChange={e => setData('action_taken', e.target.value)}
                                    placeholder="Steps to repair, instructions for mechanic, or actions taken..."
                                ></textarea>
                            </div>
                            <div className="col-span-4 space-y-4">
                                <div>
                                    <label className={labelClass}>Supervisor / PIC</label>
                                    <input 
                                        type="text" 
                                        className={inputClass} 
                                        value={data.pic} 
                                        onChange={e => setData('pic', e.target.value)}
                                        placeholder="Supervisor Name"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Estimated Job Hours</label>
                                    <input 
                                        type="text" 
                                        className={inputClass} 
                                        placeholder="e.g. 4.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BREAKDOWN INFO (Conditional) */}
                    {data.wo_type === 'BREAKDOWN' && (
                        <div className={`${cardClass} border-red-200`}>
                            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h2 className="text-sm font-bold text-red-800 uppercase tracking-wide">Breakdown Information</h2>
                            </div>
                            <div className="p-6 grid grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}>Breakdown Start</label>
                                    <input type="datetime-local" className={inputClass} value={data.breakdown_start} onChange={e => setData('breakdown_start', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Breakdown Stop (RFU)</label>
                                    <input type="datetime-local" className={inputClass} value={data.breakdown_stop} onChange={e => setData('breakdown_stop', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Calculated Downtime</label>
                                    <div className={readonlyClass}>Auto-calculated...</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PARTS & MATERIAL */}
                    <div className={cardClass}>
                        <div className={`${cardHeaderClass} justify-between`}>
                            <div className="flex items-center gap-2">
                                <BoxIcon />
                                <h2 className={cardTitleClass}>Parts & Material</h2>
                            </div>
                            <button type="button" onClick={addPart} className="text-sm font-bold text-[#0b6e4f] bg-[#0b6e4f]/10 hover:bg-[#0b6e4f]/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                <PlusIcon /> Add Part
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Part Number</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/3">Description</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Life / Interval</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">PO / PR</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.parts.map((part, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2.5 px-6">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.part_number} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].part_number = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                    onBlur={() => handlePartNumberBlur(index)}
                                                    placeholder="P/N..."
                                                />
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.description} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].description = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                    placeholder="Part Name..."
                                                />
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="w-20 mx-auto block bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 text-center focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.qty} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].qty = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                />
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <input 
                                                    type="text" 
                                                    className="w-32 bg-gray-100 border border-gray-200 rounded text-sm px-3 py-2 h-9 text-gray-500 cursor-not-allowed"
                                                    value={part.life_time} 
                                                    readOnly
                                                    placeholder="Auto..."
                                                />
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        className="w-24 bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 placeholder-gray-300"
                                                        value={part.pr} 
                                                        onChange={e => {
                                                            const newParts = [...data.parts];
                                                            newParts[index].pr = e.target.value;
                                                            setData('parts', newParts);
                                                        }}
                                                        placeholder="PR No."
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className="w-24 bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 placeholder-gray-300"
                                                        value={part.po} 
                                                        onChange={e => {
                                                            const newParts = [...data.parts];
                                                            newParts[index].po = e.target.value;
                                                            setData('parts', newParts);
                                                        }}
                                                        placeholder="PO No."
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-6 text-center">
                                                <button type="button" onClick={() => removePart(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50">
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MANPOWER */}
                    <div className={cardClass}>
                        <div className={`${cardHeaderClass} justify-between`}>
                            <div className="flex items-center gap-2">
                                <UsersIcon />
                                <h2 className={cardTitleClass}>Manpower Assignment</h2>
                            </div>
                            <button type="button" className="text-sm font-bold text-[#0b6e4f] bg-[#0b6e4f]/10 hover:bg-[#0b6e4f]/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                <PlusIcon /> Add Mechanic
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/3">Mechanic Name</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Start</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Finish</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Man Hour</th>
                                        <th className="py-3 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-center w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-400 text-sm font-medium italic">
                                            No mechanics assigned yet. Click "Add Mechanic" to assign.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ATTACHMENTS */}
                    <div className={cardClass}>
                        <div className={`${cardHeaderClass} justify-between`}>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                <h2 className={cardTitleClass}>Attachments</h2>
                            </div>
                            <button type="button" className="text-sm font-bold text-[#0b6e4f] bg-[#0b6e4f]/10 hover:bg-[#0b6e4f]/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                <PlusIcon /> Upload File
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <p className="text-sm font-medium text-gray-500">Drag & drop files here, or <span className="text-[#0b6e4f] cursor-pointer hover:underline">browse</span></p>
                                <p className="text-sm mt-1">Supports JPG, PNG, PDF, Excel (Max 5MB)</p>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
