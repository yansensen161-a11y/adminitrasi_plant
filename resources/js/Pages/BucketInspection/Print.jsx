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

    const itemMap = {};
    rawItems.forEach(i => {
        itemMap[i.id] = i;
    });

    return (
        <div className="bg-white text-black min-h-screen p-0 sm:p-4 print:p-0 font-sans">
            <Head title={`Bucket Inspection - ${form?.form_number || 'BLANK'}`} />

            {/* Print toolbar (hidden during print) */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Lembar Form (A4 Portrait)
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
            <div className="max-w-[210mm] mx-auto bg-white border border-black print:border-none p-2 print:p-0 shadow-lg print:shadow-none text-[8.5pt] leading-tight">
                
                {/* ─── HEADER TABLE ─── */}
                <table className="w-full border-collapse border-[1.5px] border-black">
                    <tbody>
                        <tr>
                            <td className="w-[20%] p-2 border-r border-black text-center align-middle">
                                <div className="text-xl font-black text-rose-700 tracking-wider">HW</div>
                                <div className="text-[7.5pt] font-black text-black tracking-tight">HARINDO WAHANA</div>
                            </td>
                            <td className="w-[50%] p-2 border-r border-black text-center align-middle">
                                <div className="text-[8pt] font-bold tracking-widest uppercase mb-0.5">FORMULIR</div>
                                <div className="text-[12pt] font-black tracking-wide uppercase">BUCKET INSPECTION &amp; MONITORING</div>
                            </td>
                            <td className="w-[30%] p-0 align-middle">
                                <table className="w-full border-collapse text-[7.5pt]">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className="p-1 w-[45%] font-medium">Nomor Dokumen</td>
                                            <td className="p-1 font-bold">: {results.doc_number || 'FM-PLT-BKT-01'}</td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="p-1 font-medium">Tanggal Efektif</td>
                                            <td className="p-1 font-bold">: {results.effective_date || (form?.date ? form.date.substring(0, 10) : new Date().toLocaleDateString('id-ID'))}</td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="p-1 font-medium">Revisi</td>
                                            <td className="p-1 font-bold">: {results.revision || '1'}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1 font-medium">Halaman</td>
                                            <td className="p-1 font-bold">: {results.page_info || '1 dari 1'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ─── META GRID ─── */}
                <table className="w-full border-collapse border-x-[1.5px] border-b-[1.5px] border-black text-[8pt]">
                    <tbody>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 font-bold w-[18%]">Equipment Code :</td>
                            <td className="p-1 font-black w-[32%]">{unit?.code_unit || (isBlank ? '________________' : '-')}</td>
                            <td className="p-1 font-bold w-[18%]">Project :</td>
                            <td className="p-1 font-black w-[32%]">{form?.project_id || 'Harindo Wahana'}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 font-bold">Unit Model :</td>
                            <td className="p-1 font-bold">{unit?.model || (isBlank ? '________________' : '-')}</td>
                            <td className="p-1 font-bold">Inspection Period :</td>
                            <td className="p-1 font-bold">{results.inspection_period || (isBlank ? 'Weekly' : '-')}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 font-bold">Brand :</td>
                            <td className="p-1 font-bold">{results.brand || (unit?.engine_make || 'Caterpillar')}</td>
                            <td className="p-1 font-bold">Date of Inspection :</td>
                            <td className="p-1 font-bold">{form?.date ? form.date.substring(0, 10) : (isBlank ? '___/___/20___' : '-')}</td>
                        </tr>
                        <tr>
                            <td className="p-1 font-bold">Hour meter :</td>
                            <td className="p-1 font-bold">{form?.smu ? `${form.smu} Jam` : (isBlank ? '__________ Jam' : '-')}</td>
                            <td className="p-1 font-bold">Inspector :</td>
                            <td className="p-1 font-bold">{form?.mechanic_name || (isBlank ? '________________' : '-')}</td>
                        </tr>
                    </tbody>
                </table>

                {/* ─── SECTION BANNER ─── */}
                <div className="w-full bg-slate-200 border-x-[1.5px] border-b-[1.5px] border-black text-center font-black text-[9pt] py-1 tracking-wider uppercase">
                    BODY - BUSHING - TEETH (Check for : Lost, crack, wear, damage)
                </div>

                {/* ─── CHECKLIST TABLE ─── */}
                <table className="w-full border-collapse border-[1.5px] border-black text-[7.5pt]">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black text-center font-bold">
                            <th className="w-[14%] p-1 border-r border-black">DIAGRAM</th>
                            <th className="w-[4%] p-1 border-r border-black">NO</th>
                            <th className="w-[40%] p-1 border-r border-black text-left pl-2">DESCRIPTION</th>
                            <th className="w-[12%] p-1 border-r border-black">STD</th>
                            <th className="w-[10%] p-1 border-r border-black">ACT</th>
                            <th className="w-[6%] p-1 border-r border-black">MARK</th>
                            <th className="w-[14%] p-1">REMARK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* ─── SECTION 1: GET (1-7) ─── */}
                        {[1, 2, 3, 4, 5, 6, 7].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    {id === 1 && (
                                        <td rowSpan={7} className="border-r border-black p-1 text-center align-middle bg-slate-50">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="font-black text-[9pt] leading-snug">G<br/>E<br/>T</div>
                                                <svg viewBox="0 0 160 95" className="w-[90px] h-[55px]">
                                                    <polygon points="15,65 145,65 135,35 25,35" fill="#e5e7eb" stroke="#1f2937" strokeWidth="1.2"/>
                                                    <polygon points="25,35 40,15 55,35" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1"/>
                                                    <polygon points="65,35 80,15 95,35" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1"/>
                                                    <polygon points="105,35 120,15 135,35" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1"/>
                                                    <circle cx="40" cy="28" r="2.5" fill="#9ca3af" stroke="#111" strokeWidth="0.8"/>
                                                    <circle cx="80" cy="28" r="2.5" fill="#9ca3af" stroke="#111" strokeWidth="0.8"/>
                                                    <circle cx="120" cy="28" r="2.5" fill="#9ca3af" stroke="#111" strokeWidth="0.8"/>
                                                </svg>
                                            </div>
                                        </td>
                                    )}
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* ─── SECTION 2: BODY (8-18) ─── */}
                        <tr className="border-b border-black bg-slate-100">
                            <td rowSpan={14} className="border-r border-black p-1 text-center align-middle bg-slate-50">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="font-black text-[9pt] leading-snug">B<br/>O<br/>D<br/>Y</div>
                                    <svg viewBox="0 0 160 120" className="w-[90px] h-[70px]">
                                        <path d="M 20 80 Q 25 15, 80 15 Q 135 15, 140 80 L 125 105 L 35 105 Z" fill="#e5e7eb" stroke="#1f2937" strokeWidth="1.2"/>
                                        <line x1="38" y1="35" x2="122" y2="35" stroke="#9ca3af" strokeDasharray="2,2" strokeWidth="1"/>
                                        <line x1="35" y1="55" x2="125" y2="55" stroke="#9ca3af" strokeDasharray="2,2" strokeWidth="1"/>
                                        <line x1="32" y1="75" x2="128" y2="75" stroke="#9ca3af" strokeDasharray="2,2" strokeWidth="1"/>
                                    </svg>
                                </div>
                            </td>
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">A. Bucket Skin</td>
                        </tr>
                        {[8, 9, 10].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* B. Right Section */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">B. Right Section</td>
                        </tr>
                        {[11, 12, 13, 14].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* C. Left Section */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">C. Left Section</td>
                        </tr>
                        {[15, 16, 17, 18].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* ─── SECTION 3: BRACKET (19-22) ─── */}
                        <tr className="border-b border-black bg-slate-100">
                            <td rowSpan={6} className="border-r border-black p-1 text-center align-middle bg-slate-50">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="font-black text-[8.5pt] leading-tight">B<br/>R<br/>A<br/>C<br/>K<br/>E<br/>T</div>
                                    <svg viewBox="0 0 160 85" className="w-[85px] h-[50px]">
                                        <rect x="25" y="15" width="110" height="30" rx="3" fill="#e5e7eb" stroke="#1f2937" strokeWidth="1.2"/>
                                        <circle cx="50" cy="30" r="9" fill="#fff" stroke="#111" strokeWidth="1.2"/>
                                        <circle cx="50" cy="30" r="4.5" fill="#9ca3af" stroke="#111" strokeWidth="0.8"/>
                                        <circle cx="110" cy="30" r="9" fill="#fff" stroke="#111" strokeWidth="1.2"/>
                                        <circle cx="110" cy="30" r="4.5" fill="#9ca3af" stroke="#111" strokeWidth="0.8"/>
                                    </svg>
                                </div>
                            </td>
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">D. Bracket Structure</td>
                        </tr>
                        {[19, 20].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* E. Bracket */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">E. Bracket</td>
                        </tr>
                        {[21, 22].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* ─── SECTION 4: LINK, PIN, LOCK (23-35) ─── */}
                        <tr className="border-b border-black bg-slate-100">
                            <td rowSpan={17} className="border-r border-black p-1 text-center align-middle bg-slate-50">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="font-black text-[8pt] leading-tight">L<br/>I<br/>N<br/>K<br/>,<br/>P<br/>I<br/>N<br/>,<br/>L<br/>O<br/>C<br/>K</div>
                                    <svg viewBox="0 0 160 140" className="w-[85px] h-[75px]">
                                        <path d="M 35 30 L 75 80 L 125 35" fill="none" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round"/>
                                        <circle cx="35" cy="30" r="10" fill="#fff" stroke="#111" strokeWidth="1.2"/>
                                        <circle cx="35" cy="30" r="5" fill="#4b5563"/>
                                        <circle cx="75" cy="80" r="10" fill="#fff" stroke="#111" strokeWidth="1.2"/>
                                        <circle cx="75" cy="80" r="5" fill="#4b5563"/>
                                        <circle cx="125" cy="35" r="10" fill="#fff" stroke="#111" strokeWidth="1.2"/>
                                        <circle cx="125" cy="35" r="5" fill="#4b5563"/>
                                    </svg>
                                </div>
                            </td>
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">F. Bucket Mounting Pin</td>
                        </tr>
                        {[23, 24, 25].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* G. Bucket Link */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">G. Bucket Link</td>
                        </tr>
                        {[26, 27, 28, 29].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* H. Bucket Cyl Pin */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">H. Bucket Cyl Pin</td>
                        </tr>
                        {[30, 31, 32].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}

                        {/* I. Bucket Link Pin */}
                        <tr className="border-b border-black bg-slate-100">
                            <td colSpan={6} className="p-1 font-bold pl-2 text-[7.5pt]">I. Bucket Link Pin</td>
                        </tr>
                        {[33, 34, 35].map(id => {
                            const cur = itemMap[id] || {};
                            return (
                                <tr key={id} className="border-b border-black/80">
                                    <td className="border-r border-black p-1 text-center font-bold">{id}</td>
                                    <td className="border-r border-black p-1 pl-2 font-bold">{cur.description}</td>
                                    <td className="border-r border-black p-1 text-center text-[7pt] text-slate-600">{cur.std || '-'}</td>
                                    <td className="border-r border-black p-1 text-center font-semibold">{cur.act || ''}</td>
                                    <td className="border-r border-black p-1 text-center font-black">
                                        {cur.mark === 'V' && <span className="text-emerald-700">✓</span>}
                                        {cur.mark === 'X' && <span className="text-rose-700">✕</span>}
                                        {cur.mark === 'CORRECTIVE' && <span className="text-amber-700">⊗</span>}
                                    </td>
                                    <td className="p-1 text-[7pt]">{cur.remark || ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ─── SIGNATURES TABLE ─── */}
                <table className="w-full border-collapse border-x-[1.5px] border-b-[1.5px] border-black text-[8pt]">
                    <tbody>
                        <tr>
                            <td className="w-1/2 p-2 border-r border-black h-16 align-top">
                                <div className="font-bold mb-6">Checked by Supervisors &amp; Signature :</div>
                                <div className="border-t border-dashed border-black w-2/3 pt-0.5 font-bold">
                                    {form?.supervisor_name || (isBlank ? 'Supervisor' : '-')}
                                </div>
                            </td>
                            <td className="w-1/2 p-2 h-16 align-top">
                                <div className="font-bold mb-6">Acknowledged by Superintendent &amp; Signature :</div>
                                <div className="border-t border-dashed border-black w-2/3 pt-0.5 font-bold">
                                    {results.superintendent_name || (isBlank ? 'Superintendent' : '-')}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ─── FOOTER NOTE ─── */}
                <div className="border-x-[1.5px] border-b-[1.5px] border-black bg-slate-50 p-1.5 text-[7pt] font-bold italic">
                    Note : Mark the shape on the check sheet below --&gt; <strong>V</strong> = Good, &nbsp; <strong>X</strong> = Bad, &nbsp; <strong>⊗</strong> = Corrective Action has been taken
                </div>

            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    );
}
