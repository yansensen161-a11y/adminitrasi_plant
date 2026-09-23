import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const formatRp = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
};

const parseRp = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/\./g, '').replace(/,/g, '')) || 0;
};

const getTotal = (items) => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

const calculateAmount = (item) => {
    return (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
};

const generateRowKey = () => 'row_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

function TableSection({ 
    title, 
    num, 
    items, 
    setItems, 
    category, 
    defaults, 
    hasPartNumber = false, 
    satuanLabel = 'Sat',
    onAddRow,
    onRemoveRow,
    onItemChange 
}) {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-1">
                <div className="font-bold text-sm">{num}. {title}</div>
                <button 
                    type="button" 
                    onClick={() => onAddRow(category, setItems, defaults)} 
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded shadow transition"
                >
                    + Tambah Baris
                </button>
            </div>
            <table className="abr-table">
                <thead>
                    <tr>
                        <th className="w-8">No</th>
                        {hasPartNumber && <th className="w-32">Part Number</th>}
                        <th>Description</th>
                        <th className="w-28">Price (Rp)</th>
                        <th className="w-12">Qty</th>
                        <th className="w-12">{satuanLabel}</th>
                        <th className="w-28">Amount (Rp)</th>
                        <th className="w-8"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item._key || item.id || idx} className="group hover:bg-gray-50">
                            <td className="text-center bg-gray-50">{idx + 1}</td>
                            {hasPartNumber && (
                                <td>
                                    <input 
                                        type="text" 
                                        value={item.part_number || ''} 
                                        onChange={(e) => onItemChange(setItems, idx, 'part_number', e.target.value)} 
                                        className="text-center" 
                                    />
                                </td>
                            )}
                            <td>
                                <input 
                                    type="text" 
                                    value={item.description || ''} 
                                    onChange={(e) => onItemChange(setItems, idx, 'description', e.target.value)} 
                                    className="text-left px-1" 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={item.price ? formatRp(item.price) : ''} 
                                    onChange={(e) => onItemChange(setItems, idx, 'price', e.target.value)} 
                                    className="text-right pr-1" 
                                    placeholder="0" 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={item.qty ?? ''} 
                                    onChange={(e) => onItemChange(setItems, idx, 'qty', e.target.value)} 
                                    className="text-center" 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={item.satuan ?? ''} 
                                    onChange={(e) => onItemChange(setItems, idx, 'satuan', e.target.value)} 
                                    className="text-center" 
                                />
                            </td>
                            <td className="text-right pr-1 bg-gray-50">{item.amount ? formatRp(item.amount) : '0'}</td>
                            <td className="text-center">
                                <button 
                                    type="button" 
                                    onClick={() => onRemoveRow(setItems, idx)} 
                                    className="text-red-500 hover:text-red-700 font-bold px-1 text-base transition" 
                                    title="Hapus Baris"
                                >
                                    &times;
                                </button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={hasPartNumber ? 6 : 5} className="text-right font-bold pr-2 bg-gray-100">Total ({num}) : </td>
                        <td className="text-right font-bold pr-1 bg-gray-100">{formatRp(getTotal(items))}</td>
                        <td className="bg-gray-100"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default function Create({ auth, units, no_abr }) {
    const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialUnitId = sp ? (sp.get('unit_id') || '') : '';
    const initialNoWo = sp ? (sp.get('no_wo') || '') : '';
    const returnTo = sp ? (sp.get('return_to') || '') : '';

    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isManualUnit, setIsManualUnit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const createEmptyRow = (category, defaults = {}) => ({
        _key: generateRowKey(),
        category, part_number: '', description: '', price: 0, qty: '', satuan: '', amount: 0, ...defaults
    });

    const [repairItems, setRepairItems] = useState([createEmptyRow('repair', { satuan: 'Set' })]);
    const [manpowerItems, setManpowerItems] = useState([createEmptyRow('manpower')]);
    const [sparepartItems, setSparepartItems] = useState([createEmptyRow('sparepart', { satuan: 'Pcs' })]);
    const [evakuasiItems, setEvakuasiItems] = useState([createEmptyRow('evakuasi')]);
    const [disassemblyItems, setDisassemblyItems] = useState([createEmptyRow('disassembly')]);

    const handleAddRow = (category, setState, defaults = {}) => {
        setState(prev => [...prev, createEmptyRow(category, defaults)]);
    };

    const handleRemoveRow = (setState, index) => {
        setState(prev => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (setState, index, field, value) => {
        setState(prev => {
            const newItems = [...prev];
            const updatedItem = { ...newItems[index] };
            if (field === 'price') {
                updatedItem[field] = parseRp(value);
            } else {
                updatedItem[field] = value;
            }
            updatedItem.amount = calculateAmount(updatedItem);
            newItems[index] = updatedItem;
            return newItems;
        });
    };

    const [data, setData] = useState({
        no_abr: no_abr,
        no_wo: initialNoWo,
        tanggal: new Date().toISOString().split('T')[0],
        unit_id: initialUnitId,
        manual_unit_code: '',
        manual_unit_model: '',
        manual_sn_chassis: '',
        manual_engine_model: '',
        manual_sn_engine: '',
        lokasi_site: 'Site Harindo Wahana',
        lokasi_perbaikan: 'Site Harindo Wahana',
        hm: '',
        inspected_by: 'Plant Dept',
        incident_description: 'Unit Amblas di tarik sama dozer yang menyebabkan Sock Absorber Front, Bump Stop Spring & Flange Nut Broken',
        dibuat_oleh: 'Yansen',
        dibuat_jabatan: 'Planner',
        checked_by: 'Mukti Alie',
        checked_jabatan: 'Sr. Planner',
        disetujui_oleh: 'Ambo Mai',
        disetujui_jabatan: 'Plant Suptend',
        diketahui_oleh: 'Supardi Halim',
        diketahui_jabatan: 'Project Manager',
        status: 'Open',
        images: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData({ ...data, images: [...data.images, ...files] });
        
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...filePreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData({ ...data, images: newImages });

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    useEffect(() => {
        if (data.unit_id) {
            const unit = units.find(u => u.id === data.unit_id);
            setSelectedUnit(unit);
            if (unit && !data.hm) {
                setData(d => ({ ...d, hm: unit.current_hm || '' }));
            }
            if (unit) {
                setData(d => ({
                    ...d,
                    manual_unit_code: unit.code_unit,
                    manual_unit_model: unit.model,
                    manual_sn_chassis: unit.sn_chassis,
                    manual_engine_model: unit.engine_model,
                    manual_sn_engine: unit.sn_engine
                }));
            }
        } else {
            setSelectedUnit(null);
        }
    }, [data.unit_id, units]);

    const totalBiaya = getTotal(repairItems) + getTotal(manpowerItems) + getTotal(sparepartItems) + getTotal(evakuasiItems) + getTotal(disassemblyItems);
    const taxAmount = Math.round(totalBiaya * 0.11);
    const grandTotal = totalBiaya + taxAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== 'images') {
                if (key === 'unit_id' && isManualUnit) {
                    formData.append(key, '');
                } else {
                    formData.append(key, data[key] || '');
                }
            }
        });
        
        const filterEmpty = (items) => items
            .filter(i => (i.description && i.description.trim() !== '') || (i.part_number && i.part_number.trim() !== '') || (i.price && i.price > 0))
            .map(({ _key, ...rest }) => rest);
        const allItems = [
            ...filterEmpty(repairItems), 
            ...filterEmpty(manpowerItems), 
            ...filterEmpty(sparepartItems), 
            ...filterEmpty(evakuasiItems), 
            ...filterEmpty(disassemblyItems)
        ];

        allItems.forEach((item, i) => {
            Object.keys(item).forEach(key => {
                formData.append(`items[${i}][${key}]`, item[key] !== null ? item[key] : '');
            });
        });

        data.images.forEach((image, i) => {
            formData.append(`images[${i}]`, image);
        });
        
        formData.append('total_biaya', totalBiaya);
        formData.append('tax_amount', taxAmount);
        formData.append('grand_total', grandTotal);
        if (returnTo) {
            formData.append('return_to', returnTo);
        }

        setIsSubmitting(true);
        router.post(route('abr.store'), formData, {
            forceFormData: true,
            onFinish: () => setIsSubmitting(false),
            onError: () => setIsSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah ABR" />

            <div className="flex flex-col bg-gray-100 dark:bg-transparent min-h-screen">
                {/* Custom Header */}
                <div className="bg-white dark:bg-[#060b14] px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <Link
                            href={returnTo || route('abr.index')}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight">Tambah ABR</h1>
                            <div className="flex items-center text-sm text-gray-500 font-medium gap-1">
                                <Link href={route('abr.index')} className="hover:text-blue-600 transition-colors">ABR</Link>
                                <span>›</span>
                                <span className="text-blue-600 font-bold">Tambah ABR</span>
                                {returnTo && <span className="ml-2 text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">🔗 Terhubung ke WO</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={returnTo || route('abr.index')} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded shadow-sm text-sm transition">
                            {returnTo ? '← Kembali ke WO' : 'Batal'}
                        </Link>
                        <button
                            type="submit"
                            form="abr-create-form"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white font-bold py-2 px-5 rounded shadow-sm flex items-center gap-2 text-sm transition"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Dokumen'}</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                <form id="abr-create-form" onSubmit={handleSubmit} className="abr-paper w-full bg-white p-8 shadow-xl relative" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <style>
                        {`
                            .abr-paper {
                                background-color: #ffffff !important;
                                backdrop-filter: none !important;
                                -webkit-backdrop-filter: none !important;
                                border: 1px solid #d1d5db !important;
                                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
                                color: #111827 !important;
                            }
                            .abr-table { 
                                border-collapse: collapse !important; 
                                width: 100% !important; 
                                border: 1px solid #4b5563 !important; 
                                font-size: 11px !important; 
                                background-color: #ffffff !important;
                                table-layout: fixed;
                            }
                            .abr-table th, .abr-table td { 
                                border: 1px solid #6b7280 !important; 
                                padding: 0px !important; 
                                height: 28px !important; 
                                color: #111827 !important;
                                vertical-align: middle !important;
                                box-sizing: border-box !important;
                            }
                            .abr-table th { 
                                font-weight: bold !important; 
                                text-align: center !important; 
                                background-color: #e5e7eb !important; 
                                color: #1f2937 !important; 
                                padding: 6px 4px !important; 
                                border: 1px solid #6b7280 !important;
                                border-bottom: 2px solid #4b5563 !important;
                            }
                            .abr-table tbody tr:hover td {
                                background-color: #f3f4f6 !important;
                            }
                            .abr-table td.bg-gray-50, .abr-table td.bg-gray-100 {
                                background-color: #f3f4f6 !important;
                            }
                            .abr-table input {
                                width: 100% !important;
                                height: 100% !important;
                                min-height: 26px !important;
                                border: none !important;
                                background: transparent !important;
                                padding: 2px 6px !important;
                                margin: 0 !important;
                                box-shadow: none !important;
                                outline: none !important;
                                font-size: 11px !important;
                                font-family: inherit !important;
                                border-radius: 0 !important;
                                color: #111827 !important;
                            }
                            .abr-table input:focus {
                                box-shadow: none !important;
                                border: none !important;
                                outline: none !important;
                                background-color: #e5e7eb !important;
                                color: #000000 !important;
                            }
                            .info-box { border: 1px solid #d1d5db !important; border-radius: 6px; padding: 12px; font-size: 10px; background-color: #ffffff !important; }
                            .info-title { font-weight: bold; font-size: 10px; margin-bottom: 8px; color: #374151; text-transform: uppercase; }
                            .info-row { display: flex; margin-bottom: 4px; align-items: center; }
                            .info-label { width: 80px; color: #4b5563; }
                            .info-val { font-weight: bold; flex: 1; margin-left: 4px; }
                        `}
                    </style>

                    <div className="absolute -top-2 right-0 flex gap-2 print:hidden">
                    </div>

                    {/* Header */}
                    <div className="flex items-center border-b-[2px] border-black pb-2 mb-6 text-black">
                        <img src="/images/logo.png" alt="Logo" className="h-10 mr-4" onError={(e) => e.target.style.display = 'none'} />
                        <div>
                            <h1 className="text-xl font-bold tracking-widest uppercase">PT. MITRA ABADI MAHAKAM</h1>
                            <h2 className="text-sm font-semibold text-gray-700 tracking-wider">ANALISA BIAYA REPAIR (ABR)</h2>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div className="grid grid-cols-3 gap-4 mb-6 text-black">
                        <div className="info-box bg-white">
                            <div className="info-title">INFORMASI DOKUMEN</div>
                            <div className="info-row"><div className="info-label">NO ABR</div><div>:</div><div className="info-val"><input type="text" value={data.no_abr} readOnly className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                            <div className="info-row"><div className="info-label">NO WO</div><div>:</div><div className="info-val"><input type="text" value={data.no_wo} onChange={e=>setData({...data, no_wo: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" placeholder="Ketik No WO..." /></div></div>
                            <div className="info-row"><div className="info-label">Tanggal</div><div>:</div><div className="info-val"><input type="date" value={data.tanggal} onChange={e=>setData({...data, tanggal: e.target.value})} className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                            <div className="info-row">
                                <div className="info-label">Code Unit</div><div>:</div>
                                <div className="info-val flex items-center gap-1">
                                    <select value={isManualUnit ? 'manual' : data.unit_id} onChange={e => {
                                        if (e.target.value === 'manual') {
                                            setIsManualUnit(true); setData({...data, unit_id: ''});
                                        } else {
                                            setIsManualUnit(false); setData({...data, unit_id: e.target.value});
                                        }
                                    }} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0 cursor-pointer">
                                        <option value="">Pilih</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.code_unit}</option>)}
                                        <option value="manual">Manual</option>
                                    </select>
                                    {isManualUnit && <input type="text" value={data.manual_unit_code} onChange={e=>setData({...data, manual_unit_code: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" placeholder="Ketik..." />}
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-box bg-white">
                            <div className="info-title">SPESIFIKASI UNIT</div>
                            <div className="info-row">
                                <div className="info-label">Unit Type</div><div>:</div>
                                <div className="info-val">
                                    {isManualUnit ? <input type="text" value={data.manual_unit_model} onChange={e=>setData({...data, manual_unit_model: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /> : (selectedUnit?.model || '-')}
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Serial No.</div><div>:</div>
                                <div className="info-val">
                                    {isManualUnit ? <input type="text" value={data.manual_sn_chassis} onChange={e=>setData({...data, manual_sn_chassis: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /> : (selectedUnit?.sn_chassis || '-')}
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Model Engine</div><div>:</div>
                                <div className="info-val">
                                    {isManualUnit ? <input type="text" value={data.manual_engine_model} onChange={e=>setData({...data, manual_engine_model: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /> : (selectedUnit?.engine_model || '-')}
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Engine No.</div><div>:</div>
                                <div className="info-val">
                                    {isManualUnit ? <input type="text" value={data.manual_sn_engine} onChange={e=>setData({...data, manual_sn_engine: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /> : (selectedUnit?.sn_engine || '-')}
                                </div>
                            </div>
                        </div>

                        <div className="info-box bg-white">
                            <div className="info-title">LOKASI & INSPEKSI</div>
                            <div className="info-row"><div className="info-label">Lokasi / Site</div><div>:</div><div className="info-val"><input type="text" value={data.lokasi_site} onChange={e=>setData({...data, lokasi_site: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                            <div className="info-row"><div className="info-label">Lokasi Repair</div><div>:</div><div className="info-val"><input type="text" value={data.lokasi_perbaikan} onChange={e=>setData({...data, lokasi_perbaikan: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                            <div className="info-row"><div className="info-label">HM</div><div>:</div><div className="info-val"><input type="text" value={data.hm} onChange={e=>setData({...data, hm: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                            <div className="info-row"><div className="info-label">Inspected By</div><div>:</div><div className="info-val"><input type="text" value={data.inspected_by} onChange={e=>setData({...data, inspected_by: e.target.value})} className="w-full bg-transparent border-b border-gray-300 p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
                        </div>
                    </div>

                    {/* Incident Description */}
                    <div className="mb-6 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 text-black">
                        <div className="bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 border-b border-gray-300 uppercase">
                            INCIDENT DESCRIPTION
                        </div>
                        <div className="px-2 py-2">
                            <textarea 
                                value={data.incident_description} 
                                onChange={e=>setData({...data, incident_description: e.target.value})} 
                                className="w-full bg-transparent border-none outline-none focus:ring-0 p-2 text-sm text-gray-800 resize-none min-h-[50px]"
                                placeholder="Ketik deskripsi incident disini..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="text-black">
                        <TableSection 
                            title="List Cost Repair (Property Damage)" 
                            num="1" 
                            category="repair" 
                            defaults={{ satuan: 'Set' }} 
                            items={repairItems} 
                            setItems={setRepairItems} 
                            hasPartNumber={true} 
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            onItemChange={handleItemChange}
                        />
                        <TableSection 
                            title="Manpower Cost" 
                            num="2" 
                            category="manpower" 
                            defaults={{}} 
                            items={manpowerItems} 
                            setItems={setManpowerItems} 
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            onItemChange={handleItemChange}
                        />
                        <TableSection 
                            title="List Cost Spare Part" 
                            num="3" 
                            category="sparepart" 
                            defaults={{ satuan: 'Pcs' }} 
                            items={sparepartItems} 
                            setItems={setSparepartItems} 
                            hasPartNumber={true} 
                            satuanLabel="MR" 
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            onItemChange={handleItemChange}
                        />
                        <TableSection 
                            title="List Biaya Evakuasi Unit" 
                            num="4" 
                            category="evakuasi" 
                            defaults={{}} 
                            items={evakuasiItems} 
                            setItems={setEvakuasiItems} 
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            onItemChange={handleItemChange}
                        />
                        <TableSection 
                            title="List Cost Disassembly, Assembly & Akomodasi" 
                            num="5" 
                            category="disassembly" 
                            defaults={{}} 
                            items={disassemblyItems} 
                            setItems={setDisassemblyItems} 
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            onItemChange={handleItemChange}
                        />
                    </div>

                    <table className="abr-table mt-6 text-black">
                        <thead>
                            <tr>
                                <th className="py-3 uppercase">TOTAL BIAYA (1+2+3+4+5)</th>
                                <th className="py-3 uppercase">- PPN (11%) -</th>
                                <th className="py-3 uppercase">GRAND TOTAL (TERMASUK PAJAK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center font-bold text-[14px] py-4 bg-gray-50">{formatRp(totalBiaya)}</td>
                                <td className="text-center font-bold text-[14px] py-4 bg-gray-50">{formatRp(taxAmount)}</td>
                                <td className="text-center font-bold text-[14px] py-4 bg-gray-50">{formatRp(grandTotal)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Signatures Settings */}
                    <div className="mt-8 grid grid-cols-4 gap-4 bg-gray-100 p-4 border border-gray-300 rounded-lg">
                        <div className="text-sm">
                            <label className="font-bold block mb-1 text-gray-700">Dibuat Oleh</label>
                            <input type="text" value={data.dibuat_oleh} onChange={e=>setData({...data, dibuat_oleh: e.target.value})} className="w-full p-1.5 border rounded text-xs mb-1.5 !bg-white !border-gray-300 text-gray-900" />
                            <input type="text" value={data.dibuat_jabatan} onChange={e=>setData({...data, dibuat_jabatan: e.target.value})} className="w-full p-1.5 border rounded text-xs !bg-white !border-gray-300 text-gray-900" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1 text-gray-700">Checked By</label>
                            <input type="text" value={data.checked_by} onChange={e=>setData({...data, checked_by: e.target.value})} className="w-full p-1.5 border rounded text-xs mb-1.5 !bg-white !border-gray-300 text-gray-900" />
                            <input type="text" value={data.checked_jabatan} onChange={e=>setData({...data, checked_jabatan: e.target.value})} className="w-full p-1.5 border rounded text-xs !bg-white !border-gray-300 text-gray-900" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1 text-gray-700">Disetujui Oleh</label>
                            <input type="text" value={data.disetujui_oleh} onChange={e=>setData({...data, disetujui_oleh: e.target.value})} className="w-full p-1.5 border rounded text-xs mb-1.5 !bg-white !border-gray-300 text-gray-900" />
                            <input type="text" value={data.disetujui_jabatan} onChange={e=>setData({...data, disetujui_jabatan: e.target.value})} className="w-full p-1.5 border rounded text-xs !bg-white !border-gray-300 text-gray-900" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1 text-gray-700">Diketahui Oleh</label>
                            <input type="text" value={data.diketahui_oleh} onChange={e=>setData({...data, diketahui_oleh: e.target.value})} className="w-full p-1.5 border rounded text-xs mb-1.5 !bg-white !border-gray-300 text-gray-900" />
                            <input type="text" value={data.diketahui_jabatan} onChange={e=>setData({...data, diketahui_jabatan: e.target.value})} className="w-full p-1.5 border rounded text-xs !bg-white !border-gray-300 text-gray-900" />
                        </div>
                    </div>

                    <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-6">
                        <h3 className="font-bold text-[14px] mb-4 text-center">LAMPIRAN DOKUMENTASI</h3>
                        <div className="mb-4">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        
                        {imagePreviews.length > 0 && (
                            <div className={imagePreviews.length === 1 ? "max-w-md mx-auto" : "grid grid-cols-2 md:grid-cols-4 gap-4"}>
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative border rounded p-1.5 bg-gray-50 flex items-center justify-center">
                                        <img src={preview} alt="Preview" className={`rounded ${imagePreviews.length === 1 ? 'w-auto max-h-80 object-contain mx-auto' : 'w-full h-32 object-cover'}`} />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
