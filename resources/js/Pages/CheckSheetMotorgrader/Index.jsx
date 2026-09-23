import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({
    units = [],
    defaultItems = [],
    suggestedFormNumber = 'PLT/FRM/CSM/001',
    selectedForm = null,
    recentForms = [],
    prefill = {},
}) {
    // Form Metadata State
    const [formNumber, setFormNumber] = useState(selectedForm?.form_number || suggestedFormNumber);
    const [projectId, setProjectId] = useState(selectedForm?.project_id || 'PT Mitra Abadi Mahakam');
    const [unitId, setUnitId] = useState(selectedForm?.unit_id || prefill?.unit_id || '');
    const [date, setDate] = useState(selectedForm?.date ? selectedForm.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [smu, setSmu] = useState(selectedForm?.smu ?? '');
    const [serviceType, setServiceType] = useState(selectedForm?.service_type || '250/750');
    const [mechanicName, setMechanicName] = useState(selectedForm?.mechanic_name || '');
    const [supervisorName, setSupervisorName] = useState(selectedForm?.supervisor_name || '');

    // Specialized Result Data State
    const [resultsData, setResultsData] = useState(selectedForm?.results_data || {
        mag_engine: '',
        mag_trans: '',
        mag_diff: '',
        cut_engine: '',
        cut_hydraulic: '',
        cut_trans: '',
        cyl_artic: '',
        cyl_steering: '',
        cyl_blade_lift: '',
        cyl_blade_tilt: '',
        cyl_wheel_lean: '',
        cyl_center_ripper: '',
        et_download: 'OK',
    });

    // Checklist Items State
    const [itemsState, setItemsState] = useState(() => {
        if (selectedForm?.items && Array.isArray(selectedForm.items)) {
            return selectedForm.items;
        }
        return defaultItems.map(item => ({
            ...item,
            status: item.status || '',
            name: item.name || '',
        }));
    });

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-fill unit details
    const handleUnitChange = (e) => {
        const id = e.target.value;
        setUnitId(id);
        const found = units.find(u => String(u.id) === String(id));
        if (found && found.current_hm) {
            setSmu(found.current_hm);
        }
    };

    const selectedUnitObj = units.find(u => String(u.id) === String(unitId));

    // Handle Item Status Toggle
    const handleToggleItemStatus = (id, newStatus) => {
        setItemsState(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const status = item.status === newStatus ? '' : newStatus;
                    return { ...item, status, name: status ? (item.name || mechanicName) : item.name };
                }
                return item;
            });
        });
    };

    // Quick set all items active for current interval to OK
    const handleCheckAllIntervalOk = () => {
        setItemsState(prev => {
            return prev.map(item => {
                const intervals = item.intervals || ['250/750', '500', '1000', '2000'];
                if (intervals.includes(serviceType)) {
                    return { ...item, status: 'OK', name: item.name || mechanicName };
                }
                return item;
            });
        });
        setNotification(`Semua item yang berlaku pada interval ${serviceType} diset OK.`);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleResetAll = () => {
        if (window.confirm('Reset semua status checklist Motorgrader ini?')) {
            setItemsState(prev => prev.map(item => ({ ...item, status: '', name: '' })));
        }
    };

    // Save Form
    const handleSave = (e) => {
        if (e) e.preventDefault();
        if (!unitId) {
            alert('Pilih unit Motorgrader terlebih dahulu!');
            return;
        }

        setIsSaving(true);
        const payload = {
            form_type: 'CHECK-SHEET-MOTORGRADER',
            form_number: formNumber,
            project_id: projectId,
            unit_id: unitId,
            date,
            smu: smu ? parseFloat(smu) : 0,
            service_type: serviceType,
            items: itemsState,
            results_data: resultsData,
            mechanic_name: mechanicName,
            supervisor_name: supervisorName,
            status: selectedForm?.status || 'COMPLETED',
        };

        if (selectedForm && selectedForm.id) {
            router.put(`/form-check-sheet-motorgrader/${selectedForm.id}`, payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Check Sheet Service Motorgrader berhasil diperbarui.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/form-check-sheet-motorgrader', payload, {
                onSuccess: () => {
                    setIsSaving(false);
                    setNotification('Check Sheet Service Motorgrader berhasil disimpan.');
                    setTimeout(() => setNotification(null), 4000);
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    const sections = ['ALL', ...Array.from(new Set(defaultItems.map(i => i.section)))];

    return (
        <AuthenticatedLayout>
            <Head title="Check Sheet Service Motorgrader" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                
                {/* Notification */}
                {notification && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{notification}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Safety Warning Tag Reminder */}
                <div className="p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold text-center tracking-wide shadow-md flex items-center justify-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>PASANG 'OUT OF SERVICE TAG' , 'DANGER TAG' & 'GANJAL BAN' (INSTALL OUT OF SERVICE TAG , DANGER TAGS & WHEEL CHOCKS)</span>
                </div>

                {/* Top Action Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xl font-bold">🛣️</span>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    CHECK SHEET SERVICE MOTORGRADER
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Digitalisasi PM Service Checklist Khusus Unit Motor Grader (Tandem, Circle, Moldboard)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>🕒</span> Riwayat ({recentForms.length})
                        </button>

                        <a
                            href={`/form-check-sheet-motorgrader/blank-print${unitId ? `?unit_id=${unitId}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <span>📄</span> Blank Print
                        </a>

                        {selectedForm && (
                            <>
                                <a
                                    href={`/form-check-sheet-motorgrader/${selectedForm.id}/print`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                                >
                                    <span>🖨️</span> Cetak Lembar
                                </a>
                                <a
                                    href={`/form-check-sheet-motorgrader/download-pdf?id=${selectedForm.id}`}
                                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                                >
                                    <span>📥</span> Unduh PDF
                                </a>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin text-sm">⏳</span> Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span>💾</span> {selectedForm ? 'Perbarui Form' : 'Simpan Form'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Metadata Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor Form</label>
                        <input
                            type="text"
                            value={formNumber}
                            onChange={e => setFormNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pilih Unit Motorgrader *</label>
                        <select
                            value={unitId}
                            onChange={handleUnitChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="">-- Pilih Unit --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.code_unit} - {u.model} ({u.type_unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tanggal Pelaksanaan</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hours Meter (SMU)</label>
                        <input
                            type="number"
                            step="any"
                            value={smu}
                            onChange={e => setSmu(e.target.value)}
                            placeholder="e.g. 3400"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipe Service Interval</label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {['250/750', '500', '1000', '2000'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setServiceType(type)}
                                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                                        serviceType === type
                                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mekanik Pelaksana</label>
                        <input
                            type="text"
                            value={mechanicName}
                            onChange={e => setMechanicName(e.target.value)}
                            placeholder="Nama Mekanik"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Supervisor / Foreman</label>
                        <input
                            type="text"
                            value={supervisorName}
                            onChange={e => setSupervisorName(e.target.value)}
                            placeholder="Nama Mech Sup'v"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perusahaan / Project</label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>

                {/* Filter and Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400 mr-2">Filter Bagian:</span>
                        {sections.slice(0, 7).map(sec => (
                            <button
                                key={sec}
                                type="button"
                                onClick={() => setActiveSectionFilter(sec)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                    activeSectionFilter === sec
                                        ? 'bg-cyan-600 text-white border-cyan-500'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                }`}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCheckAllIntervalOk}
                            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                        >
                            <span>✓</span> Set Semua {serviceType} = OK
                        </button>
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-3 py-2.5 w-12 text-center">No</th>
                                    <th className="px-4 py-2.5">Kompartemen / Komponen Motorgrader</th>
                                    <th className="px-4 py-2.5">Tindakan / Action</th>
                                    <th className="px-2 py-2.5 text-center w-20">250/750</th>
                                    <th className="px-2 py-2.5 text-center w-16">500</th>
                                    <th className="px-2 py-2.5 text-center w-16">1000</th>
                                    <th className="px-2 py-2.5 text-center w-16">2000</th>
                                    <th className="px-3 py-2.5 text-center w-24">Status</th>
                                    <th className="px-3 py-2.5 w-28">Nama</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {itemsState.map((item, idx) => {
                                    const intervals = item.intervals || ['250/750', '500', '1000', '2000'];
                                    const isMatchFilter = activeSectionFilter === 'ALL' || item.section === activeSectionFilter;
                                    if (!isMatchFilter) return null;

                                    const isCurrentIntervalActive = intervals.includes(serviceType);

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-slate-800/40 transition ${
                                                isCurrentIntervalActive ? 'bg-slate-900/20' : 'opacity-85'
                                            }`}
                                        >
                                            <td className="px-3 py-2 text-center font-bold text-slate-400">{item.id}</td>
                                            <td className="px-4 py-2 font-medium text-white">
                                                <div>{item.description}</div>
                                                <span className="text-[10px] text-slate-500 uppercase">{item.section}</span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-300">{item.action}</td>

                                            {/* Interval cells */}
                                            {['250/750', '500', '1000', '2000'].map(intv => {
                                                const applies = intervals.includes(intv);
                                                const isSelected = serviceType === intv;

                                                if (!applies) {
                                                    return (
                                                        <td key={intv} className="px-2 py-2 text-center bg-slate-950/80">
                                                            <div className="w-5 h-5 mx-auto bg-slate-900 border border-slate-800 rounded"></div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={intv} className={`px-2 py-2 text-center ${isSelected ? 'bg-cyan-950/30' : ''}`}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleItemStatus(item.id, 'OK')}
                                                            title={isSelected ? `Klik untuk set status item ${item.status === 'OK' ? 'belum selesai' : 'OK'}` : `Berlaku pada interval ${intv}`}
                                                            className={`w-6 h-6 rounded-md border text-xs font-bold transition inline-flex items-center justify-center ${
                                                                item.status === 'OK' && isSelected
                                                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-400 scale-105'
                                                                    : isSelected
                                                                    ? 'bg-cyan-950/40 border-cyan-600/50 text-cyan-400 hover:bg-emerald-600 hover:text-white'
                                                                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                                                            }`}
                                                            style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}
                                                        >
                                                            ✓
                                                        </button>
                                                    </td>
                                                );
                                            })}

                                            {/* Status Badge */}
                                            <td className="px-3 py-2 text-center">
                                                <select
                                                    value={item.status || ''}
                                                    onChange={e => handleToggleItemStatus(item.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                                                        item.status === 'OK'
                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                            : item.status === 'REPAIR'
                                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                                            : 'bg-slate-950 text-slate-400 border-slate-800'
                                                    }`}
                                                >
                                                    <option value="">-</option>
                                                    <option value="OK">OK</option>
                                                    <option value="REPAIR">REPAIR</option>
                                                    <option value="ADJUST">ADJUST</option>
                                                </select>
                                            </td>

                                            {/* Inspector Initials */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.name || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setItemsState(prev => prev.map(i => i.id === item.id ? { ...i, name: val } : i));
                                                    }}
                                                    placeholder="Inisial"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Specialized Grid Motorgrader */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Magnetic Plug Card */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <span>🧲</span> Plug Magnet & Catat Motorgrader
                            </h3>
                            <span className="text-[10px] text-blue-400 italic">STP Magnetic Plug</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 text-xs">
                            <div>
                                <label className="text-slate-400 text-[11px] block">Engine</label>
                                <input
                                    type="text"
                                    value={resultsData.mag_engine || ''}
                                    onChange={e => setResultsData({ ...resultsData, mag_engine: e.target.value })}
                                    placeholder="Partikel..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Transmission</label>
                                <input
                                    type="text"
                                    value={resultsData.mag_trans || ''}
                                    onChange={e => setResultsData({ ...resultsData, mag_trans: e.target.value })}
                                    placeholder="Partikel..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Differential</label>
                                <input
                                    type="text"
                                    value={resultsData.mag_diff || ''}
                                    onChange={e => setResultsData({ ...resultsData, mag_diff: e.target.value })}
                                    placeholder="Partikel..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cut Filter Card */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <span>✂️</span> Potong / Periksa Saringan Motorgrader
                            </h3>
                            <span className="text-[10px] text-blue-400 italic">STP Filter Cut</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 text-xs">
                            <div>
                                <label className="text-slate-400 text-[11px] block">Engine Filter</label>
                                <input
                                    type="text"
                                    value={resultsData.cut_engine || ''}
                                    onChange={e => setResultsData({ ...resultsData, cut_engine: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Hydraulic Filter</label>
                                <input
                                    type="text"
                                    value={resultsData.cut_hydraulic || ''}
                                    onChange={e => setResultsData({ ...resultsData, cut_hydraulic: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Transmission Filter</label>
                                <input
                                    type="text"
                                    value={resultsData.cut_trans || ''}
                                    onChange={e => setResultsData({ ...resultsData, cut_trans: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cylinder Inspection Card */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <span>🔧</span> Periksa & Catat Cylinder Motorgrader
                            </h3>
                            <span className="text-[10px] text-blue-400 italic">STP Cylinder</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 text-xs">
                            <div>
                                <label className="text-slate-400 text-[11px] block">Cyl Artic RH / LH</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_artic || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_artic: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Steering RH / LH</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_steering || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_steering: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Blade Lift RH & LH</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_blade_lift || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_blade_lift: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Blade Tilt</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_blade_tilt || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_blade_tilt: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Cyl Wheel Lean</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_wheel_lean || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_wheel_lean: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-[11px] block">Center Shift & Ripper</label>
                                <input
                                    type="text"
                                    value={resultsData.cyl_center_ripper || ''}
                                    onChange={e => setResultsData({ ...resultsData, cyl_center_ripper: e.target.value })}
                                    placeholder="Status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ET Download */}
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span>💻</span> Pengambilan Data Modul Elektronik
                                </h3>
                                <span className="text-[10px] text-blue-400 italic">STP Electronic Download</span>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs block mb-1.5">Download Electronic Technician (ET)</label>
                                <input
                                    type="text"
                                    value={resultsData.et_download || ''}
                                    onChange={e => setResultsData({ ...resultsData, et_download: e.target.value })}
                                    placeholder="Download ET Selesai / N/A"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-4">
                            ℹ️ Download status diagnostic ECM engine, transmission, dan sistem kemudi Motorgrader.
                        </div>
                    </div>
                </div>

                {/* History Modal */}
                {showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>🕒</span> Riwayat Check Sheet Motorgrader
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-slate-400 hover:text-white text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto mt-3">
                                {recentForms.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-500">
                                        Belum ada data check sheet Motorgrader yang tersimpan.
                                    </div>
                                ) : (
                                    recentForms.map(rf => (
                                        <div key={rf.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-white">
                                                    {rf.form_number} - {rf.unit?.code_unit || 'Tanpa Unit'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {rf.date} • {rf.service_type || '250/750'} • {rf.smu ? `${rf.smu} HM` : '-'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/form-check-sheet-motorgrader?id=${rf.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold"
                                                >
                                                    Buka
                                                </Link>
                                                <a
                                                    href={`/form-check-sheet-motorgrader/${rf.id}/print`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                                >
                                                    Cetak
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
