import React, { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icon Components ────────────────────────────────────────────────────────

const Icon = ({ d, viewBox = "0 0 24 24", size = "w-4 h-4" }) => (
  <svg className={`${size} fill-current shrink-0`} viewBox={viewBox}>
    <path d={d} />
  </svg>
);

const icons = {
  dashboard:   "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  kpi:         "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
  masterData:  "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  unit:        "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  hourMeter:   "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  planInspect: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  inspectionCheck: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  planComp:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
  analisa:     "M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  mcc:         "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  mar:         "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  far:         "M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.07 15.93 0 13.36 0 11.9 0 10.58.72 9.73 1.83L8 4 6.27 1.83C5.43.72 4.1 0 2.64 0 1.07 0 0 1.07 0 2.64c0 .48.11.92.18 1.36H-2v2h2.18c.07-.44.18-.88.18-1.36C.36 3.18.82 2.72 1.36 2.72c.54 0 1.04.28 1.32.72L5 6H2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6h-2zm-4 0H8L5.68 2.87C5.96 2.43 6.46 2.15 7 2.15c.54 0 1.04.28 1.32.72L10.5 6h3L15.68 2.87C15.96 2.43 16.46 2.15 17 2.15c.54 0 1.04.28 1.32.72L16 6z",
  forecast:    "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z",
  canibal:     "M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.19v6.72zm14 0v-6.72l-6 3.39v6.71l6-3.38z",
  magPlug:     "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  battery:     "M17 5v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V5h10zm-2 2H9v0h6zm3 4H6v6h12v-6zm-7 1v4h-2v-4h2zm4 0v4h-2v-4h2z",
  oil:         "M12 2c-.22 0-.42.1-.55.27l-7.79 9.68a7.84 7.84 0 1016.68 0L12.55 2.27A.7.7 0 0012 2zm0 2.92l5.77 7.18a6.34 6.34 0 11-11.54 0z",
  manpower:    "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  org:         "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  perhitungan: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  roster:      "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  cuti:        "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  users:       "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-6 8v-1c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v1H6z",
  settings:    "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  gatepass:    "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z M7.5 15c.83 0 1.5-.67 1.5-1.5S8.33 12 7.5 12 6 12.67 6 13.5 6.67 15 7.5 15zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z",
  logs:        "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2V9h2v2zm0 4h-2v-2h2v2z",
  jsa:         "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
};

// ─── Sidebar Component ────────────────────────────────────────────────────────

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { url } = usePage();
  const pathname = url || "";
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    if (pathname.includes("units") || pathname.includes("gatepass-unit") || pathname.includes("toolroom")) initial["asset-management"] = true;
    if (pathname.includes("master-data") || pathname.includes("form-penundaan-service") || pathname.includes("form-washing-unit") || pathname.includes("form-service-genset") || pathname.includes("form-service-dump-truck") || pathname.includes("form-oht773") || pathname.includes("form-inspection-bucket") || pathname.includes("form-check-sheet-service") || pathname.includes("form-check-sheet-dozer") || pathname.includes("form-check-sheet-motorgrader") || pathname.includes("form-pre-release-track-unit") || pathname.includes("form-request-asset-disposed") || pathname.includes("form-surat-permintaan-komponen") || pathname.includes("form-jsa") || pathname.includes("form-plant")) initial["master-data"] = true;
    if (pathname.includes("pm-monitoring") || pathname.includes("inspection-unit") || pathname.includes("inspection-p2h") || pathname.includes("p2h") || pathname.includes("plan-inspections") || pathname.includes("plan-service") || pathname.includes("pcr") || pathname.includes("forecast") || pathname.includes("abr")) initial["preventive"] = true;
    if (pathname.includes("monitoring-orders") || pathname.includes("breakdown") || pathname.includes("backlog") || pathname.includes("budget-monthly") || pathname.includes("forecast")) initial["maint-control"] = true;
    if (pathname.includes("repair") || pathname.includes("part-canibal") || pathname.includes("ccr")) initial["component"] = true;
    if (pathname.includes("manpower") || pathname.includes("organization") || pathname.includes("cuti") || pathname.includes("roster")) initial["manpower"] = true;
    if (pathname.includes("users") || pathname.includes("roles") || pathname.includes("permissions") || pathname.includes("settings") || pathname.includes("profile") || pathname.includes("activity-logs") || pathname.includes("database-schema")) initial["system"] = true;
    return initial;
  });

  const toggleGroup = (key) => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  const isActive = (href) => {
    if (!href || href === "#") return false;
    if (href === "/dashboard" || href === "/") return pathname === "/dashboard" || pathname === "/";
    
    if (href === "/work-orders?tab=breakdown" && pathname === "/work-orders") return true;

    if (href.includes("?")) {
        return pathname === href || pathname.startsWith(href + "&");
    }
    const basePath = pathname.split('?')[0];
    return basePath.startsWith(href);
  };

  const isGroupActive = (paths = []) => paths.some(p => pathname.startsWith(p));

  const accordionVariants = {
    open: { opacity: 1, height: "auto", transition: { height: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2, delay: 0.05 } } },
    closed: { opacity: 0, height: 0, transition: { height: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.1 } } },
  };

  // ─── THEMES ────────────────────────────────────────────────────────────────
  const baseText = "text-gray-600 dark:text-slate-400";
  const hoverText = "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white";
  const activeText = "text-gray-900 dark:text-white";
  const collapsibleActiveBase = "bg-gray-100 text-gray-900 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/10";

  const themes = {
    blue: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-blue-50/50 to-transparent border-l-blue-600 dark:from-blue-500/10 dark:border-l-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]",
      icon: "text-blue-500 dark:text-blue-400 dark:drop-shadow-[0_0_4px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-blue-600 dark:text-blue-300 dark:drop-shadow-[0_0_12px_rgba(59,130,246,1)] scale-110",
      glow: "bg-blue-400/20",
    },
    emerald: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-emerald-50/50 to-transparent border-l-emerald-600 dark:from-emerald-500/10 dark:border-l-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",
      icon: "text-emerald-500 dark:text-emerald-400 dark:drop-shadow-[0_0_4px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_12px_rgba(16,185,129,1)] scale-110",
      glow: "bg-emerald-400/20",
    },
    amber: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-amber-50/50 to-transparent border-l-amber-500 dark:from-amber-500/10 dark:border-l-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]",
      icon: "text-amber-500 dark:text-amber-400 dark:drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-amber-500 dark:text-amber-300 dark:drop-shadow-[0_0_12px_rgba(245,158,11,1)] scale-110",
      glow: "bg-amber-400/20",
    },
    rose: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-rose-50/50 to-transparent border-l-rose-600 dark:from-rose-500/10 dark:border-l-rose-400 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]",
      icon: "text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_4px_rgba(244,63,94,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-rose-600 dark:text-rose-300 dark:drop-shadow-[0_0_12px_rgba(244,63,94,1)] scale-110",
      glow: "bg-rose-400/20",
    },
    purple: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-purple-50/50 to-transparent border-l-purple-600 dark:from-purple-500/10 dark:border-l-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]",
      icon: "text-purple-500 dark:text-purple-400 dark:drop-shadow-[0_0_4px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-purple-600 dark:text-purple-300 dark:drop-shadow-[0_0_12px_rgba(168,85,247,1)] scale-110",
      glow: "bg-purple-400/20",
    },
    indigo: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-indigo-50/50 to-transparent border-l-indigo-600 dark:from-indigo-500/10 dark:border-l-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]",
      icon: "text-indigo-500 dark:text-indigo-400 dark:drop-shadow-[0_0_4px_rgba(99,102,241,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-indigo-600 dark:text-indigo-300 dark:drop-shadow-[0_0_12px_rgba(99,102,241,1)] scale-110",
      glow: "bg-indigo-400/20",
    },
    cyan: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-cyan-50/50 to-transparent border-l-cyan-600 dark:from-cyan-500/10 dark:border-l-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]",
      icon: "text-cyan-500 dark:text-cyan-400 dark:drop-shadow-[0_0_4px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-cyan-600 dark:text-cyan-300 dark:drop-shadow-[0_0_12px_rgba(6,182,212,1)] scale-110",
      glow: "bg-cyan-400/20",
    },
    orange: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-orange-50/50 to-transparent border-l-orange-600 dark:from-orange-500/10 dark:border-l-orange-400 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]",
      icon: "text-orange-500 dark:text-orange-400 dark:drop-shadow-[0_0_4px_rgba(249,115,22,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-orange-600 dark:text-orange-300 dark:drop-shadow-[0_0_12px_rgba(249,115,22,1)] scale-110",
      glow: "bg-orange-400/20",
    },
    teal: {
      text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
      activeBg: "bg-gradient-to-r from-teal-50/50 to-transparent border-l-teal-600 dark:from-teal-500/10 dark:border-l-teal-400 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]",
      icon: "text-teal-500 dark:text-teal-400 dark:drop-shadow-[0_0_4px_rgba(20,184,166,0.5)] transition-transform group-hover:scale-110",
      activeIcon: "text-teal-600 dark:text-teal-300 dark:drop-shadow-[0_0_12px_rgba(20,184,166,1)] scale-110",
      glow: "bg-teal-400/20",
    }
  };

  // ─── MENU STRUCTURE ────────────────────────────────────────────────────────
  const menuSections = [
    {
      label: null,
      theme: themes.blue,
      items: [
        { name: "Dashboard", href: "/dashboard", iconKey: "dashboard" },
        { name: "Key Performance Index", href: "/kpi", iconKey: "kpi" },
        { name: "Hour Meter", href: "/hour-meters", iconKey: "hourMeter" },
      ],
    },
    {
      label: "🚜 ASSET MANAGEMENT",
      key: "asset-management",
      theme: themes.teal,
      activePaths: ["/units", "/gatepass-unit", "/toolroom"],
      items: [
        { name: "Populasi Unit", href: "/units", iconKey: "unit" },
        { name: "Gatepass Unit", href: "/gatepass-unit", iconKey: "gatepass" },
        {
          name: "Monitoring Tool",
          href: "/toolroom",
          iconKey: "tool",
          subItems: [
            { name: "Inventory Toolroom",  href: "/toolroom",                  iconKey: "tool" },
            { name: "Peminjaman Tool",     href: "/toolroom?tab=borrow",       iconKey: "borrow" },
            { name: "Inspection Tool",     href: "/toolroom?tab=inspection",   iconKey: "inspection" },
            { name: "Orderan Tool",        href: "/toolroom?tab=order",        iconKey: "order" },
            { name: "Scrap Tool",          href: "/toolroom?tab=scrap",        iconKey: "scrap" },
            { name: "Gate Pass",           href: "/toolroom?tab=gatepass",     iconKey: "gatepass" },
          ],
        },
      ],
    },
    {
      label: "📋 MASTER DATA",
      key: "master-data",
      theme: themes.emerald,
      activePaths: [
        "/master-data",
        "/form-penundaan-service",
        "/form-washing-unit",
        "/form-service-genset",
        "/form-service-dump-truck",
        "/form-oht773",
        "/form-inspection-bucket",
        "/form-check-sheet-service",
        "/form-check-sheet-dozer",
        "/form-check-sheet-motorgrader",
        "/form-pre-release-track-unit",
        "/form-request-asset-disposed",
        "/form-surat-permintaan-komponen",
        "/form-jsa",
        "/form-plant"
      ],
      items: [
        { name: "Master Data Hub", href: "/master-data", iconKey: "masterData" },
        {
          name: "Master Form",
          iconKey: "inspectionCheck",
          subItems: [
            { name: "Form Penundaan Service", href: "/form-penundaan-service", iconKey: "inspectionCheck" },
            { name: "Form Washing Unit", href: "/form-washing-unit", iconKey: "inspectionCheck" },
            { name: "Form Service Genset", href: "/form-service-genset", iconKey: "inspectionCheck" },
            { name: "Form Service Dump Truck", href: "/form-service-dump-truck", iconKey: "inspectionCheck" },
            { name: "Form OHT 773", href: "/form-oht773", iconKey: "inspectionCheck" },
            { name: "Form Inspection Bucket", href: "/form-inspection-bucket", iconKey: "inspectionCheck" },
            { name: "Check Sheet Service", href: "/form-check-sheet-service", iconKey: "inspectionCheck" },
            { name: "Check Sheet Service Dozer", href: "/form-check-sheet-dozer", iconKey: "inspectionCheck" },
            { name: "Check Sheet Service Motorgrader", href: "/form-check-sheet-motorgrader", iconKey: "inspectionCheck" },
            { name: "Pre Release Check List Track Unit", href: "/form-pre-release-track-unit", iconKey: "inspectionCheck" },
            { name: "Request Asset Disposed Form", href: "/form-request-asset-disposed", iconKey: "inspectionCheck" },
            { name: "Surat Permintaan Komponen", href: "/form-surat-permintaan-komponen", iconKey: "inspectionCheck" },
          ],
        },
        {
          name: "Form JSA",
          iconKey: "jsa",
          subItems: [
            { name: "Overhaul Starting Motor", href: "/form-jsa/overhaul-starting-motor", iconKey: "jsa" },
            { name: "Maintenance AC System DT", href: "/form-jsa/maintenance-ac-dump-truck", iconKey: "jsa" },
            { name: "Radiator Medium Truck", href: "/form-jsa/radiator-medium-truck", iconKey: "jsa" },
            { name: "Welding Chasis Medium Truck", href: "/form-jsa/welding-chasis-medium-truck", iconKey: "jsa" },
          ],
        },
      ],
    },
    {
      label: "🔧 PREVENTIVE MAINTENANCE",
      key: "preventive",
      theme: themes.amber,
      activePaths: ["/pm-monitoring", "/inspection-unit", "/inspection-p2h", "/monitoring/p2h", "/plan-inspections", "/plan-service", "/pcr", "/abr", "/forecast"],
      items: [
        { name: "PM Monitoring", href: "/pm-monitoring", iconKey: "planInspect" },
        { name: "Inspection Unit", href: "/inspection-unit", iconKey: "inspectionCheck" },
        { name: "Daily Maintenance Achievement", href: "/plan-inspections", iconKey: "planInspect" },
        { name: "Plan PCR Undercarriage", href: "/pcr-uc", iconKey: "planComp" },
        { name: "Plan PCR Component", href: "/pcr-component", iconKey: "planComp" },
        { name: "Analisa Biaya Repair", href: "/abr", iconKey: "analisa" },
      ],
    },
    {
      label: "🚨 MAINTENANCE CONTROL",
      key: "maint-control",
      theme: themes.rose,
      activePaths: ["/work-orders", "/monitoring-orderan", "/breakdown", "/backlog", "/backlogs", "/forecast-budget-monthly"],
      items: [
        { 
          name: "Work Order", 
          iconKey: "mcc", 
          subItems: [
            { name: "Monitoring Breakdown", href: "/work-orders?tab=breakdown", iconKey: "mcc" },
            { name: "Historical WO Closed", href: "/work-orders?tab=historical", iconKey: "perhitungan" },
          ]
        },
        { name: "Monitoring Order List", href: "/monitoring-orderan", iconKey: "planComp" },
        { name: "Monitoring Backlog", href: "/backlogs", iconKey: "planInspect" },
        { name: "Failure Analysis (FAR)", href: "/failure-analysis", iconKey: "far" },
        { name: "Forecast Budget Monthly", href: "/forecast-budget-monthly", iconKey: "forecast" },
      ],
    },
    {
      label: "⚙️ COMPONENT & CONDITION MONITORING",
      key: "component",
      theme: themes.purple,
      activePaths: ["/part-canibals", "/repair", "/tyres", "/oil-consumption", "/ccr"],
      items: [
        { name: "Conditions Component Report (CCR)", href: "/ccr", iconKey: "planComp" },
        { name: "Monitoring Part Canibal", href: "/part-canibals", iconKey: "canibal" },
        { name: "Monitoring Replace Battery", href: "/repair/battery", iconKey: "battery" },
        { name: "Tyre Management", href: "/tyres", iconKey: "forecast" },
        { name: "WO Outside Repair", href: "/repair/job-outside", iconKey: "mcc" },
        { name: "Magnetic Plug", href: "/repair/magnetic-plug", iconKey: "magPlug" },
        { name: "Oil Consumption", href: "/oil-consumption", iconKey: "oil" },
      ],
    },

    {
      label: "👷 MANPOWER & ORGANIZATION",
      key: "manpower",
      theme: themes.cyan,
      activePaths: ["/manpower", "/organization", "/cuti", "/roster"],
      items: [
        { name: "Data Manpower Plant", href: "/manpower", iconKey: "manpower" },
        { name: "Struktur Organisasi", href: "/organization", iconKey: "org" },
        { name: "Perhitungan Manpower", href: "/manpower/perhitungan", iconKey: "perhitungan" },
        { name: "Roster Plant", href: "/roster", iconKey: "roster" },
        { name: "Pengajuan Cuti", href: "/cuti/pengajuan", iconKey: "cuti" },
      ],
    },
    {
      label: "⚙️ SYSTEM",
      key: "system",
      theme: themes.indigo,
      activePaths: ["/users", "/roles", "/permissions", "/settings", "/profile", "/activity-logs", "/database-schema"],
      items: [
        {
          name: "User & Access Control",
          iconKey: "users",
          subItems: [
            { name: "Data Pengguna", href: "/users", iconKey: "users" },
            { name: "Roles / Peran", href: "/roles", iconKey: "users" },
            { name: "Hak Akses (Permissions)", href: "/permissions", iconKey: "users" },
          ],
        },
        { name: "Pengaturan Sistem", href: "/settings/mail", iconKey: "settings" },
        { name: "Activity Logs", href: "/activity-logs", iconKey: "logs" },
        { name: "Database Relasi 3D", href: "/database-schema", iconKey: "dashboard" },
      ],
    },
  ];

  return (
    <div className="min-w-fit">
      {/* Backdrop mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebar}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : (typeof window !== "undefined" && window.innerWidth < 1024 ? "-100%" : 0) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed lg:static z-50 left-0 top-0 h-screen w-[320px] shrink-0 flex flex-col overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-md border-r border-cyan-500/30 shadow-[0_0_15px_rgba(8,247,254,0.1)] ${!sidebarOpen ? "-translate-x-full lg:translate-x-0" : ""}`}
      >
        {/* ── Brand Header ── */}
        <div className="relative px-5 py-6 flex items-center justify-between shrink-0 border-b border-gray-200 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3.5 group relative">
            {/* Ambient glow behind brand in dark mode */}
            <div className="absolute inset-0 bg-yellow-400/20 blur-2xl opacity-0 dark:opacity-40 group-hover:dark:opacity-80 transition duration-700 pointer-events-none rounded-full"></div>
            
            {/* Planner Logo */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0 relative z-10 overflow-hidden rounded-full border border-emerald-500/30 dark:border-emerald-400/50 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.6)]">
               <img src="/images/planner_logo.jpg" alt="Planner Logo" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            
            <div className="flex flex-col relative z-10">
              <div className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] tracking-wide">PLANT MAINTENANCE</div>
              <div className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight mb-0.5 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] tracking-wide">SYSTEM</div>
              <div className="text-[8px] text-gray-500 dark:text-yellow-400 font-bold tracking-[0.2em] dark:drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]">MINING OPERATION</div>
            </div>
          </Link>

          {/* Close btn (mobile) */}
          <button
            ref={trigger}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
          {menuSections.map((section, sIdx) => {
            const hasKey = !!section.key;

            return (
              <div key={sIdx} className={sIdx > 0 ? "mt-4" : ""}>
                {/* Static Section header */}
                {hasKey && (
                  <div className="px-4 mt-2 mb-2 text-[12px] font-semibold tracking-wider text-gray-500 dark:text-slate-500 uppercase">
                    {section.label.replace(/[^a-zA-Z &]/g, '').trim()}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {section.items.map((item, iIdx) => (
                    item.subItems ? (
                      <NavCollapsible key={iIdx} item={item} isActive={isActive} icons={icons} pathname={pathname} theme={section.theme} />
                    ) : (
                      <NavItem key={iIdx} item={item} isActive={isActive(item.href)} icons={icons} theme={section.theme} />
                    )
                  ))}
                </div>
              </div>
            );
          })}

          {/* Spacer at bottom */}
          <div className="h-4" />
        </nav>

      </motion.aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); }
      `}</style>
    </div>
  );
}

// ─── NavCollapsible sub-component ─────────────────────────────────────────────

function NavCollapsible({ item, isActive, icons, pathname, theme }) {
  const isAnyChildActive = item.subItems.some(sub => isActive(sub.href));
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [pathname, isAnyChildActive]);

  const safeTheme = {
    collapsibleActive: "bg-blue-50/80 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    text: "text-gray-700 dark:text-slate-300",
    hover: "hover:bg-gray-100/80 dark:hover:bg-white/5",
    activeText: "text-blue-700 dark:text-blue-400 font-black",
    activeBg: "bg-gradient-to-r from-blue-50/50 to-transparent border-l-blue-600 dark:from-blue-500/10 dark:border-l-blue-400",
    icon: "text-gray-400 dark:text-slate-400",
    activeIcon: "text-blue-600 dark:text-blue-300",
    glow: "bg-blue-400/20",
    shadowActive: "",
    shadowHover: "",
    ...(theme || {}),
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-4 py-[11px] mx-2 rounded-lg text-[15px] font-bold transition-all duration-300 group relative overflow-hidden ${
          isAnyChildActive
            ? `${safeTheme.collapsibleActive} shadow-sm dark:shadow-none border`
            : `${safeTheme.text} ${safeTheme.hover} border border-transparent`
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-5 h-5 flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 ${
            isAnyChildActive ? `${safeTheme.activeIcon} ${safeTheme.shadowActive}` : `${safeTheme.icon} ${safeTheme.shadowHover}`
          }`}>
            <svg className="w-[20px] h-[20px] fill-current" viewBox="0 0 24 24">
              <path d={icons[item.iconKey] || icons.logs} />
            </svg>
          </span>
          <span className={`leading-tight tracking-wide whitespace-normal relative z-10 ${
            isAnyChildActive ? safeTheme.shadowActive : safeTheme.shadowHover
          }`}>
            {item.name}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90 " + safeTheme.activeIcon : ""}`} 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col space-y-1 mt-1"
          >
            {item.subItems.map((subItem, idx) => (
              <NavItem key={idx} item={{...subItem, isSubItem: true}} isActive={isActive(subItem.href)} icons={icons} theme={safeTheme} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NavItem sub-component ────────────────────────────────────────────────────

function NavItem({ item, isActive, icons, theme }) {
  const hrefValue = item.href || "#";
  const isSub = item.isSubItem;

  const safeTheme = {
    collapsibleActive: "bg-blue-50/80 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    text: "text-gray-700 dark:text-slate-300",
    hover: "hover:bg-gray-100/80 dark:hover:bg-white/5",
    activeText: "text-blue-700 dark:text-blue-400 font-black",
    activeBg: "bg-gradient-to-r from-blue-50/50 to-transparent border-l-blue-600 dark:from-blue-500/10 dark:border-l-blue-400",
    icon: "text-gray-400 dark:text-slate-400",
    activeIcon: "text-blue-600 dark:text-blue-300",
    glow: "bg-blue-400/20",
    shadowActive: "",
    shadowHover: "",
    ...(theme || {}),
  };

  return (
    <Link
      href={hrefValue}
      className={`flex items-center gap-3 py-[11px] mx-2 rounded-lg text-[15px] font-bold transition-all duration-300 group relative overflow-hidden ${
        isSub ? "px-6 text-[14px] opacity-90" : "px-4"
      } ${
        isActive
          ? `${safeTheme.activeText} ${safeTheme.activeBg} border-transparent border-l-[3px]`
          : `${safeTheme.text} ${safeTheme.hover} border border-transparent border-l-[3px]`
      }`}
    >
      {/* Glow effect backplate for dark mode active */}
      {isActive && (
          <div className={`absolute inset-0 ${safeTheme.glow} blur-xl opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-500`}></div>
      )}

      {/* Icon container */}
      <span className={`w-5 h-5 flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 ${
        isActive
          ? `${safeTheme.activeIcon} ${safeTheme.shadowActive}`
          : `${safeTheme.icon} ${safeTheme.shadowHover}`
      }`}>
        <svg className="w-[20px] h-[20px] fill-current" viewBox="0 0 24 24">
          <path d={icons[item.iconKey] || icons.logs} />
        </svg>
      </span>

      <span className={`leading-tight tracking-wide whitespace-normal relative z-10 transition-all duration-300 ${
        isActive ? safeTheme.shadowActive : safeTheme.shadowHover
      }`}>
        {item.name}
      </span>
    </Link>
  );
}

export default Sidebar;

