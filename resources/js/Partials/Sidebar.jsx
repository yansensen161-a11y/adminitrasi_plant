import React, { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { icons } from "@/utils/portalConfig";

// ─── Unified Sidebar Component ────────────────────────────────────────────────

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { url, props } = usePage();
  const pathname = url || "";
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const dbMenus = props.navigationMenus || [];
  const branding = props.branding || {
    logo: "/images/planner_logo.jpg",
    app_title_main: "PLANT MAINTENANCE",
    app_title_sub: "SYSTEM",
    app_tagline: "MINING OPERATION",
  };

  // Close mobile sidebar on outside click
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

  const isActive = (href) => {
    if (!href || href === "#") return false;
    if (href === "/dashboard" && pathname === "/dashboard") return true;

    if (href === "/work-orders?tab=breakdown" && (pathname === "/work-orders" || pathname === "/work-orders?tab=breakdown" || pathname.startsWith("/work-orders?tab=breakdown&"))) return true;
    if (href === "/work-orders?tab=historical" && (pathname === "/work-orders?tab=historical" || pathname.startsWith("/work-orders?tab=historical&"))) return true;

    if (href.includes("?")) {
      return pathname === href || pathname.startsWith(href + "&");
    }
    const basePath = pathname.split("?")[0];
    return basePath === href || (href !== "/" && basePath.startsWith(href));
  };

  // Group menus by section_label and ensure no duplicate items exist
  const sections = React.useMemo(() => {
    const grouped = {};
    const seenHrefs = new Set();
    const seenNames = new Set();

    dbMenus.forEach((m) => {
      if (!m.is_active) return;

      const normHref = (m.href || "").trim().toLowerCase();
      const normName = (m.name || "").trim().toLowerCase();

      // Deduplicate: If an item with same non-hash href or exact same name was already included, skip it
      if (normHref && normHref !== "#" && seenHrefs.has(normHref)) {
        return;
      }
      if (normName && seenNames.has(normName)) {
        return;
      }

      if (normHref && normHref !== "#") seenHrefs.add(normHref);
      if (normName) seenNames.add(normName);

      const label = (m.section_label || "MENU UTAMA").trim();
      if (!grouped[label]) {
        grouped[label] = [];
      }

      let subItems = undefined;
      if (m.sub_menus && m.sub_menus.length > 0) {
        const seenSubHrefs = new Set();
        subItems = m.sub_menus
          .filter((s) => {
            if (!s.is_active) return false;
            const sHref = (s.href || "").trim().toLowerCase();
            if (sHref && sHref !== "#") {
              if (seenSubHrefs.has(sHref)) return false;
              seenSubHrefs.add(sHref);
            }
            return true;
          })
          .map((s) => ({
            id: s.id,
            name: s.name,
            href: s.href,
            iconKey: s.icon_key,
            badge: s.badge,
          }));
      }

      grouped[label].push({
        id: m.id,
        name: m.name,
        href: m.href,
        iconKey: m.icon_key,
        badge: m.badge,
        subItems,
      });
    });

    return Object.keys(grouped).map((label) => ({
      label,
      items: grouped[label],
    }));
  }, [dbMenus]);

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
        className={`fixed lg:static z-50 left-0 top-0 h-screen w-[300px] shrink-0 flex flex-col overflow-hidden bg-white/60 dark:bg-black/50 backdrop-blur-xl border-r border-cyan-500/30 shadow-[0_0_20px_rgba(8,247,254,0.08)] ${!sidebarOpen ? "-translate-x-full lg:translate-x-0" : ""}`}
      >
        {/* ── Brand Header ── */}
        <div className="relative px-5 py-4 flex items-center justify-between shrink-0 border-b border-gray-200 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3.5 group relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 dark:opacity-40 group-hover:dark:opacity-80 transition duration-700 pointer-events-none rounded-full" />
            
            {/* Brand Logo */}
            <div className="w-11 h-11 flex items-center justify-center shrink-0 relative z-10 overflow-hidden rounded-full border border-emerald-500/30 dark:border-emerald-400/50 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.5)] bg-gray-900">
              <img 
                src={branding.logo || "/images/planner_logo.jpg"} 
                alt="Brand Logo" 
                onError={(e) => { e.currentTarget.src = "/images/planner_logo.jpg"; }} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
            
            <div className="flex flex-col relative z-10">
              <div className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight tracking-wide">{branding.app_title_main || "PLANT MAINTENANCE"}</div>
              <div className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight mb-0.5 tracking-wide">{branding.app_title_sub || "SYSTEM"}</div>
              <div className="text-[8px] text-emerald-600 dark:text-yellow-400 font-bold tracking-[0.2em]">{branding.app_tagline || "MINING OPERATION"}</div>
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

        {/* ── Single Unified Navigation List ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 custom-scrollbar">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section Header */}
              {section.label && (
                <div className="px-3 mb-1.5 text-[10px] font-extrabold tracking-wider text-gray-400 dark:text-emerald-500/80 uppercase flex items-center justify-between">
                  <span>{section.label}</span>
                </div>
              )}

              {/* Items in section */}
              <div className="space-y-1">
                {section.items.map((item, iIdx) =>
                  item.subItems ? (
                    <NavCollapsible
                      key={iIdx}
                      item={item}
                      isActive={isActive}
                      icons={icons}
                      pathname={pathname}
                    />
                  ) : (
                    <NavItem
                      key={iIdx}
                      item={item}
                      isActive={isActive(item.href)}
                      icons={icons}
                    />
                  )
                )}
              </div>
            </div>
          ))}

          {/* Spacer at bottom */}
          <div className="h-6" />
        </nav>
      </motion.aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}

