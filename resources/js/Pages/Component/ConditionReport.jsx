import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ConditionReport({ auth, data }) {
    
    return (
        <AuthenticatedLayout>
            <Head title="Component Condition Report" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#e8f5e9] p-2 rounded-lg text-[#0a4d3c]">
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-[#0b132b] tracking-tight uppercase">COMPONENT CONDITION REPORT</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mt-1">PCR U/C & Component</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Master Control PM Service</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>PCR U/C & Component</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Detail Laporan</span>
                    </div>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6">
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    Kembali
                </button>
                <div className="flex items-center gap-3">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                        Print PDF
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-[#0a4d3c] font-bold px-4 py-2 rounded-lg text-sm transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-sm h-9">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit Laporan
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                
                {/* Panel 1: Info Laporan & Dokumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* INFORMASI LAPORAN */}
                    <div className="md:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-5">INFORMASI LAPORAN</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-500 font-medium">
                            {/* Col 1 */}
                            <div className="flex items-center">
                                <span className="w-24">Report By</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.report_by}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32">Tanggal Laporan</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.tanggal_laporan}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">Section</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.section}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32">Dilaporkan Oleh</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.dilaporkan_oleh}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">Jabatan</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.jabatan}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32">Jabatan</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.jabatan_2}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">Telp</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.telp}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32">Section</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.section_2}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">CC</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_laporan.cc}</span>
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI DOKUMEN */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-5">INFORMASI DOKUMEN</h3>
                        <div className="space-y-3 text-sm text-gray-500 font-medium">
                            <div className="flex items-center">
                                <span className="w-28">CCR NO.</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_dokumen.ccr_no}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Date</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_dokumen.date}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28">Delivery date Unit</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_dokumen.delivery_date_unit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Unit Info, Meter Info, Tambahan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* INFORMASI UNIT / EQUIPMENT */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-5">INFORMASI UNIT / EQUIPMENT</h3>
                        <div className="space-y-3 text-sm text-gray-500 font-medium">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-20">Model Make</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.model_make}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-16">Model Type</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.model_type}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-20">Serial No.</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.serial_no}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-16">Unit No.</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.unit_no}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-20">Component</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.component}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-16">Qty</span>
                                    <span className="text-gray-900">:</span>
                                    <span className="ml-2 font-bold text-[#0a4d3c]">{data.informasi_unit.qty}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* METER INFORMATION */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-5">METER INFORMATION</h3>
                        <div className="space-y-3 text-sm text-gray-500 font-medium">
                            <div className="flex items-center">
                                <span className="w-24">Kilometers</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-gray-900">{data.meter_information.kilometers}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24">Hour meters</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2 font-bold text-gray-900">{data.meter_information.hour_meters}</span>
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI TAMBAHAN */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-5 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-current text-[#0b5c3e]" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                            INFORMASI TAMBAHAN
                        </h3>
                        <div className="space-y-2.5 text-sm text-gray-500 font-medium">
                            <div className="flex items-center">
                                <span className="w-24 flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> Created At</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2">{data.informasi_tambahan.created_at}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> Updated At</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2">{data.informasi_tambahan.updated_at}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> Created By</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2">{data.informasi_tambahan.created_by}</span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className="w-24 flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> Status</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2"><span className="bg-green-100 text-[#0a4d3c] font-bold px-2 py-0.5 rounded">{data.informasi_tambahan.status}</span></span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 flex items-center gap-2"><svg className="w-3 h-3 transform rotate-45" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg> Lampiran</span>
                                <span className="text-gray-900">:</span>
                                <span className="ml-2">{data.informasi_tambahan.lampiran}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 3: Analysis & Pictures */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* DESCRIPTION & ANALYSIS */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="mb-6">
                            <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4 fill-current text-[#0b5c3e]" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                DESCRIPTION
                            </h3>
                            <div className="font-bold text-sm text-gray-900 pl-5">{data.analysis.description}</div>
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4 fill-current text-[#0b5c3e]" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                                ANALYSIS REPORT
                            </h3>
                            <div className="text-sm text-gray-600 pl-5 leading-relaxed">
                                {data.analysis.report}
                            </div>
                        </div>
                    </div>

                    {/* PICTURE DOKUMENTASI */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <svg className="w-4 h-4 fill-current text-[#0b5c3e]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                            PICTURE DOKUMENTASI
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Dummy Image placeholders */}
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                    <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel 4: Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    {/* Report By */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="flex items-start gap-2 mb-4">
                            <svg className="w-5 h-5 fill-current text-[#0b5c3e] shrink-0" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>
                            <div>
                                <h4 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider">REPORT BY</h4>
                                <div className="text-xs text-gray-500">Mechanic / Inspector</div>
                            </div>
                        </div>
                        <div className="h-16 border border-dashed border-gray-300 rounded mb-4"></div>
                        <div className="text-xs text-gray-500">Tanggal : ..............................................</div>
                    </div>
                    {/* Acknowledge By */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="flex items-start gap-2 mb-4">
                            <svg className="w-5 h-5 fill-current text-[#0b5c3e] shrink-0" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3.89 4.31l1.41 1.41-5.3 5.3-2.83-2.83 1.41-1.41 1.41 1.41 3.9-3.88z"/></svg>
                            <div>
                                <h4 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider">ACKNOWLEDGE BY</h4>
                                <div className="text-xs text-gray-500">Foreman / Supervisor</div>
                            </div>
                        </div>
                        <div className="h-16 border border-dashed border-gray-300 rounded mb-4"></div>
                        <div className="text-xs text-gray-500">Tanggal : ..............................................</div>
                    </div>
                    {/* Approved By */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="flex items-start gap-2 mb-4">
                            <svg className="w-5 h-5 fill-current text-[#0b5c3e] shrink-0" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 5H4v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1zm4-1h-3v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1h-1z"/></svg>
                            <div>
                                <h4 className="text-sm font-extrabold text-[#0b132b] uppercase tracking-wider">APPROVED BY</h4>
                                <div className="text-xs text-gray-500">Superintendent</div>
                            </div>
                        </div>
                        <div className="h-16 border border-dashed border-gray-300 rounded mb-4"></div>
                        <div className="text-xs text-gray-500">Tanggal : ..............................................</div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-[#e8f5e9] border border-green-200 text-[#0a4d3c] p-3 rounded-lg text-sm flex items-center gap-2 mb-10">
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    <span className="font-medium">Pastikan data yang diinput sudah sesuai dengan kondisi unit yang sebenarnya.</span>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
