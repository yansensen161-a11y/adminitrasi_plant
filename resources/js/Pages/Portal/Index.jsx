import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ModalSearch from '@/Components/Mosaic/ModalSearch';
import { 
  Truck, 
  Wrench, 
  Disc, 
  Fuel, 
  ShieldCheck, 
  Activity, 
  Search, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  Clock, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Database,
  ExternalLink,
  LogOut,
  ClipboardCheck,
  TrendingUp,
  X
} from 'lucide-react';

export default function PortalIndex({ modules = [], user = {}, systemStatus = {} }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeSubmenuModal, setActiveSubmenuModal] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Live WITA Clock (UTC+8)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in WITA (Asia/Makassar / UTC+8)
      const options = {
        timeZone: 'Asia/Makassar',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now);
      setCurrentTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Navigation: Numbers 1-6 and '/' for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture when typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '/') {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= modules.length) {
        const targetModule = modules[keyNum - 1];
        if (targetModule && targetModule.target_url) {
          if (targetModule.id) {
            localStorage.setItem('active_portal_id', targetModule.id);
          }
          router.visit(targetModule.target_url);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Helper for Theme Styles matching screenshot
  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'emerald':
        return {
          cardBorder: 'hover:border-emerald-500/60 shadow-[0_4px_25px_rgba(16,185,129,0.05)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.2)]',
          topLine: 'bg-emerald-500',
          badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
          iconBg: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
          btnGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20',
          metricBorder: 'border-emerald-500/10',
        };
      case 'orange':
        return {
          cardBorder: 'hover:border-orange-500/60 shadow-[0_4px_25px_rgba(249,115,22,0.05)] hover:shadow-[0_4px_35px_rgba(249,115,22,0.2)]',
          topLine: 'bg-orange-500',
          badgeBg: 'bg-orange-950/80 text-orange-400 border-orange-500/30',
          iconBg: 'bg-orange-900/40 text-orange-400 border-orange-500/30',
          btnGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/20',
          metricBorder: 'border-orange-500/10',
        };
      case 'amber':
        return {
          cardBorder: 'hover:border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.05)] hover:shadow-[0_4px_35px_rgba(245,158,11,0.2)]',
          topLine: 'bg-amber-500',
          badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
          iconBg: 'bg-amber-900/40 text-amber-400 border-amber-500/30',
          btnGradient: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20',
          metricBorder: 'border-amber-500/10',
        };
      case 'cyan':
        return {
          cardBorder: 'hover:border-cyan-500/60 shadow-[0_4px_25px_rgba(6,182,212,0.05)] hover:shadow-[0_4px_35px_rgba(6,182,212,0.2)]',
          topLine: 'bg-cyan-500',
          badgeBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
          iconBg: 'bg-cyan-900/40 text-cyan-400 border-cyan-500/30',
          btnGradient: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20',
          metricBorder: 'border-cyan-500/10',
        };
      case 'purple':
        return {
          cardBorder: 'hover:border-purple-500/60 shadow-[0_4px_25px_rgba(168,85,247,0.05)] hover:shadow-[0_4px_35px_rgba(168,85,247,0.2)]',
          topLine: 'bg-purple-500',
          badgeBg: 'bg-purple-950/80 text-purple-400 border-purple-500/30',
          iconBg: 'bg-purple-900/40 text-purple-400 border-purple-500/30',
          btnGradient: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/20',
          metricBorder: 'border-purple-500/10',
        };
      case 'rose':
        return {
          cardBorder: 'hover:border-rose-500/60 shadow-[0_4px_25px_rgba(244,63,94,0.05)] hover:shadow-[0_4px_35px_rgba(244,63,94,0.2)]',
          topLine: 'bg-rose-500',
          badgeBg: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
          iconBg: 'bg-rose-900/40 text-rose-400 border-rose-500/30',
          btnGradient: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-rose-500/20',
          metricBorder: 'border-rose-500/10',
        };
      case 'teal':
      default:
        return {
          cardBorder: 'hover:border-teal-500/60 shadow-[0_4px_25px_rgba(20,184,166,0.05)] hover:shadow-[0_4px_35px_rgba(20,184,166,0.2)]',
          topLine: 'bg-teal-500',
          badgeBg: 'bg-teal-950/80 text-teal-400 border-teal-500/30',
          iconBg: 'bg-teal-900/40 text-teal-400 border-teal-500/30',
          btnGradient: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20',
          metricBorder: 'border-teal-500/10',
        };
    }
  };

  const getModuleIcon = (iconName) => {
    switch (iconName) {
      case 'truck':
        return <Truck className="w-6 h-6" />;
      case 'disc':
        return <Disc className="w-6 h-6" />;
      case 'wrench':
        return <Wrench className="w-6 h-6" />;
      case 'fuel':
        return <Fuel className="w-6 h-6" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6" />;
      case 'clipboard':
        return <ClipboardCheck className="w-6 h-6" />;
      case 'users':
        return <Users className="w-6 h-6" />;
      case 'trending-up':
      case 'kpi':
        return <TrendingUp className="w-6 h-6" />;
      case 'activity':
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-white relative overflow-x-hidden">
      <Head title="Central Command Deck Portal - PT Mitra Abadi Mahakam" />

      {/* Global Background Glow & Grid Accent */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-dot-pattern opacity-30 pointer-events-none z-0" />

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#070b13]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Hub Identity */}
        <div className="flex items-center gap-3.5">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-600/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#070b13] rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/images/planner_logo.jpg" alt="MAM Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="font-black text-amber-500 text-sm tracking-wider">MAM</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                {systemStatus.company || 'PT Mitra Abadi Mahakam'}
              </span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider shadow-sm uppercase">
                {systemStatus.version || 'V3.0 COMMAND DECK'}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 tracking-wide">
              {systemStatus.hub || 'Enterprise Mining & Fleet Engineering Hub'}
            </div>
          </div>
        </div>

        {/* Center-Right: Live Clock & Search & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Real-time Clock in WITA */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-300 shadow-inner">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '20:22:34'}</span>
            <span className="text-cyan-400 font-bold">WITA</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-slate-400 hover:text-white transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Cari modul / fitur...</span>
            <kbd className="hidden sm:inline-block bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-700">
              /
            </kbd>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              {(user.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-bold text-white leading-tight">
                {user.name || 'Super Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {user.role || 'Super Admin'}
              </div>
            </div>

            {/* Logout button */}
            <Link
              href="/logout"
              method="post"
              as="button"
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
              title="Keluar / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Central Welcome Greeting Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* Central System Online Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>CENTRAL SYSTEM ONLINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Selamat Datang,{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              {user.name || 'Super Administrator'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            Pilih modul workspace di bawah ini untuk memulai operasi kerja. Klik kartu atau gunakan tombol angka{' '}
            <kbd className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono text-xs border border-slate-700 font-bold">1</kbd> s/d{' '}
            <kbd className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono text-xs border border-slate-700 font-bold">{modules.length || 7}</kbd>.
          </p>
        </div>

        {/* ── WORKSPACE CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {modules.map((mod, idx) => {
            const theme = getThemeStyles(mod.theme);

            return (
              <div
                key={mod.id || idx}
                className={`group relative flex flex-col justify-between bg-[#0e1422]/90 backdrop-blur-md rounded-3xl border border-slate-800/80 ${theme.cardBorder} transition-all duration-300 overflow-hidden hover:-translate-y-1`}
              >
                {/* Top Accent Color Line */}
                <div className={`h-1.5 w-full ${theme.topLine}`} />

                <div className="p-6 space-y-4">
                  {/* Card Header: Icon & Badge with hotkey */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} border flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                      {getModuleIcon(mod.icon)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold font-mono tracking-wide uppercase border ${theme.badgeBg}`}>
                        {mod.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {mod.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {mod.desc}
                    </p>
                  </div>

                  {/* Metrics Box (4 items) */}
                  <div className="p-4 rounded-2xl bg-[#090d17]/80 border border-slate-800/60 divide-y divide-slate-800/50 space-y-2 text-xs">
                    {mod.metrics && mod.metrics.map((met, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between pt-2 first:pt-0">
                        <span className="text-slate-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          {met.label}
                        </span>
                        <span className={`font-mono font-bold ${met.color || 'text-white'}`}>
                          {met.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Submenu Preview Trigger */}
                  {mod.submenus && mod.submenus.length > 0 && (
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {mod.submenus.length} Sub-Menu Tersedia
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubmenuModal(mod);
                        }}
                        className="text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors"
                      >
                        Pilih Menu Cepat
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="p-4 pt-0">
                  <Link
                    href={mod.target_url}
                    onClick={() => {
                      if (mod.id) localStorage.setItem('active_portal_id', mod.id);
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${theme.btnGradient}`}
                  >
                    <span>{mod.button_text}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER SYSTEM INFO ── */}
        <div className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Integrated Plant Maintenance Engineering System</span>
          </div>
          <div>
            PT Mitra Abadi Mahakam © {new Date().getFullYear()} • Mining & Fleet Engineering Division
          </div>
        </div>

      </main>

      {/* ── MODAL QUICK SUB-MENU DRAWER ── */}
      {activeSubmenuModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1422] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                  {getModuleIcon(activeSubmenuModal.icon)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeSubmenuModal.title} — Sub-Menu
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih halaman kerja spesifik dalam workspace ini
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubmenuModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submenu List */}
            <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {activeSubmenuModal.submenus.map((sub, sIdx) => {
                const showGroupHeader = sub.group && (sIdx === 0 || activeSubmenuModal.submenus[sIdx - 1].group !== sub.group);
                return (
                  <React.Fragment key={sIdx}>
                    {showGroupHeader && (
                      <div className="flex items-center gap-2 px-1 pt-3 pb-1 first:pt-0">
                        <span className="text-[10px] font-black tracking-wider uppercase font-mono px-2.5 py-0.5 rounded border bg-slate-800/90 text-cyan-400 border-cyan-500/30">
                          {sub.group}
                        </span>
                        <div className="h-px flex-1 bg-slate-800" />
                      </div>
                    )}
                    <Link
                      href={sub.href}
                      onClick={() => {
                        if (activeSubmenuModal?.id) {
                          localStorage.setItem('active_portal_id', activeSubmenuModal.id);
                        }
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                        <span>{sub.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-right">
              <Link
                href={activeSubmenuModal.target_url}
                onClick={() => {
                  if (activeSubmenuModal?.id) {
                    localStorage.setItem('active_portal_id', activeSubmenuModal.id);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <span>Buka Dashboard Modul Ini</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Global Search Modal (Cmd+K or '/') */}
      <ModalSearch id="portal-search" searchId="portal-search-modal" modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />

    </div>
  );
}
