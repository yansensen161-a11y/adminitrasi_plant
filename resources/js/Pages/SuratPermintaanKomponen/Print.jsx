import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({
    form = null,
    isBlank = false,
    defaultItems = [],
    preselectedUnit = null,
}) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('autoprint') === '1') {
                setTimeout(() => window.print(), 350);
            }
        }
    }, []);

    const rawItems = isBlank ? defaultItems : form?.items || defaultItems;
    const unit = form?.unit || preselectedUnit;
    const results = form?.results_data || {};

    return (
        <div className="bg-white text-black min-h-screen p-0 sm:p-6 print:p-0 font-sans">
            <Head title={`Surat Permintaan Komponen - ${form?.form_number || 'BLANK'}`} />

            {/* Print toolbar */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Surat Internal Memo (A4 Portrait)
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm flex items-center gap-1.5"
                    >
                        <span>🖨️</span> Cetak Surat / Print
                    </button>
                    <button
                        type="button"
                        onClick={() => window.close()}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-[210mm] mx-auto bg-white border border-black print:border-none p-8 sm:p-12 print:p-6 shadow-lg print:shadow-none text-[10pt] leading-relaxed">
                
                {/* Header Logo */}
                <div className="text-center mb-6">
                    <div className="text-lg font-black text-rose-700 tracking-wider">▲▲ PT MITRA ABADI MAHAKAM</div>
                </div>

                {/* Title */}
                <div className="text-center font-bold text-[11pt] tracking-wide mb-8 uppercase">
                    INTERNAL MEMORANDUM / SURAT PERMINTAAN KOMPONEN
                </div>

                {/* Meta details */}
                <table className="w-full border-collapse mb-6 text-[10pt]">
                    <tbody>
                        <tr>
                            <td className="w-28 py-0.5">Tanggal</td>
                            <td className="w-4 py-0.5">:</td>
                            <td className="py-0.5"><strong>{form?.date ? new Date(form.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '................................................'}</strong></td>
                        </tr>
                        <tr>
                            <td className="py-0.5">Perihal</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5"><strong>{results.perihal || 'Permohonan Permintaan Parts / Komponen'}</strong></td>
                        </tr>
                    </tbody>
                </table>

                {/* Recipient */}
                <div className="mb-6 text-[10pt] leading-relaxed">
                    <div>Kepada Yth,</div>
                    <div className="font-bold mt-1">
                        {results.recipient_name || 'Bpk. Slamet / Bpk. Subani'}
                    </div>
                    <div>
                        {results.recipient_company || 'PT MAM Site BBE'}
                    </div>
                </div>

                <div className="mb-4 text-[10pt]">
                    Dengan hormat,
                </div>

                {/* Intro Body */}
                <div className="text-justify mb-4 text-[10pt] leading-relaxed">
                    {results.opening_text || `Sehubungan dengan diperlukannya perbaikan unit di lokasi kerja Site ${results.site_pemohon || 'Harindo wahana'}, dengan ini kami mengajukan permohonan permintaan/transfer part bekas dari ${results.site_tujuan || 'Site BBE'} dengan rincian sebagai berikut:`}
                </div>

                {/* Component Table */}
                {rawItems.length === 1 ? (
                    <table className="w-full border-collapse border border-black my-5 text-[10pt]">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 w-48 bg-slate-50 border-r border-black font-medium">Nama Komponen</td>
                                <td className="p-2 font-bold uppercase">{!isBlank ? (rawItems[0].component_name || rawItems[0].description) : ''}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 bg-slate-50 border-r border-black font-medium">Part Number</td>
                                <td className="p-2 font-bold">{!isBlank ? rawItems[0].part_number : ''}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 bg-slate-50 border-r border-black font-medium">Unit Request</td>
                                <td className="p-2 font-bold">{!isBlank ? (rawItems[0].unit_request || (unit ? `${unit.model} – ${unit.code_unit}` : '')) : ''}</td>
                            </tr>
                            <tr>
                                <td className="p-2 bg-slate-50 border-r border-black font-medium">Unit Sumber</td>
                                <td className="p-2">{!isBlank ? rawItems[0].unit_source : ''}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full border-collapse border border-black my-5 text-[9.5pt]">
                        <thead>
                            <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                <th className="p-1.5 border-r border-black w-8">No</th>
                                <th className="p-1.5 border-r border-black text-left">Nama Komponen</th>
                                <th className="p-1.5 border-r border-black w-28">Part Number</th>
                                <th className="p-1.5 border-r border-black w-36">Unit Request</th>
                                <th className="p-1.5 border-r border-black w-28">Unit Sumber</th>
                                <th className="p-1.5 w-12">QTY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-black">
                                    <td className="p-1.5 border-r border-black text-center">{idx + 1}</td>
                                    <td className="p-1.5 border-r border-black font-bold uppercase">{!isBlank ? (item.component_name || item.description) : ''}</td>
                                    <td className="p-1.5 border-r border-black text-center">{!isBlank ? item.part_number : ''}</td>
                                    <td className="p-1.5 border-r border-black text-center">{!isBlank ? item.unit_request : ''}</td>
                                    <td className="p-1.5 border-r border-black text-center">{!isBlank ? item.unit_source : ''}</td>
                                    <td className="p-1.5 text-center">{!isBlank ? item.qty : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Reasoning Body */}
                <div className="text-justify mb-4 text-[10pt] leading-relaxed">
                    {results.purpose_reason || `Part bekas tersebut akan digunakan untuk mendukung operasional unit ${unit?.code_unit || 'ME056'} yang saat ini mengalami kerusakan pada ${results.kerusakan_komponen || 'Cyl Arm'}.`}
                </div>

                {/* Closing */}
                <div className="text-justify mb-6 text-[10pt] leading-relaxed">
                    Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
                </div>

                {/* Signatures Table (3 Rows) */}
                <table className="w-full border-collapse border border-black mt-8 text-[9pt]">
                    <tbody>
                        {/* Row 1: Site Pemohon */}
                        <tr className="border-b border-black">
                            <td className="w-1/3 p-2.5 text-center border-r border-black align-top">
                                <div>Dibuat Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_maker_name || 'Yansen'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_maker_role || 'Planner'}</div>
                            </td>
                            <td className="w-1/3 p-2.5 text-center border-r border-black align-top">
                                <div>Disetujui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_supt_mam_name || 'Ambo Mai'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_supt_mam_role || 'Superintendent Plant'}</div>
                            </td>
                            <td className="w-1/3 p-2.5 text-center align-top">
                                <div>Diketahui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_pm_name || 'Supardi Halim'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_pm_role || 'Project Manager'}</div>
                            </td>
                        </tr>

                        {/* Row 2: Site Sumber */}
                        <tr className="border-b border-black">
                            <td colSpan="2" className="p-2.5 text-center border-r border-black align-top">
                                <div>Disetujui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_supt_source_name || 'Slamet Nur arif'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_supt_source_role || 'Superintendent Plant'}</div>
                            </td>
                            <td className="p-2.5 text-center align-top">
                                <div>Disetujui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_pjo_source_name || 'Subani'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_pjo_source_role || 'PJO'}</div>
                            </td>
                        </tr>

                        {/* Row 3: Management */}
                        <tr>
                            <td colSpan="2" className="p-2.5 text-center border-r border-black align-top">
                                <div>Disetujui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_mgr_plant_name || 'Dadang Prayogo'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_mgr_plant_role || 'Manager Plant & Asset'}</div>
                            </td>
                            <td className="p-2.5 text-center align-top">
                                <div>Disetujui Oleh</div>
                                <div className="h-16"></div>
                                <div className="font-bold underline">{results.sig_mgr_ops_name || 'Lili Romli'}</div>
                                <div className="text-[8pt] text-slate-700">{results.sig_mgr_ops_role || 'Operation Manager'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
}
