import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";

const STATUS_CONFIG = {
    "OVERDUE":      { bg: "bg-red-500",    text: "text-white", row: "bg-red-50",    dot: "bg-red-500" },
    "TODAY":        { bg: "bg-red-400",    text: "text-white", row: "bg-orange-50", dot: "bg-red-400" },
    "TOMORROW":     { bg: "bg-orange-400", text: "text-white", row: "bg-yellow-50", dot: "bg-orange-400" },
    "NEXT SERVICE": { bg: "bg-green-500",  text: "text-white", row: "bg-white",     dot: "bg-green-500" },
};

const FILTERS = [
    { key: "ALL",          label: "All Units",    active: "bg-slate-800 border-slate-800 text-white",   idle: "bg-white border-gray-200 text-slate-700 hover:border-slate-400" },
    { key: "OVERDUE",      label: "Overdue",      active: "bg-red-600 border-red-600 text-white",       idle: "bg-red-50 border-red-200 text-red-700 hover:border-red-400" },
    { key: "TODAY",        label: "Today",        active: "bg-red-400 border-red-400 text-white",       idle: "bg-orange-50 border-orange-200 text-red-600 hover:border-red-300" },
    { key: "TOMORROW",     label: "Tomorrow",     active: "bg-orange-500 border-orange-500 text-white", idle: "bg-amber-50 border-orange-200 text-orange-700 hover:border-orange-400" },
    { key: "NEXT SERVICE", label: "Next Service", active: "bg-green-600 border-green-600 text-white",   idle: "bg-green-50 border-green-200 text-green-700 hover:border-green-400" },
];

