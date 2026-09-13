import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Index({ orders, units, filters = {}, flash }) {
    // Filters state
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [unitIdFilter, setUnitIdFilter] = useState(filters.unit_id || '');
    const [deptFilter, setDeptFilter] = useState(filters.department || '');

    const [showFastInput, setShowFastInput] = useState(false);

    // Filter Logic
    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('service-orders.index'), {
            date_from: dateFrom,
            date_to: dateTo,
            unit_id: unitIdFilter,
            department: deptFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom(''); setDateTo(''); setUnitIdFilter(''); setDeptFilter('');
        router.get(route('service-orders.index'), {}, { preserveState: true });
    };

    // Fast Input Logic
    const { data, setData, post, processing, errors, reset } = useForm({
        unit_id: '',
        orders: [
            { id: Date.now(), tanggal: '', lokasi: '', department: '', priority: 'BACKLOG', status: 'WAITING PART' }
        ]
    });

    const addRow = () => {
        setData('orders', [
            ...data.orders,
            { id: Date.now(), tanggal: '', lokasi: '', department: '', priority: 'BACKLOG', status: 'WAITING PART' }
        ]);
    };

    const removeRow = (index) => {
        const newOrders = [...data.orders];
        newOrders.splice(index, 1);
        if (newOrders.length === 0) {
            newOrders.push({ id: Date.now(), tanggal: '', lokasi: '', department: '', priority: 'BACKLOG', status: 'WAITING PART' });
        }
        setData('orders', newOrders);
    };

    const handleRowChange = (index, field, value) => {
        const newOrders = [...data.orders];
        newOrders[index][field] = value;
        setData('orders', newOrders);
    };

    const submitBulk = (e) => {
        e.preventDefault();
        post(route('service-orders.storeBulk'), {
            onSuccess: () => {
                setShowFastInput(false);
                reset();
            }
        });
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index === data.orders.length - 1) {
                addRow();
            }
        }
    };

    // Flash message
    useEffect(() => {
        if (flash?.success) {
            alert(flash.success);
        } else if (flash?.error) {
            alert(flash.error);
        }
    }, [flash]);

    return (
        <AuthenticatedLayout>
            <Head title="Historical Service Orders" />

            <div className="space-y-4">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl shadow-sm border border-blue-100 p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center border border-blue-200/50 backdrop-blur-sm">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">Historical Service Orders</h1>
                                <p className="text-[12px] text-gray-500 font-medium">Lacak & rekam riwayat pekerjaan mekanik per unit dengan cepat</p>
                            </div>
                        </div>
                        <div>
                            <button 
                                onClick={() => setShowFastInput(!showFastInput)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all ${showFastInput ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50'}`}
                            >
                                {showFastInput ? (
                                    <>Tutup Form Input</>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Fast Input Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fast Input Section */}
                {showFastInput && (
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3">
                            <h2 className="text-white font-bold text-sm flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Grid Input Cepat (Historical)
                            </h2>
                        </div>
                        <form onSubmit={submitBulk} className="p-5">
                            <div className="mb-5 flex flex-col md:flex-row gap-4 items-end bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                                <div className="flex-1 w-full max-w-sm">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Pilih Unit Terlebih Dahulu <span className="text-red-500">*</span></label>
                                    <select 
                                        value={data.unit_id} 
                                        onChange={e => setData('unit_id', e.target.value)}
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        required
                                    >
                                        <option value="">-- Cari & Pilih Unit --</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <div className="text-red-500 text-sm mt-1 font-medium">{errors.unit_id}</div>}
                                </div>
                                <div className="text-sm text-gray-500 font-medium bg-white px-3 py-2 rounded border border-gray-200 shadow-sm">
                                    <span className="font-bold text-blue-600">Tip:</span> Tekan tombol <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700 font-mono">Tab</kbd> untuk pindah kolom, dan <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700 font-mono">Enter</kbd> di akhir baris untuk tambah baris baru.
                                </div>
                            </div>

                            {data.unit_id ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left whitespace-nowrap">
                                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-3 py-2.5 font-bold w-10 text-center">No</th>
                                                    <th className="px-3 py-2.5 font-bold w-40">Tanggal <span className="text-red-500">*</span></th>
                                                    <th className="px-3 py-2.5 font-bold">Lokasi</th>
                                                    <th className="px-3 py-2.5 font-bold w-48">Department</th>
                                                    <th className="px-3 py-2.5 font-bold w-36">Priority</th>
                                                    <th className="px-3 py-2.5 font-bold w-40">Status</th>
                                                    <th className="px-3 py-2.5 font-bold w-10 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.orders.map((row, index) => (
                                                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-3 py-1.5 text-center text-sm font-bold text-gray-400">{index + 1}</td>
                                                        <td className="px-3 py-1.5">
                                                            <input type="date" value={row.tanggal} onChange={e => handleRowChange(index, 'tanggal', e.target.value)} onKeyDown={e => handleKeyDown(e, index)} required className="w-full text-sm border-transparent focus:border-blue-500 focus:ring-blue-500 rounded bg-gray-50 hover:bg-white px-2 py-1.5 transition-colors"/>
                                                        </td>
                                                        <td className="px-3 py-1.5">
                                                            <input type="text" placeholder="Lokasi Pekerjaan..." value={row.lokasi} onChange={e => handleRowChange(index, 'lokasi', e.target.value)} onKeyDown={e => handleKeyDown(e, index)} className="w-full text-sm border-transparent focus:border-blue-500 focus:ring-blue-500 rounded bg-gray-50 hover:bg-white px-2 py-1.5 transition-colors"/>
                                                        </td>
                                                        <td className="px-3 py-1.5">
                                                            <input type="text" placeholder="Department..." value={row.department} onChange={e => handleRowChange(index, 'department', e.target.value)} onKeyDown={e => handleKeyDown(e, index)} className="w-full text-sm border-transparent focus:border-blue-500 focus:ring-blue-500 rounded bg-gray-50 hover:bg-white px-2 py-1.5 transition-colors"/>
                                                        </td>
                                                        <td className="px-3 py-1.5">
                                                            <select value={row.priority} onChange={e => handleRowChange(index, 'priority', e.target.value)} onKeyDown={e => handleKeyDown(e, index)} className="w-full text-sm border-transparent focus:border-blue-500 focus:ring-blue-500 rounded bg-gray-50 hover:bg-white px-2 py-1.5 transition-colors">
                                                                <option value="URGENT">URGENT</option>
                                                                <option value="NORMAL">NORMAL</option>
                                                                <option value="BACKLOG">BACKLOG</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-1.5">
                                                            <select value={row.status} onChange={e => handleRowChange(index, 'status', e.target.value)} onKeyDown={e => handleKeyDown(e, index)} className="w-full text-sm border-transparent focus:border-blue-500 focus:ring-blue-500 rounded bg-gray-50 hover:bg-white px-2 py-1.5 transition-colors">
                                                                <option value="OPEN">OPEN</option>
                                                                <option value="PROCESS">PROCESS</option>
                                                                <option value="WAITING PART">WAITING PART</option>
                                                                <option value="CLOSED">CLOSED</option>
                                                                <option value="CANCEL">CANCEL</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-1.5 text-center">
                                                            <button type="button" onClick={() => removeRow(index)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                                        <button type="button" onClick={addRow} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            Tambah Baris
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500">{data.orders.length} baris siap disimpan</span>
                                            <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-blue-500/30 transition disabled:opacity-50 flex items-center gap-2">
                                                {processing ? (
                                                    <><svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...</>
                                                ) : (
                                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Simpan Semua Historis</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50/50">
                                    <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-700">Pilih Unit Terlebih Dahulu</h3>
                                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Anda harus memilih unit di dropdown atas sebelum bisa menginput data historis service secara massal.</p>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Filter Row */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1 w-[160px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Dari</label>
                            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 h-9"/>
                        </div>
                        <div className="flex flex-col gap-1 w-[160px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Sampai</label>
                            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 h-9"/>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cari Unit</label>
                            <select value={unitIdFilter} onChange={e => setUnitIdFilter(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 h-9">
                                <option value="">-- Semua Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                            <input type="text" placeholder="Nama Dept..." value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 h-9"/>
                        </div>
                        <div className="flex gap-2 h-9">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-full flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Filter
                            </button>
                            <button type="button" onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-full flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-center w-12">No</th>
                                    <th className="px-4 py-3 font-bold w-40">No SO</th>
                                    <th className="px-4 py-3 font-bold">Tanggal</th>
                                    <th className="px-4 py-3 font-bold">Kode Unit</th>
                                    <th className="px-4 py-3 font-bold">Lokasi</th>
                                    <th className="px-4 py-3 font-bold">Department</th>
                                    <th className="px-4 py-3 font-bold text-center">Priority</th>
                                    <th className="px-4 py-3 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {orders.data.length > 0 ? orders.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-400">
                                            {orders.from + index}
                                        </td>
                                        <td className="px-4 py-2.5 font-bold text-gray-900">{item.no_so}</td>
                                        <td className="px-4 py-2.5 text-gray-700">{item.tanggal}</td>
                                        <td className="px-4 py-2.5 font-bold text-blue-700">{item.unit?.code_unit || '-'}</td>
                                        <td className="px-4 py-2.5">{item.lokasi}</td>
                                        <td className="px-4 py-2.5">{item.department}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                item.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                                item.priority === 'NORMAL' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                item.status === 'CLOSED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                item.status === 'PROCESS' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                item.status === 'WAITING PART' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                item.status === 'CANCEL' ? 'bg-gray-100 border-gray-200 text-gray-600' :
                                                'bg-yellow-50 border-yellow-200 text-yellow-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                                                <p className="font-bold text-gray-500">Belum ada data Service Order / Historis</p>
                                                <p className="text-sm mt-1">Gunakan tombol "Fast Input Data" di atas untuk mulai memasukkan data.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="text-sm text-gray-500 font-medium">
                                Menampilkan <span className="font-bold text-gray-900">{orders.from || 0}</span> - <span className="font-bold text-gray-900">{orders.to || 0}</span> dari <span className="font-bold text-gray-900">{orders.total}</span> data
                            </div>
                            <div className="flex gap-1">
                                {orders.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                                            link.active 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : link.url 
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' 
                                                    : 'bg-transparent text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
