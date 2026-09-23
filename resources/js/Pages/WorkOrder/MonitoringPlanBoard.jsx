import React, { useState, useMemo, useEffect } from "react";
import { Link, router } from "@inertiajs/react";

const STATUS_CONFIG = {
    "OVERDUE":      { bg: "bg-red-500",    text: "text-white", row: "bg-red-50/60 hover:bg-red-100/60",    dot: "bg-red-500" },
    "TODAY":        { bg: "bg-red-400",    text: "text-white", row: "bg-orange-50/60 hover:bg-orange-100/60", dot: "bg-red-400" },
    "TOMORROW":     { bg: "bg-orange-400", text: "text-white", row: "bg-yellow-50/60 hover:bg-yellow-100/60", dot: "bg-orange-400" },
    "NEXT SERVICE": { bg: "bg-emerald-600", text: "text-white", row: "bg-white hover:bg-blue-50/60",     dot: "bg-emerald-500" },
};



const CATEGORY_MAP = {
    "Excavator Big Digger":   ["ME049","ME055","ME056"],
    "Excavator Crusher":      ["ME023","ME053"],
    "Excavator Small Digger": ["ME048","ME052","ME057","ME059","ME066","ME067","ME068","ME069","ME070","ME072"],
    "Bulldozer":              ["MD036","MD037","MD041","MD042","MD043","MD045","MD046","MD047","MD048"],
    "Motor Grader":           ["MG018","MG019","MG020","MG021"],
    "Dump Truck":             ["MDT006","MDT009","MDT012","MDT015","MDT016","MDT017","MDT019","MDT020","MDT021","MDT022","MDT023","MDT025","MDT027","MDT028","MDT029","MDT030","MDT035","MDT036","MDT039","MDT040","MDT041","MDT042","MDT043","MDT045","MDT046","MDT047","MDT048","MDT051","MDT052","MDT026"],
    "Compactor":              ["MCP003","MCP006"],
    "Unit Support":           ["MLT008","MLT005","MCT001","MB001","MB002","MWT010","MFT007","MFT009","MGS002","MGS009","MGS006","MGS016","MGS018","MWT009","MWM010","MMH005","MWP007","MC 02","MSC001"],
    "Tower Lamp":             ["MTL013","MTL015","MTL016","MTL023","MTL031","MTL035","MTL040","MTL041","MTL042","MTL043"],
    "Dewatering":             ["MWP005","MWP003","MCM007"],
    "Light Vehicle":          ["B-02","B-10","T-02","A-07","A-08","B-16","G-03","D-09","D-21","D-20","E-02","F-05","G-05","D-19","H-02","HO-06"],
    "Hauler":                 ["OHT066","OHT067","OHT068","OHT069","OHT070","OHT071","OHT072","OHT073","OHT074","OHT075","OHT115","OHT116","OHT117","OHT118","OHT119","OHT120"],
};

