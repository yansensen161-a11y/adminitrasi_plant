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
            <Head title={`Request Asset Disposed - ${form?.form_number || 'BLANK'}`} />

            {/* Print toolbar */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Lembar Form Asset Disposed (A4 Portrait)
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
                            <td className="w-[32%] p-2 border-r border-black align-middle">
                                <div className="text-xs font-black text-rose-700 tracking-wider">▲▲ PT. MITRA ABADI MAHAKAM</div>
                                <div className="text-[7pt] text-black font-bold tracking-tight">PLANT DEPARTMENT</div>
                            </td>
                            <td className="w-[44%] p-2 text-center align-middle font-black text-xs tracking-wide underline">
                                REQUEST ASSET DISPOSED FORM
                            </td>
                            <td className="w-[24%] p-2 border-l border-black text-left text-[6.5pt] align-middle">
                                <div>DOCUMENT NO :</div>
                                <div className="font-bold text-[7.5pt]">{form?.form_number || 'DISPOSE/PLT/2026/01'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Top 3-Section Grid */}
                <table className="w-full border-collapse border-[1.5px] border-black text-[6.5pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th className="border-r border-black p-1 text-center font-bold w-[28%]">REASON OF DISPOSE</th>
                            <th className="border-r border-black p-1 text-center font-bold w-[42%]">TRANSFERRING OF DISPOSE DIVISION</th>
                            <th className="p-1 text-center font-bold w-[30%]">RECOMMENDED DISPOSE METHOD</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* Reason of Dispose */}
                            <td className="p-1.5 border-r border-black align-top space-y-1">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.reason_stolen ? '✓' : ''}
                                                </span>
                                                Stolen
                                            </td>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.reason_obsolete ? '✓' : ''}
                                                </span>
                                                Obsolete
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.reason_damaged ? '✓' : ''}
                                                </span>
                                                Damaged
                                            </td>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.reason_missing ? '✓' : ''}
                                                </span>
                                                Missing
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="mt-1">
                                    Other (specify) : <strong>{!isBlank ? (results.reason_other || '........................') : '........................'}</strong>
                                </div>
                                <div>
                                    Impairment (Specify) : <strong>{!isBlank ? (results.impairment_specify || '........................') : '........................'}</strong>
                                </div>
                            </td>

                            {/* Transferring Division */}
                            <td className="p-1.5 border-r border-black align-top">
                                <table className="w-full border-collapse text-[6.5pt] mb-1">
                                    <tbody>
                                        <tr>
                                            <td className="w-16">Name</td>
                                            <td>: <strong>{!isBlank ? (results.transfer_name || '........................................') : '........................................'}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Division</td>
                                            <td>: <strong>{!isBlank ? (results.transfer_division || 'Plant Department') : 'Plant Department'}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Date</td>
                                            <td>: <strong>{!isBlank && form?.date ? new Date(form.date).toLocaleDateString('id-ID') : '........................................'}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="w-full border-collapse border border-black text-[6pt]">
                                    <tbody>
                                        <tr className="bg-slate-50 border-b border-black text-center font-bold">
                                            <td colSpan="2" className="p-0.5">Signature</td>
                                        </tr>
                                        <tr className="border-b border-black text-center font-semibold">
                                            <td className="w-1/2 p-0.5 border-r border-black">Inspector</td>
                                            <td className="w-1/2 p-0.5">Dept. Head Rebuild</td>
                                        </tr>
                                        <tr className="h-8">
                                            <td className="p-0.5 border-r border-black text-center align-bottom font-bold">
                                                {!isBlank ? (results.inspector_name || form?.mechanic_name || '') : ''}
                                            </td>
                                            <td className="p-0.5 text-center align-bottom font-bold">
                                                {!isBlank ? (results.dept_head_rebuild || form?.supervisor_name || '') : ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>

                            {/* Recommended Method */}
                            <td className="p-1.5 align-top space-y-1">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_auction ? '✓' : ''}
                                                </span>
                                                Auction
                                            </td>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_tender ? '✓' : ''}
                                                </span>
                                                Tender
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_traded ? '✓' : ''}
                                                </span>
                                                Traded
                                            </td>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_missing ? '✓' : ''}
                                                </span>
                                                Missing
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_donated ? '✓' : ''}
                                                </span>
                                                Donated
                                            </td>
                                            <td className="p-0.5">
                                                <span className="inline-block w-3 h-3 border border-black text-center font-bold mr-1 leading-3 text-[6pt]">
                                                    {!isBlank && results.method_destroyed ? '✓' : ''}
                                                </span>
                                                Destroyed
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="mt-1">
                                    Others : <strong>{!isBlank ? (results.method_others || '........................') : '........................'}</strong>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Main Asset Table */}
                <table className="w-full border-collapse border-[1.5px] border-black text-[6.5pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th className="border-r border-black p-1 w-14 text-center font-bold">Type unit</th>
                            <th className="border-r border-black p-1 text-left font-bold w-40">Description of<br/>component/asset</th>
                            <th className="border-r border-black p-1 text-center font-bold w-20">Manufacture</th>
                            <th className="border-r border-black p-1 text-center font-bold w-24">Serial number</th>
                            <th className="border-r border-black p-1 text-center font-bold w-24">Part Number</th>
                            <th className="border-r border-black p-1 text-center font-bold w-8">QTY</th>
                            <th className="border-r border-black p-1 text-center font-bold w-16">Condition</th>
                            <th className="border-r border-black p-1 text-center font-bold w-14">Status</th>
                            <th className="p-1 text-left font-bold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-300">
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.type_unit : ''}</td>
                                <td className="border-r border-slate-300 p-1">{!isBlank ? item.description : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.manufacture : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.serial_number : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.part_number : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.qty : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.condition : ''}</td>
                                <td className="border-r border-slate-300 p-1 text-center">{!isBlank ? item.status : ''}</td>
                                <td className="p-1">{!isBlank ? item.remarks : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Approval Lines Table */}
                <table className="w-full border-collapse border-[1.5px] border-black text-[6.5pt] mb-1">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th colSpan="3" className="p-1 text-center font-bold uppercase tracking-wider">APPROVAL LINES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-slate-50 font-bold border-b border-black">
                            <td colSpan="3" className="p-1">PLANT DEPARTMENT</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 w-1/4 border-r border-slate-300">Superintendent</td>
                            <td className="p-1 w-1/2 border-r border-slate-300 font-bold">{!isBlank ? results.approval_superintendent : ''}</td>
                            <td className="p-1 w-1/4">Date : {!isBlank ? results.approval_superintendent_date : ''}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 border-r border-slate-300">Plant Manager</td>
                            <td className="p-1 border-r border-slate-300 font-bold">{!isBlank ? results.approval_plant_manager : ''}</td>
                            <td className="p-1">Date : {!isBlank ? results.approval_plant_manager_date : ''}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-slate-300">Project Manager</td>
                            <td className="p-1 border-r border-slate-300 font-bold">{!isBlank ? results.approval_project_manager : ''}</td>
                            <td className="p-1">Date : {!isBlank ? results.approval_project_manager_date : ''}</td>
                        </tr>

                        <tr className="bg-slate-50 font-bold border-b border-black">
                            <td colSpan="3" className="p-1">LOGISTIC DEPARTMENT</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                            <td className="p-1 border-r border-slate-300">Department Head</td>
                            <td className="p-1 border-r border-slate-300 font-bold">{!isBlank ? results.approval_logistic_dept_head : ''}</td>
                            <td className="p-1">Date : {!isBlank ? results.approval_logistic_dept_head_date : ''}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-slate-300">Manager</td>
                            <td className="p-1 border-r border-slate-300 font-bold">{!isBlank ? results.approval_logistic_manager : ''}</td>
                            <td className="p-1">Date : {!isBlank ? results.approval_logistic_manager_date : ''}</td>
                        </tr>

                        <tr className="border-b border-slate-300 font-bold">
                            <td className="p-1 border-r border-slate-300">General Manager</td>
                            <td className="p-1 border-r border-slate-300">{!isBlank ? results.approval_general_manager : ''}</td>
                            <td className="p-1 font-normal">Date : {!isBlank ? results.approval_general_manager_date : ''}</td>
                        </tr>
                        <tr>
                            <td className="p-1 border-r border-slate-300 font-bold">President Director</td>
                            <td className="p-1 border-r border-slate-300 font-bold">{!isBlank ? results.approval_president_director : ''}</td>
                            <td className="p-1">Date : {!isBlank ? results.approval_president_director_date : ''}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Photo Evidence Table */}
                <table className="w-full border-collapse border-[1.5px] border-black text-[6.5pt]">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black">
                            <th colSpan="3" className="p-1 text-left font-bold">PHOTO OF DISPOSE COMPONENT/ASSET (*colour)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="w-1/3 p-1 border-r border-slate-300 text-center align-middle h-24">
                                {!isBlank && results.photo_front ? (
                                    <img src={results.photo_front} alt="Depan" className="max-h-20 mx-auto object-contain" />
                                ) : (
                                    <div className="h-20 border border-dashed border-slate-400 flex items-center justify-center text-slate-500 italic text-[6pt]">
                                        *photo posisi depan
                                    </div>
                                )}
                            </td>
                            <td className="w-1/3 p-1 border-r border-slate-300 text-center align-middle h-24">
                                {!isBlank && results.photo_back ? (
                                    <img src={results.photo_back} alt="Belakang" className="max-h-20 mx-auto object-contain" />
                                ) : (
                                    <div className="h-20 border border-dashed border-slate-400 flex items-center justify-center text-slate-500 italic text-[6pt]">
                                        *photo posisi belakang
                                    </div>
                                )}
                            </td>
                            <td className="w-1/3 p-1 text-center align-middle h-24">
                                {!isBlank && results.photo_side_1 ? (
                                    <img src={results.photo_side_1} alt="Samping 1" className="max-h-20 mx-auto object-contain" />
                                ) : (
                                    <div className="h-20 border border-dashed border-slate-400 flex items-center justify-center text-slate-500 italic text-[6pt]">
                                        *photo posisi samping
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr className="border-t border-slate-300">
                            <td className="p-1 border-r border-slate-300 text-center align-middle h-24">
                                {!isBlank && results.photo_side_2 ? (
                                    <img src={results.photo_side_2} alt="Samping 2" className="max-h-20 mx-auto object-contain" />
                                ) : (
                                    <div className="h-20 border border-dashed border-slate-400 flex items-center justify-center text-slate-500 italic text-[6pt]">
                                        *photo posisi samping
                                    </div>
                                )}
                            </td>
                            <td colSpan="2" className="p-2 align-middle text-left text-[6pt] text-slate-700">
                                <div><strong>Panduan Dokumentasi Foto:</strong></div>
                                <div>• Lampirkan foto kondisi aktual aset yang diajukan dispose dari 4 sudut pandang.</div>
                                <div>• Pastikan pelat identitas, nomor part, atau nomor seri terbaca jelas pada salah satu foto.</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Ref */}
                <div className="text-right text-[5.5pt] italic text-slate-600 mt-1">
                    FRM11-001A/KAI/PLT/2023 Rev 03
                </div>

            </div>
        </div>
    );
}
