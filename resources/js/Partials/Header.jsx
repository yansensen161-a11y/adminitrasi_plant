import React, { useState } from 'react';

import SearchModal from '@/Components/Mosaic/ModalSearch';
import Notifications from '@/Components/Mosaic/DropdownNotifications';
import Help from '@/Components/Mosaic/DropdownHelp';
import UserMenu from '@/Components/Mosaic/DropdownProfile';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
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
      className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <svg className="w-6 h-6 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" viewBox="0 0 24 24">
          {/* Sun icon for dark mode (click to light) */}
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 fill-current drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" viewBox="0 0 24 24">
          {/* Moon icon for light mode (click to dark) */}
          <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 7.4 7.4 0 01-7.4-7.4c0-1.81.65-3.48 1.74-4.79C12.92 3.04 12.46 3 12 3z" />
        </svg>
      )}
    </button>
  );
}

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {

  const [searchModalOpen, setSearchModalOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_0_15px_rgba(8,247,254,0.1)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Header: Left side */}
          <div className="flex">

            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-green-500 lg:hidden transition-colors"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" rx="1" />
                <rect x="4" y="11" width="16" height="2" rx="1" />
                <rect x="4" y="17" width="16" height="2" rx="1" />
              </svg>
            </button>

          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            
            <ThemeToggle />
            <Help align="right" />
            
            {/*  Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-white/10 border-none mx-2" />
            <UserMenu align="right" />

          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
