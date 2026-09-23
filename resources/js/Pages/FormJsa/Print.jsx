import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({
    form = null,
    preset = {},
    isBlank = false,
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

    const results = form?.results_data || preset || {};
    const steps = isBlank ? (preset.steps || []) : (form?.items || preset.steps || []);
    const unit = form?.unit || preselectedUnit;

    const taskName = results.task_name || form?.service_type || preset.task_name || 'JOB SAFETY ANALYSIS';
    const department = results.department || preset.department || 'PLANT';
    const toolsNeeded = results.tools_needed || preset.tools_needed || '';
    const apdNeeded = results.apd_needed || preset.apd_needed || '';
    const workers = results.workers || preset.workers || {};
    const attendees = results.attendees || preset.attendees || [];
    const knownByMam = results.known_by_mam || preset.known_by_mam || 'Ambo Mai (Superintendent Plant)';
    const approvedByBbe = results.approved_by_bbe || preset.approved_by_bbe || 'Subani (PJO)';
    const formNumber = form?.form_number || (isBlank ? 'BLANK-JSA' : 'JSA/MAM-HSE/2026/001');
    const dateFormatted = form?.date
        ? new Date(form.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : (isBlank ? '.............................' : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

    return (
        <div className="bg-white text-black min-h-screen p-0 sm:p-6 print:p-0 font-sans">
            <Head title={`JSA - ${taskName} - ${formNumber}`} />

            {/* Print toolbar */}
            <div className="max-w-[297mm] mx-auto mb-4 p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-slate-700">
                    Mode Pratinjau Cetak Dokumen JSEA (A4 Landscape - MAM-HSE-FORM-028)
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm flex items-center gap-1.5"
                    >
                        <span>🖨️</span> Cetak / Print Sekarang
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

            {/* A4 Landscape Document Container */}
            <div className="max-w-[297mm] mx-auto bg-white border border-black print:border-none p-6 print:p-0 text-[8.5pt] leading-tight">
                
                {/* 1. Header Box */}
                <table className="w-full border-collapse border-2 border-black text-center mb-0">
                    <tbody>
                        <tr>
                            <td className="w-1/4 border-2 border-black p-2 font-black text-rose-700 text-[10pt] uppercase">
                                ▲▲ PT MITRA ABADI MAHAKAM
                            </td>
                            <td className="w-2/4 border-2 border-black p-2 font-bold text-[9.5pt]">
                                STANDARD FORM<br />
                                PT MTRA ABADI MAHAKAM
                            </td>
                            <td className="w-1/4 border-2 border-black p-2 font-bold text-[9pt]">
                                No Form<br />
                                <span className="font-mono text-[8.5pt]">MAM-HSE-FORM-028</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Banner Title */}
                <div className="border-x-2 border-b-2 border-black text-center py-1.5 font-black text-[11pt] tracking-wider uppercase bg-white">
                    FORM JOB SAFETY ENVIROMENTAL ANALYSIS (JSEA)
                </div>

                {/* 2. Upper Meta Info Table */}
                <table className="w-full border-collapse border-x-2 border-b-2 border-black text-left text-[8pt] mb-2">
                    <tbody>
                        <tr>
                            <td className="w-[18%] border border-black p-1.5 font-bold">Tugas pekerjaan</td>
                            <td className="w-[32%] border border-black p-1.5 font-black text-[8.5pt] uppercase text-slate-900">
                                {taskName}
                            </td>
                            <td className="w-[25%] border border-black p-1.5 font-bold bg-slate-50">
                                Peralatan yang diperlukan
                            </td>
                            <td className="w-[25%] border border-black p-1.5 font-bold bg-slate-50">
                                APD yang diperlukan
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold">Departemen / Divisi</td>
                            <td className="border border-black p-1.5 font-semibold">{department}</td>
                            <td rowSpan={3} className="border border-black p-1.5 align-top whitespace-pre-line font-mono text-[7.5pt]">
                                {toolsNeeded || '-'}
                            </td>
                            <td rowSpan={3} className="border border-black p-1.5 align-top whitespace-pre-line font-mono text-[7.5pt]">
                                {apdNeeded || '-'}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold">Tanggal</td>
                            <td className="border border-black p-1.5">
                                {dateFormatted}
                                {unit && <span className="ml-2 font-bold">({unit.unit_code})</span>}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold align-top">
                                Nama orang yangbekerja
                            </td>
                            <td className="border border-black p-1 align-top">
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7.5pt]">
                                    <div className="flex">
                                        <span className="w-4 font-bold">1.</span>
                                        <span className="border-b border-dotted border-black flex-1 min-h-[14px]">
                                            {workers['1'] || ''}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-4 font-bold">3.</span>
                                        <span className="border-b border-dotted border-black flex-1 min-h-[14px]">
                                            {workers['3'] || ''}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-4 font-bold">2.</span>
                                        <span className="border-b border-dotted border-black flex-1 min-h-[14px]">
                                            {workers['2'] || ''}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-4 font-bold">4.</span>
                                        <span className="border-b border-dotted border-black flex-1 min-h-[14px]">
                                            {workers['4'] || ''}
                                        </span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 3. Main Steps Analysis Table */}
                <table className="w-full border-collapse border-2 border-black text-left text-[7.8pt] mb-2">
                    <thead>
                        <tr className="bg-slate-50 text-center font-bold">
                            <th className="w-[4%] border border-black p-1.5">NO</th>
                            <th className="w-[26%] border border-black p-1.5">
                                Urutan kerja yang mendasar
                                <span className="block font-normal italic text-[6.5pt] text-slate-700 mt-0.5">
                                    Pecah pekerjaan dalam beberapa langkah tiap langkah nya harus mengakomodasi pekerjaan itu dan masuk akal
                                </span>
                            </th>
                            <th className="w-[32%] border border-black p-1.5">
                                Kondisi bahaya yang potensial
                                <span className="block font-normal italic text-[6.5pt] text-slate-700 mt-0.5">
                                    Identifikasi bahaya pada tiap langkah,untuk mengetahui potensi bahaya yang dapat berakibat kecelakaan
                                </span>
                            </th>
                            <th className="w-[30%] border border-black p-1.5">
                                Tindakan atau procedure yang direkomendasikan
                                <span className="block font-normal italic text-[6.5pt] text-slate-700 mt-0.5">
                                    Gunakan dua kolom pertama sebagai panduan,tentukan tindakan apa yang diperlukan untuk menghilangkan atau mengurangi bahaya yang dapat berakibat kecelakaan,cidera atau penyakit akibat kerja
                                </span>
                            </th>
                            <th className="w-[8%] border border-black p-1.5">
                                Oleh siapa
                                <span className="block font-normal italic text-[6.5pt] text-slate-700 mt-0.5">
                                    Orang yang bertanggung jawab dalam melaksnakan dalam setiap pekerjaan
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {steps.map((step, idx) => (
                            <tr key={idx} className="border-b border-black">
                                <td className="border border-black p-1.5 text-center font-bold align-top">
                                    {step.no || idx + 1}
                                </td>
                                <td className="border border-black p-1.5 font-bold align-top">
                                    {step.step}
                                </td>
                                <td className="border border-black p-1.5 whitespace-pre-line align-top leading-snug">
                                    {step.hazards || '-'}
                                </td>
                                <td className="border border-black p-1.5 whitespace-pre-line align-top leading-snug">
                                    {step.controls || '-'}
                                </td>
                                <td className="border border-black p-1.5 text-center align-top font-semibold">
                                    {step.pic || 'Mekanik'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 4. Section 2: Daftar Hadir & Signatures */}
                <div className="mt-2 text-[8pt]">
                    <div className="font-bold mb-1">2. Daftar Hadir :</div>
                    <table className="w-full border-collapse border-2 border-black text-left">
                        <thead>
                            <tr className="bg-slate-50 text-center font-bold">
                                <th className="w-[5%] border border-black p-1">NO</th>
                                <th className="w-[28%] border border-black p-1">NAMA</th>
                                <th className="w-[20%] border border-black p-1">DEPT/POSISI</th>
                                <th className="w-[17%] border border-black p-1">TANDA TANGAN</th>
                                <th className="w-[15%] border border-black p-1 text-center">
                                    DIKETAHUI OLEH<br />PIHAK PT.MAM
                                </th>
                                <th className="w-[15%] border border-black p-1 text-center">
                                    DISETUJUI OLEH<br />PIHAK PT.BBE
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1, 2, 3].map((rowIdx) => {
                                const att = attendees[rowIdx] || { no: rowIdx + 1, name: '', dept_position: '' };
                                return (
                                    <tr key={rowIdx}>
                                        <td className="border border-black p-1 text-center font-bold">{att.no || rowIdx + 1}</td>
                                        <td className="border border-black p-1">{att.name || ''}</td>
                                        <td className="border border-black p-1">{att.dept_position || (rowIdx === 0 ? 'PLANT / MEKANIK' : '')}</td>
                                        <td className="border border-black p-1 h-7">{att.signature || ''}</td>

                                        {rowIdx === 0 && (
                                            <>
                                                <td rowSpan={4} className="border border-black p-2 text-center align-top">
                                                    <div className="font-bold text-[7pt] text-slate-700 mb-6">
                                                        Superintendent / Safety
                                                    </div>
                                                    <div className="font-bold underline text-[7.5pt]">
                                                        {knownByMam}
                                                    </div>
                                                    <div className="text-[6.5pt] text-slate-600">PT Mitra Abadi Mahakam</div>
                                                </td>
                                                <td rowSpan={4} className="border border-black p-2 text-center align-top">
                                                    <div className="font-bold text-[7pt] text-slate-700 mb-6">
                                                        PJO / Safety BBE
                                                    </div>
                                                    <div className="font-bold underline text-[7.5pt]">
                                                        {approvedByBbe}
                                                    </div>
                                                    <div className="text-[6.5pt] text-slate-600">PT BBE Site</div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Print Specific CSS */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 6mm 8mm;
                    }
                    body {
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
