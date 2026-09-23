import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UnitTyreDiagram, { getUnitTyreConfig } from './UnitTyreDiagram';

export default function Index({ tyres, wheelUnits, unitTyreMap, stats, brands, filters }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState(filters.condition || 'ALL'); // ALL, ACTIVE, REPAIR, SCRAP, STOCK, 3D_VIEWER
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit_id || '');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(true);
    const [modalMode, setModalMode] = useState('UNIT'); // 'UNIT' (Visual per Unit), 'BATCH' (Spreadsheet), 'SINGLE' (Satuan)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertNotice, setAlertNotice] = useState(null);

    // ==========================================
    // FORMATTING HELPERS
    // ==========================================
    const formatExcelDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[d.getMonth()];
            const year = String(d.getFullYear()).slice(-2);
            return `${day}-${month}-${year}`;
        } catch {
            return dateStr;
        }
    };

    const formatNum = (val, decimals = 1) => {
        if (val === null || val === undefined || val === '') return '-';
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        if (decimals === 0) return Math.round(num).toLocaleString('id-ID');
        return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
    };

    const getWearDetails = (otd, rtd) => {
        const otdNum = parseFloat(otd);
        const rtdNum = parseFloat(rtd);
        if (!otdNum || isNaN(rtdNum)) {
            return { pctStr: '-', cellBg: 'bg-white', textStyle: 'text-gray-600' };
        }
        const pct = Math.max(0, ((otdNum - rtdNum) / otdNum) * 100);
        const pctStr = pct.toFixed(1).replace('.', ',') + '%';

        // Styling based on wear percentage matching mining plant spreadsheet:
        if (pct < 5) {
            return { pctStr, cellBg: 'bg-[#00b050] text-black font-black', rowTint: 'bg-[#e2f0d9]' };
        } else if (pct <= 25) {
            return { pctStr, cellBg: 'bg-[#92d050] text-black font-bold', rowTint: 'bg-[#eaf4d3]' };
        } else if (pct <= 45) {
            return { pctStr, cellBg: 'bg-[#ffff00] text-black font-black', rowTint: 'bg-[#fffde6]' };
        } else {
            return { pctStr, cellBg: 'bg-[#ff9900] text-black font-black', rowTint: 'bg-[#fff2e6]' };
        }
    };

    // ==========================================
    // GROUPING TYRES BY UNIT
    // ==========================================
    // Build a map of active tyres per unit
    const activeTyres = tyres.filter(t => t.condition === 'ACTIVE' && t.unit_id);
    const stockTyres = tyres.filter(t => t.condition === 'STOCK' || !t.unit_id);

    // Group active tyres by unit_id
    const tyresByUnit = {};
    activeTyres.forEach(t => {
        if (!tyresByUnit[t.unit_id]) {
            tyresByUnit[t.unit_id] = [];
        }
        tyresByUnit[t.unit_id].push(t);
    });

    // List of units to display:
    // If a unit is selected in filter, only that unit.
    // Otherwise, all units that have active tyres, plus if searching, filter by matching unit or serial.
    let displayUnits = wheelUnits.filter(u => {
        if (selectedUnit) return String(u.id) === String(selectedUnit);
        if (search) {
            const hasMatchingTyre = activeTyres.some(t => t.unit_id === u.id && t.serial_number?.toLowerCase().includes(search.toLowerCase()));
            const unitCodeMatches = u.code_unit?.toLowerCase().includes(search.toLowerCase());
            return hasMatchingTyre || unitCodeMatches;
        }
        // If tab is ACTIVE or ALL, show units that have tyres
        return Boolean(tyresByUnit[u.id] && tyresByUnit[u.id].length > 0);
    });

    // If no units have tyres yet, or user picked a unit with 0 tyres, still show that unit with empty slots!
    if (displayUnits.length === 0 && selectedUnit) {
        const u = wheelUnits.find(unit => String(unit.id) === String(selectedUnit));
        if (u) displayUnits = [u];
    } else if (displayUnits.length === 0 && activeTyres.length === 0 && wheelUnits.length > 0) {
        // Default show OHT066 or first unit
        const defaultU = wheelUnits.find(u => u.code_unit === 'OHT066') || wheelUnits[0];
        if (defaultU) displayUnits = [defaultU];
    }

    // ==========================================
    // TAB 1: VISUAL PER-UNIT BULK REGISTRATION
    // ==========================================
    const [unitModalUnitId, setUnitModalUnitId] = useState(wheelUnits?.[0]?.id || '');
    const [selectedDiagramPos, setSelectedDiagramPos] = useState(null);
    
    // Common specs for quick fill
    const [commonSpec, setCommonSpec] = useState({
        brand: 'TRIANGLE',
        type_size: '24.00R35',
        pattern: 'TB526S',
        otd: '62',
        rtd: '62',
        psi: '105',
        purchase_date: new Date().toISOString().split('T')[0],
        plan_rotary_target: '3000',
        installed_hm: '',
        notes: 'NEW TYRE'
    });

    const [unitSlotInputs, setUnitSlotInputs] = useState({});

    const currentUnit = wheelUnits.find(u => String(u.id) === String(unitModalUnitId)) || wheelUnits[0];
    const currentUnitConfig = currentUnit ? getUnitTyreConfig(currentUnit.type_unit) : getUnitTyreConfig('');
    const existingUnitTyres = (currentUnit && unitTyreMap[currentUnit.id]) ? unitTyreMap[currentUnit.id] : {};

    useEffect(() => {
        if (!currentUnit) return;
        const config = getUnitTyreConfig(currentUnit.type_unit);
        
        let defaultSize = '24.00R35';
        let defaultBrand = 'TRIANGLE';
        let defaultPattern = 'TB526S';
        let defaultOtd = '62';

        if (config.typeKey === 'MOTORGRADER') {
            defaultSize = '14.00R24';
            defaultBrand = 'TRIANGLE';
            defaultPattern = 'TB526S';
            defaultOtd = '40';
        } else if (config.typeKey === 'MAINHAUL' || config.typeKey === 'TRUCK_10') {
            defaultSize = '12.00R20';
            defaultBrand = 'BRIDGESTONE';
            defaultPattern = 'M840';
            defaultOtd = '25';
        }

        const existingList = Object.values(existingUnitTyres);
        if (existingList.length > 0 && existingList[0].brand) {
            defaultBrand = existingList[0].brand;
            if (existingList[0].type_size) defaultSize = existingList[0].type_size;
            if (existingList[0].pattern) defaultPattern = existingList[0].pattern;
            if (existingList[0].otd) defaultOtd = String(existingList[0].otd);
        }

        setCommonSpec(prev => ({
            ...prev,
            brand: defaultBrand,
            type_size: defaultSize,
            pattern: defaultPattern,
            otd: defaultOtd,
            rtd: defaultOtd,
            installed_hm: currentUnit.hm || '0'
        }));

        const newInputs = {};
        config.positions.forEach(pos => {
            const hasExisting = Boolean(existingUnitTyres[pos.id]);
            newInputs[pos.id] = {
                enabled: !hasExisting,
                serial_number: '',
                brand: defaultBrand,
                type_size: defaultSize,
                pattern: defaultPattern,
                otd: defaultOtd,
                rtd: defaultOtd,
                psi: '105',
                notes: 'NEW TYRE'
            };
        });
        setUnitSlotInputs(newInputs);
    }, [unitModalUnitId]);

    const handleApplyCommonToAll = () => {
        if (!currentUnitConfig) return;
        setUnitSlotInputs(prev => {
            const updated = { ...prev };
            currentUnitConfig.positions.forEach(pos => {
                updated[pos.id] = {
                    ...(updated[pos.id] || {}),
                    enabled: true,
                    brand: commonSpec.brand,
                    type_size: commonSpec.type_size,
                    pattern: commonSpec.pattern,
                    otd: commonSpec.otd,
                    rtd: commonSpec.rtd,
                    psi: commonSpec.psi,
                    notes: commonSpec.notes
                };
            });
            return updated;
        });
    };

    const handleSlotChange = (posId, field, value) => {
        setUnitSlotInputs(prev => ({
            ...prev,
            [posId]: {
                ...(prev[posId] || {}),
                [field]: value
            }
        }));
    };

    const submitUnitBulk = (e) => {
        e.preventDefault();
        if (!currentUnit) return;

        const payloadTyres = [];
        currentUnitConfig.positions.forEach(pos => {
            const slot = unitSlotInputs[pos.id];
            if (slot && slot.enabled && slot.serial_number && slot.serial_number.trim() !== '') {
                payloadTyres.push({
                    serial_number: slot.serial_number.trim().toUpperCase(),
                    brand: slot.brand || commonSpec.brand || 'TRIANGLE',
                    type_size: slot.type_size || commonSpec.type_size,
                    pattern: slot.pattern || commonSpec.pattern,
                    otd: slot.otd || commonSpec.otd,
                    rtd: slot.rtd || commonSpec.rtd || slot.otd || commonSpec.otd,
                    psi: slot.psi ? parseInt(slot.psi) : (commonSpec.psi ? parseInt(commonSpec.psi) : 105),
                    condition: 'ACTIVE',
                    unit_id: currentUnit.id,
                    position: pos.id,
                    installed_hm: commonSpec.installed_hm ? parseFloat(commonSpec.installed_hm) : (currentUnit.hm ? parseFloat(currentUnit.hm) : 0),
                    purchase_date: commonSpec.purchase_date || new Date().toISOString().split('T')[0],
                    plan_rotary_target: commonSpec.plan_rotary_target ? parseFloat(commonSpec.plan_rotary_target) : 3000,
                    notes: slot.notes || commonSpec.notes || `NEW TYRE`
                });
            }
        });

        if (payloadTyres.length === 0) {
            alert("Harap masukkan minimal satu Serial Number pada posisi roda yang dicentang!");
            return;
        }

        setIsSubmitting(true);
        router.post(route('tyres.bulk-store'), {
            unit_id: currentUnit.id,
            tyres: payloadTyres
        }, {
            onSuccess: () => {
                setShowModal(false);
                setIsSubmitting(false);
                setAlertNotice(`Berhasil mendaftarkan ${payloadTyres.length} tyre untuk unit ${currentUnit.code_unit}!`);
                setTimeout(() => setAlertNotice(null), 6000);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const firstErr = Object.values(errs)[0];
                alert(`Gagal menyimpan: ${firstErr || 'Periksa kembali data Anda'}`);
            }
        });
    };

    // ==========================================
    // TAB 2: MULTI-ROW / SPREADSHEET BATCH
    // ==========================================
    const createEmptyRow = (customUnitId = '') => ({
        id: Math.random().toString(36).substr(2, 9),
        condition: customUnitId ? 'ACTIVE' : 'STOCK',
        unit_id: customUnitId || '',
        position: 'Pos 1',
        serial_number: '',
        brand: 'TRIANGLE',
        type_size: '24.00R35',
        pattern: 'TB526S',
        otd: '62',
        rtd: '62',
        psi: '105',
        installed_hm: '',
        purchase_date: new Date().toISOString().split('T')[0],
        plan_rotary_target: '3000',
        notes: 'NEW TYRE'
    });

    const [batchRows, setBatchRows] = useState([
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow()
    ]);

    const handleAddBatchRows = (count = 1) => {
        const lastRow = batchRows[batchRows.length - 1];
        const newRows = [];
        for (let i = 0; i < count; i++) {
            if (lastRow) {
                newRows.push({
                    ...createEmptyRow(lastRow.unit_id),
                    brand: lastRow.brand,
                    type_size: lastRow.type_size,
                    pattern: lastRow.pattern,
                    otd: lastRow.otd,
                    rtd: lastRow.rtd,
                    psi: lastRow.psi,
                    condition: lastRow.condition,
                    purchase_date: lastRow.purchase_date,
                    notes: lastRow.notes
                });
            } else {
                newRows.push(createEmptyRow());
            }
        }
        setBatchRows([...batchRows, ...newRows]);
    };

    const handleRemoveBatchRow = (index) => {
        if (batchRows.length <= 1) {
            alert("Minimal harus ada 1 baris input.");
            return;
        }
        setBatchRows(batchRows.filter((_, i) => i !== index));
    };

    const handleBatchRowChange = (index, field, value) => {
        const updated = [...batchRows];
        updated[index][field] = value;

        if (field === 'unit_id') {
            const u = wheelUnits.find(unit => String(unit.id) === String(value));
            if (u) {
                updated[index].installed_hm = u.hm || '0';
                updated[index].condition = 'ACTIVE';
            }
        }
        if (field === 'condition' && value === 'STOCK') {
            updated[index].unit_id = '';
            updated[index].position = '';
            updated[index].installed_hm = '';
        }

        setBatchRows(updated);
    };

    const submitBatchSpreadsheet = (e) => {
        e.preventDefault();
        const validRows = batchRows.filter(r => r.serial_number && r.serial_number.trim() !== '');

        if (validRows.length === 0) {
            alert("Harap masukkan minimal satu Serial Number pada baris tabel!");
            return;
        }

        const payload = validRows.map(r => ({
            serial_number: r.serial_number.trim().toUpperCase(),
            brand: r.brand || 'TRIANGLE',
            type_size: r.type_size || null,
            pattern: r.pattern || null,
            otd: r.otd || null,
            rtd: r.rtd || r.otd || null,
            psi: r.psi ? parseInt(r.psi) : null,
            condition: r.condition,
            unit_id: r.condition === 'ACTIVE' ? (r.unit_id || null) : null,
            position: r.condition === 'ACTIVE' ? (r.position || 'Pos 1') : null,
            installed_hm: (r.condition === 'ACTIVE' && r.installed_hm) ? parseFloat(r.installed_hm) : 0,
            purchase_date: r.purchase_date || new Date().toISOString().split('T')[0],
            plan_rotary_target: r.plan_rotary_target ? parseFloat(r.plan_rotary_target) : 3000,
            notes: r.notes || null
        }));

        setIsSubmitting(true);
        router.post(route('tyres.bulk-store'), {
            tyres: payload
        }, {
            onSuccess: () => {
                setShowModal(false);
                setIsSubmitting(false);
                setAlertNotice(`Berhasil mendaftarkan ${payload.length} tyre secara massal!`);
                setTimeout(() => setAlertNotice(null), 6000);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const firstErr = Object.values(errs)[0];
                alert(`Gagal menyimpan: ${firstErr || 'Periksa kembali data tabel Anda'}`);
            }
        });
    };

    // ==========================================
    // TAB 3: SINGLE REGISTRATION
    // ==========================================
    const { data: singleData, setData: setSingleData, post: postSingle, processing: singleProcessing, errors: singleErrors, reset: resetSingle } = useForm({
        serial_number: '',
        brand: 'TRIANGLE',
        type_size: '24.00R35',
        pattern: 'TB526S',
        psi: '105',
        otd: '62',
        rtd: '62',
        plan_rotary_target: '3000',
        condition: 'ACTIVE',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: '',
        unit_id: wheelUnits?.[0]?.id || '',
        position: 'Pos 1',
        installed_hm: wheelUnits?.[0]?.hm || '0',
        notes: 'NEW TYRE'
    });

    const selectedSingleUnit = wheelUnits.find(u => String(u.id) === String(singleData.unit_id));
    const singleUnitPositions = selectedSingleUnit ? getUnitTyreConfig(selectedSingleUnit.type_unit).positions : [];

    const handleSingleUnitChange = (unitId) => {
        setSingleData('unit_id', unitId);
        const u = wheelUnits.find(unit => String(unit.id) === String(unitId));
        if (u) {
            setSingleData(prev => ({
                ...prev,
                unit_id: unitId,
                installed_hm: u.hm || '0',
                position: 'Pos 1'
            }));
        }
    };

    const submitSingle = (e) => {
        e.preventDefault();
        postSingle(route('tyres.store'), {
            onSuccess: () => {
                setShowModal(false);
                resetSingle();
                setAlertNotice(`Tyre ${singleData.serial_number} berhasil didaftarkan!`);
                setTimeout(() => setAlertNotice(null), 6000);
            }
        });
    };

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

    const statsCards = [
        { label: 'Total Tyres', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active (Installed)', value: stats.active, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'In Repair', value: stats.repair, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Scrap', value: stats.scrap, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Ready Stock', value: stats.stock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    // Quick open modal prefilled for a unit and position
    const openInstallForSlot = (unitId, posId) => {
        setUnitModalUnitId(unitId);
        setSelectedDiagramPos(posId);
        setModalMode('UNIT');
        setShowModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tyre Management" />

            {/* Flash notification */}
            {(alertNotice || flash?.success) && (
                <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{alertNotice || flash?.success}</span>
                    </div>
                    <button onClick={() => setAlertNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Tyre Management</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="text-blue-600 font-semibold">Home</span> &gt; <span>Component</span> &gt; <span>Tyre Management</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setShowModal(true);
                                setModalMode('UNIT');
                            }} 
                            className="bg-[#0f5132] hover:bg-[#146c43] text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-md flex items-center gap-2 transition transform active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            + Registrasi Tyre
                        </button>
                    </div>
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
                            <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 font-bold">
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

                {/* ===================================================================== */}
                {/* MAIN TABLE: GROUPED BY UNIT (EXACT MINING SPREADSHEET REPLICA)       */}
                {/* ===================================================================== */}
                {activeTab !== '3D_VIEWER' && (
                    <div className="mt-4">
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                            <div>
                                <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                                    Tabel Tyre Terpasang per Unit ({displayUnits.length} Unit Ditampilkan)
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Setiap posisi roda (Pos 1 s/d Pos 6) disatukan rapi di samping blok informasi unit.
                                </p>
                            </div>
                        </div>

                        {/* Excel-style table wrapper */}
                        <div className="overflow-x-auto border-2 border-gray-400 rounded-lg shadow-sm">
                            <table className="w-full text-left text-xs border-collapse border border-gray-400 font-sans">
                                <thead>
                                    {/* Main Header Row */}
                                    <tr className="bg-gray-100 text-gray-900 font-bold border-b-2 border-gray-400 text-center">
                                        <th rowSpan="2" className="border border-gray-400 px-3 py-2 w-32 min-w-[120px] uppercase text-[11px] bg-gray-200">
                                            UNIT
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 w-10 text-[11px]">
                                            POS
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-3 py-2 min-w-[140px] text-[11px]">
                                            SERIAL NUMBER TYRE
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[100px] text-[11px]">
                                            BRAND
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            SIZE
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            PATTERN
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-1 py-2 w-12 text-[11px]">
                                            OTD
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-1 py-2 w-12 text-[11px]">
                                            RTD
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-1 py-2 w-12 text-[11px]">
                                            RTD 2
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 w-14 text-[11px]">
                                            % WEAR
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            DATE INSTAL
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[80px] text-[11px]">
                                            PREV LIFE
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            HM INSTALL
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            LIFE TIME RUNNING
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-2 py-2 min-w-[90px] text-[11px]">
                                            CURRENT LIFE TIME
                                        </th>
                                        <th rowSpan="2" className="border border-gray-400 px-3 py-2 min-w-[150px] text-[11px]">
                                            REMARK
                                        </th>
                                        
                                        {/* Plan Rotary Target Multi-column Header */}
                                        <th colSpan="6" className="border border-gray-400 px-2 py-1 bg-blue-50 text-blue-900 text-[11px] font-black tracking-wider uppercase">
                                            PLAN ROTARY TYRE TARGET
                                        </th>
                                    </tr>

                                    {/* Sub-Header Row for Plan Rotary */}
                                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-400 text-center text-[10px]">
                                        <th className="border border-gray-400 px-1 py-1 w-8">Pos</th>
                                        <th className="border border-gray-400 px-2 py-1 min-w-[120px]">Serial Number</th>
                                        <th className="border border-gray-400 px-2 py-1 min-w-[80px]">Plan Rotary</th>
                                        <th className="border border-gray-400 px-2 py-1 min-w-[70px]">Sisa HM</th>
                                        <th className="border border-gray-400 px-2 py-1 min-w-[85px]">Est Date</th>
                                        <th className="border border-gray-400 px-2 py-1 min-w-[90px]">Plan Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {displayUnits.length === 0 ? (
                                        <tr>
                                            <td colSpan="22" className="text-center py-12 text-gray-400 bg-white border border-gray-300">
                                                Tidak ada unit dengan ban yang sesuai filter saat ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayUnits.map(unit => {
                                            const unitConfig = getUnitTyreConfig(unit.type_unit);
                                            const totalSlots = unitConfig.positions;
                                            const unitTyres = tyresByUnit[unit.id] || [];
                                            const tyreMapByPos = {};
                                            unitTyres.forEach(t => {
                                                if (t.position) tyreMapByPos[t.position] = t;
                                            });

                                            // Determine total rows for this unit block
                                            const rowCount = totalSlots.length;

                                            return totalSlots.map((posDef, idx) => {
                                                const tyre = tyreMapByPos[posDef.id];
                                                const posNum = posDef.id.replace('Pos ', '');
                                                const isFirstRow = idx === 0;

                                                // Calculations
                                                const otd = tyre?.otd || '';
                                                const rtd = tyre?.rtd || '';
                                                const wearInfo = getWearDetails(otd, rtd);

                                                const hmInstall = tyre?.installed_hm ? parseFloat(tyre.installed_hm) : 0;
                                                const unitHm = unit.hm ? parseFloat(unit.hm) : 0;
                                                const prevLife = tyre?.prev_life ? parseFloat(tyre.prev_life) : 0;
                                                const isOriginal = tyre?.notes?.toUpperCase().includes('ORIGINAL BY UNIT');
                                                
                                                // Lifetime running on unit = Unit HM - HM Install (or Unit HM if Original By Unit / HM Install is 0)
                                                const lifetimeRunning = tyre 
                                                    ? (isOriginal || hmInstall <= 0 ? unitHm : Math.max(0, unitHm - hmInstall)) 
                                                    : 0;
                                                // Current lifetime = Lifetime running + prev life
                                                const currentLifetime = tyre ? (lifetimeRunning + prevLife) : 0;

                                                // Rotary calculations for Front tyres (Pos 1 & Pos 2)
                                                const planRotaryTarget = tyre?.plan_rotary_target ? parseFloat(tyre.plan_rotary_target) : 3000;
                                                const sisaHmRotary = planRotaryTarget - lifetimeRunning;
                                                const hasPlanRotary = tyre && (posDef.id === 'Pos 1' || posDef.id === 'Pos 2' || tyre.plan_action);

                                                return (
                                                    <tr key={`${unit.id}-${posDef.id}`} className="hover:bg-blue-50/40 transition-colors border-b border-gray-300">
                                                        
                                                        {/* MERGED UNIT INFO COLUMN (Rendered only on first row of unit) */}
                                                        {isFirstRow && (
                                                            <td 
                                                                rowSpan={rowCount} 
                                                                className="border-2 border-gray-400 p-2 text-center align-middle bg-white w-32 min-w-[120px] select-none"
                                                            >
                                                                <div className="flex flex-col items-center justify-center space-y-1 py-2">
                                                                    {/* Top mini code */}
                                                                    <div className="text-[10px] font-bold text-gray-500 font-mono">
                                                                        {unit.code_unit.replace('OHT', '')}
                                                                    </div>

                                                                    {/* Red/Dark prominent Badge matching screenshot */}
                                                                    <div className="w-full bg-[#990000] text-white py-1.5 px-2 rounded font-black text-sm tracking-wider font-mono shadow-sm">
                                                                        {unit.code_unit}
                                                                    </div>

                                                                    {/* Unit Model */}
                                                                    <div className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                                                                        {unit.model || unit.type_unit || 'CAT773'}
                                                                    </div>

                                                                    {/* CURR.SMU label */}
                                                                    <div className="text-[10px] font-bold text-blue-700 tracking-wider uppercase pt-1">
                                                                        CURR.SMU
                                                                    </div>

                                                                    {/* Current SMU/HM Number */}
                                                                    <div className="text-base font-black text-gray-900 font-mono">
                                                                        {formatNum(unit.hm, 0)}
                                                                    </div>

                                                                    {/* Bottom mini code */}
                                                                    <div className="text-[10px] font-bold text-gray-500 font-mono pt-1 border-t border-gray-100 w-full">
                                                                        {unit.code_unit.replace('OHT', '')}
                                                                    </div>

                                                                    {/* Quick Setup Button */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setUnitModalUnitId(unit.id);
                                                                            setModalMode('UNIT');
                                                                            setShowModal(true);
                                                                        }}
                                                                        className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded transition"
                                                                    >
                                                                        ⚙️ Setup Roda
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* POS NUMBER */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-bold text-gray-900 bg-gray-50 font-mono">
                                                            {posNum}
                                                        </td>

                                                        {/* SERIAL NUMBER TYRE */}
                                                        {tyre ? (
                                                            <td className={`border border-gray-400 px-3 py-2 font-mono font-bold text-gray-900 relative ${isOriginal ? 'bg-[#00b0f0]/30 text-blue-950 font-black' : ''}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <Link 
                                                                        href={route('tyres.history', tyre.id)} 
                                                                        className="hover:underline hover:text-blue-700 tracking-wider"
                                                                        title="Klik untuk detail / mutasi riwayat"
                                                                    >
                                                                        {tyre.serial_number}
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <td className="border border-gray-400 px-3 py-2 bg-gray-50/70 text-gray-400 italic">
                                                                <div className="flex items-center justify-between">
                                                                    <span>(Slot Kosong)</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openInstallForSlot(unit.id, posDef.id)}
                                                                        className="text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded shadow-sm"
                                                                    >
                                                                        + Pasang
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* BRAND */}
                                                        <td className={`border border-gray-400 px-2 py-2 text-center font-bold text-gray-800 ${isOriginal ? 'bg-[#00b0f0]/30 font-black' : ''}`}>
                                                            {tyre?.brand || '-'}
                                                        </td>

                                                        {/* SIZE */}
                                                        <td className={`border border-gray-400 px-2 py-2 text-center text-gray-700 ${isOriginal ? 'bg-[#00b0f0]/30 font-bold' : ''}`}>
                                                            {tyre?.type_size || '-'}
                                                        </td>

                                                        {/* PATTERN */}
                                                        <td className={`border border-gray-400 px-2 py-2 text-center font-medium text-gray-800 ${isOriginal ? 'bg-[#00b0f0]/30 font-bold' : ''}`}>
                                                            {tyre?.pattern || '-'}
                                                        </td>

                                                        {/* OTD */}
                                                        <td className="border border-gray-400 px-1 py-2 text-center font-mono font-bold">
                                                            {tyre?.otd || '-'}
                                                        </td>

                                                        {/* RTD */}
                                                        <td className="border border-gray-400 px-1 py-2 text-center font-mono font-bold">
                                                            {tyre?.rtd || '-'}
                                                        </td>

                                                        {/* RTD 2 */}
                                                        <td className="border border-gray-400 px-1 py-2 text-center font-mono font-bold">
                                                            {tyre?.rtd || '-'}
                                                        </td>

                                                        {/* % WEAR (EXACT COLOR HIGHLIGHTING FROM SCREENSHOT) */}
                                                        <td className={`border border-gray-400 px-2 py-2 text-center font-mono ${wearInfo.cellBg}`}>
                                                            {tyre ? wearInfo.pctStr : '-'}
                                                        </td>

                                                        {/* DATE INSTAL */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center whitespace-nowrap font-medium text-gray-700">
                                                            {isOriginal ? (
                                                                <span className="font-bold text-blue-900 font-mono">ORIGIN</span>
                                                            ) : tyre ? (
                                                                formatExcelDate(tyre.purchase_date)
                                                            ) : '-'}
                                                        </td>

                                                        {/* PREV LIFE */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono text-gray-800">
                                                            {tyre ? formatNum(prevLife, 1) : '-'}
                                                        </td>

                                                        {/* HM INSTALL */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono font-bold text-gray-900">
                                                            {tyre ? (isOriginal ? '0' : formatNum(hmInstall, 1)) : '-'}
                                                        </td>

                                                        {/* LIFE TIME RUNNING */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono font-bold text-blue-700">
                                                            {tyre ? formatNum(lifetimeRunning, 0) : '-'}
                                                        </td>

                                                        {/* CURRENT LIFE TIME */}
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono font-black text-emerald-800">
                                                            {tyre ? formatNum(currentLifetime, 0) : '-'}
                                                        </td>

                                                        {/* REMARK */}
                                                        <td className="border border-gray-400 px-3 py-2 font-bold text-gray-800 whitespace-nowrap">
                                                            {tyre?.notes || '-'}
                                                        </td>

                                                        {/* =================================================== */}
                                                        {/* PLAN ROTARY TYRE TARGET (RIGHT COLUMNS)             */}
                                                        {/* =================================================== */}
                                                        <td className="border border-gray-400 px-1 py-2 text-center font-mono font-bold bg-blue-50/40">
                                                            {hasPlanRotary ? posNum : ''}
                                                        </td>
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono font-bold bg-blue-50/40">
                                                            {hasPlanRotary ? tyre.serial_number : ''}
                                                        </td>
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-mono bg-blue-50/40">
                                                            {hasPlanRotary ? formatNum(planRotaryTarget, 0) : ''}
                                                        </td>
                                                        <td className={`border border-gray-400 px-2 py-2 text-center font-mono font-black ${sisaHmRotary < 0 ? 'bg-red-100 text-red-700' : 'text-orange-700 bg-blue-50/40'}`}>
                                                            {hasPlanRotary ? formatNum(sisaHmRotary, 0) : ''}
                                                        </td>
                                                        <td className="border border-gray-400 px-2 py-2 text-center whitespace-nowrap font-medium text-gray-700 bg-blue-50/40">
                                                            {hasPlanRotary ? (tyre.plan_rotary_date ? formatExcelDate(tyre.plan_rotary_date) : formatExcelDate(tyre.purchase_date)) : ''}
                                                        </td>
                                                        <td className="border border-gray-400 px-2 py-2 text-center font-bold text-gray-700 bg-blue-50/40 whitespace-nowrap">
                                                            {hasPlanRotary ? (
                                                                (tyre.plan_action === 'please rotate to rear position' || sisaHmRotary <= 10) ? (
                                                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight inline-block">
                                                                        ⚠️ please rotate to rear position
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-700 font-semibold">
                                                                        {tyre.plan_action || 'Next time'}
                                                                    </span>
                                                                )
                                                            ) : ''}
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* READY STOCK TYRES SECTION */}
                        {stockTyres.length > 0 && (
                            <div className="mt-8 border border-gray-200 rounded-xl p-4 bg-slate-50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-black uppercase text-gray-800 tracking-wide flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                                        Ban Ready Stock di Gudang ({stockTyres.length} Ban)
                                    </h3>
                                    <span className="text-xs text-gray-500">Ban belum terpasang ke unit manapun</span>
                                </div>

                                <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-100 text-gray-800 font-bold border-b">
                                            <tr>
                                                <th className="p-2.5">Serial Number</th>
                                                <th className="p-2.5">Brand</th>
                                                <th className="p-2.5">Size</th>
                                                <th className="p-2.5">Pattern</th>
                                                <th className="p-2.5 text-center">OTD</th>
                                                <th className="p-2.5 text-center">RTD</th>
                                                <th className="p-2.5 text-center">PSI</th>
                                                <th className="p-2.5">Tanggal Masuk</th>
                                                <th className="p-2.5">Keterangan</th>
                                                <th className="p-2.5 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {stockTyres.map(st => (
                                                <tr key={st.id} className="hover:bg-indigo-50/30">
                                                    <td className="p-2.5 font-mono font-bold text-gray-900">{st.serial_number}</td>
                                                    <td className="p-2.5 font-semibold">{st.brand}</td>
                                                    <td className="p-2.5">{st.type_size || '-'}</td>
                                                    <td className="p-2.5">{st.pattern || '-'}</td>
                                                    <td className="p-2.5 text-center font-mono">{st.otd || '-'}</td>
                                                    <td className="p-2.5 text-center font-mono">{st.rtd || '-'}</td>
                                                    <td className="p-2.5 text-center font-mono">{st.psi || '-'}</td>
                                                    <td className="p-2.5">{formatExcelDate(st.purchase_date)}</td>
                                                    <td className="p-2.5 text-gray-500">{st.notes || '-'}</td>
                                                    <td className="p-2.5 text-center">
                                                        <Link 
                                                            href={route('tyres.history', st.id)}
                                                            className="text-xs font-bold text-blue-600 hover:underline"
                                                        >
                                                            Riwayat
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* REGISTRATION MODAL                                                        */}
            {/* ========================================================================= */}
            {showModal && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center ${isModalFullscreen ? 'p-0' : 'p-2 sm:p-4'} bg-slate-950/70 backdrop-blur-sm overflow-hidden`}>
                    <div className={`bg-white flex flex-col shadow-2xl transition-all duration-200 overflow-hidden ${
                        isModalFullscreen
                            ? 'w-screen h-screen max-w-none max-h-none rounded-none'
                            : 'rounded-2xl w-full max-w-6xl max-h-[94vh] border border-gray-200 animate-in fade-in zoom-in-95 duration-200'
                    }`}>
                        
                        {/* Modal Header */}
                        <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/90 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                                    REGISTRASI TYRE BARU
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Daftarkan ban sekaligus per unit dengan diagram roda, secara tabel massal, atau satu per satu.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalFullscreen(!isModalFullscreen)} 
                                    className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                    title={isModalFullscreen ? "Kecilkan Tampilan (Windowed)" : "Layar Penuh (Full Screen)"}
                                >
                                    {isModalFullscreen ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
                                            </svg>
                                            <span className="hidden sm:inline">Normal Window</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            <span className="hidden sm:inline">Full Screen</span>
                                        </>
                                    )}
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)} 
                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                                    title="Tutup"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Mode Navigation Tabs */}
                        <div className="px-6 pt-3 bg-gray-100/70 border-b border-gray-200 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setModalMode('UNIT')}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-black rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
                                    modalMode === 'UNIT'
                                        ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                                        : 'bg-transparent text-gray-600 hover:text-gray-900 border-transparent hover:bg-white/50'
                                }`}
                            >
                                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Input Sekaligus per Unit (Diagram Posisi Roda)</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">Rekomendasi</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalMode('BATCH')}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-black rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
                                    modalMode === 'BATCH'
                                        ? 'bg-white text-blue-800 border-blue-600 shadow-sm'
                                        : 'bg-transparent text-gray-600 hover:text-gray-900 border-transparent hover:bg-white/50'
                                }`}
                            >
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Input Massal (Tabel Multi-Baris)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalMode('SINGLE')}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-black rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
                                    modalMode === 'SINGLE'
                                        ? 'bg-white text-purple-800 border-purple-600 shadow-sm'
                                        : 'bg-transparent text-gray-600 hover:text-gray-900 border-transparent hover:bg-white/50'
                                }`}
                            >
                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Input Satuan (Single)</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">

                            {/* MODE 1: VISUAL PER-UNIT SCHEMATIC BULK INPUT */}
                            {modalMode === 'UNIT' && (
                                <form onSubmit={submitUnitBulk} className="space-y-6">
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex-1 min-w-[240px]">
                                            <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1">
                                                PILIH UNIT YANG AKAN DI-SETUP / DIPASANG BAN:
                                            </label>
                                            <select
                                                value={unitModalUnitId}
                                                onChange={e => setUnitModalUnitId(e.target.value)}
                                                className="w-full bg-white border-gray-300 rounded-xl text-sm font-bold shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                {wheelUnits.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.code_unit} — {u.type_unit} (HM Saat ini: {u.hm || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 font-semibold">Model Sasis / Roda:</div>
                                                <div className="text-sm font-black text-gray-900">{currentUnitConfig.typeName}</div>
                                            </div>
                                            <div className="h-8 w-px bg-gray-200"></div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 font-semibold">Total Slot Posisi:</div>
                                                <div className="text-sm font-black text-blue-600 font-mono">{currentUnitConfig.totalWheels} Roda</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Diagram */}
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-slate-50/50">
                                        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-gray-200 flex items-center justify-between">
                                            <div className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                                <span>🗺️ Skema Posisi Roda Sesuai Tipe Unit</span>
                                                <span className="text-[11px] text-gray-500 font-normal">
                                                    (Klik salah satu slot roda pada diagram untuk langsung mengisi Serial Number di bawah)
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-mono font-bold text-slate-600">
                                                Unit: {currentUnit?.code_unit}
                                            </span>
                                        </div>

                                        <div className="p-4">
                                            <UnitTyreDiagram
                                                unit={currentUnit}
                                                existingTyres={existingUnitTyres}
                                                pendingTyres={unitSlotInputs}
                                                selectedPos={selectedDiagramPos}
                                                onSelectPos={(posId) => {
                                                    setSelectedDiagramPos(posId);
                                                    handleSlotChange(posId, 'enabled', true);
                                                    const el = document.getElementById(`slot-input-${posId}`);
                                                    if (el) el.focus();
                                                }}
                                                interactive={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Spec Fill */}
                                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                                                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                                                    Spesifikasi Umum (Salin Cepat ke Semua Posisi Roda)
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyCommonToAll}
                                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5 transition active:scale-95"
                                            >
                                                <span>⚡ Terapkan Spek ini ke Semua Slot Roda</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Brand</label>
                                                <input
                                                    type="text"
                                                    value={commonSpec.brand}
                                                    onChange={e => setCommonSpec({ ...commonSpec, brand: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Size / Ukuran</label>
                                                <input
                                                    type="text"
                                                    value={commonSpec.type_size}
                                                    onChange={e => setCommonSpec({ ...commonSpec, type_size: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Pattern</label>
                                                <input
                                                    type="text"
                                                    value={commonSpec.pattern}
                                                    onChange={e => setCommonSpec({ ...commonSpec, pattern: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">OTD (mm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={commonSpec.otd}
                                                    onChange={e => setCommonSpec({ ...commonSpec, otd: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">RTD (mm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={commonSpec.rtd}
                                                    onChange={e => setCommonSpec({ ...commonSpec, rtd: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">PSI</label>
                                                <input
                                                    type="number"
                                                    value={commonSpec.psi}
                                                    onChange={e => setCommonSpec({ ...commonSpec, psi: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">HM Pasang</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={commonSpec.installed_hm}
                                                    onChange={e => setCommonSpec({ ...commonSpec, installed_hm: e.target.value })}
                                                    className="w-full text-xs font-mono font-bold border-gray-300 rounded-lg py-1 px-2 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Tgl Pasang</label>
                                                <input
                                                    type="date"
                                                    value={commonSpec.purchase_date}
                                                    onChange={e => setCommonSpec({ ...commonSpec, purchase_date: e.target.value })}
                                                    className="w-full text-xs font-bold border-gray-300 rounded-lg py-1 px-2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Position Inputs Grid */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">
                                                Daftar Posisi Roda Unit {currentUnit?.code_unit} ({currentUnitConfig.positions.length} Posisi):
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = { ...unitSlotInputs };
                                                        currentUnitConfig.positions.forEach(p => {
                                                            if (updated[p.id]) updated[p.id].enabled = true;
                                                        });
                                                        setUnitSlotInputs(updated);
                                                    }}
                                                    className="text-xs font-bold text-blue-600 hover:underline"
                                                >
                                                    Centang Semua
                                                </button>
                                                <span>•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = { ...unitSlotInputs };
                                                        currentUnitConfig.positions.forEach(p => {
                                                            if (updated[p.id]) updated[p.id].enabled = false;
                                                        });
                                                        setUnitSlotInputs(updated);
                                                    }}
                                                    className="text-xs font-bold text-gray-500 hover:underline"
                                                >
                                                    Batal Centang
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {currentUnitConfig.positions.map(pos => {
                                                const slot = unitSlotInputs[pos.id] || {};
                                                const isEnabled = Boolean(slot.enabled);
                                                const existingTyre = existingUnitTyres[pos.id];
                                                const isFocused = selectedDiagramPos === pos.id;

                                                return (
                                                    <div 
                                                        key={pos.id}
                                                        className={`border-2 rounded-xl p-3 transition-all ${
                                                            isFocused 
                                                                ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-400/30'
                                                                : isEnabled
                                                                ? 'border-emerald-300 bg-emerald-50/20'
                                                                : 'border-gray-200 bg-gray-50/60 opacity-80'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isEnabled}
                                                                    onChange={e => handleSlotChange(pos.id, 'enabled', e.target.checked)}
                                                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                                />
                                                                <span className="font-mono font-black text-sm text-gray-900 bg-gray-200/80 px-2 py-0.5 rounded">
                                                                    {pos.id}
                                                                </span>
                                                                <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]" title={pos.name}>
                                                                    {pos.name}
                                                                </span>
                                                            </label>

                                                            {existingTyre ? (
                                                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                                                    Terpasang: {existingTyre.serial_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                    Slot Kosong
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isEnabled && (
                                                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-100">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <label className="text-[11px] font-black text-gray-800 uppercase">
                                                                            Serial Number Ban Baru <span className="text-red-500">*</span>
                                                                        </label>
                                                                        {existingTyre && (
                                                                            <span className="text-[10px] text-orange-600 font-semibold">
                                                                                ⚠️ Ban lama ({existingTyre.serial_number}) otomatis dipindah ke Stock
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <input
                                                                        id={`slot-input-${pos.id}`}
                                                                        type="text"
                                                                        required={isEnabled}
                                                                        value={slot.serial_number || ''}
                                                                        onChange={e => handleSlotChange(pos.id, 'serial_number', e.target.value)}
                                                                        placeholder={`Contoh: 24111217101`}
                                                                        className="w-full text-xs font-black uppercase tracking-wider font-mono border-gray-300 rounded-lg py-1.5 px-3 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm"
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-4 gap-2">
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500">Brand</label>
                                                                        <input
                                                                            type="text"
                                                                            value={slot.brand || commonSpec.brand}
                                                                            onChange={e => handleSlotChange(pos.id, 'brand', e.target.value)}
                                                                            className="w-full text-xs border-gray-300 rounded py-1 px-1.5 font-semibold"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500">Size</label>
                                                                        <input
                                                                            type="text"
                                                                            value={slot.type_size || commonSpec.type_size}
                                                                            onChange={e => handleSlotChange(pos.id, 'type_size', e.target.value)}
                                                                            className="w-full text-xs border-gray-300 rounded py-1 px-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500">Pattern</label>
                                                                        <input
                                                                            type="text"
                                                                            value={slot.pattern || commonSpec.pattern}
                                                                            onChange={e => handleSlotChange(pos.id, 'pattern', e.target.value)}
                                                                            className="w-full text-xs border-gray-300 rounded py-1 px-1.5 font-semibold"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500">RTD (mm)</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            value={slot.rtd || commonSpec.rtd}
                                                                            onChange={e => handleSlotChange(pos.id, 'rtd', e.target.value)}
                                                                            className="w-full text-xs border-gray-300 rounded py-1 px-1.5 font-mono"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                        <div className="text-xs text-gray-600">
                                            <span>Posisi roda yang dicentang dan diisi serial number akan otomatis tersimpan ke unit <strong className="text-gray-900">{currentUnit?.code_unit}</strong>.</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm shadow-lg flex items-center gap-2 transition disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Menyimpan Ban...' : `Simpan Semua Tyre ke ${currentUnit?.code_unit}`}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* MODE 2: BATCH SPREADSHEET */}
                            {modalMode === 'BATCH' && (
                                <form onSubmit={submitBatchSpreadsheet} className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl">
                                        <div>
                                            <h4 className="text-xs font-black text-blue-900 uppercase">
                                                Tabel Input Massal (Multi-Baris Spreadsheet)
                                            </h4>
                                            <p className="text-xs text-blue-700">
                                                Tambahkan ban sebanyak yang Anda butuhkan baik untuk status ACTIVE (terpasang di unit) maupun STOCK (gudang).
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddBatchRows(1)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
                                            >
                                                + 1 Baris
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAddBatchRows(5)}
                                                className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
                                            >
                                                + 5 Baris
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-inner max-h-[500px]">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10 border-b border-gray-300">
                                                <tr>
                                                    <th className="p-2 w-8 text-center font-bold">#</th>
                                                    <th className="p-2 min-w-[100px] font-bold">Kondisi</th>
                                                    <th className="p-2 min-w-[150px] font-bold">Unit</th>
                                                    <th className="p-2 min-w-[110px] font-bold">Posisi</th>
                                                    <th className="p-2 min-w-[160px] font-bold">Serial Number *</th>
                                                    <th className="p-2 min-w-[130px] font-bold">Brand *</th>
                                                    <th className="p-2 min-w-[120px] font-bold">Size</th>
                                                    <th className="p-2 min-w-[100px] font-bold">Pattern</th>
                                                    <th className="p-2 min-w-[80px] font-bold">OTD</th>
                                                    <th className="p-2 min-w-[80px] font-bold">RTD</th>
                                                    <th className="p-2 min-w-[70px] font-bold">PSI</th>
                                                    <th className="p-2 min-w-[100px] font-bold">HM Pasang</th>
                                                    <th className="p-2 min-w-[120px] font-bold">Tgl Pasang</th>
                                                    <th className="p-2 w-10 text-center font-bold">Del</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {batchRows.map((row, idx) => {
                                                    const rowUnit = wheelUnits.find(u => String(u.id) === String(row.unit_id));
                                                    const rowPositions = rowUnit ? getUnitTyreConfig(rowUnit.type_unit).positions : [];

                                                    return (
                                                        <tr key={row.id || idx} className="hover:bg-blue-50/30">
                                                            <td className="p-2 text-center font-mono font-bold text-gray-400">{idx + 1}</td>
                                                            <td className="p-1">
                                                                <select
                                                                    value={row.condition}
                                                                    onChange={e => handleBatchRowChange(idx, 'condition', e.target.value)}
                                                                    className="w-full text-xs font-bold border-gray-300 rounded p-1"
                                                                >
                                                                    <option value="ACTIVE">ACTIVE</option>
                                                                    <option value="STOCK">STOCK</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-1">
                                                                <select
                                                                    value={row.unit_id}
                                                                    disabled={row.condition === 'STOCK'}
                                                                    onChange={e => handleBatchRowChange(idx, 'unit_id', e.target.value)}
                                                                    className="w-full text-xs font-semibold border-gray-300 rounded p-1 disabled:bg-gray-100 disabled:text-gray-400"
                                                                >
                                                                    <option value="">-- Pilih Unit --</option>
                                                                    {wheelUnits.map(u => (
                                                                        <option key={u.id} value={u.id}>{u.code_unit} ({u.type_unit})</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="p-1">
                                                                <select
                                                                    value={row.position}
                                                                    disabled={row.condition === 'STOCK'}
                                                                    onChange={e => handleBatchRowChange(idx, 'position', e.target.value)}
                                                                    className="w-full text-xs font-bold border-gray-300 rounded p-1 disabled:bg-gray-100 disabled:text-gray-400"
                                                                >
                                                                    {rowPositions.length > 0 ? (
                                                                        rowPositions.map(p => (
                                                                            <option key={p.id} value={p.id}>{p.id} ({p.side})</option>
                                                                        ))
                                                                    ) : (
                                                                        ['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Pos 7', 'Pos 8', 'Pos 9', 'Pos 10', 'Pos 11', 'Pos 12', 'Pos Spare'].map(p => (
                                                                            <option key={p} value={p}>{p}</option>
                                                                        ))
                                                                    )}
                                                                </select>
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="SN..."
                                                                    value={row.serial_number}
                                                                    onChange={e => handleBatchRowChange(idx, 'serial_number', e.target.value)}
                                                                    className="w-full text-xs font-black uppercase font-mono border-gray-300 rounded p-1 bg-white"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="text"
                                                                    value={row.brand}
                                                                    onChange={e => handleBatchRowChange(idx, 'brand', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="text"
                                                                    value={row.type_size}
                                                                    onChange={e => handleBatchRowChange(idx, 'type_size', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="text"
                                                                    value={row.pattern}
                                                                    onChange={e => handleBatchRowChange(idx, 'pattern', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    value={row.otd}
                                                                    onChange={e => handleBatchRowChange(idx, 'otd', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    value={row.rtd}
                                                                    onChange={e => handleBatchRowChange(idx, 'rtd', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="number"
                                                                    value={row.psi}
                                                                    onChange={e => handleBatchRowChange(idx, 'psi', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    disabled={row.condition === 'STOCK'}
                                                                    value={row.installed_hm}
                                                                    onChange={e => handleBatchRowChange(idx, 'installed_hm', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1 font-mono disabled:bg-gray-100"
                                                                />
                                                            </td>
                                                            <td className="p-1">
                                                                <input
                                                                    type="date"
                                                                    value={row.purchase_date}
                                                                    onChange={e => handleBatchRowChange(idx, 'purchase_date', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 rounded p-1"
                                                                />
                                                            </td>
                                                            <td className="p-1 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveBatchRow(idx)}
                                                                    className="text-red-500 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="text-xs text-gray-500">
                                            Total Baris: <strong className="text-gray-900">{batchRows.length} Baris</strong>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-sm shadow-lg transition disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Baris ke Database'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* MODE 3: SINGLE REGISTRATION */}
                            {modalMode === 'SINGLE' && (
                                <form onSubmit={submitSingle} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Serial Number Tyre *</label>
                                            <input
                                                type="text"
                                                value={singleData.serial_number}
                                                onChange={e => setSingleData('serial_number', e.target.value.toUpperCase())}
                                                required
                                                placeholder="Contoh: 24111217101"
                                                className="w-full border-gray-300 rounded-lg text-sm font-mono font-bold uppercase"
                                            />
                                            {singleErrors.serial_number && <p className="text-red-500 text-xs mt-1">{singleErrors.serial_number}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Brand *</label>
                                            <input
                                                type="text"
                                                value={singleData.brand}
                                                onChange={e => setSingleData('brand', e.target.value)}
                                                required
                                                className="w-full border-gray-300 rounded-lg text-sm font-bold"
                                            />
                                            {singleErrors.brand && <p className="text-red-500 text-xs mt-1">{singleErrors.brand}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Type / Size</label>
                                            <input
                                                type="text"
                                                value={singleData.type_size}
                                                onChange={e => setSingleData('type_size', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Pattern</label>
                                            <input
                                                type="text"
                                                value={singleData.pattern}
                                                onChange={e => setSingleData('pattern', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">OTD (mm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={singleData.otd}
                                                onChange={e => setSingleData('otd', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Remain Tread (RTD - mm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={singleData.rtd}
                                                onChange={e => setSingleData('rtd', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Tekanan Angin (PSI)</label>
                                            <input
                                                type="number"
                                                value={singleData.psi}
                                                onChange={e => setSingleData('psi', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Date Instal</label>
                                            <input
                                                type="date"
                                                value={singleData.purchase_date}
                                                onChange={e => setSingleData('purchase_date', e.target.value)}
                                                required
                                                className="w-full border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Status Awal</label>
                                            <select
                                                value={singleData.condition}
                                                onChange={e => setSingleData('condition', e.target.value)}
                                                className="w-full border-gray-300 rounded-lg text-sm font-bold"
                                            >
                                                <option value="ACTIVE">ACTIVE (Terpasang pada Unit)</option>
                                                <option value="STOCK">STOCK (Siap Pakai di Gudang)</option>
                                            </select>
                                        </div>

                                        {singleData.condition === 'ACTIVE' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Unit *</label>
                                                    <select
                                                        value={singleData.unit_id}
                                                        onChange={e => handleSingleUnitChange(e.target.value)}
                                                        required
                                                        className="w-full border-gray-300 rounded-lg text-sm font-bold"
                                                    >
                                                        <option value="">Pilih Unit...</option>
                                                        {wheelUnits.map(u => (
                                                            <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Posisi Roda *
                                                    </label>
                                                    <select
                                                        value={singleData.position}
                                                        onChange={e => setSingleData('position', e.target.value)}
                                                        required
                                                        className="w-full border-gray-300 rounded-lg text-sm font-bold"
                                                    >
                                                        {singleUnitPositions.length > 0 ? (
                                                            singleUnitPositions.map(pos => (
                                                                <option key={pos.id} value={pos.id}>
                                                                    {pos.id} — {pos.name}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            ['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6'].map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">HM Saat Pasang</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={singleData.installed_hm}
                                                        onChange={e => setSingleData('installed_hm', e.target.value)}
                                                        required
                                                        className="w-full border-gray-300 rounded-lg text-sm font-mono"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Catatan / Remark</label>
                                        <input
                                            type="text"
                                            value={singleData.notes}
                                            onChange={e => setSingleData('notes', e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                            placeholder="Contoh: NEW TYRE, EKS OHT..., dsb."
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={singleProcessing}
                                            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-black text-sm shadow-lg transition disabled:opacity-50"
                                        >
                                            {singleProcessing ? 'Menyimpan...' : 'Simpan Tyre Baru'}
                                        </button>
                                    </div>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
