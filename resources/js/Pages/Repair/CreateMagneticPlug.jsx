import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateMagneticPlug({ auth, units }) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        hm: '',
        date: '',
        metode_filter: '',
        component: '',
        rating: '',
        remarks: '',
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('repair.magnetic-plug.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Input Data Magnetic Plug" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-[#0b132b] uppercase tracking-tight">Input Data Magnetic Plug</h1>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">Formulir penambahan data inspeksi magnetic plug</p>
                </div>
                <Link href={route('repair.magnetic-plug')} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    Kembali
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={submit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.unit_id} 
                                    onChange={e => setData('unit_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Unit</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>{unit.code_unit}</option>
                                    ))}
                                </select>
                                {errors.unit_id && <p className="text-red-500 text-sm mt-1">{errors.unit_id}</p>}
                            </div>

                            {/* HM */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Hour Meter (HM) <span className="text-red-500">*</span></label>
                                <input 
                                    type="number"
                                    step="0.1" 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.hm} 
                                    onChange={e => setData('hm', e.target.value)}
                                    placeholder="Contoh: 12500.5"
                                    required
                                />
                                {errors.hm && <p className="text-red-500 text-sm mt-1">{errors.hm}</p>}
                            </div>

                            {/* Tanggal */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Inspeksi <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.date} 
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            {/* Metode Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Metode Filter <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.metode_filter} 
                                    onChange={e => setData('metode_filter', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Metode</option>
                                    <option value="Magnetic Plug">Magnetic Plug</option>
                                    <option value="Cutting Filter">Cutting Filter</option>
                                    <option value="Check Cylinder">Check Cylinder</option>
                                    <option value="Check Strainer">Check Strainer</option>
                                </select>
                                {errors.metode_filter && <p className="text-red-500 text-sm mt-1">{errors.metode_filter}</p>}
                            </div>

                            {/* Component */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Komponen <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.component} 
                                    onChange={e => setData('component', e.target.value)}
                                    placeholder="Contoh: Differential, Final Drive LH"
                                    required
                                />
                                {errors.component && <p className="text-red-500 text-sm mt-1">{errors.component}</p>}
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rating Kondisi <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    value={data.rating} 
                                    onChange={e => setData('rating', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Rating</option>
                                    <option value="Rating A">RATING A</option>
                                    <option value="Rating B">RATING B</option>
                                    <option value="Rating C">RATING C</option>
                                    <option value="Rating X">RATING X</option>
                                </select>
                                {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
                            </div>

                            {/* Remarks */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Remarks / Catatan</label>
                                <textarea 
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    rows="3"
                                    value={data.remarks} 
                                    onChange={e => setData('remarks', e.target.value)}
                                    placeholder="Catatan tambahan hasil inspeksi"
                                ></textarea>
                                {errors.remarks && <p className="text-red-500 text-sm mt-1">{errors.remarks}</p>}
                            </div>

                            {/* Photo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Foto Kondisi / Serpihan (Opsional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#0b5c3e] focus:ring-1 focus:ring-[#0b5c3e]"
                                    onChange={e => setData('photo', e.target.files[0])}
                                />
                                {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                                <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG, Max: 2MB.</p>
                            </div>

                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <Link href={route('repair.magnetic-plug')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-sm transition">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2">
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
