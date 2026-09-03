import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Index({ canibals, stats, units = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: '',
        unit_id: '',
        hm: '',
        dari_unit_id: '',
        remark: '',
        no_order: '',
        pr: '',
        po: '',
        eta_part: '',
        status: 'Waiting part',
        image: null,
        parts: [
            { part_name: '', description: '', qty: 1, component: '' }
        ]
    });

    const addPart = () => {
        setData('parts', [...data.parts, { part_name: '', qty: 1, component: '', description: '' }]);
    };

    const removePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
    };

    const handlePartChange = (index, field, value) => {
        const newParts = [...data.parts];
        newParts[index][field] = value;
        setData('parts', newParts);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('part-canibals.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const handleNoOrderBlur = async (e) => {
        const noOrder = e.target.value;
        if (!noOrder) return;
        
        try {
            const response = await fetch(`/monitoring-orders/find-by-no?no_order=${encodeURIComponent(noOrder)}`);
            const result = await response.json();
            if (result.found) {
                setData(prev => ({
                    ...prev,
                    pr: result.pr || prev.pr,
                    po: result.po || prev.po,
                    eta_part: result.eta || prev.eta_part
                }));
            }
        } catch (error) {
            console.error("Error fetching order details", error);
        }
    };
    
    const [tanggal, setTanggal] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        // Implement filter logic when backend supports it
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Waiting part':
                return <span className="text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-orange-700/50">Waiting part</span>;
            case 'Part ter supply':
                return <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Part ter supply</span>;
            case 'Done Instal':
                return <span className="text-green-400 bg-green-900/30 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-green-700/50">Done Instal</span>;
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Part Canibal" />

            <div className="bg-slate-900 min-h-screen text-slate-300 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6 pb-12">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-white tracking-tight">Monitoring Part Canibal</h1>
                        <p className="text-sm text-slate-400">Monitoring penggunaan part canibal</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                            <span>Dashboard</span>
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                            <span className="font-semibold text-slate-300">Part Canibal</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-900/50 flex items-center justify-center text-orange-400 shrink-0">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WAITING PART</div>
                            <div className="text-xl font-black text-amber-400">{stats.waiting_part}</div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center text-blue-400 shrink-0">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">PART TER SUPPLY</div>
                            <div className="text-xl font-black text-blue-400">{stats.part_ter_supply}</div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center text-green-400 shrink-0">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">DONE INSTAL</div>
                            <div className="text-xl font-black text-emerald-400">{stats.done}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-800 shadow-sm sm:rounded-xl mb-6 p-4 border border-slate-700">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="w-full md:w-56">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Tanggal</label>
                            <input
                                type="text"
                                placeholder="01/05/2024 - 31/05/2024"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="Waiting part">Waiting part</option>
                                <option value="Part ter supply">Part ter supply</option>
                                <option value="Done Instal">Done Instal</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 flex justify-end gap-2 w-full">
                            <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-1.5 rounded text-xs transition">
                                Filter
                            </button>
                            <button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
                                Add Entry
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-slate-800 border border-slate-700 shadow-sm overflow-hidden rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-slate-900/50 text-slate-400 font-bold border-b border-slate-700">
                                <tr>
                                    <th className="px-3 py-2 text-center border-r border-slate-700">No</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Tanggal</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Unit</th>
                                    <th className="px-3 py-2 border-r border-slate-700">HM</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Part Number</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Qty</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Component</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Description</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Swap To Unit</th>
                                    <th className="px-3 py-2 border-r border-slate-700">Remark</th>
                                    <th className="px-3 py-2 border-r border-slate-700">No Order</th>
                                    <th className="px-3 py-2 border-r border-slate-700">PR</th>
                                    <th className="px-3 py-2 border-r border-slate-700">PO</th>
                                    <th className="px-3 py-2 border-r border-slate-700">ETA Part</th>
                                    <th className="px-3 py-2 text-center border-r border-slate-700">Gambar</th>
                                    <th className="px-3 py-2 text-center border-r border-slate-700">Status</th>
                                    <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {canibals && canibals.length > 0 ? (
                                    canibals.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-3 py-2 text-center text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-indigo-400">
                                                {item.unit?.code_unit || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-300">
                                                {item.hm || '-'}
                                            </td>
                                            <td className="px-3 py-2 border-r border-slate-700/50 p-0 align-top">
                                                <div className="flex flex-col min-w-[120px]">
                                                    {item.parts && item.parts.map((part, pIdx) => (
                                                        <div key={pIdx} className={`px-2 py-1 font-semibold text-slate-200 truncate ${pIdx !== item.parts.length - 1 ? 'border-b border-slate-700/50' : ''}`} title={part.part_name}>
                                                            {part.part_name}
                                                        </div>
                                                    ))}
                                                    {(!item.parts || item.parts.length === 0) && (
                                                        <div className="px-2 py-1 text-slate-500 italic text-[10px]">-</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 border-r border-slate-700/50 p-0 align-top">
                                                <div className="flex flex-col min-w-[50px]">
                                                    {item.parts && item.parts.map((part, pIdx) => (
                                                        <div key={pIdx} className={`px-2 py-1 text-center text-slate-300 font-mono ${pIdx !== item.parts.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                                                            {part.qty}
                                                        </div>
                                                    ))}
                                                    {(!item.parts || item.parts.length === 0) && (
                                                        <div className="px-2 py-1 text-slate-500 italic text-[10px] text-center">-</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 border-r border-slate-700/50 p-0 align-top">
                                                <div className="flex flex-col min-w-[100px]">
                                                    {item.parts && item.parts.map((part, pIdx) => (
                                                        <div key={pIdx} className={`px-2 py-1 text-slate-300 text-[10px] leading-tight truncate ${pIdx !== item.parts.length - 1 ? 'border-b border-slate-700/50' : ''}`} title={part.component}>
                                                            {part.component || '-'}
                                                        </div>
                                                    ))}
                                                    {(!item.parts || item.parts.length === 0) && (
                                                        <div className="px-2 py-1 text-slate-500 italic text-[10px]">-</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 border-r border-slate-700/50 p-0 align-top">
                                                <div className="flex flex-col min-w-[150px]">
                                                    {item.parts && item.parts.map((part, pIdx) => (
                                                        <div key={pIdx} className={`px-2 py-1 text-slate-400 text-[10px] leading-tight truncate ${pIdx !== item.parts.length - 1 ? 'border-b border-slate-700/50' : ''}`} title={part.description}>
                                                            {part.description || '-'}
                                                        </div>
                                                    ))}
                                                    {(!item.parts || item.parts.length === 0) && (
                                                        <div className="px-2 py-1 text-slate-500 italic text-[10px]">-</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-300">
                                                {item.dari_unit?.code_unit || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-400 text-[10px] max-w-[120px] truncate" title={item.remark}>
                                                {item.remark || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-300">
                                                {item.no_order || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-400">
                                                {item.pr || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-400">
                                                {item.po || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-slate-400">
                                                {item.eta_part ? new Date(item.eta_part).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.image ? (
                                                    <a href={`/storage/${item.image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                                        <svg className="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14" className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data request part canibal yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="3xl">
                    <div className="bg-slate-900 border border-slate-700 text-slate-200 max-h-[90vh] overflow-y-auto">
                        <form onSubmit={submitAdd} className="p-4 sm:p-5">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3 sticky top-0 bg-slate-900 z-10 pt-1">
                                <h2 className="text-base font-bold text-white tracking-tight">Add Entry Part Canibal</h2>
                                <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Tanggal</label>
                                    <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" required style={{colorScheme: 'dark'}} />
                                    {errors.tanggal && <p className="text-red-400 text-[10px] mt-1">{errors.tanggal}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Unit</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <p className="text-red-400 text-[10px] mt-1">{errors.unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">HM</label>
                                    <input type="text" value={data.hm} onChange={e => setData('hm', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" />
                                    {errors.hm && <p className="text-red-400 text-[10px] mt-1">{errors.hm}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Swap To Unit</label>
                                    <select value={data.dari_unit_id} onChange={e => setData('dari_unit_id', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" required>
                                        <option value="">Pilih Unit</option>
                                        {units.map(unit => (
                                            <option key={`dari-${unit.id}`} value={unit.id}>{unit.code_unit}</option>
                                        ))}
                                    </select>
                                    {errors.dari_unit_id && <p className="text-red-400 text-[10px] mt-1">{errors.dari_unit_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" required>
                                        <option value="Waiting part">Waiting part</option>
                                        <option value="Part ter supply">Part ter supply</option>
                                        <option value="Done Instal">Done Instal</option>
                                    </select>
                                    {errors.status && <p className="text-red-400 text-[10px] mt-1">{errors.status}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Upload Gambar</label>
                                    <input type="file" onChange={e => setData('image', e.target.files[0])} className="w-full bg-slate-800 text-slate-400 border border-slate-700 rounded px-3 py-1.5 text-xs shadow-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors" accept="image/*" />
                                    {errors.image && <p className="text-red-400 text-[10px] mt-1">{errors.image}</p>}
                                </div>
                            </div>

                            {/* Parts Section */}
                            <div className="mb-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-white">Parts Needed</h3>
                                    <button type="button" onClick={addPart} className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                        Add Part
                                    </button>
                                </div>
                                {errors.parts && <p className="text-red-400 text-[10px] mb-2">{errors.parts}</p>}
                                
                                <div className="space-y-2">
                                    {data.parts.map((part, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-slate-900 p-3 rounded border border-slate-700 relative group">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Part Number</label>
                                                <input type="text" value={part.part_name} onChange={e => handlePartChange(index, 'part_name', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-xs" required placeholder="e.g. 123-456-789" />
                                                {errors[`parts.${index}.part_name`] && <p className="text-red-400 text-[10px] mt-1">{errors[`parts.${index}.part_name`]}</p>}
                                            </div>
                                            <div className="w-20">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Qty</label>
                                                <input type="number" min="1" value={part.qty} onChange={e => handlePartChange(index, 'qty', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-xs" required />
                                                {errors[`parts.${index}.qty`] && <p className="text-red-400 text-[10px] mt-1">{errors[`parts.${index}.qty`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Component</label>
                                                <input type="text" value={part.component || ''} onChange={e => handlePartChange(index, 'component', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-xs" placeholder="Component name..." />
                                                {errors[`parts.${index}.component`] && <p className="text-red-400 text-[10px] mt-1">{errors[`parts.${index}.component`]}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Description</label>
                                                <input type="text" value={part.description} onChange={e => handlePartChange(index, 'description', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 text-xs" placeholder="Part description..." />
                                                {errors[`parts.${index}.description`] && <p className="text-red-400 text-[10px] mt-1">{errors[`parts.${index}.description`]}</p>}
                                            </div>
                                            {data.parts.length > 1 && (
                                                <button type="button" onClick={() => removePart(index)} className="mt-5 text-slate-500 hover:text-red-400 px-1 py-1 transition-colors" title="Remove part">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Remark</label>
                                    <input type="text" value={data.remark} onChange={e => setData('remark', e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" />
                                    {errors.remark && <p className="text-red-400 text-[10px] mt-1">{errors.remark}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">No Order</label>
                                    <input type="text" value={data.no_order} onChange={e => setData('no_order', e.target.value)} onBlur={handleNoOrderBlur} className="w-full bg-slate-800 text-white border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-xs shadow-sm" />
                                    {errors.no_order && <p className="text-red-400 text-[10px] mt-1">{errors.no_order}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PR</label>
                                    <input type="text" value={data.pr} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-xs shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PO</label>
                                    <input type="text" value={data.po} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-xs shadow-sm cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">ETA Part</label>
                                    <input type="date" value={data.eta_part} readOnly className="w-full bg-slate-800/50 text-slate-500 border border-slate-700 rounded px-3 py-1.5 text-xs shadow-sm cursor-not-allowed" style={{colorScheme: 'dark'}} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded text-xs transition-colors disabled:opacity-50">
                                    {processing ? 'Saving...' : 'Save Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
