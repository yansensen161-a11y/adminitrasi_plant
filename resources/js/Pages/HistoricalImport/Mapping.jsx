import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Mapping({ auth, type, filename, headers, previewData }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Initial mapping state
    const [mapping, setMapping] = useState({
        date: '',
        unit: '',
        hm: '',
        problem: '',
        jam_breakdown: '',
        jam_ready: '',
        status: '',
        downtime_code: '',
        corrective_action: '',
    });

    const handleMapChange = (field, excelHeader) => {
        setMapping(prev => ({
            ...prev,
            [field]: excelHeader
        }));
    };

    const handleSubmit = () => {
        if (!mapping.date || !mapping.unit) {
            setError('Field Wajib: Tanggal dan Unit harus di-mapping.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (type === 'BREAKDOWN' && !mapping.jam_breakdown) {
            if (!confirm('Anda tidak me-mapping Jam Breakdown. Sistem akan menganggap jam 00:00. Lanjutkan?')) {
                return;
            }
        }

        setLoading(true);
        setError('');

        router.post(route('import-historical.process'), {
            filename,
            type,
            mapping
        }, {
            onError: (errors) => {
                setLoading(false);
                setError(Object.values(errors).join(' '));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const targetFields = [
        { key: 'date', label: 'Tanggal (Wajib)*' },
        { key: 'unit', label: 'Code Unit (Wajib)*' },
        { key: 'hm', label: 'HM Unit' },
        { key: 'problem', label: type === 'BREAKDOWN' ? 'Problem / Kendala' : 'Type Service' },
        { key: 'corrective_action', label: 'Corrective Action / Remark' },
        { key: 'status', label: 'Status WO' },
        { key: 'downtime_code', label: 'Downtime Code' },
    ];

    if (type === 'BREAKDOWN') {
        targetFields.push({ key: 'jam_breakdown', label: 'Jam Breakdown' });
        targetFields.push({ key: 'jam_ready', label: 'Jam Ready (RFU)' });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mapping Kolom: {type}</h2>}
        >
            <Head title="Mapping Data Import" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Langkah 2: Mapping Kolom Excel ke Database</h3>
                                <p className="text-gray-600 text-sm">
                                    Pilih kolom Excel mana yang sesuai dengan kolom di sistem kami. Kolom dengan tanda bintang (*) wajib diisi. 
                                    Hanya 20 baris pertama yang ditampilkan sebagai preview.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border">
                                {targetFields.map(field => (
                                    <div key={field.key} className="flex flex-col">
                                        <label className="text-sm font-bold text-gray-700 mb-1">{field.label}</label>
                                        <select 
                                            value={mapping[field.key]} 
                                            onChange={(e) => handleMapChange(field.key, e.target.value)}
                                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">-- Abaikan / Tidak Ada --</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="overflow-x-auto border rounded-lg mb-8">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {headers.map((h, i) => (
                                                <th key={i} className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-50">
                                                {headers.map((h, colIndex) => (
                                                    <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                        {row[colIndex] !== null ? String(row[colIndex]).substring(0, 50) : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Memproses Import...' : 'Import Data Sekarang'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
