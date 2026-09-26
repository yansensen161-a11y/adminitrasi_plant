import React, { useState, useMemo, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Save,
  Check,
  X,
  CornerDownRight,
  Image as ImageIcon,
  Globe,
  Upload,
  CheckCircle2,
  Info,
  Type,
  Copy,
  FolderTree,
  Wrench,
  Truck,
  Activity,
  UserCheck,
  Cpu,
} from 'lucide-react';
import { icons } from '@/utils/portalConfig';

// ─── ICON CATEGORIES ──────────────────────────────────────────────────────────
const ICON_CATEGORIES = {
  all: { label: 'Semua Ikon', icon: Sparkles },
  fleet: {
    label: 'Fleet & Unit',
    icon: Truck,
    keys: ['unit', 'dt', 'dozer', 'grader', 'truck', 'hourMeter', 'p2h', 'portalDeck'],
  },
  maintenance: {
    label: 'Maintenance & Service',
    icon: Wrench,
    keys: [
      'mcc', 'planComp', 'planService', 'pm', 'checksheet', 'oil', 'breakdown',
      'spk', 'washing', 'battery', 'magPlug', 'tyre', 'tirevault', 'pressure',
      'inspection', 'inspectionCheck', 'warranty', 'fuel',
    ],
  },
  analysis: {
    label: 'Analisis & KPI',
    icon: Activity,
    keys: ['kpi', 'analisa', 'far', 'forecast', 'performanceUnit', 'analytics', 'perhitungan', 'logs', 'document'],
  },
  tools: {
    label: 'Tools & Part',
    icon: Wrench,
    keys: ['tools', 'toolroom', 'wrench', 'canibal', 'disc', 'clipboard', 'shield', 'gatepass'],
  },
  hr: {
    label: 'HR & Manpower',
    icon: UserCheck,
    keys: ['manpower', 'org', 'roster', 'cuti', 'users'],
  },
  system: {
    label: 'Sistem & Konfigurasi',
    icon: Cpu,
    keys: ['settings', 'dashboard', 'database', 'calendar', 'masterData', 'jsa', 'bell', 'check', 'genset'],
  },
};

// ─── BRANDING PRESETS ─────────────────────────────────────────────────────────
const FAVICON_PRESETS = [
  { name: 'Mining Gold Shield (Default)', path: '/images/favicon.png' },
  { name: 'Planner Gold Crest', path: '/images/planner_logo.jpg' },
  { name: 'Dump Truck Hauler', path: '/images/dumptruck.jpg' },
  { name: 'Heavy Excavator', path: '/images/excavator.jpg' },
  { name: 'Modern Robot Core', path: '/images/robot.png' },
];

const LOGO_PRESETS = [
  { name: 'Planner Gold Crest (Default)', path: '/images/planner_logo.jpg' },
  { name: 'Mining Operations Fleet', path: '/images/logo.png' },
  { name: 'Heavy Dump Truck', path: '/images/dumptruck.jpg' },
  { name: 'Modern Robot Core', path: '/images/robot.png' },
];

