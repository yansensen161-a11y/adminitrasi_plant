import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const TABS = [
    { key: 'inventory', label: '📦 Inventory', color: 'blue' },
    { key: 'borrow',    label: '🔧 Peminjaman', color: 'orange' },
    { key: 'inspection',label: '🔍 Inspeksi', color: 'purple' },
    { key: 'order',     label: '🛒 Orderan', color: 'green' },
    { key: 'scrap',     label: '🗑️ Scrap', color: 'red' },
    { key: 'gatepass',  label: '🪪 Gate Pass', color: 'indigo' },
];

const TAB_COLOR = {
    blue:   { active: 'bg-blue-600 text-white', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
    orange: { active: 'bg-orange-500 text-white', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-400' },
    purple: { active: 'bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-400' },
    green:  { active: 'bg-green-600 text-white', badge: 'bg-green-100 text-green-700', border: 'border-green-400' },
    red:    { active: 'bg-red-600 text-white', badge: 'bg-red-100 text-red-700', border: 'border-red-400' },
    indigo: { active: 'bg-indigo-600 text-white', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-400' },
};

function StatusBadge({ status, condition }) {
    const val = status || condition || '';
    const map = {
        AVAILABLE: 'bg-green-100 text-green-700', BORROWED: 'bg-orange-100 text-orange-700',
        MAINTENANCE: 'bg-yellow-100 text-yellow-700', SCRAP: 'bg-red-100 text-red-700',
        GOOD: 'bg-green-100 text-green-700', DAMAGE: 'bg-orange-100 text-orange-700',
        RETURNED: 'bg-gray-100 text-gray-600', OVERDUE: 'bg-red-100 text-red-700',
        LOST: 'bg-red-200 text-red-800', REQUESTED: 'bg-blue-100 text-blue-700',
        APPROVED: 'bg-green-100 text-green-700', ORDERED: 'bg-indigo-100 text-indigo-700',
        RECEIVED: 'bg-green-200 text-green-800', CANCELLED: 'bg-gray-100 text-gray-500',
        DRAFT: 'bg-gray-100 text-gray-500', PENDING: 'bg-yellow-100 text-yellow-700',
        REJECTED: 'bg-red-100 text-red-700', COMPLETED: 'bg-green-100 text-green-700',
        OUT: 'bg-orange-100 text-orange-700', IN: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${map[val] || 'bg-gray-100 text-gray-600'}`}>{val}</span>;
}

function Modal({ title, show, onClose, children, maxWidth = 'max-w-xl' }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100`}>
                <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                    <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition text-xl font-bold">×</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function FormGroup({ label, children, error }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white";

// ─── Image Upload component ────────────────────────────────────────────────────
function ImageUpload({ value, onChange, existing }) {
    const [preview, setPreview] = useState(existing ? `/storage/${existing}` : null);
    const ref = React.useRef();

    const handle = (file) => {
        if (!file) return;
        onChange(file);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        handle(e.dataTransfer.files[0]);
    };

    return (
        <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => ref.current.click()}
            className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition group"
            style={{ minHeight: 120 }}
        >
            <input ref={ref} type="file" accept="image/*" className="hidden"
                onChange={e => handle(e.target.files[0])} />
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="preview" className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-white text-sm font-bold bg-black/60 px-3 py-1 rounded-lg">Ganti Gambar</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-gray-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">Klik atau drag foto tool</span>
                    <span className="text-[10px] text-gray-300">JPG, PNG, WebP — max 4MB</span>
                </div>
            )}
        </div>
    );
}

// ─── TAB: INVENTORY ───────────────────────────────────────────────────────────
function InventoryTab({ tools, categories, stats, nextAssetNo }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [search, setSearch] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm({
        tool_code: nextAssetNo || '', name: '', brand: '', category: '', specifications: '',
        location: '', condition: 'GOOD', qty: 1, purchase_date: '', purchase_price: '',
        notes: '', image: null, _method: 'post'
    });

    const handleEdit = (t) => {
        setEditId(t.id);
        setData({
            tool_code: t.tool_code || '',
            name: t.name || '',
            brand: t.brand || '',
            category: t.category || '',
            specifications: t.specifications || '',
            location: t.location || '',
            condition: t.condition || 'GOOD',
            qty: t.qty || 1,
            purchase_date: t.purchase_date ? t.purchase_date.split('T')[0] : '',
            purchase_price: t.purchase_price || '',
            notes: t.notes || '',
            image: null,
            _method: 'put'
        });
        setShowAdd(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const routeName = editId ? route('toolroom.tools.update', editId) : route('toolroom.tools.store');
        post(routeName, {
            forceFormData: true,
            onSuccess: () => { 
                setShowAdd(false); 
                setEditId(null);
                reset(); 
                setData('tool_code', nextAssetNo || ''); 
                setData('_method', 'post');
            }
        });
    };

    const filtered = (tools.data || []).filter(t =>
        !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.tool_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
                <div className="flex gap-2">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari Asset No / nama tool..." className={`${inputClass} w-64`} />
                    <button onClick={() => setShowInfo(true)} className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-200">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Info Kategori
                    </button>
                </div>
                <button onClick={() => { setEditId(null); reset(); setData('tool_code', nextAssetNo || ''); setData('_method', 'post'); setShowAdd(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow">
                    + Tambah Tool
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3 w-16">Foto</th>
                            <th className="px-4 py-3">Asset No</th>
                            <th className="px-4 py-3">Nama Tool</th>
                            <th className="px-4 py-3">Brand</th>
                            <th className="px-4 py-3">Kategori</th>
                            <th className="px-4 py-3">Lokasi</th>
                            <th className="px-4 py-3">Qty</th>
                            <th className="px-4 py-3">Kondisi</th>
                            <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Belum ada data tool.</td></tr>
                        ) : filtered.map(t => (
                            <tr key={t.id} onDoubleClick={() => handleEdit(t)} className="hover:bg-blue-50/40 transition cursor-pointer">
                                <td className="px-3 py-2">
                                    {t.image ? (
                                        <img src={`/storage/${t.image}`} alt={t.name}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{t.tool_code}</td>
                                <td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
                                <td className="px-4 py-3 text-gray-600">{t.brand || '-'}</td>
                                <td className="px-4 py-3">
                                    {t.category && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">{t.category}</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{t.location || '-'}</td>
                                <td className="px-4 py-3 font-bold text-center">{t.qty}</td>
                                <td className="px-4 py-3"><StatusBadge condition={t.condition} /></td>
                                <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal title={editId ? "Edit Tool" : "Tambah Tool Baru"} show={showAdd} onClose={() => { setShowAdd(false); setEditId(null); reset(); }}>
                <form onSubmit={submit} className="space-y-3">
                    {/* Image Upload */}
                    <FormGroup label="Foto Tool" error={errors.image}>
                        <ImageUpload value={data.image} onChange={f => setData('image', f)} />
                    </FormGroup>
                    <div className="grid grid-cols-2 gap-3">
                        <FormGroup label="Asset No *" error={errors.tool_code}>
                            <input className={`${inputClass} bg-gray-100 cursor-not-allowed font-bold text-gray-600`} value={data.tool_code} readOnly placeholder="Otomatis" required />
                        </FormGroup>
                        <FormGroup label="Nama Tool *" error={errors.name}>
                            <input className={inputClass} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Kunci Torsi 1/2 inch" required />
                        </FormGroup>
                        <FormGroup label="Brand">
                            <input className={inputClass} value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Stanley, Tekiro, ..." />
                        </FormGroup>
                        <FormGroup label="Kategori">
                            <input className={inputClass} value={data.category} onChange={e => setData('category', e.target.value)} placeholder="HAND TOOLS, POWER TOOLS..." list="catList" />
                            <datalist id="catList">
                                {(categories || []).map(c => <option key={c} value={c} />)}
                                <option value="HAND TOOLS" /><option value="POWER TOOLS" /><option value="SPECIAL TOOLS" /><option value="MEASURING TOOLS" /><option value="LIFTING TOOLS" /><option value="ELECTRICAL TOOLS" /><option value="WELDING TOOLS" />
                            </datalist>
                        </FormGroup>
                        <FormGroup label="Spesifikasi">
                            <input className={inputClass} value={data.specifications} onChange={e => setData('specifications', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Lokasi Penyimpanan">
                            <input className={inputClass} value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Lemari A, Rak B1..." />
                        </FormGroup>
                        <FormGroup label="Qty">
                            <input className={inputClass} type="number" min="1" value={data.qty} onChange={e => setData('qty', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Kondisi">
                            <select className={selectClass} value={data.condition} onChange={e => setData('condition', e.target.value)}>
                                <option value="GOOD">GOOD</option>
                                <option value="DAMAGE">DAMAGE</option>
                            </select>
                        </FormGroup>
                        <FormGroup label="Tanggal Beli">
                            <input className={inputClass} type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Harga Beli">
                            <input className={inputClass} type="number" value={data.purchase_price} onChange={e => setData('purchase_price', e.target.value)} />
                        </FormGroup>
                    </div>
                    <FormGroup label="Catatan">
                        <textarea className={inputClass} rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                    </FormGroup>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button type="button" onClick={() => { setShowAdd(false); reset(); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">Simpan Tool</button>
                    </div>
                </form>
            </Modal>

            <Modal title="Informasi Kategori Tool" show={showInfo} onClose={() => setShowInfo(false)}>
                <div className="space-y-4 text-sm text-gray-600 p-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">1. HAND TOOLS</h4>
                        <p className="mt-1">Alat-alat dasar yang dioperasikan manual. <br/><strong>Contoh:</strong> Combination Wrench, Ring Wrench, Socket, Ratchet, Screwdriver, Pliers, Hammer, Torque Wrench.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">2. POWER TOOLS</h4>
                        <p className="mt-1">Alat-alat bertenaga (listrik/baterai/angin). <br/><strong>Contoh:</strong> Impact Wrench, Electric Grinder, Drill, Battery Impact, Cutting Machine.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">3. SPECIAL TOOLS</h4>
                        <p className="mt-1">Alat khusus untuk pekerjaan tertentu. <br/><strong>Contoh:</strong> Puller, Hydraulic Jack, Hydraulic Torque, Injector Puller, Bearing Puller, Engine Special Tool, Transmission Special Tool.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">4. MEASURING TOOLS</h4>
                        <p className="mt-1">Alat presisi untuk mengukur. <br/><strong>Contoh:</strong> Vernier Caliper, Micrometer, Dial Gauge, Multimeter, Pressure Gauge, Temperature Gauge.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">5. LIFTING TOOLS</h4>
                        <p className="mt-1">Peralatan untuk mengangkat benda berat. <br/><strong>Contoh:</strong> Chain Block, Lever Block, Sling, Shackle, Lifting Jack.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">6. ELECTRICAL TOOLS</h4>
                        <p className="mt-1">Alat diagnostik sistem kelistrikan. <br/><strong>Contoh:</strong> Multimeter, Clamp Meter, Test Pen, Battery Tester, Insulation Tester.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">7. WELDING TOOLS</h4>
                        <p className="mt-1">Perlengkapan untuk pengelasan. <br/><strong>Contoh:</strong> Welding Cable, Gas Regulator.</p>
                    </div>
                    <div className="flex justify-end pt-3 border-t mt-4">
                        <button onClick={() => setShowInfo(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Tutup</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ─── TAB: PEMINJAMAN ──────────────────────────────────────────────────────────
function BorrowTab({ transactions, tools }) {
    const { manpowerList = [] } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const [showReturn, setShowReturn] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        tool_id: '', mechanic_name: '', mechanic_badge: '',
        borrow_date: new Date().toISOString().split('T')[0],
        expected_return_date: '', purpose: '', approved_by: '', notes: ''
    });
    const returnForm = useForm({ return_date: new Date().toISOString().split('T')[0], returned_condition: 'GOOD', notes: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('toolroom.borrow.store'), { onSuccess: () => { setShowAdd(false); reset(); } });
    };

    const doReturn = (e) => {
        e.preventDefault();
        returnForm.post(route('toolroom.borrow.return', showReturn.id), {
            onSuccess: () => { setShowReturn(null); returnForm.reset(); }
        });
    };

    const available = (tools?.data || []).filter(t => t.status === 'AVAILABLE');

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <div className="text-sm text-gray-500">{transactions?.length || 0} transaksi tercatat</div>
                <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow">
                    + Pinjam Tool
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">No. Transaksi</th>
                            <th className="px-4 py-3">Tool</th>
                            <th className="px-4 py-3">Mekanik (NRP)</th>
                            <th className="px-4 py-3">Nama Peminjam</th>
                            <th className="px-4 py-3">Tgl Pinjam</th>
                            <th className="px-4 py-3">Tgl Kembali</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(transactions || []).length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Belum ada transaksi peminjaman.</td></tr>
                        ) : transactions.map(trx => (
                            <tr key={trx.id} className="hover:bg-orange-50/40 transition">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-orange-700">{trx.transaction_code}</td>
                                <td className="px-4 py-3 font-semibold">{trx.tool?.name || '-'}</td>
                                <td className="px-4 py-3 font-mono text-xs">{trx.mechanic_badge || '-'}</td>
                                <td className="px-4 py-3 font-semibold text-gray-900">{trx.mechanic_name}</td>
                                <td className="px-4 py-3 text-xs">{trx.borrow_date}</td>
                                <td className="px-4 py-3 text-xs">{trx.return_date || <span className="text-orange-500 font-bold">{trx.expected_return_date || 'Belum'}</span>}</td>
                                <td className="px-4 py-3 text-center"><StatusBadge status={trx.status} /></td>
                                <td className="px-4 py-3 text-center">
                                    {trx.status === 'BORROWED' && (
                                        <button onClick={() => setShowReturn(trx)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">Kembalikan</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal title="Form Peminjaman Tool" show={showAdd} onClose={() => { setShowAdd(false); reset(); }}>
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <FormGroup label="Pilih Tool *" error={errors.tool_id}>
                                <select className={selectClass} value={data.tool_id} onChange={e => setData('tool_id', e.target.value)} required>
                                    <option value="">— Pilih Tool Available —</option>
                                    {available.map(t => <option key={t.id} value={t.id}>{t.tool_code} — {t.name}</option>)}
                                </select>
                            </FormGroup>
                        </div>
                        <FormGroup label="Nama Peminjam *" error={errors.mechanic_name}>
                            <select 
                                className={selectClass} 
                                value={data.mechanic_name} 
                                onChange={e => {
                                    const val = e.target.value;
                                    const found = (manpowerList || []).find(m => m.nama === val);
                                    setData(prev => ({
                                        ...prev,
                                        mechanic_name: val,
                                        mechanic_badge: found?.nrp || prev.mechanic_badge || ''
                                    }));
                                }} 
                                required
                            >
                                <option value="">— Pilih Mekanik / Manpower —</option>
                                {(manpowerList || []).map(mp => (
                                    <option key={mp.id} value={mp.nama}>
                                        {mp.nama} {mp.nrp ? `(${mp.nrp})` : ''} {mp.bagian ? `- ${mp.bagian}` : ''}
                                    </option>
                                ))}
                                {data.mechanic_name && !manpowerList?.some(mp => mp.nama === data.mechanic_name) && (
                                    <option value={data.mechanic_name}>{data.mechanic_name}</option>
                                )}
                            </select>
                        </FormGroup>
                        <FormGroup label="NRP" error={errors.mechanic_badge}>
                            <input className={inputClass} value={data.mechanic_badge} onChange={e => setData('mechanic_badge', e.target.value)} placeholder="Terisi otomatis..." />
                        </FormGroup>
                        <FormGroup label="Tgl. Pinjam *">
                            <input className={inputClass} type="date" value={data.borrow_date} onChange={e => setData('borrow_date', e.target.value)} required />
                        </FormGroup>
                        <FormGroup label="Tgl. Kembali (Rencana)">
                            <input className={inputClass} type="date" value={data.expected_return_date} onChange={e => setData('expected_return_date', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Disetujui Oleh">
                            <input className={inputClass} value={data.approved_by} onChange={e => setData('approved_by', e.target.value)} />
                        </FormGroup>
                    </div>
                    <FormGroup label="Tujuan Peminjaman">
                        <textarea className={inputClass} rows="2" value={data.purpose} onChange={e => setData('purpose', e.target.value)} />
                    </FormGroup>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button type="button" onClick={() => { setShowAdd(false); reset(); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold disabled:opacity-50">Pinjam</button>
                    </div>
                </form>
            </Modal>

            <Modal title="Form Pengembalian Tool" show={!!showReturn} onClose={() => setShowReturn(null)}>
                {showReturn && (
                    <form onSubmit={doReturn} className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm mb-2">
                            <strong>{showReturn.tool?.name}</strong> — dipinjam oleh <strong>{showReturn.mechanic_name}</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormGroup label="Tanggal Kembali *">
                                <input className={inputClass} type="date" value={returnForm.data.return_date} onChange={e => returnForm.setData('return_date', e.target.value)} required />
                            </FormGroup>
                            <FormGroup label="Kondisi Kembali *">
                                <select className={selectClass} value={returnForm.data.returned_condition} onChange={e => returnForm.setData('returned_condition', e.target.value)} required>
                                    <option value="GOOD">GOOD — Kondisi Baik</option>
                                    <option value="DAMAGE">DAMAGE — Ada Kerusakan</option>
                                </select>
                            </FormGroup>
                        </div>
                        <FormGroup label="Catatan">
                            <textarea className={inputClass} rows="2" value={returnForm.data.notes} onChange={e => returnForm.setData('notes', e.target.value)} />
                        </FormGroup>
                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button type="button" onClick={() => setShowReturn(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                            <button type="submit" disabled={returnForm.processing} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">Konfirmasi Kembali</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

// ─── TAB: INSPEKSI ────────────────────────────────────────────────────────────
function InspectionTab({ inspections, tools, onNavigate }) {
    const [showAdd, setShowAdd] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        tool_id: '', inspection_date: new Date().toISOString().split('T')[0],
        inspector_name: '', condition: 'GOOD', calibration_status: '',
        calibration_due_date: '', findings: '', action_taken: '', notes: '', attachment: null
    });
    const submit = (e) => {
        e.preventDefault();
        post(route('toolroom.inspections.store'), { forceFormData: true, onSuccess: () => { setShowAdd(false); reset(); } });
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <div className="text-sm text-gray-500">{inspections?.length || 0} catatan inspeksi</div>
                <button onClick={() => setShowAdd(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow">
                    + Tambah Inspeksi
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">Tool</th>
                            <th className="px-4 py-3">Inspektor</th>
                            <th className="px-4 py-3">Kondisi</th>
                            <th className="px-4 py-3">Kalibrasi</th>
                            <th className="px-4 py-3">Temuan</th>
                            <th className="px-4 py-3">Lampiran</th>
                            <th className="px-4 py-3">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(inspections || []).length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Belum ada catatan inspeksi.</td></tr>
                        ) : inspections.map(i => (
                            <tr key={i.id} className="hover:bg-purple-50/40 transition">
                                <td className="px-4 py-3 text-xs">{i.inspection_date}</td>
                                <td className="px-4 py-3 font-semibold">{i.tool?.name || '-'}</td>
                                <td className="px-4 py-3">{i.inspector_name}</td>
                                <td className="px-4 py-3"><StatusBadge condition={i.condition} /></td>
                                <td className="px-4 py-3 text-xs">{i.calibration_status || '-'}</td>
                                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{i.findings || '-'}</td>
                                <td className="px-4 py-3">
                                    {i.attachment ? (
                                        <a href={`/storage/${i.attachment}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                            Lihat Foto
                                        </a>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">
                                    <div>{i.action_taken || '-'}</div>
                                    {i.action_taken && (
                                        <div className="mt-2">
                                            <button onClick={() => onNavigate('order')} className="text-pink-600 hover:underline flex items-center gap-1 font-bold text-[10px] uppercase">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                Order Pengganti
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal title="Form Inspeksi Tool" show={showAdd} onClose={() => { setShowAdd(false); reset(); }} maxWidth="max-w-3xl">
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <FormGroup label="Pilih Tool *" error={errors.tool_id}>
                                <select className={selectClass} value={data.tool_id} onChange={e => setData('tool_id', e.target.value)} required>
                                    <option value="">— Pilih Tool —</option>
                                    {(tools?.data || []).map(t => <option key={t.id} value={t.id}>{t.tool_code} — {t.name}</option>)}
                                </select>
                            </FormGroup>
                        </div>
                        <FormGroup label="Tanggal Inspeksi *">
                            <input className={inputClass} type="date" value={data.inspection_date} onChange={e => setData('inspection_date', e.target.value)} required />
                        </FormGroup>
                        <FormGroup label="Nama Inspektor *">
                            <input className={inputClass} value={data.inspector_name} onChange={e => setData('inspector_name', e.target.value)} required />
                        </FormGroup>
                        <FormGroup label="Hasil Kondisi *">
                            <select className={selectClass} value={data.condition} onChange={e => setData('condition', e.target.value)}>
                                <option value="GOOD">GOOD</option><option value="DAMAGE">DAMAGE</option><option value="SCRAP">SCRAP</option>
                            </select>
                        </FormGroup>
                        <FormGroup label="Status Kalibrasi">
                            <select className={selectClass} value={data.calibration_status} onChange={e => setData('calibration_status', e.target.value)}>
                                <option value="">—</option><option value="VALID">VALID</option><option value="EXPIRED">EXPIRED</option><option value="NOT_REQUIRED">TIDAK DIPERLUKAN</option>
                            </select>
                        </FormGroup>
                        <FormGroup label="Tgl. Kalibrasi Berikutnya">
                            <input className={inputClass} type="date" value={data.calibration_due_date} onChange={e => setData('calibration_due_date', e.target.value)} />
                        </FormGroup>
                    </div>
                    <FormGroup label="Temuan" error={errors.findings}>
                        <textarea className={inputClass} rows="2" value={data.findings} onChange={e => setData('findings', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Foto Temuan (Opsional)" error={errors.attachment}>
                        <input className={inputClass} type="file" accept="image/*" onChange={e => setData('attachment', e.target.files[0])} />
                    </FormGroup>
                    <FormGroup label="Tindakan">
                        <div className="flex gap-2 mb-2">
                            <button type="button" onClick={() => setData('action_taken', 'REPAIR')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${data.action_taken === 'REPAIR' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                🔧 REPAIR
                            </button>
                            <button type="button" onClick={() => {
                                setData('action_taken', 'ORDER NEW');
                                window.open('/monitoring-orderan/create', '_blank');
                            }} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${data.action_taken === 'ORDER NEW' ? 'bg-pink-100 border-pink-500 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                🛒 ORDER NEW
                            </button>
                        </div>
                        <textarea className={inputClass} rows="2" value={data.action_taken} onChange={e => setData('action_taken', e.target.value)} placeholder="Atau ketik rincian tindakan di sini..." />
                    </FormGroup>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button type="button" onClick={() => { setShowAdd(false); reset(); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">Simpan Inspeksi</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// ─── TAB: ORDERAN ─────────────────────────────────────────────────────────────
function OrderTab({ orders }) {
    // Flatten orders to get a list of all parts ordered
    const allOrderedParts = (orders || []).flatMap(o => 
        (o.parts || []).map(p => ({ ...p, order: o }))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <div className="text-sm text-gray-500">{allOrderedParts.length} item orderan tool</div>
                <Link href="/monitoring-orderan/create?unit_id=TOOL" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow flex items-center gap-2">
                    <span>+</span> Buat Orderan
                </Link>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">No. Order</th>
                            <th className="px-4 py-3">Nama Tool / Part No</th>
                            <th className="px-4 py-3">Qty</th>
                            <th className="px-4 py-3">PR No.</th>
                            <th className="px-4 py-3">Vendor (PO)</th>
                            <th className="px-4 py-3">ETA</th>
                            <th className="px-4 py-3">Diminta oleh</th>
                            <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allOrderedParts.length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Belum ada orderan.</td></tr>
                        ) : allOrderedParts.map((p, idx) => (
                            <tr key={`${p.order.id}-${idx}`} className="hover:bg-green-50/40 transition">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-green-700">{p.order.no_order}</td>
                                <td className="px-4 py-3 font-semibold">
                                    {p.department !== '-' ? p.department : (p.part_number !== '-' ? p.part_number : 'N/A')}
                                    <br />
                                    <span className="text-xs text-gray-400">{p.part_number !== '-' ? p.part_number : ''}</span>
                                </td>
                                <td className="px-4 py-3">{p.qty || 1} Pcs</td>
                                <td className="px-4 py-3 text-xs">{p.pr || '-'}</td>
                                <td className="px-4 py-3 text-xs">{p.po || '-'}</td>
                                <td className="px-4 py-3 text-xs">{p.due_date_part || '-'}</td>
                                <td className="px-4 py-3 text-xs">{p.order.pic || '-'}</td>
                                <td className="px-4 py-3 text-center"><StatusBadge status={p.order.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── TAB: SCRAP ───────────────────────────────────────────────────────────────
function ScrapTab({ scrapped }) {
    return (
        <div>
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠️ Tools berikut sudah di-scrap dan tidak dapat digunakan kembali. Total: <strong>{scrapped?.length || 0} item</strong>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-red-50 border-b text-xs uppercase text-red-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">Kode</th>
                            <th className="px-4 py-3">Nama Tool</th>
                            <th className="px-4 py-3">Brand</th>
                            <th className="px-4 py-3">Kategori</th>
                            <th className="px-4 py-3">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(scrapped || []).length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Tidak ada tool yang di-scrap.</td></tr>
                        ) : scrapped.map(t => (
                            <tr key={t.id} className="opacity-70">
                                <td className="px-4 py-3 font-mono text-xs text-red-600 font-bold">{t.tool_code}</td>
                                <td className="px-4 py-3 font-semibold line-through">{t.name}</td>
                                <td className="px-4 py-3 text-gray-500">{t.brand || '-'}</td>
                                <td className="px-4 py-3 text-gray-500">{t.category || '-'}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{t.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── TAB: GATE PASS ───────────────────────────────────────────────────────────
function GatePassTab({ gatePasses, tools }) {
    const { manpowerList = [] } = usePage().props;
    const [showAdd, setShowAdd] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        tool_id: '', type: 'OUT', date: new Date().toISOString().split('T')[0],
        pic: '', destination: '', reason: '', return_date: '', notes: ''
    });
    const submit = (e) => {
        e.preventDefault();
        post(route('toolroom.gate-passes.store'), { onSuccess: () => { setShowAdd(false); reset(); } });
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <div className="text-sm text-gray-500">{gatePasses?.length || 0} gate pass terdaftar</div>
                <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow">
                    + Buat Gate Pass
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">No. Pass</th>
                            <th className="px-4 py-3 text-center">Tipe</th>
                            <th className="px-4 py-3">Tool</th>
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">PIC</th>
                            <th className="px-4 py-3">Tujuan</th>
                            <th className="px-4 py-3">Alasan</th>
                            <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(gatePasses || []).length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Belum ada gate pass.</td></tr>
                        ) : gatePasses.map(gp => (
                            <tr key={gp.id} className="hover:bg-indigo-50/40 transition">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">{gp.pass_number}</td>
                                <td className="px-4 py-3 text-center"><StatusBadge status={gp.type} /></td>
                                <td className="px-4 py-3 font-semibold">{gp.tool?.name || '-'}</td>
                                <td className="px-4 py-3 text-xs">{gp.date}</td>
                                <td className="px-4 py-3">{gp.pic}</td>
                                <td className="px-4 py-3 text-xs">{gp.destination || '-'}</td>
                                <td className="px-4 py-3 text-xs max-w-xs truncate">{gp.reason}</td>
                                <td className="px-4 py-3 text-center"><StatusBadge status={gp.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal title="Form Gate Pass Tool" show={showAdd} onClose={() => { setShowAdd(false); reset(); }}>
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <FormGroup label="Pilih Tool *" error={errors.tool_id}>
                                <select className={selectClass} value={data.tool_id} onChange={e => setData('tool_id', e.target.value)} required>
                                    <option value="">— Pilih Tool —</option>
                                    {(tools?.data || []).map(t => <option key={t.id} value={t.id}>{t.tool_code} — {t.name}</option>)}
                                </select>
                            </FormGroup>
                        </div>
                        <FormGroup label="Tipe Pass *">
                            <select className={selectClass} value={data.type} onChange={e => setData('type', e.target.value)}>
                                <option value="OUT">OUT — Keluar Area</option>
                                <option value="IN">IN — Masuk Area</option>
                            </select>
                        </FormGroup>
                        <FormGroup label="Tanggal *">
                            <input className={inputClass} type="date" value={data.date} onChange={e => setData('date', e.target.value)} required />
                        </FormGroup>
                        <FormGroup label="PIC (Penanggung Jawab) *" error={errors.pic}>
                            <select 
                                className={selectClass} 
                                value={data.pic} 
                                onChange={e => setData('pic', e.target.value)} 
                                required
                            >
                                <option value="">— Pilih PIC / Mekanik —</option>
                                {(manpowerList || []).map(mp => (
                                    <option key={mp.id} value={mp.nama}>
                                        {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                    </option>
                                ))}
                                {data.pic && !manpowerList?.some(mp => mp.nama === data.pic) && (
                                    <option value={data.pic}>{data.pic}</option>
                                )}
                            </select>
                        </FormGroup>
                        <FormGroup label="Tujuan">
                            <input className={inputClass} value={data.destination} onChange={e => setData('destination', e.target.value)} placeholder="Workshop luar, vendor, dll." />
                        </FormGroup>
                        {data.type === 'OUT' && (
                            <FormGroup label="Tgl. Kembali">
                                <input className={inputClass} type="date" value={data.return_date} onChange={e => setData('return_date', e.target.value)} />
                            </FormGroup>
                        )}
                    </div>
                    <FormGroup label="Alasan / Keperluan *" error={errors.reason}>
                        <textarea className={inputClass} rows="2" value={data.reason} onChange={e => setData('reason', e.target.value)} required />
                    </FormGroup>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button type="button" onClick={() => { setShowAdd(false); reset(); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">Buat Gate Pass</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Index({ stats, tools, transactions, inspections, orders, gatePasses, scrapped, categories, filters, nextAssetNo }) {
    const [activeTab, setActiveTab] = useState('inventory');

    // Support ?tab=xxx from sidebar links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        if (t && TABS.find(x => x.key === t)) setActiveTab(t);
    }, []);

    const statCards = [
        { label: 'Total Tool', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
        { label: 'Tersedia', value: stats.available, color: 'text-green-700', bg: 'bg-green-50' },
        { label: 'Dipinjam', value: stats.borrowed, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Maintenance', value: stats.maintenance, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Scrap', value: stats.scrap, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Overdue Return', value: stats.overdue, color: 'text-red-700', bg: 'bg-red-100' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Tool — Toolroom" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">🛠️ Monitoring Tool</h1>
                        <p className="text-sm text-gray-500 mt-1">Inventory · Peminjaman · Inspeksi · Orderan · Scrap · Gate Pass</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {statCards.map((s, i) => (
                        <div key={i} className={`${s.bg} p-3 rounded-xl border border-white/60 shadow-sm`}>
                            <div className="text-xs font-semibold text-gray-500 mb-1">{s.label}</div>
                            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap border-b pb-3 mb-6">
                    {TABS.map(tab => {
                        const c = TAB_COLOR[tab.color];
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? c.active + ' shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'inventory'  && <InventoryTab  tools={tools} categories={categories} stats={stats} nextAssetNo={nextAssetNo} />}
                {activeTab === 'borrow'     && <BorrowTab     transactions={transactions} tools={tools} />}
                {activeTab === 'inspection' && <InspectionTab inspections={inspections} tools={tools} onNavigate={setActiveTab} />}
                {activeTab === 'order'      && <OrderTab      orders={orders} />}
                {activeTab === 'scrap'      && <ScrapTab      scrapped={scrapped} />}
                {activeTab === 'gatepass'   && <GatePassTab   gatePasses={gatePasses} tools={tools} />}
            </div>
        </AuthenticatedLayout>
    );
}