// ─── NavCollapsible sub-component ─────────────────────────────────────────────

function NavCollapsible({ item, isActive, icons, pathname }) {
  const isAnyChildActive = item.subItems.some((sub) => isActive(sub.href));
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [pathname, isAnyChildActive]);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3 py-[8px] rounded-xl text-[13px] font-bold transition-all duration-200 group relative overflow-hidden ${
          isAnyChildActive
            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shadow-sm"
            : "text-gray-700 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
            isAnyChildActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-400"
          }`}>
            <svg className="w-[17px] h-[17px] fill-current" viewBox="0 0 24 24">
              <path d={icons[item.iconKey] || icons.logs} />
            </svg>
          </span>
          <span className="leading-tight tracking-wide truncate">
            {item.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {item.badge && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
              {item.badge}
            </span>
          )}
          <svg 
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90 text-emerald-500" : "text-gray-400"}`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col space-y-1 mt-1 pl-3 border-l border-emerald-500/20 ml-4"
          >
            {item.subItems.map((subItem, idx) => (
              <NavItem
                key={idx}
                item={{ ...subItem, isSubItem: true }}
                isActive={isActive(subItem.href)}
                icons={icons}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NavItem sub-component ────────────────────────────────────────────────────

function NavItem({ item, isActive, icons }) {
  const hrefValue = item.href || "#";
  const isSub = item.isSubItem;

  return (
    <Link
      href={hrefValue}
      className={`flex items-center justify-between gap-2 py-[8px] rounded-xl font-bold transition-all duration-200 group relative overflow-hidden ${
        isSub ? "pl-3 pr-2.5 text-[12px]" : "px-3 text-[13px]"
      } ${
        isActive
          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-l-[3px] border-emerald-500 dark:border-emerald-400 font-extrabold shadow-sm"
          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-white/5 border-l-[3px] border-transparent"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
          isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"
        }`}>
          <svg className="w-[17px] h-[17px] fill-current" viewBox="0 0 24 24">
            <path d={icons[item.iconKey] || icons.logs} />
          </svg>
        </span>

        <span className="leading-tight tracking-wide truncate">
          {item.name}
        </span>
      </div>

      {item.badge && (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default Sidebar;
