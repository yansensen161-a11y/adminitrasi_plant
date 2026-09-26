import React, { useState, useMemo, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Download, 
    Printer, 
    Plus, 
    Search, 
    RefreshCw, 
    Edit, 
    Trash2, 
    X,
    Filter,
    ChevronDown,
    ArrowUpDown,
    Check,
    Maximize2,
    Minimize2,
    Image as ImageIcon,
    Camera,
    UploadCloud,
    ShoppingCart,
    ExternalLink,
    Eye,
    AlertCircle,
    FileText
} from 'lucide-react';

const DEFAULT_COMPONENT_GROUPS = [
    "AC SYSTEM", "ACCESSORIES", "ACCIDENT", "AIR SYSTEM", "ATTACHMENT", "AUTOLUBE",
    "BATTERY", "BLADE", "BRAKE SYSTEM", "BUCKET", "CABIN", "CLUTCH", "COOLING SYSTEM",
    "DAMPER", "DIFFERENTIAL", "ELECTRIC SYSTEM", "ENGINE", "FINAL DRIVE",
    "FRAME/BODY/GUARD/CHASSIS", "FRONT AXLE", "FUEL SYSTEM", "GET", "GREASING", "HOSES",
    "HYDRAULIC SYSTEM", "INTAKE & EXHAUST SYSTEM", "LEVEL OIL/COOLANT", "MAINTENANCE/SERVICE",
    "PROPELLER SHAFT", "PTO", "RADIATOR", "RADIO", "REAR AXLE", "STEERING SYSTEM", "SUSPENSION",
    "SWING", "TAIL GATE", "TRANSMISSION", "TYRE", "UNDERCARRIAGE", "VESSEL", "WASHING",
    "WATER CANON/SPRAYER", "WHEEL & HUB"
];

