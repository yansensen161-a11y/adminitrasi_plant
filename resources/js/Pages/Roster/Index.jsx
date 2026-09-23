import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { 
    Maximize2, 
    Minimize2, 
    FileSpreadsheet, 
    Upload, 
    Download, 
    Trash2, 
    Users, 
    RefreshCw, 
    X, 
    Search, 
    RotateCcw,
    Calendar,
    Sun,
    Moon,
    Coffee,
    Plane
} from 'lucide-react';

export default function Index({ 
    auth, 
    stats = {}, 
    data = [], 
    departments = [], 
    filters = {}, 
    totalInManpower = 0 
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedDept, setSelectedDept] = useState(filters.departemen || 'Semua');
    const [selectedPeriode, setSelectedPeriode] = useState(filters.periode || 'September 2026');

    // Import Form
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, reset: resetImport, errors: importErrors } = useForm({
        file: null,
    });
    const fileInputRef = useRef(null);

    // Fullscreen API toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => console.error(err));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Filter handling
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('roster.index'), {
            search: searchTerm,
            departemen: selectedDept,
            periode: selectedPeriode,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedDept('Semua');
        setSelectedPeriode('September 2026');
        router.get(route('roster.index'), {}, { preserveState: true });
    };

    // Clear All Roster Data
    const handleClearAll = () => {
        if (confirm('Apakah Anda yakin ingin menghapus / mengosongkan seluruh data roster yang tampil di menu ini?')) {
            router.post(route('roster.clear-all.post'), {}, { preserveScroll: true });
        }
    };

    // Sync from Manpower
    const handleSyncManpower = () => {
        if (confirm(`Muat data roster dari data Manpower Plant (${totalInManpower} karyawan)? Jadwal shift otomatis disesuaikan.`)) {
            router.post(route('roster.sync-manpower'), {}, { preserveScroll: true });
        }
    };

    // Submit Import
    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;

        postImport(route('roster.import'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsImportModalOpen(false);
                resetImport();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };
    
    // Day headers based on September 2026 (30 days)
    const days = ['Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min', 'Sen'];
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = i + 1;
        const dayStr = days[i % 7];
        const isSunday = dayStr === 'Min';
        const isSaturday = dayStr === 'Sab';
        return { date: d, day: dayStr, isWeekend: isSunday || isSaturday, isSunday };
    });

    // Helper to render shift cell (compact and neat)
    const renderShiftCell = (shift, isWeekend, isSunday, idx) => {
        let bgColor = '';
        let textColor = 'text-white';
        let cellContent = shift || '-';

        if (shift === 'S') bgColor = 'bg-[#16a34a]'; // Green
        else if (shift === 'M') bgColor = 'bg-[#2563eb]'; // Royal Blue
        else if (shift === 'O') {
            bgColor = 'bg-gray-400'; // Gray for off
            cellContent = 'O';
        } else if (shift === 'C') {
            bgColor = 'bg-rose-500'; // Red for cuti
            cellContent = 'C';
        } else if (shift === 'D') {
            bgColor = 'bg-amber-500'; // Amber for dinas
            cellContent = 'D';
        } else {
            bgColor = isSunday ? 'bg-rose-50' : (isWeekend ? 'bg-gray-100' : 'bg-white');
            textColor = 'text-gray-300';
            cellContent = '-';
        }

        return (
            <td key={idx} className="p-0 text-center border border-gray-200 w-6 min-w-[23px] max-w-[25px]">
                <div className={`w-full h-5.5 mx-auto ${bgColor} ${textColor} font-bold text-[10px] flex items-center justify-center leading-none select-none`}>
                    {cellContent}
                </div>
            </td>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roster Karyawan" />

            <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-12 w-full">
                
                {/* Header Row */}
                <div className="px-6 lg:px-10 py-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-gray-200 gap-4 sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Roster Karyawan</h1>
                            <p className="text-xs text-gray-500">Pengaturan jadwal kerja karyawan sesuai pola shift plant</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xs text-gray-500 mr-2 hidden xl:block">
                            Home &gt; Manpower & Organization &gt; <span className="text-gray-900 font-bold">Roster Karyawan</span>
                        </div>

                        {/* Sync from Manpower Plant Button */}
                        <button 
                            onClick={handleSyncManpower}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition h-[34px] cursor-pointer"
                            title="Generate jadwal dari data 63 karyawan Manpower Plant"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Muat dari Manpower ({totalInManpower})</span>
                        </button>

                        {/* Import Excel Button */}
                        <button 
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition h-[34px] cursor-pointer"
                            title="Import jadwal dari file Excel"
                        >
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Import Excel</span>
                        </button>

                        {/* Export Excel Button */}
                        <a 
                            href={route('roster.export')}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition h-[34px] cursor-pointer"
                            title="Export data ke Excel"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                            <span>Export Excel</span>
                        </a>

                        {/* Clear All / Hapus Data Tampilan */}
                        {data.length > 0 && (
                            <button 
                                onClick={handleClearAll}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition h-[34px] cursor-pointer"
                                title="Hapus seluruh data tampilan saat ini"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Data Tampilan</span>
                            </button>
                        )}

                        {/* Full Screen Toggle Button */}
                        <button 
                            onClick={toggleFullscreen}
                            className="bg-gray-800 hover:bg-black text-white font-bold px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition h-[34px] cursor-pointer"
                            title="Toggle Full Screen"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                        </button>
                    </div>
                </div>

                <div className="w-full px-6 lg:px-10 mt-6 space-y-4">
                    
                    {/* Filters Toolbar */}
                    <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 mb-2 bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Periode</label>
                            <div className="relative">
                                <select 
                                    value={selectedPeriode} 
                                    onChange={(e) => setSelectedPeriode(e.target.value)}
                                    className="pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs text-gray-800 bg-white min-w-[140px] focus:outline-none"
                                >
                                    <option value="September 2026">September 2026</option>
                                    <option value="Oktober 2026">Oktober 2026</option>
                                    <option value="Semua">Semua Periode</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Departemen</label>
                            <select 
                                value={selectedDept} 
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-800 bg-white min-w-[120px] focus:outline-none"
                            >
                                <option value="Semua">Semua Departemen</option>
                                {departments.map((dept, i) => (
                                    <option key={i} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex-1 relative min-w-[200px]">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cari Karyawan</label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari NRP atau nama karyawan..." 
                                    className="w-full border border-gray-300 rounded text-xs px-2 py-1.5 pl-8 focus:outline-none focus:border-gray-400" 
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition h-[32px] cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Cari
                        </button>

                        <button 
                            type="button"
                            onClick={handleReset}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition h-[32px] cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </form>

                    {/* KPI Cards (Connected Dynamically) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-[#3b82f6] rounded-lg p-3 flex items-center gap-3 text-white shadow-xs border border-[#2563eb]">
                            <div className="p-2 bg-white/20 rounded-full shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold opacity-90 uppercase">Total Karyawan</div>
                                <div className="text-2xl font-black leading-tight">{stats.total_karyawan ?? 0}</div>
                                <div className="text-[9px] font-bold opacity-80">Orang</div>
                            </div>
                        </div>

                        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-3 flex items-center gap-3 shadow-xs">
                            <div className="p-2 bg-[#d1fae5] text-[#10b981] rounded-full shrink-0">
                                <Sun className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-700 uppercase">Shift Siang (S)</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{stats.shift_siang ?? 0}</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang ({stats.shift_siang_pct ?? '0%'})</div>
                            </div>
                        </div>

                        <div className="bg-[#312e81] border border-[#3730a3] rounded-lg p-3 flex items-center gap-3 text-white shadow-xs">
                            <div className="p-2 bg-white/20 rounded-full shrink-0">
                                <Moon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold opacity-90 uppercase">Shift Malam (M)</div>
                                <div className="text-2xl font-black leading-tight">{stats.shift_malam ?? 0}</div>
                                <div className="text-[9px] font-bold opacity-80">Orang ({stats.shift_malam_pct ?? '0%'})</div>
                            </div>
                        </div>

                        <div className="bg-[#fef9c3] border border-[#fef08a] rounded-lg p-3 flex items-center gap-3 shadow-xs">
                            <div className="p-2 bg-[#fef08a] text-[#ca8a04] rounded-full shrink-0">
                                <Coffee className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-700 uppercase">Off Day (O)</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{stats.off_day ?? 0}</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang ({stats.off_day_pct ?? '0%'})</div>
                            </div>
                        </div>

                        <div className="bg-[#fee2e2] border border-[#fecaca] rounded-lg p-3 flex items-center gap-3 shadow-xs">
                            <div className="p-2 bg-[#fecaca] text-[#ef4444] rounded-full shrink-0">
                                <Plane className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-gray-700 uppercase">Cuti</div>
                                <div className="text-2xl font-black text-[#ef4444] leading-tight">{stats.cuti ?? 0}</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang ({stats.cuti_pct ?? '0%'})</div>
                            </div>
                        </div>
                    </div>

                    {/* Roster Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-xs mt-4 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-800">
                                Roster Karyawan - {selectedPeriode}
                            </h3>
                            {data.length > 0 && (
                                <span className="text-xs font-semibold text-gray-500">
                                    Total {data.length} personil terdaftar
                                </span>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-300 text-gray-800">
                                        <th className="px-1 py-1.5 font-bold text-center border border-gray-300 w-8 min-w-[30px] max-w-[32px]">No</th>
                                        <th className="px-1.5 py-1.5 font-bold text-center border border-gray-300 w-24 min-w-[90px] max-w-[95px] whitespace-nowrap">NRP</th>
                                        <th className="px-2 py-1.5 font-bold text-left border border-gray-300 w-44 min-w-[160px] max-w-[175px] whitespace-nowrap">Nama Karyawan</th>
                                        <th className="px-1.5 py-1.5 font-bold text-left border border-gray-300 w-32 min-w-[120px] max-w-[135px] whitespace-nowrap">Jabatan</th>
                                        <th className="px-1.5 py-1.5 font-bold text-left border border-gray-300 w-20 min-w-[70px] max-w-[80px] whitespace-nowrap">Departemen</th>
                                        
                                        {/* Date Headers 1 to 30 */}
                                        {dates.map((d, i) => (
                                             <th 
                                                key={i} 
                                                className={`p-0 text-center border border-gray-300 w-6 min-w-[23px] max-w-[25px] ${
                                                    d.isSunday 
                                                        ? 'bg-rose-100/70 text-rose-800' 
                                                        : (d.isWeekend ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-800')
                                                }`}
                                                title={`Tanggal ${d.date} (${d.day})`}
                                            >
                                                <div className="text-[10px] font-bold leading-tight mt-0.5">{d.date}</div>
                                                <div className="text-[7.5px] font-semibold leading-none mb-0.5 opacity-80">{d.day}</div>
                                            </th>
                                        ))}

                                        <th className="px-1 py-1 font-bold text-center border border-gray-300 bg-gray-100 text-gray-800" colSpan="3">Total</th>
                                    </tr>
                                    <tr className="bg-gray-50 text-center text-[9px]">
                                        <th className="border border-gray-300" colSpan="5"></th>
                                        {dates.map((d, i) => (
                                            <th key={i} className={`border border-gray-300 p-0 ${d.isSunday ? 'bg-rose-50' : (d.isWeekend ? 'bg-gray-50' : '')}`}></th>
                                        ))}
                                        <th className="p-0 border border-gray-300 w-6 min-w-[24px] font-black text-emerald-700 bg-emerald-50">S</th>
                                        <th className="p-0 border border-gray-300 w-6 min-w-[24px] font-black text-blue-700 bg-blue-50">M</th>
                                        <th className="p-0 border border-gray-300 w-6 min-w-[24px] font-black text-gray-700 bg-gray-100">O</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={38} className="py-14 text-center text-gray-500 bg-white border border-gray-200">
                                                <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-800">Belum Ada Data Roster Karyawan</h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Data tampilan sebelumnya telah dikosongkan. Anda dapat mengimpor file roster Excel baru atau memuat data dari Manpower Plant.
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button 
                                                            onClick={handleSyncManpower}
                                                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition"
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                            Muat dari Manpower ({totalInManpower})
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsImportModalOpen(true)}
                                                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition"
                                                        >
                                                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                                            Import Excel Roster
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((item, idx) => {
                                            const shifts = item.shifts || [];

                                            return (
                                                <tr key={item.id} className="hover:bg-amber-50/40 text-gray-900">
                                                    <td className="px-1 py-0.5 text-center text-gray-500 border border-gray-300 font-medium text-[11px]">{idx + 1}</td>
                                                    <td className="px-1.5 py-0.5 text-center font-mono border border-gray-300 text-gray-700 text-[10.5px] whitespace-nowrap">{item.nrp}</td>
                                                    <td className="px-2 py-0.5 font-bold text-gray-900 border border-gray-300 text-[11px] truncate whitespace-nowrap max-w-[175px]" title={item.nama}>{item.nama}</td>
                                                    <td className="px-1.5 py-0.5 text-gray-700 border border-gray-300 text-[10.5px] truncate whitespace-nowrap max-w-[135px]" title={item.posisi}>{item.posisi}</td>
                                                    <td className="px-1.5 py-0.5 text-gray-700 border border-gray-300 text-[10.5px] truncate whitespace-nowrap max-w-[80px]" title={item.departemen}>{item.departemen}</td>
                                                    
                                                    {/* Render 30 Date Cells */}
                                                    {dates.map((d, i) => renderShiftCell(shifts[i], d.isWeekend, d.isSunday, i))}

                                                    {/* Render Totals */}
                                                    <td className="p-0 text-center font-bold text-gray-900 bg-emerald-50/40 border border-gray-300 text-[10px] w-6 min-w-[24px]">{item.total_s ?? 0}</td>
                                                    <td className="p-0 text-center font-bold text-gray-900 bg-blue-50/40 border border-gray-300 text-[10px] w-6 min-w-[24px]">{item.total_m ?? 0}</td>
                                                    <td className="p-0 text-center font-bold text-gray-900 bg-gray-100/60 border border-gray-300 text-[10px] w-6 min-w-[24px]">{item.total_o ?? 0}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Bar */}
                        <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 bg-white">
                            <div>
                                Menampilkan {data.length > 0 ? 1 : 0} - {data.length} dari {stats.total_karyawan ?? 0} data
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL IMPORT EXCEL ROSTER */}
            <Modal show={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} maxWidth="md">
                <form onSubmit={handleImportSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-bold text-gray-900">Import Excel Roster</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center justify-between">
                            <span>Format file harus sesuai dengan template standar.</span>
                            <a 
                                href={route('roster.template')} 
                                className="font-bold underline flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Template
                            </a>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Pilih Berkas Excel (.xlsx, .xls, .csv)
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => setImportData('file', e.target.files[0])}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-md cursor-pointer"
                                required
                            />
                            {importErrors.file && (
                                <p className="text-rose-600 text-xs mt-1">{importErrors.file}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                        <SecondaryButton onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={importProcessing || !importData.file} className="bg-emerald-600 hover:bg-emerald-700">
                            {importProcessing ? 'Mengimpor...' : 'Unggah & Terapkan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
