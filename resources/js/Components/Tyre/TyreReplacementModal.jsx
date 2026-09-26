import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUnitTyreConfig } from '@/Pages/Tyre/UnitTyreDiagram';

export default function TyreReplacementModal({
    isOpen,
    onClose,
    unit = null,
    currentHm = 0,
    stockTyres = [],
    initialReplacements = [],
    onApply,
}) {
    if (!isOpen) return null;

    const config = getUnitTyreConfig(unit?.type_unit || '');
    const positions = config?.positions || [
        { id: 'Pos 1', name: 'Depan Kiri (FL)' },
        { id: 'Pos 2', name: 'Depan Kanan (FR)' },
        { id: 'Pos 3', name: 'Belakang Kiri Luar (RLO)' },
        { id: 'Pos 4', name: 'Belakang Kiri Dalam (RLI)' },
        { id: 'Pos 5', name: 'Belakang Kanan Dalam (RRI)' },
        { id: 'Pos 6', name: 'Belakang Kanan Luar (RRO)' },
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [existingTyres, setExistingTyres] = useState({});
    const [availableStock, setAvailableStock] = useState(stockTyres || []);
    const [selectedPos, setSelectedPos] = useState(positions[0]?.id || 'Pos 1');
    const [replacements, setReplacements] = useState(initialReplacements || []);

    // Form inputs for currently selected position
    const [sourceType, setSourceType] = useState('NEW'); // 'NEW' or 'STOCK'
    const [selectedStockId, setSelectedStockId] = useState('');
    
    // New tyre data
    const defaultSize = (() => {
        const uType = (unit?.type_unit || '').toUpperCase();
        if (uType.includes('GRADER')) return '14.00R24';
        if (uType.includes('MAINHAUL') || uType.includes('DUMP TRUCK') || uType.includes('TRUCK')) return '12.00R20';
        if (uType.includes('LV') || uType.includes('LIGHT VEHICLE')) return '265/65R17';
        return '24.00R35';
    })();

    const [newSerial, setNewSerial] = useState('');
    const [brand, setBrand] = useState('TRIANGLE');
    const [typeSize, setTypeSize] = useState(defaultSize);
    const [pattern, setPattern] = useState('TB526S');
    const [psi, setPsi] = useState('105');
    const [otd, setOtd] = useState('62');
    const [rtd, setRtd] = useState('62');
    const [notes, setNotes] = useState('');

    // Old tyre disposal
    const [oldCondition, setOldCondition] = useState('SCRAP');
    const [oldRtd, setOldRtd] = useState('');
    const [oldNotes, setOldNotes] = useState('');

    // Fetch unit's currently installed tyres
    useEffect(() => {
        if (!unit?.id) return;
        setIsLoading(true);
        axios.get(`/api/tirevault/unit/${unit.id}`)
            .then(res => {
                setExistingTyres(res.data?.tyres || {});
                if (res.data?.stock && res.data.stock.length > 0) {
                    setAvailableStock(res.data.stock);
                }
            })
            .catch(err => {
                console.error('Gagal mengambil data tyre unit:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [unit?.id]);

    // Load form when position changes
    useEffect(() => {
        const existingRep = replacements.find(r => r.position === selectedPos);
        const currentInstalled = existingTyres[selectedPos];

        if (existingRep) {
            setNewSerial(existingRep.new_serial_number || '');
            setBrand(existingRep.brand || 'TRIANGLE');
            setTypeSize(existingRep.type_size || defaultSize);
            setPattern(existingRep.pattern || 'TB526S');
            setPsi(existingRep.psi?.toString() || '105');
            setOtd(existingRep.otd || '62');
            setRtd(existingRep.rtd || '62');
            setNotes(existingRep.notes || '');
            setOldCondition(existingRep.old_condition || 'SCRAP');
            setOldRtd(existingRep.old_rtd || '');
            setOldNotes(existingRep.old_notes || '');
            setSourceType(existingRep.is_from_stock ? 'STOCK' : 'NEW');
            setSelectedStockId(existingRep.stock_tyre_id || '');
        } else {
            // Reset to defaults
            setNewSerial('');
            setBrand(currentInstalled?.brand || 'TRIANGLE');
            setTypeSize(currentInstalled?.type_size || defaultSize);
            setPattern(currentInstalled?.pattern || 'TB526S');
            setPsi(currentInstalled?.psi?.toString() || '105');
            setOtd('62');
            setRtd('62');
            setNotes('');
            setOldCondition('SCRAP');
            setOldRtd(currentInstalled?.tread_depth_current || '');
            setOldNotes('');
            setSourceType('NEW');
            setSelectedStockId('');
        }
    }, [selectedPos, existingTyres, replacements]);

    // When selecting a stock tyre
    const handleStockSelect = (stockId) => {
        setSelectedStockId(stockId);
        const item = availableStock.find(s => s.id.toString() === stockId.toString());
        if (item) {
            setNewSerial(item.serial_number);
            if (item.brand) setBrand(item.brand);
            if (item.type_size) setTypeSize(item.type_size);
            if (item.pattern) setPattern(item.pattern);
            if (item.psi) setPsi(item.psi.toString());
        }
    };

    // Save/stage replacement for selected position
    const handleStageCurrentPosition = (e) => {
        e?.preventDefault();

        if (!newSerial.trim()) {
            alert('Mohon masukkan Serial Number Ban Baru atau pilih dari Stok Gudang.');
            return;
        }

        const currentInstalled = existingTyres[selectedPos];

        const item = {
            position: selectedPos,
            new_serial_number: newSerial.trim().toUpperCase(),
            brand: brand.trim().toUpperCase(),
            type_size: typeSize.trim(),
            pattern: pattern.trim(),
            psi: parseInt(psi, 10) || 105,
            otd: otd.trim(),
            rtd: rtd.trim(),
            notes: notes.trim(),
            is_from_stock: sourceType === 'STOCK',
            stock_tyre_id: selectedStockId || null,
            old_tyre_id: currentInstalled?.id || null,
            old_serial_number: currentInstalled?.serial_number || null,
            old_condition: oldCondition,
            old_rtd: oldRtd.trim(),
            old_notes: oldNotes.trim(),
        };

        setReplacements(prev => {
            const filtered = prev.filter(r => r.position !== selectedPos);
            return [...filtered, item];
        });
    };

    // Remove staged replacement for a position
    const handleRemoveStaged = (posId) => {
        setReplacements(prev => prev.filter(r => r.position !== posId));
    };

    // Apply and close
    const handleApplyFinal = () => {
        if (replacements.length === 0) {
            // If user typed in current form but hasn't clicked "Simpan Posisi Ini", auto-stage it
            if (newSerial.trim()) {
                const currentInstalled = existingTyres[selectedPos];
                const autoItem = {
                    position: selectedPos,
                    new_serial_number: newSerial.trim().toUpperCase(),
                    brand: brand.trim().toUpperCase(),
                    type_size: typeSize.trim(),
                    pattern: pattern.trim(),
                    psi: parseInt(psi, 10) || 105,
                    otd: otd.trim(),
                    rtd: rtd.trim(),
                    notes: notes.trim(),
                    is_from_stock: sourceType === 'STOCK',
                    stock_tyre_id: selectedStockId || null,
                    old_tyre_id: currentInstalled?.id || null,
                    old_serial_number: currentInstalled?.serial_number || null,
                    old_condition: oldCondition,
                    old_rtd: oldRtd.trim(),
                    old_notes: oldNotes.trim(),
                };
                onApply([autoItem]);
                onClose();
                return;
            }
            alert('Belum ada posisi tyre yang diganti. Silakan isi form dan simpan posisi penggantian.');
            return;
        }

        onApply(replacements);
        onClose();
    };

    const currentInstalled = existingTyres[selectedPos];
    const isCurrentStaged = replacements.some(r => r.position === selectedPos);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-linear-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs text-xl">
                            🛞
                        </div>
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                Penggantian Tyre Unit (Tyre Replacement)
                                <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                                    Otomatis Sync ke /tyres
                                </span>
                            </h2>
                            <p className="text-xs text-emerald-200/80 mt-0.5">
                                Unit: <strong className="text-white">{unit?.code_unit || 'Unit Terpilih'}</strong> ({unit?.type_unit || 'Armada Roda'}) • Current HM: <strong className="text-white">{currentHm || unit?.hm || 0}</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Position Selector Bar */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            1. Pilih Posisi Roda yang Diganti ({config?.typeName || 'Armada Roda'})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {positions.map(pos => {
                                const installed = existingTyres[pos.id];
                                const staged = replacements.find(r => r.position === pos.id);
                                const isSelected = selectedPos === pos.id;

                                return (
                                    <button
                                        key={pos.id}
                                        type="button"
                                        onClick={() => setSelectedPos(pos.id)}
                                        className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between min-h-[82px] cursor-pointer ${
                                            isSelected
                                                ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                                                : staged
                                                    ? 'border-teal-400 bg-teal-50/40 hover:bg-teal-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-black ${isSelected ? 'text-emerald-800' : 'text-gray-800'}`}>
                                                {pos.id}
                                            </span>
                                            {staged && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Ada penggantian baru" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate mt-1">
                                            {pos.name.split('(')[0]}
                                        </div>
                                        <div className="text-[10px] font-semibold truncate mt-1">
                                            {staged ? (
                                                <span className="text-emerald-700 font-bold">➔ {staged.new_serial_number}</span>
                                            ) : installed ? (
                                                <span className="text-gray-600 font-medium">{installed.serial_number}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Slot Kosong</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Configuration for selected position */}
                    <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md">
                                    {selectedPos}
                                </span>
                                <h3 className="font-bold text-gray-800 text-sm">
                                    Penggantian Roda Posisi {selectedPos}
                                </h3>
                            </div>
                            {isCurrentStaged && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    ✓ Tersimpan Sementara
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ban Lama (Pelepasan) */}
                            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
                                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-3">
                                    <span>🔻 Ban Lama Yang Dicopot</span>
                                </div>

                                {currentInstalled ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Serial Number:</span>
                                                <span className="font-black text-gray-900">{currentInstalled.serial_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Brand / Size:</span>
                                                <span className="font-medium text-gray-800">{currentInstalled.brand} ({currentInstalled.type_size || '-'})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">HM Terpasang:</span>
                                                <span className="font-medium text-gray-800">{currentInstalled.installed_hm || 0} HM</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Lifetime Running:</span>
                                                <span className="font-black text-rose-600">{currentInstalled.current_lifetime || 0} Jam</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Status Ban Lama Setelah Dicopot *
                                            </label>
                                            <select
                                                value={oldCondition}
                                                onChange={(e) => setOldCondition(e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 py-2"
                                            >
                                                <option value="SCRAP">❌ SCRAP (Afkir / Rusak Total)</option>
                                                <option value="REPAIR">🔧 REPAIR (Vulkanisir / Perbaikan)</option>
                                                <option value="STOCK">📦 STOCK (Masih Layak / Simpan Gudang)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    RTD Akhir (mm)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={oldRtd}
                                                    onChange={(e) => setOldRtd(e.target.value)}
                                                    placeholder="Contoh: 15"
                                                    className="w-full text-xs rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    Alasan Pencopotan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={oldNotes}
                                                    onChange={(e) => setOldNotes(e.target.value)}
                                                    placeholder="Separasi / Aus / Pecah"
                                                    className="w-full text-xs rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 py-1.5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs">
                                        Saat ini tidak ada ban aktif yang terpasang di posisi {selectedPos}.
                                        <div className="text-[11px] text-gray-500 mt-1">Ban baru langsung akan dipasang ke slot ini.</div>
                                    </div>
                                )}
                            </div>

                            {/* Ban Baru (Pemasangan) */}
                            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                                        <span>🔺 Ban Baru Yang Dipasang</span>
                                    </span>
                                    <div className="inline-flex rounded-md p-0.5 bg-gray-100 text-[11px]">
                                        <button
                                            type="button"
                                            onClick={() => setSourceType('NEW')}
                                            className={`px-2 py-0.5 rounded font-bold transition ${sourceType === 'NEW' ? 'bg-white shadow-xs text-emerald-800' : 'text-gray-500'}`}
                                        >
                                            + Baru (New)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSourceType('STOCK')}
                                            className={`px-2 py-0.5 rounded font-bold transition ${sourceType === 'STOCK' ? 'bg-white shadow-xs text-emerald-800' : 'text-gray-500'}`}
                                        >
                                            📦 Dari Stock
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {sourceType === 'STOCK' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Pilih Ban dari Stock Gudang ({availableStock.length} ban tersedia)
                                            </label>
                                            <select
                                                value={selectedStockId}
                                                onChange={(e) => handleStockSelect(e.target.value)}
                                                className="w-full text-xs rounded-lg border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 py-2 bg-emerald-50/30"
                                            >
                                                <option value="">-- Pilih Ban Stock --</option>
                                                {availableStock.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.serial_number} — {s.brand} ({s.type_size || 'Standar'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Serial Number Ban Baru *
                                        </label>
                                        <input
                                            type="text"
                                            value={newSerial}
                                            onChange={(e) => setNewSerial(e.target.value)}
                                            placeholder="Contoh: TR-2400-088 / GT-35-102"
                                            className="w-full text-xs rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 font-bold uppercase py-2"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                                            <input
                                                type="text"
                                                value={brand}
                                                onChange={(e) => setBrand(e.target.value)}
                                                placeholder="TRIANGLE / BRIDGESTONE"
                                                className="w-full text-xs rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 py-1.5 uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Ukuran / Size</label>
                                            <input
                                                type="text"
                                                value={typeSize}
                                                onChange={(e) => setTypeSize(e.target.value)}
                                                placeholder="24.00R35 / 12.00R20"
                                                className="w-full text-xs rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 py-1.5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">Pattern</label>
                                            <input
                                                type="text"
                                                value={pattern}
                                                onChange={(e) => setPattern(e.target.value)}
                                                placeholder="TB526S"
                                                className="w-full text-xs rounded-lg border-gray-300 py-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">PSI</label>
                                            <input
                                                type="number"
                                                value={psi}
                                                onChange={(e) => setPsi(e.target.value)}
                                                placeholder="105"
                                                className="w-full text-xs rounded-lg border-gray-300 py-1.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">RTD Awal</label>
                                            <input
                                                type="text"
                                                value={rtd}
                                                onChange={(e) => setRtd(e.target.value)}
                                                placeholder="62"
                                                className="w-full text-xs rounded-lg border-gray-300 py-1.5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Tambahan</label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Contoh: Ban baru batch PO-2026-09"
                                            className="w-full text-xs rounded-lg border-gray-300 py-1.5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button Simpan Posisi Ini */}
                        <div className="mt-4 flex justify-end gap-2">
                            {isCurrentStaged && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStaged(selectedPos)}
                                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                                >
                                    Batalkan Penggantian {selectedPos}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleStageCurrentPosition}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                                <span>Simpan Posisi {selectedPos}</span>
                                <span>➔</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary of Staged Replacements */}
                    {replacements.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📋 Daftar Penggantian Siap Diterapkan ({replacements.length} Posisi)</span>
                                </h4>
                                <span className="text-[11px] text-emerald-700 font-bold">
                                    Akan otomatis membuat &amp; mengupdate di menu /tyres
                                </span>
                            </div>
                            <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-emerald-50/70 border-b border-emerald-200 text-emerald-900 font-bold">
                                        <tr>
                                            <th className="py-2.5 px-3">Posisi</th>
                                            <th className="py-2.5 px-3">Ban Lama (Dicopot)</th>
                                            <th className="py-2.5 px-3">Ban Baru (Dipasang)</th>
                                            <th className="py-2.5 px-3">Brand &amp; Size</th>
                                            <th className="py-2.5 px-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {replacements.map(r => (
                                            <tr key={r.position} className="hover:bg-gray-50/60">
                                                <td className="py-2 px-3 font-black text-gray-900">{r.position}</td>
                                                <td className="py-2 px-3 text-rose-700 font-medium">
                                                    {r.old_serial_number ? (
                                                        <span>{r.old_serial_number} <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase font-bold">{r.old_condition}</span></span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Slot Kosong</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-emerald-700 font-black">
                                                    {r.new_serial_number} {r.is_from_stock && <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">STOCK</span>}
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 font-medium">
                                                    {r.brand} ({r.type_size || '-'})
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStaged(r.position)}
                                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded"
                                                        title="Hapus"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                    >
                        Tutup / Batal
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 hidden sm:inline">
                            {replacements.length} posisi ban akan diperbarui
                        </span>
                        <button
                            type="button"
                            onClick={handleApplyFinal}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                            <span>✓ Terapkan Penggantian ke Work Order</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
