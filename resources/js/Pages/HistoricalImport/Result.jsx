import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Result({ auth, totalRow, success, duplicate, errorCount, errors, errorFileUrl, type }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Hasil Import: {type}</h2>}
        >
            <Head title="Hasil Import Data" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 text-center">
                            
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Proses Import Selesai</h3>
                                <p className="text-gray-500 mt-2">Data dari file Excel Anda telah diproses.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="text-sm text-gray-500 font-bold mb-1">TOTAL BARIS</div>
                                    <div className="text-3xl font-bold text-gray-800">{totalRow}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="text-sm text-green-600 font-bold mb-1">BERHASIL</div>
                                    <div className="text-3xl font-bold text-green-700">{success}</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="text-sm text-yellow-600 font-bold mb-1">DUPLIKAT (Diabaikan)</div>
                                    <div className="text-3xl font-bold text-yellow-700">{duplicate}</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="text-sm text-red-600 font-bold mb-1">ERROR / GAGAL</div>
                                    <div className="text-3xl font-bold text-red-700">{errorCount}</div>
                                </div>
                            </div>

                            {errorCount > 0 && (
                                <div className="mb-8 bg-red-50 p-6 rounded-lg text-left border border-red-200">
                                    <h4 className="font-bold text-red-800 mb-2">Peringatan: Ada {errorCount} data yang gagal diimport.</h4>
                                    <p className="text-sm text-red-700 mb-4">
                                        Hal ini biasanya terjadi karena Unit tidak ditemukan di Master Data, atau format tanggal tidak sesuai. 
                                        Anda bisa mendownload file error di bawah ini, memperbaiki datanya, lalu mengupload ulang file tersebut.
                                    </p>
                                    
                                    {errorFileUrl && (
                                        <a 
                                            href={errorFileUrl} 
                                            download 
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded font-bold shadow hover:bg-red-700 transition mb-4"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Data Error (Excel)
                                        </a>
                                    )}

                                    <div className="text-xs text-gray-600 bg-white p-3 rounded border">
                                        <div className="font-bold mb-2">Cuplikan Error (Max 10):</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {errors.map((err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 mt-8">
                                <Link 
                                    href="/import-historical"
                                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded font-bold hover:bg-blue-50 transition"
                                >
                                    Import File Lain
                                </Link>
                                <Link 
                                    href="/work-orders"
                                    className="px-6 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-700 transition"
                                >
                                    Ke Halaman Work Orders
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
