import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, data }) {
    
    // Function to calculate day headers based on September 2026
    // Sept 1, 2026 is a Tuesday (Sel).
    const days = ['Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min', 'Sen'];
    
    // Generate dates 1 to 20
    const dates = Array.from({length: 20}, (_, i) => {
        const d = i + 1;
        const dayStr = days[i % 7];
        const isWeekend = dayStr === 'Sab' || dayStr === 'Min';
        return { date: d, day: dayStr, isWeekend };
    });

    // Helper to generate 20 shifts for UI display based on the short array from backend
    const getExtendedShifts = (originalShifts) => {
        let extended = [...originalShifts];
        while (extended.length < 20) {
            // just repeat the pattern or add S/M/O based on the last items
            extended.push(extended[extended.length - 7] || 'S');
        }
        return extended.slice(0, 20);
    };

    // Calculate totals from an array of shifts
    const getTotals = (shifts) => {
        return {
            S: shifts.filter(s => s === 'S').length,
            M: shifts.filter(s => s === 'M').length,
            O: shifts.filter(s => s === 'O').length,
        };
    };

    // Helper to render shift cells
    const renderShiftCell = (shift, isWeekend, idx) => {
        let bgColor = '';
        let textColor = 'text-white';
        let cellContent = shift;

        if (shift === 'S') bgColor = 'bg-[#16a34a]'; // Green
        else if (shift === 'M') bgColor = 'bg-[#3b82f6]'; // Blue
        else if (shift === 'O') {
            bgColor = 'bg-gray-400'; // Gray for off
            cellContent = 'O';
        } else {
            bgColor = isWeekend ? 'bg-gray-200' : 'bg-white';
            textColor = 'text-transparent';
        }

        return (
            <td key={idx} className={`px-1 py-1 text-center border border-white p-0`}>
                <div className={`w-full h-6 mx-auto ${bgColor} ${textColor} font-bold text-xs flex items-center justify-center`}>
                    {cellContent}
                </div>
            </td>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roster Karyawan" />

            <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-10">
                
                {/* Header Row */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Roster Karyawan</h1>
                            <p className="text-sm text-gray-500">Pengaturan jadwal kerja karyawan sesuai pola shift plant</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center gap-2">
                        <div className="text-sm text-gray-500 mr-4">Home &gt; Manpower & Organization &gt; <span className="text-gray-900 font-bold">Roster Karyawan</span></div>
                        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Buat Roster
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Import Excel
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                            Export Excel
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                            Print
                        </button>
                    </div>
                </div>

                <div className="max-w-[1500px] mx-auto px-6 mt-6 space-y-4">
                    
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-end gap-3 mb-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Periode</label>
                            <div className="relative">
                                <svg className="w-4 h-4 absolute left-2 top-2 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                <select className="pl-8 pr-8 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white min-w-[140px] focus:outline-none">
                                    <option>September 2026</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Departemen</label>
                            <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white min-w-[120px] focus:outline-none">
                                <option>Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Shift</label>
                            <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white min-w-[100px] focus:outline-none">
                                <option>Semua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                            <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white min-w-[100px] focus:outline-none">
                                <option>Aktif</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 relative min-w-[200px]">
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                            <input type="text" placeholder="Cari NRP atau nama karyawan..." className="w-full border border-gray-300 rounded text-sm px-2 py-2 pl-8 focus:outline-none focus:border-gray-400" />
                        </div>
                        
                        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-2 rounded text-sm font-bold flex items-center gap-1.5 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                            Cari
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm font-bold flex items-center gap-1.5 shadow-sm transition h-[34px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                            Reset
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="bg-[#3b82f6] rounded-lg p-3 flex items-center gap-3 text-white shadow-sm border border-[#2563eb]">
                            <div className="p-2 bg-white/20 rounded-full shrink-0"><svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
                            <div>
                                <div className="text-xs font-bold opacity-90 uppercase">Total Karyawan</div>
                                <div className="text-2xl font-black leading-tight">128</div>
                                <div className="text-[9px] font-bold opacity-80">Orang</div>
                            </div>
                        </div>
                        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-3 flex items-center gap-3 shadow-sm">
                            <div className="p-2 bg-[#d1fae5] text-[#10b981] rounded-full shrink-0"><svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg></div>
                            <div>
                                <div className="text-xs font-bold text-gray-700 uppercase">Shift Siang (S)</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">64</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang (50.0%)</div>
                            </div>
                        </div>
                        <div className="bg-[#312e81] border border-[#3730a3] rounded-lg p-3 flex items-center gap-3 text-white shadow-sm">
                            <div className="p-2 bg-white/20 rounded-full shrink-0"><svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M9.37 5.51A7.35 7.35 0 0 0 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0 1 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg></div>
                            <div>
                                <div className="text-xs font-bold opacity-90 uppercase">Shift Malam (M)</div>
                                <div className="text-2xl font-black leading-tight">52</div>
                                <div className="text-[9px] font-bold opacity-80">Orang (40.6%)</div>
                            </div>
                        </div>
                        <div className="bg-[#fef9c3] border border-[#fef08a] rounded-lg p-3 flex items-center gap-3 shadow-sm">
                            <div className="p-2 bg-[#fef08a] text-[#ca8a04] rounded-full shrink-0"><svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></div>
                            <div>
                                <div className="text-xs font-bold text-gray-700 uppercase">Off Day (O)</div>
                                <div className="text-2xl font-black text-gray-900 leading-tight">12</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang (9.4%)</div>
                            </div>
                        </div>
                        <div className="bg-[#fee2e2] border border-[#fecaca] rounded-lg p-3 flex items-center gap-3 shadow-sm">
                            <div className="p-2 bg-[#fecaca] text-[#ef4444] rounded-full shrink-0"><svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
                            <div>
                                <div className="text-xs font-bold text-gray-700 uppercase">Cuti</div>
                                <div className="text-2xl font-black text-[#ef4444] leading-tight">0</div>
                                <div className="text-[9px] font-bold text-gray-500">Orang (0.0%)</div>
                            </div>
                        </div>
                    </div>

                    {/* Roster Grid */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-800">Roster Karyawan - September 2026</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse min-w-max">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="px-2 py-1.5 font-bold text-center border-r border-gray-200 w-8">No</th>
                                        <th className="px-2 py-1.5 font-bold text-center border-r border-gray-200 w-16">NRP</th>
                                        <th className="px-2 py-1.5 font-bold text-left border-r border-gray-200 min-w-[120px]">Nama Karyawan</th>
                                        <th className="px-2 py-1.5 font-bold text-left border-r border-gray-200 w-24">Jabatan</th>
                                        <th className="px-2 py-1.5 font-bold text-left border-r border-gray-200 w-24">Departemen</th>
                                        
                                        {/* Date Headers */}
                                        {dates.map((d, i) => (
                                            <th key={i} className={`px-1 py-1 text-center border-r border-gray-200 w-7 ${d.isWeekend ? 'bg-gray-200' : ''}`}>
                                                <div className="text-xs font-bold text-gray-900 leading-none">{d.date}</div>
                                                <div className="text-[8px] text-gray-500 mt-0.5 font-semibold">{d.day}</div>
                                            </th>
                                        ))}

                                        <th className="px-1 py-1 font-bold text-center border-b border-gray-200" colSpan="3">Total</th>
                                    </tr>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-center text-[9px]">
                                        <th className="border-r border-gray-200" colSpan="5"></th>
                                        {dates.map((_, i) => <th key={i} className="border-r border-gray-200"></th>)}
                                        <th className="px-1 py-0.5 border-r border-gray-200 w-6">S</th>
                                        <th className="px-1 py-0.5 border-r border-gray-200 w-6">M</th>
                                        <th className="px-1 py-0.5 w-6">O</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, idx) => {
                                        // Generate 20 items to match visual layout
                                        const expandedShifts = getExtendedShifts(item.shifts);
                                        const totals = getTotals(expandedShifts);
                                        
                                        // Mock Departemen based on Posisi
                                        let dept = 'Plant';
                                        if (item.posisi.includes('Mekanik')) dept = 'Workshop';
                                        if (item.posisi.includes('Elektrikal')) dept = 'Electrical';
                                        if (item.posisi.includes('Tyre')) dept = 'Tyre';
                                        if (idx === 0) dept = 'Plant'; // Make Budi Santoso Plant Supervisor matching mock

                                        return (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/30">
                                                <td className="px-2 py-1 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                                                <td className="px-2 py-1 text-center font-mono border-r border-gray-100 text-gray-700">{item.nrp.replace('MEK-','10000').replace('ELC-','10000')}</td>
                                                <td className="px-2 py-1 font-semibold text-gray-800 border-r border-gray-100">{item.nama}</td>
                                                <td className="px-2 py-1 text-gray-700 border-r border-gray-100">{item.posisi.replace('Elektrikal', 'Electrical')}</td>
                                                <td className="px-2 py-1 text-gray-700 border-r border-gray-100">{dept}</td>
                                                
                                                {/* Render Date Cells */}
                                                {expandedShifts.map((shift, i) => renderShiftCell(shift, dates[i].isWeekend, i))}

                                                {/* Render Totals */}
                                                <td className="px-1 py-1 text-center font-bold text-gray-800 bg-gray-50/50 border-r border-gray-100">{totals.S}</td>
                                                <td className="px-1 py-1 text-center font-bold text-gray-800 bg-gray-50/50 border-r border-gray-100">{totals.M}</td>
                                                <td className="px-1 py-1 text-center font-bold text-gray-800 bg-gray-50/50">{totals.O}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 bg-white rounded-b-lg">
                            <div>Menampilkan 1 - {data.length} dari 128 data</div>
                            <div className="flex gap-1">
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&laquo;</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&lt;</button>
                                <button className="px-2.5 py-1 rounded border border-[#00a65a] bg-[#00a65a] text-white font-bold">1</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">2</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">3</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">4</button>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">5</button>
                                <span className="px-1 py-1">...</span>
                                <button className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">9</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&gt;</button>
                                <button className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">&raquo;</button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        
                        {/* Pola Shift Standar */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Pola Shift Standar</h3>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5">
                                    <div className="w-6 h-6 bg-[#16a34a] text-white font-bold text-xs rounded flex items-center justify-center shrink-0">S</div>
                                    <div className="flex-1 text-xs text-gray-700 font-medium">Shift Siang</div>
                                    <div className="text-xs text-gray-500">06:00 - 18:00</div>
                                    <div className="text-xs text-gray-800 font-bold w-12 text-right">12 Jam</div>
                                </div>
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5">
                                    <div className="w-6 h-6 bg-[#3b82f6] text-white font-bold text-xs rounded flex items-center justify-center shrink-0">M</div>
                                    <div className="flex-1 text-xs text-gray-700 font-medium">Shift Malam</div>
                                    <div className="text-xs text-gray-500">18:00 - 06:00</div>
                                    <div className="text-xs text-gray-800 font-bold w-12 text-right">12 Jam</div>
                                </div>
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5">
                                    <div className="w-6 h-6 bg-gray-400 text-white font-bold text-xs rounded flex items-center justify-center shrink-0">O</div>
                                    <div className="flex-1 text-xs text-gray-700 font-medium">Off Day</div>
                                    <div className="text-xs text-gray-500">-</div>
                                    <div className="text-xs text-gray-800 font-bold w-12 text-right">-</div>
                                </div>
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5">
                                    <div className="w-6 h-6 bg-[#ef4444] text-white font-bold text-xs rounded flex items-center justify-center shrink-0">C</div>
                                    <div className="flex-1 text-xs text-gray-700 font-medium">Cuti</div>
                                    <div className="text-xs text-gray-500">-</div>
                                    <div className="text-xs text-gray-800 font-bold w-12 text-right">-</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-[#eab308] text-white font-bold text-xs rounded flex items-center justify-center shrink-0">D</div>
                                    <div className="flex-1 text-xs text-gray-700 font-medium">Dinas Luar</div>
                                    <div className="text-xs text-gray-500">-</div>
                                    <div className="text-xs text-gray-800 font-bold w-12 text-right">-</div>
                                </div>
                            </div>
                        </div>

                        {/* Rekapitulasi Roster */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Rekapitulasi Roster September 2026</h3>
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-1.5 px-2 font-bold text-gray-700">Keterangan</th>
                                        <th className="py-1.5 px-2 font-bold text-gray-700 text-center">Jumlah</th>
                                        <th className="py-1.5 px-2 font-bold text-gray-700 text-center">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-1.5 px-2 flex items-center gap-2 text-gray-700"><span className="w-2.5 h-2.5 bg-[#16a34a] rounded-sm"></span> Shift Siang (S)</td>
                                        <td className="py-1.5 px-2 text-center">2,048</td>
                                        <td className="py-1.5 px-2 text-center">50.0%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-2 flex items-center gap-2 text-gray-700"><span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm"></span> Shift Malam (M)</td>
                                        <td className="py-1.5 px-2 text-center">1,664</td>
                                        <td className="py-1.5 px-2 text-center">40.6%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-2 flex items-center gap-2 text-gray-700"><span className="w-2.5 h-2.5 bg-gray-400 rounded-sm"></span> Off Day (O)</td>
                                        <td className="py-1.5 px-2 text-center">384</td>
                                        <td className="py-1.5 px-2 text-center">9.4%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-2 flex items-center gap-2 text-gray-700"><span className="w-2.5 h-2.5 bg-[#ef4444] rounded-sm"></span> Cuti (C)</td>
                                        <td className="py-1.5 px-2 text-center">0</td>
                                        <td className="py-1.5 px-2 text-center">0.0%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-2 flex items-center gap-2 text-gray-700"><span className="w-2.5 h-2.5 bg-[#eab308] rounded-sm"></span> Dinas Luar (D)</td>
                                        <td className="py-1.5 px-2 text-center">0</td>
                                        <td className="py-1.5 px-2 text-center">0.0%</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                    <tr>
                                        <td className="py-1.5 px-2 text-center">Total</td>
                                        <td className="py-1.5 px-2 text-center">4,096</td>
                                        <td className="py-1.5 px-2 text-center">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Informasi */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Informasi</h3>
                            <ul className="space-y-2 text-xs text-gray-700 font-medium">
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Pola roster: 6 hari kerja 1 hari off (6S - 1O - 6M - 1O)
                                </li>
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Roster dibuat per karyawan
                                </li>
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Dapat melakukan edit manual jika ada perubahan
                                </li>
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Support import/export Excel
                                </li>
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Cuti dan dinas luar otomatis terhitung
                                </li>
                                <li className="flex gap-2">
                                    <svg className="w-3.5 h-3.5 fill-[#00a65a] shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Data roster terintegrasi dengan perhitungan manpower
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
