import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        code_unit: '',
        lokasi: '',
        tipe_service: '',
        temuan: '',
        part_diperlukan: '',
        tindakan_mekanik: '',
        tingkat_backlog: 'RINGAN',
        target_pasang: '',
        tanggal_temuan: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/backlogs');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Backlog" />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tambah Backlog</h1>
                    <p className="text-sm text-gray-500">Buat data temuan backlog baru untuk unit.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden sm:flex items-center gap-1">
                        <span>Dashboard</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <Link href="/backlogs" className="hover:text-gray-800 transition-colors">Backlog</Link>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        <span className="font-semibold text-gray-600">Tambah Data</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-4xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Code Unit</label>
                            <input
                                type="text"
                                value={data.code_unit}
                                onChange={e => setData('code_unit', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                placeholder="Contoh: BDZ-002"
                            />
                            {errors.code_unit && <p className="text-red-500 text-sm mt-1">{errors.code_unit}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Lokasi</label>
                            <input
                                type="text"
                                value={data.lokasi}
                                onChange={e => setData('lokasi', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                placeholder="Contoh: Pit 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tipe Service Saat Temuan</label>
                            <input
                                type="text"
                                value={data.tipe_service}
                                onChange={e => setData('tipe_service', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                placeholder="Contoh: PM 2000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tanggal Temuan</label>
                            <input
                                type="date"
                                value={data.tanggal_temuan}
                                onChange={e => setData('tanggal_temuan', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Temuan / Deskripsi</label>
                        <textarea
                            value={data.temuan}
                            onChange={e => setData('temuan', e.target.value)}
                            rows="3"
                            className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2 text-sm text-gray-900"
                            placeholder="Deskripsi temuan kerusakan..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Part yang Diperlukan</label>
                        <textarea
                            value={data.part_diperlukan}
                            onChange={e => setData('part_diperlukan', e.target.value)}
                            rows="3"
                            className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2 text-sm text-gray-900"
                            placeholder="List part yang harus diorder..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tingkat Backlog</label>
                            <select
                                value={data.tingkat_backlog}
                                onChange={e => setData('tingkat_backlog', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900 font-bold"
                            >
                                <option value="RINGAN">RINGAN</option>
                                <option value="SEDANG">SEDANG</option>
                                <option value="BERAT">BERAT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Target Pasang (HM/Service)</label>
                            <input
                                type="text"
                                value={data.target_pasang}
                                onChange={e => setData('target_pasang', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                placeholder="Contoh: PM 2000 / 14.000 HM"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tindakan Mekanik</label>
                            <input
                                type="text"
                                value={data.tindakan_mekanik}
                                onChange={e => setData('tindakan_mekanik', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#0b5c3e] rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                placeholder="Contoh: Order part"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/backlogs" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="px-8 py-2.5 bg-[#0b5c3e] text-white rounded-lg text-sm font-bold hover:bg-[#08422c] transition-colors disabled:opacity-50">
                            Simpan Backlog
                        </button>
                    </div>
                </form>
            </div>

        </AuthenticatedLayout>
    );
}
