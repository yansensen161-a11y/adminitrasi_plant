import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { compressImage, formatBytes } from '@/utils/imageCompressor';

export default function CreateMagneticPlug({ auth, units = [] }) {
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const preUnitId = queryParams.get('unit_id') || '';
    const preHm = queryParams.get('hm') || '';
    const preNoWo = queryParams.get('no_wo') || '';
    const returnTo = queryParams.get('return_to') || '';
    const preDate = queryParams.get('date') || new Date().toISOString().split('T')[0];

    const initialUnit = units.find(u => u.id.toString() === preUnitId.toString()) || null;
    const initialHm = preHm || (initialUnit ? (initialUnit.hm || initialUnit.current_hm || '') : '');

    const [compressionInfo, setCompressionInfo] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        unit_id: preUnitId,
        hm: initialHm,
        date: preDate,
        metode_filter: '',
        component: '',
        rating: '',
        remarks: preNoWo ? `Ref WO: ${preNoWo}` : '',
        photo: null,
        return_to: returnTo,
    });

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setData('photo', null);
            setCompressionInfo(null);
            return;
        }

        setIsCompressing(true);
        try {
            const compressed = await compressImage(file, { maxWidth: 1400, quality: 0.75 });
            setData('photo', compressed.file);
            setCompressionInfo(compressed);
        } catch (err) {
            setData('photo', file);
            setCompressionInfo({
                originalSize: file.size,
                compressedSize: file.size,
                ratio: 0,
                previewUrl: URL.createObjectURL(file),
                formattedOriginalSize: formatBytes(file.size),
                formattedCompressedSize: formatBytes(file.size),
            });
        } finally {
            setIsCompressing(false);
        }
    };

    const handleRemovePhoto = () => {
        setData('photo', null);
        setCompressionInfo(null);
    };

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
                <Link href={returnTo || route('repair.magnetic-plug')} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    {returnTo ? 'Kembali ke Work Order' : 'Kembali'}
                </Link>
            </div>

            {returnTo && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                        <span className="text-base">🧲</span>
                        <span>
                            Form Magnetic Plug ini terhubung dengan <strong>Work Order {preNoWo ? `(${preNoWo})` : ''}</strong>. 
                            Setelah disimpan, Anda akan diarahkan kembali ke Work Order secara otomatis.
                        </span>
                    </div>
                    <Link
                        href={returnTo}
                        className="text-xs font-bold bg-white text-amber-800 px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 transition whitespace-nowrap self-start sm:self-auto text-center"
                    >
                        &larr; Batalkan & Kembali ke WO
                    </Link>
                </div>
            )}

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
                                    onChange={e => {
                                        const val = e.target.value;
                                        const found = units.find(u => u.id.toString() === val.toString());
                                        setData(prev => ({
                                            ...prev,
                                            unit_id: val,
                                            hm: (!prev.hm && found) ? (found.hm || found.current_hm || '') : prev.hm,
                                        }));
                                    }}
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

                            {/* Photo Upload with Compression */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Foto Kondisi / Serpihan (Opsional)
                                </label>

                                {!data.photo ? (
                                    <div className="relative border-2 border-dashed border-gray-300 hover:border-[#0b5c3e] rounded-xl p-4 transition bg-gray-50/50 hover:bg-green-50/30 group text-center cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handlePhotoChange}
                                            disabled={isCompressing}
                                        />
                                        <div className="flex flex-col items-center justify-center py-3">
                                            {isCompressing ? (
                                                <div className="flex items-center gap-2 text-sm text-[#0b5c3e] font-semibold">
                                                    <svg className="animate-spin h-5 w-5 text-[#0b5c3e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                    </svg>
                                                    Mengompres gambar...
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="w-10 h-10 text-gray-400 group-hover:text-[#0b5c3e] transition mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        Pilih atau seret foto ke sini
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Foto otomatis dikompres sebelum diunggah (JPG/PNG &rarr; WebP)
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
                                        {compressionInfo?.previewUrl && (
                                            <img 
                                                src={compressionInfo.previewUrl} 
                                                alt="Preview" 
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 shrink-0 shadow-xs"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {data.photo?.name || 'Foto Terpilih'}
                                            </p>
                                            {compressionInfo && (
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Terkonversi WebP ({compressionInfo.ratio}% hemat)
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {compressionInfo.formattedOriginalSize} &rarr; <strong className="text-gray-800">{compressionInfo.formattedCompressedSize}</strong>
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Foto siap disimpan dengan ukuran ringan.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Hapus Foto
                                        </button>
                                    </div>
                                )}

                                {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                            </div>

                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <Link href={returnTo || route('repair.magnetic-plug')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-sm transition">
                            {returnTo ? 'Kembali ke WO' : 'Batal'}
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
