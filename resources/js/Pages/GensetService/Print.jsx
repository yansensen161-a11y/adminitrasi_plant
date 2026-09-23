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

    // Split items matching physical 2 pages:
    // Page 1: Items 1 to 18 (ENGINE)
    // Page 2: Items 19 to 27 (MISCELLANEOUS)
    const page1Items = rawItems.filter((i) => i.id >= 1 && i.id <= 18);
    const page2Items = rawItems.filter((i) => i.id >= 19 && i.id <= 27);

    // Render dot for interval
    const renderTypeDots = (types = []) => {
        return (
            <div className="grid grid-cols-4 text-center h-full text-[11px] leading-none items-center font-sans">
                {['A', 'B', 'C', 'D'].map((t) => {
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

    // Render Table Helper
    const renderTable = (itemsList, sectionTitle) => {
        return (
            <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                    <tr className="border-b border-black bg-gray-200 font-bold text-[9px]">
                        <th colSpan="4" className="border-r border-black p-0.5 text-center w-20">
                            <div>Tipe Servis</div>
                            <div className="italic font-normal text-[8px]">Service Type</div>
                        </th>
                        <th className="border-r border-black p-1 text-left">
                            {sectionTitle}
                        </th>
                        <th className="border-r border-black p-1 text-center w-24">
                            Check Point
                        </th>
                        <th className="p-1 text-left w-52">
                            Remarks
                        </th>
                    </tr>
                    <tr className="border-b border-black text-[9px] font-bold text-center bg-gray-100">
                        {['A', 'B', 'C', 'D'].map((t) => (
                            <th
                                key={t}
                                className={`border-r border-black w-5 p-0.5 ${
                                    activeType === t ? 'bg-yellow-200 font-black' : ''
                                }`}
                            >
                                {t}
                            </th>
                        ))}
                        <th colSpan="3"></th>
                    </tr>
                </thead>
                <tbody>
                    {itemsList.map((item) => {
                        return (
                            <tr key={item.id} className="border-b border-gray-400">
                                <td colSpan="4" className="p-0 border-r border-black h-6">
                                    {renderTypeDots(item.types)}
                                </td>
                                <td className="p-1 border-r border-black align-middle">
                                    <div className="font-normal text-[9.5px]">◆ {item.desc_en}</div>
                                    <div className="font-bold italic text-gray-800 text-[9px] ml-3 mt-0.5">
                                        {item.desc_id}
                                    </div>
                                </td>
                                <td className="p-1 border-r border-black text-center align-middle">
                                    <div className="w-8 h-4 border border-black mx-auto flex items-center justify-center font-bold text-[9.5px]" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                        {item.status === 'OK' && '✓'}
                                        {item.status === 'ADJUST' && 'Adj'}
                                        {item.status === 'REPAIR' && 'Rep'}
                                        {item.status === 'NA' && 'NA'}
                                    </div>
                                </td>
                                <td className="p-1 align-middle text-[9.5px]">
                                    {item.remarks || ''}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-100 py-6 print:bg-white print:py-0 text-black font-sans">
            <Head title={`Print PM Genset - ${form?.form_number || 'BLANK'}`} />
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
                    Pratinjau PM Service Sheet Generator Set (A4 - 2 Halaman)
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-1.5 rounded text-sm shadow flex items-center gap-1.5"
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
            <div className="sheet-page max-w-[210mm] mx-auto bg-white p-[10mm] shadow-lg print:shadow-none print:p-0 mb-6 print:mb-0 print:break-after-page">
                {/* Header Banner */}
                <div className="bg-neutral-600 text-white text-center py-2 px-3 mb-2">
                    <div className="font-black text-lg uppercase tracking-wider leading-none">
                        PM SERVICE SHEET
                    </div>
                    <div className="font-extrabold text-sm uppercase tracking-wide leading-none mt-1">
                        GENERATOR SET
                    </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-12 text-[10px] py-1 mb-2">
                    <div className="col-span-5 space-y-0.5">
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
                            <span className="w-24 font-bold">Name Inspector</span>
                            <span className="mr-1">:</span>
                            <span>{form?.results_data?.inspector_name || form?.mechanic_name || '___________________________'}</span>
                        </div>
                    </div>

                    <div className="col-span-4 space-y-0.5">
                        <div className="flex">
                            <span className="w-16 font-bold">DATE</span>
                            <span className="mr-1">:</span>
                            <span>{form?.date ? String(form.date).substring(0, 10) : '____ / ____ / ________'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-16 font-bold">S.M.U / K.M</span>
                            <span className="mr-1">:</span>
                            <span className="font-bold">
                                {form?.smu ? `${form.smu} HRS` : '____________'}
                                {form?.results_data?.km ? ` / ${form.results_data.km} KM` : ' / ________'}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-3 space-y-0.5">
                        <div className="flex">
                            <span className="w-12 font-bold">SHIFT</span>
                            <span className="mr-1">:</span>
                            <span>{form?.shift ? (form.shift === 'DS' ? 'DS (Siang)' : 'NS (Malam)') : 'DS / NS (Siang / Malam)'}</span>
                        </div>
                    </div>
                </div>

                {/* Types & Caution Boxes */}
                <div className="grid grid-cols-12 gap-3 mb-2 text-[10px]">
                    {/* Left: Tipe PM */}
                    <div className="col-span-6 border border-black p-2">
                        <div className="font-bold mb-1">
                            Tipe PM Service / <span className="font-normal italic">PM Services Types</span>
                        </div>
                        <div className="space-y-1 text-[9.5px]">
                            {[
                                { k: 'A', lbl: 'A : PM 250 HRS' },
                                { k: 'B', lbl: 'B : PM 500 HRS' },
                                { k: 'C', lbl: 'C : PM 1000 HRS' },
                                { k: 'D', lbl: 'D : PM 2000 HRS' },
                            ].map(({ k, lbl }) => {
                                const isSelected = activeType === k;
                                return (
                                    <div key={k} className="flex items-center gap-2">
                                        <div className="w-4 h-3.5 border border-black flex items-center justify-center font-bold text-[9px]" style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}>
                                            {isSelected ? '✓' : ''}
                                        </div>
                                        <span className={isSelected ? 'font-black' : ''}>{lbl}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Caution */}
                    <div className="col-span-6 border border-black p-2 text-[9px] leading-tight space-y-1">
                        <div className="font-bold">
                            Perhatian / <span className="font-normal italic">Caution</span>
                        </div>
                        <div>
                            <div>* Cuci genset yang bersih sebelum pelaksanaan inspeksi</div>
                            <div className="italic text-gray-600 text-[8px]">Clean up the genset before inspection</div>
                        </div>
                        <div>
                            <div>* Tempatkan genset pada tempat rata dengan aman</div>
                            <div className="italic text-gray-600 text-[8px]">Place the unit on flat area safely</div>
                        </div>
                        <div>
                            <div>* Yakinkan anda sudah memasang Danger atau Service Tag pada unit</div>
                            <div className="italic text-gray-600 text-[8px]">Make sure you already use Danger or Service Tag on the unit</div>
                        </div>
                    </div>
                </div>

                {/* Page 1 Table: ENGINE (Items 1-18) */}
                <div className="mt-1">
                    {renderTable(page1Items, 'Engine')}
                </div>

                {/* Footer Page 1 */}
                <div className="flex justify-between text-[8px] text-gray-600 mt-4">
                    <span>Page 1 of 2</span>
                    <span>Dokumen Tidak Terkendali Jika Dicetak</span>
                </div>
            </div>

            {/* ════════════════════════════════ PAGE 2 ════════════════════════════════ */}
            <div className="sheet-page max-w-[210mm] mx-auto bg-white p-[10mm] shadow-lg print:shadow-none print:p-0 mb-6 print:mb-0 print:break-before-page">
                {/* Header Banner Page 2 */}
                <div className="bg-neutral-600 text-white text-center py-2 px-3 mb-3">
                    <div className="font-black text-lg uppercase tracking-wider leading-none">
                        PM SERVICE SHEET
                    </div>
                    <div className="font-extrabold text-sm uppercase tracking-wide leading-none mt-1">
                        GENERATOR SET
                    </div>
                </div>

                {/* Page 2 Table: MISCELLANEOUS (Items 19-27) */}
                <div className="mt-1">
                    {renderTable(page2Items, 'Miscellinuous')}
                </div>

                {/* Notes Section */}
                <div className="border border-black p-2 mt-4 text-[10px]">
                    <div className="font-bold mb-1 uppercase">NOTE :</div>
                    {form?.notes ? (
                        <div className="min-h-[80px] whitespace-pre-line leading-relaxed text-[9.5px]">
                            {form.notes}
                        </div>
                    ) : (
                        <div className="space-y-4 pt-1 pb-1">
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                            <div className="border-b border-gray-400 h-2"></div>
                        </div>
                    )}
                </div>

                {/* Signatures Section */}
                <div className="border border-t-0 border-black grid grid-cols-2 divide-x border-black p-4 text-center text-[10px]">
                    <div className="space-y-10">
                        <div>Inspected by,</div>
                        <div>
                            <div className="font-bold underline">
                                {form?.mechanic_name || '( ................................................................ )'}
                            </div>
                            <div className="text-[9px] text-gray-700 mt-0.5">Mechanic/ Serviceman</div>
                        </div>
                    </div>
                    <div className="space-y-10">
                        <div>Aknowledged by,</div>
                        <div>
                            <div className="font-bold underline">
                                {form?.supervisor_name || '( ................................................................ )'}
                            </div>
                            <div className="text-[9px] text-gray-700 mt-0.5">Section Head</div>
                        </div>
                    </div>
                </div>

                {/* Footer Page 2 */}
                <div className="flex justify-between text-[8px] text-gray-600 mt-6">
                    <span>Page 2 of 2</span>
                    <span>Dokumen Tidak Terkendali Jika Dicetak</span>
                </div>
            </div>
        </div>
    );
}
