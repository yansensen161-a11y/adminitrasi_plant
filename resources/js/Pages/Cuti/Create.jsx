import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Create({ auth, employee, approvals, formDefaults }) {
    
    // Status Badge Helper
    const renderStatusBadge = (status) => {
        if (status === 'DIAJUKAN') return <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wide">DIAJUKAN</span>;
        if (status === 'DISETUJUI') return <span className="bg-green-50 text-green-600 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wide">DISETUJUI</span>;
        if (status === 'MENUNGGU') return <span className="bg-orange-50 text-orange-500 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wide">MENUNGGU</span>;
        return status;
    };

    // Dummy Signature SVG
    const SignatureSvg = () => (
        <svg viewBox="0 0 100 40" className="w-16 h-8 mx-auto opacity-70">
            <path d="M10,25 Q20,5 30,25 T50,25 T70,15 T90,25" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M25,20 Q35,10 45,30" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Form Pengajuan Cuti" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#0b132b] tracking-tight">Form Pengajuan Cuti</h1>
                        </div>
                        <p className="text-sm text-gray-500">Lengkapi data pengajuan cuti dengan benar dan upload dokumen pendukung (jika ada).</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Pengajuan Cuti</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Form Pengajuan Cuti</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                
                {/* PANEL 1: DATA KARYAWAN */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 relative overflow-hidden">
                    <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        DATA KARYAWAN
                    </h3>
                    
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 flex-1">
                            {/* Col 1 */}
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">NRP / ID</span>
                                    <span className="font-bold text-gray-900">: {employee.nrp}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Nama Lengkap</span>
                                    <span className="font-bold text-gray-900">: {employee.nama}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Jabatan</span>
                                    <span className="font-bold text-gray-900">: {employee.jabatan}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Departemen</span>
                                    <span className="font-bold text-gray-900">: {employee.departemen}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Golongan</span>
                                    <span className="font-bold text-gray-900">: {employee.golongan}</span>
                                </div>
                            </div>
                            
                            {/* Col 2 */}
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Lokasi / Site</span>
                                    <span className="font-bold text-gray-900">: {employee.lokasi}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Status Karyawan</span>
                                    <span className="font-bold text-gray-900">: {employee.status}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Tgl. Masuk</span>
                                    <span className="font-bold text-gray-900">: {employee.tgl_masuk}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">No. HP / WA</span>
                                    <span className="font-bold text-gray-900">: {employee.hp}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-gray-500">Email</span>
                                    <span className="font-bold text-gray-900">: {employee.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Photo Box */}
                        <div className="hidden lg:block w-32 h-40 bg-gray-100 rounded-lg ml-6 overflow-hidden border border-gray-200 shrink-0 relative flex flex-col items-center justify-center text-gray-300">
                            {/* Placeholder Avatar */}
                            <svg className="w-16 h-16 fill-current mb-2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            <span className="text-[10px] font-medium text-gray-400">Photo</span>
                        </div>
                    </div>
                </div>

                {/* Split Row for Panel 2 & 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* PANEL 2: DATA PENGAJUAN CUTI */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6 flex items-center gap-2">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                            DATA PENGAJUAN CUTI
                        </h3>

                        <div className="space-y-5 text-[11px] text-gray-800 font-medium">
                            {/* Row 1 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1.5">Jenis Cuti <span className="text-red-500">*</span></label>
                                    <select className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.jenis_cuti}>
                                        <option>{formDefaults.jenis_cuti}</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1.5">Alasan Cuti <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.alasan} />
                                </div>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.tgl_mulai} />
                                        <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1.5">Tanggal Selesai <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.tgl_selesai} />
                                        <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                    </div>
                                </div>
                                <div className="w-24">
                                    <label className="block mb-1.5">Total Hari</label>
                                    <input type="text" disabled className="w-full bg-[#e8f5e9] border border-green-200 text-green-700 font-bold text-center text-[11px] rounded px-3 py-2.5 focus:outline-none" defaultValue={formDefaults.total_hari} />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <label className="block mb-1.5">Alamat Selama Cuti</label>
                                <textarea className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] resize-none h-14" defaultValue={formDefaults.alamat}></textarea>
                            </div>

                            {/* Row 4 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1.5">No. Telp Selama Cuti</label>
                                    <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.telp} />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1.5">Kontak Darurat</label>
                                    <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.darurat} />
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div>
                                <label className="block mb-1.5">Pekerjaan / Tanggung Jawab yang Didelegasikan</label>
                                <textarea className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] resize-none h-14" defaultValue={formDefaults.delegasi}></textarea>
                            </div>

                            {/* Lampiran Dokumen */}
                            <div>
                                <label className="block mb-1.5">Lampiran Dokumen</label>
                                <div className="w-full bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-800">{formDefaults.lampiran_nama}</div>
                                            <div className="text-[9px] text-gray-500">({formDefaults.lampiran_size})</div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500 font-bold p-1">&times;</button>
                                </div>
                                <div className="text-[9px] text-gray-400 mt-1.5 italic">* Upload surat pendukung jika diperlukan (Maks. 2 MB, PDF/JPG/PNG)</div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL 3: PENGAJUAN TRANSPORTASI */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6 flex items-center gap-2">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/></svg>
                            PENGAJUAN TRANSPORTASI
                        </h3>

                        <div className="space-y-5 text-[11px] text-gray-800 font-medium">
                            {/* Radio */}
                            <div>
                                <label className="block mb-2">Apakah memerlukan transportasi perusahaan?</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="butuh_transport" className="w-3.5 h-3.5 text-[#0a4d3c] focus:ring-[#0a4d3c]" defaultChecked />
                                        <span>Ya</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="butuh_transport" className="w-3.5 h-3.5 text-gray-400 focus:ring-gray-400" />
                                        <span>Tidak</span>
                                    </label>
                                </div>
                            </div>

                            {/* Jenis Transportasi */}
                            <div>
                                <label className="block mb-1.5">Jenis Transportasi <span className="text-red-500">*</span></label>
                                <select className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.jenis_transport}>
                                    <option>{formDefaults.jenis_transport}</option>
                                </select>
                            </div>

                            {/* Tujuan */}
                            <div>
                                <label className="block mb-1.5">Tujuan <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.tujuan} />
                            </div>

                            {/* Berangkat */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1.5">Tanggal Berangkat <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.tgl_berangkat} />
                                        <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1.5">Jam Berangkat <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.jam_berangkat} />
                                </div>
                            </div>

                            {/* Kembali */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1.5">Tanggal Kembali <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.tgl_kembali} />
                                        <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1.5">Jam Kembali <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.jam_kembali} />
                                </div>
                            </div>

                            {/* Penumpang */}
                            <div>
                                <label className="block mb-1.5">Penumpang</label>
                                <input type="text" className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]" defaultValue={formDefaults.penumpang} />
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block mb-1.5">Keterangan Tambahan</label>
                                <textarea className="w-full bg-white border border-gray-300 text-gray-800 text-[11px] rounded px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c] resize-none h-16" defaultValue={formDefaults.keterangan_tambahan}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL 4: ALUR PERSETUJUAN */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                    <h3 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        ALUR PERSETUJUAN
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Form ini harus mendapatkan persetujuan berjenjang sesuai alur di bawah ini.</p>

                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-[10px] text-center whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 font-bold text-gray-600">NO</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">LEVEL PERSETUJUAN</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">NAMA</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">JABATAN</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">STATUS</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">TANGGAL</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">TANDA TANGAN</th>
                                    <th className="px-3 py-3 font-bold text-gray-600">CATATAN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {approvals.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-3">{idx + 1}</td>
                                        <td className="px-3 py-3">{item.level}</td>
                                        <td className="px-3 py-3 font-bold">{item.nama}</td>
                                        <td className="px-3 py-3">{item.jabatan}</td>
                                        <td className="px-3 py-3">{renderStatusBadge(item.status)}</td>
                                        <td className="px-3 py-3">{item.tanggal}</td>
                                        <td className="px-3 py-1.5 h-12">
                                            {item.status !== 'MENUNGGU' ? <SignatureSvg /> : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">{item.catatan}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 mb-10">
                    <div className="flex gap-3">
                        <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                            Simpan Pengajuan
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                            Reset
                        </button>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            Preview
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                            Cetak
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            Kembali
                        </button>
                    </div>
                </div>

            </div>

        </AuthenticatedLayout>
    );
}
