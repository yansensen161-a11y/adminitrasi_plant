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
        <div className="bg-white text-black min-h-screen p-0 sm:p-4 print:p-0 font-sans">
            <Head title={`Pre Release Check List Track Unit - ${form?.form_number || 'BLANK'}`} />

            {/* Print toolbar */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Lembar Form Pre Release Track Unit (A4 Portrait)
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm flex items-center gap-1.5"
                    >
                        <span>🖨️</span> Cetak Lembar / Print
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

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white border border-black print:border-none p-3 print:p-0 shadow-lg print:shadow-none text-[7.5pt] leading-tight">
                
                {/* Header Table */}
                <table className="w-full border-collapse border-[1.5px] border-black mb-1">
                    <tbody>
                        <tr>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <div className="text-xs font-black text-rose-700 tracking-wider">▲▲ PT Mitra Abadi Mahakam</div>
                            </td>
                            <td className="w-[45%] p-1.5 text-center align-middle font-black text-xs tracking-wide">
                                PRE RELEASE CHECK LIST REPORT<br/>TRACK UNIT
                            </td>
                            <td className="w-[25%] p-1.5 border-l border-black text-right text-[6.5pt] align-middle">
                                <div>No: <strong>{form?.form_number || 'PLT/FRM/PRT/001'}</strong></div>
                                <div>Status: {form?.status || 'COMPLETED'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Meta Grid */}
                <table className="w-full border-collapse border border-black mb-1 text-[7.5pt]">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-1 font-bold w-[16%]">Date :</td>
                            <td className="p-1 w-[34%]">{form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '.........................'}</td>
                            <td className="p-1 font-bold w-[16%]">Task :</td>
                            <td className="p-1 w-[34%] font-bold">{results.task || 'Perform Maintenance On'}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 font-bold">Equipment No. :</td>
                            <td className="p-1 font-black">{unit?.code_unit || '.........................'} {unit ? `(${unit.model})` : ''}</td>
                            <td className="p-1 font-bold">MC :</td>
                            <td className="p-1 font-bold">{results.mc || '10 Hr PM Service'}</td>
                        </tr>
                        <tr>
                            <td className="p-1 font-bold">SMU :</td>
                            <td className="p-1 font-bold">{form?.smu ? `${form.smu} Hours` : (unit?.current_hm ? `${unit.current_hm} Hours` : '.........................')}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

                {/* Subtitle Banner */}
                <div className="border border-black font-semibold text-center text-[6.5pt] p-0.5 mb-1 bg-slate-50">
                    Check all below components for leaks ,loosen ,cracks ,damage ,bent ,part &amp; missing
                </div>

                {/* Checklist Table */}
                <table className="w-full border-collapse border border-black text-[6.5pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th className="border-r border-black p-1 text-left" rowSpan="2">DESCRIPTION</th>
                            <th className="border-r border-black p-0.5 text-center" colSpan="2">NO</th>
                            <th className="border-r border-black p-0.5 text-center" colSpan="3">CONDITION</th>
                            <th className="p-1 text-left w-48" rowSpan="2">REMARKS</th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-black text-[6pt]">
                            <th className="border-r border-black p-0.5 w-6 text-center">DZR</th>
                            <th className="border-r border-black p-0.5 w-6 text-center">HEX</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">GOOD</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">REPAIR</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">B.LOG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawItems.map((item, idx) => {
                            const showHeader = idx === 0 || rawItems[idx - 1]?.section !== item.section;
                            const isGood = item.status === 'GOOD' || item.status === 'OK' || item.status === 'V';
                            const isRepair = item.status === 'REPAIR' || item.status === 'X';
                            const isBlog = item.status === 'B.LOG' || item.status === 'BLOG' || item.status === 'BACKLOG';

                            return (
                                <React.Fragment key={item.id}>
                                    {showHeader && (
                                        <tr className="bg-yellow-200 border-y border-black font-bold text-[7pt]">
                                            <td colSpan="7" className="p-0.5 uppercase tracking-wide">
                                                {item.section.includes('Operator')
                                                    ? '1. OPERATOR COMPARTMENT , ELECTRIC , COOLING & AIR CONDITIONER'
                                                    : '2. FROM : FRONT ---> RIGHT ---> REAR ---> LEFT & UNDER UNIT'}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-slate-300">
                                        <td className="border-r border-slate-300 p-0.5">{item.description}</td>
                                        <td className="border-r border-slate-300 p-0.5 text-center">{item.dzr ?? ''}</td>
                                        <td className="border-r border-slate-300 p-0.5 text-center">{item.hex ?? ''}</td>
                                        
                                        <td className="border-r border-slate-300 p-0.5 text-center font-bold">
                                            <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                                {!isBlank && isGood ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border-r border-slate-300 p-0.5 text-center font-bold">
                                            <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                                {!isBlank && isRepair ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border-r border-slate-300 p-0.5 text-center font-bold">
                                            <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                                {!isBlank && isBlog ? '✓' : ''}
                                            </span>
                                        </td>

                                        <td className="p-0.5 text-[6pt]">{!isBlank ? (item.remarks || '') : ''}</td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}

                        {/* Others Rows */}
                        <tr className="bg-slate-50 border-y border-slate-300 font-semibold italic text-[6pt]">
                            <td colSpan="7" className="p-0.5">Others / Temuan Tambahan :</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="border-r border-slate-300 p-0.5">1. {results.other_1 || ''}</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">-</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">-</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_1_cond === 'GOOD' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_1_cond === 'REPAIR' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_1_cond === 'B.LOG' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="p-0.5 text-[6pt]">{results.other_1_remark || ''}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-slate-300 p-0.5">2. {results.other_2 || ''}</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">-</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">-</td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_2_cond === 'GOOD' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_2_cond === 'REPAIR' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="border-r border-slate-300 p-0.5 text-center">
                                <span className="inline-block w-3 h-3 border border-black text-[6.5pt] leading-3 text-center">
                                    {results.other_2_cond === 'B.LOG' ? '✓' : ''}
                                </span>
                            </td>
                            <td className="p-0.5 text-[6pt]">{results.other_2_remark || ''}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <table className="w-full border-collapse border border-black text-[7pt]">
                    <tbody>
                        <tr>
                            <td className="p-2 w-1/2 border-r border-black align-top">
                                <div><strong>Technician :</strong></div>
                                <div className="mt-7 border-b border-dotted border-black w-4/5 font-bold">
                                    {form?.mechanic_name || '................................................'}
                                </div>
                                <div className="mt-1">Date: {form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '..... / ..... / ..........'}</div>
                            </td>
                            <td className="p-2 w-1/2 align-top">
                                <div><strong>Maint. Coordinator :</strong></div>
                                <div className="mt-7 border-b border-dotted border-black w-4/5 font-bold">
                                    {form?.supervisor_name || '................................................'}
                                </div>
                                <div className="mt-1">Date: {form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '..... / ..... / ..........'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
}
