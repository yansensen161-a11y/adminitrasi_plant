import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ShieldCheck, 
  Plus, 
  Printer, 
  FileDown, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Wrench, 
  HardHat, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  RotateCcw,
  Sparkles,
  Filter,
  LayoutGrid
} from 'lucide-react';

export default function Index({ 
  forms, 
  filters, 
  taskTypes, 
  activeTaskType, 
  activePreset, 
  allPresets, 
  units = [] 
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedTaskSlug, setSelectedTaskSlug] = useState(activeTaskType || 'overhaul-starting-motor');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  // Form State using Inertia useForm
  const { data, setData, post, put, processing, reset, errors } = useForm({
    task_slug: activePreset.task_slug,
    task_name: activePreset.task_name,
    date: new Date().toISOString().split('T')[0],
    unit_id: '',
    smu: '',
    shift: '1',
    department: activePreset.department || 'PLANT',
    tools_needed: activePreset.tools_needed || '',
    apd_needed: activePreset.apd_needed || '',
    workers: activePreset.workers || { '1': '', '2': '', '3': '', '4': '' },
    steps: activePreset.steps || [],
    attendees: activePreset.attendees || [],
    known_by_mam: activePreset.known_by_mam || 'Ambo Mai (Superintendent Plant)',
    approved_by_bbe: activePreset.approved_by_bbe || 'Subani (PJO)',
    notes: '',
    status: 'COMPLETED',
  });

  // Handle switching preset in modal
  const handlePresetChange = (slug) => {
    const preset = allPresets[slug];
    if (preset) {
      setData(prev => ({
        ...prev,
        task_slug: preset.task_slug,
        task_name: preset.task_name,
        tools_needed: preset.tools_needed,
        apd_needed: preset.apd_needed,
        workers: preset.workers,
        steps: JSON.parse(JSON.stringify(preset.steps)),
        attendees: JSON.parse(JSON.stringify(preset.attendees)),
        known_by_mam: preset.known_by_mam,
        approved_by_bbe: preset.approved_by_bbe,
      }));
    }
  };

  const openCreateModal = (slug = selectedTaskSlug) => {
    const currentSlug = slug || 'overhaul-starting-motor';
    const preset = allPresets[currentSlug] || activePreset;
    setEditingForm(null);
    setData({
      task_slug: preset.task_slug,
      task_name: preset.task_name,
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
    setModalOpen(true);
  };

  const openEditModal = (form) => {
    setEditingForm(form);
    const results = form.results_data || {};
    const taskSlug = results.task_slug || form.service_type || 'overhaul-starting-motor';
    const preset = allPresets[taskSlug] || activePreset;

    setData({
      task_slug: taskSlug,
      task_name: results.task_name || form.service_type || preset.task_name,
      date: form.date ? form.date.split('T')[0] : new Date().toISOString().split('T')[0],
      unit_id: form.unit_id || '',
      smu: form.smu || '',
      shift: form.shift || '1',
      department: results.department || 'PLANT',
      tools_needed: results.tools_needed || preset.tools_needed,
      apd_needed: results.apd_needed || preset.apd_needed,
      workers: results.workers || preset.workers,
      steps: form.items || preset.steps,
      attendees: results.attendees || preset.attendees,
      known_by_mam: results.known_by_mam || preset.known_by_mam,
      approved_by_bbe: results.approved_by_bbe || preset.approved_by_bbe,
      notes: form.notes || '',
      status: form.status || 'COMPLETED',
    });
    setModalOpen(true);
  };

  const openPreview = (form) => {
    setPreviewForm(form);
    setPreviewModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingForm) {
      put(`/form-jsa/${editingForm.id}`, {
        onSuccess: () => {
          setModalOpen(false);
        },
      });
    } else {
      post('/form-jsa', {
        onSuccess: () => {
          setModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (form) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus formulir ${form.form_number}?`)) {
      router.delete(`/form-jsa/${form.id}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const url = activeTaskType ? `/form-jsa/${activeTaskType}` : '/form-jsa';
    router.get(url, { search }, { preserveState: true, replace: true });
  };

  // Step manipulation in modal
  const addStep = () => {
    const nextNo = (data.steps.length > 0 ? Math.max(...data.steps.map(s => parseInt(s.no) || 0)) : 0) + 1;
    setData('steps', [
      ...data.steps,
      {
        no: nextNo,
        step: '',
        hazards: '',
        controls: '',
        pic: 'Mekanik',
      }
    ]);
  };

  const removeStep = (index) => {
    const updated = data.steps.filter((_, idx) => idx !== index);
    setData('steps', updated);
  };

  const updateStep = (index, field, value) => {
    const updated = [...data.steps];
    updated[index][field] = value;
    setData('steps', updated);
  };

  const resetToOfficialPdf = () => {
    const preset = allPresets[data.task_slug];
    if (preset) {
      setData('steps', JSON.parse(JSON.stringify(preset.steps)));
      setData('tools_needed', preset.tools_needed);
      setData('apd_needed', preset.apd_needed);
      alert('Langkah kerja telah disesuaikan kembali dengan standar resmi PDF MAM-HSE-FORM-028.');
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Form JSA - ${taskTypes[activeTaskType]?.title || 'Job Safety Analysis'}`} />

      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* TOP BREADCRUMB & HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Standard Form PT MITRA ABADI MAHAKAM</span>
              <span className="text-slate-400">•</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
                MAM-HSE-FORM-028
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              FORM JOB SAFETY ENVIROMENTAL ANALYSIS (JSEA)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Standar baku identifikasi potensi bahaya, urutan kerja mendasar, dan tindakan pencegahan risiko lingkungan & keselamatan kerja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/form-jsa/portal"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-sm rounded-xl transition-colors border border-emerald-300/40"
              title="Buka Tampilan Portal Card"
            >
              <LayoutGrid className="w-4 h-4" />
              Portal Card Hub
            </Link>

            <button
              onClick={() => openCreateModal(activeTaskType || 'overhaul-starting-motor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat Form JSA Baru
            </button>

            <a
              href={`/form-jsa/blank-print/${activeTaskType || 'overhaul-starting-motor'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
              title="Cetak Blangko Standar Kosong"
            >
              <Printer className="w-4 h-4" />
              Cetak Blangko
            </a>

            <a
              href={`/form-jsa/download-pdf?task_slug=${activeTaskType || 'overhaul-starting-motor'}`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-xl transition-colors"
              title="Download Template Dokumen PDF"
            >
              <FileDown className="w-4 h-4" />
              Template PDF
            </a>
          </div>
        </div>

        {/* 4 SUBMENU NAVIGATION TABS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Link
            href="/form-jsa"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              !activeTaskType
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Semua JSA</span>
          </Link>

          {Object.entries(taskTypes).map(([slug, item]) => {
            const isActive = activeTaskType === slug;
            return (
              <Link
                key={slug}
                href={`/form-jsa/${slug}`}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all text-center ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span>{item.badge.split(' ')[0]}</span>
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* CURRENT TASK PRESET HERO OVERVIEW */}
        {activeTaskType && (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-emerald-400" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Standard Template Aktif
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {taskTypes[activeTaskType]?.title}
                </h2>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Formulir Analisis Keselamatan Kerja resmi MAM-HSE-FORM-028 lengkap dengan mitigasi dan urutan kerja standar.
                </p>
                <div className="pt-2">
                  <span className="text-xs text-slate-300 font-mono bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                    Departemen: {activePreset?.department || 'PLANT'}
                  </span>
                </div>
              </div>

              <div className="md:col-span-1 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
                  <Wrench className="w-4 h-4" />
                  <span>Peralatan yang Diperlukan:</span>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                  {activePreset?.tools_needed || '-'}
                </p>
              </div>

              <div className="md:col-span-1 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase">
                  <HardHat className="w-4 h-4" />
                  <span>APD yang Diperlukan:</span>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                  {activePreset?.apd_needed || '-'}
                </p>
                <div className="pt-1 text-[11px] text-emerald-400">
                  Total {activePreset?.steps?.length || 0} Langkah Standar Terverifikasi
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor dokumen, tugas pekerjaan, unit, atau catatan JSA..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </form>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total Dokumen: <strong className="text-slate-900 dark:text-white">{forms.total || 0}</strong>
          </div>
        </div>

        {/* TABLE LIST OF JSA FORMS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 text-center">No</th>
                  <th className="py-3.5 px-4">Nomor JSA</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Tugas Pekerjaan</th>
                  <th className="py-3.5 px-4">Unit Terkait</th>
                  <th className="py-3.5 px-4 text-center">Langkah</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                {forms.data && forms.data.length > 0 ? (
                  forms.data.map((item, index) => {
                    const results = item.results_data || {};
                    const stepsCount = item.items ? item.items.length : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {(forms.current_page - 1) * forms.per_page + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.form_number}
                          </span>
                          <span className="block text-[10px] text-slate-400">MAM-HSE-FORM-028</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          <span className="block text-[10px] text-slate-400">Shift {item.shift || '1'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {results.task_name || item.service_type || 'Job Safety Analysis'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Dept: {results.department || 'PLANT'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {item.unit ? (
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {item.unit.code_unit}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {item.unit.model || item.unit.type_unit}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Umum / Workshop</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {stepsCount} Langkah
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {item.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openPreview(item)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Edit Formulir"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <a
                              href={`/form-jsa/${item.id}/print`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Cetak Formulir (Print View)"
                            >
                              <Printer className="w-4 h-4" />
                            </a>

                            <a
                              href={`/form-jsa/download-pdf?id=${item.id}`}
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Download Dokumen PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Hapus Formulir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/60 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Belum ada dokumen JSA
                        </h3>
                        <p className="text-xs text-slate-500">
                          Klik tombol di bawah untuk membuat analisis keselamatan kerja baru dengan template PDF resmi.
                        </p>
                        <button
                          onClick={() => openCreateModal(activeTaskType || 'overhaul-starting-motor')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Buat Dokumen Sekarang
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {forms.links && forms.links.length > 3 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Menampilkan {forms.from || 0} - {forms.to || 0} dari {forms.total || 0} data
              </span>
              <div className="flex items-center gap-1">
                {forms.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      link.active
                        ? 'bg-emerald-600 text-white'
                        : link.url
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL BUAT / EDIT JSA */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>MAM-HSE-FORM-028 Standard</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {editingForm ? `Edit Formulir JSA - ${editingForm.form_number}` : 'Buat Formulir JSA Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
                
                {/* Task Presets Switcher Banner */}
                {!editingForm && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                        Pilih Template Dokumen Resmi PDF:
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">
                        Otomatis mengisi urutan kerja mendasar, potensi bahaya, dan tindakan pencegahan standar.
                      </span>
                    </div>
                    <select
                      value={data.task_slug}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-semibold text-emerald-900 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(taskTypes).map(([slug, item]) => (
                        <option key={slug} value={slug}>
                          {item.badge.split(' ')[0]} {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section 1: General Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Tugas Pekerjaan *
                    </label>
                    <input
                      type="text"
                      value={data.task_name}
                      onChange={(e) => setData('task_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Departemen / Divisi
                    </label>
                    <input
                      type="text"
                      value={data.department}
                      onChange={(e) => setData('department', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Tanggal Pelaksanaan *
                    </label>
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) => setData('date', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Unit Terkait (Opsional)
                    </label>
                    <select
                      value={data.unit_id}
                      onChange={(e) => setData('unit_id', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Hour Meter (HM / SMU)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.smu}
                      onChange={(e) => setData('smu', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Shift
                    </label>
                    <select
                      value={data.shift}
                      onChange={(e) => setData('shift', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      <option value="1">Shift 1 (Siang)</option>
                      <option value="2">Shift 2 (Malam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Status Formulir
                    </label>
                    <select
                      value={data.status}
                      onChange={(e) => setData('status', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="COMPLETED">COMPLETED (Selesai)</option>
                      <option value="APPROVED">APPROVED (Disetujui)</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Peralatan & APD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                      <Wrench className="w-3.5 h-3.5" />
                      Peralatan yang Diperlukan
                    </label>
                    <textarea
                      rows={3}
                      value={data.tools_needed}
                      onChange={(e) => setData('tools_needed', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                      placeholder="Contoh: 1. Toolbox, 2. Alvo, dll."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      <HardHat className="w-3.5 h-3.5" />
                      APD yang Diperlukan
                    </label>
                    <textarea
                      rows={3}
                      value={data.apd_needed}
                      onChange={(e) => setData('apd_needed', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                      placeholder="Contoh: 1. Helm, Safety Glass, Safety Shoes, sarung tangan"
                    />
                  </div>
                </div>

                {/* Section 3: Nama Orang yang Bekerja */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    <Users className="w-3.5 h-3.5" />
                    Nama Orang yang Bekerja
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['1', '2', '3', '4'].map((num) => (
                      <div key={num} className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold text-xs text-slate-500">{num}.</span>
                        <input
                          type="text"
                          value={data.workers[num] || ''}
                          onChange={(e) => {
                            const updated = { ...data.workers, [num]: e.target.value };
                            setData('workers', updated);
                          }}
                          placeholder={`Pekerja #${num}`}
                          className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Dynamic Steps Analysis Table */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Tabel Analisis Keselamatan Kerja & Mitigasi
                      </h4>
                      <p className="text-xs text-slate-500">
                        {data.steps.length} urutan kerja terdaftar dalam dokumen ini.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetToOfficialPdf}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                        title="Reset langkah ke versi resmi dokumen PDF"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset ke Bawaan PDF
                      </button>

                      <button
                        type="button"
                        onClick={addStep}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Baris
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.steps.map((step, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                              {step.no || index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                              Langkah Urutan Kerja #{step.no || index + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>PIC:</span>
                              <input
                                type="text"
                                value={step.pic || 'Mekanik'}
                                onChange={(e) => updateStep(index, 'pic', e.target.value)}
                                className="w-24 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Hapus baris langkah ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Urutan Kerja yang Mendasar:
                          </label>
                          <input
                            type="text"
                            value={step.step}
                            onChange={(e) => updateStep(index, 'step', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                            placeholder="Contoh: Menyiapkan peralatan"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                              Kondisi Bahaya yang Potensial:
                            </label>
                            <textarea
                              rows={3}
                              value={step.hazards}
                              onChange={(e) => updateStep(index, 'hazards', e.target.value)}
                              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono leading-relaxed"
                              placeholder="Identifikasi potensi bahaya tiap langkah..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                              Tindakan atau Procedure yang Direkomendasikan:
                            </label>
                            <textarea
                              rows={3}
                              value={step.controls}
                              onChange={(e) => updateStep(index, 'controls', e.target.value)}
                              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono leading-relaxed"
                              placeholder="Tentukan tindakan pencegahan kecelakaan..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Pengesahan & Signatures */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                    Persetujuan & Pengesahan Dokumen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Diketahui Oleh Pihak PT. MAM:
                      </label>
                      <input
                        type="text"
                        value={data.known_by_mam}
                        onChange={(e) => setData('known_by_mam', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Disetujui Oleh Pihak PT. BBE:
                      </label>
                      <input
                        type="text"
                        value={data.approved_by_bbe}
                        onChange={(e) => setData('approved_by_bbe', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 6: Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Catatan inspeksi atau instruksi kerja khusus..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    {processing ? 'Menyimpan...' : (editingForm ? 'Simpan Perubahan' : 'Simpan Dokumen JSA')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DETAIL / PREVIEW */}
        {previewModalOpen && previewForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Preview Dokumen JSEA (MAM-HSE-FORM-028)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {previewForm.form_number} - {previewForm.results_data?.task_name || previewForm.service_type}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Tanggal</span>
                    <strong className="text-slate-800 dark:text-slate-200">{previewForm.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Shift</span>
                    <strong className="text-slate-800 dark:text-slate-200">Shift {previewForm.shift || '1'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Unit</span>
                    <strong className="text-slate-800 dark:text-slate-200">{previewForm.unit?.code_unit || 'Umum'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {previewForm.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Urutan Langkah Kerja & Mitigasi:</h4>
                  <div className="space-y-2">
                    {(previewForm.items || []).map((step, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {step.no || idx + 1}. {step.step}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-[11px]">
                          <div className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                            <span className="font-bold block">Bahaya Potensial:</span>
                            {step.hazards || '-'}
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
                            <span className="font-bold block">Tindakan Mitigasi:</span>
                            {step.controls || '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                <span className="text-xs text-slate-400 font-mono">PT MITRA ABADI MAHAKAM</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/form-jsa/${previewForm.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Buka Print View
                  </a>
                  <a
                    href={`/form-jsa/download-pdf?id=${previewForm.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
