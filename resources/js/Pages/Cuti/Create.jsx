import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { 
    Calendar, 
    User, 
    History, 
    Plus, 
    Trash2, 
    X, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    FileText, 
    Printer, 
    Car, 
    Plane, 
    Phone, 
    MapPin, 
    Briefcase,
    Building2,
    Users
} from 'lucide-react';

export default function Create({ 
    auth, 
    manpowers = [], 
    selectedManpowerId, 
    employee, 
    historicals = [], 
    cutiSummary = {}, 
    approvals = [], 
    formDefaults = {} 
}) {
    const [selectedEmpId, setSelectedEmpId] = useState(selectedManpowerId || employee?.id || '');
    const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);

    // Form state for new leave application
    const [leaveForm, setLeaveForm] = useState({
        jenis_cuti: formDefaults.jenis_cuti || 'Cuti Periodik (Roster)',
        alasan: formDefaults.alasan || '',
        tgl_mulai: formDefaults.tgl_mulai || '',
        tgl_selesai: formDefaults.tgl_selesai || '',
        total_hari: formDefaults.total_hari || '14 Hari',
        alamat: employee?.alamat || formDefaults.alamat || '',
        telp: employee?.hp || formDefaults.telp || '',
        darurat: formDefaults.darurat || '',
        delegasi: formDefaults.delegasi || '',
        butuh_transport: 'Ya',
        jenis_transport: formDefaults.jenis_transport || 'Mobil Dinas & Travel',
        tujuan: formDefaults.tujuan || `Site Harindo Wahana (Kubar) - ${employee?.lokasi || 'Samarinda'}`,
        tgl_berangkat: formDefaults.tgl_berangkat || '',
        jam_berangkat: formDefaults.jam_berangkat || '08:00',
        tgl_kembali: formDefaults.tgl_kembali || '',
        jam_kembali: formDefaults.jam_kembali || '17:00',
        penumpang: formDefaults.penumpang || '1 Orang',
        keterangan_tambahan: formDefaults.keterangan_tambahan || '',
    });

    // Form for Adding Historical Cuti
    const { data: historyForm, setData: setHistoryForm, post: postHistory, processing: historyProcessing, reset: resetHistory, errors: historyErrors } = useForm({
        manpower_id: employee?.id || '',
        periode: 'Periode V - 2026',
        tgl_mulai: '',
        tgl_selesai: '',
        durasi: 14,
        jenis_cuti: 'Cuti Periodik (Roster 70:14)',
        tujuan: employee?.lokasi || 'Samarinda',
        transportasi: 'Mobil Dinas & Travel',
        status: 'SELESAI',
        catatan: '',
    });

    useEffect(() => {
        if (employee?.id) {
            setSelectedEmpId(employee.id);
            setHistoryForm('manpower_id', employee.id);
            setLeaveForm(prev => ({
                ...prev,
                alamat: employee.alamat || prev.alamat,
                telp: employee.hp || prev.telp,
                tujuan: `Site Harindo Wahana (Kubar) - ${employee.lokasi || 'Samarinda'}`,
            }));
        }
    }, [employee, selectedManpowerId]);

    // Handle employee change
    const handleManpowerChange = (e) => {
        const id = e.target.value;
        setSelectedEmpId(id);
        router.get(route('cuti.pengajuan'), { manpower_id: id }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Submit Add History
    const submitHistory = (e) => {
        e.preventDefault();
        postHistory(route('cuti.historical.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddHistoryModalOpen(false);
                resetHistory();
            },
        });
    };

    // Delete Historical Item
    const handleDeleteHistory = (id) => {
        if (confirm('Hapus riwayat cuti periodik ini?')) {
            router.delete(route('cuti.historical.destroy', id), { preserveScroll: true });
        }
    };

    // Status Badge Helper
    const renderStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'SELESAI') return <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded text-xs uppercase border border-emerald-200">SELESAI</span>;
        if (s === 'BERJALAN') return <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded text-xs uppercase border border-amber-200">BERJALAN</span>;
        if (s === 'DIAJUKAN' || s === 'DISETUJUI') return <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded text-xs uppercase border border-blue-200">{s}</span>;
        if (s === 'MENUNGGU') return <span className="bg-orange-50 text-orange-600 font-bold px-2.5 py-1 rounded text-xs uppercase border border-orange-200">MENUNGGU</span>;
        return <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded text-xs uppercase">{status}</span>;
    };

    // Dummy Signature SVG
    const SignatureSvg = () => (
        <svg viewBox="0 0 100 40" className="w-16 h-8 mx-auto opacity-70">
            <path d="M10,25 Q20,5 30,25 T50,25 T70,15 T90,25" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M25,20 Q35,10 45,30" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Form Pengajuan Cuti & Riwayat Cuti Periodik" />

            <div className="bg-gray-50/50 min-h-screen pb-16 w-full">
                
                {/* Header & Breadcrumb */}
                <div className="bg-white border-b border-gray-200 px-6 lg:px-10 py-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30 shadow-xs">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#0b132b] tracking-tight">Form Pengajuan Cuti</h1>
                        <p className="text-xs text-gray-500">Lengkapi data pengajuan cuti dengan benar dan upload dokumen pendukung (jika ada).</p>
                    </div>
                    
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <span>Dashboard</span>
                        <span>&rsaquo;</span>
                        <span>Pengajuan Cuti</span>
                        <span>&rsaquo;</span>
                        <span className="font-bold text-gray-900">Form Pengajuan Cuti</span>
                    </div>
                </div>

                <div className="px-6 lg:px-10 space-y-6">

                    {/* ========================================================================= */}
                    {/* PANEL 1: DATA KARYAWAN DENGAN PILIHAN MANPOWER */}
                    {/* ========================================================================= */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 relative overflow-hidden">
                        
                        {/* Title & Manpower Selector Row */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
                            <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-[#0b5c3e]" />
                                DATA KARYAWAN
                            </h3>

                            {/* SELECTOR MANPOWER YANG TELAH DIINPUT */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-emerald-50/70 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-200">
                                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 whitespace-nowrap">
                                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                                    Pilih Karyawan Manpower:
                                </label>
                                <select 
                                    value={selectedEmpId} 
                                    onChange={handleManpowerChange}
                                    className="bg-white border border-emerald-300 text-gray-900 text-xs font-bold rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[280px] sm:min-w-[340px] cursor-pointer shadow-xs"
                                >
                                    {manpowers.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5 flex-1 text-sm">
                                {/* Col 1 */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">NRP / ID</span>
                                        <span className="font-bold text-gray-900 font-mono">: {employee?.nrp}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Nama Lengkap</span>
                                        <span className="font-extrabold text-gray-900 uppercase">: {employee?.nama}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Jabatan</span>
                                        <span className="font-bold text-gray-800">: {employee?.jabatan}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Departemen</span>
                                        <span className="font-bold text-gray-800">: {employee?.departemen}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Golongan</span>
                                        <span className="font-bold text-gray-800">: {employee?.golongan}</span>
                                    </div>
                                </div>
                                
                                {/* Col 2 */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Lokasi / Site</span>
                                        <span className="font-bold text-gray-800">: {employee?.lokasi}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Status Karyawan</span>
                                        <span className="font-bold text-emerald-700">: {employee?.status}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Tgl. Masuk (DOH)</span>
                                        <span className="font-bold text-gray-800">: {employee?.tgl_masuk}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">No. HP / WA</span>
                                        <span className="font-bold text-gray-800 font-mono">: {employee?.hp}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32 text-gray-500 text-xs font-medium">Email</span>
                                        <span className="font-bold text-blue-700 text-xs">: {employee?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Photo / Avatar Box */}
                            <div className="hidden lg:flex w-28 h-36 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-xl ml-6 overflow-hidden border border-emerald-200 shrink-0 flex-col items-center justify-center text-emerald-700 shadow-xs">
                                <div className="w-14 h-14 rounded-full bg-white shadow-xs flex items-center justify-center font-black text-xl text-emerald-800 mb-2 border border-emerald-200">
                                    {employee?.nama ? employee.nama.charAt(0) : 'Y'}
                                </div>
                                <span className="text-[11px] font-extrabold text-emerald-900 tracking-wider">MANPOWER</span>
                                <span className="text-[9px] font-semibold text-emerald-600">{employee?.golongan}</span>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* PANEL 2: HISTORICAL CUTI PERIODIK (RIWAYAT CUTI PERIODIK KARYAWAN) */}
                    {/* ========================================================================= */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100 mb-4">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                                        HISTORICAL CUTI PERIODIK
                                    </h3>
                                    <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                                        {cutiSummary.pola_roster || 'Pola Roster 70:14'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Daftar riwayat cuti periodik, rotasi roster kerja, dan pelaksanaan kepulangan karyawan.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setHistoryForm('manpower_id', employee?.id || '');
                                    setIsAddHistoryModalOpen(true);
                                }}
                                className="bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Riwayat Cuti</span>
                            </button>
                        </div>

                        {/* Ringkasan Cuti KPI Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-gray-500 uppercase">Pola Roster Kerja</div>
                                <div className="text-sm font-black text-gray-900 mt-0.5">70 Hari : 14 Hari</div>
                                <div className="text-[9px] text-gray-400">10 Minggu Kerja / 2 Minggu Cuti</div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Cuti Terpakai</div>
                                <div className="text-sm font-black text-emerald-800 mt-0.5">{cutiSummary.total_diambil || '0 Hari'}</div>
                                <div className="text-[9px] text-emerald-600">Pelaksanaan cuti tahun 2026</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-blue-700 uppercase">Sisa Hak Cuti Periodik</div>
                                <div className="text-sm font-black text-blue-800 mt-0.5">{cutiSummary.sisa_hak_cuti || '14 Hari'}</div>
                                <div className="text-[9px] text-blue-600">Siklus periode berjalan</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-amber-700 uppercase">Rencana Cuti Berikutnya</div>
                                <div className="text-sm font-black text-amber-800 mt-0.5">{cutiSummary.jadwal_berikutnya || '23 Sep 2026'}</div>
                                <div className="text-[9px] text-amber-600">Sesuai jadwal rotasi site</div>
                            </div>
                        </div>

                        {/* Tabel Riwayat Cuti Periodik */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-2xs">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="py-2.5 px-3 text-center border-r border-gray-200 w-10">NO</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200 w-36">PERIODE SIKLUS</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200 w-28 text-center">TGL MULAI</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200 w-28 text-center">TGL SELESAI</th>
                                        <th className="py-2.5 px-2.5 border-r border-gray-200 w-16 text-center">DURASI</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200">JENIS CUTI</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200">TUJUAN (POH)</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200">TRANSPORTASI</th>
                                        <th className="py-2.5 px-3 text-center border-r border-gray-200 w-24">STATUS</th>
                                        <th className="py-2.5 px-3 border-r border-gray-200 w-36">NO. REFERENSI</th>
                                        <th className="py-2.5 px-2 text-center w-12">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
                                    {historicals.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="py-6 text-center text-gray-400 text-xs">
                                                Belum ada riwayat cuti periodik untuk karyawan ini. Klik "Tambah Riwayat Cuti" untuk mencatat siklus cuti.
                                            </td>
                                        </tr>
                                    ) : (
                                        historicals.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-amber-50/40 transition">
                                                <td className="py-2 px-3 text-center font-bold text-gray-500 border-r border-gray-200">{idx + 1}</td>
                                                <td className="py-2 px-3 font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">{item.periode}</td>
                                                <td className="py-2 px-3 text-center border-r border-gray-200 font-medium whitespace-nowrap">{item.tgl_mulai}</td>
                                                <td className="py-2 px-3 text-center border-r border-gray-200 font-medium whitespace-nowrap">{item.tgl_selesai}</td>
                                                <td className="py-2 px-2.5 text-center font-bold text-emerald-800 bg-emerald-50/40 border-r border-gray-200 whitespace-nowrap">{item.durasi} Hari</td>
                                                <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-800 whitespace-nowrap">{item.jenis_cuti}</td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-gray-800 font-medium whitespace-nowrap">{item.tujuan || '-'}</td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-gray-600 text-[11px] whitespace-nowrap">{item.transportasi || '-'}</td>
                                                <td className="py-2 px-3 text-center border-r border-gray-200 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                                                <td className="py-2 px-3 border-r border-gray-200 font-mono text-[10px] text-gray-500 whitespace-nowrap">{item.no_dokumen || '-'}</td>
                                                <td className="py-2 px-2 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDeleteHistory(item.id)}
                                                        className="text-gray-400 hover:text-rose-600 p-1 transition"
                                                        title="Hapus riwayat ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* PANEL 3: SPLIT ROW DATA PENGAJUAN CUTI & TRANSPORTASI */}
                    {/* ========================================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* DATA PENGAJUAN CUTI */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                            <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                DATA PENGAJUAN CUTI
                            </h3>

                            <div className="space-y-4 text-sm text-gray-800 font-medium">
                                {/* Row 1 */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Cuti <span className="text-red-500">*</span></label>
                                        <select 
                                            value={leaveForm.jenis_cuti}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, jenis_cuti: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]"
                                        >
                                            <option>Cuti Periodik (Roster)</option>
                                            <option>Cuti Tahunan</option>
                                            <option>Cuti Sakit</option>
                                            <option>Cuti Menikah / Khusus</option>
                                            <option>Cuti Kompensasi</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Alasan Cuti <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.alasan}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, alasan: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                            placeholder="Contoh: Liburan Keluarga / Cuti Roster"
                                        />
                                    </div>
                                </div>
                                
                                {/* Row 2 */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.tgl_mulai}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, tgl_mulai: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.tgl_selesai}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, tgl_selesai: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Total Hari</label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.total_hari}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, total_hari: e.target.value })}
                                            className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-black text-center text-xs rounded px-3 py-2 focus:outline-none" 
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Selama Cuti</label>
                                    <textarea 
                                        value={leaveForm.alamat}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, alamat: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c] resize-none h-14" 
                                    />
                                </div>

                                {/* Row 4 */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">No. Telp Selama Cuti</label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.telp}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, telp: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Kontak Darurat</label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.darurat}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, darurat: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                </div>

                                {/* Row 5 */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Pekerjaan / Tanggung Jawab yang Didelegasikan</label>
                                    <textarea 
                                        value={leaveForm.delegasi}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, delegasi: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c] resize-none h-14" 
                                    />
                                </div>

                                {/* Lampiran Dokumen */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Lampiran Dokumen</label>
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-xs font-bold text-gray-800">{formDefaults.lampiran_nama}</div>
                                                <div className="text-[9px] text-gray-500">({formDefaults.lampiran_size})</div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Terlampir</span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 mt-1 italic">* Surat pendukung atau tiket perjalanan (Maks. 2 MB, PDF/JPG/PNG)</div>
                                </div>
                            </div>
                        </div>

                        {/* PENGAJUAN TRANSPORTASI */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                            <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                PENGAJUAN TRANSPORTASI
                            </h3>

                            <div className="space-y-4 text-sm text-gray-800 font-medium">
                                {/* Radio */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Apakah memerlukan transportasi perusahaan?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                                            <input 
                                                type="radio" 
                                                name="butuh_transport" 
                                                checked={leaveForm.butuh_transport === 'Ya'}
                                                onChange={() => setLeaveForm({ ...leaveForm, butuh_transport: 'Ya' })}
                                                className="w-3.5 h-3.5 text-[#0a4d3c] focus:ring-[#0a4d3c]" 
                                            />
                                            <span>Ya</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                                            <input 
                                                type="radio" 
                                                name="butuh_transport" 
                                                checked={leaveForm.butuh_transport === 'Tidak'}
                                                onChange={() => setLeaveForm({ ...leaveForm, butuh_transport: 'Tidak' })}
                                                className="w-3.5 h-3.5 text-gray-400 focus:ring-gray-400" 
                                            />
                                            <span>Tidak</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Jenis Transportasi */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Transportasi <span className="text-red-500">*</span></label>
                                    <select 
                                        value={leaveForm.jenis_transport}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, jenis_transport: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]"
                                    >
                                        <option>Mobil Dinas & Travel</option>
                                        <option>Mobil Dinas</option>
                                        <option>Travel Perusahaan</option>
                                        <option>Tiket Pesawat & Travel</option>
                                        <option>Kendaraan Pribadi</option>
                                    </select>
                                </div>

                                {/* Tujuan */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan Perjalanan <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={leaveForm.tujuan}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, tujuan: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                    />
                                </div>

                                {/* Berangkat */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Berangkat <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.tgl_berangkat}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, tgl_berangkat: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Berangkat <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.jam_berangkat}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, jam_berangkat: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                </div>

                                {/* Kembali */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Kembali <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.tgl_kembali}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, tgl_kembali: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Kembali <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={leaveForm.jam_kembali}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, jam_kembali: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                        />
                                    </div>
                                </div>

                                {/* Penumpang */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Penumpang</label>
                                    <input 
                                        type="text" 
                                        value={leaveForm.penumpang}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, penumpang: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c]" 
                                    />
                                </div>

                                {/* Keterangan Tambahan */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan Tambahan</label>
                                    <textarea 
                                        value={leaveForm.keterangan_tambahan}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, keterangan_tambahan: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#0a4d3c] resize-none h-14" 
                                        placeholder="Catatan mobil atau kebutuhan drop off / pick up..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* PANEL 4: ALUR PERSETUJUAN */}
                    {/* ========================================================================= */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-sm font-extrabold text-[#0b5c3e] uppercase tracking-wider mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#0b5c3e]" />
                            ALUR PERSETUJUAN
                        </h3>
                        <p className="text-xs text-gray-500 mb-5">Form ini harus mendapatkan persetujuan berjenjang sesuai alur di bawah ini.</p>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-xs text-center whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">NO</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">LEVEL PERSETUJUAN</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">NAMA</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">JABATAN</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">STATUS</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">TANGGAL</th>
                                        <th className="px-3 py-1.5 font-bold text-gray-600">TANDA TANGAN</th>
                                        <th className="px-3 py-2.5 font-bold text-gray-600">CATATAN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {approvals.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-3 py-2.5 font-bold text-gray-500">{idx + 1}</td>
                                            <td className="px-3 py-2.5 font-medium">{item.level}</td>
                                            <td className="px-3 py-2.5 font-bold text-gray-900">{item.nama}</td>
                                            <td className="px-3 py-2.5 text-gray-600">{item.jabatan}</td>
                                            <td className="px-3 py-2.5">{renderStatusBadge(item.status)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">{item.tanggal}</td>
                                            <td className="px-3 py-1 h-10">
                                                {item.status !== 'MENUNGGU' ? <SignatureSvg /> : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500">{item.catatan}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pb-12">
                        <div className="flex gap-3">
                            <button 
                                onClick={() => alert('Pengajuan Cuti berhasil disimpan!')}
                                className="bg-[#0b5c3e] hover:bg-[#08422c] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Simpan Pengajuan</span>
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                                <span>Reset Form</span>
                            </button>
                        </div>
                        
                        <div className="flex gap-2.5">
                            <button 
                                onClick={() => window.print()}
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak Dokumen</span>
                            </button>
                            <a 
                                href="/cuti/jadwal"
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition border border-gray-300 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <span>Jadwal Cuti Seluruh Karyawan</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL TAMBAH RIWAYAT CUTI PERIODIK */}
            <Modal show={isAddHistoryModalOpen} onClose={() => setIsAddHistoryModalOpen(false)} maxWidth="md">
                <form onSubmit={submitHistory} className="p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-700" />
                            <h2 className="text-base font-bold text-gray-900">
                                Tambah Riwayat Cuti Periodik: {employee?.nama}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddHistoryModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <InputLabel htmlFor="periode" value="Periode / Siklus Cuti" />
                            <TextInput
                                id="periode"
                                type="text"
                                className="mt-1 block w-full text-xs font-semibold"
                                value={historyForm.periode}
                                onChange={(e) => setHistoryForm('periode', e.target.value)}
                                placeholder="Contoh: Periode I - 2026 atau Cuti Roster Ke-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="tgl_mulai" value="Tanggal Mulai" />
                                <TextInput
                                    id="tgl_mulai"
                                    type="text"
                                    className="mt-1 block w-full text-xs"
                                    value={historyForm.tgl_mulai}
                                    onChange={(e) => setHistoryForm('tgl_mulai', e.target.value)}
                                    placeholder="Contoh: 15 Jan 2026"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="tgl_selesai" value="Tanggal Selesai" />
                                <TextInput
                                    id="tgl_selesai"
                                    type="text"
                                    className="mt-1 block w-full text-xs"
                                    value={historyForm.tgl_selesai}
                                    onChange={(e) => setHistoryForm('tgl_selesai', e.target.value)}
                                    placeholder="Contoh: 28 Jan 2026"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="durasi" value="Durasi (Hari)" />
                                <TextInput
                                    id="durasi"
                                    type="number"
                                    min="1"
                                    className="mt-1 block w-full text-xs font-bold text-center"
                                    value={historyForm.durasi}
                                    onChange={(e) => setHistoryForm('durasi', parseInt(e.target.value) || 14)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full text-xs font-semibold border-gray-300 rounded-md shadow-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    value={historyForm.status}
                                    onChange={(e) => setHistoryForm('status', e.target.value)}
                                >
                                    <option value="SELESAI">SELESAI</option>
                                    <option value="BERJALAN">BERJALAN</option>
                                    <option value="DISETUJUI">DISETUJUI</option>
                                    <option value="DIAJUKAN">DIAJUKAN</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="tujuan" value="Tujuan (POH / Kota)" />
                                <TextInput
                                    id="tujuan"
                                    type="text"
                                    className="mt-1 block w-full text-xs"
                                    value={historyForm.tujuan}
                                    onChange={(e) => setHistoryForm('tujuan', e.target.value)}
                                    placeholder="Contoh: Samarinda, Pare-pare"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="transportasi" value="Transportasi" />
                                <TextInput
                                    id="transportasi"
                                    type="text"
                                    className="mt-1 block w-full text-xs"
                                    value={historyForm.transportasi}
                                    onChange={(e) => setHistoryForm('transportasi', e.target.value)}
                                    placeholder="Contoh: Travel & Mobil Dinas"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="catatan" value="Catatan Tambahan (Opsional)" />
                            <TextInput
                                id="catatan"
                                type="text"
                                className="mt-1 block w-full text-xs"
                                value={historyForm.catatan}
                                onChange={(e) => setHistoryForm('catatan', e.target.value)}
                                placeholder="Keterangan singkat..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                        <SecondaryButton onClick={() => setIsAddHistoryModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={historyProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                            {historyProcessing ? 'Menyimpan...' : 'Simpan Riwayat'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
