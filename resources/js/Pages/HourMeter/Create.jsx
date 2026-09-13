import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Create({ units = [], defaultDate = '' }) {
    const { data, setData, post, processing, errors } = useForm({
        code_unit: '',
        log_date: defaultDate || new Date().toISOString().split('T')[0],
        hm_start: 0,
        hm_end: 0,
        hm_total: 0,
        shift: 'Shift 1',
        operator_name: '',
        location: '',
        remarks: '',
    });

    const handleUnitChange = (code) => {
        const selected = (units || []).find((u) => u.code_unit === code);
        const currentHm = selected ? Number(selected.hm) : 0;
        const currentLocation = selected?.location || '';

        setData((prev) => ({
            ...prev,
            code_unit: code,
            hm_start: currentHm,
            hm_end: currentHm,
            hm_total: 0,
            location: currentLocation || prev.location,
        }));
    };

    const handleHmEndChange = (val) => {
        const endNum = parseFloat(val) || 0;
        const startNum = parseFloat(data.hm_start) || 0;
        const total = Math.max(0, parseFloat((endNum - startNum).toFixed(1)));

        setData((prev) => ({
            ...prev,
            hm_end: val,
            hm_total: total,
        }));
    };

    const handleHmStartChange = (val) => {
        const startNum = parseFloat(val) || 0;
        const endNum = parseFloat(data.hm_end) || 0;
        const total = Math.max(0, parseFloat((endNum - startNum).toFixed(1)));

        setData((prev) => ({
            ...prev,
            hm_start: val,
            hm_total: total,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('hour-meters.store'));
    };

    return (
        <AuthenticatedLayout header="Input Log Hour Meter (HM)">
            <Head title="Input Hour Meter" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={route('hour-meters.index')}
                        className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline gap-1"
                    >
                        &larr; Kembali ke Daftar Hour Meter
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Formulir Pencatatan Hour Meter Harian
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Masukkan pembacaan Hour Meter awal dan akhir unit untuk menghitung jam operasi harian secara otomatis.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Code Unit */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    CODE UNIT <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.code_unit}
                                    onChange={(e) => handleUnitChange(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                >
                                    <option value="">-- Pilih Code Unit Alat --</option>
                                    {units && units.map((u) => (
                                        <option key={u.id} value={u.code_unit}>
                                            {u.code_unit} ({u.model}) - HM Saat Ini: {u.hm}
                                        </option>
                                    ))}
                                </select>
                                {errors.code_unit && <p className="text-sm text-red-500 mt-1">{errors.code_unit}</p>}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    Tanggal Operasional (Date) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.log_date}
                                    onChange={(e) => setData('log_date', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                                {errors.log_date && <p className="text-sm text-red-500 mt-1">{errors.log_date}</p>}
                            </div>

                            {/* HM Start */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    HM Awal (Start) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.hm_start}
                                    onChange={(e) => handleHmStartChange(e.target.value)}
                                    placeholder="Contoh: 4512.0"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                                    required
                                />
                                {errors.hm_start && <p className="text-sm text-red-500 mt-1">{errors.hm_start}</p>}
                            </div>

                            {/* HM End */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    HM Akhir (End) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.hm_end}
                                    onChange={(e) => handleHmEndChange(e.target.value)}
                                    placeholder="Contoh: 4520.5"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                                    required
                                />
                                {errors.hm_end && <p className="text-sm text-red-500 mt-1">{errors.hm_end}</p>}
                            </div>

                            {/* Total Operating Hours calculation box */}
                            <div className="md:col-span-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                                        Total Jam Kerja Operasional (+HM)
                                    </div>
                                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                        Dihitung otomatis: HM Akhir - HM Awal
                                    </div>
                                </div>
                                <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                                    +{Number(data.hm_total).toFixed(1)} <span className="text-sm font-normal">Jam</span>
                                </div>
                            </div>

                            {/* Shift */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    Shift Kerja
                                </label>
                                <select
                                    value={data.shift}
                                    onChange={(e) => setData('shift', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    <option value="Shift 1">Shift 1 (Day)</option>
                                    <option value="Shift 2">Shift 2 (Night)</option>
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                </select>
                            </div>

                            {/* Operator Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    Nama Operator / Driver
                                </label>
                                <input
                                    type="text"
                                    value={data.operator_name}
                                    onChange={(e) => setData('operator_name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    Lokasi / Site Kerja
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Contoh: Pit Central, Site Sangatta"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                    Remarks / Catatan Kerja
                                </label>
                                <input
                                    type="text"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Contoh: Operasi normal, hauling batu bara"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <Link
                                href={route('hour-meters.index')}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {processing ? 'Menyimpan...' : 'Simpan Log HM'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