function getUnitServiceDetails(unit, category) {
    const nextService = unit.next_service || unit.nextService;
    const lastService = unit.last_service || unit.lastService;
    const currentHm = Number(unit.hm) || 0;
    let targetValue = null, serviceType = "", targetDate = "-", metricLabel = "HM", interval = 250;

    if (unit.code_unit === "MSC001") {
        metricLabel = "Date";
        serviceType = "Service 1 Bulan";
        if (nextService?.target_date) {
            targetDate = new Date(nextService.target_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        } else if (lastService?.actual_date || lastService?.target_date) {
            const d = new Date(lastService.actual_date || lastService.target_date);
            d.setMonth(d.getMonth() + 1);
            targetDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        } else {
            const d = new Date();
            d.setMonth(d.getMonth() + 1);
            targetDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        }
    } else if (category === "Light Vehicle") {
        metricLabel = "KM";
        interval = 5000;
        if (nextService?.target_hm) {
            targetValue = Math.round(Number(nextService.target_hm) / interval) * interval;
        } else if (lastService) {
            const lastVal = Number(lastService.actual_hm || lastService.target_hm || 0);
            if (lastVal > 0) {
                const baseTarget = Math.round(lastVal / interval) * interval;
                targetValue = baseTarget + interval;
            } else {
                targetValue = Math.ceil((currentHm + 1) / interval) * interval;
            }
        } else {
            targetValue = Math.ceil((currentHm + 1) / interval) * interval;
            if (targetValue === 0) targetValue = interval;
        }
        serviceType = nextService?.service_type ?? `Service ${targetValue?.toLocaleString("id-ID")} KM`;
    } else {
        metricLabel = "HM";
        interval = 250;
        if (nextService?.target_hm) {
            targetValue = Math.round(Number(nextService.target_hm) / interval) * interval;
        } else if (lastService) {
            const lastVal = Number(lastService.actual_hm || lastService.target_hm || 0);
            if (lastVal > 0) {
                const baseTarget = Math.round(lastVal / interval) * interval;
                targetValue = baseTarget + interval;
            } else {
                targetValue = Math.ceil((currentHm + 1) / interval) * interval;
            }
        } else {
            targetValue = Math.ceil((currentHm + 1) / interval) * interval;
            if (targetValue === 0) targetValue = interval;
        }
        
        if (nextService?.service_type) {
            serviceType = String(nextService.service_type).toUpperCase().startsWith("PS")
                ? nextService.service_type
                : `PS ${nextService.service_type} H`;
        } else if (targetValue % 2000 === 0) {
            serviceType = "PS 2000 H";
        } else if (targetValue % 1000 === 0) {
            serviceType = "PS 1000 H";
        } else if (targetValue % 500 === 0) {
            serviceType = "PS 500 H";
        } else {
            serviceType = "PS 250 H";
        }
    }

    if (metricLabel !== "Date") {
        if (nextService?.target_date) {
            targetDate = new Date(nextService.target_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        } else if (targetValue !== null) {
            const diff = targetValue - currentHm;
            const d = new Date();
            d.setDate(d.getDate() + diff / (metricLabel === "HM" ? 24 : 500));
            targetDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        }
    }

    return { targetValue, serviceType, targetDate, metricLabel, interval };
}

function calculateStatus(currentVal, targetVal, metricLabel, interval) {
    if (metricLabel === "Date") return { label: "NEXT SERVICE", remaining: "1 Bulan", progress: 50, isOverdue: false };
    if (currentVal == null || !targetVal) return { label: "NEXT SERVICE", remaining: "-", progress: 50, isOverdue: false };
    
    const diff = targetVal - currentVal;
    const progress = Math.min(100, Math.max(0, ((interval - diff) / interval) * 100));
    const roundedDiff = Math.round(diff * 10) / 10;
    const remaining = `${roundedDiff.toLocaleString("id-ID")} ${metricLabel}`;
    
    if (diff < 0) {
        return { label: "OVERDUE", remaining, progress: 100, isOverdue: true };
    }
    if (metricLabel === "HM") {
        if (diff <= 24) return { label: "TODAY", remaining, progress, isOverdue: false };
        if (diff <= 48) return { label: "TOMORROW", remaining, progress, isOverdue: false };
    } else {
        if (diff <= 500) return { label: "TODAY", remaining, progress, isOverdue: false };
        if (diff <= 1000) return { label: "TOMORROW", remaining, progress, isOverdue: false };
    }
    return { label: "NEXT SERVICE", remaining, progress, isOverdue: false };
}

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.077-2.146-.523-1.636-.677-2.696-2.34-2.778-2.45-.082-.11-.664-.882-.664-1.682 0-.8.419-1.194.568-1.356.149-.163.325-.203.434-.203.108 0 .216.001.311.006.1.006.234-.038.366.279.136.327.464 1.134.505 1.217.041.082.068.178.014.286-.054.107-.081.175-.162.27-.081.096-.171.213-.244.287-.082.083-.167.173-.072.336.095.163.423.697.907 1.128.623.555 1.149.728 1.312.809.163.082.258.072.353-.038.095-.11.407-.474.515-.637.108-.163.216-.136.365-.081.149.054.948.448 1.111.53.163.082.272.122.312.19.041.068.041.393-.103.798zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.05c-1.616 0-3.11-.479-4.364-1.303l-.313-.207-2.946.843.864-2.871-.227-.328A8.046 8.046 0 1112 20.05z" />
    </svg>
);

function generatePmWaText({
    units = [],
    format = 'detailed',
    includeOverdue = true,
    includeToday = true,
    includeTomorrow = true,
    withHeader = true,
    withNumbers = true,
    withFooter = true,
}) {
    const allowed = [];
    if (includeOverdue) allowed.push('OVERDUE');
    if (includeToday) allowed.push('TODAY');
    if (includeTomorrow) allowed.push('TOMORROW');

    const targetUnits = units.filter(u => allowed.includes(u.status?.label));

    if (targetUnits.length === 0) {
        return `Tidak ada unit dengan status ${allowed.join(', ') || 'yang dipilih'}.`;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[tomorrow.getDay()];
    const dateStr = `${tomorrow.getDate()} ${months[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;

    const overdueList = targetUnits.filter(u => u.status?.label === 'OVERDUE');
    const todayList = targetUnits.filter(u => u.status?.label === 'TODAY');
    const tomorrowList = targetUnits.filter(u => u.status?.label === 'TOMORROW');

    let text = '';

    if (withHeader) {
        text += `*Plan Service Besok (PM)*\n`;
        text += `_${dayName}, ${dateStr}_\n`;
        text += `_Total: ${targetUnits.length} Unit Siap Service (Overdue: ${overdueList.length}, Today: ${todayList.length}, Tomorrow: ${tomorrowList.length})_\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    if (format === 'compact') {
        targetUnits.forEach((u, i) => {
            const num = withNumbers ? `${i + 1}. ` : '• ';
            const tgt = Number(u.details?.targetValue || 0).toLocaleString('id-ID');
            const metric = u.details?.metricLabel || 'HM';
            const svc = u.details?.serviceType || 'PM';
            const model = u.model ? ` (${u.model})` : '';
            const dateNote = u.details?.targetDate && u.details.targetDate !== '-' ? ` (${u.details.targetDate})` : '';
            text += `${num}*${u.code_unit}*${model} - ${svc} | Target: ${tgt} ${metric}${dateNote}\n`;
        });
        text += '\n';

    } else if (format === 'category') {
        const categories = {};
        targetUnits.forEach(u => {
            const cat = u.category || 'Lainnya';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(u);
        });

        Object.entries(categories).forEach(([catName, list]) => {
            text += `*${catName.toUpperCase()}* (${list.length} Unit)\n`;
            text += `──────────────────────\n`;
            list.forEach((u, i) => {
                const num = withNumbers ? `${i + 1}. ` : '• ';
                const metric = u.details?.metricLabel || 'HM';
                const tgt = Number(u.details?.targetValue || 0).toLocaleString('id-ID');
                const svc = u.details?.serviceType || 'PM';
                const model = u.model ? ` - ${u.model}` : '';
                text += `${num}*${u.code_unit}*${model}\n`;
                text += `   • Service: *${svc}*\n`;
                text += `   • Target: ${tgt} ${metric}\n`;
                if (u.details?.targetDate && u.details.targetDate !== '-') {
                    text += `   • Target Tanggal: ${u.details.targetDate}\n`;
                }
            });
            text += '\n';
        });

    } else {
        // Detailed (Default): Straight sequential list, NO status headings, NO status lines, NO current HM, NO logos
        targetUnits.forEach((u, i) => {
            const num = withNumbers ? `${i + 1}. ` : '• ';
            const metric = u.details?.metricLabel || 'HM';
            const tgt = Number(u.details?.targetValue || 0).toLocaleString('id-ID');
            const svc = u.details?.serviceType || 'PM';
            const model = u.model ? ` - ${u.model}` : '';

            text += `${num}*${u.code_unit}*${model}\n`;
            text += `   • Service: *${svc}*\n`;
            text += `   • Target: ${tgt} ${metric}\n`;
            if (u.details?.targetDate && u.details.targetDate !== '-') {
                text += `   • Target Tanggal: ${u.details.targetDate}\n`;
            }
            text += `\n`;
        });
    }

    if (withFooter) {
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `*Total: ${targetUnits.length} Unit*\n`;
        text += `_Mohon tim Plant & Maintenance mempersiapkan part, tools & koordinasi unit._\n`;
        text += `_Plant Maintenance System_`;
    }

    return text.trim();
}

export default function MonitoringPlanBoard({ units }) {
    const unitToCategory = useMemo(() => {
        const map = {};
        Object.entries(CATEGORY_MAP).forEach(([cat, list]) => list.forEach(code => { map[code] = cat; }));
        return map;
    }, []);

    const isExcludedFromPlan = (code) => {
        if (!code) return false;
        const upper = code.toUpperCase().trim();
        return upper.startsWith('BOX KONTAINER') || 
               upper.startsWith('BOX ') || 
               upper.startsWith('CHAINSAW') || 
               ['GORONG2 BESI', 'MACHINE WELDING +PEMANAS HDPE', 'PIPE HDPE', 'MFS001', 'MFS009', 'MFS010', 'MFS011', 'MFS012'].includes(upper);
    };

    const eligibleUnits = useMemo(() => (units || []).filter(u => !isExcludedFromPlan(u.code_unit)), [units]);

    const augmentedUnits = useMemo(() => eligibleUnits.map(unit => {
        const code = unit.code_unit;
        const category = unitToCategory[code] ?? `${(code?.match(/^[A-Za-z\-]+/)?.[0] ?? "OTHER")} (Lainnya)`;
        const details = getUnitServiceDetails(unit, category);
        const status = calculateStatus(unit.hm, details.targetValue, details.metricLabel, details.interval);
        return { ...unit, category, details, status };
    }), [eligibleUnits, unitToCategory]);

    const [hiddenUnitCodes, setHiddenUnitCodes] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('pm_monitoring_hidden_units');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [showHiddenModal, setShowHiddenModal] = useState(false);
    const [quickHideSearch, setQuickHideSearch] = useState('');

    const handleHideUnit = (code) => {
        if (!code) return;
        setHiddenUnitCodes(prev => {
            if (prev.includes(code)) return prev;
            const updated = [...prev, code];
            try {
                localStorage.setItem('pm_monitoring_hidden_units', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
        showToast(`Unit ${code} berhasil disembunyikan`);
    };

    const handleUnhideUnit = (code) => {
        if (!code) return;
        setHiddenUnitCodes(prev => {
            const updated = prev.filter(c => c !== code);
            try {
                localStorage.setItem('pm_monitoring_hidden_units', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
        showToast(`Unit ${code} ditampilkan kembali`);
    };

    const handleUnhideAll = () => {
        setHiddenUnitCodes([]);
        try {
            localStorage.removeItem('pm_monitoring_hidden_units');
        } catch (e) {}
        showToast('Semua unit telah ditampilkan kembali');
    };

    const visibleUnits = useMemo(() => {
        if (!hiddenUnitCodes.length) return augmentedUnits;
        return augmentedUnits.filter(u => !hiddenUnitCodes.includes(u.code_unit));
    }, [augmentedUnits, hiddenUnitCodes]);

    const hiddenUnitsList = useMemo(() => {
        if (!hiddenUnitCodes.length) return [];
        return augmentedUnits.filter(u => hiddenUnitCodes.includes(u.code_unit));
    }, [augmentedUnits, hiddenUnitCodes]);

    const searchSuggestions = useMemo(() => {
        if (!quickHideSearch.trim()) return [];
        const q = quickHideSearch.toLowerCase().trim();
        return visibleUnits.filter(u => 
            (u.code_unit && u.code_unit.toLowerCase().includes(q)) || 
            (u.model && u.model.toLowerCase().includes(q))
        ).slice(0, 6);
    }, [quickHideSearch, visibleUnits]);

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [collapsed, setCollapsed] = useState({});

    const overdueUnits = useMemo(() => visibleUnits.filter(u => u.status.label === 'OVERDUE'), [visibleUnits]);
    const todayUnits = useMemo(() => visibleUnits.filter(u => u.status.label === 'TODAY'), [visibleUnits]);
    const tomorrowUnits = useMemo(() => visibleUnits.filter(u => u.status.label === 'TOMORROW'), [visibleUnits]);
    const totalUrgent = overdueUnits.length + todayUnits.length + tomorrowUnits.length;

    const summaryCounts = useMemo(() => {
        const c = { ALL: visibleUnits.length, "3_CATEGORIES": 0, OVERDUE: 0, TODAY: 0, TOMORROW: 0, "NEXT SERVICE": 0 };
        visibleUnits.forEach(u => { 
            if (c[u.status.label] !== undefined) c[u.status.label]++; 
            if (['OVERDUE', 'TODAY', 'TOMORROW'].includes(u.status.label)) c["3_CATEGORIES"]++;
        });
        return c;
    }, [visibleUnits]);

    const groupedUnits = useMemo(() => {
        let list = visibleUnits;
        if (activeFilter === "NEXT SERVICE") {
            list = visibleUnits.filter(u => u.status.label === "NEXT SERVICE");
        } else if (activeFilter === "OVERDUE" || activeFilter === "TODAY" || activeFilter === "TOMORROW") {
            list = visibleUnits.filter(u => u.status.label === activeFilter);
        } else if (activeFilter === "3_CATEGORIES") {
            list = visibleUnits.filter(u => ['OVERDUE', 'TODAY', 'TOMORROW'].includes(u.status.label));
        }
        return list.reduce((acc, unit) => {
            if (!acc[unit.category]) acc[unit.category] = [];
            acc[unit.category].push(unit);
            return acc;
        }, {});
    }, [visibleUnits, activeFilter]);

    const categoryOrder = Object.keys(CATEGORY_MAP);
    const sortedCategories = useMemo(() => {
        return Object.keys(groupedUnits).sort((a, b) => {
            const ia = categoryOrder.indexOf(a), ib = categoryOrder.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            return ia !== -1 ? -1 : ib !== -1 ? 1 : a.localeCompare(b);
        });
    }, [groupedUnits, categoryOrder]);

    const urgentSections = useMemo(() => {
        const list = [
            {
                key: 'OVERDUE',
                title: 'OVERDUE',
                desc: 'Unit yang telah melewati target HM/KM dan harus segera diservis',
                headerGradient: 'from-red-600 via-rose-600 to-red-700',
                badgeBg: 'bg-red-500 text-white',
                border: 'border-red-200',
                units: overdueUnits,
            },
            {
                key: 'TODAY',
                title: 'TODAY',
                desc: 'Unit yang jatuh tempo servis hari ini (dalam 24 HM / 500 KM)',
                headerGradient: 'from-red-500 via-orange-500 to-orange-600',
                badgeBg: 'bg-orange-500 text-white',
                border: 'border-orange-200',
                units: todayUnits,
            },
            {
                key: 'TOMORROW',
                title: 'TOMORROW',
                desc: 'Unit yang akan jatuh tempo servis besok (dalam 48 HM / 1.000 KM)',
                headerGradient: 'from-orange-500 via-amber-500 to-amber-600',
                badgeBg: 'bg-amber-500 text-white',
                border: 'border-amber-200',
                units: tomorrowUnits,
            },
        ];

        if (activeFilter === '3_CATEGORIES') {
            return list;
        }
        return list.filter(s => s.key === activeFilter);
    }, [overdueUnits, todayUnits, tomorrowUnits, activeFilter]);

    const FILTERS = [
        {
            key: "ALL",
            label: "Semua Unit & Next Service",
            count: summaryCounts.ALL,
            active: "bg-slate-800 border-slate-800 text-white shadow-md ring-2 ring-slate-400",
            idle: "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
            badgeActive: "bg-white/25 text-white",
            badgeIdle: "bg-slate-100 text-slate-700",
        },
        {
            key: "3_CATEGORIES",
            label: "⚡ Pantau 3 Kategori",
            count: totalUrgent,
            active: "bg-emerald-700 border-emerald-700 text-white shadow-md ring-2 ring-emerald-400 scale-102",
            idle: "bg-emerald-50 border-emerald-300 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100",
            badgeActive: "bg-white/25 text-white",
            badgeIdle: "bg-emerald-200 text-emerald-950 font-black",
        },
        {
            key: "OVERDUE",
            label: "OVERDUE",
            count: summaryCounts.OVERDUE,
            active: "bg-red-600 border-red-600 text-white shadow-md ring-2 ring-red-400 scale-102",
            idle: "bg-[#fff5f5] border-[#ffccd5] text-[#cc0000] hover:border-red-300",
            badgeActive: "bg-white/30 text-white",
            badgeIdle: "bg-[#f1f3f7] text-slate-800",
        },
        {
            key: "TODAY",
            label: "TODAY",
            count: summaryCounts.TODAY,
            active: "bg-red-500 border-red-500 text-white shadow-md ring-2 ring-orange-400 scale-102",
            idle: "bg-[#fffbf0] border-[#fed7aa] text-[#dc2626] hover:border-orange-300",
            badgeActive: "bg-white/30 text-white",
            badgeIdle: "bg-[#f1f3f7] text-slate-800",
        },
        {
            key: "TOMORROW",
            label: "TOMORROW",
            count: summaryCounts.TOMORROW,
            active: "bg-orange-500 border-orange-500 text-white shadow-md ring-2 ring-amber-400 scale-102",
            idle: "bg-[#fffdf5] border-[#fed7aa] text-[#c2410c] hover:border-orange-300",
            badgeActive: "bg-white/30 text-white",
            badgeIdle: "bg-[#f1f3f7] text-slate-800",
        },
        {
            key: "NEXT SERVICE",
            label: "NEXT SERVICE",
            count: summaryCounts["NEXT SERVICE"],
            active: "bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-400",
            idle: "bg-white border-slate-200 text-slate-600 hover:border-slate-400",
            badgeActive: "bg-white/25 text-white",
            badgeIdle: "bg-slate-100 text-slate-700",
        },
    ];

    // WhatsApp Broadcast Feature State
    const [showWaModal, setShowWaModal] = useState(false);
    const [waFormat, setWaFormat] = useState('detailed');
    const [waIncludeOverdue, setWaIncludeOverdue] = useState(true);
    const [waIncludeToday, setWaIncludeToday] = useState(true);
    const [waIncludeTomorrow, setWaIncludeTomorrow] = useState(true);
    const [waWithHeader, setWaWithHeader] = useState(true);
    const [waWithNumbers, setWaWithNumbers] = useState(true);
    const [waWithFooter, setWaWithFooter] = useState(true);
    const [waCustomText, setWaCustomText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const urgentUnits = useMemo(() => {
        return visibleUnits.filter(u => ['OVERDUE', 'TODAY', 'TOMORROW'].includes(u.status?.label));
    }, [visibleUnits]);

    useEffect(() => {
        if (showWaModal) {
            const txt = generatePmWaText({
                units: visibleUnits,
                format: waFormat,
                includeOverdue: waIncludeOverdue,
                includeToday: waIncludeToday,
                includeTomorrow: waIncludeTomorrow,
                withHeader: waWithHeader,
                withNumbers: waWithNumbers,
                withFooter: waWithFooter,
            });
            setWaCustomText(txt);
            setCopySuccess(false);
        }
    }, [
        showWaModal,
        visibleUnits,
        waFormat,
        waIncludeOverdue,
        waIncludeToday,
        waIncludeTomorrow,
        waWithHeader,
        waWithNumbers,
        waWithFooter,
    ]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const fallbackCopyText = (text, successMsg) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(successMsg);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        } catch (err) {
            alert('Gagal menyalin otomatis. Silakan salin teks di kotak preview secara manual.');
        }
        textArea.remove();
    };

    const copyToClipboard = (text, successMsg = 'Pesan berhasil disalin ke clipboard!') => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMsg);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2500);
            }).catch(() => {
                fallbackCopyText(text, successMsg);
            });
        } else {
            fallbackCopyText(text, successMsg);
        }
    };

    const handleOpenWhatsApp = (text) => {
        copyToClipboard(text, 'Teks berhasil disalin! Membuka WhatsApp...');
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleQuickCopy = () => {
        const text = generatePmWaText({
            units: visibleUnits,
            format: 'detailed',
            includeOverdue: true,
            includeToday: true,
            includeTomorrow: true,
            withHeader: true,
            withNumbers: true,
            withFooter: true,
        });
        copyToClipboard(text, 'List Overdue, Today & Tomorrow berhasil disalin ke clipboard!');
    };



    const renderTableHeader = (showCategory = false) => (
        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <tr className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="text-center px-2.5 py-2.5 w-8">#</th>
                <th className="text-left px-3 py-2.5 min-w-[80px]">UNIT</th>
                <th className="text-left px-3 py-2.5 min-w-[100px]">MODEL</th>
                {showCategory && (
                    <th className="text-left px-3 py-2.5 min-w-[110px]">KATEGORI ALAT</th>
                )}
                <th className="text-left px-3 py-2.5 min-w-[95px]">LAST SVC DATE</th>
                <th className="text-right px-3 py-2.5 min-w-[95px]">LAST SVC HM</th>
                <th className="text-right px-3 py-2.5 min-w-[90px]">CURR HM</th>
                <th className="text-right px-3 py-2.5 min-w-[90px]">TARGET</th>
                <th className="text-left px-3 py-2.5 min-w-[100px]">TYPE SERVICE</th>
                <th className="text-left px-3 py-2.5 min-w-[110px]">NEXT SVC DATE</th>
                <th className="text-right px-3 py-2.5 min-w-[100px]">REMAINING</th>
                <th className="text-center px-3 py-2.5 w-24">PROGRESS</th>
                <th className="text-center px-3 py-2.5 min-w-[110px]">STATUS</th>
                <th className="text-center px-3 py-2.5 min-w-[75px]">BACKLOG</th>
                <th className="text-center px-3 py-2.5 min-w-[70px]">FINDING</th>
                <th className="text-center px-3 py-2.5 min-w-[70px]">SOS/PAP</th>
                <th className="text-center px-2 py-2.5 w-10 text-slate-400 font-bold" title="Sembunyikan Unit">HIDE</th>
            </tr>
        </thead>
    );

    const renderUnitRow = (unit, idx, showCategory = false) => {
        const { details, status } = unit;
        const cfg = STATUS_CONFIG[status.label] ?? STATUS_CONFIG["NEXT SERVICE"];
        const lastSvc = unit.last_service || unit.lastService;
        const lastSvcDateRaw = lastSvc?.actual_date || lastSvc?.target_date;
        const lastSvcDate = lastSvcDateRaw 
            ? new Date(lastSvcDateRaw).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
            : "-";

        const rawLastSvcHm = lastSvc?.actual_hm ?? lastSvc?.target_hm;
        const lastSvcHmFormatted = rawLastSvcHm != null 
            ? Number(rawLastSvcHm).toLocaleString("id-ID", { maximumFractionDigits: 1 })
            : "-";

        const currHmFormatted = unit.hm != null 
            ? Number(unit.hm).toLocaleString("id-ID", { maximumFractionDigits: 1 })
            : "-";

        const targetFormatted = details.targetValue != null 
            ? Number(details.targetValue).toLocaleString("id-ID", { maximumFractionDigits: 1 })
            : "-";

        const backlogCount = unit.backlog_orders_count ?? 0;

        return (
            <tr
                key={unit.id}
                onClick={() => router.visit(`/work-orders/create?unit_id=${unit.id}&tipe_wo=SCHEDULE&from=pm-monitoring`)}
                className={`transition-colors cursor-pointer ${cfg.row}`}
                title={`Klik untuk membuat Service Order untuk ${unit.code_unit}`}
            >
                <td className="px-2.5 py-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                <td className="px-3 py-2 font-black text-[#012922] text-xs tracking-wide">
                    {unit.code_unit}
                </td>
                <td className="px-3 py-2 text-slate-600 font-medium max-w-[120px] truncate" title={unit.model || "-"}>
                    {unit.model || "-"}
                </td>
                {showCategory && (
                    <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {unit.category}
                        </span>
                    </td>
                )}
                <td className="px-3 py-2 text-left text-slate-600 font-medium whitespace-nowrap">
                    {lastSvcDate}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-slate-600 tabular-nums">
                    {lastSvcHmFormatted}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 tabular-nums">
                    {currHmFormatted}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-[#0b6e4f] tabular-nums">
                    {targetFormatted}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                        {details.serviceType}
                    </span>
                </td>
                <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap text-left">
                    {details.targetDate}
                </td>
                <td className={`px-3 py-2 text-right font-mono text-xs whitespace-nowrap tabular-nums font-bold ${status.isOverdue ? "text-red-600" : "text-slate-800"}`}>
                    {status.remaining}
                </td>
                <td className="px-3 py-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                        <div className={`h-full ${cfg.dot} rounded-full transition-all`} style={{ width: `${status.progress}%` }} />
                    </div>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                    <span className={`${cfg.bg} ${cfg.text} text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs`}>
                        {status.label}
                    </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {backlogCount > 0 ? (
                        <Link
                            href={`/monitoring-orderan?search=${encodeURIComponent(unit.code_unit)}`}
                            className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-xs"
                            title={`Lihat ${backlogCount} order backlog di Monitoring Orderan`}
                        >
                            {backlogCount}
                        </Link>
                    ) : (
                        <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-400 bg-slate-100">
                            0
                        </span>
                    )}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-400 bg-slate-100">
                        0
                    </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        N/A
                    </span>
                </td>
                <td className="px-2 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => handleHideUnit(unit.code_unit)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={`Sembunyikan ${unit.code_unit} dari daftar monitoring`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filter Chips & Action Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                    {FILTERS.map(f => {
                        const isActive = activeFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => {
                                    if (isActive && f.key !== 'ALL') {
                                        setActiveFilter('ALL');
                                    } else {
                                        setActiveFilter(f.key);
                                    }
                                }}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-black text-xs uppercase tracking-wider transition-all cursor-pointer select-none active:scale-95 ${
                                    isActive ? f.active : f.idle
                                }`}
                                title={`Klik untuk memfilter tampilan ke ${f.label}`}
                            >
                                <span>{f.label}</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                    isActive ? f.badgeActive : f.badgeIdle
                                }`}>
                                    {f.count}
                                </span>
                            </button>
                        );
                    })}

                    {activeFilter !== 'ALL' && (
                        <button
                            type="button"
                            onClick={() => setActiveFilter('ALL')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg transition-colors cursor-pointer ml-1 active:scale-95"
                            title="Tampilkan kembali semua unit dan Next Service"
                        >
                            <span>✕</span>
                            <span>Reset Filter</span>
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Hide Unit Manager Button */}
                    <button
                        type="button"
                        onClick={() => setShowHiddenModal(true)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                            hiddenUnitCodes.length > 0 
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                        }`}
                        title="Kelola unit yang disembunyikan"
                    >
                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                        <span>Hide Unit</span>
                        {hiddenUnitCodes.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                                {hiddenUnitCodes.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowWaModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        title="Buka dialog format dan preview pesan WhatsApp"
                    >
                        <WhatsAppIcon className="w-4 h-4 text-emerald-100" />
                        <span>Copy WA (Overdue, Today, Tomorrow)</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-[11px] font-black tracking-wider">
                            {totalUrgent} Unit
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={handleQuickCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        title="Salin cepat langsung ke clipboard tanpa buka dialog"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Salin Cepat</span>
                    </button>
                </div>
            </div>

            {/* Content Tables: Either Urgent Dedicated Sections OR Full Equipment Category View with Next Service */}
            {(activeFilter === '3_CATEGORIES' || activeFilter === 'OVERDUE' || activeFilter === 'TODAY' || activeFilter === 'TOMORROW') ? (
                /* Dedicated Urgent Sections (Overdue, Today, Tomorrow) */
                <div className="space-y-4">
                    {urgentSections.map(section => {
                        const isCollapsed = collapsed[section.key];
                        return (
                            <div key={section.key} className={`bg-white rounded-xl border ${section.border} shadow-sm overflow-hidden animate-fade-in`}>
                                {/* Section Header Banner */}
                                <div
                                    className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${section.headerGradient} text-white cursor-pointer select-none transition-all`}
                                    onClick={() => setCollapsed(prev => ({ ...prev, [section.key]: !isCollapsed }))}
                                >
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-black text-xs md:text-sm uppercase tracking-wider">
                                            KATEGORI: {section.title}
                                        </span>
                                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs ${section.badgeBg}`}>
                                            {section.units.length} Unit
                                        </span>
                                        <span className="text-xs text-white/85 hidden md:inline">
                                            {section.desc}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-white/75 hidden sm:inline">
                                            {isCollapsed ? 'Buka Tabel' : 'Tutup Tabel'}
                                        </span>
                                        <svg className={`w-4 h-4 text-white transition-transform flex-shrink-0 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Section Table */}
                                {!isCollapsed && (
                                    section.units.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs border-collapse">
                                                {renderTableHeader(true)}
                                                <tbody className="divide-y divide-slate-100">
                                                    {section.units.map((unit, idx) => renderUnitRow(unit, idx, true))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                                            Tidak ada unit dalam kategori {section.title}.
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Full Equipment Categories View (Includes ALL units and NEXT SERVICE) */
                sortedCategories.length > 0 ? (
                    sortedCategories.map(category => {
                        const catUnits = groupedUnits[category] || [];
                        if (catUnits.length === 0) return null;
                        const isCollapsed = collapsed[category];
                        const urgentCounts = { OVERDUE: 0, TODAY: 0, TOMORROW: 0 };
                        catUnits.forEach(u => { if (urgentCounts[u.status.label] !== undefined) urgentCounts[u.status.label]++; });

                        return (
                            <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                                {/* Section Header */}
                                <div
                                    className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#012922] to-[#0b6e4f] cursor-pointer select-none transition-colors"
                                    onClick={() => setCollapsed(prev => ({ ...prev, [category]: !isCollapsed }))}
                                >
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-white font-black text-xs md:text-sm uppercase tracking-wider">{category}</span>
                                        <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{catUnits.length} Unit</span>
                                        {urgentCounts.OVERDUE > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                                                {urgentCounts.OVERDUE} OVERDUE
                                            </span>
                                        )}
                                        {urgentCounts.TODAY > 0 && (
                                            <span className="bg-red-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                {urgentCounts.TODAY} TODAY
                                            </span>
                                        )}
                                        {urgentCounts.TOMORROW > 0 && (
                                            <span className="bg-orange-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                {urgentCounts.TOMORROW} TOMORROW
                                            </span>
                                        )}
                                    </div>
                                    <svg className={`w-4 h-4 text-white/80 transition-transform flex-shrink-0 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {!isCollapsed && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs border-collapse">
                                            {renderTableHeader(false)}
                                            <tbody className="divide-y divide-slate-100">
                                                {catUnits.map((unit, idx) => renderUnitRow(unit, idx, false))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                        <p className="font-bold text-sm">Tidak ada unit untuk filter yang dipilih.</p>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('ALL')}
                            className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                            Tampilkan Semua Unit & Next Service
                        </button>
                    </div>
                )
            )}

            {/* WhatsApp Broadcast Modal */}
            {showWaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                                    <WhatsAppIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                                        Copy Jadwal Service ke WhatsApp
                                    </h3>
                                    <p className="text-xs text-emerald-100">
                                        Khusus unit Overdue, Today & Tomorrow siap kirim ke grup koordinasi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWaModal(false)}
                                className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
                            {/* Statistics Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-red-800 dark:text-red-300">Overdue</span>
                                    <span className="px-2 py-0.5 rounded-md bg-red-500 text-white font-black text-xs">{summaryCounts.OVERDUE} Unit</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-orange-800 dark:text-orange-300">Today</span>
                                    <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-black text-xs">{summaryCounts.TODAY} Unit</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Tomorrow</span>
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs">{summaryCounts.TOMORROW} Unit</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Target</span>
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-xs">
                                        {totalUrgent} Unit
                                    </span>
                                </div>
                            </div>

                            {/* Controls Row: Format Tabs & Status Filters */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                                {/* Format Selector */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Gaya Format Pesan:
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { key: 'detailed', label: 'Standar / Rinci', desc: 'Target & Tanggal' },
                                            { key: 'compact', label: 'Ringkas (1 Baris)', desc: 'Padat per unit' },
                                            { key: 'category', label: 'Per Kategori Alat', desc: 'Dikelompokkan jenis alat' },
                                        ].map(fmt => (
                                            <button
                                                key={fmt.key}
                                                type="button"
                                                onClick={() => setWaFormat(fmt.key)}
                                                className={`px-3 py-2 rounded-lg text-left border transition-all ${
                                                    waFormat === fmt.key
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                }`}
                                            >
                                                <div className="font-bold text-xs">{fmt.label}</div>
                                                <div className={`text-[10px] truncate ${waFormat === fmt.key ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                    {fmt.desc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filter Checkboxes */}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                                    <span className="font-bold text-slate-600 dark:text-slate-400">Sertakan:</span>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={waIncludeOverdue}
                                            onChange={e => setWaIncludeOverdue(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Overdue ({summaryCounts.OVERDUE})</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={waIncludeToday}
                                            onChange={e => setWaIncludeToday(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Today ({summaryCounts.TODAY})</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={waIncludeTomorrow}
                                            onChange={e => setWaIncludeTomorrow(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Tomorrow ({summaryCounts.TOMORROW})</span>
                                    </label>
                                </div>

                                {/* Additional Options */}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={waWithHeader}
                                            onChange={e => setWaWithHeader(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Header & Tanggal</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={waWithNumbers}
                                            onChange={e => setWaWithNumbers(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Nomor Urut</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={waWithFooter}
                                            onChange={e => setWaWithFooter(e.target.checked)}
                                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                        />
                                        <span>Footer Pesan</span>
                                    </label>
                                </div>
                            </div>

                            {/* Preview Box */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <span>Preview Teks WhatsApp:</span>
                                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                                            (Dapat diedit langsung sebelum disalin)
                                        </span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {waCustomText.length} Karakter
                                    </span>
                                </div>
                                <textarea
                                    value={waCustomText}
                                    onChange={e => setWaCustomText(e.target.value)}
                                    rows={12}
                                    className="w-full p-3.5 font-mono text-xs leading-relaxed bg-slate-900 text-emerald-300 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-y"
                                    placeholder="Menghasilkan teks WhatsApp..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowWaModal(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                                Tutup
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(waCustomText, "Pesan WhatsApp berhasil disalin ke clipboard!")}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                                        copySuccess
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {copySuccess ? (
                                        <>
                                            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Tersalin ke Clipboard!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            <span>Salin ke Clipboard</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleOpenWhatsApp(waCustomText)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    <span>Kirim via WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Units Management Modal */}
            {showHiddenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-black tracking-tight">
                                            Daftar Unit Tersembunyi (Hide Unit)
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white/25 text-white">
                                            {hiddenUnitCodes.length} Unit
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-100 mt-0.5">
                                        Unit yang disembunyikan tidak muncul pada tabel monitoring dan tidak masuk ke pesan WhatsApp
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHiddenModal(false)}
                                className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
                            {/* Quick Hide Search Bar */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                                    Cari & Sembunyikan Unit Lain:
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={quickHideSearch}
                                        onChange={(e) => setQuickHideSearch(e.target.value)}
                                        placeholder="Ketik code unit (misal: B-16, ME048)..."
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {searchSuggestions.length > 0 && (
                                    <div className="mt-2 space-y-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 max-h-40 overflow-y-auto">
                                        {searchSuggestions.map(u => (
                                            <div
                                                key={u.id}
                                                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white">{u.code_unit}</span>
                                                    <span className="text-[11px] text-slate-400 ml-2">{u.model}</span>
                                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {u.status.label}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleHideUnit(u.code_unit);
                                                        setQuickHideSearch('');
                                                    }}
                                                    className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md transition cursor-pointer"
                                                >
                                                    + Sembunyikan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Hidden Units List */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Unit Yang Sedang Disembunyikan ({hiddenUnitsList.length})
                                    </h4>
                                    {hiddenUnitsList.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleUnhideAll}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                                        >
                                            Tampilkan Semua Kembali
                                        </button>
                                    )}
                                </div>

                                {hiddenUnitsList.length > 0 ? (
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                        {hiddenUnitsList.map((u, idx) => {
                                            const cfg = STATUS_CONFIG[u.status.label] ?? STATUS_CONFIG["NEXT SERVICE"];
                                            return (
                                                <div key={u.id} className="p-3 bg-white dark:bg-slate-900/50 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-sm text-slate-900 dark:text-white">
                                                                    {u.code_unit}
                                                                </span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {u.model || '-'}
                                                                </span>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                    {u.category}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                                                <span>Curr HM: <strong className="text-slate-700 dark:text-slate-300">{u.hm ? Number(u.hm).toLocaleString('id-ID') : '-'}</strong></span>
                                                                <span>•</span>
                                                                <span>Target: <strong className="text-[#0b6e4f]">{u.details.targetValue ? Number(u.details.targetValue).toLocaleString('id-ID') : '-'}</strong></span>
                                                                <span>•</span>
                                                                <span>Remaining: <strong className={u.status.isOverdue ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}>{u.status.remaining}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className={`${cfg.bg} ${cfg.text} text-[10px] font-black px-2 py-0.5 rounded-full uppercase`}>
                                                            {u.status.label}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnhideUnit(u.code_unit)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 transition cursor-pointer"
                                                            title="Tampilkan kembali unit ini di tabel"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>Tampilkan</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 mb-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                            Tidak ada unit yang disembunyikan.
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Tekan tombol ikon mata coret pada kolom HIDE di tabel monitoring untuk menyembunyikan unit.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Total {hiddenUnitsList.length} unit disembunyikan
                            </span>
                            <div className="flex items-center gap-2">
                                {hiddenUnitsList.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleUnhideAll}
                                        className="px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition cursor-pointer"
                                    >
                                        Tampilkan Semua
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowHiddenModal(false)}
                                    className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition cursor-pointer"
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
