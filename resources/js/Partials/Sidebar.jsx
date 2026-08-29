import React, { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const { url } = usePage();
  const pathname = url || '';

  const trigger = useRef(null);
  const sidebar = useRef(null);

  // Accordion states for dropdown groups
  const [userMgmtOpen, setUserMgmtOpen] = useState(
    pathname.includes("users") || pathname.includes("roles") || pathname.includes("permissions")
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.includes("settings") || pathname.includes("profile")
  );
  const [abrOpen, setAbrOpen] = useState(
    pathname.includes("abr")
  );

  // Close mobile sidebar on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  const isLinkActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getSublinkClass = (href) => {
    const active = isLinkActive(href);
    return `flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
      active
        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 font-medium"
    }`;
  };

  const getMainLinkClass = (href) => {
    const active = isLinkActive(href);
    return `sidebar-link-hover flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? "sidebar-link-active bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25"
        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
    }`;
  };

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        id="sidebar"
        ref={sidebar}
        className={`fixed lg:static z-50 left-0 top-0 h-screen w-64 shrink-0 bg-gradient-to-b from-white via-white to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-r border-gray-200/80 dark:border-gray-800 p-4 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight block leading-tight">
                System Plant
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gradient">
                Operations Platform
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            ref={trigger}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto space-y-7 pr-1">
          {/* Main Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              Main
            </div>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className={getMainLinkClass('/dashboard')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
                    <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                    <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Plant Operations Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              Plant Operations
            </div>
            <ul className="space-y-1">
              <li>
                <Link href="/units" className={getMainLinkClass('/units')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M19 8h-1V5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8 5h8v3H8V5zm11 15H5v-8h14v8zM7 14h2v4H7zm8 0h2v4h-2z" />
                  </svg>
                  <div className="flex items-center justify-between flex-1">
                    <span>Populasi Unit</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 animate-pulse-soft">
                      Plant
                    </span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/hour-meters" className={getMainLinkClass('/hour-meters')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <div className="flex items-center justify-between flex-1">
                    <span>Hour Meter (HM)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-500 dark:text-violet-400 animate-pulse-soft">
                      Daily
                    </span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/plan-service" className={getMainLinkClass('/plan-service')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.19-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.19.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                  <div className="flex items-center justify-between flex-1">
                    <span>Plan Service</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 dark:text-amber-400">
                      Maint
                    </span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Plant Administration Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              Plant Admin
            </div>
            <ul className="space-y-1">
              <li>
                <Link href="/organization" className={getMainLinkClass('/organization')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  <div className="flex items-center justify-between flex-1">
                    <span>Org Structure</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/manpower-budget" className={getMainLinkClass('/manpower-budget')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <div className="flex items-center justify-between flex-1">
                    <span>Manpower Budget</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* ABR Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              ABR
            </div>
            <ul className="space-y-1">
              <li className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAbrOpen(!abrOpen)}
                  className={`sidebar-link-hover w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname.includes("abr")
                      ? "sidebar-link-active bg-blue-50 dark:bg-blue-900/15 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    <span>ABR</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 fill-current text-gray-400 ${
                      abrOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                    viewBox="0 0 12 12"
                  >
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </button>

                {/* Submenu */}
                <div
                  className={`transition-all duration-300 ease-in-out pl-6 pr-2 py-1 space-y-0.5 overflow-hidden ${
                    abrOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <Link href="/abr" className={getSublinkClass('/abr')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    List ABR
                  </Link>
                  <Link href="/abr/create" className={getSublinkClass('/abr/create')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    Tambah ABR
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          {/* User Management Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              User & Access Control
            </div>
            <ul className="space-y-1">
              {/* User Management Dropdown */}
              <li className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUserMgmtOpen(!userMgmtOpen)}
                  className={`sidebar-link-hover w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname.includes("users") || pathname.includes("roles") || pathname.includes("permissions")
                      ? "sidebar-link-active bg-violet-50 dark:bg-violet-900/15 text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
                      <path d="M8 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM0 15.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 15.5V16H0v-.5ZM2.062 14A3.5 3.5 0 0 1 5.5 12h5a3.5 3.5 0 0 1 3.438 2H2.062Z" />
                    </svg>
                    <span>User Management</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 fill-current text-gray-400 ${
                      userMgmtOpen ? "rotate-180 text-violet-600" : ""
                    }`}
                    viewBox="0 0 12 12"
                  >
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </button>

                {/* Submenu */}
                <div
                  className={`transition-all duration-300 ease-in-out pl-6 pr-2 py-1 space-y-0.5 overflow-hidden ${
                    userMgmtOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <Link href="/users" className={getSublinkClass('/users')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    Users List
                  </Link>
                  <Link href="/roles" className={getSublinkClass('/roles')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    Roles (Peran)
                  </Link>
                  <Link href="/permissions" className={getSublinkClass('/permissions')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    Permissions
                  </Link>
                </div>
              </li>

              {/* Activity Logs */}
              <li>
                <Link href="/activity-logs" className={getMainLinkClass('/activity-logs')}>
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 2h12v2H2V2Zm0 12V6h12v8H2Z" />
                    <path d="M4 8h8v1.5H4zm0 3h5v1.5H4z" />
                  </svg>
                  <span>Activity Logs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* System Settings Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-3 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></span>
              System & Preferences
            </div>
            <ul className="space-y-1">
              {/* Settings Dropdown */}
              <li className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`sidebar-link-hover w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname.includes("settings") || pathname.includes("profile")
                      ? "sidebar-link-active bg-violet-50 dark:bg-violet-900/15 text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
                      <path d="m14.536 7.464-1.127-.47a4.935 4.935 0 0 0-.462-1.115l.47-1.127a.999.999 0 0 0-.258-1.124l-1.414-1.414a1 1 0 0 0-1.124-.258l-1.127.47a4.935 4.935 0 0 0-1.115-.462l-.47-1.127A1 1 0 0 0 7.915 0H5.915a.999.999 0 0 0-.974.737l-.47 1.127a4.935 4.935 0 0 0-1.115.462l-1.127-.47a1 1 0 0 0-1.124.258L.891 3.528a.999.999 0 0 0-.258 1.124l.47 1.127c-.2.35-.355.727-.462 1.115l-1.127.47A1 1 0 0 0-.723 8.338v2a.999.999 0 0 0 .737.974l1.127.47c.107.388.262.765.462 1.115l-.47 1.127a.999.999 0 0 0 .258 1.124l1.414 1.414a1 1 0 0 0 1.124.258l1.127-.47c.35.2.727.355 1.115.462l.47 1.127a.999.999 0 0 0 .974.737h2a.999.999 0 0 0 .974-.737l.47-1.127c.388-.107.765-.262 1.115-.462l1.127.47a1 1 0 0 0 1.124-.258l1.414-1.414a.999.999 0 0 0 .258-1.124l-.47-1.127c.2-.35.355-.727.462-1.115l1.127-.47a1 1 0 0 0 .737-.974v-2a.999.999 0 0 0-.737-.974ZM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                    </svg>
                    <span>Settings</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 fill-current text-gray-400 ${
                      settingsOpen ? "rotate-180 text-violet-600" : ""
                    }`}
                    viewBox="0 0 12 12"
                  >
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </button>

                {/* Submenu */}
                <div
                  className={`transition-all duration-300 ease-in-out pl-6 pr-2 py-1 space-y-0.5 overflow-hidden ${
                    settingsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <Link href="/settings/mail" className={getSublinkClass('/settings/mail')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    Email / SMTP
                  </Link>
                  <Link href="/profile" className={getSublinkClass('/profile')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                    My Profile
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="pt-4 mt-auto">
          {/* Gradient separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700/60 to-transparent mb-4"></div>
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 via-indigo-500 to-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-violet-500/20 ring-2 ring-white/20">
                U
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 status-online"></span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Account Profile
              </span>
              <span className="text-[11px] text-gray-400 truncate block">
                Manage Account
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all group-hover:translate-x-0.5 shrink-0 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
