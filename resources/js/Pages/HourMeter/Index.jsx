import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ logs, units, stats, filters, flash, errors }) {
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.code_unit || '');
    const [tipeDataFilter, setTipeDataFilter] = useState('');
    const [sumberDataFilter, setSumberDataFilter] = useState('');
    const [activeTab, setActiveTab] = useState('data-hm');

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/hour-meters', {
            date: dateFilter,
            code_unit: codeUnitFilter,
            // tipe_data and sumber_data ignored for now as they are mockup
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFilter('');
        setCodeUnitFilter('');
        setTipeDataFilter('');
        setSumberDataFilter('');
        router.get('/hour-meters', {}, { preserveState: true });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;
        postImport('/hour-meters/import', {
            onSuccess: () => { setIsImportModalOpen(false); resetImport(); },
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Update HM Unit Alat Berat" />

            {/* Flash Messages */}
            {flash?.message && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    <span>{flash.message}</span>
                </div>
            )}






            {/* Tabs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 mb-6 gap-4">
                <div className="flex gap-6 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('data-hm')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'data-hm' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Data HM
                    </button>
                    <button 
                        onClick={() => setActiveTab('riwayat-import')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat-import' ? 'border-[#0b5c3e] text-[#0b5c3e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Riwayat Import
                    </button>
                </div>
                
                <div className="flex gap-3 pb-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-2 px-4 rounded-lg text-xs transition flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        Upload Excel
                    </button>
                    <a
                        href="/hour-meters/download/template"
                        className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-xs transition flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        Download Template
                    </a>
                </div>
            </div>

            {/* Table */}
            {activeTab === 'data-hm' && (
                <>
                    <h2 className="text-xs font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-3">DATA HM</h2>
                    <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                                <thead className="bg-[#0a4d3c] text-white">
                                    <tr>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">No</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tanggal HM</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Code Unit</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Equipment</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">HM Sebelumnya</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">HM Akhir</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">HM Aktual</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Sumber Data</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Tipe Service Actual</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Deviasi (HM)</th>
                                        <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b]">Keterangan</th>
                                        <th className="px-3 py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {logs.data && logs.data.length > 0 ? (
                                        logs.data.map((log, index) => {
                                            // Mock data matching mockup based on index
                                            const deviasi = [-2, 5, -2, 10, -2, 5, -2, -5, 1, -2][index % 10];
                                            const ket = deviasi > 0 ? (deviasi === 5 ? 'Pemakaian Normal' : 'Pemakaian Lebih') : 'Normal';
                                            const serviceTypes = ['PM 250', 'PM 2000', 'PM 2000', 'PM 1000', 'PM 2000', 'PM 1000', 'PM 500', 'PM 1000', 'PM 250', 'PM 500'];
                                            
                                            // Calculate actual to mimic mockup's slight offset
                                            const actual = Number(log.hm_end) + (deviasi < 0 ? deviasi : deviasi > 5 ? 10 : 5);
                                            
                                            return (
                                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 py-2 text-center text-gray-500 font-medium">
                                                        {logs.from + index}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {formatDate(log.log_date)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-bold text-gray-900">
                                                        {log.code_unit}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-600">
                                                        {log.unit?.equipment_capacity || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {Number(log.hm_start).toLocaleString('id-ID', { minimumFractionDigits: 3 })}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-bold text-[#0b5c3e] bg-green-50/30">
                                                        {Number(log.hm_end).toLocaleString('id-ID', { minimumFractionDigits: 3 })}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-medium">
                                                        {actual.toLocaleString('id-ID', { minimumFractionDigits: 3 })}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-600">
                                                        NS (Daily)
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {serviceTypes[index % 10]}
                                                    </td>
                                                    <td className={`px-3 py-2 text-center font-bold ${deviasi > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {deviasi}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {ket}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button className="text-gray-400 hover:text-blue-600 p-1">
                                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                            </button>
                                                            <button className="text-gray-400 hover:text-green-600 p-1">
                                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                            </button>
                                                            <button className="text-gray-400 hover:text-red-600 p-1">
                                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="12" className="px-6 py-8 text-center text-gray-400">
                                                Tidak ada data update HM yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                                <div>
                                    Menampilkan {logs.from || 0} - {logs.to || 0} dari {stats?.total_data?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="flex gap-1">
                                        {logs.links.map((link, idx) => {
                                            if(link.label.includes('Previous')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400">&lt;</button>;
                                            if(link.label.includes('Next')) return <button key={idx} disabled={!link.url} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">&gt;</button>;
                                            if(link.label === '...') return <span key={idx} className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>;
                                            
                                            // Mocking the page numbers like the mockup: 1, 2, 3, 4, 5, ..., 1.246
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={!link.url || link.active}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
                                                        link.active
                                                            ? 'bg-[#0a4d3c] text-white font-bold'
                                                            : link.url
                                                            ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            : 'text-gray-400 cursor-not-allowed border border-gray-100'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <select className="ml-2 border border-gray-200 text-gray-600 text-xs rounded px-2 py-1 focus:outline-none bg-white">
                                        <option>10 / halaman</option>
                                        <option>25 / halaman</option>
                                        <option>50 / halaman</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'riwayat-import' && (
                <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-100 shadow-sm">
                    Fitur Riwayat Import belum tersedia di versi demo ini.
                </div>
            )}

            {/* Modal Import Excel */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <h3 className="text-base font-bold text-[#0b5c3e]">Upload Excel HM</h3>
                                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">&times;</button>
                            </div>
                            <form onSubmit={handleImportSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Pilih File Excel / CSV</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0b5c3e]/10 file:text-[#0b5c3e] hover:file:bg-[#0b5c3e]/20"
                                        required
                                    />
                                    {importErrors?.file && <p className="text-xs text-red-500 mt-1">{importErrors.file}</p>}
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition">Batal</button>
                                    <button type="submit" disabled={importProcessing || !importData.file} className="px-5 py-2 bg-[#0b5c3e] hover:bg-[#08422c] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition">
                                        {importProcessing ? 'Mengupload...' : 'Upload Data'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AuthenticatedLayout>
    );
}
