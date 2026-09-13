import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Print({ abr }) {
    useEffect(() => {
        // window.print();
    }, []);

    const formatRp = (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getItems = (category) => abr.items.filter(i => i.category === category);

    const repairItems = getItems('repair');
    const manpowerItems = getItems('manpower');
    const sparepartItems = getItems('sparepart');
    const evakuasiItems = getItems('evakuasi');
    const disassemblyItems = getItems('disassembly');

    const getTotal = (items) => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const padRows = (items, minRows) => {
        const padded = [...items];
        while (padded.length < minRows) {
            padded.push({ part_number: '', description: '', price: 0, qty: '', satuan: '', amount: 0 });
        }
        return padded;
    };

    const totalBiaya = getTotal(repairItems) + getTotal(manpowerItems) + getTotal(sparepartItems) + getTotal(evakuasiItems) + getTotal(disassemblyItems);
    const taxAmount = Math.round(totalBiaya * 0.11);
    const grandTotal = totalBiaya + taxAmount;

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
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`ABR_${abr.no_abr ? abr.no_abr.replace(/\//g, '_') : 'document'}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Terjadi kesalahan saat memproses PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const TableSection = ({ title, num, items, minRows, hasPartNumber = false, satuanLabel = 'Sat' }) => (
        <div className="mb-4">
            <div className="font-bold text-sm mb-1">{num}. {title}</div>
            <table className="abr-table">
                <thead>
                    <tr>
                        <th className="w-8">No</th>
                        {hasPartNumber && <th className="w-32">Part Number</th>}
                        <th>Description</th>
                        <th className="w-28">Price (Rp)</th>
                        <th className="w-12">Qty</th>
                        <th className="w-12">{satuanLabel}</th>
                        <th className="w-28">Amount (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    {padRows(items, minRows).map((item, idx) => (
                        <tr key={idx}>
                            <td className="text-center">{idx + 1}</td>
                            {hasPartNumber && <td className="text-center">{item.part_number || '-'}</td>}
                            <td>{item.description || '-'}</td>
                            <td className="text-right">{item.price ? formatRp(item.price) : '0'}</td>
                            <td className="text-center">{item.qty || '1'}</td>
                            <td className="text-center">{item.satuan || '-'}</td>
                            <td className="text-right">{item.amount ? formatRp(item.amount) : '0'}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={hasPartNumber ? 6 : 5} className="text-right font-bold pr-2">Total ({num}) : </td>
                        <td className="text-right font-bold">{formatRp(getTotal(items))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0 print:m-0 font-sans text-black">
            <Head title={`Print ABR - ${abr.no_abr}`} />
            <style>
                {`
                    @media print {
                        @page { margin: 10mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none !important; }
                    }
                    .abr-table { border-collapse: collapse; width: 100%; border: 1px solid #000; font-size: 10px; }
                    .abr-table th, .abr-table td { border: 1px solid #000; padding: 3px 6px; }
                    .abr-table th { font-weight: bold; text-align: center; background-color: #fff; }
                    .info-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 10px; }
                    .info-title { font-weight: bold; font-size: 10px; margin-bottom: 8px; color: #374151; }
                    .info-row { display: flex; margin-bottom: 4px; }
                    .info-label { width: 80px; color: #6b7280; }
                    .info-val { font-weight: bold; flex: 1; }
                `}
            </style>
            
            <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center no-print">
                <Link href={route('abr.index')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow">Kembali</Link>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} disabled={isDownloading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow">
                        {isDownloading ? 'Memproses...' : 'Download PDF'}
                    </button>
                    <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow">
                        Print
                    </button>
                </div>
            </div>

            <div ref={printAreaRef} className="bg-white mx-auto p-8 shadow-lg print:shadow-none" style={{ width: '210mm', minHeight: '297mm' }}>
                
                {/* Header */}
                <div className="flex items-center border-b-[2px] border-black pb-2 mb-6">
                    <img src="/images/logo.png" alt="Logo" className="h-10 mr-4" onError={(e) => e.target.style.display = 'none'} />
                    <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase">PT. MITRA ABADI MAHAKAM</h1>
                        <h2 className="text-sm font-semibold text-gray-700 tracking-wider">ANALISA BIAYA REPAIR (ABR)</h2>
                    </div>
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="info-box">
                        <div className="info-title">INFORMASI DOKUMEN</div>
                        <div className="info-row"><div className="info-label">NO WO</div><div>: <span className="info-val">{abr.no_abr}</span></div></div>
                        <div className="info-row"><div className="info-label">Tanggal</div><div>: <span className="info-val">{formatDate(abr.tanggal)}</span></div></div>
                        <div className="info-row"><div className="info-label">Code Unit</div><div>: <span className="info-val">{abr.unit?.code_unit || abr.manual_unit_code}</span></div></div>
                    </div>
                    <div className="info-box">
                        <div className="info-title">SPESIFIKASI UNIT</div>
                        <div className="info-row"><div className="info-label">Unit Type</div><div>: <span className="info-val">{abr.unit?.model || abr.manual_unit_model}</span></div></div>
                        <div className="info-row"><div className="info-label">Serial No.</div><div>: <span className="info-val">{abr.unit?.sn_chassis || abr.manual_sn_chassis}</span></div></div>
                        <div className="info-row"><div className="info-label">Model Engine</div><div>: <span className="info-val">{abr.unit?.engine_model || abr.manual_engine_model}</span></div></div>
                        <div className="info-row"><div className="info-label">Engine No.</div><div>: <span className="info-val">{abr.unit?.sn_engine || abr.manual_sn_engine}</span></div></div>
                    </div>
                    <div className="info-box">
                        <div className="info-title">LOKASI & INSPEKSI</div>
                        <div className="info-row"><div className="info-label">Lokasi / Site</div><div>: <span className="info-val">{abr.lokasi_site}</span></div></div>
                        <div className="info-row"><div className="info-label">Lokasi Repair</div><div>: <span className="info-val">{abr.lokasi_perbaikan}</span></div></div>
                        <div className="info-row"><div className="info-label">HM</div><div>: <span className="info-val">{abr.hm}</span></div></div>
                        <div className="info-row"><div className="info-label">Inspected By</div><div>: <span className="info-val">{abr.inspected_by}</span></div></div>
                    </div>
                </div>

                {/* Incident Description */}
                <div className="mb-6 rounded-lg overflow-hidden border border-blue-100 bg-blue-50/30">
                    <div className="bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 border-b border-blue-100">
                        INCIDENT DESCRIPTION
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-800 min-h-[40px]">
                        {abr.incident_description}
                    </div>
                </div>

                {/* Tables */}
                <TableSection title="List Cost Repair (Property Damage)" num="1" items={repairItems} minRows={1} hasPartNumber={true} />
                <TableSection title="Manpower Cost" num="2" items={manpowerItems} minRows={1} />
                <TableSection title="List Cost Spare Part" num="3" items={sparepartItems} minRows={3} hasPartNumber={true} satuanLabel="MR" />
                <TableSection title="List Biaya Evakuasi Unit" num="4" items={evakuasiItems} minRows={1} />
                <TableSection title="List Cost Disassembly, Assembly & Akomodasi" num="5" items={disassemblyItems} minRows={3} />

                {/* Grand Total */}
                <table className="abr-table mt-6">
                    <thead>
                        <tr>
                            <th className="py-2">TOTAL BIAYA (1+2+3+4+5)</th>
                            <th className="py-2">- PPN (11%) -</th>
                            <th className="py-2">GRAND TOTAL (TERMASUK PAJAK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center font-bold text-[12px] py-3">{formatRp(totalBiaya)}</td>
                            <td className="text-center font-bold text-[12px] py-3">{formatRp(taxAmount)}</td>
                            <td className="text-center font-bold text-[12px] py-3">{formatRp(grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 flex justify-between text-sm text-center px-4">
                    <div>
                        <div>Dibuat Oleh,</div>
                        <div className="mt-12 font-bold underline leading-tight">{abr.dibuat_oleh || 'Yansen'}</div>
                        <div>{abr.dibuat_jabatan || 'Planner'}</div>
                    </div>
                    <div>
                        <div>Checked by,</div>
                        <div className="mt-12 font-bold underline leading-tight">{abr.checked_by || 'Mukti Alie'}</div>
                        <div>{abr.checked_jabatan || 'Sr. Planner'}</div>
                    </div>
                    <div>
                        <div>Disetujui Oleh,</div>
                        <div className="mt-12 font-bold underline leading-tight">{abr.disetujui_oleh || 'Ambo Mai'}</div>
                        <div>{abr.disetujui_jabatan || 'Plant Suptend'}</div>
                    </div>
                    <div>
                        <div>Diketahui Oleh,</div>
                        <div className="mt-12 font-bold underline leading-tight">{abr.diketahui_oleh || 'Supardi Halim'}</div>
                        <div>{abr.diketahui_jabatan || 'Project Manager'}</div>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-8"></div>

                <div className="font-bold text-center text-[14px] mb-6">LAMPIRAN DOKUMENTASI</div>
                
                <div className="grid grid-cols-2 gap-4">
                    {abr.images && abr.images.map(img => (
                        <div key={img.id} className="border p-2 rounded">
                            <img src={img.file_path} alt="Lampiran" className="w-full h-auto object-cover rounded" />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
