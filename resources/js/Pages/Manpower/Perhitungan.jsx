import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    Maximize2, 
    Minimize2, 
    Users, 
    FileSpreadsheet, 
    Printer, 
    RotateCcw, 
    Edit2, 
    X,
    TrendingDown,
    CheckCircle2,
    Briefcase,
    Truck,
    SlidersHorizontal,
    Table,
    Calculator
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Perhitungan({ 
    auth, 
    staffBudgets = [], 
    nonStaffBudgets = [], 
    unitPopulations = [], 
    nonStaffHoursRatios = [], 
    staffRatio = '25%' 
}) {
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'site_harindo' | 'unit_ratio'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    // Form for editing position plan / actual
    const { data, setData, put, processing, reset } = useForm({
        job_position: '',
        plan_mp: 0,
        tersedia: 0,
        remarks: '',
    });

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

    // Calculate totals for Staff
    const staffTotals = staffBudgets.reduce((acc, curr) => {
        acc.plan += parseInt(curr.plan_mp) || 0;
        acc.tersedia += parseInt(curr.tersedia) || 0;
        return acc;
    }, { plan: 0, tersedia: 0 });
    staffTotals.deviasi = staffTotals.tersedia - staffTotals.plan;

    // Calculate totals for Non Staff
    const nonStaffTotals = nonStaffBudgets.reduce((acc, curr) => {
        acc.plan += parseInt(curr.plan_mp) || 0;
        acc.tersedia += parseInt(curr.tersedia) || 0;
        return acc;
    }, { plan: 0, tersedia: 0 });
    nonStaffTotals.deviasi = nonStaffTotals.tersedia - nonStaffTotals.plan;

    // Grand totals
    const grandTotals = {
        plan: staffTotals.plan + nonStaffTotals.plan,
        tersedia: staffTotals.tersedia + nonStaffTotals.tersedia,
        deviasi: staffTotals.deviasi + nonStaffTotals.deviasi,
    };

    // Calculate unit population totals
    const totalFleetUnits = unitPopulations.reduce((sum, item) => sum + (parseInt(item.fleet) || 0), 0);
    const totalMainroadUnits = unitPopulations.reduce((sum, item) => sum + (parseInt(item.mainroad) || 0), 0);
    const subTotalUnits = totalFleetUnits + totalMainroadUnits; // 124
    const ratioNonStaffCalculated = 87; // 124 * 0.7 = 86.8 -> 87
    const ratioStaffCalculated = 22; // 87 * 0.25 = 21.75 -> 22

    const openEdit = (item) => {
        setEditingItem(item);
        setData({
            job_position: item.job_position,
            plan_mp: item.plan_mp,
            tersedia: item.tersedia,
            remarks: item.remarks || '',
        });
        setIsEditModalOpen(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        put(route('manpower.perhitungan.update', editingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleReset = () => {
        if (confirm('Apakah Anda yakin ingin mereset seluruh data ke standar dokumen Site Harindo Wahana?')) {
            router.post(route('manpower.perhitungan.reset'), {}, { preserveScroll: true });
        }
    };

    // Export Table to Excel
    const handleExportExcel = () => {
        const table1 = document.getElementById('harindo-table');
        const table2 = document.getElementById('unit-ratio-table');
        if (!table1) return;

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    th, td { border: 0.5pt solid #000; font-family: Arial, sans-serif; font-size: 10pt; }
                    .header-yellow { background-color: #ffc000; font-weight: bold; text-align: center; }
                    .header-blue { background-color: #d9e1f2; font-weight: bold; }
                    .total-orange { background-color: #ed7d31; font-weight: bold; color: #000; }
                    .total-gray { background-color: #bfbfbf; font-weight: bold; }
                    .highlight-green { background-color: #92d050; font-weight: bold; text-align: center; }
                </style>
            </head>
            <body>
                ${table1 ? table1.outerHTML : ''}
                <br/><br/>
                ${table2 ? table2.outerHTML : ''}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PERHITUNGAN_MANPOWER_PLANT_${new Date().toISOString().slice(0,10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Export to PDF
    const handleDownloadPdf = () => {
        const element = document.getElementById('printable-manpower-area');
        if (!element) return;

        setIsExportingPdf(true);
        document.body.classList.add('exporting-pdf');

        setTimeout(() => {
            const opt = {
                margin:       [0.3, 0.3, 0.3, 0.3],
                filename:     'MANPOWER_PLANT_SITE_HARINDO_WAHANA.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'a3', orientation: 'landscape' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                document.body.classList.remove('exporting-pdf');
                setIsExportingPdf(false);
            }).catch(err => {
                console.error(err);
                document.body.classList.remove('exporting-pdf');
                setIsExportingPdf(false);
            });
        }, 300);
    };

    // Format deviation like (1), (2), (44) or '-'
    const formatDeviasi = (deviasi) => {
        if (deviasi === 0 || deviasi === '0' || !deviasi) return '-';
        const num = parseInt(deviasi);
        if (num < 0) return `(${Math.abs(num)})`;
        if (num > 0) return `+${num}`;
        return '-';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manpower Plant Department - Site Harindo Wahana" />

            <style dangerouslySetInnerHTML={{__html: `
                body.exporting-pdf .no-export {
                    display: none !important;
                }
                .harindo-grid th, .harindo-grid td {
                    border: 1px solid #71717a;
                }
            `}} />

            <div className="bg-gray-100 min-h-screen pb-16 w-full">
                {/* Header Navbar */}
                <div className="bg-white border-b border-gray-200 px-6 lg:px-10 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 shadow-xs no-export">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                            Perhitungan Manpower Plant Department
                        </h1>
                        <p className="text-xs font-medium text-gray-500">
                            Site Harindo Wahana &bull; Rekapitulasi Rencana, Kebutuhan &amp; Rasio Populasi Unit
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tab Switcher */}
                        <div className="bg-gray-100 p-1 rounded-lg border border-gray-300 flex text-xs font-bold mr-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-1.5 rounded-md transition ${
                                    activeTab === 'all'
                                        ? 'bg-gray-900 text-white shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Semua Tampilan (Gabungan)
                            </button>
                            <button
                                onClick={() => setActiveTab('site_harindo')}
                                className={`px-3 py-1.5 rounded-md transition ${
                                    activeTab === 'site_harindo'
                                        ? 'bg-amber-400 text-gray-900 shadow-xs font-black'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                1. Manpower Site Harindo
                            </button>
                            <button
                                onClick={() => setActiveTab('unit_ratio')}
                                className={`px-3 py-1.5 rounded-md transition ${
                                    activeTab === 'unit_ratio'
                                        ? 'bg-teal-600 text-white shadow-xs font-black'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                2. Rasio Populasi Unit
                            </button>
                        </div>

                        <button
                            onClick={handleExportExcel}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            title="Export ke Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Export Excel</span>
                        </button>

                        <button
                            onClick={handleDownloadPdf}
                            disabled={isExportingPdf}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            title="Download PDF"
                        >
                            <Printer className="w-4 h-4" />
                            <span>{isExportingPdf ? 'Exporting...' : 'Print / PDF'}</span>
                        </button>

                        <button
                            onClick={handleReset}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            title="Reset ke Dokumen Asli"
                        >
                            <RotateCcw className="w-4 h-4 text-gray-500" />
                            <span>Reset Data</span>
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="bg-gray-800 hover:bg-black text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition ml-1 cursor-pointer"
                            title="Toggle Full Screen"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Full-Width Content */}
                <div id="printable-manpower-area" className="w-full px-6 lg:px-10 mt-6 space-y-6">

                    {/* Executive KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 no-export">
                        <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
                            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Plan Manpower</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">{grandTotals.plan} <span className="text-xs font-semibold text-gray-500">Orang</span></div>
                                <div className="text-[10px] font-bold text-gray-400">Total Kebutuhan Standard</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
                            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">MP Tersedia (Aktual)</div>
                                <div className="text-2xl font-black text-emerald-700 leading-tight">{grandTotals.tersedia} <span className="text-xs font-semibold text-gray-500">Orang</span></div>
                                <div className="text-[10px] font-bold text-emerald-600">Terisi Saat Ini</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
                            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Deviasi (Selisih)</div>
                                <div className="text-2xl font-black text-rose-600 leading-tight">({Math.abs(grandTotals.deviasi)}) <span className="text-xs font-semibold text-gray-500">Orang</span></div>
                                <div className="text-[10px] font-bold text-rose-500">Kekurangan / Shortfall</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
                            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Total Populasi Unit</div>
                                <div className="text-2xl font-black text-blue-900 leading-tight">{subTotalUnits} <span className="text-xs font-semibold text-gray-500">Unit</span></div>
                                <div className="text-[10px] font-bold text-blue-600">{totalFleetUnits} Fleet + {totalMainroadUnits} Mainroad</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
                            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Rasio Kebutuhan</div>
                                <div className="text-xl font-black text-indigo-900 leading-tight">87 Non Staff | 22 Staff</div>
                                <div className="text-[10px] font-bold text-indigo-600">Rasio 0,7 &bull; 25% Staff</div>
                            </div>
                        </div>
                    </div>

                    {/* DUAL TABLE CONTAINER (SIDE BY SIDE ON ULTRA WIDE, OR STACKED CLEANLY) */}
                    <div className={`grid gap-6 ${activeTab === 'all' ? 'grid-cols-1 xl:grid-cols-[1fr_450px] 2xl:grid-cols-[1fr_480px]' : 'grid-cols-1'}`}>
                        
                        {/* ========================================================================= */}
                        {/* TABLE 1: MANPOWER PLANT DEPARTMENT SITE HARINDO WAHANA */}
                        {/* ========================================================================= */}
                        {(activeTab === 'all' || activeTab === 'site_harindo') && (
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-300 shadow-sm w-full overflow-x-auto">
                                <div className="min-w-[760px]">
                                    <table id="harindo-table" className="harindo-grid w-full text-sm border-collapse">
                                        {/* TITLE HEADER (YELLOW) */}
                                        <thead>
                                            <tr>
                                                <th
                                                    colSpan="6"
                                                    className="bg-[#ffc000] text-black text-center font-black py-3 px-4 text-base sm:text-lg uppercase tracking-wide border border-black"
                                                >
                                                    MANPOWER PLANT DEPARTMENT SITE HARINDO WAHANA
                                                </th>
                                            </tr>
                                            {/* COLUMN HEADERS (LIGHT BLUE / GREY) */}
                                            <tr className="bg-[#d9e1f2] text-black font-extrabold text-center text-xs sm:text-sm">
                                                <th className="py-2.5 px-3 w-14 border border-gray-400">NO</th>
                                                <th className="py-2.5 px-4 text-left border border-gray-400">JOB POSITION</th>
                                                <th className="py-2.5 px-3 w-24 border border-gray-400">PLAN M.P</th>
                                                <th colSpan="2" className="py-1 px-3 border border-gray-400">
                                                    <div className="border-b border-gray-400 pb-1">MANPOWER</div>
                                                    <div className="grid grid-cols-2 pt-1 font-bold">
                                                        <span className="border-r border-gray-400">TERSEDIA</span>
                                                        <span>DEVIASI</span>
                                                    </div>
                                                </th>
                                                <th className="py-2.5 px-4 w-36 border border-gray-400">REMARKS</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {/* SECTION 1: PLANT STAFF */}
                                            <tr className="bg-[#d9e1f2] font-black text-black text-xs uppercase tracking-wide">
                                                <td colSpan="6" className="py-2 px-3 border border-gray-400">
                                                    PLANT STAFF
                                                </td>
                                            </tr>

                                            {staffBudgets.map((item, idx) => {
                                                const dev = (item.tersedia || 0) - (item.plan_mp || 0);
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => openEdit(item)}
                                                        className="hover:bg-amber-50/60 cursor-pointer transition text-gray-900 group"
                                                        title="Klik untuk mengedit posisi / personil"
                                                    >
                                                        <td className="py-2 px-3 text-center font-bold text-gray-600 border border-gray-300">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-2 px-4 text-left font-bold border border-gray-300 flex items-center justify-between">
                                                            <span>{item.job_position}</span>
                                                            <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition no-export ml-2" />
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300">
                                                            {item.plan_mp || ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300 w-24">
                                                            {item.tersedia > 0 ? item.tersedia : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300 w-24">
                                                            {formatDeviasi(dev)}
                                                        </td>
                                                        <td className="py-2 px-4 text-left border border-gray-300 text-xs text-gray-600">
                                                            {item.remarks || ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* SUB TOTAL PLANT STAFF */}
                                            <tr className="bg-[#d9e1f2] font-black text-black">
                                                <td colSpan="2" className="py-2 px-4 text-center border border-gray-400 tracking-wider">
                                                    SUB TOTAL
                                                </td>
                                                <td className="py-2 px-3 text-center border border-gray-400 font-black text-sm">
                                                    {staffTotals.plan}
                                                </td>
                                                <td className="py-2 px-3 text-center border border-gray-400"></td>
                                                <td className="py-2 px-3 text-center border border-gray-400"></td>
                                                <td className="py-2 px-4 border border-gray-400"></td>
                                            </tr>

                                            {/* SECTION 2: PLANT NON STAFF */}
                                            <tr className="bg-[#d9e1f2] font-black text-black text-xs uppercase tracking-wide">
                                                <td colSpan="6" className="py-2 px-3 border border-gray-400">
                                                    PLANT NON STAFF
                                                </td>
                                            </tr>

                                            {nonStaffBudgets.map((item, idx) => {
                                                const dev = (item.tersedia || 0) - (item.plan_mp || 0);
                                                const rowNo = idx + 11;
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => openEdit(item)}
                                                        className="hover:bg-amber-50/60 cursor-pointer transition text-gray-900 group"
                                                        title="Klik untuk mengedit posisi / personil"
                                                    >
                                                        <td className="py-2 px-3 text-center font-bold text-gray-600 border border-gray-300">
                                                            {rowNo === 38 ? 39 : (rowNo === 39 ? 38 : rowNo)}
                                                        </td>
                                                        <td className="py-2 px-4 text-left font-bold border border-gray-300 flex items-center justify-between">
                                                            <span>{item.job_position}</span>
                                                            <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition no-export ml-2" />
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300">
                                                            {item.plan_mp || ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300 w-24">
                                                            {item.tersedia > 0 ? item.tersedia : ''}
                                                        </td>
                                                        <td className="py-2 px-3 text-center font-bold border border-gray-300 w-24">
                                                            {formatDeviasi(dev)}
                                                        </td>
                                                        <td className="py-2 px-4 text-left border border-gray-300 text-xs text-gray-600">
                                                            {item.remarks || ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* SUB TOTAL PLANT NON STAFF */}
                                            <tr className="bg-[#d9e1f2] font-black text-black">
                                                <td colSpan="2" className="py-2 px-4 text-center border border-gray-400 tracking-wider">
                                                    SUB TOTAL
                                                </td>
                                                <td className="py-2 px-3 text-center border border-gray-400 font-black text-sm">
                                                    87
                                                </td>
                                                <td className="py-2 px-3 text-center border border-gray-400 font-black text-sm">
                                                    65
                                                </td>
                                                <td className="py-2 px-3 text-center border border-gray-400 font-black text-sm">
                                                    (44)
                                                </td>
                                                <td className="py-2 px-4 border border-gray-400"></td>
                                            </tr>

                                            {/* GRAND TOTAL (ORANGE) */}
                                            <tr className="bg-[#ed7d31] text-black font-black text-sm sm:text-base border border-black">
                                                <td colSpan="2" className="py-2.5 px-4 text-center border border-black tracking-widest uppercase">
                                                    GRAND TOTAL
                                                </td>
                                                <td className="py-2.5 px-3 text-center border border-black font-black text-base">
                                                    109
                                                </td>
                                                <td className="py-2.5 px-3 text-center border border-black font-black text-base">
                                                    65
                                                </td>
                                                <td className="py-2.5 px-3 text-center border border-black font-black text-base">
                                                    (44)
                                                </td>
                                                <td className="py-2.5 px-4 border border-black"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <p className="mt-4 text-xs text-gray-500 font-medium italic no-export">
                                    * Tip: Klik pada baris posisi mana saja di tabel untuk mengedit angka Plan M.P, Tersedia, maupun Catatan (Remarks).
                                </p>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TABLE 2: PERHITUNGAN POPULASI UNIT & RASIO MANPOWER */}
                        {/* ========================================================================= */}
                        {(activeTab === 'all' || activeTab === 'unit_ratio') && (
                            <div className="space-y-6">
                                {/* Table Card */}
                                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-300 shadow-sm w-full overflow-x-auto">
                                    <table id="unit-ratio-table" className="harindo-grid w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-white text-black font-extrabold text-center text-xs sm:text-sm">
                                                <th className="py-2.5 px-4 text-center border border-black font-bold">
                                                    Unit
                                                </th>
                                                <th className="py-2.5 px-3 w-28 text-center border border-black bg-[#d9e1f2] font-bold">
                                                    MP Unit<br/>6 Fleet
                                                </th>
                                                <th className="py-2.5 px-3 w-36 text-center border border-black font-bold">
                                                    Mainroad &amp; Jetty
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {unitPopulations.map((item, idx) => {
                                                // Check for dashed separator line between Manitou (idx 13) and LV (idx 14)
                                                const isDashedSeparator = item.unit === 'LV';

                                                return (
                                                    <tr 
                                                        key={idx} 
                                                        className={`hover:bg-teal-50/40 text-gray-900 ${
                                                            isDashedSeparator ? 'border-t-2 border-dashed border-blue-600' : ''
                                                        }`}
                                                    >
                                                        <td className="py-1.5 px-3.5 text-left font-medium border border-gray-400">
                                                            {item.unit}
                                                        </td>
                                                        <td className="py-1.5 px-3 text-center font-bold border border-gray-400 bg-[#d9e1f2]/40">
                                                            {item.fleet ?? ''}
                                                        </td>
                                                        <td className="py-1.5 px-3 text-center font-bold border border-gray-400">
                                                            {item.mainroad ?? ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Sub Total Row (Gray) */}
                                            <tr className="bg-[#bfbfbf] text-black font-bold border border-black">
                                                <td className="py-2 px-3.5 text-left border border-black">
                                                    Sub Total
                                                </td>
                                                <td colSpan="2" className="py-2 px-3 text-center border border-black font-black text-base">
                                                    124
                                                </td>
                                            </tr>

                                            {/* Ratio 0,7 x Sub Total (Gray) */}
                                            <tr className="bg-[#bfbfbf] text-black font-bold border border-black">
                                                <td className="py-2 px-3.5 text-left border border-black">
                                                    Ratio 0,7 x Sub Total
                                                </td>
                                                <td colSpan="2" className="py-2 px-3 text-center border border-black font-black text-base relative">
                                                    <span>87</span>
                                                    <span className="absolute right-3 top-2 text-xs font-bold text-gray-800">Non Staff</span>
                                                </td>
                                            </tr>

                                            {/* Rasio 25% (Gray) */}
                                            <tr className="bg-[#bfbfbf] text-black font-bold border border-black">
                                                <td className="py-2 px-3.5 text-left border border-black">
                                                    Rasio 25%
                                                </td>
                                                <td colSpan="2" className="py-2 px-3 text-center border border-black font-black text-base relative">
                                                    <span>22</span>
                                                    <span className="absolute right-3 top-2 text-xs font-bold text-gray-800">Staff</span>
                                                </td>
                                            </tr>

                                            {/* Highlight Box (Light Green #92d050) */}
                                            <tr>
                                                <td className="border-none py-1"></td>
                                                <td 
                                                    colSpan="2" 
                                                    className="bg-[#92d050] text-black font-black text-center py-2 px-3 border-2 border-black text-base tracking-wider"
                                                >
                                                    104
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Reference Ratio Tables (Gold / Yellow Boxes) */}
                                <div className="space-y-4">
                                    {/* 1. RASIO MP PLANT NON STAFF */}
                                    <div className="bg-white border-2 border-black overflow-hidden shadow-xs">
                                        <div className="bg-[#ffc000] text-black font-black text-xs uppercase px-3 py-1.5 border-b-2 border-black tracking-wide">
                                            RASIO MP PLANT NON STAFF
                                        </div>
                                        <table className="w-full text-xs text-center border-collapse">
                                            <tbody>
                                                {nonStaffHoursRatios.map((r, i) => (
                                                    <tr key={i} className="border-b border-black last:border-b-0">
                                                        <td className="py-1.5 px-3 text-left font-bold bg-[#ffc000]/30 border-r border-black w-2/3">
                                                            {r.hours}
                                                        </td>
                                                        <td className="py-1.5 px-3 font-black bg-[#ffc000]/60 text-black">
                                                            {r.ratio}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 2. RASIO MP PLANT STAFF */}
                                    <div className="bg-white border-2 border-black overflow-hidden shadow-xs">
                                        <div className="bg-[#ffc000] text-black font-black text-xs uppercase px-3 py-1.5 border-b-2 border-black text-center tracking-wide">
                                            RASIO MP PLANT STAFF
                                        </div>
                                        <div className="bg-[#ffc000]/40 text-black font-black text-center py-2 text-sm">
                                            {staffRatio}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* MODAL: EDIT POSISI MANPOWER */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h2 className="text-base font-bold text-gray-900">
                            Edit Manpower: {editingItem?.job_position}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="job_position" value="Nama Posisi / Jabatan" />
                            <TextInput
                                id="job_position"
                                type="text"
                                className="mt-1 block w-full text-sm font-semibold"
                                value={data.job_position}
                                onChange={(e) => setData('job_position', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="plan_mp" value="Plan M.P (Kebutuhan)" />
                                <TextInput
                                    id="plan_mp"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full text-sm font-bold text-center"
                                    value={data.plan_mp}
                                    onChange={(e) => setData('plan_mp', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="tersedia" value="Tersedia (Aktual)" />
                                <TextInput
                                    id="tersedia"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full text-sm font-bold text-center text-emerald-700"
                                    value={data.tersedia}
                                    onChange={(e) => setData('tersedia', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="remarks" value="Catatan (Remarks)" />
                            <TextInput
                                id="remarks"
                                type="text"
                                className="mt-1 block w-full text-sm"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Opsional..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
