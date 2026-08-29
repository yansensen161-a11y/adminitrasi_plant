import React, { useEffect } from 'react';
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

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0 print:m-0">
            <Head title={`Print ABR - ${abr.no_abr}`} />
            
            {/* Action Bar (hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden">
                <Link href={route('abr.index')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
                    Kembali
                </Link>
                <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                    Print
                </button>
            </div>

            {/* A4 Document Area */}
            <div className="bg-white mx-auto text-black p-8 shadow-lg print:shadow-none" style={{ width: '210mm', minHeight: '297mm', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header */}
                <div className="flex items-center mb-6">
                    <div className="w-1/4">
                        <div className="w-20 h-20 border border-gray-400 rounded flex items-center justify-center">
                            {/* Dummy Logo, replace with actual logo */}
                            <span className="text-xl font-bold text-gray-400">LOGO</span>
                        </div>
                    </div>
                    <div className="w-1/2 text-center">
                        <h1 className="text-xl font-bold uppercase tracking-wide">PT. MITRA ABADI MAHAKAM</h1>
                        <h2 className="text-lg font-bold uppercase mt-1">ANALISA BIAYA REPAIR (ABR)</h2>
                    </div>
                    <div className="w-1/4"></div>
                </div>

                {/* Doc Info */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-800">
                    <table className="w-full">
                        <tbody>
                            <tr><td className="w-24">No. ABR</td><td className="w-4">:</td><td className="font-bold">{abr.no_abr}</td></tr>
                            <tr><td>Tanggal</td><td>:</td><td>{formatDate(abr.tanggal)}</td></tr>
                            <tr><td>Code Unit</td><td>:</td><td className="font-bold">{abr.unit?.code_unit}</td></tr>
                        </tbody>
                    </table>
                    <table className="w-full">
                        <tbody>
                            <tr><td className="w-24">Unit Type</td><td className="w-4">:</td><td>{abr.unit?.equipment_type}</td></tr>
                            <tr><td>Serial Number</td><td>:</td><td>{abr.unit?.serial_number}</td></tr>
                            <tr><td>Model Engine</td><td>:</td><td>{abr.unit?.engine_model}</td></tr>
                            <tr><td>Engine Number</td><td>:</td><td>{abr.unit?.engine_number}</td></tr>
                        </tbody>
                    </table>
                    <table className="w-full">
                        <tbody>
                            <tr><td className="w-24">Lokasi / Site</td><td className="w-4">:</td><td>{abr.lokasi_site}</td></tr>
                            <tr><td>Lokasi Repair</td><td>:</td><td>{abr.lokasi_perbaikan}</td></tr>
                            <tr><td>HM</td><td>:</td><td>{abr.hm}</td></tr>
                            <tr><td>Inspected By</td><td>:</td><td>{abr.inspected_by}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-4">
                    <span className="font-bold">Incident Description : </span>
                    <span>{abr.incident_description}</span>
                </div>

                {/* 1. List Cost Repair */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">1. List Cost Repair (Property Damage)</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border border-black py-1 px-2 text-center">Part Number</th>
                                <th className="border border-black py-1 px-2 text-center">Description</th>
                                <th className="border border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border border-black py-1 px-2">{item.part_number}</td>
                                    <td className="border border-black py-1 px-2">{item.description}</td>
                                    <td className="border border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.qty}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.satuan}</td>
                                    <td className="border border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="border border-black py-1 px-2 text-right font-bold">Total (1) :</td>
                                <td className="border border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(repairItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 2. Manpower Cost */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">2. Manpower Cost</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border border-black py-1 px-2 text-center">Description</th>
                                <th className="border border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manpowerItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border border-black py-1 px-2">{item.description}</td>
                                    <td className="border border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border border-black py-1 px-2 text-right font-bold">Total (2) :</td>
                                <td className="border border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(manpowerItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 3. List Cost Spare Part */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">3. List Cost Spare Part</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border border-black py-1 px-2 text-center">Part Number</th>
                                <th className="border border-black py-1 px-2 text-center">Description</th>
                                <th className="border border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border border-black py-1 px-2 text-center w-12">MR</th>
                                <th className="border border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sparepartItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border border-black py-1 px-2">{item.part_number}</td>
                                    <td className="border border-black py-1 px-2">{item.description}</td>
                                    <td className="border border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.qty}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.satuan}</td>
                                    <td className="border border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="border border-black py-1 px-2 text-right font-bold">Total (3) :</td>
                                <td className="border border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(sparepartItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 4. List Biaya Evakuasi Unit */}
                <div className="mb-4">
                    <h3 className="font-bold mb-1">4. List Biaya Evakuasi Unit</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border border-black py-1 px-2 text-center">Description</th>
                                <th className="border border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evakuasiItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border border-black py-1 px-2">{item.description}</td>
                                    <td className="border border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border border-black py-1 px-2 text-right font-bold">Total (4) :</td>
                                <td className="border border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(evakuasiItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 5. List Cost Disassembly */}
                <div className="mb-6">
                    <h3 className="font-bold mb-1">5. List Cost Disassembly, Assembly & Akomodasi</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                <th className="border border-black py-1 px-2 text-center">Description</th>
                                <th className="border border-black py-1 px-2 text-center">Price (Rp)</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Qty</th>
                                <th className="border border-black py-1 px-2 text-center w-12">Sat</th>
                                <th className="border border-black py-1 px-2 text-center">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disassemblyItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                                    <td className="border border-black py-1 px-2">{item.description}</td>
                                    <td className="border border-black py-1 px-2 text-right">{formatRp(item.price)}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.hour}</td>
                                    <td className="border border-black py-1 px-2 text-center">{item.mp}</td>
                                    <td className="border border-black py-1 px-2 text-right font-medium">{formatRp(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="border border-black py-1 px-2 text-right font-bold">Total (5) :</td>
                                <td className="border border-black py-1 px-2 text-right font-bold">{formatRp(getTotal(disassemblyItems))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Grand Total */}
                <table className="w-full border-collapse border border-black text-xs font-bold mb-8">
                    <tbody>
                        <tr>
                            <td className="border border-black py-2 px-4 text-center">TOTAL BIAYA (1+2+3+4+5)</td>
                            <td className="border border-black py-2 px-4 text-center">- PPN (11%) -</td>
                            <td className="border border-black py-2 px-4 text-center bg-gray-100">GRAND TOTAL (TERMASUK PAJAK)</td>
                        </tr>
                        <tr>
                            <td className="border border-black py-2 px-4 text-center">{formatRp(abr.total_biaya)}</td>
                            <td className="border border-black py-2 px-4 text-center">{formatRp(abr.tax_amount)}</td>
                            <td className="border border-black py-2 px-4 text-center bg-gray-100">{formatRp(abr.grand_total)}</td>
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
            </div>
        </div>
    );
}
