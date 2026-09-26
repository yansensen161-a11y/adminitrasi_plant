import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SearchModal from '@/Components/Mosaic/ModalSearch';
import Notifications from '@/Components/Mosaic/DropdownNotifications';
import Help from '@/Components/Mosaic/DropdownHelp';
import UserMenu from '@/Components/Mosaic/DropdownProfile';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-transparent hover:border-emerald-500/30"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <svg className="w-5 h-5 fill-current drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" viewBox="0 0 24 24">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 fill-current drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" viewBox="0 0 24 24">
          <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 7.4 7.4 0 01-7.4-7.4c0-1.81.65-3.48 1.74-4.79C12.92 3.04 12.46 3 12 3z" />
        </svg>
      )}
    </button>
  );
}

function Header({
  sidebarOpen,
  setSidebarOpen,
}) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Left Side: Mobile toggle & Search trigger */}
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-emerald-400 lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <rect x="4" y="5" width="16" height="2" rx="1" />
                <rect x="4" y="11" width="16" height="2" rx="1" />
                <rect x="4" y="17" width="16" height="2" rx="1" />
              </svg>
            </button>

            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/60 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs transition-all"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Cari fitur, unit, atau formulir...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Side: Quick Action Icons & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <ThemeToggle />
            <Notifications align="right" />
            <Help align="right" />

            {/* Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-white/10 border-none mx-1" />
            <UserMenu align="right" />
          </div>

        </div>
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        setIsOpen={setSearchModalOpen}
      />
    </header>
  );
}

export default Header;
