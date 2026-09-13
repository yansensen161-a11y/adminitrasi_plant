import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Create({ nextNo }) {
    const { data, setData, post, processing, errors } = useForm({
        no_urut: nextNo || '',
        code_unit: '',
        type_unit: '',
        hm: '',
        model: '',
        sn_chassis: '',
        engine_model: '',
        sn_engine: '',
        engine_make: '',
        equipment_capacity: '',
        no_police: '',
        attachments: '',
        hp: '',
        kw: '',
        tahun_perakitan: new Date().getFullYear(),
        received_date: '',
        received_from: '',
        location: '',
        before_from: '',
        remarks: '',
        status: 'Operational',
    });

    useEffect(() => {
        if (data.code_unit) {
            const code = data.code_unit.toUpperCase();
            let detectedType = '';
            
            if (code.startsWith('MEO') || code.startsWith('ME0')) detectedType = 'EXCAVATOR';
            else if (code.startsWith('MD0') || code.startsWith('MDO')) detectedType = 'DOZER';
            else if (code.startsWith('MG0') || code.startsWith('MGO')) detectedType = 'MOTORGRADER';
            else if (code.startsWith('MCP0') || code.startsWith('MCPO')) detectedType = 'COMPACTOR';
            else if (code.startsWith('OHT')) detectedType = 'HAULER';
            else if (code.startsWith('MDT')) detectedType = 'DUMP TRUCK';
            else if (code.startsWith('LV')) detectedType = 'LIGHT VEHICLE';
            else if (code.startsWith('MTL')) detectedType = 'TOWER LAMP';
            else if (code.startsWith('MGS')) detectedType = 'GENSET';
            else if (code.startsWith('MWM')) detectedType = 'WELDING MACHINE';
            else if (code.startsWith('MCM')) detectedType = 'AIR COMPRESSOR';
            else if (code.startsWith('MSC')) detectedType = 'CRUSHER STONE';
            else if (code.startsWith('MLT')) detectedType = 'LUBECAR';
            else if (code.startsWith('MFT')) detectedType = 'FUEL TRUCK';
            else if (code.startsWith('MWT')) detectedType = 'WATER TRUCK';
            else if (code.startsWith('MCT') || code.startsWith('MC 02') || code.startsWith('MC02')) detectedType = 'CRANE TRUCK';
            else if (code.startsWith('MWP')) detectedType = 'DEWATERING';
            else if (code.startsWith('MWF')) detectedType = 'WATERFILL';
            else if (code.startsWith('MB0') || code.startsWith('MBO')) detectedType = 'BIS';
            else if (code.startsWith('MMH')) detectedType = 'MAINHAUL';

            if (detectedType && data.type_unit !== detectedType) {
                setData('type_unit', detectedType);
            }
        }
    }, [data.code_unit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('units.store'));
    };

    return (
        <AuthenticatedLayout header="Tambah Unit Baru">
            <Head title="Tambah Unit" />

            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={route('units.index')}
                        className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline gap-1"
                    >
                        &larr; Kembali ke Populasi Unit
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Formulir Pendaftaran Unit Alat
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Lengkapi spesifikasi teknis, data mesin (HP & KW terpisah), dan nomor urut inventaris plant.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Section 1: Identitas Dasar */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 pb-1 border-b border-emerald-100 dark:border-emerald-900/30">
                                1. Identitas & Legalitas Unit
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        No. Urut
                                    </label>
                                    <input
                                        type="number"
                                        value={data.no_urut}
                                        onChange={(e) => setData('no_urut', e.target.value)}
                                        placeholder="1, 2, 3..."
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    {errors.no_urut && <p className="text-sm text-red-500 mt-1">{errors.no_urut}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        CODE UNIT <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code_unit}
                                        onChange={(e) => setData('code_unit', e.target.value)}
                                        placeholder="Contoh: EX-201, DT-101"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                    {errors.code_unit && <p className="text-sm text-red-500 mt-1">{errors.code_unit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        TYPE UNIT
                                    </label>
                                    <input
                                        type="text"
                                        value={data.type_unit}
                                        onChange={(e) => setData('type_unit', e.target.value)}
                                        placeholder="Contoh: EXCAVATOR, DOZER"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        Model Unit
                                    </label>
                                    <input
                                        type="text"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        placeholder="Contoh: PC200-8, HD785-7"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        S/N CHASSIS (Rangka / VIN)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sn_chassis}
                                        onChange={(e) => setData('sn_chassis', e.target.value)}
                                        placeholder="Contoh: KMTC2008X01923"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        NO. POLICE
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_police}
                                        onChange={(e) => setData('no_police', e.target.value)}
                                        placeholder="Contoh: KT 8192 UT atau -"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        TAHUN PERAKITAN
                                    </label>
                                    <input
                                        type="number"
                                        value={data.tahun_perakitan}
                                        onChange={(e) => setData('tahun_perakitan', e.target.value)}
                                        placeholder="Contoh: 2022"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        Status Unit <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                        <option value="Operational">Operational (Ready)</option>
                                        <option value="Breakdown">Breakdown (BD)</option>
                                        <option value="Maintenance">Maintenance (PM Service)</option>
                                        <option value="Standby">Standby (Idle)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Mesin & Kapasitas */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 pb-1 border-b border-emerald-100 dark:border-emerald-900/30">
                                2. Spesifikasi Mesin & Kapasitas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        ENGINE MAKE
                                    </label>
                                    <input
                                        type="text"
                                        value={data.engine_make}
                                        onChange={(e) => setData('engine_make', e.target.value)}
                                        placeholder="Contoh: Komatsu, CAT"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        ENGINE MODEL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.engine_model}
                                        onChange={(e) => setData('engine_model', e.target.value)}
                                        placeholder="Contoh: SAA6D107E-1"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        S/N ENGINE
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sn_engine}
                                        onChange={(e) => setData('sn_engine', e.target.value)}
                                        placeholder="Contoh: ENG-88219"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        EQUIPMENT CAPACITY
                                    </label>
                                    <input
                                        type="text"
                                        value={data.equipment_capacity}
                                        onChange={(e) => setData('equipment_capacity', e.target.value)}
                                        placeholder="Contoh: 0.93 m3 / 91 Ton"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        HP (Horsepower)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.hp}
                                        onChange={(e) => setData('hp', e.target.value)}
                                        placeholder="Contoh: 148 HP"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        KW (Kilowatt)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kw}
                                        onChange={(e) => setData('kw', e.target.value)}
                                        placeholder="Contoh: 110 KW"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        ATTACHMENTS
                                    </label>
                                    <input
                                        type="text"
                                        value={data.attachments}
                                        onChange={(e) => setData('attachments', e.target.value)}
                                        placeholder="Contoh: Standard Bucket, Straight Tilt Blade"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Operasional & Riwayat */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 pb-1 border-b border-emerald-100 dark:border-emerald-900/30">
                                3. Operasional, Lokasi & Riwayat
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        HM (Hour Meter)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.hm}
                                        onChange={(e) => setData('hm', e.target.value)}
                                        placeholder="Contoh: 4520.5"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-mono text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        LOCATION (Lokasi / Site)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Site Sangatta, Workshop Central"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        RECEIVED DATE
                                    </label>
                                    <input
                                        type="text"
                                        value={data.received_date}
                                        onChange={(e) => setData('received_date', e.target.value)}
                                        placeholder="Contoh: 2022-03-15"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        RECEIVED FROM
                                    </label>
                                    <input
                                        type="text"
                                        value={data.received_from}
                                        onChange={(e) => setData('received_from', e.target.value)}
                                        placeholder="Contoh: United Tractors Jakarta"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        BEFORE FROM (Asal Unit Sebelumnya)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.before_from}
                                        onChange={(e) => setData('before_from', e.target.value)}
                                        placeholder="Contoh: Workshop Balikpapan / New Delivery"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                                        Remarks (Catatan)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        placeholder="Contoh: Siap operasi, attachment lengkap"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <Link
                                href={route('units.index')}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Data Unit'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