// ─── Sortable Menu Item Row ──────────────────────────────────────────────────
function SortableMenuItem({
  menu,
  onEdit,
  onDelete,
  onAddSubmenu,
  onChangeIcon,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onReorderSubmenus,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  const hasSubmenus = menu.sub_menus && menu.sub_menus.length > 0;

  // Submenu sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSubDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = menu.sub_menus.findIndex((s) => s.id === active.id);
    const newIndex = menu.sub_menus.findIndex((s) => s.id === over.id);
    const newSubmenus = arrayMove(menu.sub_menus, oldIndex, newIndex);
    onReorderSubmenus(menu.id, newSubmenus);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2.5">
      <div
        className={`group relative rounded-2xl border transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 shadow-2xl scale-[1.01]'
            : 'border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-gray-800/80 backdrop-blur-md shadow-sm'
        } ${!menu.is_active ? 'opacity-60 bg-gray-50 dark:bg-gray-950/40' : ''}`}
      >
        <div className="flex items-center gap-3 p-3.5 sm:p-4">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Tarik untuk memindahkan urutan"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Expand Toggle */}
          {hasSubmenus ? (
            <button
              onClick={() => onToggleExpand(menu.id)}
              className="p-1 rounded-md text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 shrink-0 flex justify-center text-gray-300 dark:text-gray-700 text-xs">
              •
            </div>
          )}

          {/* Icon Preview with Quick Change Trigger */}
          <button
            type="button"
            onClick={() => onChangeIcon(menu)}
            className="group/icon relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shadow-sm hover:scale-105 hover:ring-2 hover:ring-emerald-500/50 hover:border-emerald-500 transition-all cursor-pointer"
            title="Klik untuk ganti ikon menu ini"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d={icons[menu.icon_key] || icons.logs} />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-gray-950 flex items-center justify-center shadow text-[9px] opacity-0 group-hover/icon:opacity-100 transition-opacity">
              <Edit2 className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
                {menu.name}
              </span>

              {menu.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {menu.badge}
                </span>
              )}

              {menu.section_label && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 uppercase tracking-wider">
                  {menu.section_label}
                </span>
              )}

              {hasSubmenus && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {menu.sub_menus.length} Submenu
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="truncate max-w-[200px] sm:max-w-xs font-mono bg-gray-100/60 dark:bg-black/30 px-1.5 py-0.5 rounded">
                {menu.href}
              </span>

              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                ikon: {menu.icon_key || 'dashboard'}
              </span>

              {menu.permission && (
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                  <Shield className="w-3 h-3" />
                  {menu.permission}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Change Icon Button */}
            <button
              onClick={() => onChangeIcon(menu)}
              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
              title="Ganti Ikon Menu"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Active Toggle Switch */}
            <button
              onClick={() => onToggleActive(menu)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                menu.is_active
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-gray-200/60 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700'
              }`}
              title="Klik untuk mengubah status aktif"
            >
              {menu.is_active ? 'Aktif' : 'Off'}
            </button>

            {/* Add Submenu Button */}
            <button
              onClick={() => onAddSubmenu(menu)}
              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
              title="Tambah Submenu di menu ini"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(menu)}
              className="p-1.5 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
              title="Edit menu"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(menu)}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Hapus menu"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submenus Drawer / Nested List */}
      <AnimatePresence>
        {hasSubmenus && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-6 sm:pl-10 mt-1.5 space-y-1.5 border-l-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 ml-5"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubDragEnd}
            >
              <SortableContext
                items={menu.sub_menus.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {menu.sub_menus.map((sub) => (
                  <SortableSubmenuItem
                    key={sub.id}
                    submenu={sub}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChangeIcon={onChangeIcon}
                    onToggleActive={onToggleActive}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sortable Submenu Item Row ───────────────────────────────────────────────
function SortableSubmenuItem({ submenu, onEdit, onDelete, onChangeIcon, onToggleActive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: submenu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
        isDragging
          ? 'border-emerald-500 bg-emerald-500/20 shadow-md'
          : 'border-gray-200/60 dark:border-white/5 bg-gray-50/70 dark:bg-black/30 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-gray-800/60'
      } ${!submenu.is_active ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 shrink-0"
          title="Tarik untuk mengatur urutan submenu"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <CornerDownRight className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />

        {/* Quick change submenu icon */}
        <button
          type="button"
          onClick={() => onChangeIcon(submenu)}
          className="group/subicon relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:ring-2 hover:ring-emerald-500/50 hover:scale-105 transition-all cursor-pointer"
          title="Klik untuk ganti ikon submenu ini"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d={icons[submenu.icon_key] || icons.logs} />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate">
              {submenu.name}
            </span>
            {submenu.badge && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500">
                {submenu.badge}
              </span>
            )}
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
              ({submenu.icon_key})
            </span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
            {submenu.href}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onChangeIcon(submenu)}
          className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
          title="Ganti Ikon Submenu"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onToggleActive(submenu)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            submenu.is_active
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700'
          }`}
        >
          {submenu.is_active ? 'Aktif' : 'Off'}
        </button>

        <button
          onClick={() => onEdit(submenu)}
          className="p-1 rounded text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
          title="Edit Submenu"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(submenu)}
          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          title="Hapus Submenu"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function MenuBuilder({
  menus: initialMenus,
  permissions,
  distinctSections,
  iconKeys,
  branding: initialBranding,
}) {
  // Sync tab with URL search parameter
  const [activeMainTab, setActiveMainTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'branding' || t === 'favicon' || t === 'logo') return 'branding';
      if (t === 'icons' || t === 'icon') return 'icons';
    }
    return 'menus';
  });

  const handleTabChange = (tabKey) => {
    setActiveMainTab(tabKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabKey);
      window.history.replaceState({}, '', url);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Quick Icon Change Target (modal for directly setting a menu item's icon)
  const [quickIconTarget, setQuickIconTarget] = useState(null);
  const [quickIconSearch, setQuickIconSearch] = useState('');
  const [quickIconCategory, setQuickIconCategory] = useState('all');

  // Icon Catalog state (Tab 3)
  const [iconCatalogSearch, setIconCatalogSearch] = useState('');
  const [iconCatalogCategory, setIconCatalogCategory] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);
  const [targetMenuForIcon, setTargetMenuForIcon] = useState({});

  // Branding files preview
  const branding = initialBranding || {
    logo: '/images/planner_logo.jpg',
    favicon: '/images/favicon.png',
    has_custom_logo: false,
    has_custom_favicon: false,
    app_title_main: 'PLANT MAINTENANCE',
    app_title_sub: 'SYSTEM',
    app_tagline: 'MINING OPERATION',
  };

  const [logoPreview, setLogoPreview] = useState(branding.logo);
  const [faviconPreview, setFaviconPreview] = useState(branding.favicon);

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Form for Branding Settings
  const brandingForm = useForm({
    logo: null,
    favicon: null,
    preset_logo: '',
    preset_favicon: '',
    remove_logo: false,
    remove_favicon: false,
    app_title_main: branding.app_title_main || 'PLANT MAINTENANCE',
    app_title_sub: branding.app_title_sub || 'SYSTEM',
    app_tagline: branding.app_tagline || 'MINING OPERATION',
  });

  // Local state for live drag and drop
  const [menuList, setMenuList] = useState(initialMenus);

  // Sync when initialMenus updates from backend
  useEffect(() => {
    setMenuList(initialMenus);
  }, [initialMenus]);

  // Expand all by default
  useEffect(() => {
    const exp = {};
    initialMenus.forEach((m) => {
      exp[m.id] = true;
    });
    setExpandedItems(exp);
  }, [initialMenus]);

  // Form for create / edit menu
  const { data, setData, post, put, processing, errors, reset } = useForm({
    portal_id: 'main',
    name: '',
    href: '',
    section_label: '',
    parent_id: '',
    icon_key: 'dashboard',
    permission: '',
    badge: '',
    target: '_self',
    is_active: true,
  });

  const [modalIconSearch, setModalIconSearch] = useState('');
  const [modalIconCategory, setModalIconCategory] = useState('all');

  // Filter menus by search
  const filteredMenus = useMemo(() => {
    if (!searchQuery.trim()) return menuList;
    const q = searchQuery.toLowerCase();
    return menuList.filter((m) => {
      const matchName = m.name?.toLowerCase().includes(q);
      const matchHref = m.href?.toLowerCase().includes(q);
      const matchSection = m.section_label?.toLowerCase().includes(q);
      const matchSub = m.sub_menus?.some(
        (s) => s.name?.toLowerCase().includes(q) || s.href?.toLowerCase().includes(q)
      );
      return matchName || matchHref || matchSection || matchSub;
    });
  }, [menuList, searchQuery]);

  // Filter icons for Quick Modal
  const filteredQuickIcons = useMemo(() => {
    return iconKeys.filter((k) => {
      const matchSearch = !quickIconSearch.trim() || k.toLowerCase().includes(quickIconSearch.toLowerCase());
      const matchCat =
        quickIconCategory === 'all' ||
        (ICON_CATEGORIES[quickIconCategory]?.keys && ICON_CATEGORIES[quickIconCategory].keys.includes(k));
      return matchSearch && matchCat;
    });
  }, [iconKeys, quickIconSearch, quickIconCategory]);

  // Filter icons for Catalog Tab
  const filteredCatalogIcons = useMemo(() => {
    return iconKeys.filter((k) => {
      const matchSearch = !iconCatalogSearch.trim() || k.toLowerCase().includes(iconCatalogSearch.toLowerCase());
      const matchCat =
        iconCatalogCategory === 'all' ||
        (ICON_CATEGORIES[iconCatalogCategory]?.keys && ICON_CATEGORIES[iconCatalogCategory].keys.includes(k));
      return matchSearch && matchCat;
    });
  }, [iconKeys, iconCatalogSearch, iconCatalogCategory]);

  // Filter icons for Create/Edit Modal
  const filteredModalIcons = useMemo(() => {
    return iconKeys.filter((k) => {
      const matchSearch = !modalIconSearch.trim() || k.toLowerCase().includes(modalIconSearch.toLowerCase());
      const matchCat =
        modalIconCategory === 'all' ||
        (ICON_CATEGORIES[modalIconCategory]?.keys && ICON_CATEGORIES[modalIconCategory].keys.includes(k));
      return matchSearch && matchCat;
    });
  }, [iconKeys, modalIconSearch, modalIconCategory]);

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle Root Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredMenus.findIndex((m) => m.id === active.id);
    const newIndex = filteredMenus.findIndex((m) => m.id === over.id);

    const reorderedList = arrayMove(filteredMenus, oldIndex, newIndex);
    setMenuList(reorderedList);

    // Send reorder to backend
    saveReorderedList(reorderedList);
  };

  // Reorder Submenus
  const handleReorderSubmenus = (parentId, newSubmenus) => {
    const updated = menuList.map((m) => {
      if (m.id === parentId) {
        return { ...m, sub_menus: newSubmenus };
      }
      return m;
    });
    setMenuList(updated);

    const items = newSubmenus.map((s, idx) => ({
      id: s.id,
      order: idx + 1,
      parent_id: parentId,
      section_label: s.section_label,
    }));

    router.post(
      route('settings.menus.reorder'),
      { items },
      { preserveScroll: true, preserveState: true }
    );
  };

  // Save full reordered list
  const saveReorderedList = (orderedMenus) => {
    setIsSavingOrder(true);
    const items = [];
    orderedMenus.forEach((menu, index) => {
      items.push({
        id: menu.id,
        order: index + 1,
        parent_id: null,
        section_label: menu.section_label,
      });

      if (menu.sub_menus) {
        menu.sub_menus.forEach((sub, subIdx) => {
          items.push({
            id: sub.id,
            order: subIdx + 1,
            parent_id: menu.id,
            section_label: menu.section_label,
          });
        });
      }
    });

    router.post(
      route('settings.menus.reorder'),
      { items },
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => setIsSavingOrder(false),
      }
    );
  };

  const handleToggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle active state quick action
  const handleToggleActive = (item) => {
    router.put(
      route('settings.menus.update', item.id),
      {
        ...item,
        is_active: !item.is_active,
      },
      { preserveScroll: true, preserveState: true }
    );
  };

  // Open Create Modal
  const openCreateModal = (parent = null) => {
    setEditingItem(null);
    setData({
      portal_id: 'main',
      name: '',
      href: '',
      section_label: parent ? parent.section_label || '' : '',
      parent_id: parent ? String(parent.id) : '',
      icon_key: parent ? parent.icon_key || 'logs' : 'dashboard',
      permission: '',
      badge: '',
      target: '_self',
      is_active: true,
    });
    setModalIconSearch('');
    setModalIconCategory('all');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setData({
      portal_id: item.portal_id || 'main',
      name: item.name,
      href: item.href,
      section_label: item.section_label || '',
      parent_id: item.parent_id ? String(item.parent_id) : '',
      icon_key: item.icon_key || 'dashboard',
      permission: item.permission || '',
      badge: item.badge || '',
      target: item.target || '_self',
      is_active: Boolean(item.is_active),
    });
    setModalIconSearch('');
    setModalIconCategory('all');
    setModalOpen(true);
  };

  // Submit Modal Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      put(route('settings.menus.update', editingItem.id), {
        preserveScroll: true,
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      });
    } else {
      post(route('settings.menus.store'), {
        preserveScroll: true,
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      });
    }
  };

  // Delete Menu Item
  const handleDelete = (item) => {
    const isSub = Boolean(item.parent_id);
    const warning = isSub
      ? `Hapus submenu "${item.name}"?`
      : `Hapus menu utama "${item.name}"? Semua submenu di dalamnya juga akan terhapus.`;

    if (confirm(warning)) {
      router.delete(route('settings.menus.destroy', item.id), {
        preserveScroll: true,
      });
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh susunan menu ke pengaturan default bawaan sistem?'
      )
    ) {
      router.post(route('settings.menus.reset'), {}, { preserveScroll: true });
    }
  };

  // Quick Select Icon for Menu (via Quick Modal)
  const handleSelectQuickIcon = (iconKey) => {
    if (!quickIconTarget) return;

    router.patch(
      route('settings.menus.icon', quickIconTarget.id),
      { icon_key: iconKey },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setQuickIconTarget(null);
        },
      }
    );
  };

  // Apply icon from catalog to selected menu
  const handleApplyCatalogIcon = (iconKey, menuId) => {
    if (!menuId) return;
    router.patch(
      route('settings.menus.icon', menuId),
      { icon_key: iconKey },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setTargetMenuForIcon((prev) => ({ ...prev, [iconKey]: '' }));
        },
      }
    );
  };

  // Copy icon key to clipboard
  const handleCopyKey = (key) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Possible parent items
  const availableParents = useMemo(() => {
    return menuList.filter((m) => !editingItem || m.id !== editingItem.id);
  }, [menuList, editingItem]);

  // Flattened all menus for quick assignment
  const allSelectableMenus = useMemo(() => {
    const list = [];
    menuList.forEach((m) => {
      list.push({ id: m.id, name: m.name, isSub: false });
      if (m.sub_menus) {
        m.sub_menus.forEach((s) => {
          list.push({ id: s.id, name: `↳ ${s.name} (${m.name})`, isSub: true });
        });
      }
    });
    return list;
  }, [menuList]);

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      brandingForm.setData('logo', file);
      brandingForm.setData('preset_logo', '');
      brandingForm.setData('remove_logo', false);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Favicon Upload
  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      brandingForm.setData('favicon', file);
      brandingForm.setData('preset_favicon', '');
      brandingForm.setData('remove_favicon', false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFaviconPreview(ev.target.result);
        // Instant live update on active browser tab
        const faviconLink = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
        if (faviconLink) {
          faviconLink.href = ev.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Choose Favicon Preset
  const handlePickFaviconPreset = (preset) => {
    brandingForm.setData('preset_favicon', preset.path);
    brandingForm.setData('favicon', null);
    brandingForm.setData('remove_favicon', false);
    setFaviconPreview(preset.path);
    if (faviconInputRef.current) faviconInputRef.current.value = '';

    // Instant browser tab update
    const faviconLink = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
    if (faviconLink) {
      faviconLink.href = preset.path;
    }
  };

  // Choose Logo Preset
  const handlePickLogoPreset = (preset) => {
    brandingForm.setData('preset_logo', preset.path);
    brandingForm.setData('logo', null);
    brandingForm.setData('remove_logo', false);
    setLogoPreview(preset.path);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Reset logo
  const handleResetLogo = () => {
    brandingForm.setData('logo', null);
    brandingForm.setData('preset_logo', '');
    brandingForm.setData('remove_logo', true);
    setLogoPreview('/images/planner_logo.jpg');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Reset favicon
  const handleResetFavicon = () => {
    brandingForm.setData('favicon', null);
    brandingForm.setData('preset_favicon', '');
    brandingForm.setData('remove_favicon', true);
    setFaviconPreview('/images/favicon.png');
    if (faviconInputRef.current) faviconInputRef.current.value = '';

    const faviconLink = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
    if (faviconLink) {
      faviconLink.href = '/images/favicon.png';
    }
  };

  // Submit Branding Settings
  const handleBrandingSubmit = (e) => {
    e.preventDefault();
    brandingForm.post(route('settings.branding.update'), {
      preserveScroll: true,
      onSuccess: () => {
        if (faviconPreview) {
          const faviconLink = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
          if (faviconLink) {
            faviconLink.href = faviconPreview;
          }
        }
      },
    });
  };

  return (
    <AuthenticatedLayout header="Web Settings: Menu, Favicon & Logo">
      <Head title="Menu Builder, Favicon & Logo" />

      <div className="space-y-6">
        {/* Top Header Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 p-6 sm:p-8 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                Web Identity, Navigation & Icon Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Menu Builder, Favicon, Logo & Icon
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mt-1 max-w-2xl leading-relaxed">
                Atur urutan menu drag-and-drop, ganti ikon menu dengan 1 klik, atur favicon tab browser (.ico/.png), serta kustomisasi logo dan teks identitas sistem.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleTabChange(activeMainTab === 'branding' ? 'menus' : 'branding')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 border border-cyan-400/40"
              >
                <Globe className="w-4 h-4" />
                {activeMainTab === 'branding' ? 'Buka Susunan Menu' : 'Setting Favicon & Logo'}
              </button>

              <button
                onClick={() => handleTabChange('icons')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-md active:scale-95 ${
                  activeMainTab === 'icons'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/30'
                    : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Katalog Ikon ({iconKeys.length})
              </button>

              <button
                onClick={handleResetDefault}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white border border-white/10 text-xs font-semibold transition-all shadow-md active:scale-95"
                title="Kembalikan susunan menu ke bawaan awal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Reset Default
              </button>

              <button
                onClick={() => openCreateModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Buat Menu
              </button>
            </div>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 w-fit shadow-inner flex-wrap">
          <button
            onClick={() => handleTabChange('menus')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeMainTab === 'menus'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Susunan Menu Navigasi ({menuList.length})
          </button>

          <button
            onClick={() => handleTabChange('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeMainTab === 'branding'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-500" />
            Favicon, Logo & Identitas Website
          </button>

          <button
            onClick={() => handleTabChange('icons')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeMainTab === 'icons'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Katalog Ikon Navigasi ({iconKeys.length})
          </button>
        </div>

        {/* ─── TAB 1: MENU BUILDER & NAVIGATION ─── */}
        {activeMainTab === 'menus' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-semibold">
                <FolderTree className="w-4 h-4 text-emerald-500" />
                Total {menuList.length} Menu Utama Aktif di Sidebar
              </div>

              {/* Search Box */}
              <div className="relative min-w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari menu, URL, atau kategori..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sortable Menu List */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Daftar Menu Navigasi ({filteredMenus.length})
                  </span>
                  {isSavingOrder && (
                    <span className="text-xs text-emerald-500 animate-pulse flex items-center gap-1">
                      <Save className="w-3 h-3" /> Menyimpan urutan...
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>💡 Klik ikon kotak untuk ganti ikon</span>
                  <span>•</span>
                  <span>Tarik ⠿ untuk ubah urutan</span>
                </div>
              </div>

              {filteredMenus.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Tidak ada menu ditemukan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada menu yang sesuai dengan kata kunci "${searchQuery}".`
                      : 'Belum ada menu yang dibuat. Tambahkan menu sekarang.'}
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredMenus.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredMenus.map((menu) => (
                      <SortableMenuItem
                        key={menu.id}
                        menu={menu}
                        isExpanded={Boolean(expandedItems[menu.id])}
                        onToggleExpand={handleToggleExpand}
                        onToggleActive={handleToggleActive}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onAddSubmenu={openCreateModal}
                        onChangeIcon={(target) => setQuickIconTarget(target)}
                        onReorderSubmenus={handleReorderSubmenus}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: FAVICON, LOGO & WEBSITE BRANDING ─── */}
        {activeMainTab === 'branding' && (
          <div className="space-y-6">
            <form onSubmit={handleBrandingSubmit} className="space-y-6">
              {/* Top Banner Notice */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-emerald-500/15 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Pengaturan Favicon (Browser Tab), Logo Utama & Identitas
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload favicon .ico/.png untuk tab browser, ganti logo sidebar, dan ubah teks header sistem secara real-time.
                    </p>
                  </div>
                </div>

                {brandingForm.recentlySuccessful && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> Berhasil Disimpan!
                  </span>
                )}
              </div>

              {/* Grid 2 Columns: Logo & Favicon Uploader */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── 1. LOGO UTAMA WEBSITE ── */}
                <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                          Logo Utama Website
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Tampil di bagian atas Sidebar, halaman login, dan navbar sistem
                        </p>
                      </div>

                      {branding.has_custom_logo && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Logo Kustom Aktif
                        </span>
                      )}
                    </div>

                    {/* Live Preview Sidebar Mockup */}
                    <div className="p-4 rounded-2xl bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 mb-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Preview Header Sidebar:</span>
                        <span className="text-emerald-500 text-[10px]">Real-time preview</span>
                      </div>
                      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-cyan-500/30 shadow-lg max-w-sm">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-gray-950 shrink-0">
                          <img
                            src={logoPreview || '/images/planner_logo.jpg'}
                            alt="Logo Preview"
                            onError={(e) => { e.currentTarget.src = '/images/planner_logo.jpg'; }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                            {brandingForm.data.app_title_main || 'PLANT MAINTENANCE'}
                          </span>
                          <span className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                            {brandingForm.data.app_title_sub || 'SYSTEM'}
                          </span>
                          <span className="text-[8px] text-emerald-600 dark:text-yellow-400 font-bold tracking-[0.2em] mt-0.5 truncate">
                            {brandingForm.data.app_tagline || 'MINING OPERATION'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets for Logo */}
                    <div className="mb-4">
                      <div className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                        Pilihan Cepat Logo:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {LOGO_PRESETS.map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => handlePickLogoPreset(preset)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                              logoPreview === preset.path
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                                : 'border-gray-200 dark:border-white/10 bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 hover:border-emerald-500/30'
                            }`}
                          >
                            <img
                              src={preset.path}
                              alt={preset.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
                            />
                            <span className="text-xs font-semibold truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File Logo Baru
                      </button>

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-xs inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          Reset Default
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">
                      Format: PNG (transparan disarankan), JPG, SVG, WebP. Maksimal 4 MB.
                    </div>
                  </div>
                </div>

                {/* ── 2. FAVICON (FABIKON BROWSER TAB) ── */}
                <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-500" />
                          Favicon (Ikon Tab Browser / Fabikon)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Ikon kecil yang muncul di tab browser Google Chrome, Edge, bookmark & browser bar
                        </p>
                      </div>

                      {branding.has_custom_favicon && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          Favicon Kustom Aktif
                        </span>
                      )}
                    </div>

                    {/* Realistic Chrome Browser Window Mockup */}
                    <div className="rounded-2xl overflow-hidden border border-gray-300/80 dark:border-gray-700 bg-gray-200/80 dark:bg-gray-900 shadow-xl mb-4">
                      {/* Chrome Window Header */}
                      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 bg-gray-200 dark:bg-gray-900">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>

                        {/* Chrome Active Tab */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm border-t border-x border-gray-300 dark:border-gray-700 max-w-xs">
                          <img
                            src={faviconPreview || '/images/favicon.png'}
                            alt="Favicon Preview"
                            onError={(e) => { e.currentTarget.src = '/images/favicon.png'; }}
                            className="w-4 h-4 object-contain rounded-sm shrink-0"
                          />
                          <span className="text-xs font-semibold truncate">
                            {brandingForm.data.app_title_main || 'Plant Maintenance'} System
                          </span>
                          <X className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
                        </div>

                        <div className="w-10" />
                      </div>

                      {/* Chrome Address Bar */}
                      <div className="px-3 py-1.5 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-mono flex-1 border border-gray-200 dark:border-gray-700">
                          <span className="text-emerald-500 font-bold">🔒 https://</span>
                          <span>mining-plant.local/settings/menus</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets for Favicon */}
                    <div className="mb-4">
                      <div className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                        Pilihan Cepat Favicon:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FAVICON_PRESETS.map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => handlePickFaviconPreset(preset)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                              faviconPreview === preset.path
                                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30'
                                : 'border-gray-200 dark:border-white/10 bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 hover:border-cyan-500/30'
                            }`}
                          >
                            <img
                              src={preset.path}
                              alt={preset.name}
                              className="w-5 h-5 rounded object-contain shrink-0 border border-white/20"
                            />
                            <span className="text-[11px] font-semibold truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/x-icon,image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleFaviconChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File Favicon (.ico / .png)
                      </button>

                      {faviconPreview && (
                        <button
                          type="button"
                          onClick={handleResetFavicon}
                          className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-xs inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          Reset Default
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">
                      Format: .ICO, .PNG (32x32 atau 64x64 disarankan), .SVG, .WebP. Maksimal 2 MB.
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3. IDENTITAS TEKS SISTEM ── */}
              <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-white/10">
                  <Type className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Teks Nama & Identitas Aplikasi (Header Sidebar)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Judul Baris 1
                    </label>
                    <input
                      type="text"
                      value={brandingForm.data.app_title_main}
                      onChange={(e) => brandingForm.setData('app_title_main', e.target.value)}
                      placeholder="Contoh: PLANT MAINTENANCE"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Judul Baris 2
                    </label>
                    <input
                      type="text"
                      value={brandingForm.data.app_title_sub}
                      onChange={(e) => brandingForm.setData('app_title_sub', e.target.value)}
                      placeholder="Contoh: SYSTEM"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Tagline / Sub-Baris
                    </label>
                    <input
                      type="text"
                      value={brandingForm.data.app_tagline}
                      onChange={(e) => brandingForm.setData('app_tagline', e.target.value)}
                      placeholder="Contoh: MINING OPERATION"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Save Branding Button */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={brandingForm.processing}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {brandingForm.processing ? 'Menyimpan...' : 'Simpan Favicon, Logo & Identitas'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ─── TAB 3: KATALOG IKON NAVIGASI LENGKAP ─── */}
        {activeMainTab === 'icons' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              {/* Header with Search and Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Katalog Ikon Sistem ({iconKeys.length} Ikon Tersedia)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Klik tombol salin untuk menyalin key ikon atau gunakan opsi "Terapkan ke Menu" untuk langsung memasangnya ke salah satu menu.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={iconCatalogSearch}
                    onChange={(e) => setIconCatalogSearch(e.target.value)}
                    placeholder="Cari nama ikon..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  {iconCatalogSearch && (
                    <button
                      onClick={() => setIconCatalogSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(ICON_CATEGORIES).map(([catKey, cat]) => {
                  const IconCmp = cat.icon;
                  const active = iconCatalogCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setIconCatalogCategory(catKey)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-500 text-gray-950 shadow-md font-bold'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <IconCmp className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredCatalogIcons.map((k) => {
                  const isCopied = copiedKey === k;
                  const selectedMenuId = targetMenuForIcon[k] || '';

                  return (
                    <div
                      key={k}
                      className="flex flex-col items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group relative"
                    >
                      {/* Icon Graphic */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-white/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 shadow-sm transition-transform mb-2">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d={icons[k] || icons.logs} />
                        </svg>
                      </div>

                      {/* Icon Key Name */}
                      <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 truncate w-full text-center mb-2">
                        {k}
                      </span>

                      {/* Actions */}
                      <div className="w-full space-y-1.5 pt-2 border-t border-gray-200/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => handleCopyKey(k)}
                          className="w-full py-1 px-2 rounded-lg bg-gray-200/70 dark:bg-white/5 hover:bg-emerald-500 hover:text-gray-950 text-[10px] font-semibold text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center gap-1"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Tersalin!' : 'Salin Key'}
                        </button>

                        {/* Apply to menu selector */}
                        <div className="flex items-center gap-1">
                          <select
                            value={selectedMenuId}
                            onChange={(e) =>
                              setTargetMenuForIcon((prev) => ({ ...prev, [k]: e.target.value }))
                            }
                            className="w-full py-0.5 px-1 text-[9px] rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <option value="">-- Pasang ke --</option>
                            {allSelectableMenus.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          {selectedMenuId && (
                            <button
                              type="button"
                              onClick={() => handleApplyCatalogIcon(k, selectedMenuId)}
                              className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-[9px] font-bold shrink-0"
                              title="Terapkan ikon ke menu ini"
                            >
                              OK
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK ICON PICKER MODAL ── */}
      <AnimatePresence>
        {quickIconTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickIconTarget(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      Pilih Ikon Baru
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mengubah ikon untuk menu: <span className="text-emerald-500 font-bold">{quickIconTarget.name}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setQuickIconTarget(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Categories */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10 space-y-3 bg-white dark:bg-gray-900 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={quickIconSearch}
                    onChange={(e) => setQuickIconSearch(e.target.value)}
                    placeholder="Cari nama ikon (contoh: tyre, truck, oil, mcc, tools)..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {Object.entries(ICON_CATEGORIES).map(([catKey, cat]) => {
                    const active = quickIconCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setQuickIconCategory(catKey)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          active
                            ? 'bg-emerald-500 text-gray-950 font-bold shadow'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Grid */}
              <div className="overflow-y-auto p-4 flex-1">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {filteredQuickIcons.map((k) => {
                    const isCurrent = quickIconTarget.icon_key === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelectQuickIcon(k)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
                            : 'border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-gray-600 dark:text-gray-300'
                        }`}
                        title={`Pilih ikon ${k}`}
                      >
                        <svg className="w-6 h-6 fill-current mb-1" viewBox="0 0 24 24">
                          <path d={icons[k] || icons.logs} />
                        </svg>
                        <span className="text-[10px] font-mono truncate w-full text-center">
                          {k}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] uppercase tracking-wider text-emerald-500 font-extrabold mt-0.5">
                            Aktif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-black/20 text-xs text-gray-500 dark:text-gray-400">
                <span>Klik salah satu ikon untuk langsung menyimpannya.</span>
                <button
                  type="button"
                  onClick={() => setQuickIconTarget(null)}
                  className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL CREATE / EDIT MENU ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-black/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    {editingItem ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {editingItem ? 'Edit Menu' : 'Tambah Menu Navigasi'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Konfigurasi rute URL, ikon, hak akses, dan hierarki submenu
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
                {/* Parent Menu (Hierarchy) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Hierarki Menu
                  </label>
                  <select
                    value={data.parent_id}
                    onChange={(e) => setData('parent_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Menu Utama (Root / Bukan Submenu) --</option>
                    {availableParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        Jadikan Submenu dari: {parent.name}
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && (
                    <p className="text-xs text-rose-500 mt-1">{errors.parent_id}</p>
                  )}
                </div>

                {/* Name & Route Href */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Nama Menu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Contoh: Monitoring Breakdown"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      URL Href / Rute <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.href}
                      onChange={(e) => setData('href', e.target.value)}
                      placeholder="Contoh: /work-orders?tab=breakdown"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                      required
                    />
                    {errors.href && (
                      <p className="text-xs text-rose-500 mt-1">{errors.href}</p>
                    )}
                  </div>
                </div>

                {/* Section Label & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Kategori Section Sidebar
                    </label>
                    <input
                      type="text"
                      value={data.section_label}
                      onChange={(e) => setData('section_label', e.target.value)}
                      placeholder="Contoh: MAINTENANCE CONTROL"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                    {distinctSections && distinctSections.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400">Pilihan cepat:</span>
                        {distinctSections.slice(0, 4).map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setData('section_label', sec)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-emerald-500"
                          >
                            {sec}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Badge Label (Opsional)
                    </label>
                    <input
                      type="text"
                      value={data.badge}
                      onChange={(e) => setData('badge', e.target.value)}
                      placeholder="Contoh: NEW, LIVE, PRO"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                  </div>
                </div>

                {/* Permission & Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Hak Akses (Permission)
                    </label>
                    <select
                      value={data.permission}
                      onChange={(e) => setData('permission', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Terbuka Untuk Semua Pengguna --</option>
                      {permissions.map((perm) => (
                        <option key={perm} value={perm}>
                          {perm}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                      Target Tautan
                    </label>
                    <select
                      value={data.target}
                      onChange={(e) => setData('target', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="_self">Tab Saat Ini (_self)</option>
                      <option value="_blank">Tab Baru (_blank)</option>
                    </select>
                  </div>
                </div>

                {/* Icon Selection Catalog */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Pilih Ikon Menu
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-500 font-mono font-bold flex items-center gap-1">
                        Terpilih: {data.icon_key}
                      </span>
                    </div>
                  </div>

                  {/* Filter chips for modal icons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {Object.entries(ICON_CATEGORIES).map(([catKey, cat]) => {
                      const active = modalIconCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setModalIconCategory(catKey)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                            active
                              ? 'bg-emerald-500 text-gray-950 font-bold'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Icon Grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 max-h-44 overflow-y-auto">
                    {filteredModalIcons.map((k) => {
                      const selected = data.icon_key === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setData('icon_key', k)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            selected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30'
                              : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'
                          }`}
                          title={k}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d={icons[k] || icons.logs} />
                          </svg>
                          <span className="text-[9px] truncate w-full text-center mt-1">
                            {k}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Switch */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active_toggle"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                  <label
                    htmlFor="is_active_toggle"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Menu Aktif & Ditampilkan di Sidebar
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Buat Menu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthenticatedLayout>
  );
}
