import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  FileText,
  Video,
  Grid,
  CheckCircle,
  ExternalLink,
  Printer,
  Sparkles,
  Shield,
  Layers,
  Wrench,
  Truck,
  Disc,
  ClipboardList,
  Users,
  Settings,
  Database,
  Search,
  ChevronRight,
  Info,
  Clock,
  Key,
  Radio,
  Share2,
  Lock,
  Compass,
  ArrowRight,
  Download,
  BookOpen,
  FileSpreadsheet,
  FileCheck,
  Zap,
  AlertTriangle,
  Check,
  RefreshCw,
  BarChart2,
  Eye,
  EyeOff,
  MapPin,
  Activity,
  HelpCircle,
  Folder,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export default function VideoPanduan({ customVideoUrl = '', stats = {}, menuCatalog = [] }) {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'letter' | 'catalog'
  const [videoMode, setVideoMode] = useState(customVideoUrl ? 'external' : 'interactive'); // 'interactive' | 'external'
  const [tourMode, setTourMode] = useState('quick20s'); // 'quick20s' | 'chapters'
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isSimulatedSidebarOpen, setIsSimulatedSidebarOpen] = useState(true);

  // Settings form for external URL
  const { data, setData, post, processing, errors } = useForm({
    video_panduan_url: customVideoUrl || '',
  });

  const handleSaveVideoUrl = (e) => {
    e.preventDefault();
    post(route('video-panduan.settings'), {
      onSuccess: () => setIsUrlModalOpen(false),
    });
  };

  // ─── 20-SECOND QUICK TOUR SCENES ──────────────────────────────────────────
  const quick20sScenes = useMemo(
    () => [
      {
        id: 1,
        timeRange: [0, 3],
        title: '01. Halaman Login & Keamanan Akses',
        subtitle: 'Otentikasi aman ber-enkripsi, CSRF token, auto keep-alive & multi-role',
        route: '/login',
        screenType: 'login',
        narrationSnippet: 'Selamat datang di Sistem Plant Maintenance. Dimulai dari Halaman Login aman ber-enkripsi...',
        badge: 'LOGIN & AUTH',
      },
      {
        id: 2,
        timeRange: [3, 6],
        title: '02. Work Order & Monitoring Breakdown',
        subtitle: 'Pelacakan unit Breakdown, Waiting Part, Waiting Manpower, dan Closed',
        route: '/work-orders',
        screenType: 'work-orders',
        narrationSnippet: '...memantau Work Order dan status Breakdown unit secara real-time...',
        badge: 'WORK ORDERS',
      },
      {
        id: 3,
        timeRange: [6, 9],
        title: '03. Monitoring Orderan & Umur Komponen',
        subtitle: 'Tracking PO/PR suku cadang dan smart tracking umur pakai komponen',
        route: '/monitoring-orderan',
        screenType: 'monitoring-orderan',
        narrationSnippet: '...tracking pengadaan suku cadang dan umur pakai komponen terpasang...',
        badge: 'PARTS & PO',
      },
      {
        id: 4,
        timeRange: [9, 12],
        title: '04. Preventive Maintenance & Ban 3D',
        subtitle: 'Ramalan jatuh tempo servis HM & visualisasi sasis 3D TyreVault',
        route: '/tyres',
        screenType: 'tyres',
        narrationSnippet: '...peramalan servis berkala PM, visualisasi sasis Ban 3D TyreVault...',
        badge: 'PM & TIRE 3D',
      },
      {
        id: 5,
        timeRange: [12, 15],
        title: '05. Formulir Keselamatan JSA & HSE',
        subtitle: 'Standarisasi form MAM-HSE-FORM-028 & check sheet servis digital',
        route: '/form-jsa/portal',
        screenType: 'forms',
        narrationSnippet: '...formulir standar keselamatan JSA dan check sheet HSE...',
        badge: 'HSE & FORMS',
      },
      {
        id: 6,
        timeRange: [15, 18],
        title: '06. Toolroom SST & Populasi Unit',
        subtitle: 'Peminjaman alat berbasis NRP, kalibrasi, & database populasi armada',
        route: '/toolroom',
        screenType: 'toolroom',
        narrationSnippet: '...hingga pengelolaan inventaris Toolroom dan database Manpower...',
        badge: 'TOOLROOM & FLEET',
      },
      {
        id: 7,
        timeRange: [18, 22],
        title: '07. Manpower, Menu Builder & Administrasi',
        subtitle: 'Roster shift kerja, visual Menu Builder, dan 55+ menu terintegrasi',
        route: '/settings/menus',
        screenType: 'settings',
        narrationSnippet: '...seluruh menu terintegrasi dalam satu ekosistem sistem plant modern.',
        badge: 'ALL INTEGRATED',
      },
    ],
    []
  );

  // ─── 10 CHAPTERS DATA (Comprehensive Deep Tour) ───────────────────────────
  const chapters = useMemo(
    () => [
      {
        id: 1,
        title: 'Halaman Login & Keamanan Akses (Authentication)',
        category: 'SISTEM KEAMANAN',
        icon: Key,
        time: '00:00 - 01:15',
        startSeconds: 0,
        durationSeconds: 75,
        narration:
          'Selamat datang di Sistem Plant Maintenance. Pada modul pertama, proses diawali dari Halaman Login resmi. Sistem menerapkan enkripsi session, proteksi brute-force, CSRF tokens, dan sistem Role-Based Access Control (RBAC). Pengguna memasukkan email dan kata sandi terdaftar untuk diarahkan secara otomatis ke portal kerja sesuai level otoritas masing-masing (Super Admin, Planner, Mekanik, Foreman, Toolkeeper, atau HR).',
        previewRoute: '/login',
        features: [
          'Form autentikasi email & kata sandi dengan validasi ketat',
          'Dukungan multi-role: Super Admin, Planner, Foreman, Mekanik, Toolkeeper, HR',
          'Proteksi session keep-alive otomatis untuk mencegah logout mendadak saat pengisian formulir panjang',
          'Pencatatan Activity Log setiap kali user melakukan login dan aktivitas penting',
        ],
        screenType: 'login',
      },
      {
        id: 2,
        title: 'Maintenance Control & Work Order (Monitoring Breakdown)',
        category: 'MAINTENANCE CONTROL',
        icon: Wrench,
        time: '01:15 - 02:45',
        startSeconds: 75,
        durationSeconds: 90,
        narration:
          'Setelah login, pengguna langsung memasuki Work Order Hub. Di sini seluruh tiket perbaikan unit alat berat dimonitor secara real-time. Terdapat tab Monitoring Breakdown harian untuk melacak unit Breakdown, Waiting Part, Waiting Manpower, dan On Progress. Tersedia pula fitur unduh/unggah template Excel massal serta tab Historical WO Closed untuk melihat jejak rekam perbaikan masa lalu.',
        previewRoute: '/work-orders',
        features: [
          'Dashboard status breakdown: Open, In Progress, Waiting Part/Manpower, Closed',
          'Pencatatan komponen part pengganti & integrasi histori pergantian ban',
          'Ekspor & Impor massal data Work Order dan Breakdown via Excel',
          'Kalkulasi downtime unit secara otomatis untuk analisa Mean Time Between Failures (MTBF)',
        ],
        screenType: 'work-orders',
      },
      {
        id: 3,
        title: 'Monitoring Orderan & Part Order Lifetime',
        category: 'MAINTENANCE CONTROL',
        icon: Layers,
        time: '02:45 - 04:10',
        startSeconds: 165,
        durationSeconds: 85,
        narration:
          'Modul Monitoring Orderan dan Part Lifetime berfungsi memantau pengadaan suku cadang secara detail mulai dari PR (Purchase Requisition), PO (Purchase Order), hingga barang diterima di gudang site. Fitur Part Lifetime secara cerdas menghitung sisa umur pakai komponen terpasang dan memberikan indikator peringatan sebelum komponen mengalami keausan batas kritis.',
        previewRoute: '/monitoring-orderan',
        features: [
          'Pelacakan status PO & PR suku cadang per nomor unit',
          'Smart Part Lifetime Tracking dengan visualisasi persentase usia pakai',
          'Monitoring Part Canibal untuk mencatat perpindahan spare part antar unit',
          'Pencatatan konsumsi pelumas & oli terintegrasi per jam operasi',
        ],
        screenType: 'monitoring-orderan',
      },
      {
        id: 4,
        title: 'Preventive Maintenance (PM Forecast, Plan & P2H)',
        category: 'PREVENTIVE MAINTENANCE',
        icon: Clock,
        time: '04:10 - 05:40',
        startSeconds: 250,
        durationSeconds: 90,
        narration:
          'Pada menu Preventive Maintenance, sistem mengotomatiskan jadwal servis rutin berkala (PS 250, 500, 1000, hingga 2000 Jam). Terintegrasi dengan Hour Meter (HM) terkini, sistem memproyeksikan tanggal jatuh tempo servis. Disertai modul Plan Inspeksi Hauler & Dump Truck, serta Inspeksi Harian P2H keliling untuk pencegahan kerusakan dini.',
        previewRoute: '/pm-monitoring',
        features: [
          'Sinkronisasi Hour Meter harian untuk peramalan tanggal jatuh tempo servis (PM Forecast)',
          'Matriks jadwal Plan Inspeksi mingguan dan bulanan armada tambang',
          'Checklist digital P2H (Pemeriksaan dan Perawatan Harian) operator',
          'Monitoring kondisi Undercarriage (PCR U/C) dan komponen utama (PCR Component)',
        ],
        screenType: 'pm-monitoring',
      },
      {
        id: 5,
        title: 'Tire Operations & TyreVault 3D Dashboard',
        category: 'TIRE OPERATIONS',
        icon: Disc,
        time: '05:40 - 07:15',
        startSeconds: 340,
        durationSeconds: 95,
        narration:
          'Menu TyreVault menyajikan inovasi visual sasis 3D interaktif untuk seluruh armada ban (Dump Truck & Hauler). Pengguna dapat melihat posisi ban (Posisi 1 hingga 6), mengecek riwayat rotasi ban, monitoring tekanan udara (PSI), ketebalan alur tapak (Remaining Tread Depth), serta histori penggantian ban langsung pada model sasis 3D.',
        previewRoute: '/tyres',
        features: [
          'Peta visual posisi ban sasis 3D interaktif berbasis Three.js',
          'Monitoring tekanan ban lapangan & histori pencatatan PSI',
          'Pencatatan inspeksi tapak ban (OTD / RTD) dan evaluasi kilometer tempuh',
          'Riwayat rotasi, pemasangan, dan pelepasan ban terperinci per nomor seri',
        ],
        screenType: 'tyres',
      },
      {
        id: 6,
        title: 'Operational Forms & Standar Keselamatan HSE',
        category: 'OPERATIONAL FORMS',
        icon: ClipboardList,
        time: '07:15 - 08:35',
        startSeconds: 435,
        durationSeconds: 80,
        narration:
          'Menu Formulir Operasional memusatkan seluruh form standar tambang sesuai standar keselamatan kerja HSE. Mencakup Portal Form JSA (Job Safety Analysis MAM-HSE-FORM-028), Form Penundaan Service, Form Servis OHT 773, Dump Truck, Dozer, Motorgrader, Genset, Washing Unit, hingga Surat Permintaan Komponen (SPK) dengan kemampuan cetak blanko PDF.',
        previewRoute: '/form-jsa/portal',
        features: [
          'Portal JSA terpusat (Task Type: Engine, Hydraulic, Underchassis, Electrical)',
          'Check Sheet servis spesifik unit: OHT 773, Dozer, Grader, Dump Truck, Genset',
          'Form Washing Unit dan Pre-Release Check List Track Unit sebelum rilis ke tambang',
          'Dukungan cetak PDF berstandar resmi ISO & format siap print lapangan',
        ],
        screenType: 'forms',
      },
      {
        id: 7,
        title: 'Toolroom & Special Service Tools (SST) Management',
        category: 'TOOLROOM & SST',
        icon: Wrench,
        time: '08:35 - 09:50',
        startSeconds: 515,
        durationSeconds: 75,
        narration:
          'Menu Toolroom mengelola inventaris ratusan alat kerja mekanik dan Special Service Tools (SST). Sistem mencatat peminjaman dan pengembalian alat secara real-time berdasarkan NRP mekanik, status kalibrasi alat ukur presisi, laporan alat rusak atau scrap, serta penerbitan Gate Pass Tool untuk alat yang dibawa keluar area workshop.',
        previewRoute: '/toolroom',
        features: [
          'Master katalog tools dan SST dengan kode rak & status ketersediaan',
          'Peminjaman & pengembalian berbasis verifikasi NRP mekanik & tanda terima',
          'Pelacakan kalibrasi instrumen presisi dan tanggal expired sertifikat',
          'Manajemen order spare tool, scrap alat rusak, dan surat izin Gate Pass Tool',
        ],
        screenType: 'toolroom',
      },
      {
        id: 8,
        title: 'Master Data, Populasi Unit & Gatepass Unit',
        category: 'MASTER DATA & ASSETS',
        icon: Truck,
        time: '09:50 - 11:10',
        startSeconds: 590,
        durationSeconds: 80,
        narration:
          'Modul Populasi Unit dan Master Data merupakan tulang punggung aset operasional. Memuat direktori lengkap armada alat berat, nomor model, serial number mesin, status kepemilikan, dan riwayat HM. Selain itu, fitur Gatepass Unit menerbitkan surat jalan resmi saat unit harus keluar site untuk perbaikan luar atau mobilisasi.',
        previewRoute: '/units',
        features: [
          'Database populasi unit komprehensif (Hauler, Excavator, Dozer, Support)',
          'Input cepat Hour Meter (Quick Save HM) harian dengan validasi logika',
          'Penerbitan surat jalan resmi Gatepass Unit beserta status kembali',
          'Dukungan ekspor & impor multi-sheet Excel untuk rekonsiliasi data unit',
        ],
        screenType: 'units',
      },
      {
        id: 9,
        title: 'HR, Manpower, Roster Kerja & Pengajuan Cuti',
        category: 'HR & MANPOWER',
        icon: Users,
        time: '11:10 - 12:30',
        startSeconds: 670,
        durationSeconds: 80,
        narration:
          'Menu Manpower mengatur seluruh sumber daya manusia divisi plant. Pengguna dapat meninjau bagan Struktur Organisasi dinamis, jadwal Roster Kerja (sistem 6:2, 5:2, 10:2), kalkulasi budget tenaga kerja per unit, serta modul Pengajuan Cuti karyawan lengkap dengan persetujuan cuti dan tiket transportasi.',
        previewRoute: '/manpower',
        features: [
          'Database manpower plant lengkap dengan NRP, jabatan, dan nomor kontak darurat',
          'Bagan Struktur Organisasi interaktif dengan visualisasi hierarki departemen',
          'Kalender Roster Kerja terpadu untuk pengaturan giliran shift mekanik',
          'Workflow pengajuan cuti periodik, cuti tahunan, dan pencatatan tiket perjalanan',
        ],
        screenType: 'manpower',
      },
      {
        id: 10,
        title: 'Web Settings, Menu Builder & Security Administration',
        category: 'ADMINISTRATION & SECURITY',
        icon: Settings,
        time: '12:30 - 14:00',
        startSeconds: 750,
        durationSeconds: 90,
        narration:
          'Modul Administrasi menyajikan kontrol penuh atas konfigurasi web. Melalui Menu Builder, admin dapat menyusun struktur menu, mengubah ikon, dan mengatur urutan navigasi secara visual dengan fitur drag-and-drop. Dilengkapi matriks Role & Permission untuk proteksi hak akses, Activity Logs audit trail, dan visualisasi skema relasi database 3D.',
        previewRoute: '/settings/menus',
        features: [
          'Visual Menu Builder: tambah, edit, sembunyikan, dan susun ulang menu via drag-and-drop',
          'Matriks granular Role & Permission untuk menentukan akses tombol dan menu',
          'Audit trail Activity Log untuk melacak siapa yang mengubah data penting',
          'Diagram Relasi Database 3D untuk memvisualisasikan koneksi tabel sistem',
        ],
        screenType: 'settings',
      },
    ],
    []
  );

  // ─── AUDIO & PLAYER STATE ────────────────────────────────────────────────
  const audioRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine current active scene in 20-second mode
  const current20sScene = useMemo(() => {
    const matched = quick20sScenes.find(
      (s) => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
    );
    return matched || quick20sScenes[quick20sScenes.length - 1];
  }, [quick20sScenes, currentTime]);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // Active scene info based on selected tourMode
  const activeSceneInfo = tourMode === 'quick20s' ? current20sScene : currentChapter;

  // Audio time update handler
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    if (audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Toggle Play / Pause with REAL AUDIO playback
  const togglePlay = () => {
    if (tourMode === 'quick20s') {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Audio play failed:', err);
            // Fallback to Web Speech synthesis if audio file playback is blocked
            playSpeechSynthesis(current20sScene.narrationSnippet);
            setIsPlaying(true);
          });
      }
    } else {
      // 10-chapter mode
      if (isPlaying) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        playSpeechSynthesis(currentChapter.narration);
        setIsPlaying(true);
      }
    }
  };

  // Fallback speech synthesizer
  const playSpeechSynthesis = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = playbackSpeed;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) =>
        v.lang.includes('id') ||
        v.lang.includes('ID') ||
        v.name.toLowerCase().includes('indonesia')
    );
    if (idVoice) utterance.voice = idVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Seek bar
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = newPct * (duration || 20);

    if (tourMode === 'quick20s' && audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    } else {
      setCurrentTime(targetTime);
    }
  };

  // Volume toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  // Speed change
  const handleSpeedChange = (spd) => {
    setPlaybackSpeed(spd);
    if (audioRef.current) {
      audioRef.current.playbackRate = spd;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrintLetter = () => {
    window.print();
  };

  // Filtered menu catalog
  const filteredCatalog = useMemo(() => {
    if (!searchMenuQuery.trim()) return menuCatalog;
    const q = searchMenuQuery.toLowerCase();
    return menuCatalog
      .map((section) => {
        const matchesSection = section.section_label?.toLowerCase().includes(q);
        const filteredSubs = (section.sub_menus || []).filter(
          (sub) => sub.name?.toLowerCase().includes(q) || sub.href?.toLowerCase().includes(q)
        );
        const matchesDirect =
          section.name?.toLowerCase().includes(q) || section.href?.toLowerCase().includes(q);

        if (matchesSection || matchesDirect || filteredSubs.length > 0) {
          return {
            ...section,
            sub_menus: matchesSection
              ? section.sub_menus
              : filteredSubs.length > 0
              ? filteredSubs
              : section.sub_menus,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [menuCatalog, searchMenuQuery]);

  return (
    <AuthenticatedLayout>
      <Head title="Video Panduan & Tur Sistem Terpadu" />

      {/* Hidden HTML5 Audio Element for Real Voiceover */}
      <audio
        ref={audioRef}
        src="/audio/penjelasan_singkat_20detik.mp3"
        preload="auto"
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
      />

      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-6">
        {/* ── Top Header Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                PANDUAN LENGKAP & DOKUMENTASI SISTEM
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Video className="w-8 h-8 text-cyan-400" />
                Video Penjelasan & Tur Sistem Terpadu
              </h1>
              <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
                Dokumentasi terintegrasi yang menjelaskan alur operasional seluruh menu aplikasi, diawali dari Halaman
                Login dan autentikasi keamanan, hingga pengelolaan Work Order, Preventive Maintenance, Ban 3D, Toolroom,
                Formulir HSE, Populasi Unit, Manpower, dan Administrasi Sistem.
              </p>

              {/* Quick Stat Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{stats.total_units || 0} Unit Terdata</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>{stats.total_work_orders || 0} Work Orders</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{stats.total_manpower || 0} Karyawan Plant</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>55+ Menu & Formulir Terintegrasi</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              <a
                href={route('video-panduan.download.surat-pdf')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                Unduh Surat Penjelasan (PDF)
              </a>
              <button
                onClick={() => setIsUrlModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-300" />
                Atur URL Video Eksternal
              </button>
            </div>
          </div>
        </div>

        {/* ── DOWNLOAD CENTER (Pusat Unduhan Berkas & Dokumen) ── */}
        <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Pusat Unduhan Berkas & Dokumen Resmi (Download Center)
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                    6 Berkas Siap Unduh
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Unduh surat resmi, buku manual SOP, audio narasi suara 20 detik, transkrip video, dan matriks menu dalam format PDF, Word, MP3, dan Excel/CSV.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* Download Card 1: Surat PDF */}
            <a
              href={route('video-panduan.download.surat-pdf')}
              className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  PDF RESMI
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Surat Penjelasan & BAST
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  No. 042/ENG-PLANT/IX/2026
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <span>Unduh PDF</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>

            {/* Download Card 2: Surat Word DOC */}
            <a
              href={route('video-panduan.download.surat-doc')}
              className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-500/30 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  WORD .DOC
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Surat Format Word
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Format dapat diedit langsung
                </div>
              </div>
              <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-400">
                <span>Unduh Word</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>

            {/* Download Card 3: Audio Suara 20 Detik */}
            <a
              href={route('video-panduan.download.audio-20s')}
              className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/30 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                  <Volume2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  AUDIO 20 DETIK
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Suara Narasi 20 Detik
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Format audio MP3 jernih
                </div>
              </div>
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400">
                <span>Unduh MP3</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>

            {/* Download Card 4: Buku Panduan PDF */}
            <a
              href={route('video-panduan.download.panduan-pdf')}
              className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  MANUAL PDF
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Buku Panduan & SOP
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Petunjuk lengkap 10 bab
                </div>
              </div>
              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-bold text-cyan-700 dark:text-cyan-400">
                <span>Unduh Manual</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>

            {/* Download Card 5: Matriks Menu CSV */}
            <a
              href={route('video-panduan.download.katalog-csv')}
              className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  EXCEL / CSV
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Matriks Seluruh Menu
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  55+ rute & izin akses
                </div>
              </div>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-400">
                <span>Unduh CSV</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>

            {/* Download Card 6: Transkrip Narasi Video */}
            <a
              href={route('video-panduan.download.transkrip-txt')}
              className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-900/10 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  TEXT .TXT
                </span>
              </div>
              <div>
                <div className="font-black text-xs text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Transkrip Narasi Video
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Naskah lengkap narasi
                </div>
              </div>
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <span>Unduh Teks</span>
                <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>
          </div>
        </div>

        {/* ── Main Tab Navigation ── */}
        <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'video'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-t-xl'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            1. Video Panduan & Tur Sistem
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold uppercase">
              Bersuara 20 Detik & 10 Bab
            </span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'letter'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Surat Resmi Penjelasan & Berita Acara
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
              Resmi & Cetak
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 rounded-t-xl'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            3. Direktori & Matriks Seluruh Menu
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400 font-extrabold uppercase">
              {menuCatalog.length} Kategori
            </span>
          </button>
        </div>

        {/* ── TAB 1: VIDEO TOUR WALKTHROUGH ── */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            {/* Mode Switcher Banner: 20-Second Quick Voiced Tour VS 10-Chapter Deep Tour */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Pilih Mode Pemutaran:</span>
                <button
                  onClick={() => {
                    setTourMode('quick20s');
                    setIsPlaying(false);
                    setCurrentTime(0);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    tourMode === 'quick20s'
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/50'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Tur Kilat 20 Detik (Audio Bersuara Asli)
                  <span className="px-1.5 py-0.5 text-[9px] bg-white/20 rounded font-black uppercase">
                    20s
                  </span>
                </button>

                <button
                  onClick={() => {
                    setTourMode('chapters');
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    tourMode === 'chapters'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Eksplorasi 10 Bab Terperinci
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Suara Narasi Aktif Otomatis
                </div>
              </div>
            </div>

            {/* ── QUICK MENU SCREEN SELECTOR (PILIH TAMPILAN MENU YANG TELAH DIBUAT) ── */}
            <div className="bg-slate-900/95 rounded-2xl border border-cyan-500/30 p-3.5 sm:p-4 shadow-xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Pilih Tampilan Menu Yang Telah Dibuat (Klik Menu Untuk Melihat Tampilan Langsung):
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-bold">7 Menu Utama Lengkap</span>
                  <span>•</span>
                  <span>Otomatis Sinkron Audio 20 Detik</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {quick20sScenes.map((sc, sIdx) => {
                  const isCurrent = tourMode === 'quick20s' && activeSceneInfo.screenType === sc.screenType;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setTourMode('quick20s');
                        setCurrentTime(sc.timeRange[0]);
                        if (audioRef.current) {
                          audioRef.current.currentTime = sc.timeRange[0];
                          audioRef.current
                            .play()
                            .then(() => setIsPlaying(true))
                            .catch(() => {});
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 group relative overflow-hidden ${
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-500/25 to-emerald-500/20 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/40'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-500/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${
                            isCurrent ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {sc.timeRange[0]}s - {sc.timeRange[1]}s
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          isCurrent ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {sc.title.split('. ')[1] || sc.title}
                      </div>
                      <div className="text-[10px] text-cyan-400/80 font-mono truncate">
                        {sc.route}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Container */}
            <div
              ref={playerContainerRef}
              className={`rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
              }`}
            >
              {/* Player Top Bar */}
              <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase tracking-wider font-bold text-[10px]">
                      {tourMode === 'quick20s' ? 'TUR KILAT 20 DETIK BERSUARA' : `BAB ${currentChapter.id} / 10`}
                    </span>
                    <span className="hidden sm:inline text-white font-bold">{activeSceneInfo.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Wave Indicator when playing */}
                  {isPlaying && (
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold">
                      <div className="w-1 h-3 bg-rose-400 animate-bounce" />
                      <div className="w-1 h-4 bg-rose-400 animate-bounce delay-75" />
                      <div className="w-1 h-2 bg-rose-400 animate-bounce delay-150" />
                      <span>Sedang Bersuara</span>
                    </div>
                  )}

                  {/* Sidebar Toggle in Simulation */}
                  <button
                    onClick={() => setIsSimulatedSidebarOpen(!isSimulatedSidebarOpen)}
                    className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isSimulatedSidebarOpen
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                    title="Buka / Tutup Sidebar Menu di Layar Simulasi"
                  >
                    <Menu className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[11px]">
                      {isSimulatedSidebarOpen ? 'Menu Sidebar Aktif' : 'Tampilkan Sidebar'}
                    </span>
                  </button>

                  {/* Mute Button */}
                  <button
                    onClick={toggleMute}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isMuted
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="hidden md:inline text-[11px]">{isMuted ? 'Mute' : 'Suara ON'}</span>
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Player Display Area */}
              <div className="relative w-full min-h-[600px] sm:min-h-[660px] bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full relative flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-2 sm:p-4 select-none">
                  {/* Simulated Screen Backdrop */}
                  <div className="w-full h-full rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative">
                    {/* Simulated Browser Address Bar */}
                    <div className="px-4 py-2 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <button
                          onClick={() => setIsSimulatedSidebarOpen(!isSimulatedSidebarOpen)}
                          className="ml-2 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-300 flex items-center gap-1 border border-white/10"
                        >
                          <Menu className="w-3 h-3" />
                          <span>Sidebar Menu</span>
                        </button>
                      </div>

                      <div className="flex-1 max-w-lg mx-2 bg-slate-900/95 border border-white/10 rounded-lg px-3 py-1 flex items-center gap-2 text-slate-400 text-xs font-mono truncate">
                        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400">https://</span>
                        <span className="text-slate-300">plant-system.mining.internal</span>
                        <span className="text-cyan-400 font-bold">{activeSceneInfo.route || activeSceneInfo.previewRoute}</span>
                      </div>

                      <Link
                        href={activeSceneInfo.route || activeSceneInfo.previewRoute}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                      >
                        Buka Halaman
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* ── SIMULATED APPLICATION VIEW (REAL APPLICATION LOOK) ── */}
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                      {/* 1. SCENE LOGIN: Full Login Page Screen */}
                      {activeSceneInfo.screenType === 'login' ? (
                        <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
                          {/* Ambient light ring */}
                          <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                          {/* Login Card Mockup */}
                          <div className="w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-5">
                            <div className="text-center space-y-2">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 mx-auto shadow-lg shadow-cyan-500/20">
                                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400">
                                  <Shield className="w-7 h-7" />
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white tracking-wide uppercase">
                                  PLANT MAINTENANCE SYSTEM
                                </h3>
                                <p className="text-[11px] text-cyan-400 font-semibold tracking-wider uppercase">
                                  Mining Operation & Fleet Site KM 45
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Email Pengguna:
                                </label>
                                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-between">
                                  <span>admin@systemplant.com</span>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Kata Sandi:
                                </label>
                                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/20 text-slate-300 text-xs font-mono flex items-center justify-between">
                                  <span>••••••••••••</span>
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked
                                    readOnly
                                    className="rounded bg-slate-800 border-cyan-500/50 text-cyan-500 w-3.5 h-3.5"
                                  />
                                  <span>Ingat saya di perangkat ini</span>
                                </label>
                                <span className="text-cyan-400 font-medium">Bantuan Login</span>
                              </div>

                              {/* Animated Login Button with cursor */}
                              <div className="relative pt-2">
                                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform">
                                  <Lock className="w-3.5 h-3.5" />
                                  Masuk Sistem (Secure Auth)
                                </button>
                                {/* Animated Pointer Cursor */}
                                <div className="absolute right-4 bottom-1 animate-bounce pointer-events-none text-xl">
                                  👆
                                </div>
                              </div>
                            </div>

                            {/* Security badges */}
                            <div className="pt-3 border-t border-white/10 flex items-center justify-around text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <Shield className="w-3 h-3" /> 256-Bit SSL
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                                <CheckCircle className="w-3 h-3" /> CSRF Protected
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                                <Zap className="w-3 h-3" /> Auto Keep-Alive
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* 2. SCENES 2 - 7: Full Application Frame (Sidebar + Live Screen) */
                        <div className="flex-1 flex overflow-hidden">
                          {/* ── SIMULATED SYSTEM SIDEBAR (DAFTAR SELURUH MENU SISTEM) ── */}
                          {isSimulatedSidebarOpen && (
                            <div className="w-60 sm:w-64 bg-slate-950/90 border-r border-cyan-500/20 flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none">
                              {/* Sidebar Brand Header */}
                              <div className="p-3 border-b border-white/10 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shrink-0">
                                  <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-cyan-400">
                                    <Wrench className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] font-black text-white leading-tight">
                                    PLANT MAINTENANCE
                                  </div>
                                  <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                                    MINING OPERATION
                                  </div>
                                </div>
                              </div>

                              {/* Sidebar Menu Sections List */}
                              <div className="p-2 space-y-3 text-xs">
                                {/* SECTION: SISTEM KEAMANAN */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    SISTEM KEAMANAN
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'login');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'login'
                                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                                      <span className="text-[11px]">Login & Akses</span>
                                    </div>
                                    {activeSceneInfo.screenType === 'login' && (
                                      <span className="text-xs">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: MAINTENANCE CONTROL */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    MAINTENANCE CONTROL
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'work-orders');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'work-orders'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                                      <span className="text-[11px]">Work Order & Breakdown</span>
                                    </div>
                                    {activeSceneInfo.screenType === 'work-orders' && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'monitoring-orderan');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'monitoring-orderan'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-[11px]">Monitoring Orderan & Part</span>
                                    </div>
                                    {activeSceneInfo.screenType === 'monitoring-orderan' && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: PREVENTIVE MAINTENANCE */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    PREVENTIVE MAINTENANCE
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'tyres');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'pm-monitoring' || (activeSceneInfo.screenType === 'tyres' && tourMode === 'quick20s')
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="text-[11px]">PM Forecast & Plan</span>
                                    </div>
                                    {(activeSceneInfo.screenType === 'pm-monitoring' || activeSceneInfo.screenType === 'tyres') && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: TIRE OPERATIONS */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    TIRE OPERATIONS & 3D
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'tyres');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'tyres'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Disc className="w-3.5 h-3.5 text-purple-400" />
                                      <span className="text-[11px]">TyreVault 3D Sasis Map</span>
                                    </div>
                                    {activeSceneInfo.screenType === 'tyres' && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: OPERATIONAL FORMS & HSE */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    OPERATIONAL FORMS
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'forms');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'forms'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-[11px]">Formulir JSA MAM-HSE-028</span>
                                    </div>
                                    {activeSceneInfo.screenType === 'forms' && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: TOOLROOM & FLEET */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    TOOLROOM & ARMADA
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'toolroom');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'toolroom' || activeSceneInfo.screenType === 'fleet'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                                      <span className="text-[11px]">Toolroom SST & Armada</span>
                                    </div>
                                    {(activeSceneInfo.screenType === 'toolroom' || activeSceneInfo.screenType === 'fleet') && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                </div>

                                {/* SECTION: PENGATURAN SISTEM & MANPOWER */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    PENGATURAN & DOKUMENTASI
                                  </div>
                                  <button
                                    onClick={() => {
                                      const sc = quick20sScenes.find((s) => s.screenType === 'settings');
                                      if (sc) jumpToQuickScene(sc);
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                                      activeSceneInfo.screenType === 'settings' || activeSceneInfo.screenType === 'manpower'
                                        ? 'bg-cyan-500/25 text-white font-black border border-cyan-400 shadow-md shadow-cyan-950/50'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Settings className="w-3.5 h-3.5 text-rose-400" />
                                      <span className="text-[11px]">Visual Menu Builder</span>
                                    </div>
                                    {(activeSceneInfo.screenType === 'settings' || activeSceneInfo.screenType === 'manpower') && (
                                      <span className="text-xs animate-bounce">👉</span>
                                    )}
                                  </button>
                                  <button
                                    className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left text-slate-400 hover:text-white hover:bg-white/5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                                      <span className="text-[11px]">Video Panduan & Tur</span>
                                    </div>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                      AKTIF
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── SIMULATED MAIN CONTENT AREA (REALISTIC MENU INTERFACE) ── */}
                          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-900/60 p-4 sm:p-5 space-y-4">
                            {/* App Header Bar inside Content */}
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400">Plant System</span>
                                <ChevronRight className="w-3 h-3 text-slate-600" />
                                <span className="text-cyan-400 font-bold uppercase">
                                  {activeSceneInfo.badge || activeSceneInfo.category || 'MENU AKTIF'}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-600" />
                                <span className="text-white font-bold">{activeSceneInfo.title}</span>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                  Site KM 45 Online
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
                                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                                    SA
                                  </div>
                                  <span className="hidden md:inline">Super Admin</span>
                                </div>
                              </div>
                            </div>

                            {/* ── SCREEN TYPE 1: WORK ORDERS & MONITORING BREAKDOWN ── */}
                            {activeSceneInfo.screenType === 'work-orders' && (
                              <div className="space-y-4">
                                {/* Top KPI Metric Counters */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                  <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30">
                                    <div className="text-[10px] font-bold text-red-400 uppercase">
                                      Breakdown Aktif
                                    </div>
                                    <div className="text-xl font-black text-red-300 mt-0.5">4 Unit</div>
                                    <div className="text-[10px] text-slate-400">DT-101, EX-204...</div>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                                    <div className="text-[10px] font-bold text-amber-400 uppercase">
                                      Waiting Part
                                    </div>
                                    <div className="text-xl font-black text-amber-300 mt-0.5">2 Unit</div>
                                    <div className="text-[10px] text-slate-400">Menunggu PO Site</div>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-orange-500/15 border border-orange-500/30">
                                    <div className="text-[10px] font-bold text-orange-400 uppercase">
                                      Waiting Manpower
                                    </div>
                                    <div className="text-xl font-black text-orange-300 mt-0.5">1 Unit</div>
                                    <div className="text-[10px] text-slate-400">Alokasi Mekanik</div>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30">
                                    <div className="text-[10px] font-bold text-blue-400 uppercase">
                                      On Progress
                                    </div>
                                    <div className="text-xl font-black text-blue-300 mt-0.5">3 Unit</div>
                                    <div className="text-[10px] text-slate-400">Dikerjakan di Bay</div>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 col-span-2 sm:col-span-1">
                                    <div className="text-[10px] font-bold text-emerald-400 uppercase">
                                      Closed (Ready)
                                    </div>
                                    <div className="text-xl font-black text-emerald-300 mt-0.5">142 Unit</div>
                                    <div className="text-[10px] text-slate-400">Armada Siap Kerja</div>
                                  </div>
                                </div>

                                {/* Table Action Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-400">
                                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Cari nomor WO / nomor unit...</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow">
                                      <span>+ Tambah Work Order</span>
                                    </button>
                                    <button className="px-3 py-1.5 rounded-xl bg-emerald-600/80 text-white font-bold text-xs flex items-center gap-1.5">
                                      <FileSpreadsheet className="w-3.5 h-3.5" />
                                      <span>Ekspor Excel</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Work Order Table Mockup */}
                                <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/70">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                                      <tr>
                                        <th className="p-3">No. WO</th>
                                        <th className="p-3">Nomor Unit</th>
                                        <th className="p-3">Kerusakan / Keluhan</th>
                                        <th className="p-3">Status Breakdown</th>
                                        <th className="p-3">Mekanik Lead</th>
                                        <th className="p-3">Target</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                      <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono font-bold text-cyan-400">WO-2026-0901</td>
                                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                                          DT-101 (HD785-7)
                                        </td>
                                        <td className="p-3 text-slate-300">Engine Overheating & Radiator Leak</td>
                                        <td className="p-3">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                                            BREAKDOWN
                                          </span>
                                        </td>
                                        <td className="p-3">Rian Kurniawan</td>
                                        <td className="p-3 font-mono text-cyan-300">4.0 Jam</td>
                                      </tr>
                                      <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono font-bold text-cyan-400">WO-2026-0902</td>
                                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                                          EX-204 (CAT 349D)
                                        </td>
                                        <td className="p-3 text-slate-300">Hydraulic Boom Cylinder Hose Burst</td>
                                        <td className="p-3">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            WAITING PART
                                          </span>
                                        </td>
                                        <td className="p-3">Dedi Supriadi</td>
                                        <td className="p-3 font-mono text-cyan-300">2.5 Jam</td>
                                      </tr>
                                      <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono font-bold text-cyan-400">WO-2026-0903</td>
                                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                                          DZ-108 (Komatsu D375)
                                        </td>
                                        <td className="p-3 text-slate-300">Track Shoe Bolt Broken & Loose</td>
                                        <td className="p-3">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                            ON PROGRESS
                                          </span>
                                        </td>
                                        <td className="p-3">Joko Widodo</td>
                                        <td className="p-3 font-mono text-cyan-300">3.0 Jam</td>
                                      </tr>
                                      <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono font-bold text-cyan-400">WO-2026-0904</td>
                                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                                          WL-301 (Komatsu WA500)
                                        </td>
                                        <td className="p-3 text-slate-300">Steering Valve Seal Rebuild</td>
                                        <td className="p-3">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            CLOSED (READY)
                                          </span>
                                        </td>
                                        <td className="p-3">Agus Pratama</td>
                                        <td className="p-3 font-mono text-emerald-300">Selesai ✓</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* ── SCREEN TYPE 2: MONITORING ORDERAN & PART LIFETIME ── */}
                            {activeSceneInfo.screenType === 'monitoring-orderan' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Left: PR/PO Procurement Tracking */}
                                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-emerald-400" />
                                        Pelacakan PR / PO Suku Cadang
                                      </div>
                                      <span className="text-[10px] font-bold text-cyan-400">12 PO Aktif</span>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">PO-KMT-8821 • DT-101</div>
                                          <div className="text-[11px] text-slate-400">Track Link Ass'y 51 Links (PT United Tractors)</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300">
                                          In Transit Site
                                        </span>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">PO-CAT-4419 • EX-204</div>
                                          <div className="text-[11px] text-slate-400">Turbocharger Garrett C13 (PT Trakindo)</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300">
                                          PO Approved
                                        </span>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">PO-FLT-1102 • Armada Fleet</div>
                                          <div className="text-[11px] text-slate-400">Fuel Filter Separator 24 Pcs (PT Altrak)</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                                          Received Gudang
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Smart Part Lifetime Gauges */}
                                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-cyan-400" />
                                        Smart Part Lifetime (Umur Pakai Komponen)
                                      </div>
                                      <span className="text-[10px] text-emerald-400 font-bold">Auto Forecast</span>
                                    </div>
                                    <div className="space-y-3 text-xs">
                                      {/* Item 1 */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="font-bold text-slate-200">DT-101 Alternator 24V (6,000 HM Spek)</span>
                                          <span className="text-emerald-400 font-bold">88% Sisa Sehat</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                          <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
                                        </div>
                                      </div>
                                      {/* Item 2 */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="font-bold text-slate-200">EX-204 Hydraulic Main Pump (10,000 HM)</span>
                                          <span className="text-amber-400 font-bold">42% Waspada Servis</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                          <div className="h-full bg-amber-500 rounded-full w-[42%]" />
                                        </div>
                                      </div>
                                      {/* Item 3 */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="font-bold text-slate-200">DZ-108 Sprocket Drive (8,000 HM)</span>
                                          <span className="text-red-400 font-bold animate-pulse">12% KRITIS GANTI</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                          <div className="h-full bg-red-500 rounded-full w-[12%]" />
                                        </div>
                                      </div>
                                      {/* Cannibal log */}
                                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-300 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                        <span>Part Canibal: Alternator 24V dipindahkan dari DT-103 ke DT-101</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── SCREEN TYPE 3 & 4: PM FORECAST & BAN 3D TYREVAULT ── */}
                            {(activeSceneInfo.screenType === 'tyres' || activeSceneInfo.screenType === 'pm-monitoring') && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Left: PM Forecast Schedule */}
                                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-cyan-400" />
                                        Jadwal Servis Berkala (PM Forecast)
                                      </div>
                                      <span className="text-[10px] font-bold text-amber-400">Jatuh Tempo Dekat</span>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">DT-101 • Servis PS 1000 Jam</div>
                                          <div className="text-[11px] text-slate-400">HM Terkini: 9,985 / Target: 10,000 HM</div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                          Sisa 15 Jam (~2 Hari)
                                        </span>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">EX-204 • Servis PS 250 Jam</div>
                                          <div className="text-[11px] text-slate-400">HM Terkini: 4,730 / Target: 4,750 HM</div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                                          Sisa 20 Jam (~3 Hari)
                                        </span>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">P2H Harian Operator</div>
                                          <div className="text-[11px] text-slate-400">Inspeksi keliling sebelum shift jalan</div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                          48/48 Selesai (100%)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: TyreVault 3D Sasis Diagram */}
                                  <div className="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Disc className="w-4 h-4 text-purple-400" />
                                        Visual Sasis Ban 3D TyreVault (DT-101 HD785)
                                      </div>
                                      <span className="text-[10px] font-bold text-purple-400">6 Posisi Roda</span>
                                    </div>

                                    {/* 3D Sasis Truck Diagram */}
                                    <div className="py-2 flex flex-col items-center justify-center space-y-3">
                                      {/* Front Axle */}
                                      <div className="flex items-center gap-6">
                                        <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400 text-center w-24">
                                          <div className="text-[9px] font-bold text-purple-300">POS 1 (FL)</div>
                                          <div className="text-xs font-black text-white">105 PSI</div>
                                          <div className="text-[9px] text-emerald-400">RTD: 28mm (88%)</div>
                                        </div>
                                        <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                                        <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400 text-center w-24">
                                          <div className="text-[9px] font-bold text-purple-300">POS 2 (FR)</div>
                                          <div className="text-xs font-black text-white">105 PSI</div>
                                          <div className="text-[9px] text-emerald-400">RTD: 27mm (85%)</div>
                                        </div>
                                      </div>

                                      {/* Central Spine */}
                                      <div className="w-2 h-6 bg-slate-700 rounded-full" />

                                      {/* Rear Dual Axle */}
                                      <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-center w-16 text-[9px]">
                                          <div className="font-bold text-slate-300">POS 3</div>
                                          <div className="text-white font-bold">110 PSI</div>
                                          <div className="text-cyan-300">71%</div>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-center w-16 text-[9px]">
                                          <div className="font-bold text-slate-300">POS 4</div>
                                          <div className="text-white font-bold">110 PSI</div>
                                          <div className="text-cyan-300">74%</div>
                                        </div>
                                        <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
                                        <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-center w-16 text-[9px]">
                                          <div className="font-bold text-slate-300">POS 5</div>
                                          <div className="text-white font-bold">110 PSI</div>
                                          <div className="text-amber-400">68%</div>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-center w-16 text-[9px]">
                                          <div className="font-bold text-slate-300">POS 6</div>
                                          <div className="text-white font-bold">110 PSI</div>
                                          <div className="text-cyan-300">70%</div>
                                        </div>
                                      </div>

                                      <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-3">
                                        <span>Rata-rata PSI: 108 PSI</span>
                                        <span>•</span>
                                        <span className="text-emerald-400">Kondisi Ban Prima</span>
                                        <span>•</span>
                                        <span className="text-cyan-400">Rotasi: 12 Hari Lagi</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── SCREEN TYPE 5: FORMULIR JSA & HSE DIGITAL ── */}
                            {activeSceneInfo.screenType === 'forms' && (
                              <div className="space-y-3 bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                                  <div>
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                      FORMULIR STANDAR OPERASIONAL HSE DIGITAL
                                    </div>
                                    <h4 className="text-sm font-black text-white">
                                      JOB SAFETY ANALYSIS (JSA) - MAM-HSE-FORM-028-REV03
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                                      STATUS: APPROVED (SIAP KERJA)
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-white/5">
                                  <div>
                                    <span className="text-slate-400 text-[10px] block">Pekerjaan:</span>
                                    <span className="font-bold text-white">Pergantian Final Drive DT-101</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 text-[10px] block">Lokasi Kerja:</span>
                                    <span className="font-bold text-white">Workshop Bay 3 KM 45</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 text-[10px] block">Supervisor Pengawas:</span>
                                    <span className="font-bold text-cyan-300">Budi Santoso (Foreman Plant)</span>
                                  </div>
                                </div>

                                {/* Hazard Identification Matrix */}
                                <div className="space-y-1.5 text-xs">
                                  <div className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                      ✓
                                    </div>
                                    <div>
                                      <div className="font-bold text-white">
                                        1. Isolasi Energi Unit & Pasang Lock Out Tag Out (LOTO)
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Bahaya: Unit bergerak tiba-tiba • Kontrol: Ganjal ban (Wheel Chock), lepas kabel baterai, kunci LOTO.
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                      ✓
                                    </div>
                                    <div>
                                      <div className="font-bold text-white">
                                        2. Pengangkatan Final Drive Menggunakan Overhead Crane 10 Ton
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Bahaya: Beban jatuh menimpa kaki • Kontrol: Gunakan webbing sling bersertifikat, area steril radius 5m.
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                      ✓
                                    </div>
                                    <div>
                                      <div className="font-bold text-white">
                                        3. Pemasangan Baut Torsi Sesuai Spesifikasi Shop Manual Komatsu
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Bahaya: Tangan terjepit, torsi baut meleset • Kontrol: Gunakan Impact Gloves & SST Torque Wrench.
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* APD & Digital Stamp */}
                                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-300">APD Terverifikasi:</span>
                                    <span className="text-emerald-400">Helm ✓</span>
                                    <span className="text-emerald-400">Safety Shoes ✓</span>
                                    <span className="text-emerald-400">Kacamata ✓</span>
                                    <span className="text-emerald-400">Sarung Tangan Impact ✓</span>
                                  </div>
                                  <div className="font-mono text-cyan-400 font-bold">
                                    Digital Stamp Approved by Site HSE Officer
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── SCREEN TYPE 6: TOOLROOM SST & POPULASI FLEET ── */}
                            {(activeSceneInfo.screenType === 'toolroom' || activeSceneInfo.screenType === 'fleet') && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Toolroom Barcode Scanner */}
                                  <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-cyan-400" />
                                        Sistem Peminjaman Toolroom SST (Special Service Tools)
                                      </div>
                                      <span className="text-[10px] font-bold text-cyan-400">Scan Barcode NRP</span>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="font-mono text-cyan-300">NRP: P-10492 (Rian Kurniawan - Mekanik 1)</span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                                        Disetujui ✓
                                      </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">SST-TM-04 • Torque Multiplier 2000 Nm</div>
                                          <div className="text-[10px] text-slate-400">Kalibrasi: Berlaku s/d 15 Des 2026 (Valid)</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold">
                                          Dipinjam
                                        </span>
                                      </div>
                                      <div className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">SST-HJ-12 • Hydraulic Jack 50 Ton</div>
                                          <div className="text-[10px] text-slate-400">Lokasi: Rak SST Bay B-02</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">
                                          Tersedia
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Database Populasi Fleet */}
                                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-emerald-400" />
                                        Populasi Armada Unit Tambang (Total {stats.total_units || 48} Unit)
                                      </div>
                                      <span className="text-[10px] text-emerald-400 font-bold">91.6% Physical Availability</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                                        <div className="text-[10px] text-slate-400">Dump Truck / Hauler</div>
                                        <div className="text-lg font-black text-white">24 Unit</div>
                                        <div className="text-[9px] text-emerald-400">Komatsu HD785, Scania</div>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                                        <div className="text-[10px] text-slate-400">Excavator Loading</div>
                                        <div className="text-lg font-black text-white">8 Unit</div>
                                        <div className="text-[9px] text-emerald-400">CAT 349D, Komatsu PC400</div>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                                        <div className="text-[10px] text-slate-400">Bulldozer Heavy</div>
                                        <div className="text-lg font-black text-white">6 Unit</div>
                                        <div className="text-[9px] text-emerald-400">Komatsu D375A</div>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                                        <div className="text-[10px] text-slate-400">Motor Grader & Support</div>
                                        <div className="text-lg font-black text-white">10 Unit</div>
                                        <div className="text-[9px] text-emerald-400">Water Truck, Fuel Truck</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── SCREEN TYPE 7: SETTINGS, MENU BUILDER & MANPOWER ── */}
                            {(activeSceneInfo.screenType === 'settings' || activeSceneInfo.screenType === 'manpower') && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Visual Menu Builder Tree */}
                                  <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-cyan-400" />
                                        Visual Menu Builder (55+ Menu Terstruktur)
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300">
                                        Drag & Drop Aktif
                                      </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500 cursor-move">⋮⋮</span>
                                          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                                          <span className="font-bold text-white">Maintenance Control (3 Sub-Menu)</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Aktif ✓</span>
                                      </div>
                                      <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between ml-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500 cursor-move">⋮⋮</span>
                                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                                          <span className="text-slate-200">Preventive Maintenance (PM Forecast)</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Aktif ✓</span>
                                      </div>
                                      <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between ml-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500 cursor-move">⋮⋮</span>
                                          <Disc className="w-3.5 h-3.5 text-purple-400" />
                                          <span className="text-slate-200">Tyre Operations & TyreVault 3D</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Aktif ✓</span>
                                      </div>
                                      <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between ml-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500 cursor-move">⋮⋮</span>
                                          <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-slate-200">Operational Forms & JSA HSE</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Aktif ✓</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Manpower & Role Permissions */}
                                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                        Manpower Shift & Hak Akses (RBAC)
                                      </div>
                                      <span className="text-[10px] text-cyan-400 font-bold">{stats.total_manpower || 36} Karyawan</span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">Super Admin & Engineering Planner</div>
                                          <div className="text-[10px] text-slate-400">Hak Akses: Penuh seluruh menu, setting, & BAST</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-black">
                                          FULL ACCESS
                                        </span>
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">Foreman & Mekanik Heavy Equipment</div>
                                          <div className="text-[10px] text-slate-400">Hak Akses: Work Order, JSA Form, Tyre 3D, P2H</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-black">
                                          OPERASIONAL
                                        </span>
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                                        <div>
                                          <div className="font-bold text-white">Toolkeeper & Gudang Site</div>
                                          <div className="text-[10px] text-slate-400">Hak Akses: Peminjaman SST, Kalibrasi & Gate Pass</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-black">
                                          TOOLROOM
                                        </span>
                                      </div>

                                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-[10px] text-emerald-400 flex items-center justify-between">
                                        <span>Status Integrasi: 57 Menu Aktif Terhubung</span>
                                        <span className="font-bold">100% PRODUCTION READY ✓</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── BOTTOM LIVE NARRATION SUBTITLE BAR ── */}
                      <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-rose-500/30 shadow-2xl shrink-0 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            SUARA NARASI AUDIO (INDONESIAN VOICEOVER) • 20 DETIK
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Kecepatan: {playbackSpeed}x • Waktu: {Math.round(currentTime)}s / ~20s
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                          "{activeSceneInfo.narrationSnippet || activeSceneInfo.narration}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Bottom Control Deck */}
              <div className="p-4 sm:p-5 bg-slate-900 border-t border-white/10 flex flex-col gap-3">
                {/* Scrub Progress Bar */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={handleSeek}
                    className="flex-1 h-2.5 rounded-full bg-slate-800 cursor-pointer relative overflow-hidden group"
                  >
                    <div
                      style={{ width: `${((currentTime || 0) / (duration || 20)) * 100}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150 relative"
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-bold shrink-0">
                    {Math.round(currentTime)}s / {Math.round(duration || 20)}s
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    {/* Big Play / Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:from-rose-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-transform hover:scale-105"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      {isPlaying ? 'Jeda Suara & Video' : '▶️ Putar Video + Suara (20 Detik)'}
                    </button>

                    {/* Replay */}
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Ulangi dari Awal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Speed and Direct Link */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-white/10 text-xs">
                      <span className="text-slate-400 text-[11px] font-bold px-1">Kecepatan:</span>
                      {[0.75, 1, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-rose-500 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <a
                      href={route('video-panduan.download.audio-20s')}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh MP3 Suara
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Download Strip for Tab 1 */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-4 rounded-2xl border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Unduh Berkas Pendukung Lengkap:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={route('video-panduan.download.audio-20s')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Unduh Audio 20 Detik (MP3)
                </a>
                <a
                  href={route('video-panduan.download.transkrip-txt')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Unduh Transkrip Narasi (TXT)
                </a>
                <a
                  href={route('video-panduan.download.panduan-pdf')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Unduh Buku Panduan SOP (PDF)
                </a>
                <a
                  href={route('video-panduan.download.surat-pdf')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Unduh Surat BAST (PDF)
                </a>
              </div>
            </div>

            {/* Chapter Selection Matrix (10 Chapters) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-500" />
                  Daftar 10 Bab Tur Penjelasan Sistem (Klik Bab untuk Melompat Langsung)
                </h3>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  Total Estimasi Durasi: ~14 Menit Penjelasan Komprehensif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {chapters.map((ch, idx) => {
                  const isCur = tourMode === 'chapters' && idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setTourMode('chapters');
                        setCurrentChapterIndex(idx);
                        if (audioRef.current) audioRef.current.pause();
                        playSpeechSynthesis(ch.narration);
                        setIsPlaying(true);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                        isCur
                          ? 'bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 border-cyan-500/50 shadow-md shadow-cyan-900/20'
                          : 'bg-white dark:bg-slate-900/60 border-gray-200 dark:border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCur
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-slate-300'
                          }`}
                        >
                          {ch.id}
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-gray-400 dark:text-slate-400">
                          {ch.time.split(' - ')[0]}
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-0.5">
                          {ch.category}
                        </div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                          {ch.title}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-500 dark:text-slate-400">
                        <span>{ch.features.length} fitur</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isCur ? 'translate-x-1 text-cyan-400' : 'group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SURAT RESMI PENJELASAN & BERITA ACARA SERAH TERIMA ── */}
        {activeTab === 'letter' && (
          <div className="space-y-6">
            {/* Action Bar for Letter */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Surat Penjelasan Resmi & Berita Acara Serah Terima Sistem
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Dokumen resmi siap cetak / PDF untuk laporan serah terima kepada Manajemen & Operasional Plant.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <a
                  href={route('video-panduan.download.surat-pdf')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF Resmi
                </a>
                <a
                  href={route('video-panduan.download.surat-doc')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-0.5"
                >
                  <FileCheck className="w-4 h-4" />
                  Unduh Word (.doc)
                </a>
                <button
                  onClick={handlePrintLetter}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-800 dark:text-white font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak (Print)
                </button>
              </div>
            </div>

            {/* Printable Paper Document Container */}
            <div
              id="printable-letter"
              className="bg-white text-gray-900 p-8 sm:p-14 rounded-3xl shadow-xl border border-gray-200 max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-sm"
            >
              {/* ── Kop Surat Perusahaan ── */}
              <div className="border-b-4 border-double border-gray-900 pb-5 text-center relative">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-400 flex items-center justify-center bg-gray-100 shrink-0">
                    <img
                      src="/images/planner_logo.jpg"
                      alt="Company Logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-gray-950">
                      PT PLANT SYSTEM INDONESIA
                    </h1>
                    <h2 className="text-xs sm:text-sm font-bold tracking-widest text-emerald-800 uppercase">
                      MINING & HEAVY EQUIPMENT OPERATION DIVISION
                    </h2>
                    <p className="text-[11px] font-sans text-gray-600">
                      Site Project Area KM 45, Kalimantan Timur • Telp: (0541) 789-PLANT • Email:
                      support@systemplant.com
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Metadata Surat ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans border-b border-gray-200 pb-4">
                <div className="space-y-1">
                  <div>
                    <span className="font-bold text-gray-700 w-24 inline-block">Nomor Surat:</span>
                    <span className="font-mono font-bold text-gray-900">042/ENG-PLANT/BAST-SYS/IX/2026</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 w-24 inline-block">Lampiran:</span>
                    <span>1 (Satu) Berkas Dokumentasi & Video Panduan Interaktif</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 w-24 inline-block">Perihal:</span>
                    <span className="font-bold text-gray-950 underline">
                      Penjelasan Teknis & Berita Acara Serah Terima Sistem Plant Maintenance Terpadu
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div>
                    <span className="font-bold text-gray-700">Tanggal:</span> 26 September 2026
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Klasifikasi:</span> Resmi / Penting Operasional
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Status Implementasi:</span> Siap Operasional (Production
                    Ready)
                  </div>
                </div>
              </div>

              {/* ── Kepada Yth ── */}
              <div className="font-sans text-xs space-y-1">
                <div>Kepada Yth.</div>
                <div className="font-bold text-gray-950">1. Operational General Manager</div>
                <div className="font-bold text-gray-950">2. Plant Maintenance Superintendent</div>
                <div className="font-bold text-gray-950">3. Engineering Planner & Maintenance Supervisor</div>
                <div className="font-bold text-gray-950">4. Seluruh Tim Operasional & Mekanik Divisi Plant</div>
                <div>Di Tempat</div>
              </div>

              {/* ── Isi Surat Resmi ── */}
              <div className="space-y-4 font-serif text-justify text-gray-800 text-[13px] leading-relaxed">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan telah diselesaikannya tahap perancangan, pengembangan, pengujian, dan implementasi
                  arsitektur digital pada <strong>Plant Maintenance System</strong>, melalui surat ini kami sampaikan
                  secara resmi penjelasan komprehensif mengenai seluruh fitur dan menu aplikasi yang telah dibangun,
                  beserta rekaman video panduan operasional terpadu yang dapat diakses langsung oleh seluruh jajaran
                  manajemen dan teknisi site.
                </p>

                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 border-b border-gray-300 pb-1 mt-4">
                  I. Rangkuman Ruang Lingkup Sistem & Modul Utama
                </h4>
                <p>
                  Sistem ini dirancang khusus untuk memenuhi standar operasional pertambangan modern dengan mencakup 9
                  (sembilan) pilar modul utama yang mengintegrasikan lebih dari 55 sub-menu fungsional:
                </p>

                <div className="font-sans text-xs space-y-2.5 my-3 pl-2">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">1. Autentikasi & Keamanan Akses:</strong> Dimulai dari Halaman
                    Login terenkripsi dengan perlindungan CSRF, Session Keep-Alive otomatis yang mencegah hilangnya data
                    saat pengisian form panjang, dan pembagian hak akses Role-Based Access Control (RBAC).
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">2. Maintenance Control & Work Orders:</strong> Pusat kendali
                    pelacakan kerusakan alat berat (Monitoring Breakdown: Open, In Progress, Waiting Part, Waiting
                    Manpower, Closed), riwayat perbaikan (Historical WO Closed), serta ekspor/impor Excel massal.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">3. Monitoring Orderan & Part Order Lifetime:</strong> Pelacakan
                    status PO/PR suku cadang dan smart tracking umur pakai komponen dengan indikator peringatan dini
                    keausan kritis, serta pencatatan konsumsi oli dan kanibalisasi suku cadang.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">4. Preventive Maintenance (PM Forecast & Plan Inspeksi):</strong>{' '}
                    Sinkronisasi Hour Meter (HM) untuk proyeksi tanggal jatuh tempo servis berkala (PS 250H - 2000H),
                    jadwal inspeksi armada hauler & dump truck, serta checklist digital P2H harian.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">5. Tire Operations & TyreVault 3D:</strong> Peta visualisasi 3D
                    sasis armada untuk pemantauan posisi ban, tekanan ban (PSI), kedalaman tapak (Remaining Tread Depth),
                    serta pencatatan histori rotasi dan pelepasan ban.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">6. Formulir Operasional & Keselamatan HSE:</strong> Digitalisasi
                    seluruh form standar tambang (Portal JSA MAM-HSE-FORM-028, Form Servis OHT 773, Dump Truck, Dozer,
                    Motorgrader, Genset, Washing Unit, dan SPK) dengan kemampuan unduh & cetak blanko PDF siap lapangan.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">7. Toolroom & SST Management:</strong> Inventarisasi Special
                    Service Tools, pencatatan peminjaman berbasis NRP mekanik, pengawasan kalibrasi alat ukur, scrap
                    tools, dan penerbitan Gate Pass Tool.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">8. Master Data, Populasi Unit & Gatepass:</strong> Direktori
                    seluruh populasi armada tambang, input cepat Hour Meter harian, dan penerbitan surat jalan Gatepass
                    Unit saat keluar workshop.
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <strong className="text-gray-950">9. HR, Manpower & Administrasi Sistem:</strong> Database personel,
                    bagan Struktur Organisasi interaktif, kalender Roster Kerja, pengajuan cuti, Menu Builder
                    drag-and-drop mandiri, dan visualisasi relasi database 3D.
                  </div>
                </div>

                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 border-b border-gray-300 pb-1 mt-4">
                  II. Video Panduan & Media Pembelajaran Terintegrasi
                </h4>
                <p>
                  Untuk memastikan kelancaran adopsi sistem oleh seluruh tingkatan user, telah disediakan menu khusus{' '}
                  <strong>"Video Panduan & Tur Sistem"</strong> pada aplikasi web. Video tersebut mencakup 10 bab
                  pembelajaran interaktif dari halaman login hingga fitur administrasi tertinggi, dilengkapi transkrip
                  bahasa Indonesia dan simulasi layar aktual.
                </p>

                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 border-b border-gray-300 pb-1 mt-4">
                  III. Pernyataan Serah Terima & Rekomendasi
                </h4>
                <p>
                  Dengan diterbitkannya surat ini, seluruh modul dinyatakan telah selesai diuji (Feature Testing &
                  Concurrency Testing) dan diserahkan dalam keadaan berfungsi optimal untuk mendukung keandalan armada
                  (Physical Availability / PA & Mean Time To Repair / MTTR) di site operasional.
                </p>

                <p>
                  Demikian surat penjelasan dan berita acara ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
                  Atas perhatian dan kerja sama yang baik dari seluruh pihak, kami ucapkan terima kasih.
                </p>
              </div>

              {/* ── Kolom Tanda Tangan & Pengesahan ── */}
              <div className="font-sans text-xs pt-8 border-t border-gray-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-16">
                  <div>
                    <div>Diserahkan Oleh,</div>
                    <div className="font-bold text-gray-900">Lead System Developer</div>
                  </div>
                  <div>
                    <div className="font-bold underline text-gray-950">Antigravity AI Engineering</div>
                    <div className="text-gray-600 text-[10px]">Lead Software Architect</div>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    <div>Diterima Oleh,</div>
                    <div className="font-bold text-gray-900">Plant Maintenance Dept.</div>
                  </div>
                  <div>
                    <div className="font-bold underline text-gray-950">Maintenance Superintendent</div>
                    <div className="text-gray-600 text-[10px]">Plant Operation Division</div>
                  </div>
                </div>

                <div className="space-y-16 sm:col-span-1 col-span-2">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold text-gray-900">Site Management</div>
                  </div>
                  <div>
                    <div className="font-bold underline text-gray-950">Operation General Manager</div>
                    <div className="text-gray-600 text-[10px]">Mining Project Executive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DIREKTORI & KATALOG SELURUH MENU SISTEM ── */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Search Filter Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Direktori Lengkap Menu & Hak Akses
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Menampilkan seluruh kategori dan sub-menu yang aktif terdaftar dalam sistem.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
                <a
                  href={route('video-panduan.download.katalog-csv')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-all transform hover:-translate-y-0.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Unduh Matriks CSV
                </a>
                <a
                  href={route('video-panduan.download.panduan-pdf')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-900/20 transition-all transform hover:-translate-y-0.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Unduh Panduan PDF
                </a>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari menu / rute..."
                    value={searchMenuQuery}
                    onChange={(e) => setSearchMenuQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Catalog Grouped Cards */}
            <div className="space-y-6">
              {filteredCatalog.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10">
                  <Search className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm font-bold text-gray-800 dark:text-white">
                    Tidak ditemukan menu yang sesuai dengan pencarian
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Coba kata kunci lain atau bersihkan kotak pencarian di atas.
                  </div>
                </div>
              ) : (
                filteredCatalog.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white dark:bg-slate-900/60 rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                          {section.section_label || section.name || 'MODUL UMUM'}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {(section.sub_menus || []).length || 1} Menu
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.sub_menus && section.sub_menus.length > 0 ? (
                        section.sub_menus.map((sub, subIdx) => (
                          <div
                            key={subIdx}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {sub.name}
                              </div>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  {sub.badge}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-mono text-gray-500 dark:text-slate-400 truncate">
                              {sub.href}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-white/5">
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                                Akses Terproteksi
                              </span>
                              <Link
                                href={sub.href}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                Buka
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {section.name}
                            </div>
                            {section.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                {section.badge}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-gray-500 dark:text-slate-400 truncate">
                            {section.href}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                              Akses Terproteksi
                            </span>
                            <Link
                              href={section.href}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                              Buka
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Set Custom External Video URL ── */}
      <AnimatePresence>
        {isUrlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUrlModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-white/10 z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Tautkan URL Video Rekaman Eksternal
                  </h3>
                </div>
                <button
                  onClick={() => setIsUrlModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Jika tim Anda memiliki file rekaman video screen recording tersendiri (format MP4 langsung, YouTube URL,
                Loom, atau Google Drive stream), Anda dapat menautkannya di sini agar otomatis diputar di halaman ini.
              </p>

              <form onSubmit={handleSaveVideoUrl} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    URL Video (MP4 / YouTube / Loom):
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... atau https://domain.com/video.mp4"
                    value={data.video_panduan_url}
                    onChange={(e) => setData('video_panduan_url', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {errors.video_panduan_url && (
                    <div className="text-xs text-red-500 mt-1">{errors.video_panduan_url}</div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUrlModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    {processing ? 'Menyimpan...' : 'Simpan URL Video'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Specific CSS to ensure clean A4 white paper formatting */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, aside, header, footer, button, .no-print {
            display: none !important;
          }
          #printable-letter {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            font-size: 11pt !important;
          }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
