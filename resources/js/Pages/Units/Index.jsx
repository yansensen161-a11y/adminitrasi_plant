import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ units, stats, unitsByType, locations, engineMakes, filters, allUnitsList = [] }) {
    const { flash, errors } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [locationFilter, setLocationFilter] = useState(filters.location || '');
    const [typeFilter, setTypeFilter] = useState(filters.type_unit || '');

    // Multi-sheet Excel export modal states
    const [showMultiSheetModal, setShowMultiSheetModal] = useState(false);
    const [selectedExportUnitId, setSelectedExportUnitId] = useState('');
    const [unitModalSearch, setUnitModalSearch] = useState('');

    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    const typeChartRef = useRef(null);
    const statusChartRef = useRef(null);
    const chartInstances = useRef({});

    // Toggle states for expanding charts
    const [isTypeExpanded, setIsTypeExpanded] = useState(false);
    const [isStatusExpanded, setIsStatusExpanded] = useState(false);

    const { delete: destroy } = useForm();

    const getExportExcelUrl = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        if (locationFilter) params.append('location', locationFilter);
        if (typeFilter) params.append('type_unit', typeFilter);
        const qs = params.toString();
        return route('units.export.excel') + (qs ? `?${qs}` : '');
    };

    const getExportPdfUrl = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (locationFilter) params.append('location', locationFilter);
        const qs = params.toString();
        return route('units.export.pdf') + (qs ? `?${qs}` : '');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        router.post(route('units.import'), {
            file: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleSearch = (e) => {
        if(e) e.preventDefault();
        router.get(route('units.index'), {
            search,
            status: statusFilter,
            location: locationFilter,
            type_unit: typeFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setLocationFilter('');
        setTypeFilter('');
        router.get(route('units.index'), {}, { preserveState: true });
    };

    const handleDelete = (id, code) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data unit [${code}]?`)) {
            destroy(route('units.destroy', id));
        }
    };

    const total = stats.total || 1;
    const getPct = (val) => ((val / total) * 100).toFixed(1);

    // Array of vibrant colors for the bar chart
    const barColors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
        '#84cc16', '#a855f7', '#0ea5e9', '#f43f5e'
    ];

    useEffect(() => {
        // Cleanup old charts
        Object.values(chartInstances.current).forEach(chart => chart?.destroy());

        // 1. Populasi Unit per Jenis (Bar Chart)
        if (typeChartRef.current && unitsByType) {
            const labels = Object.keys(unitsByType);
            const data = Object.values(unitsByType);
            
            // Assign a color to each bar
            const backgroundColors = labels.map((_, index) => barColors[index % barColors.length]);

            chartInstances.current.typeChart = new Chart(typeChartRef.current, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: backgroundColors,
                        borderRadius: 4,
                        barThickness: 30,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // 2. Status Unit (Donut Chart)
        if (statusChartRef.current) {
            chartInstances.current.statusChart = new Chart(statusChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Running', 'Standby', 'Breakdown', 'Maintenance'],
                    datasets: [{
                        data: [stats.operational, stats.standby, stats.breakdown, stats.maintenance],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        return () => {
            Object.values(chartInstances.current).forEach(chart => chart?.destroy());
        };
    }, [unitsByType, stats]);

    // Units available for multi-sheet export (all units in fleet or current page fallback)
    const availableUnitsForExport = (allUnitsList && allUnitsList.length > 0)
        ? allUnitsList
        : (units.data || []);

    const filteredModalUnits = availableUnitsForExport.filter(u => {
        if (!unitModalSearch) return true;
        const q = unitModalSearch.toLowerCase();
        return (u.code_unit && u.code_unit.toLowerCase().includes(q)) ||
               (u.model && u.model.toLowerCase().includes(q)) ||
               (u.type_unit && u.type_unit.toLowerCase().includes(q)) ||
               (u.location && u.location.toLowerCase().includes(q));
    });

    const selectedUnitObj = availableUnitsForExport.find(u => String(u.id) === String(selectedExportUnitId));

    return (
        <AuthenticatedLayout>
            <Head title="Populasi Unit" />

            {/* Flash Message */}
            {flash?.message && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    <span>{flash.message}</span>
                </div>
            )}
            {errors && Object.keys(errors).length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>{Object.values(errors).join(', ')}</span>
                </div>
            )}

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                        Populasi Unit
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Data seluruh unit alat berat, kendaraan dan equipment di area kerja</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                    />

                    <Link href={route('units.create')} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Unit
                    </Link>
                    <button 
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
                        title="Unggah file Excel untuk menambah / memperbarui populasi unit"
                    >
                        {isImporting ? (
                            <svg className="animate-spin w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        )}
                        {isImporting ? 'Mengimpor...' : 'Import Excel'}
                    </button>
                    <a 
                        href={route('units.download.template')} 
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        title="Download Template Format Excel untuk Import"
                    >
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                        Template Excel
                    </a>
                    <a 
                        href={getExportExcelUrl()} 
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        title="Download Excel Populasi Unit (Data Terfilter / Seluruh Data)"
                    >
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </a>
                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedExportUnitId && availableUnitsForExport.length > 0) {
                                setSelectedExportUnitId(String(availableUnitsForExport[0].id));
                            }
                            setShowMultiSheetModal(true);
                        }}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        title="Download Excel Lengkap Multi-Sheet (Riwayat HM, Component, Breakdown, Servis, Backlog, Budget PA, Magnetic Plug)"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        Export Riwayat Unit (Multi-Sheet)
                    </button>
                    <a 
                        href={getExportPdfUrl()} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        title="Cetak Laporan PDF Populasi Unit"
                    >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </a>
                </div>
            </div>

            {/* 5 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {/* Total Unit */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-gray-900 font-bold text-sm mb-1 text-center">Total Unit</div>
                        <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                    </div>
                </div>

                {/* Running (Operational) */}
                <div className="bg-[#10b981] p-5 rounded-xl border border-[#059669] shadow-sm flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">Running</div>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black">{stats.operational}</div>
                        <div className="text-sm font-semibold opacity-90">{getPct(stats.operational)}%</div>
                    </div>
                </div>

                {/* Standby */}
                <div className="bg-[#facc15] p-5 rounded-xl border border-[#eab308] shadow-sm flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">Standby</div>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black">{stats.standby}</div>
                        <div className="text-sm font-semibold opacity-90">{getPct(stats.standby)}%</div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="bg-[#ef4444] p-5 rounded-xl border border-[#dc2626] shadow-sm flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">Breakdown</div>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z"/></svg>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black">{stats.breakdown}</div>
                        <div className="text-sm font-semibold opacity-90">{getPct(stats.breakdown)}%</div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-[#3b82f6] p-5 rounded-xl border border-[#2563eb] shadow-sm flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">Maintenance</div>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black">{stats.maintenance}</div>
                        <div className="text-sm font-semibold opacity-90">{getPct(stats.maintenance)}%</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Populasi Unit per Jenis */}
                <div className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${isTypeExpanded ? 'w-full' : 'flex-1'} ${isStatusExpanded && !isTypeExpanded ? 'hidden lg:flex' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Populasi Unit per Jenis</h3>
                        <button 
                            onClick={() => setIsTypeExpanded(!isTypeExpanded)}
                            className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-md transition"
                            title={isTypeExpanded ? "Perkecil" : "Perbesar"}
                        >
                            {isTypeExpanded ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0v4m0-4h4m12 4V4m0 0h-4m4 0l-5 5M9 15l-5 5m0 0v-4m0 4h4m6-4l5 5m0 0v-4m0 4h-4"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            )}
                        </button>
                    </div>
                    <div className={`relative flex-1 ${isTypeExpanded ? 'min-h-[400px]' : 'min-h-[300px]'}`}>
                        <canvas ref={typeChartRef}></canvas>
                    </div>
                </div>

                {/* Status Unit */}
                <div className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${isStatusExpanded ? 'w-full' : 'flex-1'} ${isTypeExpanded && !isStatusExpanded ? 'hidden lg:flex' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Status Unit</h3>
                        <button 
                            onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                            className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-md transition"
                            title={isStatusExpanded ? "Perkecil" : "Perbesar"}
                        >
                            {isStatusExpanded ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0v4m0-4h4m12 4V4m0 0h-4m4 0l-5 5M9 15l-5 5m0 0v-4m0 4h4m6-4l5 5m0 0v-4m0 4h-4"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            )}
                        </button>
                    </div>
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-8 flex-1 ${isStatusExpanded ? 'min-h-[400px]' : 'min-h-[300px]'}`}>
                        <div className={`relative ${isStatusExpanded ? 'w-72 h-72' : 'w-56 h-56'}`}>
                            <canvas ref={statusChartRef}></canvas>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className={`${isStatusExpanded ? 'text-6xl' : 'text-4xl'} font-black text-gray-900 leading-none`}>{stats.total}</span>
                                <span className={`${isStatusExpanded ? 'text-sm mt-2' : 'text-sm mt-1'} font-bold text-gray-500 uppercase`}>Total Unit</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between text-sm min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#10b981]"></div>
                                    <span className="text-gray-600 font-medium">Running</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.operational} ({getPct(stats.operational)}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-sm min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#facc15]"></div>
                                    <span className="text-gray-600 font-medium">Standby</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.standby} ({getPct(stats.standby)}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-sm min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#ef4444]"></div>
                                    <span className="text-gray-600 font-medium">Breakdown</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.breakdown} ({getPct(stats.breakdown)}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-sm min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#3b82f6]"></div>
                                    <span className="text-gray-600 font-medium">Maintenance</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.maintenance} ({getPct(stats.maintenance)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-3 items-center">
                    <select
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#10b981] focus:border-[#10b981] block w-full md:w-auto p-2"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Semua Jenis Unit</option>
                        {Object.keys(unitsByType || {}).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#10b981] focus:border-[#10b981] block w-full md:w-auto p-2"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="">Semua Lokasi</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    <select
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#10b981] focus:border-[#10b981] block w-full md:w-auto p-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="Operational">Running</option>
                        <option value="Standby">Standby</option>
                        <option value="Breakdown">Breakdown</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>

                    <div className="relative w-full md:w-auto flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#10b981] focus:border-[#10b981] block w-full pl-10 p-2"
                            placeholder="Cari kode unit, model, atau serial number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                    </div>

                    <button onClick={handleSearch} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition w-full md:w-auto justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Cari
                    </button>
                    <button onClick={handleReset} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition w-full md:w-auto shadow-sm flex items-center gap-2 justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Reset
                    </button>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">No</th>
                                <th className="px-4 py-3 whitespace-nowrap">Kode Unit</th>
                                <th className="px-4 py-3 whitespace-nowrap">Equipment</th>
                                <th className="px-4 py-3 whitespace-nowrap">Model</th>
                                <th className="px-4 py-3 whitespace-nowrap">Serial Number</th>
                                <th className="px-4 py-3 whitespace-nowrap">Engine Number</th>
                                <th className="px-4 py-3 whitespace-nowrap">Tahun</th>
                                <th className="px-4 py-3 whitespace-nowrap">Received Date</th>
                                <th className="px-4 py-3 whitespace-nowrap">Lokasi</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right">HM Terakhir</th>
                                <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                                <th className="px-4 py-3 whitespace-nowrap text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => {
                                    // Status Badge styling
                                    let statusClasses = "bg-gray-100 text-gray-700";
                                    let statusText = unit.status;
                                    if (unit.status === 'Operational' || unit.status === 'Ready') {
                                        statusClasses = "bg-[#10b981] text-white";
                                        statusText = "Running";
                                    } else if (unit.status === 'Standby') {
                                        statusClasses = "bg-[#facc15] text-white";
                                    } else if (unit.status === 'Breakdown') {
                                        statusClasses = "bg-[#ef4444] text-white";
                                    } else if (unit.status === 'Maintenance') {
                                        statusClasses = "bg-[#3b82f6] text-white";
                                    }

                                    const formatReceivedDate = (val) => {
                                        if (!val) return '-';
                                        const d = new Date(val);
                                        return isNaN(d.getTime()) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                                    };

                                    return (
                                        <tr 
                                            key={unit.id} 
                                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={(e) => {
                                                if (!e.target.closest('button') && !e.target.closest('a')) {
                                                    router.visit(route('units.show', unit.id));
                                                }
                                            }}
                                            onDoubleClick={(e) => {
                                                if (!e.target.closest('button') && !e.target.closest('a')) {
                                                    router.visit(route('units.edit', unit.id));
                                                }
                                            }}
                                        >
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                {unit.no_urut || ((units.from || 1) + index)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                                                {unit.code_unit}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.type_unit || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.model || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.sn_chassis || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.sn_engine || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.tahun_perakitan || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                                                {formatReceivedDate(unit.received_date)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {unit.location || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 font-mono text-right whitespace-nowrap">
                                                {Number(unit.hm).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded text-sm font-semibold ${statusClasses}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <a
                                                        href={route('units.export.multi-sheet', { unit_id: unit.id })}
                                                        className="w-8 h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                                                        title={`Download Excel Multi-Sheet (${unit.code_unit})`}
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                                        </svg>
                                                    </a>
                                                    <Link
                                                        href={route('units.edit', unit.id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                                                        title="View/Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </Link>
                                                    <Link
                                                        href={route('units.edit', unit.id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white rounded transition"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(unit.id, unit.code_unit)}
                                                        className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data unit yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {units.links && units.links.length > 3 && (
                    <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                        <div className="text-sm text-gray-600">
                            Menampilkan {units.from || 0} - {units.to || 0} dari {units.total} data
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {units.links.map((link, idx) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = '«';
                                if (label.includes('Next')) label = '»';
                                
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                        className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded text-sm transition ${
                                            link.active
                                                ? 'bg-[#10b981] text-white font-bold'
                                                : link.url
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'text-gray-400 cursor-not-allowed border border-gray-200'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Pilih Unit untuk Export Excel Multi-Sheet */}
            {showMultiSheetModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowMultiSheetModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Export Riwayat Lengkap Unit (Excel)</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Pilih unit untuk mengekspor buku kerja Excel lengkap berisi sheet riwayat sesuai tab monitoring.
                                </p>
                            </div>
                        </div>

                        {/* Sheet badges list */}
                        <div className="mb-5 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                8 Sheet yang akan digenerate otomatis:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    📄 Info Unit
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    📊 Riwayat HM
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    🧩 Component
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    ⚠️ Riwayat Breakdown
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    ⚙️ Riwayat Servis
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    📋 Riwayat Backlog
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    🎯 Budget PA
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                    🧲 Magnetic Plug
                                </span>
                            </div>
                        </div>

                        {/* Unit Selector Form */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                    Cari & Pilih Unit:
                                </label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={unitModalSearch}
                                            onChange={e => setUnitModalSearch(e.target.value)}
                                            placeholder="Ketik kode unit, model, atau tipe..."
                                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        />
                                    </div>

                                    <select
                                        value={selectedExportUnitId}
                                        onChange={e => setSelectedExportUnitId(e.target.value)}
                                        className="w-full py-2.5 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                                        size={Math.min(6, Math.max(3, filteredModalUnits.length + 1))}
                                    >
                                        <option value="" disabled>-- Klik untuk memilih salah satu unit --</option>
                                        {filteredModalUnits.map(u => (
                                            <option key={u.id} value={u.id} className="py-1.5 px-2">
                                                {u.code_unit} — {u.model || u.type_unit || 'Unit'} ({u.location || 'Lokasi -'}) [HM: {Number(u.hm || 0).toLocaleString('id-ID')}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selected unit preview card */}
                            {selectedUnitObj && (
                                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 bg-gray-900 text-white font-mono font-bold rounded text-sm">
                                                {selectedUnitObj.code_unit}
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold uppercase">
                                                {selectedUnitObj.type_unit || '-'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Model: <strong className="text-gray-800">{selectedUnitObj.model || '-'}</strong> | SN: {selectedUnitObj.sn_chassis || '-'}
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
                                        <span className="text-xs text-gray-500">
                                            HM: <strong className="text-gray-900 font-mono">{Number(selectedUnitObj.hm || 0).toLocaleString('id-ID')}</strong>
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                                            {selectedUnitObj.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowMultiSheetModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                Batal
                            </button>

                            <a
                                href={selectedExportUnitId ? route('units.export.multi-sheet', { unit_id: selectedExportUnitId }) : '#'}
                                onClick={() => {
                                    if (selectedExportUnitId) {
                                        setTimeout(() => setShowMultiSheetModal(false), 500);
                                    }
                                }}
                                className={`px-5 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 shadow-sm transition ${
                                    selectedExportUnitId
                                        ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                                        : 'bg-gray-300 cursor-not-allowed pointer-events-none'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                </svg>
                                <span>Download Excel ({selectedUnitObj ? selectedUnitObj.code_unit : 'Pilih Unit'})</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
