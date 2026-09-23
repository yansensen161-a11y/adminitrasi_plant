import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 25 Standard Undercarriage Components
export const DEFAULT_UC_COMPONENTS = [
    { no: 1, part_number: '14X-30-00142', name: 'Carrier Roller RHF', status: 'NEW', status_penggantian: 'NEW', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 2, part_number: '14X-30-00142', name: 'Carrier Roller RHR', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 3, part_number: '14X-30-00142', name: 'Carrier Roller LHF', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 4, part_number: '14X-30-00142', name: 'Carrier Roller LHR', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 5, part_number: '14X-27-15112', name: 'Segment RH', status: 'NEW', status_penggantian: 'NEW', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 6, part_number: '14X-27-15112', name: 'Segment LH', status: 'NEW', status_penggantian: 'NEW', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 7, part_number: '14X-30-00087', name: 'Track Roller RH 1', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 8, part_number: '14X-30-00087', name: 'Track Roller RH 2', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 9, part_number: '14X-30-00087', name: 'Track Roller RH 3', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 10, part_number: '14X-30-00087', name: 'Track Roller RH 4', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 11, part_number: '14X-30-00096', name: 'Track Roller RH 5', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 12, part_number: '14X-30-00096', name: 'Track Roller RH 6', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 13, part_number: '14X-30-00096', name: 'Track Roller RH 7', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 14, part_number: '14X-30-00087', name: 'Track Roller LH 1', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 15, part_number: '14X-30-00087', name: 'Track Roller LH 2', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 16, part_number: '14U-32-01251', name: 'Track Link RH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 17, part_number: '14U-32-01251', name: 'Track Link LH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 18, part_number: '14X-30-00087', name: 'Track Roller LH 3', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 19, part_number: '14X-30-00087', name: 'Track Roller LH 4', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 20, part_number: '14X-30-00096', name: 'Track Roller LH 5', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 21, part_number: '14X-30-00096', name: 'Track Roller LH 6', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 22, part_number: '14X-30-00096', name: 'Track Roller LH 7', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 23, part_number: '14X-30-00116', name: 'Idler LH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 24, part_number: '14X-30-00116', name: 'Idler RH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
    { no: 25, part_number: '14X-32-00100', name: 'Track Shoe / Shoe Assy', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: 'KOMATSU', remarks: 'Undercarriage Component', worn_out: '', inspection_date: '' },
];

export default function UndercarriageSelectorModal({
    isOpen,
    onClose,
    units = [],
    selectedUnitId = '',
    onUnitChange,
    onApply,
}) {
    const [currentUnitId, setCurrentUnitId] = useState(selectedUnitId || (units[0]?.id || ''));
    const [ucComponents, setUcComponents] = useState(DEFAULT_UC_COMPONENTS);
    const [selectedCompNo, setSelectedCompNo] = useState(1);
    const [searchUcComp, setSearchUcComp] = useState('');
    const [checkedCompNos, setCheckedCompNos] = useState(new Set([1]));
    const [sortConfig, setSortConfig] = useState({ key: 'no', direction: 'asc' });
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        if (selectedUnitId && selectedUnitId !== currentUnitId) {
            setCurrentUnitId(selectedUnitId);
        }
    }, [selectedUnitId, isOpen]);

    const activeUnit = units.find(u => u.id.toString() === currentUnitId.toString()) || null;

    const [formData, setFormData] = useState({
        unit_id: currentUnitId,
        component: DEFAULT_UC_COMPONENTS[0].name,
        part_number: DEFAULT_UC_COMPONENTS[0].part_number,
        target_life_time: DEFAULT_UC_COMPONENTS[0].target_life_time,
        hm_current: activeUnit?.current_hm || activeUnit?.hm || 0,
        hm_replace: DEFAULT_UC_COMPONENTS[0].hm_replace || 0,
        date_replace: DEFAULT_UC_COMPONENTS[0].date_replace || '',
        brand_produk: DEFAULT_UC_COMPONENTS[0].brand || 'KOMATSU',
        status_penggantian: DEFAULT_UC_COMPONENTS[0].status_penggantian || 'NEW',
        worn_out: DEFAULT_UC_COMPONENTS[0].worn_out || '',
        inspection_date: DEFAULT_UC_COMPONENTS[0].inspection_date || '',
        description: DEFAULT_UC_COMPONENTS[0].remarks || 'Undercarriage Component',
    });

    // Load components for the unit from server if available
    useEffect(() => {
        if (!currentUnitId) return;

        let isMounted = true;
        setIsLoadingData(true);

        axios.get(`/pcr-uc/components-by-unit?unit_id=${currentUnitId}`)
            .then(res => {
                if (!isMounted) return;
                const pcrRecords = res.data?.pcr_records || [];
                const u = res.data?.unit || activeUnit;

                const matchedIds = new Set();
                const mapped = DEFAULT_UC_COMPONENTS.map(defComp => {
                    const found = pcrRecords.find(r => 
                        !matchedIds.has(r.id) && (
                            r.component?.trim().toLowerCase() === defComp.name.toLowerCase() ||
                            r.part_number?.trim().toLowerCase() === defComp.part_number.toLowerCase()
                        )
                    );

                    if (found) {
                        matchedIds.add(found.id);
                        const isReplaced = (found.hm_replace > 0 || found.date_replace);
                        const rawSt = found.status_penggantian || (isReplaced ? 'NEW' : 'Belum Diganti');
                        const st = (rawSt === 'Sudah Diganti' || rawSt === 'NEW') ? 'NEW' : rawSt;

                        return {
                            ...defComp,
                            id: found.id,
                            part_number: found.part_number || defComp.part_number,
                            status: (st === 'NEW' || st === 'Overhaul' || st === 'Recondition') ? 'NEW' : (st === 'Reseal' ? 'Reseal' : 'Belum'),
                            status_penggantian: st,
                            target_life_time: found.target_life_time || defComp.target_life_time,
                            hm_replace: found.hm_replace || 0,
                            date_replace: found.date_replace ? found.date_replace.split('T')[0] : '',
                            brand: found.brand_produk || defComp.brand,
                            remarks: found.description || defComp.remarks,
                            worn_out: (found.worn_out !== undefined && found.worn_out !== null) ? found.worn_out : '',
                            inspection_date: found.inspection_date ? found.inspection_date.split('T')[0] : '',
                        };
                    }

                    return { ...defComp };
                });

                // Append any extra DB records that aren't in the default 25
                pcrRecords.forEach(r => {
                    if (!matchedIds.has(r.id) && r.component) {
                        matchedIds.add(r.id);
                        const isReplaced = (r.hm_replace > 0 || r.date_replace);
                        const rawSt = r.status_penggantian || (isReplaced ? 'NEW' : 'Belum Diganti');
                        const st = (rawSt === 'Sudah Diganti' || rawSt === 'NEW') ? 'NEW' : rawSt;

                        mapped.push({
                            no: mapped.length + 1,
                            id: r.id,
                            part_number: r.part_number || '-',
                            name: r.component,
                            status: (st === 'NEW' || st === 'Overhaul' || st === 'Recondition') ? 'NEW' : (st === 'Reseal' ? 'Reseal' : 'Belum'),
                            status_penggantian: st,
                            target_life_time: r.target_life_time || 3000,
                            hm_replace: r.hm_replace || 0,
                            date_replace: r.date_replace ? r.date_replace.split('T')[0] : '',
                            brand: r.brand_produk || 'KOMATSU',
                            remarks: r.description || 'Undercarriage Component',
                            worn_out: (r.worn_out !== undefined && r.worn_out !== null) ? r.worn_out : '',
                            inspection_date: r.inspection_date ? r.inspection_date.split('T')[0] : '',
                        });
                    }
                });

                setUcComponents(mapped);
                const currentHm = u?.current_hm !== undefined ? u.current_hm : (u?.hm || 0);

                setFormData(prev => ({
                    ...prev,
                    unit_id: currentUnitId,
                    hm_current: currentHm,
                }));
            })
            .catch(err => {
                console.error("Failed to load unit PCR components", err);
            })
            .finally(() => {
                if (isMounted) setIsLoadingData(false);
            });

        return () => { isMounted = false; };
    }, [currentUnitId]);

    const handleSelectUcComponent = (comp) => {
        setSelectedCompNo(comp.no);
        setFormData(prev => ({
            ...prev,
            component: comp.name,
            part_number: comp.part_number,
            target_life_time: comp.target_life_time || 3000,
            hm_replace: comp.hm_replace || 0,
            date_replace: comp.date_replace || '',
            brand_produk: comp.brand || 'KOMATSU',
            status_penggantian: comp.status_penggantian || 'Belum Diganti',
            worn_out: (comp.worn_out !== undefined && comp.worn_out !== null) ? comp.worn_out : '',
            inspection_date: comp.inspection_date || '',
            description: comp.remarks || 'Undercarriage Component',
        }));
    };

    const handleToggleCompCheck = (no) => {
        const next = new Set(checkedCompNos);
        if (next.has(no)) {
            next.delete(no);
        } else {
            next.add(no);
        }
        setCheckedCompNos(next);
    };

    const handleSelectAllUc = () => {
        if (checkedCompNos.size === ucComponents.length) {
            setCheckedCompNos(new Set());
        } else {
            setCheckedCompNos(new Set(ucComponents.map(c => c.no)));
        }
    };

    const handleResetUcStatus = () => {
        setUcComponents(prev => prev.map(c => ({
            ...c,
            status: 'Belum',
            status_penggantian: 'Belum Diganti',
            worn_out: '',
            hm_replace: 0,
            date_replace: '',
        })));
        setFormData(prev => ({
            ...prev,
            status_penggantian: 'Belum Diganti',
            worn_out: '',
            hm_replace: 0,
            date_replace: '',
        }));
    };

    const handleUcFormFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Sync to active component in list
        setUcComponents(prev => prev.map(c => {
            if (c.no === selectedCompNo) {
                const updated = { ...c, [field]: value };
                if (field === 'status_penggantian') {
                    updated.status = (value === 'NEW' || value === 'Overhaul' || value === 'Recondition') ? 'NEW' : (value === 'Reseal' ? 'Reseal' : 'Belum');
                }
                return updated;
            }
            return c;
        }));
    };

    const handleUnitSelect = (newUnitId) => {
        setCurrentUnitId(newUnitId);
        if (onUnitChange) onUnitChange(newUnitId);
    };

    const handleSortUc = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Calculate Next Replacement estimation
    const targetLife = Number(formData.target_life_time || 0);
    const currentHm = Number(formData.hm_current || 0);
    const hmReplace = Number(formData.hm_replace || 0);
    const isReseal = formData.status_penggantian === 'Reseal';
    const effectiveHmReplace = isReseal ? 0 : hmReplace;
    const wornOutNum = (formData.worn_out !== '' && formData.worn_out !== null && formData.worn_out !== undefined)
        ? Math.min(100, Math.max(0, Number(formData.worn_out)))
        : null;

    const remainingLife = wornOutNum !== null
        ? targetLife * ((100 - wornOutNum) / 100)
        : targetLife - (currentHm - effectiveHmReplace);

    const nextDue = wornOutNum !== null
        ? currentHm + remainingLife
        : (effectiveHmReplace > 0 ? effectiveHmReplace : currentHm) + targetLife;

    const handleApplySelection = () => {
        const selected = ucComponents.filter(c => checkedCompNos.has(c.no));
        if (selected.length === 0) {
            alert('Pilih setidaknya satu komponen undercarriage.');
            return;
        }

        // Also trigger background bulk save to PCR UC if user modified
        axios.post('/pcr-uc/bulk-store', {
            unit_id: currentUnitId,
            hm_current: currentHm,
            components: selected.map(c => ({
                id: c.id || null,
                part_number: c.part_number,
                component: c.name,
                name: c.name,
                description: c.remarks,
                target_life_time: c.target_life_time,
                hm_replace: c.hm_replace,
                date_replace: c.date_replace,
                brand_produk: c.brand,
                worn_out: c.worn_out !== '' ? c.worn_out : null,
                inspection_date: c.inspection_date || null,
                status_penggantian: c.status_penggantian,
            }))
        }).catch(e => console.warn('Sync to PCR UC bulk-store notice:', e));

        if (onApply) {
            onApply(selected, ucComponents);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col transition-all overflow-hidden"
                style={{ width: '96vw', height: '94vh', maxWidth: '1600px' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20 shadow-xs">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                Edit Plan PCR Undercarriage
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Pilih komponen dan perbarui status penggantian untuk Work Order
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeUnit && (
                            <a
                                href={`/pcr-uc/export-pdf?code_unit=${encodeURIComponent(activeUnit.code_unit || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                                title="Download PDF Komponen Unit Ini"
                            >
                                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Download PDF Unit
                            </a>
                        )}
                        <button 
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Main Content Body (Two Columns) */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
                        
                        {/* ─── Left Column: Table Komponen Undercarriage ─── */}
                        <div className="lg:col-span-5 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">Plan PCR Component</span>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                        Daftar Komponen Undercarriage
                                    </h4>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                                        {ucComponents.length} Komponen
                                    </span>
                                </div>

                                {/* Search Input */}
                                <div className="relative mb-2.5">
                                    <input 
                                        type="text"
                                        placeholder="Cari part number / nama komponen..."
                                        value={searchUcComp}
                                        onChange={(e) => setSearchUcComp(e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-2 bg-gray-50/70 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-gray-800 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Table Container */}
                                <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                                    <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-2.5 py-2 w-8 text-center">
                                                        <input 
                                                            type="checkbox"
                                                            checked={checkedCompNos.size === ucComponents.length && ucComponents.length > 0}
                                                            onChange={handleSelectAllUc}
                                                            className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                    </th>
                                                    <th onClick={() => handleSortUc('no')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none">
                                                        <div className="flex items-center gap-1">
                                                            <span>No</span>
                                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                        </div>
                                                    </th>
                                                    <th onClick={() => handleSortUc('part_number')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none">
                                                        <div className="flex items-center gap-1">
                                                            <span>Part Number</span>
                                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                        </div>
                                                    </th>
                                                    <th onClick={() => handleSortUc('name')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none">
                                                        <div className="flex items-center gap-1">
                                                            <span>Component Name</span>
                                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                        </div>
                                                    </th>
                                                    <th onClick={() => handleSortUc('target_life_time')} className="px-2 py-2 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span>Target Lifetime</span>
                                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                        </div>
                                                    </th>
                                                    <th onClick={() => handleSortUc('status')} className="px-2 py-2 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>Status</span>
                                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300 text-xs">
                                                {ucComponents
                                                    .filter(comp => {
                                                        if (!searchUcComp) return true;
                                                        const q = searchUcComp.toLowerCase();
                                                        return comp.name.toLowerCase().includes(q) || comp.part_number.toLowerCase().includes(q);
                                                    })
                                                    .sort((a, b) => {
                                                        let valA = a[sortConfig.key];
                                                        let valB = b[sortConfig.key];
                                                        if (typeof valA === 'string') {
                                                            valA = valA.toLowerCase();
                                                            valB = (valB || '').toLowerCase();
                                                        }
                                                        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                                                        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                                                        return 0;
                                                    })
                                                    .map((comp) => {
                                                        const isSelected = selectedCompNo === comp.no;
                                                        const isChecked = checkedCompNos.has(comp.no);

                                                        return (
                                                            <tr 
                                                                key={comp.no}
                                                                onClick={() => handleSelectUcComponent(comp)}
                                                                className={`cursor-pointer transition-colors ${
                                                                    isSelected 
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold' 
                                                                        : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <td className="px-2.5 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => handleToggleCompCheck(comp.no)}
                                                                        className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1.5 text-gray-500 font-mono">{comp.no}</td>
                                                                <td className="px-2 py-1.5 font-mono text-gray-800 dark:text-gray-200">{comp.part_number}</td>
                                                                <td className="px-2 py-1.5 font-medium">{comp.name}</td>
                                                                <td className="px-2 py-1.5 text-right font-mono text-gray-600 dark:text-gray-400">
                                                                    {Number(comp.target_life_time || 0).toLocaleString('id-ID')} Jam
                                                                </td>
                                                                <td className="px-2 py-1.5 text-center">
                                                                    {comp.status_penggantian === 'NEW' || comp.status === 'NEW' ? (
                                                                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[11px]">
                                                                            NEW
                                                                        </span>
                                                                    ) : comp.status_penggantian === 'Overhaul' ? (
                                                                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[11px]">
                                                                            Overhaul
                                                                        </span>
                                                                    ) : comp.status_penggantian === 'Reseal' || comp.status === 'Reseal' ? (
                                                                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[11px]">
                                                                            Reseal
                                                                        </span>
                                                                    ) : comp.status_penggantian === 'Recondition' ? (
                                                                        <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[11px]">
                                                                            Recondition
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-[11px]">
                                                                            Belum
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions Left */}
                            <div className="flex items-center justify-between mt-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSelectAllUc}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                        checkedCompNos.size === ucComponents.length
                                            ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                            : 'border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {checkedCompNos.size === ucComponents.length ? 'Batal Semua' : '+ Isi Semua Sekaligus'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetUcStatus}
                                    className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset Status
                                </button>
                            </div>
                        </div>

                        {/* ─── Right Column: Detail Komponen (Image 2) ─── */}
                        <div className="lg:col-span-7 flex flex-col justify-between h-full overflow-y-auto">
                            <div className="space-y-2">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </span>
                                        Detail Komponen
                                    </h4>
                                    {checkedCompNos.size > 1 && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            {checkedCompNos.size} Komponen Tercentang
                                        </span>
                                    )}
                                </div>

                                {/* Unit Select */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                        Unit <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        value={currentUnitId}
                                        onChange={(e) => handleUnitSelect(e.target.value)}
                                        className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                    >
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.code_unit} - {u.model} {u.equipment_capacity ? `(${u.equipment_capacity})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Part Number & Nama Komponen */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Part Number <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.part_number}
                                            onChange={(e) => handleUcFormFieldChange('part_number', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 bg-gray-50/70 dark:bg-slate-800 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Nama Komponen <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.component}
                                            onChange={(e) => handleUcFormFieldChange('component', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 bg-gray-50/70 dark:bg-slate-800 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Status Penggantian Radio Box */}
                                <div className="rounded-lg py-1.5 px-3 border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                                            Status Penggantian
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3.5 flex-wrap text-xs font-bold text-gray-800 dark:text-gray-200">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio"
                                                name="status_penggantian"
                                                value="NEW"
                                                checked={formData.status_penggantian === 'NEW'}
                                                onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span>NEW</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio"
                                                name="status_penggantian"
                                                value="Overhaul"
                                                checked={formData.status_penggantian === 'Overhaul'}
                                                onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                className="text-amber-500 focus:ring-amber-400 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span>Overhaul</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio"
                                                name="status_penggantian"
                                                value="Reseal"
                                                checked={formData.status_penggantian === 'Reseal'}
                                                onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-1">
                                                Reseal
                                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-medium">Tanpa Umur Lifetime</span>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio"
                                                name="status_penggantian"
                                                value="Recondition"
                                                checked={formData.status_penggantian === 'Recondition'}
                                                onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                className="text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-1">
                                                Recondition
                                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-medium">Rekondisi</span>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio"
                                                name="status_penggantian"
                                                value="Belum Diganti"
                                                checked={formData.status_penggantian === 'Belum Diganti'}
                                                onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span>Belum Diganti</span>
                                        </label>
                                    </div>
                                </div>

                                {/* 2-Column Inputs */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Target Life Time (Interval HM)
                                        </label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={formData.target_life_time}
                                            onChange={(e) => handleUcFormFieldChange('target_life_time', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Current HM Unit
                                        </label>
                                        <input 
                                            type="text"
                                            readOnly
                                            value={formData.hm_current ? String(formData.hm_current).replace('.', ',') : '0'}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 bg-gray-100 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            HM Terakhir Ganti
                                        </label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={formData.hm_replace}
                                            onChange={(e) => handleUcFormFieldChange('hm_replace', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Tanggal Terakhir Ganti
                                        </label>
                                        <input 
                                            type="date"
                                            value={formData.date_replace || ''}
                                            onChange={(e) => handleUcFormFieldChange('date_replace', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Hasil Inspection (Worn Out) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                value={formData.worn_out}
                                                onChange={(e) => handleUcFormFieldChange('worn_out', e.target.value)}
                                                className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 pr-7 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Tanggal Inspection
                                        </label>
                                        <input 
                                            type="date"
                                            value={formData.inspection_date || ''}
                                            onChange={(e) => handleUcFormFieldChange('inspection_date', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Brand / Merk Part
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Contoh: KOMATSU, CAT, Berco, ITM"
                                            value={formData.brand_produk}
                                            onChange={(e) => handleUcFormFieldChange('brand_produk', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                                            Keterangan / Remarks
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Contoh: Undercarriage Component"
                                            value={formData.description}
                                            onChange={(e) => handleUcFormFieldChange('description', e.target.value)}
                                            className="w-full text-xs border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Calculation Box (Perhitungan Estimasi Next Replacement) */}
                                <div className="mt-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Perhitungan Estimasi Next Replacement</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-center min-w-[75px]">
                                            <div className="text-[9px] text-gray-400 font-medium">Target Life Time</div>
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{Number(targetLife).toLocaleString('id-ID')} HM</div>
                                        </div>
                                        <span className="text-gray-400 font-bold text-xs">+</span>
                                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-center min-w-[75px]">
                                            <div className="text-[9px] text-gray-400 font-medium">Worn Out Inspection</div>
                                            <div className="text-xs font-bold text-red-500">{wornOutNum !== null ? `${wornOutNum}%` : '—%'}</div>
                                        </div>
                                        <span className="text-gray-400 font-bold text-xs">+</span>
                                        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 rounded-lg px-2.5 py-1 text-center min-w-[85px]">
                                            <div className="text-[9px] text-gray-400 font-medium">Remaining Life</div>
                                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{Number(remainingLife || 0).toLocaleString('id-ID')} HM</div>
                                        </div>
                                        <span className="text-gray-400 font-bold text-xs">+</span>
                                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-center min-w-[75px]">
                                            <div className="text-[9px] text-gray-400 font-medium">Current HM</div>
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{Number(currentHm || 0).toLocaleString('id-ID')} HM</div>
                                        </div>
                                        <span className="text-gray-400 font-bold text-xs">=</span>
                                        <div className="bg-emerald-600 text-white rounded-lg px-3 py-1 text-center min-w-[90px] shadow-xs">
                                            <div className="text-[9px] font-medium opacity-80">Estimasi Next Due</div>
                                            <div className="text-xs font-extrabold">{Number(nextDue || 0).toLocaleString('id-ID')} HM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Bar */}
                <div className="border-t border-gray-200 dark:border-white/10 px-6 py-3.5 bg-gray-50 dark:bg-slate-800 flex items-center justify-between shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        * Data komponen yang tercentang akan otomatis dimasukkan ke tabel Task Work Order
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-600 transition shadow-xs cursor-pointer"
                        >
                            Tutup
                        </button>
                        <button
                            type="button"
                            onClick={handleApplySelection}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Terapkan ke Work Order ({checkedCompNos.size} Komponen Terpilih)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
