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
                setTimeout(() => window.print(), 300);
            }
        }
    }, []);

    const rawItems = isBlank ? defaultItems : form?.items || defaultItems;
    const unit = form?.unit || preselectedUnit;
    const activeType = isBlank ? null : form?.service_type;

    // Split 77 items across 3 pages matching physical sheet
    const page1Items = rawItems.filter((i) => (i.id >= 1 && i.id <= 29));
    const page2Items = rawItems.filter((i) => (i.id >= 30 && i.id <= 61));
    const page3Items = rawItems.filter((i) => (i.id >= 62 && i.id <= 77));

    // Render dot for interval
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
    const renderRemarks = (item) => {
        const id = item.id;
        const res = item.results || {};
        const def = item.remarks || '';

        if (id === 1) {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{res.rpm || '________'}</span>
                    <span>RPM</span>
                </div>
            );
        }
        if (id === 5) {
            return <div className="text-[9px] font-black uppercase">ENGINE CAPACITIES 76 L</div>;
        }
        if (id === 24) {
            return (
                <div className="flex items-center text-[9px] font-bold">
                    <span className="mr-1">Rating Result :</span>
                    <span className="font-mono underline">{res.rating_result || '________'}</span>
                </div>
            );
        }
        if (id === 26) {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Rating Result :</span>
                    <span className="font-mono underline px-1">{res.rr || '____'}</span>
                    <span>RR</span>
                </div>
            );
        }
        if (id === 27) {
            return <div className="text-[9px] font-black uppercase">DIFFERENTIAL CAPACITIES 120 L</div>;
        }
        if (id === 29) {
            return (
                <div className="text-[8.5px] font-bold">
                    <div className="flex items-center justify-between">
                        <span>Rating Result :</span>
                        <span>RRLH: <span className="font-mono underline">{res.rrlh || '____'}</span></span>
                        <span>RRRH: <span className="font-mono underline">{res.rrrh || '____'}</span></span>
                    </div>
                </div>
            );
        }
        if (id === 32) {
            return (
                <div className="text-[8.5px] font-bold">
                    <div className="flex items-center justify-between">
                        <span>Rating Result :</span>
                        <span>FRLH: <span className="font-mono underline">{res.frlh || '____'}</span></span>
                        <span>FRRH: <span className="font-mono underline">{res.frrh || '____'}</span></span>
                    </div>
                </div>
            );
        }
        if ([36, 41, 47, 58].includes(id)) {
            return (
                <div className="flex items-center text-[9px] font-bold">
                    <span className="mr-1">Rating Result :</span>
                    <span className="font-mono underline">{res.rating_result || '________'}</span>
                </div>
            );
        }
        if (id === 38) {
            return <div className="text-[9px] font-black uppercase">Transmission &amp; TC 106 L</div>;
        }
        if (id === 42) {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{res.rpm || '________'}</span>
                    <span>RPM</span>
                </div>
            );
        }
        if (id === 43 || id === 45) {
            return (
                <div className="flex items-center justify-between text-[9px] font-bold">
                    <span>Result :</span>
                    <span className="font-mono underline px-1">{res.sec || '________'}</span>
                    <span>SEC</span>
                </div>
            );
        }
        if (id === 51) {
            return <div className="text-[9px] font-black uppercase">HYDRAULIC AND BRAKE CAPACITIES 121 L</div>;
        }
        if (id === 54) {
            return <div className="text-[9px] font-black uppercase">STEERING SYSTEM CAPACITIES 38 L</div>;
        }

        return <div className="text-[9px]">{def}</div>;
    };

    // Render Table Helper
    const renderTable = (itemsList) => {
        let currentSection = '';

        return (
            <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold text-[9px]">
                        <th colSpan="5" className="border-r border-black p-0.5 text-center w-24">
                            <div>Tipe Servis</div>
                            <div className="italic font-normal text-[8px]">Service Type</div>
                        </th>
                        <th className="border-r border-black p-1 text-left">
                            Deskripsi Pemeriksaan / Tasks
                        </th>
                        <th className="border-r border-black p-1 text-center w-20">
                            Check Point
                        </th>
                        <th className="border-r border-black p-1 text-left w-48">
                            Remarks
                        </th>
                        <th className="p-1 text-center w-16">
                            SN Inspector
                        </th>
                    </tr>
                    <tr className="border-b border-black text-[9px] font-bold text-center">
                        {['A', 'B', 'C', 'D', 'E'].map((t) => (
                            <th
                                key={t}
                                className={`border-r border-black w-4.5 p-0.5 ${
                                    activeType === t ? 'bg-amber-100 font-black' : ''
                                }`}
                            >
                                {t}
                            </th>
                        ))}
                        <th colSpan="4"></th>
                    </tr>
                </thead>
                <tbody>
                    {itemsList.map((item) => {
                        const showSec = item.section !== currentSection;
                        if (showSec) currentSection = item.section;

                        return (
                            <React.Fragment key={item.id}>
                                {showSec && (
                                    <tr className="bg-gray-200 border-t-2 border-b border-black font-black text-[9.5px]">
                                        <td colSpan="9" className="p-1 tracking-wide">
                                            {item.section}
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-b border-gray-400">
                                    <td colSpan="5" className="p-0 border-r border-black h-6">
                                        {renderTypeDots(item.types)}
                                    </td>
                                    <td className="p-1 border-r border-black align-middle">
                                        <div className="font-bold leading-tight text-[9.5px]">{item.desc_id}</div>
                                        <div className="italic text-gray-600 text-[8.5px] leading-tight mt-0.5">
                                            {item.desc_en}
                                        </div>
                                    </td>
                                    <td className="p-1 border-r border-black text-center align-middle font-bold text-[9.5px]" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                        {item.status === 'OK' && '✓'}
                                        {item.status === 'ADJUST' && 'Adj'}
                                        {item.status === 'REPAIR' && 'Rep'}
                                        {item.status === 'NA' && 'N/A'}
                                    </td>
                                    <td className="p-1 border-r border-black align-middle">
                                        {renderRemarks(item)}
                                    </td>
                                    <td className="p-1 text-center align-middle font-mono text-[9px]">
                                        {item.inspector || ''}
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-100 py-6 print:bg-white print:py-0 text-black font-sans">
            <Head title={`Print PM Dump Truck - ${form?.form_number || 'BLANK'}`} />
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body, table, td, th, div, span, p {
                        font-family: 'DejaVu Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    }
                }
            `}} />

            {/* Non-print control bar */}
            <div className="max-w-[210mm] mx-auto mb-4 bg-white p-3 rounded-lg shadow flex items-center justify-between print:hidden border border-gray-200">
                <div className="text-sm font-bold">
                    Pratinjau PM Service Sheet Dump Truck (A4 - 3 Halaman)
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded text-sm shadow flex items-center gap-1.5"
                    >
                        <span>🖨️</span> Cetak Sekarang
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-1.5 rounded text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════ PAGE 1 ════════════════════════════════ */}
            <div className="sheet-page max-w-[210mm] mx-auto bg-white p-[8mm] shadow-lg print:shadow-none print:p-0 mb-6 print:mb-0 print:break-after-page">
                {/* Header Brand */}
                <div className="flex items-center justify-between border-2 border-black p-2 mb-0">
                    <div className="flex items-center gap-3">
                        <div className="font-black text-3xl tracking-tighter text-red-700 font-serif">
                            MAM
                        </div>
                        <div>
                            <div className="font-black text-base uppercase tracking-wider leading-none">
                                PM SERVICE SHEET
                            </div>
                            <div className="font-black text-sm uppercase leading-none mt-1">
                                DUMP TRUCK
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-[10px]">
                        <div className="font-bold">No. Dokumen :</div>
                        <div className="font-mono font-black text-xs">
                            {form?.form_number || 'PLT/FRM/PM-DT/_____'}
                        </div>
                    </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-12 border-x-2 border-b-2 border-black text-[10px] divide-x border-t-0">
                    <div className="col-span-5 p-1.5 space-y-0.5">
                        <div className="flex">
                            <span className="w-24 font-bold">PROJECT ID</span>
                            <span className="mr-1">:</span>
                            <span className="font-bold">{form?.project_id || 'PT. MAM'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 font-bold">UNIT ID</span>
                            <span className="mr-1">:</span>
                            <span className="font-black">{unit ? unit.code_unit : '________________'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 font-bold">DATE</span>
                            <span className="mr-1">:</span>
                            <span>{form?.date ? String(form.date).substring(0, 10) : '____ / ____ / ________'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 font-bold">S.M.U</span>
                            <span className="mr-1">:</span>
                            <span className="font-bold">{form?.smu ? `${form.smu} HRS` : '____________ HRS'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 font-bold">SHIFT</span>
                            <span className="mr-1">:</span>
                            <span>{form?.shift ? (form.shift === 'DS' ? 'DS (Siang)' : 'NS (Malam)') : 'DS / NS (Siang / Malam)'}</span>
                        </div>
                    </div>

                    <div className="col-span-4 p-1.5 text-[9px] space-y-0.5 border-r border-black">
                        <div className="font-black border-b border-black pb-0.5 uppercase tracking-tight">
                            Pengambilan Sampel Oli Terakhir / Last Oil Sample Taken
                        </div>
                        <div className="flex justify-between">
                            <span>Engine</span>
                            <span className="font-mono">{form?.oil_samples?.engine || '____ / ____ / ____'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Transmission</span>
                            <span className="font-mono">{form?.oil_samples?.transmission || '____ / ____ / ____'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Differential &amp; Final Drive</span>
                            <span className="font-mono">{form?.oil_samples?.differential || '____ / ____ / ____'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Hydraulic</span>
                            <span className="font-mono">{form?.oil_samples?.hydraulic || '____ / ____ / ____'}</span>
                        </div>
                    </div>

                    <div className="col-span-3 p-1.5 text-[8.5px] leading-tight space-y-0.5">
                        <div className="font-black border-b border-black pb-0.5 uppercase">
                            Perhatian / Coution
                        </div>
                        <div className="flex items-start gap-1">
                            <span>✓</span>
                            <span>Cuci unit yang bersih sebelum pelaksanaan inspeksi<br /><em>Clean up the unit before inspection</em></span>
                        </div>
                        <div className="flex items-start gap-1">
                            <span>✓</span>
                            <span>Parkirkan unit pada tempat rata dengan aman<br /><em>Park the unit on flat area safely</em></span>
                        </div>
                        <div className="flex items-start gap-1">
                            <span>✓</span>
                            <span>Pasang Danger atau Service Tag pada unit<br /><em>Make sure you already use Danger or Service Tag</em></span>
                        </div>
                    </div>
                </div>

                {/* Service Types Ribbon */}
                <div className="border-x-2 border-b-2 border-black p-1 bg-gray-100 flex items-center justify-between text-[9.5px] font-bold">
                    <span>Tipe PM Service / PM Services Types :</span>
                    <div className="flex gap-3">
                        {['A : PM 250 / PS 1', 'B : PM 500 / PS 2', 'C : PM 1000 / PS 3', 'D : PM 2000 / PS 4', 'E : PM 4000 / PS 5'].map((t, idx) => {
                            const key = ['A', 'B', 'C', 'D', 'E'][idx];
                            const isMatch = activeType === key;
                            return (
                                <span key={t} className={isMatch ? 'underline font-black bg-yellow-200 px-1' : ''} style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                    [{isMatch ? '✓' : ' '}] {t}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Page 1 Table (Items 1-29) */}
                <div className="mt-1">
                    {renderTable(page1Items)}
                </div>
            </div>

            {/* ════════════════════════════════ PAGE 2 ════════════════════════════════ */}
            <div className="sheet-page max-w-[210mm] mx-auto bg-white p-[8mm] shadow-lg print:shadow-none print:p-0 mb-6 print:mb-0 print:break-after-page print:break-before-page">
                {/* Page 2 Mini Header */}
                <div className="flex items-center justify-between border-2 border-black p-1.5 mb-1 bg-gray-50 text-[10px]">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-red-700 text-lg">MAM</span>
                        <span className="font-black uppercase tracking-wider">PM SERVICE SHEET DUMP TRUCK - HALAMAN 2</span>
                    </div>
                    <div className="font-bold flex items-center gap-3">
                        <span>UNIT: <strong className="font-black">{unit ? unit.code_unit : '________'}</strong></span>
                        <span>SMU: <strong>{form?.smu || '________'}</strong></span>
                        <span>DATE: <strong>{form?.date ? String(form.date).substring(0, 10) : '____/__/__'}</strong></span>
                        <span>SHIFT: <strong>{form?.shift || 'DS'}</strong></span>
                        <span>TYPE: <strong>{activeType || '-'}</strong></span>
                    </div>
                </div>

                {/* Page 2 Table (Items 30-61) */}
                {renderTable(page2Items)}
            </div>

            {/* ════════════════════════════════ PAGE 3 ════════════════════════════════ */}
            <div className="sheet-page max-w-[210mm] mx-auto bg-white p-[8mm] shadow-lg print:shadow-none print:p-0 print:break-before-page">
                {/* Page 3 Mini Header */}
                <div className="flex items-center justify-between border-2 border-black p-1.5 mb-1 bg-gray-50 text-[10px]">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-red-700 text-lg">MAM</span>
                        <span className="font-black uppercase tracking-wider">PM SERVICE SHEET DUMP TRUCK - HALAMAN 3</span>
                    </div>
                    <div className="font-bold flex items-center gap-3">
                        <span>UNIT: <strong className="font-black">{unit ? unit.code_unit : '________'}</strong></span>
                        <span>SMU: <strong>{form?.smu || '________'}</strong></span>
                        <span>DATE: <strong>{form?.date ? String(form.date).substring(0, 10) : '____/__/__'}</strong></span>
                        <span>SHIFT: <strong>{form?.shift || 'DS'}</strong></span>
                        <span>TYPE: <strong>{activeType || '-'}</strong></span>
                    </div>
                </div>

                {/* Page 3 Table (Items 62-77) */}
                {renderTable(page3Items)}

                {/* Notes Section matching physical sheet */}
                <div className="border-2 border-black p-2 mt-2">
                    <div className="font-bold text-[10px] uppercase mb-1">NOTE :</div>
                    {form?.notes ? (
                        <div className="text-[10px] min-h-[70px] whitespace-pre-line leading-relaxed">
                            {form.notes}
                        </div>
                    ) : (
                        <div className="space-y-3 pt-1 pb-1">
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                        </div>
                    )}
                </div>

                {/* Signatures Section */}
                <div className="border-2 border-t-0 border-black grid grid-cols-2 divide-x-2 divide-black p-3 text-center text-[10px]">
                    <div className="space-y-8">
                        <div className="font-bold">Inspected By,</div>
                        <div>
                            <div className="font-bold underline">
                                {form?.mechanic_name || '( ................................................................ )'}
                            </div>
                            <div className="text-[9px] text-gray-700 mt-0.5">Mechanic/ Serviceman</div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="font-bold">Aknowledged by,</div>
                        <div>
                            <div className="font-bold underline">
                                {form?.supervisor_name || '( ................................................................ )'}
                            </div>
                            <div className="text-[9px] text-gray-700 mt-0.5">Maintenance Supervisor</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
