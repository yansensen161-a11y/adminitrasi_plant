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
        <img className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500 shadow-md" src="/images/planner_logo.jpg" alt="User" />
        <div className="flex items-center truncate">
          <span className="truncate ml-3 text-lg font-bold text-gray-700 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{user?.name || 'User'}</span>
          <svg className="w-4 h-4 shrink-0 ml-2 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
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
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="font-medium text-gray-800 dark:text-gray-100">{user?.name || 'User'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                {user?.roles?.length > 0 ? user.roles[0].name : 'User'}
            </div>
          </div>
          <ul>
            <li>
              <Link
                className="font-medium text-sm text-[#0b5c3e] hover:text-[#08422c] dark:hover:text-[#2ecb8d] flex items-center py-1 px-3"
                href={route('profile.edit')}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Profile Settings
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-sm text-[#0b5c3e] hover:text-[#08422c] dark:hover:text-[#2ecb8d] flex items-center py-1 px-3"
                href={route('logout')}
                method="post"
                as="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
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
