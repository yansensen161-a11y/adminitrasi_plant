import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

// Common Icons
const CalendarIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
);

const ListIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

const AttachmentIcon = () => (
    <svg className="w-6 h-6 transform -rotate-45" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-3.31-2.69-6-6-6S3 1.69 3 5v12.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5V6h-1.5z"/>
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
);

const UploadCloudIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
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

export default function Create({ units = [], manpowers = [], tools = [] }) {
    // Read query params to pre-fill from monitoring board click
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const preUnitId  = queryParams.get('unit_id')  || '';
    const preTipeWo  = queryParams.get('tipe_wo')  || 'BREAKDOWN';

    const { data, setData, post, processing, errors, transform } = useForm({
        tipe_wo: preTipeWo,
        downtime_code: preTipeWo === 'SCHEDULE' ? 'Schedule' : 'Unschedule',
        site: '',
        unit_id: preUnitId,
        waktu_breakdown: '',
        waktu_rfu: '',
        durasi_hrs: 0,
        hm_unit: 0,
        keterangan: '',
        status_wo: 'OPEN',
        tasks: [
            { id: 1, group_component: '', component: '', task_description: '', mechanic: '', tools: [], target_date: '', status: 'Open' }
        ]
    });

    const handleAddTask = () => {
        setData('tasks', [...data.tasks, { id: data.tasks.length + 1, group_component: '', component: '', task_description: '', mechanic: '', tools: [], target_date: '', status: 'Open' }]);
    };

    const handleRemoveTask = (id) => {
        setData('tasks', data.tasks.filter(t => t.id !== id));
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...data.tasks];
        newTasks[index][field] = value;
        setData('tasks', newTasks);
    };

    const selectedUnit = units.find(u => u.id.toString() === data.unit_id) || null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            waktu_breakdown: data.waktu_breakdown ? data.waktu_breakdown.replace('T', ' ') + ':00' : null,
            waktu_rfu: data.waktu_rfu ? data.waktu_rfu.replace('T', ' ') + ':00' : null,
        }));
        
        post('/work-orders', { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Work Order Baru" />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-10">
                {/* Header Top */}
                <div className="bg-white dark:bg-[#060b14] px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="text-gray-500 cursor-pointer lg:hidden">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </div>
                        <Link href="/work-orders" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight">Buat Work Order Baru</h1>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Order</Link>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-blue-600 dark:text-blue-400">Buat Work Order Baru</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded border border-gray-100 dark:border-white/10">
                            <CalendarIcon />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-none">Selasa, 09 September 2026</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none mt-1">21:05:12</span>
                            </div>
                        </div>
                        
                        <div className="relative cursor-pointer">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">5</span>
                        </div>

                        <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                            <div className="w-8 h-8 bg-[#012922] rounded-full flex items-center justify-center text-white">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 leading-none">YANSEN</span>
                                <span className="text-xs text-gray-500 font-medium leading-none mt-1">Planner</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
                    
                    {/* Section 1: Informasi Work Order Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0b6e4f] text-white rounded flex items-center justify-center shrink-0 shadow-sm">
                            <DocumentIcon />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-[#012922] dark:text-white">Informasi Work Order</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lengkapi seluruh informasi untuk membuat work order baru</p>
                        </div>
                    </div>

                    {/* Section 1: Main Content 4 Columns */}
                    <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/10">
                        
                        {/* Col 1 */}
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-[#0b6e4f] text-white flex items-center justify-center text-sm font-bold">1</div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white">Informasi Work Order</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">No WO</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-gray-300 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" value="WO-09-26-0001" readOnly />
                                    <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition whitespace-nowrap">Auto Generate</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tipe WO</label>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setData('tipe_wo', 'BREAKDOWN')}
                                        className={`flex-1 py-2 rounded text-sm font-bold border transition-colors flex items-center justify-center gap-1 ${
                                            data.tipe_wo === 'BREAKDOWN' 
                                            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400' 
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                                        </svg>
                                        BREAKDOWN
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('tipe_wo', 'SCHEDULE')}
                                        className={`flex-1 py-2 rounded text-sm font-bold border transition-colors flex items-center justify-center gap-1 ${
                                            data.tipe_wo === 'SCHEDULE' 
                                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' 
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <CalendarIcon />
                                        SCHEDULE
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Downtime Code</label>
                                <select value={data.downtime_code} onChange={e => setData('downtime_code', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]">
                                    <option value="Unschedule">Unschedule</option>
                                    <option value="Schedule">Schedule</option>
                                    <option value="Accident">Accident</option>
                                    <option value="Opportunity">Opportunity</option>
                                </select>
                            </div>

                            {/* Prioritas & Departement removed */}
                        </div>

                        {/* Col 2 */}
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white">Data Unit</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                                <select value={data.site} onChange={e => setData('site', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" required>
                                    <option value="">-- Pilih Site --</option>
                                    <option value="Harindo Wahana">Harindo Wahana</option>
                                    <option value="Bukit Baiduri Energy">Bukit Baiduri Energy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                    value={data.unit_id}
                                    onChange={(e) => {
                                        setData('unit_id', e.target.value);
                                        const selected = units.find(u => u.id.toString() === e.target.value);
                                        if(selected) setData('hm_unit', selected.current_hm || 0);
                                    }}
                                    required
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded p-4 mt-2">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 shrink-0 opacity-50 dark:opacity-30">
                                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Dummy Excavator outline */}
                                            <path d="M70 60L65 50L50 50L45 40L30 40L20 50L15 60L70 60Z" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="25" cy="65" r="5" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="45" cy="65" r="5" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="65" cy="65" r="5" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M65 50L80 45L85 55L75 60" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400 gap-1 flex-1 font-medium">
                                        <div className="flex"><span className="w-24">Model</span>: <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">{selectedUnit?.model || '-'}</span></div>
                                        <div className="flex"><span className="w-24">Serial Number</span>: <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">{selectedUnit?.serial_number || '-'}</span></div>
                                        <div className="flex"><span className="w-24">Engine Model</span>: <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">{selectedUnit?.engine_model || '-'}</span></div>
                                        <div className="flex"><span className="w-24">Current HM</span>: <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">{selectedUnit?.current_hm || '-'}</span></div>
                                        <div className="flex"><span className="w-24">Lokasi</span>: <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">{selectedUnit?.lokasi || '-'}</span></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="w-full py-2 bg-blue-50 border border-blue-200 rounded text-blue-600 text-sm font-bold hover:bg-blue-100 transition flex justify-center items-center gap-2">
                                <EyeIcon /> Lihat Detail Unit
                            </button>
                        </div>

                        {/* Col 3 */}
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white">Waktu & Target</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Waktu Breakdown</label>
                                <div className="relative">
                                    <input 
                                        type="datetime-local" 
                                        value={data.waktu_breakdown || ''}
                                        onChange={e => setData('waktu_breakdown', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:color-scheme-dark transition-all" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Waktu Ready For Use (RFU)</label>
                                <div className="relative">
                                    <input 
                                        type="datetime-local" 
                                        value={data.waktu_rfu || ''}
                                        onChange={e => setData('waktu_rfu', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:color-scheme-dark transition-all" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Durasi (Hrs)</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" value={data.durasi_hrs} onChange={e => setData('durasi_hrs', e.target.value)} />
                            </div>
                            
                            {/* Target Selesai removed based on request */}
                        </div>

                        {/* Col 4 */}
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white">Deskripsi Pekerjaan</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi Kerusakan / Pekerjaan <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows="4" 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] resize-none"
                                    placeholder="Uraikan kerusakan, gejala, atau pekerjaan yang diperlukan..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Component Group</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]">
                                    <option value="">-- Pilih Component Group --</option>
                                    {COMPONENTS.map(comp => (
                                        <option key={comp} value={comp}>{comp}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Model / System</label>
                                <input type="text" placeholder="Contoh: Engine, Hydraulic, Undercarriage, Electrical" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" />
                            </div>
                        </div>

                    </div>

                    {/* Section 2: Daftar Task & Tindakan */}
                    <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#0b6e4f] text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ListIcon />
                                <div>
                                    <h3 className="font-bold text-sm">Daftar Task & Tindakan</h3>
                                    <p className="text-sm text-[#86c4a6]">Tambahkan pekerjaan, pemeriksaan dan tindakan yang harus dilakukan</p>
                                </div>
                            </div>
                            <button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-bold flex items-center gap-1.5 transition">
                                <span className="text-lg leading-none">+</span> Tambah Task
                            </button>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-12 text-center">No</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[250px]">Task / Pekerjaan</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-48">Component</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-40">PIC</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-40">Tools</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-48">Target</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[220px]">Status</th>
                                        <th className="py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 w-20 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tasks.map((t, i) => (
                                        <tr key={t.id} className="border-b border-gray-100 dark:border-white/5">
                                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-center">{i + 1}</td>
                                            <td className="py-3 px-4">
                                                <input type="text" className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" placeholder="Masukkan task / pekerjaan..." value={t.task_description} onChange={e => handleTaskChange(i, 'task_description', e.target.value)} />
                                            </td>
                                            <td className="py-3 px-4">
                                                <select className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" value={t.component} onChange={e => handleTaskChange(i, 'component', e.target.value)}>
                                                    <option value="">-- Pilih --</option>
                                                    {COMPONENTS.map(comp => (
                                                        <option key={comp} value={comp}>{comp}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" value={t.mechanic} onChange={e => handleTaskChange(i, 'mechanic', e.target.value)}>
                                                    <option value="">-- PIC --</option>
                                                    {manpowers.map(mp => (
                                                        <option key={mp.id} value={mp.nama}>{mp.nama}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select multiple className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" value={t.tools || []} onChange={e => {
                                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                                    handleTaskChange(i, 'tools', values);
                                                }}>
                                                    {tools.map(tool => (
                                                        <option key={tool.id} value={tool.name}>{tool.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="relative">
                                                    <input 
                                                        type="datetime-local" 
                                                        value={t.target_date || ''}
                                                        onChange={e => handleTaskChange(i, 'target_date', e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-[13px] dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:color-scheme-dark" 
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select 
                                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                    value={t.status || 'B0 ( On progress )'}
                                                    onChange={e => handleTaskChange(i, 'status', e.target.value)}
                                                >
                                                    <option value="B0 ( On progress )">B0 ( On progress )</option>
                                                    <option value="B1 ( Waiting parts )">B1 ( Waiting parts )</option>
                                                    <option value="B2 ( Waiting sarana )">B2 ( Waiting sarana )</option>
                                                    <option value="B3 ( Waiting Tools )">B3 ( Waiting Tools )</option>
                                                    <option value="B4 ( Waiting Manpower )">B4 ( Waiting Manpower )</option>
                                                    <option value="B5 ( Outsite Repair )">B5 ( Outsite Repair )</option>
                                                    <option value="B6 (Production/ abiuse )">B6 (Production/ abiuse )</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button type="button" onClick={() => handleRemoveTask(t.id)} className="p-1.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition">
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Tambahan & Attachment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Catatan Tambahan */}
                        <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-[#0b6e4f]"><DocumentIcon /></div>
                                <div>
                                    <h3 className="font-bold text-sm text-[#012922] dark:text-white">Catatan Tambahan</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Informasi tambahan terkait work order ini</p>
                                </div>
                            </div>
                            <textarea 
                                rows="3" 
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] resize-none"
                                placeholder="Masukkan catatan tambahan jika diperlukan..."
                                value={data.keterangan}
                                onChange={e => setData('keterangan', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Attachment */}
                        <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-blue-500"><AttachmentIcon /></div>
                                <div>
                                    <h3 className="font-bold text-sm text-[#012922] dark:text-white">Attachment (Dokumen / Foto)</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload foto kerusakan, dokumen pendukung, dll.</p>
                                </div>
                            </div>
                            
                            <div className="border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-lg bg-blue-50/30 dark:bg-blue-500/5 p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition cursor-pointer">
                                <div className="text-[#0b2948] dark:text-blue-400 mb-2"><UploadCloudIcon /></div>
                                <div className="font-bold text-sm text-[#012922] dark:text-white mb-1">Klik atau drag file ke sini</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Format: JPG, PNG, PDF (Max 5 MB)</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Dokumen Terkait */}
                    <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm p-5 mt-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
                            <div className="text-purple-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white">Tindakan Lanjutan (Pembuatan Dokumen)</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Buat dokumen terkait untuk work order ini</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            <a 
                                href="/monitoring-orderan/create" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-blue-200 dark:border-blue-500/20 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                Create Order List
                            </a>

                            <a 
                                href="/failure-analysis/create" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-red-200 dark:border-red-500/20 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Buat FAR
                            </a>

                            <a 
                                href="/abr/create" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-orange-200 dark:border-orange-500/20 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Buat ABR
                            </a>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10 mt-2 mb-8">
                        <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Reset Form
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                Simpan Draft
                            </button>
                            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-[#0b6e4f] text-white rounded font-bold text-sm hover:bg-[#095940] transition shadow-sm disabled:opacity-50">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                Buat Work Order
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
