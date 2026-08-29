import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ units, stats, locations, engineMakes, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [locationFilter, setLocationFilter] = useState(filters.location || '');
    const [engineMakeFilter, setEngineMakeFilter] = useState(filters.engine_make || '');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

    // Import Form
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    const { delete: destroy } = useForm();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('units.index'), {
            search,
            status: statusFilter,
            location: locationFilter,
            engine_make: engineMakeFilter,
        }, { preserveState: true });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            search,
            status: key === 'status' ? value : statusFilter,
            location: key === 'location' ? value : locationFilter,
            engine_make: key === 'engine_make' ? value : engineMakeFilter,
        };

        if (key === 'status') setStatusFilter(value);
        if (key === 'location') setLocationFilter(value);
        if (key === 'engine_make') setEngineMakeFilter(value);

        router.get(route('units.index'), newFilters, { preserveState: true });
    };

    const handleDelete = (id, code) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data unit [${code}]?`)) {
            destroy(route('units.destroy', id));
        }
    };

    const handleDeleteAll = () => {
        destroy(route('units.delete.all'), {
            onSuccess: () => {
                setIsDeleteAllModalOpen(false);
            },
        });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importData.file) return;

        postImport(route('units.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                resetImport();
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Operational':
            case 'Ready':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 mr-1 rounded-full bg-emerald-500"></span>
                        {status}
                    </span>
                );
            case 'Breakdown':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                        <span className="w-1.5 h-1.5 mr-1 rounded-full bg-red-500"></span>
                        Breakdown
                    </span>
                );
            case 'Maintenance':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <span className="w-1.5 h-1.5 mr-1 rounded-full bg-amber-500"></span>
                        Maintenance
                    </span>
                );
            case 'Standby':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        <span className="w-1.5 h-1.5 mr-1 rounded-full bg-sky-500"></span>
                        Standby
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout header="Populasi Unit (Plant Equipment)">
            <Head title="Populasi Unit" />

            {/* Flash Message */}
            {flash?.message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-3"
                >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{flash.message}</span>
                </motion.div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        Total Populasi
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {stats.total} <span className="text-xs font-normal text-gray-400">Unit</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-l-emerald-500 border-t border-r border-b border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        Operational (Ready)
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {stats.operational} <span className="text-xs font-normal text-gray-400">Unit</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-l-red-500 border-t border-r border-b border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                        Breakdown (BD)
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {stats.breakdown} <span className="text-xs font-normal text-gray-400">Unit</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-l-amber-500 border-t border-r border-b border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                        Maintenance (PM)
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {stats.maintenance} <span className="text-xs font-normal text-gray-400">Unit</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-l-sky-500 border-t border-r border-b border-gray-100 dark:border-gray-700/60 shadow-xs col-span-2 lg:col-span-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                        Standby
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {stats.standby} <span className="text-xs font-normal text-gray-400">Unit</span>
                    </div>
                </div>
            </div>

            {/* Action Bar & Filters */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-6 p-4 sm:p-5 border border-gray-100 dark:border-gray-700/60">
                <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                    {/* Search & Filters */}
                    <form onSubmit={handleSearch} className="w-full xl:w-auto flex-1 flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Code Unit, Model, S/N Chassis, Engine, HP, KW, No.Police, Lokasi..."
                                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-violet-500 text-gray-800 dark:text-gray-100"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5 fill-current" viewBox="0 0 16 16">
                                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                                <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                            </svg>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="Operational">Operational</option>
                            <option value="Breakdown">Breakdown</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Standby">Standby</option>
                        </select>

                        <select
                            value={locationFilter}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">Semua Lokasi</option>
                            {locations && locations.map((loc, idx) => (
                                <option key={idx} value={loc}>{loc}</option>
                            ))}
                        </select>

                        <select
                            value={engineMakeFilter}
                            onChange={(e) => handleFilterChange('engine_make', e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">Semua Engine Make</option>
                            {engineMakes && engineMakes.map((em, idx) => (
                                <option key={idx} value={em}>{em}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition shrink-0"
                        >
                            Filter
                        </button>
                    </form>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-xs transition"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M14.707 10.293a1 1 0 00-1.414 0L11 12.586V4a1 1 0 00-2 0v8.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" />
                                <path d="M3 16a1 1 0 001 1h12a1 1 0 001-1v-2a1 1 0 10-2 0v1H5v-1a1 1 0 10-2 0v2z" />
                            </svg>
                            Import Excel
                        </button>

                        <a
                            href={route('units.export.pdf', { status: statusFilter, location: locationFilter, engine_make: engineMakeFilter })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-xs transition"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2zm8-14l3 3h-3V4zM6 10h8v2H6v-2zm0 3h8v2H6v-2z" />
                            </svg>
                            Export PDF
                        </a>

                        <Link
                            href={route('units.create')}
                            className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-xs transition"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                            </svg>
                            Tambah Unit
                        </Link>

                        {/* Delete All Data Button */}
                        {units.total > 0 && (
                            <button
                                onClick={() => setIsDeleteAllModalOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-rose-600 dark:bg-gray-700 dark:hover:bg-rose-600 text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white font-semibold py-2 px-3 rounded-lg text-xs transition border border-gray-200 dark:border-gray-600 hover:border-rose-600"
                                title="Hapus Semua Data Unit"
                            >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Hapus Semua
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Table with all 20 columns including separate Remarks & Status */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-3 py-3 font-bold text-center">No</th>
                                <th scope="col" className="px-3 py-3 font-bold text-violet-700 dark:text-violet-400">CODE UNIT</th>
                                <th scope="col" className="px-3 py-3 font-bold text-right">HM</th>
                                <th scope="col" className="px-3 py-3 font-bold">Model</th>
                                <th scope="col" className="px-3 py-3 font-bold">S/N CHASSIS</th>
                                <th scope="col" className="px-3 py-3 font-bold">ENGINE MODEL</th>
                                <th scope="col" className="px-3 py-3 font-bold">S/N ENGINE</th>
                                <th scope="col" className="px-3 py-3 font-bold">ENGINE MAKE</th>
                                <th scope="col" className="px-3 py-3 font-bold">CAPACITY</th>
                                <th scope="col" className="px-3 py-3 font-bold">NO.POLICE</th>
                                <th scope="col" className="px-3 py-3 font-bold">ATTACHMENTS</th>
                                <th scope="col" className="px-3 py-3 font-bold">HP</th>
                                <th scope="col" className="px-3 py-3 font-bold">KW</th>
                                <th scope="col" className="px-3 py-3 font-bold text-center">TAHUN</th>
                                <th scope="col" className="px-3 py-3 font-bold">REC. DATE</th>
                                <th scope="col" className="px-3 py-3 font-bold">REC. FROM</th>
                                <th scope="col" className="px-3 py-3 font-bold">LOCATION</th>
                                <th scope="col" className="px-3 py-3 font-bold">BEFORE FROM</th>
                                <th scope="col" className="px-3 py-3 font-bold text-violet-600 dark:text-violet-400">REMARKS</th>
                                <th scope="col" className="px-3 py-3 font-bold text-center">STATUS</th>
                                <th scope="col" className="px-3 py-3 font-bold text-right sticky right-0 bg-gray-50 dark:bg-gray-700 shadow-l">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => (
                                    <tr
                                        key={unit.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-3 py-2.5 text-center text-gray-500 font-mono font-bold">
                                            {unit.no_urut || ((units.from || 1) + index)}
                                        </td>
                                        <td className="px-3 py-2.5 font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                                            {unit.code_unit}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white font-mono whitespace-nowrap">
                                            {Number(unit.hm).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
                                        </td>
                                        <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                                            {unit.model || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {unit.sn_chassis || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.engine_model || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {unit.sn_engine || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.engine_make || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.equipment_capacity || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                                            {unit.no_police || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 max-w-xs truncate" title={unit.attachments}>
                                            {unit.attachments || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap font-mono">
                                            {unit.hp || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap font-mono">
                                            {unit.kw || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-mono whitespace-nowrap">
                                            {unit.tahun_perakitan || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.received_date || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.received_from || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            {unit.location || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.before_from || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 max-w-xs truncate text-gray-700 dark:text-gray-300" title={unit.remarks}>
                                            {unit.remarks || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                            {getStatusBadge(unit.status)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right sticky right-0 bg-white dark:bg-gray-800 shadow-l whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('units.edit', unit.id)}
                                                    className="p-1.5 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition"
                                                    title="Edit Unit"
                                                >
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(unit.id, unit.code_unit)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                                                    title="Hapus Unit"
                                                >
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="21" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        Belum ada data populasi unit yang ditemukan. Silakan tambahkan unit baru atau gunakan fitur Import Excel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {units.links && units.links.length > 3 && (
                    <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                        <div>
                            Menampilkan {units.from || 0} - {units.to || 0} dari total {units.total} unit
                        </div>
                        <div className="flex gap-1">
                            {units.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded text-xs ${
                                        link.active
                                            ? 'bg-violet-600 text-white font-bold'
                                            : link.url
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Import Excel */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Import Data Populasi Unit
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Data diimpor persis sesuai nilai asli di Excel tanpa perubahan karakter atau format.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleImportSubmit} className="mt-4 space-y-4">
                                <div className="p-3.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30 flex items-center justify-between">
                                    <div className="text-xs text-violet-800 dark:text-violet-300">
                                        Unduh template Excel dengan kolom resmi terpisah HP & KW:
                                    </div>
                                    <a
                                        href={route('units.download.template')}
                                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline shrink-0 ml-2"
                                    >
                                        Unduh Template (.xlsx)
                                    </a>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                        Pilih File Excel / CSV
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => setImportData('file', e.target.files[0])}
                                        className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                        required
                                    />
                                    {importErrors.file && (
                                        <p className="text-xs text-red-500 mt-1">{importErrors.file}</p>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importProcessing || !importData.file}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition"
                                    >
                                        {importProcessing ? 'Mengimpor Data...' : 'Mulai Import'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Confirm Delete All Data */}
            <AnimatePresence>
                {isDeleteAllModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900/40"
                        >
                            <div className="flex items-center gap-3 text-red-600 mb-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Hapus Semua Data Populasi Unit?
                                </h3>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                Apakah Anda yakin ingin menghapus <strong>seluruh data unit ({stats.total} unit)</strong>? Tindakan ini bersifat permanen dan data yang dihapus tidak dapat dipulihkan kembali.
                            </p>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteAllModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAll}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                                >
                                    Ya, Hapus Semua Data
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
