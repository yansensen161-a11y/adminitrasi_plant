import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ far, units }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        status: far.status || 'Draft',
        tgl_kejadian: far.tgl_kejadian || '',
        tgl_lapor: far.tgl_lapor || '',
        unit_id: far.unit_id || '',
        site_project: far.site_project || '',
        smu_failure: far.smu_failure || '',
        part_no: far.part_no || '',
        nama_komp: far.nama_komp || '',
        pn: far.pn || '',
        penyebab: far.penyebab || '',
        engine_model: far.engine_model || '',
        engine_sn: far.engine_sn || '',
        comp_installed: far.comp_installed || '',
        comp_hours: far.comp_hours || '',
        oil_sampled: far.oil_sampled || '',
        oil_eval: far.oil_eval || '',
        failure_outline: far.failure_outline || '',
        background: far.background || '',
        failure_analysis: far.failure_analysis || '',
        conclusion: far.conclusion || '',
        prepared_by: far.prepared_by || '',
        reviewed_by: far.reviewed_by || '',
        approved_by: far.approved_by || '',
        
        existing_photos: far.photos || [],
        new_photos: [],
        deleted_photos: []
    });

    // Handlers for EXISTING photos
    const handleExistingPhotoChange = (index, field, value) => {
        const photos = [...data.existing_photos];
        photos[index][field] = value;
        setData('existing_photos', photos);
    };

    const removeExistingPhoto = (index) => {
        const photoId = data.existing_photos[index].id;
        const photos = [...data.existing_photos];
        photos.splice(index, 1);
        setData({
            ...data,
            existing_photos: photos,
            deleted_photos: [...data.deleted_photos, photoId]
        });
    };

    // Handlers for NEW photos
    const handleNewPhotoChange = (index, field, value) => {
        const photos = [...data.new_photos];
        photos[index][field] = value;
        setData('new_photos', photos);
    };

    const handleNewPhotoUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const photos = [...data.new_photos];
            photos[index]['file'] = file;
            photos[index]['preview'] = URL.createObjectURL(file);
            setData('new_photos', photos);
        }
    };

    const addNewPhotoRow = () => {
        setData('new_photos', [...data.new_photos, { komponen_bagian: '', observasi: '', file: null, preview: null }]);
    };

    const removeNewPhotoRow = (index) => {
        const photos = [...data.new_photos];
        photos.splice(index, 1);
        setData('new_photos', photos);
    };

    const handleUnitChange = (e) => {
        const selectedId = e.target.value;
        const selectedUnit = units.find(u => u.id === selectedId);
        
        setData(prevData => ({
            ...prevData,
            unit_id: selectedId,
            engine_model: selectedUnit ? (selectedUnit.engine_model || '') : '',
            engine_sn: selectedUnit ? (selectedUnit.sn_engine || '') : '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('failure-analysis.update', far.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit FAR ${far.no_far}`} />
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Edit FAR: {far.no_far}</h1>
                        <p className="text-sm text-gray-500">Ubah detail laporan Failure Analysis</p>
                    </div>
                    <Link href={route('failure-analysis.index')} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition">
                        &larr; Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* INFORMASI WAJIB (REQUIRED) */}
                    <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200">
                        <h2 className="text-sm font-black text-red-700 mb-4 border-b border-red-200 pb-2">⭐ INFORMASI WAJIB (Wajib Diisi)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Status Laporan <span className="text-red-500">*</span></label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1 bg-white">
                                    <option value="Draft">Draft</option>
                                    <option value="Final">Final</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Tgl Kejadian <span className="text-red-500">*</span></label>
                                <input type="date" required value={data.tgl_kejadian} onChange={e => setData('tgl_kejadian', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1 bg-white" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Tgl Lapor <span className="text-red-500">*</span></label>
                                <input type="date" required value={data.tgl_lapor} onChange={e => setData('tgl_lapor', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1 bg-white" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">No Unit <span className="text-red-500">*</span></label>
                                <select required value={data.unit_id} onChange={handleUnitChange} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1 bg-white">
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.code_unit} - {u.type_unit}</option>
                                    ))}
                                </select>
                                {errors.unit_id && <div className="text-red-500 text-sm mt-1">{errors.unit_id}</div>}
                            </div>
                        </div>
                    </div>

                    {/* IDENTITAS TAMBAHAN */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-black text-gray-600 mb-4 border-b pb-2">1. IDENTITAS UNIT (Opsional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Site / Project</label>
                                <input type="text" value={data.site_project} onChange={e => setData('site_project', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">SMU Failure</label>
                                <input type="text" placeholder="e.g. 4,445 HM" value={data.smu_failure} onChange={e => setData('smu_failure', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* COMPONENT & OIL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-black text-gray-600 mb-4 border-b pb-2">2. COMPONENT FAILURE</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Part No</label>
                                    <input type="text" value={data.part_no} onChange={e => setData('part_no', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Nama Komp</label>
                                    <input type="text" value={data.nama_komp} onChange={e => setData('nama_komp', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">P/N</label>
                                    <input type="text" value={data.pn} onChange={e => setData('pn', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Penyebab</label>
                                    <input type="text" value={data.penyebab} onChange={e => setData('penyebab', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Engine Model</label>
                                    <input type="text" value={data.engine_model} onChange={e => setData('engine_model', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Engine SN</label>
                                    <input type="text" value={data.engine_sn} onChange={e => setData('engine_sn', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-black text-gray-600 mb-4 border-b pb-2">3. LAST COMP & OIL</h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Comp Installed</label>
                                        <input type="text" value={data.comp_installed} onChange={e => setData('comp_installed', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Comp Hours</label>
                                        <input type="text" value={data.comp_hours} onChange={e => setData('comp_hours', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Oil Sampled</label>
                                        <input type="text" value={data.oil_sampled} onChange={e => setData('oil_sampled', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Oil Eval</label>
                                        <input type="text" value={data.oil_eval} onChange={e => setData('oil_eval', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ANALYSIS DETAILS */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-black text-gray-600 mb-4 border-b pb-2">4. URAIAN HASIL ANALISA KERUSAKAN</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">A. FAILURE OUTLINE (Ringkasan Kerusakan & P/N Terpengaruh)</label>
                                <textarea rows="4" value={data.failure_outline} onChange={e => setData('failure_outline', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1"></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">B. BACKGROUND (Latar Belakang & Kronologi Kerusakan)</label>
                                <textarea rows="4" value={data.background} onChange={e => setData('background', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1"></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">C. FAILURE ANALYSIS (Analisa Penyebab Teknis Kerusakan)</label>
                                <textarea rows="4" value={data.failure_analysis} onChange={e => setData('failure_analysis', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1"></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">D. CONCLUSION (Kesimpulan)</label>
                                <textarea rows="3" value={data.conclusion} onChange={e => setData('conclusion', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-1"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* FOTO OBSERVASI */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-sm font-black text-gray-600">5. DOKUMENTASI FOTO OBSERVASI</h2>
                            <button type="button" onClick={addNewPhotoRow} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                                + Tambah Foto Baru
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Existing Photos */}
                            {data.existing_photos.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase">Foto Saat Ini</h3>
                                    {data.existing_photos.map((photo, index) => (
                                        <div key={photo.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border border-gray-200 p-4 rounded-lg bg-gray-50">
                                            <div className="col-span-1">
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Komponen/Bagian</label>
                                                <input type="text" value={photo.komponen_bagian} onChange={e => handleExistingPhotoChange(index, 'komponen_bagian', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Observasi (Penjelasan)</label>
                                                <textarea rows="3" value={photo.observasi} onChange={e => handleExistingPhotoChange(index, 'observasi', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"></textarea>
                                            </div>
                                            <div className="col-span-1 text-center">
                                                <img src={`/storage/${photo.foto_path}`} alt="Saved" className="w-full h-24 object-cover rounded border border-gray-300 shadow-sm mb-2" />
                                                <button type="button" onClick={() => removeExistingPhoto(index)} className="text-sm text-red-500 hover:text-red-700 font-bold bg-white border border-red-200 px-3 py-1.5 rounded w-full">Hapus Foto Ini</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Photos */}
                            {data.new_photos.length > 0 && (
                                <div className="space-y-4 mt-6 pt-4 border-t border-dashed border-gray-300">
                                    <h3 className="text-sm font-bold text-blue-500 uppercase">Foto Baru (Akan Ditambahkan)</h3>
                                    {data.new_photos.map((photo, index) => (
                                        <div key={`new-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border border-blue-200 p-4 rounded-lg bg-blue-50/30">
                                            <div className="col-span-1">
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Komponen/Bagian</label>
                                                <input type="text" value={photo.komponen_bagian} onChange={e => handleNewPhotoChange(index, 'komponen_bagian', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Observasi (Penjelasan)</label>
                                                <textarea rows="3" value={photo.observasi} onChange={e => handleNewPhotoChange(index, 'observasi', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Upload Foto</label>
                                                <input type="file" accept="image/*" onChange={e => handleNewPhotoUpload(index, e)} className="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 mb-2"/>
                                                {photo.preview && <img src={photo.preview} alt="Preview" className="w-full h-24 object-cover rounded border border-gray-200 shadow-sm" />}
                                            </div>
                                            <div className="col-span-1 md:col-span-4 flex justify-end">
                                                <button type="button" onClick={() => removeNewPhotoRow(index)} className="text-sm text-red-500 hover:text-red-700 font-bold bg-white px-3 py-1 rounded border border-red-200">Batalkan Foto Baru</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {data.existing_photos.length === 0 && data.new_photos.length === 0 && (
                                <div className="text-center py-6 text-gray-400 text-sm">Belum ada foto.</div>
                            )}
                        </div>
                    </div>

                    {/* SIGNATURES */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-black text-gray-600 mb-4 border-b pb-2">6. TANDA TANGAN (Nama Terang)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 text-center block">Prepared By (Pembuat Laporan)</label>
                                <input type="text" value={data.prepared_by} onChange={e => setData('prepared_by', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-2 text-center" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 text-center block">Reviewed By (Supervisor)</label>
                                <input type="text" value={data.reviewed_by} onChange={e => setData('reviewed_by', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-2 text-center" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 text-center block">Approved By (Plant Superintendent)</label>
                                <input type="text" value={data.approved_by} onChange={e => setData('approved_by', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mt-2 text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 sticky bottom-4 bg-white/80 p-4 rounded-xl border border-gray-200 backdrop-blur-md shadow-lg">
                        <Link href={route('failure-analysis.index')} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition">Batal</Link>
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-md shadow-red-500/30 transition disabled:opacity-50 flex items-center gap-2">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
