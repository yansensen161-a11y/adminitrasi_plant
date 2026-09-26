import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Transition from '@/utils/Transition';


function DropdownProfile({
  align
}) {

  const user = usePage().props.auth.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img 
          className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500 shadow-md ring-2 ring-emerald-500/20" 
          src={user?.avatar_url || (user?.avatar ? `/storage/${user.avatar}` : "/images/planner_logo.jpg")} 
          alt={user?.name || "User"} 
          onError={(e) => { e.currentTarget.src = "/images/planner_logo.jpg"; }}
        />
        <div className="flex items-center truncate">
          <span className="truncate ml-3 text-sm font-bold text-gray-700 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{user?.name || 'User'}</span>
          <svg className="w-4 h-4 shrink-0 ml-2 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-2 rounded-xl shadow-xl overflow-hidden mt-1.5 backdrop-blur-md ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="pt-1 pb-2.5 px-3.5 mb-1 border-b border-gray-100 dark:border-gray-700/60">
            <div className="font-semibold text-gray-800 dark:text-gray-100 leading-tight truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || ''}</div>
            <div className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                {user?.roles?.length > 0 ? user.roles[0].name : 'User'}
            </div>
          </div>
          <ul className="py-1 text-sm font-medium">
            <li>
              <Link
                className="text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2.5 py-2 px-3.5 transition-colors"
                href={route('profile.edit')}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2.5 py-2 px-3.5 transition-colors"
                href={route('settings.menus.index')}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Menu Builder (Web Setting)
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2.5 py-2 px-3.5 transition-colors"
                href={route('settings.roles-permissions.index')}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Role & Permission
              </Link>
            </li>
            <li className="border-t border-gray-100 dark:border-gray-700/60 my-1"></li>
            <li>
              <Link
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 py-2 px-3.5 transition-colors"
                href={route('logout')}
                method="post"
                as="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  )
}

export default DropdownProfile;
