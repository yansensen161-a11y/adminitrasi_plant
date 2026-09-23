import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({
    form = null,
    isBlank = false,
    defaultItems = [],
    preselectedUnit = null,
}) {
    useEffect(() => {
        // Option to trigger print dialog after loading if query param ?autoprint=1
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('autoprint') === '1') {
                setTimeout(() => window.print(), 300);
            }
        }
    }, []);

    const rawItems = isBlank ? defaultItems : form?.items || [];

    // Slice exactly to match original 3-page layout:
    // Page 1: Items 1 to 28 (IDs 1-28: Engine 1-24 + Diff & Final Drive 25-28)
    // Page 2: Items 29 to 64 (IDs 29-64: Diff continued 29-30, Axle 31-38, Trans 39-46, Brake/Hyd 47-58, Steer 59-64)
    // Page 3: Items 65 to 84 (IDs 65-84: Greasing 65-76, Safety/Battery 77-84) + Notes + Signatures
    const page1Items = rawItems.filter((i) => i.id >= 1 && i.id <= 28);
    const page2Items = rawItems.filter((i) => i.id >= 29 && i.id <= 64);
    const page3Items = rawItems.filter((i) => i.id >= 65 && i.id <= 84);

    const activeType = isBlank ? null : form?.service_type;

    // Helper to render dots/bullet in Service Type column
    const renderTypeDots = (types = []) => {
        return (
            <div className="grid grid-cols-5 text-center h-full text-[10px] leading-none items-center font-sans">
                {['A', 'B', 'C', 'D', 'E'].map((t) => {
                    const has = types.includes(t);
                    return (
                        <div
                            key={t}
                            className={`h-full flex items-center justify-center border-r border-black last:border-r-0 ${
                                has ? 'font-black text-black' : 'text-transparent'
                            }`}
                            style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}
                        >
                            {has ? '✓' : ''}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper to render special remark content
    const renderSpecialRemarks = (item) => {
        const st = item.special_type;
        const val = isBlank ? '' : item.special_value || '';
        const lh = isBlank ? '' : item.special_rating_lh || '';
        const rh = isBlank ? '' : item.special_rating_rh || '';

        if (st === 'logged_event') {
            return (
                <div className="flex items-center text-[9px] font-bold">
                    <span className="shrink-0 mr-1">Logged event :</span>
                    <span className="font-mono">{val}</span>
                </div>
            );
        }

        if (st === 'result_rpm') {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{val || '________'}</span>
                    <span>RPM</span>
                </div>
            );
        }

        if (st === 'rating_rr') {
            return (
                <div className="text-[9px]">
                    <div className="flex items-center justify-between font-bold">
                        <span>Rating Result :</span>
                        <span className="font-mono underline px-1">{val || '____'}</span>
                        <span>RR</span>
                    </div>
                    <div className="text-[8px] font-bold uppercase mt-0.5">
                        DIFFERENTIAL CAPACITIES 120 L
                    </div>
                </div>
            );
        }

        if (st === 'rating_frlh_rrrh') {
            return (
                <div className="text-[8.5px] font-bold">
                    <div className="flex items-center justify-between">
                        <span>Rating Result :</span>
                        <span>RRLH: <span className="font-mono underline">{lh || '____'}</span></span>
                        <span>RRRH: <span className="font-mono underline">{rh || '____'}</span></span>
                    </div>
                </div>
            );
        }

        if (st === 'rating_frlh') {
            return (
                <div className="text-[8.5px] font-bold">
                    <div className="flex items-center justify-between">
                        <span>Rating Result :</span>
                        <span>FRLH: <span className="font-mono underline">{lh || '____'}</span></span>
                        <span>FRRH: <span className="font-mono underline">{rh || '____'}</span></span>
                    </div>
                    <div className="text-[8px] uppercase mt-0.5">
                        WHEEL FRONT CAPACITIES 6.8 L
                    </div>
                </div>
            );
        }

        if (st === 'capacity_trans') {
            return (
                <div className="text-[8.5px] font-bold uppercase">
                    Transmission & TC 106 L
                </div>
            );
        }

        if (st === 'capacity_hydraulic') {
            return (
                <div className="text-[8.5px] font-bold uppercase">
                    HYDRAULIC AND BRAKE CAPACITIES 121 L
                </div>
            );
        }

        if (st === 'result_brake_rpm') {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{val || '________'}</span>
                    <span>RPM</span>
                </div>
            );
        }

        if (st === 'result_steer_sec' || st === 'result_hoist_sec') {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{val || '________'}</span>
                    <span>SEC</span>
                </div>
            );
        }

        if (st && st.startsWith('rating_')) {
            return (
                <div className="flex items-center text-[9px] font-bold">
                    <span className="shrink-0 mr-1">Rating Result :</span>
                    <span className="font-mono underline px-1">{val || '____________'}</span>
                </div>
            );
        }

        return <span className="text-[9px]">{item.remarks || ''}</span>;
    };

    const renderTableHeaders = () => (
        <thead>
            <tr className="bg-[#bfbfbf] text-black border-b border-black text-[9px] font-bold" style={{ backgroundColor: '#bfbfbf' }}>
                <th className="border-r border-black p-0.5 w-[75px] text-center" colSpan={5}>
                    <div>Tipe Servis</div>
                    <div className="text-[8px] font-normal italic">Service Type</div>
                </th>
                <th className="border-r border-black px-2 py-1 text-left">
                    <div>Deskripsi Item Pekerjaan</div>
                    <div className="text-[8px] font-normal italic">Inspection Description</div>
                </th>
                <th className="border-r border-black px-1 py-1 w-[45px] text-center">
                    <div>Check Point</div>
                </th>
                <th className="border-r border-black px-2 py-1 w-[180px] text-center">
                    <div>Remarks</div>
                </th>
                <th className="px-1 py-1 w-[65px] text-center">
                    <div>SN Inspect</div>
                </th>
            </tr>
            <tr className="bg-[#bfbfbf] text-black border-b border-black text-[9px] font-bold text-center" style={{ backgroundColor: '#bfbfbf' }}>
                <th className="border-r border-black w-[15px] p-0">A</th>
                <th className="border-r border-black w-[15px] p-0">B</th>
                <th className="border-r border-black w-[15px] p-0">C</th>
                <th className="border-r border-black w-[15px] p-0">D</th>
                <th className="border-r border-black w-[15px] p-0">E</th>
                <th className="border-r border-black" colSpan={4}></th>
            </tr>
        </thead>
    );

    return (
        <div className="bg-slate-200 min-h-screen py-6 print:py-0 print:bg-white text-black font-sans antialiased">
            <Head title={isBlank ? 'Print Blank Form PM 773E' : `Print Form PM ${form?.form_number || ''}`} />
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body, table, td, th, div, span, p {
                        font-family: 'DejaVu Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    }
                }
            `}} />

            {/* Floating Top Control Bar (Screen only, hidden on print) */}
            <div className="no-print max-w-[210mm] mx-auto mb-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        ← Kembali
                    </button>
                    <div>
                        <div className="font-bold text-sm text-gray-900">
                            {isBlank ? 'Preview Cetak: Form Kosong' : `Preview Cetak: ${form?.form_number}`}
                        </div>
                        <div className="text-xs text-gray-500">
                            Format cetak 1:1 sesuai lembar resmi PM SERVICE SHEET OFF HIGHWAY TRUCK 773E
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Cetak Sekarang (Print / PDF)</span>
                    </button>
                </div>
            </div>

            {/* ─── PRINT CONTAINER ─── */}
            <div className="print-root max-w-[210mm] mx-auto space-y-6 print:space-y-0">
                {/* ════════════════════════════════════════════════════════════════
                     PAGE 1 OF 3
                    ════════════════════════════════════════════════════════════════ */}
                <div className="a4-sheet bg-white p-[8mm] shadow-xl print:shadow-none print:p-0 page-break">
                    {/* Header: Logo & Title */}
                    <div className="relative mb-3 flex items-start justify-between">
                        <div className="w-24 shrink-0">
                            <img
                                src="/images/logo.png"
                                alt="MAM Logo"
                                className="h-10 w-auto object-contain"
                                onError={(e) => (e.target.style.display = 'none')}
                            />
                        </div>

                        <div className="flex-1 text-center pr-12">
                            <h1 className="text-base font-black tracking-wider uppercase leading-tight">
                                PM SERVICE SHEET
                            </h1>
                            <h2 className="text-lg font-black tracking-wide uppercase leading-tight">
                                OFF HIGHWAY TRUCK 773E
                            </h2>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-12 gap-x-2 gap-y-1 text-[11px] font-bold mb-3 border-b-2 border-black pb-2">
                        <div className="col-span-6 flex items-baseline">
                            <span className="w-24 shrink-0">PROJECT ID</span>
                            <span className="mr-2">:</span>
                            <span className="border-b border-black flex-1 min-h-[16px] px-1 font-mono">
                                {isBlank ? '' : form?.project_id || ''}
                            </span>
                        </div>
                        <div className="col-span-3 flex items-baseline">
                            <span className="w-12 shrink-0">DATE</span>
                            <span className="mr-2">:</span>
                            <span className="border-b border-black flex-1 min-h-[16px] px-1 font-mono">
                                {isBlank ? '' : form?.date ? new Date(form.date).toLocaleDateString('id-ID') : ''}
                            </span>
                        </div>
                        <div className="col-span-3 flex items-baseline justify-end">
                            <span className="mr-2">SHIFT :</span>
                            <span className="border-b border-black font-mono px-2">
                                {isBlank ? 'DS / NS' : form?.shift || 'DS'}
                            </span>
                            <span className="text-[9px] ml-1 font-normal italic">
                                {isBlank ? '(Siang/Malam)' : form?.shift === 'DS' ? '(Siang)' : '(Malam)'}
                            </span>
                        </div>

                        <div className="col-span-6 flex items-baseline">
                            <span className="w-24 shrink-0">UNIT ID</span>
                            <span className="mr-2">:</span>
                            <span className="border-b border-black flex-1 min-h-[16px] px-1 font-mono font-black text-xs">
                                {isBlank ? (preselectedUnit?.code_unit || '') : (form?.unit?.code_unit || '')}
                            </span>
                        </div>
                        <div className="col-span-6 flex items-baseline">
                            <span className="w-12 shrink-0">S.M.U</span>
                            <span className="mr-2">:</span>
                            <span className="border-b border-black flex-1 min-h-[16px] px-1 font-mono">
                                {isBlank ? '' : form?.smu ? `${Number(form.smu).toLocaleString()}` : ''}
                            </span>
                            <span className="ml-2">HRS</span>
                        </div>
                    </div>

                    {/* Oil Samples & Caution Banner */}
                    <div className="grid grid-cols-2 gap-2 mb-2 text-[9.5px]">
                        {/* Box Left: Oil Samples */}
                        <div className="border border-black p-1.5">
                            <div className="font-bold border-b border-black pb-0.5 mb-1 bg-[#e0e0e0] px-1" style={{ backgroundColor: '#e0e0e0' }}>
                                Pengambilan Sampel Oli Terakhir / <span className="font-normal italic">Last Oil Sample Taken</span>
                            </div>
                            <div className="space-y-0.5 px-1 font-medium">
                                <div className="flex justify-between">
                                    <span>Engine</span>
                                    <span>: <span className="font-mono">{isBlank ? '________ / __________ / ___________' : form?.oil_samples?.engine || '________ / __________ / ___________'}</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Transmission</span>
                                    <span>: <span className="font-mono">{isBlank ? '________ / __________ / ___________' : form?.oil_samples?.transmission || '________ / __________ / ___________'}</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Differential & Final Drive</span>
                                    <span>: <span className="font-mono">{isBlank ? '________ / __________ / ___________' : form?.oil_samples?.differential_final_drive || '________ / __________ / ___________'}</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hydraulic</span>
                                    <span>: <span className="font-mono">{isBlank ? '________ / __________ / ___________' : form?.oil_samples?.hydraulic || '________ / __________ / ___________'}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Box Right: Caution */}
                        <div className="border border-black p-1.5 bg-[#f2f2f2]" style={{ backgroundColor: '#f2f2f2' }}>
                            <div className="font-bold border-b border-black pb-0.5 mb-1 bg-[#e0e0e0] px-1" style={{ backgroundColor: '#e0e0e0' }}>
                                Perhatian / <span className="font-normal italic">Caution</span>
                            </div>
                            <div className="space-y-1 text-[8.5px] px-1">
                                <div className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">☑</span>
                                    <div>
                                        <div className="font-bold">Cuci unit yang bersih sebelum pelaksanaan inspeksi</div>
                                        <div className="italic text-gray-700">Clean up the unit before inspection</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">☑</span>
                                    <div>
                                        <div className="font-bold">Parkirkan unit pada tempat rata dengan aman</div>
                                        <div className="italic text-gray-700">Park the unit on flat area safely</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">☑</span>
                                    <div>
                                        <div className="font-bold">Yakinkan anda sudah memasang Danger atau Service Tag pada unit</div>
                                        <div className="italic text-gray-700">Make sure you already use Danger or Service Tag on the unit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PM Service Types Guide */}
                    <div className="border border-black mb-2 text-[9px] bg-[#e8e8e8]" style={{ backgroundColor: '#e8e8e8' }}>
                        <div className="font-bold px-2 py-0.5 border-b border-black">
                            Tipe PM Service / <span className="font-normal italic">PM Services Types</span>
                        </div>
                        <div className="grid grid-cols-5 text-center font-bold py-1 text-[8.5px] divide-x divide-black">
                            <div className={activeType === 'A' ? 'bg-yellow-200' : ''}>A : PM 250 / PS 1</div>
                            <div className={activeType === 'B' ? 'bg-yellow-200' : ''}>B : PM 500 / PS 2</div>
                            <div className={activeType === 'C' ? 'bg-yellow-200' : ''}>C : PM 1000 / PS 3</div>
                            <div className={activeType === 'D' ? 'bg-yellow-200' : ''}>D : PM 2000 / PS 4</div>
                            <div className={activeType === 'E' ? 'bg-yellow-200' : ''}>E : PM 4000 / PS 5</div>
                        </div>
                    </div>

                    {/* Table Page 1 (Items 1 to 28) */}
                    <table className="w-full border-collapse border border-black text-[9px]">
                        {renderTableHeaders()}
                        <tbody>
                            {page1Items.map((item) => (
                                <tr key={item.id} className="border-b border-black">
                                    <td className="border-r border-black p-0 h-[21px]" colSpan={5}>
                                        {renderTypeDots(item.types)}
                                    </td>
                                    <td className="border-r border-black px-1.5 py-0.5 leading-tight">
                                        <div className="font-bold text-[9px]">{item.desc_id}</div>
                                        <div className="italic text-[8px] text-gray-800">{item.desc_en}</div>
                                    </td>
                                    <td className="border-r border-black text-center font-black text-[11px] p-0.5" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                        {isBlank ? '' : item.check_point || ''}
                                    </td>
                                    <td className="border-r border-black px-1 py-0.5">
                                        {renderSpecialRemarks(item)}
                                    </td>
                                    <td className="text-center font-mono text-[8.5px] p-0.5">
                                        {isBlank ? '' : item.sn_inspect || ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center text-[8px] text-gray-500 mt-2 font-mono">
                        <span>PM SERVICE SHEET OFF HIGHWAY TRUCK 773E</span>
                        <span>Page 1 of 3</span>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                     PAGE 2 OF 3
                    ════════════════════════════════════════════════════════════════ */}
                <div className="a4-sheet bg-white p-[8mm] shadow-xl print:shadow-none print:p-0 page-break">
                    {/* Page 2 Minimal Header */}
                    <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
                        <div className="font-bold text-[10px] uppercase">
                            PM SERVICE SHEET OFF HIGHWAY TRUCK 773E
                        </div>
                        <div className="text-[10px] font-mono">
                            UNIT : <strong className="font-black text-xs">{isBlank ? (preselectedUnit?.code_unit || '_______') : form?.unit?.code_unit || '_______'}</strong> | SHIFT : <strong>{isBlank ? 'DS / NS' : form?.shift}</strong>
                        </div>
                    </div>

                    {/* Table Page 2 (Items 29 to 64) */}
                    <table className="w-full border-collapse border border-black text-[9px]">
                        {renderTableHeaders()}
                        <tbody>
                            {page2Items.map((item) => (
                                <tr key={item.id} className="border-b border-black">
                                    <td className="border-r border-black p-0 h-[21px]" colSpan={5}>
                                        {renderTypeDots(item.types)}
                                    </td>
                                    <td className="border-r border-black px-1.5 py-0.5 leading-tight">
                                        <div className="font-bold text-[9px]">{item.desc_id}</div>
                                        <div className="italic text-[8px] text-gray-800">{item.desc_en}</div>
                                    </td>
                                    <td className="border-r border-black text-center font-black text-[11px] p-0.5" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                        {isBlank ? '' : item.check_point || ''}
                                    </td>
                                    <td className="border-r border-black px-1 py-0.5">
                                        {renderSpecialRemarks(item)}
                                    </td>
                                    <td className="text-center font-mono text-[8.5px] p-0.5">
                                        {isBlank ? '' : item.sn_inspect || ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center text-[8px] text-gray-500 mt-2 font-mono">
                        <span>PM SERVICE SHEET OFF HIGHWAY TRUCK 773E</span>
                        <span>Page 2 of 3</span>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                     PAGE 3 OF 3
                    ════════════════════════════════════════════════════════════════ */}
                <div className="a4-sheet bg-white p-[8mm] shadow-xl print:shadow-none print:p-0 page-break">
                    {/* Page 3 Minimal Header */}
                    <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
                        <div className="font-bold text-[10px] uppercase">
                            PM SERVICE SHEET OFF HIGHWAY TRUCK 773E
                        </div>
                        <div className="text-[10px] font-mono">
                            UNIT : <strong className="font-black text-xs">{isBlank ? (preselectedUnit?.code_unit || '_______') : form?.unit?.code_unit || '_______'}</strong> | SHIFT : <strong>{isBlank ? 'DS / NS' : form?.shift}</strong>
                        </div>
                    </div>

                    {/* Table Page 3 (Items 65 to 84: Greasing & Safety) */}
                    <table className="w-full border-collapse border border-black text-[9px] mb-3">
                        {renderTableHeaders()}
                        <tbody>
                            {page3Items.map((item) => (
                                <tr key={item.id} className="border-b border-black">
                                    <td className="border-r border-black p-0 h-[21px]" colSpan={5}>
                                        {renderTypeDots(item.types)}
                                    </td>
                                    <td className="border-r border-black px-1.5 py-0.5 leading-tight">
                                        <div className="font-bold text-[9px]">{item.desc_id}</div>
                                        <div className="italic text-[8px] text-gray-800">{item.desc_en}</div>
                                    </td>
                                    <td className="border-r border-black text-center font-black text-[11px] p-0.5" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                        {isBlank ? '' : item.check_point || ''}
                                    </td>
                                    <td className="border-r border-black px-1 py-0.5">
                                        {renderSpecialRemarks(item)}
                                    </td>
                                    <td className="text-center font-mono text-[8.5px] p-0.5">
                                        {isBlank ? '' : item.sn_inspect || ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* NOTE Section */}
                    <div className="border border-black p-2 mb-4 text-[10px]">
                        <div className="font-bold mb-1">NOTE :</div>
                        {isBlank ? (
                            <div className="space-y-3 pt-2">
                                <div className="border-b border-gray-400 h-2"></div>
                                <div className="border-b border-gray-400 h-2"></div>
                                <div className="border-b border-gray-400 h-2"></div>
                                <div className="border-b border-gray-400 h-2"></div>
                            </div>
                        ) : (
                            <div className="font-mono text-[9.5px] whitespace-pre-line min-h-[50px] leading-relaxed">
                                {form?.notes || '-'}
                            </div>
                        )}
                    </div>

                    {/* Signature Block */}
                    <div className="grid grid-cols-2 gap-8 pt-2 text-[10.5px]">
                        {/* Mechanic */}
                        <div className="border border-black p-3">
                            <div className="font-medium">Inspected By,</div>
                            <div className="h-16 flex items-end">
                                <div className="w-full border-b border-black pb-1">
                                    <span className="font-bold">
                                        {isBlank ? '' : form?.mechanic_name || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-gray-800 mt-1">
                                Mechanic/ Serviceman
                            </div>
                        </div>

                        {/* Supervisor */}
                        <div className="border border-black p-3">
                            <div className="font-medium">Acknowledged by,</div>
                            <div className="h-16 flex items-end">
                                <div className="w-full border-b border-black pb-1">
                                    <span className="font-bold">
                                        {isBlank ? '' : form?.supervisor_name || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-gray-800 mt-1">
                                Maintenance Supervisor
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] text-gray-500 mt-4 font-mono">
                        <span>PM SERVICE SHEET OFF HIGHWAY TRUCK 773E</span>
                        <span>Page 3 of 3</span>
                    </div>
                </div>
            </div>

            {/* Print-specific CSS */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 6mm 6mm 6mm 6mm;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                        height: 100%;
                    }
                    .a4-sheet {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
