import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ units, groupedLogs, dates, dropdowns, filters, flash, errors }) {
    // State for filters
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.code_unit || '');

    const [legendFilter, setLegendFilter] = useState({
        normal: true,
        stagnant: true,
        error: true,
        blank: true
    });

    const handleLegendToggle = (key) => {
        setLegendFilter(prev => ({...prev, [key]: !prev[key]}));
    };

    // File input ref for import
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleDownloadTemplateClick = () => {
        setIsDownloadingTemplate(true);
        setTimeout(() => setIsDownloadingTemplate(false), 2000);
    };

    const handleExportPdfClick = () => {
        setIsExportingPdf(true);
        setTimeout(() => setIsExportingPdf(false), 3000);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAll = () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA data Hour Meter? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('hour-meters.delete.all'));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        router.post(route('hour-meters.import'), {
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
        e.preventDefault();
        router.get(route('hour-meters.index'), {
            code_unit: codeUnitFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setCodeUnitFilter('');
        setDateFrom('');
        setDateTo('');
        setLegendFilter({ normal: true, stagnant: true, error: true, blank: true });
        router.get(route('hour-meters.index'));
    };

    const displayedUnits = units.filter(u => {
        if (legendFilter.normal && legendFilter.stagnant && legendFilter.error && legendFilter.blank) {
            return true;
        }
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const log = groupedLogs[u.id]?.[date];
            const isStagnant = log && Number(log.hm_total) === 0;
            const isOver = log && Number(log.hm_total) > 24;
            const isMinus = log && Number(log.hm_total) < 0;
            const isBlank = !log;
            const isError = isOver || isMinus;
            const isNormal = log && !isStagnant && !isError;
            
            if (isBlank && legendFilter.blank) return true;
            if (isError && legendFilter.error) return true;
            if (isStagnant && legendFilter.stagnant) return true;
            if (isNormal && legendFilter.normal) return true;
        }
        return false;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    const formatHeaderDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short'
        }).replace(/ /g, '-');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Hour Meter" />

            {/* Flash Message */}
            {flash?.message && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    <span>{flash.message}</span>
                </div>
            )}

            {errors?.file && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                    <span>{errors.file}</span>
                </div>
            )}

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Hour Meter
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Monitoring hour meter unit dan riwayat pemakaian</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={route('hour-meters.create')} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Input HM
                    </Link>

                    <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                    />
                    
                    <button 
                        onClick={handleDeleteAll}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Kosongkan Data
                    </button>

                    <button 
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
                    >
                        {isImporting ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        )}
                        {isImporting ? 'Mengimpor...' : 'Import Excel'}
                    </button>

                    <a 
                        href={route('hour-meters.download.template')} 
                        onClick={handleDownloadTemplateClick}
                        className={`bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm ${isDownloadingTemplate ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                        {isDownloadingTemplate ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        )}
                        {isDownloadingTemplate ? 'Mengunduh...' : 'Download Template'}
                    </a>
                    
                    <a 
                        href={route('hour-meters.export.pdf')} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={handleExportPdfClick}
                        className={`bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm ${isExportingPdf ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                        {isExportingPdf ? (
                            <svg className="animate-spin w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        )}
                        {isExportingPdf ? 'Mengekspor...' : 'Cetak PDF'}
                    </a>
                </div>
            </div>

            {/* Filter & Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cari Unit (Kode)</label>
                            <input 
                                type="text" 
                                value={codeUnitFilter}
                                onChange={(e) => setCodeUnitFilter(e.target.value)}
                                placeholder="Contoh: EX-201"
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 min-w-[150px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tanggal Dari</label>
                            <input 
                                type="date" 
                                value={dateFrom}
                                max={dateTo || undefined}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg px-3 py-2 min-w-[130px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tanggal Sampai</label>
                            <input 
                                type="date" 
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="text-sm border border-gray-300 text-gray-700 rounded-lg px-3 py-2 min-w-[130px]"
                            />
                        </div>
                        <div className="flex items-end gap-2 pb-0">
                            <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                Cari
                            </button>
                            <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Reset
                            </button>
                        </div>
                    </form>

                    {/* Color Legend Checkboxes */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-bold">
                        <span className="text-gray-500 uppercase tracking-wider">KETERANGAN WARNA (Bisa Dicentang):</span>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.normal} onChange={() => handleLegendToggle('normal')} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-200"></span>
                            <span className="text-emerald-700">Normal (1-24 Jam)</span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.stagnant} onChange={() => handleLegendToggle('stagnant')} className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-yellow-50 border border-yellow-200"></span>
                            <span className="text-yellow-700">Tidak Operasi (Stagnant / 0 Jam)</span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.error} onChange={() => handleLegendToggle('error')} className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-red-50 border border-red-200"></span>
                            <span className="text-red-700">Error (&gt;24 Jam atau Minus)</span>
                        </label>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition">
                            <input type="checkbox" checked={legendFilter.blank} onChange={() => handleLegendToggle('blank')} className="rounded border-gray-300 text-gray-500 focus:ring-gray-500 w-3.5 h-3.5" />
                            <span className="w-3.5 h-3.5 rounded bg-gray-50 border border-gray-200"></span>
                            <span className="text-gray-500">Belum Terisi (Kosong)</span>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-b-xl pb-2 custom-scrollbar">
                    <table className="w-full text-sm text-center whitespace-nowrap border-collapse">
                        <thead className="bg-[#0f2e26] text-white sticky top-0 z-10 shadow-sm text-sm">
                            <tr>
                                <th className="px-1 py-2 font-semibold border-r border-[#1a4a3c] min-w-[30px]">NO</th>
                                <th className="px-2 py-2 font-semibold border-r border-[#1a4a3c] min-w-[80px] text-left">KODE UNIT</th>
                                <th className="px-2 py-2 font-semibold border-r border-[#1a4a3c] min-w-[90px] text-left">TYPE UNIT</th>
                                {dates.map((date, idx) => (
                                    <th key={idx} className="px-1 py-2 font-semibold border-r border-[#1a4a3c] min-w-[60px]">
                                        {formatHeaderDate(date)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 bg-white text-sm">
                            {displayedUnits && displayedUnits.length > 0 ? (
                                displayedUnits.map((u, index) => {
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-1 py-1.5 border-r border-gray-100 font-medium text-gray-500">{index + 1}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-100 font-bold text-gray-900 text-left">{u.code_unit}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-100 text-left">{u.type_unit || '-'}</td>
                                            
                                            {dates.map((date, idx) => {
                                                const log = groupedLogs[u.id]?.[date];
                                                const hmVal = log ? Number(log.hm_end).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) : '-';
                                                
                                                const isStagnant = log && Number(log.hm_total) === 0;
                                                const isOver = log && Number(log.hm_total) > 24;
                                                const isMinus = log && Number(log.hm_total) < 0;
                                                const isBlank = !log;
                                                
                                                let cellClasses = "px-1 py-1.5 border-r border-gray-100 font-semibold ";
                                                if (isBlank) {
                                                    cellClasses += "bg-gray-50 text-gray-400";
                                                } else if (isOver || isMinus) {
                                                    cellClasses += "bg-red-50 text-red-600";
                                                } else if (isStagnant) {
                                                    cellClasses += "bg-yellow-50 text-yellow-600";
                                                } else {
                                                    cellClasses += "bg-emerald-50 text-emerald-700";
                                                }

                                                return (
                                                    <td key={idx} className={cellClasses}>
                                                        {hmVal}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3 + dates.length} className="px-6 py-12 text-center text-gray-400">
                                        Tidak ada data unit yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
