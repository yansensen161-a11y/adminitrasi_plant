import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ tyres, wheelUnits, unitTyreMap, stats, brands, filters }) {
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, REPAIR, SCRAP, STOCK, 3D_VIEWER
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit_id || '');
    const [showModal, setShowModal] = useState(false);
    
    // Form for new Tyre
    const { data, setData, post, processing, errors, reset } = useForm({
        serial_number: '',
        brand: '',
        type_size: '',
        condition: 'STOCK',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: '',
        unit_id: '',
        position: '',
        installed_hm: '',
        tread_depth_new: '',
        notes: ''
    });

    const handleFilter = (e) => {
        if(e) e.preventDefault();
        router.get(route('tyres.index'), {
            unit_id: selectedUnit,
            condition: activeTab === 'ALL' ? '' : activeTab,
            search: search
        }, { preserveState: true });
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        router.get(route('tyres.index'), {
            unit_id: selectedUnit,
            condition: tab === 'ALL' ? '' : tab,
            search: search
        }, { preserveState: true });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('tyres.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                alert("Tyre berhasil ditambahkan!");
            }
        });
    };

    const statsCards = [
        { label: 'Total Tyres', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active (Installed)', value: stats.active, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'In Repair', value: stats.repair, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Scrap', value: stats.scrap, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Ready Stock', value: stats.stock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Tyre Management" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Tyre Management</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="text-blue-600">Home</span> &gt; <span>Component</span> &gt; <span>Tyre Management</span>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-[#0f5132] hover:bg-[#146c43] text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition">
                        + Registrasi Tyre
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {statsCards.map((stat, i) => (
                        <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white/50 shadow-sm relative overflow-hidden group`}>
                            <div className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</div>
                            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6 border-b pb-4">
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'ACTIVE', 'STOCK', 'REPAIR', 'SCRAP'].map(tab => (
                            <button key={tab} onClick={() => handleTabClick(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeTab === tab ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                                {tab}
                            </button>
                        ))}
                        <button onClick={() => setActiveTab('3D_VIEWER')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                            activeTab === '3D_VIEWER' ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                            3D Viewer
                        </button>
                    </div>
                    {activeTab !== '3D_VIEWER' && (
                        <form onSubmit={handleFilter} className="flex gap-2 w-full md:w-auto">
                            <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Semua Unit</option>
                                {wheelUnits.map(u => (
                                    <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                ))}
                            </select>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari Serial Number..." className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Cari</button>
                        </form>
                    )}
                </div>

                {/* 3D Viewer */}
                {activeTab === '3D_VIEWER' && (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                TireVault 3D Viewer — Visualisasi Real-time Kondisi Ban
                            </span>
                            <span className="text-sm text-gray-400">Klik ban pada model 3D untuk melihat detail kondisi</span>
                        </div>
                        <iframe
                            src="/tirevault/"
                            className="w-full rounded-xl border border-gray-200 shadow-lg"
                            style={{ height: '75vh', minHeight: '600px' }}
                            title="TireVault 3D Viewer"
                        />
                    </div>
                )}

                {/* Main Content Area: Tyre Table List */}
                {activeTab !== '3D_VIEWER' && (
                <div className="mt-4">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Tyre List</h2>
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Serial No.</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Brand</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Status</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Current Unit</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Pos</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Lifetime HM</th>
                                    <th className="px-4 py-3 font-bold uppercase text-[10px] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tyres.length === 0 ? (
                                    <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Tidak ada data tyre.</td></tr>
                                ) : tyres.map(tyre => (
                                    <tr key={tyre.id} onDoubleClick={() => router.visit(route('tyres.history', tyre.id))} className="hover:bg-blue-50/50 transition cursor-pointer">
                                        <td className="px-4 py-3 font-bold text-gray-900">{tyre.serial_number}</td>
                                        <td className="px-4 py-3 font-bold">{tyre.brand}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                                                tyre.condition === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                tyre.condition === 'REPAIR' ? 'bg-orange-100 text-orange-700' :
                                                tyre.condition === 'SCRAP' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {tyre.condition}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{tyre.unit?.code_unit || '-'}</td>
                                        <td className="px-4 py-3 font-bold">{tyre.position || '-'}</td>
                                        <td className="px-4 py-3 text-right font-mono">{tyre.total_hm}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href={route('tyres.history', tyre.id)} className="text-blue-600 hover:underline font-bold text-sm">Detail</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">Registrasi Tyre Baru</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number</label>
                                    <input type="text" value={data.serial_number} onChange={e => setData('serial_number', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                                    {errors.serial_number && <p className="text-red-500 text-xs mt-1">{errors.serial_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                    <input type="text" value={data.brand} onChange={e => setData('brand', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Type / Size</label>
                                    <input type="text" value={data.type_size} onChange={e => setData('type_size', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Status Awal</label>
                                    <select value={data.condition} onChange={e => setData('condition', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
                                        <option value="STOCK">STOCK</option>
                                        <option value="ACTIVE">ACTIVE (Terpasang)</option>
                                    </select>
                                </div>
                                
                                {data.condition === 'ACTIVE' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                                            <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm">
                                                <option value="">Pilih Unit...</option>
                                                {wheelUnits.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Posisi</label>
                                            <select value={data.position} onChange={e => setData('position', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm">
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
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">HM Saat Pasang</label>
                                            <input type="number" step="0.01" value={data.installed_hm} onChange={e => setData('installed_hm', e.target.value)} required className="w-full border-gray-300 rounded-lg text-sm" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Catatan</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" rows="2"></textarea>
                            </div>
                            <div className="flex justify-end pt-4 border-t gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Batal</button>
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-[#0f5132] text-white rounded-lg font-bold disabled:opacity-50">Simpan Tyre</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
