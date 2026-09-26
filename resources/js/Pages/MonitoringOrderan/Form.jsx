import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
const EyeIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const XIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

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

export default function Form({ units, order, mode, suggestedNoOrder = '' }) {
    const { manpowerList = [] } = usePage().props;
    const isEdit = mode === 'edit';
    
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

    const normalizePriority = (prio) => {
        const p = (prio || '').toUpperCase().trim();
        if (p === 'HIGH' || p === 'P1') return 'P1';
        if (p === 'MEDIUM' || p === 'P2') return 'P2';
        if (p === 'LOW' || p === 'P3') return 'P3';
        if (p === 'BACKLOG') return 'BACKLOG';
        return p || 'P1';
    };

    let paramUnitId = derivedUnitId;
    let paramHm = '';
    let paramComponent = '';
    let paramComponentName = '';
    let paramPriority = 'P1';
    let paramRootCause = '';
    let paramActionTaken = '';
    let returnTo = '';
    let paramNoWo = '';
    let paramNoOrder = '';
    let paramPr = '';
    let paramPo = '';
    let paramEtaPart = '';

    if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('return_to')) returnTo = sp.get('return_to');
        if (!isEdit) {
            const qUnitId = sp.get('unit_id');
            const qCodeUnit = sp.get('code_unit');
            if (qUnitId) {
                paramUnitId = qUnitId;
            } else if (qCodeUnit && units && units.length > 0) {
                const matched = units.find(u => u.code_unit?.toLowerCase() === qCodeUnit?.toLowerCase());
                if (matched) paramUnitId = matched.id;
            }
            if (sp.get('hm')) paramHm = sp.get('hm');
            if (sp.get('component')) paramComponent = sp.get('component');
            if (sp.get('component_name')) paramComponentName = sp.get('component_name');
            if (sp.get('priority')) paramPriority = normalizePriority(sp.get('priority'));
            if (sp.get('root_cause') || sp.get('finding')) paramRootCause = sp.get('root_cause') || sp.get('finding');
            if (sp.get('action_taken') || sp.get('action')) paramActionTaken = sp.get('action_taken') || sp.get('action');
            if (sp.get('no_wo')) paramNoWo = sp.get('no_wo');
            if (sp.get('no_order')) paramNoOrder = sp.get('no_order');
            if (sp.get('pr')) paramPr = sp.get('pr');
            if (sp.get('po')) paramPo = sp.get('po');
            if (sp.get('eta_part')) paramEtaPart = sp.get('eta_part');
        }
    }

    // Parse order data for edit / create
    let initialParts = [{
        component: paramComponent || '',
        component_name: paramComponentName || '',
        part_number: '',
        description: '',
        life_time: '',
        qty: 1,
        satuan: 'Pcs',
        pr: paramPr || '',
        po: paramPo || '',
        due_date_part: paramEtaPart || '',
        swap_to_unit_id: ''
    }];
    if (isEdit && order.parts && order.parts.length > 0) {
        initialParts = order.parts.map(p => ({
            component: p.component || order.component || '',
            component_name: p.component_name || order.component_name || '',
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

    const { data, setData, post, processing, errors } = useForm({
        no_order: isEdit ? order.no_order : (paramNoOrder || suggestedNoOrder || 'HW-MOL-01502'),
        tanggal: isEdit ? order.tanggal : new Date().toISOString().split('T')[0],
        unit_id: isEdit ? derivedUnitId : (paramUnitId || ''),
        hm: isEdit ? order.hm : (paramHm || ''),
        component: isEdit ? order.component || (order.parts && order.parts[0]?.component) || (order.parts && order.parts[0]?.department) || '' : (paramComponent || ''),
        lokasi: derivedLokasi,
        priority: isEdit ? normalizePriority(order.priority) : (paramPriority || 'P1'),
        status: isEdit ? order.status : 'OPEN',
        pic: isEdit ? order.pic : '',
        root_cause: isEdit ? order.root_cause : (paramRootCause || ''),
        component_name: isEdit ? order.component_name : (paramComponentName || ''),
        action_taken: isEdit ? order.action_taken : (paramActionTaken || ''), // Job Instruction
        parts: initialParts,
        attachments: [],
        existing_attachments: isEdit && Array.isArray(order?.attachments) ? order.attachments : [],
        _method: isEdit ? 'put' : 'post',
        return_to: returnTo || '',
        
        // UI Only - Doesn't map exactly to backend right now, but structured here
        wo_type: 'SCHEDULE',
        breakdown_start: '',
        breakdown_stop: '',
    });

    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewModalItem, setPreviewModalItem] = useState(null);
    const [newAttachmentPreviews, setNewAttachmentPreviews] = useState([]);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [activeOrderWarnings, setActiveOrderWarnings] = useState({});
    const [historyModalData, setHistoryModalData] = useState(null);

    useEffect(() => {
        return () => {
            newAttachmentPreviews.forEach(item => {
                if (item.url) URL.revokeObjectURL(item.url);
            });
        };
    }, [newAttachmentPreviews]);

    const handleFilesSelected = (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        const filesArray = Array.from(selectedFiles);
        const validFiles = [];
        const newPreviews = [];

        for (const file of filesArray) {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" melebihi batas ukuran 10MB.`);
                continue;
            }

            const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
            const previewUrl = isImg ? URL.createObjectURL(file) : null;
            const previewId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            validFiles.push(file);
            newPreviews.push({
                id: previewId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                url: previewUrl,
                isNew: true,
            });
        }

        if (validFiles.length > 0) {
            setData(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), ...validFiles],
            }));
            setNewAttachmentPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewAttachment = (index) => {
        const itemToRemove = newAttachmentPreviews[index];
        if (itemToRemove && itemToRemove.url) {
            URL.revokeObjectURL(itemToRemove.url);
        }

        setNewAttachmentPreviews(prev => prev.filter((_, idx) => idx !== index));
        setData(prev => ({
            ...prev,
            attachments: (prev.attachments || []).filter((_, idx) => idx !== index),
        }));
    };

    const removeExistingAttachment = (index) => {
        setData(prev => ({
            ...prev,
            existing_attachments: (prev.existing_attachments || []).filter((_, idx) => idx !== index),
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelected(e.dataTransfer.files);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImageFile = (item) => {
        if (item.type && item.type.startsWith('image/')) return true;
        if (item.mime && item.mime.startsWith('image/')) return true;
        const name = item.name || item.path || '';
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);
    };

    const getFileTypeInfo = (item) => {
        const name = (item.name || item.path || '').toLowerCase();
        if (/\.(pdf)$/i.test(name)) return { label: 'PDF', badgeClass: 'bg-red-50 text-red-700 border-red-200' };
        if (/\.(xlsx|xls|csv)$/i.test(name)) return { label: 'EXCEL', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (/\.(docx|doc)$/i.test(name)) return { label: 'WORD', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
        if (isImageFile(item)) return { label: 'IMAGE', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' };
        return { label: 'FILE', badgeClass: 'bg-gray-50 text-gray-700 border-gray-200' };
    };

    const [selectedUnitModel, setSelectedUnitModel] = useState('');
    const [selectedUnitType, setSelectedUnitType] = useState('');

    useEffect(() => {
        if (data.unit_id && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
            const unit = units.find(u => u.id == data.unit_id);
            if (unit) {
                setSelectedUnitModel(unit.code_unit || '');
                setSelectedUnitType(unit.type_unit || '');
                
                // Fallback to unit master HM immediately so it doesn't stay empty
                if (unit.hm) {
                    setData('hm', unit.hm);
                }
                
                // Fetch HM automatically for the specific date if needed
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
            setData('hm', '');
        }
    }, [data.unit_id, data.tanggal]);

    const handlePartNumberBlur = async (index) => {
        const rawPn = data.parts[index]?.part_number || '';
        const partNumber = rawPn.trim().toUpperCase();

        if (!partNumber || partNumber === '-') return;

        // 1. Cek duplikat Part Number di dalam order yang sama
        const duplicateIdx = data.parts.findIndex((p, i) => i !== index && (p.part_number || '').trim().toUpperCase() === partNumber);
        if (duplicateIdx !== -1) {
            setDuplicateWarning(`Part Number "${partNumber}" sudah ada di baris ke-${duplicateIdx + 1} dalam order ini! Part Number tidak boleh sama dalam 1 order.`);
            setData(currentData => {
                const newParts = [...currentData.parts];
                newParts[index].part_number = '';
                return { ...currentData, parts: newParts };
            });
            return;
        } else {
            setDuplicateWarning(null);
        }

        // 2. Cek Part Lifetime & Smart Active Order Warning
        if (data.unit_id && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
            try {
                const [lifetimeRes, activeRes] = await Promise.all([
                    axios.get(route('monitoring-orderan.part-lifetime'), {
                        params: { unit_id: data.unit_id, part_number: partNumber, current_hm: data.hm, order_id: isEdit ? order.id : null }
                    }).catch(() => ({ data: { life_time: null } })),
                    axios.get(route('part-order-lifetime.check-active'), {
                        params: { unit_id: data.unit_id, part_number: partNumber, current_order_id: isEdit ? order.id : null }
                    }).catch(() => ({ data: { has_active_order: false } }))
                ]);

                if (lifetimeRes.data?.life_time !== null && lifetimeRes.data?.life_time !== undefined) {
                    setData(currentData => {
                        const newParts = [...currentData.parts];
                        if (newParts[index]) newParts[index].life_time = lifetimeRes.data.life_time;
                        return { ...currentData, parts: newParts };
                    });
                }

                if (activeRes.data?.has_active_order) {
                    setActiveOrderWarnings(prev => ({
                        ...prev,
                        [index]: activeRes.data
                    }));
                } else {
                    setActiveOrderWarnings(prev => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch part lifetime or active check", error);
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

    const addPart = () => setData('parts', [
        ...data.parts,
        {
            component: '',
            component_name: '',
            part_number: '',
            description: '',
            life_time: '',
            qty: 1,
            satuan: 'Pcs',
            pr: '',
            po: '',
            due_date_part: '',
            swap_to_unit_id: ''
        }
    ]);

    const removePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);

        // Bersihkan warning baris ini
        setActiveOrderWarnings(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const submit = (e) => {
        e.preventDefault();

        // Validasi ketat duplikat Part Number sebelum submit
        const seenPns = new Set();
        for (let i = 0; i < data.parts.length; i++) {
            const pn = (data.parts[i].part_number || '').trim().toUpperCase();
            if (pn && pn !== '-') {
                if (seenPns.has(pn)) {
                    setDuplicateWarning(`Part Number "${pn}" terdeteksi duplikat! Tidak boleh menginput Part Number yang sama dalam 1 order.`);
                    alert(`Part Number "${pn}" terdeteksi duplikat dalam order ini! Harap periksa dan hapus duplikat sebelum menyimpan.`);
                    return;
                }
                seenPns.add(pn);
            }
        }

        if (isEdit) {
            post(route('monitoring-orderan.update', order.id) + (returnTo ? '?return_to=' + encodeURIComponent(returnTo) : ''), {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            post(route('monitoring-orderan.store') + (returnTo ? '?return_to=' + encodeURIComponent(returnTo) : ''), {
                forceFormData: true,
                preserveScroll: true,
            });
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between mb-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
                <div className="flex items-center gap-4">
                    <Link 
                        href={returnTo || "/monitoring-orderan"} 
                        className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        title={returnTo ? "Kembali ke Work Order" : "Kembali ke Monitoring Order"}
                    >
                        <ArrowLeft />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                            <Link href={returnTo || "/monitoring-orderan"} className="hover:text-[#0b6e4f]">
                                {returnTo ? 'Work Order' : 'Monitoring Order'}
                            </Link> 
                            <span>/</span> 
                            <span>{isEdit ? 'Edit Work Order' : 'Create Work Order'}</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#012922] tracking-tight">
                            {isEdit ? data.no_order : `New Work Order (${data.no_order})`}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {returnTo && (
                        <Link
                            href={returnTo}
                            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-gray-300 shadow-xs"
                            title="Kembali ke Work Order tanpa menyimpan perubahan"
                        >
                            <ArrowLeft />
                            <span>Kembali ke WO</span>
                        </Link>
                    )}
                    {isEdit && (
                        <button
                            type="button"
                            onClick={() => window.open(route('monitoring-orderan.print', order.id) + '?autoprint=1', '_blank')}
                            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-95"
                            title={`Cetak Dokumen MOL (${order.no_order})`}
                        >
                            <PrintIcon />
                            <span>PRINT MOL</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className={`flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all ${
                            processing ? "opacity-75 cursor-not-allowed" : "active:scale-95"
                        }`}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>MENYIMPAN...</span>
                            </>
                        ) : (
                            <>
                                <SaveIcon /> <span>{isEdit ? 'UPDATE WORK ORDER' : 'SAVE WORK ORDER'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="w-full">
                {returnTo && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5 text-sm font-medium">
                            <span className="text-lg">🔗</span>
                            <span>
                                Pembuatan Order List ini terhubung dengan <strong>Work Order {paramNoWo ? `(${paramNoWo})` : ''}</strong>. 
                                Setelah Anda menekan <strong>SAVE WORK ORDER</strong>, sistem akan otomatis mengarahkan Anda kembali ke Work Order tersebut.
                            </span>
                        </div>
                        <Link
                            href={returnTo}
                            className="text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900 transition whitespace-nowrap self-start sm:self-auto text-center"
                        >
                            &larr; Batalkan & Kembali ke WO
                        </Link>
                    </div>
                )}
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
                                <div className="text-2xl font-black font-mono tracking-wider text-emerald-300">{data.no_order}</div>
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
                                    <option className="text-gray-800" value="P1">P1</option>
                                    <option className="text-gray-800" value="P2">P2</option>
                                    <option className="text-gray-800" value="P3">P3</option>
                                    <option className="text-gray-800" value="BACKLOG">Backlog</option>
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
                                                className={`w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 h-11 pl-3 pr-10 cursor-not-allowed shadow-inner focus:outline-none`} 
                                                value={data.hm} 
                                                readOnly
                                                placeholder="Auto-fetched..."
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
                                <div>
                                    <label className={labelClass}>Request By</label>
                                    <select 
                                        className={inputClass} 
                                        value={data.pic} 
                                        onChange={e => setData('pic', e.target.value)}
                                    >
                                        <option value="">-- Pilih Request By (Manpower) --</option>
                                        {manpowerList && manpowerList.length > 0 ? (
                                            manpowerList.map(mp => (
                                                <option key={mp.id} value={mp.nama}>
                                                    {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                </option>
                                            ))
                                        ) : null}
                                        {data.pic && !manpowerList?.some(mp => mp.nama === data.pic) && (
                                            <option value={data.pic}>{data.pic}</option>
                                        )}
                                    </select>
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
                                    <select 
                                        className={inputClass} 
                                        value={data.pic} 
                                        onChange={e => setData('pic', e.target.value)}
                                    >
                                        <option value="">-- Pilih Supervisor / PIC --</option>
                                        {manpowerList && manpowerList.length > 0 ? (
                                            manpowerList.map(mp => (
                                                <option key={mp.id} value={mp.nama}>
                                                    {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                </option>
                                            ))
                                        ) : null}
                                        {data.pic && !manpowerList?.some(mp => mp.nama === data.pic) && (
                                            <option value={data.pic}>{data.pic}</option>
                                        )}
                                    </select>
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

                        {duplicateWarning && (
                            <div className="m-4 p-3.5 rounded-lg bg-red-50 border border-red-300 flex items-start justify-between gap-3 text-red-800 shadow-sm animate-pulse">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚫</span>
                                    <div>
                                        <strong className="block text-xs uppercase tracking-wide font-bold">Input Part Number Duplikat Ditolak!</strong>
                                        <p className="text-xs text-red-700">{duplicateWarning}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setDuplicateWarning(null)} className="text-red-500 hover:text-red-700 font-bold text-sm">✕</button>
                            </div>
                        )}

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Component</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Component Name</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Part Number</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Description</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Life / Interval</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">PO / PR</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.parts.map((part, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            {/* COMPONENT */}
                                            <td className="py-2.5 px-4 align-top">
                                                <select 
                                                    className="w-44 bg-white border border-gray-300 rounded text-sm px-2.5 py-1.5 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20 font-medium"
                                                    value={part.component || ''} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].component = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                >
                                                    <option value="">-- Pilih Component --</option>
                                                    {COMPONENTS.map(comp => (
                                                        <option key={comp} value={comp}>{comp}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* COMPONENT NAME */}
                                            <td className="py-2.5 px-4 align-top">
                                                <input 
                                                    type="text" 
                                                    className="w-44 bg-white border border-gray-300 rounded text-sm px-3 py-1.5 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.component_name || ''} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].component_name = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                    placeholder="Contoh: Engine, Hydraulic..."
                                                />
                                            </td>

                                            {/* PART NUMBER */}
                                            <td className="py-2.5 px-4 align-top">
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        className={`w-40 bg-white border ${activeOrderWarnings[index] ? 'border-amber-400 ring-1 ring-amber-300' : 'border-gray-300'} rounded text-sm px-3 py-2 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20 font-mono`}
                                                        value={part.part_number} 
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const newParts = [...data.parts];
                                                            newParts[index].part_number = val;
                                                            setData('parts', newParts);

                                                            // Cek duplikat saat mengetik / menempel (paste)
                                                            const upperVal = val.trim().toUpperCase();
                                                            if (upperVal && upperVal !== '-') {
                                                                const isDup = data.parts.some((p, i) => i !== index && (p.part_number || '').trim().toUpperCase() === upperVal);
                                                                if (isDup) {
                                                                    setDuplicateWarning(`Part Number "${upperVal}" sudah ada dalam daftar order ini! Tidak boleh menginput Part Number yang sama dalam 1 order.`);
                                                                    newParts[index].part_number = '';
                                                                    setData('parts', newParts);
                                                                } else if (duplicateWarning && duplicateWarning.includes(upperVal)) {
                                                                    setDuplicateWarning(null);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={() => handlePartNumberBlur(index)}
                                                        placeholder="P/N..."
                                                    />
                                                    {activeOrderWarnings[index] && (
                                                        <div className="mt-1 max-w-[220px] bg-amber-50 border border-amber-300 rounded p-1.5 text-[11px] text-amber-900 shadow-sm leading-tight">
                                                            <div className="flex items-center gap-1 font-bold text-amber-800">
                                                                <span>⚠️ Ada Order Aktif!</span>
                                                            </div>
                                                            <div className="mt-0.5 text-[10px] text-amber-700">
                                                                No Order: <span className="font-mono font-bold">{activeOrderWarnings[index].active_orders[0]?.no_order}</span>
                                                                <span className="ml-1 px-1 bg-amber-200/80 rounded font-bold text-[9px]">{activeOrderWarnings[index].active_orders[0]?.status}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setHistoryModalData(activeOrderWarnings[index])}
                                                                className="mt-1 text-[10px] text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-0.5 cursor-pointer"
                                                            >
                                                                Lihat Histori ({activeOrderWarnings[index].recent_history?.length || 0})
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* DESCRIPTION */}
                                            <td className="py-2.5 px-4">
                                                <input 
                                                    type="text" 
                                                    className="w-full min-w-[180px] bg-white border border-gray-300 rounded text-sm px-3 py-2 h-9 focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.description} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].description = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                    placeholder="Part Name..."
                                                />
                                            </td>

                                            {/* QTY */}
                                            <td className="py-2.5 px-4">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="w-16 mx-auto block bg-white border border-gray-300 rounded text-sm px-2 py-1.5 h-9 text-center focus:border-[#0b6e4f] focus:ring focus:ring-[#0b6e4f]/20"
                                                    value={part.qty} 
                                                    onChange={e => {
                                                        const newParts = [...data.parts];
                                                        newParts[index].qty = e.target.value;
                                                        setData('parts', newParts);
                                                    }}
                                                />
                                            </td>

                                            {/* LIFE / INTERVAL */}
                                            <td className="py-2.5 px-4">
                                                <input 
                                                    type="text" 
                                                    className="w-28 bg-gray-100 border border-gray-200 rounded text-sm px-3 py-2 h-9 text-gray-500 cursor-not-allowed text-center"
                                                    value={part.life_time} 
                                                    readOnly
                                                    placeholder="Auto..."
                                                />
                                            </td>

                                            {/* PO / PR */}
                                            <td className="py-2.5 px-4">
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

                                            {/* ACTION */}
                                            <td className="py-2.5 px-4 text-center">
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
                                {((data.existing_attachments?.length || 0) + newAttachmentPreviews.length > 0) && (
                                    <span className="ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0b6e4f]/10 text-[#0b6e4f]">
                                        {(data.existing_attachments?.length || 0) + newAttachmentPreviews.length} File
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-bold text-[#0b6e4f] bg-[#0b6e4f]/10 hover:bg-[#0b6e4f]/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <PlusIcon /> Upload File
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    handleFilesSelected(e.target.files);
                                    e.target.value = '';
                                }}
                            />

                            {/* Dropzone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                    isDragging
                                        ? 'border-[#0b6e4f] bg-[#0b6e4f]/5 ring-4 ring-[#0b6e4f]/20 scale-[1.01]'
                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-300'
                                }`}
                            >
                                <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-colors ${
                                    isDragging ? 'bg-[#0b6e4f] text-white' : 'bg-gray-200/70 text-gray-500'
                                }`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-700">
                                    Drag & drop files here, or <span className="text-[#0b6e4f] underline">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Mendukung JPG, PNG, WEBP, PDF, Excel, Word (Maks. 10MB per file)
                                </p>
                            </div>

                            {/* Validation Errors */}
                            {errors && Object.keys(errors).some(k => k.startsWith('attachments')) && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {Object.entries(errors)
                                        .filter(([k]) => k.startsWith('attachments'))
                                        .map(([k, err]) => (
                                            <div key={k}>{err}</div>
                                        ))}
                                </div>
                            )}

                            {/* Attachments List */}
                            {((data.existing_attachments?.length || 0) + newAttachmentPreviews.length > 0) && (
                                <div className="mt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Daftar Lampiran ({(data.existing_attachments?.length || 0) + newAttachmentPreviews.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {/* Existing Attachments */}
                                        {data.existing_attachments?.map((item, idx) => {
                                            const isImg = isImageFile(item);
                                            const typeInfo = getFileTypeInfo(item);
                                            const fileUrl = item.url || (item.path ? `/storage/${item.path}` : '#');

                                            return (
                                                <div
                                                    key={item.id || `exist-${idx}`}
                                                    className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                                                >
                                                    {/* Thumbnail or File Icon */}
                                                    <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100">
                                                        {isImg ? (
                                                            <img
                                                                src={fileUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                                <DocumentIcon />
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${typeInfo.badgeClass}`}>
                                                                    {typeInfo.label}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Quick overlay preview button */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {isImg && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewModalItem({ url: fileUrl, name: item.name, isImage: true })}
                                                                    className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition-all hover:scale-110 cursor-pointer"
                                                                    title="Lihat Gambar"
                                                                >
                                                                    <EyeIcon />
                                                                </button>
                                                            )}
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition-all hover:scale-110 cursor-pointer"
                                                                title="Buka / Unduh"
                                                            >
                                                                <DownloadIcon />
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {/* File Metadata */}
                                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                                    Tersimpan
                                                                </span>
                                                                {item.size ? (
                                                                    <span className="text-[11px] text-gray-400 font-medium">
                                                                        {formatBytes(item.size)}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <p
                                                                className="text-xs font-bold text-gray-800 truncate"
                                                                title={item.name || 'Attachment'}
                                                            >
                                                                {item.name || 'Attachment'}
                                                            </p>
                                                        </div>

                                                        {/* Action remove */}
                                                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-gray-500 hover:text-[#0b6e4f] font-semibold flex items-center gap-1"
                                                            >
                                                                <span>Unduh</span>
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingAttachment(idx)}
                                                                className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                                title="Hapus Lampiran"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* New Attachments */}
                                        {newAttachmentPreviews.map((item, idx) => {
                                            const isImg = isImageFile(item);
                                            const typeInfo = getFileTypeInfo(item);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group relative bg-white border border-[#0b6e4f]/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ring-1 ring-[#0b6e4f]/10"
                                                >
                                                    {/* Thumbnail or File Icon */}
                                                    <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100">
                                                        {isImg && item.url ? (
                                                            <img
                                                                src={item.url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                                <DocumentIcon />
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${typeInfo.badgeClass}`}>
                                                                    {typeInfo.label}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Quick overlay preview button */}
                                                        {isImg && item.url && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewModalItem({ url: item.url, name: item.name, isImage: true })}
                                                                    className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition-all hover:scale-110 cursor-pointer"
                                                                    title="Lihat Gambar"
                                                                >
                                                                    <EyeIcon />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* File Metadata */}
                                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                                                    Baru
                                                                </span>
                                                                <span className="text-[11px] text-gray-400 font-medium">
                                                                    {formatBytes(item.size)}
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-xs font-bold text-gray-800 truncate"
                                                                title={item.name}
                                                            >
                                                                {item.name}
                                                            </p>
                                                        </div>

                                                        {/* Action remove */}
                                                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="text-[11px] text-gray-400 italic">
                                                                Siap disimpan
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewAttachment(idx)}
                                                                className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                                title="Batalkan File Ini"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM SAVE ACTIONS */}
                    <div className="mt-8 flex items-center justify-end gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <Link
                            href={returnTo || "/monitoring-orderan"}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className={`flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095940] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all ${
                                processing ? "opacity-75 cursor-not-allowed" : "active:scale-95 cursor-pointer"
                            }`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>MENYIMPAN...</span>
                                </>
                            ) : (
                                <>
                                    <SaveIcon /> <span>{isEdit ? 'UPDATE WORK ORDER' : 'SAVE WORK ORDER'}</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Modal Preview Gambar / File */}
            {previewModalItem && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setPreviewModalItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <DocumentIcon />
                                <h3 className="font-bold text-sm text-gray-800 truncate" title={previewModalItem.name}>
                                    {previewModalItem.name}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewModalItem.url}
                                    download={previewModalItem.name}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                                >
                                    <DownloadIcon /> Unduh
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalItem(null)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    <XIcon />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-auto flex items-center justify-center bg-gray-900/5 min-h-[300px]">
                            {previewModalItem.isImage ? (
                                <img
                                    src={previewModalItem.url}
                                    alt={previewModalItem.name}
                                    className="max-h-[75vh] max-w-full object-contain rounded shadow"
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500">
                                        <DocumentIcon />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">{previewModalItem.name}</p>
                                    <a
                                        href={previewModalItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg text-sm font-bold shadow hover:bg-[#095940] transition"
                                    >
                                        Buka Dokumen
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Part Order History Modal */}
            {historyModalData && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Histori Order & Lifetime Part</h3>
                                    <p className="text-xs text-gray-600">
                                        Unit: <span className="font-bold text-emerald-700">{historyModalData.unit_code || 'NON-UNIT'}</span> | Part: <span className="font-mono font-bold text-gray-900">{historyModalData.part_number}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setHistoryModalData(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-4">
                            {historyModalData.average_actual_lifetime && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                                    <span>Rata-rata Actual Lifetime Part ini:</span>
                                    <strong className="text-sm font-bold font-mono">{historyModalData.average_actual_lifetime.toLocaleString()} Jam / HM</strong>
                                </div>
                            )}

                            {historyModalData.active_orders && historyModalData.active_orders.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span>⚠️ Order Aktif Berjalan (Cegah Double Order)</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {historyModalData.active_orders.map((ao, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-gray-800 shadow-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-bold text-amber-900 text-sm">{ao.no_order}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">{ao.status}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-gray-600">
                                                    <div>Tgl Order: <span className="font-semibold text-gray-800">{ao.order_date || '-'}</span></div>
                                                    <div>ETA: <span className="font-semibold text-gray-800">{ao.eta || '-'}</span></div>
                                                    <div>Qty: <span className="font-semibold text-gray-800">{ao.qty || 1}</span></div>
                                                    <div>Deskripsi: <span className="font-semibold text-gray-800">{ao.part_name || '-'}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Riwayat Order Sebelumnya</h4>
                                {historyModalData.recent_history && historyModalData.recent_history.length > 0 ? (
                                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                                        {historyModalData.recent_history.map((h, i) => (
                                            <div key={i} className="p-3 bg-white hover:bg-gray-50 text-xs flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="font-mono font-bold text-gray-800">{h.no_order}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">Tgl: {h.order_date || '-'} | Qty: {h.qty}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === 'INSTALLED' ? 'bg-emerald-100 text-emerald-800' : (h.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800')}`}>
                                                        {h.status}
                                                    </span>
                                                    {h.installed_hm && (
                                                        <div className="text-[10px] text-gray-500 mt-0.5 font-mono">Installed HM: {h.installed_hm}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Belum ada riwayat order sebelumnya untuk part ini.</p>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setHistoryModalData(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
