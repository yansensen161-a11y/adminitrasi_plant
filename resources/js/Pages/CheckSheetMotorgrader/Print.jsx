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
    const serviceType = form?.service_type || '250/750';

    return (
        <div className="bg-white text-black min-h-screen p-0 sm:p-4 print:p-0 font-sans">
            <Head title={`Check Sheet Service Motorgrader - ${form?.form_number || 'BLANK'}`} />

            {/* Print toolbar */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Lembar Form Motorgrader (A4 Portrait - 2 Halaman)
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
            <div className="max-w-[210mm] mx-auto bg-white border border-black print:border-none p-3 print:p-0 shadow-lg print:shadow-none text-[8pt] leading-tight">
                
                {/* ─── PAGE 1 ─── */}
                {/* Header Table */}
                <table className="w-full border-collapse border-[1.5px] border-black mb-1">
                    <tbody>
                        <tr>
                            <td className="w-[30%] p-2 border-r border-black align-middle">
                                <div className="text-xs font-black text-rose-700 tracking-wider">▲▲ PT Mitra Abadi Mahakam</div>
                                <div className="text-[7pt] text-slate-600 font-medium">Mining & Heavy Equipment Contractor</div>
                            </td>
                            <td className="w-[45%] p-2 text-center align-middle font-black text-sm tracking-wide">
                                CHECK SHEET SERVICE MOTORGRADER
                            </td>
                            <td className="w-[25%] p-2 border-l border-black text-right text-[7pt] align-middle">
                                <div>No: <strong>{form?.form_number || 'PLT/FRM/CSM/001'}</strong></div>
                                <div>Hal: 1 dari 2</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Metadata Grid */}
                <table className="w-full border-collapse border border-black mb-1 text-[7.5pt]">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-1 font-bold w-[18%]">NOMER UNIT :</td>
                            <td className="p-1 w-[32%] font-black">{unit?.code_unit || '.........................'}</td>
                            <td className="p-1 font-bold w-[18%]">HOURS METER :</td>
                            <td className="p-1 w-[32%] font-black">{form?.smu ? `${form.smu} Hours` : (unit?.current_hm ? `${unit.current_hm} Hours` : '.........................')}</td>
                        </tr>
                        <tr>
                            <td className="p-1 font-bold">MODEL :</td>
                            <td className="p-1">{unit?.model || '.........................'}</td>
                            <td className="p-1 font-bold">TANGGAL :</td>
                            <td className="p-1">{form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '.........................'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Safety Banner */}
                <div className="border border-black font-bold text-center text-[7pt] p-1 mb-1 tracking-tight bg-slate-50">
                    PASANG 'OUT OF SERVICE TAG' , 'DANGER TAG' & 'GANJAL BAN' (INSTALL OUT OF SERVICE TAG , DANGER TAGS & WHEEL CHOCKS)
                </div>

                {/* Table Page 1 (Items <= 30) */}
                <table className="w-full border-collapse border border-black text-[7pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th className="border-r border-black p-1 w-6" rowSpan="2">No</th>
                            <th className="border-r border-black p-1 text-left" rowSpan="2">Kompartemen / Deskripsi Motorgrader</th>
                            <th className="border-r border-black p-1 text-left" rowSpan="2">Tindakan / Action</th>
                            <th className="border-r border-black p-0.5 text-center" colSpan="4">SERVICE TYPE</th>
                            <th className="p-1 text-center w-12" rowSpan="2">NAMA</th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-black text-[6.5pt]">
                            <th className="border-r border-black p-0.5 w-10 text-center">250/750</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">500</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">1000</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">2000</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawItems.map((item, idx) => {
                            if (item.id > 30) return null;
                            const intervals = item.intervals || ['250/750', '500', '1000', '2000'];
                            const showHeader = idx === 0 || rawItems[idx - 1]?.section !== item.section;

                            return (
                                <React.Fragment key={item.id}>
                                    {showHeader && (
                                        <tr className="bg-slate-100 border-y border-black font-bold text-[7pt]">
                                            <td colSpan="8" className="p-1 uppercase tracking-wide">
                                                {item.section}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-slate-300">
                                        <td className="border-r border-slate-300 p-0.5 text-center font-medium">{item.id}</td>
                                        <td className="border-r border-slate-300 p-0.5">{item.description}</td>
                                        <td className="border-r border-slate-300 p-0.5 text-[6.5pt]">{item.action}</td>

                                        {['250/750', '500', '1000', '2000'].map(intv => {
                                            const applies = intervals.includes(intv);
                                            const isSelected = serviceType === intv;
                                            const isMarked = (item.status === 'OK' || item.status === 'V' || item.status === 'CHECKED');

                                            if (!applies) {
                                                return <td key={intv} className="border-r border-slate-300 bg-black w-6"></td>;
                                            }

                                            return (
                                                <td
                                                    key={intv}
                                                    className={`border-r border-slate-300 p-0.5 text-center ${
                                                        !isBlank && isSelected && isMarked ? 'font-black text-black' : 'font-bold text-slate-800'
                                                    }`}
                                                    style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}
                                                >
                                                    ✓
                                                </td>
                                            );
                                        })}

                                        <td className="p-0.5 text-center text-[6pt]">
                                            {!isBlank ? (item.name || form?.mechanic_name?.substring(0, 8) || '') : ''}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {/* Magnetic Plug Bottom of Page 1 */}
                <table className="w-full border-collapse border border-black text-[7pt] mb-3">
                    <tbody>
                        <tr className="bg-slate-100 border-b border-black font-bold">
                            <td colSpan="3" className="p-1 text-center">
                                Plug Magnet &amp; Catat (Magnetic Plug for Particles &amp; Record) *
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 w-1/3 border-r border-slate-300">Engine: <strong>{results.mag_engine || ''}</strong></td>
                            <td className="p-1 w-1/3 border-r border-slate-300">Transmission: <strong>{results.mag_trans || ''}</strong></td>
                            <td className="p-1 w-1/3">Differential: <strong>{results.mag_diff || ''}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="p-0.5 text-center italic text-blue-700 text-[6.5pt]">
                                *) Merujuk ke STP Magnetic Plug Rating
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ─── PAGE BREAK ─── */}
                <div className="print:break-before-page pt-4 print:pt-0"></div>

                {/* ─── PAGE 2 ─── */}
                <table className="w-full border-collapse border-[1.5px] border-black mb-1">
                    <tbody>
                        <tr>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <div className="text-[7pt] font-black text-rose-700">▲▲ PT Mitra Abadi Mahakam</div>
                            </td>
                            <td className="w-[45%] p-1.5 text-center align-middle font-black text-xs tracking-wide">
                                CHECK SHEET SERVICE MOTORGRADER (Lanjutan)
                            </td>
                            <td className="w-[25%] p-1.5 border-l border-black text-right text-[7pt] align-middle">
                                <div>Unit: <strong>{unit?.code_unit || '-'}</strong> | Hal: 2 dari 2</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Specialized Table Page 2 */}
                <table className="w-full border-collapse border border-black text-[7pt] mb-1">
                    <tbody>
                        {/* Cut Filter */}
                        <tr className="bg-slate-100 border-b border-black font-bold">
                            <td colSpan="3" className="p-1 text-center">
                                Potong / Periksa Saringan2 Bermasalah &amp; Catat (Cut Filter / Inspect if Indicated failure &amp; Record) *
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 w-1/3 border-r border-slate-300">Engine: <strong>{results.cut_engine || ''}</strong></td>
                            <td className="p-1 w-1/3 border-r border-slate-300">Hydraulic: <strong>{results.cut_hydraulic || ''}</strong></td>
                            <td className="p-1 w-1/3">Transmission: <strong>{results.cut_trans || ''}</strong></td>
                        </tr>

                        {/* Cylinder */}
                        <tr className="bg-slate-100 border-b border-black font-bold">
                            <td colSpan="3" className="p-1 text-center">
                                Periksa &amp; Catat Cylinder-Cylinder *
                            </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 border-r border-slate-300">Cyl Artic RH / LH: <strong>{results.cyl_artic || ''}</strong></td>
                            <td className="p-1 border-r border-slate-300">Steering RH / LH: <strong>{results.cyl_steering || ''}</strong></td>
                            <td className="p-1">Blade Lift RH &amp; LH: <strong>{results.cyl_blade_lift || ''}</strong></td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-slate-300">Blade Tilt: <strong>{results.cyl_blade_tilt || ''}</strong></td>
                            <td className="p-1 border-r border-slate-300">Cyl Wheel Lean: <strong>{results.cyl_wheel_lean || ''}</strong></td>
                            <td className="p-1">Center Shift &amp; Ripper: <strong>{results.cyl_center_ripper || ''}</strong></td>
                        </tr>

                        {/* ET Data */}
                        <tr className="bg-slate-100 border-b border-black font-bold">
                            <td colSpan="3" className="p-1 text-center">
                                Pengambilan Data Modul Elektronik
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="p-1 text-center">
                                Download ET: <strong>{results.et_download || ''}</strong>
                                <span className="ml-4 italic text-blue-700 text-[6.5pt]">*) Merujuk ke STP On Board Electronic Download</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Pelumasan & Final Check (Page 2) */}
                <table className="w-full border-collapse border border-black text-[7pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th className="border-r border-black p-1 w-6" rowSpan="2">No</th>
                            <th className="border-r border-black p-1 text-left" rowSpan="2">Deskripsi Pelumasan / Pengecekan</th>
                            <th className="border-r border-black p-1 text-left" rowSpan="2">Tindakan / Action</th>
                            <th className="border-r border-black p-0.5 text-center" colSpan="4">SERVICE TYPE</th>
                            <th className="p-1 text-center w-12" rowSpan="2">NAMA</th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-black text-[6.5pt]">
                            <th className="border-r border-black p-0.5 w-10 text-center">250/750</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">500</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">1000</th>
                            <th className="border-r border-black p-0.5 w-8 text-center">2000</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawItems.map((item, idx) => {
                            if (!['Pelumasan Grease', 'Pengecekan Akhir'].includes(item.section)) return null;
                            const intervals = item.intervals || ['250/750', '500', '1000', '2000'];
                            const showHeader = idx === 0 || rawItems[idx - 1]?.section !== item.section;

                            return (
                                <React.Fragment key={item.id}>
                                    {showHeader && (
                                        <tr className="bg-slate-100 border-y border-black font-bold text-[7pt]">
                                            <td colSpan="8" className="p-1 uppercase tracking-wide">
                                                {item.section}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-slate-300">
                                        <td className="border-r border-slate-300 p-0.5 text-center font-medium">{item.id}</td>
                                        <td className="border-r border-slate-300 p-0.5">{item.description}</td>
                                        <td className="border-r border-slate-300 p-0.5 text-[6.5pt]">{item.action}</td>

                                        {['250/750', '500', '1000', '2000'].map(intv => {
                                            const applies = intervals.includes(intv);
                                            const isSelected = serviceType === intv;
                                            const isMarked = (item.status === 'OK' || item.status === 'V' || item.status === 'CHECKED');

                                            if (!applies) {
                                                return <td key={intv} className="border-r border-slate-300 bg-black w-6"></td>;
                                            }

                                            return (
                                                <td
                                                    key={intv}
                                                    className={`border-r border-slate-300 p-0.5 text-center ${
                                                        !isBlank && isSelected && isMarked ? 'font-black text-black' : 'font-bold text-slate-800'
                                                    }`}
                                                    style={{ fontFamily: "'DejaVu Sans', Arial, sans-serif" }}
                                                >
                                                    ✓
                                                </td>
                                            );
                                        })}

                                        <td className="p-0.5 text-center text-[6pt]">
                                            {!isBlank ? (item.name || form?.mechanic_name?.substring(0, 8) || '') : ''}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {/* Signatures */}
                <table className="w-full border-collapse border border-black text-[7pt]">
                    <tbody>
                        <tr>
                            <td className="p-2 w-1/2 border-r border-black align-top">
                                <div><strong>Mech Name / Signature:</strong></div>
                                <div className="mt-8 border-b border-dotted border-black w-4/5 font-bold">
                                    {form?.mechanic_name || '................................................'}
                                </div>
                                <div className="mt-1">Date: {form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '..... / ..... / ..........'}</div>
                            </td>
                            <td className="p-2 w-1/2 align-top">
                                <div><strong>Mech. Sup'v:</strong></div>
                                <div className="mt-8 border-b border-dotted border-black w-4/5 font-bold">
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
