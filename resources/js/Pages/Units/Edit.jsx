import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Edit({ unit }) {
    const { data, setData, put, processing, errors } = useForm({
        no_urut: unit.no_urut || '',
        code_unit: unit.code_unit || '',
        type_unit: unit.type_unit || '',
        hm: unit.hm || '',
        model: unit.model || '',
        sn_chassis: unit.sn_chassis || '',
        engine_model: unit.engine_model || '',
        sn_engine: unit.sn_engine || '',
        engine_make: unit.engine_make || '',
        equipment_capacity: unit.equipment_capacity || '',
        no_police: unit.no_police || '',
        attachments: unit.attachments || '',
        hp: unit.hp || '',
        kw: unit.kw || '',
        tahun_perakitan: unit.tahun_perakitan || '',
        received_date: unit.received_date || '',
        received_from: unit.received_from || '',
        location: unit.location || '',
        before_from: unit.before_from || '',
        remarks: unit.remarks || '',
        status: unit.status || 'Operational',
    });

    useEffect(() => {
        if (data.code_unit && (!data.type_unit || data.code_unit !== unit.code_unit)) {
            const code = data.code_unit.toUpperCase();
            let detectedType = '';
            
            if (['ME023', 'ME053', 'MSC001'].includes(code) || code.startsWith('MSC')) detectedType = 'CRUSHER';
            else if (['ME049', 'ME055', 'ME056'].includes(code)) detectedType = 'EXCAVATOR BIG DIGGER';
            else if (code.startsWith('ME0') || code.startsWith('MEO') || code.startsWith('EX')) detectedType = 'EXCAVATOR SMALL DIGGER';
            else if (code.startsWith('MD0') || code.startsWith('MDO') || code.startsWith('MD')) detectedType = 'BULLDOZER';
            else if (code.startsWith('OHT')) detectedType = 'HAULER TRUCK';
            else if (code.startsWith('MDT') || code.startsWith('DT')) detectedType = 'DUMP TRUCK';
            else if (code.startsWith('MG0') || code.startsWith('MGO') || code.startsWith('MG')) detectedType = 'MOTOR GRADER';
            else if (code.startsWith('MCP0') || code.startsWith('MCPO') || code.startsWith('MCP')) detectedType = 'COMPACTOR';
            else if (code.startsWith('MTL')) detectedType = 'TOWER LAMP';
            else if (code.startsWith('MLT')) detectedType = 'SERVICE TRUCK';
            else if (code.startsWith('MFT')) detectedType = 'FUEL TRUCK';
            else if (code.startsWith('MWT')) detectedType = 'WATER TRUCK';
            else if (code.startsWith('MCT') || code.startsWith('MC 02') || code.startsWith('MC02')) detectedType = 'CRANE TRUCK & LOWBOY';
            else if (code.startsWith('MWP') || code.startsWith('MWF')) detectedType = 'DEWATERING PUMP';
            else if (code.startsWith('MB0') || code.startsWith('MBO') || code.startsWith('MMH')) detectedType = 'SARANA BUS';
            else if (code.startsWith('MGS') || code.startsWith('MCM') || code.startsWith('MWM')) detectedType = 'GENSET - COMPRESSOR - WELDING MACHINE';
            else if (code.startsWith('LV') || code === 'HO-06' || code.startsWith('T-') || code.startsWith('A-') || code.startsWith('B-') || code.startsWith('D-') || code.startsWith('G-') || code.startsWith('E-') || code.startsWith('F-') || code.startsWith('H-')) detectedType = 'LIGHT VEHICLE';
            else if (code.startsWith('MFS')) detectedType = 'FUEL STORAGE';
            else if (code.startsWith('BOX KONTAINER') || code.startsWith('KONTAINER')) detectedType = 'CONTAINER';
            else if (code.startsWith('CHAINSAW')) detectedType = 'CHAINSAW';

            if (detectedType && data.type_unit !== detectedType) {
                setData('type_unit', detectedType);
            }
        }
    }, [data.code_unit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('units.update', unit.id));
    };

    return (
        <AuthenticatedLayout header={`Edit Data Unit: ${unit.code_unit}`}>
            <Head title={`Edit Unit ${unit.code_unit}`} />

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
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Edit Spesifikasi & Data Unit
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Perbarui nomor urut, data HM, status kesiapan, atau catatan operasional unit.
                            </p>
                        </div>
                        <span className="text-sm font-mono bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            {unit.code_unit}
                        </span>
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
                                {processing ? 'Menyimpan...' : 'Perbarui Data Unit'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
