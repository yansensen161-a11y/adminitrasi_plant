import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    Truck, 
    ClipboardList,
    Download,
    Printer,
    Plus,
    Search,
    RefreshCw,
    Eye,
    BarChart2,
    Trash2,
    Info
} from 'lucide-react';

export default function P2hMonitoring({ p2hData, summary, filters = {} }) {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [statusFilter, setStatusFilter] = useState(filters.statusFilter || '');

    const handleFilterSubmit = () => {
        router.get(route('p2h.index'), {
            dateFrom,
            dateTo,
            codeUnitFilter,
            statusFilter
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setStatusFilter('');
        router.get(route('p2h.index'), {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0b5c3e]/10 flex items-center justify-center text-[#0b5c3e]">
                            <ClipboardList size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                                MONITORING INDICATION BY CHECK LIST (P2H)
                            </h2>
                            <div className="text-sm text-gray-500 font-medium mt-0.5">
                                Home <span className="mx-1">&gt;</span> Monitoring <span className="mx-1">&gt;</span> <span className="text-[#0b5c3e]">Monitoring Indication By Check List (P2H)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b5c3e] hover:bg-[#0a4d3c] text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Plus size={16} />
                            <span>Tambah Data</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-[#0b5c3e] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Download size={16} />
                            <span>Export Excel</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold rounded-lg shadow-sm transition-all">
                            <Printer size={16} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Monitoring P2H" />

            <div className="space-y-6">
                
                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-[#0b5c3e] mb-4 uppercase tracking-wider">Filter Pencarian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date From</label>
                            <div className="relative">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date To</label>
                            <div className="relative">
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Code Unit</label>
                            <select value={codeUnitFilter} onChange={e => setCodeUnitFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Semua Unit</option>
                                <option value="ME052">ME052</option>
                                <option value="ME067">ME067</option>
                                <option value="OHT070">OHT070</option>
                                <option value="MD037">MD037</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-[#0b5c3e] focus:border-[#0b5c3e] dark:bg-gray-700/50 text-gray-600">
                                <option value="">Semua Status</option>
                                <option value="OK">OK</option>
                                <option value="CAUTION">CAUTION</option>
                                <option value="ABNORMAL">ABNORMAL</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={handleFilterSubmit} className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold py-2 px-5 rounded-lg text-sm transition shadow-sm flex items-center border border-[#0b5c3e]">
                            Search
                        </button>
                        <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors">
                            <RefreshCw size={14} />
                            <span>Reset</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b5c3e] hover:bg-[#0a4d3c] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                            <Search size={14} />
                            <span>Cari Data</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wide">Total Unit</div>
                            <div className="flex items-end gap-1">
                                <div className="text-2xl font-black text-gray-800">{summary.total_unit}</div>
                                <div className="text-sm text-gray-500 mb-1 font-medium">Unit</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Total Item Check</div>
                            <div className="flex items-end gap-1">
                                <div className="text-2xl font-black text-gray-800">{summary.total_item_check}</div>
                                <div className="text-sm text-gray-500 mb-1 font-medium">Item</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wide">OK</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800">{summary.ok.count}</div>
                                <div className="text-sm font-bold text-emerald-600">{summary.ok.percentage}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full text-orange-500 flex items-center justify-center shrink-0">
                            <AlertTriangle size={36} className="fill-orange-500 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">CAUTION</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800">{summary.caution.count}</div>
                                <div className="text-sm font-bold text-orange-600">{summary.caution.percentage}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/30">
                            <XCircle size={28} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-red-600 uppercase tracking-wide">ABNORMAL</div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-black text-gray-800">{summary.abnormal.count}</div>
                                <div className="text-sm font-bold text-red-600">{summary.abnormal.percentage}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-bold text-[#0b5c3e] uppercase tracking-wider">
                            DATA MONITORING INDICATION BY CHECK LIST (P2H)
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">Total Data : {p2hData.length}</span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">No</th>
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">Date</th>
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">Code Unit</th>
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">HM</th>
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">Hour Meter</th>
                                    <th colSpan="4" className="px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-700/30">Total Item</th>
                                    <th colSpan="3" className="px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-700/30">Persentase (%)</th>
                                    <th rowSpan="2" className="px-3 py-3 border-r border-gray-200 dark:border-gray-700 align-middle">Status</th>
                                    <th rowSpan="2" className="px-3 py-3 align-middle">Aksi</th>
                                </tr>
                                <tr className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">OK</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">Caution</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">Abnormal</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">Total</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">OK</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">Caution</th>
                                    <th className="px-2 py-2 border-r border-gray-200 dark:border-gray-700">Abnormal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/20">
                                {p2hData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-3 py-3.5 text-gray-500 font-medium">{idx + 1}</td>
                                        <td className="px-3 py-3.5 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">{row.date}</td>
                                        <td className="px-3 py-3.5 font-bold text-gray-800 dark:text-gray-200">{row.code_unit}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.hm}</td>
                                        <td className="px-3 py-3.5 text-gray-600 dark:text-gray-400">{row.hour_meter}</td>
                                        
                                        <td className="px-2 py-3.5 font-bold text-emerald-600">{row.total_item_ok}</td>
                                        <td className="px-2 py-3.5 font-bold text-orange-500">{row.total_item_caution}</td>
                                        <td className="px-2 py-3.5 font-bold text-red-500">{row.total_item_abnormal}</td>
                                        <td className="px-2 py-3.5 font-bold text-blue-600">{row.total_item_total}</td>
                                        
                                        <td className="px-2 py-3.5 font-bold text-emerald-600">{row.pct_ok}</td>
                                        <td className="px-2 py-3.5 font-bold text-orange-500">{row.pct_caution}</td>
                                        <td className="px-2 py-3.5 font-bold text-red-500">{row.pct_abnormal}</td>
                                        
                                        <td className="px-3 py-3.5">
                                            {row.status === 'CAUTION' ? (
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-md">
                                                    CAUTION
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="text-blue-500 hover:text-blue-700 p-1">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-emerald-500 hover:text-emerald-700 p-1">
                                                    <BarChart2 size={16} />
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500 font-medium">
                            Menampilkan 1 - 6 dari 24 data
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b5c3e] text-white font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">4</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">&gt;</button>
                            <select className="ml-2 text-sm border-gray-200 rounded py-1.5 focus:ring-[#0b5c3e] focus:border-[#0b5c3e]">
                                <option>6 / halaman</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer Notes Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                            KETERANGAN STATUS
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-start gap-2">
                                <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">OK</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Persentase OK ≥ 85%</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">CAUTION</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Persentase OK 70% - 84%</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">ABNORMAL</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Persentase OK &lt; 70%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={16} className="text-blue-600" />
                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                                CATATAN
                            </h4>
                        </div>
                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                            Monitoring Indication By Check List (P2H) dilakukan setiap 2 jam sekali oleh mekanik/operator terhadap unit.<br />
                            Pastikan semua item checklist diperiksa dan diisi sesuai dengan kondisi aktual unit.
                        </p>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
