import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Perhitungan({ auth, calculations }) {
    return (
        <AuthenticatedLayout>
            <Head title="Perhitungan Manpower Plant" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#0b132b] tracking-tight">Perhitungan Manpower Plant</h1>
                        </div>
                        <p className="text-sm text-gray-500">Hitung kebutuhan manpower berdasarkan populasi unit dan rasio yang berlaku.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Manpower</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Perhitungan Manpower</span>
                    </div>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Periode</label>
                    <select className="w-40 bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Juli 2026</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Site / Lokasi</label>
                    <select className="w-64 bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0a4d3c]">
                        <option>Site Harindo Wahana (Kubar)</option>
                    </select>
                </div>
                
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm h-[38px]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
                    Hitung
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm h-[38px]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                    Simpan
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm h-[38px]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                    Cetak
                </button>
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Left Content (Tables) */}
                <div className="flex-1 min-w-0">
                    
                    {/* Table 1 */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded mb-6">
                        <div className="bg-[#fcd34d] px-4 py-2 font-bold text-[11px] text-gray-900">
                            1. PERHITUNGAN MP UNIT (NON STAFF)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] text-center whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="border-r border-gray-200 p-2 font-bold" rowSpan="2">NO</th>
                                        <th className="border-r border-gray-200 p-2 font-bold text-left" rowSpan="2">UNIT / EQUIPMENT</th>
                                        <th className="border-r border-gray-200 p-2 font-bold" colSpan="2">MP UNIT</th>
                                        <th className="border-r border-gray-200 p-2 font-bold" colSpan="2">Populasi Unit</th>
                                        <th className="border-r border-gray-200 p-2 font-bold" rowSpan="2">SUB TOTAL</th>
                                        <th className="border-r border-gray-200 p-2 font-bold leading-tight" rowSpan="2">RATIO 0,7<br/>c x SUB TOTAL<br/>(Non Staff)</th>
                                        <th className="border-r border-gray-200 p-2 font-bold leading-tight" rowSpan="2">RASIO 15%<br/>(Staff)</th>
                                        <th className="p-2 font-bold" rowSpan="2">REMARKS</th>
                                    </tr>
                                    <tr>
                                        <th className="border-r border-gray-200 border-t border-gray-200 p-2 font-bold">Unit</th>
                                        <th className="border-r border-gray-200 border-t border-gray-200 p-2 font-bold">MP Unit</th>
                                        <th className="border-r border-gray-200 border-t border-gray-200 p-2 font-bold">Unit 6 Fleet</th>
                                        <th className="border-r border-gray-200 border-t border-gray-200 p-2 font-bold">Mainroad & Jetty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                    {calculations.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td className="p-2 border-r border-gray-100">{idx + 1}</td>
                                            <td className="p-2 border-r border-gray-100 text-left font-bold">{row.unit}</td>
                                            <td className="p-2 border-r border-gray-100">{row.unit_mp}</td>
                                            <td className="p-2 border-r border-gray-100">{row.mp_unit}</td>
                                            <td className="p-2 border-r border-gray-100">{row.fleet}</td>
                                            <td className="p-2 border-r border-gray-100">{row.mainroad}</td>
                                            <td className="p-2 border-r border-gray-100">{row.sub_total}</td>
                                            <td className="p-2 border-r border-gray-100">{row.ratio}</td>
                                            <td className="p-2 border-r border-gray-100">{row.staff}</td>
                                            <td className="p-2">{row.remarks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t border-gray-200">
                                        <td colSpan="6" className="p-3 text-right font-bold text-[9px] text-gray-500 uppercase border-r border-gray-200">TOTAL SUB TOTAL (A)</td>
                                        <td className="p-3 font-black text-[12px] text-gray-900 border-r border-gray-200 bg-gray-100">120</td>
                                        <td className="p-3 font-black text-[12px] text-blue-600 border-r border-gray-200 bg-blue-50/50">84 <div className="text-[8px] font-bold text-blue-500 uppercase mt-0.5">TOTAL NON STAFF (0,7 x A)</div></td>
                                        <td className="p-3 font-black text-[12px] text-green-600 border-r border-gray-200 bg-green-50/50">21 <div className="text-[8px] font-bold text-green-600 uppercase mt-0.5">TOTAL STAFF (25% x 84)</div></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Table 2 */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded">
                        <div className="bg-[#fcd34d] px-4 py-2 font-bold text-[11px] text-gray-900">
                            2. RINGKASAN HASIL PERHITUNGAN
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-center">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 font-bold text-left w-1/4">KETERANGAN</th>
                                        <th className="p-3 font-bold text-blue-600 w-1/4">NON STAFF</th>
                                        <th className="p-3 font-bold text-green-600 w-1/4 flex items-center justify-center gap-1">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> 
                                            STAFF
                                        </th>
                                        <th className="p-3 font-bold text-gray-600 w-1/4 flex items-center justify-center gap-1">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/></svg>
                                            TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-bold">
                                    <tr>
                                        <td className="p-3 text-left text-gray-600">Sub Total MP Unit</td>
                                        <td className="p-3">120</td>
                                        <td className="p-3 text-gray-400">-</td>
                                        <td className="p-3 text-gray-900">120</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-left text-gray-600">Ratio 0,7 x Sub Total (Non Staff)</td>
                                        <td className="p-3 text-blue-600">84</td>
                                        <td className="p-3 text-gray-400">-</td>
                                        <td className="p-3 text-gray-900">84</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-left text-gray-600">Rasio 25% Staff</td>
                                        <td className="p-3 text-gray-400">-</td>
                                        <td className="p-3 text-green-600">21</td>
                                        <td className="p-3 text-gray-900">21</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200 text-sm">
                                        <td className="p-3 text-left font-black text-gray-900">GRAND TOTAL</td>
                                        <td className="p-3 font-black text-blue-600">84</td>
                                        <td className="p-3 font-black text-green-600">21</td>
                                        <td className="p-3 font-black text-green-700">105</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500 font-medium pb-8">
                        <span className="font-bold text-gray-900">Catatan :</span> Perhitungan manpower mengikuti ketentuan rasio berdasarkan range HM (Hours Meter).
                    </div>

                </div>

                {/* Right Content (Cards) */}
                <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-5">
                    
                    {/* INFORMASI PERIODE */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5">
                        <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">INFORMASI PERIODE</h3>
                        <div className="space-y-2 text-[11px]">
                            <div className="flex">
                                <span className="w-24 text-gray-500">Periode</span>
                                <span className="text-gray-900 font-medium">: Juli 2026</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-gray-500">Site / Lokasi</span>
                                <span className="text-gray-900 font-medium">: Site Harindo Wahana (Kubar)</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-gray-500">Tanggal Hitung</span>
                                <span className="text-gray-900 font-medium">: 25 Mei 2024 10:30</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-gray-500">Dihitung Oleh</span>
                                <span className="text-gray-900 font-medium">: Admin Plant</span>
                            </div>
                        </div>
                    </div>

                    {/* RINGKASAN */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5">
                        <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">RINGKASAN</h3>
                        
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-[11px] font-bold text-blue-600">TOTAL NON STAFF</span>
                            <span className="text-sm font-black text-blue-600">84 Orang</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-[11px] font-bold text-green-600">TOTAL STAFF</span>
                            <span className="text-sm font-black text-green-600">21 Orang</span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-3 mt-2 bg-[#ffedd5] rounded border border-[#fed7aa]">
                            <span className="text-[12px] font-black text-gray-900">GRAND TOTAL</span>
                            <span className="text-lg font-black text-gray-900">105 Orang</span>
                        </div>
                    </div>

                    {/* RASIO YANG DIGUNAKAN */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5">
                        <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">RASIO YANG DIGUNAKAN</h3>
                        <ul className="space-y-2 text-[11px] text-gray-700 font-medium list-disc pl-4 marker:text-green-600">
                            <li><div className="flex justify-between max-w-[150px] ml-1"><span>0 - 4000 hrs</span><span>: 0,6</span></div></li>
                            <li><div className="flex justify-between max-w-[150px] ml-1"><span>4000 - 8.000 hrs</span><span>: 0,7</span></div></li>
                            <li><div className="flex justify-between max-w-[150px] ml-1"><span>8000 - 12.000 hrs</span><span>: 0,8</span></div></li>
                            <li><div className="flex justify-between max-w-[150px] ml-1"><span>12.000 hrs Up</span><span>: 0,9</span></div></li>
                        </ul>
                    </div>

                    {/* DETAIL PERHITUNGAN UNIT */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">DETAIL PERHITUNGAN UNIT</h3>
                        </div>
                        <table className="w-full text-[10px] text-center">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-2 font-bold border-r border-gray-200">RANGE HM</th>
                                    <th className="p-2 font-bold border-r border-gray-200">RASIO</th>
                                    <th className="p-2 font-bold">KETERANGAN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border-r border-gray-100">0 - 4000 hrs</td>
                                    <td className="p-2 font-bold border-r border-gray-100">0,6</td>
                                    <td className="p-2 font-medium text-gray-600">Ringan</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border-r border-gray-100">4000 - 8.000 hrs</td>
                                    <td className="p-2 font-bold border-r border-gray-100">0,7</td>
                                    <td className="p-2 font-medium text-gray-600">Sedang</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border-r border-gray-100">80000 - 12.000 hrs</td>
                                    <td className="p-2 font-bold border-r border-gray-100">0,8</td>
                                    <td className="p-2 font-medium text-gray-600">Berat</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border-r border-gray-100">12.000 hrs Up</td>
                                    <td className="p-2 font-bold border-r border-gray-100">0,9</td>
                                    <td className="p-2 font-medium text-gray-600">Sangat Berat</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
