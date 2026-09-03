import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Print({ abr }) {
    
    useEffect(() => {
        // Optional: Automatically trigger print dialogue when page loads
        // window.print();
    }, []);

    const formatRp = (value) => new Intl.NumberFormat('id-ID').format(value || 0);
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '-';

    const getItems = (category) => abr.items.filter(i => i.category === category);

    const repairItems = getItems('repair');
    const manpowerItems = getItems('manpower');
    const sparepartItems = getItems('sparepart');
    const evakuasiItems = getItems('evakuasi');
    const disassemblyItems = getItems('disassembly');

    const getTotal = (items) => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const printAreaRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const h2cModule = await import('html2canvas');
            const html2canvas = h2cModule.default || h2cModule;
            
            const jspdfModule = await import('jspdf');
            const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
            
            const element = printAreaRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`ABR_${abr.no_abr ? abr.no_abr.replace(/\//g, '_') : 'document'}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Terjadi kesalahan saat memproses PDF: " + (error.message || "Unknown error"));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0 print:m-0">
            <Head title={`Print ABR - ${abr.no_abr}`} />
            <style>
                {`
                    @media print {
                        @page {
                            margin: 0;
                        }
                        body {
                            margin: 1cm;
                        }
                    }
                    .pdf-bg-white { background-color: #ffffff !important; }
                    .pdf-text-black { color: #000000 !important; }
                    .pdf-border-gray-800 { border-color: #1f2937 !important; }
                    .pdf-text-gray-900 { color: #111827 !important; }
                    .pdf-text-gray-800 { color: #1f2937 !important; }
                    .pdf-text-gray-700 { color: #374151 !important; }
                    .pdf-text-gray-600 { color: #4b5563 !important; }
                    .pdf-border-gray-200 { border-color: #e5e7eb !important; }
                    .pdf-border-gray-300 { border-color: #d1d5db !important; }
                    .pdf-border-gray-400 { border-color: #9ca3af !important; }
                    .pdf-bg-gray-50 { background-color: #f9fafb !important; }
                    .pdf-bg-gray-100 { background-color: #f3f4f6 !important; }
                    .pdf-border-black { border-color: #000000 !important; }
                    .pdf-bg-blue-50 { background-color: rgba(239, 246, 255, 0.5) !important; }
                    .pdf-border-blue-100 { border-color: #dbeafe !important; }
                    .pdf-border-blue-200 { border-color: #bfdbfe !important; }
                    .pdf-text-blue-900 { color: #1e3a8a !important; }

                `}
            </style>
            
            {/* Action Bar (hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden">
                <Link href={route('abr.index')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
                    Kembali
                </Link>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} disabled={isDownloading} className={`font-bold py-2 px-4 rounded shadow flex items-center gap-2 text-white ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                        {isDownloading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v6h2.586a1 1 0 01.707 1.707l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 015.586 9H8V3a1 1 0 011-1z"/><path d="M4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"/></svg>
                        )}
                        {isDownloading ? 'Memproses PDF...' : 'Download PDF'}
                    </button>
                    <button onClick={() => window.print()} disabled={isDownloading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 disabled:bg-emerald-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                        Print
                    </button>
                </div>
            </div>

            {/* A4 Document Area */}
            <div ref={printAreaRef} className="pdf-bg-white mx-auto pdf-text-black p-8 shadow-lg print:shadow-none" style={{ width: '210mm', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header */}
                <div className="flex items-center mb-8 border-b-2 pdf-border-gray-800 pb-6">
                    <div className="w-1/4">
                        <img src="/images/logo.png" alt="Logo PT MAM" className="h-10 object-contain" />
                    </div>
                    <div className="w-1/2 text-center">
                        <h1 className="text-xl font-extrabold uppercase tracking-widest pdf-text-gray-900">PT. Mitra Abadi Mahakam</h1>
                        <h2 className="text-sm font-semibold uppercase mt-1 pdf-text-gray-600 tracking-wider">Analisa Biaya Repair (ABR)</h2>
                    </div>
                    <div className="w-1/4"></div>
                </div>

                {/* Doc Info Cards */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="border pdf-border-gray-300 rounded-xl p-4 pdf-bg-gray-50 shadow-sm print:border-gray-400 print:bg-transparent print:shadow-none">
                        <h3 className="font-bold pdf-text-gray-700 mb-2 border-b pdf-border-gray-200 pb-1 uppercase text-[10px] tracking-wider">Informasi Dokumen</h3>
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-24 py-0.5 pdf-text-gray-600">No. ABR</td><td className="w-4 py-0.5 pdf-text-gray-600">:</td><td className="font-bold pdf-text-gray-900 py-0.5">{abr.no_abr}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Tanggal</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{formatDate(abr.tanggal)}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Code Unit</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-bold pdf-text-gray-900 py-0.5">{abr.unit?.code_unit || abr.manual_unit_code}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="border pdf-border-gray-300 rounded-xl p-4 pdf-bg-gray-50 shadow-sm print:border-gray-400 print:bg-transparent print:shadow-none">
                        <h3 className="font-bold pdf-text-gray-700 mb-2 border-b pdf-border-gray-200 pb-1 uppercase text-[10px] tracking-wider">Spesifikasi Unit</h3>
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-24 py-0.5 pdf-text-gray-600">Unit Type</td><td className="w-4 py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.unit?.model || abr.manual_unit_model || '-'}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Serial No.</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.unit?.sn_chassis || abr.manual_sn_chassis || '-'}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Model Engine</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.unit?.engine_model || abr.manual_engine_model || '-'}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Engine No.</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.unit?.sn_engine || abr.manual_sn_engine || '-'}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border pdf-border-gray-300 rounded-xl p-4 pdf-bg-gray-50 shadow-sm print:border-gray-400 print:bg-transparent print:shadow-none">
                        <h3 className="font-bold pdf-text-gray-700 mb-2 border-b pdf-border-gray-200 pb-1 uppercase text-[10px] tracking-wider">Lokasi & Inspeksi</h3>
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-24 py-0.5 pdf-text-gray-600">Lokasi / Site</td><td className="w-4 py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.lokasi_site}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Lokasi Repair</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.lokasi_perbaikan}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">HM</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.hm}</td></tr>
                                <tr><td className="py-0.5 pdf-text-gray-600">Inspected By</td><td className="py-0.5 pdf-text-gray-600">:</td><td className="font-semibold pdf-text-gray-800 py-0.5">{abr.inspected_by}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-6 pdf-bg-blue-50 border pdf-border-blue-100 rounded-lg p-4 print:border-gray-400 print:bg-transparent">
                    <h3 className="font-bold pdf-text-blue-900 mb-1 uppercase text-[10px] tracking-wider print:text-black border-b pdf-border-blue-200 pb-1 print:border-gray-400">Incident Description</h3>
                    <p className="pdf-text-gray-800 leading-relaxed print:text-black mt-2">{abr.incident_description}</p>
                </div>

                {/* 1. List Cost Repair */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">1. List Cost Repair (Property Damage)</h3>
                    <table className="w-full border-collapse border pdf-border-black text-[11px]">
                        <thead>
                            <tr className="pdf-bg-gray-100">
                                <th className="border pdf-border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Part Number</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Description</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.part_number}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.description}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.qty}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.satuan}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="border pdf-border-black py-1 px-2 text-right font-bold">Total (1) :</td>
                                <td className="border pdf-border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(repairItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 2. Manpower Cost */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">2. Manpower Cost</h3>
                    <table className="w-full border-collapse border pdf-border-black text-[11px]">
                        <thead>
                            <tr className="pdf-bg-gray-100">
                                <th className="border pdf-border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Description</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manpowerItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.description}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border pdf-border-black py-1 px-2 text-right font-bold">Total (2) :</td>
                                <td className="border pdf-border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(manpowerItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 3. List Cost Spare Part */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">3. List Cost Spare Part</h3>
                    <table className="w-full border-collapse border pdf-border-black text-[11px]">
                        <thead>
                            <tr className="pdf-bg-gray-100">
                                <th className="border pdf-border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Part Number</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Description</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">MR</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sparepartItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.part_number}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.description}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.qty}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.satuan}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="border pdf-border-black py-1 px-2 text-right font-bold">Total (3) :</td>
                                <td className="border pdf-border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(sparepartItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 4. List Biaya Evakuasi Unit */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">4. List Biaya Evakuasi Unit</h3>
                    <table className="w-full border-collapse border pdf-border-black text-[11px]">
                        <thead>
                            <tr className="pdf-bg-gray-100">
                                <th className="border pdf-border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Description</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evakuasiItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.description}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border pdf-border-black py-1 px-2 text-right font-bold">Total (4) :</td>
                                <td className="border pdf-border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(evakuasiItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 5. List Cost Disassembly */}
                <div className="mb-6">
                    <h3 className="font-bold mb-1">5. List Cost Disassembly, Assembly & Akomodasi</h3>
                    <table className="w-full border-collapse border pdf-border-black text-[11px]">
                        <thead>
                            <tr className="pdf-bg-gray-100">
                                <th className="border pdf-border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Description</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border pdf-border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border pdf-border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disassemblyItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border pdf-border-black py-1 px-2">{item.description}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border pdf-border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border pdf-border-black py-1 px-2 text-right font-bold">Total (5) :</td>
                                <td className="border pdf-border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(disassemblyItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Grand Total */}
                <table className="w-full border-collapse border pdf-border-black text-xs font-bold mb-8">
                    <tbody>
                        <tr>
                            <td className="border pdf-border-black py-2 px-4 text-center">TOTAL BIAYA (1+2+3+4+5)</td>
                            <td className="border pdf-border-black py-2 px-4 text-center">- PPN (11%) -</td>
                            <td className="border pdf-border-black py-2 px-4 text-center pdf-bg-gray-100">GRAND TOTAL (TERMASUK PAJAK)</td>
                        </tr>
                        <tr>
                            <td className="border pdf-border-black py-2 px-4 text-center">{formatRp(abr.total_biaya)}</td>
                            <td className="border pdf-border-black py-2 px-4 text-center">{formatRp(abr.tax_amount)}</td>
                            <td className="border pdf-border-black py-2 px-4 text-center pdf-bg-gray-100">{formatRp(abr.grand_total)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="flex justify-between items-end mt-12 text-center">
                    <div>
                        <p className="mb-16">Dibuat Oleh,</p>
                        <p className="font-bold underline">{abr.dibuat_oleh || 'Yansen'}</p>
                        <p>{abr.dibuat_jabatan || 'Planner'}</p>
                    </div>
                    <div>
                        <p className="mb-16">Checked by,</p>
                        <p className="font-bold underline">{abr.checked_by || 'Mukti Alie'}</p>
                        <p>{abr.checked_jabatan || 'Sr. Planner'}</p>
                    </div>
                    <div>
                        <p className="mb-16">Disetujui Oleh,</p>
                        <p className="font-bold underline">{abr.disetujui_oleh || 'Ambo Mai'}</p>
                        <p>{abr.disetujui_jabatan || 'Plant Suptend'}</p>
                    </div>
                    <div>
                        <p className="mb-16">Diketahui Oleh,</p>
                        <p className="font-bold underline">{abr.diketahui_oleh || 'Supardi Halim'}</p>
                        <p>{abr.diketahui_jabatan || 'Project Manager'}</p>
                    </div>
                </div>

                {/* Uploaded Images Section */}
                {abr.images && abr.images.length > 0 && (
                    <div className="mt-8 pt-6 border-t-2 border-dashed pdf-border-gray-300 print:break-inside-avoid">
                        <h3 className="font-bold mb-6 text-lg text-center uppercase">Lampiran Dokumentasi</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {abr.images.map((img, idx) => (
                                <div key={idx} className="border pdf-border-gray-400 p-2 rounded flex flex-col items-center justify-center pdf-bg-gray-50 h-80">
                                    <img src={img.file_path} alt={`Lampiran ${idx + 1}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
