import React, { useEffect, useRef, useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import { 
    Upload, 
    Download, 
    FileSpreadsheet, 
    X, 
    CheckCircle2, 
    AlertTriangle, 
    Search, 
    RefreshCw, 
    Printer,
    UserPlus,
    Users,
    Briefcase,
    Trash2
} from 'lucide-react';

export default function Index({ auth, manpowers = [], summary = {}, filters = {} }) {
    // Refs for charts
    const chartDistribusi = useRef(null);
    const chartKomposisi = useRef(null);
    const chartPosisi = useRef(null);
    const chartRekapKomposisi = useRef(null);
    
    const chartInstances = useRef({});

    // Filter states
    const [departemen, setDepartemen] = useState(filters.departemen || 'Semua');
    const [status, setStatus] = useState(filters.status || 'Semua');
    const [jenis, setJenis] = useState(filters.jenis_karyawan || 'Semua');
    const [search, setSearch] = useState(filters.search || '');

    // Import Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const handleClearAll = () => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data manpower yang ada di sistem? Tindakan ini tidak dapat dibatalkan.')) {
            setIsClearing(true);
            router.delete(route('manpower.clear-all'), {
                onFinish: () => setIsClearing(false),
            });
        }
    };

    // Dynamic filtering
    const filteredManpowers = useMemo(() => {
        return manpowers.filter(item => {
            const matchDept = departemen === 'Semua' || (item.departemen || '').toLowerCase().includes(departemen.toLowerCase());
            const matchStatus = status === 'Semua' || (item.status || '').toLowerCase() === status.toLowerCase();
            const matchJenis = jenis === 'Semua' || (item.jenis_karyawan || '').toLowerCase() === jenis.toLowerCase();
            const q = search.toLowerCase();
            const matchSearch = !search || 
                (item.nama || '').toLowerCase().includes(q) ||
                (item.nrp || '').toLowerCase().includes(q) ||
                (item.bagian || '').toLowerCase().includes(q) ||
                (item.kontak || '').toLowerCase().includes(q) ||
                (item.ktp || '').toLowerCase().includes(q);

            return matchDept && matchStatus && matchJenis && matchSearch;
        });
    }, [manpowers, departemen, status, jenis, search]);

    // Computed Stats
    const totalCount = manpowers.length;
    const staffCount = manpowers.filter(m => (m.jenis_karyawan || '').toLowerCase() === 'staff').length;
    const nonStaffCount = manpowers.filter(m => (m.jenis_karyawan || '').toLowerCase() === 'non staff').length;
    const kontrakCount = manpowers.filter(m => ['kontrak', 'outsource'].includes((m.jenis_karyawan || '').toLowerCase())).length;

    const staffPct = totalCount > 0 ? ((staffCount / totalCount) * 100).toFixed(1) : '0.0';
    const nonStaffPct = totalCount > 0 ? ((nonStaffCount / totalCount) * 100).toFixed(1) : '0.0';
    const kontrakPct = totalCount > 0 ? ((kontrakCount / totalCount) * 100).toFixed(1) : '0.0';

    // Departemen Counts
    const deptList = ['Plant', 'Workshop', 'Tyre', 'Electrical', 'Support', 'Others'];
    const deptCounts = deptList.map(d => {
        if (d === 'Others') {
            return manpowers.filter(m => !['plant', 'workshop', 'tyre', 'electrical', 'support'].some(x => (m.departemen || '').toLowerCase().includes(x))).length;
        }
        return manpowers.filter(m => (m.departemen || '').toLowerCase().includes(d.toLowerCase())).length;
    });

    // Top 5 Job Positions
    const topPositions = useMemo(() => {
        const counts = {};
        manpowers.forEach(m => {
            const pos = m.bagian || 'Lainnya';
            counts[pos] = (counts[pos] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return {
            labels: sorted.slice(0, 5).map(x => x[0]),
            values: sorted.slice(0, 5).map(x => x[1]),
        };
    }, [manpowers]);

    useEffect(() => {
        // Destroy existing
        if (chartInstances.current.dist) chartInstances.current.dist.destroy();
        if (chartInstances.current.komp) chartInstances.current.komp.destroy();
        if (chartInstances.current.pos) chartInstances.current.pos.destroy();
        if (chartInstances.current.rekapKomp) chartInstances.current.rekapKomp.destroy();

        // 1. Distribusi (Bar)
        if (chartDistribusi.current) {
            chartInstances.current.dist = new Chart(chartDistribusi.current, {
                type: 'bar',
                data: {
                    labels: deptList,
                    datasets: [{
                        label: 'Jumlah',
                        data: deptCounts,
                        backgroundColor: '#00a65a',
                        barPercentage: 0.35,
                        borderRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { drawBorder: false } },
                        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                    }
                },
                plugins: [{
                    id: 'topLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        chart.data.datasets.forEach((dataset, i) => {
                            chart.getDatasetMeta(i).data.forEach((bar, index) => {
                                const data = dataset.data[index];
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 11px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText(data, bar.x, bar.y - 5);
                            });
                        });
                    }
                }]
            });
        }

        // 2. Komposisi (Doughnut)
        const dOpts = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: true }
            }
        };
        const dData = {
            labels: ['Staff', 'Non Staff', 'Kontrak / Outsource'],
            datasets: [{
                data: [staffCount, nonStaffCount, kontrakCount],
                backgroundColor: ['#00a65a', '#0073b7', '#f56954'],
                borderWidth: 0,
            }]
        };

        if (chartKomposisi.current) {
            chartInstances.current.komp = new Chart(chartKomposisi.current, { type: 'doughnut', data: dData, options: dOpts });
        }
        if (chartRekapKomposisi.current) {
            chartInstances.current.rekapKomp = new Chart(chartRekapKomposisi.current, { type: 'doughnut', data: dData, options: dOpts });
        }

        // 3. Posisi Top 5 (Horizontal Bar)
        if (chartPosisi.current) {
            chartInstances.current.pos = new Chart(chartPosisi.current, {
                type: 'bar',
                data: {
                    labels: topPositions.labels.length > 0 ? topPositions.labels : ['Mekanik', 'Helper', 'Electrical', 'Tyreman', 'Operator'],
                    datasets: [{
                        data: topPositions.values.length > 0 ? topPositions.values : [36, 18, 14, 12, 10],
                        backgroundColor: ['#00a65a', '#2196f3', '#f39c12', '#f56954', '#9b59b6'],
                        borderRadius: 3,
                        barPercentage: 0.55
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { drawBorder: false } },
                        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
                    }
                },
                plugins: [{
                    id: 'rightLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        chart.data.datasets.forEach((dataset, i) => {
                            chart.getDatasetMeta(i).data.forEach((bar, index) => {
                                const data = dataset.data[index];
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 11px sans-serif';
                                ctx.textAlign = 'left';
                                ctx.fillText(data, bar.x + 5, bar.y + 4);
                            });
                        });
                    }
                }]
            });
        }

        return () => {
            if (chartInstances.current.dist) chartInstances.current.dist.destroy();
            if (chartInstances.current.komp) chartInstances.current.komp.destroy();
            if (chartInstances.current.pos) chartInstances.current.pos.destroy();
            if (chartInstances.current.rekapKomp) chartInstances.current.rekapKomp.destroy();
        };
    }, [manpowers, deptCounts, staffCount, nonStaffCount, kontrakCount, topPositions]);

    // Handle Import Submit
    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importFile) return;

        const data = new FormData();
        data.append('file', importFile);
        setIsImporting(true);

        router.post(route('manpower.import'), data, {
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setIsImporting(false);
            },
            onError: () => setIsImporting(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Manpower" />
            
            <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-10">
                
                {/* Header */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200">
                            <Users size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Data Manpower</h1>
                            <p className="text-sm text-gray-500">Pengelolaan data karyawan, mekanik, dan tenaga kerja plant</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
                        {/* Download Template Import Button */}
                        <a 
                            href={route('manpower.template')} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition"
                            title="Download format Excel untuk import data manpower"
                        >
                            <Download size={16} className="text-emerald-700" />
                            <span>Template Import</span>
                        </a>

                        {/* Import Excel Button */}
                        <button 
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition"
                        >
                            <Upload size={16} className="text-emerald-600" />
                            <span>Import Excel</span>
                        </button>

                        {/* Export Excel Button */}
                        <a 
                            href={route('manpower.export')} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition"
                        >
                            <FileSpreadsheet size={16} className="text-blue-600" />
                            <span>Export Excel</span>
                        </a>

                        {/* Print Button */}
                        <button 
                            type="button"
                            onClick={() => window.print()}
                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition"
                        >
                            <Printer size={16} className="text-gray-600" />
                            <span>Print</span>
                        </button>

                        {/* Clear All Data Button */}
                        {totalCount > 0 && (
                            <button 
                                type="button"
                                onClick={handleClearAll}
                                disabled={isClearing}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                title="Hapus seluruh data manpower dari sistem"
                            >
                                <Trash2 size={16} className="text-rose-600" />
                                <span>{isClearing ? 'Menghapus...' : 'Hapus Semua Data'}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-6 mt-6 space-y-4">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Blue */}
                        <div className="bg-[#2196f3] rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/15 rounded-lg">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <div className="text-xs opacity-90 uppercase font-bold tracking-wider">Total Manpower</div>
                                    <div className="text-2xl font-black leading-tight">{totalCount}</div>
                                    <div className="text-xs opacity-80">Orang Terdaftar</div>
                                </div>
                            </div>
                        </div>

                        {/* Green */}
                        <div className="bg-[#00a65a] rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/15 rounded-lg">
                                    <Briefcase size={28} />
                                </div>
                                <div>
                                    <div className="text-xs opacity-90 uppercase font-bold tracking-wider">Staff</div>
                                    <div className="text-2xl font-black leading-tight">{staffCount}</div>
                                    <div className="text-xs opacity-80">{staffPct}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Yellow */}
                        <div className="bg-[#f39c12] rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/15 rounded-lg">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <div className="text-xs opacity-90 uppercase font-bold tracking-wider">Non Staff</div>
                                    <div className="text-2xl font-black leading-tight">{nonStaffCount}</div>
                                    <div className="text-xs opacity-80">{nonStaffPct}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Red */}
                        <div className="bg-[#f56954] rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/15 rounded-lg">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <div className="text-xs opacity-90 uppercase font-bold tracking-wider">Kontrak / Outsource</div>
                                    <div className="text-2xl font-black leading-tight">{kontrakCount}</div>
                                    <div className="text-xs opacity-80">{kontrakPct}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Distribusi Bar */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Distribusi Manpower per Departemen</h3>
                            <div className="h-44 w-full">
                                <canvas ref={chartDistribusi}></canvas>
                            </div>
                        </div>
                        
                        {/* Komposisi Doughnut */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Komposisi Manpower</h3>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="h-36 w-36 relative shrink-0">
                                    <canvas ref={chartKomposisi}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-black text-gray-800">{totalCount}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">Total</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#00a65a]"></span>Staff</div>
                                        <div className="font-bold">{staffCount} <span className="text-gray-400 font-normal">({staffPct}%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#0073b7]"></span>Non Staff</div>
                                        <div className="font-bold">{nonStaffCount} <span className="text-gray-400 font-normal">({nonStaffPct}%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#f56954]"></span>Kontrak</div>
                                        <div className="font-bold">{kontrakCount} <span className="text-gray-400 font-normal">({kontrakPct}%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posisi Bar */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Manpower per Job Position (Top 5)</h3>
                            <div className="h-44 w-full">
                                <canvas ref={chartPosisi}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Table Container */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        
                        {/* Filters */}
                        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Departemen</label>
                                <select 
                                    className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 w-36 focus:outline-none focus:border-emerald-500 bg-gray-50"
                                    value={departemen} 
                                    onChange={e => setDepartemen(e.target.value)}
                                >
                                    <option>Semua</option>
                                    <option>Plant</option>
                                    <option>Workshop</option>
                                    <option>Electrical</option>
                                    <option>Tyre</option>
                                    <option>Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Status</label>
                                <select 
                                    className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 w-36 focus:outline-none focus:border-emerald-500 bg-gray-50"
                                    value={status} 
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <option>Semua</option>
                                    <option>Aktif</option>
                                    <option>Non Aktif</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Jenis Karyawan</label>
                                <select 
                                    className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 w-36 focus:outline-none focus:border-emerald-500 bg-gray-50"
                                    value={jenis} 
                                    onChange={e => setJenis(e.target.value)}
                                >
                                    <option>Semua</option>
                                    <option>Staff</option>
                                    <option>Non Staff</option>
                                    <option>Kontrak</option>
                                </select>
                            </div>
                            
                            <div className="flex-1 min-w-[220px] relative">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Pencarian</label>
                                <div className="relative">
                                    <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama, NRP, posisi, kontak..." 
                                        className="w-full border border-gray-300 rounded-lg text-sm py-1.5 pl-9 pr-3 focus:outline-none focus:border-emerald-500 bg-gray-50"
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => { setDepartemen('Semua'); setStatus('Semua'); setJenis('Semua'); setSearch(''); }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                    <RefreshCw size={13} />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-black text-sm text-gray-900">
                                Daftar Karyawan &amp; Manpower ({filteredManpowers.length} dari {totalCount} Data)
                            </span>
                            <span className="text-xs text-gray-500 font-semibold">
                                Tip: Klik 'Import Excel' untuk menambah data massal via template
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left min-w-max">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">NRP</th>
                                        <th className="px-4 py-3">Nama Lengkap</th>
                                        <th className="px-4 py-3">Departemen</th>
                                        <th className="px-4 py-3">Job Position</th>
                                        <th className="px-4 py-3">Jenis Karyawan</th>
                                        <th className="px-4 py-3">Tanggal Masuk</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3">Kontak</th>
                                        <th className="px-4 py-3">No KTP</th>
                                        <th className="px-4 py-3">BPJS Kesehatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {filteredManpowers.length > 0 ? (
                                        filteredManpowers.map((item, idx) => (
                                            <tr key={item.id || idx} className="hover:bg-emerald-50/30 transition">
                                                <td className="px-4 py-2.5 font-semibold text-gray-500">{idx + 1}</td>
                                                <td className="px-4 py-2.5 font-mono font-black text-emerald-800">{item.nrp || '-'}</td>
                                                <td className="px-4 py-2.5 font-bold text-gray-900">{item.nama}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700">
                                                        {item.departemen || 'Plant'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 font-semibold text-gray-800">{item.bagian || '-'}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        (item.jenis_karyawan || '').toLowerCase() === 'staff'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : (item.jenis_karyawan || '').toLowerCase().includes('kontrak')
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {item.jenis_karyawan || 'Non Staff'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 font-mono">{item.doh || '-'}</td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                                        (item.status || 'Aktif').toLowerCase() === 'aktif'
                                                            ? 'bg-[#00a65a] text-white'
                                                            : 'bg-gray-400 text-white'
                                                    }`}>
                                                        {item.status || 'Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-gray-600">{item.kontak || '-'}</td>
                                                <td className="px-4 py-2.5 font-mono text-gray-500 text-[11px]">{item.ktp || '-'}</td>
                                                <td className="px-4 py-2.5 font-mono text-gray-500 text-[11px]">{item.bpjs_kes || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={11} className="py-16 text-center">
                                                {totalCount === 0 ? (
                                                    <div className="max-w-md mx-auto flex flex-col items-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                                                            <Users size={32} />
                                                        </div>
                                                        <h4 className="text-base font-bold text-gray-800 mb-1">Data Manpower Masih Kosong</h4>
                                                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                                                            Data telah dikosongkan dan siap untuk diisi. Silakan unduh template Excel lalu unggah file Anda menggunakan tombol Import.
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <a 
                                                                href={route('manpower.template')} 
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                                                            >
                                                                <Download size={14} />
                                                                <span>Unduh Template</span>
                                                            </a>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setIsImportModalOpen(true)}
                                                                className="px-4 py-2 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                                                            >
                                                                <Upload size={14} />
                                                                <span>Import Excel Baru</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 font-semibold py-6">
                                                        Tidak ada data manpower yang sesuai dengan kriteria pencarian atau filter.
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Row: Rekapitulasi & Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Rekap Departemen */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Rekap Manpower per Departemen</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b-2 border-gray-200 text-gray-700">
                                        <tr>
                                            <th className="py-1 text-left">No</th>
                                            <th className="py-1 text-left">Departemen</th>
                                            <th className="py-1 text-center">Staff</th>
                                            <th className="py-1 text-center">Non Staff</th>
                                            <th className="py-1 text-center">Total</th>
                                            <th className="py-1 text-center">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {['Plant', 'Workshop', 'Tyre', 'Electrical', 'Support'].map((dept, idx) => {
                                            const subTotal = manpowers.filter(m => (m.departemen || '').toLowerCase().includes(dept.toLowerCase())).length;
                                            const subStaff = manpowers.filter(m => (m.departemen || '').toLowerCase().includes(dept.toLowerCase()) && (m.jenis_karyawan || '').toLowerCase() === 'staff').length;
                                            const subNon = subTotal - subStaff;
                                            const pct = totalCount > 0 ? ((subTotal / totalCount) * 100).toFixed(1) : '0';

                                            return (
                                                <tr key={dept}>
                                                    <td className="py-1.5">{idx + 1}</td>
                                                    <td className="py-1.5 font-semibold">{dept}</td>
                                                    <td className="py-1.5 text-center">{subStaff}</td>
                                                    <td className="py-1.5 text-center">{subNon}</td>
                                                    <td className="py-1.5 text-center font-bold">{subTotal}</td>
                                                    <td className="py-1.5 text-center text-gray-500">{pct}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Rekap Komposisi */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Rekap Manpower per Jenis Karyawan</h3>
                            <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
                                <div className="h-32 w-32 relative shrink-0 mx-auto lg:mx-0">
                                    <canvas ref={chartRekapKomposisi}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-black text-gray-800">{totalCount}</span>
                                        <span className="text-[9px] text-gray-500 font-bold">Total</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#00a65a]"></span>Staff</div>
                                        <div className="font-bold">{staffCount} <span className="text-gray-400 font-normal">({staffPct}%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#0073b7]"></span>Non Staff</div>
                                        <div className="font-bold">{nonStaffCount} <span className="text-gray-400 font-normal">({nonStaffPct}%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600"><span className="w-2.5 h-2.5 rounded bg-[#f56954]"></span>Kontrak</div>
                                        <div className="font-bold">{kontrakCount} <span className="text-gray-400 font-normal">({kontrakPct}%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informasi & Template Notice */}
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#166534] mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-[#16a34a]" />
                                    <span>Petunjuk Import Manpower</span>
                                </h3>
                                <ul className="space-y-2 text-xs text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></span>
                                        <span>Gunakan file template resmi dari tombol <strong>Template Import</strong> agar urutan kolom cocok.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></span>
                                        <span>Kolom <strong>NRP</strong> dan <strong>Nama</strong> wajib diisi untuk identifikasi karyawan.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></span>
                                        <span>Jika NRP sudah ada di sistem, data akan diperbarui secara otomatis.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-3 mt-3 border-t border-emerald-200">
                                <a 
                                    href={route('manpower.template')}
                                    className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 hover:text-emerald-950 underline"
                                >
                                    <Download size={14} />
                                    <span>Unduh Template Import Excel Sekarang (.xlsx)</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* IMPORT MODAL DENGAN DOWNLOAD TEMPLATE RESMI                               */}
                {/* ========================================================================= */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
                            <div className="p-6 bg-[#00a65a] text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <FileSpreadsheet size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">Import Data Manpower</h3>
                                        <p className="text-xs text-emerald-100 font-semibold mt-0.5">
                                            Upload file Excel untuk menambah atau memperbarui data karyawan
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                                
                                {/* Box Download Template */}
                                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                                            <Download size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-black text-emerald-900 uppercase">
                                                Template Import Excel Resmi
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                Unduh template format Excel di bawah ini yang sudah terisi contoh format kolom (NRP, Nama, Departemen, Bagian, Jenis Karyawan, DOH, No KTP, BPJS, Rekening).
                                            </p>
                                            <div className="mt-3">
                                                <a 
                                                    href={route('manpower.template')}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition"
                                                >
                                                    <Download size={14} />
                                                    <span>Download Template Manpower (.xlsx)</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Drag & Drop Area */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Pilih File Excel (.xlsx, .xls, .csv)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition bg-gray-50/50">
                                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                        <label className="block text-sm font-bold text-gray-700 cursor-pointer">
                                            <span className="text-emerald-700 hover:underline">Klik untuk memilih file</span>
                                            <span className="text-gray-500 font-normal"> atau drag &amp; drop ke sini</span>
                                            <input 
                                                type="file" 
                                                accept=".xlsx,.xls,.csv"
                                                onChange={e => setImportFile(e.target.files[0] || null)}
                                                className="hidden"
                                                required
                                            />
                                        </label>
                                        {importFile && (
                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                                                <FileSpreadsheet size={14} />
                                                <span>{importFile.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Petunjuk Tambahan */}
                                <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200 leading-relaxed">
                                    <strong>Catatan:</strong> Pastikan baris pertama (header) tidak dihapus atau diubah agar pembacaan kolom berjalan sempurna.
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!importFile || isImporting}
                                        className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Upload size={14} />
                                        <span>{isImporting ? 'Mengimpor...' : 'Proses Import'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
