import React, { useState } from 'react';

import SearchModal from '@/Components/Mosaic/ModalSearch';
import Notifications from '@/Components/Mosaic/DropdownNotifications';
import Help from '@/Components/Mosaic/DropdownHelp';
import UserMenu from '@/Components/Mosaic/DropdownProfile';
import ThemeToggle from '@/Components/Mosaic/ThemeToggle';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {

  const [searchModalOpen, setSearchModalOpen] = useState(false)

  return (
    <header className={`sticky top-0 z-30 ${variant === 'v2' || variant === 'v3' ? '' : ''}`}>
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl -z-10"></div>
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent -z-10"></div>
      
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Header: Left side */}
          <div className="flex">

            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 lg:hidden transition-colors"
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
          <div className="flex items-center space-x-2">
            <div>
              <button
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-violet-600 dark:hover:text-violet-400 ${searchModalOpen && 'bg-gray-100 dark:bg-white/5 text-violet-600'}`}
                onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}
                aria-controls="search-modal"
              >
                <span className="sr-only">Search</span>
                <svg
                  className="fill-current text-gray-500/80 dark:text-gray-400/80"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                  <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                </svg>
              </button>
              <SearchModal id="search-modal" searchId="search" modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
            </div>
            <Notifications align="right" />
            <Help align="right" />
            <ThemeToggle />
            {/*  Divider */}
            <hr className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent border-none mx-1" />
            <UserMenu align="right" />

          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