export default function P2hMonitoring({ 
    p2hData = [], 
    summary = {}, 
    units = [], 
    filters = {}, 
    nextWoNumber = 'PLT/WO/INS/001',
    componentGroups = [] 
}) {
    const { flash } = usePage().props;

    const availableComponentGroups = useMemo(() => {
        return componentGroups && componentGroups.length > 0 ? componentGroups : DEFAULT_COMPONENT_GROUPS;
    }, [componentGroups]);

    // Full Screen State
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Filters & Search
    const [search, setSearch] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [statusFilter, setStatusFilter] = useState(filters.statusFilter || '');
    const [priorityFilter, setPriorityFilter] = useState(filters.priorityFilter || '');
    const [componentGroupFilter, setComponentGroupFilter] = useState(filters.componentGroupFilter || '');

    // Sorting state
    const [sortField, setSortField] = useState('date');
    const [sortDir, setSortDir] = useState('desc');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // File input ref
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Form state
    const initialForm = {
        unit_id: '',
        code_unit: '',
        wo_number: nextWoNumber || 'PLT/WO/INS/001',
        model: '',
        component_group: '',
        component_name: '',
        priority: 'P2',
        date: new Date().toISOString().split('T')[0],
        hm: '',
        finding: '',
        inspect_by: '',
        action: '',
        closed_by: '',
        status: 'OPEN',
        image: null,
        image_preview: null,
        remove_image: false,
    };
    const [formData, setFormData] = useState(initialForm);

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get('/inspection-unit', {
            search,
            dateFrom,
            dateTo,
            codeUnitFilter,
            statusFilter,
            priorityFilter,
            componentGroupFilter
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setStatusFilter('');
        setPriorityFilter('');
        setComponentGroupFilter('');
        router.get('/inspection-unit', {}, { preserveState: true, preserveScroll: true });
    };

    const handleUnitSelect = (unitId) => {
        const u = units.find(item => item.id?.toString() === unitId?.toString());
        if (u) {
            setFormData(prev => ({
                ...prev,
                unit_id: u.id,
                code_unit: u.code_unit,
                model: u.model || '',
                hm: u.hm || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, unit_id: '', code_unit: '', model: '', hm: '' }));
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            ...initialForm,
            wo_number: nextWoNumber || 'PLT/WO/INS/001',
            date: new Date().toISOString().split('T')[0],
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowModal(true);
    };

    const openEditModal = (row) => {
        setIsEditing(true);
        setEditingId(row.id);
        const u = units.find(item => item.code_unit === row.code_unit);
        setFormData({
            unit_id: u?.id || row.unit_id || '',
            code_unit: row.code_unit,
            wo_number: row.wo_number || '',
            model: row.model_unit || row.model || '',
            component_group: row.component_group && row.component_group !== '-' ? row.component_group : '',
            component_name: row.component_name && row.component_name !== '-' ? row.component_name : '',
            priority: row.priority || 'P2',
            date: row.raw_date || (row.date ? row.date.split('/').reverse().join('-') : new Date().toISOString().split('T')[0]),
            hm: row.raw_hm || row.hm || '',
            finding: row.finding || '',
            inspect_by: row.inspect_by || '',
            action: row.action && row.action !== '-' ? row.action : '',
            closed_by: row.closed_by && row.closed_by !== '-' ? row.closed_by : '',
            status: row.status || 'OPEN',
            image: null,
            image_preview: row.image_url || null,
            remove_image: false,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowModal(true);
    };

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar (JPG, PNG, WEBP).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran gambar maksimal adalah 10 MB.');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            image: file,
            image_preview: previewUrl,
            remove_image: false,
        }));
    };

    const handleRemoveImage = () => {
        if (formData.image_preview && formData.image_preview.startsWith('blob:')) {
            URL.revokeObjectURL(formData.image_preview);
        }
        setFormData(prev => ({
            ...prev,
            image: null,
            image_preview: null,
            remove_image: true,
        }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.code_unit) {
            alert('Silakan pilih unit terlebih dahulu.');
            return;
        }

        if (isEditing && editingId) {
            // Using POST with _method = 'put' to allow multipart/form-data with file upload
            router.post(`/inspection-unit/${editingId}`, {
                ...formData,
                _method: 'put'
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        } else {
            router.post('/inspection-unit', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        }
    };

    const handleDelete = (id, codeUnit) => {
        if (confirm(`Hapus catatan temuan inspeksi untuk unit ${codeUnit}?`)) {
            router.delete(`/inspection-unit/${id}`, { preserveScroll: true });
        }
    };

    // Client-side sorting
    const sortedData = useMemo(() => {
        const data = [...p2hData];
        return data.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';

            if (sortField === 'aging' || sortField === 'aging_days' || sortField === 'hm' || sortField === 'raw_hm') {
                valA = Number(a.raw_hm ?? a.aging_days ?? 0);
                valB = Number(b.raw_hm ?? b.aging_days ?? 0);
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [p2hData, sortField, sortDir]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inspection Unit" />

            <div className="flex flex-col bg-slate-50 dark:bg-transparent min-h-screen pb-14">
                
                {/* Header Top Navbar */}
                <div className="bg-white dark:bg-[#060b14] px-6 py-4 flex items-center justify-between shadow-xs border-b border-gray-200 dark:border-white/10 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400 text-black flex items-center justify-center font-black text-xl shadow-xs">
                            🔍
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] dark:text-white tracking-tight flex items-center gap-2">
                                Inspection Unit
                                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 tracking-wider">
                                    Defect & Finding Control
                                </span>
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                <Link href="/portal" className="hover:text-blue-600 transition-colors">Portal</Link>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-gray-600 dark:text-gray-300">Preventive Maintenance</span>
                                <span className="mx-1.5">&gt;</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Inspection Unit</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Input Temuan Baru Button */}
                        <button 
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b6e4f] hover:bg-[#095940] text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>+ Input Temuan Baru</span>
                        </button>

                        <a 
                            href={`/inspection-unit/export?dateFrom=${dateFrom}&dateTo=${dateTo}&codeUnitFilter=${codeUnitFilter}&statusFilter=${statusFilter}&priorityFilter=${priorityFilter}&componentGroupFilter=${componentGroupFilter}&search=${encodeURIComponent(search)}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-[#0b6e4f] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm font-bold rounded-lg shadow-xs transition-all"
                        >
                            <Download size={16} />
                            <span>Export Excel</span>
                        </a>

                        <button 
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-bold rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                            <Printer size={16} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                {/* Main Container - Expands full width */}
                <div className={`w-full ${isFullscreen ? 'px-4 lg:px-8' : 'px-4 lg:px-6'} pt-5 space-y-4`}>
                    
                    {/* Flash Alert */}
                    {(flash?.success || flash?.message) && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 text-emerald-900 dark:text-emerald-100 shadow-sm print:hidden">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="flex-1 text-sm font-bold">{flash.success || flash.message}</div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 text-red-900 dark:text-red-100 shadow-sm print:hidden">
                            <X size={20} className="text-red-600 shrink-0" />
                            <div className="flex-1 text-sm font-bold">{flash.error}</div>
                        </div>
                    )}

                    {/* Summary KPI Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 print:hidden">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Finding</span>
                                <div className="text-lg font-black text-gray-900 dark:text-white mt-0.5">{summary.total_findings ?? p2hData.length}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                                📋
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">P1 - Urgent</span>
                                <div className="text-lg font-black text-red-600 mt-0.5">{summary.p1 ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-sm">
                                🚨
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">P2 - Medium</span>
                                <div className="text-lg font-black text-amber-600 mt-0.5">{summary.p2 ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-sm">
                                ⚡
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">P3 - Low</span>
                                <div className="text-lg font-black text-emerald-600 mt-0.5">{summary.p3 ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                🟢
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Open</span>
                                <div className="text-lg font-black text-red-600 mt-0.5">{summary.open ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-sm">
                                ⚠️
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Progress</span>
                                <div className="text-lg font-black text-blue-600 mt-0.5">{summary.progress ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-sm">
                                ⏳
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-3 flex items-center justify-between shadow-xs">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Closed</span>
                                <div className="text-lg font-black text-emerald-600 mt-0.5">{summary.closed ?? 0}</div>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                ✅
                            </span>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-gray-200 dark:border-slate-700 p-4 print:hidden">
                        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-3 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Cari Finding / Component / No WO
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Ketik kata kunci pencarian..."
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                        className="w-full text-xs pl-8 pr-3 py-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                    />
                                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Unit
                                </label>
                                <select 
                                    value={codeUnitFilter} 
                                    onChange={e => setCodeUnitFilter(e.target.value)} 
                                    className="w-full text-xs py-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Semua Unit</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.code_unit}>
                                            {u.code_unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Priority
                                </label>
                                <select 
                                    value={priorityFilter} 
                                    onChange={e => setPriorityFilter(e.target.value)} 
                                    className="w-full text-xs py-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white font-semibold"
                                >
                                    <option value="">Semua Priority</option>
                                    <option value="P1">P1 - Urgent</option>
                                    <option value="P2">P2 - Medium</option>
                                    <option value="P3">P3 - Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Component Group
                                </label>
                                <select 
                                    value={componentGroupFilter} 
                                    onChange={e => setComponentGroupFilter(e.target.value)} 
                                    className="w-full text-xs py-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Semua Component</option>
                                    {availableComponentGroups.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value)} 
                                    className="w-full text-xs py-2 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="OPEN">OPEN</option>
                                    <option value="PROGRESS">PROGRESS</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Tanggal
                                </label>
                                <input 
                                    type="date" 
                                    value={dateFrom} 
                                    onChange={e => setDateFrom(e.target.value)} 
                                    className="w-full text-xs py-1.5 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                />
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-[#0b6e4f] hover:bg-[#095940] text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter size={13} />
                                    <span>Filter</span>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleReset} 
                                    className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    title="Reset Filter"
                                >
                                    <RefreshCw size={13} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Exact User Requested Table with Cyan #00F0D0 Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-gray-300 dark:border-slate-700 overflow-hidden">
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse font-sans">
                                <thead>
                                    <tr className="bg-[#00F0D0] text-black border-b-2 border-black divide-x divide-black/30">
                                        
                                        {/* 1. NO WO */}
                                        <th 
                                            onClick={() => handleSort('wo_number')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>NO WO</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 2. DATE */}
                                        <th 
                                            onClick={() => handleSort('date')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>DATE</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 3. Unit */}
                                        <th 
                                            onClick={() => handleSort('code_unit')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>Unit</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 4. MODEL UNIT */}
                                        <th 
                                            onClick={() => handleSort('model_unit')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>MODEL UNIT</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 5. FOTO */}
                                        <th 
                                            className="px-2.5 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <span>FOTO</span>
                                        </th>

                                        {/* 6. COMPONENT GROUP */}
                                        <th 
                                            onClick={() => handleSort('component_group')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>COMPONENT GROUP</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 7. COMPONENT NAME */}
                                        <th 
                                            onClick={() => handleSort('component_name')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>COMPONENT NAME</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 8. PRIORITY */}
                                        <th 
                                            onClick={() => handleSort('priority')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>PRIORITY</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 9. HM */}
                                        <th 
                                            onClick={() => handleSort('raw_hm')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>HM</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 10. FINDING */}
                                        <th 
                                            onClick={() => handleSort('finding')} 
                                            className="px-4 py-3 font-black text-center uppercase tracking-wider text-xs min-w-[240px] cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>FINDING</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 11. INSPECT BY */}
                                        <th 
                                            onClick={() => handleSort('inspect_by')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>INSPECT BY</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 12. AGING (days) */}
                                        <th 
                                            onClick={() => handleSort('aging')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>AGING (days)</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 13. ACTION */}
                                        <th 
                                            onClick={() => handleSort('action')} 
                                            className="px-4 py-3 font-black text-center uppercase tracking-wider text-xs min-w-[220px] cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span>ACTION</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 14. Closed by */}
                                        <th 
                                            onClick={() => handleSort('closed_by')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>Closed by</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 15. STATUS */}
                                        <th 
                                            onClick={() => handleSort('status')} 
                                            className="px-3 py-3 font-black text-center uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer select-none hover:bg-[#00dfc2] transition-colors relative"
                                            style={{ backgroundColor: '#00F0D0', color: '#000000' }}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span>STATUS</span>
                                                <span className="text-[10px] opacity-80">▼</span>
                                            </div>
                                        </th>

                                        {/* 16. OPSI */}
                                        <th className="px-3 py-3 font-black text-center text-xs whitespace-nowrap print:hidden" style={{ backgroundColor: '#00F0D0', color: '#000000' }}>
                                            OPSI
                                        </th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200">
                                    {sortedData.length === 0 ? (
                                        <tr>
                                            <td colSpan="16" className="py-12 text-center text-gray-400 font-semibold">
                                                Tidak ada data temuan inspeksi unit yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedData.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 transition-colors divide-x divide-gray-100 dark:divide-slate-800">
                                                
                                                {/* 1. NO WO */}
                                                <td className="px-3 py-2.5 text-center font-mono font-bold whitespace-nowrap">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono">
                                                        {row.wo_number || 'PLT/WO/INS/001'}
                                                    </span>
                                                </td>

                                                {/* 2. DATE */}
                                                <td className="px-3 py-2.5 text-center font-medium whitespace-nowrap">
                                                    {row.date}
                                                </td>

                                                {/* 3. Unit */}
                                                <td className="px-3 py-2.5 text-center font-black text-[#012922] dark:text-cyan-400 whitespace-nowrap">
                                                    {row.code_unit}
                                                </td>

                                                {/* 4. MODEL UNIT */}
                                                <td className="px-3 py-2.5 text-left font-medium whitespace-nowrap">
                                                    {row.model_unit || '-'}
                                                </td>

                                                {/* 5. FOTO */}
                                                <td className="px-2 py-2 text-center whitespace-nowrap">
                                                    {row.image_url ? (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedPhoto(row)}
                                                            className="group relative inline-block rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 hover:ring-2 hover:ring-cyan-400 transition-all shadow-2xs cursor-pointer"
                                                            title="Klik untuk melihat foto resolusi penuh"
                                                        >
                                                            <img 
                                                                src={row.image_url} 
                                                                alt={row.finding} 
                                                                className="w-10 h-10 object-cover object-center group-hover:scale-110 transition-transform duration-200" 
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                                <Eye size={13} />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300 dark:text-gray-600 text-xs font-mono">-</span>
                                                    )}
                                                </td>

                                                {/* 6. COMPONENT GROUP */}
                                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                    {row.component_group && row.component_group !== '-' ? (
                                                        <span className="inline-block px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 text-[#012922] dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                                                            {row.component_group}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>

                                                {/* 7. COMPONENT NAME */}
                                                <td className="px-3 py-2.5 text-left font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                    {row.component_name || '-'}
                                                </td>

                                                {/* 8. PRIORITY */}
                                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                    {row.priority === 'P1' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800">
                                                            <AlertTriangle size={11} className="text-red-600" />
                                                            <span>P1 - Urgent</span>
                                                        </span>
                                                    )}
                                                    {row.priority === 'P2' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                                                            <span>P2 - Medium</span>
                                                        </span>
                                                    )}
                                                    {row.priority === 'P3' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                                                            <span>P3 - Low</span>
                                                        </span>
                                                    )}
                                                    {!['P1', 'P2', 'P3'].includes(row.priority) && (
                                                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
                                                            {row.priority || '-'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 9. HM */}
                                                <td className="px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                                                    {row.hm}
                                                </td>

                                                {/* 10. FINDING */}
                                                <td className="px-4 py-2.5 text-left font-medium text-gray-900 dark:text-gray-100 leading-snug">
                                                    {row.finding}
                                                </td>

                                                {/* 11. INSPECT BY */}
                                                <td className="px-3 py-2.5 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                    {row.inspect_by}
                                                </td>

                                                {/* 12. AGING (days) */}
                                                <td className="px-3 py-2.5 text-center font-mono font-bold whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                                        row.status === 'CLOSED' 
                                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-500' 
                                                            : row.aging > 3 
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-black' 
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}>
                                                        {row.aging} hari
                                                    </span>
                                                </td>

                                                {/* 13. ACTION */}
                                                <td className="px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 leading-snug">
                                                    {row.action || '-'}
                                                </td>

                                                {/* 14. Closed by */}
                                                <td className="px-3 py-2.5 text-center font-medium whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                    {row.closed_by || '-'}
                                                </td>

                                                {/* 15. STATUS */}
                                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                    {row.status === 'OPEN' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
                                                            OPEN
                                                        </span>
                                                    )}
                                                    {row.status === 'PROGRESS' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                                                            PROGRESS
                                                        </span>
                                                    )}
                                                    {row.status === 'CLOSED' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                                            CLOSED
                                                        </span>
                                                    )}
                                                    {!['OPEN', 'PROGRESS', 'CLOSED'].includes(row.status) && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gray-100 text-gray-800 border border-gray-300">
                                                            {row.status}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 16. OPSI (Print hidden) */}
                                                <td className="px-2.5 py-2.5 text-center whitespace-nowrap print:hidden">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Create Order Button with Prefilled params */}
                                                        <Link 
                                                            href={`/monitoring-orderan/create?unit_id=${encodeURIComponent(row.unit_id || '')}&code_unit=${encodeURIComponent(row.code_unit || '')}&hm=${encodeURIComponent(row.raw_hm || row.hm || '')}&component=${encodeURIComponent(row.component_group && row.component_group !== '-' ? row.component_group : '')}&component_name=${encodeURIComponent(row.component_name && row.component_name !== '-' ? row.component_name : '')}&priority=${encodeURIComponent(row.priority || 'P2')}&root_cause=${encodeURIComponent(row.finding || '')}&action_taken=${encodeURIComponent(row.action && row.action !== '-' ? row.action : '')}&no_wo=${encodeURIComponent(row.wo_number || '')}`}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                                                            title="Buat Orderan Baru untuk Temuan Ini"
                                                        >
                                                            <ShoppingCart size={15} />
                                                        </Link>

                                                        {/* Edit Button */}
                                                        <button 
                                                            onClick={() => openEditModal(row)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors cursor-pointer"
                                                            title="Edit Temuan & Update Tindakan"
                                                        >
                                                            <Edit size={14} />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button 
                                                            onClick={() => handleDelete(row.id, row.code_unit)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>

            {/* Modal Create / Edit with Image Upload & Components */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 relative">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/80 dark:bg-slate-800/80">
                            <div>
                                <h3 className="text-base font-black text-[#012922] dark:text-white flex items-center gap-2">
                                    <span>{isEditing ? '✏️ Update Temuan Inspeksi' : '➕ Input Temuan Inspection Unit'}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isEditing ? `Mengubah data temuan untuk unit ${formData.code_unit}` : 'Catat temuan ketidaksesuaian/defect hasil inspeksi unit'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            
                            {/* Baris 1: Nomor WO & Unit */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Nomor WO (NO WO)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.wo_number} 
                                            onChange={e => setFormData(prev => ({ ...prev, wo_number: e.target.value }))} 
                                            placeholder="PLT/WO/INS/001"
                                            className="w-full text-sm font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f]" 
                                        />
                                        <span className="absolute right-2.5 top-2.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                                            AUTO
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Pilih Unit *
                                    </label>
                                    <select 
                                        required
                                        disabled={isEditing}
                                        value={formData.unit_id} 
                                        onChange={e => handleUnitSelect(e.target.value)} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800 font-bold"
                                    >
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.code_unit} {u.model ? `(${u.model})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Baris 2: Model & Tanggal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Model Unit
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Auto-filled model..."
                                        value={formData.model} 
                                        onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Tanggal Pemeriksaan (DATE) *
                                    </label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.date} 
                                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                    />
                                </div>
                            </div>

                            {/* Baris 3: Component Group & Component Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Component Group
                                    </label>
                                    <select
                                        value={formData.component_group}
                                        onChange={e => setFormData(prev => ({ ...prev, component_group: e.target.value }))}
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white font-medium"
                                    >
                                        <option value="">-- Pilih Component Group --</option>
                                        {availableComponentGroups.map(grp => (
                                            <option key={grp} value={grp}>{grp}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Component Name
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="cth: Cylinder Rod, Seal Kit, Turbo..."
                                        value={formData.component_name} 
                                        onChange={e => setFormData(prev => ({ ...prev, component_name: e.target.value }))} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                    />
                                </div>
                            </div>

                            {/* Baris 4: Priority (P1, P2, P3) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Priority Temuan *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, priority: 'P1' }))}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                            formData.priority === 'P1'
                                                ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-red-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                            <span className="font-black text-xs">P1 (Urgent)</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 text-center">Unit Breakdown / Kritis</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, priority: 'P2' }))}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                            formData.priority === 'P2'
                                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <span className="font-black text-xs">P2 (Medium)</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 text-center">Perlu Segera Diperbaiki</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, priority: 'P3' }))}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                            formData.priority === 'P3'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="font-black text-xs">P3 (Low)</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 text-center">Monitoring / Terjadwal</span>
                                    </button>
                                </div>
                            </div>

                            {/* Baris 5: HM Unit */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    HM Unit *
                                </label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    required
                                    placeholder="cth: 8500.5"
                                    value={formData.hm} 
                                    onChange={e => setFormData(prev => ({ ...prev, hm: e.target.value }))} 
                                    className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white font-mono font-bold" 
                                />
                            </div>

                            {/* Baris 6: Upload Foto Temuan / Defect */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Upload Foto Temuan / Defect
                                </label>
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {formData.image_preview ? (
                                    <div className="relative rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={formData.image_preview} 
                                                alt="Preview" 
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-slate-600 shadow-2xs"
                                            />
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <CheckCircle size={14} className="text-emerald-500" />
                                                    <span>{formData.image ? formData.image.name : 'Foto Tersimpan'}</span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">
                                                    {formData.image ? `${(formData.image.size / (1024 * 1024)).toFixed(2)} MB` : 'Foto temuan inspeksi'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-100 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Ganti Foto
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus Foto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={e => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            if (e.dataTransfer.files?.[0]) {
                                                const fakeEvent = { target: { files: e.dataTransfer.files } };
                                                handleFileChange(fakeEvent);
                                            }
                                        }}
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                                            isDragging 
                                                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20' 
                                                : 'border-gray-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 mx-auto flex items-center justify-center mb-2">
                                            <Camera size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Klik untuk upload foto temuan atau seret gambar ke sini
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Format JPG, PNG, WEBP (Maksimal 10 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Finding */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Deskripsi Temuan (FINDING) *
                                </label>
                                <textarea 
                                    rows="2"
                                    required
                                    placeholder="Jelaskan kondisi kerusakan / temuan inspeksi..."
                                    value={formData.finding} 
                                    onChange={e => setFormData(prev => ({ ...prev, finding: e.target.value }))} 
                                    className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white font-medium" 
                                />
                            </div>

                            {/* Inspect By */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Diperiksa Oleh (INSPECT BY) *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Nama mekanik / operator pemeriksa..."
                                    value={formData.inspect_by} 
                                    onChange={e => setFormData(prev => ({ ...prev, inspect_by: e.target.value }))} 
                                    className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                />
                            </div>

                            {/* Action */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                    Tindakan Perbaikan (ACTION)
                                </label>
                                <textarea 
                                    rows="2"
                                    placeholder="Tindakan korektif yang telah / akan dilakukan..."
                                    value={formData.action} 
                                    onChange={e => setFormData(prev => ({ ...prev, action: e.target.value }))} 
                                    className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white" 
                                />
                            </div>

                            {/* Status & Closed by */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        STATUS *
                                    </label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white font-bold"
                                    >
                                        <option value="OPEN">OPEN (Belum Ditangani)</option>
                                        <option value="PROGRESS">PROGRESS (Sedang Dikerjakan)</option>
                                        <option value="CLOSED">CLOSED (Selesai)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                        Ditutup Oleh (Closed by)
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder={formData.status === 'CLOSED' ? 'Nama verifikator...' : '-'}
                                        disabled={formData.status !== 'CLOSED'}
                                        value={formData.closed_by} 
                                        onChange={e => setFormData(prev => ({ ...prev, closed_by: e.target.value }))} 
                                        className="w-full text-sm border-gray-300 dark:border-slate-600 rounded-lg focus:ring-[#0b6e4f] focus:border-[#0b6e4f] dark:bg-slate-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800" 
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between gap-3">
                                <div className="flex gap-2">
                                    <a 
                                        href="/monitoring-orderan"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                                        title="Create Order Baru"
                                    >
                                        <ShoppingCart size={16} />
                                        Create Order
                                    </a>
                                    <a 
                                        href="/work-orders/create"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                                        title="Create Work Order Baru"
                                    >
                                        <FileText size={16} />
                                        Create Work Order
                                    </a>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-[#0b6e4f] hover:bg-[#095940] text-white rounded-lg text-sm font-bold transition shadow-sm cursor-pointer"
                                    >
                                        {isEditing ? 'Simpan Perubahan' : 'Simpan Temuan'}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Photo Lightbox Modal */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 dark:border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/90 dark:bg-slate-800/90">
                            <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-cyan-400 text-black flex items-center justify-center font-bold text-sm">
                                    📸
                                </span>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                                        Foto Temuan Inspeksi - {selectedPhoto.code_unit}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {selectedPhoto.wo_number} &bull; {selectedPhoto.date}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPhoto(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
                            <img 
                                src={selectedPhoto.image_url} 
                                alt={selectedPhoto.finding}
                                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                            />
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                                        {selectedPhoto.component_group || 'General'}
                                    </span>
                                    {selectedPhoto.component_name && selectedPhoto.component_name !== '-' && (
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            {selectedPhoto.component_name}
                                        </span>
                                    )}
                                </div>
                                <span className="font-bold text-gray-500">
                                    Inspector: <strong className="text-gray-800 dark:text-gray-200">{selectedPhoto.inspect_by}</strong>
                                </span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
                                <span className="font-bold text-gray-900 dark:text-white">Deskripsi: </span>
                                {selectedPhoto.finding}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
