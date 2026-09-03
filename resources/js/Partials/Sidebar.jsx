import React, { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { url } = usePage();
  const pathname = url || '';

  const trigger = useRef(null);
  const sidebar = useRef(null);

  // Accordion states for dropdown groups
  const [masterPmOpen, setMasterPmOpen] = useState(
    pathname.includes("plan-service") || pathname.includes("hour-meters")
  );
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
    if (href === '/dashboard' || href === '/') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getSublinkClass = (href) => {
    const active = isLinkActive(href);
    return `flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
      active
        ? "bg-gray-800/10 text-gray-200 dark:text-gray-100 font-bold"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-medium"
    }`;
  };

  const getMainLinkClass = (href) => {
    const active = isLinkActive(href);
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
      active
        ? "bg-gray-800 text-white shadow-md shadow-gray-900/30"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }`;
  };

  // Accordion animation variants
  const accordionVariants = {
    open: { 
      opacity: 1, 
      height: "auto", 
      transition: { 
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2, delay: 0.1 }
      } 
    },
    closed: { 
      opacity: 0, 
      height: 0, 
      transition: { 
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.1 }
      } 
    }
  };

  const menuGroups = [
    {
      title: "DASHBOARD",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: (
          <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
            <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
            <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
          </svg>
        )}
      ]
    },
    {
      title: "MASTER DATA",
      items: [
        { 
          name: "Populasi Unit", 
          href: "/units",
          icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
          )
        },
        { 
          name: "Hour Meter Daily", 
          href: "/hour-meters",
          icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          )
        }
      ]
    },
    {
      title: "PLANNER",
      items: [
        { name: "Monitoring Order List", href: "/monitoring-orders", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        ) },
        { name: "Monitoring Part Canibal", href: "/part-canibals", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        ) },
        { name: "PCR U/C & Component", href: "/pcr-uc", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
        ) },
        { name: "Master Control PM Service", href: "/master-pm", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        ) },
        { name: "Plan Service", href: "/plan-service", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
        ) },
        { name: "Forecast PA Unit", href: "/forecast-pa", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        )}
      ]
    },
    {
      title: "REPAIR & MAINTENANCE",
      items: [
        { name: "Daily Monitoring Breakdown", href: "/breakdown/daily", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
        )},
        { name: "Job Outside Repair", href: "/repair/job-outside", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "Monitoring Magnetic Plug", href: "/repair/magnetic-plug", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "History Magnetic Plug", href: "#", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "Oil Consumption", href: "/repair/oil-consumption", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M12 2c-.22 0-.42.1-.55.27l-7.79 9.68a7.84 7.84 0 1016.68 0L12.55 2.27A.7.7 0 0012 2zm0 2.92l5.77 7.18a6.34 6.34 0 11-11.54 0z"/></svg>
        )},
        { name: "Historical Tyre", href: "/historical-tyre", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        )},
        { name: "ABR", href: "/abr", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        )}
      ]
    },
    {
      title: "MANPOWER",
      items: [
        { name: "SO Plant", href: "/service-orders", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
        ) },
        { name: "Data Manpower", href: "/manpower", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "Budget Manpower", href: "/manpower-budget", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "Perhitungan Manpower", href: "/manpower/perhitungan", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-7h-8v-2h8v2zm0-4h-8V7h8v2z"/></svg>
        )},
        { name: "Organization Structure", href: "/organization", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        )}
      ]
    },
    {
      title: "LEAVE & TRANSPORT",
      items: [
        { name: "Pengajuan Cuti", href: "/cuti/pengajuan", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
        )},
        { name: "Jadwal Cuti Periodic", href: "/cuti/jadwal", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
        )},
        { name: "Pengajuan Transportasi", href: "#", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>
            </svg>
        )}
      ]
    },

    {
      title: "REPORT",
      items: [
        { name: "Laporan", href: "#", icon: (
          <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        )}
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { 
          name: "User Management", 
          isDropdown: true,
          isOpen: userMgmtOpen,
          setIsOpen: setUserMgmtOpen,
          icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/>
            </svg>
          ),
          children: [
            { name: "Users List", href: "/users" },
            { name: "Roles (Peran)", href: "/roles" },
            { name: "Permissions", href: "/permissions" }
          ]
        },
        { 
          name: "Pengaturan", 
          isDropdown: true,
          isOpen: settingsOpen,
          setIsOpen: setSettingsOpen,
          icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
              <path d="m14.536 7.464-1.127-.47a4.935 4.935 0 0 0-.462-1.115l.47-1.127a.999.999 0 0 0-.258-1.124l-1.414-1.414a1 1 0 0 0-1.124-.258l-1.127.47a4.935 4.935 0 0 0-1.115-.462l-.47-1.127A1 1 0 0 0 7.915 0H5.915a.999.999 0 0 0-.974.737l-.47 1.127a4.935 4.935 0 0 0-1.115.462l-1.127-.47a1 1 0 0 0-1.124.258L.891 3.528a.999.999 0 0 0-.258 1.124l.47 1.127c-.2.35-.355.727-.462 1.115l-1.127.47A1 1 0 0 0-.723 8.338v2a.999.999 0 0 0 .737.974l1.127.47c.107.388.262.765.462 1.115l-.47 1.127a.999.999 0 0 0 .258 1.124l1.414 1.414a1 1 0 0 0 1.124.258l1.127-.47c.35.2.727.355 1.115.462l.47 1.127a.999.999 0 0 0 .974.737h2a.999.999 0 0 0 .974-.737l.47-1.127c.388-.107.765-.262 1.115-.462l1.127.47a1 1 0 0 0 1.124-.258l1.414-1.414a.999.999 0 0 0 .258-1.124l-.47-1.127c.2-.35.355-.727.462-1.115l1.127-.47a1 1 0 0 0 .737-.974v-2a.999.999 0 0 0-.737-.974ZM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
            </svg>
          ),
          children: [
            { name: "Email / SMTP", href: "/settings/mail" },
            { name: "My Profile", href: "/profile" }
          ]
        },
        { name: "Activity Logs", href: "/activity-logs", icon: (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 16 16">
              <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 2h12v2H2V2Zm0 12V6h12v8H2Z" />
              <path d="M4 8h8v1.5H4zm0 3h5v1.5H4z" />
            </svg>
        )}
      ]
    }
  ];

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        id="sidebar"
        ref={sidebar}
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : (window.innerWidth < 1024 ? "-100%" : 0) 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed lg:static z-50 left-0 top-0 h-screen w-[220px] shrink-0 bg-gray-900 border-r border-gray-800 p-3 flex flex-col ${!sidebarOpen ? "-translate-x-full lg:translate-x-0" : ""}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0b5c3e] shadow-lg">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-white tracking-tight block leading-tight">
                PLANT MAINTENANCE SYSTEM
              </span>
              <span className="text-[8px] text-gray-400">
                Plan Monitoring Service Unit
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            ref={trigger}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <motion.div 
              key={groupIdx}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 * groupIdx }}
            >
              {group.title && (
                <div className="text-[8.5px] font-bold tracking-wider text-[#2ecb8d] px-2 mb-1 flex items-center gap-2">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx} className={item.isDropdown ? "rounded-xl overflow-hidden" : ""}>
                    {item.isDropdown ? (
                      <>
                        <div
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                            isLinkActive(item.href)
                              ? "bg-gray-800 text-white border-l-4 border-gray-500"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {item.icon || (
                              <svg className="w-4 h-4 shrink-0 fill-current opacity-60" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                            )}
                            <Link href={item.href || "#"} className="flex-1 text-left">{item.name}</Link>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); item.setIsOpen(!item.isOpen); }}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <motion.svg
                              animate={{ rotate: item.isOpen ? 180 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="w-4 h-4 fill-current text-gray-400"
                              viewBox="0 0 12 12"
                            >
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </motion.svg>
                          </button>
                        </div>
                        <motion.div
                          initial={false}
                          animate={item.isOpen ? "open" : "closed"}
                          variants={accordionVariants}
                          className="pl-9 pr-2 py-1 space-y-0.5 overflow-hidden"
                        >
                          {item.children.map((child, childIdx) => (
                            <Link 
                              key={childIdx} 
                              href={child.href} 
                              className={`flex items-center py-1 px-3 rounded-lg text-[10px] transition-all duration-200 ${
                                isLinkActive(child.href)
                                  ? "bg-gray-800 text-white font-bold"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800 font-medium"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 opacity-50"></span>
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      </>
                    ) : (
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                          isLinkActive(item.href)
                            ? "bg-gray-800 text-white border-l-4 border-gray-500"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent"
                        }`}
                      >
                        {item.icon || (
                          <svg className="w-4 h-4 shrink-0 fill-current opacity-60" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                        )}
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.aside>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
