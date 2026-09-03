import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Daily({ auth, categories, availableUnits }) {
    
    // Status Badge Helper for "Est Finish" status inside tasks
    const renderStatusBadge = (status) => {
        if (status === 'Done') return <span className="text-green-600 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded text-[10px]">Done</span>;
        if (status === 'Waiting Part' || status === 'Waiting Parts') return <span className="text-gray-800 bg-yellow-200 border border-yellow-300 font-bold px-2 py-0.5 rounded text-[10px]">{status}</span>;
        if (status === 'On Progres') return <span className="text-blue-600 bg-blue-50 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px]">On Progres</span>;
        return <span className="text-gray-600 bg-gray-50 border border-gray-200 font-bold px-2 py-0.5 rounded text-[10px]">{status}</span>;
    };

    // Unit Status Badge Helper
    const renderUnitStatusBadge = (status) => {
        if (status === 'Unsch') return <span className="text-red-500 bg-orange-50 border border-red-200 font-bold px-2 py-0.5 rounded text-[10px]">{status}</span>;
        if (status === 'ANC') return <span className="text-white bg-red-600 border border-red-700 font-bold px-2 py-0.5 rounded text-[10px]">{status}</span>;
        return <span className="text-gray-600 font-bold px-2 py-0.5 text-[10px]">{status}</span>;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);

    const { data, setData, reset, errors, processing } = useForm({
        unit_id: '',
        equipment_group: 'A.10. GENERAL',
        date: '',
        hm: '',
        loc: '',
        status: 'Unsch',
        problem: '',
        activity: '',
        est_finish: '',
        remarks: '',
        pic: '',
        mol: '',
        pr: '',
        po: '',
        eta: ''
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (unit) => {
        setModalMode('edit');
        setEditingId(unit.id);
        const task = unit.tasks && unit.tasks.length > 0 ? unit.tasks[0] : {};
        setData({
            unit_id: unit.unit_id || '',
            equipment_group: unit.equipment_group || 'A.10. GENERAL',
            date: unit.raw_date ? unit.raw_date.substring(0, 10) : '',
            hm: unit.hm || '',
            loc: unit.loc || '',
            status: unit.status || 'Unsch',
            problem: task.problem || '',
            activity: task.activity || '',
            est_finish: unit.raw_est_finish ? unit.raw_est_finish.substring(0, 10) : '',
            remarks: task.remarks || '',
            pic: '',
            mol: task.mol || '',
            pr: task.pr || '',
            po: task.po || '',
            eta: task.raw_eta ? task.raw_eta.substring(0, 10) : ''
        });
        setIsModalOpen(true);
    };

    const handleMolBlur = async (e) => {
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
                    eta: result.eta || prev.eta
                }));
            }
        } catch (error) {
            console.error("Error fetching order details", error);
        }
    };

    const handleDelete = (id) => {
        if(confirm('Are you sure you want to delete this breakdown?')) {
            router.delete(route('breakdown.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const handleRenameCategory = (oldName) => {
        const newName = prompt(`Enter new category name for "${oldName}":`, oldName);
        if (newName !== null && newName.trim() !== '' && newName !== oldName) {
            router.post(route('breakdown.rename-category'), {
                old_name: oldName,
                new_name: newName
            }, {
                preserveScroll: true
            });
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        
        const payload = {
            unit_id: data.unit_id,
            equipment_group: data.equipment_group,
            date: data.date,
            hm: data.hm,
            loc: data.loc,
            status: data.status,
            est_finish: data.est_finish,
            tasks: [{
                task_no: '1',
                problem: data.problem,
                activity: data.activity,
                status: data.status === 'Done' ? 'Done' : 'On Progres', // Infer from service status
                remarks: data.pic ? `${data.remarks} (PIC: ${data.pic})` : data.remarks,
                mol: data.mol,
                pr: data.pr,
                po: data.po,
                eta: data.eta
            }]
        };

        if (modalMode === 'add') {
            router.post(route('breakdown.store'), payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            router.put(route('breakdown.update', editingId), payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    let totalData = 0;
    categories.forEach(cat => { totalData += cat.units.length; });

    return (
        <AuthenticatedLayout>
            <Head title="Daily Breakdown Status" />

            {/* Header & Date */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-[#0b132b] tracking-tight uppercase">Daily Breakdown Status</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">PT. MITRA ABADI MAHAKAM</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    Date : {new Date().toLocaleDateString('en-GB')}
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
            </div>

            {/* Top Filter Bar */}
            <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="w-40">
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Unit / Equipment</label>
                    <select className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Semua Unit</option>
                    </select>
                </div>
                <div className="w-32">
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Status</label>
                    <select className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-2 py-2 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Semua Status</option>
                    </select>
                </div>
                
                <div className="flex-1 flex justify-end gap-2">
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded text-xs transition flex items-center justify-center gap-1.5 shadow-sm h-[34px]" onClick={openAddModal}>
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                        Add Entry
                    </button>
                    <a href={route('breakdown.export')} className="bg-white hover:bg-gray-50 text-green-700 font-bold px-4 py-2 rounded text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-[34px]">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </a>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-gray-300 shadow-sm mb-6 rounded">
                <div className="overflow-auto max-h-[70vh]">
                    <table className="w-max text-[9px] text-center whitespace-nowrap relative">
                        <thead className="bg-[#cce3d5] text-gray-900 font-bold sticky top-0 z-10 shadow-sm ring-1 ring-gray-300">
                            <tr>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Act</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">No</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Unit #</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Model</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Loc</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">HM</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Est Finish</th>
                                <th className="px-1 py-1 border-r border-gray-300 leading-tight" rowSpan="2">Date Aging<br/>(days)</th>
                                <th className="px-2 py-0.5 border-r border-b border-gray-300" colSpan="2">TASK</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Task Activity</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Est Finish</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">Remarks</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">MOL</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">PR</th>
                                <th className="px-1 py-1 border-r border-gray-300" rowSpan="2">PO</th>
                                <th className="px-1 py-1 border-gray-300" rowSpan="2">ETA<br/>Parts</th>
                            </tr>
                            <tr>
                                <th className="px-1 py-0.5 border-r border-gray-300">Task</th>
                                <th className="px-1 py-0.5 border-r border-gray-300 text-left">Problem description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="17" className="px-4 py-8 text-center text-gray-500">Tidak ada data breakdown</td>
                                </tr>
                            )}
                            {categories.map((cat, catIdx) => (
                                <React.Fragment key={catIdx}>
                                    {/* Category Header Row */}
                                    <tr className="bg-[#ffe816] font-bold border-b border-gray-300">
                                        <td colSpan="17" className="px-3 py-1 text-left text-[11px] text-[#0b132b]">
                                            <div className="flex items-center gap-2">
                                                <span>{cat.name}</span>
                                                <button onClick={() => handleRenameCategory(cat.name)} className="text-blue-700 hover:text-blue-900 transition-colors" title="Edit Category Name">
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Units */}
                                    {cat.units.map((unit, uIdx) => (
                                        <React.Fragment key={`${catIdx}-${uIdx}`}>
                                            {(!unit.tasks || unit.tasks.length === 0) ? (
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="px-1 py-1 border-r border-gray-200">
                                                        <div className="flex gap-1 justify-center">
                                                            <button onClick={() => openEditModal(unit)} className="text-blue-600 hover:text-blue-800"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg></button>
                                                            <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-800"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg></button>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{unit.no}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 font-bold">{unit.unit_no}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{unit.model}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{unit.loc}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{unit.hm}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 font-bold">{unit.est_finish}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{unit.aging}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{renderUnitStatusBadge(unit.status)}</td>
                                                    <td colSpan="9" className="px-2 py-1 border-r border-gray-200 text-gray-400 italic">No tasks assigned</td>
                                                </tr>
                                            ) : unit.tasks.map((task, tIdx) => (
                                                <tr key={`${catIdx}-${uIdx}-${tIdx}`} className="hover:bg-gray-50/50">
                                                    {tIdx === 0 && (
                                                        <>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>
                                                                <div className="flex gap-1 justify-center items-center h-full">
                                                                    <button onClick={() => openEditModal(unit)} className="text-blue-600 hover:text-blue-800"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg></button>
                                                                    <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-800"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg></button>
                                                                </div>
                                                            </td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{unit.no}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200 font-bold" rowSpan={unit.tasks.length}>{unit.unit_no}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{unit.model}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{unit.loc}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{unit.hm}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200 font-bold" rowSpan={unit.tasks.length}>{unit.est_finish}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{unit.aging}</td>
                                                            <td className="px-1 py-1 border-r border-gray-200" rowSpan={unit.tasks.length}>{renderUnitStatusBadge(unit.status)}</td>
                                                        </>
                                                    )}
                                                    
                                                    {/* Task Columns */}
                                                    <td className="px-1 py-1 border-r border-gray-200">{task.task_no}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 text-left truncate max-w-[200px]" title={task.problem}>{task.problem}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 text-left truncate max-w-[200px]" title={task.activity}>{task.activity}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{renderStatusBadge(task.status)}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 text-left">{task.remarks}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200">{task.mol}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 text-[8px]">{task.pr}</td>
                                                    <td className="px-1 py-1 border-r border-gray-200 text-[8px]">{task.po}</td>
                                                    <td className="px-1 py-1">{task.eta}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Total Counter (Pagination removed as requested) */}
                <div className="px-5 py-3 flex justify-between items-center text-[10px] text-gray-500 border-t border-gray-200 bg-white">
                    <div>
                        Menampilkan seluruh {totalData} data
                    </div>
                </div>
            </div>

            {/* Legend Area */}
            <div className="flex items-center gap-3 text-[10px] bg-white border border-gray-200 p-2 rounded shadow-sm w-fit mb-10">
                <span className="text-gray-500 font-bold mr-2">Keterangan Status Est Finish :</span>
                {renderStatusBadge('Done')}
                {renderStatusBadge('On Progres')}
                {renderStatusBadge('Waiting Part')}
                {renderStatusBadge('Waiting Parts')}
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="5xl">
                <form onSubmit={submitForm} className="p-6 sm:p-8 bg-slate-900 text-slate-100">
                    <h2 className="text-xl font-bold mb-6 tracking-wide border-b border-slate-700 pb-3 text-white">
                        {modalMode === 'add' ? 'Add Breakdown Entry' : 'Edit Breakdown Entry'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                        {/* Kiri - Primary Data Container */}
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/60 shadow-inner space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Unit</label>
                                    <select className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} required>
                                        <option value="">Pilih Unit...</option>
                                        {availableUnits && availableUnits.map(u => (
                                            <option key={u.id} value={u.id}>{u.code_unit} - {u.model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Group / Category</label>
                                    <select className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" value={data.equipment_group} onChange={e => setData('equipment_group', e.target.value)} required>
                                        <option value="A.1. EXCAVATOR CRUSHER">A.1. EXCAVATOR CRUSHER</option>
                                        <option value="A.2. EXCAVATOR BIGMALL">A.2. EXCAVATOR BIGMALL</option>
                                        <option value="A.3. EXCAVATOR SMALL">A.3. EXCAVATOR SMALL</option>
                                        <option value="A.4. BULLDOZER">A.4. BULLDOZER</option>
                                        <option value="A.5. HAULER">A.5. HAULER</option>
                                        <option value="A.6. MOTORGRADER">A.6. MOTORGRADER</option>
                                        <option value="A.7. DUMP TRUCK">A.7. DUMP TRUCK</option>
                                        <option value="A.8. Compactor">A.8. Compactor</option>
                                        <option value="A.09. MAINHAUL">A.09. MAINHAUL</option>
                                        <option value="A.10. GENERAL">A.10. GENERAL</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Date</label>
                                    <input type="date" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm style-color-scheme-dark" value={data.date} onChange={e => setData('date', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">HM</label>
                                    <input type="text" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" placeholder="Ex: 14500" value={data.hm} onChange={e => setData('hm', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Location</label>
                                    <input type="text" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" placeholder="Ex: HW" value={data.loc} onChange={e => setData('loc', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Service Type</label>
                                    <select className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" value={data.status} onChange={e => setData('status', e.target.value)}>
                                        <option value="Unsch">Unsch</option>
                                        <option value="ANC">ANC</option>
                                        <option value="ACD">ACD</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Problem Description</label>
                                <textarea className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" rows="3" placeholder="Describe the problem..." value={data.problem} onChange={e => setData('problem', e.target.value)}></textarea>
                            </div>
                        </div>

                        {/* Kanan - Activity & Parts Container */}
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/60 shadow-inner space-y-4 flex flex-col justify-between">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Activity</label>
                                <input type="text" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm mb-4" placeholder="Current activity..." value={data.activity} onChange={e => setData('activity', e.target.value)} />
                                
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Remark & PIC</label>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input type="text" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" placeholder="Remark" value={data.remarks} onChange={e => setData('remarks', e.target.value)} />
                                    <input type="text" className="w-full text-sm border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-indigo-500 shadow-sm" placeholder="PIC Name" value={data.pic} onChange={e => setData('pic', e.target.value)} />
                                </div>

                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-600/50 mt-2">
                                    <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Parts Information</h4>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 uppercase">NO ORDER</label>
                                            <input type="text" className="w-full text-xs p-2 border-slate-600 rounded bg-slate-700/50 text-slate-200 focus:ring-indigo-500 shadow-inner" value={data.mol} onChange={e => setData('mol', e.target.value)} onBlur={handleMolBlur} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 uppercase">PR</label>
                                            <input type="text" className="w-full text-xs p-2 border-slate-600 rounded bg-slate-800 text-slate-400 focus:outline-none cursor-not-allowed shadow-inner" value={data.pr} readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 uppercase">PO</label>
                                            <input type="text" className="w-full text-xs p-2 border-slate-600 rounded bg-slate-800 text-slate-400 focus:outline-none cursor-not-allowed shadow-inner" value={data.po} readOnly />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">ETA Part</label>
                                            <input type="date" className="w-full text-sm border-slate-600 rounded bg-slate-800 text-slate-400 focus:outline-none cursor-not-allowed style-color-scheme-dark" value={data.eta} readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Est Finish Date</label>
                                            <input type="date" className="w-full text-sm border-slate-600 rounded bg-slate-700/50 text-slate-200 focus:ring-indigo-500 style-color-scheme-dark" value={data.est_finish} onChange={e => setData('est_finish', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-700 pt-5">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50">
                            {processing ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
