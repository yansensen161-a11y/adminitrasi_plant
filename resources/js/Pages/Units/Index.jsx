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

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setLocationFilter('');
        setEngineMakeFilter('');
        router.get(route('units.index'), {}, { preserveState: true });
    };

    const handleDelete = (id, code) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data unit [${code}]?`)) {
            destroy(route('units.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Operational':
            case 'Ready':
                return (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold text-[10px] uppercase">
                        Operational
                    </span>
                );
            case 'Breakdown':
                return (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[10px] uppercase">
                        Breakdown
                    </span>
                );
            case 'Maintenance':
                return (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-bold text-[10px] uppercase">
                        Maintenance
                    </span>
                );
            case 'Standby':
                return (
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                        Standby
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold text-[10px] uppercase">
                        {status}
                    </span>
                );
        }
    };

    // Calculate percentages for pie chart
    const total = stats.total || 1;
    const breakdownPct = Math.round((stats.breakdown / total) * 100) || 0;
    const maintenancePct = Math.round((stats.maintenance / total) * 100) || 0;
    const operationalPct = Math.round((stats.operational / total) * 100) || 0;
    const standbyPct = Math.round((stats.standby / total) * 100) || 0;

    const breakdownAngle = breakdownPct;
    const maintenanceAngle = breakdownAngle + maintenancePct;
    const operationalAngle = maintenanceAngle + operationalPct;

    return (
        <AuthenticatedLayout>
            <Head title="Master Unit" />

            {/* Flash Message */}
            {flash?.message && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{flash.message}</span>
                </div>
            )}



            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Total Unit</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-500">Unit Aktif</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Operational (Ready)</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.operational}</div>
                        <div className="text-xs text-gray-500">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Maintenance (PM)</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.maintenance}</div>
                        <div className="text-xs text-gray-500">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Standby</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.standby}</div>
                        <div className="text-xs text-gray-500">Unit</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Breakdown</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.breakdown}</div>
                        <div className="text-xs text-gray-500">Unit</div>
                    </div>
                </div>
            </div>



            {/* Main Table */}
            <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 mb-6">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-[13px] font-bold text-[#0b5c3e] uppercase">Daftar Populasi Unit</h2>
                    <Link
                        href={route('units.create')}
                        className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-1.5 px-3 rounded text-xs transition flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
                        Tambah Unit
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#0a4d3c] text-white">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-center whitespace-nowrap border-r border-[#0d614b]">Action</th>
                                <th className="px-3 py-3 font-semibold text-center border-r border-[#0d614b] whitespace-nowrap">No</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">CODE UNIT</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] text-right whitespace-nowrap">HM</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] text-center whitespace-nowrap">STATUS UNIT</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Model</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">S/N CHASSIS</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Engine model</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">S/N Engine</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Engine Make</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Equipment Capacitas</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">No Police</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Attachment</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">HP/KW</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Tahun perakitan</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Received date</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Received From</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Location</th>
                                <th className="px-3 py-3 font-semibold border-r border-[#0d614b] whitespace-nowrap">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {units.data && units.data.length > 0 ? (
                                units.data.map((unit, index) => (
                                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={route('units.edit', unit.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#0b5c3e] hover:bg-emerald-50 rounded bg-gray-50 border border-gray-200 transition"
                                                    title="Edit Unit"
                                                >
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(unit.id, unit.code_unit)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded bg-gray-50 border border-gray-200 transition"
                                                    title="Hapus Unit"
                                                >
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-gray-500 whitespace-nowrap">
                                            {unit.no_urut || ((units.from || 1) + index)}
                                        </td>
                                        <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                                            {unit.code_unit}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                                            {Number(unit.hm).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
                                        </td>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                            {getStatusBadge(unit.status)}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.model || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                                            {unit.sn_chassis || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.engine_model || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.sn_engine || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.engine_make || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.equipment_capacity || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.no_police || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.attachments || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.hp ? `${unit.hp} / ` : '- / '}{unit.kw ? unit.kw : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.tahun_perakitan || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.received_date ? new Date(unit.received_date).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.received_from || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.location || '-'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {unit.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                                        Tidak ada data unit yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {units.links && units.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-white">
                        <div>
                            Menampilkan {units.from || 0} - {units.to || 0} dari {units.total} data
                        </div>
                        <div className="flex gap-1">
                            {units.links.map((link, idx) => {
                                // Simplified pagination like the screenshot
                                if(link.label.includes('Previous') || link.label.includes('Next')) return null;
                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
                                            link.active
                                                ? 'bg-[#0b5c3e] text-white font-bold'
                                                : link.url
                                                ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                : 'text-gray-400 cursor-not-allowed border border-gray-100'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Ringkasan */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-[#0b5c3e] uppercase mb-4">Ringkasan Status Unit</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="font-semibold text-gray-700">Breakdown</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-gray-900 w-12 text-right">{stats.breakdown} Unit</span>
                                <span className="text-gray-500 w-12 text-right font-medium">{breakdownPct}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <span className="font-semibold text-gray-700">Maintenance</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-gray-900 w-12 text-right">{stats.maintenance} Unit</span>
                                <span className="text-gray-500 w-12 text-right font-medium">{maintenancePct}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <span className="font-semibold text-gray-700">Operational</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-gray-900 w-12 text-right">{stats.operational} Unit</span>
                                <span className="text-gray-500 w-12 text-right font-medium">{operationalPct}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                <span className="font-semibold text-gray-700">Standby</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-gray-900 w-12 text-right">{stats.standby} Unit</span>
                                <span className="text-gray-500 w-12 text-right font-medium">{standbyPct}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-gray-900">
                        <span>Total Unit Aktif</span>
                        <div className="flex gap-4">
                            <span className="w-12 text-right">{stats.total} Unit</span>
                            <span className="w-12 text-right">100%</span>
                        </div>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <h3 className="text-xs font-bold text-[#0b5c3e] uppercase mb-6 w-full text-left">Distribusi Status Unit</h3>
                    <div className="relative w-48 h-48 flex items-center justify-center mt-2">
                        {/* Conic Gradient Donut Chart */}
                        <div 
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(
                                    #ef4444 0% ${breakdownAngle}%, 
                                    #eab308 ${breakdownAngle}% ${maintenanceAngle}%, 
                                    #22c55e ${maintenanceAngle}% ${operationalAngle}%,
                                    #3b82f6 ${operationalAngle}% 100%
                                )`
                            }}
                        ></div>
                        {/* Inner white circle for Donut effect */}
                        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-800">{stats.total}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Unit</span>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-8 text-[11px] font-semibold text-gray-600">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>Breakdown ({stats.breakdown})</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>Maintenance ({stats.maintenance})</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>Operational ({stats.operational})</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>Standby ({stats.standby})</div>
                    </div>
                </div>

                {/* Service Terdekat / Unit Terbaru */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold text-[#0b5c3e] uppercase mb-4">Update Unit Terbaru</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left">
                            <thead className="text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="pb-2 font-semibold">Tahun</th>
                                    <th className="pb-2 font-semibold">Code Unit</th>
                                    <th className="pb-2 font-semibold">Model</th>
                                    <th className="pb-2 font-semibold">Lokasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                                {units.data && units.data.slice(0, 5).map((unit) => (
                                    <tr key={unit.id}>
                                        <td className="py-2.5">{unit.tahun_perakitan || '-'}</td>
                                        <td className="py-2.5 font-bold text-gray-900">{unit.code_unit}</td>
                                        <td className="py-2.5">{unit.model || '-'}</td>
                                        <td className="py-2.5">{unit.location || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
