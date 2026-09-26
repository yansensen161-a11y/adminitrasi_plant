import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import UndercarriageSelectorModal from '@/Components/Pcr/UndercarriageSelectorModal';
import TyreReplacementModal from '@/Components/Tyre/TyreReplacementModal';

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

export const TIPE_WO_OPTIONS = [
    { value: 'PM - PREVENTIVE MAINTENANCE', label: 'PM - PREVENTIVE MAINTENANCE', code: 'PM', isSchedule: true },
    { value: 'CM - CORRECTIVE MAINTENANCE', label: 'CM - CORRECTIVE MAINTENANCE', code: 'CM', isSchedule: false },
    { value: 'OVH - OVERHAUL', label: 'OVH - OVERHAUL', code: 'OVH', isSchedule: true },
    { value: 'REPL - COMPONENT REPLACEMENT', label: 'REPL - COMPONENT REPLACEMENT', code: 'REPL', isSchedule: false },
    { value: 'UC - UNDERCARRIAGE MAINTENANCE', label: 'UC - UNDERCARRIAGE MAINTENANCE', code: 'UC', isSchedule: false },
    { value: 'TYRE - TYRE REPLACEMENT', label: 'TYRE - TYRE REPLACEMENT', code: 'TYRE', isSchedule: false },
    { value: 'SVC - SERVICE MAINTENANCE', label: 'SVC - SERVICE MAINTENANCE', code: 'SVC', isSchedule: true },
];

export const STATUS_WO_OPTIONS = [
    { value: 'PLANNING - PERENCANAAN PEKERJAAN', label: 'PLANNING - PERENCANAAN PEKERJAAN' },
    { value: 'IN PROGRESS - SEDANG DIKERJAKAN', label: 'IN PROGRESS - SEDANG DIKERJAKAN' },
    { value: 'COMPLETED - PEKERJAAN SELESAI', label: 'COMPLETED - PEKERJAAN SELESAI' },
];

export const DOWN_STATUS_OPTIONS = [
    { value: 'B0 - ON PROGRESS', label: 'B0 - ON PROGRESS' },
    { value: 'B1 - WAITING PARTS', label: 'B1 - WAITING PARTS' },
    { value: 'B2 - WAITING SARANA', label: 'B2 - WAITING SARANA' },
    { value: 'B3 - WAITING TOOLS', label: 'B3 - WAITING TOOLS' },
    { value: 'B4 - WAITING MAN POWER', label: 'B4 - WAITING MAN POWER' },
    { value: 'B5 - OUTSIDE / DEALER', label: 'B5 - OUTSIDE / DEALER' },
    { value: 'B6 - PRODUCTION / ABUSE', label: 'B6 - PRODUCTION / ABUSE' },
    { value: 'B7 - WAITING DECISION PLANT', label: 'B7 - WAITING DECISION PLANT' },
    { value: 'B8 - WAITING DECISION HO', label: 'B8 - WAITING DECISION HO' },
    { value: 'B9 - WAITING ACCESS', label: 'B9 - WAITING ACCESS' },
    { value: 'B10 - WAITING RAIN / SLIPPERY CONDITION', label: 'B10 - WAITING RAIN / SLIPPERY CONDITION' },
];

export const formatDownStatus = (val) => {
    if (!val) return 'B0 - ON PROGRESS';
    const s = String(val).toUpperCase();
    if (s.includes('B10')) return 'B10 - WAITING RAIN / SLIPPERY CONDITION';
    if (s.includes('B9')) return 'B9 - WAITING ACCESS';
    if (s.includes('B0')) return 'B0 - ON PROGRESS';
    if (s.includes('B1')) return 'B1 - WAITING PARTS';
    if (s.includes('B2')) return 'B2 - WAITING SARANA';
    if (s.includes('B3')) return 'B3 - WAITING TOOLS';
    if (s.includes('B4')) return 'B4 - WAITING MAN POWER';
    if (s.includes('B5')) return 'B5 - OUTSIDE / DEALER';
    if (s.includes('B6')) return 'B6 - PRODUCTION / ABUSE';
    if (s.includes('B7')) return 'B7 - WAITING DECISION PLANT';
    if (s.includes('B8')) return 'B8 - WAITING DECISION HO';
    return val;
};

