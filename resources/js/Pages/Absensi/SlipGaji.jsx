import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function SlipGaji({ auth, employee, attendance, summary, kodeAbsensi, payroll }) {
    return (
        <AuthenticatedLayout>
            <Head title="Slip Gaji" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Slip Gaji</h1>
                            <div className="w-5 h-5 rounded-full bg-[#0a4d3c] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm cursor-pointer">
                                i
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Cetak dan tinjau rincian perhitungan upah karyawan.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span>Absensi</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-900">Slip Gaji</span>
                    </div>
                </div>
            </div>

            {/* A4 Paper Container */}
            <div className="max-w-5xl mx-auto bg-white border border-gray-300 shadow-md mb-8">
                
                <div className="p-8 pb-12 font-serif text-black overflow-x-auto">
                    
                    {/* Header: Logo & Company Name */}
                    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                        <div className="w-32 flex items-center shrink-0">
                            {/* Logo Placeholder (MAM) */}
                            <svg viewBox="0 0 100 40" className="w-full h-auto">
                                <polygon points="10,35 25,10 40,35 32,35 25,23 18,35" fill="red"/>
                                <polygon points="40,35 55,10 70,35 62,35 55,23 48,35" fill="red"/>
                                <rect x="75" y="15" width="20" height="15" fill="black" />
                                <circle cx="80" cy="32" r="3" fill="black" />
                                <circle cx="90" cy="32" r="3" fill="black" />
                                <rect x="70" y="20" width="5" height="10" fill="black" />
                                <rect x="25" y="10" width="30" height="15" fill="black" style={{opacity: 0.1}}/>
                                <text x="15" y="28" fill="black" fontSize="12" fontWeight="bold">MAM</text>
                            </svg>
                        </div>
                        <div className="text-center flex-1 pr-32">
                            <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">PT. MITRA ABADI MAHAKAM</h2>
                            <p className="text-sm font-bold uppercase">SITE : Harindo wahana (Kubar)</p>
                            <h3 className="text-xl font-bold uppercase mt-1">Slip Gaji</h3>
                        </div>
                    </div>

                    {/* Employee Info & Periode */}
                    <div className="flex justify-between text-[11px] font-bold mb-4">
                        {/* Left Details */}
                        <div className="w-1/2 flex flex-col gap-1">
                            <div className="flex"><div className="w-40 uppercase">NOMOR INDUK</div><div className="mr-2">:</div><div>{employee.nomor_induk}</div></div>
                            <div className="flex"><div className="w-40 uppercase">NAMA KARYAWAN</div><div className="mr-2">:</div><div>{employee.nama_karyawan}</div></div>
                            <div className="flex"><div className="w-40 uppercase">JABATAN</div><div className="mr-2">:</div><div>{employee.jabatan}</div></div>
                            <div className="flex"><div className="w-40 uppercase">DEPARTEMEN</div><div className="mr-2">:</div><div>{employee.departemen}</div></div>
                            <div className="flex"><div className="w-40 uppercase">GOLONGAN</div><div className="mr-2">:</div><div>{employee.golongan}</div></div>
                            <div className="flex"><div className="w-40 uppercase">NO REKENING</div><div className="mr-2">:</div><div>{employee.no_rekening}</div></div>
                        </div>
                        
                        {/* Middle Details */}
                        <div className="w-1/4 flex flex-col gap-1">
                            <div className="flex"><div className="w-28 capitalize">Kewarganegaraan</div><div className="mr-2">:</div><div>{employee.kewarganegaraan}</div></div>
                            <div className="flex"><div className="w-28 capitalize">Kesehatan</div><div className="mr-2">:</div><div>{employee.kesehatan}</div></div>
                            <div className="flex"><div className="w-28 capitalize">DAY OFF</div><div className="mr-2">:</div><div>{employee.day_off}</div></div>
                            <div className="flex"><div className="w-28 capitalize">Status</div><div className="mr-2">:</div><div>{employee.status}</div></div>
                        </div>

                        {/* Right Periode Box */}
                        <div className="w-64 text-center">
                            <div className="border border-black bg-gray-200 font-bold py-1 uppercase">PERIODE</div>
                            <div className="border border-black border-t-0 py-2 text-[10px]">{employee.periode}</div>
                        </div>
                    </div>

                    {/* Main Attendance Table */}
                    <table className="w-full text-[10px] border-collapse border border-black text-center mb-4 table-fixed">
                        <thead className="bg-gray-200 border-b-2 border-black font-bold">
                            <tr>
                                <th className="border border-black p-1 w-[160px]" rowSpan="2">HARI / TANGGAL</th>
                                <th className="border border-black p-1 w-[45px]" rowSpan="2">IN</th>
                                <th className="border border-black p-1 w-[45px]" rowSpan="2">REST<br/>TIME</th>
                                <th className="border border-black p-1 w-[45px]" rowSpan="2">OUT</th>
                                <th className="border border-black p-1 w-[45px]" rowSpan="2">IN</th>
                                <th className="border border-black p-1 w-[45px]" rowSpan="2">REG</th>
                                <th className="border border-black p-1" colSpan="5">OVERTIME</th>
                                <th className="border border-black p-1 w-[50px]" rowSpan="2">HADIR</th>
                                <th className="border border-black p-1" rowSpan="2">KETERANGAN</th>
                            </tr>
                            <tr>
                                <th className="border border-black p-1 w-[35px]">1.5</th>
                                <th className="border border-black p-1 w-[35px]">2.0</th>
                                <th className="border border-black p-1 w-[35px]">3.0</th>
                                <th className="border border-black p-1 w-[35px]">4.0</th>
                                <th className="border border-black p-1 w-[45px]">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((row, idx) => (
                                <tr key={idx} className={row.is_sunday ? 'bg-yellow-200 font-bold' : ''}>
                                    <td className="border-l border-r border-black px-2 py-0.5 text-left">{row.tanggal}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.in1}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.rest}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.out}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.in2}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.reg}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.ot_15}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.ot_20}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.ot_30}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5">{row.ot_40}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5 font-bold">{row.ot_total}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5 font-bold">{row.hadir}</td>
                                    <td className="border-l border-r border-black px-1 py-0.5 text-center">{row.keterangan}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            {/* Summary row 1 */}
                            <tr className="border border-black font-bold">
                                <td colSpan="5" className="border border-black py-1 text-center bg-white">Jumlah Hari Kerja</td>
                                <td className="border border-black py-1 text-center bg-white text-lg">{summary.jumlah_hari_kerja}</td>
                                <td colSpan="4" className="border border-black py-1 text-left px-2 bg-gray-200">Lembur Bulan ini</td>
                                <td className="border border-black py-1 text-center bg-gray-200">{summary.lembur_bulan_ini}</td>
                                <td className="border border-black py-1 text-center bg-gray-200">{summary.lembur_total}</td>
                                <td className="border-t border-b border-black py-1 bg-white"></td>
                            </tr>
                            {/* Summary row 2 */}
                            <tr className="border border-black font-bold bg-gray-200">
                                <td colSpan="6" className="border-r border-black border-b-0 py-1 bg-white"></td>
                                <td colSpan="4" className="border border-black py-1 text-left px-2">Adjustment</td>
                                <td className="border border-black py-1 text-center">-</td>
                                <td className="border border-black py-1 text-center">-</td>
                                <td className="border-t border-black py-1 bg-white"></td>
                            </tr>
                            {/* Summary row 3 */}
                            <tr className="border border-black font-bold bg-gray-200">
                                <td colSpan="6" className="border-r border-black py-1 bg-white"></td>
                                <td colSpan="4" className="border border-black py-1 text-left px-2">Total</td>
                                <td className="border border-black py-1 text-center"></td>
                                <td className="border border-black py-1 text-center text-red-600 text-lg">{summary.total}</td>
                                <td className="border-t border-black py-1 bg-white"></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Codes & Info Section */}
                    <div className="flex justify-between items-start mb-4">
                        {/* Kode Absensi Table */}
                        <div className="w-[45%]">
                            <table className="w-full text-[9px] border-collapse border border-black">
                                <thead className="bg-gray-200 font-bold border-b border-black text-center">
                                    <tr>
                                        <th className="border border-black py-1" colSpan="2">KODE ABSENSI</th>
                                        <th className="border border-black py-1 w-16">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kodeAbsensi.map((kode, idx) => (
                                        <tr key={idx} className="font-bold">
                                            <td className="border border-black px-2 py-0.5 w-10 text-center">{kode.kode}</td>
                                            <td className="border border-black px-2 py-0.5">{kode.desc}</td>
                                            <td className="border border-black px-2 py-0.5 text-center">{kode.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Signature Details Box */}
                        <div className="w-[35%]">
                            <table className="w-full text-[10px] border-collapse border border-black">
                                <tbody>
                                    <tr>
                                        <td className="border border-black px-2 py-1 font-bold w-20">Dibuat Di</td>
                                        <td className="border border-black px-2 py-1">: Samarinda</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black px-2 py-1 font-bold">Tanggal</td>
                                        <td className="border border-black px-2 py-1">: 25 Juli 2026</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payroll Section (3 Columns) */}
                    <div className="border border-black flex text-[10px] mb-2 font-bold bg-white">
                        
                        {/* Perhitungan Upah */}
                        <div className="w-[38%] border-r border-black flex flex-col">
                            <div className="border-b border-black font-bold uppercase underline px-2 py-1">PERHITUNGAN UPAH</div>
                            <div className="p-2 flex-1 flex flex-col">
                                <div className="flex justify-between mb-0.5"><span>GAJI POKOK</span><span>{payroll.pendapatan.gaji_pokok}</span></div>
                                <div className="flex justify-between mb-0.5"><span>JABATAN</span><span>{payroll.pendapatan.jabatan}</span></div>
                                <div className="flex justify-between mb-0.5"><span>INSENTIF</span><span>{payroll.pendapatan.insentif}</span></div>
                                <div className="flex justify-between mb-0.5"><span>TUNJ. OPERASIONAL</span><span>{payroll.pendapatan.tunj_operasional}</span></div>
                                <div className="flex justify-between mb-0.5"><span>{payroll.pendapatan.tunj_hadir.label}</span><span>{payroll.pendapatan.tunj_hadir.value}</span></div>
                                <div className="flex justify-between mb-0.5"><span>{payroll.pendapatan.long_shift.label}</span><span>{payroll.pendapatan.long_shift.value}</span></div>
                                <div className="flex justify-between mb-0.5"><span>{payroll.pendapatan.fas_makan.label}</span><span>{payroll.pendapatan.fas_makan.value}</span></div>
                            </div>
                            <div className="border-t border-black p-2 flex justify-between font-extrabold uppercase">
                                <span>TOTAL PENDAPATAN</span>
                                <span>{payroll.total_pendapatan}</span>
                            </div>
                        </div>

                        {/* Potongan */}
                        <div className="w-[32%] border-r border-black flex flex-col">
                            <div className="border-b border-black font-bold uppercase underline px-2 py-1">POTONGAN</div>
                            <div className="p-2 flex-1 flex flex-col">
                                <div className="flex justify-between mb-0.5"><span>BPJS KESEHATAN</span><span>{payroll.potongan.bpjs_kesehatan}</span></div>
                                <div className="flex justify-between mb-0.5"><span>BPJS KETENAGAKERJAAN</span><span>{payroll.potongan.bpjs_ketenagakerjaan}</span></div>
                                <div className="flex justify-between mb-0.5"><span>PRESENSI</span><span>{payroll.potongan.presensi}</span></div>
                                <div className="flex justify-between mb-0.5"><span>PROFESIONAL</span><span>{payroll.potongan.profesional}</span></div>
                                <div className="flex justify-between mb-0.5"><span>LAIN-LAIN</span><span>{payroll.potongan.lain_lain}</span></div>
                            </div>
                            <div className="border-t border-black p-2 flex justify-between font-extrabold uppercase">
                                <span>TOTAL POTONGAN</span>
                                <span>{payroll.total_potongan}</span>
                            </div>
                        </div>

                        {/* Ringkasan */}
                        <div className="w-[30%] flex flex-col">
                            <div className="border-b border-black font-bold uppercase underline px-2 py-1">RINGKASAN</div>
                            <div className="p-2 flex-1 flex flex-col">
                                <div className="flex justify-between mb-2"><span>TOTAL PENDAPATAN</span><span>{payroll.total_pendapatan}</span></div>
                                <div className="flex justify-between mb-2"><span>TOTAL POTONGAN</span><span>{payroll.total_potongan}</span></div>
                            </div>
                            <div className="p-2 flex justify-between font-extrabold uppercase mb-2">
                                <span>UPAH BERSIH</span>
                                <span className="text-sm">{payroll.upah_bersih}</span>
                            </div>
                        </div>
                    </div>

                    {/* Terbilang */}
                    <div className="border border-black px-2 py-1.5 text-[10px] font-bold uppercase flex mb-4">
                        <span className="mr-4">TERBILANG :</span>
                        <span>{payroll.terbilang}</span>
                    </div>

                    {/* Signatures */}
                    <div className="border border-black flex text-center text-[10px] font-bold h-24 items-end">
                        <div className="w-1/4 border-r border-black h-full flex flex-col justify-between">
                            <div className="pt-2">Dibuat Oleh,</div>
                            <div className="pb-2 px-4">
                                <div className="border-b border-dotted border-black mb-1"></div>
                                <div>( ADMIN PLANT )</div>
                            </div>
                        </div>
                        <div className="w-1/4 border-r border-black h-full flex flex-col justify-between">
                            <div className="pt-2">Diperiksa Oleh,</div>
                            <div className="pb-2 px-4">
                                <div className="border-b border-dotted border-black mb-1"></div>
                                <div>( PLANNER )</div>
                            </div>
                        </div>
                        <div className="w-1/4 border-r border-black h-full flex flex-col justify-between">
                            <div className="pt-2">Diketahui Oleh,</div>
                            <div className="pb-2 px-4">
                                <div className="border-b border-dotted border-black mb-1"></div>
                                <div>( SUPERVISOR PLANT )</div>
                            </div>
                        </div>
                        <div className="w-1/4 h-full flex flex-col justify-between">
                            <div className="pt-2">Disetujui Oleh,</div>
                            <div className="pb-2 px-4">
                                <div className="border-b border-dotted border-black mb-1"></div>
                                <div>( SUPERINTENDENT PLANT )</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 mb-10 max-w-5xl mx-auto">
                <button className="bg-white hover:bg-gray-50 border border-[#0a4d3c] text-[#0a4d3c] font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    Preview Slip
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
                    Print Slip
                </button>
                <button className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    Download PDF
                </button>
            </div>

        </AuthenticatedLayout>
    );
}
