import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function History({ tyre }) {
    const { histories, unit } = tyre;

    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(''); // ROTATE, REPAIR, SCRAP

    const { data, setData, post, processing, reset, transform } = useForm({
        to_position: '',
        hm_at_event: '',
        event_date: new Date().toISOString().split('T')[0],
        notes: '',
        performed_by: ''
    });

    const openAction = (type) => {
        setActionType(type);
        reset();
        setShowActionModal(true);
    };

    const submitAction = (e) => {
        e.preventDefault();
        
        if (actionType === 'ROTATE') {
            post(route('tyres.rotate', tyre.id), {
                onSuccess: () => {
                    setShowActionModal(false);
                    alert(`Tyre ROTATE berhasil!`);
                }
            });
        } else {
            // REPAIR or SCRAP -> maps to remove route
            transform((data) => ({
                ...data,
                reason: actionType
            }));
            post(route('tyres.remove', tyre.id), {
                onSuccess: () => {
                    setShowActionModal(false);
                    alert(`Tyre ${actionType} berhasil!`);
                }
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Tyre Detail - ${tyre.serial_number}`} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Detail Tyre: {tyre.serial_number}</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Link href={route('tyres.index')} className="text-blue-600 hover:underline">Tyre Management</Link> &gt; <span>Detail</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {tyre.condition !== 'SCRAP' && (
                            <>
                                <button onClick={() => openAction('ROTATE')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">Rotasi</button>
                                <button onClick={() => openAction('REPAIR')} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-orange-600">Repair</button>
                                <button onClick={() => openAction('SCRAP')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-red-700">Scrap</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* 3D Visual (CSS) */}
                    <div className="bg-gray-900 rounded-xl p-8 flex items-center justify-center relative overflow-hidden" style={{ perspective: '1000px' }}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
                        <div 
                            className="relative w-48 h-48 rounded-full border-8 border-gray-700 bg-gray-800 shadow-2xl flex items-center justify-center"
                            style={{ 
                                transform: 'rotateX(60deg) rotateZ(45deg)', 
                                transformStyle: 'preserve-3d',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 10px 20px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div className="absolute w-32 h-32 rounded-full border-4 border-gray-600 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-gray-700 border-4 border-gray-500 flex items-center justify-center shadow-inner">
                                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                                </div>
                            </div>
                            
                            {/* Floating Stats */}
                            <div className="absolute -top-10 -right-10 bg-white/10 backdrop-blur-md px-3 py-1 rounded text-white text-xs font-bold border border-white/20 shadow-lg" style={{ transform: 'rotateX(-60deg) rotateZ(-45deg) translateZ(50px)' }}>
                                HM: {tyre.total_hm}
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-white/10 backdrop-blur-md px-3 py-1 rounded text-white text-xs font-bold border border-white/20 shadow-lg" style={{ transform: 'rotateX(-60deg) rotateZ(-45deg) translateZ(50px)' }}>
                                {tyre.condition}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Informasi Dasar</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500">S/N:</span> <span className="font-bold">{tyre.serial_number}</span></div>
                                <div><span className="text-gray-500">Brand:</span> <span className="font-bold">{tyre.brand}</span></div>
                                <div><span className="text-gray-500">Tipe/Size:</span> <span className="font-bold">{tyre.type_size || '-'}</span></div>
                                <div><span className="text-gray-500">Pattern:</span> <span className="font-bold">{tyre.pattern || '-'}</span></div>
                                <div><span className="text-gray-500">PSI:</span> <span className="font-bold">{tyre.psi || '-'}</span></div>
                                <div><span className="text-gray-500">Target HM:</span> <span className="font-bold">{tyre.plan_rotary_target || '3000'}</span></div>
                                <div><span className="text-gray-500">OTD/RTD:</span> <span className="font-bold">{tyre.otd || '-'} / {tyre.rtd || '-'}</span></div>
                                <div>
                                    <span className="text-gray-500">Status:</span> 
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${tyre.condition==='ACTIVE'?'bg-green-100 text-green-700':tyre.condition==='SCRAP'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                                        {tyre.condition}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Posisi Saat Ini</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500">Unit:</span> <span className="font-bold text-blue-600">{unit?.code_unit || 'Di Gudang'}</span></div>
                                <div><span className="text-gray-500">Posisi:</span> <span className="font-bold">{tyre.position || '-'}</span></div>
                                <div><span className="text-gray-500">Prev Life HM:</span> <span className="font-bold text-gray-500">{tyre.total_hm}</span></div>
                                <div><span className="text-gray-500">Current Life HM:</span> <span className="font-bold text-green-600">{tyre.current_life_time}</span></div>
                                <div><span className="text-gray-500">Total Lifetime:</span> <span className="font-bold text-blue-600">{tyre.total_lifetime}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-bold mb-4 border-b pb-2">Riwayat Event (History)</h2>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b">
                            <tr>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Tanggal</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Event</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Unit</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Dari -&gt; Ke</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">HM Event</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Mekanik</th>
                                <th className="px-4 py-3 font-bold uppercase text-[10px]">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {histories && histories.length > 0 ? histories.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{h.event_date}</td>
                                    <td className="px-4 py-3 font-bold text-blue-700">{h.event_type}</td>
                                    <td className="px-4 py-3">{h.unit?.code_unit || '-'}</td>
                                    <td className="px-4 py-3">{h.from_position || '-'} &rarr; {h.to_position || '-'}</td>
                                    <td className="px-4 py-3 font-mono">{h.hm_at_event || '-'}</td>
                                    <td className="px-4 py-3">{h.performed_by || '-'}</td>
                                    <td className="px-4 py-3 text-xs">{h.notes || '-'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Belum ada riwayat.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className={`p-4 border-b ${actionType==='SCRAP'?'bg-red-50':actionType==='REPAIR'?'bg-orange-50':'bg-blue-50'}`}>
                            <h2 className={`text-lg font-bold ${actionType==='SCRAP'?'text-red-800':actionType==='REPAIR'?'text-orange-800':'text-blue-800'}`}>
                                Form {actionType} Tyre
                            </h2>
                        </div>
                        <form onSubmit={submitAction} className="p-6 space-y-4">
                            
                            {actionType === 'ROTATE' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Posisi Baru</label>
                                    <select value={data.to_position} onChange={e => setData('to_position', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm">
                                        <option value="">Pilih Posisi...</option>
                                        <option value="FL">FL (Front Left)</option>
                                        <option value="FR">FR (Front Right)</option>
                                        <option value="RLI">RLI (Rear Left Inner)</option>
                                        <option value="RLO">RLO (Rear Left Outer)</option>
                                        <option value="RRI">RRI (Rear Right Inner)</option>
                                        <option value="RRO">RRO (Rear Right Outer)</option>
                                        <option value="RL">RL (Rear Left)</option>
                                        <option value="RR">RR (Rear Right)</option>
                                        <option value="SPARE">SPARE</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                                <input type="date" value={data.event_date} onChange={e => setData('event_date', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">HM Unit (Saat Event)</label>
                                <input type="number" step="0.01" value={data.hm_at_event} onChange={e => setData('hm_at_event', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dikerjakan Oleh</label>
                                <input type="text" value={data.performed_by} onChange={e => setData('performed_by', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan Tambahan</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" rows="2"></textarea>
                            </div>

                            <div className="flex justify-end pt-4 gap-2">
                                <button type="button" onClick={() => setShowActionModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Batal</button>
                                <button type="submit" disabled={processing} className={`px-6 py-2 text-white rounded-lg font-bold disabled:opacity-50 ${actionType==='SCRAP'?'bg-red-600':actionType==='REPAIR'?'bg-orange-500':'bg-blue-600'}`}>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
