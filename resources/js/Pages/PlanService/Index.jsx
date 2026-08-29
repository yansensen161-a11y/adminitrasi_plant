import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ auth, units }) {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        actual_hm: '',
        actual_date: new Date().toISOString().split('T')[0],
        back_evo: '',
        next_service_type: 250,
    });

    const openCompleteModal = (unit) => {
        setSelectedUnit(unit);
        setFormData({
            ...formData,
            actual_hm: unit.current_hm || '',
            next_service_type: unit.next_service ? unit.next_service.service_type : 250,
        });
        setIsCompleteModalOpen(true);
    };

    const handleCompleteSubmit = (e) => {
        e.preventDefault();
        router.post(route('plan-service.complete', selectedUnit.id), formData, {
            onSuccess: () => {
                setIsCompleteModalOpen(false);
                setFormData({ ...formData, actual_hm: '', back_evo: '' });
            }
        });
    };

    const getReminderColor = (reminder) => {
        if (reminder === 'DUE TODAY' || reminder === 'TOMORROW') return 'bg-yellow-400 text-black';
        if (reminder === 'OVERDUE') return 'bg-red-500 text-white';
        if (reminder === 'NEXT SCHEDULE') return 'bg-green-500 text-white';
        return 'bg-transparent text-gray-800 dark:text-gray-200';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Plan Service (Maintenance Schedule)</h2>}
        >
            <Head title="Plan Service" />

            <div className="py-8 max-w-full overflow-x-hidden">
                <div className="max-w-[1920px] mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Maintenance</h3>
                            <p className="text-sm text-gray-500">Manage and forecast equipment maintenance based on HM.</p>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                                <thead>
                                    {/* Main Headers matching Excel */}
                                    <tr className="bg-[#005fb8] text-white text-xs text-center border-b border-[#004a91]">
                                        <th rowSpan="2" className="border-r border-[#004a91] px-2 py-2">NO</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">UNIT CODE</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">MAKE</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">UNIT MODEL</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">EQUIPMENT TIPE</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">CURRENT HM</th>
                                        <th colSpan="3" className="border-r border-[#004a91] px-3 py-2 font-bold">NEXT SERVICE 1</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-2 py-2 leading-tight">REMAIN<br/>HM</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-2 py-2 leading-tight">REMAIN<br/>DAY</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">TA2 PROGRESS</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2">SERVICE REMINDER</th>
                                        <th colSpan="5" className="border-r border-[#004a91] px-3 py-2 font-bold">LAST SERVICE 1</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2 leading-tight">NEXT SERVICE<br/>ACCURACY</th>
                                        <th rowSpan="2" className="border-r border-[#004a91] px-3 py-2 leading-tight">Status Unit</th>
                                        <th rowSpan="2" className="px-3 py-2 bg-[#00a651] leading-tight">Work<br/>hours / day</th>
                                        <th rowSpan="2" className="px-3 py-2 bg-gray-700">Actions</th>
                                    </tr>
                                    <tr className="bg-[#0070c0] text-white text-xs text-center">
                                        <th className="border-r border-[#004a91] px-2 py-1">TY</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">DATE</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">H</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">TY</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">DATE</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">HM TOTAL</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">TARGET</th>
                                        <th className="border-r border-[#004a91] px-2 py-1">Back Evo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map((unit, index) => (
                                        <tr key={unit.id} className={`text-center border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50/30 dark:bg-gray-800/80'}`}>
                                            <td className="border-r dark:border-gray-700 px-2 py-1">{index + 1}</td>
                                            <td className="border-r dark:border-gray-700 px-3 py-1 font-semibold">{unit.code_unit}</td>
                                            <td className="border-r dark:border-gray-700 px-3 py-1">{unit.make}</td>
                                            <td className="border-r dark:border-gray-700 px-3 py-1 text-left">{unit.model}</td>
                                            <td className="border-r dark:border-gray-700 px-3 py-1">{unit.equipment_type}</td>
                                            <td className="border-r dark:border-gray-700 px-3 py-1 font-bold text-[#005fb8] dark:text-blue-400">{unit.current_hm}</td>
                                            
                                            {/* NEXT SERVICE */}
                                            <td className="border-r dark:border-gray-700 px-2 py-1">{unit.next_service?.service_type || '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1">{unit.next_service?.target_date ? new Date(unit.next_service.target_date).toLocaleDateString('en-GB', {day: 'numeric', month:'short', year:'2-digit'}).replace(/ /g, '-') : '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1 font-bold">{unit.next_service?.target_hm || '-'}</td>
                                            
                                            {/* REMAIN */}
                                            <td className="border-r dark:border-gray-700 px-2 py-1">{unit.remain_hm}</td>
                                            <td className={`border-r dark:border-gray-700 px-2 py-1 font-bold ${unit.remain_day <= 5 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : ''}`}>{unit.remain_day}</td>
                                            
                                            {/* TA2 PROGRESS */}
                                            <td className="border-r dark:border-gray-700 px-3 py-1 bg-[#dbeef3] dark:bg-cyan-900/30 text-gray-800 dark:text-gray-200">
                                                {unit.next_service ? 'NEXT SCHEDULE' : '-'}
                                            </td>
                                            
                                            {/* SERVICE REMINDER */}
                                            <td className={`border-r dark:border-gray-700 px-3 py-1 font-bold ${getReminderColor(unit.service_reminder)}`}>
                                                {unit.service_reminder}
                                            </td>
                                            
                                            {/* LAST SERVICE */}
                                            <td className="border-r dark:border-gray-700 px-2 py-1 bg-orange-50/20 dark:bg-orange-900/10">{unit.last_service?.service_type || '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1 bg-orange-50/20 dark:bg-orange-900/10">{unit.last_service?.actual_date ? new Date(unit.last_service.actual_date).toLocaleDateString('en-GB', {day: 'numeric', month:'short', year:'2-digit'}).replace(/ /g, '-') : '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1 bg-orange-50/20 dark:bg-orange-900/10">{unit.last_service?.actual_hm || '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1 bg-orange-50/20 dark:bg-orange-900/10">{unit.last_service?.target_hm || '-'}</td>
                                            <td className="border-r dark:border-gray-700 px-2 py-1 bg-orange-50/20 dark:bg-orange-900/10">{unit.last_service?.back_evo || '-'}</td>
                                            
                                            {/* ACCURACY */}
                                            <td className="border-r dark:border-gray-700 px-3 py-1 bg-orange-50/50 dark:bg-orange-900/30 font-medium">
                                                {unit.last_service?.accuracy ? `${unit.last_service.accuracy.toFixed(2)}%` : '-'}
                                            </td>
                                            
                                            {/* Status Unit */}
                                            <td className={`border-r dark:border-gray-700 px-3 py-1 font-bold text-xs`}>
                                                <span className={`px-2 py-0.5 rounded ${unit.status === 'B/DOWN' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                                                    {unit.status}
                                                </span>
                                            </td>
                                            
                                            {/* Work Hours */}
                                            <td className="border-r dark:border-gray-700 px-3 py-1 font-medium bg-[#e2efda] dark:bg-green-900/20 text-gray-800 dark:text-gray-200">
                                                {unit.next_service?.work_hours_per_day || 22}
                                            </td>
                                            
                                            {/* Action Button */}
                                            <td className="px-2 py-1">
                                                <button 
                                                    onClick={() => openCompleteModal(unit)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow transition-colors"
                                                >
                                                    UPDATE
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {units.length === 0 && (
                                        <tr>
                                            <td colSpan="19" className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada unit yang terdaftar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Service Completion */}
            {isCompleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsCompleteModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleCompleteSubmit}>
                                <div className="px-6 pt-6 pb-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.19-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.19.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                                                Update Service
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">Unit: {selectedUnit?.code_unit} - {selectedUnit?.model}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Actual HM</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    value={formData.actual_hm}
                                                    onChange={e => setFormData({...formData, actual_hm: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2.5 transition-colors sm:text-sm text-gray-900 dark:text-white font-medium"
                                                    required
                                                />
                                            </div>
                                            <p className="mt-1.5 text-xs text-gray-500">Current HM: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedUnit?.current_hm}</span></p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Actual Date</label>
                                            <input 
                                                type="date" 
                                                value={formData.actual_date}
                                                onChange={e => setFormData({...formData, actual_date: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2.5 transition-colors sm:text-sm text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Back Evo <span className="text-gray-400 font-normal">(Optional)</span></label>
                                            <input 
                                                type="number" 
                                                value={formData.back_evo}
                                                onChange={e => setFormData({...formData, back_evo: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2.5 transition-colors sm:text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Next Service Interval (TY)</label>
                                            <select 
                                                value={formData.next_service_type}
                                                onChange={e => setFormData({...formData, next_service_type: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2.5 transition-colors sm:text-sm text-gray-900 dark:text-white font-bold"
                                            >
                                                <option value="250">250 HM</option>
                                                <option value="500">500 HM</option>
                                                <option value="1000">1000 HM</option>
                                                <option value="2000">2000 HM</option>
                                            </select>
                                            <p className="mt-1.5 text-xs text-gray-500">Jadwal berikutnya akan otomatis ditambahkan sebesar nilai ini.</p>
                                        </div>

                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                                    <button type="submit" className="inline-flex justify-center rounded-xl border border-transparent px-5 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-500/30">
                                        Save & Generate Next
                                    </button>
                                    <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-2.5 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
