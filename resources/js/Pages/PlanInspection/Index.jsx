import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

// ─── Editable Plan Activity Cell ─────────────────────────────────────────────
function EditableTarget({ unitId, category, month, year, initialValue }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initialValue ?? 0);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { setValue(initialValue ?? 0); }, [initialValue]);
    useEffect(() => { if (editing && inputRef.current) inputRef.current.select(); }, [editing]);

    const save = async () => {
        setSaving(true);
        setEditing(false);
        try {
            await axios.post(route('plan-inspections.update-target'), {
                unit_id: unitId, category, month, year, target_value: parseInt(value, 10) || 0,
            });
        } catch (e) {
            console.error('Failed to save target', e);
        } finally {
            setSaving(false);
        }
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="number"
                min="0"
                className="w-12 text-center text-sm border border-blue-400 rounded outline-none bg-blue-50 p-0"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            />
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            title="Klik untuk edit target"
            className={`cursor-pointer px-1 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors ${saving ? 'opacity-50' : ''}`}
        >
            {value}
            <span className="ml-0.5 text-gray-300 text-[9px]">✎</span>
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Index({ auth, groupedUnits, planData, targetData, currentMonth, currentYear, daysInMonth, unitTypes }) {
    const [activeTab, setActiveTab] = useState('inspection');
    const [localPlanData, setLocalPlanData] = useState(planData);

    // Dashboard states
    const [dashData, setDashData] = useState(null);
    const [dashLoading, setDashLoading] = useState(false);
    const [dashStartDate, setDashStartDate] = useState(
        `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    );
    const [dashEndDate, setDashEndDate] = useState(
        `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    );
    const [dashUnitType, setDashUnitType] = useState('all');

    const fetchDashboardData = useCallback(async () => {
        setDashLoading(true);
        try {
            const res = await axios.get(route('plan-inspections.dashboard'), {
                params: { start_date: dashStartDate, end_date: dashEndDate, unit_type: dashUnitType }
            });
            setDashData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setDashLoading(false);
        }
    }, [dashStartDate, dashEndDate, dashUnitType]);

    useEffect(() => {
        if (activeTab === 'achievement') fetchDashboardData();
    }, [activeTab, fetchDashboardData]);

    // ─── Crosstab helpers ──────────────────────────────────────────────────
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const getWeekNumber = (day) => Math.ceil(day / 7);

    const handleToggle = async (unitId, day) => {
        if (activeTab === 'achievement') return;
        const category = activeTab;
        const prevData = JSON.parse(JSON.stringify(localPlanData));
        const isChecked = !!localPlanData[unitId]?.[category]?.[day];

        setLocalPlanData(prev => ({
            ...prev,
            [unitId]: {
                ...(prev[unitId] || {}),
                [category]: { ...(prev[unitId]?.[category] || {}), [day]: !isChecked }
            }
        }));

        try {
            await axios.post(route('plan-inspections.toggle'), {
                unit_id: unitId, day, month: currentMonth, year: currentYear, category
            });
        } catch {
            setLocalPlanData(prevData);
            alert('Terjadi kesalahan saat menyimpan data.');
        }
    };

    const calculateStats = (unitId, category) => {
        let totalActiv = 0;
        let weekCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const unitCatData = localPlanData[unitId]?.[category] || {};
        daysArray.forEach(day => {
            if (unitCatData[day]) { weekCounts[getWeekNumber(day)]++; totalActiv++; }
        });
        const targetPlann = targetData?.[unitId]?.[category] ?? 0;
        const ach = targetPlann > 0 ? ((totalActiv / targetPlann) * 100).toFixed(0) : '-';
        return { totalActiv, targetPlann, ach, weekCounts };
    };

    const weekColors = {
        1: 'bg-orange-200', 2: 'bg-blue-200', 3: 'bg-green-300',
        4: 'bg-blue-500 text-white', 5: 'bg-purple-500 text-white',
    };

    const tabs = [
        { id: 'washing',     label: '🧼 Washing Unit' },
        { id: 'inspection',  label: '🔍 Inspection Unit' },
        { id: 'greasing',    label: '🛢️ Greasing Unit' },
        { id: 'achievement', label: '🏆 Achievement' },
    ];

    // ─── Crosstab renderer ─────────────────────────────────────────────────
    const renderCrosstab = () => (
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border border-gray-300 custom-scrollbar relative mt-4">
            <p className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 border-b border-indigo-100">
                💡 <b>Plan Activity</b>: klik angka untuk mengubah target. &nbsp;|&nbsp; Klik sel tanggal untuk menambah/menghapus rencana.
            </p>
            <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
                    <tr>
                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 sticky left-0 z-30 bg-yellow-400 font-bold w-10">NO</th>
                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 sticky left-[40px] z-30 bg-yellow-400 font-bold min-w-[120px]">MODEL</th>
                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 sticky left-[160px] z-30 bg-yellow-400 font-bold min-w-[140px]">CODE/N</th>

                        {daysArray.map(day => (
                            <th key={day} className={`border border-gray-400 px-1 py-1 font-bold min-w-[28px] ${weekColors[getWeekNumber(day)] || 'bg-gray-200'}`}>
                                {day}
                            </th>
                        ))}

                        <th className="border border-gray-400 px-2 py-1 bg-orange-200 font-bold">W1</th>
                        <th className="border border-gray-400 px-2 py-1 bg-blue-200 font-bold">W2</th>
                        <th className="border border-gray-400 px-2 py-1 bg-green-200 font-bold">W3</th>
                        <th className="border border-gray-400 px-2 py-1 bg-blue-300 font-bold">W4</th>
                        <th className="border border-gray-400 px-2 py-1 bg-purple-300 font-bold">W5</th>

                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 bg-yellow-400 font-bold leading-tight">Total<br/>Activ</th>
                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 bg-blue-400 text-white font-bold leading-tight">Plan<br/>Activity</th>
                        <th rowSpan="2" className="border border-gray-400 px-2 py-1 bg-yellow-400 font-bold">ACH</th>
                    </tr>
                    <tr>
                        {daysArray.map(day => <th key={`s-${day}`} className="border border-gray-400 px-1 py-1 bg-gray-50 h-4"></th>)}
                        <th className="border bg-gray-50"></th><th className="border bg-gray-50"></th>
                        <th className="border bg-gray-50"></th><th className="border bg-gray-50"></th>
                        <th className="border bg-gray-50"></th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(groupedUnits).map((typeUnit) => {
                        let no = 1;
                        return (
                            <React.Fragment key={typeUnit}>
                                <tr className="bg-gray-200 font-bold uppercase text-left">
                                    <td colSpan={3} className="border border-gray-400 px-2 py-1 sticky left-0 z-10 bg-gray-200">{typeUnit}</td>
                                    <td colSpan={daysInMonth + 8} className="border border-gray-400 bg-gray-200"></td>
                                </tr>
                                {groupedUnits[typeUnit].map((unit) => {
                                    const { totalActiv, targetPlann, ach, weekCounts } = calculateStats(unit.id, activeTab);
                                    const unitCatData = localPlanData[unit.id]?.[activeTab] || {};
                                    const achColor = ach !== '-' && ach >= 100 ? 'bg-green-500 text-white' : 'bg-gray-100';

                                    return (
                                        <tr key={unit.id} className="hover:bg-gray-50">
                                            <td className="border border-gray-400 px-2 py-1 sticky left-0 z-10 bg-white">{no++}</td>
                                            <td className="border border-gray-400 px-2 py-1 sticky left-[40px] z-10 bg-white text-left max-w-[120px] truncate" title={unit.model}>{unit.model}</td>
                                            <td className="border border-gray-400 px-2 py-1 sticky left-[160px] z-10 bg-white font-semibold">{unit.code_unit}</td>

                                            {daysArray.map(day => {
                                                const isChecked = !!unitCatData[day];
                                                return (
                                                    <td
                                                        key={day}
                                                        onClick={() => handleToggle(unit.id, day)}
                                                        className={`border border-gray-400 cursor-pointer hover:bg-pink-100 transition-colors ${isChecked ? 'bg-pink-200' : 'bg-white'}`}
                                                    >
                                                        {isChecked && <span className="text-red-600 font-bold">✔</span>}
                                                    </td>
                                                );
                                            })}

                                            {[1,2,3,4,5].map(w => (
                                                <td key={w} className={`border border-gray-400 px-1 py-1 ${weekCounts[w] > 0 ? 'bg-pink-200 text-red-700 font-bold' : ''}`}>{weekCounts[w] || 0}</td>
                                            ))}

                                            <td className="border border-gray-400 px-2 py-1 font-bold bg-yellow-100">{totalActiv}</td>
                                            <td className="border border-gray-400 px-2 py-1 bg-blue-50 font-semibold">
                                                <EditableTarget
                                                    unitId={unit.id}
                                                    category={activeTab}
                                                    month={currentMonth}
                                                    year={currentYear}
                                                    initialValue={targetData?.[unit.id]?.[activeTab] ?? 0}
                                                />
                                            </td>
                                            <td className={`border border-gray-400 px-2 py-1 font-bold ${achColor}`}>{ach}{ach !== '-' ? '%' : ''}</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                    {Object.keys(groupedUnits).length === 0 && (
                        <tr><td colSpan={daysInMonth + 11} className="border px-4 py-8 text-center text-gray-500">Tidak ada data unit.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // ─── Achievement Dashboard ─────────────────────────────────────────────
    const renderAchievement = () => {
        if (dashLoading || !dashData) {
            return (
                <div className="p-16 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-500">Memuat Dashboard...</p>
                </div>
            );
        }

        const { kpi, rekap, trend } = dashData;
        const allUnitTypes = dashData.unitTypes ?? unitTypes ?? [];

        // Build combo chart data
        const buildComboChart = (category) => ({
            labels: rekap.map(r => r.type),
            datasets: [
                {
                    type: 'line',
                    label: 'Compliance %',
                    data: rekap.map(r => r[category].plan > 0 ? +((r[category].actual / r[category].plan) * 100).toFixed(1) : 0),
                    borderColor: '#374151',
                    borderWidth: 2,
                    pointBackgroundColor: '#374151',
                    pointRadius: 4,
                    yAxisID: 'y1',
                    tension: 0.3,
                },
                {
                    type: 'bar',
                    label: 'Planning',
                    data: rekap.map(r => r[category].plan),
                    backgroundColor: '#10b981',
                    yAxisID: 'y',
                },
                {
                    type: 'bar',
                    label: 'Actual',
                    data: rekap.map(r => r[category].actual),
                    backgroundColor: '#3b82f6',
                    yAxisID: 'y',
                },
            ]
        });

        const comboOpts = {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } } },
            scales: {
                y: { position: 'left', ticks: { font: { size: 10 } } },
                y1: { position: 'right', min: 0, max: 120, grid: { drawOnChartArea: false }, ticks: { font: { size: 10 }, callback: v => v + '%' } }
            }
        };

        // Donut totals
        let inspPlan = 0, inspAct = 0, washPlan = 0, washAct = 0, greaPlan = 0, greaAct = 0;
        rekap.forEach(r => {
            inspPlan += r.inspection.plan; inspAct += r.inspection.actual;
            washPlan += r.washing.plan;    washAct += r.washing.actual;
            greaPlan += r.greasing.plan;   greaAct += r.greasing.actual;
        });
        const p = (a, b) => b > 0 ? +((a / b) * 100).toFixed(1) : 0;
        const inspPct = p(inspAct, inspPlan), washPct = p(washAct, washPlan), greaPct = p(greaAct, greaPlan);

        // Total rekap row
        const totals = rekap.reduce(
            (acc, r) => {
                acc.iP += r.inspection.plan; acc.iA += r.inspection.actual;
                acc.wP += r.washing.plan;    acc.wA += r.washing.actual;
                acc.gP += r.greasing.plan;   acc.gA += r.greasing.actual;
                return acc;
            },
            { iP: 0, iA: 0, wP: 0, wA: 0, gP: 0, gA: 0 }
        );

        return (
            <div className="mt-4 space-y-4">
                {/* ── Header / Filters ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-teal-800 text-white px-5 py-4 rounded-xl shadow-lg gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">Achievement Maintenance</h2>
                            <p className="text-teal-200 text-sm">Inspection · Washing · Greasing · Performance vs Plan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-end">
                        <div className="bg-teal-700 px-3 py-2 rounded-lg">
                            <p className="text-teal-300 text-xs mb-1">Dari Tanggal</p>
                            <input type="date" className="bg-transparent text-white text-sm border-none outline-none p-0 w-32"
                                value={dashStartDate} onChange={e => setDashStartDate(e.target.value)} />
                        </div>
                        <div className="bg-teal-700 px-3 py-2 rounded-lg">
                            <p className="text-teal-300 text-xs mb-1">Sampai Tanggal</p>
                            <input type="date" className="bg-transparent text-white text-sm border-none outline-none p-0 w-32"
                                value={dashEndDate} onChange={e => setDashEndDate(e.target.value)} />
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2">
                            <p className="text-teal-600 text-xs mb-1 font-semibold">Tipe Unit</p>
                            <select className="text-sm text-gray-800 border-none outline-none p-0 bg-transparent" value={dashUnitType} onChange={e => setDashUnitType(e.target.value)}>
                                <option value="all">Semua Unit</option>
                                {allUnitTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <button onClick={fetchDashboardData} className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Plan', value: kpi.totalPlan, sub: 'Aktivitas', color: 'border-green-500', ring: 'border-green-400 text-green-600', pct: '100' },
                        { label: 'Total Actual', value: kpi.totalActual, sub: 'Aktivitas', color: 'border-blue-500', ring: 'border-blue-400 text-blue-600', pct: kpi.compliance },
                        { label: 'Remaining', value: kpi.remaining, sub: 'Aktivitas', color: 'border-yellow-500', ring: 'border-yellow-400 text-yellow-600', pct: kpi.totalPlan > 0 ? (100 - kpi.compliance).toFixed(1) : 0 },
                        { label: 'Compliance', value: `${kpi.compliance}%`, sub: `${kpi.growth >= 0 ? '▲' : '▼'} ${Math.abs(kpi.growth)}% vs bln lalu`, color: 'border-purple-500', ring: 'border-purple-400 text-purple-600', pct: kpi.compliance },
                    ].map((c, i) => (
                        <div key={i} className={`bg-white rounded-xl shadow p-4 flex items-center justify-between border-l-4 ${c.color}`}>
                            <div>
                                <p className="text-gray-500 text-sm font-semibold">{c.label}</p>
                                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                                <p className={`text-sm ${i === 3 && kpi.growth >= 0 ? 'text-green-500' : i === 3 ? 'text-red-500' : 'text-gray-400'}`}>{c.sub}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-bold ${c.ring}`}>
                                {c.pct}%
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── 3 Combo Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                        { key: 'inspection', num: '1', label: 'Inspection', color: 'bg-teal-700' },
                        { key: 'washing',    num: '2', label: 'Washing',    color: 'bg-blue-700' },
                        { key: 'greasing',   num: '3', label: 'Greasing Unit', color: 'bg-orange-600' },
                    ].map(({ key, num, label, color }) => (
                        <div key={key} className="bg-white rounded-xl shadow p-4">
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <span className={`${color} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm`}>{num}</span>
                                {label}
                            </h3>
                            <div className="h-56">
                                <Bar data={buildComboChart(key)} options={comboOpts} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Bottom Section ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                    {/* Rekap table — 3 cols wide */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow p-4 overflow-x-auto">
                        <h3 className="font-bold text-sm mb-3">📋 Rekap Achievement per Jenis Unit</h3>
                        <table className="w-full text-sm text-center border-collapse">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="border p-1 bg-gray-100">No</th>
                                    <th rowSpan={2} className="border p-1 bg-gray-100 text-left min-w-[100px]">Jenis Unit</th>
                                    <th colSpan={3} className="border p-1 bg-teal-600 text-white">Inspection</th>
                                    <th colSpan={3} className="border p-1 bg-blue-600 text-white">Washing</th>
                                    <th colSpan={3} className="border p-1 bg-orange-500 text-white">Greasing</th>
                                </tr>
                                <tr>
                                    {['Plan','Actual','%','Plan','Actual','%','Plan','Actual','%'].map((h, i) => (
                                        <th key={i} className={`border p-1 ${[2,5,8].includes(i) ? 'font-bold' : ''} bg-gray-50`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rekap.map((r, i) => (
                                    <tr key={r.type} className="hover:bg-gray-50">
                                        <td className="border p-1">{i + 1}</td>
                                        <td className="border p-1 text-left font-semibold">{r.type}</td>
                                        <td className="border p-1">{r.inspection.plan}</td>
                                        <td className="border p-1">{r.inspection.actual}</td>
                                        <td className="border p-1 font-bold text-teal-600">{p(r.inspection.actual, r.inspection.plan)}%</td>
                                        <td className="border p-1">{r.washing.plan}</td>
                                        <td className="border p-1">{r.washing.actual}</td>
                                        <td className="border p-1 font-bold text-blue-600">{p(r.washing.actual, r.washing.plan)}%</td>
                                        <td className="border p-1">{r.greasing.plan}</td>
                                        <td className="border p-1">{r.greasing.actual}</td>
                                        <td className="border p-1 font-bold text-orange-600">{p(r.greasing.actual, r.greasing.plan)}%</td>
                                    </tr>
                                ))}
                                {/* Total row */}
                                <tr className="bg-gray-200 font-bold">
                                    <td className="border p-1" colSpan={2}>Total</td>
                                    <td className="border p-1">{totals.iP}</td>
                                    <td className="border p-1">{totals.iA}</td>
                                    <td className="border p-1 text-teal-700">{p(totals.iA, totals.iP)}%</td>
                                    <td className="border p-1">{totals.wP}</td>
                                    <td className="border p-1">{totals.wA}</td>
                                    <td className="border p-1 text-blue-700">{p(totals.wA, totals.wP)}%</td>
                                    <td className="border p-1">{totals.gP}</td>
                                    <td className="border p-1">{totals.gA}</td>
                                    <td className="border p-1 text-orange-700">{p(totals.gA, totals.gP)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Donut — 1 col */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-bold text-sm mb-3">🎯 Compliance per Kategori</h3>
                        <div className="h-40 relative flex items-center justify-center">
                            <Doughnut
                                data={{ labels: ['Inspection', 'Washing', 'Greasing'], datasets: [{ data: [inspPct, washPct, greaPct], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'], borderWidth: 2 }] }}
                                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold">{kpi.compliance}%</span>
                                <span className="text-xs text-gray-400">Overall</span>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                            {[{l:'Inspection', v:inspPct, c:'bg-teal-500'},{l:'Washing', v:washPct, c:'bg-blue-500'},{l:'Greasing', v:greaPct, c:'bg-yellow-500'}].map(i => (
                                <div key={i.l} className="flex items-center justify-between">
                                    <span className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${i.c}`}></span>{i.l}</span>
                                    <b>{i.v}%</b>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trend line — 1 col */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-bold text-sm mb-3">📈 Trend Compliance</h3>
                        <div className="h-52">
                            <Line
                                data={{
                                    labels: trend.labels,
                                    datasets: [
                                        { label: 'Inspection', data: trend.datasets.inspection, borderColor: '#10b981', tension: 0.3, pointRadius: 3 },
                                        { label: 'Washing', data: trend.datasets.washing, borderColor: '#3b82f6', tension: 0.3, pointRadius: 3 },
                                        { label: 'Greasing', data: trend.datasets.greasing, borderColor: '#f59e0b', tension: 0.3, pointRadius: 3 },
                                    ]
                                }}
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 9 } } } }, scales: { y: { min: 0, max: 120, ticks: { font: { size: 9 }, callback: v => v + '%' } }, x: { ticks: { font: { size: 9 } } } } }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Main Layout ───────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Daily Maintenance Achievement</h2>}
        >
            <Head title="Daily Maintenance Achievement" />

            <div className="py-6 max-w-[100vw] overflow-hidden">
                <div className="mx-auto sm:px-4 lg:px-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 bg-white border-b border-gray-200">

                            {/* Month/Year filter (for crosstab tabs) */}
                            {activeTab !== 'achievement' && (
                                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                                    <div className="flex items-center gap-3">
                                        <label className="font-semibold text-gray-700 text-sm">Bulan & Tahun:</label>
                                        <select
                                            className="rounded border-gray-300 shadow-sm text-sm"
                                            value={currentMonth}
                                            onChange={e => router.get(route('plan-inspections.index', { month: e.target.value, year: currentYear }))}
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="rounded border-gray-300 shadow-sm text-sm"
                                            value={currentYear}
                                            onChange={e => router.get(route('plan-inspections.index', { month: currentMonth, year: e.target.value }))}
                                        >
                                            {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y}>{y}</option>; })}
                                        </select>
                                    </div>
                                    <p className="text-sm text-gray-400 italic">* Klik kolom tanggal untuk ceklis · Klik angka Plan Activity untuk edit target</p>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-2 overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all ${
                                                activeTab === tab.id
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content */}
                            {activeTab === 'achievement' ? renderAchievement() : renderCrosstab()}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
                table td, table th { border: 1px dashed #d1d5db; }
                thead th { border-style: solid; }
            `}</style>
        </AuthenticatedLayout>
    );
}
