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

export default function Create({ auth, units, no_abr }) {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isManualUnit, setIsManualUnit] = useState(false);
    
    const createEmptyRow = (category, defaults = {}) => ({
        category, part_number: '', description: '', price: 0, qty: '', satuan: '', amount: 0, ...defaults
    });

    const [repairItems, setRepairItems] = useState([createEmptyRow('repair', { satuan: 'Set' })]);
    const [manpowerItems, setManpowerItems] = useState([createEmptyRow('manpower', { qty: 2, satuan: '2', description: 'Manpower' })]);
    const [sparepartItems, setSparepartItems] = useState([createEmptyRow('sparepart', { satuan: 'Pcs' })]);
    const [evakuasiItems, setEvakuasiItems] = useState([createEmptyRow('evakuasi', { qty: 1, satuan: '1' })]);
    const [disassemblyItems, setDisassemblyItems] = useState([
        createEmptyRow('disassembly', { description: 'Akomodasi, kosumsi & transportasi man power', qty: 1, satuan: '1' }),
        createEmptyRow('disassembly', { description: 'Delivery Sparepart, Consumables & DLL', qty: 1, satuan: '1' }),
        createEmptyRow('disassembly', { description: 'Transportasi sewa LV operasional', qty: 1, satuan: '1' })
    ]);

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
        tanggal: new Date().toISOString().split('T')[0],
        unit_id: '',
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
        
        const filterEmpty = (items) => items.filter(i => i.description || i.part_number || i.price > 0);
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

        router.post(route('abr.store'), formData, { forceFormData: true });
    };

    const TableSection = ({ title, num, items, setItems, category, defaults, hasPartNumber = false, satuanLabel = 'Sat' }) => (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-1">
                <div className="font-bold text-sm">{num}. {title}</div>
                <button type="button" onClick={() => handleAddRow(category, setItems, defaults)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded shadow transition">
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
                        <tr key={idx} className="group hover:bg-gray-50">
                            <td className="text-center bg-gray-50">{idx + 1}</td>
                            {hasPartNumber && <td><input type="text" value={item.part_number} onChange={(e) => handleItemChange(setItems, idx, 'part_number', e.target.value)} className="text-center" /></td>}
                            <td><input type="text" value={item.description} onChange={(e) => handleItemChange(setItems, idx, 'description', e.target.value)} className="text-left px-1" /></td>
                            <td className="flex items-center h-full"><span className="pl-1 text-gray-400"></span><input type="text" value={item.price ? formatRp(item.price) : ''} onChange={(e) => handleItemChange(setItems, idx, 'price', e.target.value)} className="text-right pr-1" placeholder="0" /></td>
                            <td><input type="text" value={item.qty} onChange={(e) => handleItemChange(setItems, idx, 'qty', e.target.value)} className="text-center" /></td>
                            <td><input type="text" value={item.satuan} onChange={(e) => handleItemChange(setItems, idx, 'satuan', e.target.value)} className="text-center" /></td>
                            <td className="text-right pr-1 bg-gray-50">{item.amount ? formatRp(item.amount) : '0'}</td>
                            <td className="text-center">
                                <button type="button" onClick={() => handleRemoveRow(setItems, idx)} className="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition px-1" title="Hapus Baris">&times;</button>
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah ABR (Analisa Biaya Repair)</h2>
                <div className="text-sm text-gray-500">ABR / Tambah ABR</div>
            </div>}
        >
            <Head title="Tambah ABR" />

            <div className="py-8 bg-gray-200">
                <form onSubmit={handleSubmit} className="max-w-[210mm] mx-auto bg-white p-8 shadow-xl relative" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <style>
                        {`
                            .abr-table { border-collapse: collapse; width: 100%; border: 1px solid #000; font-size: 10px; }
                            .abr-table th, .abr-table td { border: 1px solid #000; padding: 0px; height: 26px; }
                            .abr-table th { font-weight: bold; text-align: center; background-color: #f9fafb; padding: 6px 4px; }
                            .abr-table input {
                                width: 100%;
                                height: 100%;
                                min-height: 24px;
                                border: none !important;
                                background: transparent !important;
                                padding: 0 4px !important;
                                margin: 0 !important;
                                box-shadow: none !important;
                                outline: none !important;
                                font-size: 10px;
                                font-family: inherit;
                                border-radius: 0 !important;
                            }
                            .abr-table input:focus {
                                box-shadow: none !important;
                                border-color: transparent !important;
                                outline: none !important;
                                ring: 0 !important;
                                background-color: #f0f9ff !important;
                            }
                            .info-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 10px; }
                            .info-title { font-weight: bold; font-size: 10px; margin-bottom: 8px; color: #374151; text-transform: uppercase; }
                            .info-row { display: flex; margin-bottom: 4px; align-items: center; }
                            .info-label { width: 80px; color: #4b5563; }
                            .info-val { font-weight: bold; flex: 1; margin-left: 4px; }
                        `}
                    </style>

                    <div className="absolute -top-12 right-0 flex gap-2">
                        <Link href={route('abr.index')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow">Batal</Link>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">Simpan Dokumen</button>
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
                            <div className="info-row"><div className="info-label">NO WO</div><div>:</div><div className="info-val"><input type="text" value={data.no_abr} readOnly className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none focus:ring-0" /></div></div>
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
                    <div className="mb-6 rounded-lg overflow-hidden border border-blue-200 bg-blue-50/50 text-black">
                        <div className="bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 border-b border-blue-200 uppercase">
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
                        <TableSection title="List Cost Repair (Property Damage)" num="1" category="repair" defaults={{ satuan: 'Set' }} items={repairItems} setItems={setRepairItems} hasPartNumber={true} />
                        <TableSection title="Manpower Cost" num="2" category="manpower" defaults={{ qty: 2, satuan: '2' }} items={manpowerItems} setItems={setManpowerItems} />
                        <TableSection title="List Cost Spare Part" num="3" category="sparepart" defaults={{ satuan: 'Pcs' }} items={sparepartItems} setItems={setSparepartItems} hasPartNumber={true} satuanLabel="MR" />
                        <TableSection title="List Biaya Evakuasi Unit" num="4" category="evakuasi" defaults={{ qty: 1, satuan: '1' }} items={evakuasiItems} setItems={setEvakuasiItems} />
                        <TableSection title="List Cost Disassembly, Assembly & Akomodasi" num="5" category="disassembly" defaults={{ qty: 1, satuan: '1' }} items={disassemblyItems} setItems={setDisassemblyItems} />
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
                    <div className="mt-8 grid grid-cols-4 gap-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                        <div className="text-sm">
                            <label className="font-bold block mb-1">Dibuat Oleh</label>
                            <input type="text" value={data.dibuat_oleh} onChange={e=>setData({...data, dibuat_oleh: e.target.value})} className="w-full p-1 border rounded text-sm mb-1 !bg-white !border-gray-300" />
                            <input type="text" value={data.dibuat_jabatan} onChange={e=>setData({...data, dibuat_jabatan: e.target.value})} className="w-full p-1 border rounded text-sm !bg-white !border-gray-300" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1">Checked By</label>
                            <input type="text" value={data.checked_by} onChange={e=>setData({...data, checked_by: e.target.value})} className="w-full p-1 border rounded text-sm mb-1 !bg-white !border-gray-300" />
                            <input type="text" value={data.checked_jabatan} onChange={e=>setData({...data, checked_jabatan: e.target.value})} className="w-full p-1 border rounded text-sm !bg-white !border-gray-300" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1">Disetujui Oleh</label>
                            <input type="text" value={data.disetujui_oleh} onChange={e=>setData({...data, disetujui_oleh: e.target.value})} className="w-full p-1 border rounded text-sm mb-1 !bg-white !border-gray-300" />
                            <input type="text" value={data.disetujui_jabatan} onChange={e=>setData({...data, disetujui_jabatan: e.target.value})} className="w-full p-1 border rounded text-sm !bg-white !border-gray-300" />
                        </div>
                        <div className="text-sm">
                            <label className="font-bold block mb-1">Diketahui Oleh</label>
                            <input type="text" value={data.diketahui_oleh} onChange={e=>setData({...data, diketahui_oleh: e.target.value})} className="w-full p-1 border rounded text-sm mb-1 !bg-white !border-gray-300" />
                            <input type="text" value={data.diketahui_jabatan} onChange={e=>setData({...data, diketahui_jabatan: e.target.value})} className="w-full p-1 border rounded text-sm !bg-white !border-gray-300" />
                        </div>
                    </div>

                    <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-6">
                        <h3 className="font-bold text-[14px] mb-4 text-center">LAMPIRAN DOKUMENTASI</h3>
                        <div className="mb-4">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative border rounded p-1">
                                        <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
