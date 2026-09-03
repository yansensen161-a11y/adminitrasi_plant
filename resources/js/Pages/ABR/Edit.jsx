import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const formatRp = (value) => new Intl.NumberFormat('id-ID').format(value);
const getTotal = (items) => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
const calculateAmount = (item) => {
    if (item.category === 'repair' || item.category === 'sparepart') {
        return (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
    } else {
        return (parseFloat(item.price) || 0) * (parseFloat(item.hour) || 0) * (parseFloat(item.mp) || 0);
    }
};
const handleItemChange = (setState, index, field, value) => {
    setState(prev => {
        const newItems = [...prev];
        newItems[index][field] = value;
        newItems[index].amount = calculateAmount(newItems[index]);
        return newItems;
    });
};
const addItem = (setState, category) => {
    setState(prev => [...prev, { category, part_number: '', description: '', price: 0, qty: '', satuan: 'Set', hour: 1, mp: 1, amount: 0 }]);
};
const removeItem = (setState, index) => {
    setState(prev => prev.filter((_, i) => i !== index));
};

// Reusable Table Component for Cost Lists
const CostTable = ({ title, items, setItems, category, columns }) => (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded shadow p-4 border dark:border-gray-700">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">{title}</h4>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <tr>
                        <th className="px-2 py-2 w-10 text-center">No</th>
                        {columns.map((col, idx) => <th key={idx} className="px-2 py-2 text-center">{col.label}</th>)}
                        <th className="px-2 py-2 text-center w-32">Amount (Rp)</th>
                        <th className="px-2 py-2 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                            <td className="px-2 py-2 text-center">{index + 1}</td>
                            {columns.map((col, idx) => (
                                <td key={idx} className="px-2 py-2">
                                    <input 
                                        type={col.type || 'text'} 
                                        value={item[col.field] || ''} 
                                        onChange={(e) => handleItemChange(setItems, index, col.field, e.target.value)}
                                        className={`w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded text-sm ${col.align === 'right' ? 'text-right' : ''}`}
                                        readOnly={col.readOnly}
                                    />
                                </td>
                            ))}
                            <td className="px-2 py-2">
                                <input type="text" value={formatRp(item.amount)} readOnly className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded text-sm text-right bg-gray-50" />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <button type="button" onClick={() => removeItem(setItems, index)} className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={columns.length + 1} className="px-2 py-2">
                            <button type="button" onClick={() => addItem(setItems, category)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
                                <svg className="w-4 h-4 fill-current bg-blue-100 rounded-full" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
                                Tambah Baris
                            </button>
                        </td>
                        <td className="px-2 py-2 text-right font-bold text-gray-800 dark:text-gray-200">
                            Total Amount :
                        </td>
                        <td className="px-2 py-2">
                            <input type="text" value={formatRp(getTotal(items))} readOnly className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded text-sm text-right bg-gray-100 dark:bg-gray-700 font-bold" />
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
);

export default function Edit({ auth, units, abr }) {
    const [selectedUnit, setSelectedUnit] = useState(null);
    
    // Items state extracted from the existing ABR items
    const [repairItems, setRepairItems] = useState(abr.items.filter(i => i.category === 'repair').length > 0 ? abr.items.filter(i => i.category === 'repair') : [{ category: 'repair', part_number: '', description: '', price: 0, qty: '', satuan: 'Set', amount: 0 }]);
    const [manpowerItems, setManpowerItems] = useState(abr.items.filter(i => i.category === 'manpower').length > 0 ? abr.items.filter(i => i.category === 'manpower') : [{ category: 'manpower', description: 'Manpower', price: 0, hour: 1, mp: 1, amount: 0 }]);
    const [sparepartItems, setSparepartItems] = useState(abr.items.filter(i => i.category === 'sparepart').length > 0 ? abr.items.filter(i => i.category === 'sparepart') : [{ category: 'sparepart', part_number: '', description: '', price: 0, qty: '', satuan: 'Pcs', amount: 0 }]);
    const [evakuasiItems, setEvakuasiItems] = useState(abr.items.filter(i => i.category === 'evakuasi').length > 0 ? abr.items.filter(i => i.category === 'evakuasi') : [{ category: 'evakuasi', description: 'Evakuasi Unit', price: 0, hour: 1, mp: 1, amount: 0 }]);
    const [disassemblyItems, setDisassemblyItems] = useState(abr.items.filter(i => i.category === 'disassembly').length > 0 ? abr.items.filter(i => i.category === 'disassembly') : [
        { category: 'disassembly', description: 'Akomodasi, kosumsi & transportasi man power', price: 0, hour: 1, mp: 1, amount: 0 },
        { category: 'disassembly', description: 'Delivery Sparepart, Consumables & DLL', price: 0, hour: 1, mp: 1, amount: 0 },
        { category: 'disassembly', description: 'Transportasi sewa LV operasional', price: 0, hour: 1, mp: 1, amount: 0 },
    ]);

    // Data state
    const [data, setData] = useState({
        _method: 'put',
        no_abr: abr.no_abr,
        tanggal: abr.tanggal ? new Date(abr.tanggal).toISOString().split('T')[0] : '',
        unit_id: abr.unit_id || '',
        manual_unit_code: abr.manual_unit_code || '',
        manual_unit_model: abr.manual_unit_model || '',
        manual_sn_chassis: abr.manual_sn_chassis || '',
        manual_engine_model: abr.manual_engine_model || '',
        manual_sn_engine: abr.manual_sn_engine || '',
        lokasi_site: abr.lokasi_site,
        lokasi_perbaikan: abr.lokasi_perbaikan,
        hm: abr.hm,
        inspected_by: abr.inspected_by,
        incident_description: abr.incident_description,
        dibuat_oleh: abr.dibuat_oleh,
        dibuat_jabatan: abr.dibuat_jabatan,
        checked_by: abr.checked_by,
        checked_jabatan: abr.checked_jabatan,
        disetujui_oleh: abr.disetujui_oleh,
        disetujui_jabatan: abr.disetujui_jabatan,
        diketahui_oleh: abr.diketahui_oleh,
        diketahui_jabatan: abr.diketahui_jabatan,
        status: abr.status,
    });

    const [isManualUnit, setIsManualUnit] = useState(!abr.unit_id && !!abr.manual_unit_code);
    const [existingImages, setExistingImages] = useState(abr.images || []);
    const [newImages, setNewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...filesArray]);
            
            const previewsArray = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previewsArray]);
        }
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (data.unit_id) {
            const unit = units.find(u => u.id === data.unit_id);
            setSelectedUnit(unit);
        } else {
            setSelectedUnit(null);
        }
    }, [data.unit_id]);



    const totalBiaya = getTotal(repairItems) + getTotal(manpowerItems) + getTotal(sparepartItems) + getTotal(evakuasiItems) + getTotal(disassemblyItems);
    const taxAmount = totalBiaya * 0.11;
    const grandTotal = totalBiaya + taxAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // For simpler update of deeply nested arrays, we just send via json usually.
        // Inertia form data with method spoofing is easiest.
        
        const payload = {
            _method: 'put',
            ...data,
            unit_id: isManualUnit ? '' : data.unit_id,
            total_biaya: totalBiaya,
            tax_amount: taxAmount,
            grand_total: grandTotal,
            items: [...repairItems, ...manpowerItems, ...sparepartItems, ...evakuasiItems, ...disassemblyItems],
            new_images: newImages
        };

        router.post(route('abr.update', abr.id), payload);
    };



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit ABR (Analisa Biaya Repair)</h2>
                <div className="text-sm text-gray-500">ABR / Edit ABR</div>
            </div>}
        >
            <Head title="Edit ABR" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Header Info */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700">
                            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                Informasi Dokumen & Spesifikasi Unit
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Dokumen</label>
                                    <select value={data.status} onChange={e => setData({...data, status: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm font-bold text-blue-600">
                                        <option value="Open">Open</option>
                                        <option value="Close">Close</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. ABR</label>
                                    <input type="text" value={data.no_abr} readOnly className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded shadow-sm text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Accident</label>
                                    <input type="date" value={data.tanggal} onChange={e => setData({...data, tanggal: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code Number Unit</label>
                                    <select value={isManualUnit ? 'manual' : data.unit_id} onChange={e => {
                                        if (e.target.value === 'manual') {
                                            setIsManualUnit(true);
                                            setData({...data, unit_id: ''});
                                        } else {
                                            setIsManualUnit(false);
                                            setData({...data, unit_id: e.target.value});
                                        }
                                    }} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm font-bold" required={!isManualUnit}>
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                        <option value="manual">-- Ketik Manual --</option>
                                    </select>
                                    {isManualUnit && (
                                        <input type="text" placeholder="Ketik Code Unit..." value={data.manual_unit_code} onChange={e => setData({...data, manual_unit_code: e.target.value})} className="mt-2 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" required={isManualUnit} />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-500">Unit Type</label>
                                    <input type="text" value={isManualUnit ? data.manual_unit_model : (selectedUnit?.model || '')} onChange={e => isManualUnit && setData({...data, manual_unit_model: e.target.value})} readOnly={!isManualUnit} className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded shadow-sm text-sm ${isManualUnit ? 'dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`} placeholder={isManualUnit ? "Ketik Type..." : ""} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Serial Number</label>
                                    <input type="text" value={isManualUnit ? data.manual_sn_chassis : (selectedUnit?.sn_chassis || '')} onChange={e => isManualUnit && setData({...data, manual_sn_chassis: e.target.value})} readOnly={!isManualUnit} className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded shadow-sm text-sm ${isManualUnit ? 'dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`} placeholder={isManualUnit ? "Ketik SN..." : ""} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Model Engine</label>
                                    <input type="text" value={isManualUnit ? data.manual_engine_model : (selectedUnit?.engine_model || '')} onChange={e => isManualUnit && setData({...data, manual_engine_model: e.target.value})} readOnly={!isManualUnit} className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded shadow-sm text-sm ${isManualUnit ? 'dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`} placeholder={isManualUnit ? "Ketik Model Engine..." : ""} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Engine Number</label>
                                    <input type="text" value={isManualUnit ? data.manual_sn_engine : (selectedUnit?.sn_engine || '')} onChange={e => isManualUnit && setData({...data, manual_sn_engine: e.target.value})} readOnly={!isManualUnit} className={`mt-1 block w-full border-gray-300 dark:border-gray-600 rounded shadow-sm text-sm ${isManualUnit ? 'dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`} placeholder={isManualUnit ? "Ketik Engine Number..." : ""} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Lokasi / Site</label>
                                    <input type="text" value={data.lokasi_site} onChange={e => setData({...data, lokasi_site: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Lokasi Perbaikan</label>
                                    <input type="text" value={data.lokasi_perbaikan} onChange={e => setData({...data, lokasi_perbaikan: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Hour Meter (HM)</label>
                                    <input type="number" step="0.1" value={data.hm} onChange={e => setData({...data, hm: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Inspected By</label>
                                    <input type="text" value={data.inspected_by} onChange={e => setData({...data, inspected_by: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Incident Description</label>
                                <textarea value={data.incident_description} onChange={e => setData({...data, incident_description: e.target.value})} rows="2" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded shadow-sm text-sm" required></textarea>
                            </div>
                        </div>

                        {/* List Cost Repair */}
                        <CostTable 
                            title="1. List Cost Repair (Property Damage)" 
                            items={repairItems} 
                            setItems={setRepairItems} 
                            category="repair"
                            columns={[
                                { label: 'Part Number', field: 'part_number' },
                                { label: 'Description', field: 'description' },
                                { label: 'Price (Rp)', field: 'price', type: 'number', align: 'right' },
                                { label: 'Qty', field: 'qty', type: 'number', align: 'right' },
                                { label: 'Sat', field: 'satuan' },
                            ]}
                        />

                        {/* Manpower Cost */}
                        <CostTable 
                            title="2. Manpower Cost" 
                            items={manpowerItems} 
                            setItems={setManpowerItems} 
                            category="manpower"
                            columns={[
                                { label: 'Description', field: 'description' },
                                { label: 'Price (Rp)', field: 'price', type: 'number', align: 'right' },
                                { label: 'Hour', field: 'hour', type: 'number', align: 'right' },
                                { label: 'MP', field: 'mp', type: 'number', align: 'right' },
                            ]}
                        />

                        {/* List Cost Spare Part */}
                        <CostTable 
                            title="3. List Cost Spare Part" 
                            items={sparepartItems} 
                            setItems={setSparepartItems} 
                            category="sparepart"
                            columns={[
                                { label: 'Part Number', field: 'part_number' },
                                { label: 'Description', field: 'description' },
                                { label: 'Price (Rp)', field: 'price', type: 'number', align: 'right' },
                                { label: 'Qty', field: 'qty', type: 'number', align: 'right' },
                                { label: 'Sat', field: 'satuan' },
                            ]}
                        />

                        {/* List Biaya Evakuasi Unit */}
                        <CostTable 
                            title="4. List Biaya Evakuasi Unit" 
                            items={evakuasiItems} 
                            setItems={setEvakuasiItems} 
                            category="evakuasi"
                            columns={[
                                { label: 'Description', field: 'description' },
                                { label: 'Price (Rp)', field: 'price', type: 'number', align: 'right' },
                                { label: 'Hour', field: 'hour', type: 'number', align: 'right' },
                                { label: 'MP', field: 'mp', type: 'number', align: 'right' },
                            ]}
                        />

                        {/* List Cost Disassembly */}
                        <CostTable 
                            title="5. List Cost Disassembly, Assembly & Akomodasi" 
                            items={disassemblyItems} 
                            setItems={setDisassemblyItems} 
                            category="disassembly"
                            columns={[
                                { label: 'Description', field: 'description' },
                                { label: 'Price (Rp)', field: 'price', type: 'number', align: 'right' },
                                { label: 'Hour', field: 'hour', type: 'number', align: 'right' },
                                { label: 'MP', field: 'mp', type: 'number', align: 'right' },
                            ]}
                        />

                        {/* Summary & Photos */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700 flex flex-col lg:flex-row gap-6 items-end">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 border border-red-200 dark:border-red-900 rounded p-4 bg-red-50/50 dark:bg-red-900/10">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">TOTAL BIAYA (1+2+3+4+5)</label>
                                    <input type="text" value={formatRp(totalBiaya)} readOnly className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-lg font-bold text-right" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">TAX (11%)</label>
                                    <input type="text" value={formatRp(taxAmount)} readOnly className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-lg font-bold text-right" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-red-600 dark:text-red-400">GRAND TOTAL TERMASUK PAJAK</label>
                                    <input type="text" value={formatRp(grandTotal)} readOnly className="mt-1 block w-full border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 rounded text-xl font-bold text-red-600 dark:text-red-400 text-right" />
                                </div>
                            </div>
                            <div className="w-full lg:w-1/3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Foto Kerusakan</label>
                                <div className="flex gap-2 items-center flex-wrap">
                                    {/* Existing Images */}
                                    {existingImages.map((img, idx) => (
                                        <div key={`exist-${idx}`} className="relative w-16 h-16 rounded border overflow-hidden">
                                            <img src={img.file_path} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    
                                    {/* New Images */}
                                    {imagePreviews.map((src, idx) => (
                                        <div key={`new-${idx}`} className="relative w-16 h-16 rounded border overflow-hidden">
                                            <img src={src} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        <span className="text-[10px] text-gray-500">Tambah</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Validasi / Tanda Tangan Dokumen</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Dibuat Oleh,</label>
                                    <input type="text" value={data.dibuat_oleh} onChange={e => setData({...data, dibuat_oleh: e.target.value})} className="block w-full border-b border-0 border-gray-300 dark:border-gray-600 bg-transparent px-0 py-1 text-sm font-bold text-center mb-1 focus:ring-0 focus:border-blue-500" />
                                    <input type="text" value={data.dibuat_jabatan} onChange={e => setData({...data, dibuat_jabatan: e.target.value})} className="block w-full border-none bg-transparent px-0 py-0 text-xs text-center text-gray-500 focus:ring-0" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Checked by,</label>
                                    <input type="text" value={data.checked_by} onChange={e => setData({...data, checked_by: e.target.value})} className="block w-full border-b border-0 border-gray-300 dark:border-gray-600 bg-transparent px-0 py-1 text-sm font-bold text-center mb-1 focus:ring-0 focus:border-blue-500" />
                                    <input type="text" value={data.checked_jabatan} onChange={e => setData({...data, checked_jabatan: e.target.value})} className="block w-full border-none bg-transparent px-0 py-0 text-xs text-center text-gray-500 focus:ring-0" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Disetujui Oleh,</label>
                                    <input type="text" value={data.disetujui_oleh} onChange={e => setData({...data, disetujui_oleh: e.target.value})} className="block w-full border-b border-0 border-gray-300 dark:border-gray-600 bg-transparent px-0 py-1 text-sm font-bold text-center mb-1 focus:ring-0 focus:border-blue-500" />
                                    <input type="text" value={data.disetujui_jabatan} onChange={e => setData({...data, disetujui_jabatan: e.target.value})} className="block w-full border-none bg-transparent px-0 py-0 text-xs text-center text-gray-500 focus:ring-0" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Diketahui Oleh,</label>
                                    <input type="text" value={data.diketahui_oleh} onChange={e => setData({...data, diketahui_oleh: e.target.value})} className="block w-full border-b border-0 border-gray-300 dark:border-gray-600 bg-transparent px-0 py-1 text-sm font-bold text-center mb-1 focus:ring-0 focus:border-blue-500" />
                                    <input type="text" value={data.diketahui_jabatan} onChange={e => setData({...data, diketahui_jabatan: e.target.value})} className="block w-full border-none bg-transparent px-0 py-0 text-xs text-center text-gray-500 focus:ring-0" />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 border-t dark:border-gray-700 pt-6">
                            <Link href={route('abr.index')} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold py-2 px-6 rounded shadow">
                                Kembali
                            </Link>
                            <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-6 rounded shadow flex items-center gap-2">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