const CATEGORY_MAP = {
    "Excavator Big Digger":   ["ME049","ME055","ME056"],
    "Excavator Crusher":      ["ME023","ME053"],
    "Excavator Small Digger": ["ME048","ME052","ME057","ME059","ME066","ME067","ME068","ME069","ME070","ME072"],
    "Bulldozer":              ["MD036","MD037","MD041","MD042","MD043","MD045","MD046","MD047","MD048"],
    "Motor Grader":           ["MG018","MG019","MG021"],
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
    const currentHm = unit.hm || 0;
    let targetValue = null, serviceType = "", targetDate = "-", metricLabel = "HM", interval = 250;

    if (unit.code_unit === "MSC001") {
        metricLabel = "Date"; serviceType = "Service 1 Bulan";
        const d = nextService?.target_date ? new Date(nextService.target_date) : (() => { const n = new Date(); n.setMonth(n.getMonth() + 1); return n; })();
        targetDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    } else if (category === "Light Vehicle") {
        metricLabel = "KM"; interval = 5000;
        targetValue = nextService?.target_hm ?? (Math.floor(currentHm / interval) + 1) * interval;
        serviceType = nextService?.service_type ?? `Service ${targetValue} KM`;
    } else {
        metricLabel = "HM"; interval = 250;
        targetValue = nextService?.target_hm ?? (Math.floor(currentHm / interval) + 1) * interval;
        if (nextService?.service_type) { serviceType = `PS ${nextService.service_type} H`; }
        else if (targetValue % 2000 === 0) serviceType = "PS 2000 H";
        else if (targetValue % 1000 === 0) serviceType = "PS 1000 H";
        else if (targetValue % 500 === 0)  serviceType = "PS 500 H";
        else serviceType = "PS 250 H";
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
    if (metricLabel === "Date") return { label: "NEXT SERVICE", remaining: "1 Bulan", progress: 50 };
    if (currentVal == null || !targetVal) return { label: "NEXT SERVICE", remaining: "-", progress: 50 };
    const diff = targetVal - currentVal;
    const progress = Math.min(100, Math.max(0, ((interval - diff) / interval) * 100));
    const remaining = `${Math.round(Math.max(0, diff) * 10) / 10} ${metricLabel}`;
    if (diff < 0) return { label: "OVERDUE", remaining, progress: 100 };
    if (metricLabel === "HM") {
        if (diff <= 24) return { label: "TODAY",    remaining, progress };
        if (diff <= 48) return { label: "TOMORROW", remaining, progress };
    } else {
        if (diff <= 500)  return { label: "TODAY",    remaining, progress };
        if (diff <= 1000) return { label: "TOMORROW", remaining, progress };
    }
    return { label: "NEXT SERVICE", remaining, progress };
}

export default function MonitoringPlanBoard({ units }) {
    const unitToCategory = useMemo(() => {
        const map = {};
        Object.entries(CATEGORY_MAP).forEach(([cat, list]) => list.forEach(code => { map[code] = cat; }));
        return map;
    }, []);

    const augmentedUnits = useMemo(() => units.map(unit => {
        const code = unit.code_unit;
        const category = unitToCategory[code] ?? `${(code?.match(/^[A-Za-z\-]+/)?.[0] ?? "OTHER")} (Lainnya)`;
        const details = getUnitServiceDetails(unit, category);
        const status = calculateStatus(unit.hm, details.targetValue, details.metricLabel, details.interval);
        return { ...unit, category, details, status };
    }), [units, unitToCategory]);

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [collapsed, setCollapsed] = useState({});

    const summaryCounts = useMemo(() => {
        const c = { ALL: augmentedUnits.length, OVERDUE: 0, TODAY: 0, TOMORROW: 0, "NEXT SERVICE": 0 };
        augmentedUnits.forEach(u => { if (c[u.status.label] !== undefined) c[u.status.label]++; });
        return c;
    }, [augmentedUnits]);

    const groupedUnits = useMemo(() => augmentedUnits
        .filter(u => activeFilter === "ALL" || u.status.label === activeFilter)
        .reduce((acc, unit) => { if (!acc[unit.category]) acc[unit.category] = []; acc[unit.category].push(unit); return acc; }, {}),
    [augmentedUnits, activeFilter]);

    const categoryOrder = Object.keys(CATEGORY_MAP);
    const sortedCategories = Object.keys(groupedUnits).sort((a, b) => {
        const ia = categoryOrder.indexOf(a), ib = categoryOrder.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return ia !== -1 ? -1 : ib !== -1 ? 1 : a.localeCompare(b);
    });

    return (
        <div className="space-y-3 mt-2">
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all ${activeFilter === f.key ? f.active : f.idle}`}
                    >
                        <span>{f.label}</span>
                        <span className={`font-black px-2 py-0.5 rounded-md text-sm ${activeFilter === f.key ? "bg-white/25" : "bg-gray-100"}`}>
                            {summaryCounts[f.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Category Tables */}
            {sortedCategories.map(category => {
                const catUnits = groupedUnits[category];
                const isCollapsed = collapsed[category];
                const urgentCounts = { OVERDUE: 0, TODAY: 0, TOMORROW: 0 };
                catUnits.forEach(u => { if (urgentCounts[u.status.label] !== undefined) urgentCounts[u.status.label]++; });

                return (
                    <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#012922] to-[#0b6e4f] cursor-pointer select-none"
                            onClick={() => setCollapsed(prev => ({ ...prev, [category]: !isCollapsed }))}
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-black text-sm uppercase tracking-wider">{category}</span>
                                <span className="bg-white/20 text-white text-sm font-bold px-2 py-0.5 rounded-full">{catUnits.length} unit</span>
                                {urgentCounts.OVERDUE > 0 && (
                                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full animate-pulse">
                                        {urgentCounts.OVERDUE} OVERDUE
                                    </span>
                                )}
                                {urgentCounts.TODAY > 0 && (
                                    <span className="bg-red-400 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                                        {urgentCounts.TODAY} TODAY
                                    </span>
                                )}
                                {urgentCounts.TOMORROW > 0 && (
                                    <span className="bg-orange-400 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                                        {urgentCounts.TOMORROW} TOMORROW
                                    </span>
                                )}
                            </div>
                            <svg className={`w-3.5 h-3.5 text-white/80 transition-transform flex-shrink-0 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {!isCollapsed && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-base">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-3 py-2 font-bold text-gray-400 w-6">#</th>
                                            <th className="text-left px-3 py-2 font-bold text-gray-500">UNIT</th>
                                            <th className="text-left px-3 py-2 font-bold text-gray-500">MODEL</th>
                                            <th className="text-right px-3 py-2 font-bold text-gray-500">CURR HM</th>
                                            <th className="text-right px-3 py-2 font-bold text-gray-500">TARGET</th>
                                            <th className="text-left px-3 py-2 font-bold text-gray-500">TYPE SERVICE</th>
                                            <th className="text-left px-3 py-2 font-bold text-gray-500">NEXT SERVICE DATE</th>
                                            <th className="text-right px-3 py-2 font-bold text-gray-500">REMAINING</th>
                                            <th className="text-center px-3 py-2 font-bold text-gray-500 w-24">PROGRESS</th>
                                            <th className="text-center px-3 py-2 font-bold text-gray-500">STATUS</th>
                                            <th className="text-center px-3 py-2 font-bold text-gray-500">BACKLOG</th>
                                            <th className="text-center px-3 py-2 font-bold text-gray-500">FINDING</th>
                                            <th className="text-center px-3 py-2 font-bold text-gray-500">SOS/PAP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {catUnits.map((unit, idx) => {
                                            const { details, status } = unit;
                                            const cfg = STATUS_CONFIG[status.label] ?? STATUS_CONFIG["NEXT SERVICE"];
                                            return (
                                                <tr
                                                    key={unit.id}
                                                    onClick={() => router.visit(`/work-orders/create?unit_id=${unit.id}&tipe_wo=SCHEDULE`)}
                                                    className={`hover:bg-blue-50 transition-colors cursor-pointer ${cfg.row}`}
                                                >
                                                    <td className="px-3 py-2.5 text-gray-300 font-bold">{idx + 1}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className="font-black text-[#012922] text-sm">{unit.code_unit}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-500 max-w-[140px] truncate">{unit.model || "-"}</td>
                                                    <td className="px-3 py-2.5 text-right font-bold text-slate-700">{unit.hm ?? "-"}</td>
                                                    <td className="px-3 py-2.5 text-right font-bold text-[#0b6e4f]">{details.targetValue ?? "-"}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-sm whitespace-nowrap">{details.serviceType}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">{details.targetDate}</td>
                                                    <td className="px-3 py-2.5 text-right font-bold text-gray-700 whitespace-nowrap">{status.remaining}</td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                            <div className={`h-full ${cfg.dot} rounded-full transition-all`} style={{ width: `${status.progress}%` }} />
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`${cfg.bg} ${cfg.text} text-sm font-black px-2.5 py-1 rounded-full uppercase whitespace-nowrap`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className="bg-gray-100 text-gray-700 font-bold px-3 py-0.5 rounded-full text-sm">0</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className="bg-gray-100 text-gray-700 font-bold px-3 py-0.5 rounded-full text-sm">0</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className="bg-green-50 text-green-700 font-bold px-3 py-0.5 rounded-full text-sm">N/A</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
