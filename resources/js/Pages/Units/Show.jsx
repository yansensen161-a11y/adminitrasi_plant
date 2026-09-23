import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Show({ unit, hourMeters = [], breakdowns = [], services = [], backlogs = [], components = [], cannibals = [], magneticPlugs = [], tyresMap = {}, unitBudget = {}, apls = [], gets = [] }) {
    const { flash } = usePage().props || {};
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') || 'info';
        }
        return 'info';
    });

    const hasTyres = ['HAULER', 'DUMP TRUCK', 'MOTORGRADER', 'COMPACTOR', 'LUBECAR', 'WATER TRUCK', 'MMH', 'MB001', 'MB002', 'LIGHT VEHICLE', 'LV'].some(t => (unit.type_unit || '').toUpperCase().includes(t));
    const isLV = (unit.type_unit || '').toUpperCase().includes('LIGHT VEHICLE') || (unit.type_unit || '').toUpperCase().includes('LV');

    const baseTabs = [
        { id: 'info', label: 'Info Utama', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'hm', label: 'Riwayat HM', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'component', label: 'Component', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
        { id: 'breakdown', label: 'Riwayat Breakdown', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { id: 'service', label: 'Riwayat Servis', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { id: 'backlog', label: 'Riwayat Backlog', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'budget', label: 'Budget PA', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'magnetic_plug', label: 'Magnetic Plug', icon: 'M13 10V3L4 14h7v8l9-11h-7z' },
        { id: 'apl', label: 'List APL', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { id: 'get', label: 'GET', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    ];
    
    const tabs = hasTyres 
        ? [...baseTabs, { id: 'tyre', label: 'Tyre & Wheel', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }]
        : baseTabs;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        if (typeof dateString === 'number' || (!isNaN(dateString) && Number(dateString) > 30000 && Number(dateString) < 60000)) {
            const excelDate = new Date((Number(dateString) - 25569) * 86400 * 1000);
            return excelDate.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const isRunning = unit.status === 'Operational' || unit.status === 'Ready' || unit.status === 'Running';

    // Smart Multi-Cycle Replacement History Grouping
    const groupedComponents = React.useMemo(() => {
        const map = new Map();
        (components || []).forEach(comp => {
            const key = (comp.component || comp.part_number || comp.id).trim().toLowerCase();
            
            // Extract cycles from replacement_history or fallback to primary fields
            let itemCycles = [];
            if (Array.isArray(comp.replacement_history) && comp.replacement_history.length > 0) {
                itemCycles = comp.replacement_history.map(h => ({
                    date_replace: h.date_replace,
                    hm_replace: h.hm_replace,
                    next_plant: h.next_plant,
                    brand_produk: h.brand_produk || comp.brand_produk,
                }));
            } else {
                itemCycles = [{
                    date_replace: comp.date_replace,
                    hm_replace: comp.hm_replace,
                    next_plant: comp.next_plant,
                    brand_produk: comp.brand_produk,
                }];
            }

            if (!map.has(key)) {
                map.set(key, {
                    ...comp,
                    cycles: itemCycles,
                });
            } else {
                const existing = map.get(key);
                // Merge cycles avoiding exact duplicates
                itemCycles.forEach(c => {
                    const isDup = existing.cycles.some(ec => 
                        ec.date_replace === c.date_replace && 
                        Number(ec.hm_replace) === Number(c.hm_replace)
                    );
                    if (!isDup && (c.date_replace || c.hm_replace)) {
                        existing.cycles.push(c);
                    }
                });
                if (comp.hm_current) existing.hm_current = comp.hm_current;
                if (comp.target_life_time) existing.target_life_time = comp.target_life_time;
            }
        });

        // Ensure every component has at least 1 cycle item (even if empty)
        return Array.from(map.values()).map(comp => ({
            ...comp,
            cycles: comp.cycles && comp.cycles.length > 0 ? comp.cycles : [{
                date_replace: null,
                hm_replace: null,
                next_plant: null,
                brand_produk: null,
            }]
        }));
    }, [components]);

    const maxCycles = React.useMemo(() => {
        if (!groupedComponents || groupedComponents.length === 0) return 1;
        const max = Math.max(...groupedComponents.map(c => c.cycles.length));
        return Math.max(1, max);
    }, [groupedComponents]);

    // Component statistics
    const normalCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) < 85).length;
    const warningCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) >= 85 && (Number(c.life_time_pct) || 0) <= 100).length;
    const overdueCount = groupedComponents.filter(c => (Number(c.life_time_pct) || 0) > 100).length;
    // Fullscreen toggle state & listener
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                }).catch(() => {});
            }
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({}, '', url.toString());
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // APL State & Handlers
    const [aplList, setAplList] = useState(apls || []);
    useEffect(() => {
        setAplList(apls || []);
    }, [apls]);

    const [isAplModalOpen, setIsAplModalOpen] = useState(false);
    const [editingApl, setEditingApl] = useState(null);
    const [aplSearch, setAplSearch] = useState('');
    const [aplForm, setAplForm] = useState({
        part_number: '',
        depart: '',
        description: '',
        qty: 1,
        satuan: 'PCS',
        ps_250: '',
        ps_500: '',
        ps_1000: '',
        ps_2000: '',
        price_rate: '',
        is_global: false,
        notes: '',
    });
    const [aplSubmitting, setAplSubmitting] = useState(false);

    const parsePriceInput = (val) => {
        if (!val && val !== 0) return 0;
        const s = String(val).trim();
        if (!s) return 0;
        // If Indonesian thousand dots e.g. "1.350.000" or "330.000"
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
            return Number(s.replace(/\./g, ''));
        }
        // If format with decimals e.g. "330.00"
        if (/^\d+(\.\d{1,2})$/.test(s)) {
            const f = Number(s);
            return (f > 0 && f < 10000) ? f * 1000 : f;
        }
        const clean = s.replace(/[^0-9.]/g, '');
        let num = Number(clean);
        if (!isNaN(num) && num > 0 && num < 10000) {
            num = num * 1000;
        }
        return isNaN(num) ? 0 : num;
    };

    const openCreateAplModal = () => {
        setEditingApl(null);
        setAplForm({
            part_number: '',
            depart: '',
            description: '',
            qty: 1,
            satuan: 'PCS',
            ps_250: '',
            ps_500: '',
            ps_1000: '',
            ps_2000: '',
            price_rate: '',
            is_global: false,
            notes: '',
        });
        setIsAplModalOpen(true);
    };

    const openEditAplModal = (item) => {
        setEditingApl(item);
        setAplForm({
            part_number: item.part_number || '',
            depart: item.depart || '',
            description: item.description || '',
            qty: item.qty || 1,
            satuan: item.satuan || 'PCS',
            ps_250: item.ps_250 || '',
            ps_500: item.ps_500 || '',
            ps_1000: item.ps_1000 || '',
            ps_2000: item.ps_2000 || '',
            price_rate: item.price_rate ? Number(item.price_rate).toLocaleString('id-ID') : '',
            is_global: Boolean(item.is_global),
            notes: item.notes || '',
        });
        setIsAplModalOpen(true);
    };

    const handleAplFormChange = (field, value) => {
        setAplForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAplSubmit = (e) => {
        e.preventDefault();
        setAplSubmitting(true);
        const payload = {
            ...aplForm,
            price_rate: parsePriceInput(aplForm.price_rate),
        };
        if (editingApl) {
            router.put(route('unit-apls.update', editingApl.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAplModalOpen(false);
                    setEditingApl(null);
                    setAplSubmitting(false);
                },
                onError: () => setAplSubmitting(false),
            });
        } else {
            router.post(route('unit-apls.store'), {
                ...payload,
                unit_id: unit.id,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAplModalOpen(false);
                    setAplSubmitting(false);
                },
                onError: () => setAplSubmitting(false),
            });
        }
    };

    const handleDeleteApl = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data APL ini?')) {
            router.delete(route('unit-apls.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const filteredApls = useMemo(() => {
        if (!aplSearch.trim()) return aplList;
        const q = aplSearch.toLowerCase();
        return aplList.filter(a =>
            (a.part_number || '').toLowerCase().includes(q) ||
            (a.description || '').toLowerCase().includes(q) ||
            (a.depart || '').toLowerCase().includes(q)
        );
    }, [aplList, aplSearch]);

    const totalAplQty = useMemo(() => {
        return filteredApls.reduce((sum, a) => sum + (Number(a.qty) || 0), 0);
    }, [filteredApls]);

    const totalAplPriceRate = useMemo(() => {
        return filteredApls.reduce((sum, a) => sum + (Number(a.price_rate) || 0), 0);
    }, [filteredApls]);

    const totalAplTotalPrice = useMemo(() => {
        return filteredApls.reduce((sum, a) => {
            const qty = Number(a.qty) || 1;
            const price = Number(a.price_rate) || 0;
            return sum + (qty * price);
        }, 0);
    }, [filteredApls]);

    // APL Import State & Handlers
    const [isAplImportModalOpen, setIsAplImportModalOpen] = useState(false);
    const [aplImportFile, setAplImportFile] = useState(null);
    const [aplReplaceExisting, setAplReplaceExisting] = useState(false);
    const [aplImporting, setAplImporting] = useState(false);

    const handleAplImportSubmit = (e) => {
        e.preventDefault();
        if (!aplImportFile) return;
        setAplImporting(true);
        const formData = new FormData();
        formData.append('file', aplImportFile);
        formData.append('unit_id', unit.id);
        formData.append('replace_existing', aplReplaceExisting ? '1' : '0');
        router.post(route('unit-apls.import'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAplImportModalOpen(false);
                setAplImportFile(null);
                setAplReplaceExisting(false);
                setAplImporting(false);
            },
            onError: () => setAplImporting(false),
        });
    };

    // GET State & Handlers
    const [getList, setGetList] = useState(gets || []);
    useEffect(() => {
        setGetList(gets || []);
    }, [gets]);

    const [isGetModalOpen, setIsGetModalOpen] = useState(false);
    const [editingGet, setEditingGet] = useState(null);
    const [getSearch, setGetSearch] = useState('');
    const [getForm, setGetForm] = useState({
        part_number: '',
        depart: 'BUCKET',
        description: '',
        qty: 1,
        satuan: 'PCS',
        ps_250: '',
        ps_500: '',
        ps_1000: '',
        ps_2000: '',
        price_rate: '',
        is_global: false,
        notes: '',
    });
    const [getSubmitting, setGetSubmitting] = useState(false);

    const openCreateGetModal = () => {
        setEditingGet(null);
        setGetForm({
            part_number: '',
            depart: 'BUCKET',
            description: '',
            qty: 1,
            satuan: 'PCS',
            ps_250: '',
            ps_500: '',
            ps_1000: '',
            ps_2000: '',
            price_rate: '',
            is_global: false,
            notes: '',
        });
        setIsGetModalOpen(true);
    };

    const openEditGetModal = (item) => {
        setEditingGet(item);
        setGetForm({
            part_number: item.part_number || '',
            depart: item.depart || 'BUCKET',
            description: item.description || '',
            qty: item.qty || 1,
            satuan: item.satuan || 'PCS',
            ps_250: item.ps_250 || '',
            ps_500: item.ps_500 || '',
            ps_1000: item.ps_1000 || '',
            ps_2000: item.ps_2000 || '',
            price_rate: item.price_rate ? Number(item.price_rate).toLocaleString('id-ID') : '',
            is_global: Boolean(item.is_global),
            notes: item.notes || '',
        });
        setIsGetModalOpen(true);
    };

    const handleGetFormChange = (field, value) => {
        setGetForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGetSubmit = (e) => {
        e.preventDefault();
        setGetSubmitting(true);
        const payload = {
            ...getForm,
            price_rate: parsePriceInput(getForm.price_rate),
        };
        if (editingGet) {
            router.put(route('unit-gets.update', editingGet.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsGetModalOpen(false);
                    setEditingGet(null);
                    setGetSubmitting(false);
                },
                onError: () => setGetSubmitting(false),
            });
        } else {
            router.post(route('unit-gets.store'), {
                ...payload,
                unit_id: unit.id,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsGetModalOpen(false);
                    setGetSubmitting(false);
                },
                onError: () => setGetSubmitting(false),
            });
        }
    };

    const handleDeleteGet = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data GET ini?')) {
            router.delete(route('unit-gets.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // GET Import State & Handlers
    const [isGetImportModalOpen, setIsGetImportModalOpen] = useState(false);
    const [getImportFile, setGetImportFile] = useState(null);
    const [getReplaceExisting, setGetReplaceExisting] = useState(false);
    const [getImporting, setGetImporting] = useState(false);

    const handleGetImportSubmit = (e) => {
        e.preventDefault();
        if (!getImportFile) return;
        setGetImporting(true);
        const formData = new FormData();
        formData.append('file', getImportFile);
        formData.append('unit_id', unit.id);
        formData.append('replace_existing', getReplaceExisting ? '1' : '0');
        router.post(route('unit-gets.import'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsGetImportModalOpen(false);
                setGetImportFile(null);
                setGetReplaceExisting(false);
                setGetImporting(false);
            },
            onError: () => setGetImporting(false),
        });
    };

    const filteredGets = useMemo(() => {
        if (!getSearch.trim()) return getList;
        const q = getSearch.toLowerCase();
        return getList.filter(g =>
            (g.part_number || '').toLowerCase().includes(q) ||
            (g.description || '').toLowerCase().includes(q) ||
            (g.depart || '').toLowerCase().includes(q)
        );
    }, [getList, getSearch]);

    const totalGetQty = useMemo(() => {
        return filteredGets.reduce((sum, g) => sum + (Number(g.qty) || 0), 0);
    }, [filteredGets]);

    const totalGetTotalPrice = useMemo(() => {
        return filteredGets.reduce((sum, g) => {
            const qty = Number(g.qty) || 1;
            const price = Number(g.price_rate) || 0;
            return sum + (qty * price);
        }, 0);
    }, [filteredGets]);

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Unit - ${unit.code_unit}`} />

            <div className="-m-4 sm:-m-6 lg:-m-8 bg-[#f4f7f6] dark:bg-transparent min-h-screen pb-10">
                {/* Breadcrumbs */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500 font-medium">
                    Master Unit <span className="mx-2">&gt;</span> Historical Unit <span className="mx-2">&gt;</span> <span className="text-gray-900">Detail</span>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 w-full">
                    {/* Flash Notifications */}
                    {flash?.success && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-semibold">{flash.success}</span>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold">{flash.error}</span>
                            </div>
                        </div>
                    )}

                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-4">
                        <Link href={route('units.index')} className="flex items-center gap-2 text-gray-700 font-bold hover:text-gray-900 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Kembali
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Fullscreen Button */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="bg-white border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                                title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Full Screen)'}
                            >
                                {isFullscreen ? (
                                    <>
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11-5l5 0m0 0l-5 5m5-5l0 5M4 20l5-5m-5 5l5 0m-5 0l0-5m16 5l-5-5m5 5l-5 0m5 0l0-5" />
                                        </svg>
                                        <span className="hidden sm:inline">Exit Full Screen</span>
                                        <span className="sm:hidden">Exit</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        <span>Full Screen</span>
                                    </>
                                )}
                            </button>

                            {/* Export Excel Multi-Sheet Button */}
                            <a
                                href={route('units.export.multi-sheet', { unit_id: unit.id })}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                                title="Download File Excel Lengkap dengan Multi-Sheet (Riwayat HM, Component, Breakdown, Servis, Backlog, Budget PA, Magnetic Plug)"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                </svg>
                                <span>Export Excel (Multi-Sheet)</span>
                            </a>

                            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Cetak
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Unit Identity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            {/* Icon Box */}
                            <div className="w-24 h-24 bg-[#e8f5e9] text-[#10b981] rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.76,5.59,8.22,5.92,7.73,6.29L5.34,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.83,8.87 C2.71,9.08,2.75,9.34,2.95,9.48l2.03,1.58C4.94,11.36,4.9,11.69,4.9,12c0,0.32,0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                                </svg>
                            </div>
                            
                            <div>
                                <div className="text-gray-500 font-bold uppercase tracking-wide text-sm">{unit.type_unit || 'UNIT'}</div>
                                <div className="flex items-center gap-3 mt-1">
                                    <h2 className="text-3xl font-black text-gray-900">{unit.code_unit}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                                        isRunning ? 'bg-[#e8f5e9] text-[#10b981]' : 
                                        unit.status === 'Standby' ? 'bg-amber-100 text-amber-700' :
                                        unit.status === 'Breakdown' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {isRunning ? 'Running' : unit.status}
                                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#10b981]' : 'bg-current'}`}></div>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 md:gap-12">
                            {/* Chassis */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h2v16H3V4zm4 0h2v16H7V4zm4 0h4v16h-4V4zm6 0h2v16h-2V4zm4 0h2v16h-2V4z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm">S/N Chassis</div>
                                    <div className="text-gray-900 font-bold mt-0.5">{unit.sn_chassis || '-'}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Lokasi */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm">Lokasi</div>
                                    <div className="text-gray-900 font-bold mt-0.5">{unit.location || '-'}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Current HM */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm text-right">Current HM</div>
                                    <div className="text-[#10b981] font-black text-2xl mt-0.5 tracking-tight">{Number(unit.hm).toLocaleString('id-ID')}</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                            {/* Tahun Perakitan */}
                            <div className="flex items-center gap-3">
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-gray-400 font-bold text-sm text-right">Tahun Perakitan</div>
                                    <div className="text-gray-900 font-black text-xl mt-0.5">{unit.tahun_perakitan || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide py-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-[#10b981] text-white shadow-md' 
                                        : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-800'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d={tab.icon}></path>
                                    </svg>
                                    {tab.label}
                                    {tab.id === 'component' && components.length > 0 && (
                                        <span className={`text-sm px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {components.length}
                                        </span>
                                    )}
                                    {tab.id === 'apl' && (aplList?.length || 0) > 0 && (
                                        <span className={`text-sm px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {aplList.length}
                                        </span>
                                    )}
                                    {tab.id === 'get' && (gets?.length || 0) > 0 && (
                                        <span className={`text-sm px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {gets.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Contents */}
                    <div>
                        
                        {/* INFO UTAMA TAB */}
                        {activeTab === 'info' && (
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left Column */}
                                <div className="lg:w-7/12">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Detail Spesifikasi & Pembelian
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Model</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.model || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.76,5.59,8.22,5.92,7.73,6.29L5.34,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.83,8.87 C2.71,9.08,2.75,9.34,2.95,9.48l2.03,1.58C4.94,11.36,4.9,11.69,4.9,12c0,0.32,0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Jenis Equipment</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.type_unit || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Tahun Perakitan</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.tahun_perakitan || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Engine Model</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.engine_model || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Engine Make</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.engine_make || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">S/N Engine</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.sn_engine || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h2v16H3V4zm4 0h2v16H7V4zm4 0h4v16h-4V4zm6 0h2v16h-2V4zm4 0h2v16h-2V4z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">S/N Chassis</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.sn_chassis || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">No. Police</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.no_police || 'N/A'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Received Date</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{formatDate(unit.received_date)}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Vendor / Terima Dari</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.received_from || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                                                <div className="w-1/3 text-gray-500 text-sm">Asal Unit</div>
                                                <div className="w-2/3 text-right font-bold text-gray-900">{unit.before_from || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="lg:w-5/12 flex flex-col gap-6">
                                    {/* Kapasitas & Attachment */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                            Informasi Kapasitas & Attachment
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Kapasitas (HP/KW)</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{(unit.hp || '-') + ' / ' + (unit.kw || '-')}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Kapasitas Equipment</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.equipment_capacity || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Attachment</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.attachments || '-'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informasi Operasional */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Informasi Operasional
                                        </h2>
                                        
                                        <div className="space-y-0">
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Lokasi</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{unit.location || '-'}</div>
                                            </div>
                                            <div className="flex items-center py-3 border-b border-gray-100 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Received Date</div>
                                                <div className="w-1/2 text-right font-bold text-gray-900">{formatDate(unit.received_date)}</div>
                                            </div>
                                            <div className="flex items-center py-3 group">
                                                <div className="w-8 flex justify-center text-[#10b981]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                                                <div className="w-1/2 text-gray-500 text-sm">Status</div>
                                                <div className="w-1/2 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1 ${
                                                        isRunning ? 'bg-[#e8f5e9] text-[#10b981]' : 
                                                        unit.status === 'Standby' ? 'bg-amber-100 text-amber-700' :
                                                        unit.status === 'Breakdown' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {isRunning ? 'Running' : unit.status}
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#10b981]' : 'bg-current'}`}></div>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div className="bg-[#e8f5e9] rounded-2xl shadow-sm border border-[#c8e6c9] p-6">
                                        <h2 className="text-sm font-bold text-[#10b981] mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Catatan
                                        </h2>
                                        <p className="text-sm text-green-800">{unit.remarks || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* HISTORICAL COMPONENT TAB */}
                            {activeTab === 'component' && (
                                <div className="p-6">
                                    {/* Header & Quick Action */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                                        <div>
                                            <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                                <svg className="w-6 h-6 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                                </svg>
                                                Historical Component & Lifetime Tracker
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Monitoring riwayat penggantian komponen, persentase umur pakai (PCR / UC), dan catatan part kanibal unit {unit.code_unit}.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href="/pcr-uc"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-lg transition shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                Buka Plan Component (PCR)
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Metric Badges */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                                        <div className="bg-[#f9fafa] border border-gray-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-gray-400 uppercase">Total Komponen</div>
                                            <div className="text-2xl font-black text-gray-900 mt-1">{components.length}</div>
                                        </div>
                                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-emerald-700 uppercase">Kondisi Aman (&lt;85%)</div>
                                            <div className="text-2xl font-black text-emerald-800 mt-1">{normalCount}</div>
                                        </div>
                                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-amber-700 uppercase">Perlu Perhatian (85-100%)</div>
                                            <div className="text-2xl font-black text-amber-800 mt-1">{warningCount}</div>
                                        </div>
                                        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
                                            <div className="text-sm font-bold text-rose-700 uppercase">Overdue Lifetime (&gt;100%)</div>
                                            <div className="text-2xl font-black text-rose-800 mt-1">{overdueCount}</div>
                                        </div>
                                    </div>

                                    {/* Main Table: PCR & Component Lifetime with Multi-Cycle Replacement History */}
                                    <div className="mb-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
                                                    Daftar Komponen &amp; Status Umur Pakai (PCR / UC)
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Riwayat instalasi &amp; penggantian komponen bertahap (otomatis terupdate dari menu Plan Component).
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                                                    Total: {groupedComponents.length} Komponen
                                                </span>
                                                {groupedComponents.length > 0 && (
                                                    <span className="text-sm font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                                                        {maxCycles} Siklus Pergantian Tercatat
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-xs">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-[#f8fafc] text-gray-600 font-bold border-b border-gray-200 text-sm uppercase tracking-wider">
                                                    {/* Tier 1 Header */}
                                                    <tr>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 align-middle bg-gray-50/90 whitespace-nowrap min-w-[140px]">
                                                            Part Number
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 align-middle bg-gray-50/90 whitespace-nowrap min-w-[180px]">
                                                            Component
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap">
                                                            Current HM
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap">
                                                            Target Lifetime
                                                        </th>
                                                        <th rowSpan={2} className="px-5 py-3.5 border-r border-gray-200 text-right align-middle bg-gray-50/90 whitespace-nowrap min-w-[120px]">
                                                            Remaining
                                                        </th>
                                                        
                                                        {/* Dynamic Cycle Group Headers */}
                                                        {Array.from({ length: maxCycles }).map((_, idx) => (
                                                            <th 
                                                                key={idx} 
                                                                colSpan={3} 
                                                                className={`px-4 py-2.5 text-center border-l border-b font-black tracking-wide ${
                                                                    idx === 0 
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                                        : idx === 1 
                                                                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                                                        : idx === 2 
                                                                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                                                        : 'bg-purple-50 text-purple-800 border-purple-200'
                                                                }`}
                                                            >
                                                                Pergantian Ke-{idx + 1} {idx === 0 ? '(Instalasi Awal)' : ''}
                                                            </th>
                                                        ))}
                                                    </tr>

                                                    {/* Tier 2 Sub-Headers for Date, HM, Next Plan */}
                                                    <tr className="bg-gray-50/90 border-t border-gray-200">
                                                        {Array.from({ length: maxCycles }).map((_, idx) => (
                                                            <React.Fragment key={idx}>
                                                                <th className="px-4 py-2 text-center border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[110px]">
                                                                    Date Instal
                                                                </th>
                                                                <th className="px-4 py-2 text-right border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[110px]">
                                                                    HM Instal
                                                                </th>
                                                                <th className="px-4 py-2 text-right border-l border-gray-200 text-sm font-bold text-gray-700 min-w-[120px]">
                                                                    Next Plan HM
                                                                </th>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {groupedComponents.length > 0 ? (
                                                        groupedComponents.map((comp) => {
                                                            const currentHm = comp.hm_current !== null && comp.hm_current !== undefined ? Number(comp.hm_current) : (Number(unit.hm) || 0);
                                                            
                                                            // Latest cycle info for remaining lifetime calculation
                                                            const latestCycle = comp.cycles && comp.cycles.length > 0 ? comp.cycles[comp.cycles.length - 1] : {};
                                                            const latestHmReplace = latestCycle?.hm_replace !== null && latestCycle?.hm_replace !== undefined && latestCycle?.hm_replace !== '' ? Number(latestCycle.hm_replace) : 0;
                                                            const targetLife = Number(comp.target_life_time) || 6000;
                                                            const usageHm = Math.max(0, currentHm - latestHmReplace);
                                                            const remaining = targetLife - usageHm;
                                                            const isOverdue = remaining < 0;
                                                            const isDueSoon = remaining >= 0 && remaining <= 250;

                                                            return (
                                                                <tr key={comp.id || comp.component} className="hover:bg-gray-50/80 transition group">
                                                                    {/* 1. Part Number */}
                                                                    <td className="px-5 py-3.5 border-r border-gray-100">
                                                                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                                                                            {comp.part_number || '-'}
                                                                        </span>
                                                                        {comp.brand_produk && (
                                                                            <div className="text-sm text-gray-400 mt-1 font-medium">{comp.brand_produk}</div>
                                                                        )}
                                                                    </td>

                                                                    {/* 2. Component */}
                                                                    <td className="px-5 py-3.5 border-r border-gray-100">
                                                                        <div className="font-bold text-gray-900 text-sm">{comp.component || '-'}</div>
                                                                        {comp.description && comp.description !== comp.component && (
                                                                            <div className="text-sm text-gray-400 mt-0.5">{comp.description}</div>
                                                                        )}
                                                                    </td>

                                                                    {/* 3. Current HM */}
                                                                    <td className="px-5 py-3.5 text-right font-bold text-gray-900 font-mono text-sm border-r border-gray-100">
                                                                        {Number(currentHm).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM
                                                                    </td>

                                                                    {/* 4. Target Lifetime */}
                                                                    <td className="px-5 py-3.5 text-right font-medium text-gray-700 font-mono text-sm border-r border-gray-100">
                                                                        {targetLife ? `${Number(targetLife).toLocaleString('id-ID')} Jam` : '-'}
                                                                    </td>

                                                                    {/* 5. Remaining */}
                                                                    <td className="px-5 py-3.5 text-right border-r border-gray-100">
                                                                        <div className={`font-black font-mono text-sm ${
                                                                            isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-emerald-600'
                                                                        }`}>
                                                                            {Number(remaining).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM
                                                                        </div>
                                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                                                                            isOverdue ? 'bg-rose-100 text-rose-700' : isDueSoon ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                                                                        }`}>
                                                                            {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Aman'}
                                                                        </span>
                                                                    </td>

                                                                    {/* Dynamic Columns for each Replacement Cycle */}
                                                                    {Array.from({ length: maxCycles }).map((_, cIdx) => {
                                                                        const cycle = comp.cycles?.[cIdx];
                                                                        const cycleNextPlan = cycle?.next_plant 
                                                                            ? Number(cycle.next_plant) 
                                                                            : (cycle?.hm_replace && targetLife ? Number(cycle.hm_replace) + targetLife : (targetLife || 0));

                                                                        return (
                                                                            <React.Fragment key={cIdx}>
                                                                                {/* Date Instal */}
                                                                                <td className="px-4 py-3.5 text-center font-medium text-gray-800 text-sm border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.date_replace ? formatDate(cycle.date_replace) : '-'}
                                                                                </td>

                                                                                {/* HM Instal */}
                                                                                <td className="px-4 py-3.5 text-right font-mono text-sm text-gray-700 border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.hm_replace !== null && cycle?.hm_replace !== undefined && cycle?.hm_replace !== '' 
                                                                                        ? `${Number(cycle.hm_replace).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM` 
                                                                                        : '-'}
                                                                                </td>

                                                                                {/* Next Plan HM */}
                                                                                <td className="px-4 py-3.5 text-right font-bold text-gray-900 font-mono text-sm border-l border-gray-100 bg-gray-50/20">
                                                                                    {cycle?.next_plant || (cycle?.hm_replace !== null && cycle?.hm_replace !== undefined && cycle?.hm_replace !== '')
                                                                                        ? `${Number(cycleNextPlan).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} HM` 
                                                                                        : '-'}
                                                                                </td>
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5 + maxCycles * 3} className="px-6 py-12 text-center text-gray-400 font-medium">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                                                    <span>Belum ada data komponen terdaftar untuk unit ini di Plan Component (PCR / UC).</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Secondary Table: Part Canibal History */}
                                    {cannibals.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    Riwayat Kanibalisasi &amp; Swapping Part Terkait
                                                </h3>
                                                <span className="text-sm text-gray-400 font-medium">Total: {cannibals.length} transaksi</span>
                                            </div>

                                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                        <tr>
                                                            <th className="px-5 py-3.5">Tanggal &amp; No Request</th>
                                                            <th className="px-5 py-3.5">Nama Part / Komponen</th>
                                                            <th className="px-5 py-3.5">Tipe Relasi Unit</th>
                                                            <th className="px-5 py-3.5 text-center">Qty &amp; HM</th>
                                                            <th className="px-5 py-3.5">PO / PR / Dokumen</th>
                                                            <th className="px-5 py-3.5">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {cannibals.map((can) => {
                                                            const isRecipient = can.unit_id === unit.id;
                                                            return (
                                                                <tr key={can.id} className="hover:bg-gray-50 transition">
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-bold text-gray-900">{formatDate(can.tanggal || can.created_at)}</div>
                                                                        <div className="font-mono text-sm text-gray-400 mt-0.5">{can.no_request || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-bold text-gray-800">{can.part_name || '-'}</div>
                                                                        <div className="text-sm text-gray-500 mt-0.5">{can.description || can.remark || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        {isRecipient ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                                                                                    Penerima
                                                                                </span>
                                                                                <span className="text-sm text-gray-600">
                                                                                    dari <strong className="text-gray-900">{can.dari_unit?.code_unit || 'Unit Lain'}</strong>
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                                                                                    Donor Part
                                                                                </span>
                                                                                <span className="text-sm text-gray-600">
                                                                                    ke <strong className="text-gray-900">{can.unit?.code_unit || 'Unit Lain'}</strong>
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-5 py-4 text-center">
                                                                        <div className="font-bold text-gray-900">{can.qty || 1} Pcs</div>
                                                                        <div className="text-sm text-gray-400 font-mono">{can.hm ? `${Number(can.hm).toLocaleString('id-ID')} HM` : '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4 text-sm font-mono text-gray-600">
                                                                        <div>PO: {can.po || '-'}</div>
                                                                        <div>PR: {can.pr || '-'}</div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                                                                            {can.status || 'Tercatat'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* HM TAB */}
                            {activeTab === 'hm' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            20 Pembaruan Hour Meter Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal</th>
                                                    <th className="px-6 py-4">Shift</th>
                                                    <th className="px-6 py-4 text-right">HM Awal</th>
                                                    <th className="px-6 py-4 text-right">HM Akhir</th>
                                                    <th className="px-6 py-4 text-right">Penambahan HM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {hourMeters.length > 0 ? hourMeters.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{formatDate(log.log_date)}</td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{log.shift || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 text-right">{Number(log.hm_start).toLocaleString('id-ID')}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900 text-right">{Number(log.hm_end).toLocaleString('id-ID')}</td>
                                                        <td className="px-6 py-4 font-black text-[#10b981] text-right">+{Number(log.hm_total).toLocaleString('id-ID')}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat pembaruan HM.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* BREAKDOWN TAB */}
                            {activeTab === 'breakdown' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            20 Laporan Breakdown Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">No. WO</th>
                                                    <th className="px-6 py-4">Tanggal BD</th>
                                                    <th className="px-6 py-4">HM Saat BD</th>
                                                    <th className="px-6 py-4">Problem / Keluhan</th>
                                                    <th className="px-6 py-4">Lokasi BD</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {breakdowns.length > 0 ? breakdowns.map((bd) => (
                                                    <tr key={bd.id} className="hover:bg-gray-50 transition cursor-pointer" onDoubleClick={() => window.location.href = `/work-orders?tab=breakdown&search=${bd.no_wo}`}>
                                                        <td className="px-6 py-4 font-mono font-bold text-[#10b981]">{bd.no_wo || '-'}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {formatDate(bd.waktu_breakdown || bd.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{bd.hm_unit ? Number(bd.hm_unit).toLocaleString('id-ID') : '-'}</td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium max-w-sm truncate" title={bd.problem || bd.keterangan}>{bd.problem || bd.keterangan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{bd.location || bd.site || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (bd.status_wo || '').toLowerCase() === 'open' ? 'bg-red-100 text-red-700' : 
                                                                (bd.status_wo || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {bd.status_wo || 'Tercatat'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat breakdown.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SERVIS TAB */}
                            {activeTab === 'service' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                            Riwayat Servis &amp; Periodical Maintenance ({services.length} Catatan)
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">No. WO / Order</th>
                                                    <th className="px-6 py-4">Tanggal Servis</th>
                                                    <th className="px-6 py-4">HM Saat Servis</th>
                                                    <th className="px-6 py-4">Tipe Servis</th>
                                                    <th className="px-6 py-4">Deskripsi Pekerjaan</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                    <th className="px-6 py-4 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {services.length > 0 ? services.map((sv) => (
                                                    <tr 
                                                        key={sv.id} 
                                                        className="hover:bg-gray-50 transition cursor-pointer"
                                                        onDoubleClick={() => {
                                                            if (sv.no_wo) {
                                                                window.location.href = `/work-orders/${sv.id}`;
                                                            }
                                                        }}
                                                    >
                                                        <td className="px-6 py-4 font-mono font-bold text-[#0b6e4f]">
                                                            {sv.no_wo || sv.no_order || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {formatDate(sv.close_date || sv.waktu_rfu || sv.waktu_breakdown || sv.date || sv.tanggal || sv.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-gray-700 font-semibold">
                                                            {sv.hm_unit ? Number(sv.hm_unit).toLocaleString('id-ID') : (sv.hm ? Number(sv.hm).toLocaleString('id-ID') : '-')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                                                                {sv.tipe_wo || sv.type || sv.maintenance_type || sv.wo_type || 'SCHEDULE'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium max-w-sm truncate" title={sv.problem || sv.job_instruction || sv.keterangan || sv.description || sv.remarks || sv.action_taken}>
                                                            {sv.problem || sv.job_instruction || sv.keterangan || sv.description || sv.remarks || sv.action_taken || 'Periodical service'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (sv.status_wo || sv.status || '').toLowerCase() === 'completed'
                                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                            }`}>
                                                                {sv.status_wo || sv.status || 'COMPLETED'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {sv.no_wo ? (
                                                                <Link 
                                                                    href={`/work-orders/${sv.id}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#0b6e4f] rounded text-xs font-bold transition"
                                                                >
                                                                    Detail WO
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada riwayat servis atau periodical maintenance order untuk unit ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* BACKLOG TAB */}
                            {activeTab === 'backlog' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                            20 Temuan Backlog Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal Temuan</th>
                                                    <th className="px-6 py-4">Deskripsi Backlog</th>
                                                    <th className="px-6 py-4">Prioritas</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {backlogs.length > 0 ? backlogs.map((bl) => (
                                                    <tr key={bl.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{formatDate(bl.created_at)}</td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium max-w-sm truncate" title={bl.description || bl.temuan}>{bl.description || bl.temuan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{bl.priority || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                                                                {bl.status || 'Open'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada temuan backlog untuk unit ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {/* BUDGET TAB */}
                            {activeTab === 'budget' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Budget PA &amp; Realisasi
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        {/* Unit Budget Details (Mock) */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-blue-800">Total Forecast</div>
                                                <div className="text-xl font-black text-blue-900 mt-1">Rp {unitBudget.total_forecast?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-blue-700 mt-1">Realisasi: {unitBudget.total_forecast?.vs_realisasi || '0%'}</div>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-emerald-800">Planned Maint.</div>
                                                <div className="text-xl font-black text-emerald-900 mt-1">Rp {unitBudget.planned_maintenance?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-emerald-700 mt-1">{unitBudget.planned_maintenance?.pct || '0%'} dari total</div>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-amber-800">Corrective Maint.</div>
                                                <div className="text-xl font-black text-amber-900 mt-1">Rp {unitBudget.corrective_maintenance?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-amber-700 mt-1">{unitBudget.corrective_maintenance?.pct || '0%'} dari total</div>
                                            </div>
                                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                                                <div className="text-sm font-bold text-rose-800">Improvement</div>
                                                <div className="text-xl font-black text-rose-900 mt-1">Rp {unitBudget.project_improvement?.amount || '0'}</div>
                                                <div className="text-xs font-medium text-rose-700 mt-1">{unitBudget.project_improvement?.pct || '0%'} dari total</div>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">Bulan</th>
                                                        <th className="px-6 py-4 text-right">Planned Budget</th>
                                                        <th className="px-6 py-4 text-right">Realisasi</th>
                                                        <th className="px-6 py-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {unitBudget.monthly && unitBudget.monthly.map((m, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 py-4 font-bold text-gray-900">{m.bulan}</td>
                                                            <td className="px-6 py-4 font-mono text-gray-600 text-right">Rp {m.planned}</td>
                                                            <td className="px-6 py-4 font-mono font-bold text-gray-900 text-right">Rp {m.realisasi}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                    m.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                                }`}>
                                                                    {m.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MAGNETIC PLUG TAB */}
                            {activeTab === 'magnetic_plug' && (
                                <div>
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v8l9-11h-7z"></path></svg>
                                            20 Inspeksi Magnetic Plug Terakhir
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#f9fafa] text-gray-500 font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Tanggal & HM</th>
                                                    <th className="px-6 py-4">Komponen</th>
                                                    <th className="px-6 py-4">Kondisi / Temuan</th>
                                                    <th className="px-6 py-4">Rekomendasi</th>
                                                    <th className="px-6 py-4">Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {magneticPlugs.length > 0 ? magneticPlugs.map((mp) => (
                                                    <tr key={mp.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{formatDate(mp.date)}</div>
                                                            <div className="text-sm font-mono text-gray-500">{Number(mp.hm).toLocaleString('id-ID')} HM</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-800 font-medium">{mp.component || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs">{mp.condition || mp.temuan || '-'}</td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs">{mp.recommendation || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                                                (mp.rating || '').toLowerCase().includes('normal') ? 'bg-emerald-100 text-emerald-700' : 
                                                                (mp.rating || '').toLowerCase().includes('abnormal') ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {mp.rating || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada data inspeksi magnetic plug.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TYRE TAB */}
                            {activeTab === 'tyre' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                Visual Mapping Roda & Ban
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">Status dan layout ban berdasarkan konfigurasi unit {unit.type_unit}</p>
                                        </div>
                                    </div>

                                    {/* Tyre Map Layout Builder */}
                                    <div className="bg-gray-50 p-8 rounded-2xl flex flex-col items-center border border-gray-200">
                                        <div className="relative w-full max-w-3xl flex flex-col gap-12 items-center">
                                            {/* Top Front Indicator */}
                                            <div className="absolute -top-6 text-gray-400 font-bold tracking-widest uppercase text-sm border-b-2 border-gray-300 pb-1 px-4">Bagian Depan</div>
                                            
                                            {/* Helper Function to Render a Tyre Slot */}
                                            {(() => {
                                                const renderTyre = (pos) => {
                                                    const t = tyresMap[pos];
                                                    return (
                                                        <div className="w-24 sm:w-32 bg-white border border-gray-200 rounded-lg p-2 shadow-sm text-center relative hover:shadow-md transition">
                                                            <div className="text-xs font-bold text-gray-500 mb-1">{pos}</div>
                                                            {t ? (
                                                                <>
                                                                    <div className="w-full h-16 sm:h-20 bg-gray-800 rounded-md mb-2 flex items-center justify-center relative overflow-hidden border-2 border-gray-900">
                                                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMmQzNzQ4Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMWEyMDI2IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
                                                                        <span className="relative text-white font-mono text-xs z-10 break-all px-1 leading-tight">{t.serial_number || 'No S/N'}</span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-[#10b981]">{t.current_lifetime} HM</div>
                                                                    <div className="text-[10px] text-gray-400 truncate">{t.brand || 'Unknown'}</div>
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-16 sm:h-20 bg-gray-100 rounded-md mb-2 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-400 font-medium">Kosong</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                const unitType = (unit.type_unit || '').toUpperCase();
                                                
                                                // 10 TYRES: DUMP TRUCK, WATER TRUCK
                                                if (unitType.includes('DUMP') || unitType.includes('WATER')) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-4 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 7')}{renderTyre('Pos 8')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 9')}{renderTyre('Pos 10')}</div>
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 8 TYRES: LUBECAR (Assume dual rear axles)
                                                else if (unitType.includes('LUBE')) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 mt-4 relative">
                                                                {renderTyre('Pos 7')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 8')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 6 TYRES: HAULER, MOTORGRADER, MMH, MB001, MB002
                                                else if (['HAULER', 'MOTORGRADER', 'MMH', 'MB001', 'MB002'].some(t => unitType.includes(t))) {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-lg mt-8 relative">
                                                                <div className="flex gap-2">{renderTyre('Pos 3')}{renderTyre('Pos 4')}</div>
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                <div className="flex gap-2">{renderTyre('Pos 5')}{renderTyre('Pos 6')}</div>
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // 2 TYRES: COMPACTOR (Drum front, 2 tyres rear)
                                                else if (unitType.includes('COMPACTOR')) {
                                                    return (
                                                        <>
                                                            <div className="w-full max-w-sm px-4 flex justify-center mb-8 relative">
                                                                <div className="w-64 h-24 bg-gray-400 rounded-lg shadow-inner flex items-center justify-center border-4 border-gray-500">
                                                                    <span className="text-white font-bold tracking-widest">DRUM SILINDER</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('Pos 1')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('Pos 2')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                // Default 4 Tyres (Light Vehicle or Unknown)
                                                else {
                                                    return (
                                                        <>
                                                            <div className="flex justify-between w-full max-w-sm px-4 relative">
                                                                {renderTyre('FL')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('FR')}
                                                            </div>
                                                            <div className="flex justify-between w-full max-w-sm px-4 mt-8 relative">
                                                                {renderTyre('RL')}
                                                                <div className="w-2 bg-gray-300 absolute left-1/2 -translate-x-1/2 h-full rounded-full"></div>
                                                                {renderTyre('RR')}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        {/* LIST APL TAB */}
                        {activeTab === 'apl' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-gray-900">List APL</h3>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                    {filteredApls.length} Part
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">Aplikasi Part & Pelumas (Periodic Service) untuk unit {unit.code_unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Search Filter */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={aplSearch}
                                                onChange={(e) => setAplSearch(e.target.value)}
                                                placeholder="Cari part no, desc, depart..."
                                                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-48 sm:w-60"
                                            />
                                            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>

                                        {/* Import Part Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsAplImportModalOpen(true)}
                                            className="bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition whitespace-nowrap"
                                            title="Impor Part dari file Excel / CSV"
                                        >
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Import Part
                                        </button>

                                        {/* Tambah APL Button */}
                                        <button
                                            type="button"
                                            onClick={openCreateAplModal}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Tambah APL
                                        </button>
                                    </div>
                                </div>

                                {/* Table Matching User Screenshot */}
                                <div className="overflow-x-auto p-4">
                                    <table className="w-full text-xs sm:text-sm border-collapse border border-slate-600 shadow-xs">
                                        <thead>
                                            <tr className="bg-[#a8b0b8] text-gray-900 font-bold border-b border-slate-600 divide-x divide-slate-600">
                                                <th className="p-2.5 text-center w-12 border border-slate-600">
                                                    No.
                                                </th>
                                                <th className="p-2.5 text-center min-w-[150px] border border-slate-600">
                                                    <div className="leading-snug">Part Number</div>
                                                    <div className="leading-snug text-[11px] font-bold text-gray-800">Depart</div>
                                                </th>
                                                <th className="p-2.5 text-center min-w-[200px] border border-slate-600">
                                                    Description
                                                </th>
                                                <th className="p-2.5 text-center w-20 border border-slate-600">
                                                    Standart QTY
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">{isLV ? '5000 KM' : '250'}</div>
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">{isLV ? '10000 KM' : '500'}</div>
                                                </th>
                                                {!isLV && (
                                                    <>
                                                        <th className="p-2 text-center w-16 border border-slate-600">
                                                            <div className="leading-tight">PS</div>
                                                            <div className="leading-tight text-[11px] font-bold">1000</div>
                                                        </th>
                                                        <th className="p-2 text-center w-16 border border-slate-600">
                                                            <div className="leading-tight">PS</div>
                                                            <div className="leading-tight text-[11px] font-bold">2000</div>
                                                        </th>
                                                    </>
                                                )}
                                                <th className="p-2.5 text-center w-20 border border-slate-600">
                                                    Satuan
                                                </th>
                                                <th className="p-2.5 text-center min-w-[130px] border border-slate-600">
                                                    Unit Rate
                                                </th>
                                                <th className="p-2.5 text-center min-w-[140px] border border-slate-600">
                                                    Total Price
                                                </th>
                                                <th className="p-2.5 text-center w-20 border border-slate-600 print:hidden">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-400 bg-white">
                                            {filteredApls.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isLV ? 10 : 12} className="px-6 py-14 text-center border border-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-700">Belum ada data APL untuk unit ini</p>
                                                                <p className="text-xs text-gray-400 mt-1">Klik tombol "Tambah APL" di atas untuk menambahkan daftar part service</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={openCreateAplModal}
                                                                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Tambah Data APL Sekarang
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredApls.map((apl, idx) => (
                                                    <tr key={apl.id || idx} className="hover:bg-slate-50 divide-x divide-slate-400 transition-colors">
                                                        <td className="p-2.5 text-center text-gray-700 font-mono text-xs border border-slate-400">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="p-2.5 border border-slate-400">
                                                            <div className="font-bold text-gray-900 font-mono tracking-tight">{apl.part_number}</div>
                                                            {apl.depart && (
                                                                <div className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider mt-0.5">{apl.depart}</div>
                                                            )}
                                                            {apl.is_global && (
                                                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                                                    Global
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 font-medium text-gray-800 border border-slate-400">
                                                            {apl.description || '-'}
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold text-gray-900 border border-slate-400">
                                                            {Number(apl.qty).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-0 text-center border border-slate-400 h-9 min-w-[50px] overflow-hidden align-middle">
                                                            {apl.ps_250 ? (
                                                                <div className="py-2 text-center font-bold text-gray-900 text-sm">✓</div>
                                                            ) : (
                                                                <div className="w-full h-full min-h-[34px] bg-slate-500 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]" title={isLV ? "Tidak diganti pada PS 5000 KM" : "Tidak diganti pada PS 250"}></div>
                                                            )}
                                                        </td>
                                                        <td className="p-0 text-center border border-slate-400 h-9 min-w-[50px] overflow-hidden align-middle">
                                                            {apl.ps_500 ? (
                                                                <div className="py-2 text-center font-bold text-gray-900 text-sm">✓</div>
                                                            ) : (
                                                                <div className="w-full h-full min-h-[34px] bg-slate-500 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]" title={isLV ? "Tidak diganti pada PS 10000 KM" : "Tidak diganti pada PS 500"}></div>
                                                            )}
                                                        </td>
                                                        {!isLV && (
                                                            <>
                                                                <td className="p-0 text-center border border-slate-400 h-9 min-w-[50px] overflow-hidden align-middle">
                                                                    {apl.ps_1000 ? (
                                                                        <div className="py-2 text-center font-bold text-gray-900 text-sm">✓</div>
                                                                    ) : (
                                                                        <div className="w-full h-full min-h-[34px] bg-slate-500 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]" title="Tidak diganti pada PS 1000"></div>
                                                                    )}
                                                                </td>
                                                                <td className="p-0 text-center border border-slate-400 h-9 min-w-[50px] overflow-hidden align-middle">
                                                                    {apl.ps_2000 ? (
                                                                        <div className="py-2 text-center font-bold text-gray-900 text-sm">✓</div>
                                                                    ) : (
                                                                        <div className="w-full h-full min-h-[34px] bg-slate-500 [background-image:repeating-linear-gradient(45deg,#334155_0,#334155_1.5px,transparent_0,transparent_5px)] [background-size:6px_6px]" title="Tidak diganti pada PS 2000"></div>
                                                                    )}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="p-2.5 text-center font-bold text-gray-800 border border-slate-400">
                                                            {apl.satuan || 'PCS'}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono font-bold text-gray-900 border border-slate-400 whitespace-nowrap">
                                                            {Number(apl.price_rate) > 0 ? (
                                                                <>
                                                                    <span className="text-gray-500 font-normal mr-1">Rp</span>
                                                                    {Number(apl.price_rate).toLocaleString('id-ID')}
                                                                </>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono font-black text-emerald-950 border border-slate-400 whitespace-nowrap">
                                                            {((Number(apl.qty) || 1) * (Number(apl.price_rate) || 0)) > 0 ? (
                                                                <>
                                                                    <span className="text-gray-500 font-normal mr-1">Rp</span>
                                                                    {((Number(apl.qty) || 1) * (Number(apl.price_rate) || 0)).toLocaleString('id-ID')}
                                                                </>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="p-2 text-center border border-slate-400 print:hidden">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditAplModal(apl)}
                                                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition"
                                                                    title="Edit Part APL"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteApl(apl.id)}
                                                                    className="p-1 rounded text-red-600 hover:bg-red-50 transition"
                                                                    title="Hapus Part APL"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {filteredApls.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-slate-200 font-bold text-gray-900 divide-x divide-slate-600 border-t-2 border-slate-700">
                                                    <td colSpan={3} className="p-2.5 text-right uppercase tracking-wider text-xs border border-slate-600">
                                                        Total Part: {filteredApls.length} Item
                                                    </td>
                                                    <td className="p-2.5 text-center font-bold border border-slate-600">
                                                        {Number(totalAplQty).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td colSpan={isLV ? 2 : 4} className="p-2.5 border border-slate-600"></td>
                                                    <td className="p-2.5 border border-slate-600"></td>
                                                    <td className="p-2.5 text-right uppercase tracking-wider text-xs font-bold border border-slate-600">
                                                        TOTAL PRICE:
                                                    </td>
                                                    <td className="p-2.5 text-right font-mono font-black text-emerald-900 border border-slate-600 text-sm whitespace-nowrap">
                                                        Rp {totalAplTotalPrice.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-2.5 border border-slate-600 print:hidden"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* GET TAB */}
                        {(activeTab === 'get' || activeTab === 'get_dari') && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header Tab */}
                                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/40 via-white to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-gray-900 tracking-tight">GET (Ground Engaging Tools)</h3>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800">
                                                    {filteredGets.length} Item
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Daftar part GET (Tooth, Adapter, Cutting Edge, End Bit, Ripper Tip) untuk unit {unit.code_unit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        {/* Search Box */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={getSearch}
                                                onChange={(e) => setGetSearch(e.target.value)}
                                                placeholder="Cari part no, desc, depart..."
                                                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-48 sm:w-60"
                                            />
                                            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>

                                        {/* Import GET Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsGetImportModalOpen(true)}
                                            className="bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition whitespace-nowrap"
                                            title="Impor GET dari file Excel / CSV"
                                        >
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Import GET
                                        </button>

                                        {/* Tambah GET Button */}
                                        <button
                                            type="button"
                                            onClick={openCreateGetModal}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Tambah GET
                                        </button>
                                    </div>
                                </div>

                                {/* Table Matching Excel Technical Format */}
                                <div className="overflow-x-auto p-4">
                                    <table className="w-full text-xs sm:text-sm border-collapse border border-slate-600 shadow-xs">
                                        <thead>
                                            <tr className="bg-[#a8b0b8] text-gray-900 font-bold border-b border-slate-600 divide-x divide-slate-600">
                                                <th className="p-2.5 text-center w-12 border border-slate-600">
                                                    No.
                                                </th>
                                                <th className="p-2.5 text-center min-w-[150px] border border-slate-600">
                                                    <div className="leading-snug">Part Number</div>
                                                    <div className="leading-snug text-[11px] font-bold text-gray-800">Depart</div>
                                                </th>
                                                <th className="p-2.5 text-center min-w-[200px] border border-slate-600">
                                                    Description
                                                </th>
                                                <th className="p-2.5 text-center w-16 border border-slate-600">
                                                    QTY
                                                </th>
                                                <th className="p-2.5 text-center w-20 border border-slate-600">
                                                    Satuan
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">250</div>
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">500</div>
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">1000</div>
                                                </th>
                                                <th className="p-2 text-center w-16 border border-slate-600">
                                                    <div className="leading-tight">PS</div>
                                                    <div className="leading-tight text-[11px] font-bold">2000</div>
                                                </th>
                                                <th className="p-2.5 text-center min-w-[130px] border border-slate-600">
                                                    Price Rate
                                                </th>
                                                <th className="p-2.5 text-center min-w-[140px] border border-slate-600">
                                                    Total Price
                                                </th>
                                                <th className="p-2.5 text-center w-20 border border-slate-600 print:hidden">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-400 bg-white">
                                            {filteredGets.length === 0 ? (
                                                <tr>
                                                    <td colSpan={12} className="px-6 py-14 text-center border border-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-700">Belum ada data GET untuk unit ini</p>
                                                                <p className="text-xs text-gray-400 mt-1">Gunakan tombol "Import GET" untuk unggah file Excel atau "Tambah GET" secara manual</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsGetImportModalOpen(true)}
                                                                    className="bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                    </svg>
                                                                    Import File Excel GET
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={openCreateGetModal}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                    Tambah Data GET Sekarang
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredGets.map((item, idx) => (
                                                    <tr key={item.id || idx} className="hover:bg-slate-50 divide-x divide-slate-400 transition-colors">
                                                        <td className="p-2.5 text-center text-gray-700 font-mono text-xs border border-slate-400">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="p-2.5 border border-slate-400">
                                                            <div className="font-bold text-gray-900 font-mono tracking-tight">{item.part_number}</div>
                                                            {item.depart && (
                                                                <div className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider mt-0.5">{item.depart}</div>
                                                            )}
                                                            {item.is_global && (
                                                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                                                    Global
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 font-medium text-gray-800 border border-slate-400">
                                                            {item.description || '-'}
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold text-gray-900 border border-slate-400">
                                                            {Number(item.qty)}
                                                        </td>
                                                        <td className="p-2.5 text-center uppercase font-bold text-gray-700 border border-slate-400">
                                                            {item.satuan || 'PCS'}
                                                        </td>
                                                        <td className="p-2 text-center font-bold text-emerald-800 border border-slate-400">
                                                            {item.ps_250 || '-'}
                                                        </td>
                                                        <td className="p-2 text-center font-bold text-emerald-800 border border-slate-400">
                                                            {item.ps_500 || '-'}
                                                        </td>
                                                        <td className="p-2 text-center font-bold text-emerald-800 border border-slate-400">
                                                            {item.ps_1000 || '-'}
                                                        </td>
                                                        <td className="p-2 text-center font-bold text-emerald-800 border border-slate-400">
                                                            {item.ps_2000 || '-'}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono font-bold text-gray-900 border border-slate-400">
                                                            {Number(item.price_rate) > 0 ? Number(item.price_rate).toLocaleString('id-ID') : '-'}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono font-black text-indigo-900 border border-slate-400">
                                                            {((Number(item.qty) || 1) * (Number(item.price_rate) || 0)) > 0
                                                                ? ((Number(item.qty) || 1) * (Number(item.price_rate) || 0)).toLocaleString('id-ID')
                                                                : '-'}
                                                        </td>
                                                        <td className="p-2 text-center border border-slate-400 print:hidden">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditGetModal(item)}
                                                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition"
                                                                    title="Edit Part GET"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteGet(item.id)}
                                                                    className="p-1 rounded text-red-600 hover:bg-red-50 transition"
                                                                    title="Hapus Part GET"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {filteredGets.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-slate-200 font-bold text-gray-900 divide-x divide-slate-600 border-t-2 border-slate-700">
                                                    <td colSpan={3} className="p-2.5 text-right uppercase tracking-wider text-xs border border-slate-600">
                                                        Total Part: {filteredGets.length} Item
                                                    </td>
                                                    <td className="p-2.5 text-center font-bold border border-slate-600">
                                                        {totalGetQty}
                                                    </td>
                                                    <td colSpan={5} className="p-2.5 border border-slate-600"></td>
                                                    <td className="p-2.5 text-right uppercase tracking-wider text-xs font-bold border border-slate-600">
                                                        TOTAL PRICE:
                                                    </td>
                                                    <td className="p-2.5 text-right font-mono font-black text-indigo-900 border border-slate-600 text-sm">
                                                        Rp {totalGetTotalPrice.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-2.5 border border-slate-600 print:hidden"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah / Edit APL */}
            {isAplModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8 transition-all">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">
                                        {editingApl ? 'Edit Data APL' : 'Tambah Data APL'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Formulir part & kebutuhan service interval unit <span className="font-bold text-gray-700">{unit.code_unit}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAplModalOpen(false)}
                                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleAplSubmit} className="p-6 space-y-4">
                            {/* Part Number & Depart */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Part Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={aplForm.part_number}
                                        onChange={(e) => handleAplFormChange('part_number', e.target.value)}
                                        placeholder="Contoh: 600-185-5100"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Depart / Kompartemen
                                    </label>
                                    <input
                                        type="text"
                                        list="depart-list"
                                        value={aplForm.depart}
                                        onChange={(e) => handleAplFormChange('depart', e.target.value)}
                                        placeholder="Contoh: ENGINE, HYDRAULIC, dll"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                                    />
                                    <datalist id="depart-list">
                                        <option value="ENGINE" />
                                        <option value="HYDRAULIC" />
                                        <option value="TRANSMISSION" />
                                        <option value="ELECTRICAL" />
                                        <option value="UNDERCARRIAGE" />
                                        <option value="BRAKE & WHEEL" />
                                        <option value="CABIN" />
                                        <option value="ATTACHMENT" />
                                        <option value="LUBRICANT & OIL" />
                                        <option value="GENERAL" />
                                    </datalist>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Description / Nama Part <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={aplForm.description}
                                    onChange={(e) => handleAplFormChange('description', e.target.value)}
                                    placeholder="Contoh: OIL FILTER CARTRIDGE"
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                                    required
                                />
                            </div>

                            {/* QTY & Satuan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        QTY (Jumlah) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={aplForm.qty}
                                        onChange={(e) => handleAplFormChange('qty', e.target.value)}
                                        placeholder="1"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Satuan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="satuan-list"
                                        value={aplForm.satuan}
                                        onChange={(e) => handleAplFormChange('satuan', e.target.value)}
                                        placeholder="PCS / LTR / SET"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 uppercase font-bold"
                                        required
                                    />
                                    <datalist id="satuan-list">
                                        <option value="PCS" />
                                        <option value="LTR" />
                                        <option value="SET" />
                                        <option value="CAN" />
                                        <option value="DRUM" />
                                        <option value="EA" />
                                        <option value="MTR" />
                                        <option value="KG" />
                                        <option value="ROL" />
                                        <option value="PACK" />
                                    </datalist>
                                </div>
                            </div>

                            {/* Periodic Service (PS) Intervals */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Kebutuhan Periodic Service (PS)
                                    <span className="text-[11px] font-normal text-gray-500 ml-2">(Isi simbol '✓', angka jumlah, atau kosongkan)</span>
                                </label>
                                <div className={`grid ${isLV ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-3`}>
                                    {(isLV ? ['ps_250', 'ps_500'] : ['ps_250', 'ps_500', 'ps_1000', 'ps_2000']).map((psKey) => {
                                        const label = isLV
                                            ? (psKey === 'ps_250' ? 'PS 5000 KM' : 'PS 10000 KM')
                                            : psKey.replace('ps_', 'PS ');
                                        const val = aplForm[psKey];
                                        return (
                                            <div key={psKey} className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                                                <div className="text-xs font-black text-gray-700 mb-1">{label}</div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) => handleAplFormChange(psKey, e.target.value)}
                                                        placeholder="-"
                                                        className="w-full text-center text-xs py-1 border-gray-300 rounded font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAplFormChange(psKey, val === '✓' ? '' : '✓')}
                                                        className={`px-1.5 py-1 text-xs rounded font-bold transition ${
                                                            val === '✓' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title="Toggle checkmark"
                                                    >
                                                        ✓
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Price Rate */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Price Rate (Harga Satuan)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">Rp</span>
                                    <input
                                        type="text"
                                        value={aplForm.price_rate}
                                        onChange={(e) => handleAplFormChange('price_rate', e.target.value)}
                                        placeholder="Contoh: 330.00 atau 330.000 (Rp 330.000)"
                                        className="w-full pl-9 text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                    />
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <span className="text-gray-500">
                                        💡 Contoh: input <span className="font-bold text-gray-800">330.00</span> atau <span className="font-bold text-gray-800">330</span> = Rp 330.000 (tiga ratus tiga puluh ribu)
                                    </span>
                                    {parsePriceInput(aplForm.price_rate) > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                                Rate: Rp {parsePriceInput(aplForm.price_rate).toLocaleString('id-ID')}
                                            </span>
                                            <span className="font-bold text-indigo-800 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                                                Total Price: Rp {((Number(aplForm.qty) || 1) * parsePriceInput(aplForm.price_rate)).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scope Selector */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aplForm.is_global}
                                        onChange={(e) => handleAplFormChange('is_global', e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">
                                            Terapkan untuk semua unit ({unit.type_unit || 'Global'})
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            Jika dicentang, part ini akan otomatis muncul pada tab List APL semua unit
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAplModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={aplSubmitting}
                                    className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {aplSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {editingApl ? 'Perbarui Data APL' : 'Simpan Data APL'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Import Part (List APL) */}
            {isAplImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 my-8 transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">Import List Part (APL)</h3>
                                    <p className="text-xs text-gray-500">Unggah file Excel / CSV data part untuk unit {unit.code_unit}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAplImportModalOpen(false)}
                                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAplImportSubmit} className="p-6 space-y-4">
                            {/* Download Template Banner */}
                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-emerald-950">Belum punya format file?</div>
                                    <div className="text-[11px] text-emerald-700">Gunakan template Excel resmi agar kolom terpetakan otomatis.</div>
                                </div>
                                <a
                                    href={route('unit-apls.template')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs transition"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Unduh Template
                                </a>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Pilih File Excel / CSV <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-emerald-50/30 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        required
                                        onChange={(e) => setAplImportFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        {aplImportFile ? (
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{aplImportFile.name}</p>
                                                <p className="text-[11px] text-emerald-600 mt-0.5">{(aplImportFile.size / 1024).toFixed(1)} KB - Siap diimpor</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Klik untuk memilih file atau drag & drop</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Format didukung: .xlsx, .xls, .csv (Maks. 10MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aplReplaceExisting}
                                        onChange={(e) => setAplReplaceExisting(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">
                                            Ganti data lama unit ini (Replace existing)
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            Jika dicentang, data part lama khusus unit ini akan dihapus sebelum data baru dimasukkan.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAplImportModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={aplImporting || !aplImportFile}
                                    className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {aplImporting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mengimpor...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Mulai Impor Part
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah / Edit GET */}
            {isGetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8 transition-all">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">
                                        {editingGet ? 'Edit Data GET' : 'Tambah Data GET'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Ground Engaging Tools untuk unit <span className="font-bold text-gray-700">{unit.code_unit}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGetModalOpen(false)}
                                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleGetSubmit} className="p-6 space-y-4">
                            {/* Part Number & Depart */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Part Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={getForm.part_number}
                                        onChange={(e) => handleGetFormChange('part_number', e.target.value)}
                                        placeholder="Contoh: 207-70-14151"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Depart / Kompartemen / Posisi
                                    </label>
                                    <input
                                        type="text"
                                        list="get-depart-list"
                                        value={getForm.depart}
                                        onChange={(e) => handleGetFormChange('depart', e.target.value)}
                                        placeholder="Contoh: BUCKET, BLADE, RIPPER"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                                    />
                                    <datalist id="get-depart-list">
                                        <option value="BUCKET" />
                                        <option value="BLADE" />
                                        <option value="RIPPER" />
                                        <option value="ATTACHMENT" />
                                        <option value="UNDERCARRIAGE" />
                                        <option value="GENERAL" />
                                    </datalist>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Description / Nama Part GET <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    list="get-desc-list"
                                    value={getForm.description}
                                    onChange={(e) => handleGetFormChange('description', e.target.value)}
                                    placeholder="Contoh: TOOTH TIGER, ADAPTER, CUTTING EDGE, END BIT"
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                                    required
                                />
                                <datalist id="get-desc-list">
                                    <option value="TOOTH BUCKET" />
                                    <option value="TOOTH TIGER" />
                                    <option value="ADAPTER BUCKET" />
                                    <option value="PIN TOOTH" />
                                    <option value="LOCK TOOTH" />
                                    <option value="SIDE CUTTER LH" />
                                    <option value="SIDE CUTTER RH" />
                                    <option value="CUTTING EDGE CENTER" />
                                    <option value="END BIT LH" />
                                    <option value="END BIT RH" />
                                    <option value="RIPPER TIP" />
                                    <option value="PROTECTOR SHANK" />
                                </datalist>
                            </div>

                            {/* QTY & Satuan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        QTY (Jumlah) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={getForm.qty}
                                        onChange={(e) => handleGetFormChange('qty', e.target.value)}
                                        placeholder="1"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Satuan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="satuan-list"
                                        value={getForm.satuan}
                                        onChange={(e) => handleGetFormChange('satuan', e.target.value)}
                                        placeholder="PCS / SET"
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 uppercase font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PS Intervals (Optional) */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Interval Periodic Service (PS) / Penggantian
                                    <span className="text-[11px] font-normal text-gray-500 ml-2">(Isi simbol '✓', angka, atau kosongkan)</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['ps_250', 'ps_500', 'ps_1000', 'ps_2000'].map((psKey) => {
                                        const label = psKey.replace('ps_', 'PS ');
                                        const val = getForm[psKey];
                                        return (
                                            <div key={psKey} className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                                                <div className="text-xs font-black text-gray-700 mb-1">{label}</div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) => handleGetFormChange(psKey, e.target.value)}
                                                        placeholder="-"
                                                        className="w-full text-center text-xs py-1 border-gray-300 rounded font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGetFormChange(psKey, val === '✓' ? '' : '✓')}
                                                        className={`px-1.5 py-1 text-xs rounded font-bold transition ${
                                                            val === '✓' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title="Toggle checkmark"
                                                    >
                                                        ✓
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Price Rate */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Price Rate (Harga Satuan)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">Rp</span>
                                    <input
                                        type="text"
                                        value={getForm.price_rate}
                                        onChange={(e) => handleGetFormChange('price_rate', e.target.value)}
                                        placeholder="Contoh: 280.00 atau 280.000 (Rp 280.000)"
                                        className="w-full pl-9 text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                    />
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <span className="text-gray-500">
                                        💡 Contoh: input <span className="font-bold text-gray-800">280.00</span> atau <span className="font-bold text-gray-800">280</span> = Rp 280.000
                                    </span>
                                    {parsePriceInput(getForm.price_rate) > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-indigo-800 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                                                Rate: Rp {parsePriceInput(getForm.price_rate).toLocaleString('id-ID')}
                                            </span>
                                            <span className="font-bold text-purple-800 font-mono bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                                                Total Price: Rp {((Number(getForm.qty) || 1) * parsePriceInput(getForm.price_rate)).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scope Selector */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={getForm.is_global}
                                        onChange={(e) => handleGetFormChange('is_global', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">
                                            Terapkan untuk semua unit ({unit.type_unit || 'Global'})
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            Jika dicentang, part GET ini akan otomatis muncul pada tab GET semua unit
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGetModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={getSubmitting}
                                    className="px-5 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {getSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {editingGet ? 'Perbarui Data GET' : 'Simpan Data GET'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Import GET */}
            {isGetImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 my-8 transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">Import Ground Engaging Tools (GET)</h3>
                                    <p className="text-xs text-gray-500">Unggah file Excel / CSV data GET untuk unit {unit.code_unit}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGetImportModalOpen(false)}
                                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGetImportSubmit} className="p-6 space-y-4">
                            {/* Download Template Banner */}
                            <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-indigo-950">Belum punya format file GET?</div>
                                    <div className="text-[11px] text-indigo-700">Gunakan template Excel resmi GET agar kolom terpetakan otomatis.</div>
                                </div>
                                <a
                                    href={route('unit-gets.template')}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs transition"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Unduh Template
                                </a>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Pilih File Excel / CSV GET <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-indigo-50/30 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        required
                                        onChange={(e) => setGetImportFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        {getImportFile ? (
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{getImportFile.name}</p>
                                                <p className="text-[11px] text-indigo-600 mt-0.5">{(getImportFile.size / 1024).toFixed(1)} KB - Siap diimpor</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">Klik untuk memilih file atau drag & drop</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Format didukung: .xlsx, .xls, .csv (Maks. 10MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={getReplaceExisting}
                                        onChange={(e) => setGetReplaceExisting(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">
                                            Ganti data GET lama unit ini (Replace existing)
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            Jika dicentang, data GET lama khusus unit ini akan dihapus sebelum data baru dimasukkan.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGetImportModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={getImporting || !getImportFile}
                                    className="px-5 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {getImporting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mengimpor...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Mulai Impor GET
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
