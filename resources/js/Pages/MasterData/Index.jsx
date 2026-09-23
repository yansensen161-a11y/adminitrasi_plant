import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, stats, recent_units = [], unit_types = [] }) {
    const masterModules = [
        {
            title: 'Master Populasi Unit',
            desc: 'Database seluruh unit alat berat, model, kapasitas, serial number, status, dan lokasi kerja.',
            href: '/units',
            count: `${stats.total_units || 0} Unit`,
            badge: 'Armada',
            color: 'emerald',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            title: 'Master Plan Component (PCR)',
            desc: 'Standard target life time, undercarriage, wheel, dan perencanaan jadwal pergantian komponen.',
            href: '/pcr-uc',
            count: `${stats.total_pcr || 0} Part`,
            badge: 'Komponen',
            color: 'amber',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            title: 'Master Data Manpower',
            desc: 'Database personil mekanik, teknisi, jabatan, section, dan alokasi budget tenaga kerja plant.',
            href: '/manpower',
            count: `${stats.total_manpower || 0} Orang`,
            badge: 'Personil',
            color: 'purple',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            title: 'Master Struktur Organisasi',
            desc: 'Bagan dan struktur hierarki organisasi departemen Plant Maintenance dari Superintendent hingga Mekanik.',
            href: '/organization',
            count: `${stats.total_org_nodes || 0} Divisi`,
            badge: 'Organisasi',
            color: 'teal',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
        },
        {
            title: 'Master Log Hour Meter',
            desc: 'Pencatatan dan basis data histori hour meter (HM) seluruh unit armada operasional per tanggal.',
            href: '/hour-meters',
            count: 'Daily Log',
            badge: 'HM Tracker',
            color: 'sky',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: 'Master Analisa Biaya Repair (ABR)',
            desc: 'Estimasi dan kalkulasi rincian biaya perbaikan, komponen, jasa, dan part breakdown.',
            href: '/abr',
            count: 'Estimasi',
            badge: 'Costing',
            color: 'rose',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            title: 'Master Form & Digital Checklist',
            desc: 'Sentralisasi form PM service sheet (OHT 773, Dump Truck, Genset, Washing) dan formulir penundaan service.',
            href: '/form-oht773',
            count: '5 Forms',
            badge: 'Formulir',
            color: 'emerald',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            title: 'User Management & Roles',
            desc: 'Pengaturan akun pengguna sistem, role jabatan (Planner, Foreman, Supervisor), dan hak akses.',
            href: '/users',
            count: `${stats.total_users || 0} User`,
            badge: 'Security',
            color: 'indigo',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
        },
    ];

    const getColorClasses = (color) => {
        switch (color) {
            case 'emerald':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', hover: 'hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' };
            case 'blue':
                return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:border-blue-400', badge: 'bg-blue-100 text-blue-800' };
            case 'amber':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:border-amber-400', badge: 'bg-amber-100 text-amber-800' };
            case 'purple':
                return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:border-purple-400', badge: 'bg-purple-100 text-purple-800' };
            case 'teal':
                return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', hover: 'hover:border-teal-400', badge: 'bg-teal-100 text-teal-800' };
            case 'sky':
                return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', hover: 'hover:border-sky-400', badge: 'bg-sky-100 text-sky-800' };
            case 'rose':
                return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', hover: 'hover:border-rose-400', badge: 'bg-rose-100 text-rose-800' };
            case 'indigo':
                return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:border-indigo-400', badge: 'bg-indigo-100 text-indigo-800' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', hover: 'hover:border-gray-400', badge: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Data" />

            {/* Header / Hero */}
            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Master Data Management</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Pusat pengelolaan seluruh basis data utama sistem Plant Maintenance</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/units/create"
                        className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Unit Baru
                    </Link>
                    <Link
                        href="/pcr-uc"
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                        Kelola PCR
                    </Link>
                </div>
            </div>

            {/* Top Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900">{stats.total_units || 0}</div>
                        <div className="text-sm font-medium text-gray-500">Populasi Unit</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900">{stats.total_pcr || 0}</div>
                        <div className="text-sm font-medium text-gray-500">Komponen PCR</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900">{stats.total_manpower || 0}</div>
                        <div className="text-sm font-medium text-gray-500">Manpower Plant</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900">{stats.total_org_nodes || 0}</div>
                        <div className="text-sm font-medium text-gray-500">Struktur Org</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900">{stats.total_users || 0}</div>
                        <div className="text-sm font-medium text-gray-500">User Akun</div>
                    </div>
                </div>
            </div>

            {/* Master Data Grid Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {masterModules.map((item, index) => {
                    const c = getColorClasses(item.color);
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`group bg-white p-5 rounded-2xl border ${c.border} ${c.hover} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3.5">
                                    <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${c.badge}`}>
                                        {item.badge}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                                <span className="font-bold text-gray-700">{item.count}</span>
                                <span className="text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Buka Menu
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Row: Recent Units & Unit Types Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Units Table */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Data Populasi Unit Terbaru</h3>
                            <p className="text-sm text-gray-500">Daftar 5 unit armada terakhir yang terdaftar</p>
                        </div>
                        <Link href="/units" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            Lihat Semua Unit
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2.5 font-bold">Kode Unit</th>
                                    <th className="px-3 py-2.5 font-bold">Model</th>
                                    <th className="px-3 py-2.5 font-bold">Tipe / Kapasitas</th>
                                    <th className="px-3 py-2.5 font-bold">Current HM</th>
                                    <th className="px-3 py-2.5 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {recent_units && recent_units.length > 0 ? (
                                    recent_units.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2.5 font-bold text-gray-900">{unit.code_unit}</td>
                                            <td className="px-3 py-2.5 text-gray-600">{unit.model || '-'}</td>
                                            <td className="px-3 py-2.5 text-gray-600">{unit.type_unit || unit.equipment_capacity || '-'}</td>
                                            <td className="px-3 py-2.5 font-mono text-gray-800">{unit.hm ? Number(unit.hm).toLocaleString('id-ID') : '0'}</td>
                                            <td className="px-3 py-2.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    unit.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' :
                                                    (unit.status === 'Breakdown' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
                                                }`}>
                                                    {unit.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                                            Belum ada data unit.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unit Types Summary */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Distribusi Tipe Unit</h3>
                        <p className="text-sm text-gray-500">Komposisi armada berdasarkan tipe alat</p>
                    </div>

                    <div className="space-y-3">
                        {unit_types && unit_types.length > 0 ? (
                            unit_types.slice(0, 6).map((ut, idx) => {
                                const total = stats.total_units || 1;
                                const pct = ((ut.count / total) * 100).toFixed(1);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-700">{ut.type_unit}</span>
                                            <span className="text-gray-900 font-bold">{ut.count} unit ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-sm text-gray-400">
                                Belum ada data tipe unit.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
