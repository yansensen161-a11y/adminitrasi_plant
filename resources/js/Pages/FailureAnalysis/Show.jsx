import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ far }) {
    return (
        <AuthenticatedLayout>
            <Head title={`FAR - ${far.no_far}`} />
            
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Detail Failure Analysis</h1>
                        <p className="text-sm text-gray-500">{far.no_far}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('failure-analysis.index')} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition">
                            &larr; Kembali
                        </Link>
                        <a href={route('failure-analysis.export-pdf', far.id)} target="_blank" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Download PDF
                        </a>
                        <Link href={route('failure-analysis.edit', far.id)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit Data
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <h2 className="text-sm font-bold text-gray-700">Data Laporan</h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <div className="text-gray-500 font-bold text-sm mb-1">Status</div>
                            <div>{far.status}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-bold text-sm mb-1">Tgl Kejadian</div>
                            <div>{far.tgl_kejadian}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-bold text-sm mb-1">Tgl Lapor</div>
                            <div>{far.tgl_lapor}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-bold text-sm mb-1">Unit</div>
                            <div className="font-bold text-blue-600">{far.unit?.code_unit} - {far.unit?.type_unit}</div>
                        </div>
                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <div className="text-gray-500 font-bold text-sm mb-1">A. FAILURE OUTLINE</div>
                                <p className="whitespace-pre-wrap text-gray-800">{far.failure_outline || '-'}</p>
                            </div>
                            <div>
                                <div className="text-gray-500 font-bold text-sm mb-1">B. BACKGROUND</div>
                                <p className="whitespace-pre-wrap text-gray-800">{far.background || '-'}</p>
                            </div>
                            <div>
                                <div className="text-gray-500 font-bold text-sm mb-1">C. FAILURE ANALYSIS</div>
                                <p className="whitespace-pre-wrap text-gray-800">{far.failure_analysis || '-'}</p>
                            </div>
                            <div className="md:col-span-3">
                                <div className="text-gray-500 font-bold text-sm mb-1">D. CONCLUSION</div>
                                <p className="whitespace-pre-wrap text-gray-800">{far.conclusion || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <h2 className="text-sm font-bold text-gray-700">Foto Observasi</h2>
                    </div>
                    <div className="p-4">
                        {far.photos && far.photos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {far.photos.map(photo => (
                                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <img src={`/storage/${photo.foto_path}`} alt="Observasi" className="w-full h-48 object-cover" />
                                        <div className="p-3 bg-gray-50">
                                            <div className="font-bold text-sm text-gray-800 mb-1">{photo.komponen_bagian}</div>
                                            <p className="text-sm text-gray-600">{photo.observasi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Tidak ada foto observasi.</div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
