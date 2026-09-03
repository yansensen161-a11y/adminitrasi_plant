import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, manpowers }) {
    return (
        <AuthenticatedLayout>
            <Head title="Data Manpower" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Manpower</h1>
                        </div>
                        <p className="text-sm text-gray-500">Kelola data karyawan / manpower plant.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Manpower</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Data Manpower</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 h-9 shadow-sm shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Tambah Data
                    </button>
                    
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 h-9 shadow-sm shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        Import Excel
                    </button>
                    
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 h-9 shadow-sm shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Export Excel
                    </button>
                </div>
                
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-64">
                        <input type="text" placeholder="Cari NRP, Nama, Bagian..." className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2 pl-3 focus:outline-none focus:border-[#0a4d3c] h-9" />
                        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </div>
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 h-9 shadow-sm shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                        Filter
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left whitespace-nowrap min-w-max">
                        <thead className="bg-[#00d2d3] text-gray-900 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] w-12 uppercase">NO</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NAMA</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">BAGIAN</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NRP</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">JENIS<br/>KELAMIN</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">Lokal /<br/>Non Lokal</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">DOH</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">kontak Person</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NO KTP</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NO BPJS KESEHATAN</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NO BPJS<br/>KETENAGAKERJAAN</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">NO REKENING</th>
                                <th className="px-3 py-3 font-bold text-center border-r border-[#00c0c1] uppercase">Alamat</th>
                                <th className="px-3 py-3 font-bold text-center uppercase">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {manpowers.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2.5 text-center font-medium border-r border-gray-100">{idx + 1}</td>
                                    <td className="px-3 py-2.5 font-bold border-r border-gray-100">{item.nama}</td>
                                    <td className="px-3 py-2.5 text-center border-r border-gray-100">{item.bagian}</td>
                                    <td className="px-3 py-2.5 text-center font-medium border-r border-gray-100">{item.nrp}</td>
                                    <td className="px-3 py-2.5 text-center border-r border-gray-100">{item.jenis_kelamin}</td>
                                    <td className="px-3 py-2.5 text-center border-r border-gray-100">{item.lokasi}</td>
                                    <td className="px-3 py-2.5 text-center border-r border-gray-100">{item.doh}</td>
                                    <td className="px-3 py-2.5 text-center font-mono border-r border-gray-100">{item.kontak}</td>
                                    <td className="px-3 py-2.5 text-center font-mono border-r border-gray-100">{item.ktp}</td>
                                    <td className="px-3 py-2.5 text-center font-mono border-r border-gray-100">{item.bpjs_kes}</td>
                                    <td className="px-3 py-2.5 text-center font-mono border-r border-gray-100">{item.bpjs_ket}</td>
                                    <td className="px-3 py-2.5 text-center font-mono border-r border-gray-100">{item.rekening}</td>
                                    <td className="px-3 py-1 border-r border-gray-100">
                                        <div className="w-48 whitespace-normal leading-tight text-[9px] text-gray-600">
                                            {item.alamat}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-all border border-blue-100" title="Edit">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all border border-red-100" title="Delete">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-5 py-4 flex justify-between items-center text-xs text-gray-500 bg-white border-t border-gray-200">
                    <div>
                        Menampilkan 1 - 15 dari 15 data
                    </div>
                    <div className="flex gap-4 items-center">
                        <select className="border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 focus:outline-none bg-white">
                            <option>15 / halaman</option>
                        </select>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#0a4d3c] bg-[#0a4d3c] text-white font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
