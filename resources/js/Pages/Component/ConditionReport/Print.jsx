import React, { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    Download,
    ArrowLeft,
    Edit3,
    CheckCircle2,
    FileText
} from 'lucide-react';

export default function Print({ report }) {
    const printRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`CCR - ${report.report_no}`} />

            {/* Print Header Actions (Hidden when printing) */}
            <div className="print:hidden max-w-[297mm] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('ccr.index')}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900 dark:text-white">{report.report_no}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                                report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {report.status || 'DRAFT'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Pratinjau Cetak / Detail WO CCR</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                        href={route('ccr.export-pdf', report.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-gray-300 dark:border-slate-700"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                    </a>

                    <Link
                        href={route('ccr.edit', report.id)}
                        className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-gray-300 dark:border-slate-700"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Laporan
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print Laporan
                    </button>
                </div>
            </div>

            {/* Document Paper Area */}
            <div className="overflow-x-auto pb-12">
                <div
                    ref={printRef}
                    className="ccr-paper-landscape bg-white text-black mx-auto p-6 sm:p-8 shadow-xl print:shadow-none print:p-0 print:m-0"
                    style={{
                        width: '100%',
                        maxWidth: '297mm',
                        minHeight: '210mm',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                >
                    {/* 1. Header Banner */}
                    <div
                        className="flex items-center border-[2px] border-[#2e7d32] bg-[#a8d08d] px-4 py-2 mb-4"
                        style={{ backgroundColor: '#a8d08d', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                    >
                        <div className="w-44 shrink-0 flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="Logo MAM"
                                className="h-10 w-auto object-contain"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                        <div className="flex-1 text-center pr-20">
                            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-black uppercase">
                                CONDITIONS COMPONENT REPORT (CCR)
                            </h1>
                        </div>
                    </div>

                    {/* 2. Metadata Section (2 columns matching Excel) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4 text-[12px] leading-tight">
                        {/* Left Side */}
                        <div className="space-y-1.5">
                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">PROJECT</div>
                                    <div className="text-[10px] italic text-gray-700">Proyek</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.project || '-'}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">LOCATION</div>
                                    <div className="text-[10px] italic text-gray-700">Lokasi</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.location || '-'}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">DATE REPORTED</div>
                                    <div className="text-[10px] italic text-gray-700">Tanggal dilaporkan</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {formatDate(report.date_reported)}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">REPORTED BY</div>
                                    <div className="text-[10px] italic text-gray-700">Dilaporkan oleh</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.reported_by || '-'}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">COMPANY NAME</div>
                                    <div className="text-[10px] italic text-gray-700">Nama perusahaan</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.company_name || 'PT. MITRA ABADI MAHAKAM'}
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="space-y-1.5">
                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">UNIT ID</div>
                                    <div className="text-[10px] italic text-gray-700">No. Unit</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.unit_code || (report.unit ? report.unit.code_unit : '-')}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">MODEL</div>
                                    <div className="text-[10px] italic text-gray-700">Model</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.model || (report.unit ? report.unit.model : '-')}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">SERIAL NO.</div>
                                    <div className="text-[10px] italic text-gray-700">Serial No.</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {report.serial_no || (report.unit ? report.unit.sn_chassis : '-')}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">DATE INSTALL</div>
                                    <div className="text-[10px] italic text-gray-700">Tanggal saat kejadian</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="w-28 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {formatDate(report.date_install)}
                                </div>
                                <div className="w-28 text-right pr-2">
                                    <div className="font-bold text-black text-[11px]">HM Install</div>
                                    <div className="text-[9px] italic text-gray-700">SMU saat kejadian</div>
                                </div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 text-right min-h-[18px]">
                                    {report.hm_install !== null ? report.hm_install : '-'}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="w-36 shrink-0">
                                    <div className="font-bold text-black uppercase">DATE OF FAILURE</div>
                                    <div className="text-[10px] italic text-gray-700">Tanggal saat kejadian</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="w-28 border-b border-black font-bold pb-0.5 text-black px-1 min-h-[18px]">
                                    {formatDate(report.date_failure)}
                                </div>
                                <div className="w-28 text-right pr-2">
                                    <div className="font-bold text-black text-[11px]">Hm Failure</div>
                                    <div className="text-[9px] italic text-gray-700">SMU saat kejadian</div>
                                </div>
                                <div className="flex-1 border-b border-black font-bold pb-0.5 text-black px-1 text-right min-h-[18px]">
                                    {report.hm_failure !== null ? `${report.hm_failure} Hrs` : '- Hrs'}
                                </div>
                            </div>

                            {/* Yellow Highlighted Box */}
                            <div
                                className="flex items-center bg-[#ffff00] border border-black px-2 py-1"
                                style={{ backgroundColor: '#ffff00', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                            >
                                <div className="w-32 shrink-0">
                                    <div className="font-bold text-black uppercase text-[11px]">Life time</div>
                                    <div className="text-[9px] italic text-gray-800">Umur parts</div>
                                </div>
                                <div className="w-4 font-bold text-center">:</div>
                                <div className="w-28 font-black text-center text-sm text-black">
                                    {report.life_time_days !== null ? `${report.life_time_days} Days` : '0 Days'}
                                </div>
                                <div className="w-32 text-right pr-2">
                                    <div className="font-bold text-black text-[11px]">HM Life</div>
                                    <div className="text-[9px] italic text-gray-800">SMU saat kejadian</div>
                                </div>
                                <div className="flex-1 font-black text-right text-sm text-black pr-1">
                                    {report.hm_life !== null ? `${report.hm_life} Hrs` : '0 Hrs'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Table of REMARKS & PICTURE */}
                    <div className="border border-black mb-6">
                        <table className="w-full border-collapse text-[12px]">
                            <thead>
                                <tr className="border-b border-black bg-gray-50 print:bg-transparent">
                                    <th className="border-r border-black py-2 px-3 text-center w-12 font-bold uppercase">
                                        NO
                                    </th>
                                    <th className="border-r border-black py-2 px-4 text-center w-1/2 font-bold uppercase">
                                        REMARKS
                                    </th>
                                    <th className="py-2 px-4 text-center w-1/2 font-bold uppercase">
                                        PICTURE
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.items && report.items.length > 0 ? (
                                    report.items.map((item, idx) => (
                                        <tr key={item.id || idx} className="border-b border-black last:border-b-0 min-h-[160px]">
                                            <td className="border-r border-black py-4 px-2 text-center align-top font-bold">
                                                {item.item_no || (idx + 1)}
                                            </td>
                                            <td className="border-r border-black p-4 align-top text-black whitespace-pre-wrap leading-relaxed">
                                                {item.remarks || '-'}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                {item.picture_path ? (
                                                    <div className="max-h-56 flex items-center justify-center">
                                                        <img
                                                            src={item.picture_url || `/storage/${item.picture_path}`}
                                                            alt={`Dokumentasi ${idx + 1}`}
                                                            className="max-h-52 max-w-full object-contain border border-gray-300 mx-auto"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 italic py-10">
                                                        [ Tidak ada foto ]
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        <tr className="border-b border-black h-36">
                                            <td className="border-r border-black text-center align-top py-4 font-bold">1</td>
                                            <td className="border-r border-black p-4 align-top"></td>
                                            <td className="p-4"></td>
                                        </tr>
                                        <tr className="h-36">
                                            <td className="border-r border-black text-center align-top py-4 font-bold">2</td>
                                            <td className="border-r border-black p-4 align-top"></td>
                                            <td className="p-4"></td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 4. Signatures Section */}
                    <div className="grid grid-cols-3 text-center text-[12px] pt-4 border-t border-gray-400">
                        <div>
                            <div className="font-bold text-black mb-16">Dibuat Oleh,</div>
                            <div className="font-bold text-black inline-block px-4">
                                ( &nbsp; {report.dibuat_oleh || '____________________'} &nbsp; )
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-black">Disetujui Oleh,</div>
                            <div className="font-semibold text-gray-700 mb-14">Spv/Fm</div>
                            <div className="font-bold text-black inline-block px-4">
                                ( &nbsp; {report.disetujui_oleh || '____________________'} &nbsp; )
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-black">Diketahui Oleh,</div>
                            <div className="font-semibold text-gray-700 mb-14">Superintendant</div>
                            <div className="font-bold text-black inline-block px-4">
                                ( &nbsp; {report.diketahui_oleh || '____________________'} &nbsp; )
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 6mm 8mm;
                    }
                    .ccr-paper-landscape {
                        box-shadow: none !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
