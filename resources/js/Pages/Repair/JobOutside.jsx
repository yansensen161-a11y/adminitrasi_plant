import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function JobOutside({ auth, data }) {
    
    return (
        <AuthenticatedLayout>
            <Head title="Job Outside Repair" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0b5c3e] p-2.5 rounded-lg text-white shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-[#0b132b] tracking-tight uppercase">JOB OUTSIDE REPAIR</h1>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Detail Work Order Outside Repair</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-[#0a4d3c] hidden sm:flex items-center gap-1">
                        <span>Home</span>
                        <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Job Outside Repair</span>
                        <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-bold text-gray-900">Detail Job</span>
                    </div>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6">
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    Kembali
                </button>
                <div className="flex items-center gap-3">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                        Print WO
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                        Export PDF
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-[#0a4d3c] font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit
                    </button>
                </div>
            </div>

            {/* Workflow Progress Bar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-4 flex items-center justify-between text-xs overflow-x-auto">
                {/* Step 1 */}
                <div className="flex items-center gap-3 shrink-0 mr-8">
                    <div className="w-10 h-10 rounded bg-[#0b5c3e] text-white flex items-center justify-center font-bold text-lg">01</div>
                    <div>
                        <div className="font-bold text-[#0b5c3e]">Open</div>
                        <div className="text-gray-500 text-[10px]">-</div>
                    </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>

                {/* Step 2 */}
                <div className="flex items-center gap-3 shrink-0 mx-8">
                    <div className="w-10 h-10 rounded bg-[#0b5c3e] text-white flex items-center justify-center font-bold text-lg">02</div>
                    <div>
                        <div className="font-bold text-[#0b5c3e]">In Process</div>
                        <div className="text-gray-500 text-[10px]">-</div>
                    </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>

                {/* Step 3 */}
                <div className="flex items-center gap-3 shrink-0 mx-8">
                    <div className="w-10 h-10 rounded bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg">03</div>
                    <div>
                        <div className="font-bold text-gray-500">Completed</div>
                        <div className="text-gray-400 text-[10px]">-</div>
                    </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>

                {/* Step 4 */}
                <div className="flex items-center gap-3 shrink-0 ml-8">
                    <div className="w-10 h-10 rounded bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg">04</div>
                    <div>
                        <div className="font-bold text-gray-500">Closed</div>
                        <div className="text-gray-400 text-[10px]">-</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                
                {/* Panel Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* INFORMASI WORK ORDER */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-[11px] font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">INFORMASI WORK ORDER</h3>
                        <div className="space-y-3 text-[11px] text-gray-600 font-medium">
                            <div className="flex items-center">
                                <span className="w-28">No. WO</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_work_order.no_wo}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Tanggal WO</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_work_order.tanggal_wo}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Tanggal Kerja</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_work_order.tanggal_kerja}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Tipe Pekerjaan</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span><span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase">{data.informasi_work_order.tipe_pekerjaan}</span></span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className="w-28">Status</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span><span className="bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded">{data.informasi_work_order.status}</span></span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className="w-28">Prioritas</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span><span className="bg-yellow-100 text-yellow-600 font-bold px-2 py-0.5 rounded">{data.informasi_work_order.prioritas}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI UNIT / EQUIPMENT */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-[11px] font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">INFORMASI UNIT / EQUIPMENT</h3>
                        <div className="space-y-3 text-[11px] text-gray-600 font-medium">
                            <div className="flex items-center">
                                <span className="w-28">Model / Make</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.model_make}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Serial No.</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.serial_no}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Kode Unit</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.kode_unit}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Nama Komponen</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.nama_komponen}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Kode Komponen</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.kode_komponen}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">S/N Komponen</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_unit.sn_komponen}</span>
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI PEKERJAAN */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-[11px] font-extrabold text-[#0b132b] uppercase tracking-wider mb-4">INFORMASI PEKERJAAN</h3>
                        <div className="space-y-3 text-[11px] text-gray-600 font-medium">
                            <div className="flex items-center">
                                <span className="w-28">PTC / Vendor</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_pekerjaan.ptc_vendor}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Lokasi</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_pekerjaan.lokasi}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Tanggal Kerusakan</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_pekerjaan.tanggal_kerusakan}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Dilaporkan Oleh</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_pekerjaan.dilaporkan_oleh}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Approved By</span>
                                <span className="text-gray-900 mr-2">:</span>
                                <span className="font-bold text-gray-900">{data.informasi_pekerjaan.approved_by}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: Prob Desc & Job Inst */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <div className="mb-6">
                            <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-3">PROBLEM DESCRIPTION</h3>
                            <div className="font-bold text-[11px] text-[#0b132b] uppercase">{data.problem_description}</div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-3">JOB INSTRUCTION</h3>
                            <div className="font-bold text-[11px] text-[#0b132b] uppercase">{data.job_instruction}</div>
                        </div>
                    </div>

                    {/* Middle: Dokumentasi */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                        <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-4">DOKUMENTASI PEKERJAAN</h3>
                        <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 w-full overflow-hidden">
                            <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        </div>
                    </div>

                    {/* Right: Tambahan & Lampiran */}
                    <div className="flex flex-col gap-4">
                        {/* INFORMASI TAMBAHAN */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                            <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-4">INFORMASI TAMBAHAN</h3>
                            <div className="space-y-3 text-[11px] text-gray-600 font-medium">
                                <div className="flex items-center">
                                    <span className="w-24">Qty</span>
                                    <span className="text-gray-900 mr-2">:</span>
                                    <span className="font-bold text-gray-900">{data.informasi_tambahan.qty}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24">Satuan</span>
                                    <span className="text-gray-900 mr-2">:</span>
                                    <span className="font-bold text-gray-900">{data.informasi_tambahan.satuan}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24">Estimasi Biaya</span>
                                    <span className="text-gray-900 mr-2">:</span>
                                    <span className="font-bold text-gray-900">{data.informasi_tambahan.estimasi_biaya}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24">Aktual Biaya</span>
                                    <span className="text-gray-900 mr-2">:</span>
                                    <span className="font-bold text-gray-900">{data.informasi_tambahan.aktual_biaya}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24">Catatan</span>
                                    <span className="text-gray-900 mr-2">:</span>
                                    <span className="font-bold text-gray-900">{data.informasi_tambahan.catatan}</span>
                                </div>
                            </div>
                        </div>

                        {/* LAMPIRAN DOKUMEN */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                                    LAMPIRAN DOKUMEN
                                </h3>
                                <button className="text-green-600 bg-green-50 hover:bg-green-100 font-bold px-2 py-1 rounded text-[10px] transition border border-green-200 flex items-center gap-1">
                                    + Tambah Lampiran
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px] text-center whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-2 py-2 font-bold uppercase border-b border-gray-200 text-left">Nama Dokumen</th>
                                            <th className="px-2 py-2 font-bold uppercase border-b border-gray-200">Tipe</th>
                                            <th className="px-2 py-2 font-bold uppercase border-b border-gray-200">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-800">
                                        {data.lampiran.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-2 py-2 font-medium text-left flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3h-2.5v1.5h2.5v1.5h-2.5V17H16V7h4.5v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
                                                    {item.nama_dokumen}
                                                </td>
                                                <td className="px-2 py-2">{item.tipe}</td>
                                                <td className="px-2 py-2 flex justify-center gap-2">
                                                    <button className="text-green-600 hover:text-green-800" title="Download">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                                                    </button>
                                                    <button className="text-red-500 hover:text-red-700" title="Hapus">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 4: Signatures */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 mb-2">
                    <h3 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-5">APPROVAL & SIGNATURE</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-2">Dibuat Oleh,</span>
                            <div className="h-16 border border-dashed border-gray-300 rounded mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-900">Admin Plant</span>
                            <span className="text-[10px] text-gray-500 mt-1">Tanggal : ..........................</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-2">Diketahui Oleh,</span>
                            <div className="h-16 border border-dashed border-gray-300 rounded mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-900">Planner</span>
                            <span className="text-[10px] text-gray-500 mt-1">Tanggal : ..........................</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-2">Disetujui Oleh,</span>
                            <div className="h-16 border border-dashed border-gray-300 rounded mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-900">Superintendent Plant</span>
                            <span className="text-[10px] text-gray-500 mt-1">Tanggal : ..........................</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-2">Diterima Oleh,</span>
                            <div className="h-16 border border-dashed border-gray-300 rounded mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-900">Logistik</span>
                            <span className="text-[10px] text-gray-500 mt-1">Tanggal : ..........................</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-2">Diterima Oleh,</span>
                            <div className="h-16 border border-dashed border-gray-300 rounded mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-900">Head Office</span>
                            <span className="text-[10px] text-gray-500 mt-1">Tanggal : ..........................</span>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-[#e8f5e9] border border-green-200 text-[#0a4d3c] p-3 rounded-lg text-xs flex items-center gap-2 mb-10">
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    <span className="font-medium">Pastikan data yang diinput sudah sesuai dengan kondisi unit yang sebenarnya.</span>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
