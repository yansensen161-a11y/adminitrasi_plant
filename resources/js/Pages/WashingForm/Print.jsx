import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function Print({
    form = null,
    isBlank = false,
    defaultItems = [],
    preselectedUnit = null,
}) {
    const unit = form?.unit || preselectedUnit;
    const results = form?.results_data || {};
    const items = form?.items || defaultItems;

    const secA = items.filter(it => (it.section || '').startsWith('A.'));
    const secB = items.filter(it => (it.section || '').startsWith('B.'));
    const secC = items.filter(it => (it.section || '').startsWith('C.'));

    const findings = Array.isArray(results.findings) ? [...results.findings] : [];
    while (findings.length < 5) {
        findings.push({ deskripsi: '', lokasi: '', tindakan: '', no_wo_pr: '', pic_target: '' });
    }

    const finalStatus = results.final_status || 'SELESAI / BERSIH';
    const formNo = form?.form_number || (isBlank ? 'PLT/FRM/WASH/______' : 'PLT/FRM/WASH/001');
    const dateFormatted = form?.date ? new Date(form.date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 print:py-0 print:bg-white text-black text-xs font-sans">
            <Head title={`Print - ${formNo}`} />

            {/* Print Control Bar (Hidden on Print) */}
            <div className="max-w-[210mm] mx-auto mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                    <span className="text-slate-400">|</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                        {isBlank ? 'Formulir Kosong Siap Cetak' : `Cetak Form: ${formNo}`}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
                    >
                        <Printer className="w-4 h-4" />
                        Cetak Sekarang (Ctrl + P)
                    </button>
                </div>
            </div>

            {/* ─── PRINT SHEET CONTAINER (A4 Portrait) ─── */}
            <div className="w-[210mm] mx-auto bg-white p-6 rounded shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0">
                <style dangerouslySetInnerHTML={{ __html: `
                    @page {
                        size: A4 portrait;
                        margin: 8mm 10mm;
                    }
                    @media print {
                        body, table, td, th, div, span, p {
                            background-color: #fff !important;
                            color: #000 !important;
                            font-size: 8pt !important;
                            font-family: 'DejaVu Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                        }
                        .page-break {
                            page-break-before: always;
                            break-before: page;
                        }
                        .print\\:hidden { display: none !important; }
                    }
                `}} />

                {/* ════════════════════ PAGE 1 ════════════════════ */}
                <div>
                    {/* Header */}
                    <div className="text-center mb-2 relative">
                        <h1 className="text-sm font-black tracking-wide uppercase">FORM WASHING UNIT TAMBANG</h1>
                        <p className="text-[9px] font-bold text-slate-600 tracking-wider">MAINTENANCE PLANT | HEAVY EQUIPMENT CLEANING CHECK SHEET</p>
                        <div className="absolute right-0 top-0 text-[8px] font-mono font-bold text-slate-700">
                            {formNo}
                        </div>
                    </div>

                    {/* Metadata Table */}
                    <table className="w-full text-[8.5px] border border-slate-600 border-collapse mb-2">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="w-[16%] font-bold px-2 py-0.5 bg-slate-50">Kode Unit</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[32%] px-2 py-0.5 font-bold">{unit?.code_unit || (isBlank ? '__________________________' : '-')}</td>
                                <td className="w-[16%] font-bold px-2 py-0.5 bg-slate-50">Tanggal</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[32%] px-2 py-0.5">{dateFormatted}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Jenis Unit</td>
                                <td>:</td>
                                <td className="px-2 py-0.5">{unit?.model || (isBlank ? '__________________________' : '-')}</td>
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Lokasi Washing</td>
                                <td>:</td>
                                <td className="px-2 py-0.5">{results.washing_location || (isBlank ? '__________________________' : '-')}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-0.5 bg-slate-50">HM / KM</td>
                                <td>:</td>
                                <td className="px-2 py-0.5 font-bold">{form?.smu ? `${form.smu} HM` : (unit?.current_hm ? `${unit.current_hm} HM` : (isBlank ? '__________________________' : '-'))}</td>
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Shift</td>
                                <td>:</td>
                                <td className="px-2 py-0.5 font-bold">{form?.shift === 'NS' ? 'NS (Malam)' : 'DS (Siang)'}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Nama Petugas</td>
                                <td>:</td>
                                <td className="px-2 py-0.5">{results.petugas_name || form?.mechanic_name || (isBlank ? '__________________________' : '-')}</td>
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Jam Selesai</td>
                                <td>:</td>
                                <td className="px-2 py-0.5">{results.end_time || (isBlank ? '__________________________' : '-')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Jam Mulai</td>
                                <td>:</td>
                                <td className="px-2 py-0.5">{results.start_time || (isBlank ? '__________________________' : '-')}</td>
                                <td className="font-bold px-2 py-0.5 bg-slate-50">Durasi Washing</td>
                                <td>:</td>
                                <td className="px-2 py-0.5 font-bold">
                                    {results.duration_hours !== undefined ? `${results.duration_hours} Jam ${results.duration_minutes || 0} Menit` : (isBlank ? '______ Jam ______ Menit' : '-')}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-[8px] italic font-bold text-slate-700 mb-1">
                        PETUNJUK: Beri tanda centang pada YA / TIDAK / N/A. Catat temuan pada kolom keterangan.
                    </div>

                    {/* Section A & Section B Table */}
                    <table className="w-full text-[8.5px] border border-slate-800 border-collapse mb-2">
                        <thead className="bg-slate-200 border-b border-slate-800">
                            <tr>
                                <th className="border border-slate-700 py-1 px-1 text-center w-8">NO</th>
                                <th className="border border-slate-700 py-1 px-2 text-left">ITEM PEMERIKSAAN / PEKERJAAN</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">YA</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">TIDAK</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">N/A</th>
                                <th className="border border-slate-700 py-1 px-2 text-left w-56">KETERANGAN / TEMUAN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Section A Header */}
                            <tr>
                                <td colSpan="6" className="border border-slate-800 bg-slate-300 py-1 px-2 font-bold uppercase">
                                    A. PEMERIKSAAN SEBELUM WASHING
                                </td>
                            </tr>
                            {secA.map((it) => {
                                const st = (it.status || '').toUpperCase();
                                return (
                                    <tr key={it.id} className="border-b border-slate-300">
                                        <td className="border border-slate-400 py-0.5 text-center font-bold">{it.item_no}</td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.task}</td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'YA' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'TIDAK' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'NA' || st === 'N/A' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.keterangan || ''}</td>
                                    </tr>
                                );
                            })}

                            {/* Section B Header */}
                            <tr>
                                <td colSpan="6" className="border border-slate-800 bg-slate-300 py-1 px-2 font-bold uppercase">
                                    B. PELAKSANAAN WASHING
                                </td>
                            </tr>
                            {secB.map((it) => {
                                const st = (it.status || '').toUpperCase();
                                return (
                                    <tr key={it.id} className="border-b border-slate-300">
                                        <td className="border border-slate-400 py-0.5 text-center font-bold">{it.item_no}</td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.task}</td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'YA' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'TIDAK' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'NA' || st === 'N/A' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.keterangan || ''}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-between text-[7.5px] text-slate-500 mt-1">
                        <span>Form No: {formNo}</span>
                        <span>Halaman 1</span>
                    </div>
                </div>

                {/* ════════════════════ PAGE BREAK ════════════════════ */}
                <div className="page-break my-6 print:my-0"></div>

                {/* ════════════════════ PAGE 2 ════════════════════ */}
                <div>
                    {/* Header */}
                    <div className="text-center mb-2">
                        <h2 className="text-xs font-black tracking-wide uppercase">FORM WASHING UNIT TAMBANG (LANJUTAN)</h2>
                        <p className="text-[8.5px] text-slate-600 font-bold">
                            UNIT: <span className="font-mono text-black">{unit?.code_unit || '-'}</span> | TANGGAL: {dateFormatted} | SHIFT: {form?.shift || 'DS'}
                        </p>
                    </div>

                    {/* Section C Table */}
                    <table className="w-full text-[8.5px] border border-slate-800 border-collapse mb-2">
                        <thead className="bg-slate-200 border-b border-slate-800">
                            <tr>
                                <th className="border border-slate-700 py-1 px-1 text-center w-8">NO</th>
                                <th className="border border-slate-700 py-1 px-2 text-left">ITEM PEMERIKSAAN / PEKERJAAN</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">YA</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">TIDAK</th>
                                <th className="border border-slate-700 py-1 px-1 text-center w-10">N/A</th>
                                <th className="border border-slate-700 py-1 px-2 text-left w-56">KETERANGAN / TEMUAN</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="6" className="border border-slate-800 bg-slate-300 py-1 px-2 font-bold uppercase">
                                    C. INSPEKSI SETELAH WASHING
                                </td>
                            </tr>
                            {secC.map((it) => {
                                const st = (it.status || '').toUpperCase();
                                return (
                                    <tr key={it.id} className="border-b border-slate-300">
                                        <td className="border border-slate-400 py-0.5 text-center font-bold">{it.item_no}</td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.task}</td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'YA' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'TIDAK' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 text-center">
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                                                {st === 'NA' || st === 'N/A' ? '✓' : ''}
                                            </span>
                                        </td>
                                        <td className="border border-slate-400 py-0.5 px-2">{it.keterangan || ''}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Section D: Temuan / Tindak Lanjut */}
                    <div className="text-[8.5px] font-bold uppercase mb-1">
                        D. TEMUAN / TINDAK LANJUT
                    </div>
                    <table className="w-full text-[8px] border border-slate-800 border-collapse mb-2">
                        <thead className="bg-slate-200 border-b border-slate-800">
                            <tr>
                                <th className="border border-slate-600 py-1 px-1 text-center w-8">NO</th>
                                <th className="border border-slate-600 py-1 px-2 text-left w-1/4">DESKRIPSI TEMUAN</th>
                                <th className="border border-slate-600 py-1 px-2 text-left w-1/5">LOKASI / KOMPONEN</th>
                                <th className="border border-slate-600 py-1 px-2 text-left w-1/5">TINDAKAN</th>
                                <th className="border border-slate-600 py-1 px-2 text-left w-1/6">NO. WO / PR TINDAK LANJUT</th>
                                <th className="border border-slate-600 py-1 px-2 text-left w-1/6">PIC / TARGET</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findings.slice(0, 5).map((f, idx) => (
                                <tr key={idx} className="border-b border-slate-300">
                                    <td className="border border-slate-400 py-1 text-center font-bold">{idx + 1}</td>
                                    <td className="border border-slate-400 py-1 px-2">{f.deskripsi || ''}</td>
                                    <td className="border border-slate-400 py-1 px-2">{f.lokasi || ''}</td>
                                    <td className="border border-slate-400 py-1 px-2">{f.tindakan || ''}</td>
                                    <td className="border border-slate-400 py-1 px-2">{f.no_wo_pr || ''}</td>
                                    <td className="border border-slate-400 py-1 px-2">{f.pic_target || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Status Akhir */}
                    <div className="border border-slate-800 p-2 mb-2 flex items-center gap-6 text-[8.5px] font-bold">
                        <span>STATUS AKHIR:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold">
                                {finalStatus === 'SELESAI / BERSIH' ? '✓' : ''}
                            </span>
                            <span>SELESAI / BERSIH</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold">
                                {finalStatus === 'PERLU WASHING ULANG' ? '✓' : ''}
                            </span>
                            <span>PERLU WASHING ULANG</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold">
                                {finalStatus === 'PERLU TINDAK LANJUT' ? '✓' : ''}
                            </span>
                            <span>PERLU TINDAK LANJUT</span>
                        </div>
                    </div>

                    {/* Signatures Table */}
                    <table className="w-full text-[8.5px] border border-slate-800 border-collapse mb-2">
                        <tbody>
                            <tr>
                                <td className="w-1/3 border border-slate-800 p-2.5 align-top">
                                    <div className="mb-8">Dikerjakan oleh</div>
                                    <div className="font-bold underline">{results.dikerjakan_oleh || results.petugas_name || (isBlank ? '( Nama / TTD )' : '-')}</div>
                                    <div className="text-[7.5px] text-slate-500">Washingman / Petugas</div>
                                </td>
                                <td className="w-1/3 border border-slate-800 p-2.5 align-top">
                                    <div className="mb-8">Diperiksa oleh</div>
                                    <div className="font-bold underline">{results.diperiksa_oleh || form?.supervisor_name || (isBlank ? '( Nama / TTD )' : '-')}</div>
                                    <div className="text-[7.5px] text-slate-500">Inspector / Foreman</div>
                                </td>
                                <td className="w-1/3 border border-slate-800 p-2.5 align-top">
                                    <div className="mb-8">Diserahkan kepada</div>
                                    <div className="font-bold underline">{results.diserahkan_kepada || (isBlank ? '( Nama / TTD )' : '-')}</div>
                                    <div className="text-[7.5px] text-slate-500">Mekanik / User Plant</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Safety SOP Note */}
                    <div className="text-[7.5px] italic text-slate-600 border-t border-slate-400 pt-1">
                        <strong>CATATAN:</strong> Ikuti SOP site dan manual OEM; hindari semprotan bertekanan tinggi ke konektor listrik, intake, breather, dan seal.
                    </div>

                    <div className="flex justify-between text-[7.5px] text-slate-500 mt-2">
                        <span>Form No: {formNo}</span>
                        <span>Halaman 2</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