export default function Create({ 
    units = [], 
    manpowers = [], 
    tools = [],
    suggestedCmNo = 'PLT/WO/CM/001',
    suggestedPmNo = 'PLT/WO/PM/001',
    suggestedNumbers = {},
    suggestedNoOrder = 'HW-MOL-01502',
    initialApls = [],
    existingForms = [],
    stockTyres = [],
}) {
    // Read query params to pre-fill from monitoring board click
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const preUnitId  = queryParams.get('unit_id')  || '';
    const preTipeWo  = queryParams.get('tipe_wo')  || 'BREAKDOWN';
    const fromParam  = queryParams.get('from') || '';
    const todayStr = new Date().toISOString().split('T')[0];

    const [showUcModal, setShowUcModal] = useState(false);
    const [selectedUcComponents, setSelectedUcComponents] = useState([]);
    const [showTyreModal, setShowTyreModal] = useState(false);

    // State for List APL & Master Form Actions
    const [aplList, setAplList] = useState(initialApls || []);
    const [aplSearch, setAplSearch] = useState('');
    const [isAplExpanded, setIsAplExpanded] = useState(true);
    const [isLoadingApls, setIsLoadingApls] = useState(false);
    const [selectedServiceFormType, setSelectedServiceFormType] = useState('AUTO'); // 'AUTO' | 'OHT773' | 'DUMP_TRUCK' | 'GENSET'

    const preselectedUnit = units.find(u => u.id?.toString() === preUnitId?.toString()) || null;

    // Resolve initial status_wo from preTipeWo query param if any
    const initialStatusWo = (() => {
        if (preTipeWo === 'SCHEDULE') return 'PM - PREVENTIVE MAINTENANCE';
        const found = TIPE_WO_OPTIONS.find(o => o.code === preTipeWo || o.value === preTipeWo);
        if (found) return found.value;
        return 'CM - CORRECTIVE MAINTENANCE';
    })();
    const initialOpt = TIPE_WO_OPTIONS.find(o => o.value === initialStatusWo);
    const initialIsSchedule = initialOpt ? initialOpt.isSchedule : (initialStatusWo.includes('PM') || initialStatusWo.includes('OVH') || initialStatusWo.includes('SVC'));
    const initialWoNo = suggestedNumbers[initialStatusWo] || (initialIsSchedule ? suggestedPmNo : suggestedCmNo);

    const { data, setData, post, processing, errors, transform } = useForm({
        no_wo: initialWoNo,
        tipe_wo: initialIsSchedule ? 'SCHEDULE' : 'BREAKDOWN',
        downtime_code: initialIsSchedule ? 'Schedule' : 'Unschedule',
        site: preselectedUnit?.lokasi || '',
        unit_id: preUnitId,
        from: fromParam,
        waktu_breakdown: '',
        waktu_rfu: '',
        durasi_hrs: 0,
        delay: 0,
        hm_unit: preselectedUnit ? (preselectedUnit.current_hm || 0) : 0,
        hm_bd: preselectedUnit ? (preselectedUnit.current_hm || '') : '',
        hm_rfu: '',
        keterangan: '',
        problem: '',
        component_group: '',
        model_system: '',
        status_wo: initialStatusWo,
        status_pengerjaan: 'PLANNING - PERENCANAAN PEKERJAAN',
        tyre_replacements: [],
        plan_inspection_categories: [],
        plan_inspection_shift: 'all',
        plan_inspection_date: todayStr,
        order_no_order: suggestedNoOrder || 'HW-MOL-01502',
        order_pr: '',
        order_po: '',
        order_eta_part: '',
        far_no_wo: initialWoNo || '',
        abr_no_wo: initialWoNo || '',
        mag_plug_no_wo: initialWoNo || '',
        form_washing_attachment: null,
        form_penundaan_service_attachment: null,
        form_service_unit_attachment: null,
        tasks: [
            { id: 1, group_component: '', component: '', task_description: '', problem: '', activity_progress: '', est_finish: '', mechanic: '', is_manual_pic: false, tools: [], start_date: '', end_date: '', downtime_hrs: 0, target_date: '', status: 'B0 - ON PROGRESS' }
        ]
    });

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Selected unit object & LV check
    const currentSelectedUnit = units.find(u => u.id?.toString() === data.unit_id?.toString()) || preselectedUnit || null;
    const isLV = (currentSelectedUnit?.type_unit || '').toUpperCase().includes('LIGHT VEHICLE') || (currentSelectedUnit?.type_unit || '').toUpperCase().includes('LV');

    // Dynamic APL fetch when unit_id changes
    useEffect(() => {
        if (!data.unit_id) {
            setAplList([]);
            return;
        }

        if (data.unit_id.toString() === preUnitId?.toString() && initialApls && initialApls.length > 0) {
            setAplList(initialApls);
            return;
        }

        setIsLoadingApls(true);
        fetch(`/units/${data.unit_id}/apls`)
            .then(res => res.json())
            .then(json => {
                setAplList(json.apls || []);
            })
            .catch(err => {
                console.error('Gagal memuat data APL unit:', err);
            })
            .finally(() => {
                setIsLoadingApls(false);
            });
    }, [data.unit_id]);

    // Filter APL by search
    const filteredApls = useMemo(() => {
        if (!aplSearch.trim()) return aplList;
        const q = aplSearch.toLowerCase();
        return aplList.filter(apl => 
            (apl.part_number && apl.part_number.toLowerCase().includes(q)) ||
            (apl.description && apl.description.toLowerCase().includes(q)) ||
            (apl.depart && apl.depart.toLowerCase().includes(q))
        );
    }, [aplList, aplSearch]);

    // Calculate total price of filtered APLs
    const totalAplPrice = useMemo(() => {
        return filteredApls.reduce((acc, apl) => {
            const qty = Number(apl.qty) || 1;
            const price = Number(apl.price_rate) || 0;
            return acc + (qty * price);
        }, 0);
    }, [filteredApls]);

    // Resolved service form info based on unit model/type
    const resolvedServiceForm = useMemo(() => {
        const model = (currentSelectedUnit?.model || '').toUpperCase();
        const type = (currentSelectedUnit?.type_unit || '').toUpperCase();

        if (selectedServiceFormType === 'GENSET' || (selectedServiceFormType === 'AUTO' && (model.includes('GENSET') || type.includes('GENSET')))) {
            return {
                name: 'Form Service Genset',
                code: 'PM-GENSET',
                icon: '⚡',
                routePrefix: 'form-service-genset',
                badge: 'PM Genset',
            };
        }
        if (selectedServiceFormType === 'DUMP_TRUCK' || (selectedServiceFormType === 'AUTO' && (model.includes('DUMP') || type.includes('DUMP') || model.includes('DT')))) {
            return {
                name: 'Form Service Dump Truck',
                code: 'PM-DUMP-TRUCK',
                icon: '🚛',
                routePrefix: 'form-service-dump-truck',
                badge: 'PM Dump Truck',
            };
        }
        return {
            name: 'Form OHT 773 / Alat Berat',
            code: 'PM-773E',
            icon: '🚜',
            routePrefix: 'form-oht773',
            badge: 'PM Heavy Equipment',
        };
    }, [currentSelectedUnit, selectedServiceFormType]);

    const getCurrentDatetimeLocal = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Fungsi perhitungan downtime terpusat & tangguh
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

    // Auto-calculate Downtime:
    // Jika Waktu RFU terisi -> dihitung dari breakdown sampai RFU.
    // Jika Waktu RFU kosong (unit masih breakdown / belum ready hari ini) -> otomatis terupdate realtime dari awal breakdown sampai sekarang!
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

    // Perhitungan total pekerjaan (penjumlahan seluruh DT task dalam jam)
    const totalPekerjaan = useMemo(() => {
        const total = (data.tasks || []).reduce((sum, t) => {
            const val = parseFloat(t.downtime_hrs);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
        return Math.round(total * 10) / 10;
    }, [data.tasks]);

    // Perhitungan delay: Total downtime dikurangi total pekerjaan
    const delayHours = useMemo(() => {
        const dt = parseFloat(data.durasi_hrs) || 0;
        const diff = Math.round((dt - totalPekerjaan) * 10) / 10;
        return diff > 0 ? diff : 0;
    }, [data.durasi_hrs, totalPekerjaan]);

    // Sinkronkan delay ke state form
    useEffect(() => {
        setData(prev => (prev.delay !== delayHours ? { ...prev, delay: delayHours } : prev));
    }, [delayHours]);

    // Otomatis ubah status_pengerjaan ke COMPLETED jika waktu_rfu diisi dan status belum COMPLETED
    useEffect(() => {
        if (data.waktu_rfu && (data.status_pengerjaan === 'OPEN' || data.status_pengerjaan === 'DRAFT' || data.status_pengerjaan === 'PLANNING - PERENCANAAN PEKERJAAN' || data.status_pengerjaan === 'IN PROGRESS - SEDANG DIKERJAKAN')) {
            setData('status_pengerjaan', 'COMPLETED - PEKERJAAN SELESAI');
        }
    }, [data.waktu_rfu]);

    // Pastikan setiap membuka form Buat WO baru, form selalu bersih dan tidak ada sisa data sebelumnya
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('wo_create_draft');
                localStorage.removeItem('plant_autosave_/work-orders/create');
                Object.keys(localStorage).forEach(k => {
                    if (k.includes('wo_create_draft') || k.includes('work-orders/create')) {
                        localStorage.removeItem(k);
                    }
                });
            } catch (e) {}
        }
    }, []);

    const fetchSuggestedNumber = async (selectedType) => {
        try {
            const opt = TIPE_WO_OPTIONS.find(o => o.value === selectedType);
            const queryCode = opt?.code || selectedType;
            const res = await fetch(`/work-orders/suggest-number?type=${encodeURIComponent(queryCode)}`);
            if (res.ok) {
                const json = await res.json();
                if (json.no_wo) {
                    return json.no_wo;
                }
            }
        } catch (e) {
            console.error('Failed to fetch suggested WO number:', e);
        }
        return suggestedNumbers[selectedType] || (selectedType.includes('PM') ? suggestedPmNo : suggestedCmNo);
    };

    const handleTipeWoChange = async (selectedType) => {
        const opt = TIPE_WO_OPTIONS.find(o => o.value === selectedType);
        const isSchedule = opt ? opt.isSchedule : (selectedType.includes('PM') || selectedType.includes('OVH') || selectedType.includes('SVC'));
        
        // Immediate fallback from preloaded suggestedNumbers map
        const fallbackNo = suggestedNumbers[selectedType] || (isSchedule ? suggestedPmNo : suggestedCmNo);

        setData(prev => ({
            ...prev,
            status_wo: selectedType,
            tipe_wo: isSchedule ? 'SCHEDULE' : 'BREAKDOWN',
            downtime_code: isSchedule ? 'Schedule' : 'Unschedule',
            no_wo: fallbackNo,
            component_group: selectedType === 'UC - UNDERCARRIAGE MAINTENANCE' 
                ? 'UNDERCARRIAGE' 
                : (selectedType.includes('TYRE') ? 'TYRE' : prev.component_group),
            plan_inspection_categories: isSchedule ? prev.plan_inspection_categories : [],
        }));

        // Fetch fresh sequence from server asynchronously
        try {
            const freshNo = await fetchSuggestedNumber(selectedType);
            if (freshNo) {
                setData(prev => (prev.status_wo === selectedType ? { ...prev, no_wo: freshNo } : prev));
            }
        } catch (e) {}

        if (selectedType === 'UC - UNDERCARRIAGE MAINTENANCE' && selectedUcComponents.length === 0) {
            setShowUcModal(true);
        }

        if (selectedType.includes('TYRE')) {
            setShowTyreModal(true);
        }

        if (selectedType === 'REPL - COMPONENT REPLACEMENT') {
            const currentUnit = units.find(u => u.id.toString() === data.unit_id?.toString());
            if (currentUnit) {
                const isTrack = currentUnit.type_unit === 'BULLDOZER' || currentUnit.type_unit === 'EXCAVATOR' || currentUnit.code_unit?.startsWith('MD') || currentUnit.code_unit?.startsWith('ME');
                const targetTab = isTrack ? 'track' : 'wheel';
                const compQuery = data.component_group ? `&component=${encodeURIComponent(data.component_group)}` : '';
                window.open(`/pcr-component?code_unit=${encodeURIComponent(currentUnit.code_unit)}&tab=${targetTab}&open_modal=1${compQuery}`, '_blank');
            }
        }
    };

    const handleAutoGenerate = async () => {
        const currentType = data.status_wo || 'CM - CORRECTIVE MAINTENANCE';
        const freshNo = await fetchSuggestedNumber(currentType);
        if (freshNo) {
            setData('no_wo', freshNo);
        } else {
            const fallback = suggestedNumbers[currentType] || (data.tipe_wo === 'SCHEDULE' ? suggestedPmNo : suggestedCmNo);
            setData('no_wo', fallback);
        }
    };

    const handleComponentGroupChange = (e) => {
        const val = e.target.value;
        setData('component_group', val);
        if (val === 'UNDERCARRIAGE') {
            setShowUcModal(true);
        }
        if (val === 'TYRE') {
            setShowTyreModal(true);
        }
    };

    const handleApplyTyreReplacements = (replacements) => {
        setData(prev => {
            const updated = { ...prev };
            updated.tyre_replacements = replacements;
            updated.component_group = 'TYRE';

            if (replacements && replacements.length > 0) {
                const summaryPos = replacements.map(r => `Pos ${r.position} (${r.action}): ${r.old_tyre_serial ? `${r.old_tyre_serial}➔${r.old_tyre_disposition || 'SCRAP'}` : 'New'} / Pasang ${r.new_tyre_serial} (${r.brand || ''} ${r.size || ''})`).join('; ');
                
                if (!prev.problem || prev.problem.trim() === '' || prev.problem.startsWith('Penggantian Tyre:')) {
                    updated.problem = `Penggantian Tyre: ${summaryPos}`;
                }

                // Sync into tasks (Section 2: Daftar Task & Tindakan)
                const newTasks = replacements.map((r, idx) => ({
                    id: Date.now() + idx,
                    group_component: 'TYRE',
                    component: `TYRE POS ${r.position}`,
                    task_description: `Penggantian Tyre Posisi ${r.position}: Lepas ban lama (${r.old_tyre_serial || '-'}, kondisi: ${r.removal_reason || r.old_tyre_disposition || 'SCRAP'}) & Pasang ban (${r.new_tyre_serial}, ${r.brand || ''} ${r.size || ''})`,
                    problem: r.removal_reason || '',
                    mechanic: '',
                    is_manual_pic: false,
                    tools: [],
                    start_date: '',
                    end_date: '',
                    downtime_hrs: 0,
                    target_date: '',
                    status: 'B0 - On Progress'
                }));

                const hasOnlyEmptyInitial = prev.tasks.length === 1 && 
                    !prev.tasks[0].component && 
                    !prev.tasks[0].task_description;

                if (hasOnlyEmptyInitial) {
                    updated.tasks = newTasks;
                } else {
                    const existingNonTyre = prev.tasks.filter(t => t.group_component !== 'TYRE');
                    updated.tasks = [...existingNonTyre, ...newTasks];
                }
            }

            return updated;
        });
    };

    const handleApplyUcComponents = (selectedComponents, allComponents) => {
        setSelectedUcComponents(selectedComponents);

        const compNames = selectedComponents.map(c => c.name).join(', ');
        setData(prev => {
            const updated = { ...prev };
            updated.component_group = 'UNDERCARRIAGE';
            updated.model_system = compNames;

            // Auto-fill problem description if empty
            if (!prev.problem || prev.problem.trim() === '') {
                updated.problem = `Penggantian / Perbaikan Komponen Undercarriage: ${compNames}`;
            }

            // Sync into tasks (Section 2: Daftar Task & Tindakan)
            const newTasks = selectedComponents.map((c, idx) => ({
                id: Date.now() + idx,
                group_component: 'UNDERCARRIAGE',
                component: c.name,
                task_description: `Pemeriksaan & Penggantian ${c.name} (${c.part_number}) - Status: ${c.status_penggantian || 'Belum Diganti'}`,
                problem: '',
                mechanic: '',
                is_manual_pic: false,
                tools: [],
                start_date: '',
                end_date: '',
                downtime_hrs: 0,
                target_date: '',
                status: 'B0 - On Progress'
            }));

            // If current tasks only has 1 blank/initial task, replace it
            const hasOnlyEmptyInitial = prev.tasks.length === 1 && 
                !prev.tasks[0].component && 
                !prev.tasks[0].task_description;

            if (hasOnlyEmptyInitial) {
                updated.tasks = newTasks;
            } else {
                const existingNonUc = prev.tasks.filter(t => t.group_component !== 'UNDERCARRIAGE');
                updated.tasks = [...existingNonUc, ...newTasks];
            }

            return updated;
        });
    };

    const handleSetTipeWo = (type) => {
        const nextNo = type === 'SCHEDULE' ? suggestedPmNo : suggestedCmNo;
        setData(prev => {
            let nextStatusWo = prev.status_wo;
            if (type === 'SCHEDULE' && (prev.status_wo === 'BD - BREAKDOWN' || !prev.status_wo || prev.status_wo === 'OPEN')) {
                nextStatusWo = 'PM - PREVENTIVE MAINTENANCE';
            } else if (type === 'BREAKDOWN' && (prev.status_wo === 'PM - PREVENTIVE MAINTENANCE' || !prev.status_wo || prev.status_wo === 'OPEN')) {
                nextStatusWo = 'BD - BREAKDOWN';
            }
            return {
                ...prev,
                tipe_wo: type,
                downtime_code: type === 'SCHEDULE' ? 'Schedule' : 'Unschedule',
                status_wo: nextStatusWo,
                no_wo: nextNo,
                plan_inspection_categories: type === 'SCHEDULE' ? prev.plan_inspection_categories : [],
            };
        });
    };

    const handleTogglePlanCategory = (catKey) => {
        const current = data.plan_inspection_categories || [];
        if (current.includes(catKey)) {
            setData('plan_inspection_categories', current.filter(c => c !== catKey));
        } else {
            setData('plan_inspection_categories', [...current, catKey]);
        }
    };

    const handleSelectAllPlanCategories = () => {
        setData('plan_inspection_categories', ['washing', 'inspection', 'greasing', 'cleaning_track']);
    };

    const handleClearPlanCategories = () => {
        setData('plan_inspection_categories', []);
    };

    const handleAddTask = (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        setData('tasks', [...data.tasks, { id: Date.now() + data.tasks.length, group_component: '', component: '', task_description: '', problem: '', activity_progress: '', est_finish: '', mechanic: '', is_manual_pic: false, tools: [], start_date: data.waktu_breakdown || '', end_date: '', downtime_hrs: 0, target_date: '', status: 'B0 - On Progress' }]);
    };

    const handleRemoveTask = (id) => {
        setData('tasks', data.tasks.filter(t => t.id !== id));
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

    const selectedUnit = units.find(u => u.id.toString() === data.unit_id) || null;

    const handleSubmit = (e, nextAction = null) => {
        if (e && e.preventDefault) e.preventDefault();

        if (nextAction && !data.unit_id) {
            alert('Silakan pilih Unit terlebih dahulu sebelum melanjutkan pembuatan dokumen.');
            return;
        }

        transform((currentData) => ({
            ...currentData,
            from: fromParam,
            next_action: nextAction,
            order_no_order: currentData.order_no_order || suggestedNoOrder || 'HW-MOL-01502',
            far_no_wo: currentData.no_wo,
            abr_no_wo: currentData.no_wo,
            mag_plug_no_wo: currentData.no_wo,
            delay: delayHours,
            component_group: currentData.component_group || currentData.tasks?.find(t => t.group_component)?.group_component || '',
            waktu_breakdown: currentData.waktu_breakdown ? currentData.waktu_breakdown.replace('T', ' ') + ':00' : null,
            waktu_rfu: currentData.waktu_rfu ? currentData.waktu_rfu.replace('T', ' ') + ':00' : null,
            tyre_replacements: currentData.tyre_replacements || [],
        }));

        post('/work-orders', { 
            preserveScroll: true,
            onSuccess: () => {
                try {
                    localStorage.removeItem('wo_create_draft');
                    localStorage.removeItem('plant_autosave_/work-orders/create');
                    Object.keys(localStorage).forEach(k => {
                        if (k.includes('wo_create_draft') || k.includes('work-orders/create')) {
                            localStorage.removeItem(k);
                        }
                    });
                } catch (e) {}
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={fromParam === 'pm-monitoring' ? 'Update Service PM - PM Monitoring' : 'Buat Work Order Baru'} />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-10">
                {/* Header Top */}
                <div className="bg-white dark:bg-[#060b14] px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="text-gray-500 cursor-pointer lg:hidden">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </div>
                        <Link 
                            href={fromParam === 'pm-monitoring' ? '/pm-monitoring' : '/work-orders'} 
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
                            title={fromParam === 'pm-monitoring' ? 'Kembali ke PM Monitoring' : 'Kembali ke Work Order'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight">
                                {fromParam === 'pm-monitoring' ? 'Update Service Unit (PM)' : 'Buat Work Order Baru'}
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {fromParam === 'pm-monitoring' ? (
                                    <>
                                        <Link href="/portal" className="hover:text-blue-600 transition-colors">Portal</Link>
                                        <span className="mx-1.5">&gt;</span>
                                        <Link href="/pm-monitoring" className="hover:text-blue-600 transition-colors">PM Monitoring</Link>
                                        <span className="mx-1.5">&gt;</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Update Service PM</span>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Order</Link>
                                        <span className="mx-1.5">&gt;</span>
                                        <span className="text-blue-600 dark:text-blue-400">Buat Work Order Baru</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                        {/* Full Screen Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs border border-gray-200 dark:border-white/10"
                            title={isFullscreen ? "Keluar Layar Penuh" : "Tampilan Layar Penuh (Full Screen)"}
                        >
                            {isFullscreen ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="hidden sm:inline">Exit Fullscreen</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                    <span className="hidden sm:inline">Full Screen</span>
                                </>
                            )}
                        </button>

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

                <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 w-full max-w-none flex flex-col gap-6">
                    <input type="hidden" name="from" value={fromParam} />
                    
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

                    {/* Section 1: Main Content 2 Balanced Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        
                        {/* Left Card: Informasi WO & Data Unit */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="w-7 h-7 rounded-lg bg-[#0b6e4f] text-white flex items-center justify-center text-xs font-bold shadow-xs">1</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-[#012922] dark:text-white uppercase tracking-tight">Informasi Work Order & Unit</h3>
                                        <p className="text-[11px] text-slate-400">Nomor referensi WO, tipe pekerjaan, dan spesifikasi unit</p>
                                    </div>
                                </div>

                                {/* No WO with spacious Auto Generate */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Nomor Work Order</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            name="no_wo"
                                            value={data.no_wo || ''} 
                                            readOnly
                                            tabIndex="-1"
                                            className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono font-bold cursor-not-allowed select-none focus:outline-none" 
                                            placeholder={data.tipe_wo === 'SCHEDULE' ? suggestedPmNo : suggestedCmNo}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAutoGenerate}
                                            title="Auto Generate No WO"
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                                        >
                                            <span>🔄</span>
                                            <span>Auto Generate</span>
                                        </button>
                                    </div>
                                    {errors.no_wo && <p className="text-xs text-red-500 mt-1">{errors.no_wo}</p>}
                                </div>

                                {/* Tipe WO */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                        Tipe Work Order
                                    </label>
                                    <select
                                        value={data.status_wo}
                                        onChange={e => handleTipeWoChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                    >
                                        {TIPE_WO_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Downtime Code, Status WO in a 2-Col row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Downtime Code</label>
                                        <select value={data.downtime_code} onChange={e => setData('downtime_code', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]">
                                            <option value="Unschedule">Unschedule</option>
                                            <option value="Schedule">Schedule</option>
                                            <option value="Accident">Accident</option>
                                            <option value="Opportunity">Opportunity</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
                                            <span>Status WO</span>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                                                data.status_pengerjaan === 'COMPLETED - PEKERJAAN SELESAI' || data.status_pengerjaan === 'CLOSED'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                    : data.status_pengerjaan === 'PLANNING - PERENCANAAN PEKERJAAN' || data.status_pengerjaan === 'DRAFT'
                                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                            }`}>
                                                {data.status_pengerjaan || 'PLANNING - PERENCANAAN PEKERJAAN'}
                                            </span>
                                        </label>
                                        <select 
                                            value={data.status_pengerjaan || 'PLANNING - PERENCANAAN PEKERJAAN'} 
                                            onChange={e => setData('status_pengerjaan', e.target.value)} 
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                        >
                                            {STATUS_WO_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Site & Unit Selection in a 2-Col row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Site / Lokasi <span className="text-red-500">*</span></label>
                                        <select value={data.site} onChange={e => setData('site', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" required>
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
                                                    hm_unit: selected ? (selected.current_hm || 0) : prev.hm_unit,
                                                    hm_bd: selected && !prev.hm_bd ? (selected.current_hm || '') : prev.hm_bd,
                                                }));

                                                if (selected) {
                                                    if (data.status_wo === 'REPL - COMPONENT REPLACEMENT') {
                                                        const isTrack = selected.type_unit === 'BULLDOZER' || selected.type_unit === 'EXCAVATOR' || selected.code_unit?.startsWith('MD') || selected.code_unit?.startsWith('ME');
                                                        const targetTab = isTrack ? 'track' : 'wheel';
                                                        const compQuery = data.component_group ? `&component=${encodeURIComponent(data.component_group)}` : '';
                                                        window.open(`/pcr-component?code_unit=${encodeURIComponent(selected.code_unit)}&tab=${targetTab}&open_modal=1${compQuery}`, '_blank');
                                                    } else if (data.status_wo === 'UC - UNDERCARRIAGE MAINTENANCE' && selectedUcComponents.length === 0) {
                                                        setShowUcModal(true);
                                                    } else if (data.status_wo?.includes('TYRE') && (!data.tyre_replacements || data.tyre_replacements.length === 0)) {
                                                        setShowTyreModal(true);
                                                    }
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">-- Pilih Unit --</option>
                                            {units.map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                            ))}
                                        </select>
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

                                {/* Banner REPL - COMPONENT REPLACEMENT */}
                                {data.status_wo === 'REPL - COMPONENT REPLACEMENT' && (
                                    <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                                                REPL
                                            </div>
                                            <div>
                                                <div className="text-xs font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 flex-wrap">
                                                    Plan PCR Component Replacement
                                                    {selectedUnit ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-200/90 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-mono text-[11px] font-black">
                                                            {selectedUnit.code_unit}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-amber-700 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded font-bold">
                                                            Pilih Unit Terlebih Dahulu
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                    {selectedUnit 
                                                        ? `Otomatis membuka dan pembuatan perubahan komponen unit ${selectedUnit.code_unit} di Plan Component (PCR).` 
                                                        : 'Silakan pilih Kode Unit di atas untuk otomatis membuka form penggantian komponen di Plan Component.'}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedUnit ? (
                                            <a
                                                href={`/pcr-component?code_unit=${encodeURIComponent(selectedUnit.code_unit)}&tab=${(selectedUnit.type_unit === 'BULLDOZER' || selectedUnit.type_unit === 'EXCAVATOR' || selectedUnit.code_unit?.startsWith('MD') || selectedUnit.code_unit?.startsWith('ME')) ? 'track' : 'wheel'}&open_modal=1${data.component_group ? `&component=${encodeURIComponent(data.component_group)}` : ''}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Buka PCR Component ({selectedUnit.code_unit})
                                            </a>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shrink-0 text-center">
                                                Pilih unit di atas
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Banner TYRE - Tyre Replacement & Management */}
                                {data.status_wo?.includes('TYRE') && (
                                    <div className="mt-3 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border-2 border-emerald-300 dark:border-emerald-500/40 rounded-xl shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#0b6e4f] text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
                                                    🛞
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2 flex-wrap">
                                                        <span>Integrasi Tyre Management & Penggantian Ban</span>
                                                        {selectedUnit ? (
                                                            <span className="px-2 py-0.5 rounded-md bg-emerald-200/90 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-mono text-[11px] font-black">
                                                                {selectedUnit.code_unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] text-amber-700 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded font-bold">
                                                                Pilih Unit Terlebih Dahulu
                                                            </span>
                                                        )}
                                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                                            data.tyre_replacements?.length > 0
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                                                        }`}>
                                                            {data.tyre_replacements?.length > 0 ? `${data.tyre_replacements.length} Posisi Diatur` : 'Belum Ada Ban Diatur'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                        Menyimpan Work Order ini akan otomatis memperbarui database Tyre (lepas ban lama, catat HM & pasang ban baru ke unit) di menu <span className="font-mono font-bold">/tyres</span>.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!data.unit_id) {
                                                            alert('Silakan pilih Unit terlebih dahulu!');
                                                            return;
                                                        }
                                                        setShowTyreModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-[#0b6e4f] hover:bg-[#095940] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span>🛞</span>
                                                    <span>{data.tyre_replacements?.length > 0 ? 'Edit Penggantian Tyre' : 'Atur Penggantian Tyre'}</span>
                                                </button>
                                                <a
                                                    href={selectedUnit ? `/tyres?unit_id=${selectedUnit.id}` : '/tyres'}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                                                    title="Buka menu Tyre Management di tab baru"
                                                >
                                                    <span>↗</span>
                                                    <span className="hidden sm:inline">Menu /tyres</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Preview staged replacements table if any */}
                                        {data.tyre_replacements?.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                    Daftar Ban yang Akan Diproses Saat WO Disimpan:
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {data.tyre_replacements.map((r, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-800/90 rounded-lg p-2.5 border border-emerald-200 dark:border-emerald-700 text-xs shadow-xs">
                                                            <div className="flex items-center justify-between font-bold mb-1">
                                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded text-[11px]">
                                                                    Posisi {r.position}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-slate-500">
                                                                    Aksi: {r.action}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                                                                {r.old_tyre_serial && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-slate-400">Old:</span>
                                                                        <span className="font-mono font-bold text-rose-600">{r.old_tyre_serial}</span>
                                                                        <span className="text-[10px] bg-rose-50 text-rose-700 px-1 rounded">➔ {r.old_tyre_disposition}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-slate-400">New:</span>
                                                                    <span className="font-mono font-bold text-emerald-600">{r.new_tyre_serial}</span>
                                                                    <span className="text-[10px] text-slate-500">({r.brand || 'Tyre'} {r.size || ''})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Card: Waktu, Target & Deskripsi Kerusakan */}
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
                                                        plan_inspection_date: nowStr.split('T')[0],
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
                                                        plan_inspection_date: dateVal || prev.plan_inspection_date,
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
                                                            status_pengerjaan: 'IN PROGRESS - SEDANG DIKERJAKAN',
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
                                                            status_pengerjaan: 'COMPLETED - PEKERJAAN SELESAI',
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
                                                        status_pengerjaan: combined ? 'COMPLETED - PEKERJAAN SELESAI' : prev.status_pengerjaan,
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
                                                        status_pengerjaan: 'COMPLETED - PEKERJAAN SELESAI',
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

                                {/* Downtime & Delay in 2-Col row */}
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
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                                                <span>Delay</span>
                                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-mono">
                                                    (DT {data.durasi_hrs || 0} - Pkj {totalPekerjaan})
                                                </span>
                                            </label>
                                            {delayHours > 0 ? (
                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                                    ⏱️ Menunggu {delayHours} Jam
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                    ✓ Tanpa Delay
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="any" 
                                                readOnly
                                                tabIndex="-1"
                                                className="w-full px-3 py-2 pr-14 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-black font-mono cursor-not-allowed select-none focus:outline-none" 
                                                value={delayHours} 
                                            />
                                            <span className="absolute right-3 top-2 text-[11px] font-bold text-rose-400 pointer-events-none">Hours</span>
                                        </div>
                                    </div>
                                </div>

                                {(data.tasks?.some(t => t.group_component === 'UNDERCARRIAGE') || selectedUcComponents.length > 0) && (
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-lg flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                UC
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                                    Plan PCR Undercarriage
                                                </div>
                                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                                    {selectedUcComponents.length > 0
                                                        ? `${selectedUcComponents.length} komponen terpilih`
                                                        : 'Klik untuk memilih komponen & status'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowUcModal(true)}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
                                        >
                                            {selectedUcComponents.length > 0 ? 'Edit Komponen' : 'Buka Pilihan'}
                                        </button>
                                    </div>
                                )}

                                {data.status_wo === 'REPL - COMPONENT REPLACEMENT' && (
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-lg flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                REPL
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                                    Plan PCR Component {selectedUnit ? `(${selectedUnit.code_unit})` : ''}
                                                </div>
                                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                                    {selectedUnit 
                                                        ? `Buka dan perbarui data komponen ${data.component_group ? `(${data.component_group})` : ''} di Plan Component.`
                                                        : 'Pilih Kode Unit di atas untuk memperbarui komponen di PCR.'}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedUnit && (
                                            <a
                                                href={`/pcr-component?code_unit=${encodeURIComponent(selectedUnit.code_unit)}&tab=${(selectedUnit.type_unit === 'BULLDOZER' || selectedUnit.type_unit === 'EXCAVATOR' || selectedUnit.code_unit?.startsWith('MD') || selectedUnit.code_unit?.startsWith('ME')) ? 'track' : 'wheel'}&open_modal=1${data.component_group ? `&component=${encodeURIComponent(data.component_group)}` : ''}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                Buka PCR Component
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Section: Khusus Fitur WO SCHEDULE (Plan Inspection & Magnetic Plug) */}
                    {data.tipe_wo === 'SCHEDULE' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">3</div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-tight">Fitur & Integrasi Khusus WO Schedule (PM)</h3>
                                    <p className="text-[11px] text-slate-400">Pilihan sinkronisasi kegiatan plan inspection dan pencatatan magnetic plug</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Plan Inspection Activity Checkboxes */}
                                <div className="p-4 bg-gradient-to-br from-teal-50/90 via-sky-50/50 to-emerald-50/60 dark:from-teal-950/30 dark:via-sky-950/20 dark:to-slate-900/60 border border-teal-300 dark:border-teal-500/40 rounded-xl shadow-xs flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b border-teal-200/70 dark:border-teal-500/20 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base leading-none">📋</span>
                                            <div>
                                                <h4 className="font-bold text-xs uppercase tracking-wider text-teal-950 dark:text-teal-300">Kegiatan Plan Inspection</h4>
                                                <p className="text-[11px] text-teal-700 dark:text-teal-400">Otomatis sinkron ke menu Plan Inspection</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={handleSelectAllPlanCategories}
                                                className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-900 font-bold transition-colors cursor-pointer"
                                            >
                                                Pilih Semua
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearPlanCategories}
                                                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 font-bold transition-colors cursor-pointer"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>

                                    {/* 4 Checkbox Items */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { id: 'washing', label: 'Washing Unit', icon: '🧼', desc: 'Pencucian unit' },
                                            { id: 'inspection', label: 'Inspection Unit', icon: '🔍', desc: 'Pemeriksaan unit' },
                                            { id: 'greasing', label: 'Greasing Unit', icon: '🛢️', desc: 'Pelumasan unit' },
                                            { id: 'cleaning_track', label: 'Cleaning Track', icon: '🚜', desc: 'Pembersihan track' },
                                        ].map(item => {
                                            const isChecked = data.plan_inspection_categories?.includes(item.id);
                                            return (
                                                <label
                                                    key={item.id}
                                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                                                        isChecked
                                                            ? 'bg-white dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-100 shadow-xs ring-1 ring-teal-400/50'
                                                            : 'bg-white/70 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:border-teal-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleTogglePlanCategory(item.id)}
                                                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                                            <span>{item.icon}</span>
                                                            <span className={isChecked ? 'text-teal-700 dark:text-teal-300 font-bold' : ''}>{item.label}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-400 block truncate">{item.desc}</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Date & Shift Options */}
                                    <div className="pt-2 border-t border-teal-200/70 dark:border-teal-500/20 flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">Tanggal Plan:</label>
                                            <input
                                                type="date"
                                                value={data.plan_inspection_date}
                                                onChange={e => setData('plan_inspection_date', e.target.value)}
                                                className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>

                                        {data.plan_inspection_categories?.includes('greasing') && (
                                            <div className="flex items-center justify-between gap-2">
                                                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">Shift Greasing:</label>
                                                <select
                                                    value={data.plan_inspection_shift}
                                                    onChange={e => setData('plan_inspection_shift', e.target.value)}
                                                    className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                                                >
                                                    <option value="all">Semua Shift (Shift 1 & 2)</option>
                                                    <option value="shift_1">Shift 1</option>
                                                    <option value="shift_2">Shift 2</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="bg-teal-50/80 dark:bg-teal-950/40 rounded p-2 text-[10px] text-teal-800 dark:text-teal-300 flex items-center justify-between gap-2">
                                            <span className="truncate">Tercatat di menu: <b>Plan Inspection</b></span>
                                            <a
                                                href="/plan-inspections"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold underline hover:text-teal-900 shrink-0"
                                            >
                                                Buka Plan ↗
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Opsi Inspeksi Magnetic Plug */}
                                <div className="p-4 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/70 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900/60 border border-amber-300 dark:border-amber-500/40 rounded-xl shadow-xs flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                                                🧲
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950 dark:text-amber-200">
                                                    Inspeksi Magnetic Plug
                                                </h4>
                                                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                                    Pemeriksaan serpihan logam / gram pada plug
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            Untuk unit yang sedang menjalani service berkala (PM), Anda dapat melakukan pencatatan temuan gram magnetik secara langsung melalui formulir Magnetic Plug.
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-amber-200/70 dark:border-amber-500/20 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-amber-900 dark:text-amber-300 font-medium truncate">
                                            Tercatat di: <b>Magnetic Plug</b>
                                        </span>
                                        <a
                                            href={`/repair/magnetic-plug/create${data.unit_id ? `?unit_id=${data.unit_id}` : ''}${data.hm_unit ? `&hm=${data.hm_unit}` : ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                                        >
                                            <span>Buka Form Magnetic Plug</span>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Daftar Task & Tindakan */}
                    <div className="bg-white dark:bg-slate-900/50 rounded border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#0b6e4f] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <ListIcon />
                                <div>
                                    <h3 className="font-bold text-sm">Daftar Task & Tindakan</h3>
                                    <p className="text-sm text-[#86c4a6]">Tambahkan pekerjaan, pemeriksaan dan tindakan yang harus dilakukan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs">
                                    <span className="text-emerald-200">DT: <strong className="text-white font-mono">{data.durasi_hrs || 0}h</strong></span>
                                    <span className="text-emerald-400">|</span>
                                    <span className="text-emerald-200">Pekerjaan: <strong className="text-white font-mono">{totalPekerjaan}h</strong></span>
                                    <span className="text-emerald-400">|</span>
                                    <span className="text-emerald-200">Delay: <strong className="text-amber-200 font-mono">{delayHours}h</strong></span>
                                </div>
                                <button type="button" onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer">
                                    <span className="text-lg leading-none">+</span> Tambah Task
                                </button>
                            </div>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                 <thead>
                                     <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-14 text-center">TASK</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-52 min-w-[190px]">COMPONENT GROUP</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[300px]">PROBLEM</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-16 text-center">SUB TASK</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[300px]">ACTIVITY PROGRESS</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-48">DATE</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-60 min-w-[210px]">DOWN STATUS</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-44">PIC</th>
                                         <th className="py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-300 w-12 text-center">Act</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <datalist id="manpower-list-options">
                                         {manpowers.map(mp => (
                                             <option key={mp.id} value={mp.nama}>{mp.bagian ? `${mp.nama} (${mp.bagian})` : mp.nama}</option>
                                         ))}
                                     </datalist>
                                     {data.tasks.map((t, i) => (
                                         <tr key={t.id} className="border-b border-gray-100 dark:border-white/5 align-top">
                                             {/* TASK - auto number from row index */}
                                             <td className="py-3 px-3 text-center w-14">
                                                 <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-base font-black border-2 border-emerald-300 dark:border-emerald-700 select-none">
                                                     {i + 1}
                                                 </span>
                                             </td>
                                             {/* COMPONENT GROUP - select dropdown per task */}
                                             <td className="py-3 px-2 w-52 min-w-[190px]">
                                                 <div className="space-y-1.5">
                                                     <select
                                                         className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                         value={t.group_component || t.component || ''}
                                                         onChange={e => {
                                                             const val = e.target.value;
                                                             const newTasks = [...data.tasks];
                                                             newTasks[i].group_component = val;
                                                             newTasks[i].component = val;
                                                             setData('tasks', newTasks);
                                                             if (val === 'UNDERCARRIAGE') {
                                                                 setShowUcModal(true);
                                                             }
                                                             if (val === 'TYRE') {
                                                                 setShowTyreModal(true);
                                                             }
                                                         }}
                                                     >
                                                         <option value="">-- Pilih Component --</option>
                                                         {COMPONENTS.map(comp => (
                                                             <option key={comp} value={comp}>{comp}</option>
                                                         ))}
                                                     </select>
                                                     {t.group_component === 'UNDERCARRIAGE' && (
                                                         <button
                                                             type="button"
                                                             onClick={() => setShowUcModal(true)}
                                                             className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-700/50"
                                                         >
                                                             <span>🚜</span>
                                                             <span>{selectedUcComponents.length > 0 ? `${selectedUcComponents.length} UC Terpilih` : 'Pilih Komponen UC'}</span>
                                                         </button>
                                                     )}
                                                     {t.group_component === 'TYRE' && (
                                                         <button
                                                             type="button"
                                                             onClick={() => setShowTyreModal(true)}
                                                             className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded border border-blue-200 dark:border-blue-700/50"
                                                         >
                                                             <span>⚙️</span>
                                                             <span>{data.tyre_replacements?.length > 0 ? `${data.tyre_replacements.length} Ban Terpilih` : 'Pilih Posisi Ban'}</span>
                                                         </button>
                                                     )}
                                                 </div>
                                             </td>
                                             {/* PROBLEM - large textarea */}
                                             <td className="py-3 px-3 min-w-[300px]">
                                                 <textarea
                                                     rows={5}
                                                     className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-orange-300 dark:border-orange-700 rounded-xl text-sm dark:text-gray-100 focus:ring-orange-400 focus:border-orange-400 resize-none placeholder-orange-300 dark:placeholder-orange-700 font-medium leading-relaxed shadow-sm"
                                                     placeholder="Deskripsi problem / kerusakan..."
                                                     value={t.problem || ''}
                                                     onChange={e => handleTaskChange(i, 'problem', e.target.value)}
                                                 />
                                             </td>
                                             {/* SUB TASK - auto number (moved between PROBLEM and ACTIVITY PROGRESS) */}
                                             <td className="py-3 px-3 text-center w-16">
                                                 <span className="inline-flex items-center justify-center w-10 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-black border border-slate-300 dark:border-slate-600 select-none">
                                                     {i + 1}.{i + 1}
                                                 </span>
                                             </td>
                                             {/* ACTIVITY PROGRESS - large textarea */}
                                             <td className="py-3 px-3 min-w-[300px]">
                                                 <textarea
                                                     rows={5}
                                                     className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-sm dark:text-gray-100 focus:ring-blue-400 focus:border-blue-400 resize-none placeholder-blue-300 dark:placeholder-blue-700 font-medium leading-relaxed shadow-sm"
                                                     placeholder="Uraikan progress activity / tindakan yang dilakukan..."
                                                     value={t.activity_progress || ''}
                                                     onChange={e => handleTaskChange(i, 'activity_progress', e.target.value)}
                                                 />
                                             </td>
                                             {/* DATE - compact */}
                                             <td className="py-2 px-2 w-48">
                                                 <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-md border border-gray-200 dark:border-slate-700">
                                                     <div className="flex items-center gap-1">
                                                         <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 w-12 shrink-0">Awal:</span>
                                                         <input
                                                             type="datetime-local"
                                                             value={t.start_date || ''}
                                                             onChange={e => handleTaskDateChange(i, 'start_date', e.target.value)}
                                                             className="w-full px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-[10px] font-medium dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                         />
                                                     </div>
                                                     <div className="flex items-center gap-1">
                                                         <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 w-12 shrink-0">Akhir:</span>
                                                         <input
                                                             type="datetime-local"
                                                             value={t.end_date || ''}
                                                             onChange={e => handleTaskDateChange(i, 'end_date', e.target.value)}
                                                             className="w-full px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-[10px] font-medium dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                         />
                                                     </div>
                                                     <div className="flex items-center gap-1">
                                                         <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 w-12 shrink-0">DT:</span>
                                                         <div className="relative w-full">
                                                             <input
                                                                 type="number"
                                                                 step="0.1" min="0"
                                                                 value={t.downtime_hrs ?? ''}
                                                                 onChange={e => handleTaskChange(i, 'downtime_hrs', e.target.value)}
                                                                 placeholder="0.0"
                                                                 className="w-full px-1.5 py-0.5 pr-8 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-[10px] font-bold text-amber-900 dark:text-amber-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                             />
                                                             <span className="absolute right-1.5 top-0.5 text-[9px] font-semibold text-gray-400 pointer-events-none">Hrs</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </td>
                                             {/* Down Status - full non-abbreviated */}
                                             <td className="py-3 px-2 w-60 min-w-[210px]">
                                                 <select
                                                     className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-medium dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
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
                                                             list="manpower-list-options"
                                                             className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-500 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                                                             placeholder="Ketik manual nama PIC..."
                                                             value={t.mechanic || ''}
                                                             onChange={e => handleTaskChange(i, 'mechanic', e.target.value)}
                                                             autoFocus
                                                         />
                                                         <button
                                                             type="button"
                                                             onClick={() => handleTaskChange(i, 'is_manual_pic', false)}
                                                             title="Kembali pilih dari daftar manpower"
                                                             className="px-2 py-1.5 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded border border-gray-300 dark:border-slate-600 shrink-0 font-medium"
                                                         >
                                                             List
                                                         </button>
                                                     </div>
                                                 ) : (
                                                     <div className="flex items-center gap-1.5">
                                                         <select
                                                             className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm dark:text-gray-200 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
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
                                                             {manpowers.map(mp => (
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
                                                             className="p-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#0b6e4f] dark:text-emerald-400 rounded border border-emerald-300 dark:border-emerald-700 shrink-0"
                                                         >
                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                         </button>
                                                     </div>
                                                 )}
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



                    {/* Section 4: Tindakan Lanjutan (Pembuatan Dokumen) */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm p-5 mt-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
                            <div className="text-purple-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[#012922] dark:text-white flex items-center gap-2">
                                    Tindakan Lanjutan (Pembuatan Dokumen)
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                        Auto-Save Work Order
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Klik tombol di bawah ini: Work Order akan otomatis disimpan terlebih dahulu ke database, kemudian Anda akan langsung diarahkan ke form pembuatan dokumen terkait dengan data Unit & No WO yang sudah terhubung.
                                </p>
                            </div>
                        </div>

                        {/* Header Labels */}
                        <div className="hidden sm:flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                            <span>Aksi Dokumen</span>
                            <span>No Order / PR / PO / ETA Part & No WO</span>
                        </div>

                        <div className="space-y-3">
                            {/* 1. Order List */}
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/20 dark:bg-blue-500/5 hover:bg-blue-50/40 dark:hover:bg-blue-500/10 transition">
                                <div className="xl:w-64 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => handleSubmit(null, 'create_order')} 
                                        disabled={processing}
                                        className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-bold hover:text-blue-900 dark:hover:text-blue-300 transition disabled:opacity-50 text-left"
                                    >
                                        <svg className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                        Simpan & Buat Order List
                                    </button>
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                    {/* NO Order */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 mb-0.5 tracking-wider flex items-center justify-between">
                                            <span>NO Order</span>
                                            <span className="text-[9px] text-blue-500 font-normal">Otomatis</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                readOnly
                                                tabIndex={-1}
                                                value={data.order_no_order || suggestedNoOrder || 'HW-MOL-01502'} 
                                                className="w-full pl-2.5 pr-7 py-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/80 border border-blue-200/60 dark:border-blue-500/30 rounded-lg text-blue-900 dark:text-blue-300 cursor-not-allowed select-none shadow-inner outline-none"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500 pointer-events-none" title="Terisi otomatis">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    {/* PR */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 mb-0.5 tracking-wider">
                                            PR
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.order_pr || ''} 
                                            onChange={e => setData('order_pr', e.target.value)} 
                                            placeholder="No PR..." 
                                            className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        />
                                    </div>
                                    {/* PO */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 mb-0.5 tracking-wider">
                                            PO
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.order_po || ''} 
                                            onChange={e => setData('order_po', e.target.value)} 
                                            placeholder="No PO..." 
                                            className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        />
                                    </div>
                                    {/* ETA Part */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 mb-0.5 tracking-wider">
                                            ETA Part
                                        </label>
                                        <input 
                                            type="date" 
                                            value={data.order_eta_part || ''} 
                                            onChange={e => setData('order_eta_part', e.target.value)} 
                                            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. FAR */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/20 dark:bg-red-500/5 hover:bg-red-50/40 dark:hover:bg-red-500/10 transition">
                                <div className="sm:w-64 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => handleSubmit(null, 'create_far')} 
                                        disabled={processing}
                                        className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-bold hover:text-red-900 dark:hover:text-red-300 transition disabled:opacity-50 text-left cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Simpan & Buat FAR
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        readOnly
                                        tabIndex={-1}
                                        value={data.no_wo || ''} 
                                        placeholder="No WO FAR..." 
                                        className="w-full pl-3 pr-28 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/80 border border-red-200/60 dark:border-red-500/30 rounded-lg text-red-900 dark:text-red-300 cursor-not-allowed select-none shadow-inner outline-none"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 pointer-events-none">
                                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>No WO Otomatis</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. ABR */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-orange-200 dark:border-orange-500/20 bg-orange-50/20 dark:bg-orange-500/5 hover:bg-orange-50/40 dark:hover:bg-orange-500/10 transition">
                                <div className="sm:w-64 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => handleSubmit(null, 'create_abr')} 
                                        disabled={processing}
                                        className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm font-bold hover:text-orange-900 dark:hover:text-orange-300 transition disabled:opacity-50 text-left cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Simpan & Buat ABR
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        readOnly
                                        tabIndex={-1}
                                        value={data.no_wo || ''} 
                                        placeholder="No WO ABR..." 
                                        className="w-full pl-3 pr-28 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/80 border border-orange-200/60 dark:border-orange-500/30 rounded-lg text-orange-900 dark:text-orange-300 cursor-not-allowed select-none shadow-inner outline-none"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-500/30 pointer-events-none">
                                        <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>No WO Otomatis</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Magnetic Plug */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-500/5 hover:bg-amber-50/40 dark:hover:bg-amber-500/10 transition">
                                <div className="sm:w-64 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => handleSubmit(null, 'create_magnetic_plug')} 
                                        disabled={processing}
                                        className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-bold hover:text-amber-900 dark:hover:text-amber-300 transition disabled:opacity-50 text-left cursor-pointer"
                                    >
                                        <span className="text-base leading-none shrink-0">🧲</span>
                                        Simpan & Buat Magnetic Plug
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        readOnly
                                        tabIndex={-1}
                                        value={data.no_wo || ''} 
                                        placeholder="No WO Magnetic Plug..." 
                                        className="w-full pl-3 pr-28 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-500/30 rounded-lg text-amber-900 dark:text-amber-300 cursor-not-allowed select-none shadow-inner outline-none"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30 pointer-events-none">
                                        <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>No WO Otomatis</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Master Form & Dokumen Service */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm p-5 mt-6 space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-base text-[#012922] dark:text-white">
                                            Master Form & Dokumen Service
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                                            Auto-Save Work Order
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                            Print & PDF Ready
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Terintegrasi dengan menu Master Form. Tampilkan data List APL populasi unit, cetak lembar form (Print A4), unduh PDF, atau auto-save dan lanjut isi form.
                                    </p>
                                </div>
                            </div>

                            {currentSelectedUnit && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    <span className="text-lg">🚜</span>
                                    <div>
                                        <div className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                                            {currentSelectedUnit.code_unit}
                                        </div>
                                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                            {currentSelectedUnit.model || '-'} • {aplList.length} Part APL
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════════ */}
                        {/* 1. LIST APL DARI POPULASI (Aplikasi Part & Pelumas) */}
                        {/* ═══════════════════════════════════════════════════════════════════ */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden shadow-xs">
                            {/* Card Header */}
                            <div className="p-4 bg-white dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                        📋
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">
                                                List APL (Aplikasi Part & Pelumas)
                                            </h4>
                                            {currentSelectedUnit && (
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                    Populasi: {currentSelectedUnit.code_unit}
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                {filteredApls.length} Part Terdaftar
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Daftar standar spare part & pelumas untuk Periodic Service unit {currentSelectedUnit?.code_unit || '(Pilih Unit)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Search Input */}
                                    {aplList.length > 0 && (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={aplSearch}
                                                onChange={(e) => setAplSearch(e.target.value)}
                                                placeholder="Cari part number, desc..."
                                                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-44 sm:w-52 text-gray-800 dark:text-gray-200"
                                            />
                                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {aplSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAplSearch('')}
                                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Link to Unit APL Tab */}
                                    {currentSelectedUnit && (
                                        <a
                                            href={`/units/${currentSelectedUnit.id}?tab=apl`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-1.5 transition whitespace-nowrap shadow-xs"
                                            title="Buka halaman detail populasi unit tab APL di tab baru"
                                        >
                                            <span>Buka di Populasi</span>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    )}

                                    {/* Expand / Collapse Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsAplExpanded(!isAplExpanded)}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 inline-flex items-center gap-1 transition cursor-pointer"
                                    >
                                        <span>{isAplExpanded ? 'Tutup Tabel' : 'Buka Tabel'}</span>
                                        <svg className={`w-3.5 h-3.5 transform transition-transform ${isAplExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            {isAplExpanded && (
                                <div className="p-3">
                                    {!data.unit_id ? (
                                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/40 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                            <div className="text-2xl mb-1">💡</div>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Pilih unit pada form di atas terlebih dahulu</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Daftar APL (Aplikasi Part & Pelumas) populasi unit akan otomatis dimuat ke tabel ini.</p>
                                        </div>
                                    ) : isLoadingApls ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/40 rounded-lg">
                                            <svg className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-xs font-semibold">Memuat data APL unit...</span>
                                        </div>
                                    ) : filteredApls.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {aplSearch ? `Tidak ditemukan part APL dengan kata kunci "${aplSearch}"` : `Belum ada data APL terdaftar untuk unit ${currentSelectedUnit?.code_unit || ''}`}
                                            </p>
                                            {currentSelectedUnit && !aplSearch && (
                                                <a
                                                    href={`/units/${currentSelectedUnit.id}?tab=apl`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 transition shadow-xs"
                                                >
                                                    + Tambah / Impor Part APL di Populasi Unit
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto max-h-[380px] rounded-lg border border-slate-400 dark:border-slate-700 shadow-xs">
                                            <table className="w-full text-xs border-collapse">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-[#9da8b3] dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-bold border-b border-slate-400 dark:border-slate-700 divide-x divide-slate-400 dark:divide-slate-700 text-[11px]">
                                                        <th className="p-2 text-center w-10">No.</th>
                                                        <th className="p-2 text-left min-w-[150px]">Part Number / Depart</th>
                                                        <th className="p-2 text-left min-w-[200px]">Description</th>
                                                        <th className="p-2 text-center w-16">Standart QTY</th>
                                                        <th className="p-2 text-center w-16">
                                                            <div>PS</div>
                                                            <div className="text-[10px] font-normal">{isLV ? '5000 KM' : '250'}</div>
                                                        </th>
                                                        <th className="p-2 text-center w-16">
                                                            <div>PS</div>
                                                            <div className="text-[10px] font-normal">{isLV ? '10000 KM' : '500'}</div>
                                                        </th>
                                                        {!isLV && (
                                                            <>
                                                                <th className="p-2 text-center w-16">
                                                                    <div>PS</div>
                                                                    <div className="text-[10px] font-normal">1000</div>
                                                                </th>
                                                                <th className="p-2 text-center w-16">
                                                                    <div>PS</div>
                                                                    <div className="text-[10px] font-normal">2000</div>
                                                                </th>
                                                            </>
                                                        )}
                                                        <th className="p-2 text-center w-16">Satuan</th>
                                                        <th className="p-2 text-right min-w-[110px]">Unit Rate</th>
                                                        <th className="p-2 text-right min-w-[120px]">Total Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-300 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                                    {filteredApls.map((apl, idx) => (
                                                        <tr key={apl.id || idx} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 divide-x divide-slate-300 dark:divide-slate-800 transition-colors">
                                                            <td className="p-2 text-center text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="p-2">
                                                                <div className="font-bold text-gray-900 dark:text-white font-mono text-[11px]">{apl.part_number}</div>
                                                                {apl.depart && (
                                                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{apl.depart}</div>
                                                                )}
                                                                {apl.is_global && (
                                                                    <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                                                        Global
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-2 font-medium text-gray-800 dark:text-gray-200">
                                                                {apl.description || '-'}
                                                            </td>
                                                            <td className="p-2 text-center font-bold text-gray-900 dark:text-white">
                                                                {Number(apl.qty).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="p-0 text-center h-8 min-w-[44px] align-middle">
                                                                {apl.ps_250 ? (
                                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                                                                ) : (
                                                                    <div className="w-full h-full min-h-[30px] bg-slate-400/80 dark:bg-slate-700/80 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]"></div>
                                                                )}
                                                            </td>
                                                            <td className="p-0 text-center h-8 min-w-[44px] align-middle">
                                                                {apl.ps_500 ? (
                                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                                                                ) : (
                                                                    <div className="w-full h-full min-h-[30px] bg-slate-400/80 dark:bg-slate-700/80 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]"></div>
                                                                )}
                                                            </td>
                                                            {!isLV && (
                                                                <>
                                                                    <td className="p-0 text-center h-8 min-w-[44px] align-middle">
                                                                        {apl.ps_1000 ? (
                                                                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                                                                        ) : (
                                                                            <div className="w-full h-full min-h-[30px] bg-slate-400/80 dark:bg-slate-700/80 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]"></div>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-0 text-center h-8 min-w-[44px] align-middle">
                                                                        {apl.ps_2000 ? (
                                                                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                                                                        ) : (
                                                                            <div className="w-full h-full min-h-[30px] bg-slate-400/80 dark:bg-slate-700/80 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]"></div>
                                                                        )}
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td className="p-2 text-center text-gray-700 dark:text-gray-300 font-bold">
                                                                {apl.satuan || 'PCS'}
                                                            </td>
                                                            <td className="p-2 text-right font-mono font-semibold text-gray-900 dark:text-gray-200 whitespace-nowrap">
                                                                {Number(apl.price_rate) > 0 ? `Rp ${Number(apl.price_rate).toLocaleString('id-ID')}` : '-'}
                                                            </td>
                                                            <td className="p-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                                                {((Number(apl.qty) || 1) * (Number(apl.price_rate) || 0)) > 0 ? `Rp ${((Number(apl.qty) || 1) * (Number(apl.price_rate) || 0)).toLocaleString('id-ID')}` : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-400 dark:border-slate-700 font-bold text-gray-900 dark:text-gray-100 text-[11px]">
                                                    <tr>
                                                        <td colSpan={3} className="p-2 text-left">
                                                            Total: <span className="text-emerald-600 dark:text-emerald-400 font-black">{filteredApls.length} Part</span>
                                                        </td>
                                                        <td colSpan={isLV ? 4 : 6} className="p-2 text-right text-gray-500 dark:text-gray-400 font-normal">
                                                            Estimasi Total Biaya Part:
                                                        </td>
                                                        <td colSpan={2} className="p-2 text-right font-mono font-black text-emerald-700 dark:text-emerald-300 text-xs">
                                                            Rp {totalAplPrice.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════════ */}
                        {/* 2. AKSI MASTER FORM (PRINT & DOWNLOAD PDF & AUTO-SAVE) */}
                        {/* ═══════════════════════════════════════════════════════════════════ */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
                                <span>Aksi Form Terhubung (Print, Unduh PDF & Simpan)</span>
                                <span className="hidden sm:inline">Lampiran / Attachment Form (Opsional)</span>
                            </div>

                            <div className="space-y-3">
                                {/* 1. Form Washing Unit */}
                                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/20 dark:bg-teal-500/5 hover:bg-teal-50/40 dark:hover:bg-teal-500/10 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base leading-none">🧼</span>
                                            <span className="font-bold text-sm text-teal-900 dark:text-teal-200">
                                                Form Washing Unit
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                                                PLT/FRM/WASH
                                            </span>
                                            <a
                                                href="/form-washing-unit"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5"
                                            >
                                                <span>Menu Master</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Lembar checklist pencucian unit tambang sebelum dan sesudah jadwal service maintenance.
                                        </p>

                                        {/* Action Button Group */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {/* Print Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/form-washing-unit/blank-print?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title="Cetak langsung formulir washing unit (A4 Portrait)"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                <span>🖨️ Cetak / Print</span>
                                            </button>

                                            {/* Download PDF Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/form-washing-unit/download-pdf?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title="Download berkas PDF Form Washing Unit"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                <span>📥 Download PDF</span>
                                            </button>

                                            {/* Save & Create Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleSubmit(null, 'create_form_washing')}
                                                disabled={processing}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-teal-500 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/40 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                                title="Simpan Work Order dan langsung buat Form Washing Unit"
                                            >
                                                <span>⚡ Simpan & Buat Form</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Attachment Input */}
                                    <div className="lg:w-80 shrink-0">
                                        <input 
                                            type="file" 
                                            id="file_washing_unit" 
                                            className="hidden" 
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('form_washing_attachment', file);
                                            }}
                                        />
                                        {data.form_washing_attachment ? (
                                            <div className="flex items-center justify-between px-3 py-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-500/40 rounded-lg text-xs font-semibold text-teal-900 dark:text-teal-200 shadow-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="truncate max-w-[180px]">{data.form_washing_attachment.name}</span>
                                                    <span className="text-[10px] text-teal-600/80 font-normal">
                                                        ({(data.form_washing_attachment.size / 1024).toFixed(0)} KB)
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setData('form_washing_attachment', null)} 
                                                    className="ml-2 text-teal-700 hover:text-red-600 text-xs font-bold px-2 py-0.5 rounded hover:bg-teal-100 dark:hover:bg-teal-900/60 transition"
                                                    title="Hapus file"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <label 
                                                htmlFor="file_washing_unit" 
                                                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-500/30 rounded-lg text-xs text-gray-400 dark:text-gray-500 hover:border-teal-400 dark:hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition cursor-pointer shadow-xs group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="italic text-[11px]">Pilih lampiran (Kosong)</span>
                                                </span>
                                                <span className="px-2 py-0.5 text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-500/30 group-hover:bg-teal-600 group-hover:text-white transition">
                                                    📎 Pilih File
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Form Penundaan Service */}
                                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-500/5 hover:bg-amber-50/40 dark:hover:bg-amber-500/10 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base leading-none">⏳</span>
                                            <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                                                Form Penundaan Service
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                                PLT/FRM/PND
                                            </span>
                                            <a
                                                href="/form-penundaan-service"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
                                            >
                                                <span>Menu Master</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Formulir persetujuan dan mitigasi risiko penundaan periodic maintenance unit tambang.
                                        </p>

                                        {/* Action Button Group */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {/* Print Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/form-penundaan-service/blank-print?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title="Cetak formulir penundaan service (A4 Landscape)"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                <span>🖨️ Cetak / Print</span>
                                            </button>

                                            {/* Download PDF Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/form-penundaan-service/download-pdf?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title="Download berkas PDF Form Penundaan Service"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                <span>📥 Download PDF</span>
                                            </button>

                                            {/* Save & Create Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleSubmit(null, 'create_form_penundaan_service')}
                                                disabled={processing}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                                title="Simpan Work Order dan langsung buat Form Penundaan Service"
                                            >
                                                <span>⚡ Simpan & Buat Form</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Attachment Input */}
                                    <div className="lg:w-80 shrink-0">
                                        <input 
                                            type="file" 
                                            id="file_penundaan_service" 
                                            className="hidden" 
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('form_penundaan_service_attachment', file);
                                            }}
                                        />
                                        {data.form_penundaan_service_attachment ? (
                                            <div className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="truncate max-w-[180px]">{data.form_penundaan_service_attachment.name}</span>
                                                    <span className="text-[10px] text-amber-600/80 font-normal">
                                                        ({(data.form_penundaan_service_attachment.size / 1024).toFixed(0)} KB)
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setData('form_penundaan_service_attachment', null)} 
                                                    className="ml-2 text-amber-700 hover:text-red-600 text-xs font-bold px-2 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
                                                    title="Hapus file"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <label 
                                                htmlFor="file_penundaan_service" 
                                                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 rounded-lg text-xs text-gray-400 dark:text-gray-500 hover:border-amber-400 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer shadow-xs group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="italic text-[11px]">Pilih lampiran (Kosong)</span>
                                                </span>
                                                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-500/30 group-hover:bg-amber-600 group-hover:text-white transition">
                                                    📎 Pilih File
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Form Service Unit */}
                                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/10 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base leading-none">{resolvedServiceForm.icon}</span>
                                            <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                                                {resolvedServiceForm.name}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                {resolvedServiceForm.badge}
                                            </span>
                                            <a
                                                href={`/${resolvedServiceForm.routePrefix}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                                            >
                                                <span>Menu Master</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Lembar checklist periodic maintenance service & inspeksi sistem unit.
                                        </p>

                                        {/* Template Switcher Pills */}
                                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                            <span className="text-gray-400">Pilihan Format Form:</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedServiceFormType('AUTO')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${selectedServiceFormType === 'AUTO' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                Otomatis (Sesuai Unit)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedServiceFormType('OHT773')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${selectedServiceFormType === 'OHT773' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                OHT 773
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedServiceFormType('DUMP_TRUCK')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${selectedServiceFormType === 'DUMP_TRUCK' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                Dump Truck
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedServiceFormType('GENSET')}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${selectedServiceFormType === 'GENSET' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                Genset
                                            </button>
                                        </div>

                                        {/* Action Button Group */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {/* Print Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/${resolvedServiceForm.routePrefix}/blank-print?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title={`Cetak formulir ${resolvedServiceForm.name} (A4 Portrait)`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                <span>🖨️ Cetak / Print</span>
                                            </button>

                                            {/* Download PDF Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `/${resolvedServiceForm.routePrefix}/download-pdf?unit_id=${encodeURIComponent(data.unit_id || '')}&no_wo=${encodeURIComponent(data.no_wo || '')}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                                title={`Download berkas PDF ${resolvedServiceForm.name}`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                <span>📥 Download PDF</span>
                                            </button>

                                            {/* Save & Create Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleSubmit(null, 'create_form_service_unit')}
                                                disabled={processing}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                                title="Simpan Work Order dan langsung buat Form Service Unit"
                                            >
                                                <span>⚡ Simpan & Buat Form</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Attachment Input */}
                                    <div className="lg:w-80 shrink-0">
                                        <input 
                                            type="file" 
                                            id="file_service_unit" 
                                            className="hidden" 
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('form_service_unit_attachment', file);
                                            }}
                                        />
                                        {data.form_service_unit_attachment ? (
                                            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-lg text-xs font-semibold text-emerald-900 dark:text-emerald-200 shadow-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="truncate max-w-[180px]">{data.form_service_unit_attachment.name}</span>
                                                    <span className="text-[10px] text-emerald-600/80 font-normal">
                                                        ({(data.form_service_unit_attachment.size / 1024).toFixed(0)} KB)
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setData('form_service_unit_attachment', null)} 
                                                    className="ml-2 text-emerald-700 hover:text-red-600 text-xs font-bold px-2 py-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                                                    title="Hapus file"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <label 
                                                htmlFor="file_service_unit" 
                                                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs text-gray-400 dark:text-gray-500 hover:border-emerald-400 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer shadow-xs group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    <span className="italic text-[11px]">Pilih lampiran (Kosong)</span>
                                                </span>
                                                <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition">
                                                    📎 Pilih File
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10 mt-2 mb-8">
                        <button 
                            type="button" 
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin mereset formulir ini?')) {
                                    try { localStorage.removeItem('wo_create_draft'); } catch(e) {}
                                    window.location.href = '/work-orders/create';
                                }
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Reset Form
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-[#0b6e4f] text-white rounded font-bold text-sm hover:bg-[#095940] transition shadow-sm disabled:opacity-50 cursor-pointer">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                {fromParam === 'pm-monitoring' ? 'Simpan & Update Service PM' : 'Buat Work Order'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>

            {/* PCR Undercarriage Selection Modal */}
            <UndercarriageSelectorModal
                isOpen={showUcModal}
                onClose={() => setShowUcModal(false)}
                units={units}
                selectedUnitId={data.unit_id}
                onUnitChange={(newUnitId) => {
                    setData('unit_id', newUnitId);
                    const selected = units.find(u => u.id.toString() === newUnitId.toString());
                    if (selected) setData('hm_unit', selected.current_hm || 0);
                }}
                onApply={handleApplyUcComponents}
            />

            {/* Tyre Replacement & Management Modal */}
            <TyreReplacementModal
                isOpen={showTyreModal}
                onClose={() => setShowTyreModal(false)}
                unit={currentSelectedUnit}
                units={units}
                onUnitChange={(newUnitId) => {
                    setData('unit_id', newUnitId);
                    const selected = units.find(u => u.id.toString() === newUnitId.toString());
                    if (selected) setData('hm_unit', selected.current_hm || 0);
                }}
                stockTyres={stockTyres}
                initialReplacements={data.tyre_replacements}
                onApply={handleApplyTyreReplacements}
            />
        </AuthenticatedLayout>
    );
}
