import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Plus,
    Search,
    Printer,
    Edit3,
    Trash2,
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    Filter,
    RotateCcw,
    Eye,
    SlidersHorizontal,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

export default function Index({
    reports = { data: [] },
    stats = { total: 0, this_month: 0, approved: 0, avg_hm_life: 0 },
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'ALL');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [deletingId, setDeletingId] = useState(null);
    const clickTimerRef = React.useRef(null);

    const handleRowClick = (item, e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.no-row-click')) {
            return;
        }
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }
        clickTimerRef.current = setTimeout(() => {
            router.visit(route('ccr.show', item.id));
            clickTimerRef.current = null;
        }, 250);
    };

    const handleRowDoubleClick = (item, e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.no-row-click')) {
            return;
        }
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }
        router.visit(route('ccr.edit', item.id));
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('ccr.index'), {
            search: searchTerm,
            status: selectedStatus,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('ALL');
        setDateFrom('');
        setDateTo('');
        router.get(route('ccr.index'), {}, { replace: true });
    };

    const handleDelete = (id, reportNo) => {
        if (confirm(`Apakah Anda yakin ingin menghapus laporan CCR "${reportNo}"?`)) {
            router.delete(route('ccr.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Conditions Component Report (CCR)" />

            {/* Header & Breadcrumb */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-3 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                CONDITIONS COMPONENT REPORT (CCR)
                            </h1>
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                                System Plant
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
                            Monitoring kondisi, analisis kerusakan, dan riwayat umur komponen unit
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('ccr.create')}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-600/30 hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Laporan CCR
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-purple-500 rounded-r-2xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Laporan CCR</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Seluruh arsip kondisi</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-500 rounded-r-2xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Bulan Ini</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.this_month}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Laporan baru dibuat</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500 rounded-r-2xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Terverifikasi / Approved</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.approved}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Disetujui Spv / Superintendant</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-500 rounded-r-2xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Rata-rata HM Life</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.avg_hm_life} <span className="text-sm font-bold text-gray-500">Hrs</span></p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Ketahanan umur komponen</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm mb-6">
                <form onSubmit={handleFilter} className="flex flex-col lg:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari No. WO CCR, No. Unit, Model, Serial No, Proyek..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>

                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent border-none text-xs focus:ring-0 p-0 text-gray-700 dark:text-slate-300"
                                title="Dari Tanggal"
                            />
                            <span className="text-gray-400 text-xs">s/d</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent border-none text-xs focus:ring-0 p-0 text-gray-700 dark:text-slate-300"
                                title="Sampai Tanggal"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1"
                            title="Reset Filter"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Reports Table Header Info */}
            <div className="flex items-center justify-between mb-2 px-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Tip: <strong>Klik 1x</strong> pada baris untuk <strong>View / Cetak</strong>, <strong>Klik 2x (Double-Klik)</strong> untuk <strong>Edit Langsung</strong></span>
                </span>
                <span className="text-gray-400 text-[11px]">Total: {reports.total || 0} laporan</span>
            </div>

            {/* Reports Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/80 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-3.5 text-center w-12">No</th>
                                <th className="px-5 py-3.5">WO CCR</th>
                                <th className="px-5 py-3.5">Unit & Model</th>
                                <th className="px-5 py-3.5">Proyek & Lokasi</th>
                                <th className="px-5 py-3.5">Tanggal Lapor</th>
                                <th className="px-5 py-3.5">Life Time & HM</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {reports.data && reports.data.length > 0 ? (
                                reports.data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        onClick={(e) => handleRowClick(item, e)}
                                        onDoubleClick={(e) => handleRowDoubleClick(item, e)}
                                        className="hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group select-none"
                                        title="Klik 1x: View Dokumen | Klik 2x: Edit Laporan"
                                    >
                                        <td className="px-5 py-4 text-center font-bold text-gray-400">
                                            {(reports.current_page - 1) * reports.per_page + index + 1}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                                <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline">{item.report_no}</span>
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                                                    Double-klik: Edit ✏️
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                                By: <span className="font-semibold text-gray-700 dark:text-slate-300">{item.reported_by || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {item.unit_code || (item.unit ? item.unit.code_unit : '-')}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400">
                                                {item.model || '-'} {item.serial_no ? `(SN: ${item.serial_no})` : ''}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-gray-800 dark:text-slate-200">
                                                {item.project || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {item.location || '-'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {formatDate(item.date_reported)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400">
                                                Fail: {formatDate(item.date_failure)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 w-fit">
                                                    Life: {item.life_time_days !== null ? `${item.life_time_days} Days` : '0 Days'}
                                                </span>
                                                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                                                    HM Life: {item.hm_life !== null ? `${item.hm_life} Hrs` : '0 Hrs'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                item.status === 'APPROVED'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                                    : item.status === 'CLOSED'
                                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                            }`}>
                                                {item.status || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('ccr.show', item.id)}
                                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                                                    title="Lihat / Cetak Laporan"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('ccr.edit', item.id)}
                                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                                                    title="Edit Laporan"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.report_no)}
                                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                                                    title="Hapus Laporan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center text-gray-400 dark:text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-semibold text-base">Belum ada laporan CCR yang ditemukan</p>
                                        <p className="text-xs mt-1">Silakan buat laporan kondisi komponen baru dengan menekan tombol diatas.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {reports.links && reports.links.length > 3 && (
                    <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Menampilkan <span className="font-bold">{reports.from || 0}</span> sampai <span className="font-bold">{reports.to || 0}</span> dari <span className="font-bold">{reports.total || 0}</span> laporan
                        </div>
                        <div className="flex gap-1">
                            {reports.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : link.url
                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                                            : 'text-gray-400 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
