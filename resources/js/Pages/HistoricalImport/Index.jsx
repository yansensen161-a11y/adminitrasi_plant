import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth }) {
    const [file, setFile] = useState(null);
    const [type, setType] = useState('BREAKDOWN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setError('Silakan pilih file Excel terlebih dahulu.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        router.post(route('import-historical.preview'), formData, {
            onError: (errors) => {
                setLoading(false);
                setError(Object.values(errors).join(' '));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Wizard Import Historical Data</h2>}
        >
            <Head title="Import Historical Data" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-8 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Langkah 1: Upload File & Pilih Jenis Data</h3>
                                    <p className="text-gray-600 text-sm">
                                        Silakan unggah file Excel yang berisi data masa lalu (historical). Anda akan diminta untuk melakukan mapping kolom pada langkah selanjutnya. 
                                    </p>
                                </div>
                                <a 
                                    href={`/import-historical/template/${type}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded text-sm font-bold shadow-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download Template {type === 'BREAKDOWN' ? 'Breakdown' : 'Schedule'}
                                </a>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Data</label>
                                    <div className="flex gap-4">
                                        <label className={`cursor-pointer border rounded p-4 flex-1 flex items-center gap-3 transition-colors ${type === 'BREAKDOWN' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="BREAKDOWN" checked={type === 'BREAKDOWN'} onChange={(e) => setType(e.target.value)} className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <div className="font-bold text-gray-800">Historical Breakdown</div>
                                                <div className="text-xs text-gray-500">Mencatat kejadian kerusakan unit tidak terencana.</div>
                                            </div>
                                        </label>
                                        <label className={`cursor-pointer border rounded p-4 flex-1 flex items-center gap-3 transition-colors ${type === 'SCHEDULE' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="SCHEDULE" checked={type === 'SCHEDULE'} onChange={(e) => setType(e.target.value)} className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <div className="font-bold text-gray-800">Historical Schedule</div>
                                                <div className="text-xs text-gray-500">Mencatat histori service terjadwal (tanpa jam breakdown).</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">File Excel / CSV</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files[0])} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {file ? `Terpilih: ${file.name}` : 'XLSX, CSV up to 20MB'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-50 transition ease-in-out duration-150"
                                    >
                                        {loading ? 'Membaca File...' : 'Selanjutnya: Preview & Mapping'}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
