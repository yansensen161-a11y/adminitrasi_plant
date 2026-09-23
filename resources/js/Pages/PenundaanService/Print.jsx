import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function Print({
    form = null,
    isBlank = false,
    alasanOptions = [],
    defaultApprovals = [],
    preselectedUnit = null,
}) {
    useEffect(() => {
        // Auto trigger print dialog if desired
    }, []);

    const unit = form?.unit || preselectedUnit;
    const results = form?.results_data || {};
    const identitas = results.identitas || {};
    const detail = results.detail_penundaan || {};
    const mitigasi = results.mitigasi_risiko || {};
    const approvals = results.approvals || defaultApprovals;
    const reasons = form?.items || [];
    const alasanLainnya = results.alasan_lainnya || '';

    const formNo = form?.form_number || (isBlank ? 'PLT/FRM/PND/______' : 'PLT/FRM/PND/001');
    const dateFormatted = form?.date ? new Date(form.date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 print:py-0 print:bg-white text-black text-xs font-sans">
            <Head title={`Print - ${formNo}`} />

            {/* Print Control Bar (Hidden on Print) */}
            <div className="max-w-[280mm] mx-auto mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
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

            {/* ─── PRINT SHEET CONTAINER (A4 Landscape) ─── */}
            <div className="w-[280mm] mx-auto bg-white p-6 rounded shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0">
                <style dangerouslySetInnerHTML={{ __html: `
                    @page {
                        size: A4 landscape;
                        margin: 7mm 8mm;
                    }
                    @media print {
                        body, table, td, th, div, span, p {
                            background-color: #fff !important;
                            color: #000 !important;
                            font-size: 8pt !important;
                            font-family: 'DejaVu Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                        }
                        .print\\:hidden { display: none !important; }
                    }
                `}} />

                {/* Header Title */}
                <div className="text-center relative mb-2">
                    <h1 className="text-base font-black tracking-wide uppercase">FORM PENUNDAAN SERVICE UNIT TAMBANG</h1>
                    <p className="text-[10px] font-bold text-slate-600 tracking-wider">SERVICE POSTPONEMENT FORM | MAINTENANCE PLANT</p>
                    <div className="absolute right-0 top-0 border border-slate-600 px-2 py-0.5 text-[9px] font-mono font-bold">
                        No. Form: {formNo}
                    </div>
                </div>

                {/* 01 IDENTITAS UNIT */}
                <div className="border border-slate-700 mb-2">
                    <div className="bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b border-slate-700">
                        01 IDENTITAS UNIT
                    </div>
                    <table className="w-full text-[9px] border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="w-[18%] font-bold px-2 py-1 bg-slate-50">Tanggal Pengajuan</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[30%] px-2 py-1">{dateFormatted}</td>
                                <td className="w-[18%] font-bold px-2 py-1 bg-slate-50">Kode Unit</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[30%] px-2 py-1 font-bold">{unit?.code_unit || (isBlank ? '__________________' : '-')}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-1 bg-slate-50">Jenis / Model Unit</td>
                                <td>:</td>
                                <td className="px-2 py-1">{unit?.model || identitas.jenis_model || (isBlank ? '__________________' : '-')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Lokasi Unit</td>
                                <td>:</td>
                                <td className="px-2 py-1">{unit?.lokasi || identitas.lokasi_unit || (isBlank ? '__________________' : '-')}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-1 bg-slate-50">HM Aktual</td>
                                <td>:</td>
                                <td className="px-2 py-1 font-bold">{form?.smu ? `${form.smu} HM` : (unit?.current_hm ? `${unit.current_hm} HM` : (isBlank ? '__________________' : '-'))}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Jenis Service</td>
                                <td>:</td>
                                <td className="px-2 py-1 font-bold">{form?.service_type || identitas.jenis_service || (isBlank ? '__________________' : 'PS 250')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold px-2 py-1 bg-slate-50">Interval Service (HM)</td>
                                <td>:</td>
                                <td className="px-2 py-1">{identitas.interval_service ? `${identitas.interval_service} HM` : (isBlank ? '__________________' : '250 HM')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Pengaju</td>
                                <td>:</td>
                                <td className="px-2 py-1">{form?.mechanic_name || identitas.pengaju || (isBlank ? '__________________' : '-')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 02 DETAIL PENUNDAAN SERVICE */}
                <div className="border border-slate-700 mb-2">
                    <div className="bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b border-slate-700">
                        02 DETAIL PENUNDAAN SERVICE
                    </div>
                    <table className="w-full text-[9px] border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="w-[18%] font-bold px-2 py-1 bg-slate-50">Tanggal Service Awal</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[30%] px-2 py-1">{detail.tgl_service_awal ? new Date(detail.tgl_service_awal).toLocaleDateString('id-ID') : (isBlank ? '__________________' : '-')}</td>
                                <td className="w-[18%] font-bold px-2 py-1 bg-slate-50">Tanggal Service Pengganti</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[30%] px-2 py-1">{detail.tgl_service_pengganti ? new Date(detail.tgl_service_pengganti).toLocaleDateString('id-ID') : (isBlank ? '__________________' : '-')}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-1 bg-slate-50">HM Rencana Service</td>
                                <td>:</td>
                                <td className="px-2 py-1">{detail.hm_rencana_service ? `${detail.hm_rencana_service} HM` : (isBlank ? '__________________' : '-')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Estimasi HM Pengganti</td>
                                <td>:</td>
                                <td className="px-2 py-1">{detail.estimasi_hm_pengganti ? `${detail.estimasi_hm_pengganti} HM` : (isBlank ? '__________________' : '-')}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="font-bold px-2 py-1 bg-slate-50">HM Saat Penundaan</td>
                                <td>:</td>
                                <td className="px-2 py-1">{detail.hm_saat_penundaan ? `${detail.hm_saat_penundaan} HM` : (isBlank ? '__________________' : '-')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Durasi Penundaan</td>
                                <td>:</td>
                                <td className="px-2 py-1 font-bold">{detail.durasi_penundaan ? `${detail.durasi_penundaan} Hari` : (isBlank ? '__________ Hari' : '0 Hari')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold px-2 py-1 bg-slate-50">Overdue Saat Penundaan</td>
                                <td>:</td>
                                <td className="px-2 py-1 font-bold">{detail.overdue_saat_penundaan ? `${detail.overdue_saat_penundaan} HM` : (isBlank ? '__________ HM' : '0 HM')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Proyeksi Overdue</td>
                                <td>:</td>
                                <td className="px-2 py-1 font-bold">{detail.proyeksi_overdue ? `${detail.proyeksi_overdue} HM` : (isBlank ? '__________ HM' : '0 HM')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 03 ALASAN PENUNDAAN */}
                <div className="border border-slate-700 mb-2">
                    <div className="bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b border-slate-700">
                        03 ALASAN PENUNDAAN
                    </div>
                    <div className="p-2 text-[9px]">
                        <div className="grid grid-cols-4 gap-y-1.5 gap-x-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Unit masih dibutuhkan untuk produksi') ? '✓' : ''}
                                </span>
                                <span>Unit masih dibutuhkan untuk produksi</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Spare part belum tersedia') ? '✓' : ''}
                                </span>
                                <span>Spare part belum tersedia</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Mekanik belum tersedia') ? '✓' : ''}
                                </span>
                                <span>Mekanik belum tersedia</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Service bay belum tersedia') ? '✓' : ''}
                                </span>
                                <span>Service bay belum tersedia</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Unit sulit dijangkau') ? '✓' : ''}
                                </span>
                                <span>Unit sulit dijangkau</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Kondisi cuaca') ? '✓' : ''}
                                </span>
                                <span>Kondisi cuaca</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Menunggu persetujuan Operations') ? '✓' : ''}
                                </span>
                                <span>Menunggu persetujuan Operations</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 inline-flex items-center justify-center font-bold text-[9px]">
                                    {reasons.includes('Lainnya') || alasanLainnya ? '✓' : ''}
                                </span>
                                <span>Lainnya: {alasanLainnya || (isBlank ? '__________' : '-')}</span>
                            </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-300">
                            <span className="font-bold">Keterangan / justifikasi: </span>
                            <span>{form?.notes || (isBlank ? '____________________________________________________________________________________________________________________' : '-')}</span>
                        </div>
                    </div>
                </div>

                {/* 04 MITIGASI RISIKO DAN TINDAK LANJUT */}
                <div className="border border-slate-700 mb-2">
                    <div className="bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b border-slate-700">
                        04 MITIGASI RISIKO DAN TINDAK LANJUT
                    </div>
                    <table className="w-full text-[9px] border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="w-[20%] font-bold px-2 py-1 bg-slate-50">Batas toleransi HM (OEM)</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[28%] px-2 py-1">{mitigasi.batas_toleransi_hm || (isBlank ? '__________________' : '-')}</td>
                                <td className="w-[20%] font-bold px-2 py-1 bg-slate-50">Pemeriksaan kondisi unit</td>
                                <td className="w-[2%]">:</td>
                                <td className="w-[28%] px-2 py-1">{mitigasi.pemeriksaan_kondisi || (isBlank ? '__________________' : '-')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold px-2 py-1 bg-slate-50">Rencana monitoring</td>
                                <td>:</td>
                                <td className="px-2 py-1">{mitigasi.rencana_monitoring || (isBlank ? '__________________' : '-')}</td>
                                <td className="font-bold px-2 py-1 bg-slate-50">Tindak lanjut / PIC</td>
                                <td>:</td>
                                <td className="px-2 py-1">{mitigasi.tindak_lanjut_pic || (isBlank ? '__________________' : '-')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 05 PERSETUJUAN */}
                <div className="border border-slate-700 mb-2">
                    <div className="bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b border-slate-700">
                        05 PERSETUJUAN
                    </div>
                    <table className="w-full text-[9px] border-collapse border border-slate-500">
                        <thead className="bg-slate-100 border-b border-slate-500">
                            <tr>
                                <th className="border border-slate-500 py-1 px-2 text-left w-[28%]">Jabatan</th>
                                <th className="border border-slate-500 py-1 px-2 text-left w-[22%]">Nama</th>
                                <th className="border border-slate-500 py-1 px-2 text-left w-[14%]">Tanggal</th>
                                <th className="border border-slate-500 py-1 px-2 text-center w-[16%]">Tanda Tangan</th>
                                <th className="border border-slate-500 py-1 px-2 text-left w-[20%]">Keputusan / Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                'Operations Supervisor / Superintendent',
                                'Maintenance Planner',
                                'Maintenance Supervisor',
                                'Maintenance Superintendent'
                            ].map((roleName, idx) => {
                                const appr = Array.isArray(approvals) ? approvals.find(a => a.jabatan === roleName) || approvals[idx] : null;
                                return (
                                    <tr key={idx} className="border-b border-slate-300">
                                        <td className="border border-slate-500 py-1.5 px-2 font-bold bg-slate-50">{roleName}</td>
                                        <td className="border border-slate-500 py-1.5 px-2">{appr?.nama || (isBlank ? '' : '-')}</td>
                                        <td className="border border-slate-500 py-1.5 px-2">{appr?.tanggal ? new Date(appr.tanggal).toLocaleDateString('id-ID') : (isBlank ? '' : '-')}</td>
                                        <td className="border border-slate-500 py-1.5 px-2 text-center h-8 align-bottom">
                                            {appr?.nama ? (
                                                <span className="text-[8px] text-slate-500">( Signed )</span>
                                            ) : (
                                                <span className="text-[8px] text-slate-400">( TTD )</span>
                                            )}
                                        </td>
                                        <td className="border border-slate-500 py-1.5 px-2">{appr?.keputusan || (isBlank ? '' : '-')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* SOP Note Footer */}
                <div className="text-[8px] italic text-slate-600 border-t border-slate-400 pt-1">
                    <strong>Catatan:</strong> Penundaan service wajib mengikuti batas toleransi HM, ketentuan OEM, kondisi unit, dan persetujuan yang berlaku.
                </div>

            </div>
        </div>
    );
}
