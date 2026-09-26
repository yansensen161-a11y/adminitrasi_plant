import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ShieldCheck, 
  Plus, 
  Printer, 
  FileDown, 
  Search, 
  Eye, 
  Wrench, 
  HardHat, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  LayoutGrid, 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Check, 
  ChevronRight,
  Zap,
  Flame,
  Truck,
  Wind,
  Layers,
  FileCheck
} from 'lucide-react';

export default function Portal({ 
  stats = {}, 
  cards = [], 
  recentForms = [], 
  allPresets = {}, 
  units = [], 
  taskTypes = {} 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPresetSlug, setSelectedPresetSlug] = useState('overhaul-starting-motor');

  // Form State using Inertia useForm
  const { data, setData, post, processing, reset, errors } = useForm({
    task_slug: 'overhaul-starting-motor',
    task_name: 'OVERHAUL STARTING MOTOR',
    date: new Date().toISOString().split('T')[0],
    unit_id: '',
    smu: '',
    shift: '1',
    department: 'PLANT',
    tools_needed: '',
    apd_needed: '',
    workers: { '1': '', '2': '', '3': '', '4': '' },
    steps: [],
    attendees: [],
    known_by_mam: 'Ambo Mai (Superintendent Plant)',
    approved_by_bbe: 'Subani (PJO)',
    notes: '',
    status: 'COMPLETED',
  });

  const openCreateModal = (slug) => {
    const targetSlug = slug || 'overhaul-starting-motor';
    const preset = allPresets[targetSlug] || allPresets['overhaul-starting-motor'] || {};
    setSelectedPresetSlug(targetSlug);
    setData({
      task_slug: targetSlug,
      task_name: preset.task_name || (taskTypes[targetSlug]?.title ?? 'Job Safety Analysis'),
      date: new Date().toISOString().split('T')[0],
      unit_id: '',
      smu: '',
      shift: '1',
      department: preset.department || 'PLANT',
      tools_needed: preset.tools_needed || '',
      apd_needed: preset.apd_needed || '',
      workers: preset.workers || { '1': '', '2': '', '3': '', '4': '' },
      steps: JSON.parse(JSON.stringify(preset.steps || [])),
      attendees: JSON.parse(JSON.stringify(preset.attendees || [])),
      known_by_mam: preset.known_by_mam || 'Ambo Mai (Superintendent Plant)',
      approved_by_bbe: preset.approved_by_bbe || 'Subani (PJO)',
      notes: '',
      status: 'COMPLETED',
    });
    setCreateModalOpen(true);
  };

  const handleModalPresetSwitch = (slug) => {
    const preset = allPresets[slug];
    if (preset) {
      setSelectedPresetSlug(slug);
      setData(prev => ({
        ...prev,
        task_slug: slug,
        task_name: preset.task_name || (taskTypes[slug]?.title ?? 'Job Safety Analysis'),
        tools_needed: preset.tools_needed || '',
        apd_needed: preset.apd_needed || '',
        workers: preset.workers || { '1': '', '2': '', '3': '', '4': '' },
        steps: JSON.parse(JSON.stringify(preset.steps || [])),
        attendees: JSON.parse(JSON.stringify(preset.attendees || [])),
        known_by_mam: preset.known_by_mam || 'Ambo Mai (Superintendent Plant)',
        approved_by_bbe: preset.approved_by_bbe || 'Subani (PJO)',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/form-jsa', {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const getCardIcon = (slug) => {
    switch (slug) {
      case 'overhaul-starting-motor':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'maintenance-ac-dump-truck':
        return <Wind className="w-6 h-6 text-cyan-500" />;
      case 'radiator-medium-truck':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'welding-chasis-medium-truck':
        return <Flame className="w-6 h-6 text-rose-500" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
    }
  };

  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(q) ||
      card.code.toLowerCase().includes(q) ||
      card.badge.toLowerCase().includes(q) ||
      (card.theme?.systemCategory || '').toLowerCase().includes(q) ||
      (card.theme?.shortDesc || '').toLowerCase().includes(q)
    );
  });

  return (
    <AuthenticatedLayout>
      <Head title="Portal Form JSA - Job Safety Environmental Analysis" />

      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
          {/* Subtle background glow & icon */}
          <div className="absolute -top-12 -right-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden md:block">
            <ShieldCheck className="w-80 h-80 text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PT MITRA ABADI MAHAKAM • HSE DIVISI PLANT</span>
                <span className="text-emerald-400/60">•</span>
                <span className="font-mono bg-emerald-400/20 px-1.5 py-0.2 rounded text-[11px]">
                  MAM-HSE-FORM-028
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <LayoutGrid className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400" />
                Portal Form JSA & SOP Analisis Bahaya
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Pusat sentralisasi formulir <strong>Job Safety Environmental Analysis (JSEA)</strong>. 
                Pilih modul prosedur kerja di bawah untuk melihat histori laporan, menginput form baru, 
                mencetak blangko fisik lapangan, atau mengunduh template resmi.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                onClick={() => openCreateModal('overhaul-starting-motor')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Buat Form JSA Baru</span>
              </button>

              <Link
                href="/form-jsa"
                className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl backdrop-blur-md border border-white/10 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Semua Data Tabel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── KPI METRICS STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.total_forms || 0}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Dokumen JSA
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.this_month || 0}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Dibuat Bulan Ini
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.completed_forms || 0}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status Completed / Approved
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.task_types_count || 4}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kategori Standar SOP
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD FILTER & SEARCH HEADER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modul Card Menu Form JSA ({filteredCards.length})
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul JSA, peralatan, kode..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
        </div>

        {/* ── 4 JSA PORTAL CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => {
            const theme = card.theme || {};
            const icon = getCardIcon(card.slug);

            return (
              <div
                key={card.slug}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Ambient Card Header Gradient Accent */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${theme.accent || 'from-emerald-500 to-teal-500'}`} />

                <div className="p-6 space-y-5">
                  {/* Top Bar: Icon, Code Badge & Counter */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
                        {icon}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${theme.badgeBg || 'bg-emerald-100 text-emerald-800'}`}>
                          {card.badge}
                        </span>
                        <div className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                          {card.code}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {card.form_count} Formulir
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <div>
                    <Link
                      href={card.view_url}
                      className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <span>{card.title}</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-500" />
                    </Link>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {theme.shortDesc || 'Standar Job Safety Analysis PT Mitra Abadi Mahakam'}
                    </p>
                  </div>

                  {/* Key Highlights: Steps Count & Safety Controls Preview */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Standar Langkah Kerja:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {card.total_steps} Langkah Terverifikasi
                      </span>
                    </div>

                    {card.hazard_highlights && card.hazard_highlights.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Potensi Bahaya Terpantau:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {card.hazard_highlights.map((haz, hIdx) => (
                            <span 
                              key={hIdx}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[220px]">{haz}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tools and APD Snippets */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-400 block mb-0.5">Peralatan:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-1 truncate font-mono">
                          {card.tools_needed || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block mb-0.5">APD Wajib:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-1 truncate font-mono">
                          {card.apd_needed || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD BOTTOM ACTIONS ── */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCreateModal(card.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                      title="Isi Form JSA Baru"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Form</span>
                    </button>

                    <Link
                      href={card.view_url}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Lihat Daftar Arsip Dokumen"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lihat Data</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={card.blank_print_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Cetak Blangko Standar Kosong"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Blangko</span>
                    </a>

                    <a
                      href={card.download_pdf_url}
                      className="inline-flex items-center gap-1 px-2.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-xl border border-blue-200/50 dark:border-blue-800/40 transition-colors"
                      title="Unduh PDF Resmi"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RECENT JSA SUBMISSIONS FEED ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                Histori Pengisian JSA Terbaru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dokumen keselamatan kerja yang baru saja diinput oleh tim mekanik plant.
              </p>
            </div>

            <Link
              href="/form-jsa"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua Laporan
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">No. Dokumen</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tugas Pekerjaan</th>
                  <th className="py-3 px-4">Unit Terkait</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                {recentForms && recentForms.length > 0 ? (
                  recentForms.map((item) => {
                    const results = item.results_data || {};
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.form_number}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          <span className="block text-[10px] text-slate-400">Shift {item.shift || '1'}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {results.task_name || item.service_type || 'Job Safety Analysis'}
                        </td>
                        <td className="py-3 px-4">
                          {item.unit ? (
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.unit.code_unit}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Workshop / Umum</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {item.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`/form-jsa/${item.id}/print`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Cetak Dokumen"
                            >
                              <Printer className="w-4 h-4" />
                            </a>
                            <a
                              href={`/form-jsa/download-pdf?id=${item.id}`}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                      Belum ada arsip formulir JSA yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── QUICK CREATE MODAL INTEGRATED ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Buat Formulir JSA Baru (MAM-HSE-FORM-028)
                  </h3>
                  <p className="text-xs text-slate-400">
                    SOP & Langkah Keselamatan Kerja PT Mitra Abadi Mahakam
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              {/* Task Selector Tabs inside Modal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Pilih Modul Standar Tugas:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(taskTypes).map(([slug, item]) => {
                    const isSelected = selectedPresetSlug === slug;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => handleModalPresetSwitch(slug)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs font-bold flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        <span className="text-base">{item.badge.split(' ')[0]}</span>
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Document Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Analisis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData('date', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Terkait (Opsional)
                  </label>
                  <select
                    value={data.unit_id}
                    onChange={(e) => setData('unit_id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    <option value="">-- Pekerjaan Umum / Workshop --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code_unit} - {u.model || u.type_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Kerja
                  </label>
                  <select
                    value={data.shift}
                    onChange={(e) => setData('shift', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    <option value="1">Shift 1 (Day Shift)</option>
                    <option value="2">Shift 2 (Night Shift)</option>
                  </select>
                </div>
              </div>

              {/* Tools & APD Summary Pre-filled from Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peralatan Kerja yang Diperlukan:
                  </label>
                  <textarea
                    rows={2}
                    value={data.tools_needed}
                    onChange={(e) => setData('tools_needed', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    APD Wajib yang Diperlukan:
                  </label>
                  <textarea
                    rows={2}
                    value={data.apd_needed}
                    onChange={(e) => setData('apd_needed', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Steps Checklist Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Langkah Kerja & Kontrol Bahaya Standar ({data.steps.length} Langkah):
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Otomatis memuat SOP resmi MAM-HSE-FORM-028
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  {data.steps.map((st, sIdx) => (
                    <div key={sIdx} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {st.no}. {st.step}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 border-l-2 border-emerald-500">
                        <strong>Tindakan Pencegahan:</strong> {st.controls.split('\n')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan Lapangan
                </label>
                <textarea
                  rows={2}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Catatan kondisi lokasi kerja, cuaca, atau penyesuaian khusus..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : 'Simpan Formulir JSA'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </AuthenticatedLayout>
  );
}
